import * as React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, Button, Stack } from '@mui/material';

export default function AdminPayments() {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState('ALL');

  const load = React.useCallback(() => {
    fetch('/api/admin/payments', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setPayments(Array.isArray(d) ? d : []))
      .catch(() => setPayments([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = payments.filter((p) => filter === 'ALL' || p.status === filter);
  const totalCollected = payments.filter((p) => p.status === 'success').reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const failedCount = payments.filter((p) => p.status === 'failed').length;
  const refundedCount = payments.filter((p) => p.status === 'refunded').length;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Payments Dashboard</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 2, textAlign: 'center' }}>
        <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
          <Typography variant="h6" color="success.dark">${totalCollected.toLocaleString()}</Typography>
          <Typography variant="body2">Total Collected</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
          <Typography variant="h6" color="warning.dark">{pendingCount}</Typography>
          <Typography variant="body2">Pending</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
          <Typography variant="h6" color="error.dark">{failedCount}</Typography>
          <Typography variant="body2">Failed</Typography>
        </Paper>
        <Paper sx={{ p: 2, bgcolor: 'orange', opacity: 0.2 }}>
          <Typography variant="h6" sx={{ color: 'orange' }}>{refundedCount}</Typography>
          <Typography variant="body2">Refunded</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="success">Successful</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={load}>Refresh</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Refund Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.tenant?.name || p.tenant?.email || 'N/A'}</TableCell>
                <TableCell>${Number(p.amount || 0).toLocaleString()}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: p.status === 'success' ? 'success.main' : p.status === 'failed' ? 'error.main' : p.status === 'refunded' ? 'warning.dark' : 'text.secondary' }}>{p.status}</TableCell>
                <TableCell>{p.autopay ? 'AutoPay' : 'One-Time'}</TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                <TableCell>{p.refundReason || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
