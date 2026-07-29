import pb from './pocketbaseClient.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

/**
 * List of core collections to export in complete enterprise backup
 */
export const ENTERPRISE_COLLECTIONS = [
  'payment_requests',
  'fuel_payments',
  'cashbook',
  'trip_logs',
  'clients',
  'transport_crm_customers',
  'driver_applications',
  'todos',
  'credit_cards',
  'fuel_tracker',
  'fuel_stations',
  'trucks',
  'truck_docs',
  'employees',
  'employee_docs',
  'payroll',
  'company_settings',
  'company_vault_docs',
  'insurance_policies',
  'quotes',
  'maintenance_logs',
  'maintenance_problems',
  'parts_inventory'
];

/**
 * Export complete enterprise backup JSON containing payment requests, collections, trips, clients, etc.
 */
export async function exportEnterpriseBackupJSON() {
  const toastId = toast.loading('Exporting enterprise database backup (including payment requests & collections)...');
  try {
    const backupData = {
      version: '2.0',
      exported_at: new Date().toISOString(),
      platform: 'Jai Bhavani Cargo Enterprise ERP',
      collections: {}
    };

    let totalRecordCount = 0;

    for (const colName of ENTERPRISE_COLLECTIONS) {
      try {
        const records = await pb.collection(colName).getFullList({ $autoCancel: false }).catch(() => []);
        backupData.collections[colName] = records || [];
        totalRecordCount += (records || []).length;
      } catch (err) {
        console.warn(`Could not export collection ${colName}:`, err);
        backupData.collections[colName] = [];
      }
    }

    // Convert data to JSON blob and download
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const a = document.createElement('a');
    a.href = url;
    a.download = `JaiBhavaniCargo_FULL_BACKUP_INCL_PAYMENTS_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Enterprise backup downloaded! (${totalRecordCount} records across ${Object.keys(backupData.collections).length} collections)`, { id: toastId });
    return backupData;
  } catch (err) {
    console.error('Failed to export enterprise backup:', err);
    toast.error('Failed to export enterprise database backup.', { id: toastId });
    throw err;
  }
}
