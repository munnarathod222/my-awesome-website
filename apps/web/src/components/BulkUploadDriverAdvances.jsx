import React, { useEffect, useState } from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadDriverAdvancesTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateDriverAdvanceRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const BulkUploadDriverAdvances = () => {
  const { currentUser } = useAuth();
  const [contextData, setContextData] = useState({ employeesMap: new Map() });

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const emps = await pb.collection('employees').getFullList({ fields: 'id,name', $autoCancel: false });
        const eMap = new Map();
        emps.forEach(e => eMap.set(e.name.toLowerCase(), e.id));
        setContextData({ employeesMap: eMap });
      } catch (err) {
        console.error("Failed to load employee list", err);
      }
    };
    fetchContext();
  }, []);

  const handleImport = async (rows) => {
    let successCount = 0;
    let failedCount = 0;
    try {
      toast.loading(`Importing driver advances... 0/${rows.length}`, { id: 'import-advances' });
      for (const row of rows) {
        const dateIso = new Date(row['Date (YYYY-MM-DD)']).toISOString();
        const amount = Number(row['Amount']);
        const driverName = row['Driver Name']?.trim() || '';
        const desc = row['Reason']?.trim() || 'Imported Advance';
        const pMethod = row['Payment Method']?.trim() || 'Cash';
        const empId = contextData.employeesMap.get(driverName.toLowerCase());

        if (empId) {
          try {
            // Create advance record
            const advRecord = await pb.collection('advances').create({
              employee_id: empId,
              amount: amount,
              date: dateIso,
              reason: desc,
              status: 'Pending'
            }, { $autoCancel: false });

            // Log debit entry to cashbook ledger
            await pb.collection('cashbook').create({
              date: dateIso,
              description: `Advance paid to ${driverName}: ${desc}`,
              amount: amount,
              transaction_type: 'Advance',
              category: 'Advance',
              added_by: currentUser.id,
              reference_id: advRecord.id,
              reference_type: 'advance',
              status: 'Completed',
              payment_method: pMethod
            }, { $autoCancel: false });

            successCount++;
          } catch (rowErr) {
            console.error(`Failed to import row for ${driverName}:`, rowErr);
            failedCount++;
          }
        } else {
          failedCount++;
        }
        
        toast.loading(`Importing driver advances... ${successCount + failedCount}/${rows.length}`, { id: 'import-advances' });
      }
      toast.dismiss('import-advances');
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} driver advances!`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to import ${failedCount} rows. Please verify employee names.`);
      }
    } catch (error) {
      toast.dismiss('import-advances');
      console.error('Import error:', error);
      toast.error(`Import failed. Check CSV structure and try again.`);
    }
  };

  return (
    <BulkUploadLayout
      title="Driver Advances"
      description="Upload driver/employee advance payments and log them to the Cashbook."
      onDownloadTemplate={downloadDriverAdvancesTemplate}
      requiredHeaders={['Date (YYYY-MM-DD)', 'Driver Name', 'Amount']}
      onValidateRow={validateDriverAdvanceRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadDriverAdvances;
