import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { logCashbookError } from '@/lib/cashbookErrorHandler.js';

export const useCashbooks = () => {
  const { currentUser } = useAuth();
  const [cashbooks, setCashbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCashbooks = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await pb.collection('cashbooks').getList(1, 50, {
        filter: `user_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });

      if (res.items.length === 0) {
        const newCb = await pb.collection('cashbooks').create({
          name: 'Default Cashbook',
          description: 'Auto-created default cashbook',
          opening_balance: 0,
          status: 'active',
          user_id: currentUser.id,
          currency: 'INR'
        }, { $autoCancel: false });
        
        setCashbooks([newCb]);
      } else {
        setCashbooks(res.items);
      }
    } catch (err) {
      logCashbookError(err, { action: 'Fetch Cashbooks List', userId: currentUser.id });
      setError(err.message || 'Failed to load cashbooks');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCashbooks();
  }, [fetchCashbooks]);

  return { cashbooks, loading, error, retry: fetchCashbooks };
};