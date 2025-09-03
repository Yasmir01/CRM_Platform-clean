import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function TenantLeaseView() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => { (async () => { if (!id) return; const r = await fetch(`/api/leases/get?id=${encodeURIComponent(id)}`, { credentials: 'include' }); setDoc(await r.json()); })(); }, [id]);

  if (!doc || doc.error) return <Box sx={{ p: 2 }}><Typography>Loading…</Typography></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">{doc.title}</Typography>
        {doc.signedPdfUrl ? (
          <Button variant="contained" href={doc.signedPdfUrl} target="_blank">Download Signed PDF</Button>
        ) : (
          <Card><CardContent><Typography>Awaiting signature…</Typography></CardContent></Card>
        )}
        <Card>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: doc.html }} />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
