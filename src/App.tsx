import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AppTheme from "./shared-theme/AppTheme";
import CrmDashboard from "./crm/CrmDashboard";
import SuperAdminApp from "./crm/SuperAdminApp";
import CrmLogin from "./crm/pages/CrmLogin";
import { AuthProvider, useAuth } from "./crm/contexts/AuthContext";
// Test the new authentication system
import './crm/utils/authTest';

// Lazy load CRM components for better performance
import CrmMainDashboard from "./crm/components/CrmMainDashboard";
// const CrmMainDashboard = React.lazy(() => import("./crm/components/CrmMainDashboard"));
const Calendar = React.lazy(() => import("./crm/pages/Calendar"));
const Properties = React.lazy(() => import("./crm/pages/Properties"));
const Tenants = React.lazy(() => import("./crm/pages/Tenants"));
const PropertyManagers = React.lazy(() => import("./crm/pages/PropertyManagers"));
const ContactManagement = React.lazy(() => import("./crm/pages/ContactManagement"));
const SalesAutomation = React.lazy(() => import("./crm/pages/SalesAutomation"));
const Templates = React.lazy(() => import("./crm/pages/Templates"));
const Settings = React.lazy(() => import("./crm/pages/Settings"));
const Reports = React.lazy(() => import("./crm/pages/Reports"));
const WorkOrders = React.lazy(() => import("./crm/pages/WorkOrders"));
const Applications = React.lazy(() => import("./crm/pages/Applications"));
const RentalApplicationForm = React.lazy(() => import("./crm/pages/RentalApplicationForm"));
const Prospects = React.lazy(() => import("./crm/pages/Prospects"));
const ServiceProviders = React.lazy(() => import("./crm/pages/ServiceProviders"));
const Communications = React.lazy(() => import("./crm/pages/Communications"));
const EmailMarketing = React.lazy(() => import("./crm/pages/EmailMarketing"));
const EmailManagement = React.lazy(() => import("./crm/components/EmailManagement"));
const SmsMarketing = React.lazy(() => import("./crm/pages/SmsMarketing"));
const PropertyLandingPages = React.lazy(() => import("./crm/pages/PropertyLandingPages"));
const Promotions = React.lazy(() => import("./crm/pages/Promotions"));
const Marketplace = React.lazy(() => import("./crm/pages/Marketplace"));
const UserRoles = React.lazy(() => import("./crm/pages/UserRoles"));
const HelpSupport = React.lazy(() => import("./crm/pages/HelpSupport"));
const Tasks = React.lazy(() => import("./crm/pages/Tasks"));
const Profile = React.lazy(() => import("./crm/pages/Profile"));
const NewsBoard = React.lazy(() => import("./crm/pages/NewsBoard"));
const PowerTools = React.lazy(() => import("./crm/pages/PowerTools"));
const AITools = React.lazy(() => import("./crm/pages/AITools"));
const RentCollection = React.lazy(() => import("./crm/pages/RentCollection"));
const CustomerService = React.lazy(() => import("./crm/pages/CustomerService"));
const AnalyticsInsights = React.lazy(() => import("./crm/pages/AnalyticsInsights"));
const MarketingAutomation = React.lazy(() => import("./crm/pages/MarketingAutomation"));
const IntegrationManagement = React.lazy(() => import("./crm/pages/IntegrationManagement"));
const RealEstatePlatformIntegrations = React.lazy(() => import("./crm/pages/RealEstatePlatformIntegrations"));
const PlatformPricingManagement = React.lazy(() => import("./crm/pages/PlatformPricingManagement"));
const PlatformAuthenticationManagement = React.lazy(() => import("./crm/pages/PlatformAuthenticationManagement"));
const BackupManagement = React.lazy(() => import("./crm/components/BackupManagement"));
const BankAccountSettings = React.lazy(() => import("./crm/pages/BankAccountSettings"));
const SubscriptionManagement = React.lazy(() => import("./crm/pages/SubscriptionManagement"));
const Suggestions = React.lazy(() => import("./crm/pages/Suggestions"));

// Loading component
function PageLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
        flexDirection: "column",
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
}

function NotFound() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        p: 3
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom color="error">
        404: Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Try these CRM pages instead:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
        <Button variant="outlined" href="/crm">Dashboard</Button>
        <Button variant="outlined" href="/crm/properties">Properties</Button>
        <Button variant="outlined" href="/crm/tenants">Tenants</Button>
        <Button variant="outlined" href="/crm/contacts">Contacts</Button>
        <Button variant="outlined" href="/crm/sales">Sales</Button>
        <Button variant="outlined" href="/crm/suggestions">Suggestions</Button>
        <Button variant="outlined" href="/crm/email-management">Email Management</Button>
        <Button variant="outlined" href="/crm/settings">Settings</Button>
        <Button variant="outlined" href="/crm/tasks">Tasks</Button>
        <Button variant="outlined" href="/crm/reports">Reports</Button>
      </Box>
    </Box>
  );
}

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
        <Route path="work-orders" element={
          <React.Suspense fallback={<PageLoader />}>
            <WorkOrders />
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
        <Route path="suggestions" element={
          <React.Suspense fallback={<PageLoader />}>
            <Suggestions />
          </React.Suspense>
        } />
        <Route path="news" element={
          <React.Suspense fallback={<PageLoader />}>
            <NewsBoard />
          </React.Suspense>
        } />
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
        <Route path="reports" element={
          <React.Suspense fallback={<PageLoader />}>
            <Reports />
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
        <Route path="super-admin" element={<SuperAdminApp />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </AppTheme>
  );
}
