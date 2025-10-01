import React from "react";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../crm/contexts/AuthContext";

const drawerWidth = 240;

function mapRole(role?: string): keyof typeof menuMap {
  switch (role) {
    case "Tenant":
      return "tenant";
    case "Owner":
      return "owner";
    case "Service Provider":
      return "vendor";
    case "Admin":
      return "admin";
    case "Super Admin":
      return "superadmin";
    default:
      return "tenant";
  }
}

const menuMap = {
  tenant: [
    { label: "Dashboard", path: "/tenant/dashboard" },
    { label: "Payments", path: "/tenant/payments" },
    { label: "Receipts", path: "/tenant/receipts" },
    { label: "Refunds", path: "/tenant/refunds" },
    { label: "Maintenance", path: "/tenant/maintenance" },
    { label: "Settings", path: "/tenant/settings" },
  ],
  owner: [
    { label: "Dashboard", path: "/owner/dashboard" },
    { label: "Reports", path: "/owner/reports" },
    { label: "Settings", path: "/owner/settings" },
  ],
  vendor: [
    { label: "Work Orders", path: "/vendor/work-orders" },
    { label: "Settings", path: "/vendor/settings" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Payments Report", path: "/admin/payments" },
    { label: "Work Orders", path: "/admin/work-orders" },
    { label: "Compliance Logs", path: "/admin/compliance" },
    { label: "Settings", path: "/admin/settings" },
  ],
  superadmin: [
    { label: "Dashboard", path: "/superadmin" },
    { label: "Payments Report", path: "/superadmin/payments" },
    { label: "Integrations", path: "/superadmin/integrations" },
    { label: "Sync Logs", path: "/superadmin/integrations/logs" },
    { label: "AI Insights", path: "/superadmin/insights" },
    { label: "Compliance Logs", path: "/superadmin/compliance" },
    { label: "Settings", path: "/superadmin/settings" },
  ],
};

export default function SidebarNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleKey = mapRole(user?.role);
  const menu = menuMap[roleKey];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menu.map((item) => (
          <ListItemButton key={item.path} onClick={() => navigate(item.path)}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
