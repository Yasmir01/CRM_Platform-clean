import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function MockSign() {
  const { envelopeId, email } = useParams();

  const complete = async () => {
    await fetch('/api/signature/mock-complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ envelopeId, email: decodeURIComponent(String(email || '')) }) });
    alert('Signed (mock). You can close this window.');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Mock Sign — {email}</Typography>
          <Typography>This simulates a signer completing the document.</Typography>
          <Button variant="contained" onClick={complete}>Sign Now</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
