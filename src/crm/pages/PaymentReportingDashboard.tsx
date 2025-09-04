import * as React from 'react';
import { Box, Paper, Typography, Stack, Button, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PaymentSummary { month: string; collected: number; outstanding: number; }
interface PaymentRecord { id: string; tenantName: string; propertyId: string; propertyName: string; leaseId: string; leaseName: string; amount: number; status: 'paid' | 'outstanding'; date: string; }
interface PropertyOption { id: string; name: string; }
interface LeaseOption { id: string; name: string; propertyId: string; }

export default function PaymentReportingDashboard() {
  const [summary, setSummary] = React.useState<PaymentSummary[]>([]);
  const [records, setRecords] = React.useState<PaymentRecord[]>([]);
  const [properties, setProperties] = React.useState<PropertyOption[]>([]);
  const [leases, setLeases] = React.useState<LeaseOption[]>([]);
  const [selectedLease, setSelectedLease] = React.useState<string>('');
  const [tenantFilter, setTenantFilter] = React.useState<string>('');
  const [selectedProperty, setSelectedProperty] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProperty) params.set('property', selectedProperty);
      if (selectedLease) params.set('lease', selectedLease);
      if (tenantFilter) params.set('tenant', tenantFilter);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const [sRes, rRes] = await Promise.all([
        fetch(`/api/admin/payments/summary${qs}`, { credentials: 'include' }),
        fetch(`/api/admin/payments/records${qs}`, { credentials: 'include' }),
      ]);
      const sData = sRes.ok ? await sRes.json() : [];
      const rData = rRes.ok ? await rRes.json() : [];
      setSummary(Array.isArray(sData) ? sData : []);
      setRecords(Array.isArray(rData) ? rData : []);
    } finally {
      setLoading(false);
    }
  }, [selectedProperty]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    fetch('/api/admin/properties', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProperties(Array.isArray(d) ? d : []))
      .catch(() => setProperties([]));
    fetch('/api/admin/leases', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLeases(Array.isArray(d) ? d : []))
      .catch(() => setLeases([]));
  }, []);

  const exportCSV = React.useCallback(() => {
    const headers = ['Tenant','Property','Lease','Amount','Status','Date'];
    const rows = records.map((r) => [r.tenantName, r.propertyName, r.leaseName, `$${r.amount.toFixed(2)}`, r.status, new Date(r.date).toLocaleDateString()]);
    const content = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [records]);

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Payment Trends</Typography>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="collected" fill="#4CAF50" name="Collected" />
              <Bar dataKey="outstanding" fill="#F44336" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Records</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Filter by Property</InputLabel>
              <Select label="Filter by Property" value={selectedProperty} onChange={(e) => { setSelectedProperty(e.target.value); setSelectedLease(''); }}>
                <MenuItem value="">All Properties</MenuItem>
                {properties.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Filter by Lease</InputLabel>
              <Select label="Filter by Lease" value={selectedLease} onChange={(e) => setSelectedLease(e.target.value)} disabled={!selectedProperty}>
                <MenuItem value="">All Leases</MenuItem>
                {leases.filter((l) => l.propertyId === selectedProperty).map((l) => (
                  <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel shrink>Tenant Contains</InputLabel>
              <Box sx={{ mt: 3, position: 'relative' }}>
                <input value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} placeholder="Search tenant" style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--mui-palette-divider)' }} />
              </Box>
            </FormControl>
            <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
            <Button variant="outlined" onClick={exportCSV}>Export CSV</Button>
            <Button variant="outlined" onClick={async () => {
              const res = await fetch('/api/admin/payments/export-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ records }) });
              if (!res.ok) return;
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'payment_report.pdf';
              a.click();
              URL.revokeObjectURL(url);
            }}>Export PDF</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Lease</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.tenantName}</TableCell>
                <TableCell>{r.propertyName}</TableCell>
                <TableCell>{r.leaseName}</TableCell>
                <TableCell align="right">${r.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {r.status === 'paid' ? (
                    <Typography component="span" color="success.main">Paid</Typography>
                  ) : (
                    <Typography component="span" color="error.main">Outstanding</Typography>
                  )}
                </TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
