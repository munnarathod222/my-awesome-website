import React from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadRoutesTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateRouteRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BulkUploadRoutes = () => {
  const handleImport = async (rows, setImportErrors) => {
    let successCount = 0;
    const rowErrors = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // 1-indexed + header row
      try {
        await pb.collection('routes').create({
          route_name: row['Route Name'],
          start_location: row['Start Location'],
          end_location: row['End Location'],
          distance: Number(row['Distance (Kms)']),
          estimated_time: Number(row['Estimated Time (Hrs)']) || 0,
          route_status: row['Status'] === 'Inactive' ? 'Inactive' : 'Active',
          description: `Imported route: ${row['Start Location']} to ${row['End Location']}`
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
      toast.success(`✅ ${successCount} routes imported successfully!`);
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
      title="Routes"
      description="Upload standard transit routes and distances."
      onDownloadTemplate={downloadRoutesTemplate}
      requiredHeaders={['Route Name', 'Start Location', 'End Location', 'Distance (Kms)']}
      onValidateRow={validateRouteRow}
      onImport={handleImport}
      contextData={{}}
    />
  );
};

export default BulkUploadRoutes;