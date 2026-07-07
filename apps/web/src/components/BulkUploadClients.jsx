import React, { useEffect, useState } from 'react';
import BulkUploadLayout from './BulkUploadLayout.jsx';
import { downloadClientTemplate } from '@/lib/BulkUploadTemplate.js';
import { validateClientRow } from '@/lib/CSVParser.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const BulkUploadClients = () => {
  const [contextData, setContextData] = useState({ existingEmails: new Set(), existingPhones: new Set() });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const records = await pb.collection('clients').getFullList({ fields: 'email,phone', $autoCancel: false });
        const emails = new Set(records.map(r => r.email?.toLowerCase()));
        const phones = new Set(records.map(r => r.phone));
        setContextData({ existingEmails: emails, existingPhones: phones });
      } catch (err) {
        console.error("Failed to load existing clients", err);
      }
    };
    fetchClients();
  }, []);

  const handleImport = async (rows, setImportErrors) => {
    let successCount = 0;
    const rowErrors = [];
    const newlyAddedEmails = [];
    const newlyAddedPhones = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // 1-indexed + header row
      try {
        await pb.collection('clients').create({
          client_name: row['Client Name'],
          email: row['Email'],
          phone: row['Phone'],
          company_name: row['Company Name'] || '',
          address: row['Address'] || '',
          city: row['City'] || '',
          state: row['State'] || '',
          postal_code: row['Postal Code'] || '',
          country: row['Country'] || 'India',
          client_type: row['Client Type'] || 'Company',
          industry: row['Industry'] || '',
          contact_person: row['Contact Person'] || '',
          gst_number: row['GST Number'] || '',
          pan_number: row['PAN Number'] || '',
          bank_account: row['Bank Account'] || '',
          ifsc_code: row['IFSC Code'] || '',
          credit_limit: Number(row['Credit Limit']) || 0,
          payment_terms: row['Payment Terms'] || '',
          status: row['Status'] || 'Active'
        }, { $autoCancel: false });
        successCount++;
        if (row['Email']) newlyAddedEmails.push(row['Email'].toLowerCase());
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

    if (newlyAddedEmails.length > 0 || newlyAddedPhones.length > 0) {
      const newEmails = new Set(contextData.existingEmails);
      const newPhones = new Set(contextData.existingPhones);
      newlyAddedEmails.forEach(e => newEmails.add(e));
      newlyAddedPhones.forEach(p => newPhones.add(p));
      setContextData({ existingEmails: newEmails, existingPhones: newPhones });
    }

    if (rowErrors.length === 0) {
      toast.success(`✅ ${successCount} clients imported successfully!`);
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
      title="Clients"
      description="Upload your client directory including companies, distributors, and individuals."
      onDownloadTemplate={downloadClientTemplate}
      requiredHeaders={['Client Name', 'Email', 'Phone']}
      onValidateRow={validateClientRow}
      onImport={handleImport}
      contextData={contextData}
    />
  );
};

export default BulkUploadClients;