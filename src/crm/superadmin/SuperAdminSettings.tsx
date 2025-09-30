// src/crm/superadmin/SuperAdminSettings.tsx
import React from "react";
import { Box } from "@mui/material";
import SettingsHeader from "../components/SettingsHeader";
import SettingsForm from "../components/SettingsForm";

export default function SuperAdminSettings() {
  return (
    <Box p={3}>
      <SettingsHeader title="Super Admin Settings" />
      <SettingsForm />
    </Box>
  );
}
