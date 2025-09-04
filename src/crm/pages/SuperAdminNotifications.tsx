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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Notification History</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Audience</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((n) => (
              <TableRow key={n.id}>
                <TableCell sx={{ fontWeight: 600 }}>{n.title}</TableCell>
                <TableCell>{n.message}</TableCell>
                <TableCell>{n.audience}</TableCell>
                <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
