import React from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadRoutesTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateRouteRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BulkUploadRoutes = () => {
  const handleImport = async (rows) => {
    let successCount = 0;
    try {
      for (const row of rows) {
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
      }
      toast.success(`${successCount} routes imported successfully`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed after ${successCount} records. Check logs.`);
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