"use client";

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

interface Lease { id: string; name: string; tenantNames: string[]; propertyId?: string }
interface Row { level: 'GLOBAL' | 'PROPERTY' | 'LEASE' | 'EFFECTIVE'; allowPartial: boolean; allowSplit: boolean; minPartialUsd: number }

export default function PolicyMatrix() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLease, setSelectedLease] = useState('');
  const [matrix, setMatrix] = useState<Row[]>([]);

  useEffect(() => { void fetchLeases(); }, []);
  useEffect(() => { if (selectedLease) void fetchMatrix(selectedLease); }, [selectedLease]);

  async function fetchLeases() {
    const res = await fetch('/api/admin/leases');
    if (!res.ok) return setLeases([]);
    const data = await res.json();
    setLeases(Array.isArray(data) ? data : []);
  }

  async function fetchMatrix(leaseId: string) {
    const res = await fetch(`/api/admin/payment-policies/matrix?leaseId=${leaseId}`);
    if (!res.ok) return setMatrix([]);
    const data = await res.json();
    setMatrix(Array.isArray(data) ? data : []);
  }

  const renderBool = (v: boolean) => (
    <Chip label={v ? 'Yes' : 'No'} color={v ? 'primary' : 'default'} size="small" />
  );

  return (
    <Card>
      <CardHeader title="Consolidated Payment Policy Matrix" />
      <CardContent>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="lease-select-label">Select Lease</InputLabel>
            <Select labelId="lease-select-label" label="Select Lease" value={selectedLease} onChange={(e) => setSelectedLease(String(e.target.value))}>
              {leases.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.name} ({l.tenantNames.join(', ')})</MenuItem>
              ))}
            </Select>
          </FormControl>

          {matrix.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Level</TableCell>
                    <TableCell>Allow Partial</TableCell>
                    <TableCell>Allow Split</TableCell>
                    <TableCell align="right">Min Partial ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matrix.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.level}</TableCell>
                      <TableCell>{renderBool(row.allowPartial)}</TableCell>
                      <TableCell>{renderBool(row.allowSplit)}</TableCell>
                      <TableCell align="right">${row.minPartialUsd.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
