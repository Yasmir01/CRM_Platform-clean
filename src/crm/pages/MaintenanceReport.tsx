import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, List, ListItem, ListItemText, Stack, Typography, Button } from '@mui/material';

export default function MaintenanceReport() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/maintenance/report', { credentials: 'include' });
      const data = await res.json();
      setReport(data);
    })();
  }, []);

  const exportCsv = () => {
    window.location.href = '/api/maintenance/report/export';
  };

  if (!report) return <Box sx={{ p: 2 }}><Typography>Loading report…</Typography></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h5">Maintenance Report</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Total Requests</Typography>
                <Typography variant="h4">{report.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Avg Resolution Time</Typography>
                <Typography variant="h4">{report.avgResolution ? `${report.avgResolution} hrs` : 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>By Status</Typography>
            <List>
              {Object.entries(report.byStatus || {}).map(([status, count]: any) => (
                <ListItem key={status} divider>
                  <ListItemText primary={`${status}: ${count}`} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>By Priority</Typography>
            <List>
              {Object.entries(report.byPriority || {}).map(([priority, count]: any) => (
                <ListItem key={priority} divider>
                  <ListItemText primary={`${priority}: ${count}`} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Box>
          <Button variant="outlined" onClick={exportCsv}>Export CSV</Button>
        </Box>
      </Stack>
    </Box>
  );
}
