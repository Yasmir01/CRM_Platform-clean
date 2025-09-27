import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Grid, Paper, List, ListItem, ListItemText, Divider, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export default function RoleManager() {
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (!res.ok) { setRoles([]); setLoading(false); return; }
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (e) { setRoles([]); }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return setUsers([]);
      const d = await res.json();
      setUsers(Array.isArray(d) ? d : []);
    } catch (e) { setUsers([]); }
  };

  useEffect(() => { void fetchRoles(); void fetchUsers(); }, []);

  const createRole = async () => {
    if (!newRoleName.trim()) return alert('Enter role name');
    try {
      const res = await fetch('/api/admin/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newRoleName.trim(), permissions: {} }) });
      if (!res.ok) return alert('Failed to create role');
      setNewRoleName('');
      await fetchRoles();
    } catch (e) { alert('Failed'); }
  };

  const assignRole = async () => {
    if (!assignUserId || !selectedRole) return alert('Select user and role');
    try {
      const res = await fetch('/api/admin/user-roles/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: assignUserId, roleId: selectedRole }) });
      if (!res.ok) return alert('Failed to assign role');
      alert('Role assigned');
    } catch (e) { alert('Failed'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>🔐 User Roles & Permissions</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Create Role</Typography>
            <TextField fullWidth label="Role name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} sx={{ mt: 2 }} />
            <Button variant="contained" sx={{ mt: 2 }} onClick={createRole}>Create Role</Button>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Assign Role</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select labelId="role-select-label" value={selectedRole} label="Role" onChange={(e) => setSelectedRole(String(e.target.value))}>
                <MenuItem value="">Select Role</MenuItem>
                {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select labelId="user-select-label" value={assignUserId} label="User" onChange={(e) => setAssignUserId(String(e.target.value))}>
                <MenuItem value="">Select User</MenuItem>
                {users.map(u => <MenuItem key={u.id} value={u.id}>{u.email || u.name || u.id}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" sx={{ mt: 2 }} onClick={assignRole}>Assign Role</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Existing Roles</Typography>
            <List>
              {roles.map(r => (
                <React.Fragment key={r.id}>
                  <ListItem>
                    <ListItemText primary={r.name} secondary={r.permissions ? JSON.stringify(r.permissions) : 'No permissions set'} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {roles.length === 0 && <ListItem><ListItemText primary={loading ? 'Loading...' : 'No roles defined'} /></ListItem>}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
