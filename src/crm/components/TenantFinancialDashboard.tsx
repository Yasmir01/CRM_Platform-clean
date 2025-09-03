import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Stack,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CardIcon from '@mui/icons-material/CreditCard';
import BankIcon from '@mui/icons-material/AccountBalance';
import AutoPayIcon from '@mui/icons-material/AutoMode';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import NotificationIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import ReportIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import MoneyIcon from '@mui/icons-material/MonetizationOn';
import ErrorIcon from '@mui/icons-material/Error';
import NoteAddIcon from '@mui/icons-material/NoteAdd';;
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

import { tenantFinancialService } from '../services/TenantFinancialService';
import { TenantFinancialProfile, PaymentAlert, LedgerEntry, TenantPaymentActions } from '../types/TenantFinancialTypes';
import { paymentService } from '../services/PaymentService';

interface TenantFinancialDashboardProps {
  tenantId: string;
  tenantName: string;
  onPaymentAction?: (action: string, data?: any) => void;
}

export default function TenantFinancialDashboard({ 
  tenantId, 
  tenantName, 
  onPaymentAction 
}: TenantFinancialDashboardProps) {
  const theme = useTheme();
  const [profile, setProfile] = useState<TenantFinancialProfile | null>(null);
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [actions, setActions] = useState<TenantPaymentActions | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoPayDialogOpen, setAutoPayDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    loadTenantFinancialData();
    
    // Subscribe to real-time updates
    tenantFinancialService.subscribe(tenantId, (updatedProfile) => {
      setProfile(updatedProfile);
    });

    return () => {
      tenantFinancialService.unsubscribe(tenantId);
    };
  }, [tenantId]);

  const loadTenantFinancialData = async () => {
    try {
      setLoading(true);
      const [profileData, alertsData, actionsData] = await Promise.all([
        tenantFinancialService.getTenantFinancialProfile(tenantId),
        tenantFinancialService.getPaymentAlerts(tenantId),
        tenantFinancialService.getTenantPaymentActions(tenantId)
      ]);

      setProfile(profileData);
      setAlerts(alertsData);
      setActions(actionsData);
    } catch (error) {
      console.error('Error loading tenant financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoPayToggle = async (enabled: boolean) => {
    if (!profile) return;

    await tenantFinancialService.updateAutoPayStatus(tenantId, {
      isEnabled: enabled,
      status: enabled ? 'active' : 'disabled'
    });

    onPaymentAction?.('autopay_toggled', { enabled, tenantId });
  };

  const handleNotificationToggle = async (type: 'email' | 'sms', enabled: boolean) => {
    if (!profile) return;

    const updates = {
      ...profile.notificationPreferences,
      [type]: {
        ...profile.notificationPreferences[type],
        enabled
      }
    };

    await tenantFinancialService.updateNotificationPreferences(tenantId, updates);
    onPaymentAction?.('notification_updated', { type, enabled, tenantId });
  };

  const processPayment = async (amount: number, paymentMethodId: string) => {
    try {
      const payment = await paymentService.createRentPayment({
        tenantId,
        propertyId: 'prop_1', // Should come from tenant data
        amount,
        dueDate: dayjs().format('YYYY-MM-DD'),
        status: 'pending',
        fees: []
      });

      const result = await paymentService.processPayment(payment.id, paymentMethodId);
      
      if (result.success) {
        onPaymentAction?.('payment_processed', { paymentId: payment.id, amount, tenantId });
        loadTenantFinancialData(); // Refresh data
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  };

  const getStatusIcon = (status: TenantFinancialProfile['paymentStatus']) => {
    switch (status) {
      case 'current':
        return <CheckIcon sx={{ color: 'success.main' }} />;
      case 'late':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'overdue':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'partial':
        return <ScheduleIcon sx={{ color: 'info.main' }} />;
      default:
        return <CheckIcon />;
    }
  };

  const getStatusColor = (status: TenantFinancialProfile['paymentStatus']) => {
    switch (status) {
      case 'current': return 'success';
      case 'late': return 'warning';
      case 'overdue': return 'error';
      case 'partial': return 'info';
      default: return 'default';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading financial data...
        </Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Alert severity="error">
        Unable to load financial profile for tenant
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              severity={alert.severity === 'critical' ? 'error' : alert.severity as any}
              sx={{ mb: 1 }}
              action={
                alert.actionRequired && (
                  <Button size="small" color="inherit">
                    Take Action
                  </Button>
                )
              }
            >
              <Typography variant="body2">
                {alert.message}
                {alert.amount && ` - Amount: $${alert.amount.toLocaleString()}`}
                {alert.dueDate && ` - Due: ${dayjs(alert.dueDate).format('MMM DD, YYYY')}`}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* Financial Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Payment Status Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getStatusIcon(profile.paymentStatus)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Payment Status
                </Typography>
              </Box>
              <Chip
                label={profile.paymentStatus.toUpperCase()}
                color={getStatusColor(profile.paymentStatus)}
                sx={{ mb: 1 }}
              />
              {profile.daysLate > 0 && (
                <Typography variant="body2" color="error">
                  {profile.daysLate} days late
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Current Balance Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ color: profile.currentBalance > 0 ? 'error.main' : 'success.main' }} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Current Balance
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600,
                  color: profile.currentBalance > 0 ? 'error.main' : 'success.main'
                }}
              >
                ${Math.abs(profile.currentBalance).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.currentBalance > 0 ? 'Outstanding' : 'Credit'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Auto-Pay Status Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoPayIcon sx={{ 
                  color: profile.autoPayStatus.isEnabled ? 'success.main' : 'error.main' 
                }} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Auto-Pay
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  icon={profile.autoPayStatus.isEnabled ? <CheckIcon /> : <CancelIcon />}
                  label={profile.autoPayStatus.isEnabled ? 'Enabled' : 'Disabled'}
                  color={profile.autoPayStatus.isEnabled ? 'success' : 'error'}
                  size="small"
                />
                <IconButton 
                  size="small" 
                  onClick={() => setAutoPayDialogOpen(true)}
                  disabled={!actions?.canSetupAutoPay && !profile.autoPayStatus.isEnabled}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SMS Notifications Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmsIcon sx={{ 
                  color: profile.notificationPreferences.sms.enabled ? 'success.main' : 'error.main' 
                }} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  SMS Alerts
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  icon={profile.notificationPreferences.sms.enabled ? <CheckIcon /> : <CancelIcon />}
                  label={profile.notificationPreferences.sms.enabled ? 'Enabled' : 'Disabled'}
                  color={profile.notificationPreferences.sms.enabled ? 'success' : 'error'}
                  size="small"
                />
                <IconButton 
                  size="small" 
                  onClick={() => setNotificationDialogOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Risk Assessment & Financial Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Assessment
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Chip
                  label={`${profile.riskAssessment.level.toUpperCase()} RISK`}
                  color={getRiskLevelColor(profile.riskAssessment.level)}
                  sx={{ mr: 2 }}
                />
                <Typography variant="h6">
                  Score: {profile.riskAssessment.score}/100
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={profile.riskAssessment.score}
                color={getRiskLevelColor(profile.riskAssessment.level) as any}
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary">
                Last updated: {dayjs(profile.riskAssessment.lastUpdated).format('MMM DD, YYYY')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <Stack spacing={1}>
                {profile.paymentMethods.length > 0 ? (
                  profile.paymentMethods.map((method) => (
                    <Box key={method.id} sx={{ display: 'flex', alignItems: 'center' }}>
                      {method.type === 'card' ? <CardIcon /> : <BankIcon />}
                      <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
                        {method.name}
                      </Typography>
                      {method.isDefault && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No payment methods on file
                  </Typography>
                )}
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => onPaymentAction?.('add_payment_method', { tenantId })}
                >
                  Add Payment Method
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentDialogOpen(true)}
              disabled={!actions?.canProcessPayment}
            >
              Process Payment
            </Button>
            <Button
              variant="outlined"
              startIcon={<NotificationIcon />}
              disabled={!actions?.canSendReminder}
              onClick={() => onPaymentAction?.('send_reminder', { tenantId })}
            >
              Send Reminder
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={() => onPaymentAction?.('view_history', { tenantId })}
            >
              View History
            </Button>
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={() => onPaymentAction?.('generate_report', { tenantId })}
            >
              Generate Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<NoteAddIcon />}
              onClick={() => onPaymentAction?.('add_note', { tenantId })}
            >
              Add Note
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Recent Ledger Entries */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profile.ledgerEntries.slice(0, 5).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {dayjs(entry.date).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.type} 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: entry.amount > 0 ? 'error.main' : 'success.main',
                          fontWeight: 600
                        }}
                      >
                        {entry.amount > 0 ? '+' : ''}${entry.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ${entry.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Auto-Pay Setup Dialog */}
      <Dialog open={autoPayDialogOpen} onClose={() => setAutoPayDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto-Pay Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.autoPayStatus.isEnabled}
                  onChange={(e) => handleAutoPayToggle(e.target.checked)}
                />
              }
              label="Enable Auto-Pay"
            />
            {profile.autoPayStatus.isEnabled && (
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={profile.autoPayStatus.paymentMethodId || ''}
                  label="Payment Method"
                >
                  {profile.paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoPayDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={notificationDialogOpen} onClose={() => setNotificationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Preferences</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.notificationPreferences.email.enabled}
                  onChange={(e) => handleNotificationToggle('email', e.target.checked)}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={profile.notificationPreferences.sms.enabled}
                  onChange={(e) => handleNotificationToggle('sms', e.target.checked)}
                />
              }
              label="SMS Notifications"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Processing Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Payment Amount"
              type="number"
              defaultValue={profile.currentBalance}
              fullWidth
              InputProps={{
                startAdornment: '$'
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select label="Payment Method">
                {profile.paymentMethods.map((method) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setPaymentDialogOpen(false)}>
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
