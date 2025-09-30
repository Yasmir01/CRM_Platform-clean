// src/crm/vendor/VendorSettings.tsx
import React from "react";
import { Box } from "@mui/material";
import SettingsHeader from "../components/SettingsHeader";
import SettingsForm from "../components/SettingsForm";

export default function VendorSettings() {
  return (
    <Box p={3}>
      <SettingsHeader title="Vendor Settings" />
      <SettingsForm />
    </Box>
  );
}
