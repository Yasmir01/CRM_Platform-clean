import * as React from 'react';
import { Box, Typography, Paper, Stack, TextField, Select, MenuItem, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function MessagesSearch() {
  const [threads, setThreads] = React.useState<any[]>([]);
  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState('');
  const [status, setStatus] = React.useState('');

  const search = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    const res = await fetch(`/api/messages/threads/search?${params.toString()}`, { credentials: 'include' });
    const data = await res.json();
    setThreads(Array.isArray(data) ? data : []);
  }, [q, role, status]);

  React.useEffect(() => { search(); }, []);

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Inbox</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <TextField fullWidth placeholder="Search messages..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select displayEmpty value={role} onChange={(e) => setRole(String(e.target.value))} sx={{ minWidth: 160 }}>
            <MenuItem value=""><em>All Roles</em></MenuItem>
            <MenuItem value="tenant">Tenant</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="owner">Owner</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="superadmin">SuperAdmin</MenuItem>
          </Select>
          <Select displayEmpty value={status} onChange={(e) => setStatus(String(e.target.value))} sx={{ minWidth: 160 }}>
            <MenuItem value=""><em>All Status</em></MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
          </Select>
          <Button variant="contained" onClick={search}>Search</Button>
        </Stack>
      </Paper>

      {threads.length === 0 && (
        <Typography variant="body2" color="text.secondary">No messages found.</Typography>
      )}

      <Stack spacing={1}>
        {threads.map((t) => (
          <Paper key={t.id} component={RouterLink as any} to={`/crm/messages/${t.id}`} sx={{ p: 2, textDecoration: 'none' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t.subject}</Typography>
            <Typography variant="body2" color="text.secondary">Last: {t.messages?.[0]?.body ? String(t.messages[0].body).slice(0, 80) : ''}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
