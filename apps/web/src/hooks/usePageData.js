import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';

export function usePageData(collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable stringified options for dependency array
  const optionsString = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    console.log(`[usePageData] Fetching ${collectionName}...`);
    setLoading(true);
    setError(null);
    try {
      const parsedOptions = JSON.parse(optionsString);
      const records = await pb.collection(collectionName).getList(1, 500, {
        ...parsedOptions,
        $autoCancel: false
      });
      console.log(`[usePageData] ${collectionName} loaded successfully:`, records.items);
      setData(records.items);
    } catch (err) {
      console.error(`[usePageData] Failed to load ${collectionName}:`, err);
      setError(err.message || 'An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [collectionName, optionsString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retry: fetchData };
}