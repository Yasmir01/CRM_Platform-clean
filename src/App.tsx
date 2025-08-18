import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AppTheme from "./shared-theme/AppTheme";
import CrmDashboard from "./crm/CrmDashboard";
import CrmLogin from "./crm/pages/CrmLogin";
import { AuthProvider, useAuth } from "./crm/contexts/AuthContext";
// Import CRM components
import CrmMainDashboard from "./crm/components/CrmMainDashboard";
import Calendar from "./crm/pages/Calendar";
import Properties from "./crm/pages/Properties";
import Tenants from "./crm/pages/Tenants";
import PropertyManagers from "./crm/pages/PropertyManagers";
import ContactManagement from "./crm/pages/ContactManagement";
import SalesAutomation from "./crm/pages/SalesAutomation";
import Templates from "./crm/pages/Templates";
import Settings from "./crm/pages/Settings";
import Reports from "./crm/pages/Reports";
import WorkOrders from "./crm/pages/WorkOrders";
import Applications from "./crm/pages/Applications";
import Prospects from "./crm/pages/Prospects";
import ServiceProviders from "./crm/pages/ServiceProviders";
import Communications from "./crm/pages/Communications";
import EmailMarketing from "./crm/pages/EmailMarketing";
import SmsMarketing from "./crm/pages/SmsMarketing";
import PropertyLandingPages from "./crm/pages/PropertyLandingPages";
import Promotions from "./crm/pages/Promotions";
import Marketplace from "./crm/pages/Marketplace";
import UserRoles from "./crm/pages/UserRoles";
import HelpSupport from "./crm/pages/HelpSupport";
import Tasks from "./crm/pages/Tasks";
import Profile from "./crm/pages/Profile";
import NewsBoard from "./crm/pages/NewsBoard";
import PowerTools from "./crm/pages/PowerTools";
import AITools from "./crm/pages/AITools";
import RentCollection from "./crm/pages/RentCollection";
import CustomerService from "./crm/pages/CustomerService";
import AnalyticsInsights from "./crm/pages/AnalyticsInsights";
import MarketingAutomation from "./crm/pages/MarketingAutomation";
import IntegrationManagement from "./crm/pages/IntegrationManagement";

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
        <Route path="managers" element={<PropertyManagers />} />
        <Route path="service-providers" element={<ServiceProviders />} />
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
