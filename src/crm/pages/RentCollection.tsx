import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  Chip,
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider,
  Stack,
  Badge,
  Tooltip,
  FormControlLabel,
  Switch,
  useTheme
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  LocalAtm as CashIcon,
  Schedule as ScheduleIcon,
  Notifications as ReminderIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  AutoMode as AutoPayIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LateFeeService } from '../services/LateFeeService';

import { paymentService } from '../services/PaymentService';
import { RentPayment, PaymentMethod, CashPaymentLocation, PaymentSchedule } from '../types/PaymentTypes';
import { useCrmData } from '../contexts/CrmDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTenantScope } from '../hooks/useTenantScope';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RentCollection() {
  const theme = useTheme();
  const { state } = useCrmData();
  const { tenants, properties } = state;
  const { user } = useAuth();
  const { isTenant, currentTenant } = useTenantScope();

  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashLocations, setCashLocations] = useState<CashPaymentLocation[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [cashPaymentDialogOpen, setCashPaymentDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tenantAutoPayAllowed, setTenantAutoPayAllowed] = useState<boolean>(() => localStorage.getItem('allowTenantAutoPay') === 'true');
  const [autoPayDialogOpen, setAutoPayDialogOpen] = useState(false);
  const [selectedAutoPayMethod, setSelectedAutoPayMethod] = useState('');
  const [autoPayActive, setAutoPayActive] = useState(false);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as PaymentMethod['type'],
    name: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    bankName: '',
    accountType: 'checking' as 'checking' | 'savings',
    routingNumber: '',
    accountNumber: ''
  });

  const [newPayment, setNewPayment] = useState({
    tenantId: '',
    propertyId: '',
    amount: '',
    dueDate: dayjs().format('YYYY-MM-DD'),
    type: 'rent' as 'rent' | 'late_fee' | 'deposit' | 'utility' | 'other'
  });

  const [cashPayment, setCashPayment] = useState({
    paymentId: '',
    locationId: '',
    confirmationCode: '',
    amount: ''
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    if (isTenant && currentTenant?.id) {
      setSelectedTenant(currentTenant.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTenant, currentTenant?.id]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const paymentsData = await paymentService.getRentPayments();
      setPayments(paymentsData);
      
      if (selectedTenant) {
        const methodsData = await paymentService.getPaymentMethods(selectedTenant);
        setPaymentMethods(methodsData);
      }
      
      const locationsData = await paymentService.getCashPaymentLocations();
      setCashLocations(locationsData);

      if (isTenant && currentTenant?.id) {
        const ap = await paymentService.getAutoPaySetup(currentTenant.id);
        setAutoPayActive(!!ap);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreatePayment = async () => {
    if (!newPayment.tenantId || !newPayment.amount) return;

    try {
      setLoading(true);
      await paymentService.createRentPayment({
        tenantId: newPayment.tenantId,
        propertyId: newPayment.propertyId,
        amount: parseFloat(newPayment.amount),
        dueDate: newPayment.dueDate,
        status: 'pending',
        fees: []
      });
      
      setPaymentDialogOpen(false);
      loadPaymentData();
      setNewPayment({
        tenantId: '',
        propertyId: '',
        amount: '',
        dueDate: dayjs().format('YYYY-MM-DD'),
        type: 'rent'
      });
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!selectedTenant || !newPaymentMethod.name) return;

    try {
      setLoading(true);
      let details: any;
      
      if (newPaymentMethod.type === 'card') {
        details = {
          last4: newPaymentMethod.cardNumber.slice(-4),
          brand: 'visa', // In real app, detect from card number
          expiryMonth: parseInt(newPaymentMethod.expiryMonth),
          expiryYear: parseInt(newPaymentMethod.expiryYear),
          holderName: newPaymentMethod.holderName
        };
      } else if (newPaymentMethod.type === 'ach' || newPaymentMethod.type === 'bank_transfer') {
        details = {
          bankName: newPaymentMethod.bankName,
          accountType: newPaymentMethod.accountType,
          last4: newPaymentMethod.accountNumber.slice(-4),
          routingNumber: newPaymentMethod.routingNumber
        };
      }

      await paymentService.addPaymentMethod(selectedTenant, {
        type: newPaymentMethod.type,
        name: newPaymentMethod.name,
        details,
        isDefault: paymentMethods.length === 0,
        isActive: true
      });
      
      setPaymentMethodDialogOpen(false);
      loadPaymentData();
      setNewPaymentMethod({
        type: 'card',
        name: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        holderName: '',
        bankName: '',
        accountType: 'checking',
        routingNumber: '',
        accountNumber: ''
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentId: string, paymentMethodId: string) => {
    try {
      setLoading(true);
      const result = await paymentService.processPayment(paymentId, paymentMethodId);
      
      if (result.success) {
        loadPaymentData();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordCashPayment = async () => {
    if (!cashPayment.paymentId || !cashPayment.locationId || !cashPayment.confirmationCode) return;

    try {
      setLoading(true);
      const success = await paymentService.recordCashPayment(
        cashPayment.paymentId,
        cashPayment.locationId,
        cashPayment.confirmationCode
      );

      if (success) {
        setCashPaymentDialogOpen(false);
        loadPaymentData();
        setCashPayment({
          paymentId: '',
          locationId: '',
          confirmationCode: '',
          amount: ''
        });
      }
    } catch (error) {
      console.error('Error recording cash payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAutoPay = async () => {
    if (!selectedTenant || !selectedAutoPayMethod) return;
    try {
      setLoading(true);
      await paymentService.setupAutoPay({
        tenantId: selectedTenant,
        paymentMethodId: selectedAutoPayMethod,
        isActive: true,
        retryAttempts: 3,
        retryDays: [3, 5],
        failureNotifications: true
      });
      setAutoPayActive(true);
      setAutoPayDialogOpen(false);
    } catch (error) {
      console.error('Error setting up auto-pay:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status: RentPayment['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'failed': return 'error';
      case 'overdue': return 'error';
      case 'partial': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card': return <CardIcon />;
      case 'ach':
      case 'bank_transfer': return <BankIcon />;
      case 'cash':
      case 'money_order':
      case 'cashiers_check': return <CashIcon />;
      default: return <PaymentIcon />;
    }
  };

  const calculateCollectionMetrics = () => {
    const currentMonth = dayjs().format('YYYY-MM');
    const monthlyPayments = payments.filter(p => p.dueDate.startsWith(currentMonth));

    const globalCfg = LateFeeService.getGlobalConfig();
    const computeWithLate = (p: RentPayment) => {
      const prop = properties.find(pr => pr.id === p.propertyId);
      const eff = LateFeeService.getEffectiveConfig(prop, globalCfg);
      const late = LateFeeService.calculateLateFee(p.amount, p.dueDate, dayjs().format('YYYY-MM-DD'), eff);
      const isLate = dayjs().isAfter(dayjs(p.dueDate));
      return isLate ? p.amount + late : p.amount;
    };

    const totalDueBase = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = monthlyPayments.reduce((sum, p) => sum + computeWithLate(p), 0);
    const totalCollected = monthlyPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;
    const pendingAmount = totalDue - totalCollected;
    const overduePayments = monthlyPayments.filter(p =>
      p.status === 'overdue' || (p.status === 'pending' && dayjs(p.dueDate).isBefore(dayjs()))
    ).length;

    return {
      totalDue,
      totalCollected,
      collectionRate,
      pendingAmount,
      overduePayments
    };
  };

  const metrics = calculateCollectionMetrics();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Rent Collection & Payment Processing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive payment management system with online and cash payment options
          </Typography>
        </Box>

        {/* Collection Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h6">Collection Rate</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {metrics.collectionRate.toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={metrics.collectionRate} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckIcon />
                  </Avatar>
                  <Typography variant="h6">Collected</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  ${metrics.totalCollected.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6">Pending</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  ${metrics.pendingAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Outstanding balance
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Typography variant="h6">Overdue</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {metrics.overduePayments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Past due payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Payment Dashboard" icon={<PaymentIcon />} />
              <Tab label="Payment Methods" icon={<CardIcon />} />
              <Tab label="Cash Payments" icon={<CashIcon />} />
              <Tab label="Payment Schedules" icon={<ScheduleIcon />} />
              <Tab label="Reminders & Auto-Pay" icon={<ReminderIcon />} />
              <Tab label="Reports & Analytics" icon={<TrendingUpIcon />} />
            </Tabs>
          </Box>

          {/* Payment Dashboard Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Recent Payments</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  Create Payment
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.slice(0, 10).map((payment) => {
                    const tenant = tenants.find(t => t.id === payment.tenantId);
                    const property = properties.find(p => p.id === payment.propertyId);
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {tenant?.firstName?.[0]}{tenant?.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {tenant?.firstName} {tenant?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tenant?.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {property?.address || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${payment.amount.toLocaleString()}
                          </Typography>
                          {dayjs().isAfter(dayjs(payment.dueDate)) && (payment.status === 'pending' || payment.status === 'overdue' || payment.status === 'partial') && (
                            (() => {
                              const prop = properties.find(p => p.id === payment.propertyId);
                              const eff = LateFeeService.getEffectiveConfig(prop);
                              const late = LateFeeService.calculateLateFee(payment.amount, payment.dueDate, dayjs().format('YYYY-MM-DD'), eff);
                              return late > 0 ? (
                                <Typography variant="caption" color="error.main">Due with late fee: ${(payment.amount + late).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                              ) : null;
                            })()
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {dayjs(payment.dueDate).format('MMM DD, YYYY')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={getPaymentStatusColor(payment.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          {payment.paymentMethodId ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getPaymentMethodIcon('card')}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                •••• 1234
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not set
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {payment.status === 'pending' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleProcessPayment(payment.id, 'pm_default')}
                              >
                                Process
                              </Button>
                            )}
                            {payment.status === 'completed' && (
                              <Tooltip title="Download Receipt">
                                <IconButton size="small">
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Payment Methods Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">Payment Methods</Typography>
                  {!isTenant && (
                    <FormControl sx={{ mt: 2, minWidth: 200 }}>
                      <InputLabel>Select Tenant</InputLabel>
                      <Select
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        label="Select Tenant"
                      >
                        {tenants.map((tenant) => (
                          <MenuItem key={tenant.id} value={tenant.id}>
                            {tenant.firstName} {tenant.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setPaymentMethodDialogOpen(true)}
                  disabled={!selectedTenant}
                >
                  Add Payment Method
                </Button>
              </Stack>
            </Box>

            {selectedTenant && (
              <Grid container spacing={3}>
                {paymentMethods.map((method) => (
                  <Grid item xs={12} md={6} lg={4} key={method.id}>
                    <Card sx={{ 
                      border: method.isDefault ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                      borderColor: method.isDefault ? 'primary.main' : 'divider'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getPaymentMethodIcon(method.type)}
                            <Typography variant="h6" sx={{ ml: 1 }}>
                              {method.name}
                            </Typography>
                          </Box>
                          {method.isDefault && (
                            <Chip label="Default" color="primary" size="small" />
                          )}
                        </Box>

                        {method.type === 'card' && 'last4' in method.details && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              •••• •••• •••• {method.details.last4}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires {method.details.expiryMonth}/{method.details.expiryYear}
                            </Typography>
                          </Box>
                        )}

                        {(method.type === 'ach' || method.type === 'bank_transfer') && 'bankName' in method.details && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {method.details.bankName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {method.details.accountType} •••• {method.details.last4}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Button size="small" startIcon={<EditIcon />}>
                            Edit
                          </Button>
                          <Button size="small" color="error" startIcon={<DeleteIcon />}>
                            Remove
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Cash Payments Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Cash Payment Locations</Typography>
                <Button
                  variant="contained"
                  startIcon={<CashIcon />}
                  onClick={() => setCashPaymentDialogOpen(true)}
                >
                  Record Cash Payment
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={3}>
              {cashLocations.map((location) => (
                <Grid item xs={12} md={6} lg={4} key={location.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                          <LocationIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{location.name}</Typography>
                          <Chip 
                            label={location.provider.replace('_', ' ').toUpperCase()} 
                            size="small" 
                            color="primary"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {location.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {location.city}, {location.state} {location.zipCode}
                      </Typography>
                      
                      {location.phone && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📞 {location.phone}
                        </Typography>
                      )}
                      
                      {location.hours && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          🕒 {location.hours}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Fee: ${(location.fees / 100).toFixed(2)}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setCashPayment(prev => ({ ...prev, locationId: location.id }));
                            setCashPaymentDialogOpen(true);
                          }}
                        >
                          Use Location
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Payment Schedules Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Recurring Payment Schedules</Typography>
                <Button
                  variant="contained"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  Create Schedule
                </Button>
              </Stack>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Set up automatic rent collection schedules for your tenants. Payments will be processed automatically on the specified dates.
            </Alert>

            {/* Schedule management interface would go here */}
            <Typography variant="body1" color="text.secondary">
              Payment schedules management interface coming soon...
            </Typography>
          </TabPanel>

          {/* Reminders & Auto-Pay Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">Payment Reminders & Auto-Pay</Typography>
            </Box>

            <Grid container spacing={3}>
              {!isTenant && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">Allow tenants to set up Auto-Pay</Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={tenantAutoPayAllowed}
                              onChange={(e) => {
                                setTenantAutoPayAllowed(e.target.checked);
                                localStorage.setItem('allowTenantAutoPay', String(e.target.checked));
                              }}
                            />
                          }
                          label={tenantAutoPayAllowed ? 'Enabled' : 'Disabled'}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ReminderIcon sx={{ mr: 2 }} />
                      <Typography variant="h6">Payment Reminders</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Automated reminders via email and SMS to ensure timely payments.
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">Email Reminders</Typography>
                        </Box>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SmsIcon sx={{ mr: 1 }} />
                          <Typography variant="body2">SMS Reminders</Typography>
                        </Box>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AutoPayIcon sx={{ mr: 2 }} />
                      <Typography variant="h6">Auto-Pay Setup</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Allow tenants to set up automatic payments for hassle-free rent collection.
                    </Typography>
                    <Button variant="outlined" fullWidth onClick={() => setAutoPayDialogOpen(true)} disabled={isTenant && !tenantAutoPayAllowed}>
                      {autoPayActive ? 'Manage Auto-Pay' : 'Set Up Auto-Pay'}
                    </Button>
                    {isTenant && !tenantAutoPayAllowed && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Auto-Pay is disabled by management.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Reports & Analytics Tab */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">Payment Reports & Analytics</Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Comprehensive payment analytics and reporting tools to track collection performance and identify trends.
            </Alert>

            {/* Analytics dashboard would go here */}
            <Typography variant="body1" color="text.secondary">
              Advanced analytics and reporting dashboard coming soon...
            </Typography>
          </TabPanel>
        </Card>

        {/* Create Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Payment</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={newPayment.tenantId}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, tenantId: e.target.value }))}
                  label="Tenant"
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  value={newPayment.propertyId}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, propertyId: e.target.value }))}
                  label="Property"
                >
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Amount"
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                fullWidth
                InputProps={{
                  startAdornment: '$'
                }}
              />

              <DatePicker
                label="Due Date"
                value={dayjs(newPayment.dueDate)}
                onChange={(date) => setNewPayment(prev => ({ 
                  ...prev, 
                  dueDate: date?.format('YYYY-MM-DD') || '' 
                }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreatePayment} 
              variant="contained"
              disabled={!newPayment.tenantId || !newPayment.amount}
            >
              Create Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Payment Method Dialog */}
        <Dialog open={paymentMethodDialogOpen} onClose={() => setPaymentMethodDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value as PaymentMethod['type'] }))}
                  label="Payment Type"
                >
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="ach">ACH Bank Transfer</MenuItem>
                  <MenuItem value="bank_transfer">Direct Bank Transfer</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Method Name"
                value={newPaymentMethod.name}
                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                placeholder="e.g., Main Credit Card, Checking Account"
              />

              {newPaymentMethod.type === 'card' && (
                <>
                  <TextField
                    label="Card Number"
                    value={newPaymentMethod.cardNumber}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                    fullWidth
                    placeholder="1234 5678 9012 3456"
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Expiry Month"
                      value={newPaymentMethod.expiryMonth}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                      placeholder="MM"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Expiry Year"
                      value={newPaymentMethod.expiryYear}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                      placeholder="YYYY"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="CVV"
                      value={newPaymentMethod.cvv}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <TextField
                    label="Cardholder Name"
                    value={newPaymentMethod.holderName}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, holderName: e.target.value }))}
                    fullWidth
                  />
                </>
              )}

              {(newPaymentMethod.type === 'ach' || newPaymentMethod.type === 'bank_transfer') && (
                <>
                  <TextField
                    label="Bank Name"
                    value={newPaymentMethod.bankName}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, bankName: e.target.value }))}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      value={newPaymentMethod.accountType}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, accountType: e.target.value as 'checking' | 'savings' }))}
                      label="Account Type"
                    >
                      <MenuItem value="checking">Checking</MenuItem>
                      <MenuItem value="savings">Savings</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Routing Number"
                    value={newPaymentMethod.routingNumber}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, routingNumber: e.target.value }))}
                    fullWidth
                    placeholder="123456789"
                  />
                  <TextField
                    label="Account Number"
                    value={newPaymentMethod.accountNumber}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                    fullWidth
                    placeholder="1234567890"
                  />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentMethodDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddPaymentMethod} 
              variant="contained"
              disabled={!newPaymentMethod.name}
            >
              Add Payment Method
            </Button>
          </DialogActions>
        </Dialog>

        {/* Record Cash Payment Dialog */}
        <Dialog open={cashPaymentDialogOpen} onClose={() => setCashPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Record Cash Payment</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Payment to Record</InputLabel>
                <Select
                  value={cashPayment.paymentId}
                  onChange={(e) => setCashPayment(prev => ({ ...prev, paymentId: e.target.value }))}
                  label="Payment to Record"
                >
                  {payments.filter(p => p.status === 'pending').map((payment) => {
                    const tenant = tenants.find(t => t.id === payment.tenantId);
                    return (
                      <MenuItem key={payment.id} value={payment.id}>
                        {tenant?.firstName} {tenant?.lastName} - ${payment.amount}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Payment Location</InputLabel>
                <Select
                  value={cashPayment.locationId}
                  onChange={(e) => setCashPayment(prev => ({ ...prev, locationId: e.target.value }))}
                  label="Payment Location"
                >
                  {cashLocations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name} - {location.provider.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Confirmation Code"
                value={cashPayment.confirmationCode}
                onChange={(e) => setCashPayment(prev => ({ ...prev, confirmationCode: e.target.value }))}
                fullWidth
                placeholder="Enter confirmation code from receipt"
              />

              <Alert severity="info">
                Please verify the confirmation code matches the receipt from the payment location.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCashPaymentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleRecordCashPayment} 
              variant="contained"
              disabled={!cashPayment.paymentId || !cashPayment.locationId || !cashPayment.confirmationCode}
            >
              Record Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Auto-Pay Setup Dialog */}
        <Dialog open={autoPayDialogOpen} onClose={() => setAutoPayDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Auto-Pay Setup</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {paymentMethods.length === 0 ? (
                <Alert severity="info">Add a payment method first in the Payment Methods tab.</Alert>
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={selectedAutoPayMethod}
                    onChange={(e) => setSelectedAutoPayMethod(e.target.value)}
                    label="Payment Method"
                  >
                    {paymentMethods.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAutoPayDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAutoPay} variant="contained" disabled={paymentMethods.length === 0 || !selectedAutoPayMethod}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
