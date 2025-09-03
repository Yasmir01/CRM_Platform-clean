import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, MenuItem, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const url = `/api/payments/admin/list${status ? `?status=${encodeURIComponent(status)}` : ''}`;
    const res = await fetch(url, { credentials: 'include' });
    const d = await res.json();
    setPayments(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [status]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Tenant Payments</Typography>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>Status:</Typography>
              <Select value={status} onChange={(e) => setStatus(String(e.target.value))} displayEmpty size="small">
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="succeeded">Succeeded</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading ? (
              <Stack alignItems="center" sx={{ p: 3 }}><CircularProgress /></Stack>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Lease</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{p.tenantId}</TableCell>
                      <TableCell>{p.lease?.title}</TableCell>
                      <TableCell align="right">${p.amount}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell sx={{ color: p.status === 'succeeded' ? 'success.main' : p.status === 'failed' ? 'error.main' : 'text.secondary' }}>{p.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
