import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalyticsHubPage } from './pages/AnalyticsHubPage';
import { PaymentRequestsPage } from './pages/PaymentRequestsPage';
import { LiveCashbookPage } from './pages/LiveCashbookPage';
import { TripOverviewPage } from './pages/TripOverviewPage';
import { TripLogsPage } from './pages/TripLogsPage';
import { RecurringTripsPage } from './pages/RecurringTripsPage';
import { FuelTrackerPage } from './pages/FuelTrackerPage';
import { InventoryManagementPage } from './pages/InventoryManagementPage';
import { FleetMaintenancePage } from './pages/FleetMaintenancePage';
import { TyreBatteryManagerPage } from './pages/TyreBatteryManagerPage';
import { PodManagementPage } from './pages/PodManagementPage';
import { ExitAuditPage } from './pages/ExitAuditPage';
import { EmployeeHubPage } from './pages/EmployeeHubPage';
import { BusinessMailPage } from './pages/BusinessMailPage';
import { BillingCyclesPage } from './pages/BillingCyclesPage';
import { PaymentRemindersPage } from './pages/PaymentRemindersPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { DatabaseSchemaViewerPage } from './pages/DatabaseSchemaViewerPage';
import { DocumentsHubPage } from './pages/DocumentsHubPage';
import { PublicVerifyDocumentPage } from './pages/PublicVerifyDocumentPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    // Detect public QR verification from URL path or query params
    const checkVerificationRoute = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      if (path.startsWith('/verify/lr/')) {
        setVerificationToken(decodeURIComponent(path.replace('/verify/lr/', '')));
        return;
      }
      if (path.startsWith('/verify/pod/')) {
        setVerificationToken(decodeURIComponent(path.replace('/verify/pod/', '')));
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const verifyParam = params.get('verify') || params.get('token');
      if (verifyParam) {
        setVerificationToken(verifyParam);
      }
    };

    checkVerificationRoute();
    window.addEventListener('popstate', checkVerificationRoute);
    return () => window.removeEventListener('popstate', checkVerificationRoute);
  }, []);

  // If user scanned a QR code or visited a public verification URL, render standalone verification view
  if (verificationToken) {
    return (
      <PublicVerifyDocumentPage
        token={verificationToken}
        onBackToPortal={() => {
          setVerificationToken(null);
          if (window.history.pushState) {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Navbar currentPage={activeTab} onNavigate={setActiveTab} />
      <div className="flex">
        <Sidebar currentPage={activeTab} onNavigate={setActiveTab} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'documents' && <DocumentsHubPage />}
          {activeTab === 'expenses' && <ExpensesPage />}
          {activeTab === 'analytics' && <AnalyticsHubPage />}
          {activeTab === 'payment-requests' && <PaymentRequestsPage />}
          {activeTab === 'cashbook' && <LiveCashbookPage />}
          {activeTab === 'trip-overview' && <TripOverviewPage />}
          {activeTab === 'trips' && <TripLogsPage />}
          {activeTab === 'recurring' && <RecurringTripsPage />}
          {activeTab === 'fuel' && <FuelTrackerPage />}
          {activeTab === 'inventory' && <InventoryManagementPage />}
          {activeTab === 'maintenance' && <FleetMaintenancePage />}
          {activeTab === 'tyres' && <TyreBatteryManagerPage />}
          {activeTab === 'pod' && <PodManagementPage />}
          {activeTab === 'exit-audut' && <ExitAuditPage />}
          {activeTab === 'employees' && <EmployeeHubPage />}
          {activeTab === 'mail' && <BusinessMailPage />}
          {activeTab === 'billing-cycles' && <BillingCyclesPage />}
          {activeTab === 'payment-reminders' && <PaymentRemindersPage />}
          {activeTab === 'users' && <UserManagementPage />}
          {activeTab === 'db-viewer' && <DatabaseSchemaViewerPage />}
        </main>
      </div>
    </div>
  );
};
