import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  InputAdornment,
  Grid,
  useTheme
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CheckIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DollarIcon from '@mui/icons-material/AttachMoney';
import CloseIcon from '@mui/icons-material/Close';;

import { BankConnection, BankVerification, MicroDeposit } from '../types/BankAccountTypes';
import { bankAccountService } from '../services/BankAccountService';

interface BankVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  bankConnection: BankConnection;
  onVerificationComplete: () => void;
}

const BankVerificationDialog: React.FC<BankVerificationDialogProps> = ({
  open,
  onClose,
  bankConnection,
  onVerificationComplete
}) => {
  const theme = useTheme();
  const [verificationMethod, setVerificationMethod] = useState<'instant' | 'micro_deposits'>('instant');
  const [verification, setVerification] = useState<BankVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microDepositAmounts, setMicroDepositAmounts] = useState<string[]>(['', '']);
  const [verifying, setVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Choose Method',
    'Verification Process',
    'Complete'
  ];

  useEffect(() => {
    if (open && bankConnection) {
      // Check if verification already exists
      if (bankConnection.verificationStatus === 'micro_deposits_sent') {
        setVerificationMethod('micro_deposits');
        setActiveStep(1);
        // Load existing verification
        loadExistingVerification();
      } else {
        setActiveStep(0);
        setVerificationMethod('instant');
      }
      setError(null);
      setMicroDepositAmounts(['', '']);
    }
  }, [open, bankConnection]);

  const loadExistingVerification = async () => {
    // In a real implementation, you would fetch the verification status
    // For now, we'll simulate an existing micro-deposit verification
    const mockVerification: BankVerification = {
      id: `verify_${bankConnection.id}`,
      bankConnectionId: bankConnection.id,
      method: 'micro_deposits',
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      microDeposits: [
        {
          amount: 11,
          description: 'PLAID TEST 1',
          status: 'sent',
          sentAt: new Date().toISOString()
        },
        {
          amount: 32,
          description: 'PLAID TEST 2',
          status: 'sent',
          sentAt: new Date().toISOString()
        }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    setVerification(mockVerification);
  };

  const handleInstantVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const verificationResult = await bankAccountService.initiateVerification(
        bankConnection.id,
        'instant'
      );
      
      setVerification(verificationResult);
      
      if (verificationResult.status === 'completed') {
        setActiveStep(2);
        onVerificationComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMicroDepositVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const verificationResult = await bankAccountService.initiateVerification(
        bankConnection.id,
        'micro_deposits'
      );
      
      setVerification(verificationResult);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate micro-deposit verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMicroDeposits = async () => {
    if (!verification) return;

    const amounts = microDepositAmounts.map(amount => {
      const cents = Math.round(parseFloat(amount || '0') * 100);
      return cents;
    });

    if (amounts.some(amount => amount <= 0 || amount > 100)) {
      setError('Please enter valid amounts between $0.01 and $1.00');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await bankAccountService.verifyMicroDeposits(verification.id, amounts);
      
      if (result.success) {
        setActiveStep(2);
        onVerificationComplete();
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (verificationMethod === 'instant') {
        handleInstantVerification();
      } else {
        handleMicroDepositVerification();
      }
    } else if (activeStep === 1 && verificationMethod === 'micro_deposits') {
      handleVerifyMicroDeposits();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Verification Method
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select how you'd like to verify your bank account ownership.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: verificationMethod === 'instant' ? 
                      `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                    '&:hover': {
                      borderColor: theme.palette.primary.main
                    }
                  }}
                  onClick={() => setVerificationMethod('instant')}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                      <SecurityIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Instant Verification
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Verify instantly using your online banking credentials. No waiting required.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                        <CheckIcon sx={{ fontSize: 16, mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main">
                          Instant • Secure • Recommended
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: verificationMethod === 'micro_deposits' ? 
                      `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                    '&:hover': {
                      borderColor: theme.palette.primary.main
                    }
                  }}
                  onClick={() => setVerificationMethod('micro_deposits')}
                >
                  <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                      <DollarIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Micro-Deposits
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        We'll send 2 small deposits to your account. Verify the amounts to complete setup.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2" color="warning.main">
                          1-2 business days
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        if (verificationMethod === 'instant') {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {loading ? (
                <>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Verifying Your Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Securely connecting to your bank...
                  </Typography>
                </>
              ) : (
                <>
                  <SecurityIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Instant Verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Click below to securely verify your account through your bank's login portal.
                  </Typography>
                </>
              )}
            </Box>
          );
        } else {
          return (
            <Box>
              <Typography variant="h6" gutterBottom>
                Enter Micro-Deposit Amounts
              </Typography>
              
              {verification && verification.microDeposits && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Check your bank account for 2 small deposits from <strong>PLAID TEST</strong>. 
                    Enter the exact amounts below to verify your account.
                  </Typography>
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary" paragraph>
                We sent 2 small deposits to your account ending in ****{bankConnection.accountNumber.slice(-4)}. 
                These deposits will appear within 1-2 business days.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Deposit Amount"
                    value={microDepositAmounts[0]}
                    onChange={(e) => {
                      const newAmounts = [...microDepositAmounts];
                      newAmounts[0] = e.target.value;
                      setMicroDepositAmounts(newAmounts);
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    placeholder="0.00"
                    helperText="Enter amount in dollars (e.g., 0.11)"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Second Deposit Amount"
                    value={microDepositAmounts[1]}
                    onChange={(e) => {
                      const newAmounts = [...microDepositAmounts];
                      newAmounts[1] = e.target.value;
                      setMicroDepositAmounts(newAmounts);
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    placeholder="0.00"
                    helperText="Enter amount in dollars (e.g., 0.32)"
                  />
                </Grid>
              </Grid>

              {verification && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    You have {verification.maxAttempts - verification.attempts} verification attempts remaining.
                    Expires on {new Date(verification.expiresAt).toLocaleDateString()}.
                  </Typography>
                </Alert>
              )}
            </Box>
          );
        }

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Account Verified Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your bank account is now verified and ready for payments.
            </Typography>
            
            <Card sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SecurityIcon sx={{ mr: 2, color: theme.palette.success.main }} />
                  <Box>
                    <Typography variant="subtitle1">
                      {bankConnection.bankName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ****{bankConnection.accountNumber.slice(-4)} • Verified
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
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
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">
          Verify Bank Account
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
          disabled={loading || verifying}
        >
          {activeStep === 2 ? 'Close' : 'Cancel'}
        </Button>
        
        {activeStep < 2 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading || verifying || 
              (activeStep === 1 && verificationMethod === 'micro_deposits' && 
               (!microDepositAmounts[0] || !microDepositAmounts[1]))}
          >
            {loading || verifying ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                {verificationMethod === 'instant' ? 'Verifying...' : 'Verifying...'}
              </>
            ) : (
              activeStep === 0 ? 'Start Verification' : 'Verify Amounts'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BankVerificationDialog;
