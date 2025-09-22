import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box"; // Added the missing import
import { useMode } from "../contexts/ModeContext";
import { LocalStorageService } from "../services/LocalStorageService";
import { suggestionService } from "../services/SuggestionService";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import ContactsRoundedIcon from "@mui/icons-material/ContactsRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AnnouncementRoundedIcon from "@mui/icons-material/AnnouncementRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import BackupRoundedIcon from "@mui/icons-material/BackupRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import { useRoleManagement } from "../hooks/useRoleManagement";
import { useAuth } from "../contexts/AuthContext";
import { useServiceProviderScope } from "../hooks/useServiceProviderScope";

export const mainListItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/crm" },
  { text: "Calendar", icon: <CalendarTodayRoundedIcon />, path: "/crm/calendar" },
  { text: "Contact Management", icon: <GroupRoundedIcon />, path: "/crm/contacts" },
  { text: "Companies", icon: <BusinessCenterRoundedIcon />, path: "/crm/companies" },

  // Properties group with nested entries
  {
    text: "Properties",
    icon: <HomeWorkRoundedIcon />,
    path: "/crm/properties",
    children: [
      { text: "Units", icon: <StorefrontRoundedIcon />, path: "/crm/units" },
      { text: "Leases", icon: <ViewKanbanRoundedIcon />, path: "/crm/leases" },
      { text: "Tenants", icon: <PersonRoundedIcon />, path: "/crm/tenants" },
    ],
  },

  // Leasing group
  {
    text: "Leasing",
    icon: <DescriptionIcon />,
    path: "/crm/leasing",
    children: [
      { text: "Prospects", icon: <ContactsRoundedIcon />, path: "/crm/prospects" },
      { text: "Applications", icon: <DescriptionIcon />, path: "/crm/applications", badge: true },
      { text: "Leasing Funnel", icon: <ViewKanbanRoundedIcon />, path: "/crm/leasing-funnel" },
    ],
  },

  { text: "Maintenance", icon: <BuildRoundedIcon />, path: "/crm/maintenance" },
  { text: "Accounting", icon: <AccountBalanceRoundedIcon />, path: "/crm/accounting", requiredPlan: 'pro' },
  { text: "Rent Collection", icon: <PaymentRoundedIcon />, path: "/crm/rent-collection" },
  { text: "Reports", icon: <AssessmentRoundedIcon />, path: "/crm/reports", requiredPlan: 'pro' },

  // Admin & Tools group
  {
    text: "Admin & Tools",
    icon: <AdminPanelSettingsRoundedIcon />,
    path: "/crm/admin",
    children: [
      { text: "Tickets", icon: <SupportAgentRoundedIcon />, path: "/tickets" },
      { text: "Communications", icon: <ForumRoundedIcon />, path: "/crm/communications", badge: true },
      { text: "Tasks", icon: <AssignmentRoundedIcon />, path: "/crm/tasks", badge: true },
      { text: "Analytics & Insights", icon: <AnalyticsRoundedIcon />, path: "/crm/analytics", requiredPlan: 'pro' },
      { text: "AI Tools", icon: <SmartToyRoundedIcon />, path: "/crm/ai-tools", requiredPlan: 'enterprise' },
      { text: "Integrations", icon: <IntegrationInstructionsRoundedIcon />, path: "/crm/integrations", requiredPlan: 'pro' },
      { text: "Email Management", icon: <EmailRoundedIcon />, path: "/crm/email-management", requiredPlan: 'pro' },
      { text: "Backup & Restore", icon: <BackupRoundedIcon />, path: "/crm/backup", requiredPlan: 'pro' },
      { text: "User Roles", icon: <SecurityRoundedIcon />, path: "/crm/user-roles" },
      { text: "Marketplace", icon: <StorefrontRoundedIcon />, path: "/crm/marketplace", requiredPlan: 'enterprise' },
      { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
      { text: "Super Admin", icon: <GavelRoundedIcon />, path: "/crm/super-admin" },
    ],
  },

  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
];

const marketingListItems = [
  // All marketing features now consolidated into Marketing Automation
  // Landing Pages and Promotions integrated into the main Marketing Automation hub
];

export const secondaryListItems = [
  { text: "Integrations", icon: <IntegrationInstructionsRoundedIcon />, path: "/crm/integrations" },
  { text: "Email Management", icon: <EmailRoundedIcon />, path: "/crm/email-management" },
  { text: "Backup & Restore", icon: <BackupRoundedIcon />, path: "/crm/backup" },
  { text: "User Roles", icon: <SecurityRoundedIcon />, path: "/crm/user-roles" },
  { text: "Marketplace", icon: <StorefrontRoundedIcon />, path: "/crm/marketplace" },
  { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
];

// Tenant-specific secondary items (no user roles or marketplace)
export const tenantSecondaryItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
  { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
];

// Tenant-specific menu items (simplified interface)
export const tenantMenuItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/crm" },
  { text: "News & Announcements", icon: <AnnouncementRoundedIcon />, path: "/crm/news" },
  { text: "Work Orders", icon: <BuildRoundedIcon />, path: "/crm/work-orders" },
  { text: "Communications", icon: <ForumRoundedIcon />, path: "/crm/communications", badge: true },
  { text: "Suggestions", icon: <LightbulbRoundedIcon />, path: "/crm/suggestions", badge: true },
  { text: "Profile", icon: <PersonRoundedIcon />, path: "/crm/profile" },
];

export const serviceProviderMenuItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/crm" },
  { text: "Work Orders", icon: <BuildRoundedIcon />, path: "/crm/work-orders" },
  { text: "Calendar", icon: <CalendarTodayRoundedIcon />, path: "/crm/calendar" },
  { text: "Properties", icon: <HomeWorkRoundedIcon />, path: "/crm/properties" },
  { text: "Communications", icon: <ForumRoundedIcon />, path: "/crm/communications", badge: true },
];

class IconErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.warn('Icon render error', err); }
  render() {
    if (this.state.hasError) return <span aria-hidden="true" style={{ display: 'inline-block', width: 20 }} />;
    return this.props.children as any;
  }
}

export default function CrmMenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTenantMode, isManagementMode } = useMode();
  const { isSuperAdmin } = useRoleManagement();
  const { user } = useAuth();
  const { filterWorkOrders } = useServiceProviderScope();

  // Role flags (normalize common role names)
  const roleRaw = (user?.role || '').toString();
  const roleLower = roleRaw.toLowerCase();
  const isTenantUser = /tenant/i.test(roleLower);
  const isVendorUser = /vendor|service provider/i.test(roleLower);
  const isLandlordUser = /landlord/i.test(roleLower);
  const isPropertyManagerUser = /property[_ ]?manager/i.test(roleLower) || /manager/i.test(roleLower);
  const isAdminUser = isSuperAdmin() || /^(su|sa|super_admin|admin)$/i.test(roleRaw);

  // Get actual new applications count from localStorage
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [newTasksCount, setNewTasksCount] = useState(0);
  const [newSuggestionsCount, setNewSuggestionsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const [assignedPropsCount, setAssignedPropsCount] = useState(0);

  const recomputeAssignedPropsCount = useCallback(() => {
    try {
      const workOrders = LocalStorageService.getWorkOrders();
      const filtered = filterWorkOrders(workOrders || []);
      const active = (filtered || []).filter((wo: any) => ['Open', 'Assigned', 'In Progress'].includes(wo.status));
      const props = new Set(active.map((wo: any) => wo.propertyId).filter(Boolean));
      setAssignedPropsCount(props.size);
    } catch (_) {
      setAssignedPropsCount(0);
    }
  }, [filterWorkOrders]);

  useEffect(() => {
    const updateApplicationCount = () => {
      const applications = LocalStorageService.getApplications();
      const newAppsCount = applications.filter((app: any) => app.status === 'New').length;
      setNewApplicationsCount(newAppsCount);
    };

    const updateTaskCount = () => {
      // Get tasks that are new or pending in the last 24 hours
      const crmData = LocalStorageService.loadAllData();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let newTasksCount = 0;

      // Count tasks from work orders
      if (crmData.workOrders) {
        crmData.workOrders.forEach((workOrder: any) => {
          const createdDate = new Date(workOrder.createdAt || workOrder.dateCreated || now);
          if (createdDate >= oneDayAgo && (workOrder.status === 'Open' || workOrder.status === 'In Progress')) {
            newTasksCount++;
          }
        });
      }

      // Count lease renewal tasks
      if (crmData.tenants) {
        crmData.tenants.forEach((tenant: any) => {
          if (tenant.leaseEndDate) {
            const leaseEnd = new Date(tenant.leaseEndDate);
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            if (leaseEnd <= thirtyDaysFromNow && leaseEnd >= now) {
              newTasksCount++;
            }
          }
        });
      }

      setNewTasksCount(newTasksCount);
    };

    const updateSuggestionCount = () => {
      try {
        const suggestions = suggestionService.getAllSuggestions();
        const now = new Date();
        // Count suggestions that are new or submitted in the last 7 days
        const newSuggestions = suggestions.filter(suggestion => {
          const daysSinceSubmitted = (now.getTime() - suggestion.submittedAt.getTime()) / (1000 * 60 * 60 * 24);
          return suggestion.status === 'NEW' || (daysSinceSubmitted <= 7 && suggestion.status === 'NEW');
        });
        setNewSuggestionsCount(newSuggestions.length);
      } catch (error) {
        console.error('Error counting new suggestions:', error);
        setNewSuggestionsCount(0);
      }
    };

    // Initial load
    updateApplicationCount();
    updateTaskCount();
    updateSuggestionCount();
    if (user?.role === 'Service Provider') recomputeAssignedPropsCount();

    const updateUnreadMessages = async () => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
        if (!user) { setUnreadMessagesCount(0); return; }
        if (typeof navigator !== 'undefined' && 'onLine' in navigator && (navigator as any).onLine === false) {
          setUnreadMessagesCount(0);
          return;
        }

        // Build absolute API URL if an API base is provided (helps when app is served from a different origin)
        const apiBase = (typeof window !== 'undefined' && (window as any).__API_BASE__) ? (window as any).__API_BASE__ : '';
        const url = `${apiBase}/api/messages/unread`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        // Prepare headers: try Authorization header if available in localStorage (Builder/Expo flows)
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        try {
          const token = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch (_) {}

        let r: Response | null = null;
        try {
          r = await fetch(url, { headers, cache: 'no-store', signal: controller.signal, mode: 'cors' });
        } catch (err: any) {
          // If fetch was aborted due to timeout, treat as no unread messages
          if (err?.name === 'AbortError') {
            setUnreadMessagesCount(0);
            return;
          }
          // Network or CORS error - do not throw, just set to 0
          console.warn('unread messages fetch failed:', err?.message || err);
          setUnreadMessagesCount(0);
          return;
        } finally {
          clearTimeout(timeout);
        }

        if (!r || !r.ok) { setUnreadMessagesCount(0); return; }

        try {
          const d = await r.json();
          setUnreadMessagesCount(Number(d?.count || 0));
        } catch (e) {
          setUnreadMessagesCount(0);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setUnreadMessagesCount(0);
      }
    };
    updateUnreadMessages();

    // Set up an interval to check for updates every 5 seconds
    const interval = setInterval(() => {
      updateApplicationCount();
      updateTaskCount();
      updateSuggestionCount();
      updateUnreadMessages();
      if (user?.role === 'Service Provider') recomputeAssignedPropsCount();
    }, 15000);

    // Also listen for storage events (when localStorage is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'crm_applications') {
        updateApplicationCount();
      }
      if (e.key === 'crm_work_orders' || e.key === 'crm_tenants') {
        updateTaskCount();
        if (user?.role === 'Service Provider') recomputeAssignedPropsCount();
      }
      if (e.key === 'crm_suggestion_notifications' || e.key === 'crm_suggestions') {
        updateSuggestionCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);



  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Compute menu items with role-based visibility
  const computeMainMenu = () => {
    // Base menu depends primarily on role/mode
    let base = mainListItems;
    if (isTenantUser || isTenantMode) {
      base = tenantMenuItems;
    } else if (isVendorUser) {
      base = serviceProviderMenuItems;
    } else {
      base = mainListItems;
    }

    // Filter out items that shouldn't be visible to certain roles
    base = base.filter((item) => {
      // Tenant and Vendor should not see management/companies by default
      if ((isTenantUser || isVendorUser) && item.path && ['/crm/companies'].includes(item.path)) return false;

      // Properties / Leasing / Accounting should be hidden from tenants and vendors
      if ((isTenantUser || isVendorUser) && item.path && ['/crm/properties', '/crm/leasing', '/crm/accounting', '/crm/reports', '/crm/rent-collection'].includes(item.path)) return false;

      return true;
    });

    // Non-admins shouldn't see Companies
    if (!isAdminUser) {
      base = base.filter(item => item.path !== '/crm/companies');
    }

    return base;
  };

  const menuItems = computeMainMenu();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <Box>
        <List dense>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              {
                (() => {
                  // Determine current company plan (fallback to 'basic')
                  const getCurrentPlan = () => {
                    try {
                      if (user && (user as any).subscriptionPlan) return (user as any).subscriptionPlan;
                      const p = typeof window !== 'undefined' ? window.localStorage.getItem('company_plan') : null;
                      return p || 'basic';
                    } catch (e) {
                      return 'basic';
                    }
                  };

                  const planOrder: Record<string, number> = { basic: 1, pro: 2, enterprise: 3 };
                  const currentPlan = getCurrentPlan();

                  const isAllowed = (requiredPlan?: string) => {
                    if (!requiredPlan) return true;
                    if (isSuperAdmin()) return true;
                    const cur = planOrder[(currentPlan || '').toLowerCase()] || 1;
                    const req = planOrder[(requiredPlan || '').toLowerCase()] || 1;
                    return cur >= req;
                  };

                  const handleLockedClick = (requiredPlan?: string) => {
                    const msg = `This feature requires the ${requiredPlan?.toUpperCase() || 'PRO'} plan. Upgrade to access.`;
                    if (typeof window !== 'undefined') {
                      // Navigate to subscription management
                      window.alert(msg);
                      window.location.href = '/crm/subscriptions';
                    }
                  };

                  // Also enforce role-level visibility for top-level items
                  const roleRestrictedPaths = ['/crm/properties', '/crm/leases', '/crm/tenants', '/crm/accounting', '/crm/reports', '/crm/companies'];
                  let allowed = isAllowed((item as any).requiredPlan);
                  if ((isTenantUser || isVendorUser) && item.path && roleRestrictedPaths.includes(item.path)) {
                    allowed = false;
                  }

                  return (
                    <ListItemButton
                      selected={location.pathname === item.path}
                      onClick={() => { if (allowed) handleNavigation(item.path); else handleLockedClick((item as any).requiredPlan); }}
                      sx={allowed ? {} : { opacity: 0.6, cursor: 'pointer' }}
                    >
                      <ListItemIcon>
                        {item.badge && item.text === "Applications" ? (
                          <Badge badgeContent={newApplicationsCount} color="error">
                            <IconErrorBoundary>{item.icon}</IconErrorBoundary>
                          </Badge>
                        ) : item.badge && item.text === "Tasks" ? (
                          <Badge badgeContent={newTasksCount} color="warning">
                            <IconErrorBoundary>{item.icon}</IconErrorBoundary>
                          </Badge>
                        ) : item.badge && item.text === "Suggestions" ? (
                          <Badge badgeContent={newSuggestionsCount} color="error">
                            <IconErrorBoundary>{item.icon}</IconErrorBoundary>
                          </Badge>
                        ) : item.badge && item.text === "Communications" ? (
                          <Badge badgeContent={unreadMessagesCount} color="error">
                            <IconErrorBoundary>{item.icon}</IconErrorBoundary>
                          </Badge>
                        ) : (isVendorUser && item.text === 'Properties') ? (
                          <Badge badgeContent={assignedPropsCount} color="warning">
                            <IconErrorBoundary>{item.icon}</IconErrorBoundary>
                          </Badge>
                        ) : (
                          <IconErrorBoundary>{item.icon}</IconErrorBoundary>
                        )}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                      {!allowed && <ListItemText primary={`(Upgrade to ${((item as any).requiredPlan || 'pro').toUpperCase()})`} sx={{ textAlign: 'right', color: 'text.secondary' }} />}
                    </ListItemButton>
                  );
                })()
              }

              {item.children && (
                <List disablePadding sx={{ pl: 4 }}>
                  {item.children.map((child, idx) => (
                    <ListItem key={idx} disablePadding sx={{ display: "block" }}>
                      {
                      (() => {
                        const requiredPlan = (child as any).requiredPlan;
                        const planOrder: Record<string, number> = { basic: 1, pro: 2, enterprise: 3 };
                        const getCurrentPlan = () => {
                          try {
                            if (user && (user as any).subscriptionPlan) return (user as any).subscriptionPlan;
                            const p = typeof window !== 'undefined' ? window.localStorage.getItem('company_plan') : null;
                            return p || 'basic';
                          } catch (e) { return 'basic'; }
                        };
                        const currentPlan = getCurrentPlan();
                        const cur = planOrder[(currentPlan || '').toLowerCase()] || 1;
                        const req = planOrder[(requiredPlan || '').toLowerCase()] || 1;
                        let allowedChild = isSuperAdmin() || cur >= req;

                        // Role-based restrictions for child paths
                        const childRestrictedPaths = ['/crm/units', '/crm/leases', '/crm/tenants', '/crm/applications'];
                        if ((isTenantUser || isVendorUser) && child.path && childRestrictedPaths.includes(child.path)) {
                          allowedChild = false;
                        }

                        return (
                          <ListItemButton selected={location.pathname === child.path} onClick={() => { if (allowedChild) handleNavigation(child.path); else { window.alert(`This feature requires the ${(requiredPlan||'PRO').toUpperCase()} plan or appropriate role. Upgrade or contact admin to access.`); window.location.href = '/crm/subscriptions'; } }} sx={allowedChild ? {} : { opacity: 0.6, cursor: 'pointer' }}>
                            <ListItemIcon>{child.icon}</ListItemIcon>
                            <ListItemText primary={child.text} />
                          </ListItemButton>
                        );
                      })()
                    }
                    </ListItem>
                  ))}
                </List>
              )}
            </ListItem>
          ))}
        </List>
        {/* Marketing Tools - All features consolidated into Marketing Automation (main menu) */}
        {/* Email Marketing, SMS Marketing, Templates, Landing Pages, and Promotions */}
        {/* are now integrated into the unified Marketing Automation hub */}
      </Box>
      {/* Secondary items - Adjust based on mode */}
      <Box>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {(() => {
            const serviceProviderSecondaryItems = [
              { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
              { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
            ];
            let base = isTenantMode ? tenantSecondaryItems : secondaryListItems;
            if (isVendorUser) {
              base = serviceProviderSecondaryItems;
            }
            const computed = isSuperAdmin() && !isVendorUser
              ? [...base, { text: "Super Admin", icon: <AdminPanelSettingsRoundedIcon />, path: "/crm/super-admin" }]
              : base;
            return computed;
          })().map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Stack>
  );
}
