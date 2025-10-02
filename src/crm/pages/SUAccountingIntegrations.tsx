import * as React from 'react';
import { Box, Paper, Typography, Stack, Switch, TextField, Button, Chip } from '@mui/material';

type ProviderName = 'QuickBooks' | 'Xero' | 'Wave';

type IntegrationConfig = {
  provider: ProviderName;
  providerId?: 'quickbooks' | 'xero' | 'wave';
  enabled: boolean;
  apiKey?: string;
  lastSync?: string;
  status?: 'ok' | 'error' | 'pending';
  autoSync?: 'manual' | 'daily' | 'weekly';
  alertOnError?: boolean;
};

export default function SUAccountingIntegrations() {
  const [items, setItems] = React.useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch('/api/admin/integrations/accounting', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function toggle(p: ProviderName, enabled: boolean) {
    await fetch(`/api/admin/integrations/accounting/${encodeURIComponent(p)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ enabled })
    });
    load();
  }

  function connect(p: ProviderName) {
    const id = p.toLowerCase();
    window.location.href = `/api/auth/${encodeURIComponent(id)}/start`;
  }

  async function disconnect(p: ProviderName) {
    const id = p.toLowerCase();
    await fetch(`/api/admin/integrations/accounting/${encodeURIComponent(id)}/disconnect`, { method: 'POST', credentials: 'include' });
    load();
  }

  async function updateConfig(p: ProviderName, payload: Partial<IntegrationConfig>) {
    await fetch(`/api/admin/integrations/accounting/${encodeURIComponent(p)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
    });
    load();
  }

  async function saveKey(p: ProviderName, apiKey: string) {
    await fetch(`/api/admin/integrations/accounting/${encodeURIComponent(p)}/key`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ apiKey })
    });
    load();
  }

  async function sync(p: ProviderName) {
    await fetch(`/api/admin/integrations/accounting/${encodeURIComponent(p)}/sync`, { method: 'POST', credentials: 'include' });
    load();
  }

  const statusChip = (s?: string) => s === 'ok' ? (<Chip size="small" color="success" label="OK" />) : s === 'error' ? (<Chip size="small" color="error" label="Error" />) : (<Chip size="small" color="warning" label="Pending" />);

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Accounting Integrations</Typography>
        <Stack spacing={2}>
          {items.map((i) => (
            <Box key={i.provider} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>{i.provider}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch checked={i.enabled} onChange={(_, c) => toggle(i.provider, c)} />
                  <Typography variant="body2">Enabled</Typography>
                  {!i.enabled ? (
                    <Button size="small" variant="outlined" onClick={() => connect(i.provider)}>Connect</Button>
                  ) : (
                    <Button size="small" color="error" onClick={() => disconnect(i.provider)}>Disconnect</Button>
                  )}
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField type="password" size="small" label="API Key" defaultValue={i.apiKey || ''} onBlur={(e) => saveKey(i.provider, e.target.value.trim())} disabled={!i.enabled} sx={{ maxWidth: 360 }} />
                  <Button variant="outlined" onClick={() => sync(i.provider)} disabled={!i.enabled}>Sync Now</Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField select size="small" label="Auto-Sync" value={i.autoSync || 'manual'} onChange={(e) => updateConfig(i.provider, { autoSync: e.target.value as any })} disabled={!i.enabled} sx={{ maxWidth: 200 }}>
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </TextField>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch checked={!!i.alertOnError} onChange={(_, c) => updateConfig(i.provider, { alertOnError: c })} disabled={!i.enabled} />
                    <Typography variant="body2">Alert on Error</Typography>
                  </Stack>
                  <Button variant="text" href={`/crm/super-admin/accounting-integrations/${(i.providerId || i.provider.toLowerCase())}/logs`}>View Logs</Button>
                  <Button variant="text" href={`/api/admin/integrations/accounting/${(i.providerId || i.provider.toLowerCase())}/status`} target="_blank">Status JSON</Button>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">Last Sync: {i.lastSync ? new Date(i.lastSync).toLocaleString() : 'Never'}</Typography>
                  {statusChip(i.status)}
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
