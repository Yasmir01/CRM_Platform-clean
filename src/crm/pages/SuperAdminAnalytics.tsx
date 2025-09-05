import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

export default function SuperAdminAnalytics() {
  const [data, setData] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/superadmin/analytics')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((d) => { if (mounted) setData(d); })
      .catch(() => setData({ rentData: [], delinquencyRate: 0 }));
    return () => { mounted = false; };
  }, []);

  if (!data) return <Typography>Loading analytics...</Typography>;

  // Prepare chart data for MUI X Charts
  const rentMonths = (data.rentData || []).map((d: any) => d.month);
  const rentValues = (data.rentData || []).map((d: any) => Number(d.rent || 0));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Analytics Dashboard</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Rent Collected (Last 6 Months)</Typography>
        <LineChart
          xAxis={[{ scaleType: 'point', data: rentMonths }]}
          series={[{ data: rentValues, color: '#2563eb', label: 'Rent', showMark: false }]}
          height={300}
          grid={{ horizontal: true, vertical: false }}
          margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
        />
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">Delinquency Rate</Typography>
          <Typography variant="h5">{Number(data.delinquencyRate || 0).toFixed(1)}%</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">Occupancy Rate</Typography>
          <Typography variant="h5">{Number(data.occupancyRate || 0).toFixed(1)}%</Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">AutoPay Adoption</Typography>
          <Typography variant="h5">{Number(data.autopayRate || 0).toFixed(1)}%</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Delinquency</Typography>
        <BarChart
          xAxis={[{ scaleType: 'band', data: ['Delinquency'] }]}
          series={[{ data: [Number(data.delinquencyRate || 0)], color: '#dc2626', label: 'Rate' }]}
          height={220}
          margin={{ left: 40, right: 20, top: 20, bottom: 20 }}
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Total Units Managed</Typography>
        <Typography variant="h4">{Number(data.totalUnits || 0).toLocaleString()}</Typography>
      </Paper>
    </Box>
  );
}
