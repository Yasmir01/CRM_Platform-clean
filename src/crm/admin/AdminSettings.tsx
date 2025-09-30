// src/crm/admin/AdminSettings.tsx
import React from "react";
import { Box } from "@mui/material";
import SettingsHeader from "../components/SettingsHeader";
import SettingsForm from "../components/SettingsForm";

export default function AdminSettings() {
  return (
    <Box p={3}>
      <SettingsHeader title="Admin Settings" />
      <SettingsForm />
    </Box>
  );
}
