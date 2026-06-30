import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export const useCashbookTransactions = (cashbook) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!cashbook?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const records = await pb.collection('cashbook_transactions').getFullList({
        filter: `cashbook_id="${cashbook.id}"`,
        sort: '+date,+created', // Fetch chronologically (oldest first)
        $autoCancel: false
      });

      let currentBalance = Number(cashbook.opening_balance) || 0;

      const computedRecords = records.map(record => {
        const amount = Number(record.amount) || 0;
        const isCashIn = record.transaction_type === 'credit' || record.transaction_type === 'Cash In';
        if (isCashIn) {
          currentBalance += amount;
        } else {
          currentBalance -= amount;
        }
        return {
          ...record,
          transaction_type: isCashIn ? 'Cash In' : 'Cash Out',
          running_balance: currentBalance
        };
      });

      // Keep chronological sorting (oldest first)
      setTransactions(computedRecords);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [cashbook?.id, cashbook?.opening_balance]);

  useEffect(() => {
    fetchTransactions();

    const subscribe = async () => {
      if (!cashbook?.id) return;
      try {
        await pb.collection('cashbook_transactions').subscribe('*', function (e) {
          if (e.record.cashbook_id === cashbook.id) {
            fetchTransactions();
          }
        });
      } catch (err) {
        console.error('Subscription error:', err);
      }
    };

    subscribe();

    return () => {
      pb.collection('cashbook_transactions').unsubscribe('*');
    };
  }, [cashbook?.id, fetchTransactions]);

  return { transactions, loading, refresh: fetchTransactions };
};