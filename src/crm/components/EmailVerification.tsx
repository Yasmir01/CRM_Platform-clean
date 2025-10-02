import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import Email from '@mui/icons-material/Email';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Send from '@mui/icons-material/Send';
import Refresh from '@mui/icons-material/Refresh';;
import { EmailVerificationService } from '../services/EmailVerificationService';

interface EmailVerificationProps {
  token?: string; // For verifying with token from URL
  email?: string; // For resending verification
  userId?: string;
  mode?: 'verify' | 'resend' | 'status';
  onVerificationComplete?: () => void;
  onResendComplete?: () => void;
}

export default function EmailVerification({
  token,
  email,
  userId,
  mode = 'verify',
  onVerificationComplete,
  onResendComplete
}: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    email?: string;
  }>({ verified: false });

  useEffect(() => {
    if (mode === 'verify' && token) {
      handleTokenVerification();
    } else if (mode === 'status' && userId) {
      checkVerificationStatus();
    }
  }, [token, userId, mode]);

  const handleTokenVerification = async () => {
    if (!token) {
      setError('No verification token provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await EmailVerificationService.verifyEmail({ token });
      
      if (result.success) {
        setSuccess(true);
        onVerificationComplete?.();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await EmailVerificationService.resendVerification(email);
      
      if (result.success) {
        setSuccess(true);
        onResendComplete?.();
        
        // Show demo token in development
        if (result.verificationToken && process.env.NODE_ENV === 'development') {
          console.log('🔗 Demo Verification Token:', result.verificationToken);
        }
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!userId) return;

    try {
      const status = await EmailVerificationService.checkVerificationStatus(userId);
      setVerificationStatus(status);
    } catch (err) {
      console.error('Failed to check verification status:', err);
    }
  };

  // Token verification mode
  if (mode === 'verify') {
    if (loading) {
      return (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CircularProgress size={64} />
              <Typography variant="h6">
                Verifying your email...
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Please wait while we verify your email address.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (success) {
      return (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CheckCircle color="success" sx={{ fontSize: 64 }} />
              <Typography variant="h5" color="success.main" textAlign="center">
                Email Verified Successfully!
              </Typography>
              <Alert severity="success" sx={{ width: '100%' }}>
                Your email address has been verified. Your account is now active and you can access all features.
              </Alert>
              <Button 
                variant="contained" 
                href="/crm"
                size="large"
              >
                Continue to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <ErrorIcon color="error" sx={{ fontSize: 64 }} />
              <Typography variant="h5" color="error.main" textAlign="center">
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined"
                  onClick={() => window.location.href = '/login'}
                >
                  Back to Login
                </Button>
                <Button 
                  variant="contained"
                  onClick={() => window.location.href = '/resend-verification'}
                >
                  Request New Link
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      );
    }
  }

  // Resend verification mode
  if (mode === 'resend') {
    if (success) {
      return (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Send color="success" sx={{ fontSize: 64 }} />
              <Typography variant="h5" color="success.main" textAlign="center">
                Verification Email Sent
              </Typography>
              <Alert severity="success" sx={{ width: '100%' }}>
                A new verification email has been sent to <strong>{email}</strong>. 
                Please check your inbox and spam folder.
              </Alert>
              <Alert severity="info" sx={{ width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Demo Mode - Check Console
                </Typography>
                <Typography variant="body2">
                  In development mode, check the browser console for the verification link.
                </Typography>
              </Alert>
              <Button 
                variant="outlined"
                onClick={() => setSuccess(false)}
              >
                Send Another Verification
              </Button>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Email color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h4" component="h1">
                Resend Verification Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll send a new verification link to your email address.
              </Typography>
              {email && (
                <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                  {email}
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !email}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              onClick={handleResendVerification}
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </Button>

            <Divider />

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/login'}
              >
                Back to Login
              </Button>
              <Button
                variant="text"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Status check mode
  if (mode === 'status') {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Email color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="h1">
                Email Verification Status
              </Typography>
            </Box>

            {verificationStatus.verified ? (
              <Alert severity="success">
                <Typography variant="subtitle2" gutterBottom>
                  Email Verified
                </Typography>
                <Typography variant="body2">
                  Your email address {verificationStatus.email} is verified and your account is active.
                </Typography>
              </Alert>
            ) : (
              <Alert severity="warning">
                <Typography variant="subtitle2" gutterBottom>
                  Email Not Verified
                </Typography>
                <Typography variant="body2">
                  Your email address {verificationStatus.email} needs to be verified to activate your account.
                </Typography>
              </Alert>
            )}

            {!verificationStatus.verified && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<Send />}
                onClick={() => verificationStatus.email && handleResendVerification()}
                disabled={!verificationStatus.email}
              >
                Send Verification Email
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return null;
}
