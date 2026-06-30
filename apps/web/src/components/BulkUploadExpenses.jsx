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

  const handleImport = async (rows) => {
    let successCount = 0;
    try {
      for (const row of rows) {
        const category = row['Category']?.trim();
        const dateIso = new Date(row['Date (YYYY-MM-DD)']).toISOString();
        const amount = Number(row['Amount']);
        const truckId = row['Truck Number'] ? contextData.trucksMap.get(row['Truck Number'].trim()) : '';

        // If it's an advance, we need to create it in the advances collection and cashbook
        let advanceId = '';
        if (category === 'Driver Advance' || category === 'Employee Advance') {
          // Attempt to extract driver name from description or fallback to "Unknown"
          const desc = row['Description'] || '';
          let empId = null;
          
          // Very basic heuristic: check if any employee name is in description
          for (const [name, id] of contextData.employeesMap.entries()) {
            if (desc.toLowerCase().includes(name)) {
              empId = id;
              break;
            }
          }

          if (empId) {
            const advRecord = await pb.collection('advances').create({
              employee_id: empId,
              amount: amount,
              date: dateIso,
              reason: desc || 'Imported Advance',
              status: 'Pending'
            }, { $autoCancel: false });
            advanceId = advRecord.id;

            // Log to cashbook
            await pb.collection('cashbook').create({
              date: dateIso,
              description: `Advance paid: ${desc}`,
              amount: amount,
              transaction_type: 'Advance',
              category: 'Advance',
              added_by: currentUser.id,
              reference_id: advRecord.id,
              reference_type: 'advance',
              status: 'Completed'
            }, { $autoCancel: false });
          }
        }

        // Always create the expense record
        await pb.collection('expenses').create({
          date: dateIso,
          category: category === 'Driver Advance' || category === 'Employee Advance' ? 'Other' : category,
          amount: amount,
          description: row['Description'] || '',
          payment_method: row['Payment Method'] || 'Cash',
          status: 'Approved',
          truck_id: truckId,
          created_by: currentUser.id,
          advance_id: advanceId || null
        }, { $autoCancel: false });
        
        successCount++;
      }
      toast.success(`${successCount} expenses imported successfully`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed after ${successCount} records. Check logs.`);
    }
  };

  return (
    <BulkUploadLayout
      title="Expenses"
      description="Upload regular expenses, fuel logs, maintenance bills, and advances."
      onDownloadTemplate={downloadExpensesTemplate}
      requiredHeaders={['Date (YYYY-MM-DD)', 'Category', 'Amount']}
      onValidateRow={validateExpenseRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadExpenses;