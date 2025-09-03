import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';

export default function OwnerPortfolio() {
  const params = useParams();
  const [search] = useSearchParams();
  const [ownerId, setOwnerId] = useState<string>(params.ownerId || search.get('ownerId') || '');
  const [portfolio, setPortfolio] = useState<any>(null);

  const load = async (id: string) => {
    if (!id) return;
    const res = await fetch(`/api/ledger/portfolio?ownerId=${encodeURIComponent(id)}`, { credentials: 'include' });
    const data = await res.json();
    setPortfolio(data);
  };

  useEffect(() => {
    if (params.ownerId) {
      setOwnerId(params.ownerId);
      load(params.ownerId);
    }
  }, [params.ownerId]);

  const exportCsv = () => {
    window.location.assign(`/api/ledger/portfolio/export?ownerId=${encodeURIComponent(ownerId)}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h5">Portfolio Ledger</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Owner ID" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} fullWidth />
          <Button variant="contained" onClick={() => load(ownerId)}>Load</Button>
          <Button variant="outlined" disabled={!ownerId} onClick={exportCsv}>Export CSV</Button>
        </Stack>

        {portfolio && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card><CardContent><Typography variant="subtitle1">Total Income</Typography><Typography variant="h4" color="success.main">${Number(portfolio.totalIncome).toFixed(2)}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card><CardContent><Typography variant="subtitle1">Total Expenses</Typography><Typography variant="h4" color="error.main">${Number(portfolio.totalExpense).toFixed(2)}</Typography></CardContent></Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card><CardContent><Typography variant="subtitle1">Net Balance</Typography><Typography variant="h4">${Number(portfolio.net).toFixed(2)}</Typography></CardContent></Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>By Property</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell>Income</TableCell>
                      <TableCell>Expenses</TableCell>
                      <TableCell>Net</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(portfolio.properties || []).map((p: any) => (
                      <TableRow key={p.property.id}>
                        <TableCell>{p.property.address}</TableCell>
                        <TableCell sx={{ color: 'success.main' }}>${Number(p.totalIncome).toFixed(2)}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>${Number(p.totalExpense).toFixed(2)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>${Number(p.net).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
}
