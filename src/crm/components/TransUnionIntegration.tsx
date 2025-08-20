import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import TransUnionService, { TransUnionConfig, CreditCheckRequest, CreditCheckResponse } from "../services/TransUnionService";

interface TransUnionIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function TransUnionIntegration({ onConnectionChange }: TransUnionIntegrationProps) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [showConfigDialog, setShowConfigDialog] = React.useState(false);
  const [showLogsDialog, setShowLogsDialog] = React.useState(false);
  const [config, setConfig] = React.useState<TransUnionConfig>({
    apiKey: '',
    baseUrl: 'https://api.transunion.com',
    environment: 'sandbox',
    memberNumber: '',
    securityCode: ''
  });
  const [testInProgress, setTestInProgress] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);
  const [creditCheckLogs, setCreditCheckLogs] = React.useState<any[]>([]);

  const transUnionService = TransUnionService.getInstance();

  React.useEffect(() => {
    // Check if service is already configured
    setIsConnected(transUnionService.isServiceConnected());
    loadCreditCheckLogs();
  }, []);

  React.useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const loadCreditCheckLogs = () => {
    const logs = transUnionService.getCreditCheckLogs();
    setCreditCheckLogs(logs);
  };

  const handleConfigSave = () => {
    if (!config.apiKey || !config.memberNumber || !config.securityCode) {
      setTestResult({ success: false, message: 'Please fill in all required fields' });
      return;
    }

    const success = transUnionService.configure(config);
    if (success) {
      setIsConnected(true);
      setShowConfigDialog(false);
      setTestResult({ success: true, message: 'TransUnion service configured successfully' });
    } else {
      setTestResult({ success: false, message: 'Failed to configure TransUnion service' });
    }
  };

  const handleTestConnection = async () => {
    setTestInProgress(true);
    try {
      const success = await transUnionService.testConnection();
      setTestResult({
        success,
        message: success ? 'Connection test successful' : 'Connection test failed'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTestInProgress(false);
    }
  };

  const handleDisconnect = () => {
    transUnionService.disconnect();
    setIsConnected(false);
    setTestResult(null);
  };

  const performDemoCreditCheck = async () => {
    if (!isConnected) {
      setTestResult({ success: false, message: 'Please configure TransUnion service first' });
      return;
    }

    setTestInProgress(true);
    try {
      const demoRequest: CreditCheckRequest = {
        firstName: 'John',
        lastName: 'Doe',
        ssn: '123-45-6789',
        dateOfBirth: '1990-01-01',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        email: 'john.doe@example.com',
        phone: '(555) 123-4567'
      };

      const response = await transUnionService.performCreditCheck(demoRequest);
      setTestResult({
        success: true,
        message: `Demo credit check completed. Credit Score: ${response.applicant.creditScore}`
      });
      loadCreditCheckLogs();
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Credit check failed'
      });
    } finally {
      setTestInProgress(false);
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(creditCheckLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `credit_check_logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                TransUnion Credit Check Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect to TransUnion for automated credit checks and reporting
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {isConnected ? (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Connected"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<ErrorIcon />}
                  label="Not Connected"
                  color="error"
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>

          {testResult && (
            <Alert 
              severity={testResult.success ? "success" : "error"} 
              sx={{ mb: 3 }}
              onClose={() => setTestResult(null)}
            >
              {testResult.message}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6">Connection Status</Typography>
                    </Stack>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Service Status
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {isConnected ? 'Connected' : 'Not Connected'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Environment
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {config.environment.toUpperCase()}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      {!isConnected ? (
                        <Button
                          variant="contained"
                          startIcon={<SettingsIcon />}
                          onClick={() => setShowConfigDialog(true)}
                        >
                          Configure
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={testInProgress ? <CircularProgress size={16} /> : <RefreshIcon />}
                            onClick={handleTestConnection}
                            disabled={testInProgress}
                          >
                            Test Connection
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDisconnect}
                          >
                            Disconnect
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AssessmentIcon color="primary" />
                      <Typography variant="h6">Credit Check Activity</Typography>
                    </Stack>

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Credit Checks
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {creditCheckLogs.length}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={testInProgress ? <CircularProgress size={16} /> : <AssessmentIcon />}
                        onClick={performDemoCreditCheck}
                        disabled={!isConnected || testInProgress}
                      >
                        Demo Credit Check
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          loadCreditCheckLogs();
                          setShowLogsDialog(true);
                        }}
                      >
                        View Logs
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {isConnected && (
            <Box sx={{ mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Integration Features</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="primary">
                          ✓ Automated Credit Checks
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Automatic credit score retrieval during application processing
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="primary">
                          ✓ Grantor Support
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Credit checks for both applicants and grantors
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="primary">
                          ✓ Compliance Logging
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Secure audit trail for all credit check activities
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="primary">
                          ✓ Risk Assessment
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Automated risk factor identification and recommendations
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onClose={() => setShowConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configure TransUnion Integration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Enter your TransUnion API credentials. In a production environment, these would be provided by TransUnion after account setup.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Environment</FormLabel>
                  <RadioGroup
                    row
                    value={config.environment}
                    onChange={(e) => setConfig(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
                  >
                    <FormControlLabel value="sandbox" control={<Radio />} label="Sandbox (Testing)" />
                    <FormControlLabel value="production" control={<Radio />} label="Production" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your TransUnion API key"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Base URL"
                  value={config.baseUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.transunion.com"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Member Number"
                  value={config.memberNumber}
                  onChange={(e) => setConfig(prev => ({ ...prev, memberNumber: e.target.value }))}
                  placeholder="Your member number"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Security Code"
                  type="password"
                  value={config.securityCode}
                  onChange={(e) => setConfig(prev => ({ ...prev, securityCode: e.target.value }))}
                  placeholder="Security code"
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfigDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfigSave}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onClose={() => setShowLogsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>Credit Check Logs</Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={exportLogs}
              disabled={creditCheckLogs.length === 0}
            >
              Export
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {creditCheckLogs.length === 0 ? (
            <Alert severity="info">
              No credit check logs found. Perform a credit check to see activity here.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Credit Score</TableCell>
                    <TableCell>Grantor</TableCell>
                    <TableCell>Environment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {creditCheckLogs.slice().reverse().map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {log.transactionId}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.applicant.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.applicant.ssn}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.applicant.creditScore}
                          size="small"
                          color={log.applicant.creditScore >= 700 ? "success" : log.applicant.creditScore >= 600 ? "warning" : "error"}
                        />
                      </TableCell>
                      <TableCell>
                        {log.grantor ? (
                          <Box>
                            <Typography variant="body2">
                              {log.grantor.name}
                            </Typography>
                            <Chip
                              label={log.grantor.creditScore}
                              size="small"
                              color={log.grantor.creditScore >= 700 ? "success" : log.grantor.creditScore >= 600 ? "warning" : "error"}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.environment.toUpperCase()}
                          size="small"
                          variant="outlined"
                          color={log.environment === 'production' ? 'error' : 'primary'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
