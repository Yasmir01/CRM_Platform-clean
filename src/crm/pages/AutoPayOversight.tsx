import * as React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, Button, TextField, Select, MenuItem, FormControl, InputLabel, Stack, Chip } from '@mui/material';

type AutoPayItem = {
  id: string;
  tenantId: string;
  propertyId?: string | null;
  leaseId?: string | null;
  dayOfMonth: number;
  active: boolean;
  amountType?: string | null;
  amountValue?: number | null;
  amount?: number | null;
  frequency?: string | null;
  splitEmails?: string[];
  tenantName?: string;
  propertyName?: string;
  leaseName?: string;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name?: string | null; email: string } | null;
  property?: { id: string; address: string } | null;
  lease?: { id: string; unit?: { number: string } | null } | null;
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
  const [filterText, setFilterText] = React.useState('');
  const [propertyFilter, setPropertyFilter] = React.useState<string>('all');
  const [leaseFilter, setLeaseFilter] = React.useState<string>('all');

  const load = React.useCallback(() => {
    setLoading(true);
    fetch('/api/admin/autopay', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const uniqueProperties = React.useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((a) => {
      const id = a.propertyId || '';
      if (!id) return;
      const name = a.propertyName || a.property?.address || id;
      if (!map.has(id)) map.set(id, name);
    });
    return Array.from(map.entries());
  }, [rows]);

  const uniqueLeases = React.useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((a) => {
      const id = a.leaseId || (a.lease?.id ?? '');
      if (!id) return;
      const name = a.leaseName || (a.lease?.unit?.number ? String(a.lease.unit.number) : id);
      if (!map.has(id)) map.set(id, name);
    });
    return Array.from(map.entries());
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return rows.filter((a) => {
      const t = (a.tenantName || a.tenant?.name || a.tenant?.email || a.tenantId).toString().toLowerCase();
      const p = (a.propertyName || a.property?.address || a.propertyId || '').toString().toLowerCase();
      const l = (a.leaseName || (a.lease?.unit?.number ? String(a.lease.unit.number) : a.leaseId || '')).toString().toLowerCase();
      const matchesText = !q || t.includes(q) || p.includes(q) || l.includes(q);
      const matchesProperty = propertyFilter === 'all' || a.propertyId === propertyFilter;
      const matchesLease = leaseFilter === 'all' || (a.leaseId || a.lease?.id) === leaseFilter;
      return matchesText && matchesProperty && matchesLease;
    });
  }, [rows, filterText, propertyFilter, leaseFilter]);

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
          <TextField
            size="small"
            placeholder="Search by tenant, property, or lease"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ minWidth: 280 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Property</InputLabel>
            <Select label="Property" value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}>
              <MenuItem value="all">All Properties</MenuItem>
              {uniqueProperties.map(([id, name]) => (
                <MenuItem key={id} value={id}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Lease</InputLabel>
            <Select label="Lease" value={leaseFilter} onChange={(e) => setLeaseFilter(e.target.value)}>
              <MenuItem value="all">All Leases</MenuItem>
              {uniqueLeases.map(([id, name]) => (
                <MenuItem key={id} value={id}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Lease</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Split With</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">Day</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((r) => {
              const isEdited = Boolean(edited[r.id]);
              const showValue = (r.amountType || 'FULL_RENT') !== 'FULL_RENT';
              const leaseLabel = r.leaseName || (r.lease?.unit?.number ? String(r.lease.unit.number) : r.leaseId || '—');
              const tenantLabel = r.tenantName || r.tenant?.name || r.tenant?.email || r.tenantId;
              const propertyLabel = r.propertyName || r.property?.address || r.propertyId || '—';
              const amountDisplay = (typeof r.amount === 'number') ? r.amount : (showValue && typeof r.amountValue === 'number' ? r.amountValue : NaN);
              const splitDisplay = Array.isArray(r.splitEmails) && r.splitEmails.length > 0 ? r.splitEmails.join(', ') : '—';
              const frequency = (r.frequency || 'monthly');
              return (
                <TableRow key={r.id} hover>
                  <TableCell>{tenantLabel}</TableCell>
                  <TableCell>{propertyLabel}</TableCell>
                  <TableCell>{leaseLabel}</TableCell>
                  <TableCell align="right">{Number.isFinite(amountDisplay) ? `$${Number(amountDisplay).toFixed(2)}` : '—'}</TableCell>
                  <TableCell>{frequency}</TableCell>
                  <TableCell>{splitDisplay}</TableCell>
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
                    <Chip label={r.active ? 'Active' : 'Suspended'} color={r.active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="contained" size="small" onClick={() => saveRow(r.id)} disabled={!isEdited}>Save</Button>
                      {r.active ? (
                        <Button variant="outlined" size="small" onClick={() => toggleActive(r.id, false)}>Suspend</Button>
                      ) : (
                        <Button variant="outlined" size="small" onClick={() => toggleActive(r.id, true)}>Reactivate</Button>
                      )}
                      <Button variant="outlined" color="error" size="small" onClick={() => deleteRow(r.id)}>Cancel</Button>
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
