import * as React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { uploadFile } from '../../services/upload';

export default function AttachmentUploader({ threadId, messageId, onUploaded }: { threadId: string; messageId: string; onUploaded?: () => void; }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { key } = await uploadFile(file);
      await fetch(`/api/messages/${threadId}/attachments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, key, fileType: file.type, fileName: file.name }),
      });
      setFile(null);
      onUploaded?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button variant="contained" onClick={handleUpload} disabled={!file || busy}>Upload</Button>
    </Stack>
  );
}
