import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export default function AutopayFailures() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async () => { const r = await fetch('/api/autopay/failures', { credentials: 'include' }); setRows(await r.json()); })(); }, []);

  const retry = async (id: string) => {
    await fetch(`/api/autopay/retry?id=${encodeURIComponent(id)}`, { method: 'POST', credentials: 'include' });
    alert('Retry attempted'); window.location.reload();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Failed Autopay Attempts</Typography>
        <Card>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Error</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.tenant?.email || r.tenantId}</TableCell>
                    <TableCell>${Number(r.amount).toFixed(2)}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.errorMsg}</TableCell>
                    <TableCell><Button size="small" variant="contained" onClick={() => retry(r.id)}>Retry</Button></TableCell>
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
