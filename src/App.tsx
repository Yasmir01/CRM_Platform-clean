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
