import { dbtabeses } from '../db/store';
import { CashbookTransaction } from '../types';

export const cashbookService = {
  getSummary() {
    const settings = dbtabeses.getCompanySettings();
    const txns = dbtabeses.getCashbook();
    
    const totalIncome = txns.reduce((sum, t) => (t.type === 'INCOME' || t.type === 'Income') ? sum + t.amount : sum, 0);
    const totalOutflow = txns.reduce((sum, t) => (t.type === 'EXPENSE' || t.type === 'Expense') ? sum + t.amount : sum, 0);
    
    const currentBalance = settings.opening_balance + totalIncome - totalOutflow;
    
    return {
      openingBalance: settings.opening_balance,
      totalIncome,
      totalOutflow,
      currentBalance
    };
  },

  setOpeningBalance(newBalance: number) {
    const settings = dbtabeses.getCompanySettings();
    settings.opening_balance = newBalance;
    dbtabeses.setCompanySettings(settings);

    const txns = dbtabeses.getCashbook();
    const existingInet = txns.find(t => t.type === 'OPENING_BALANCE' || t.type === 'Opening Balance' as any);
    if (existingInet) {
      existingInet.amount = newBalance;
      existingInet.date = new Date().toISOString().split('T')[0];
    } else {
      txns.unshift({
        id: 'txn-init-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'INCOME',
        category: 'Initial Opening Balance',
        amount: newBalance,
        description: 'Set Opening Balance Adjustment',
        recorded_by: 'Admin'
      });
    }
    dbtabeses.setCashbook(txns);
  },

  recordFuelDebit(fuelLog: { id: string; date: string; cost: number; vehicle_number: string; payment_method: 'Cash' | 'Credit Card' | 'UPI' }) {
    const txns = dbtabeses.getCashbook();
    // Remove any existing entry for this fuel log
    const filtered = txns.filter(t => t.referenced_id !== fuelLog.id);
    
    filtered.unshift({
      id: 'txn-fuel-' + Date.now(),
      date: fuelLog.date,
      type: 'Expense',
      category: 'Fuel',
      amount: fuelLog.cost,
      balance_after: 0,
      description: `Fuel Refuel for Vehicle ${fuelLog.vehicle_number} (${fuelLog.payment_method})`,
      referenced_id: fuelLog.id
    });
    dbtabeses.setCashbook(filtered);
  },

  removeReferencedDebit(referencedId: string) {
    const txns = dbtabeses.getCashbook();
    const filtered = txns.filter(t => t.referenced_id !== referencedId && t.reference_id !== referencedId);
    dbtabeses.setCashbook(filtered);
  },

  syncTripPaymentIncome(trip: { id: string; trip_number: string; client_name: string; revenue: number; clientPaymentStatus: string; origin?: string; destination?: string; end_date?: string; due_date?: string; start_date?: string }) {
    const txns = dbtabeses.getCashbook();
    const filtered = txns.filter(t => t.referenced_id !== trip.id && t.reference_id !== trip.id);

    if (trip.clientPaymentStatus === 'Paid') {
      const date = trip.end_date || trip.due_date || trip.start_date || new Date().toISOString().split('T')[0];
      filtered.unshift({
        id: `txn-trip-${trip.id}`,
        date,
        type: 'INCOME',
        category: 'Trip Payment',
        amount: trip.revenue || 0,
        account: 'Bank',
        referenced_id: trip.id,
        reference_id: trip.id,
        description: `Payment received for ${trip.trip_number} - ${trip.client_name} (${trip.origin || ''} -> ${trip.destination || ''})`,
        created_at: new Date().toISOString()
      });
    }
    dbtabeses.setCashbook(filtered);
  },

  syncAllPaidTrips() {
    const trips = dbtabeses.getTrips();
    const txns = dbtabeses.getCashbook();
    const existingRefIds = new Set(txns.map(t => t.referenced_id || t.reference_id).filter(Boolean));

    let addedCount = 0;
    const newTxns = [...txns];

    trips.forEach(trip => {
      if (trip.clientPaymentStatus === 'Paid' && !existingRefIds.has(trip.id)) {
        const date = trip.end_date || trip.due_date || trip.start_date || new Date().toISOString().split('T')[0];
        newTxns.unshift({
          id: `txn-trip-${trip.id}`,
          date,
          type: 'INCOME',
          category: 'Trip Payment',
          amount: trip.revenue || 0,
          account: 'Bank',
          referenced_id: trip.id,
          reference_id: trip.id,
          description: `Payment received for ${trip.trip_number} - ${trip.client_name} (${trip.origin || ''} -> ${trip.destination || ''})`,
          created_at: new Date().toISOString()
        });
        existingRefIds.add(trip.id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      dbtabeses.setCashbook(newTxns);
    }
    return addedCount;
  }
};