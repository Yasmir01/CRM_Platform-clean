import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon,
  Speed as SpeedIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

import { BankConnection, PlaidLinkResult } from '../types/BankAccountTypes';
import { bankAccountService } from '../services/BankAccountService';

interface BankLinkDialogProps {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  onBankConnected: (connection: BankConnection) => void;
}

interface MockPlaidAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  mask: string;
  balance: number;
}

const BankLinkDialog: React.FC<BankLinkDialogProps> = ({
  open,
  onClose,
  tenantId,
  onBankConnected
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MockPlaidAccount | null>(null);
  const [mockAccounts, setMockAccounts] = useState<MockPlaidAccount[]>([]);
  const [connecting, setConnecting] = useState(false);

  const steps = [
    'Terms & Consent',
    'Connect Your Bank',
    'Select Account',
    'Verification'
  ];

  const benefits = [
    { icon: <SecurityIcon />, title: 'Bank-level Security', description: 'Your data is encrypted and secure' },
    { icon: <SpeedIcon />, title: 'Instant Verification', description: 'No waiting for micro-deposits' },
    { icon: <VerifiedIcon />, title: 'Real-time Balance', description: 'Up-to-date account information' }
  ];

  const mockBanks = [
    { name: 'Chase Bank', accounts: [
      { id: 'acc_1', name: 'Chase Total Checking', type: 'depository', subtype: 'checking', mask: '1234', balance: 2500.00 },
      { id: 'acc_2', name: 'Chase Savings', type: 'depository', subtype: 'savings', mask: '5678', balance: 15000.00 }
    ]},
    { name: 'Bank of America', accounts: [
      { id: 'acc_3', name: 'Advantage Banking', type: 'depository', subtype: 'checking', mask: '9876', balance: 3200.00 }
    ]},
    { name: 'Wells Fargo', accounts: [
      { id: 'acc_4', name: 'Everyday Checking', type: 'depository', subtype: 'checking', mask: '4321', balance: 1800.00 }
    ]}
  ];

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setError(null);
      setConsent(false);
      setSelectedAccount(null);
      setMockAccounts([]);
      setConnecting(false);
    }
  }, [open]);

  const handleNext = () => {
    if (activeStep === 0 && !consent) {
      setError('Please accept the terms and conditions to continue');
      return;
    }
    
    if (activeStep === 1) {
      simulatePlaidLink();
      return;
    }

    if (activeStep === 2 && !selectedAccount) {
      setError('Please select a bank account to continue');
      return;
    }

    if (activeStep === 2) {
      handleConnectAccount();
      return;
    }

    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const simulatePlaidLink = () => {
    setLoading(true);
    setError(null);

    // Simulate Plaid Link flow
    setTimeout(() => {
      const randomBank = mockBanks[Math.floor(Math.random() * mockBanks.length)];
      setMockAccounts(randomBank.accounts);
      setLoading(false);
      setActiveStep(2);
    }, 2000);
  };

  const handleConnectAccount = async () => {
    if (!selectedAccount) return;

    setConnecting(true);
    setError(null);

    try {
      // Simulate Plaid result
      const mockPlaidResult: PlaidLinkResult = {
        publicToken: 'public-token-mock',
        metadata: {
          institution: {
            name: 'Mock Bank',
            institution_id: 'inst_mock'
          },
          accounts: [{
            id: selectedAccount.id,
            name: selectedAccount.name,
            type: selectedAccount.type,
            subtype: selectedAccount.subtype,
            mask: selectedAccount.mask
          }],
          link_session_id: 'session_mock'
        }
      };

      const connection = await bankAccountService.connectBankAccount(
        tenantId,
        mockPlaidResult,
        selectedAccount.id
      );

      onBankConnected(connection);
      setActiveStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect bank account');
    } finally {
      setConnecting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Connect Your Bank Account Securely
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We use bank-level security to protect your information. Your login credentials are never stored.
            </Typography>

            <Box sx={{ my: 3 }}>
              {benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: theme.palette.primary.main }}>
                    {benefit.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">{benefit.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. 
                  I authorize the connection to my bank account for payment processing.
                </Typography>
              }
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {loading ? (
              <>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Connecting to Your Bank
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Securely establishing connection...
                </Typography>
              </>
            ) : (
              <>
                <BankIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Select Your Bank
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Choose your bank from our secure network of over 11,000 financial institutions.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={simulatePlaidLink}
                  startIcon={<SecurityIcon />}
                >
                  Connect with Plaid
                </Button>
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Account for Rent Payments
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the account you'd like to use for rent payments. Only checking and savings accounts are shown.
            </Typography>

            <List>
              {mockAccounts.map((account) => (
                <ListItem key={account.id} sx={{ p: 0, mb: 1 }}>
                  <Card
                    sx={{
                      width: '100%',
                      cursor: 'pointer',
                      border: selectedAccount?.id === account.id ? 
                        `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                      '&:hover': {
                        borderColor: theme.palette.primary.main
                      }
                    }}
                    onClick={() => setSelectedAccount(account)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BankIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                          <Box>
                            <Typography variant="subtitle1">
                              {account.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)} • ****{account.mask}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary">
                            ${account.balance.toLocaleString()}
                          </Typography>
                          {selectedAccount?.id === account.id && (
                            <CheckIcon color="primary" />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Bank Account Connected Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your bank account has been connected and verified. You can now make rent payments directly from this account.
            </Typography>
            
            {selectedAccount && (
              <Card sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BankIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedAccount.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ****{selectedAccount.mask} • Verified
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">
          Connect Bank Account
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading || connecting}
        >
          Cancel
        </Button>
        
        {activeStep > 0 && activeStep < 3 && (
          <Button
            onClick={handleBack}
            disabled={loading || connecting}
          >
            Back
          </Button>
        )}
        
        {activeStep < 3 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || connecting || (activeStep === 0 && !consent)}
          >
            {loading || connecting ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                {activeStep === 1 ? 'Connecting...' : 'Processing...'}
              </>
            ) : (
              activeStep === 2 ? 'Connect Account' : 'Continue'
            )}
          </Button>
        )}

        {activeStep === 3 && (
          <Button
            variant="contained"
            onClick={onClose}
          >
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BankLinkDialog;
