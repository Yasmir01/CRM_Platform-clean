import * as React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

interface SubscriberRow {
  id: string;
  companyName?: string | null;
  email: string;
  createdAt: string;
  plan?: string | null;
  status?: string | null;
}

export default function SuperAdminSubscribers() {
  const [rows, setRows] = React.useState<SubscriberRow[]>([]);

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/superadmin/subscribers')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((list) => {
        if (!mounted) return;
        const mapped: SubscriberRow[] = (list || []).map((s: any) => {
          const sub = (s.subscriptions || [])[0] || null;
          const plan = sub?.plan?.name || null;
          const status = sub?.status || null;
          return {
            id: s.id,
            companyName: s.companyName || null,
            email: s.email,
            createdAt: s.createdAt,
            plan,
            status,
          };
        });
        setRows(mapped);
      })
      .catch(() => setRows([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Subscribers</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.companyName || s.email}</TableCell>
                <TableCell>{s.plan || '—'}</TableCell>
                <TableCell>
                  {s.status ? (
                    <Chip label={s.status} size="small" color={s.status === 'active' ? 'success' : 'default'} />
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
