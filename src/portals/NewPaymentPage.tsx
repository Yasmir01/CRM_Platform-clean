import * as React from 'react';
import { Box, Typography, TextField, Select, MenuItem, Button, Stack } from '@mui/material';

export default function NewPaymentPage() {
  const [amount, setAmount] = React.useState('');
  const [provider, setProvider] = React.useState('stripe');
  const [loading, setLoading] = React.useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount || '0'), provider }),
      });
      const data = await res.json();
      alert(JSON.stringify(data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Make a Payment</Typography>
      <Stack spacing={2}>
        <TextField type="number" label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth />
        <Select value={provider} onChange={(e) => setProvider(e.target.value as string)} fullWidth>
          <MenuItem value="stripe">Credit/Debit (Stripe)</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="plaid">ACH (Bank Transfer)</MenuItem>
          <MenuItem value="applepay">Apple Pay</MenuItem>
        </Select>
        <Button variant="contained" onClick={pay} disabled={loading}>Pay Now</Button>
      </Stack>
    </Box>
  );
}
