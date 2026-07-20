import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

export const useCashbookData = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const records = await pb.collection('cashbook').getFullList({
        sort: '-date',
        $autoCancel: false
      });
      setTransactions(records);

      // Self-healing sync: Check if any expenses are missing in cashbook
      try {
        const allExpenses = await pb.collection('expenses').getFullList({ $autoCancel: false });
        const existingRefIds = new Set(records.map(r => r.reference_id).filter(Boolean));
        
        let syncNeeded = false;
        for (const exp of allExpenses) {
          if (!existingRefIds.has(exp.id)) {
            const cashCategory = exp.category === 'Regular' && exp.subcategory 
              ? `Regular - ${exp.subcategory}` 
              : (exp.category || 'Expenses');

            await pb.collection('cashbook').create({
              date: exp.date || new Date().toISOString(),
              description: exp.description || `Expense (${cashCategory})`,
              amount: Number(exp.amount) || 0,
              transaction_type: 'Expense',
              category: cashCategory,
              reference_id: exp.id,
              reference_type: 'expense',
              status: 'Completed',
              added_by: currentUser.id
            }, { $autoCancel: false });
            syncNeeded = true;
          }
        }

        if (syncNeeded) {
          const refreshed = await pb.collection('cashbook').getFullList({
            sort: '-date',
            $autoCancel: false
          });
          setTransactions(refreshed);
        }
      } catch (syncErr) {
        console.warn('Background cashbook expense sync warning:', syncErr);
      }
    } catch (err) {
      console.error('Fetch cashbook error:', err);
      
      let errorMessage = 'Failed to load cashbook data';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;
    fetchTransactions();

    if (currentUser) {
      pb.collection('cashbook').subscribe('*', function () {
        if (isMounted) {
          fetchTransactions();
        }
      });
    }

    return () => {
      isMounted = false;
      if (currentUser) {
        pb.collection('cashbook').unsubscribe('*');
      }
    };
  }, [currentUser, fetchTransactions]);

  return { transactions, isLoading, error, refetch: fetchTransactions };
};