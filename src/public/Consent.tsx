import React, { useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Paper, Stack, Typography, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';

export default function ConsentPage() {
  const { screeningId } = useParams();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!screeningId) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch('/api/screening/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screeningId, consent: true }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed to record consent');
      setSuccess('Consent recorded. Screening will proceed.');
    } catch (e: any) {
      setError(e?.message || 'Failed to record consent');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>Consent to Tenant Screening</Typography>
          <Typography>
            By checking the box below, you consent to allow us to run a background and credit check as part of your rental application process.
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <FormControlLabel control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />} label="I consent to tenant screening" />
          <Button variant="contained" disabled={!agreed || submitting} onClick={onSubmit}>
            {submitting ? 'Submitting…' : 'Submit Consent'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
