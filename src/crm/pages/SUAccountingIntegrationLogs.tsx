import * as React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, Stack, Chip, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function SUAccountingIntegrationLogs() {
  const params = useParams();
  const provider = String(params.provider || '');
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!provider) return;
    fetch(`/api/admin/integrations/accounting/${encodeURIComponent(provider)}/logs`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => setLogs([]));
  }, [provider]);

  const statusChip = (s?: string) => s === 'success' ? (<Chip size="small" color="success" label="Success" />) : s === 'failed' ? (<Chip size="small" color="error" label="Failed" />) : (<Chip size="small" color="warning" label="Pending" />);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>{provider.toUpperCase()} Sync Logs</Typography>
        <Button component={RouterLink} to="/crm/super-admin/accounting-integrations" variant="outlined">Back</Button>
      </Stack>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id} hover>
                <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                <TableCell>{l.direction}</TableCell>
                <TableCell>{l.entity}</TableCell>
                <TableCell>{statusChip(l.status)}</TableCell>
                <TableCell>{l.message || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
