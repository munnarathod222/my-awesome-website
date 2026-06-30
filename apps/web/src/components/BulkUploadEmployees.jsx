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

  const handleImport = async (rows) => {
    let successCount = 0;
    try {
      for (const row of rows) {
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
          contact: row['Phone'] || '0000000000',
          employee_type: empType,
          active_status: row['Status']?.toLowerCase() || 'active',
          position: row['Position'] || '',
          base_salary: Number(row['Salary']) || 0,
          hire_date: hireDate,
          address: row['Address'] || '',
        }, { $autoCancel: false });
        successCount++;
      }
      toast.success(`${successCount} employees imported successfully`);
      
      // Update local context to prevent duplicate imports without refreshing
      const newPhones = new Set(contextData.existingPhones);
      rows.forEach(r => newPhones.add(r['Phone']));
      setContextData({ existingPhones: newPhones });
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed after ${successCount} records. Check logs.`);
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