import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TestRoundedIcon from "@mui/icons-material/TestRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import { uniformTooltipStyles } from "../utils/formStyles";
import { 
  BookkeepingProvider, 
  BookkeepingConnection, 
  BookkeepingConfiguration,
  BookkeepingCredentials,
  bookkeepingIntegrationService 
} from "../services/BookkeepingIntegrationService";

interface BookkeepingIntegrationDialogProps {
  open: boolean;
  onClose: () => void;
  onConnectionCreated?: (connection: BookkeepingConnection) => void;
  onConnectionUpdated?: (connection: BookkeepingConnection) => void;
  editingConnection?: BookkeepingConnection | null;
}

const steps = [
  'Select Provider',
  'Configure Credentials',
  'Map Accounts',
  'Test & Activate'
];

export default function BookkeepingIntegrationDialog({
  open,
  onClose,
  onConnectionCreated,
  onConnectionUpdated,
  editingConnection = null
}: BookkeepingIntegrationDialogProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedProvider, setSelectedProvider] = React.useState<BookkeepingProvider | null>(null);
  const [credentials, setCredentials] = React.useState<BookkeepingCredentials>({});
  const [configuration, setConfiguration] = React.useState<BookkeepingConfiguration>({
    syncFrequency: 'daily',
    syncDirection: 'one_way_to_bookkeeping',
    enabledFeatures: ['invoices', 'payments', 'customers'],
    accountMappings: {},
    createMissingAccounts: true,
    createMissingCustomers: true,
    syncHistoricalData: false,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [providers, setProviders] = React.useState<BookkeepingProvider[]>([]);

  React.useEffect(() => {
    if (open) {
      const availableProviders = bookkeepingIntegrationService.getAvailableProviders();
      setProviders(availableProviders);

      if (editingConnection) {
        // Load existing connection data
        const provider = availableProviders.find(p => p.id === editingConnection.providerId);
        setSelectedProvider(provider || null);
        setCredentials(editingConnection.credentials);
        setConfiguration(editingConnection.configuration);
        setActiveStep(3); // Skip to test step for editing
      } else {
        // Reset for new connection
        setActiveStep(0);
        setSelectedProvider(null);
        setCredentials({});
        setConfiguration({
          syncFrequency: 'daily',
          syncDirection: 'one_way_to_bookkeeping',
          enabledFeatures: ['invoices', 'payments', 'customers'],
          accountMappings: {},
          createMissingAccounts: true,
          createMissingCustomers: true,
          syncHistoricalData: false,
        });
      }
      setTestResult(null);
    }
  }, [open, editingConnection]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleProviderSelect = (provider: BookkeepingProvider) => {
    setSelectedProvider(provider);
    // Reset credentials when changing provider
    setCredentials({
      sandboxMode: provider.id === 'quickbooks' ? true : undefined
    });
    handleNext();
  };

  const handleCredentialChange = (key: keyof BookkeepingCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleConfigurationChange = (key: keyof BookkeepingConfiguration, value: any) => {
    setConfiguration(prev => ({ ...prev, [key]: value }));
  };

  const handleAccountMappingChange = (accountType: string, accountCode: string) => {
    setConfiguration(prev => ({
      ...prev,
      accountMappings: {
        ...prev.accountMappings,
        [accountType]: accountCode
      }
    }));
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);
    setTestResult(null);

    try {
      const tempConnection: BookkeepingConnection = {
        id: 'temp',
        providerId: selectedProvider.id,
        tenantId: 'current',
        isActive: false,
        credentials,
        configuration,
        lastSync: new Date().toISOString(),
        syncStatus: 'disconnected',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await bookkeepingIntegrationService.testConnection(tempConnection);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConnection = async () => {
    if (!selectedProvider) return;

    setIsLoading(true);

    try {
      if (editingConnection) {
        // Update existing connection
        const updatedConnection = await bookkeepingIntegrationService.updateConnection(
          editingConnection.id,
          { credentials, configuration }
        );
        onConnectionUpdated?.(updatedConnection);
      } else {
        // Create new connection
        const newConnection = await bookkeepingIntegrationService.createConnection(
          selectedProvider.id,
          credentials,
          configuration
        );
        onConnectionCreated?.(newConnection);
      }

      onClose();
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save connection'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (providerId: string) => {
    const iconMap: Record<string, string> = {
      'xero': '🔵',
      'quickbooks': '🟢',
      'sage': '🟡',
      'freshbooks': '🔴',
      'wave': '🌊',
      'zoho': '🟠',
      'buildium': '🏢',
      'appfolio': '🏠'
    };
    return iconMap[providerId] || '💼';
  };

  const renderProviderSelection = () => (
    <Grid container spacing={2}>
      {providers.map((provider) => (
        <Grid item xs={12} sm={6} md={4} key={provider.id}>
          <Card
            sx={{
              cursor: 'pointer',
              border: selectedProvider?.id === provider.id ? 2 : 1,
              borderColor: selectedProvider?.id === provider.id ? 'primary.main' : 'divider',
              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => handleProviderSelect(provider)}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: '2rem' }}>
                  {getProviderIcon(provider.id)}
                </Avatar>
                
                <Box textAlign="center">
                  <Typography variant="h6">{provider.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {provider.authType.toUpperCase()}
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center">
                  {provider.features.slice(0, 3).map((feature) => (
                    <Chip key={feature} label={feature} size="small" variant="outlined" />
                  ))}
                  {provider.features.length > 3 && (
                    <Chip label={`+${provider.features.length - 3}`} size="small" />
                  )}
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={provider.limits.rateLimit + '/min'}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Rate Limit
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCredentialsForm = () => {
    if (!selectedProvider) return null;

    const isOAuth = selectedProvider.authType === 'oauth2';

    return (
      <Stack spacing={3}>
        <Alert severity="info">
          <Typography variant="body2">
            {isOAuth 
              ? `${selectedProvider.name} uses OAuth2 authentication. You'll need to authorize access to your ${selectedProvider.name} account.`
              : `Enter your ${selectedProvider.name} API credentials below. You can find these in your ${selectedProvider.name} account settings.`
            }
          </Typography>
        </Alert>

        {isOAuth ? (
          <Box>
            <Typography variant="h6" gutterBottom>OAuth2 Configuration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client ID"
                  value={credentials.apiKey || ''}
                  onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                  helperText="Your application's client ID"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Secret"
                  type="password"
                  value={credentials.apiSecret || ''}
                  onChange={(e) => handleCredentialChange('apiSecret', e.target.value)}
                  helperText="Your application's client secret"
                />
              </Grid>
              {selectedProvider.id === 'quickbooks' && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={credentials.sandboxMode !== false}
                        onChange={(e) => handleCredentialChange('sandboxMode', e.target.checked ? true : false)}
                      />
                    }
                    label="Use Sandbox Mode (for testing)"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>API Credentials</Typography>
            <Grid container spacing={2}>
              {selectedProvider.id === 'buildium' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Key"
                      value={credentials.apiKey || ''}
                      onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                      helperText="Your Buildium API key"
                    />
                  </Grid>
                </>
              )}
              
              {selectedProvider.id === 'sage' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Access Token"
                      value={credentials.accessToken || ''}
                      onChange={(e) => handleCredentialChange('accessToken', e.target.value)}
                      helperText="Your Sage access token"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Refresh Token"
                      value={credentials.refreshToken || ''}
                      onChange={(e) => handleCredentialChange('refreshToken', e.target.value)}
                      helperText="Your Sage refresh token"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}

        {/* Organization/Company ID for providers that need it */}
        {(['xero', 'quickbooks', 'zoho'].includes(selectedProvider.id)) && (
          <TextField
            fullWidth
            label={selectedProvider.id === 'xero' ? 'Organization ID' : 'Company ID'}
            value={credentials.organizationId || credentials.companyId || ''}
            onChange={(e) => {
              const key = selectedProvider.id === 'xero' ? 'organizationId' : 'companyId';
              handleCredentialChange(key, e.target.value);
            }}
            helperText={`Your ${selectedProvider.name} ${selectedProvider.id === 'xero' ? 'organization' : 'company'} identifier`}
          />
        )}
      </Stack>
    );
  };

  const renderAccountMapping = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Account Mapping</Typography>
      <Alert severity="info">
        Map your CRM transaction types to the appropriate accounts in your bookkeeping system.
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Rent Income Account"
            value={configuration.accountMappings.rentIncomeAccount || ''}
            onChange={(e) => handleAccountMappingChange('rentIncomeAccount', e.target.value)}
            helperText="Account code for rent income (e.g., 4000)"
            placeholder="4000"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Security Deposit Account"
            value={configuration.accountMappings.securityDepositAccount || ''}
            onChange={(e) => handleAccountMappingChange('securityDepositAccount', e.target.value)}
            helperText="Account code for security deposits (e.g., 2400)"
            placeholder="2400"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Late Fee Account"
            value={configuration.accountMappings.lateFeeAccount || ''}
            onChange={(e) => handleAccountMappingChange('lateFeeAccount', e.target.value)}
            helperText="Account code for late fees (e.g., 4100)"
            placeholder="4100"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Bank Account"
            value={configuration.accountMappings.bankAccount || ''}
            onChange={(e) => handleAccountMappingChange('bankAccount', e.target.value)}
            helperText="Default bank account code (e.g., 1100)"
            placeholder="1100"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Accounts Receivable"
            value={configuration.accountMappings.receivablesAccount || ''}
            onChange={(e) => handleAccountMappingChange('receivablesAccount', e.target.value)}
            helperText="Accounts receivable code (e.g., 1200)"
            placeholder="1200"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Maintenance Expense Account"
            value={configuration.accountMappings.maintenanceExpenseAccount || ''}
            onChange={(e) => handleAccountMappingChange('maintenanceExpenseAccount', e.target.value)}
            helperText="Maintenance expense code (e.g., 6000)"
            placeholder="6000"
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="h6">Sync Configuration</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Sync Frequency</InputLabel>
            <Select
              value={configuration.syncFrequency}
              label="Sync Frequency"
              onChange={(e) => handleConfigurationChange('syncFrequency', e.target.value)}
            >
              <MenuItem value="real_time">Real-time</MenuItem>
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="manual">Manual only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Sync Direction</InputLabel>
            <Select
              value={configuration.syncDirection}
              label="Sync Direction"
              onChange={(e) => handleConfigurationChange('syncDirection', e.target.value)}
            >
              <MenuItem value="one_way_to_bookkeeping">CRM → Bookkeeping</MenuItem>
              <MenuItem value="one_way_from_bookkeeping">Bookkeeping → CRM</MenuItem>
              <MenuItem value="bidirectional">Bidirectional</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={configuration.createMissingAccounts}
              onChange={(e) => handleConfigurationChange('createMissingAccounts', e.target.checked)}
            />
          }
          label="Create missing accounts automatically"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={configuration.createMissingCustomers}
              onChange={(e) => handleConfigurationChange('createMissingCustomers', e.target.checked)}
            />
          }
          label="Create missing customers automatically"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={configuration.syncHistoricalData}
              onChange={(e) => handleConfigurationChange('syncHistoricalData', e.target.checked)}
            />
          }
          label="Sync historical data (last 12 months)"
        />
      </Stack>
    </Stack>
  );

  const renderTestAndActivate = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Test Connection</Typography>
      
      <Alert severity="info">
        Test your connection before activating to ensure everything is configured correctly.
      </Alert>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Connection Test</Typography>
            <Button
              variant="outlined"
              startIcon={isLoading ? <CircularProgress size={16} /> : <TestRoundedIcon />}
              onClick={handleTestConnection}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </Stack>

          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'}>
              {testResult.message}
            </Alert>
          )}
        </Stack>
      </Paper>

      {testResult?.success && (
        <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" color="success.main">
              ✅ Connection Successful!
            </Typography>
            
            <Typography variant="body2">
              Your connection to {selectedProvider?.name} has been established successfully.
              You can now activate this integration to start syncing data.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CheckCircleRoundedIcon />}
                onClick={handleCreateConnection}
                disabled={isLoading}
              >
                {editingConnection ? 'Update Connection' : 'Activate Integration'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Typography variant="subtitle1">Configuration Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalanceRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Provider"
                    secondary={selectedProvider?.name}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sync Frequency"
                    secondary={configuration.syncFrequency.replace('_', ' ')}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CloudSyncRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sync Direction"
                    secondary={configuration.syncDirection.replace(/_/g, ' ').replace('to', '→')}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <MonetizationOnRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Rent Income Account"
                    secondary={configuration.accountMappings.rentIncomeAccount || 'Not set'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <ReceiptRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Bank Account"
                    secondary={configuration.accountMappings.bankAccount || 'Not set'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SecurityRoundedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Auto-create Records"
                    secondary={
                      configuration.createMissingAccounts && configuration.createMissingCustomers
                        ? 'Enabled'
                        : 'Partial'
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderProviderSelection();
      case 1:
        return renderCredentialsForm();
      case 2:
        return renderAccountMapping();
      case 3:
        return renderTestAndActivate();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AccountBalanceRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">
              {editingConnection ? 'Edit' : 'Add'} Bookkeeping Integration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect your CRM to {editingConnection ? selectedProvider?.name : 'accounting software'} for seamless financial data sync
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {getStepContent(index)}
                  </Box>
                  
                  {index < 3 && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={
                            (index === 0 && !selectedProvider) ||
                            (index === 1 && (!credentials.apiKey && !credentials.accessToken))
                          }
                        >
                          Continue
                        </Button>
                        
                        {index > 0 && (
                          <Button onClick={handleBack}>
                            Back
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleBack} disabled={isLoading}>
            Back
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
