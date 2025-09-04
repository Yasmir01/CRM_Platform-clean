import * as React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, Button, TextField, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';

type AutoPayItem = {
  id: string;
  tenantId: string;
  propertyId?: string | null;
  dayOfMonth: number;
  active: boolean;
  amountType?: string | null;
  amountValue?: number | null;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name?: string | null; email: string } | null;
  property?: { id: string; address: string } | null;
};

const AMOUNT_TYPES = [
  { value: 'FULL_RENT', label: 'Full Rent' },
  { value: 'FIXED', label: 'Fixed Amount' },
  { value: 'PERCENTAGE', label: 'Percentage' },
];

export default function AutoPayOversight() {
  const [rows, setRows] = React.useState<AutoPayItem[]>([]);
  const [edited, setEdited] = React.useState<Record<string, Partial<AutoPayItem>>>({});
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch('/api/admin/autopay', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  function onFieldChange(id: string, patch: Partial<AutoPayItem>) {
    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } as AutoPayItem : r)));
  }

  async function saveRow(id: string) {
    const patch = edited[id];
    if (!patch) return;
    await fetch('/api/admin/autopay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, active: patch.active, dayOfMonth: patch.dayOfMonth, amountType: patch.amountType, amountValue: patch.amountValue }),
    });
    setEdited((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    onFieldChange(id, { active });
    await fetch('/api/admin/autopay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, active }),
    });
  }

  async function deleteRow(id: string) {
    await fetch('/api/admin/autopay', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    setRows((prev) => prev.filter((r) => r.id !== id));
    setEdited((prev) => { const { [id]: _, ...rest } = prev; return rest; });
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>AutoPay Oversight</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">Day</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const isEdited = Boolean(edited[r.id]);
              const showValue = (r.amountType || 'FULL_RENT') !== 'FULL_RENT';
              return (
                <TableRow key={r.id} hover>
                  <TableCell>{r.tenant?.name || r.tenant?.email || r.tenantId}</TableCell>
                  <TableCell>{r.property?.address || r.propertyId || '-'}</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        label="Type"
                        value={(r.amountType || 'FULL_RENT') as any}
                        onChange={(e) => onFieldChange(r.id, { amountType: e.target.value as any, amountValue: (e.target.value as any) === 'FULL_RENT' ? null : r.amountValue })}
                      >
                        {AMOUNT_TYPES.map((t) => (
                          <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 140 }}>
                    {showValue ? (
                      <TextField
                        size="small"
                        type="number"
                        inputProps={{ step: r.amountType === 'PERCENTAGE' ? '0.1' : '1', min: 0 }}
                        value={r.amountValue ?? ''}
                        onChange={(e) => onFieldChange(r.id, { amountValue: e.target.value === '' ? null : Number(e.target.value) })}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 120 }}>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 1, max: 31 }}
                      value={r.dayOfMonth}
                      onChange={(e) => onFieldChange(r.id, { dayOfMonth: Number(e.target.value) })}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch checked={r.active} onChange={(_, c) => toggleActive(r.id, c)} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="contained" size="small" onClick={() => saveRow(r.id)} disabled={!isEdited}>Save</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => deleteRow(r.id)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
