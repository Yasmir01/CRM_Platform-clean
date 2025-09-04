import * as React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface NotifRow {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdAt: string;
}

export default function SuperAdminNotifications() {
  const [rows, setRows] = React.useState<NotifRow[]>([]);

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/superadmin/notifications')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((list) => { if (mounted) setRows(list || []); })
      .catch(() => setRows([]));
    return () => { mounted = false; };
  }, []);

  const load = React.useCallback(() => {
    fetch('/api/superadmin/notifications')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(d || []))
      .catch(() => setRows([]));
  }, []);

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
    </Box>
  );
}
