import React, { useEffect, useState } from 'react';
import { Box, Link, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

type Doc = { id: string; name: string; type: string; url: string; createdAt: string };

export default function DocumentList() {
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/documents', { credentials: 'include' });
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    })();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Documents</Typography>
        <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
          {docs.map((d) => (
            <ListItem key={d.id} divider>
              <ListItemText
                primary={d.name}
                secondary={`${d.type} — ${new Date(d.createdAt).toLocaleString()}`}
              />
              <Link href={d.url} target="_blank" rel="noopener" underline="hover">View</Link>
            </ListItem>
          ))}
          {docs.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No documents found.</Typography>
          )}
        </List>
      </Stack>
    </Box>
  );
}
