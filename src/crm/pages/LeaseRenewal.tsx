import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Link } from '@mui/material';

export default function LeaseRenewal() {
  const [oldId, setOldId] = useState('');
  const [percent, setPercent] = useState<number>(5);
  const [newStart, setNewStart] = useState('2025-10-01');
  const [newEnd, setNewEnd] = useState('2026-09-30');
  const [result, setResult] = useState<any>(null);

  const generate = async () => {
    const r = await fetch('/api/leases/renew', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldLeaseId: oldId, rentIncreasePercent: percent, newStart, newEnd }) });
    const d = await r.json();
    setResult(d);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Lease Renewal Generator</Typography>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField label="Old Lease ID" value={oldId} onChange={(e) => setOldId(e.target.value)} fullWidth />
              <TextField label="% Rent Increase" type="number" value={percent} onChange={(e) => setPercent(parseInt(e.target.value || '0', 10))} fullWidth />
              <TextField label="New Start" type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="New End" type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <Button variant="contained" onClick={generate}>Generate Renewal</Button>
            </Stack>
          </CardContent>
        </Card>

        {result && result.renewal && (
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography>Old Rent: ${result.oldRent}</Typography>
                <Typography>New Rent: ${result.newRent}</Typography>
                <Typography>New Draft Lease ID: {result.renewal.id}</Typography>
                <Link href={`/crm/send-lease?leaseId=${encodeURIComponent(result.renewal.id)}`} underline="hover">Send Renewal for Signature</Link>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
