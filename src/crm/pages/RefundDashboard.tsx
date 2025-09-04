import * as React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Stack } from '@mui/material';

export default function RefundDashboard() {
  const [refunds, setRefunds] = React.useState<any[]>([]);
  const [paymentId, setPaymentId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    fetch('/api/admin/refunds', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setRefunds)
      .catch(() => setRefunds([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function handleRefund() {
    if (!paymentId || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentId, amount: Number(amount), reason }),
      });
      setPaymentId('');
      setAmount('');
      setReason('');
      load();
      alert('Refund processed');
    } catch {
      alert('Refund failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Refund Management</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <TextField label="Payment ID" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} size="small" sx={{ minWidth: 220 }} />
          <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} size="small" sx={{ minWidth: 160 }} />
          <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} size="small" sx={{ flex: 1 }} />
          <Button variant="contained" onClick={handleRefund} disabled={submitting || !paymentId || !amount}>Process Refund</Button>
          <Button variant="outlined" onClick={load}>Refresh</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.tenant?.name || r.tenant?.email || r.tenantId}</TableCell>
                <TableCell>{r.paymentId}</TableCell>
                <TableCell align="right">${Number(r.amount || 0).toLocaleString()}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.reason || '-'}</TableCell>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
