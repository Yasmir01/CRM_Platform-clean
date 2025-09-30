import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppTheme from "./shared-theme/AppTheme";
import { LocaleProvider } from "./crm/contexts/LocaleContext";
import { AuthProvider } from "./crm/contexts/AuthContext";

// At the top with other imports
import Unauthorized from "./pages/Unauthorized";

// Inside <Routes> in App.tsx
<Route path="/unauthorized" element={<Unauthorized />} />

// Core pages
import CrmLogin from "./pages/CrmLogin";
import VendorLogin from "./crm/vendor/VendorLogin";

// Barrel imports
import {
  TenantDashboard,
  OwnerDashboard,
  VendorDashboard,
  ManagerDashboard,
  AdminDashboard,
  SuperAdminDashboardPage,
} from "./crm/dashboards";

import {
  TenantSettings,
  OwnerSettings,
  VendorSettings,
  ManagerSettings,
  AdminSettings,
  SuperAdminSettings,
} from "./crm/settings";

// Tenant sub-pages
import TenantPayments from "./crm/tenant/TenantPayments";
import TenantMaintenance from "./crm/tenant/TenantMaintenance";
import TenantLease from "./crm/tenant/TenantLease";
import TenantAutopay from "./crm/tenant/TenantAutopay";
import TenantRefundHistoryPage from "./crm/tenant/TenantRefundHistoryPage";
import TenantCheckoutPage from "./crm/tenant/TenantCheckoutPage";
import PaymentMethodsPage from "./crm/tenant/PaymentMethodsPage";
import NewPaymentPage from "./crm/tenant/NewPaymentPage";
import AutoPaySetupPage from "./crm/tenant/AutoPaySetupPage";
import TenantPortal from "./crm/tenant/TenantPortal";

// Owner sub-pages
import OwnerStatements from "./crm/owner/OwnerStatements";
import OwnerProperties from "./crm/owner/OwnerProperties";
import OwnerLedgerPage from "./crm/owner/OwnerLedgerPage";

// Vendor sub-pages
import VendorWorkOrders from "./crm/vendor/VendorWorkOrders";
import VendorProfile from "./crm/vendor/VendorProfile";

// Manager sub-pages
import ManagerTenants from "./crm/manager/ManagerTenants";
import ManagerOwners from "./crm/manager/ManagerOwners";
import ManagerMaintenance from "./crm/manager/ManagerMaintenance";

// Admin sub-pages
import AdminUsers from "./crm/admin/AdminUsers";
import AdminLogs from "./crm/admin/AdminLogs";
import AdminPayments from "./crm/admin/AdminPayments";

// SuperAdmin sub-pages
import SuperAdminOverview from "./crm/superadmin/SuperAdminOverview";
import SuperAdminSubscribers from "./crm/superadmin/SuperAdminSubscribers";
import SuperAdminImpersonate from "./crm/superadmin/SuperAdminImpersonate";
import SuperAdminCompliance from "./crm/superadmin/SuperAdminCompliance";
import SuperAdminAnalytics from "./crm/superadmin/SuperAdminAnalytics";
import SuperAdminNotifications from "./crm/superadmin/SuperAdminNotifications";
import SUAccountingIntegrations from "./crm/superadmin/SUAccountingIntegrations";
import SUAccountingIntegrationLogs from "./crm/superadmin/SUAccountingIntegrationLogs";
import SUAccountingSyncLogs from "./crm/superadmin/SUAccountingSyncLogs";

// CRM core
import CrmDashboard from "./crm/core/CrmDashboard";
import Calendar from "./crm/core/Calendar";
import ContactManagement from "./crm/core/ContactManagement";
import SalesAutomation from "./crm/core/SalesAutomation";
import MarketingAutomation from "./crm/core/MarketingAutomation";
import Tasks from "./crm/core/Tasks";
import AnalyticsInsights from "./crm/core/AnalyticsInsights";
import Properties from "./crm/core/Properties";
import Tenants from "./crm/core/Tenants";

// ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute";

// Fallback Not Found
function NotFound() {
  return (
    <div style={{ padding: "2rem", background: "#300", color: "#fff" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

<<<<<<< HEAD
// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <CrmLogin />;
  }

  return <>{children}</>;
}

// App Routes Component (needs to be inside AuthProvider)
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<CrmLogin />} />
      {/* Role-based portals */}
      <Route path="/tenant" element={<React.Suspense fallback={<PageLoader />}><TenantDashboard /></React.Suspense>} />
      <Route path="/tenant/payments" element={<React.Suspense fallback={<PageLoader />}><TenantPayments /></React.Suspense>} />
      <Route path="/tenant/payment-methods" element={<React.Suspense fallback={<PageLoader />}><PaymentMethodsPage /></React.Suspense>} />
      <Route path="/tenant/payments/new" element={<React.Suspense fallback={<PageLoader />}><NewPaymentPage /></React.Suspense>} />
      <Route path="/tenant/checkout" element={<React.Suspense fallback={<PageLoader />}><TenantCheckoutPage /></React.Suspense>} />
      <Route path="/tenant/maintenance" element={<React.Suspense fallback={<PageLoader />}><TenantMaintenance /></React.Suspense>} />
      <Route path="/tenant/lease" element={<React.Suspense fallback={<PageLoader />}><TenantLease /></React.Suspense>} />
      <Route path="/tenant/autopay" element={<React.Suspense fallback={<PageLoader />}><TenantAutopay /></React.Suspense>} />
      <Route path="/tenant/autopay/setup" element={<React.Suspense fallback={<PageLoader />}><AutoPaySetupPage /></React.Suspense>} />
      <Route path="/tenant/refunds" element={<React.Suspense fallback={<PageLoader />}><TenantRefundHistoryPage /></React.Suspense>} />
      <Route path="/owner" element={<React.Suspense fallback={<PageLoader />}><OwnerDashboard /></React.Suspense>} />
      <Route path="/owner/statements" element={<React.Suspense fallback={<PageLoader />}><OwnerStatements /></React.Suspense>} />
      <Route path="/owner/properties" element={<React.Suspense fallback={<PageLoader />}><OwnerProperties /></React.Suspense>} />
      <Route path="/owner/ledger" element={<React.Suspense fallback={<PageLoader />}><OwnerLedgerPage /></React.Suspense>} />
      <Route path="/vendor-login" element={<React.Suspense fallback={<PageLoader />}><VendorLogin /></React.Suspense>} />
      <Route path="/vendor" element={<React.Suspense fallback={<PageLoader />}><VendorDashboard /></React.Suspense>} />
      <Route path="/vendor/work-orders" element={<React.Suspense fallback={<PageLoader />}><VendorWorkOrders /></React.Suspense>} />
      <Route path="/vendor/profile" element={<React.Suspense fallback={<PageLoader />}><VendorProfile /></React.Suspense>} />
      <Route path="/manager" element={<React.Suspense fallback={<PageLoader />}><ManagerDashboard /></React.Suspense>} />
      <Route path="/manager/tenants" element={<React.Suspense fallback={<PageLoader />}><ManagerTenants /></React.Suspense>} />
      <Route path="/manager/owners" element={<React.Suspense fallback={<PageLoader />}><ManagerOwners /></React.Suspense>} />
      <Route path="/manager/maintenance" element={<React.Suspense fallback={<PageLoader />}><ManagerMaintenance /></React.Suspense>} />
      <Route path="/admin" element={<React.Suspense fallback={<PageLoader />}><AdminDashboard /></React.Suspense>} />
      <Route path="/admin/users" element={<React.Suspense fallback={<PageLoader />}><AdminUsers /></React.Suspense>} />
      <Route path="/admin/logs" element={<React.Suspense fallback={<PageLoader />}><AdminLogs /></React.Suspense>} />
      <Route path="/superadmin" element={<React.Suspense fallback={<PageLoader />}><SuperAdminDashboardPage /></React.Suspense>} />
      <Route path="/tenant-portal" element={
        <React.Suspense fallback={<PageLoader />}>
          <TenantPortal />
        </React.Suspense>
      } />
      {/* Public help route - accessible without authentication */}
      <Route path="/help" element={
        <React.Suspense fallback={<PageLoader />}>
          <HelpSupport />
        </React.Suspense>
      } />
      <Route path="/crm" element={
        <ProtectedRoute>
          <CrmDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<CrmMainDashboard />} />
        <Route path="calendar" element={
          <React.Suspense fallback={<PageLoader />}>
            <Calendar />
          </React.Suspense>
        } />
        <Route path="contacts" element={
          <React.Suspense fallback={<PageLoader />}>
            <ContactManagement />
          </React.Suspense>
        } />
        <Route path="sales" element={
          <React.Suspense fallback={<PageLoader />}>
            <SalesAutomation />
          </React.Suspense>
        } />
        <Route path="marketing" element={
          <React.Suspense fallback={<PageLoader />}>
            <MarketingAutomation />
          </React.Suspense>
        } />
        <Route path="properties" element={
          <React.Suspense fallback={<PageLoader />}>
            <Properties />
          </React.Suspense>
        } />
        <Route path="tenants" element={
          <React.Suspense fallback={<PageLoader />}>
            <Tenants />
          </React.Suspense>
        } />
        <Route path="prospects" element={
          <React.Suspense fallback={<PageLoader />}>
            <Prospects />
          </React.Suspense>
        } />
        <Route path="leasing-funnel" element={
          <React.Suspense fallback={<PageLoader />}>
            <LeasingFunnel />
          </React.Suspense>
        } />
        <Route path="applications" element={
          <React.Suspense fallback={<PageLoader />}>
            <Applications />
          </React.Suspense>
        } />
        <Route path="applications/apply" element={
          <React.Suspense fallback={<PageLoader />}>
            <RentalApplicationForm />
          </React.Suspense>
        } />
        <Route path="managers" element={
          <React.Suspense fallback={<PageLoader />}>
            <PropertyManagers />
          </React.Suspense>
        } />
        <Route path="service-providers" element={
          <React.Suspense fallback={<PageLoader />}>
            <ServiceProviders />
          </React.Suspense>
        } />
        <Route path="rent-collection" element={
          <React.Suspense fallback={<PageLoader />}>
            <RentCollection />
          </React.Suspense>
        } />
        <Route path="late-fees" element={
          <React.Suspense fallback={<PageLoader />}>
            <LateFees />
          </React.Suspense>
        } />
        <Route path="work-orders" element={
          <React.Suspense fallback={<PageLoader />}>
            <WorkOrders />
          </React.Suspense>
        } />
        <Route path="maintenance-requests" element={
          <React.Suspense fallback={<PageLoader />}>
            <MaintenanceRequests />
          </React.Suspense>
        } />
        <Route path="maintenance-kanban" element={
          <React.Suspense fallback={<PageLoader />}>
            <MaintenanceKanban />
          </React.Suspense>
        } />
        <Route path="customer-service" element={
          <React.Suspense fallback={<PageLoader />}>
            <CustomerService />
          </React.Suspense>
        } />
        <Route path="communications" element={
          <React.Suspense fallback={<PageLoader />}>
            <Communications />
          </React.Suspense>
        } />
        <Route path="messages" element={
          <React.Suspense fallback={<PageLoader />}>
            <MessagesInbox />
          </React.Suspense>
        } />
        <Route path="messages/:threadId" element={
          <React.Suspense fallback={<PageLoader />}>
            <MessageThreadPage />
          </React.Suspense>
        } />
        <Route path="messages/search" element={
          <React.Suspense fallback={<PageLoader />}>
            <MessagesSearch />
          </React.Suspense>
        } />
        <Route path="suggestions" element={
          <React.Suspense fallback={<PageLoader />}>
            <Suggestions />
          </React.Suspense>
        } />
        <Route path="news" element={<NewsBoard />} />
        <Route path="power-tools" element={
          <React.Suspense fallback={<PageLoader />}>
            <PowerTools />
          </React.Suspense>
        } />
        <Route path="ai-tools" element={
          <React.Suspense fallback={<PageLoader />}>
            <AITools />
          </React.Suspense>
        } />
        <Route path="tasks" element={
          <React.Suspense fallback={<PageLoader />}>
            <Tasks />
          </React.Suspense>
        } />
        <Route path="analytics" element={
          <React.Suspense fallback={<PageLoader />}>
            <AnalyticsInsights />
          </React.Suspense>
        } />
        <Route path="sla-policies" element={
          <React.Suspense fallback={<PageLoader />}>
            {/* Eager import to keep simple */}
            <SLAPolicyManager />
          </React.Suspense>
        } />
        <Route path="escalation-matrix" element={
          <React.Suspense fallback={<PageLoader />}>
            <EscalationMatrixEditor />
          </React.Suspense>
        } />
        <Route path="escalation-logs" element={
          <React.Suspense fallback={<PageLoader />}>
            <EscalationLogsTable />
          </React.Suspense>
        } />
        <Route path="escalation-logs/:requestId" element={
          <React.Suspense fallback={<PageLoader />}>
            <EscalationRequestView />
          </React.Suspense>
        } />
        <Route path="escalation-export" element={
          <React.Suspense fallback={<PageLoader />}>
            <ComplianceExportPage />
          </React.Suspense>
        } />
        <Route path="reports" element={
          <React.Suspense fallback={<PageLoader />}>
            <Reports />
          </React.Suspense>
        } />
        <Route path="reports/payments" element={
          <React.Suspense fallback={<PageLoader />}>
            <PaymentReportingDashboard />
          </React.Suspense>
        } />
        <Route path="notifications" element={
          <React.Suspense fallback={<PageLoader />}>
            <Notifications />
          </React.Suspense>
        } />
        <Route path="admin/payments" element={
          <React.Suspense fallback={<PageLoader />}>
            <AdminPayments />
          </React.Suspense>
        } />
        <Route path="admin/autopay" element={
          <React.Suspense fallback={<PageLoader />}>
            <AutoPayOversight />
          </React.Suspense>
        } />
        <Route path="admin/refunds" element={
          <React.Suspense fallback={<PageLoader />}>
            <RefundDashboard />
          </React.Suspense>
        } />
        <Route path="admin/latefee-rules" element={
          <React.Suspense fallback={<PageLoader />}>
            <LateFeeRulesDashboard />
          </React.Suspense>
        } />
        <Route path="admin/accounting" element={
          <React.Suspense fallback={<PageLoader />}>
            <AccountingSettings />
          </React.Suspense>
        } />
        <Route path="documents" element={
          <React.Suspense fallback={<PageLoader />}>
            <Documents />
          </React.Suspense>
        } />
        <Route path="email-marketing" element={
          <React.Suspense fallback={<PageLoader />}>
            <EmailMarketing />
          </React.Suspense>
        } />
        <Route path="email-management" element={
          <React.Suspense fallback={<PageLoader />}>
            <EmailManagement />
          </React.Suspense>
        } />
        <Route path="sms-marketing" element={
          <React.Suspense fallback={<PageLoader />}>
            <SmsMarketing />
          </React.Suspense>
        } />
        <Route path="templates" element={
          <React.Suspense fallback={<PageLoader />}>
            <Templates />
          </React.Suspense>
        } />
        <Route path="landing-pages" element={
          <React.Suspense fallback={<PageLoader />}>
            <PropertyLandingPages />
          </React.Suspense>
        } />
        <Route path="promotions" element={
          <React.Suspense fallback={<PageLoader />}>
            <Promotions />
          </React.Suspense>
        } />
        <Route path="integrations" element={
          <React.Suspense fallback={<PageLoader />}>
            <IntegrationManagement />
          </React.Suspense>
        } />
        <Route path="gateways" element={
          <React.Suspense fallback={<PageLoader />}>
            <GatewayManagement />
          </React.Suspense>
        } />
        <Route path="real-estate-platforms" element={
          <React.Suspense fallback={<PageLoader />}>
            <RealEstatePlatformIntegrations />
          </React.Suspense>
        } />
        <Route path="platform-pricing" element={
          <React.Suspense fallback={<PageLoader />}>
            <PlatformPricingManagement />
          </React.Suspense>
        } />
        <Route path="platform-authentication" element={
          <React.Suspense fallback={<PageLoader />}>
            <PlatformAuthenticationManagement />
          </React.Suspense>
        } />
        <Route path="backup" element={
          <React.Suspense fallback={<PageLoader />}>
            <BackupManagement />
          </React.Suspense>
        } />
        <Route path="bank-account-settings" element={
          <React.Suspense fallback={<PageLoader />}>
            <BankAccountSettings />
          </React.Suspense>
        } />
        <Route path="automation" element={
          <React.Suspense fallback={<PageLoader />}>
            <MarketingAutomation />
          </React.Suspense>
        } />
        <Route path="user-roles" element={
          <React.Suspense fallback={<PageLoader />}>
            <UserRoles />
          </React.Suspense>
        } />
        <Route path="marketplace" element={
          <React.Suspense fallback={<PageLoader />}>
            <Marketplace />
          </React.Suspense>
        } />
        <Route path="settings" element={
          <React.Suspense fallback={<PageLoader />}>
            <Settings />
          </React.Suspense>
        } />
        <Route path="subscriptions" element={
          <React.Suspense fallback={<PageLoader />}>
            <SubscriptionManagement />
          </React.Suspense>
        } />
        <Route path="super-admin" element={<React.Suspense fallback={<PageLoader />}><SuperAdminLayout /></React.Suspense>}>
          <Route index element={<React.Suspense fallback={<PageLoader />}><SuperAdminOverview /></React.Suspense>} />
          <Route path="overview" element={<React.Suspense fallback={<PageLoader />}><SuperAdminOverview /></React.Suspense>} />
          <Route path="subscribers" element={<React.Suspense fallback={<PageLoader />}><SuperAdminSubscribers /></React.Suspense>} />
          <Route path="impersonate" element={<React.Suspense fallback={<PageLoader />}><SuperAdminImpersonate /></React.Suspense>} />
          <Route path="compliance" element={<React.Suspense fallback={<PageLoader />}><SuperAdminCompliance /></React.Suspense>} />
          <Route path="analytics" element={<React.Suspense fallback={<PageLoader />}><SuperAdminAnalytics /></React.Suspense>} />
          <Route path="notifications" element={<React.Suspense fallback={<PageLoader />}><SuperAdminNotifications /></React.Suspense>} />
          <Route path="payment-policies">
            <Route path="global" element={<React.Suspense fallback={<PageLoader />}><SUPaymentPoliciesGlobal /></React.Suspense>} />
            <Route path="property" element={<React.Suspense fallback={<PageLoader />}><SUPaymentPoliciesProperty /></React.Suspense>} />
            <Route path="lease" element={<React.Suspense fallback={<PageLoader />}><SUPaymentPoliciesLease /></React.Suspense>} />
            <Route path="matrix" element={<React.Suspense fallback={<PageLoader />}><SUPaymentPoliciesMatrix /></React.Suspense>} />
          </Route>
          <Route path="accounting-integrations" element={<React.Suspense fallback={<PageLoader />}><SUAccountingIntegrations /></React.Suspense>} />
          <Route path="accounting-integrations/:provider/logs" element={<React.Suspense fallback={<PageLoader />}><SUAccountingIntegrationLogs /></React.Suspense>} />
          <Route path="accounting-sync-logs" element={<React.Suspense fallback={<PageLoader />}><SUAccountingSyncLogs /></React.Suspense>} />
        </Route>
        <Route path="help" element={
          <React.Suspense fallback={<PageLoader />}>
            <HelpSupport />
          </React.Suspense>
        } />
        <Route path="profile" element={
          <React.Suspense fallback={<PageLoader />}>
            <Profile />
          </React.Suspense>
        } />
      </Route>
      <Route path="/" element={
        isAuthenticated ? (
          <Navigate to="/crm" replace />
        ) : (
          <CrmLogin />
        )
      } />
      {/* Redirect common paths to CRM equivalents */}
      <Route path="/profile" element={<Navigate to="/crm/profile" replace />} />
      <Route path="/settings" element={<Navigate to="/crm/settings" replace />} />
      <Route path="/properties" element={<Navigate to="/crm/properties" replace />} />
      <Route path="/tenants" element={<Navigate to="/crm/tenants" replace />} />
      <Route path="/contacts" element={<Navigate to="/crm/contacts" replace />} />
      <Route path="/tasks" element={<Navigate to="/crm/tasks" replace />} />
      <Route path="/reports" element={<Navigate to="/crm/reports" replace />} />
      <Route path="/su/payment-policies/matrix" element={<React.Suspense fallback={<PageLoader />}><SUPolicyMatrixStandalone /></React.Suspense>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import ImpersonationBanner from './components/ImpersonationBanner';

=======
>>>>>>> main
export default function App() {
  return (
    <AppTheme>
      <LocaleProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public login */}
              <Route path="/login" element={<CrmLogin />} />
              <Route path="/vendor-login" element={<VendorLogin />} />

              {/* Tenant portal */}
              <Route
                path="/tenant/*"
                element={
                  <ProtectedRoute allowedRoles={["tenant"]}>
                    <TenantDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<TenantDashboard />} />
                <Route path="payments" element={<TenantPayments />} />
                <Route path="payment-methods" element={<PaymentMethodsPage />} />
                <Route path="payments/new" element={<NewPaymentPage />} />
                <Route path="checkout" element={<TenantCheckoutPage />} />
                <Route path="maintenance" element={<TenantMaintenance />} />
                <Route path="lease" element={<TenantLease />} />
                <Route path="autopay" element={<TenantAutopay />} />
                <Route path="autopay/setup" element={<AutoPaySetupPage />} />
                <Route path="refunds" element={<TenantRefundHistoryPage />} />
                <Route path="portal" element={<TenantPortal />} />
                <Route path="settings" element={<TenantSettings />} />
              </Route>

              {/* Owner portal */}
              <Route
                path="/owner/*"
                element={
                  <ProtectedRoute allowedRoles={["owner"]}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="statements" element={<OwnerStatements />} />
                <Route path="properties" element={<OwnerProperties />} />
                <Route path="ledger" element={<OwnerLedgerPage />} />
                <Route path="settings" element={<OwnerSettings />} />
              </Route>

              {/* Vendor portal */}
              <Route
                path="/vendor/*"
                element={
                  <ProtectedRoute allowedRoles={["vendor"]}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="work-orders" element={<VendorWorkOrders />} />
                <Route path="profile" element={<VendorProfile />} />
                <Route path="settings" element={<VendorSettings />} />
              </Route>

              {/* Manager portal */}
              <Route
                path="/manager/*"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="tenants" element={<ManagerTenants />} />
                <Route path="owners" element={<ManagerOwners />} />
                <Route path="maintenance" element={<ManagerMaintenance />} />
                <Route path="settings" element={<ManagerSettings />} />
              </Route>

              {/* Admin portal */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="users" element={<AdminUsers />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Super Admin portal */}
              <Route
                path="/superadmin/*"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <SuperAdminDashboardPage />
                  </ProtectedRoute>
                }
              >
                <Route path="accounting-integrations" element={<SUAccountingIntegrations />} />
                <Route
                  path="accounting-integrations/:provider/logs"
                  element={<SUAccountingIntegrationLogs />}
                />
                <Route path="accounting-sync-logs" element={<SUAccountingSyncLogs />} />
                <Route path="overview" element={<SuperAdminOverview />} />
                <Route path="subscribers" element={<SuperAdminSubscribers />} />
                <Route path="impersonate" element={<SuperAdminImpersonate />} />
                <Route path="compliance" element={<SuperAdminCompliance />} />
                <Route path="analytics" element={<SuperAdminAnalytics />} />
                <Route path="notifications" element={<SuperAdminNotifications />} />
                <Route path="settings" element={<SuperAdminSettings />} />
              </Route>

              {/* CRM core */}
              <Route
                path="/crm/*"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
                    <CrmDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="calendar" element={<Calendar />} />
                <Route path="contacts" element={<ContactManagement />} />
                <Route path="sales" element={<SalesAutomation />} />
                <Route path="marketing" element={<MarketingAutomation />} />
                <Route path="properties" element={<Properties />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="analytics" element={<AnalyticsInsights />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocaleProvider>
    </AppTheme>
  );
}
