import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Stack, Chip } from "@mui/material";

type Integration = {
  id: string;
  provider: string;
  enabled: boolean;
  displayName: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AccountingIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    const mock: Integration[] = [
      { id: "int1", provider: "QUICKBOOKS", enabled: true, displayName: "QuickBooks Online" },
      { id: "int2", provider: "XERO", enabled: false, displayName: "Xero" },
      { id: "int3", provider: "WAVE", enabled: false, displayName: "Wave" },
    ];
    setIntegrations(mock);
  }, []);

  const connect = (provider: string) => {
    window.location.href = `${API_URL}/api/integrations/${provider.toLowerCase()}/connect?orgId=demo-org`;
  };

  const manualSync = async (provider: string) => {
    await fetch(`${API_URL}/api/integrations/${provider.toLowerCase()}/sync?orgId=demo-org`, { method: "POST" });
    alert("Triggered manual sync. Check Sync Logs.");
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Accounting Integrations
      </Typography>

      <Stack spacing={2}>
        {integrations.map((i) => (
          <Paper key={i.id} sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">{i.displayName}</Typography>
              {i.enabled ? (
                <Chip label="Connected" color="success" size="small" />
              ) : (
                <Chip label="Not Connected" color="default" size="small" />
              )}
            </Stack>
            <Box>
              <Button variant="contained" onClick={() => connect(i.provider)}>
                {i.enabled ? "Reconnect" : "Connect"}
              </Button>
              <Button variant="outlined" sx={{ ml: 1 }} onClick={() => manualSync(i.provider)}>
                Sync Now
              </Button>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
