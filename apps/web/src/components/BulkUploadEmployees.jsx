import React, { useEffect, useState } from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadEmployeeTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateEmployeeRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BulkUploadEmployees = () => {
  const [contextData, setContextData] = useState({ existingPhones: new Set() });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const records = await pb.collection('employees').getFullList({ fields: 'contact', $autoCancel: false });
        const phones = new Set(records.map(r => r.contact));
        setContextData({ existingPhones: phones });
      } catch (err) {
        console.error("Failed to load existing employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleImport = async (rows, setImportErrors) => {
    let successCount = 0;
    const rowErrors = [];
    const newlyAddedPhones = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // 1-indexed + header row
      try {
        let hireDate = undefined;
        if (row['Joining Date']) {
          const parsedDate = new Date(row['Joining Date']);
          if (!isNaN(parsedDate.getTime())) hireDate = parsedDate.toISOString();
        }

        const position = (row['Position'] || '').toLowerCase();
        let empType = 'driver';
        if (position.includes('supervisor')) empType = 'supervisor';
        if (position.includes('manager')) empType = 'manager';

        await pb.collection('employees').create({
          name: row['Employee Name'],
          contact: row['Phone'] || 'N/A',
          employee_type: empType,
          employment_type: row['Employment Type'] || 'Permanent',
          joining_date: hireDate || new Date().toISOString(),
          active_status: row['Status']?.toLowerCase() || 'active',
          position: row['Position'] || '',
          base_salary: Number(row['Salary']) || 0,
          salary_amount: Number(row['Salary']) || 0,
          hire_date: hireDate,
          address: row['Address'] || '',
        }, { $autoCancel: false });
        successCount++;
        if (row['Phone']) newlyAddedPhones.push(row['Phone']);
      } catch (error) {
        const pbMsg = error?.data?.message || error?.message || String(error);
        const fieldErrors = error?.data?.data
          ? Object.entries(error.data.data).map(([k, v]) => `${k}: ${v?.message || v}`).join('; ')
          : '';
        const fullMsg = fieldErrors ? `${pbMsg} — ${fieldErrors}` : pbMsg;
        console.error(`Row ${rowNum} import error:`, fullMsg, error);
        rowErrors.push({ rowNum, message: fullMsg });
      }
    }

    // Update local context to prevent duplicate validation errors for successfully imported phones
    if (newlyAddedPhones.length > 0) {
      const newPhones = new Set(contextData.existingPhones);
      newlyAddedPhones.forEach(p => newPhones.add(p));
      setContextData({ existingPhones: newPhones });
    }

    if (rowErrors.length === 0) {
      toast.success(`✅ ${successCount} employees imported successfully!`);
    } else {
      setImportErrors(rowErrors);
      const preview = rowErrors.slice(0, 3).map(e => `Row ${e.rowNum}: ${e.message}`).join('\n');
      const more = rowErrors.length > 3 ? `\n...and ${rowErrors.length - 3} more (see below).` : '';
      toast.error(
        `Imported ${successCount} records. ${rowErrors.length} failed.\n${preview}${more}`,
        { duration: 10000 }
      );
    }
  };

  return (
    <BulkUploadLayout
      title="Employees"
      description="Upload your employee directory including drivers and staff."
      onDownloadTemplate={downloadEmployeeTemplate}
      requiredHeaders={['Employee Name', 'Phone', 'Position', 'Salary']}
      onValidateRow={validateEmployeeRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadEmployees;