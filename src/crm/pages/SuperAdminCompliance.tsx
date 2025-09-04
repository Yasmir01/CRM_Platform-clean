import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function SuperAdminCompliance() {
  const exportLogs = () => {
    window.location.href = '/api/superadmin/compliance/export';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Compliance & Audit Logs</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Download recent audit logs for compliance purposes.
      </Typography>
      <Button variant="contained" color="success" onClick={exportLogs}>Export CSV</Button>
    </Box>
  );
}
