import * as React from 'react';
import {
  Box, Stack, Typography, Card, CardContent, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  IconButton, Paper
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  type: 'product' | 'addon' | 'service' | 'subscription';
  price: number;
  isActive: boolean;
  category: string;
  tags: string[];
}

export default function SuperAdminMarketplaceManager() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductForm | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.warn('Failed to load products', e);
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing({ name: '', description: '', type: 'product', price: 0, isActive: true, category: '', tags: [] });
    setDialogOpen(true);
  };
  const openEdit = (item: any) => {
    setEditing({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      type: item.type,
      price: item.price ?? 0,
      isActive: !!item.isActive,
      category: item.category || '',
      tags: item.tags || []
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    const { id, ...payload } = editing;
    try {
      if (id) {
        const r = await fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const updated = await r.json();
        setItems((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      } else {
        const r = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created = await r.json();
        setItems((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (e) {
      alert('Failed to save');
    }
  };

  const toggleActive = async (item: any) => {
    try {
      const r = await fetch(`/api/products?id=${encodeURIComponent(item.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !item.isActive }) });
      const updated = await r.json();
      setItems((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const remove = async (item: any) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await fetch(`/api/products?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((p) => p.id !== item.id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Marketplace Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={async () => {
            try{
              const local = JSON.parse(localStorage.getItem('marketplaceItems') || '[]');
              if(!Array.isArray(local) || local.length===0){ alert('No local items found to backfill.'); return; }
              const existing = new Map(items.map(i => [i.name, i]));
              let created = 0;
              for(const it of local){
                if(!existing.has(it.name)){
                  const payload = { name: it.name, description: it.description, type: it.category === 'Add-on' ? 'addon' : it.category === 'Service' ? 'service' : 'product', price: it.basePrice || 0, isActive: it.status === 'Active', category: it.category, tags: it.tags || [] };
                  const r = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
                  if(r.ok){ created++; }
                }
              }
              await load();
              alert(`Backfill completed. Created ${created} new items.`);
            }catch(e){ alert('Backfill failed'); }
          }}>Backfill from Local</Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Add Item</Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} hover>
                    <TableCell>{it.name}</TableCell>
                    <TableCell>{it.type}</TableCell>
                    <TableCell>{it.category || '-'}</TableCell>
                    <TableCell>${it.price?.toFixed?.(2) ?? '0.00'}</TableCell>
                    <TableCell>{(it.tags || []).join(', ')}</TableCell>
                    <TableCell>
                      <Chip label={it.isActive ? 'Active' : 'Inactive'} color={it.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color={it.isActive ? 'warning' : 'success'} onClick={() => toggleActive(it)}>
                        {it.isActive ? <CancelRoundedIcon /> : <CheckCircleRoundedIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => openEdit(it)}>
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => remove(it)}>
                        <DeleteRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No items found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={editing?.name || ''} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), name: e.target.value }))} fullWidth />
            <TextField label="Description" value={editing?.description || ''} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), description: e.target.value }))} fullWidth multiline minRows={3} />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={editing?.type || 'product'} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), type: e.target.value as any }))}>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="addon">Add-on</MenuItem>
                <MenuItem value="service">Service</MenuItem>
                <MenuItem value="subscription">Subscription</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Category" value={editing?.category || ''} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), category: e.target.value }))} fullWidth />
            <TextField label="Price" type="number" value={editing?.price ?? 0} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), price: Number(e.target.value) }))} fullWidth />
            <FormControlLabel control={<Switch checked={!!editing?.isActive} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), isActive: e.target.checked }))} />} label="Active" />
            <TextField label="Tags (comma-separated)" value={(editing?.tags || []).join(', ')} onChange={(e) => setEditing((prev) => ({ ...(prev as ProductForm), tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editing?.id ? 'Save Changes' : 'Create Item'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
