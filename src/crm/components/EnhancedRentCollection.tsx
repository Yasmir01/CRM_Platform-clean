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
  useTheme,
  InputAdornment
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CardIcon from '@mui/icons-material/CreditCard';
import BankIcon from '@mui/icons-material/AccountBalance';
import CashIcon from '@mui/icons-material/LocalAtm';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ReminderIcon from '@mui/icons-material/Notifications';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import AutoPayIcon from '@mui/icons-material/AutoMode';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FilterIcon from '@mui/icons-material/FilterList';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';;
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { enhancedPaymentService } from '../services/EnhancedPaymentService';
import { RentPayment, PaymentSchedule } from '../types/PaymentTypes';
import { EnhancedPaymentMethod, BankConnection, ACHProcessingResult } from '../types/BankAccountTypes';
import { useCrmData } from '../contexts/CrmDataContext';
import BankLinkDialog from './BankLinkDialog';
import BankAccountManagement from './BankAccountManagement';

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
      id={`rent-collection-tabpanel-${index}`}
      aria-labelledby={`rent-collection-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedRentCollection: React.FC = () => {
  const theme = useTheme();
  const { tenants, properties } = useCrmData();
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<EnhancedPaymentMethod[]>([]);
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [bankLinkDialogOpen, setBankLinkDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [newPayment, setNewPayment] = useState<Partial<RentPayment>>({});
  const [processing, setProcessing] = useState(false);
  const [achResult, setAchResult] = useState<ACHProcessingResult | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const [paymentsData, paymentMethodsData] = await Promise.all([
        enhancedPaymentService.getRentPayments(),
        selectedTenant !== 'all' ? enhancedPaymentService.getPaymentMethods(selectedTenant) : Promise.resolve([])
      ]);
      
      setPayments(paymentsData);
      if (selectedTenant !== 'all') {
        setPaymentMethods(paymentMethodsData);
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenant !== 'all') {
      loadPaymentMethods();
    }
  }, [selectedTenant]);

  const loadPaymentMethods = async () => {
    if (selectedTenant === 'all') {
      setPaymentMethods([]);
      return;
    }

    try {
      const methods = await enhancedPaymentService.getPaymentMethods(selectedTenant);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const handleCreatePayment = () => {
    if (selectedTenant === 'all') {
      alert('Please select a tenant first');
      return;
    }

    const tenant = tenants.find(t => t.id === selectedTenant);
    if (!tenant) return;

    setNewPayment({
      tenantId: selectedTenant,
      propertyId: tenant.propertyId || properties[0]?.id || '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      fees: []
    });
    setPaymentAmount('');
    setSelectedPaymentMethod('');
    setAchResult(null);
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!newPayment.tenantId || !selectedPaymentMethod || !paymentAmount) {
      return;
    }

    const amount = Math.round(parseFloat(paymentAmount) * 100); // Convert to cents
    if (amount <= 0) return;

    setProcessing(true);
    try {
      // Create payment record
      const payment = await enhancedPaymentService.createRentPayment({
        ...newPayment,
        amount,
        dueDate: newPayment.dueDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        fees: []
      } as Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>);

      // Process payment
      const result = await enhancedPaymentService.processPayment(payment.id, selectedPaymentMethod);
      
      if (result.success) {
        if (result.achResult) {
          setAchResult(result.achResult);
        }
        await loadPaymentData();
        if (!result.achResult) {
          // For non-ACH payments, close dialog immediately
          setPaymentDialogOpen(false);
        }
      } else {
        alert(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: EnhancedPaymentMethod) => {
    switch (method.type) {
      case 'ach':
        return <BankIcon />;
      case 'card':
        return <CardIcon />;
      case 'cash':
        return <CashIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const getPaymentMethodDetails = (method: EnhancedPaymentMethod) => {
    if (method.type === 'ach' && method.details && 'bankName' in method.details) {
      return `${method.details.bankName} ****${method.details.last4}`;
    }
    if (method.type === 'card' && method.details && 'last4' in method.details) {
      return `****${method.details.last4}`;
    }
    return method.name;
  };

  const getStatusColor = (status: RentPayment['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      case 'overdue': return 'error';
      case 'partial': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const renderPaymentMethods = () => {
    const bankMethods = paymentMethods.filter(pm => pm.type === 'ach');
    const cardMethods = paymentMethods.filter(pm => pm.type === 'card');
    const otherMethods = paymentMethods.filter(pm => pm.type !== 'ach' && pm.type !== 'card');

    return (
      <Box>
        {bankMethods.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BankIcon sx={{ mr: 1, fontSize: 18 }} />
              Bank Accounts (ACH) - Recommended
            </Typography>
            {bankMethods.map((method) => (
              <Card
                key={method.id}
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedPaymentMethod === method.id ? 
                    `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.success.main, width: 32, height: 32 }}>
                        <BankIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {getPaymentMethodDetails(method)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip size="small" label="ACH" color="success" />
                          {method.processingTime && (
                            <Typography variant="caption" color="text.secondary">
                              {method.processingTime}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      {method.processingFee !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          Fee: {formatCurrency(method.processingFee)}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <SpeedIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main">
                          Low Cost
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {cardMethods.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CardIcon sx={{ mr: 1, fontSize: 18 }} />
              Credit/Debit Cards
            </Typography>
            {cardMethods.map((method) => (
              <Card
                key={method.id}
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedPaymentMethod === method.id ? 
                    `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                        <CardIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {getPaymentMethodDetails(method)}
                        </Typography>
                        <Chip size="small" label="Instant" color="primary" />
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Fee: 2.9% + $0.30
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {bankMethods.length === 0 && (
          <Alert 
            severity="info" 
            action={
              <Button size="small" onClick={() => setBankLinkDialogOpen(true)}>
                Connect Bank
              </Button>
            }
            sx={{ mb: 2 }}
          >
            Connect your bank account for lower fees and faster processing
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Rent Collection
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePayment}
          disabled={selectedTenant === 'all'}
        >
          Collect Payment
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tenant</InputLabel>
                <Select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  label="Tenant"
                >
                  <MenuItem value="all">All Tenants</MenuItem>
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Property</InputLabel>
                <Select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  label="Property"
                >
                  <MenuItem value="all">All Properties</MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {selectedTenant !== 'all' && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<BankIcon />}
                      onClick={() => setBankLinkDialogOpen(true)}
                    >
                      Manage Bank Accounts
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AutoPayIcon />}
                    >
                      Setup Auto-Pay
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Recent Payments" />
          <Tab label="Payment Methods" />
          <Tab label="Schedules & Reminders" />
          <Tab label="Bank Accounts" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Recent Payments */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => {
                const tenant = tenants.find(t => t.id === payment.tenantId);
                const property = properties.find(p => p.id === payment.propertyId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{tenant?.name || 'Unknown'}</TableCell>
                    <TableCell>{property?.name || 'Unknown'}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {payment.paymentMethodId?.startsWith('bank_') ? 'Bank (ACH)' : 'Card'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ReceiptIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Payment Methods */}
        {selectedTenant === 'all' ? (
          <Alert severity="info">
            Select a tenant to view and manage their payment methods
          </Alert>
        ) : (
          <Box>
            {renderPaymentMethods()}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setBankLinkDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Add Bank Account
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Schedules & Reminders */}
        <Typography variant="h6" gutterBottom>
          Payment Schedules & Auto-Pay
        </Typography>
        <Alert severity="info">
          Auto-pay and scheduling features will be available here
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Bank Accounts */}
        {selectedTenant === 'all' ? (
          <Alert severity="info">
            Select a tenant to manage their bank accounts
          </Alert>
        ) : (
          <BankAccountManagement tenantId={selectedTenant} />
        )}
      </TabPanel>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Collect Rent Payment
          {achResult && (
            <Chip 
              label="ACH Processing" 
              color="warning" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {achResult ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ACH Payment Initiated Successfully
                  </Typography>
                  <Typography variant="body2">
                    Transaction ID: {achResult.transactionId}
                  </Typography>
                  <Typography variant="body2">
                    Effective Date: {new Date(achResult.effectiveDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Processing Fee: {formatCurrency(achResult.processingFee)}
                  </Typography>
                  <Typography variant="body2">
                    Estimated Settlement: {new Date(achResult.estimatedSettlement).toLocaleDateString()}
                  </Typography>
                </Alert>
                
                <Typography variant="body2" color="text.secondary">
                  The payment will be processed within 1-3 business days. You'll receive email notifications about the status updates.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    type="number"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={newPayment.dueDate || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select Payment Method
                  </Typography>
                  {renderPaymentMethods()}
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            {achResult ? 'Close' : 'Cancel'}
          </Button>
          {!achResult && (
            <Button
              onClick={handleProcessPayment}
              variant="contained"
              disabled={processing || !selectedPaymentMethod || !paymentAmount}
            >
              {processing ? 'Processing...' : 'Process Payment'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bank Link Dialog */}
      <BankLinkDialog
        open={bankLinkDialogOpen}
        onClose={() => setBankLinkDialogOpen(false)}
        tenantId={selectedTenant !== 'all' ? selectedTenant : ''}
        onBankConnected={loadPaymentMethods}
      />
    </Box>
  );
};

export default EnhancedRentCollection;
