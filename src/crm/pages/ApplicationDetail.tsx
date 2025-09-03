import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      const a = await fetch(`/api/applications/get?id=${encodeURIComponent(id)}`, { credentials: 'include' }).then((r) => r.json());
      setApp(a);
      const s = await fetch(`/api/screening/by-app?appId=${encodeURIComponent(id)}`, { credentials: 'include' }).then((r) => r.json());
      setScreenings(s);
    })();
  }, [id]);

  const request = async (provider: string) => {
    await fetch('/api/screening/request', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId: id, provider }) });
    alert('Screening requested'); window.location.reload();
  };

  const decide = async (status: 'approved' | 'denied') => {
    await fetch('/api/applications/decision', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, note }),
    });
    alert(`Application ${status}`);
    window.location.reload();
  };

  if (!app) return <Box sx={{ p: 2 }}><Typography>Loading…</Typography></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Application – {app.applicantName}</Typography>

        <Card>
          <CardContent>
            <Typography variant="subtitle1">Screening</Typography>
            <Stack direction="row" spacing={1} sx={{ my: 1 }}>
              <Button variant="contained" onClick={() => request('transunion')}>Run TransUnion</Button>
              <Button variant="contained" color="secondary" onClick={() => request('checkr')}>Run Checkr</Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Provider</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Credit Score</TableCell>
                  <TableCell>Flags</TableCell>
                  <TableCell>Report</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {screenings.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.provider}</TableCell>
                    <TableCell>
                      {s.status}
                      {s.status === 'awaiting_consent' ? (
                        <Typography variant="body2" color="warning.main">Awaiting tenant consent</Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{s.rawData?.creditScore ?? ''}</TableCell>
                    <TableCell>
                      {s.rawData?.evictionHistory ? (
                        <Typography variant="body2" color="error.main">Eviction on record</Typography>
                      ) : null}
                      {s.rawData?.criminal ? (
                        <Typography variant="body2" color="error.main">Criminal record</Typography>
                      ) : null}
                      {typeof s.rawData?.creditScore === 'number' && s.rawData.creditScore < 550 ? (
                        <Typography variant="body2" color="error.main">Low credit score — consider denial</Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{s.reportUrl ? <Link href={s.reportUrl} target="_blank" rel="noopener">View</Link> : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1">Decision</Typography>
            <Stack spacing={1} sx={{ my: 1 }}>
              <TextField
                label="Decision note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={() => decide('approved')}>Approve</Button>
                <Button variant="contained" color="error" onClick={() => decide('denied')}>Deny</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1">Documents</Typography>
            <ul>
              {(app.documents || []).map((d: any) => (
                <li key={d.id}><Link href={d.url} target="_blank" rel="noopener">{d.type}</Link></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
