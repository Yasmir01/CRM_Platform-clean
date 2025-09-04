import * as React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function MessagesInbox() {
  const [threads, setThreads] = React.useState<any[]>([]);

  const load = React.useCallback(() => {
    fetch('/api/messages/threads', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setThreads(Array.isArray(d) ? d : []))
      .catch(() => setThreads([]));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Inbox</Typography>
        <Button variant="outlined" onClick={load}>Refresh</Button>
      </Stack>

      <Stack spacing={1}>
        {threads.map((t) => (
          <Paper key={t.id} component={RouterLink as any} to={`/crm/messages/${t.id}`} sx={{ p: 2, textDecoration: 'none' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t.subject}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t.messages?.[0]?.body ? String(t.messages[0].body).slice(0, 120) : 'No messages yet'}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
