import * as React from 'react';
import { Box, Typography, Paper, Stack, Chip, TextField, MenuItem, Button, FormControlLabel, Checkbox } from '@mui/material';

type Rule = {
  id: string;
  scope: 'GLOBAL' | 'PROPERTY';
  propertyId?: string | null;
  gracePeriod: number;
  feeType: 'FIXED' | 'PERCENTAGE';
  feeAmount: number;
  isActive: boolean;
};

export default function LateFeeRulesDashboard() {
  const [rules, setRules] = React.useState<Rule[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [form, setForm] = React.useState<Partial<Rule>>({ scope: 'GLOBAL', feeType: 'FIXED', gracePeriod: 3, feeAmount: 50, isActive: true });
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch('/api/admin/latefees/rules', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRules(Array.isArray(d) ? d : []))
      .catch(() => setRules([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function addRule() {
    if (!form.scope || !form.feeType || typeof form.gracePeriod !== 'number' || typeof form.feeAmount !== 'number') return;
    if (form.scope === 'PROPERTY' && !form.propertyId) { alert('propertyId is required for PROPERTY scope'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/latefees/rules', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          scope: form.scope,
          propertyId: form.scope === 'PROPERTY' ? (form.propertyId || null) : null,
          gracePeriod: form.gracePeriod,
          feeType: form.feeType,
          feeAmount: form.feeAmount,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      setRules((prev) => [data, ...prev]);
      setForm({ scope: 'GLOBAL', feeType: 'FIXED', gracePeriod: 3, feeAmount: 50, isActive: true, propertyId: '' });
    } catch {
      alert('Failed to add rule');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Late Fee Rules</Typography>
        {loading ? (
          <Typography variant="body2">Loading late fee rules...</Typography>
        ) : rules.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No rules configured.</Typography>
        ) : (
          <Stack spacing={1}>
            {rules.map((r) => (
              <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.scope === 'GLOBAL' ? 'Global Rule' : `Property Rule (${r.propertyId})`}</Typography>
                  <Typography variant="caption" color="text.secondary">Grace Period: {r.gracePeriod} days</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    Fee: {r.feeType === 'FIXED' ? `$${r.feeAmount.toFixed(2)}` : `${r.feeAmount}%`}
                  </Typography>
                </Box>
                <Chip size="small" label={r.isActive ? 'Active' : 'Inactive'} color={r.isActive ? 'default' : 'secondary'} />
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Add New Late Fee Rule</Typography>
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <TextField select label="Scope" value={form.scope || ''} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as any }))} size="small" sx={{ minWidth: 160 }}>
            <MenuItem value="GLOBAL">Global</MenuItem>
            <MenuItem value="PROPERTY">Property</MenuItem>
          </TextField>
          <TextField label="Property ID" value={form.propertyId || ''} onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))} size="small" disabled={form.scope !== 'PROPERTY'} sx={{ minWidth: 240 }} />
          <TextField label="Grace Period (days)" type="number" value={form.gracePeriod ?? ''} onChange={(e) => setForm((f) => ({ ...f, gracePeriod: Number(e.target.value) }))} size="small" sx={{ minWidth: 200 }} />
          <TextField select label="Fee Type" value={form.feeType || ''} onChange={(e) => setForm((f) => ({ ...f, feeType: e.target.value as any }))} size="small" sx={{ minWidth: 200 }}>
            <MenuItem value="FIXED">Fixed ($)</MenuItem>
            <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
          </TextField>
          <TextField label="Fee Amount" type="number" value={form.feeAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, feeAmount: Number(e.target.value) }))} size="small" sx={{ minWidth: 160 }} />
          <FormControlLabel control={<Checkbox checked={!!form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />} label="Active" />
          <Button variant="contained" onClick={addRule} disabled={submitting}>Add Rule</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
