import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export function useAdvanceSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState({});

  const validateSync = useCallback(async (advanceId) => {
    try {
      const res = await apiServerClient.fetch('/advances/validate-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advance_id: advanceId })
      });
      const data = await res.json();
      setSyncResults(prev => ({ ...prev, [advanceId]: data }));
      return data;
    } catch (err) {
      console.error('Failed to validate sync status:', err);
      return null;
    }
  }, []);

  const syncAdvance = useCallback(async (employeeId, advanceId) => {
    setIsSyncing(true);
    try {
      const res = await apiServerClient.fetch('/advances/sync-advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId, advance_id: advanceId })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Advance synced to payroll successfully');
        await validateSync(advanceId);
      } else {
        throw new Error(data.error || 'Sync failed');
      }
      return data;
    } catch (err) {
      toast.error(err.message || 'Failed to sync advance');
      console.error(err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [validateSync]);

  const validateMultiple = useCallback(async (advanceIds) => {
    const results = {};
    for (const id of advanceIds) {
      const res = await validateSync(id);
      if (res) results[id] = res;
    }
    return results;
  }, [validateSync]);

  return { 
    isSyncing, 
    syncResults, 
    validateSync, 
    syncAdvance,
    validateMultiple
  };
}