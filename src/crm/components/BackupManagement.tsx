import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  CloudDownload as CloudDownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  VerifiedUser as VerifiedUserIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { BackupRestoreService, BackupMetadata, BackupFrequency, BackupSchedule, SubscriptionLevel, RestoreOptions } from '../services/BackupRestoreService';
import SubscriptionBackupControls from './SubscriptionBackupControls';

interface BackupManagementProps {
  subscriptionLevel?: SubscriptionLevel;
  currentUser?: string;
}

const BackupManagement: React.FC<BackupManagementProps> = ({
  subscriptionLevel = 'Professional',
  currentUser = 'current-user'
}) => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [createBackupOpen, setCreateBackupOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  
  // Form states
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null);
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    overwriteExisting: false,
    selectedEntities: [],
    createBackupBeforeRestore: true,
    skipValidation: false
  });
  const [authToken, setAuthToken] = useState('');
  const [scheduleForm, setScheduleForm] = useState<{
    frequency: BackupFrequency;
    enabled: boolean;
  }>({
    frequency: { type: 'weekly', dayOfWeek: 0, hour: 2 },
    enabled: true
  });

  // Tab state for subscription controls
  const [activeTab, setActiveTab] = useState<'backups' | 'subscription'>('backups');

  // Subscription limits
  const subscriptionLimits = {
    Starter: { maxBackups: 5, features: ['Manual', 'Weekly'], dailyBackups: false },
    Professional: { maxBackups: 10, features: ['Manual', 'Weekly'], dailyBackups: false },
    Enterprise: { maxBackups: 50, features: ['Manual', 'Daily', 'Weekly', 'Biweekly'], dailyBackups: true }
  };

  const currentLimits = subscriptionLimits[subscriptionLevel];

  useEffect(() => {
    loadBackups();
    loadSchedules();
  }, []);

  const loadBackups = () => {
    try {
      const backupList = BackupRestoreService.getBackupList();
      setBackups(backupList);
    } catch (error) {
      setError('Failed to load backups');
    }
  };

  const loadSchedules = () => {
    try {
      const scheduleList = BackupRestoreService.getBackupSchedules();
      setSchedules(scheduleList);
    } catch (error) {
      setError('Failed to load backup schedules');
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await BackupRestoreService.createBackup(
        backupDescription || undefined,
        subscriptionLevel,
        { type: 'manual' },
        currentUser
      );
      setSuccess('Backup created successfully');
      setCreateBackupOpen(false);
      setBackupDescription('');
      loadBackups();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup || !authToken) return;
    
    setLoading(true);
    try {
      await BackupRestoreService.restoreFromBackup(
        selectedBackup.id,
        restoreOptions,
        authToken
      );
      setSuccess('Data restored successfully');
      setRestoreDialogOpen(false);
      setTwoFactorDialogOpen(false);
      setAuthToken('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const success = BackupRestoreService.deleteBackup(backupId);
      if (success) {
        setSuccess('Backup deleted successfully');
        loadBackups();
      } else {
        setError('Failed to delete backup');
      }
    } catch (error) {
      setError('Failed to delete backup');
    }
  };

  const handleExportBackup = async (backupId: string) => {
    try {
      setLoading(true);
      const blob = await BackupRestoreService.exportBackup(backupId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm-backup-${backupId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Backup exported successfully');
    } catch (error) {
      setError('Failed to export backup');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      BackupRestoreService.createBackupSchedule(
        scheduleForm.frequency,
        subscriptionLevel,
        scheduleForm.enabled
      );
      setSuccess('Backup schedule created successfully');
      setScheduleDialogOpen(false);
      loadSchedules();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create schedule');
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatFrequency = (frequency: BackupFrequency): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    switch (frequency.type) {
      case 'daily':
        return `Daily at ${frequency.hour || 2}:00`;
      case 'weekly':
        return `Weekly on ${days[frequency.dayOfWeek || 0]} at ${frequency.hour || 2}:00`;
      case 'biweekly':
        return `Biweekly on ${days[frequency.dayOfWeek || 0]} at ${frequency.hour || 2}:00`;
      default:
        return 'Manual';
    }
  };

  const getStatusColor = (expiryDate: string) => {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 3) return 'error';
    if (daysUntilExpiry <= 7) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BackupIcon />
        Backup & Restore Management
      </Typography>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Button
          variant={activeTab === 'backups' ? 'contained' : 'text'}
          onClick={() => setActiveTab('backups')}
          sx={{ mr: 1 }}
        >
          Backup Management
        </Button>
        <Button
          variant={activeTab === 'subscription' ? 'contained' : 'text'}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription & Settings
        </Button>
      </Box>

      {activeTab === 'subscription' ? (
        <SubscriptionBackupControls
          currentSubscription={subscriptionLevel}
          onSubscriptionChange={(newLevel) => {
            // Handle subscription change - in real app this would update the user's subscription
            console.log('Subscription changed to:', newLevel);
          }}
        />
      ) : (
        <>
      {/* Subscription Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">
          Current Plan: <strong>{subscriptionLevel}</strong> |
          Backup Limit: {backups.length} / {currentLimits.maxBackups} |
          Available Features: {currentLimits.features.join(', ')}
        </Typography>
      </Alert>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <BackupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>Create Backup</Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setCreateBackupOpen(true)}
                disabled={backups.length >= currentLimits.maxBackups}
              >
                New Backup
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>Schedule Backups</Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setScheduleDialogOpen(true)}
              >
                Manage Schedule
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>Storage Used</Typography>
              <Typography variant="h4" color="text.secondary">
                {formatFileSize(backups.reduce((total, backup) => total + backup.size, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>Security</Typography>
              <Chip 
                icon={<LockIcon />} 
                label="Encrypted" 
                color="success" 
                variant="outlined" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Backup List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Available Backups
          </Typography>
          
          {backups.length === 0 ? (
            <Alert severity="info">
              No backups available. Create your first backup to get started.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Entities</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(backup.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(backup.timestamp).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{backup.description}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {backup.createdBy}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatFileSize(backup.size)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${backup.entities.length} types`} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={backup.encrypted ? <LockIcon /> : <WarningIcon />}
                          label={backup.encrypted ? 'Secure' : 'Unsecured'}
                          color={getStatusColor(backup.expiryDate)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Restore Backup">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedBackup(backup);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <RestoreIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Export Backup">
                            <IconButton
                              size="small"
                              onClick={() => handleExportBackup(backup.id)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Backup">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteBackup(backup.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Backups */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            Scheduled Backups
          </Typography>
          
          {schedules.length === 0 ? (
            <Alert severity="info">
              No scheduled backups configured. Set up automatic backups to ensure regular data protection.
            </Alert>
          ) : (
            <List>
              {schedules.map((schedule) => (
                <ListItem key={schedule.id} divider>
                  <ListItemIcon>
                    <ScheduleIcon color={schedule.enabled ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatFrequency(schedule.frequency)}
                    secondary={`Next run: ${new Date(schedule.nextRun).toLocaleString()}`}
                  />
                  <Switch
                    checked={schedule.enabled}
                    onChange={(e) => {
                      BackupRestoreService.updateBackupSchedule(schedule.id, { enabled: e.target.checked });
                      loadSchedules();
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={createBackupOpen} onClose={() => setCreateBackupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Backup</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Backup Description"
            fullWidth
            variant="outlined"
            value={backupDescription}
            onChange={(e) => setBackupDescription(e.target.value)}
            placeholder="e.g., Monthly backup before system update"
            sx={{ mt: 2 }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This backup will include all properties, tenants, contacts, deals, and other CRM data. 
            Sensitive information will be encrypted for security.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateBackupOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateBackup}
            variant="contained"
            disabled={loading || backups.length >= currentLimits.maxBackups}
            startIcon={loading ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            {loading ? 'Creating...' : 'Create Backup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Restore from Backup</DialogTitle>
        <DialogContent>
          {selectedBackup && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ⚠️ Important: Data restoration is irreversible
                </Typography>
                <Typography variant="body2">
                  This will overwrite current data with backup from {new Date(selectedBackup.timestamp).toLocaleString()}.
                  Recent changes may be lost.
                </Typography>
              </Alert>

              <Typography variant="h6" gutterBottom>Select Data to Restore:</Typography>
              <Grid container spacing={2}>
                {selectedBackup.entities.map((entity) => (
                  <Grid item xs={6} sm={4} key={entity}>
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
                      label={entity.charAt(0).toUpperCase() + entity.slice(1)}
                    />
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Restore Options:</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreOptions.overwriteExisting}
                    onChange={(e) => setRestoreOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                  />
                }
                label="Overwrite existing data (recommended for full restore)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={restoreOptions.createBackupBeforeRestore}
                    onChange={(e) => setRestoreOptions(prev => ({ ...prev, createBackupBeforeRestore: e.target.checked }))}
                  />
                }
                label="Create backup before restore (recommended)"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => setTwoFactorDialogOpen(true)}
            variant="contained"
            color="warning"
            disabled={restoreOptions.selectedEntities.length === 0}
            startIcon={<SecurityIcon />}
          >
            Proceed to Security Verification
          </Button>
        </DialogActions>
      </Dialog>

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUserIcon />
          Security Verification Required
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Two-Factor Authentication Required
            </Typography>
            <Typography variant="body2">
              Data restoration requires additional security verification to prevent unauthorized access.
            </Typography>
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Authentication Token"
            type="password"
            fullWidth
            variant="outlined"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Enter your authentication token"
            helperText="In production, this would be sent to your registered email/phone"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRestoreBackup}
            variant="contained"
            color="error"
            disabled={loading || !authToken}
            startIcon={loading ? <CircularProgress size={20} /> : <RestoreIcon />}
          >
            {loading ? 'Restoring...' : 'Restore Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Backup Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Automatic Backups</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <FormLabel component="legend">Backup Frequency</FormLabel>
            <RadioGroup
              value={scheduleForm.frequency.type}
              onChange={(e) => setScheduleForm(prev => ({
                ...prev,
                frequency: { ...prev.frequency, type: e.target.value as any }
              }))}
            >
              <FormControlLabel 
                value="manual" 
                control={<Radio />} 
                label="Manual only" 
              />
              <FormControlLabel 
                value="weekly" 
                control={<Radio />} 
                label="Weekly" 
              />
              {currentLimits.dailyBackups && (
                <FormControlLabel 
                  value="daily" 
                  control={<Radio />} 
                  label="Daily (Enterprise only)" 
                />
              )}
              {subscriptionLevel === 'Enterprise' && (
                <FormControlLabel 
                  value="biweekly" 
                  control={<Radio />} 
                  label="Biweekly" 
                />
              )}
            </RadioGroup>
          </FormControl>

          {scheduleForm.frequency.type !== 'manual' && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={scheduleForm.frequency.dayOfWeek || 0}
                  onChange={(e) => setScheduleForm(prev => ({
                    ...prev,
                    frequency: { ...prev.frequency, dayOfWeek: Number(e.target.value) }
                  }))}
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                    <MenuItem key={index} value={index}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="dense">
                <InputLabel>Time (Hour)</InputLabel>
                <Select
                  value={scheduleForm.frequency.hour || 2}
                  onChange={(e) => setScheduleForm(prev => ({
                    ...prev,
                    frequency: { ...prev.frequency, hour: Number(e.target.value) }
                  }))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <MenuItem key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={scheduleForm.enabled}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, enabled: e.target.checked }))}
              />
            }
            label="Enable schedule"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSchedule}
            variant="contained"
            startIcon={<ScheduleIcon />}
          >
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Processing backup operation...</Typography>
          </Card>
        </Box>
      )}

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
        </>
      )}
    </Box>
  );
};

export default BackupManagement;
