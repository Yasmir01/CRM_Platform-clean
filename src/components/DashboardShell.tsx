// src/components/DashboardShell.tsx
import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useAuth } from "../crm/contexts/AuthContext";

interface DashboardShellProps {
  title: string;
  userName: string;
  children: React.ReactNode;
}

export default function DashboardShell({
  title,
  userName,
  children,
}: DashboardShellProps) {
  const { user } = useAuth();
  const roleKey = user?.role ? `themeColor_${user.role}` : "themeColor_global";

  const defaultColor = "#1976d2"; // Default blue
  const [color, setColor] = useState(defaultColor);

  // Load color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem(roleKey);
    if (savedColor) setColor(savedColor);
  }, [roleKey]);

  // Listen for storage updates (cross-page + live preview)
  useEffect(() => {
    const handler = () => {
      const updatedColor = localStorage.getItem(roleKey) || defaultColor;
      setColor(updatedColor);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [roleKey]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: color }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1">{userName}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}
