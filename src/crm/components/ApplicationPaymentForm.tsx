import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  InputAdornment,
  Alert,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BankIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';;
import { PaymentService } from "../services/PaymentService";

interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "zelle" | "cashapp" | "paypal" | "venmo" | "check" | "money_order";
  label: string;
  enabled: boolean;
  instructions?: string;
  icon?: React.ReactNode;
  processingFee?: number;
}

interface ApplicationPaymentFormProps {
  applicationFee: number;
  paymentMethods: PaymentMethod[];
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  applicantName: string;
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
}

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    type: "credit_card",
    label: "Credit Card",
    enabled: true,
    instructions: "Secure online payment processing",
    icon: <CreditCardIcon />,
    processingFee: 2.9
  },
  {
    id: "debit_card",
    type: "debit_card",
    label: "Debit Card",
    enabled: true,
    instructions: "Secure online payment processing",
    icon: <CreditCardIcon />,
    processingFee: 2.9
  },
  {
    id: "zelle",
    type: "zelle",
    label: "Zelle",
    enabled: true,
    instructions: "Send payment to: company@email.com",
    icon: <BankIcon />,
    processingFee: 0
  },
  {
    id: "cashapp",
    type: "cashapp",
    label: "CashApp",
    enabled: true,
    instructions: "Send payment to: $YourCashAppHandle",
    icon: <PaymentIcon />,
    processingFee: 0
  },
  {
    id: "paypal",
    type: "paypal",
    label: "PayPal",
    enabled: true,
    instructions: "Send payment to: company@email.com",
    icon: <PaymentIcon />,
    processingFee: 2.9
  },
  {
    id: "venmo",
    type: "venmo",
    label: "Venmo",
    enabled: true,
    instructions: "Send payment to: @YourVenmoHandle",
    icon: <PaymentIcon />,
    processingFee: 0
  },
  {
    id: "check",
    type: "check",
    label: "Check",
    enabled: true,
    instructions: "Make checks payable to: Your Company Name",
    icon: <ReceiptIcon />,
    processingFee: 0
  },
  {
    id: "money_order",
    type: "money_order",
    label: "Money Order",
    enabled: true,
    instructions: "Make money order payable to: Your Company Name",
    icon: <ReceiptIcon />,
    processingFee: 0
  }
];

export default function ApplicationPaymentForm({
  applicationFee,
  paymentMethods = defaultPaymentMethods,
  onPaymentSuccess,
  onPaymentError,
  applicantName,
  applicationId,
  isOpen,
  onClose
}: ApplicationPaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = React.useState<string>("");
  const [activeStep, setActiveStep] = React.useState(0);
  const [paymentProcessing, setPaymentProcessing] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    billingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    phone: "",
    confirmationCode: "",
    transactionId: "",
  });

  const enabledMethods = paymentMethods.filter(method => method.enabled);
  const selectedPaymentMethod = enabledMethods.find(method => method.id === selectedMethod);
  const processingFee = selectedPaymentMethod?.processingFee || 0;
  const totalAmount = applicationFee + (applicationFee * (processingFee / 100));

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setActiveStep(1);
  };

  const handlePaymentDataChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processOnlinePayment = async () => {
    setPaymentProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const confirmationCode = `CONF_${Date.now().toString().slice(-6)}`;
      
      setPaymentData(prev => ({
        ...prev,
        transactionId,
        confirmationCode
      }));

      setActiveStep(2);
      
      // Notify parent component of successful payment
      onPaymentSuccess({
        applicationId,
        amount: totalAmount,
        method: selectedPaymentMethod?.label,
        transactionId,
        confirmationCode,
        status: "completed",
        paidAt: new Date().toISOString()
      });

    } catch (error) {
      onPaymentError("Payment processing failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const processOfflinePayment = () => {
    const confirmationCode = `OFFLINE_${Date.now().toString().slice(-6)}`;
    
    setPaymentData(prev => ({
      ...prev,
      confirmationCode
    }));

    setActiveStep(2);
    
    // Notify parent component of offline payment instructions
    onPaymentSuccess({
      applicationId,
      amount: totalAmount,
      method: selectedPaymentMethod?.label,
      confirmationCode,
      status: "pending_verification",
      instructions: selectedPaymentMethod?.instructions,
      submittedAt: new Date().toISOString()
    });
  };

  const handleSubmitPayment = () => {
    if (!selectedPaymentMethod) return;

    if (["credit_card", "debit_card", "paypal"].includes(selectedPaymentMethod.type)) {
      processOnlinePayment();
    } else {
      processOfflinePayment();
    }
  };

  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null;

    const isOnlinePayment = ["credit_card", "debit_card", "paypal"].includes(selectedPaymentMethod.type);

    if (isOnlinePayment) {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SecurityIcon fontSize="small" />
              <Typography variant="body2">
                Your payment information is encrypted and secure
              </Typography>
            </Stack>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardholder Name"
                value={paymentData.holderName}
                onChange={(e) => handlePaymentDataChange("holderName", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                value={paymentData.cardNumber}
                onChange={(e) => handlePaymentDataChange("cardNumber", e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CreditCardIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                value={paymentData.expiryDate}
                onChange={(e) => handlePaymentDataChange("expiryDate", e.target.value)}
                placeholder="MM/YY"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                value={paymentData.cvv}
                onChange={(e) => handlePaymentDataChange("cvv", e.target.value)}
                placeholder="123"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="3-digit security code on the back of your card">
                        <InfoIcon color="action" fontSize="small" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Billing Address</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={paymentData.billingAddress}
                onChange={(e) => handlePaymentDataChange("billingAddress", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={paymentData.city}
                onChange={(e) => handlePaymentDataChange("city", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="State"
                value={paymentData.state}
                onChange={(e) => handlePaymentDataChange("state", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={paymentData.zipCode}
                onChange={(e) => handlePaymentDataChange("zipCode", e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Box>
      );
    } else {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Payment Instructions for {selectedPaymentMethod.label}
            </Typography>
            <Typography variant="body2">
              {selectedPaymentMethod.instructions}
            </Typography>
          </Alert>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Application Fee:</Typography>
                  <Typography fontWeight="medium">${applicationFee.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Processing Fee:</Typography>
                  <Typography fontWeight="medium">$0.00</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" color="primary">${totalAmount.toFixed(2)}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <TextField
            fullWidth
            label="Your Email"
            type="email"
            value={paymentData.email}
            onChange={(e) => handlePaymentDataChange("email", e.target.value)}
            helperText="We'll send payment confirmation to this email"
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Your Phone Number"
            value={paymentData.phone}
            onChange={(e) => handlePaymentDataChange("phone", e.target.value)}
            helperText="For payment verification purposes"
            required
          />
        </Box>
      );
    }
  };

  const steps = [
    {
      label: "Select Payment Method",
      content: (
        <Box>
          <Typography variant="body1" gutterBottom>
            Choose your preferred payment method for the ${applicationFee} application fee:
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {enabledMethods.map((method) => (
              <Grid item xs={12} sm={6} md={4} key={method.id}>
                <Card
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: "primary.main"
                    },
                    ...(selectedMethod === method.id && {
                      borderColor: "primary.main",
                      boxShadow: 2
                    })
                  }}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Box sx={{ mb: 2, color: "primary.main" }}>
                      {method.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {method.label}
                    </Typography>
                    {method.processingFee ? (
                      <Chip
                        label={`${method.processingFee}% fee`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label="No fee"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {method.instructions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    {
      label: "Payment Information",
      content: renderPaymentForm()
    },
    {
      label: "Confirmation",
      content: (
        <Box textAlign="center">
          <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Payment Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Your application fee payment has been processed.
          </Typography>
          
          <Card variant="outlined" sx={{ mt: 3, textAlign: "left" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Summary</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Applicant:</Typography>
                  <Typography fontWeight="medium">{applicantName}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Application ID:</Typography>
                  <Typography fontWeight="medium">{applicationId}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Payment Method:</Typography>
                  <Typography fontWeight="medium">{selectedPaymentMethod?.label}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Amount:</Typography>
                  <Typography fontWeight="medium">${totalAmount.toFixed(2)}</Typography>
                </Stack>
                {paymentData.transactionId && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography>Transaction ID:</Typography>
                    <Typography fontWeight="medium" sx={{ fontFamily: "monospace" }}>
                      {paymentData.transactionId}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Confirmation Code:</Typography>
                  <Typography fontWeight="medium" sx={{ fontFamily: "monospace" }}>
                    {paymentData.confirmationCode}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )
    }
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <PaymentIcon color="primary" />
          <Box>
            <Typography variant="h5">Application Fee Payment</Typography>
            <Typography variant="body2" color="text.secondary">
              Secure payment processing for rental application
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                
                {index === 1 && selectedPaymentMethod && (
                  <Box sx={{ mt: 3 }}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveStep(0)}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmitPayment}
                        disabled={paymentProcessing}
                        startIcon={paymentProcessing ? <CircularProgress size={20} /> : <LockIcon />}
                      >
                        {paymentProcessing ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        {activeStep === 2 ? (
          <Button variant="contained" onClick={onClose}>
            Complete Application
          </Button>
        ) : (
          <Button onClick={onClose}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
