import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography, TextField } from '@mui/material';

export default function TenantPaymentsSimple() {
  const [amount, setAmount] = useState<number>(1200);
  const [leaseId, setLeaseId] = useState<string>('LEASE123');
  const [tenantId, setTenantId] = useState<string>('TENANT123');

  const pay = async (method: string) => {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaseId, tenantId, amount, method }),
    });
    const d = await res.json();
    if (d.redirectUrl) window.location.href = d.redirectUrl;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Pay Rent</Typography>
            <TextField label="Lease ID" value={leaseId} onChange={(e) => setLeaseId(e.target.value)} fullWidth />
            <TextField label="Tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} fullWidth />
            <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value || '0'))} fullWidth />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => pay('stripe_card')}>Pay with Card</Button>
              <Button variant="outlined" onClick={() => pay('stripe_ach')}>Pay with ACH</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
