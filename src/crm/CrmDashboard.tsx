import * as React from "react";
import { Outlet, Routes, Route } from "react-router-dom";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CrmAppNavbar from "./components/CrmAppNavbar";
import CrmHeader from "./components/CrmHeader";
import CrmSideMenu from "./components/CrmSideMenu";
import CrmMainDashboard from "./components/CrmMainDashboard";
import Calendar from "./pages/Calendar";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import PropertyManagers from "./pages/PropertyManagers";
import ServiceProviders from "./pages/ServiceProviders";
import PowerDialer from "./pages/PowerDialer";
import Communications from "./pages/Communications";
import EmailMarketing from "./pages/EmailMarketing";
import SmsMarketing from "./pages/SmsMarketing";
import Templates from "./pages/Templates";
import WorkOrders from "./pages/WorkOrders";
import UserRoles from "./pages/UserRoles";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import PropertyLandingPages from "./pages/PropertyLandingPages";
import Promotions from "./pages/Promotions";
import Prospects from "./pages/Prospects";
import Applications from "./pages/Applications";
import Marketplace from "./pages/Marketplace";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import PowerTools from "./pages/PowerTools";
import AITools from "./pages/AITools";
import NewsBoard from "./pages/NewsBoard";
import SuperAdminApp from "./SuperAdminApp";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { ActivityTrackingProvider } from "./contexts/ActivityTrackingContext";
import { ModeProvider } from "./contexts/ModeContext";
import { CrmDataProvider } from "./contexts/CrmDataContext";
import CrmErrorBoundary from "./components/CrmErrorBoundary";
import ModeAwareContent from "./components/ModeAwareContent";
import GlobalAIAssistant from "./components/GlobalAIAssistant";
import { useLocation } from "react-router-dom";

export default function CrmDashboard() {
  const location = useLocation();

  // Extract page name from pathname
  const getCurrentPageName = (pathname: string): string => {
    const pathMap: Record<string, string> = {
      '/': 'Dashboard',
      '/calendar': 'Calendar',
      '/contacts': 'Contacts',
      '/sales': 'Sales',
      '/marketing': 'Marketing',
      '/properties': 'Properties',
      '/tenants': 'Tenants',
      '/managers': 'Property Managers',
      '/service-providers': 'Service Providers',
      '/customer-service': 'Customer Service',
      '/communications': 'Communications',
      '/work-orders': 'Work Orders',
      '/tasks': 'Tasks',
      '/analytics': 'Analytics',
      '/reports': 'Reports',
      '/ai-tools': 'AI Tools',
      '/news': 'News Board',
      '/email-marketing': 'Email Marketing',
      '/sms-marketing': 'SMS Marketing',
      '/templates': 'Templates',
      '/landing-pages': 'Landing Pages',
      '/promotions': 'Promotions',
      '/prospects': 'Prospects',
      '/applications': 'Applications',
      '/settings': 'Settings',
      '/profile': 'Profile'
    };

    return pathMap[pathname] || 'CRM';
  };

  const currentPage = getCurrentPageName(location.pathname);

  return (
    <CrmErrorBoundary>
      <CrmDataProvider>
        <AuthProvider>
          <SearchProvider>
            <NotificationsProvider>
              <ActivityTrackingProvider>
                <ModeProvider>
                <Box sx={{ display: "flex", height: "100vh" }}>
          <CrmSideMenu />
          <CrmAppNavbar />
          {/* Main content */}
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: "auto",
            })}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 0 },
              }}
            >
              <CrmHeader />
              <ModeAwareContent />
            </Stack>
          </Box>
                </Box>

                {/* Global AI Assistant - Available on every page - TEMPORARILY DISABLED FOR DEBUGGING */}
                {/* <GlobalAIAssistant currentPage={currentPage} /> */}
                </ModeProvider>
              </ActivityTrackingProvider>
            </NotificationsProvider>
          </SearchProvider>
        </AuthProvider>
      </CrmDataProvider>
    </CrmErrorBoundary>
  );
}
