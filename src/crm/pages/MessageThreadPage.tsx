import * as React from 'react';
import { Box, Typography, Paper, Stack, TextField, Button } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function MessageThreadPage() {
  const params = useParams();
  const threadId = String(params.threadId || '');
  const [messages, setMessages] = React.useState<any[]>([]);
  const [body, setBody] = React.useState('');

  const load = React.useCallback(() => {
    if (!threadId) return;
    fetch(`/api/messages/${threadId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [threadId]);

  React.useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!body.trim()) return;
    await fetch(`/api/messages/${threadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body }),
    });
    setBody('');
    load();
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Thread</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={1}>
          {messages.map((m) => (
            <Box key={m.id} sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{m.sender?.name || m.sender?.email || 'User'}</Typography>
              <Typography variant="body1">{m.body}</Typography>
              {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {m.attachments.map((a: any) => (
                    <Box key={a.id}>
                      <a href={`/api/storage/download?key=${encodeURIComponent(a.fileUrl)}`} target="_blank" rel="noopener noreferrer">📎 {a.fileName}</a>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleString()}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                {Array.isArray(m.reads) && m.reads.length > 0 ? `Seen by: ${m.reads.map((r: any) => r.user?.name || r.user?.email || 'User').join(', ')}` : 'Not yet read'}
              </Typography>
              {/* Auto-mark as read on render */}
              <span style={{ display: 'none' }}>
                {(() => { fetch(`/api/messages/${threadId}/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ messageId: m.id }) }); return null; })()}
              </span>
            </Box>
          ))}
        </Stack>
      </Paper>
      <Stack spacing={1}>
        <TextField value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply..." multiline minRows={3} fullWidth />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={send}>Send</Button>
          <Button variant="contained" color="warning" onClick={async () => { await fetch(`/api/messages/${threadId}/escalate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ toRole: 'admin', reason: 'Issue unresolved' }) }); alert('Escalated to Admin'); }}>Escalate to Admin</Button>
          <Button variant="contained" color="error" onClick={async () => { await fetch(`/api/messages/${threadId}/escalate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ toRole: 'superadmin', reason: 'Issue unresolved' }) }); alert('Escalated to SuperAdmin'); }}>Escalate to SuperAdmin</Button>
          <Button variant="outlined" color="secondary" onClick={async () => { await fetch(`/api/messages/${threadId}/archive`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ reason: 'Case closed' }) }); alert('Thread archived'); }}>Archive Thread</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
