import pb from './pocketbaseClient.js';

/**
 * Calculate complete 4-point financial tally for a subcontractor trip
 */
export function calculateSubcontractorTripFinancials({
  clientFreight = 0,
  subcontractorFreight = 0,
  clientAdvancePct = 80,
  clientAdvanceAmt = null,
  subAdvancePct = 80,
  subAdvanceAmt = null,
  subDeductions = 0,
  clientPaidOnPod = false,
  subPaidOnPod = false
}) {
  const cFreight = Number(clientFreight) || 0;
  const sFreight = Number(subcontractorFreight) || 0;
  const cAdvPct = Number(clientAdvancePct) || 80;
  const sAdvPct = Number(subAdvancePct) || 80;
  const deductions = Number(subDeductions) || 0;

  // 1. Overall Trip Margin
  const tripMargin = Math.max(0, cFreight - sFreight);
  const tripMarginPct = cFreight > 0 ? Math.round((tripMargin / cFreight) * 1000) / 10 : 0;

  // 2. Stage 1: Loading Advance
  const clientAdvance = clientAdvanceAmt !== null && clientAdvanceAmt !== undefined && clientAdvanceAmt !== ''
    ? Number(clientAdvanceAmt)
    : Math.round(cFreight * (cAdvPct / 100));

  const subcontractorAdvance = subAdvanceAmt !== null && subAdvanceAmt !== undefined && subAdvanceAmt !== ''
    ? Number(subAdvanceAmt)
    : Math.round(sFreight * (sAdvPct / 100));

  const loadingRetainedCash = clientAdvance - subcontractorAdvance;

  // 3. Stage 2: POD Balance
  const clientBalance = Math.max(0, cFreight - clientAdvance);
  const subBalanceBase = Math.max(0, sFreight - subcontractorAdvance);
  const subcontractorBalance = Math.max(0, subBalanceBase - deductions);

  const podRemainingMargin = clientBalance - subcontractorBalance;

  // 4. Overall Tally Reconciled Check
  const totalTalliedMargin = loadingRetainedCash + podRemainingMargin;
  const isReconciled = cFreight > 0 && sFreight > 0;

  return {
    clientFreight: cFreight,
    subcontractorFreight: sFreight,
    tripMargin,
    tripMarginPct,
    clientAdvance,
    clientAdvancePct: cAdvPct,
    subcontractorAdvance,
    subcontractorAdvancePct: sAdvPct,
    loadingRetainedCash,
    clientBalance,
    subcontractorBalance,
    subcontractorDeductions: deductions,
    podRemainingMargin,
    totalTalliedMargin,
    isReconciled,
    clientPaidOnPod: Boolean(clientPaidOnPod),
    subPaidOnPod: Boolean(subPaidOnPod)
  };
}

/**
 * Synchronize trip advances, balance payments, and margins directly to Cashbook
 */
export async function syncSubcontractorCashbookTransactions(trip, currentUser) {
  if (!trip?.id) return;

  const tripIdStr = trip.trip_id || trip.id;
  const clientName = trip?.expand?.client_id?.client_name || trip?.expand?.client_id?.company_name || trip.client_name || 'Client';
  const subName = trip.subcontractor_name || 'Subcontractor';
  const userId = currentUser?.id || pb.authStore.model?.id || '';

  try {
    // 1. Fetch existing cashbook entries for this trip to avoid duplicates
    const existing = await pb.collection('cashbook').getFullList({
      filter: `reference_id = "${trip.id}" || (description ~ "${tripIdStr}" && category ~ "Subcontractor")`,
      $autoCancel: false
    }).catch(() => []);

    const dateStr = trip.date ? trip.date.split('T')[0] : new Date().toISOString().split('T')[0];

    // 2. Sync Client Advance (Cash In)
    const clientAdv = Number(trip.client_advance_amount || 0);
    if (clientAdv > 0) {
      const existingClientAdv = existing.find(e => e.category === 'Client Freight Advance' || e.description?.includes('Client Advance'));
      const payload = {
        transaction_type: 'cash_in',
        amount: clientAdv,
        category: 'Client Freight Advance',
        description: `Client Advance: ${clientName} - Trip #${tripIdStr}${trip.client_advance_utr ? ` (UTR: ${trip.client_advance_utr})` : ''}`,
        reference_id: trip.id,
        reference_type: 'trip_payments',
        date: trip.client_advance_date ? `${trip.client_advance_date} 12:00:00.000Z` : `${dateStr} 12:00:00.000Z`,
        status: 'Completed',
        user_id: userId
      };

      if (existingClientAdv) {
        await pb.collection('cashbook').update(existingClientAdv.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('cashbook').create(payload, { $autoCancel: false });
      }
    }

    // 3. Sync Subcontractor Advance (Cash Out)
    const subAdv = Number(trip.subcontractor_advance_amount || 0);
    if (subAdv > 0) {
      const existingSubAdv = existing.find(e => e.category === 'Subcontractor Advance' || e.description?.includes('Subcontractor Advance'));
      const payload = {
        transaction_type: 'cash_out',
        amount: subAdv,
        category: 'Subcontractor Advance',
        description: `Subcontractor Advance: ${subName} - Trip #${tripIdStr}${trip.subcontractor_advance_utr ? ` (UTR: ${trip.subcontractor_advance_utr})` : ''}`,
        reference_id: trip.id,
        reference_type: 'expenses',
        date: trip.subcontractor_advance_date ? `${trip.subcontractor_advance_date} 12:00:00.000Z` : `${dateStr} 12:00:00.000Z`,
        status: 'Completed',
        user_id: userId
      };

      if (existingSubAdv) {
        await pb.collection('cashbook').update(existingSubAdv.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('cashbook').create(payload, { $autoCancel: false });
      }
    }

    // 4. Sync Client POD Balance (Cash In) if collected
    const clientBal = Number(trip.client_balance_amount || 0);
    if (clientBal > 0 && (trip.client_balance_status === 'Received on POD' || trip.client_payment_status === 'paid')) {
      const existingClientBal = existing.find(e => e.category === 'Client Balance POD' || e.description?.includes('Client POD Balance'));
      const payload = {
        transaction_type: 'cash_in',
        amount: clientBal,
        category: 'Client Balance POD',
        description: `Client Balance POD: ${clientName} - Trip #${tripIdStr}`,
        reference_id: trip.id,
        reference_type: 'trip_payments',
        date: trip.client_balance_date ? `${trip.client_balance_date} 12:00:00.000Z` : `${dateStr} 12:00:00.000Z`,
        status: 'Completed',
        user_id: userId
      };

      if (existingClientBal) {
        await pb.collection('cashbook').update(existingClientBal.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('cashbook').create(payload, { $autoCancel: false });
      }
    }

    // 5. Sync Subcontractor POD Balance Settlement (Cash Out) if settled
    const subBal = Number(trip.subcontractor_balance_amount || 0);
    if (subBal > 0 && trip.subcontractor_settlement_status === 'Settled') {
      const existingSubBal = existing.find(e => e.category === 'Subcontractor Balance Settlement' || e.description?.includes('Subcontractor POD Settlement'));
      const payload = {
        transaction_type: 'cash_out',
        amount: subBal,
        category: 'Subcontractor Balance Settlement',
        description: `Subcontractor POD Settlement: ${subName} - Trip #${tripIdStr}${trip.subcontractor_balance_utr ? ` (UTR: ${trip.subcontractor_balance_utr})` : ''}`,
        reference_id: trip.id,
        reference_type: 'expenses',
        date: trip.subcontractor_balance_settled_date ? `${trip.subcontractor_balance_settled_date} 12:00:00.000Z` : `${dateStr} 12:00:00.000Z`,
        status: 'Completed',
        user_id: userId
      };

      if (existingSubBal) {
        await pb.collection('cashbook').update(existingSubBal.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('cashbook').create(payload, { $autoCancel: false });
      }
    }

  } catch (err) {
    console.warn('Subcontractor Cashbook auto-sync note:', err?.message || err);
  }
}
