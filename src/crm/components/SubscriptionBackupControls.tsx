import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';;
import { BackupRestoreService, BackupFrequency, SubscriptionLevel } from '../services/BackupRestoreService';

interface SubscriptionPlan {
  level: SubscriptionLevel;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: {
    maxBackups: number;
    retentionDays: number;
    allowedFrequencies: string[];
    dailyBackups: boolean;
    prioritySupport: boolean;
    customSchedules: boolean;
    multiLocationBackup: boolean;
    advancedEncryption: boolean;
    auditLogs: boolean;
    customRetention: boolean;
  };
  popular?: boolean;
}

interface SubscriptionBackupControlsProps {
  currentSubscription?: SubscriptionLevel;
  onSubscriptionChange?: (newLevel: SubscriptionLevel) => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    level: 'Starter',
    name: 'Starter Plan',
    price: 79,
    billingCycle: 'monthly',
    features: {
      maxBackups: 5,
      retentionDays: 14,
      allowedFrequencies: ['Manual', 'Weekly'],
      dailyBackups: false,
      prioritySupport: false,
      customSchedules: false,
      multiLocationBackup: false,
      advancedEncryption: false,
      auditLogs: false,
      customRetention: false
    }
  },
  {
    level: 'Professional',
    name: 'Professional Plan',
    price: 149,
    billingCycle: 'monthly',
    popular: true,
    features: {
      maxBackups: 10,
      retentionDays: 14,
      allowedFrequencies: ['Manual', 'Weekly'],
      dailyBackups: false,
      prioritySupport: true,
      customSchedules: true,
      multiLocationBackup: false,
      advancedEncryption: true,
      auditLogs: false,
      customRetention: false
    }
  },
  {
    level: 'Enterprise',
    name: 'Enterprise Plan',
    price: 299,
    billingCycle: 'monthly',
    features: {
      maxBackups: 50,
      retentionDays: 30,
      allowedFrequencies: ['Manual', 'Daily', 'Weekly', 'Biweekly'],
      dailyBackups: true,
      prioritySupport: true,
      customSchedules: true,
      multiLocationBackup: true,
      advancedEncryption: true,
      auditLogs: true,
      customRetention: true
    }
  }
];

const SubscriptionBackupControls: React.FC<SubscriptionBackupControlsProps> = ({
  currentSubscription = 'Professional',
  onSubscriptionChange
}) => {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionLevel>(currentSubscription);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState<{
    frequency: BackupFrequency;
    enabled: boolean;
  }>({
    frequency: { type: 'weekly', dayOfWeek: 0, hour: 2 },
    enabled: true
  });
  const [usage, setUsage] = useState({
    currentBackups: 7,
    storageUsed: 156.7, // MB
    schedules: 2
  });

  const currentPlan = subscriptionPlans.find(plan => plan.level === currentSubscription)!;
  const storageUsagePercent = (usage.storageUsed / (currentPlan.features.maxBackups * 50)) * 100; // Assuming 50MB avg per backup

  const handleUpgrade = () => {
    if (onSubscriptionChange) {
      onSubscriptionChange(selectedPlan);
    }
    setUpgradeDialogOpen(false);
  };

  const getFeatureIcon = (available: boolean) => (
    available ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />
  );

  const canUseFeature = (feature: keyof typeof currentPlan.features) => {
    return currentPlan.features[feature];
  };

  const createBackupSchedule = () => {
    if (!canUseFeature('customSchedules')) {
      setUpgradeDialogOpen(true);
      return;
    }
    
    try {
      const scheduleId = BackupRestoreService.createBackupSchedule(
        scheduleSettings.frequency,
        currentSubscription,
        scheduleSettings.enabled
      );
      console.log('Schedule created:', scheduleId);
      setScheduleDialogOpen(false);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon />
        Subscription & Backup Controls
      </Typography>

      {/* Current Plan Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon color="primary" />
                Current Plan: {currentPlan.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ${currentPlan.price}/{currentPlan.billingCycle}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Usage Overview</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BackupIcon fontSize="small" />
                  <Typography variant="body2">
                    Backups: {usage.currentBackups} / {currentPlan.features.maxBackups}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(usage.currentBackups / currentPlan.features.maxBackups) * 100} 
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StorageIcon fontSize="small" />
                  <Typography variant="body2">
                    Storage: {usage.storageUsed.toFixed(1)} MB
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, storageUsagePercent)} 
                  color={storageUsagePercent > 80 ? 'warning' : 'primary'}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Plan Features</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>{getFeatureIcon(currentPlan.features.dailyBackups)}</ListItemIcon>
                  <ListItemText 
                    primary="Daily Backups" 
                    secondary={currentPlan.features.dailyBackups ? 'Available' : 'Upgrade required'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{getFeatureIcon(currentPlan.features.customSchedules)}</ListItemIcon>
                  <ListItemText 
                    primary="Custom Schedules" 
                    secondary={currentPlan.features.customSchedules ? 'Available' : 'Upgrade required'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{getFeatureIcon(currentPlan.features.advancedEncryption)}</ListItemIcon>
                  <ListItemText 
                    primary="Advanced Encryption" 
                    secondary={currentPlan.features.advancedEncryption ? 'Active' : 'Basic encryption only'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{getFeatureIcon(currentPlan.features.prioritySupport)}</ListItemIcon>
                  <ListItemText 
                    primary="Priority Support" 
                    secondary={currentPlan.features.prioritySupport ? '24/7 support' : 'Standard support'} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Backup Frequency Controls */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                Backup Frequency
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Your {currentPlan.name} includes: {currentPlan.features.allowedFrequencies.join(', ')} backups
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentPlan.features.allowedFrequencies.map((frequency) => (
                  <Card key={frequency} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{frequency} Backups</Typography>
                        <Switch 
                          checked={frequency === 'Manual' ? false : true} 
                          disabled={frequency === 'Manual'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {frequency === 'Daily' && 'Automatically backup every day at specified time'}
                        {frequency === 'Weekly' && 'Backup once per week on specified day'}
                        {frequency === 'Biweekly' && 'Backup every two weeks'}
                        {frequency === 'Manual' && 'Create backups manually when needed'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {!canUseFeature('dailyBackups') && (
                  <Alert severity="warning" action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => setUpgradeDialogOpen(true)}
                    >
                      Upgrade
                    </Button>
                  }>
                    Daily backups require Enterprise plan
                  </Alert>
                )}

                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                  disabled={!canUseFeature('customSchedules')}
                  fullWidth
                >
                  {canUseFeature('customSchedules') ? 'Configure Schedule' : 'Custom Schedules (Upgrade Required)'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon />
                Security & Compliance
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {getFeatureIcon(currentPlan.features.advancedEncryption)}
                  </ListItemIcon>
                  <ListItemText
                    primary="AES-256 Encryption"
                    secondary={currentPlan.features.advancedEncryption ? 'Military-grade encryption active' : 'Basic encryption only'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {getFeatureIcon(currentPlan.features.auditLogs)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Audit Trail"
                    secondary={currentPlan.features.auditLogs ? 'Complete backup/restore logging' : 'Basic logging only'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {getFeatureIcon(currentPlan.features.multiLocationBackup)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Multi-Location Backup"
                    secondary={currentPlan.features.multiLocationBackup ? 'Redundant backup storage' : 'Single location storage'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {getFeatureIcon(currentPlan.features.customRetention)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Custom Retention"
                    secondary={`${currentPlan.features.retentionDays} days retention ${currentPlan.features.customRetention ? '(customizable)' : '(fixed)'}`}
                  />
                </ListItem>
              </List>

              {currentSubscription !== 'Enterprise' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Enhanced Security Available</Typography>
                  <Typography variant="body2">
                    Upgrade to Enterprise for advanced security features including audit logs and multi-location backup.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upgrade Plans */}
      {currentSubscription !== 'Enterprise' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UpgradeIcon />
              Upgrade Your Plan
            </Typography>

            <Grid container spacing={2}>
              {subscriptionPlans
                .filter(plan => plan.level !== currentSubscription)
                .map((plan) => (
                <Grid item xs={12} sm={6} md={4} key={plan.level}>
                  <Card 
                    variant={plan.popular ? 'elevation' : 'outlined'}
                    sx={{ 
                      position: 'relative',
                      bgcolor: plan.popular ? 'primary.50' : 'background.paper'
                    }}
                  >
                    {plan.popular && (
                      <Chip 
                        label="Most Popular" 
                        color="primary" 
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{plan.name}</Typography>
                      <Typography variant="h4" color="primary" gutterBottom>
                        ${plan.price}<Typography variant="body2" component="span">/{plan.billingCycle}</Typography>
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>Backup Features:</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">• {plan.features.maxBackups} max backups</Typography>
                        <Typography variant="body2">• {plan.features.retentionDays} days retention</Typography>
                        <Typography variant="body2">• {plan.features.allowedFrequencies.join(', ')} frequencies</Typography>
                        {plan.features.dailyBackups && <Typography variant="body2">• Daily automated backups</Typography>}
                        {plan.features.advancedEncryption && <Typography variant="body2">• Advanced encryption</Typography>}
                        {plan.features.auditLogs && <Typography variant="body2">• Complete audit logs</Typography>}
                      </Box>

                      <Button
                        variant={plan.popular ? 'contained' : 'outlined'}
                        fullWidth
                        onClick={() => {
                          setSelectedPlan(plan.level);
                          setUpgradeDialogOpen(true);
                        }}
                      >
                        {plan.level === 'Enterprise' ? 'Upgrade to Enterprise' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upgrade Your Subscription</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Upgrading to {selectedPlan} Plan
            </Typography>
            <Typography variant="body2">
              You'll gain access to enhanced backup features and improved security controls.
            </Typography>
          </Alert>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell align="center">Current ({currentSubscription})</TableCell>
                  <TableCell align="center">After Upgrade ({selectedPlan})</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Max Backups</TableCell>
                  <TableCell align="center">{currentPlan.features.maxBackups}</TableCell>
                  <TableCell align="center">
                    {subscriptionPlans.find(p => p.level === selectedPlan)?.features.maxBackups}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Daily Backups</TableCell>
                  <TableCell align="center">{getFeatureIcon(currentPlan.features.dailyBackups)}</TableCell>
                  <TableCell align="center">
                    {getFeatureIcon(subscriptionPlans.find(p => p.level === selectedPlan)?.features.dailyBackups || false)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Advanced Encryption</TableCell>
                  <TableCell align="center">{getFeatureIcon(currentPlan.features.advancedEncryption)}</TableCell>
                  <TableCell align="center">
                    {getFeatureIcon(subscriptionPlans.find(p => p.level === selectedPlan)?.features.advancedEncryption || false)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Audit Logs</TableCell>
                  <TableCell align="center">{getFeatureIcon(currentPlan.features.auditLogs)}</TableCell>
                  <TableCell align="center">
                    {getFeatureIcon(subscriptionPlans.find(p => p.level === selectedPlan)?.features.auditLogs || false)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpgrade}>
            Upgrade to {selectedPlan}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Configuration Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Backup Schedule</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Backup Frequency</InputLabel>
            <Select
              value={scheduleSettings.frequency.type}
              onChange={(e) => setScheduleSettings(prev => ({
                ...prev,
                frequency: { ...prev.frequency, type: e.target.value as any }
              }))}
            >
              {currentPlan.features.allowedFrequencies.map(freq => (
                <MenuItem key={freq.toLowerCase()} value={freq.toLowerCase()}>
                  {freq}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {scheduleSettings.frequency.type !== 'manual' && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={scheduleSettings.frequency.dayOfWeek || 0}
                  onChange={(e) => setScheduleSettings(prev => ({
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
                  value={scheduleSettings.frequency.hour || 2}
                  onChange={(e) => setScheduleSettings(prev => ({
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
                checked={scheduleSettings.enabled}
                onChange={(e) => setScheduleSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              />
            }
            label="Enable automatic backups"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createBackupSchedule}>
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionBackupControls;
