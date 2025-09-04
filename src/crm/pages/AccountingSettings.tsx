import * as React from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';

type Provider = 'quickbooks' | 'xero' | 'freshbooks';

export default function AccountingSettings() {
  const [status, setStatus] = React.useState<any>(null);
  const [provider, setProvider] = React.useState<Provider>('quickbooks');
  const [accounts, setAccounts] = React.useState<any[]>([]);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch('/api/accounting/providers').then(r => r.json()).then(setStatus).catch(() => setStatus(null));
  }, []);

  const connect = (p: Provider) => {
    window.location.href = `/api/accounting/connect/${p}`;
  };

  const loadAccounts = async () => {
    const res = await fetch(`/api/accounting/accounts/${provider}`);
    const data = await res.json();
    setAccounts(data);
  };

  const saveMap = async (localType: string, acct: string) => {
    await fetch('/api/admin/coa-map', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, localType, providerAcct: acct }),
    });
    alert('Mapping saved');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Accounting Integrations</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(['quickbooks','xero','freshbooks'] as Provider[]).map((p) => {
          const connected = status?.connections?.some((c: any) => c.provider === p && c.connected);
          return (
            <Grid item xs={12} md={4} key={p}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{p}</Typography>
                <Typography variant="body2" color="text.secondary">{connected ? 'Connected' : 'Not connected'}</Typography>
                <Button variant="contained" sx={{ mt: 1 }} onClick={() => connect(p)}>
                  {connected ? 'Reconnect' : 'Connect'}
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Chart of Accounts Mapping</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl size="small">
            <InputLabel id="provider-label">Provider</InputLabel>
            <Select labelId="provider-label" value={provider} label="Provider" onChange={(e) => setProvider(e.target.value as Provider)}>
              <MenuItem value="quickbooks">QuickBooks</MenuItem>
              <MenuItem value="xero">Xero</MenuItem>
              <MenuItem value="freshbooks">FreshBooks</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={loadAccounts}>Load Accounts</Button>
        </Box>
        <Grid container spacing={1}>
          {['rent_income','expense','fee','refund','security_deposit'].map((lt) => (
            <Grid item xs={12} md={6} key={lt}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ width: 180, textTransform: 'capitalize' }}>{lt.replace('_', ' ')}</Typography>
                <Select size="small" value={mapping[lt] || ''} onChange={(e) => setMapping({ ...mapping, [lt]: e.target.value as string })} sx={{ flex: 1 }}>
                  <MenuItem value="">Select account</MenuItem>
                  {accounts.map((a) => (
                    <MenuItem key={a.id} value={a.id}>{a.name} ({a.type})</MenuItem>
                  ))}
                </Select>
                <Button variant="contained" onClick={() => saveMap(lt, mapping[lt])}>Save</Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
