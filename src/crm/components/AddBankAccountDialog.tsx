import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { BusinessBankAccount } from '../types/BankAccountTypes';
import { bankAccountService } from '../services/BankAccountService';

interface AddBankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAccountAdded: (account: BusinessBankAccount) => void;
  organizationId: string;
}

const AddBankAccountDialog: React.FC<AddBankAccountDialogProps> = ({
  open,
  onClose,
  onAccountAdded,
  organizationId
}) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'business_checking' as 'business_checking' | 'business_savings' | 'money_market',
    accountNumber: '',
    confirmAccountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    businessName: '',
    taxId: '',
    isPrimary: false,
    canReceivePayments: true,
    canSendPayments: true,
    dailyReceiveLimit: 100000, // $1,000 default
    monthlyReceiveLimit: 3000000 // $30,000 default
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 4 || formData.accountNumber.length > 17) {
      newErrors.accountNumber = 'Account number must be 4-17 digits';
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = 'Routing number is required';
    } else if (!/^\d{9}$/.test(formData.routingNumber)) {
      newErrors.routingNumber = 'Routing number must be 9 digits';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Validate routing number with the service
      const validation = await bankAccountService.validateBankAccount(
        formData.routingNumber,
        formData.accountNumber
      );

      if (!validation.routingNumber.isValid) {
        setErrors({ routingNumber: 'Invalid routing number' });
        setLoading(false);
        return;
      }

      const newAccount = await bankAccountService.addBusinessBankAccount({
        organizationId,
        bankName: formData.bankName,
        accountType: formData.accountType,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
        accountHolderName: formData.accountHolderName,
        businessName: formData.businessName,
        taxId: formData.taxId,
        isVerified: false, // Will need verification
        isPrimary: formData.isPrimary,
        canReceivePayments: formData.canReceivePayments,
        canSendPayments: formData.canSendPayments,
        dailyReceiveLimit: formData.dailyReceiveLimit * 100, // Convert to cents
        monthlyReceiveLimit: formData.monthlyReceiveLimit * 100, // Convert to cents
        fees: {
          achReceive: 0,
          achSend: 25,
          wireReceive: 1500,
          wireSend: 3000,
          monthlyMaintenance: 1200,
          overdraftFee: 3500
        },
        processingSchedule: {
          achDebitDays: [1, 2, 3, 4, 5],
          achCreditDays: [1, 2, 3, 4, 5],
          cutoffTime: '17:00',
          timezone: 'America/New_York',
          holidays: []
        }
      });

      onAccountAdded(newAccount);
      handleClose();
    } catch (error) {
      console.error('Error adding bank account:', error);
      setErrors({ general: 'Failed to add bank account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      bankName: '',
      accountType: 'business_checking',
      accountNumber: '',
      confirmAccountNumber: '',
      routingNumber: '',
      accountHolderName: '',
      businessName: '',
      taxId: '',
      isPrimary: false,
      canReceivePayments: true,
      canSendPayments: true,
      dailyReceiveLimit: 100000,
      monthlyReceiveLimit: 3000000
    });
    setErrors({});
    setShowAccountNumber(false);
    setShowConfirmAccountNumber(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BankIcon sx={{ mr: 1 }} />
          Add Business Bank Account
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Bank Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Bank Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              error={!!errors.bankName}
              helperText={errors.bankName}
              placeholder="e.g., Chase, Bank of America, Wells Fargo"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.accountType}
                label="Account Type"
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
              >
                <MenuItem value="business_checking">Business Checking</MenuItem>
                <MenuItem value="business_savings">Business Savings</MenuItem>
                <MenuItem value="money_market">Money Market</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Routing Number"
              value={formData.routingNumber}
              onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
              error={!!errors.routingNumber}
              helperText={errors.routingNumber || '9-digit bank routing number'}
              placeholder="123456789"
              inputProps={{ maxLength: 9 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number"
              type={showAccountNumber ? 'text' : 'password'}
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
              error={!!errors.accountNumber}
              helperText={errors.accountNumber}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      edge="end"
                    >
                      {showAccountNumber ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirm Account Number"
              type={showConfirmAccountNumber ? 'text' : 'password'}
              value={formData.confirmAccountNumber}
              onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
              error={!!errors.confirmAccountNumber}
              helperText={errors.confirmAccountNumber}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
                      edge="end"
                    >
                      {showConfirmAccountNumber ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Business Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Business Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Holder Name"
              value={formData.accountHolderName}
              onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
              error={!!errors.accountHolderName}
              helperText={errors.accountHolderName}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              error={!!errors.businessName}
              helperText={errors.businessName}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tax ID (EIN)"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              error={!!errors.taxId}
              helperText={errors.taxId}
              placeholder="XX-XXXXXXX"
            />
          </Grid>

          {/* Account Settings */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Daily Receive Limit"
              type="number"
              value={formData.dailyReceiveLimit / 100}
              onChange={(e) => setFormData({ ...formData, dailyReceiveLimit: Math.max(0, Number(e.target.value) * 100) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="Maximum daily amount for incoming payments"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monthly Receive Limit"
              type="number"
              value={formData.monthlyReceiveLimit / 100}
              onChange={(e) => setFormData({ ...formData, monthlyReceiveLimit: Math.max(0, Number(e.target.value) * 100) })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              helperText="Maximum monthly amount for incoming payments"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                />
              }
              label="Set as Primary Account"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.canReceivePayments}
                  onChange={(e) => setFormData({ ...formData, canReceivePayments: e.target.checked })}
                />
              }
              label="Can Receive Payments"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.canSendPayments}
                  onChange={(e) => setFormData({ ...formData, canSendPayments: e.target.checked })}
                />
              }
              label="Can Send Payments"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBankAccountDialog;
