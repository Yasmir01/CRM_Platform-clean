// src/components/DashboardShell.tsx
import React, { ReactNode } from "react";
import { Box, Typography, AppBar, Toolbar, Button } from "@mui/material";
import { useAuth } from "../crm/contexts/AuthContext";

interface DashboardShellProps {
  title: string;
  userName?: string;   // ✅ allow username
  children: ReactNode;
}

export default function DashboardShell({ title, userName, children }: DashboardShellProps) {
  const { logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title} {userName && `— Welcome, ${userName}`}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}
