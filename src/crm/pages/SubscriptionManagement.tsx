import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  TextField,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";

type SubscriptionStatus = "Active" | "Pending" | "Expired" | "Cancelled" | "Past Due";
type PaymentMethod = "Credit Card" | "Bank Transfer" | "ACH" | "Wire Transfer";
type BillingCycle = "Monthly" | "Quarterly" | "Annually";

interface PaymentInfo {
  id: string;
  type: PaymentMethod;
  last4: string;
  expiryDate?: string;
  bankName?: string;
  isDefault: boolean;
  isAutoPayEnabled: boolean;
}

interface Subscription {
  id: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  plan: string;
  price: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  paymentMethods: PaymentInfo[];
  autoPayEnabled: boolean;
  taxId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  companyInfo: {
    taxId: string;
    registrationNumber: string;
    industry: string;
    employeeCount: string;
  };
  totalPaid: number;
  outstandingBalance: number;
}

const mockSubscriptions: Subscription[] = [
  {
    id: "SUB-001",
    customerName: "John Smith",
    companyName: "Smith Properties LLC",
    email: "john@smithproperties.com",
    phone: "(555) 123-4567",
    plan: "Professional Plan",
    price: 99.99,
    billingCycle: "Monthly",
    status: "Active",
    startDate: "2024-01-15",
    nextBillingDate: "2024-02-15",
    autoPayEnabled: true,
    paymentMethods: [
      {
        id: "pm-001",
        type: "Credit Card",
        last4: "4242",
        expiryDate: "12/26",
        isDefault: true,
        isAutoPayEnabled: true,
      },
      {
        id: "pm-002",
        type: "Bank Transfer",
        last4: "7890",
        bankName: "Chase Bank",
        isDefault: false,
        isAutoPayEnabled: false,
      }
    ],
    address: {
      street: "123 Business Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    companyInfo: {
      taxId: "12-3456789",
      registrationNumber: "LLC-123456",
      industry: "Real Estate",
      employeeCount: "1-10"
    },
    totalPaid: 1299.87,
    outstandingBalance: 0
  },
  {
    id: "SUB-002",
    customerName: "Maria Garcia",
    companyName: "Garcia Real Estate Group",
    email: "maria@garciagroup.com",
    phone: "(555) 987-6543",
    plan: "Enterprise Plan",
    price: 299.99,
    billingCycle: "Annually",
    status: "Past Due",
    startDate: "2023-06-01",
    nextBillingDate: "2024-01-10",
    autoPayEnabled: false,
    paymentMethods: [
      {
        id: "pm-003",
        type: "ACH",
        last4: "1234",
        bankName: "Bank of America",
        isDefault: true,
        isAutoPayEnabled: false,
      }
    ],
    address: {
      street: "456 Corporate Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    companyInfo: {
      taxId: "98-7654321",
      registrationNumber: "CORP-987654",
      industry: "Property Management",
      employeeCount: "11-50"
    },
    totalPaid: 2999.88,
    outstandingBalance: 299.99
  }
];

export default function SubscriptionManagement() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>(mockSubscriptions);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);
  const [onboardingOpen, setOnboardingOpen] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [newCustomer, setNewCustomer] = React.useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    plan: "",
    billingCycle: "Monthly" as BillingCycle,
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    },
    companyInfo: {
      taxId: "",
      registrationNumber: "",
      industry: "",
      employeeCount: ""
    },
    paymentMethod: {
      type: "Credit Card" as PaymentMethod,
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
      autoPayEnabled: true
    }
  });

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "Active": return "success";
      case "Pending": return "warning";
      case "Past Due": return "error";
      case "Expired": return "default";
      case "Cancelled": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case "Active": return <CheckCircleRoundedIcon />;
      case "Past Due": return <ErrorRoundedIcon />;
      case "Pending": return <WarningRoundedIcon />;
      default: return <NotificationsActiveRoundedIcon />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    switch (activeTab) {
      case 1: return sub.status === "Active";
      case 2: return sub.status === "Past Due" || sub.outstandingBalance > 0;
      case 3: return sub.status === "Expired" || sub.status === "Cancelled";
      default: return true;
    }
  });

  const onboardingSteps = [
    "Customer Information",
    "Company Details", 
    "Plan Selection",
    "Payment Setup",
    "Review & Confirm"
  ];

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const plans = [
    { name: "Starter Plan", price: 29.99, features: ["Up to 5 properties", "Basic reporting", "Email support"] },
    { name: "Professional Plan", price: 99.99, features: ["Up to 50 properties", "Advanced reporting", "Priority support", "API access"] },
    { name: "Enterprise Plan", price: 299.99, features: ["Unlimited properties", "Custom reporting", "Dedicated support", "Custom integrations"] }
  ];

  const renderCustomerInfo = () => (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Customer Name"
            value={newCustomer.customerName}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, customerName: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Company Name"
            value={newCustomer.companyName}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, companyName: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </Grid>
      </Grid>
      
      <Divider />
      
      <Typography variant="h6">Address Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={newCustomer.address.street}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              address: { ...prev.address, street: e.target.value }
            }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City"
            value={newCustomer.address.city}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              address: { ...prev.address, city: e.target.value }
            }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="State"
            value={newCustomer.address.state}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              address: { ...prev.address, state: e.target.value }
            }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="ZIP Code"
            value={newCustomer.address.zipCode}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              address: { ...prev.address, zipCode: e.target.value }
            }))}
            required
          />
        </Grid>
      </Grid>
    </Stack>
  );

  const renderCompanyDetails = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Company Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tax ID / EIN"
            value={newCustomer.companyInfo.taxId}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              companyInfo: { ...prev.companyInfo, taxId: e.target.value }
            }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Registration Number"
            value={newCustomer.companyInfo.registrationNumber}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              companyInfo: { ...prev.companyInfo, registrationNumber: e.target.value }
            }))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={newCustomer.companyInfo.industry}
              label="Industry"
              onChange={(e) => setNewCustomer(prev => ({ 
                ...prev, 
                companyInfo: { ...prev.companyInfo, industry: e.target.value }
              }))}
            >
              <MenuItem value="Real Estate">Real Estate</MenuItem>
              <MenuItem value="Property Management">Property Management</MenuItem>
              <MenuItem value="Real Estate Investment">Real Estate Investment</MenuItem>
              <MenuItem value="Construction">Construction</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Employee Count</InputLabel>
            <Select
              value={newCustomer.companyInfo.employeeCount}
              label="Employee Count"
              onChange={(e) => setNewCustomer(prev => ({ 
                ...prev, 
                companyInfo: { ...prev.companyInfo, employeeCount: e.target.value }
              }))}
            >
              <MenuItem value="1-10">1-10</MenuItem>
              <MenuItem value="11-50">11-50</MenuItem>
              <MenuItem value="51-200">51-200</MenuItem>
              <MenuItem value="201-500">201-500</MenuItem>
              <MenuItem value="500+">500+</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderPlanSelection = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Choose Your Plan</Typography>
      <Grid container spacing={2}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <Card 
              sx={{ 
                height: "100%",
                cursor: "pointer",
                border: newCustomer.plan === plan.name ? 2 : 1,
                borderColor: newCustomer.plan === plan.name ? "primary.main" : "divider",
                "&:hover": {
                  borderColor: "primary.main",
                }
              }}
              onClick={() => setNewCustomer(prev => ({ ...prev, plan: plan.name }))}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="h4" color="primary">
                    ${plan.price}<Typography component="span" variant="body2">/month</Typography>
                  </Typography>
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleRoundedIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <FormControl>
        <InputLabel>Billing Cycle</InputLabel>
        <Select
          value={newCustomer.billingCycle}
          label="Billing Cycle"
          onChange={(e) => setNewCustomer(prev => ({ ...prev, billingCycle: e.target.value as BillingCycle }))}
        >
          <MenuItem value="Monthly">Monthly</MenuItem>
          <MenuItem value="Quarterly">Quarterly (5% discount)</MenuItem>
          <MenuItem value="Annually">Annually (10% discount)</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );

  const renderPaymentSetup = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Payment Information</Typography>
      
      <FormControl>
        <InputLabel>Payment Method</InputLabel>
        <Select
          value={newCustomer.paymentMethod.type}
          label="Payment Method"
          onChange={(e) => setNewCustomer(prev => ({ 
            ...prev, 
            paymentMethod: { ...prev.paymentMethod, type: e.target.value as PaymentMethod }
          }))}
        >
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
          <MenuItem value="ACH">ACH</MenuItem>
        </Select>
      </FormControl>

      {newCustomer.paymentMethod.type === "Credit Card" && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={newCustomer.paymentMethod.cardNumber}
              onChange={(e) => setNewCustomer(prev => ({ 
                ...prev, 
                paymentMethod: { ...prev.paymentMethod, cardNumber: e.target.value }
              }))}
              placeholder="1234 5678 9012 3456"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              value={newCustomer.paymentMethod.expiryDate}
              onChange={(e) => setNewCustomer(prev => ({ 
                ...prev, 
                paymentMethod: { ...prev.paymentMethod, expiryDate: e.target.value }
              }))}
              placeholder="MM/YY"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CVV"
              value={newCustomer.paymentMethod.cvv}
              onChange={(e) => setNewCustomer(prev => ({ 
                ...prev, 
                paymentMethod: { ...prev.paymentMethod, cvv: e.target.value }
              }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name on Card"
              value={newCustomer.paymentMethod.nameOnCard}
              onChange={(e) => setNewCustomer(prev => ({ 
                ...prev, 
                paymentMethod: { ...prev.paymentMethod, nameOnCard: e.target.value }
              }))}
            />
          </Grid>
        </Grid>
      )}

      <FormControlLabel
        control={
          <Switch
            checked={newCustomer.paymentMethod.autoPayEnabled}
            onChange={(e) => setNewCustomer(prev => ({ 
              ...prev, 
              paymentMethod: { ...prev.paymentMethod, autoPayEnabled: e.target.checked }
            }))}
          />
        }
        label="Enable automatic payments"
      />

      <Alert severity="info">
        <Typography variant="body2">
          Your payment information is secured with industry-standard encryption and will be processed securely.
        </Typography>
      </Alert>
    </Stack>
  );

  const renderReviewConfirm = () => {
    const selectedPlan = plans.find(p => p.name === newCustomer.plan);
    return (
      <Stack spacing={3}>
        <Typography variant="h6">Review Your Subscription</Typography>
        
        <Card variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Customer</Typography>
                <Typography>{newCustomer.customerName}</Typography>
                <Typography color="text.secondary">{newCustomer.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Company</Typography>
                <Typography>{newCustomer.companyName}</Typography>
                <Typography color="text.secondary">Tax ID: {newCustomer.companyInfo.taxId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Plan</Typography>
                <Typography>{selectedPlan?.name}</Typography>
                <Typography color="text.secondary">{newCustomer.billingCycle} billing</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Payment</Typography>
                <Typography>${selectedPlan?.price}/month</Typography>
                <Typography color="text.secondary">
                  Auto-pay: {newCustomer.paymentMethod.autoPayEnabled ? "Enabled" : "Disabled"}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Alert severity="success">
          <Typography variant="body2">
            Once confirmed, your subscription will be activated immediately and your first payment will be processed.
          </Typography>
        </Alert>
      </Stack>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Subscription Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setOnboardingOpen(true)}
        >
          Add New Subscriber
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Subscriptions
                  </Typography>
                  <Typography variant="h4">
                    {subscriptions.filter(s => s.status === "Active").length}
                  </Typography>
                </Box>
                <SubscriptionsRoundedIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ${subscriptions.filter(s => s.status === "Active").reduce((sum, s) => 
                      sum + (s.billingCycle === "Monthly" ? s.price : s.price / 12), 0
                    ).toFixed(2)}
                  </Typography>
                </Box>
                <PaymentRoundedIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Past Due
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {subscriptions.filter(s => s.status === "Past Due").length}
                  </Typography>
                </Box>
                <ErrorRoundedIcon color="error" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Outstanding
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    ${subscriptions.reduce((sum, s) => sum + s.outstandingBalance, 0).toFixed(2)}
                  </Typography>
                </Box>
                <WarningRoundedIcon color="warning" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="All Subscriptions" />
          <Tab label="Active" />
          <Tab label="Past Due" />
          <Tab label="Inactive" />
        </Tabs>
      </Card>

      {/* Subscriptions List */}
      <Grid container spacing={3}>
        {filteredSubscriptions.map((subscription) => (
          <Grid item xs={12} lg={6} key={subscription.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <BusinessRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{subscription.companyName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subscription.customerName}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={subscription.status}
                      color={getStatusColor(subscription.status)}
                      icon={getStatusIcon(subscription.status)}
                    />
                  </Stack>

                  {/* Plan Info */}
                  <Box>
                    <Typography variant="subtitle1">{subscription.plan}</Typography>
                    <Typography variant="h5" color="primary.main">
                      ${subscription.price}
                      <Typography component="span" variant="body2">
                        /{subscription.billingCycle.toLowerCase()}
                      </Typography>
                    </Typography>
                  </Box>

                  {/* Contact & Billing */}
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{subscription.email}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{subscription.phone}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReceiptRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Auto-pay Status */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AutorenewRoundedIcon 
                      fontSize="small" 
                      color={subscription.autoPayEnabled ? "success" : "disabled"} 
                    />
                    <Typography variant="body2">
                      Auto-pay: {subscription.autoPayEnabled ? "Enabled" : "Disabled"}
                    </Typography>
                  </Stack>

                  {/* Outstanding Balance */}
                  {subscription.outstandingBalance > 0 && (
                    <Alert severity="warning">
                      Outstanding balance: ${subscription.outstandingBalance}
                    </Alert>
                  )}

                  {/* Actions */}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small"
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Process Payment">
                      <IconButton size="small">
                        <PaymentRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Customer Onboarding Dialog */}
      <Dialog open={onboardingOpen} onClose={() => setOnboardingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Subscriber</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {onboardingSteps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {index === 0 && renderCustomerInfo()}
                    {index === 1 && renderCompanyDetails()}
                    {index === 2 && renderPlanSelection()}
                    {index === 3 && renderPaymentSetup()}
                    {index === 4 && renderReviewConfirm()}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={index === onboardingSteps.length - 1 ? () => {
                        // Process subscription
                        alert("Subscription created successfully!");
                        setOnboardingOpen(false);
                        setActiveStep(0);
                      } : handleNext}
                    >
                      {index === onboardingSteps.length - 1 ? "Create Subscription" : "Continue"}
                    </Button>
                  </Stack>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOnboardingOpen(false);
            setActiveStep(0);
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Details Dialog */}
      <Dialog 
        open={selectedSubscription !== null} 
        onClose={() => setSelectedSubscription(null)} 
        maxWidth="lg" 
        fullWidth
      >
        {selectedSubscription && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedSubscription.companyName}</Typography>
                <Chip
                  label={selectedSubscription.status}
                  color={getStatusColor(selectedSubscription.status)}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Customer Information</Typography>
                      <Stack spacing={1}>
                        <Typography><strong>Name:</strong> {selectedSubscription.customerName}</Typography>
                        <Typography><strong>Email:</strong> {selectedSubscription.email}</Typography>
                        <Typography><strong>Phone:</strong> {selectedSubscription.phone}</Typography>
                        <Typography><strong>Tax ID:</strong> {selectedSubscription.companyInfo.taxId}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Subscription Details</Typography>
                      <Stack spacing={1}>
                        <Typography><strong>Plan:</strong> {selectedSubscription.plan}</Typography>
                        <Typography><strong>Price:</strong> ${selectedSubscription.price}/{selectedSubscription.billingCycle.toLowerCase()}</Typography>
                        <Typography><strong>Start Date:</strong> {new Date(selectedSubscription.startDate).toLocaleDateString()}</Typography>
                        <Typography><strong>Next Billing:</strong> {new Date(selectedSubscription.nextBillingDate).toLocaleDateString()}</Typography>
                        <Typography><strong>Auto-pay:</strong> {selectedSubscription.autoPayEnabled ? "Enabled" : "Disabled"}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Payment Methods</Typography>
                      <List>
                        {selectedSubscription.paymentMethods.map((method) => (
                          <ListItem key={method.id}>
                            <ListItemIcon>
                              {method.type === "Credit Card" ? <CreditCardRoundedIcon /> : <AccountBalanceRoundedIcon />}
                            </ListItemIcon>
                            <ListItemText
                              primary={`${method.type} ending in ${method.last4}`}
                              secondary={method.bankName || method.expiryDate}
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                {method.isDefault && <Chip label="Default" size="small" />}
                                {method.isAutoPayEnabled && <Chip label="Auto-pay" size="small" color="success" />}
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSubscription(null)}>Close</Button>
              <Button variant="outlined">Edit Subscription</Button>
              <Button variant="contained">Process Payment</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
