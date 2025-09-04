import React, { useEffect, useState } from 'react';
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography, Stack, Select, MenuItem, Button, TextField, CircularProgress, Checkbox } from '@mui/material';
import AssignVendor from '../components/AssignVendor';
import InvoiceExportControls from '../components/InvoiceExport';

 type Request = { id: string; title: string; description: string; status: string; priority: string; createdAt: string; category?: string; tenant?: { name?: string; email?: string }; property?: { address?: string }; vendorId?: string | null; vendor?: { id: string; name?: string | null; email?: string | null } | null; deadline?: string | null; escalated?: boolean; escalatedAt?: string | null };

 function StatusDropdown({ id, current, onChange }: { id: string; current: string; onChange: () => void }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      setOk(false);
      await fetch(`/api/maintenance/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      setOk(true);
      onChange();
      setTimeout(() => setOk(false), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Select size="small" value={current} disabled={loading} onChange={(e) => updateStatus(String(e.target.value))}>
        <MenuItem value="open">Open</MenuItem>
        <MenuItem value="in_progress">In Progress</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="overdue">Overdue</MenuItem>
        <MenuItem value="closed">Closed</MenuItem>
      </Select>
      {loading ? <CircularProgress size={16} /> : ok ? <span aria-label="saved" title="Saved">✅</span> : null}
    </Stack>
  );
}

function VendorDropdown({ requestId, currentVendor, onChange }: { requestId: string; currentVendor?: any; onChange: () => void }) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>(currentVendor?.id || '');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVendors = async () => {
      const res = await fetch('/api/vendors/list', { credentials: 'include' });
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    };
    fetchVendors();
  }, []);

  const updateVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      await fetch(`/api/maintenance/vendor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vendorId: vendorId || null }),
      });
      setSelected(vendorId);
      onChange();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select size="small" value={selected} disabled={loading} onChange={(e) => updateVendor(String(e.target.value))} displayEmpty sx={{ minWidth: 180 }}>
      <MenuItem value=""><em>Unassigned</em></MenuItem>
      {vendors.map((v) => (
        <MenuItem key={v.id} value={v.id}>{v.name || v.email || v.id}</MenuItem>
      ))}
    </Select>
  );
}

export default function MaintenanceRequests() {
   const [items, setItems] = useState<Request[]>([]);
   const [status, setStatus] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

   const load = async () => {
     const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (propertyId) params.set('propertyId', propertyId);
    if (vendorId) params.set('vendorId', vendorId);
    const res = await fetch(`/api/maintenance/list?${params.toString()}`, { credentials: 'include' });
     const data = await res.json();
     setItems(Array.isArray(data) ? data : []);
     setSelected([]);
   };

   useEffect(() => { load(); }, [status, propertyId, vendorId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/vendors/list', { credentials: 'include' });
        const data = await res.json();
        setVendors(Array.isArray(data) ? data : []);
      } catch {
        setVendors([]);
      }
    })();
  }, []);

   const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/maintenance/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: newStatus }) });
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allSelected = selected.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && selected.length < items.length;

  const bulkUpdate = async (nextStatus: string) => {
    await fetch('/api/maintenance/status/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: selected, status: nextStatus }),
    });
    await load();
  };

  const bulkReassignVendor = async (newVendorId: string) => {
    await fetch('/api/maintenance/vendor/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: selected, vendorId: newVendorId || null }),
    });
    await load();
  };

   return (
     <Box sx={{ p: 2 }}>
       <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
       <Typography variant="h5">Maintenance Requests</Typography>
       <Button variant="text" href="/crm/maintenance-kanban">Open Kanban</Button>
     </Stack>

      {selected.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selected.length} selected</Typography>
          <Select size="small" displayEmpty value="" onChange={(e) => { const v = String(e.target.value); if (v) bulkUpdate(v); }} sx={{ minWidth: 220 }}>
            <MenuItem value=""><em>Bulk Update Status</em></MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="overdue">Overdue</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
          <Select size="small" displayEmpty value="" onChange={(e) => { const v = String(e.target.value); if (v) bulkReassignVendor(v); }} sx={{ minWidth: 220 }}>
            <MenuItem value=""><em>Bulk Reassign Vendor</em></MenuItem>
            {vendors.map((v) => (
              <MenuItem key={v.id} value={v.id}>{v.name || v.email || v.id}</MenuItem>
            ))}
          </Select>
          <Button size="small" onClick={() => setSelected([])}>Clear</Button>
        </Stack>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
       <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(String(e.target.value))} sx={{ minWidth: 180 }}>
         <MenuItem value=""><em>All Status</em></MenuItem>
         <MenuItem value="open">Open</MenuItem>
         <MenuItem value="in_progress">In Progress</MenuItem>
         <MenuItem value="completed">Completed</MenuItem>
         <MenuItem value="overdue">Overdue</MenuItem>
         <MenuItem value="closed">Closed</MenuItem>
       </Select>
       <TextField size="small" label="Property ID" value={propertyId} onChange={(e) => setPropertyId(String(e.target.value))} sx={{ minWidth: 220 }} />
       <TextField size="small" label="Vendor ID" value={vendorId} onChange={(e) => setVendorId(String(e.target.value))} sx={{ minWidth: 220 }} />
       <Button variant="outlined" onClick={load}>Refresh</Button>
       <InvoiceExportControls />
     </Stack>

       <Table size="small">
         <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someSelected}
                checked={allSelected}
                onChange={() => {
                  if (allSelected) setSelected([]);
                  else setSelected(items.map((r) => r.id));
                }}
              />
            </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Tenant</TableCell>
            <TableCell>Property</TableCell>
            <TableCell>Vendor</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Deadline</TableCell>
            <TableCell>Assign</TableCell>
            <TableCell>Actions</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {items.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell padding="checkbox">
                <Checkbox checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} />
              </TableCell>
              <TableCell>{r.id.slice(0,6)}…</TableCell>
               <TableCell>{r.tenant?.name || r.tenant?.email || '—'}</TableCell>
               <TableCell>{r.property?.address || '—'}</TableCell>
              <TableCell>
                <VendorDropdown requestId={r.id} currentVendor={r.vendor} onChange={load} />
              </TableCell>
              <TableCell>{r.category || '—'}</TableCell>
              <TableCell><Chip size="small" label={r.priority} /></TableCell>
              <TableCell>
                <StatusDropdown id={r.id} current={r.status} onChange={load} />
                {/* Escalation/Overdue visual marker */}
                <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                  {r.deadline && new Date(r.deadline) < new Date() && r.status !== 'completed' ? (
                    <span style={{ color: '#b91c1c', fontWeight: 700 }}>Overdue{r.escalated ? ' 🚨' : ''}</span>
                  ) : r.escalated ? (
                    <span>Escalated 🚨</span>
                  ) : null}
                </Typography>
              </TableCell>
              <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
              <TableCell>{r.deadline ? new Date(r.deadline).toLocaleDateString() : '—'}</TableCell>
              <TableCell><AssignVendor requestId={r.id} /></TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                   {(r.status === 'open' || r.status === 'in_progress') && (
                     <Button size="small" variant="contained" color="success" onClick={() => updateStatus(r.id, 'completed')}>Mark Completed</Button>
                   )}
                   {r.status !== 'closed' && (
                    <Button size="small" variant="outlined" color="secondary" onClick={async () => { await fetch(`/api/admin/maintenance/${r.id}/close`, { method: 'POST', credentials: 'include' }); load(); }}>Close</Button>
                  )}
                 </Stack>
               </TableCell>
             </TableRow>
           ))}
           {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={12}><Typography variant="body2" color="text.secondary">No requests found.</Typography></TableCell>
            </TableRow>
          )}
         </TableBody>
       </Table>
     </Box>
   );
 }
