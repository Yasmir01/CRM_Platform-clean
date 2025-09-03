import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, List, ListItem, ListItemText } from '@mui/material';

export default function LeaseTemplates() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('<h1>Residential Lease</h1><p>Tenant: {{tenant.name}}</p><p>Property: {{property.address}}</p><p>Rent: ${{lease.rent}}</p>');

  useEffect(() => { (async () => { const r = await fetch('/api/lease-templates/list', { credentials: 'include' }); setList(await r.json()); })(); }, []);

  const create = async () => {
    await fetch('/api/lease-templates/create', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description, content }) });
    window.location.reload();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Lease Templates</Typography>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField label="Template Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
              <TextField label="Content (HTML with {{vars}})" value={content} onChange={(e) => setContent(e.target.value)} fullWidth multiline minRows={8} />
              <Button variant="contained" onClick={create}>Create Template</Button>
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="subtitle1">Existing</Typography>
            <List>
              {list.map((t: any) => (
                <ListItem key={t.id} divider>
                  <ListItemText primary={t.name} secondary={t.description} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
