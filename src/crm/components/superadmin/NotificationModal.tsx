import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack, Alert } from '@mui/material';

export default function NotificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const send = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/superadmin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setError(d?.error || 'Failed to send');
      } else {
        setSuccess('Notification sent!');
        setTitle('');
        setMessage('');
        setTimeout(() => onClose(), 600);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Notification</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} fullWidth multiline rows={4} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={send} disabled={loading || !title || !message} variant="contained">{loading ? 'Sending...' : 'Send'}</Button>
      </DialogActions>
    </Dialog>
  );
}
