import * as React from 'react';
import { Box, Divider, Typography, List, ListItemButton, ListItemText, Paper } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/crm/super-admin/overview' },
  { label: 'Subscribers', to: '/crm/super-admin/subscribers' },
  { label: 'Impersonation', to: '/crm/super-admin/impersonate' },
  { label: 'Compliance', to: '/crm/super-admin/compliance' },
];

export default function SuperAdminLayout() {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '70vh', width: '100%' }}>
      <Paper elevation={0} sx={{ width: 240, p: 2, mr: 2, borderRadius: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>SU Panel</Typography>
        <Divider sx={{ mb: 1 }} />
        <List>
          {navItems.map((item) => {
            const selected = location.pathname === item.to;
            return (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={selected}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Paper>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
