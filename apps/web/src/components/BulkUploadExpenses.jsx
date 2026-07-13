import React, { useEffect, useState } from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadExpensesTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateExpenseRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const BulkUploadExpenses = () => {
  const { currentUser } = useAuth();
  const [contextData, setContextData] = useState({ trucksMap: new Map(), employeesMap: new Map() });

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [trucks, emps] = await Promise.all([
          pb.collection('trucks').getFullList({ fields: 'id,truck_number', $autoCancel: false }),
          pb.collection('employees').getFullList({ fields: 'id,name', $autoCancel: false })
        ]);
        
        const tMap = new Map();
        trucks.forEach(t => tMap.set(t.truck_number, t.id));
        
        const eMap = new Map();
        emps.forEach(e => eMap.set(e.name.toLowerCase(), e.id));
        
        setContextData({ trucksMap: tMap, employeesMap: eMap });
      } catch (err) {
        console.error("Failed to load context data", err);
      }
    };
    fetchContext();
  }, []);

  const handleImport = async (rows, setImportErrors) => {
    let successCount = 0;
    const rowErrors = [];

    for (const row of rows) {
      const rowNum = successCount + rowErrors.length + 2; // +2: 1-indexed + header row
      try {
        const category = row['Category']?.trim();
        const subcategory = row['Subcategory']?.trim() || '';
        const rawDate = row['Date (YYYY-MM-DD)'];
        const dateIso = new Date(rawDate).toISOString();
        const amount = Number(row['Amount']);
        const truckId = row['Truck Number']?.trim()
          ? (contextData.trucksMap.get(row['Truck Number'].trim()) || '')
          : '';
        const paymentMethod = row['Payment Method']?.trim() || 'Cash';
        const description = row['Description']?.trim() || '';

        // For Employee category: find employee, and create advance if subcategory is Employee Advance
        let advanceId = '';
        let employeeId = '';
        if (category === 'Employee') {
          const empName = row['Employee Name']?.trim();
          const empId = empName ? contextData.employeesMap.get(empName.toLowerCase()) : null;
          if (!empId) {
            throw new Error(`Employee "${empName}" not found. Make sure the name matches exactly.`);
          }
          employeeId = empId;

          if (subcategory === 'Employee Advance') {
            const advRecord = await pb.collection('advances').create({
              employee_id: empId,
              amount,
              date: dateIso,
              reason: description || 'Bulk Import Advance',
              status: 'Pending',
            }, { $autoCancel: false });
            advanceId = advRecord.id;
          }
        }

        // Create the expense record — cashbook sync handled by DB hook
        await pb.collection('expenses').create({
          date: dateIso,
          category,
          subcategory: (category === 'Regular' || category === 'Employee') ? subcategory : '',
          amount,
          description,
          payment_method: paymentMethod,
          status: 'Approved',
          truck_id: truckId || '',
          employee_id: employeeId || '',
          created_by: currentUser.id,
          ...(advanceId ? { advance_id: advanceId } : {}),
        }, { $autoCancel: false });

        successCount++;
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

    if (rowErrors.length === 0) {
      toast.success(`✅ ${successCount} expenses imported successfully!`);
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
      title="Expenses"
      description={
        <span>
          Upload expenses using the template. <br />
          <strong>Category</strong> must be one of: <code>Regular</code>, <code>Employee Advance</code>, <code>EMI</code>.<br />
          For <code>Regular</code> → fill <strong>Subcategory</strong> (Fuel, Maintenance, Toll, etc.).<br />
          For <code>Employee Advance</code> → fill <strong>Employee Name</strong> exactly as it appears in the system.
        </span>
      }
      onDownloadTemplate={downloadExpensesTemplate}
      requiredHeaders={['Date (YYYY-MM-DD)', 'Category', 'Amount']}
      onValidateRow={validateExpenseRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadExpenses;