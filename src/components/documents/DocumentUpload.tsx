import React, { useState } from 'react';
import { Box, Button, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { uploadFile } from '../../services/upload';

const TYPES = [
  { value: 'lease', label: 'Lease' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'id', label: 'ID' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'other', label: 'Other' },
];

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Choose a file');
    const displayName = name || file.name;

    setSubmitting(true);
    try {
      const { key } = await uploadFile(file);
      const res = await fetch('/api/documents/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, type, key }),
      });
      const doc = await res.json();
      if (!res.ok) throw new Error(doc?.error || 'Upload failed');
      alert(`Uploaded: ${doc.name}`);
      setFile(null);
      setName('');
      setType('other');
    } catch (e: any) {
      alert(e?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Upload Document</Typography>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
        <Select value={type} onChange={(e) => setType(e.target.value as string)}>
          {TYPES.map((t) => (
            <MenuItem value={t.value} key={t.value}>{t.label}</MenuItem>
          ))}
        </Select>
        <Button variant="outlined" component="label" startIcon={<CloudUploadRoundedIcon /> }>
          Choose file
          <input hidden type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Button>
        {file && <Typography variant="body2" color="text.secondary">{file.name}</Typography>}
        <Box>
          <Button type="submit" variant="contained" disabled={!file || submitting}>Upload</Button>
        </Box>
      </Stack>
    </Box>
  );
}
