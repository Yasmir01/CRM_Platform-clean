import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography, Select, MenuItem } from '@mui/material';

export default function AccountingSettings() {
  const [provider, setProvider] = useState('quickbooks');
  const [propertyId, setPropertyId] = useState('');

  const connect = async () => {
    window.location.href = `/api/accounting/oauth/${provider}`;
  };

  const syncTest = async () => {
    if (!propertyId) return alert('Enter propertyId');
    const res = await fetch('/api/accounting/sync', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });
    const data = await res.json();
    alert(res.ok ? 'Sync ok' : `Sync failed: ${data?.message || data?.error || 'unknown'}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Accounting Integration</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Select value={provider} onChange={(e) => setProvider(e.target.value as string)}>
            <MenuItem value="quickbooks">QuickBooks</MenuItem>
            <MenuItem value="xero">Xero</MenuItem>
            <MenuItem value="freshbooks">FreshBooks</MenuItem>
          </Select>
          <Button variant="contained" onClick={connect}>Connect</Button>
        </Stack>

        <Typography variant="subtitle1">Test Sync</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} fullWidth />
          <Button variant="outlined" onClick={syncTest}>Sync Ledger</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
