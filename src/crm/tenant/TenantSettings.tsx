// src/crm/tenant/TenantSettings.tsx
import React from "react";
import { Box } from "@mui/material";
import SettingsHeader from "../components/SettingsHeader";
import SettingsForm from "../components/SettingsForm";

export default function TenantSettings() {
  return (
    <Box p={3}>
      <SettingsHeader title="Tenant Settings" />
      <SettingsForm />
    </Box>
  );
}
