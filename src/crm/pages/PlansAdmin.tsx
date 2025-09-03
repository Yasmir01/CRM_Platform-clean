import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function PlansAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [leaseId, setLeaseId] = useState('');
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState('');
  const [schedule, setSchedule] = useState<Array<{ dueDate: string; amount: string }>>([]);

  useEffect(() => { (async () => { const r = await fetch('/api/payment-plans/org', { credentials: 'include' }); setPlans(await r.json()); })(); }, []);

  const addInstallment = () => setSchedule([...schedule, { dueDate: '', amount: '' }]);
  const updateInstallment = (i: number, field: 'dueDate' | 'amount', val: string) => {
    const s = [...schedule]; s[i][field] = val; setSchedule(s);
  };
  const createPlan = async () => {
    const res = await fetch('/api/payment-plans/create', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId, leaseId, title, total: parseFloat(total), schedule }) });
    const data = await res.json();
    if (!res.ok) return alert(data?.error || 'Failed');
    alert('Plan created'); window.location.reload();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h5">Payment Plans</Typography>

        <Card>
          <CardContent>
            <Typography variant="subtitle1">New Plan</Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} fullWidth />
              <TextField label="Lease ID" value={leaseId} onChange={(e) => setLeaseId(e.target.value)} fullWidth />
              <TextField label="Plan Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              <TextField label="Total Amount" value={total} onChange={(e) => setTotal(e.target.value)} fullWidth />
              <Stack spacing={1}>
                <Button variant="outlined" onClick={addInstallment}>Add Installment</Button>
                {schedule.map((i, idx) => (
                  <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={i.dueDate} onChange={(e) => updateInstallment(idx, 'dueDate', e.target.value)} />
                    <TextField type="number" label="Amount" value={i.amount} onChange={(e) => updateInstallment(idx, 'amount', e.target.value)} />
                  </Stack>
                ))}
              </Stack>
              <Button variant="contained" onClick={createPlan}>Create</Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Existing Plans</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.tenant?.email || p.tenantId}</TableCell>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>${Number(p.total).toFixed(2)}</TableCell>
                    <TableCell>{p.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
