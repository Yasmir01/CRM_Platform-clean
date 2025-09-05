import * as React from 'react';
import { Box, Link } from '@mui/material';

export default function MaintenanceAttachmentList({ attachments }: { attachments: any[] }) {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  return (
    <Box sx={{ mt: 1 }}>
      {attachments.map((a) => (
        <Box key={a.id}>
          <Link href={`/api/storage/download?key=${encodeURIComponent(a.fileUrl)}`} target="_blank" rel="noopener noreferrer">📎 {a.fileName}</Link>
        </Box>
      ))}
    </Box>
  );
}
