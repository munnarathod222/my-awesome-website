import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

export function useLoanProfiles() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]); // Initialized as an empty array

  const getAllProfiles = useCallback(async () => {
    if (!currentUser?.id) {
      setProfiles([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('loan_profiles').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-createdAt',
        $autoCancel: false
      });
      setProfiles(records);
      return records;
    } catch (err) {
      console.error('Error fetching loan profiles:', err);
      setError(err.message);
      setProfiles([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadProfile = useCallback(async (profileId) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('loan_profiles').getOne(profileId, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error loading loan profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (profileData) => {
    if (!currentUser?.id) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      const data = {
        ...profileData,
        userId: currentUser.id
      };
      const record = await pb.collection('loan_profiles').create(data, { $autoCancel: false });
      setProfiles(prev => [record, ...prev]);
      return record;
    } catch (err) {
      console.error('Error saving loan profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const updateProfile = useCallback(async (profileId, profileData) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('loan_profiles').update(profileId, profileData, { $autoCancel: false });
      setProfiles(prev => prev.map(p => p.id === profileId ? record : p));
      return record;
    } catch (err) {
      console.error('Error updating loan profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfile = useCallback(async (profileId) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('loan_profiles').delete(profileId, { $autoCancel: false });
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      return true;
    } catch (err) {
      console.error('Error deleting loan profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDefaultProfile = useCallback(async () => {
    if (!currentUser?.id) return null;
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('loan_profiles').getFullList({
        filter: `userId = "${currentUser.id}" && isDefault = true`,
        $autoCancel: false
      });
      return records.length > 0 ? records[0] : null;
    } catch (err) {
      console.error('Error fetching default profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const setDefaultProfile = useCallback(async (profileId) => {
    if (!currentUser?.id) return false;
    setLoading(true);
    setError(null);
    try {
      // First, remove default from all
      const currentDefaults = await pb.collection('loan_profiles').getFullList({
        filter: `userId = "${currentUser.id}" && isDefault = true`,
        $autoCancel: false
      });
      
      for (const p of currentDefaults) {
        if (p.id !== profileId) {
          await pb.collection('loan_profiles').update(p.id, { isDefault: false }, { $autoCancel: false });
        }
      }

      // Then set the new default
      if (profileId) {
        await pb.collection('loan_profiles').update(profileId, { isDefault: true }, { $autoCancel: false });
      }
      
      // Refresh the profiles list to reflect updated defaults
      await getAllProfiles();
      return true;
    } catch (err) {
      console.error('Error setting default profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, getAllProfiles]);

  return {
    profiles,
    loading,
    error,
    getAllProfiles,
    loadProfile,
    saveProfile,
    updateProfile,
    deleteProfile,
    getDefaultProfile,
    setDefaultProfile
  };
}