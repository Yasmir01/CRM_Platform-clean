import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, MenuItem, Select, InputLabel, FormControl, List, ListItem, ListItemText } from '@mui/material';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('general');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const q = filterType ? `?type=${encodeURIComponent(filterType)}` : '';
      const res = await fetch('/api/documents' + q);
      if (!res.ok) { setDocs([]); setLoading(false); return; }
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) { setDocs([]); }
    setLoading(false);
  };

  useEffect(() => { void fetchDocs(); }, [filterType]);

  const createDoc = async () => {
    if (!fileUrl) return alert('Provide fileUrl (upload first)');
    try {
      const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileUrl, title, type, visibility: 'private' }) });
      if (!res.ok) return alert('Failed to create');
      setFileUrl(''); setTitle(''); setType('general');
      await fetchDocs();
    } catch (e) { alert('Failed'); }
  };

  const getPresign = async () => {
    const name = prompt('Filename to upload (e.g., lease.pdf)') || '';
    if (!name) return;
    try {
      const res = await fetch('/api/documents/presign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: name }) });
      const data = await res.json();
      if (!res.ok) return alert('Presign failed');
      // show upload URL to user (they should PUT the file there)
      alert('Upload URL (PUT): ' + data.uploadUrl + '\nAfter uploading, paste the file URL to create document.');
    } catch (e) { alert('Failed'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>📂 Document Center</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel id="filter-type-label">Type</InputLabel>
                  <Select labelId="filter-type-label" value={filterType} label="Type" onChange={(e) => setFilterType(String(e.target.value))}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="lease">Lease</MenuItem>
                    <MenuItem value="invoice">Invoice</MenuItem>
                    <MenuItem value="receipt">Receipt</MenuItem>
                    <MenuItem value="tax">Tax</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={getPresign}>Presign Upload</Button>
                <Button variant="contained" onClick={fetchDocs}>Refresh</Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <List>
                {docs.length === 0 && <ListItem><ListItemText primary={loading ? 'Loading...' : 'No documents found'} /></ListItem>}
                {docs.map(d => (
                  <ListItem key={d.id} divider>
                    <ListItemText primary={d.title || d.fileUrl} secondary={`${d.type} — ${new Date(d.createdAt).toLocaleString()}`} />
                    <Button variant="outlined" href={d.fileUrl} target="_blank">Open</Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Upload & Create Document</Typography>
            <TextField fullWidth label="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} sx={{ mt: 2 }} />
            <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 2 }} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="type-select">Type</InputLabel>
              <Select labelId="type-select" value={type} label="Type" onChange={(e) => setType(String(e.target.value))}>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="lease">Lease</MenuItem>
                <MenuItem value="invoice">Invoice</MenuItem>
                <MenuItem value="receipt">Receipt</MenuItem>
                <MenuItem value="tax">Tax</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={createDoc}>Create Document</Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
