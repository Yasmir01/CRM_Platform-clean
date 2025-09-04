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

interface Policy {
  id: string;
  propertyId?: string | null;
  allowPartial: boolean;
  allowSplit: boolean;
  minPartialUsd: number;
}

interface PropertyOption { id: string; name: string }

export default function PaymentPolicyManager() {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("GLOBAL");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(false);

  const options = useMemo<PropertyOption[]>(() => [{ id: "GLOBAL", name: "Global Default" }, ...properties], [properties]);

  useEffect(() => { void fetchProperties(); }, []);
  useEffect(() => { void fetchPolicy(selectedProperty === "GLOBAL" ? null : selectedProperty); }, [selectedProperty]);

  async function fetchProperties() {
    const res = await fetch("/api/admin/properties");
    if (!res.ok) return setProperties([]);
    const data = await res.json();
    setProperties(Array.isArray(data) ? data : []);
  }

  async function fetchPolicy(propertyId: string | null) {
    const url = propertyId ? `/api/admin/payment-policies?propertyId=${propertyId}` : `/api/admin/payment-policies`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data) setPolicy(data);
      else setPolicy({ id: "new", propertyId: propertyId, allowPartial: true, allowSplit: true, minPartialUsd: 10 });
    } else {
      setPolicy({ id: "new", propertyId: propertyId, allowPartial: true, allowSplit: true, minPartialUsd: 10 });
    }
  }

  async function savePolicy() {
    if (!policy) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payment-policies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProperty === "GLOBAL" ? null : selectedProperty,
          allowPartial: Boolean(policy.allowPartial),
          allowSplit: Boolean(policy.allowSplit),
          minPartialUsd: Number(policy.minPartialUsd),
        }),
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
      <CardHeader title="Payment Policies" />
      <CardContent>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="policy-scope-label">Select Property Scope</InputLabel>
            <Select
              labelId="policy-scope-label"
              id="policy-scope"
              value={selectedProperty}
              label="Select Property Scope"
              onChange={(e) => setSelectedProperty(String(e.target.value))}
            >
              {options.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {policy && (
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch checked={policy.allowPartial} onChange={(e) => setPolicy({ ...policy, allowPartial: e.target.checked })} />}
                label="Allow Partial Payments"
              />
              <FormControlLabel
                control={<Switch checked={policy.allowSplit} onChange={(e) => setPolicy({ ...policy, allowSplit: e.target.checked })} />}
                label="Allow Split Payments (Roommates)"
              />
              <TextField
                type="number"
                label="Minimum Partial Payment ($)"
                value={policy.minPartialUsd}
                onChange={(e) => setPolicy({ ...policy, minPartialUsd: Number(e.target.value || 0) })}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary" onClick={savePolicy} disabled={loading || !policy}>
          {loading ? "Saving..." : "Save Policy"}
        </Button>
      </CardActions>
    </Card>
  );
}
