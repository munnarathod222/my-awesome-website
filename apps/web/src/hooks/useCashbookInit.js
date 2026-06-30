import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useCashbookInit = () => {
  const { currentUser } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initCashbook = async () => {
      if (!currentUser) return;
      
      try {
        const records = await pb.collection('cashbook').getList(1, 1, {
          filter: `added_by = "${currentUser.id}"`,
          $autoCancel: false
        });

        if (records.items.length === 0) {
          await pb.collection('cashbook').create({
            date: new Date().toISOString(),
            description: 'Opening Balance',
            amount: 0.01,
            transaction_type: 'Income',
            category: 'Manual',
            added_by: currentUser.id,
            status: 'Completed'
          }, { $autoCancel: false });
        }
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to init cashbook:', err);
      }
    };
    
    initCashbook();
  }, [currentUser]);

  return { isInitialized };
};