import React, { useEffect, useState } from 'react';
import { Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

type Request = { id: string; title: string; description: string; status: string; priority: string; createdAt: string };

export default function MaintenanceRequests() {
  const [items, setItems] = useState<Request[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/maintenance/list', { credentials: 'include' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    })();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Maintenance Requests</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.title}</TableCell>
              <TableCell><Chip size="small" label={r.priority} /></TableCell>
              <TableCell><Chip size="small" color={r.status === 'completed' ? 'success' : r.status === 'in_progress' ? 'warning' : 'default'} label={r.status} /></TableCell>
              <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}><Typography variant="body2" color="text.secondary">No requests found.</Typography></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
