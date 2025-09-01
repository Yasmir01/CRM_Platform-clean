import * as React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from '@mui/material';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  plan?: { id: string; name: string; price: number; billingCycle: 'monthly' | 'yearly' } | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
  subscription?: Subscription | null;
}

function monthlyFromPlan(plan?: Subscription['plan'] | null){
  if(!plan) return 0;
  const price = typeof plan.price === 'number' ? plan.price : 0;
  return plan.billingCycle === 'yearly' ? price / 12 : price;
}

export default function SuperAdminRevenueDashboard(){
  const [subs, setSubs] = React.useState<Subscription[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  React.useEffect(() => {
    (async () => {
      try{ const r = await fetch('/api/subscriptions'); setSubs(await r.json()); }catch{}
      try{ const r2 = await fetch('/api/payments'); setPayments(await r2.json()); }catch{}
    })();
  }, []);

  const activeSubs = subs.filter(s => s.status === 'active');
  const canceledLast30 = subs.filter(s => s.status === 'canceled' && s.endDate && (Date.now() - new Date(s.endDate).getTime()) <= 30*24*60*60*1000);
  const mrr = activeSubs.reduce((sum, s) => sum + monthlyFromPlan(s.plan), 0);
  const arr = mrr * 12;
  const churnRate = activeSubs.length ? (canceledLast30.length / (activeSubs.length + canceledLast30.length)) * 100 : 0;

  const planMix: Record<string, { count: number; mrr: number }> = {};
  activeSubs.forEach(s => {
    const key = s.plan?.name || 'Unknown';
    planMix[key] = planMix[key] || { count: 0, mrr: 0 };
    planMix[key].count += 1;
    planMix[key].mrr += monthlyFromPlan(s.plan);
  });

  const recentPayments = payments.slice(0, 10);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">MRR</Typography>
            <Typography variant="h4">${mrr.toFixed(2)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">ARR</Typography>
            <Typography variant="h4">${arr.toFixed(2)}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Active Subscriptions</Typography>
            <Typography variant="h4">{activeSubs.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Churn (30d)</Typography>
            <Typography variant="h4">{churnRate.toFixed(1)}%</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Mix</Typography>
              <Table size="small" component={Paper} variant="outlined">
                <TableHead>
                  <TableRow>
                    <TableCell>Plan</TableCell>
                    <TableCell align="right">Subscribers</TableCell>
                    <TableCell align="right">MRR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(planMix).map(([name, v]) => (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell align="right">{v.count}</TableCell>
                      <TableCell align="right">${v.mrr.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {Object.keys(planMix).length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center">No data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Payments</Typography>
              <Table size="small" component={Paper} variant="outlined">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPayments.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>${p.amount.toFixed(2)}</TableCell>
                      <TableCell><Chip label={p.status} size="small" color={p.status === 'succeeded' ? 'success' : 'default'} /></TableCell>
                      <TableCell>{p.provider}</TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {recentPayments.length === 0 && (
                    <TableRow><TableCell colSpan={4} align="center">No payments</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
