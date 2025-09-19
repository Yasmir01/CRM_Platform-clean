import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, List, ListItem, ListItemText } from '@mui/material';

export default function OwnerPortal() {
  const [ownerData, setOwnerData] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOwner = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owners');
      if (!res.ok) { setOwnerData(null); setLoading(false); return; }
      const data = await res.json();
      // naive: pick first owner associated with current user
      const mine = data && data.length ? data[0] : null;
      setOwnerData(mine);
      if (mine) {
        const r = await fetch(`/api/tax-reports/list?year=${new Date().getFullYear()}`);
        if (r.ok) setReports(await r.json());
      }
    } catch (e) { setOwnerData(null); }
    setLoading(false);
  };

  useEffect(() => { void fetchOwner(); }, []);

  const downloadInvestorReport = async () => {
    if (!ownerData) return alert('No owner data');
    const res = await fetch('/api/owners/reports/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId: ownerData.id, year: new Date().getFullYear() }) });
    if (!res.ok) return alert('Failed to generate');
    const data = await res.json();
    alert('Report generated: ' + (data.fileUrl || 'N/A'));
  };

  if (!ownerData) return <Box sx={{ p: 3 }}><Typography>{loading ? 'Loading...' : 'No owner profile found.'}</Typography></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>💼 Owner Portal</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6">🏢 Properties</Typography>
              <List>
                {(ownerData.properties || []).map((p: any) => (
                  <ListItem key={p.id}>
                    <ListItemText primary={`Property ${p.propertyId}`} secondary={`Ownership: ${Number(p.ownershipPercentage)}%`} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6">💳 Income Share</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Net Income Share (YTD): TBD
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={downloadInvestorReport}>📑 Download Investor Report (PDF)</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Reports</Typography>
              <List>
                {reports.length === 0 && <ListItem><ListItemText primary="No reports" /></ListItem>}
                {reports.map(r => (
                  <ListItem key={r.id}>
                    <ListItemText primary={`${r.type} - ${r.year}`} secondary={r.fileUrl} />
                    <Button variant="outlined" href={r.fileUrl} target="_blank">Download</Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
