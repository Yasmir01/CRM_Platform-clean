import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';

export default function OwnerLedger() {
  const params = useParams();
  const [search] = useSearchParams();
  const [ledger, setLedger] = useState<any>(null);
  const [pid, setPid] = useState<string>('');

  const propertyId = params.propertyId || search.get('propertyId') || pid;

  const load = async (propId: string) => {
    if (!propId) return;
    const res = await fetch(`/api/ledger?propertyId=${encodeURIComponent(propId)}`, { credentials: 'include' });
    const data = await res.json();
    setLedger(data);
  };

  useEffect(() => {
    if (params.propertyId) {
      setPid(params.propertyId);
      load(params.propertyId);
    }
  }, [params.propertyId]);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h5">Owner Ledger</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Property ID" value={pid} onChange={(e) => setPid(e.target.value)} fullWidth />
          <Button variant="contained" onClick={() => load(pid)}>Load</Button>
          <Button variant="outlined" disabled={!ledger?.propertyId} onClick={() => window.location.assign(`/api/ledger/export?propertyId=${encodeURIComponent(ledger.propertyId)}`)}>Export CSV</Button>
        </Stack>

        {ledger && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card><CardContent><Typography variant="subtitle1">Total Income</Typography><Typography variant="h4" color="success.main">${Number(ledger.totalIncome).toFixed(2)}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card><CardContent><Typography variant="subtitle1">Total Expenses</Typography><Typography variant="h4" color="error.main">${Number(ledger.totalExpense).toFixed(2)}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card><CardContent><Typography variant="subtitle1">Net Balance</Typography><Typography variant="h4">${Number(ledger.net).toFixed(2)}</Typography></CardContent></Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Income (Payments)</Typography>
                <List>
                  {(ledger.payments || []).map((p: any) => (
                    <ListItem key={p.id} divider>
                      <ListItemText primary={`${p.type} — ${new Date(p.date).toLocaleDateString()}`} secondary={`$${Number(p.amount).toFixed(2)}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Expenses</Typography>
                <List>
                  {(ledger.expenses || []).map((e: any) => (
                    <ListItem key={e.id} divider>
                      <ListItemText primary={`${e.category} — ${new Date(e.date).toLocaleDateString()}`} secondary={`$${Number(e.amount).toFixed(2)}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
}
