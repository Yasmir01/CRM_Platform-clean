import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AppTheme from "./shared-theme/AppTheme";
import CrmDashboard from "./crm/CrmDashboard";
import CrmLogin from "./crm/pages/CrmLogin";
import { AuthProvider, useAuth } from "./crm/contexts/AuthContext";

// Lazy load CRM components for better performance
const CrmMainDashboard = React.lazy(() => import("./crm/components/CrmMainDashboard"));
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
const BackupManagement = React.lazy(() => import("./crm/components/BackupManagement"));

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
      <Route path="/crm" element={
        <ProtectedRoute>
          <CrmDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<CrmMainDashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="contacts" element={<ContactManagement />} />
        <Route path="sales" element={<SalesAutomation />} />
        <Route path="marketing" element={<MarketingAutomation />} />
        <Route path="properties" element={<Properties />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="prospects" element={<Prospects />} />
        <Route path="applications" element={<Applications />} />
        <Route path="applications/apply" element={<RentalApplicationForm />} />
        <Route path="managers" element={<PropertyManagers />} />
        <Route path="service-providers" element={<ServiceProviders />} />
        <Route path="rent-collection" element={<RentCollection />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="customer-service" element={<CustomerService />} />
        <Route path="communications" element={<Communications />} />
        <Route path="news" element={<NewsBoard />} />
        <Route path="power-tools" element={<PowerTools />} />
        <Route path="ai-tools" element={<AITools />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<AnalyticsInsights />} />
        <Route path="reports" element={<Reports />} />
        <Route path="email-marketing" element={<EmailMarketing />} />
        <Route path="sms-marketing" element={<SmsMarketing />} />
        <Route path="templates" element={<Templates />} />
        <Route path="landing-pages" element={<PropertyLandingPages />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="integrations" element={<IntegrationManagement />} />
        <Route path="backup" element={<BackupManagement />} />
        <Route path="automation" element={<MarketingAutomation />} />
        <Route path="user-roles" element={<UserRoles />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<HelpSupport />} />
        <Route path="profile" element={<Profile />} />
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
