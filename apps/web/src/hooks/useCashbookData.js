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
        filter: `added_by = "${currentUser.id}"`,
        sort: '-date',
        $autoCancel: false
      });
      setTransactions(records);
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