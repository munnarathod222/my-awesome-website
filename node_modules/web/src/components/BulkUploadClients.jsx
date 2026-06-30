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

  const handleImport = async (rows) => {
    let successCount = 0;
    try {
      for (const row of rows) {
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
      }
      toast.success(`${successCount} clients imported successfully`);
      
      const newEmails = new Set(contextData.existingEmails);
      const newPhones = new Set(contextData.existingPhones);
      rows.forEach(r => {
        if(r['Email']) newEmails.add(r['Email'].toLowerCase());
        if(r['Phone']) newPhones.add(r['Phone']);
      });
      setContextData({ existingEmails: newEmails, existingPhones: newPhones });
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed after ${successCount} records. Check logs. Ensure emails are unique.`);
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