import React, { useState, useEffect } from 'react';
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
  IconButton,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Lock from '@mui/icons-material/Lock';
import Check from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Save from '@mui/icons-material/Save';;
import { PasswordResetService } from '../services/PasswordResetService';
import { PasswordService } from '../services/PasswordService';

interface PasswordResetConfirmProps {
  token?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PasswordStrength {
  score: number;
  errors: string[];
  isValid: boolean;
}

export default function PasswordResetConfirm({ token, onSuccess, onError }: PasswordResetConfirmProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, errors: [], isValid: false });
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    validateToken();
  }, [token]);

  // Real-time password strength validation
  useEffect(() => {
    if (newPassword) {
      const strength = PasswordService.validatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, errors: [], isValid: false });
    }
  }, [newPassword]);

  const validateToken = async () => {
    if (!token) {
      setError('No reset token provided');
      setValidatingToken(false);
      return;
    }

    try {
      const result = await PasswordResetService.validateResetToken(token);
      if (result.valid) {
        setTokenValid(true);
        setTokenEmail(result.email || '');
      } else {
        setError('Invalid or expired reset token. Please request a new password reset.');
      }
    } catch (err) {
      setError('Unable to validate reset token. Please try again.');
    } finally {
      setValidatingToken(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'error';
    if (score <= 2) return 'warning';
    if (score <= 3) return 'info';
    return 'success';
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score <= 1) return 'Weak';
    if (score <= 2) return 'Fair';
    if (score <= 3) return 'Good';
    if (score <= 4) return 'Strong';
    return 'Very Strong';
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!newPassword) errors.push('New password is required');
    if (!passwordStrength.isValid) errors.push('Password does not meet requirements');
    if (!confirmPassword) errors.push('Password confirmation is required');
    if (newPassword !== confirmPassword) errors.push('Passwords do not match');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const result = await PasswordResetService.changePasswordWithToken({
        token: token!,
        newPassword,
        confirmPassword
      });

      if (result.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError(result.message);
        onError?.(result.message);
      }
    } catch (err: any) {
      const errorMessage = 'Failed to reset password. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={64} />
            <Typography variant="h6">
              Validating reset token...
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <ErrorIcon color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h5" color="error.main" textAlign="center">
              Invalid Reset Link
            </Typography>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error || 'This password reset link is invalid or has expired.'}
            </Alert>
            <Button 
              variant="contained" 
              href="/login"
              sx={{ mt: 2 }}
            >
              Request New Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (success) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Check color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h5" color="success.main" textAlign="center">
              Password Reset Successfully
            </Typography>
            <Alert severity="success" sx={{ width: '100%' }}>
              Your password has been updated successfully. You can now log in with your new password.
            </Alert>
            <Button 
              variant="contained" 
              href="/login"
              sx={{ mt: 2 }}
            >
              Continue to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Reset form
  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Lock color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" component="h1">
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a strong password for your account
            </Typography>
            {tokenEmail && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Resetting password for: {tokenEmail}
              </Typography>
            )}
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
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password strength indicator */}
              {newPassword && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 5) * 100}
                      color={getPasswordStrengthColor(passwordStrength.score)}
                      sx={{ flexGrow: 1 }}
                    />
                    <Chip
                      label={getPasswordStrengthLabel(passwordStrength.score)}
                      color={getPasswordStrengthColor(passwordStrength.score)}
                      size="small"
                    />
                  </Stack>
                  {passwordStrength.errors.length > 0 && (
                    <Typography variant="caption" color="error" component="div" sx={{ mt: 0.5 }}>
                      {passwordStrength.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </Typography>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                error={confirmPassword !== '' && newPassword !== confirmPassword}
                helperText={
                  confirmPassword !== '' && newPassword !== confirmPassword 
                    ? 'Passwords do not match' 
                    : ''
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !passwordStrength.isValid || newPassword !== confirmPassword}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
