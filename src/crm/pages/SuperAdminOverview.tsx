import * as React from 'react';
import { Card, CardContent, Grid, Typography, Box, Alert } from '@mui/material';

export default function SuperAdminOverview() {
  const [data, setData] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/superadmin/dashboard')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((d) => {
        if (mounted) setData(d);
      })
      .catch((e) => {
        if (mounted) setError(e.message || 'Error');
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (error) return <Alert severity="error">Error loading dashboard</Alert>;
  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>SuperAdmin Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Subscribers</Typography>
            <Typography variant="h4">{data.subscribers}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Active Tenants</Typography>
            <Typography variant="h4">{data.tenants}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Rent Collected (This Month)</Typography>
            <Typography variant="h4">${(data.rentVolume || 0).toLocaleString()}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Failed Payments</Typography>
            <Typography variant="h4">{data.failedRate}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
