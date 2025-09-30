// src/shared-theme/AppTheme.tsx
import React, { useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

type AppThemeProps = {
  children: React.ReactNode;
};

// Preset theme options
const themeOptions = {
  blue: createTheme({ palette: { primary: { main: "#1976d2" } } }),
  green: createTheme({ palette: { primary: { main: "#2e7d32" } } }),
  red: createTheme({ palette: { primary: { main: "#d32f2f" } } }),
  purple: createTheme({ palette: { primary: { main: "#6a1b9a" } } }),
};

export default function AppTheme({ children }: AppThemeProps) {
  const [themeName, setThemeName] = useState<keyof typeof themeOptions>("blue");

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("appTheme") as keyof typeof themeOptions;
    if (saved && themeOptions[saved]) {
      setThemeName(saved);
    }
  }, []);

  // Memoize theme object to avoid re-renders
  const theme = useMemo(() => themeOptions[themeName], [themeName]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
