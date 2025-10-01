import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function RoleSwitcher() {
  const { user, switchRole, endImpersonation } = useAuth() as any;
  const theme = useTheme();

  if (!user) return null;
  const baseRole = (user.role || "").toString().toLowerCase();
  if (baseRole !== "super admin" && baseRole !== "admin") return null;

  const roles: Array<{ key: string; label: string }> = [
    { key: "tenant", label: "Tenant" },
    { key: "vendor", label: "Vendor" },
    { key: "owner", label: "Owner" },
  ];

  return (
    <Box sx={{ border: `1px solid ${theme.accent}`, p: 2, borderRadius: 1, my: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Role Switcher</Typography>
      <Stack direction="row" spacing={1}>
        {roles.map((r) => (
          <Button key={r.key} variant="outlined" onClick={() => switchRole(r.key as any)}>
            Switch to {r.label}
          </Button>
        ))}
        {user.impersonating && (
          <Button color="error" variant="contained" onClick={endImpersonation}>
            End Impersonation
          </Button>
        )}
      </Stack>
    </Box>
  );
}
