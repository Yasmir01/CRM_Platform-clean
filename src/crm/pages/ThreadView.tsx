import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

type Message = { id: string; senderId: string; content: string; createdAt: string };

type Thread = { id: string; subject: string; createdAt: string; messages: Message[] };

export default function ThreadView() {
  const { id } = useParams();
  const [thread, setThread] = useState<Thread | null>(null);
  const [content, setContent] = useState('');
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const refresh = async () => {
    const res = await fetch(`/api/messages/thread?id=${id}`, { credentials: 'include' });
    const data = await res.json();
    setThread(data || null);
    setTimeout(() => viewportRef.current?.scrollTo(0, viewportRef.current.scrollHeight), 50);
  };

  useEffect(() => { if (id) refresh(); }, [id]);

  const send = async () => {
    if (!content.trim()) return;
    await fetch('/api/messages/send', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: id, content }),
    });
    setContent('');
    await refresh();
  };

  if (!thread) return <Box sx={{ p: 2 }}><Typography>Loading…</Typography></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{thread.subject}</Typography>
        <Card>
          <CardContent>
            <Box ref={viewportRef} sx={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {thread.messages.map((m) => (
                <Box key={m.id} sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 1 }}>
                  <Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleString()}</Typography>
                  <Typography variant="body1">{m.content}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Message" value={content} onChange={(e) => setContent(e.target.value)} fullWidth />
          <Button onClick={send} variant="contained">Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
