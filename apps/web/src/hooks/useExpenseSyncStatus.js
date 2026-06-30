// This hook has been deprecated. All sync operations are now handled 
// synchronously inline via PocketBase SDK during normal CRUD operations.

export function useExpenseSyncStatus() {
  return { 
    getSyncStatus: async () => 'synced', 
    getUnsynced: async () => [], 
    retrySync: async () => true, 
    loading: false 
  };
}