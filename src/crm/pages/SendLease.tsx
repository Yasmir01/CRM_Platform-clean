import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

export default function SendLease() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [title, setTitle] = useState('Residential Lease');
  const [propertyId, setPropertyId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [htmlPreview, setHtmlPreview] = useState('');
  const [leaseDocId, setLeaseDocId] = useState('');

  useEffect(() => { (async () => { const r = await fetch('/api/lease-templates/list', { credentials: 'include' }); setTemplates(await r.json()); })(); }, []);

  const preview = async () => {
    const variables = {
      tenant: { name: tenantName, email: tenantEmail },
      property: { address: '123 Main St, Springfield' },
      lease: { rent: 1800, start: '2025-10-01', end: '2026-09-30' },
    };
    const res = await fetch('/api/leases/preview', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId, title, propertyId, tenantId, variables }) });
    const d = await res.json();
    setLeaseDocId(d.leaseDocument.id);
    setHtmlPreview(d.leaseDocument.html);
  };

  const sendForSign = async () => {
    const res = await fetch('/api/leases/send', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leaseDocumentId: leaseDocId, tenantEmail, tenantName }) });
    const d = await res.json();
    window.open(d.signUrl, '_blank');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Send Lease</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Select value={templateId} onChange={(e) => setTemplateId(String(e.target.value))} displayEmpty>
                <MenuItem value=""><em>Select Template</em></MenuItem>
                {templates.map((t: any) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </Select>
              <TextField label="Lease Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              <TextField label="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} fullWidth />
              <TextField label="Tenant ID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} fullWidth />
              <TextField label="Tenant Name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} fullWidth />
              <TextField label="Tenant Email" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} fullWidth />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={preview}>Preview</Button>
                <Button variant="contained" disabled={!leaseDocId} onClick={sendForSign}>Send for Signature</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Preview</Typography>
            <div style={{ maxHeight: 600, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
