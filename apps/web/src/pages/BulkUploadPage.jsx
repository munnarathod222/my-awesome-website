import React from 'react';
import { Helmet } from 'react-helmet';
import { Users, Route as RouteIcon, Truck, Receipt, Map as MapMap, Building2, Banknote } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header.jsx';

import BulkUploadEmployees from '@/components/BulkUploadEmployees.jsx';
import BulkUploadTripLogs from '@/components/BulkUploadTripLogs.jsx';
import BulkUploadExpenses from '@/components/BulkUploadExpenses.jsx';
import BulkUploadVehicles from '@/components/BulkUploadVehicles.jsx';
import BulkUploadRoutes from '@/components/BulkUploadRoutes.jsx';
import BulkUploadClients from '@/components/BulkUploadClients.jsx';
import BulkUploadDriverAdvances from '@/components/BulkUploadDriverAdvances.jsx';

const BulkUploadPage = () => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Helmet>
        <title>Bulk Data Import | Dashboard</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground" style={{letterSpacing: '-0.02em'}}>
            Bulk Data Import
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Quickly import large volumes of data via CSV. Select a category below to get started.
          </p>
        </div>

        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="bg-muted/50 p-1 mb-8 flex flex-wrap h-auto w-full justify-start rounded-xl overflow-x-auto">
            <TabsTrigger value="clients" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Building2 className="w-4 h-4" /> Clients
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Users className="w-4 h-4" /> Employees
            </TabsTrigger>
            <TabsTrigger value="trips" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <RouteIcon className="w-4 h-4" /> Trip Logs
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Receipt className="w-4 h-4" /> Expenses
            </TabsTrigger>
            <TabsTrigger value="advances" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Banknote className="w-4 h-4" /> Driver Advances
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <Truck className="w-4 h-4" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="routes" className="gap-2 px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              <MapMap className="w-4 h-4" /> Routes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="m-0 focus-visible:outline-none">
            <BulkUploadClients />
          </TabsContent>

          <TabsContent value="employees" className="m-0 focus-visible:outline-none">
            <BulkUploadEmployees />
          </TabsContent>

          <TabsContent value="trips" className="m-0 focus-visible:outline-none">
            <BulkUploadTripLogs />
          </TabsContent>

          <TabsContent value="expenses" className="m-0 focus-visible:outline-none">
            <BulkUploadExpenses />
          </TabsContent>

          <TabsContent value="advances" className="m-0 focus-visible:outline-none">
            <BulkUploadDriverAdvances />
          </TabsContent>

          <TabsContent value="vehicles" className="m-0 focus-visible:outline-none">
            <BulkUploadVehicles />
          </TabsContent>

          <TabsContent value="routes" className="m-0 focus-visible:outline-none">
            <BulkUploadRoutes />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BulkUploadPage;