import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

export function useTyreManagement() {
  const [tyres, setTyres] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrucks = useCallback(async () => {
    try {
      const records = await pb.collection('trucks').getFullList({
        sort: 'truck_number',
        $autoCancel: false
      });
      setTrucks(records);
      return records;
    } catch (err) {
      console.error("Error fetching trucks:", err);
      toast.error("Failed to load trucks");
      return [];
    }
  }, []);

  const fetchAllTyres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('tyres').getFullList({
        expand: 'truck_id',
        sort: '-created',
        $autoCancel: false
      });
      setTyres(records);
      return records;
    } catch (err) {
      console.error("Error fetching tyres:", err);
      setError(err.message);
      toast.error("Failed to load tyres");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTyre = async (data) => {
    try {
      const record = await pb.collection('tyres').create(data, { $autoCancel: false });
      setTyres(prev => [record, ...prev]);
      toast.success("Tyre added successfully");
      return record;
    } catch (err) {
      console.error("Error creating tyre:", err);
      toast.error(err.message || "Failed to add tyre");
      throw err;
    }
  };

  const updateTyre = async (id, data) => {
    try {
      const record = await pb.collection('tyres').update(id, data, { expand: 'truck_id', $autoCancel: false });
      setTyres(prev => prev.map(t => t.id === id ? record : t));
      toast.success("Tyre updated successfully");
      return record;
    } catch (err) {
      console.error("Error updating tyre:", err);
      toast.error(err.message || "Failed to update tyre");
      throw err;
    }
  };

  const deleteTyre = async (id) => {
    try {
      await pb.collection('tyres').delete(id, { $autoCancel: false });
      setTyres(prev => prev.filter(t => t.id !== id));
      toast.success("Tyre deleted successfully");
    } catch (err) {
      console.error("Error deleting tyre:", err);
      toast.error(err.message || "Failed to delete tyre");
      throw err;
    }
  };

  return {
    tyres,
    trucks,
    loading,
    error,
    fetchAllTyres,
    fetchTrucks,
    createTyre,
    updateTyre,
    deleteTyre
  };
}