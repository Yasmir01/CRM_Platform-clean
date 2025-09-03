import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

type Thread = { id: string; subject: string; createdAt: string };

export default function Messages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/messages/list', { credentials: 'include' });
      const data = await res.json();
      setThreads(Array.isArray(data) ? data : []);
    })();
  }, []);

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/messages/thread/create', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, content }),
    });
    const t = await res.json();
    if (!res.ok) return alert(t?.error || 'failed');
    navigate(`/crm/messages/${t.id}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Messages</Typography>
        <Box component="form" onSubmit={createThread}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required fullWidth />
            <TextField label="First message" value={content} onChange={(e) => setContent(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained">Start Thread</Button>
          </Stack>
        </Box>
        <Divider />
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {threads.map((t) => (
            <ListItem key={t.id} divider disablePadding>
              <ListItemButton component={RouterLink} to={`/crm/messages/${t.id}`}>
                <ListItemText primary={t.subject} secondary={new Date(t.createdAt).toLocaleString()} />
              </ListItemButton>
            </ListItem>
          ))}
          {threads.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No threads yet.</Typography>
          )}
        </List>
      </Stack>
    </Box>
  );
}
