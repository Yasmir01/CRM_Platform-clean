import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { BusinessBankAccount } from '../types/BankAccountTypes';

interface RemoveBankAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAccountRemoved: (accountId: string) => void;
  account: BusinessBankAccount | null;
}

const RemoveBankAccountDialog: React.FC<RemoveBankAccountDialogProps> = ({
  open,
  onClose,
  onAccountRemoved,
  account
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expectedConfirmationText = account ? `REMOVE ${account.bankName.toUpperCase()}` : '';

  const handleRemove = async () => {
    if (!account) return;

    if (confirmationText !== expectedConfirmationText) {
      setErrors({ confirmation: 'Please type the exact confirmation text' });
      return;
    }

    if (!acknowledgeWarnings) {
      setErrors({ warnings: 'Please acknowledge the warnings before proceeding' });
      return;
    }

    setLoading(true);
    try {
      // Simulate removal process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would call the bank account service
      // await bankAccountService.deleteBusinessBankAccount(account.id);
      
      onAccountRemoved(account.id);
      handleClose();
    } catch (error) {
      console.error('Error removing bank account:', error);
      setErrors({ general: 'Failed to remove bank account. Please try again or contact support.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setAcknowledgeWarnings(false);
    setErrors({});
    onClose();
  };

  if (!account) {
    return null;
  }

  const warnings = [
    'All future payments to this account will be rejected',
    'Payment routing rules using this account will be disabled',
    'Transaction history will be archived but not deleted',
    'Pending transactions may be affected',
    account.isPrimary && 'This is your primary account - you may need to set a new primary account'
  ].filter(Boolean);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
          Remove Bank Account
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⚠️ This action cannot be undone
          </Typography>
          <Typography variant="body2">
            You are about to permanently remove the bank account "{account.bankName}" 
            ({account.accountNumber}) from your property management system.
          </Typography>
        </Alert>

        {/* Account Summary */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Account to Remove:
          </Typography>
          <Typography variant="body1">
            <strong>{account.bankName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {account.accountType} • {account.accountNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Routing: {account.routingNumber}
          </Typography>
          {account.isPrimary && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              ⚠️ Primary Account
            </Typography>
          )}
        </Box>

        {/* Warnings List */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Important Warnings:
        </Typography>

        <List dense sx={{ mb: 3 }}>
          {warnings.map((warning, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <WarningIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={warning}
                sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
              />
            </ListItem>
          ))}
        </List>

        {/* Confirmation Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={acknowledgeWarnings}
              onChange={(e) => {
                setAcknowledgeWarnings(e.target.checked);
                if (errors.warnings) {
                  setErrors({ ...errors, warnings: '' });
                }
              }}
              color="error"
            />
          }
          label="I understand the consequences and want to proceed with removing this bank account"
          sx={{ mb: 2 }}
        />
        {errors.warnings && (
          <Typography variant="caption" color="error" display="block" sx={{ mb: 2 }}>
            {errors.warnings}
          </Typography>
        )}

        {/* Confirmation Text Input */}
        <Typography variant="body2" gutterBottom>
          To confirm removal, please type: <strong>{expectedConfirmationText}</strong>
        </Typography>
        <TextField
          fullWidth
          placeholder={expectedConfirmationText}
          value={confirmationText}
          onChange={(e) => {
            setConfirmationText(e.target.value);
            if (errors.confirmation) {
              setErrors({ ...errors, confirmation: '' });
            }
          }}
          error={!!errors.confirmation}
          helperText={errors.confirmation}
          sx={{ mb: 2 }}
        />

        {/* Final Warning */}
        <Alert severity="error">
          <Typography variant="body2">
            <strong>Final Warning:</strong> Once you remove this bank account, it cannot be restored. 
            You will need to re-add it manually if you want to use it again in the future.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleRemove}
          variant="contained"
          color="error"
          disabled={loading || confirmationText !== expectedConfirmationText || !acknowledgeWarnings}
          startIcon={loading ? null : <DeleteIcon />}
        >
          {loading ? 'Removing...' : 'Remove Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveBankAccountDialog;
