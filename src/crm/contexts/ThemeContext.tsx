import React, { createContext, useContext, useMemo } from "react";

type Role = "tenant" | "vendor" | "admin" | "superadmin";

interface Theme {
  role: Role;
  accent: string;
  background: string;
  text: string;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  const theme = useMemo(() => {
    switch (role) {
      case "tenant":
        return { role, accent: "#3b82f6", background: "#f0f8ff", text: "#111" };
      case "vendor":
        return { role, accent: "#10b981", background: "#f0fff4", text: "#111" };
      case "admin":
        return { role, accent: "#8b5cf6", background: "#f8f0ff", text: "#111" };
      case "superadmin":
        return { role, accent: "#000", background: "#fffbe6", text: "#111" };
      default:
        return { role: "tenant", accent: "#3b82f6", background: "#fff", text: "#111" };
    }
  }, [role]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
