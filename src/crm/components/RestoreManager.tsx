import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StorageIcon from '@mui/icons-material/Storage';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import TimerIcon from '@mui/icons-material/Timer';
import ShieldIcon from '@mui/icons-material/Shield';;
import { BackupRestoreService, BackupMetadata, RestoreOptions } from '../services/BackupRestoreService';

interface RestoreManagerProps {
  open: boolean;
  onClose: () => void;
  backup?: BackupMetadata;
  onRestoreComplete?: () => void;
}

interface TwoFactorConfig {
  method: 'email' | 'sms' | 'authenticator';
  contact: string;
  tokenLength: number;
  expiryMinutes: number;
}

interface RestorePreview {
  entityType: string;
  currentCount: number;
  backupCount: number;
  newItems: number;
  conflicts: number;
  willOverwrite: boolean;
}

const RestoreManager: React.FC<RestoreManagerProps> = ({
  open,
  onClose,
  backup,
  onRestoreComplete
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    overwriteExisting: false,
    selectedEntities: [],
    createBackupBeforeRestore: true,
    skipValidation: false
  });
  
  // Two-factor authentication state
  const [twoFactorConfig, setTwoFactorConfig] = useState<TwoFactorConfig>({
    method: 'email',
    contact: 'user@example.com',
    tokenLength: 6,
    expiryMinutes: 10
  });
  const [authToken, setAuthToken] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Restore state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [restorePreview, setRestorePreview] = useState<RestorePreview[]>([]);
  const [validationResults, setValidationResults] = useState<any>(null);

  const steps = [
    'Select Data to Restore',
    'Configure Restore Options',
    'Security Verification',
    'Confirm & Execute'
  ];

  useEffect(() => {
    if (backup) {
      generateRestorePreview();
    }
  }, [backup, restoreOptions]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (tokenExpiry && countdown > 0) {
      interval = setInterval(() => {
        const remaining = Math.ceil((tokenExpiry.getTime() - Date.now()) / 1000);
        setCountdown(Math.max(0, remaining));
        
        if (remaining <= 0) {
          setTokenSent(false);
          setTokenValid(false);
          setTokenExpiry(null);
          setAuthToken('');
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tokenExpiry, countdown]);

  const generateRestorePreview = async () => {
    if (!backup) return;

    try {
      setLoading(true);
      // Simulate preview generation
      const preview: RestorePreview[] = backup.entities.map(entityType => {
        const currentCount = Math.floor(Math.random() * 100); // Simulate current data count
        const backupCount = Math.floor(Math.random() * 150); // Simulate backup data count
        const conflicts = restoreOptions.overwriteExisting ? 0 : Math.floor(Math.random() * 10);
        
        return {
          entityType,
          currentCount,
          backupCount,
          newItems: Math.max(0, backupCount - currentCount),
          conflicts,
          willOverwrite: restoreOptions.overwriteExisting && currentCount > 0
        };
      });
      
      setRestorePreview(preview);
    } catch (error) {
      setError('Failed to generate restore preview');
    } finally {
      setLoading(false);
    }
  };

  const validateBackup = async () => {
    if (!backup) return;

    try {
      setLoading(true);
      setCurrentOperation('Validating backup integrity...');
      
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = {
        checksumValid: true,
        structureValid: true,
        dataIntegrity: 98.5,
        warnings: [
          'Some property images may not be available',
          '2 tenant records have incomplete address information'
        ],
        errors: []
      };
      
      setValidationResults(results);
      setCurrentOperation('');
    } catch (error) {
      setError('Backup validation failed');
    } finally {
      setLoading(false);
    }
  };

  const sendTwoFactorToken = async () => {
    try {
      setLoading(true);
      setCurrentOperation(`Sending verification code to ${twoFactorConfig.contact}...`);
      
      // Simulate sending token
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + twoFactorConfig.expiryMinutes);
      
      setTokenExpiry(expiry);
      setCountdown(twoFactorConfig.expiryMinutes * 60);
      setTokenSent(true);
      setCurrentOperation('');
      
      // For demo purposes, log the "sent" token
      console.log(`Demo: Verification code sent - 123456`);
      
    } catch (error) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    try {
      setLoading(true);
      
      // Simulate token verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept "123456" as valid token
      if (authToken === '123456') {
        setTokenValid(true);
        setError(null);
      } else {
        setError('Invalid verification code. Please try again.');
        setTokenValid(false);
      }
    } catch (error) {
      setError('Token verification failed');
    } finally {
      setLoading(false);
    }
  };

  const executeRestore = async () => {
    if (!backup || !tokenValid) return;

    try {
      setLoading(true);
      setRestoreProgress(0);
      
      // Create pre-restore backup if requested
      if (restoreOptions.createBackupBeforeRestore) {
        setCurrentOperation('Creating backup before restore...');
        setRestoreProgress(10);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Validate backup if not skipped
      if (!restoreOptions.skipValidation) {
        setCurrentOperation('Validating backup data...');
        setRestoreProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Restore each selected entity
      for (let i = 0; i < restoreOptions.selectedEntities.length; i++) {
        const entity = restoreOptions.selectedEntities[i];
        setCurrentOperation(`Restoring ${entity}...`);
        setRestoreProgress(40 + (i / restoreOptions.selectedEntities.length) * 50);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Finalize restore
      setCurrentOperation('Finalizing restore operation...');
      setRestoreProgress(95);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Complete restore using the service
      await BackupRestoreService.restoreFromBackup(backup.id, restoreOptions, authToken);
      
      setRestoreProgress(100);
      setCurrentOperation('Restore completed successfully!');
      
      if (onRestoreComplete) {
        onRestoreComplete();
      }
      
      // Close dialog after success
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Restore operation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setActiveStep(0);
    setRestoreOptions({
      overwriteExisting: false,
      selectedEntities: [],
      createBackupBeforeRestore: true,
      skipValidation: false
    });
    setAuthToken('');
    setTokenSent(false);
    setTokenValid(false);
    setTokenExpiry(null);
    setCountdown(0);
    setRestoreProgress(0);
    setCurrentOperation('');
    setError(null);
    setValidationResults(null);
  };

  const handleNext = () => {
    if (activeStep === 2 && !tokenValid) {
      setError('Please complete security verification first');
      return;
    }
    setActiveStep((prev) => prev + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!backup) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestoreIcon />
        Restore from Backup
        <Chip 
          label={new Date(backup.timestamp).toLocaleDateString()} 
          size="small" 
          variant="outlined" 
        />
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Select Data */}
          <Step>
            <StepLabel>Select Data to Restore</StepLabel>
            <StepContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Backup Information
                </Typography>
                <Typography variant="body2">
                  Created: {new Date(backup.timestamp).toLocaleString()} | 
                  Size: {(backup.size / 1024 / 1024).toFixed(2)} MB | 
                  Entities: {backup.entities.length} types
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>Available Data Types:</Typography>
              <Grid container spacing={2}>
                {backup.entities.map((entity) => (
                  <Grid item xs={6} sm={4} md={3} key={entity}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={restoreOptions.selectedEntities.includes(entity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRestoreOptions(prev => ({
                                ...prev,
                                selectedEntities: [...prev.selectedEntities, entity]
                              }));
                            } else {
                              setRestoreOptions(prev => ({
                                ...prev,
                                selectedEntities: prev.selectedEntities.filter(e => e !== entity)
                              }));
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">
                            {entity.charAt(0).toUpperCase() + entity.slice(1)}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={restoreOptions.selectedEntities.length === 0}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Configure Options */}
          <Step>
            <StepLabel>Configure Restore Options</StepLabel>
            <StepContent>
              <Typography variant="h6" gutterBottom>Restore Options:</Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreOptions.overwriteExisting}
                    onChange={(e) => setRestoreOptions(prev => ({ 
                      ...prev, 
                      overwriteExisting: e.target.checked 
                    }))}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Overwrite existing data</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Replace current records with backup data (recommended for full restore)
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreOptions.createBackupBeforeRestore}
                    onChange={(e) => setRestoreOptions(prev => ({ 
                      ...prev, 
                      createBackupBeforeRestore: e.target.checked 
                    }))}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Create backup before restore</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Safeguard current data by creating a backup first (recommended)
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreOptions.skipValidation}
                    onChange={(e) => setRestoreOptions(prev => ({ 
                      ...prev, 
                      skipValidation: e.target.checked 
                    }))}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Skip validation</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Skip integrity checks (not recommended)
                    </Typography>
                  </Box>
                }
              />

              {restorePreview.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Restore Preview:</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data Type</TableCell>
                          <TableCell align="right">Current</TableCell>
                          <TableCell align="right">From Backup</TableCell>
                          <TableCell align="right">New Items</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {restorePreview
                          .filter(preview => restoreOptions.selectedEntities.includes(preview.entityType))
                          .map((preview) => (
                          <TableRow key={preview.entityType}>
                            <TableCell>{preview.entityType}</TableCell>
                            <TableCell align="right">{preview.currentCount}</TableCell>
                            <TableCell align="right">{preview.backupCount}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={preview.newItems} 
                                size="small" 
                                color={preview.newItems > 0 ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {preview.willOverwrite ? (
                                <Chip 
                                  icon={<WarningIcon />} 
                                  label="Will overwrite" 
                                  size="small" 
                                  color="warning" 
                                />
                              ) : (
                                <Chip 
                                  icon={<CheckCircleIcon />} 
                                  label="Will merge" 
                                  size="small" 
                                  color="success" 
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext}>
                  Continue
                </Button>
                {!restoreOptions.skipValidation && (
                  <Button 
                    variant="outlined" 
                    onClick={validateBackup}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <ShieldIcon />}
                  >
                    Validate Backup
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Security Verification */}
          <Step>
            <StepLabel>Security Verification</StepLabel>
            <StepContent>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Two-Factor Authentication Required
                </Typography>
                <Typography variant="body2">
                  Data restoration requires additional security verification to prevent unauthorized access.
                  This is an irreversible operation that can overwrite existing data.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Verification Method</InputLabel>
                    <Select
                      value={twoFactorConfig.method}
                      onChange={(e) => setTwoFactorConfig(prev => ({ 
                        ...prev, 
                        method: e.target.value as any 
                      }))}
                      disabled={tokenSent}
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="authenticator">Authenticator App</MenuItem>
                    </Select>
                  </FormControl>

                  {twoFactorConfig.method !== 'authenticator' && (
                    <TextField
                      fullWidth
                      margin="dense"
                      label={twoFactorConfig.method === 'email' ? 'Email Address' : 'Phone Number'}
                      value={twoFactorConfig.contact}
                      onChange={(e) => setTwoFactorConfig(prev => ({ 
                        ...prev, 
                        contact: e.target.value 
                      }))}
                      disabled={tokenSent}
                    />
                  )}

                  {!tokenSent ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={sendTwoFactorToken}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{ mt: 2 }}
                    >
                      {loading ? 'Sending...' : `Send Verification Code`}
                    </Button>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Verification code sent to {twoFactorConfig.contact}
                      </Typography>
                      {countdown > 0 && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <TimerIcon fontSize="small" />
                          Code expires in: {formatCountdown(countdown)}
                        </Typography>
                      )}
                    </Alert>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Verification Code"
                    type="text"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    disabled={!tokenSent || loading}
                    placeholder="Enter 6-digit code"
                    inputProps={{ maxLength: twoFactorConfig.tokenLength }}
                    helperText={tokenSent ? "Enter the code sent to your device" : "Send verification code first"}
                  />

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={verifyToken}
                    disabled={!tokenSent || authToken.length !== twoFactorConfig.tokenLength || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
                    sx={{ mt: 2 }}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  {tokenValid && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon fontSize="small" />
                        Verification successful
                      </Typography>
                    </Alert>
                  )}
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={!tokenValid}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Confirm & Execute */}
          <Step>
            <StepLabel>Confirm & Execute</StepLabel>
            <StepContent>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ⚠️ Final Confirmation Required
                </Typography>
                <Typography variant="body2">
                  You are about to restore data from the backup created on{' '}
                  <strong>{new Date(backup.timestamp).toLocaleString()}</strong>.
                  This operation cannot be undone.
                </Typography>
              </Alert>

              {validationResults && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Backup Validation Results</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" />
                          <Typography variant="body2">Checksum Valid</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" />
                          <Typography variant="body2">Structure Valid</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          Data Integrity: {validationResults.dataIntegrity}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={validationResults.dataIntegrity} 
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                    </Grid>
                    {validationResults.warnings.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Warnings:</Typography>
                        <List dense>
                          {validationResults.warnings.map((warning: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={warning} />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              <Typography variant="h6" gutterBottom>Restore Summary:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><StorageIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Data Types" 
                    secondary={`${restoreOptions.selectedEntities.length} types selected`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {restoreOptions.overwriteExisting ? <WarningIcon color="warning" /> : <InfoIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Overwrite Mode" 
                    secondary={restoreOptions.overwriteExisting ? 'Will overwrite existing data' : 'Will merge with existing data'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LockIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Pre-restore Backup" 
                    secondary={restoreOptions.createBackupBeforeRestore ? 'Will create backup first' : 'Skipped'} 
                  />
                </ListItem>
              </List>

              {loading && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>{currentOperation}</Typography>
                  <LinearProgress variant="determinate" value={restoreProgress} />
                  <Typography variant="caption" color="text.secondary">
                    {restoreProgress}% complete
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack} disabled={loading}>Back</Button>
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={executeRestore}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <RestoreIcon />}
                >
                  {loading ? 'Restoring...' : 'Execute Restore'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {currentOperation && !loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {currentOperation}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {loading ? 'Please wait...' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestoreManager;
