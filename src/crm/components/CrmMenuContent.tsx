import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box"; // Added the missing import
import { useMode } from "../contexts/ModeContext";
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

const mainListItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/crm" },
  { text: "Calendar", icon: <CalendarTodayRoundedIcon />, path: "/crm/calendar" },
  { text: "Contact Management", icon: <GroupRoundedIcon />, path: "/crm/contacts" },
  { text: "Sales Automation", icon: <SellRoundedIcon />, path: "/crm/sales" },
  { text: "Marketing Automation", icon: <AutorenewRoundedIcon />, path: "/crm/marketing" },
  { text: "Properties", icon: <HomeWorkRoundedIcon />, path: "/crm/properties" },
  { text: "Tenants", icon: <PersonRoundedIcon />, path: "/crm/tenants" },
  { text: "Prospects", icon: <ContactsRoundedIcon />, path: "/crm/prospects" },
  { text: "Applications", icon: <DescriptionIcon />, path: "/crm/applications", badge: true },
  { text: "Property Managers", icon: <PeopleRoundedIcon />, path: "/crm/managers" },
  { text: "Service Providers", icon: <HandymanRoundedIcon />, path: "/crm/service-providers" },
  { text: "Rent Collection", icon: <PaymentRoundedIcon />, path: "/crm/rent-collection" },
  { text: "Work Orders", icon: <BuildRoundedIcon />, path: "/crm/work-orders" },
  { text: "Customer Service", icon: <SupportAgentRoundedIcon />, path: "/crm/customer-service" },
  { text: "Communications", icon: <ForumRoundedIcon />, path: "/crm/communications" },
  { text: "News Board", icon: <AnnouncementRoundedIcon />, path: "/crm/news" },
  { text: "Power Tools", icon: <ConstructionRoundedIcon />, path: "/crm/power-tools" },
  { text: "AI Tools", icon: <SmartToyRoundedIcon />, path: "/crm/ai-tools" },
  { text: "Tasks", icon: <AssignmentRoundedIcon />, path: "/crm/tasks" },
  { text: "Analytics & Insights", icon: <AnalyticsRoundedIcon />, path: "/crm/analytics" },
  { text: "Reports", icon: <AssessmentRoundedIcon />, path: "/crm/reports" },
];

const marketingListItems = [
  { text: "Email Marketing", icon: <EmailRoundedIcon />, path: "/crm/email-marketing" },
  { text: "SMS Marketing", icon: <SmsRoundedIcon />, path: "/crm/sms-marketing" },
  { text: "Templates", icon: <DescriptionRoundedIcon />, path: "/crm/templates" },
  { text: "Landing Pages", icon: <PublicRoundedIcon />, path: "/crm/landing-pages" },
  { text: "Promotions", icon: <CampaignRoundedIcon />, path: "/crm/promotions" },
];

const secondaryListItems = [
  { text: "Integrations", icon: <IntegrationInstructionsRoundedIcon />, path: "/crm/integrations" },
  { text: "Automation Engine", icon: <AutorenewRoundedIcon />, path: "/crm/automation" },
  { text: "Backup & Restore", icon: <BackupRoundedIcon />, path: "/crm/backup" },
  { text: "User Roles", icon: <SecurityRoundedIcon />, path: "/crm/user-roles" },
  { text: "Marketplace", icon: <StorefrontRoundedIcon />, path: "/crm/marketplace" },
  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
  { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
];

// Tenant-specific secondary items (no user roles or marketplace)
const tenantSecondaryItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
  { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
];

// Tenant-specific menu items (simplified interface)
const tenantMenuItems = [
  { text: "Dashboard", icon: <DashboardRoundedIcon />, path: "/crm" },
  { text: "News & Announcements", icon: <AnnouncementRoundedIcon />, path: "/crm/news" },
  { text: "Work Orders", icon: <BuildRoundedIcon />, path: "/crm/work-orders" },
  { text: "Communications", icon: <ForumRoundedIcon />, path: "/crm/communications" },
  { text: "Profile", icon: <PersonRoundedIcon />, path: "/crm/profile" },
  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
];

export default function CrmMenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTenantMode, isManagementMode } = useMode();

  // Mock new applications count - in real app this would come from context/state
  const newApplicationsCount = 3;



  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <Box>
        <List dense>
          {(isTenantMode ? tenantMenuItems : mainListItems).map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>
                  {item.badge && item.text === "Applications" ? (
                    <Badge badgeContent={newApplicationsCount} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {/* Marketing/Management Tools - Only show in Management mode */}
        {isManagementMode && (
          <>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {marketingListItems.map((item, index) => (
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
          </>
        )}
      </Box>
      {/* Secondary items - Adjust based on mode */}
      <Box>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {(isTenantMode ? tenantSecondaryItems : secondaryListItems).map((item, index) => (
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
