import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoicesList from '@/components/InvoicesList.jsx';
import InvoiceForm from '@/components/InvoiceForm.jsx';

const InvoiceMakerPage = ({ quoteToConvert, onConverted }) => {
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    if (quoteToConvert) {
      setActiveTab('create');
    }
  }, [quoteToConvert]);

  const handleCreateSuccess = () => {
    setActiveTab('list');
    if (onConverted) onConverted();
  };

  const handleCancelCreate = () => {
    setActiveTab('list');
    if (onConverted) onConverted();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="list" className="px-6">All Invoices</TabsTrigger>
            <TabsTrigger value="create" className="px-6">Create Invoice</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-0 border-none p-0 outline-none">
          <InvoicesList onCreateNew={() => setActiveTab('create')} />
        </TabsContent>

        <TabsContent value="create" className="mt-0 border-none p-0 outline-none">
          <InvoiceForm 
            prefilledQuote={quoteToConvert}
            onSuccess={handleCreateSuccess}
            onCancel={handleCancelCreate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceMakerPage;