/**
 * Platform Authentication Flow Component
 * Handles different authentication methods for real estate platforms
 */

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Info,
  Launch,
  ContentCopy,
  Refresh,
  Security,
  Key,
  AccountCircle,
  VpnKey,
  ExpandMore,
  Help,
  OpenInNew
} from '@mui/icons-material';

import { RealEstatePlatformService } from '../services/RealEstatePlatformService';
import {
  RealEstatePlatform,
  PlatformConfiguration,
  AuthenticationType,
  PlatformAuthConfig
} from '../types/RealEstatePlatformTypes';

interface PlatformAuthenticationFlowProps {
  platform: RealEstatePlatform;
  config: PlatformConfiguration;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (platform: RealEstatePlatform) => void;
  userId: string;
}

interface AuthStep {
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export default function PlatformAuthenticationFlow({
  platform,
  config,
  isOpen,
  onClose,
  onSuccess,
  userId
}: PlatformAuthenticationFlowProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [authData, setAuthData] = React.useState<Partial<PlatformAuthConfig>>({
    environment: 'sandbox'
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [authSteps, setAuthSteps] = React.useState<AuthStep[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      initializeAuthFlow();
    }
  }, [isOpen, config.authenticationType]);

  const initializeAuthFlow = () => {
    setActiveStep(0);
    setError(null);
    setAuthData({ environment: 'sandbox' });
    
    // Setup steps based on authentication type
    const steps = getAuthStepsForType(config.authenticationType);
    setAuthSteps(steps);
  };

  const getAuthStepsForType = (authType: AuthenticationType): AuthStep[] => {
    switch (authType) {
      case 'oauth2':
        return [
          { label: 'Setup Application', description: 'Register your application with the platform', completed: false, active: true },
          { label: 'Configure OAuth', description: 'Enter client credentials and scope', completed: false, active: false },
          { label: 'Authorize Access', description: 'Grant permissions to your application', completed: false, active: false },
          { label: 'Test Connection', description: 'Verify the authentication works', completed: false, active: false }
        ];
      case 'api_key':
        return [
          { label: 'Generate API Key', description: 'Create API key in platform dashboard', completed: false, active: true },
          { label: 'Configure Key', description: 'Enter API key and settings', completed: false, active: false },
          { label: 'Test Connection', description: 'Verify the API key works', completed: false, active: false }
        ];
      case 'username_password':
        return [
          { label: 'Account Setup', description: 'Verify your platform account', completed: false, active: true },
          { label: 'Enter Credentials', description: 'Provide login credentials', completed: false, active: false },
          { label: 'Test Connection', description: 'Verify login works', completed: false, active: false }
        ];
      case 'token_based':
        return [
          { label: 'Generate Token', description: 'Create access token in platform', completed: false, active: true },
          { label: 'Configure Token', description: 'Enter token and settings', completed: false, active: false },
          { label: 'Test Connection', description: 'Verify the token works', completed: false, active: false }
        ];
      default:
        return [
          { label: 'Setup', description: 'Configure authentication', completed: false, active: true },
          { label: 'Test', description: 'Test connection', completed: false, active: false }
        ];
    }
  };

  const handleNext = () => {
    const newSteps = [...authSteps];
    if (activeStep < newSteps.length - 1) {
      newSteps[activeStep].completed = true;
      newSteps[activeStep].active = false;
      newSteps[activeStep + 1].active = true;
      setAuthSteps(newSteps);
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    const newSteps = [...authSteps];
    if (activeStep > 0) {
      newSteps[activeStep].active = false;
      newSteps[activeStep - 1].completed = false;
      newSteps[activeStep - 1].active = true;
      setAuthSteps(newSteps);
      setActiveStep(activeStep - 1);
    }
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await RealEstatePlatformService.authenticatePlatform(
        platform,
        authData,
        userId
      );

      if (result.success) {
        const newSteps = [...authSteps];
        newSteps[activeStep].completed = true;
        setAuthSteps(newSteps);
        onSuccess(platform);
        onClose();
      } else {
        setError(result.message || 'Authentication failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderOAuthSetup = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">OAuth 2.0 Setup Required</Typography>
        <Typography variant="body2">
          You need to register your application with {config.displayName} to get OAuth credentials.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>Step 1: Register Your Application</Typography>
          <Stack spacing={2}>
            <Typography variant="body2">
              1. Go to {config.displayName} developer portal
            </Typography>
            <Typography variant="body2">
              2. Create a new application/integration
            </Typography>
            <Typography variant="body2">
              3. Set the redirect URI to: 
              <Box component="span" sx={{ fontFamily: 'monospace', bg: 'grey.100', px: 1, ml: 1 }}>
                https://yourapp.com/oauth/callback
                <IconButton size="small" onClick={() => copyToClipboard('https://yourapp.com/oauth/callback')}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Step 2: OAuth Configuration</Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Client ID"
              value={authData.clientId || ''}
              onChange={(e) => setAuthData(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder="Enter your OAuth Client ID"
            />
            <TextField
              fullWidth
              label="Client Secret"
              type={showPassword ? 'text' : 'password'}
              value={authData.clientSecret || ''}
              onChange={(e) => setAuthData(prev => ({ ...prev, clientSecret: e.target.value }))}
              placeholder="Enter your OAuth Client Secret"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Redirect URI"
              value={authData.redirectUri || 'https://yourapp.com/oauth/callback'}
              onChange={(e) => setAuthData(prev => ({ ...prev, redirectUri: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Environment</InputLabel>
              <Select
                value={authData.environment || 'sandbox'}
                onChange={(e) => setAuthData(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
                label="Environment"
              >
                <MenuItem value="sandbox">Sandbox</MenuItem>
                <MenuItem value="production">Production</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Step 3: Authorize Access</Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Click the button below to authorize access. You'll be redirected to {config.displayName}.
            </Alert>
            <Button
              variant="contained"
              startIcon={<Launch />}
              onClick={() => {
                // In real implementation, this would open OAuth flow
                window.open(`https://${platform}.com/oauth/authorize?client_id=${authData.clientId}&redirect_uri=${authData.redirectUri}&scope=listings`, '_blank');
                handleNext();
              }}
              disabled={!authData.clientId || !authData.clientSecret}
            >
              Authorize with {config.displayName}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );

  const renderApiKeySetup = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">API Key Authentication</Typography>
        <Typography variant="body2">
          Generate an API key from your {config.displayName} account dashboard.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">How to get your API Key</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <Typography variant="body2">1. Log in to your {config.displayName} account</Typography>
              <Typography variant="body2">2. Go to Developer Settings or API Management</Typography>
              <Typography variant="body2">3. Generate a new API key</Typography>
              <Typography variant="body2">4. Copy the key and paste it below</Typography>
              <Button
                size="small"
                startIcon={<OpenInNew />}
                onClick={() => window.open(config.websiteUrl, '_blank')}
              >
                Open {config.displayName}
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <TextField
          fullWidth
          label="API Key"
          type={showPassword ? 'text' : 'password'}
          value={authData.apiKey || ''}
          onChange={(e) => setAuthData(prev => ({ ...prev, apiKey: e.target.value }))}
          placeholder="Enter your API key"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {platform === 'apartments_com' && (
          <TextField
            fullWidth
            label="Partner ID (Optional)"
            value={authData.partnerId || ''}
            onChange={(e) => setAuthData(prev => ({ ...prev, partnerId: e.target.value }))}
            placeholder="Enter Partner ID if available"
          />
        )}

        <FormControl fullWidth>
          <InputLabel>Environment</InputLabel>
          <Select
            value={authData.environment || 'sandbox'}
            onChange={(e) => setAuthData(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
            label="Environment"
          >
            <MenuItem value="sandbox">Sandbox</MenuItem>
            <MenuItem value="production">Production</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );

  const renderUsernamePasswordSetup = () => (
    <Box>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Account Credentials Required</Typography>
        <Typography variant="body2">
          Enter your {config.displayName} account credentials. These will be securely stored and encrypted.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Username/Email"
          value={authData.username || ''}
          onChange={(e) => setAuthData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Enter your account username or email"
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={authData.password || ''}
          onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
          placeholder="Enter your account password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {platform === 'craigslist' && (
          <Stack spacing={2}>
            <Typography variant="subtitle2">Preferred Areas (Optional)</Typography>
            <Typography variant="body2" color="text.secondary">
              Specify which Craigslist areas you typically post to
            </Typography>
            <TextField
              fullWidth
              label="Preferred Areas"
              value={authData.preferredAreas?.join(', ') || ''}
              onChange={(e) => setAuthData(prev => ({ 
                ...prev, 
                preferredAreas: e.target.value.split(',').map(area => area.trim()).filter(Boolean)
              }))}
              placeholder="e.g., sfbay, losangeles, newyork"
              helperText="Separate multiple areas with commas"
            />
          </Stack>
        )}

        <Alert severity="info">
          <Typography variant="body2">
            <Security fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Your credentials are encrypted and stored securely. They are only used for automated posting.
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );

  const renderTokenSetup = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Access Token Authentication</Typography>
        <Typography variant="body2">
          Generate an access token from your {config.displayName} account.
        </Typography>
      </Alert>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Access Token"
          type={showPassword ? 'text' : 'password'}
          value={authData.accessToken || ''}
          onChange={(e) => setAuthData(prev => ({ ...prev, accessToken: e.target.value }))}
          placeholder="Enter your access token"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          label="Refresh Token (Optional)"
          type={showPassword ? 'text' : 'password'}
          value={authData.refreshToken || ''}
          onChange={(e) => setAuthData(prev => ({ ...prev, refreshToken: e.target.value }))}
          placeholder="Enter refresh token if available"
        />

        <FormControl fullWidth>
          <InputLabel>Environment</InputLabel>
          <Select
            value={authData.environment || 'sandbox'}
            onChange={(e) => setAuthData(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
            label="Environment"
          >
            <MenuItem value="sandbox">Sandbox</MenuItem>
            <MenuItem value="production">Production</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );

  const renderCurrentStep = () => {
    if (activeStep === authSteps.length - 1) {
      // Test connection step
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Test Connection</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the button below to test your authentication settings.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleAuthenticate}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {isLoading ? 'Testing Connection...' : 'Test & Save Connection'}
          </Button>
        </Box>
      );
    }

    switch (config.authenticationType) {
      case 'oauth2':
        return renderOAuthSetup();
      case 'api_key':
        return renderApiKeySetup();
      case 'username_password':
        return renderUsernamePasswordSetup();
      case 'token_based':
        return renderTokenSetup();
      default:
        return (
          <Alert severity="warning">
            Authentication method for {config.displayName} is not yet configured.
          </Alert>
        );
    }
  };

  const getAuthIcon = (authType: AuthenticationType) => {
    switch (authType) {
      case 'oauth2': return <VpnKey />;
      case 'api_key': return <Key />;
      case 'username_password': return <AccountCircle />;
      case 'token_based': return <Security />;
      default: return <Help />;
    }
  };

  const canProceed = () => {
    switch (config.authenticationType) {
      case 'oauth2':
        return authData.clientId && authData.clientSecret;
      case 'api_key':
        return authData.apiKey;
      case 'username_password':
        return authData.username && authData.password;
      case 'token_based':
        return authData.accessToken;
      default:
        return false;
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          {getAuthIcon(config.authenticationType)}
          <Box>
            <Typography variant="h6">
              Connect to {config.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.authenticationType.replace('_', ' ').toUpperCase()} Authentication
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {authSteps.map((step, index) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  {step.active && renderCurrentStep()}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && activeStep < authSteps.length - 1 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {activeStep < authSteps.length - 1 && (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
