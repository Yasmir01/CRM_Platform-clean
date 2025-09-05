import * as React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);

  const load = React.useCallback(() => {
    fetch('/api/notifications', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .catch(() => setNotifications([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Notifications</Typography>
      <Stack spacing={1}>
        {notifications.map((n) => (
          <Paper key={n.id} sx={{ p: 2 }}>
            <Typography variant="body1">
              {n.type === 'inapp' && n.message ? String(n.message.body) : `(${n.type}) notification ${n.status}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
