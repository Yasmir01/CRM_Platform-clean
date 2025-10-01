import React from "react";
import { Box, CssBaseline, AppBar, Toolbar, Typography } from "@mui/material";
import SidebarNav from "./SidebarNav";
import NotificationCenter from "./NotificationCenter";
import LanguageSwitcher from "./LanguageSwitcher";

const drawerWidth = 240;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            CRM Platform
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LanguageSwitcher />
            <NotificationCenter />
          </Box>
        </Toolbar>
      </AppBar>

      <SidebarNav />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
