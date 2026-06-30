import React, { useEffect, useState } from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadVehiclesTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateVehicleRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BulkUploadVehicles = () => {
  const [contextData, setContextData] = useState({ existingRegNumbers: new Set() });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const records = await pb.collection('vehicles').getFullList({ fields: 'registration_number', $autoCancel: false });
        const regNums = new Set(records.map(r => r.registration_number));
        setContextData({ existingRegNumbers: regNums });
      } catch (err) {
        console.error("Failed to load existing vehicles", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleImport = async (rows) => {
    let successCount = 0;
    try {
      for (const row of rows) {
        const purchaseDate = new Date(row['Purchase Date']);
        
        await pb.collection('vehicles').create({
          vehicle_name: row['Vehicle Name'],
          registration_number: row['Registration Number'],
          vehicle_type: row['Vehicle Type'],
          make: row['Make'] || 'Unknown',
          model: row['Model'] || 'Unknown',
          year: Number(row['Year']),
          fuel_type: row['Fuel Type'],
          capacity: Number(row['Capacity (Tons)']) || 0,
          purchase_date: !isNaN(purchaseDate.getTime()) ? purchaseDate.toISOString() : new Date().toISOString(),
          status: 'Active'
        }, { $autoCancel: false });
        successCount++;
      }
      toast.success(`${successCount} vehicles imported successfully`);
      
      const newRegs = new Set(contextData.existingRegNumbers);
      rows.forEach(r => newRegs.add(r['Registration Number']));
      setContextData({ existingRegNumbers: newRegs });
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed after ${successCount} records. Check logs.`);
    }
  };

  return (
    <BulkUploadLayout
      title="Vehicles"
      description="Upload your fleet data including trucks, cars, and vans."
      onDownloadTemplate={downloadVehiclesTemplate}
      requiredHeaders={['Vehicle Name', 'Registration Number', 'Vehicle Type', 'Year', 'Fuel Type']}
      onValidateRow={validateVehicleRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadVehicles;