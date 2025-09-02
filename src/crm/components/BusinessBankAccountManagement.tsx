import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

import { BusinessBankAccount, ProcessingSchedule, BusinessAccountFees } from '../types/BankAccountTypes';
import { bankAccountService } from '../services/BankAccountService';
import { useI18nFormat } from "../utils/i18nFormat";

interface BusinessBankAccountManagementProps {
  organizationId: string;
}

const BusinessBankAccountManagement: React.FC<BusinessBankAccountManagementProps> = ({ organizationId }) => {
  const theme = useTheme();
  const [businessAccounts, setBusinessAccounts] = useState<BusinessBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BusinessBankAccount | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState<Partial<BusinessBankAccount>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBusinessAccounts();
  }, [organizationId]);

  const loadBusinessAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await bankAccountService.getBusinessBankAccounts(organizationId);
      setBusinessAccounts(accounts);
    } catch (error) {
      console.error('Failed to load business accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: BusinessBankAccount) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAccount(null);
  };

  const handleAddAccount = () => {
    setFormData({
      organizationId,
      bankName: '',
      accountType: 'business_checking',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: '',
      businessName: '',
      taxId: '',
      isVerified: false,
      isPrimary: businessAccounts.length === 0,
      canReceivePayments: true,
      canSendPayments: false,
      dailyReceiveLimit: 10000000, // $100,000
      monthlyReceiveLimit: 300000000, // $3,000,000
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
    setAddDialogOpen(true);
  };

  const handleEditAccount = () => {
    if (selectedAccount) {
      setFormData({ ...selectedAccount });
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSaveAccount = async () => {
    if (!formData.bankName || !formData.accountNumber || !formData.routingNumber) {
      return;
    }

    setSubmitting(true);
    try {
      if (editDialogOpen && selectedAccount) {
        // Update existing account
        await bankAccountService.updateBusinessBankAccount(selectedAccount.id, formData);
      } else {
        // Add new account
        await bankAccountService.addBusinessBankAccount(formData as Omit<BusinessBankAccount, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await loadBusinessAccounts();
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setFormData({});
    } catch (error) {
      console.error('Failed to save account:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimary = async () => {
    if (!selectedAccount) return;

    try {
      // Update all accounts to not be primary
      for (const account of businessAccounts) {
        if (account.id !== selectedAccount.id && account.isPrimary) {
          await bankAccountService.updateBusinessBankAccount(account.id, { isPrimary: false });
        }
      }
      
      // Set selected as primary
      await bankAccountService.updateBusinessBankAccount(selectedAccount.id, { isPrimary: true });
      await loadBusinessAccounts();
    } catch (error) {
      console.error('Failed to set primary account:', error);
    }
    handleMenuClose();
  };

  const { formatCurrency } = useI18nFormat();
  const formatCurrencyCents = (amount: number) => formatCurrency(amount / 100);

  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.includes('*') ? accountNumber : `****${accountNumber.slice(-4)}`;
  };

  const renderAccountForm = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Bank Name"
            value={formData.bankName || ''}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Account Type</InputLabel>
            <Select
              value={formData.accountType || 'business_checking'}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
              label="Account Type"
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
            label="Account Number"
            value={formData.accountNumber || ''}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            required
            type="password"
            helperText="Account number will be encrypted"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Routing Number"
            value={formData.routingNumber || ''}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            required
            inputProps={{ maxLength: 9 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Account Holder Name"
            value={formData.accountHolderName || ''}
            onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Business Name"
            value={formData.businessName || ''}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tax ID (EIN)"
            value={formData.taxId || ''}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            required
            type="password"
            helperText="Tax ID will be encrypted"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Daily Receive Limit"
            value={formData.dailyReceiveLimit ? formData.dailyReceiveLimit / 100 : ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              dailyReceiveLimit: Math.round(parseFloat(e.target.value || '0') * 100)
            })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Monthly Receive Limit"
            value={formData.monthlyReceiveLimit ? formData.monthlyReceiveLimit / 100 : ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              monthlyReceiveLimit: Math.round(parseFloat(e.target.value || '0') * 100)
            })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.canReceivePayments || false}
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
                checked={formData.canSendPayments || false}
                onChange={(e) => setFormData({ ...formData, canSendPayments: e.target.checked })}
              />
            }
            label="Can Send Payments"
          />
        </Grid>
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Business Bank Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAccount}
        >
          Add Business Account
        </Button>
      </Box>

      {/* Business Accounts */}
      {businessAccounts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <BusinessIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Business Accounts Configured
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add your business bank account to receive rent payments and manage cash flow.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAccount}
            >
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {businessAccounts.map((account) => (
            <Grid item xs={12} lg={6} key={account.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.success.main }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {account.bankName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {account.accountType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {formatAccountNumber(account.accountNumber)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {account.isPrimary && (
                        <Chip size="small" label="Primary" color="primary" sx={{ mr: 1 }} />
                      )}
                      {account.isVerified && (
                        <Chip size="small" label="Verified" color="success" sx={{ mr: 1 }} />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, account)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Daily Limit
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrencyCents(account.dailyReceiveLimit)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Limit
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrencyCents(account.monthlyReceiveLimit)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        ACH Receive Fee
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrencyCents(account.fees.achReceive)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Processing Days
                      </Typography>
                      <Typography variant="body1">
                        {account.processingSchedule.achCreditDays.length} days/week
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Business: {account.businessName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {account.canReceivePayments && (
                        <Chip size="small" label="Receive" color="success" variant="outlined" />
                      )}
                      {account.canSendPayments && (
                        <Chip size="small" label="Send" color="primary" variant="outlined" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Account Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedAccount && !selectedAccount.isPrimary && (
          <MenuItem onClick={handleSetPrimary}>
            <SecurityIcon sx={{ mr: 1 }} fontSize="small" />
            Set as Primary
          </MenuItem>
        )}
        <MenuItem onClick={handleEditAccount}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Account
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle delete
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Remove Account
        </MenuItem>
      </Menu>

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Business Bank Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {renderAccountForm()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAccount}
            variant="contained"
            disabled={submitting || !formData.bankName || !formData.accountNumber}
          >
            {submitting ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Add Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Business Bank Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {renderAccountForm()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveAccount}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessBankAccountManagement;
