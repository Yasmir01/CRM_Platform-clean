import React, { useEffect, useState } from 'react';
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography, Stack, Select, MenuItem, Button } from '@mui/material';
import AssignVendor from '../components/AssignVendor';

 type Request = { id: string; title: string; description: string; status: string; priority: string; createdAt: string; category?: string; tenant?: { name?: string; email?: string }; property?: { address?: string } };

 export default function MaintenanceRequests() {
   const [items, setItems] = useState<Request[]>([]);
   const [status, setStatus] = useState('');

   const load = async () => {
     const params = new URLSearchParams();
     if (status) params.set('status', status);
     const res = await fetch(`/api/maintenance/list?${params.toString()}`, { credentials: 'include' });
     const data = await res.json();
     setItems(Array.isArray(data) ? data : []);
   };

   useEffect(() => { load(); }, [status]);

   const updateStatus = async (id: string, newStatus: string) => {
     await fetch(`/api/maintenance/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: newStatus }) });
     load();
   };

   return (
     <Box sx={{ p: 2 }}>
       <Typography variant="h5" sx={{ mb: 2 }}>Maintenance Requests</Typography>

       <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
         <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(String(e.target.value))} sx={{ minWidth: 180 }}>
           <MenuItem value=""><em>All Status</em></MenuItem>
           <MenuItem value="open">Open</MenuItem>
           <MenuItem value="in_progress">In Progress</MenuItem>
           <MenuItem value="completed">Completed</MenuItem>
           <MenuItem value="closed">Closed</MenuItem>
         </Select>
         <Button variant="outlined" onClick={load}>Refresh</Button>
       </Stack>

       <Table size="small">
         <TableHead>
           <TableRow>
             <TableCell>ID</TableCell>
             <TableCell>Tenant</TableCell>
             <TableCell>Property</TableCell>
             <TableCell>Category</TableCell>
             <TableCell>Priority</TableCell>
             <TableCell>Status</TableCell>
             <TableCell>Created</TableCell>
             <TableCell>Actions</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {items.map((r) => (
             <TableRow key={r.id} hover>
               <TableCell>{r.id.slice(0,6)}…</TableCell>
               <TableCell>{r.tenant?.name || r.tenant?.email || '—'}</TableCell>
               <TableCell>{r.property?.address || '—'}</TableCell>
               <TableCell>{r.category || '—'}</TableCell>
               <TableCell><Chip size="small" label={r.priority} /></TableCell>
               <TableCell><Chip size="small" color={r.status === 'completed' ? 'success' : r.status === 'in_progress' ? 'warning' : 'default'} label={r.status} /></TableCell>
               <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
               <TableCell>
                 <Stack direction="row" spacing={1}>
                   {(r.status === 'open' || r.status === 'in_progress') && (
                     <Button size="small" variant="contained" color="success" onClick={() => updateStatus(r.id, 'completed')}>Mark Completed</Button>
                   )}
                   {r.status !== 'closed' && (
                     <Button size="small" variant="outlined" color="secondary" onClick={() => updateStatus(r.id, 'closed')}>Close</Button>
                   )}
                 </Stack>
               </TableCell>
             </TableRow>
           ))}
           {items.length === 0 && (
             <TableRow>
               <TableCell colSpan={8}><Typography variant="body2" color="text.secondary">No requests found.</Typography></TableCell>
             </TableRow>
           )}
         </TableBody>
       </Table>
     </Box>
   );
 }
