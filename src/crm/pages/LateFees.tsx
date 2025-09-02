import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Stack,
  Alert,
  Chip,
  Button
} from '@mui/material';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

// Calculate a late‑fee for a given invoice.
function calculateLateFee(
  invoiceAmount: number,
  dueDate: Date | string,
  paymentDate: Date | string,
  config: {
    baseFee?: number;
    dailyRate?: number;
    percentageRate?: number; // e.g., 0.05 for 5% (used in "percent" mode)
    graceDays?: number;
    mode?: 'flat' | 'percent';
  }
): number {
  const { baseFee = 0, dailyRate = 0, percentageRate = 0, graceDays = 0, mode = 'flat' } = config;

  const msPerDay = 24 * 60 * 60 * 1000;
  const due = new Date(dueDate);
  const paid = new Date(paymentDate);

  if (paid <= due) return 0;

  const totalDaysLate = Math.floor((paid.getTime() - due.getTime()) / msPerDay);
  const effectiveDaysLate = Math.max(totalDaysLate - graceDays, 0);
  if (effectiveDaysLate === 0) return 0;

  if (mode === 'percent') {
    const percentFee = invoiceAmount * percentageRate;
    return baseFee + percentFee;
  }

  const dailyAccrual = dailyRate * effectiveDaysLate;
  return baseFee + dailyAccrual;
}

export default function LateFees() {
  const [invoiceAmount, setInvoiceAmount] = useState<string>('250');
  const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs().subtract(15, 'day'));
  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(dayjs());

  const [baseFee, setBaseFee] = useState<string>('10');
  const [dailyRate, setDailyRate] = useState<string>('2');
  const [percentageRate, setPercentageRate] = useState<string>('5'); // displayed as %
  const [graceDays, setGraceDays] = useState<string>('5');
  const [mode, setMode] = useState<'flat' | 'percent'>('flat');

  const fee = useMemo(() => {
    if (!dueDate || !paymentDate) return 0;
    const cfg = {
      baseFee: parseFloat(baseFee || '0'),
      dailyRate: parseFloat(dailyRate || '0'),
      percentageRate: (parseFloat(percentageRate || '0') || 0) / 100,
      graceDays: parseInt(graceDays || '0', 10) || 0,
      mode
    } as const;
    const amt = parseFloat(invoiceAmount || '0') || 0;
    return calculateLateFee(amt, dueDate.toDate(), paymentDate.toDate(), cfg);
  }, [invoiceAmount, dueDate, paymentDate, baseFee, dailyRate, percentageRate, graceDays, mode]);

  const daysLate = useMemo(() => {
    if (!dueDate || !paymentDate) return 0;
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = paymentDate.startOf('day').toDate().getTime() - dueDate.startOf('day').toDate().getTime();
    return Math.max(Math.floor(diff / msPerDay), 0);
  }, [dueDate, paymentDate]);

  const effectiveDaysLate = Math.max(daysLate - (parseInt(graceDays || '0', 10) || 0), 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 3 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <GavelRoundedIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Late Fees & Rules
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your policy and calculate late fees with a clear, auditable formula.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Formula Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The formula returns the late-fee amount that you can add to the original invoice total.
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Setting</TableCell>
                        <TableCell>Meaning</TableCell>
                        <TableCell>Example Values</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>baseFee</TableCell>
                        <TableCell>Flat amount added the first day the invoice is overdue.</TableCell>
                        <TableCell>10 USD</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>dailyRate</TableCell>
                        <TableCell>Additional amount charged per day after the grace period.</TableCell>
                        <TableCell>2 USD/day</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>percentageRate</TableCell>
                        <TableCell>Percentage of invoice applied once after the grace period (percent mode).</TableCell>
                        <TableCell>5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>graceDays</TableCell>
                        <TableCell>Days after due date before any fee is applied.</TableCell>
                        <TableCell>5 days</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>mode</TableCell>
                        <TableCell>"flat" uses baseFee + dailyRate × days after grace. "percent" uses baseFee + percentage of invoice once.</TableCell>
                        <TableCell>"flat" or "percent"</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6">Calculator</Typography>
                  <Chip icon={<CalculateRoundedIcon />} label="Live" color="success" size="small" />
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Invoice Amount"
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Mode</InputLabel>
                      <Select value={mode} label="Mode" onChange={(e) => setMode(e.target.value as 'flat' | 'percent')}>
                        <MenuItem value="flat">Flat (base + daily)</MenuItem>
                        <MenuItem value="percent">Percent (base + % once)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate}
                      onChange={(d) => setDueDate(d)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Payment Date"
                      value={paymentDate}
                      onChange={(d) => setPaymentDate(d)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Base Fee"
                      type="number"
                      value={baseFee}
                      onChange={(e) => setBaseFee(e.target.value)}
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {mode === 'flat' ? (
                      <TextField
                        label="Daily Rate"
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value)}
                        fullWidth
                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                      />
                    ) : (
                      <TextField
                        label="Percentage Rate"
                        type="number"
                        value={percentageRate}
                        onChange={(e) => setPercentageRate(e.target.value)}
                        fullWidth
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Grace Days"
                      type="number"
                      value={graceDays}
                      onChange={(e) => setGraceDays(e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Alert severity={effectiveDaysLate > 0 ? 'info' : 'success'} sx={{ mb: 2 }}>
                      {effectiveDaysLate > 0
                        ? `${effectiveDaysLate} billable day(s) after grace. Days late: ${daysLate}.`
                        : 'Within grace period or not past due. No fee applies.'}
                    </Alert>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Late‑fee: ${fee.toFixed(2)}
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setInvoiceAmount('250');
                          setDueDate(dayjs().subtract(12, 'day'));
                          setPaymentDate(dayjs());
                          setBaseFee('10');
                          setDailyRate('2');
                          setPercentageRate('5');
                          setGraceDays('5');
                          setMode('flat');
                        }}
                      >
                        Reset Example
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Notes: Percentage fee applies once after grace when using percent mode. Flat mode accrues a daily amount after grace in addition to any base fee.
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
