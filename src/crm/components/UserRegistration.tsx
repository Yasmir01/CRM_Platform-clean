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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import Phone from '@mui/icons-material/Phone';
import Business from '@mui/icons-material/Business';
import Language from '@mui/icons-material/Language';
import AccessTime from '@mui/icons-material/AccessTime';;
import { PasswordService } from '../services/PasswordService';
import { DatabaseUserService, CreateUserData } from '../services/DatabaseUserService';

interface PasswordStrength {
  score: number;
  errors: string[];
  isValid: boolean;
}

const roleOptions = [
  { value: 'User', label: 'User', description: 'Basic access' },
  { value: 'Property Manager', label: 'Property Manager', description: 'Manage properties and tenants' },
  { value: 'Manager', label: 'Manager', description: 'Regional management' },
  { value: 'Admin', label: 'Admin', description: 'Full system access' }
];

const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

export default function UserRegistration() {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'User',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredLanguage: 'en',
    countryCode: 'US'
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, errors: [], isValid: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof CreateUserData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value as string;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time password validation
    if (field === 'password') {
      const strength = PasswordService.validatePasswordStrength(value);
      setPasswordStrength(strength);
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

    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    if (!passwordStrength.isValid) {
      errors.push('Password does not meet requirements');
    }
    if (formData.password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

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
      const newUser = await DatabaseUserService.createUser(formData);
      setSuccess(true);
      setError('');
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'User',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredLanguage: 'en',
        countryCode: 'US'
      });
      setConfirmPassword('');
      setPasswordStrength({ score: 0, errors: [], isValid: false });

    } catch (err: any) {
      setError(err.message || 'Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <PersonAdd color="success" sx={{ fontSize: 64 }} />
            <Typography variant="h5" color="success.main" textAlign="center">
              Account Created Successfully!
            </Typography>
            <Alert severity="success" sx={{ width: '100%' }}>
              A verification email has been sent to {formData.email}. 
              Please check your inbox and click the verification link to activate your account.
            </Alert>
            <Button 
              variant="outlined" 
              onClick={() => setSuccess(false)}
            >
              Create Another Account
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Stack spacing={3}>
          <Box textAlign="center">
            <PersonAdd color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" component="h1">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the PropCRM property management system
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAdd />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Security */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Security
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  error={confirmPassword !== '' && formData.password !== confirmPassword}
                  helperText={
                    confirmPassword !== '' && formData.password !== confirmPassword 
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
              </Grid>

              {/* Account Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Account Settings
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    startAdornment={
                      <InputAdornment position="start">
                        <Business />
                      </InputAdornment>
                    }
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Stack>
                          <Typography variant="body1">{role.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={formData.timezone}
                    label="Timezone"
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    startAdornment={
                      <InputAdornment position="start">
                        <AccessTime />
                      </InputAdornment>
                    }
                  >
                    {timezoneOptions.map((tz) => (
                      <MenuItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !passwordStrength.isValid}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
