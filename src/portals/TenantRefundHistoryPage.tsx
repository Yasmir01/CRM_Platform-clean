import * as React from 'react';
import { Box, Typography, Paper, Stack, Chip, Button } from '@mui/material';

type Refund = {
  id: string;
  amount: number;
  reason?: string | null;
  status: string;
  createdAt: string;
  paymentId: string;
};

export default function TenantRefundHistoryPage() {
  const [refunds, setRefunds] = React.useState<Refund[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/tenant/refunds', { credentials: 'include' });
        const data = await res.json();
        if (active) setRefunds(Array.isArray(data) ? data : []);
      } catch {
        if (active) setRefunds([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <Typography variant="body2">Loading refund history...</Typography>;

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Refund History</Typography>
        {refunds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No refunds have been issued yet.</Typography>
        ) : (
          <Stack spacing={1}>
            {refunds.map((r) => (
              <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Refund <Typography component="span" variant="body2" color="text.secondary">#{r.id.slice(0, 6)}</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{r.reason || 'No reason provided'}</Typography>
                  <Typography variant="caption" color="text.disabled">{new Date(r.createdAt).toLocaleString()}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>${Number(r.amount || 0).toFixed(2)}</Typography>
                  <Chip size="small" label={r.status}
                    color={r.status === 'COMPLETED' ? 'default' : r.status === 'FAILED' ? 'error' : 'secondary'}
                    variant={r.status === 'COMPLETED' ? 'filled' : 'outlined'}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Button variant="outlined" onClick={() => window.print()}>Export Refund History</Button>
    </Box>
  );
}
