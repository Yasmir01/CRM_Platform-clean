import * as React from 'react';
import { Box, Divider, Typography, List, ListItemButton, ListItemText, Paper, Button, Stack } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import NotificationModal from './NotificationModal';

const navItems = [
  { label: 'Dashboard', to: '/crm/super-admin/overview' },
  { label: 'Subscribers', to: '/crm/super-admin/subscribers' },
  { label: 'Impersonation', to: '/crm/super-admin/impersonate' },
  { label: 'Compliance', to: '/crm/super-admin/compliance' },
  { label: 'Analytics', to: '/crm/super-admin/analytics' },
  { label: 'Notifications', to: '/crm/super-admin/notifications' },
];

export default function SuperAdminLayout() {
  const location = useLocation();

  const exportCompliance = () => {
    window.location.href = '/api/superadmin/compliance/export';
  };

  const [showModal, setShowModal] = React.useState(false);

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
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700 }}>Compliance & Escalations</Typography>
          <ListItemButton
            component={Link}
            to="/crm/escalation-logs"
            selected={location.pathname === '/crm/escalation-logs'}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText primary="Escalation Logs" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/crm/sla-policies"
            selected={location.pathname === '/crm/sla-policies'}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText primary="SLA Policies" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/crm/escalation-matrix"
            selected={location.pathname === '/crm/escalation-matrix'}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText primary="Escalation Matrix" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to="/crm/escalation-export"
            selected={location.pathname === '/crm/escalation-export'}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText primary="Compliance Export" />
          </ListItemButton>
        </List>
      </Paper>
      <Box sx={{ flex: 1 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>SuperAdmin Control</Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={exportCompliance} variant="contained" color="success">Export Compliance</Button>
            <Button onClick={() => setShowModal(true)} variant="contained">Send Notification</Button>
            <Button component={Link} to="/crm" variant="outlined">Exit SU</Button>
          </Stack>
        </Paper>
        <Outlet />
      </Box>
      <NotificationModal open={showModal} onClose={() => setShowModal(false)} />
    </Box>
  );
}
