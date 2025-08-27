/**
 * Platform Authentication Management Page
 * Dedicated page for setting up and managing platform authentication
 */

import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Link,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Error,
  Warning,
  Security,
  VpnKey,
  Settings,
  Launch,
  Visibility,
  VisibilityOff,
  Refresh,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { RealEstatePlatformService } from '../services/RealEstatePlatformService';
import {
  PlatformConfiguration,
  PlatformAuthConfig,
  RealEstatePlatform,
  AuthenticationType
} from '../types/RealEstatePlatformTypes';

interface AuthenticationStepData {
  platform: RealEstatePlatform;
  step: number;
  authData: Partial<PlatformAuthConfig>;
}

export default function PlatformAuthenticationManagement() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = React.useState<PlatformConfiguration[]>([]);
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformConfiguration | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [testingAuth, setTestingAuth] = React.useState<string | null>(null);

  React.useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      await RealEstatePlatformService.initialize();
      setPlatforms(RealEstatePlatformService.getAvailablePlatforms());
    } catch (error) {
      console.error('Failed to initialize authentication data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupAuth = (platform: PlatformConfiguration) => {
    setSelectedPlatform(platform);
    setAuthDialogOpen(true);
  };

  const handleTestConnection = async (platform: PlatformConfiguration) => {
    setTestingAuth(platform.id);
    try {
      // Simulate testing connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In real implementation, test the actual connection
      console.log(`Testing connection for ${platform.displayName}`);
    } finally {
      setTestingAuth(null);
    }
  };

  const handleSaveAuth = async (authData: PlatformAuthConfig) => {
    if (!selectedPlatform) return;

    try {
      const result = await RealEstatePlatformService.authenticatePlatform(
        selectedPlatform.platform,
        authData,
        'current_user'
      );

      if (result.success) {
        // Update local state
        setPlatforms(prev => prev.map(p => 
          p.platform === selectedPlatform.platform 
            ? { ...p, status: 'active', authConfig: authData }
            : p
        ));
        setAuthDialogOpen(false);
        setSelectedPlatform(null);
      } else {
        console.error('Authentication failed:', result.message);
      }
    } catch (error) {
      console.error('Failed to save authentication:', error);
    }
  };

  const getAuthStatusIcon = (platform: PlatformConfiguration) => {
    const isAuthenticated = RealEstatePlatformService.isPlatformAuthenticated(platform.platform);
    
    if (isAuthenticated) {
      return <CheckCircle color="success" />;
    } else if (platform.status === 'error') {
      return <Error color="error" />;
    } else {
      return <Warning color="warning" />;
    }
  };

  const getAuthStatusText = (platform: PlatformConfiguration) => {
    const isAuthenticated = RealEstatePlatformService.isPlatformAuthenticated(platform.platform);
    
    if (isAuthenticated) {
      return 'Connected';
    } else if (platform.status === 'error') {
      return 'Authentication Failed';
    } else {
      return 'Not Connected';
    }
  };

  const getConnectedCount = () => {
    return platforms.filter(p => RealEstatePlatformService.isPlatformAuthenticated(p.platform)).length;
  };

  const getPendingCount = () => {
    return platforms.filter(p => !RealEstatePlatformService.isPlatformAuthenticated(p.platform)).length;
  };

  const getErrorCount = () => {
    return platforms.filter(p => p.status === 'error').length;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading authentication data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/crm/real-estate-platforms')}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4">Platform Authentication</Typography>
          <Typography variant="body1" color="text.secondary">
            Setup and manage authentication for all real estate platforms
          </Typography>
        </Box>
      </Stack>

      {/* Alert Banner */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">🔐 Secure Authentication Setup</Typography>
        <Typography variant="body2">
          All credentials are encrypted and stored securely. Test your connections to ensure proper integration.
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {getConnectedCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connected Platforms
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Warning color="warning" />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {getPendingCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Setup
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Error color="error" />
                <Box>
                  <Typography variant="h4" color="error.main">
                    {getErrorCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Failed Connections
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Security color="primary" />
                <Box>
                  <Typography variant="h4" color="primary">
                    {platforms.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Platforms
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Authentication List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Authentication Status
          </Typography>
          
          <List>
            {platforms.map((platform, index) => {
              const isAuthenticated = RealEstatePlatformService.isPlatformAuthenticated(platform.platform);
              
              return (
                <React.Fragment key={platform.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {getAuthStatusIcon(platform)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle1">
                            {platform.displayName}
                          </Typography>
                          <Chip 
                            label={platform.authenticationType.replace('_', ' ')} 
                            size="small" 
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            Status: {getAuthStatusText(platform)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {platform.description}
                          </Typography>
                          {platform.websiteUrl && (
                            <Link 
                              href={platform.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              variant="caption"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                              Visit Platform <Launch fontSize="inherit" />
                            </Link>
                          )}
                        </Stack>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {isAuthenticated && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleTestConnection(platform)}
                            disabled={testingAuth === platform.id}
                          >
                            {testingAuth === platform.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Refresh />
                            )}
                          </IconButton>
                        )}
                        <Button
                          variant={isAuthenticated ? "outlined" : "contained"}
                          size="small"
                          startIcon={isAuthenticated ? <Settings /> : <VpnKey />}
                          onClick={() => handleSetupAuth(platform)}
                        >
                          {isAuthenticated ? 'Reconfigure' : 'Setup Auth'}
                        </Button>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>

      {/* Authentication Setup Dialog */}
      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Setup Authentication: {selectedPlatform?.displayName}
        </DialogTitle>
        <DialogContent>
          {selectedPlatform && (
            <AuthenticationSetupWizard 
              platform={selectedPlatform}
              onSave={handleSaveAuth}
              onCancel={() => setAuthDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// Authentication Setup Wizard Component
function AuthenticationSetupWizard({ 
  platform, 
  onSave, 
  onCancel 
}: { 
  platform: PlatformConfiguration;
  onSave: (authData: PlatformAuthConfig) => void;
  onCancel: () => void;
}) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [showPassword, setShowPassword] = React.useState(false);
  const [authData, setAuthData] = React.useState<Partial<PlatformAuthConfig>>({
    environment: 'sandbox'
  });

  const getAuthFields = () => {
    switch (platform.authenticationType) {
      case 'oauth2':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'redirectUri', label: 'Redirect URI', type: 'text', required: false }
        ];
      case 'api_key':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: false }
        ];
      case 'username_password':
        return [
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true }
        ];
      default:
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ];
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSave = () => {
    onSave(authData as PlatformAuthConfig);
  };

  const authFields = getAuthFields();

  const steps = [
    {
      label: 'Platform Information',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are setting up authentication for <strong>{platform.displayName}</strong>
          </Alert>
          <Typography variant="body2" paragraph>
            Authentication Type: <strong>{platform.authenticationType.replace('_', ' ')}</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            {platform.description}
          </Typography>
          {platform.websiteUrl && (
            <Link href={platform.websiteUrl} target="_blank" rel="noopener noreferrer">
              Visit platform documentation →
            </Link>
          )}
        </Box>
      )
    },
    {
      label: 'Environment Setup',
      content: (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Environment</InputLabel>
            <Select
              value={authData.environment || 'sandbox'}
              label="Environment"
              onChange={(e) => setAuthData(prev => ({ ...prev, environment: e.target.value as any }))}
            >
              <MenuItem value="sandbox">Sandbox (Testing)</MenuItem>
              <MenuItem value="production">Production (Live)</MenuItem>
            </Select>
          </FormControl>
          <Alert severity="warning">
            Start with sandbox environment for testing, then switch to production when ready.
          </Alert>
        </Box>
      )
    },
    {
      label: 'Credentials',
      content: (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {authFields.map((field) => (
              <Grid item xs={12} key={field.key}>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type === 'password' && !showPassword ? 'password' : 'text'}
                  value={authData[field.key as keyof PlatformAuthConfig] || ''}
                  onChange={(e) => setAuthData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  required={field.required}
                  InputProps={field.type === 'password' ? {
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  } : undefined}
                />
              </Grid>
            ))}
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            All credentials are encrypted and stored securely. They will only be used for API communication with {platform.displayName}.
          </Alert>
        </Box>
      )
    },
    {
      label: 'Review & Test',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Review Configuration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Platform</Typography>
              <Typography variant="body1">{platform.displayName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Environment</Typography>
              <Typography variant="body1">{authData.environment}</Typography>
            </Grid>
            {authFields.map((field) => (
              <Grid item xs={6} key={field.key}>
                <Typography variant="body2" color="text.secondary">{field.label}</Typography>
                <Typography variant="body1">
                  {field.type === 'password' ? '••••••••' : authData[field.key as keyof PlatformAuthConfig] || 'Not set'}
                </Typography>
              </Grid>
            ))}
          </Grid>
          
          <Alert severity="success" sx={{ mt: 2 }}>
            Configuration looks good! Click "Save & Test Connection" to complete setup.
          </Alert>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1}>
                  {index === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      startIcon={<VpnKey />}
                    >
                      Save & Test Connection
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  )}
                  
                  {index > 0 && (
                    <Button onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  
                  <Button onClick={onCancel}>
                    Cancel
                  </Button>
                </Stack>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
