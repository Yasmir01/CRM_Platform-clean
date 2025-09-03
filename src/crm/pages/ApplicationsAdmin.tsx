import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export default function ApplicationsAdmin() {
  const [apps, setApps] = useState<any[]>([]);
  useEffect(() => { (async () => { const r = await fetch('/api/applications/org', { credentials: 'include' }); setApps(await r.json()); })(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const r = await fetch('/api/applications/update', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (!r.ok) { const d = await r.json(); alert(d?.error || 'Failed'); return; }
    window.location.reload();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Tenant Applications</Typography>
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Move In</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apps.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.applicantName}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.moveInDate ? String(a.moveInDate).slice(0, 10) : ''}</TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" color="success" onClick={() => updateStatus(a.id, 'approved')}>Approve</Button>
                        <Button size="small" variant="contained" color="error" onClick={() => updateStatus(a.id, 'denied')}>Deny</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
