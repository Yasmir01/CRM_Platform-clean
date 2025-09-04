"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface Lease { id: string; name: string; tenantNames: string[] }
interface LeasePolicy { id: string; leaseId: string; allowPartial: boolean; allowSplit: boolean; minPartialUsd: number }

export default function LeasePolicyManager() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [selectedLease, setSelectedLease] = useState<string>("");
  const [policy, setPolicy] = useState<LeasePolicy | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { void fetchLeases(); }, []);
  useEffect(() => { if (selectedLease) void fetchPolicy(selectedLease); }, [selectedLease]);

  async function fetchLeases() {
    const res = await fetch("/api/admin/leases");
    if (!res.ok) return setLeases([]);
    const data = await res.json();
    setLeases(Array.isArray(data) ? data : []);
  }

  async function fetchPolicy(leaseId: string) {
    const res = await fetch(`/api/admin/lease-policies?leaseId=${leaseId}`);
    if (res.ok) {
      const data = await res.json();
      setPolicy(data);
    } else {
      setPolicy({ id: leaseId, leaseId, allowPartial: true, allowSplit: true, minPartialUsd: 10 });
    }
  }

  async function savePolicy() {
    if (!policy) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lease-policies`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Lease-Level Payment Policies" />
      <CardContent>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="lease-select-label">Select Lease</InputLabel>
            <Select labelId="lease-select-label" value={selectedLease} label="Select Lease" onChange={(e) => setSelectedLease(String(e.target.value))}>
              {leases.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.name} ({l.tenantNames.join(', ')})</MenuItem>
              ))}
            </Select>
          </FormControl>

          {policy && (
            <Stack spacing={2}>
              <FormControlLabel control={<Switch checked={policy.allowPartial} onChange={(e) => setPolicy({ ...policy, allowPartial: e.target.checked })} />} label="Allow Partial Payments" />
              <FormControlLabel control={<Switch checked={policy.allowSplit} onChange={(e) => setPolicy({ ...policy, allowSplit: e.target.checked })} />} label="Allow Split Payments (Roommates)" />
              <TextField type="number" label="Minimum Partial Payment ($)" value={policy.minPartialUsd} onChange={(e) => setPolicy({ ...policy, minPartialUsd: Number(e.target.value || 0) })} inputProps={{ min: 0, step: 1 }} fullWidth />
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary" onClick={savePolicy} disabled={loading || !policy}>{loading ? 'Saving...' : 'Save Lease Policy'}</Button>
      </CardActions>
    </Card>
  );
}
