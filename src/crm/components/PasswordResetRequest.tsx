import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  CircularProgress,
  Link
} from '@mui/material';
import Email from '@mui/icons-material/Email';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Lock from '@mui/icons-material/Lock';
import Send from '@mui/icons-material/Send';;
import { PasswordResetService } from '../services/PasswordResetService';

interface PasswordResetRequestProps {
  onBack?: () => void;
  onSuccess?: (email: string, resetToken?: string) => void;
}

export default function PasswordResetRequest({ onBack, onSuccess }: PasswordResetRequestProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(''); // For demo purposes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await PasswordResetService.initiatePasswordReset({
        email: email.trim(),
        ipAddress: 'demo-ip', // In production, get real IP
        userAgent: navigator.userAgent
      });

      if (result.success) {
        setSuccess(true);
        setResetToken(result.resetToken || '');
        onSuccess?.(email, result.resetToken);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Send color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h5" color="success.main" textAlign="center">
              Reset Instructions Sent
            </Typography>
            <Alert severity="success" sx={{ width: '100%' }}>
              If an account with <strong>{email}</strong> exists, you will receive password reset instructions via email.
            </Alert>
            
            {/* Demo mode - show reset token */}
            {resetToken && process.env.NODE_ENV === 'development' && (
              <Alert severity="info" sx={{ width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Demo Mode - Reset Token:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {resetToken}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  In production, this would be sent via email.
                </Typography>
              </Alert>
            )}
            
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button 
                variant="outlined" 
                onClick={onBack}
                startIcon={<ArrowBack />}
              >
                Back to Login
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setSuccess(false)}
                sx={{ flexGrow: 1 }}
              >
                Send Another Reset
              </Button>
            </Stack>
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
            <Lock color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" component="h1">
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                error={email !== '' && !validateEmail(email)}
                helperText={
                  email !== '' && !validateEmail(email) 
                    ? 'Please enter a valid email address' 
                    : 'We\'ll send reset instructions to this email'
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !validateEmail(email)}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>

              <Box textAlign="center">
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={onBack}
                  sx={{ textDecoration: 'none' }}
                >
                  ← Back to Login
                </Link>
              </Box>
            </Stack>
          </Box>

          {/* Demo mode helper */}
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                Demo Mode - Test Emails:
              </Typography>
              <Typography variant="body2" component="div">
                • superadmin@propcrm.com<br/>
                • admin@propcrm.com<br/>
                • alex@acmecrm.com<br/>
                • yasmir01@pm.me
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
