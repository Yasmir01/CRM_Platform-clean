import * as React from 'react';
import { Stack, Button } from '@mui/material';
import { uploadFile } from '../../services/upload';

export default function MaintenanceUploader({ requestId, onUploaded }: { requestId: string; onUploaded?: () => void; }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { key } = await uploadFile(file);
      await fetch(`/api/maintenance/${requestId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, fileType: file.type, fileName: file.name }),
      });
      setFile(null);
      onUploaded?.();
      alert('File uploaded successfully!');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button variant="contained" onClick={upload} disabled={!file || busy}>Upload</Button>
    </Stack>
  );
}
