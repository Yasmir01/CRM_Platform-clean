import * as React from 'react';
import { Stack, Select, MenuItem, Button } from '@mui/material';

export default function AssignVendor({ requestId, compact }: { requestId: string; compact?: boolean }) {
  const [users, setUsers] = React.useState<any[]>([]);
  const [assignee, setAssignee] = React.useState('');
  const [role, setRole] = React.useState('vendor');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const res = await fetch('/api/users/vendors', { credentials: 'include' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    })();
  }, []);

  const assign = async () => {
    if (!assignee) return;
    setBusy(true);
    try {
      await fetch(`/api/maintenance/${requestId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assigneeId: assignee, role }),
      });
      setAssignee('');
      alert('Assigned successfully!');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
      <Select size="small" displayEmpty value={assignee} onChange={(e) => setAssignee(String(e.target.value))} sx={{ minWidth: compact ? 160 : 220 }}>
        <MenuItem value=""><em>Select Vendor/Staff</em></MenuItem>
        {users.map((u) => (
          <MenuItem key={u.id} value={u.id}>{u.name || u.email} ({String(u.role).toLowerCase()})</MenuItem>
        ))}
      </Select>
      <Select size="small" value={role} onChange={(e) => setRole(String(e.target.value))} sx={{ minWidth: 120 }}>
        <MenuItem value="vendor">Vendor</MenuItem>
        <MenuItem value="staff">Staff</MenuItem>
        <MenuItem value="manager">Manager</MenuItem>
      </Select>
      <Button variant="contained" size="small" onClick={assign} disabled={!assignee || busy}>Assign</Button>
    </Stack>
  );
}
