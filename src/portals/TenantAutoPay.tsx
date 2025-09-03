import React, { useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

export default function TenantAutoPay() {
  const [amount, setAmount] = useState<number>(1200);
  const [day, setDay] = useState<number>(1);
  const [method, setMethod] = useState<string>('stripe_card');
  const [leaseId, setLeaseId] = useState<string>('LEASE123');

  const setup = async () => {
    const r = await fetch('/api/autopay/setup', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leaseId, amount, dayOfMonth: day, method }) });
    const d = await r.json();
    if (d.clientSecret) {
      alert('AutoPay saved. Complete payment method setup in Stripe modal next.');
      // Integrate Stripe.js to confirm setup_intent with clientSecret as next step
    } else if (d.error) {
      alert(d.error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Setup AutoPay</Typography>
            <TextField label="Lease ID" value={leaseId} onChange={(e) => setLeaseId(e.target.value)} fullWidth />
            <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value || '0'))} fullWidth />
            <TextField label="Day of Month" type="number" inputProps={{ min: 1, max: 28 }} value={day} onChange={(e) => setDay(parseInt(e.target.value || '1', 10))} fullWidth />
            <Select value={method} onChange={(e) => setMethod(String(e.target.value))}>
              <MenuItem value="stripe_card">Credit/Debit Card</MenuItem>
              <MenuItem value="stripe_ach">ACH Bank Account</MenuItem>
            </Select>
            <Button variant="contained" onClick={setup}>Enable AutoPay</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
