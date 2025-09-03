import React, { useState, useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';;
import { BusinessBankAccount } from '../types/BankAccountTypes';
import { bankAccountService } from '../services/BankAccountService';

interface EditBankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAccountUpdated: (account: BusinessBankAccount) => void;
  account: BusinessBankAccount | null;
}

const EditBankAccountDialog: React.FC<EditBankAccountDialogProps> = ({
  open,
  onClose,
  onAccountUpdated,
  account
}) => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'business_checking' as 'business_checking' | 'business_savings' | 'money_market',
    accountHolderName: '',
    businessName: '',
    isPrimary: false,
    canReceivePayments: true,
    canSendPayments: true,
    dailyReceiveLimit: 100000, // $1,000 default
    monthlyReceiveLimit: 3000000 // $30,000 default
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load account data when dialog opens
  useEffect(() => {
    if (account && open) {
      setFormData({
        bankName: account.bankName,
        accountType: account.accountType,
        accountHolderName: account.accountHolderName,
        businessName: account.businessName,
        isPrimary: account.isPrimary,
        canReceivePayments: account.canReceivePayments,
        canSendPayments: account.canSendPayments,
        dailyReceiveLimit: account.dailyReceiveLimit,
        monthlyReceiveLimit: account.monthlyReceiveLimit
      });
    }
  }, [account, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !account) {
      return;
    }

    setLoading(true);
    try {
      const updatedAccount: BusinessBankAccount = {
        ...account,
        bankName: formData.bankName,
        accountType: formData.accountType,
        accountHolderName: formData.accountHolderName,
        businessName: formData.businessName,
        isPrimary: formData.isPrimary,
        canReceivePayments: formData.canReceivePayments,
        canSendPayments: formData.canSendPayments,
        dailyReceiveLimit: formData.dailyReceiveLimit,
        monthlyReceiveLimit: formData.monthlyReceiveLimit,
        updatedAt: new Date().toISOString()
      };

      // In a real implementation, this would call an update service
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));

      onAccountUpdated(updatedAccount);
      handleClose();
    } catch (error) {
      console.error('Error updating bank account:', error);
      setErrors({ general: 'Failed to update bank account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!account) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Bank Account
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Account Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Account number and routing number cannot be changed for security reasons.
            </Alert>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number"
              value={account.accountNumber}
              disabled
              helperText="Cannot be changed after account creation"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Routing Number"
              value={account.routingNumber}
              disabled
              helperText="Cannot be changed after account creation"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              error={!!errors.bankName}
              helperText={errors.bankName}
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

          {/* Account Status */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Status
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Verification Status"
              value={account.isVerified ? 'Verified' : 'Pending Verification'}
              disabled
              helperText="Contact support to change verification status"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Created Date"
              value={new Date(account.createdAt).toLocaleDateString()}
              disabled
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
          {loading ? 'Updating...' : 'Update Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBankAccountDialog;
