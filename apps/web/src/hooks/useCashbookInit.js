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
        // Check if ANY cashbook entry exists (not filtered by user)
        // so we never create a duplicate opening balance when the
        // existing one was created by a different user / admin.
        const records = await pb.collection('cashbook').getList(1, 1, {
          $autoCancel: false
        });

        // Only auto-create if the cashbook is completely empty
        // AND there is no opening balance entry at all.
        if (records.totalItems === 0) {
          await pb.collection('cashbook').create({
            date: new Date().toISOString(),
            description: 'Opening Balance',
            amount: 0,
            transaction_type: 'Expense',
            category: 'Manual',
            reference_type: 'opening_balance',
            added_by: currentUser.id,
            status: 'Completed'
          }, { $autoCancel: false });
        }

        setIsInitialized(true);
      } catch (err) {
        // Non-fatal — cashbook can still render without init
        console.error('Failed to init cashbook:', err);
        setIsInitialized(true);
      }
    };
    
    initCashbook();
  }, [currentUser]);

  return { isInitialized };
};