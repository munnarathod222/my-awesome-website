import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useCashbookBalance = () => {
  const { currentUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const records = await pb.collection('cashbook').getFullList({
        filter: `added_by = "${currentUser.id}"`,
        $autoCancel: false
      });

      let currentBal = 0;
      records.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        if (tx.transaction_type === 'Income') {
          currentBal += amt;
        } else {
          currentBal -= amt;
        }
      });
      setBalance(currentBal);
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;
    fetchBalance();

    if (currentUser) {
      pb.collection('cashbook').subscribe('*', () => {
        if (isMounted) fetchBalance();
      });
    }

    return () => {
      isMounted = false;
      if (currentUser) pb.collection('cashbook').unsubscribe('*');
    };
  }, [currentUser, fetchBalance]);

  return { balance, isLoading };
};