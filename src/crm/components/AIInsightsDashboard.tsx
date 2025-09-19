import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Stack } from '@mui/material';

export default function AIInsightsDashboard() {
  const [insights, setInsights] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchInsights = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-insights/list');
      if (!res.ok) { setInsights([]); setLoading(false); return; }
      const data = await res.json();
      setInsights(Array.isArray(data) ? data : []);
    } catch (e) {
      setInsights([]);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { void fetchInsights(); }, [fetchInsights]);

  const regenerate = async () => {
    setLoading(true);
    try {
      await fetch('/api/ai-insights/generate', { method: 'POST' });
      await fetchInsights();
    } catch (e) {}
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">🤖 AI Insights</Typography>
        <Button variant="outlined" onClick={regenerate} disabled={loading}>Regenerate Insights</Button>
      </Stack>
      <List>
        {insights.length === 0 && <ListItem><ListItemText primary={loading ? 'Loading insights...' : 'No insights yet. Click "Regenerate Insights".'} /></ListItem>}
        {insights.map((ins: any) => (
          <ListItem key={ins.id} divider>
            <ListItemText primary={ins.insight} secondary={`Category: ${ins.category} — Confidence: ${ins.confidence ?? 'N/A'} — Generated: ${new Date(ins.generatedAt).toLocaleString()}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
