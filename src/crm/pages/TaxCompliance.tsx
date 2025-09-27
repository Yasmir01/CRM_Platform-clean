import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';

export default function TaxCompliance() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tax-reports/list?year=${year}`);
      if (!res.ok) { setReports([]); setLoading(false); return; }
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) { setReports([]); }
    setLoading(false);
  };

  useEffect(() => { void fetchReports(); }, [year]);

  const generate1099s = async () => {
    if (!confirm(`Generate 1099s for ${year}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tax-reports/generate1099s', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ year }) });
      if (!res.ok) { alert('Failed'); setLoading(false); return; }
      const d = await res.json();
      alert(`Created ${d.created} reports`);
      await fetchReports();
    } catch (e) { alert('Failed'); }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>🧾 Tax & Compliance Center</Typography>
      <Card sx={{ p: 2, mb: 2 }}>
        <CardContent>
          <TextField label="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} sx={{ mr: 2 }} />
          <Button variant="contained" onClick={generate1099s} disabled={loading}>📑 Generate 1099s</Button>
          <Button variant="outlined" onClick={fetchReports} sx={{ ml: 2 }}>Refresh</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Reports</Typography>
          <List>
            {reports.length === 0 && <ListItem><ListItemText primary={loading ? 'Loading...' : 'No reports found'} /></ListItem>}
            {reports.map(r => (
              <ListItem key={r.id} divider>
                <ListItemText primary={`${r.type} — ${r.year} — ${r.vendor?.email || r.vendorId || 'Vendor'}`} secondary={r.fileUrl || ''} />
                <Button variant="outlined" href={r.fileUrl} target="_blank">Download</Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
