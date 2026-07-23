import pb from './pocketbaseClient.js';

const LOCAL_STORAGE_KEY = 'jbc_fastag_deductions_logs';

export const getLocalFASTagDeductions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local FASTag deductions:', e);
    return [];
  }
};

export const saveLocalFASTagDeduction = (record) => {
  try {
    const existing = getLocalFASTagDeductions();
    const updated = [record, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving local FASTag deduction:', e);
    return [];
  }
};

export const fetchAllFASTagDeductions = async () => {
  let remoteDeductions = [];
  try {
    remoteDeductions = await pb.collection('fastag_transactions').getFullList({
      sort: '-date',
      $autoCancel: false
    });
  } catch (e) {
    console.log('[fastagDeductionUtils] PocketBase fastag_transactions collection fetch info:', e?.message || e);
  }

  const localDeductions = getLocalFASTagDeductions();
  
  // Merge remote and local without duplicates (keyed by id or date+truck_number)
  const combined = [...remoteDeductions];
  localDeductions.forEach(loc => {
    const exists = combined.some(rem => rem.id === loc.id || (rem.truck_number === loc.truck_number && rem.date === loc.date && rem.amount === loc.amount));
    if (!exists) {
      combined.push(loc);
    }
  });

  // Sort descending by date
  combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return combined;
};

export const recordTollDeduction = async ({ truckId, truckNumber, amount, date, tollPlazaName, tripCode, notes }) => {
  const formattedDate = date ? (date.includes('T') ? date : `${date} 12:00:00.000Z`) : new Date().toISOString();
  const numAmount = Number(amount) || 0;
  
  const recordId = 'toll_ded_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const payload = {
    id: recordId,
    date: formattedDate,
    truck_id: truckId,
    truck_number: truckNumber,
    trip_code: tripCode || '',
    transaction_type: 'Debit',
    amount: numAmount,
    toll_plaza: tollPlazaName || '',
    notes: notes || (tollPlazaName ? `Toll at ${tollPlazaName}` : 'Automated toll charge'),
    created: new Date().toISOString()
  };

  // 1. Always save locally first for instant reactivity
  saveLocalFASTagDeduction(payload);

  // 2. Update truck balance in PocketBase & local cache
  try {
    let targetTruck = null;
    if (truckId) {
      targetTruck = await pb.collection('trucks').getOne(truckId, { $autoCancel: false }).catch(() => null);
    } else if (truckNumber) {
      const trs = await pb.collection('trucks').getFullList({ filter: `truck_number = "${truckNumber}"`, $autoCancel: false }).catch(() => []);
      if (trs.length > 0) targetTruck = trs[0];
    }

    if (targetTruck) {
      const curBal = Number(targetTruck.current_fastag_balance) || 0;
      const newBal = Math.max(0, curBal - numAmount);
      await pb.collection('trucks').update(targetTruck.id, {
        current_fastag_balance: newBal
      }, { $autoCancel: false });
    }
  } catch (err) {
    console.error('Failed to deduct FASTag balance from truck:', err);
  }

  // 3. Try PocketBase create in fastag_transactions
  try {
    const pbRecord = await pb.collection('fastag_transactions').create({
      date: formattedDate,
      truck_number: truckNumber,
      trip_code: tripCode || '',
      transaction_type: 'Debit',
      amount: numAmount,
      notes: payload.notes
    }, { $autoCancel: false });
    return pbRecord;
  } catch (pbErr) {
    console.log('PocketBase fastag_transactions record created locally as fallback');
    return payload;
  }
};
