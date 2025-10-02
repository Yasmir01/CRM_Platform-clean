import * as React from 'react';
import RoleLayout from '../components/layout/RoleLayout';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function OwnerLedgerPage() {
  const [entries, setEntries] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/owner-ledger/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setEntries(Array.isArray(d) ? d : []))
      .catch(() => setEntries([]));
  }, []);

  return (
    <RoleLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Owner Ledger</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{e.property?.address || '-'}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{String(e.entryType || '').replace('_', ' ')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: Number(e.amount) >= 0 ? 'success.main' : 'error.main' }}>
                    ${Number(e.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{e.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </RoleLayout>
  );
}
