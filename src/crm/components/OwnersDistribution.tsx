import * as React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { LocalStorageService } from '../services/LocalStorageService';

interface OwnerAssignment {
  id: string;
  name: string;
  percentage: number; // 0-100
}

interface OwnersDistributionProps {
  propertyId: string;
}

export default function OwnersDistribution({ propertyId }: OwnersDistributionProps) {
  const storageKey = React.useMemo(() => `propertyOwners_${propertyId}`, [propertyId]);
  const [owners, setOwners] = React.useState<OwnerAssignment[]>(() => LocalStorageService.getItem(storageKey, []));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [ownerName, setOwnerName] = React.useState('');
  const [ownerPct, setOwnerPct] = React.useState<number>(0);
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(dayjs().startOf('month'));
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs().endOf('month'));

  const save = (list: OwnerAssignment[]) => {
    setOwners(list);
    LocalStorageService.setItem(storageKey, list);
  };

  const openAdd = () => {
    setOwnerName('');
    setOwnerPct(0);
    setDialogOpen(true);
  };

  const addOwner = () => {
    const pct = Math.max(0, Math.min(100, Number(ownerPct)));
    const newOwner: OwnerAssignment = { id: String(Date.now()), name: ownerName.trim(), percentage: pct };
    save([...owners, newOwner]);
    setDialogOpen(false);
  };

  const removeOwner = (id: string) => {
    save(owners.filter(o => o.id !== id));
  };

  const totalPct = owners.reduce((s, o) => s + (o.percentage || 0), 0);
  const pctWarning = totalPct !== 100 && owners.length > 0;

  const exportStatement = () => {
    const rows = [
      ['Owner', 'Percentage', 'From', 'To'],
      ...owners.map(o => [o.name, `${o.percentage}%`, fromDate?.format('YYYY-MM-DD') || '', toDate?.format('YYYY-MM-DD') || ''])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owner_statement_${propertyId}_${dayjs().format('YYYYMMDD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">Owners & Distribution</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={`${owners.length} ${owners.length === 1 ? 'owner' : 'owners'}`} color={owners.length ? 'primary' : 'default'} size="small" />
                <Button size="small" startIcon={<AddRoundedIcon />} onClick={openAdd}>Add Owner</Button>
              </Stack>
            </Stack>

            {owners.length === 0 ? (
              <Alert severity="info">No owners assigned yet.</Alert>
            ) : (
              <Stack spacing={1}>
                {owners.map(o => (
                  <Stack key={o.id} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={o.name} variant="outlined" />
                      <Chip icon={<PercentRoundedIcon />} label={`${o.percentage}%`} color="success" size="small" />
                    </Stack>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => removeOwner(o.id)}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
                {pctWarning && (
                  <Alert severity="warning">Distribution totals {totalPct}%. For statements, distributions should total 100%.</Alert>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Owner Financial Snapshot</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <DatePicker label="From" value={fromDate} onChange={setFromDate} />
                <DatePicker label="To" value={toDate} onChange={setToDate} />
              </Stack>
            </LocalizationProvider>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="contained" startIcon={<ReceiptLongRoundedIcon />} onClick={exportStatement}>Statement</Button>
              <Button variant="outlined" startIcon={<DescriptionRoundedIcon />} onClick={() => alert('1099 generated for selected period')}>1099</Button>
              <Button variant="outlined" startIcon={<GavelRoundedIcon />} onClick={() => alert('GST report generated')}>GST</Button>
              <Button variant="outlined" startIcon={<GavelRoundedIcon />} onClick={() => alert('VAT report generated')}>VAT</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Owner</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Owner Name" fullWidth value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            <TextField label="Distribution (%)" type="number" fullWidth value={ownerPct} onChange={(e) => setOwnerPct(Number(e.target.value))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addOwner} disabled={!ownerName.trim()}>Save</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
