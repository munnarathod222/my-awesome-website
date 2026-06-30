import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

export function useMaintenanceData(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const records = await pb.collection(collectionName).getFullList({
        sort: '-created',
        $autoCancel: false,
        ...options
      });
      setData(records);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err);
      toast.error(`Failed to load ${collectionName.replace('_', ' ')}`);
    } finally {
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createRecord = async (recordData) => {
    try {
      const record = await pb.collection(collectionName).create(recordData, { $autoCancel: false });
      setData(prev => [record, ...prev]);
      toast.success('Record created successfully');
      return record;
    } catch (err) {
      console.error('Create error:', err);
      toast.error('Failed to create record');
      throw err;
    }
  };

  const updateRecord = async (id, recordData) => {
    try {
      const record = await pb.collection(collectionName).update(id, recordData, { $autoCancel: false });
      setData(prev => prev.map(item => item.id === id ? record : item));
      toast.success('Record updated successfully');
      return record;
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update record');
      throw err;
    }
  };

  const deleteRecord = async (id) => {
    try {
      await pb.collection(collectionName).delete(id, { $autoCancel: false });
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Record deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete record');
      throw err;
    }
  };

  return { data, loading, error, refetch: fetchData, createRecord, updateRecord, deleteRecord };
}