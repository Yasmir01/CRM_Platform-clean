import * as React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';

interface NotifRow {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdAt: string;
}

export default function SuperAdminNotifications() {
  const [rows, setRows] = React.useState<NotifRow[]>([]);
  const [search, setSearch] = React.useState('');
  const [audience, setAudience] = React.useState('ALL');

  const load = React.useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (audience) params.set('audience', audience);
    fetch('/api/superadmin/notifications?' + params.toString())
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(d || []))
      .catch(() => setRows([]));
  }, [search, audience]);

  React.useEffect(() => {
    load();
  }, [load]);

  const deleteNotif = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    await fetch(`/api/superadmin/notifications-delete?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    load();
  };

  const resendNotif = async (id: string) => {
    await fetch(`/api/superadmin/notifications-resend?id=${encodeURIComponent(id)}`, { method: 'POST' });
    alert('Notification resent!');
    load();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Notification History</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Search title or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Audience</InputLabel>
            <Select value={audience} label="Audience" onChange={(e) => setAudience(e.target.value)}>
              <MenuItem value="ALL">All Audiences</MenuItem>
              <MenuItem value="ADMINS">Admins</MenuItem>
              <MenuItem value="TENANTS">Tenants</MenuItem>
              <MenuItem value="OWNERS">Owners</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={load}>Apply</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Audience</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((n) => (
              <TableRow key={n.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{n.title}</TableCell>
                <TableCell>{n.message}</TableCell>
                <TableCell>{n.audience}</TableCell>
                <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="contained" onClick={() => resendNotif(n.id)} sx={{ mr: 1 }}>Resend</Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => deleteNotif(n.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length === 0 && (
        <Paper sx={{ p: 2, mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          No notifications found.
        </Paper>
      )}
    </Box>
  );
}
