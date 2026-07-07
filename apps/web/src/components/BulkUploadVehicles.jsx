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

  const handleImport = async (rows, setImportErrors) => {
    let successCount = 0;
    const rowErrors = [];
    const newlyAddedRegs = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // 1-indexed + header row
      try {
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
        if (row['Registration Number']) newlyAddedRegs.push(row['Registration Number']);
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

    if (newlyAddedRegs.length > 0) {
      const newRegs = new Set(contextData.existingRegNumbers);
      newlyAddedRegs.forEach(r => newRegs.add(r));
      setContextData({ existingRegNumbers: newRegs });
    }

    if (rowErrors.length === 0) {
      toast.success(`✅ ${successCount} vehicles imported successfully!`);
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