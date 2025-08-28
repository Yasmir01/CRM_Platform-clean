import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Add as AddIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';
import { bankAccountService } from '../services/BankAccountService';
import { BusinessBankAccount } from '../types/BankAccountTypes';

interface BusinessBankAccountSelectorProps {
  value?: string;
  onChange: (accountId: string | undefined) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  showAddButton?: boolean;
  organizationId?: string;
}

export const BusinessBankAccountSelector: React.FC<BusinessBankAccountSelectorProps> = ({
  value,
  onChange,
  label = "Business Bank Account",
  helperText = "Select which business bank account will receive rent payments",
  disabled = false,
  required = false,
  showAddButton = true,
  organizationId = 'org_main'
}) => {
  const [accounts, setAccounts] = useState<BusinessBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessAccounts();
  }, [organizationId]);

  const loadBusinessAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const businessAccounts = await bankAccountService.getBusinessBankAccounts(organizationId);
      setAccounts(businessAccounts);
    } catch (err) {
      setError('Failed to load business bank accounts');
      console.error('Error loading business accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: any) => {
    const selectedValue = event.target.value;
    onChange(selectedValue === '' ? undefined : selectedValue);
  };

  const selectedAccount = accounts.find(acc => acc.id === value);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading business bank accounts...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button size="small" onClick={loadBusinessAccounts} sx={{ ml: 1 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (accounts.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="body2" gutterBottom>
            No business bank accounts configured yet.
          </Typography>
          {showAddButton && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Business Bank Account
            </Button>
          )}
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <FormControl fullWidth required={required} disabled={disabled}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value || ''}
          onChange={handleChange}
          label={label}
        >
          <MenuItem value="">
            <em>Use default payment routing</em>
          </MenuItem>
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <BankIcon color="primary" fontSize="small" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {account.businessName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {account.bankName} •••{account.accountNumber.slice(-4)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {account.isPrimary && (
                    <Chip label="Primary" color="primary" size="small" />
                  )}
                  {account.isVerified && (
                    <VerifiedIcon color="success" fontSize="small" />
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {selectedAccount && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Selected:</strong> {selectedAccount.businessName} - {selectedAccount.bankName}
          </Typography>
          <Typography variant="caption" display="block">
            All rent payments for this property will be deposited to this account.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default BusinessBankAccountSelector;
