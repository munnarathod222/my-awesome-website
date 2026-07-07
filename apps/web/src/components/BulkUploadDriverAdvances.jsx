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

  const handleImport = async (rows, setImportErrors) => {
    let successCount = 0;
    const rowErrors = [];
    
    try {
      toast.loading(`Importing driver advances... 0/${rows.length}`, { id: 'import-advances' });
      
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const rowNum = index + 2; // 1-indexed + header row
        const driverName = row['Driver Name']?.trim() || '';
        
        try {
          const dateIso = new Date(row['Date (YYYY-MM-DD)']).toISOString();
          const amount = Number(row['Amount']);
          const desc = row['Reason']?.trim() || 'Imported Advance';
          const pMethod = row['Payment Method']?.trim() || 'Cash';
          const empId = contextData.employeesMap.get(driverName.toLowerCase());

          if (!empId) {
            throw new Error(`Driver Name '${driverName}' not found in system.`);
          }

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
          const errMsg = rowErr?.data?.message || rowErr?.message || String(rowErr);
          console.error(`Row ${rowNum} import error:`, errMsg, rowErr);
          rowErrors.push({ rowNum, message: errMsg });
        }
        
        toast.loading(`Importing driver advances... ${successCount + rowErrors.length}/${rows.length}`, { id: 'import-advances' });
      }
      
      toast.dismiss('import-advances');
      
      if (rowErrors.length === 0) {
        toast.success(`✅ ${successCount} driver advances imported successfully!`);
      } else {
        setImportErrors(rowErrors);
        const preview = rowErrors.slice(0, 3).map(e => `Row ${e.rowNum}: ${e.message}`).join('\n');
        const more = rowErrors.length > 3 ? `\n...and ${rowErrors.length - 3} more (see below).` : '';
        toast.error(
          `Imported ${successCount} records. ${rowErrors.length} failed.\n${preview}${more}`,
          { duration: 10000 }
        );
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
