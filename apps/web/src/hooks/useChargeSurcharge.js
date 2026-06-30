import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { format } from 'date-fns';

export function useChargeSurcharge(refreshTrigger = 0) {
  const { currentUser } = useAuth();
  const [data, setData] = useState({
    transactions: [],
    totalSurcharge: 0,
    averageSurcharge: 0,
    savedAmount: 0,
    byCard: [],
    byMonth: [],
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const [txRecords, cardsRecords] = await Promise.all([
        pb.collection('fuel_payments').getFullList({
          filter: `user_id = "${currentUser.id}" && surcharge_amount > 0`,
          sort: '-date',
          $autoCancel: false
        }),
        pb.collection('credit_cards').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          $autoCancel: false
        })
      ]);

      const cardMap = new Map(cardsRecords.map(c => [c.id, c.card_name]));

      let total = 0;
      let saved = 0;
      const cardTotals = new Map();
      const monthTotals = new Map();

      const transactions = txRecords.map(tx => {
        const amt = tx.surcharge_amount || 0;
        const waived = tx.waived_amount || 0;
        total += amt;
        saved += waived;

        const cardName = cardMap.get(tx.card_id) || 'Unknown Card';
        cardTotals.set(cardName, (cardTotals.get(cardName) || 0) + amt);

        const d = new Date(tx.date);
        const monthKey = format(d, 'MMM yy');
        const sortKey = format(d, 'yyyy-MM');
        
        if (!monthTotals.has(sortKey)) {
          monthTotals.set(sortKey, { month: monthKey, value: 0, sortKey });
        }
        monthTotals.get(sortKey).value += amt;

        return {
          ...tx,
          cardName
        };
      });

      const byCard = Array.from(cardTotals.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
        
      const byMonth = Array.from(monthTotals.values())
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ month, value }) => ({ month, value }));

      setData({
        transactions,
        totalSurcharge: total,
        averageSurcharge: transactions.length > 0 ? total / transactions.length : 0,
        savedAmount: saved,
        byCard,
        byMonth,
        transactionCount: transactions.length
      });
    } catch (err) {
      console.error('Error fetching surcharge data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, refreshTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}