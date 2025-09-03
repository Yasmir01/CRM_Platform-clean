import * as React from 'react';
import { Box, Typography, TextField, Button, Stack, Alert } from '@mui/material';

export default function SuperAdminImpersonate() {
  const [userId, setUserId] = React.useState('');
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const impersonate = async () => {
    setMsg(null); setErr(null); setLoading(true);
    try {
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      const d = await res.json();
      if (res.ok && d.ok) setMsg(`Now impersonating ${userId}`);
      else setErr(d.error || 'Failed');
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Impersonate User</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          sx={{ minWidth: 300 }}
        />
        <Button variant="contained" onClick={impersonate} disabled={!userId || loading}>
          Impersonate
        </Button>
      </Stack>
      {msg && <Alert sx={{ mt: 2 }} severity="success">{msg}</Alert>}
      {err && <Alert sx={{ mt: 2 }} severity="error">{err}</Alert>}
    </Box>
  );
}
