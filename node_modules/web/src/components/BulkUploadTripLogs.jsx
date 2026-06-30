import React, { useEffect, useState } from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadTripLogsTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateTripLogRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const BulkUploadTripLogs = () => {
  const { currentUser } = useAuth();
  const [contextData, setContextData] = useState({ employeesMap: new Map(), trucksMap: new Map() });

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [emps, trucks] = await Promise.all([
          pb.collection('employees').getFullList({ fields: 'id,name', $autoCancel: false }),
          pb.collection('trucks').getFullList({ fields: 'id,truck_number', $autoCancel: false })
        ]);
        
        const eMap = new Map();
        emps.forEach(e => eMap.set(e.name, e.id));
        
        const tMap = new Map();
        trucks.forEach(t => tMap.set(t.truck_number, t.id));
        
        setContextData({ employeesMap: eMap, trucksMap: tMap });
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
        await pb.collection('trip_logs').create({
          date: new Date(row['Date (YYYY-MM-DD)']).toISOString(),
          driver_name: row['Driver Name'],
          truck_number: row['Truck Number'],
          route: row['Route'],
          cycle: row['Cycle'] || '',
          kms: Number(row['Kms']) || 0,
          revenue: Number(row['Revenue']) || 0,
          mileage: Number(row['Mileage']) || 0,
          user_id: currentUser.id,
          created_by: currentUser.id
        }, { $autoCancel: false });
        successCount++;
      }
      toast.success(`${successCount} trip logs imported successfully`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed after ${successCount} records. Check logs.`);
    }
  };

  return (
    <BulkUploadLayout
      title="Trip Logs"
      description="Upload daily trip records, distances, and revenues."
      onDownloadTemplate={downloadTripLogsTemplate}
      requiredHeaders={['Date (YYYY-MM-DD)', 'Driver Name', 'Truck Number', 'Route']}
      onValidateRow={validateTripLogRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadTripLogs;