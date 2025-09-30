// src/crm/owner/OwnerSettings.tsx
import React from "react";
import { Box } from "@mui/material";
import SettingsHeader from "../components/SettingsHeader";
import SettingsForm from "../components/SettingsForm";

export default function OwnerSettings() {
  return (
    <Box p={3}>
      <SettingsHeader title="Owner Settings" />
      <SettingsForm />
    </Box>
  );
}
