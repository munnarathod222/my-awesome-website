import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { useSessionTimeout } from './hooks/useSessionTimeout.js';
import { Toaster } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import { cn } from '@/lib/utils.js';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import QuotePage from './pages/QuotePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignupRequestPage from './pages/SignupRequestPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import AcceptInvitationPage from './pages/AcceptInvitationPage.jsx';

// Dashboard Pages
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AdminSignupRequestsPage from './pages/AdminSignupRequestsPage.jsx';
import TripLogsPage from './pages/TripLogsPage.jsx';
import PaymentRequestsPage from './pages/PaymentRequestsPage.jsx';
import DeliveryProofUploadPage from './pages/DeliveryProofUploadPage.jsx';
import CashbookPage from './pages/CashbookPage.jsx';
import EmployeeDatabasePage from './pages/EmployeeDatabasePage.jsx';
import TruckManagerPage from './pages/TruckManagerPage.jsx';
import TripManagerPage from './pages/TripManagerPage.jsx';
import AttendanceManagerPage from './pages/AttendanceManagerPage.jsx';
import RoutesPage from './pages/RoutesPage.jsx';
import TripOverviewCalculator from './pages/TripOverviewCalculator.jsx';

// Client Management Pages
import ClientsListPage from './pages/ClientsListPage.jsx';
import ClientFormPage from './pages/ClientFormPage.jsx';
import ClientDetailsPage from './pages/ClientDetailsPage.jsx';
import ClientDashboardPage from './pages/ClientDashboardPage.jsx';
import ClientPaymentAnalysisPage from './pages/ClientPaymentAnalysisPage.jsx';

// New Feature Pages
import BulkUploadPage from './pages/BulkUploadPage.jsx';
import PayrollPage from './pages/PayrollPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import FuelTrackerPage from './pages/FuelTrackerPage.jsx';
import CreditCardsPage from './pages/CreditCardsPage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import TodoListPage from './pages/TodoListPage.jsx';
import TruckDocsPage from './pages/TruckDocsPage.jsx';
import EmployeeDocsPage from './pages/EmployeeDocsPage.jsx';
import QuotesManagerPage from './pages/QuotesManagerPage.jsx';
import AnalyticsHub from './pages/AnalyticsHub.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import TyreManagementPage from './pages/TyreManagementPage.jsx';
import ContactsPage from './pages/ContactsPage.jsx';
import EMICalculatorPage from './pages/EMICalculatorPage.jsx';
import PODManagementPage from './pages/PODManagementPage.jsx';
import ExitAuditPage from './pages/ExitAuditPage.jsx';
import BusinessMailPage from './pages/BusinessMailPage.jsx';

// Inventory Management
import InventoryDashboard from './pages/InventoryDashboard.jsx';
import DeductionHistoryPage from './pages/DeductionHistoryPage.jsx';
import InventoryReportsPage from './pages/InventoryReportsPage.jsx';

// Maintenance System Pages
import MaintenanceLayout from './components/MaintenanceLayout.jsx';
import MaintenanceLogsPage from './pages/MaintenanceLogsPage.jsx';
import MaintenanceRemindersPage from './pages/MaintenanceRemindersPage.jsx';
import PartsInstalledPage from './pages/PartsInstalledPage.jsx';
import MaintenanceProblemsPage from './pages/MaintenanceProblemsPage.jsx';

// Session Wrapper Component
const SessionWrapper = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const { showWarning, resetTimer } = useSessionTimeout(isAuthenticated, logout);

  return (
    <>
      {children}
      <Dialog open={showWarning} onOpenChange={(open) => !open && resetTimer()}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Session Timeout Warning</DialogTitle>
            <DialogDescription>
              Your session will expire in 5 minutes due to inactivity. Do you want to stay logged in?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={resetTimer} className="rounded-xl shadow-sm">Stay Logged In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Layout Wrapper Component
const AppLayout = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const publicRoutes = ['/', '/services', '/about', '/contact', '/quote', '/login', '/signup', '/signup-request', '/forgot-password', '/accept-invitation'];
  const isPublicPage = publicRoutes.includes(location.pathname);
  
  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans relative overflow-hidden">
      {/* Background Aurora Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none z-0" />

      <Header />
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        {showSidebar && (
          <Sidebar 
            isExpanded={isSidebarExpanded} 
            setIsExpanded={setIsSidebarExpanded} 
          />
        )}
        <main className={cn(
          "flex-1 overflow-y-auto w-full flex flex-col relative z-10",
          showSidebar ? "pb-20 md:pb-0" : "pb-0"
        )}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          {isPublicPage && <Footer />}
        </main>
        {showSidebar && <BottomNavigation />}
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <SessionWrapper>
              <AppLayout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/quote" element={<QuotePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/signup-request" element={<SignupRequestPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
                  
                  {/* Dashboard Base */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  
                  {/* Analytics */}
                  <Route path="/analytics" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><AnalyticsHub /></ProtectedRoute>} />
                  <Route path="/client-analysis" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><ClientPaymentAnalysisPage /></ProtectedRoute>} />
                  <Route path="/dashboard/trip-overview" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><TripOverviewCalculator /></ProtectedRoute>} />
                  
                  {/* Admin/Super Admin only routes */}
                  <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><UsersPage /></ProtectedRoute>} />
                  <Route path="/dashboard/requests" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminSignupRequestsPage /></ProtectedRoute>} />
                  
                  {/* Truck & Tyre Management */}
                  <Route path="/truck-manager" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher', 'supervisor']}><TruckManagerPage /></ProtectedRoute>} />
                  <Route path="/tyre-manager/:truckId" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher']}><TyreManagementPage /></ProtectedRoute>} />
                  
                  <Route path="/truck-docs" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher', 'supervisor']}><TruckDocsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/routes" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher']}><TripManagerPage /></ProtectedRoute>} />
                  <Route path="/routes-master" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher']}><RoutesPage /></ProtectedRoute>} />
                  
                  {/* Maintenance System */}
                  <Route path="/fleet-maintenance" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher']}><MaintenancePage /></ProtectedRoute>} />
                  <Route path="/maintenance-tracker" element={<Navigate to="/fleet-maintenance" replace />} />
                  <Route path="/maintenance" element={<Navigate to="/fleet-maintenance" replace />} />
                  
                  {/* Inventory Management */}
                  <Route path="/inventory" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher', 'manager']}><InventoryDashboard /></ProtectedRoute>} />
                  <Route path="/inventory/deductions" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher', 'manager']}><DeductionHistoryPage /></ProtectedRoute>} />
                  <Route path="/inventory/reports" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><InventoryReportsPage /></ProtectedRoute>} />
                  
                  {/* Client Management System */}
                  <Route path="/clients" element={<ProtectedRoute><ClientsListPage /></ProtectedRoute>} />
                  <Route path="/clients/new" element={<ProtectedRoute><ClientFormPage /></ProtectedRoute>} />
                  <Route path="/clients/dashboard" element={<ProtectedRoute><ClientDashboardPage /></ProtectedRoute>} />
                  <Route path="/client/:clientId" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
                  <Route path="/clients/:id/edit" element={<ProtectedRoute><ClientFormPage /></ProtectedRoute>} />
  
                  {/* Operations */}
                  <Route path="/trip-logs" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><TripLogsPage /></ProtectedRoute>} />
                  <Route path="/payment-requests" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><PaymentRequestsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/shipments" element={<Navigate to="/trip-logs" replace />} />
                  <Route path="/dashboard/delivery-proof" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'dispatcher']}><DeliveryProofUploadPage /></ProtectedRoute>} />
                  <Route path="/pod-management" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><PODManagementPage /></ProtectedRoute>} />
                  <Route path="/exit-audit" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><ExitAuditPage /></ProtectedRoute>} />
                  <Route path="/business-mail" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><BusinessMailPage /></ProtectedRoute>} />
                  
                  {/* Cashbook */}
                  <Route path="/cashbook" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><CashbookPage /></ProtectedRoute>} />
                  <Route path="/dashboard/cashbook" element={<Navigate to="/cashbook" replace />} />
                  
                  <Route path="/quotes-manager" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}><QuotesManagerPage /></ProtectedRoute>} />
                  <Route path="/dashboard/quotes" element={<Navigate to="/quotes-manager" replace />} />
                  
                  {/* HR & Payroll */}
                  <Route path="/employees" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'supervisor']}><EmployeeDatabasePage /></ProtectedRoute>} />
                  <Route path="/employee-docs" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'supervisor']}><EmployeeDocsPage /></ProtectedRoute>} />
                  <Route path="/dashboard/attendance" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'supervisor']}><AttendanceManagerPage /></ProtectedRoute>} />
                  
                  {/* Features */}
                  <Route path="/bulk-upload" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><BulkUploadPage /></ProtectedRoute>} />
                  <Route path="/payroll" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><PayrollPage /></ProtectedRoute>} />
                  <Route path="/payroll-dashboard" element={<Navigate to="/payroll" replace />} />
                  
                  <Route path="/expenses" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><ExpensesPage /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><ReportsPage /></ProtectedRoute>} />
                  <Route path="/fuel-tracker" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><FuelTrackerPage /></ProtectedRoute>} />
                  <Route path="/credit-cards" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><CreditCardsPage /></ProtectedRoute>} />
                  <Route path="/emi-calculator" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'dispatcher']}><EMICalculatorPage /></ProtectedRoute>} />
                  <Route path="/reminders" element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
                  <Route path="/todo" element={<ProtectedRoute><TodoListPage /></ProtectedRoute>} />
                  <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
                  
                  {/* Fallback */}
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background">
                      <h1 className="text-5xl font-heading font-bold mb-4">404</h1>
                      <p className="text-muted-foreground mb-8 text-lg">Page not found</p>
                      <Button asChild className="rounded-xl shadow-sm"><Link to="/">Return to Home</Link></Button>
                    </div>
                  } />
                </Routes>
              </AppLayout>
            </SessionWrapper>
            <Toaster position="top-right" />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;