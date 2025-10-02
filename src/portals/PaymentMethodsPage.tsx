import * as React from 'react';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/methods');
      const data = await res.json();
      setMethods(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await fetch('/api/payments/methods', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>My Payment Methods</Typography>

      <Stack spacing={1} sx={{ mb: 2 }}>
        {methods.map((m) => (
          <Paper key={m.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{String(m.brand || '').toUpperCase()} •••• {m.last4}</Typography>
              <Typography variant="body2" color="text.secondary">{m.type}{m.isDefault ? ' • Default' : ''}</Typography>
            </Box>
            <Button color="error" variant="contained" onClick={() => remove(m.id)}>Remove</Button>
          </Paper>
        ))}
        {!methods.length && !loading && (
          <Typography variant="body2" color="text.secondary">No payment methods yet.</Typography>
        )}
      </Stack>

      <Button fullWidth variant="contained">+ Add Payment Method</Button>
    </Box>
  );
}
