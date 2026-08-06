import pb from '@/lib/pocketbaseClient.js';

function getOrdinalSuffix(i) {
  const j = i % 10, k = i % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Automatically checks active vehicle loan profiles and auto-logs EMI expenses
 * on or after the EMI due date (e.g., 5th of every month).
 */
export async function syncAutoEmiExpenses() {
  try {
    if (!pb) return;

    // 1. Fetch loan profiles
    let loanProfiles = [];
    try {
      loanProfiles = await pb.collection('loan_profiles').getFullList({ $autoCancel: false });
    } catch (e) {
      console.warn('[autoEmiLogger] Could not fetch loan_profiles, using default schedule:', e);
    }

    // 2. Fetch existing EMI expenses
    const existingExpenses = await pb.collection('expenses').getFullList({
      filter: 'category="EMI" || subcategory="EMI" || subcategory="Vehicle EMI"',
      $autoCancel: false
    });

    // Determine default/active loan profile parameters if loan_profiles is empty
    const activeProfiles = loanProfiles.length > 0 ? loanProfiles : [{
      id: 'default_tg12u2637',
      profileName: 'TG12U2637',
      bank_name: 'IFFCO KISAN',
      monthlyEmi: 33410,
      first_emi_date: '2026-02-05 00:00:00.000Z',
      truck_id: ''
    }];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    let newlyCreatedCount = 0;

    for (const profile of activeProfiles) {
      const firstEmiDate = profile.first_emi_date ? new Date(profile.first_emi_date) : new Date('2026-02-05');
      const startYear = firstEmiDate.getFullYear();
      const startMonth = firstEmiDate.getMonth();
      const dueDay = firstEmiDate.getDate() || 5;
      const emiAmount = Number(profile.monthlyEmi) || 33410;

      let year = startYear;
      let month = startMonth;
      let emiIndex = 1;

      while (year < currentYear || (year === currentYear && month <= currentMonth)) {
        // Due date for this specific month
        const dueDateForMonth = new Date(year, month, dueDay, 12, 0, 0);

        // Only log if the due date has arrived or passed today
        if (now >= dueDateForMonth) {
          const ymStr = `${year}-${String(month + 1).padStart(2, '0')}`;

          // Check if an EMI expense already exists for this year-month
          const alreadyLogged = existingExpenses.some(e => {
            if (!e.date) return false;
            const expYM = e.date.substring(0, 7);
            const isEmi = (e.category || '').toLowerCase().includes('emi') || (e.subcategory || '').toLowerCase().includes('emi');
            return isEmi && expYM === ymStr;
          });

          if (!alreadyLogged) {
            console.log(`[autoEmiLogger] Auto-logging ${emiIndex}${getOrdinalSuffix(emiIndex)} EMI (₹${emiAmount}) for ${ymStr}...`);

            const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')} 12:00:00.000Z`;

            await pb.collection('expenses').create({
              category: 'EMI',
              subcategory: 'Vehicle EMI',
              amount: emiAmount,
              date: dateIso,
              description: `${emiIndex}${getOrdinalSuffix(emiIndex)} emi`,
              payment_method: 'Bank Transfer',
              truck_id: profile.truck_id || '',
              notes: `Auto-logged EMI payment for ${profile.profileName || 'Vehicle Loan'} (${profile.bank_name || 'Bank'})`
            }, { $autoCancel: false });

            newlyCreatedCount++;
          }
        }

        // Increment month
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
        emiIndex++;
      }
    }

    if (newlyCreatedCount > 0) {
      console.log(`[autoEmiLogger] Successfully auto-logged ${newlyCreatedCount} missing EMI expense(s).`);
    }
  } catch (err) {
    console.error('[autoEmiLogger] Error auto-syncing EMI expenses:', err);
  }
}
