import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Analytics Dashboard</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Rent Collected (Last 6 Months)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.rentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="rent" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Delinquency Rate</Typography>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={[{ label: 'Delinquency', value: data.delinquencyRate }] }>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
        <Typography sx={{ mt: 1 }} color="text.secondary">Current delinquency rate: {Number(data.delinquencyRate || 0).toFixed(1)}%</Typography>
      </Paper>
    </Box>
  );
}
