import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { CrmLogo } from "./CrmAppNavbar";
import {
  mainListItems,
  secondaryListItems,
  tenantMenuItems,
  tenantSecondaryItems,
  serviceProviderMenuItems,
} from "./CrmMenuContent";
import { useMode } from "../contexts/ModeContext";
import { useRoleManagement } from "../hooks/useRoleManagement";
import { useAuth } from "../contexts/AuthContext";

interface CrmSideMenuMobileProps {
  open: boolean;
  toggleDrawer: (open: boolean) => () => void;
}

export default function CrmSideMenuMobile({ open, toggleDrawer }: CrmSideMenuMobileProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTenantMode } = useMode();
  const { isSuperAdmin } = useRoleManagement();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    toggleDrawer(false)();
  };

  const primary = isTenantMode
    ? tenantMenuItems
    : (user?.role === 'Service Provider' ? serviceProviderMenuItems : mainListItems);

  // Service provider simplified secondary
  const spSecondary = [
    { text: "Settings", icon: <SettingsRoundedIcon />, path: "/crm/settings" },
    { text: "Help & Support", icon: <HelpOutlineRoundedIcon />, path: "/crm/help" },
  ];

  let secondary = isTenantMode ? tenantSecondaryItems : secondaryListItems;
  if (user?.role === 'Service Provider') secondary = spSecondary;
  if (isSuperAdmin() && user?.role !== 'Service Provider') {
    secondary = [...secondary, { text: 'Super Admin', icon: <AdminPanelSettingsRoundedIcon />, path: '/crm/super-admin' }];
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      slotProps={{ backdrop: { invisible: false } }}
      sx={{ zIndex: 1300, "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2 }}>
        <CrmLogo />
        <Typography variant="h6">PropCRM</Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: "auto", height: "100%", display: "flex", flexDirection: "column" }}>
        <List dense>
          {primary.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton selected={location.pathname === item.path} onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {secondary.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton selected={location.pathname === item.path} onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
