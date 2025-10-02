import { useState } from 'react';
import { Button, TextField, Card, CardContent } from '@mui/material';

export default function NewTicketAI({ tenantId }: { tenantId: string }) {
  const [desc, setDesc] = useState('');
  const [ai, setAi] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const r = await fetch('/api/maintenance/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, description: desc })
      });
      const data = await r.json();
      setAi(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-xl shadow p-4 space-y-3">
      <CardContent>
        <TextField
          label="Describe the issue"
          multiline
          fullWidth
          minRows={3}
          value={desc}
          onChange={(e)=>setDesc(e.target.value)}
        />
        <Button onClick={analyze} variant="contained" disabled={loading || desc.trim().length < 5}>
          {loading ? 'Analyzing…' : 'Analyze with AI'}
        </Button>
        {ai && (
          <div className="mt-3 text-sm">
            <p>Suggested Priority: <strong>{ai.priority}</strong></p>
            <p>Suggested Vendor: <strong>{ai.vendor}</strong></p>
            <p>Target SLA: <strong>{ai.slaHours}h</strong></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
