import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

export default function AdminReports() {
  const [data, setData] = useState<any | null>(null);
  useEffect(() => { (async () => { const r = await fetch('/api/reports/payment-plans', { credentials: 'include' }); setData(await r.json()); })(); }, []);
  if (!data) return <Box sx={{ p: 2 }}><Typography>Loading…</Typography></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="subtitle1">Total Plans</Typography><Typography variant="h4">{data.totalPlans}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="subtitle1">Active</Typography><Typography variant="h4">{data.active}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="subtitle1">Completed</Typography><Typography variant="h4">{data.completed}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent><Typography variant="subtitle1">Total Collected</Typography><Typography variant="h4">${Number(data.totalCollected).toFixed(2)}</Typography></CardContent></Card></Grid>
      </Grid>
    </Box>
  );
}
