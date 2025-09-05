import * as React from 'react';
import { Box, Paper, Typography, Stack, Button, Chip, Table, TableHead, TableRow, TableCell, TableBody, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

type Provider = 'all' | 'QuickBooks' | 'Xero' | 'Wave';

type SyncLog = {
  id: string;
  createdAt: string;
  provider: string;
  status: string;
  source?: string;
  entity?: { type?: string; id?: string; name?: string; amount?: number; status?: string } | null;
};

export default function SUAccountingSyncLogs() {
  const [logs, setLogs] = React.useState<SyncLog[]>([]);
  const [provider, setProvider] = React.useState<Provider>('all');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = provider && provider !== 'all' ? `?provider=${encodeURIComponent(provider)}` : '';
      const res = await fetch(`/api/sync-logs${qs}`, { credentials: 'include', cache: 'no-store' });
      const data = res.ok ? await res.json() : [];
      setLogs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  React.useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const details = `${l.entity?.name || ''} ${l.entity?.type || ''} ${l.entity?.id || ''} ${l.source || ''}`.toLowerCase();
    return details.includes(q) || String(l.provider || '').toLowerCase().includes(q);
  });

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Accounting Sync Logs</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Provider</InputLabel>
              <Select label="Provider" value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
                <MenuItem value="all">All Providers</MenuItem>
                <MenuItem value="QuickBooks">QuickBooks</MenuItem>
                <MenuItem value="Xero">Xero</MenuItem>
                <MenuItem value="Wave">Wave</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" placeholder="Search details or provider" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 260 }} />
            <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
            <Button variant="outlined" component="a" href={`/api/admin/integrations/logs/export?provider=${encodeURIComponent(provider)}`}>Export CSV</Button>
          </Stack>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id} hover>
                <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                <TableCell>{l.provider}</TableCell>
                <TableCell>{l.entity?.type || '—'} {l.entity?.id ? `#${l.entity.id}` : ''}</TableCell>
                <TableCell sx={{ maxWidth: 480, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l.entity?.name ? `${l.entity.name}` : ''}
                  {l.entity?.amount ? ` · $${l.entity.amount}` : ''}
                  {l.entity?.status ? ` · ${l.entity.status}` : ''}
                </TableCell>
                <TableCell>{l.source || '—'}</TableCell>
                <TableCell>
                  {String(l.status).toLowerCase() === 'success' || String(l.status).toLowerCase() === 'ok'
                    ? <Chip size="small" color="success" label="Success" />
                    : String(l.status).toLowerCase() === 'failed'
                    ? <Chip size="small" color="error" label="Error" />
                    : <Chip size="small" color="warning" label={String(l.status)} />}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">No logs found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
