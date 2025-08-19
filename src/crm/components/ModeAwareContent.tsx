import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import TenantView from './TenantView';
import CrmMainDashboard from './CrmMainDashboard';
import Calendar from '../pages/Calendar';
import Properties from '../pages/Properties';
import Tenants from '../pages/Tenants';
import PropertyManagers from '../pages/PropertyManagers';
import ServiceProviders from '../pages/ServiceProviders';
import PowerDialer from '../pages/PowerDialer';
import Communications from '../pages/Communications';
import EmailMarketing from '../pages/EmailMarketing';
import SmsMarketing from '../pages/SmsMarketing';
import Templates from '../pages/Templates';
import WorkOrders from '../pages/WorkOrders';
import UserRoles from '../pages/UserRoles';
import Tasks from '../pages/Tasks';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import HelpSupport from '../pages/HelpSupport';
import PropertyLandingPages from '../pages/PropertyLandingPages';
import Promotions from '../pages/Promotions';
import Prospects from '../pages/Prospects';
import Applications from '../pages/Applications';
import RentalApplicationForm from '../pages/RentalApplicationForm';
import Marketplace from '../pages/Marketplace';
import Profile from '../pages/Profile';
import AccountSettings from '../pages/AccountSettings';
import SubscriptionManagement from '../pages/SubscriptionManagement';
import PowerTools from '../pages/PowerTools';
import AITools from '../pages/AITools';
import NewsBoard from '../pages/NewsBoard';
import RentCollection from '../pages/RentCollection';
import SuperAdminApp from '../SuperAdminApp';
import ContactManagement from '../pages/ContactManagement';
import SalesAutomation from '../pages/SalesAutomation';
import MarketingAutomation from '../pages/MarketingAutomation';
import AnalyticsInsights from '../pages/AnalyticsInsights';
import IntegrationManagement from '../pages/IntegrationManagement';
import CustomerService from '../pages/CustomerService';
import BackupManagement from './BackupManagement';
import { Alert, Box, Button } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

export default function ModeAwareContent() {
  const { isTenantMode, isManagementMode, toggleMode } = useMode();

  // In tenant mode, show simplified tenant interface with limited routes
  if (isTenantMode) {
    return (
      <Routes>
        <Route index element={<TenantView />} />
        {/* Limited tenant routes */}
        <Route path="work-orders" element={
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Tenant Mode:</strong> Simplified work orders view (would show tenant-specific work orders only)
            </Alert>
            <WorkOrders />
          </Box>
        } />
        <Route path="communications" element={
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Tenant Mode:</strong> Limited to tenant-management communications only
            </Alert>
            <Communications />
          </Box>
        } />
        <Route path="news" element={<NewsBoard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Tenant Mode:</strong> Tenant-specific settings only (notifications, payment preferences, etc.)
            </Alert>
            <Settings />
          </Box>
        } />
        {/* Fallback for other routes in tenant mode */}
        <Route path="*" element={
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              This feature is not available in Tenant Mode. Tenants have access to a simplified interface with essential features only.
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<BusinessRoundedIcon />}
              onClick={toggleMode}
            >
              Switch to Management Mode
            </Button>
          </Box>
        } />
      </Routes>
    );
  }

  // In management mode, show full CRM interface
  return (
    <Routes>
      <Route index element={<CrmMainDashboard />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="contacts" element={<ContactManagement />} />
      <Route path="sales" element={<SalesAutomation />} />
      <Route path="marketing" element={<MarketingAutomation />} />
      <Route path="properties" element={<Properties />} />
      <Route path="tenants" element={<Tenants />} />
      <Route path="managers" element={<PropertyManagers />} />
      <Route path="service-providers" element={<ServiceProviders />} />
      <Route path="customer-service" element={<CustomerService />} />
      <Route path="integrations" element={<IntegrationManagement />} />
      <Route path="backup" element={<BackupManagement />} />
      <Route path="communications" element={<Communications />} />
      <Route path="power-tools" element={<PowerTools />} />
      <Route path="ai-tools" element={<AITools />} />
      <Route path="news" element={<NewsBoard />} />
      <Route path="email-marketing" element={<EmailMarketing />} />
      <Route path="sms-marketing" element={<SmsMarketing />} />
      <Route path="templates" element={<Templates />} />
      <Route path="work-orders" element={<WorkOrders />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="analytics" element={<AnalyticsInsights />} />
      <Route path="reports" element={<Reports />} />
      <Route path="rent-collection" element={<RentCollection />} />
      <Route path="user-roles" element={<UserRoles />} />
      <Route path="settings" element={<Settings />} />
      <Route path="help" element={<HelpSupport />} />
      <Route path="landing-pages" element={<PropertyLandingPages />} />
      <Route path="promotions" element={<Promotions />} />
      <Route path="prospects" element={<Prospects />} />
      <Route path="applications" element={<Applications />} />
      <Route path="applications/apply" element={<RentalApplicationForm />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="profile" element={<Profile />} />
      <Route path="account-settings" element={<AccountSettings />} />
      <Route path="subscriptions" element={<SubscriptionManagement />} />
      <Route path="super-admin" element={<SuperAdminApp />} />
    </Routes>
  );
}
