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
  const [editing, setEditing] = React.useState<Record<string, Partial<Rule>>>({});

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
            {rules.map((r) => {
              const e = editing[r.id];
              const isEditing = !!e;
              return (
                <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    {isEditing ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField label="Grace" type="number" size="small" value={e.gracePeriod ?? r.gracePeriod} onChange={(ev) => setEditing((prev) => ({ ...prev, [r.id]: { ...e, gracePeriod: Number(ev.target.value) } }))} sx={{ minWidth: 120 }} />
                        <TextField select label="Type" size="small" value={e.feeType ?? r.feeType} onChange={(ev) => setEditing((prev) => ({ ...prev, [r.id]: { ...e, feeType: ev.target.value as any } }))} sx={{ minWidth: 160 }}>
                          <MenuItem value="FIXED">Fixed ($)</MenuItem>
                          <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                        </TextField>
                        <TextField label="Amount" type="number" size="small" value={e.feeAmount ?? r.feeAmount} onChange={(ev) => setEditing((prev) => ({ ...prev, [r.id]: { ...e, feeAmount: Number(ev.target.value) } }))} sx={{ minWidth: 140 }} />
                      </Stack>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.scope === 'GLOBAL' ? 'Global Rule' : `Property Rule (${r.propertyId})`}</Typography>
                        <Typography variant="caption" color="text.secondary">Grace Period: {r.gracePeriod} days</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          Fee: {r.feeType === 'FIXED' ? `$${r.feeAmount.toFixed(2)}` : `${r.feeAmount}%`}
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={r.isActive ? 'Active' : 'Inactive'} color={r.isActive ? 'default' : 'secondary'} />
                    {isEditing ? (
                      <>
                        <Button size="small" variant="contained" onClick={async () => {
                          const patch = editing[r.id];
                          const res = await fetch(`/api/admin/latefees/rules/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(patch) });
                          const updated = await res.json();
                          setRules((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
                          setEditing((prev) => { const { [r.id]: _, ...rest } = prev; return rest; });
                        }}>Save</Button>
                        <Button size="small" variant="outlined" onClick={() => setEditing((prev) => { const { [r.id]: _, ...rest } = prev; return rest; })}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="small" variant="outlined" onClick={() => setEditing((prev) => ({ ...prev, [r.id]: {} }))}>Edit</Button>
                        <Button size="small" variant={r.isActive ? 'outlined' : 'contained'} color={r.isActive ? 'warning' : 'primary'} onClick={async () => {
                          const res = await fetch(`/api/admin/latefees/rules/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ isActive: !r.isActive }) });
                          const updated = await res.json();
                          setRules((prev) => prev.map((x) => (x.id === r.id ? updated : x)));
                        }}>{r.isActive ? 'Deactivate' : 'Activate'}</Button>
                      </>
                    )}
                  </Stack>
                </Box>
              );
            })}
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
