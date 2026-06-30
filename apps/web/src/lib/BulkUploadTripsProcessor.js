import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pb from './pocketbaseClient.js';
import { format } from 'date-fns';

export const processBulkTrips = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        let rows = [];

        if (file.name.endsWith('.csv')) {
          const result = Papa.parse(data, { header: true, skipEmptyLines: true });
          rows = result.data;
        } else if (file.name.match(/\.xlsx?$/)) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
          throw new Error('Unsupported file format');
        }

        if (rows.length === 0) throw new Error('File is empty');

        let successful = 0;
        let failed = 0;
        let errors = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNum = i + 2; // +1 for 0-index, +1 for header
          
          if (onProgress) {
            onProgress(Math.round(((i + 1) / rows.length) * 100));
          }

          try {
            // Validation
            if (!row['Trip Date']) throw new Error('Trip Date is required');
            if (!row['Truck No']) throw new Error('Truck No is required');
            if (!row['Driver Name']) throw new Error('Driver Name is required');

            let parsedDate;
            try {
              const d = new Date(row['Trip Date']);
              if (isNaN(d.getTime())) throw new Error();
              parsedDate = format(d, 'yyyy-MM-dd');
            } catch (e) {
              throw new Error(`Invalid Date format: ${row['Trip Date']}. Use YYYY-MM-DD.`);
            }

            const route = `${row['Starting Location'] || 'Unknown'} - ${row['Ending Location'] || 'Unknown'}`;

            // Create Trip Log
            const tripData = {
              date: parsedDate,
              truck_number: row['Truck No'],
              driver_name: row['Driver Name'],
              route: route,
              kms: parseFloat(row['Distance (KM)']) || 0,
              client_payment_status: 'pending',
              created_by: pb.authStore.model?.email || 'bulk-upload'
            };

            await pb.collection('trip_logs').create(tripData, { $autoCancel: false });

            // Automatically create expenses if amounts are provided
            const fuelAmt = parseFloat(row['Fuel Used (Liters)']);
            if (fuelAmt > 0) {
              await pb.collection('expenses_fuel').create({
                amount: fuelAmt * 90, // Approx assumed cost if only liters given, or if it's an amount, use amount. Assuming amount.
                liters: fuelAmt,
                date: parsedDate,
                created_by: pb.authStore.model?.id || ''
              }, { $autoCancel: false });
            }

            const fastagAmt = parseFloat(row['FASTag Amount (₹)']);
            if (fastagAmt > 0) {
              await pb.collection('expenses_fastag').create({
                amount: fastagAmt,
                truck_number: row['Truck No'],
                date: parsedDate,
                created_by: pb.authStore.model?.id || ''
              }, { $autoCancel: false });
            }

            const advanceAmt = parseFloat(row['Driver Advance (₹)']);
            if (advanceAmt > 0) {
              await pb.collection('expenses_driver_advance').create({
                amount: advanceAmt,
                driver_name: row['Driver Name'],
                date: parsedDate,
                created_by: pb.authStore.model?.id || ''
              }, { $autoCancel: false });
            }

            const maintAmt = parseFloat(row['Maintenance Cost (₹)']);
            if (maintAmt > 0) {
              await pb.collection('expenses_maintenance').create({
                amount: maintAmt,
                service: 'Bulk Import Maintenance',
                truck_number: row['Truck No'],
                service_provider_name: 'Unknown',
                date: parsedDate,
                created_by: pb.authStore.model?.id || ''
              }, { $autoCancel: false });
            }

            const miscAmt = parseFloat(row['Miscellaneous Cost (₹)']);
            if (miscAmt > 0) {
              await pb.collection('expenses_miscellaneous').create({
                amount: miscAmt,
                expense_description: 'Bulk Import Misc',
                date: parsedDate,
                created_by: pb.authStore.model?.id || ''
              }, { $autoCancel: false });
            }

            successful++;
          } catch (err) {
            failed++;
            errors.push({ row: rowNum, error: err.message });
          }
        }

        resolve({
          total: rows.length,
          successful,
          failed,
          errors
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};