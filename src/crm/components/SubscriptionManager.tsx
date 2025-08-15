import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  Chip,
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
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRoundedIcon';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  userLimit: number;
  propertyLimit: number;
  isActive: boolean;
}

interface PaymentEvent {
  id: string;
  subscriberId: string;
  companyName: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending' | 'Declined';
  paymentMethod: string;
  date: string;
  invoiceNumber: string;
  failureReason?: string;
}

interface SubscriptionManagerProps {
  open: boolean;
  onClose: () => void;
}

const mockPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 79,
    features: ['Up to 25 properties', 'Basic communication tools', 'Standard reports'],
    userLimit: 3,
    propertyLimit: 25,
    isActive: true
  },
  {
    id: 'professional',
    name: 'Professional', 
    price: 149,
    features: ['Up to 100 properties', 'Advanced communication tools', 'Detailed reports', 'Work order management'],
    userLimit: 10,
    propertyLimit: 100,
    isActive: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: ['Unlimited properties', 'All features', 'API access', 'Custom integrations', 'Priority support'],
    userLimit: 999,
    propertyLimit: 999,
    isActive: true
  }
];

const mockPaymentEvents: PaymentEvent[] = [
  {
    id: '1',
    subscriberId: '1',
    companyName: 'ABC Property Management',
    amount: 149,
    status: 'Success',
    paymentMethod: '**** 4242',
    date: '2024-01-15T10:00:00',
    invoiceNumber: 'INV-2024-001'
  },
  {
    id: '2',
    subscriberId: '3',
    companyName: 'Metro Housing Solutions',
    amount: 79,
    status: 'Failed',
    paymentMethod: '**** 1234',
    date: '2024-01-15T11:30:00',
    invoiceNumber: 'INV-2024-002',
    failureReason: 'Insufficient funds'
  },
  {
    id: '3',
    subscriberId: '2',
    companyName: 'Sunset Realty Group',
    amount: 299,
    status: 'Success',
    paymentMethod: '**** 5678',
    date: '2024-01-14T09:15:00',
    invoiceNumber: 'INV-2024-003'
  }
];

export default function SubscriptionManager({ open, onClose }: SubscriptionManagerProps) {
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>(mockPlans);
  const [paymentEvents, setPaymentEvents] = React.useState<PaymentEvent[]>(mockPaymentEvents);
  const [autoDeactivation, setAutoDeactivation] = React.useState(true);
  const [graceperiod, setGracePeriod] = React.useState(3);
  const [autoNotifications, setAutoNotifications] = React.useState(true);
  const [planDialogOpen, setPlanDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SubscriptionPlan | null>(null);

  const handleProcessFailedPayments = () => {
    // Simulate processing failed payments
    const failedPayments = paymentEvents.filter(p => p.status === 'Failed');
    
    if (failedPayments.length === 0) {
      alert('No failed payments to process.');
      return;
    }

    // Simulate retry logic
    alert(`Processing ${failedPayments.length} failed payments. This would normally trigger account deactivation after grace period.`);
  };

  const handleBulkNotification = () => {
    const overdueAccounts = paymentEvents.filter(p => p.status === 'Failed').length;
    alert(`Sending payment reminder notifications to ${overdueAccounts} overdue accounts.`);
  };

  const getStatusColor = (status: PaymentEvent['status']) => {
    switch (status) {
      case 'Success': return 'success';
      case 'Failed': return 'error';
      case 'Pending': return 'warning';
      case 'Declined': return 'error';
      default: return 'default';
    }
  };

  const recentPayments = paymentEvents.slice(0, 10);
  const totalRevenue = paymentEvents
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + p.amount, 0);
  const failedPayments = paymentEvents.filter(p => p.status === 'Failed').length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AutorenewRoundedIcon />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Subscription Management System</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Subscription Settings */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SettingsRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Automation Settings
                </Typography>
                
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoDeactivation}
                        onChange={(e) => setAutoDeactivation(e.target.checked)}
                      />
                    }
                    label="Auto-deactivate overdue accounts"
                  />

                  <TextField
                    label="Grace Period (days)"
                    type="number"
                    value={graceperiod}
                    onChange={(e) => setGracePeriod(Number(e.target.value))}
                    disabled={!autoDeactivation}
                    helperText="Days before auto-deactivation"
                    inputProps={{ min: 1, max: 30 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoNotifications}
                        onChange={(e) => setAutoNotifications(e.target.checked)}
                      />
                    }
                    label="Send payment reminders"
                  />

                  <Button
                    variant="contained"
                    startIcon={<PaymentRoundedIcon />}
                    onClick={handleProcessFailedPayments}
                    color="warning"
                    fullWidth
                  >
                    Process Failed Payments
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<NotificationsRoundedIcon />}
                    onClick={handleBulkNotification}
                    fullWidth
                  >
                    Send Reminder Notifications
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Overview */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Payment Overview</Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Box textAlign="center" sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="success.contrastText">
                        ${totalRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="success.contrastText">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center" sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="error.contrastText">
                        {failedPayments}
                      </Typography>
                      <Typography variant="body2" color="error.contrastText">
                        Failed Payments
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center" sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="info.contrastText">
                        {paymentEvents.length}
                      </Typography>
                      <Typography variant="body2" color="info.contrastText">
                        Total Transactions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" gutterBottom>Recent Payment Events</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.companyName}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>
                            <Chip 
                              label={payment.status} 
                              color={getStatusColor(payment.status)}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(payment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{payment.invoiceNumber}</TableCell>
                          <TableCell>
                            {payment.status === 'Failed' && (
                              <Tooltip title="Retry payment">
                                <IconButton size="small" color="warning">
                                  <AutorenewRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Subscription Plans */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Subscription Plans</Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSelectedPlan(null);
                      setPlanDialogOpen(true);
                    }}
                  >
                    Add New Plan
                  </Button>
                </Stack>

                <Grid container spacing={2}>
                  {plans.map((plan) => (
                    <Grid item xs={12} md={4} key={plan.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6">{plan.name}</Typography>
                            <Chip 
                              label={plan.isActive ? 'Active' : 'Inactive'} 
                              color={plan.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </Stack>
                          
                          <Typography variant="h4" color="primary" gutterBottom>
                            ${plan.price}<Typography component="span" variant="body2">/month</Typography>
                          </Typography>

                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Up to {plan.userLimit === 999 ? 'unlimited' : plan.userLimit} users
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Up to {plan.propertyLimit === 999 ? 'unlimited' : plan.propertyLimit} properties
                          </Typography>

                          <Stack spacing={1} sx={{ mt: 2 }}>
                            {plan.features.slice(0, 3).map((feature, index) => (
                              <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircleRoundedIcon sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                                {feature}
                              </Typography>
                            ))}
                            {plan.features.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{plan.features.length - 3} more features
                              </Typography>
                            )}
                          </Stack>

                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth 
                            sx={{ mt: 2 }}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setPlanDialogOpen(true);
                            }}
                          >
                            Edit Plan
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Automated Actions */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>Automated Subscription Management</Typography>
              <Typography variant="body2">
                The system automatically monitors payment status and can:
              </Typography>
              <ul>
                <li>Deactivate accounts after {graceperiod} days of failed payment</li>
                <li>Send automatic payment reminder notifications</li>
                <li>Reactivate accounts when payment is received</li>
                <li>Track usage limits and enforce plan restrictions</li>
                <li>Generate billing reports and analytics</li>
              </ul>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" onClick={() => alert('Subscription settings saved!')}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
