import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PrivacyTipRoundedIcon from "@mui/icons-material/PrivacyTipRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import UserPreferencesSettings from "../components/UserPreferencesSettings";
import CompanySettings, { useCompanyInfo, CompanyInfo } from "../components/CompanySettings";
import { useMode } from "../contexts/ModeContext";
import { LocalStorageService } from "../services/LocalStorageService";

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  workOrderUpdates: boolean;
  paymentReminders: boolean;
  maintenanceAlerts: boolean;
  marketingEmails: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  dataDownloadAlerts: boolean;
}

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActivity: string;
  current: boolean;
  browser: string;
  ip: string;
}

const mockNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  workOrderUpdates: true,
  paymentReminders: true,
  maintenanceAlerts: true,
  marketingEmails: false,
  systemUpdates: true,
};

const mockSecurity: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 30,
  loginAlerts: true,
  dataDownloadAlerts: true,
};

const mockSessions: ActiveSession[] = [
  {
    id: "1",
    device: "Desktop",
    location: "New York, NY",
    lastActivity: "2024-01-30T09:00:00Z",
    current: true,
    browser: "Chrome 120",
    ip: "192.168.1.100",
  },
  {
    id: "2",
    device: "Mobile",
    location: "New York, NY",
    lastActivity: "2024-01-29T18:30:00Z",
    current: false,
    browser: "Safari Mobile",
    ip: "192.168.1.101",
  },
  {
    id: "3",
    device: "Desktop",
    location: "Boston, MA",
    lastActivity: "2024-01-28T14:20:00Z",
    current: false,
    browser: "Firefox 121",
    ip: "10.0.0.50",
  },
];

export default function AccountSettings() {
  const { isTenantMode } = useMode();
  const [notifications, setNotifications] = React.useState<NotificationSettings>(mockNotifications);
  const [security, setSecurity] = React.useState<SecuritySettings>(mockSecurity);
  const [sessions, setSessions] = React.useState<ActiveSession[]>(mockSessions);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = React.useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = React.useState(false);
  const [userPreferencesOpen, setUserPreferencesOpen] = React.useState(false);
  const [companySettingsOpen, setCompanySettingsOpen] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

  // Company information management
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();

  // User role management
  const [userRole, setUserRole] = React.useState(() => {
    return LocalStorageService.getUserRoles();
  });

  const updateUserRole = React.useCallback((newRole: any) => {
    setUserRole(newRole);
    LocalStorageService.saveUserRoles(newRole);
  }, []);

  // Check if user has admin permissions
  const isAdmin = userRole.role === 'admin' || userRole.role === 'super_admin';
  const isSuperAdmin = userRole.role === 'super_admin';

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSecurityChange = (setting: keyof SecuritySettings, value: any) => {
    setSecurity(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    alert("Session terminated successfully");
  };

  const handleTerminateAllSessions = () => {
    setSessions(prev => prev.filter(session => session.current));
    alert("All other sessions terminated successfully");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === "DELETE") {
      alert("Account deletion initiated. You will receive an email confirmation.");
      setDeleteAccountDialogOpen(false);
      setDeleteConfirmText("");
    } else {
      alert("Please type 'DELETE' to confirm account deletion");
    }
  };

  const handleEnable2FA = () => {
    setSecurity(prev => ({ ...prev, twoFactorEnabled: true }));
    setTwoFactorDialogOpen(false);
    alert("Two-factor authentication enabled successfully");
  };

  const getDeviceIcon = (device: string) => {
    return device.toLowerCase().includes('mobile') ? 
      <SmartphoneRoundedIcon /> : <ComputerRoundedIcon />;
  };

  // Tenant mode - simplified interface
  if (isTenantMode) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1200px" }, mx: "auto" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Basic User Preferences for Tenants */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <SettingsRoundedIcon color="primary" />
                  <Typography variant="h6">Display Preferences</Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Customize your viewing experience with theme and basic display settings.
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<SettingsRoundedIcon />}
                  onClick={() => setUserPreferencesOpen(true)}
                >
                  Open Display Preferences
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Notification Settings for Tenants */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <NotificationsRoundedIcon color="primary" />
                  <Typography variant="h6">Notification Preferences</Typography>
                </Stack>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.smsNotifications}
                        onChange={() => handleNotificationChange('smsNotifications')}
                      />
                    }
                    label="SMS Notifications"
                  />

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Property Notifications
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.maintenanceAlerts}
                        onChange={() => handleNotificationChange('maintenanceAlerts')}
                      />
                    }
                    label="Maintenance Updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.paymentReminders}
                        onChange={() => handleNotificationChange('paymentReminders')}
                      />
                    }
                    label="Payment Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.systemUpdates}
                        onChange={() => handleNotificationChange('systemUpdates')}
                      />
                    }
                    label="System Updates"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Security for Tenants */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <SecurityRoundedIcon color="primary" />
                  <Typography variant="h6">Account Security</Typography>
                </Stack>

                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1">Two-Factor Authentication</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Add an extra layer of security to your account
                        </Typography>
                      </Box>
                      {security.twoFactorEnabled ? (
                        <Chip label="Enabled" color="success" />
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setTwoFactorDialogOpen(true)}
                        >
                          Enable
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={security.loginAlerts}
                        onChange={() => handleSecurityChange('loginAlerts', !security.loginAlerts)}
                      />
                    }
                    label="Login Alerts"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Privacy for Tenants */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <PrivacyTipRoundedIcon color="primary" />
                  <Typography variant="h6">Privacy</Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button variant="outlined" fullWidth>
                      Download My Data
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button variant="outlined" fullWidth>
                      Privacy Policy
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button variant="outlined" fullWidth>
                      Terms of Service
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Two-Factor Authentication Dialog */}
        <Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Alert severity="info">
                Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
              </Alert>
              <Typography variant="body2">
                To enable 2FA, you'll need to install an authenticator app like Google Authenticator or Authy on your mobile device.
              </Typography>
              <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.100" }}>
                <Typography variant="caption">QR Code would appear here</Typography>
                <Box sx={{ width: 120, height: 120, bgcolor: "white", mx: "auto", mt: 1, border: "1px dashed grey" }} />
              </Paper>
              <TextField
                label="Enter verification code from your authenticator app"
                fullWidth
                placeholder="123456"
                helperText="Enter the 6-digit code from your authenticator app"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTwoFactorDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEnable2FA}>
              Enable 2FA
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Preferences Settings Dialog */}
        <UserPreferencesSettings
          open={userPreferencesOpen}
          onClose={() => setUserPreferencesOpen(false)}
        />
      </Box>
    );
  }

  // Management mode - full interface
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1200px" }, mx: "auto" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Account Settings
      </Typography>

      <Grid container spacing={3}>
        {/* User Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <SettingsRoundedIcon color="primary" />
                <Typography variant="h6">User Preferences & Appearance</Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Customize your experience with theme settings, dashboard layout, table preferences,
                and more. Your settings are automatically saved and will persist across sessions.
              </Typography>

              <Button
                variant="outlined"
                startIcon={<SettingsRoundedIcon />}
                onClick={() => setUserPreferencesOpen(true)}
              >
                Open User Preferences
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <NotificationsRoundedIcon color="primary" />
                <Typography variant="h6">Notification Preferences</Typography>
              </Stack>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                    />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                  }
                  label="Push Notifications"
                />
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Content Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.workOrderUpdates}
                      onChange={() => handleNotificationChange('workOrderUpdates')}
                    />
                  }
                  label="Work Order Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.paymentReminders}
                      onChange={() => handleNotificationChange('paymentReminders')}
                    />
                  }
                  label="Payment Reminders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.maintenanceAlerts}
                      onChange={() => handleNotificationChange('maintenanceAlerts')}
                    />
                  }
                  label="Maintenance Alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.marketingEmails}
                      onChange={() => handleNotificationChange('marketingEmails')}
                    />
                  }
                  label="Marketing Emails"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.systemUpdates}
                      onChange={() => handleNotificationChange('systemUpdates')}
                    />
                  }
                  label="System Updates"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <SecurityRoundedIcon color="primary" />
                <Typography variant="h6">Security Settings</Typography>
              </Stack>
              
              <Stack spacing={3}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1">Two-Factor Authentication</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    {security.twoFactorEnabled ? (
                      <Chip label="Enabled" color="success" />
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setTwoFactorDialogOpen(true)}
                      >
                        Enable
                      </Button>
                    )}
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body1" gutterBottom>Session Timeout</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Automatically log out after period of inactivity
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={security.sessionTimeout > 0}
                        onChange={(e) => handleSecurityChange('sessionTimeout', e.target.checked ? 30 : 0)}
                      />
                    }
                    label={`${security.sessionTimeout} minutes`}
                  />
                </Box>

                <Divider />

                <FormControlLabel
                  control={
                    <Switch
                      checked={security.loginAlerts}
                      onChange={() => handleSecurityChange('loginAlerts', !security.loginAlerts)}
                    />
                  }
                  label="Login Alerts"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={security.dataDownloadAlerts}
                      onChange={() => handleSecurityChange('dataDownloadAlerts', !security.dataDownloadAlerts)}
                    />
                  }
                  label="Data Download Alerts"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LockRoundedIcon color="primary" />
                  <Typography variant="h6">Active Sessions</Typography>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleTerminateAllSessions}
                  disabled={sessions.length <= 1}
                >
                  Terminate All Other Sessions
                </Button>
              </Stack>
              
              <List>
                {sessions.map((session) => (
                  <ListItem
                    key={session.id}
                    sx={{
                      border: session.current ? "2px solid" : "1px solid",
                      borderColor: session.current ? "primary.main" : "divider",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      {getDeviceIcon(session.device)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1} component="span">
                          <Typography component="span" variant="body1">{session.device} - {session.browser}</Typography>
                          {session.current && <Chip label="Current" color="primary" size="small" />}
                        </Stack>
                      }
                      secondary={
                        <Stack direction="column" spacing={0.5} component="span">
                          <Typography component="span" variant="body2" color="text.secondary">
                            {session.location} • IP: {session.ip}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            Last activity: {new Date(session.lastActivity).toLocaleString()}
                          </Typography>
                        </Stack>
                      }
                    />
                    {!session.current && (
                      <IconButton
                        color="error"
                        onClick={() => handleTerminateSession(session.id)}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy & Data */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <PrivacyTipRoundedIcon color="primary" />
                <Typography variant="h6">Privacy & Data</Typography>
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="outlined" fullWidth>
                    Download My Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="outlined" fullWidth>
                    Privacy Policy
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="outlined" fullWidth>
                    Terms of Service
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => setDeleteAccountDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
            </Alert>
            <Typography variant="body2">
              To enable 2FA, you'll need to install an authenticator app like Google Authenticator or Authy on your mobile device.
            </Typography>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.100" }}>
              <Typography variant="caption">QR Code would appear here</Typography>
              <Box sx={{ width: 120, height: 120, bgcolor: "white", mx: "auto", mt: 1, border: "1px dashed grey" }} />
            </Paper>
            <TextField
              label="Enter verification code from your authenticator app"
              fullWidth
              placeholder="123456"
              helperText="Enter the 6-digit code from your authenticator app"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEnable2FA}>
            Enable 2FA
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountDialogOpen} onClose={() => setDeleteAccountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningRoundedIcon color="error" />
            Delete Account
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="error">
              <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
            </Alert>
            <Typography variant="body2">
              Deleting your account will:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="body2">Remove all your personal data</Typography>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="body2">Cancel any active subscriptions</Typography>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="body2">Delete all uploaded files and documents</Typography>
              </Box>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography component="span" variant="body2">Remove access to all connected properties</Typography>
              </Box>
            </Box>
            <TextField
              label="Type 'DELETE' to confirm"
              fullWidth
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              helperText="This confirmation is required to delete your account"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteAccountDialogOpen(false);
            setDeleteConfirmText("");
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== "DELETE"}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Preferences Settings Dialog */}
      <UserPreferencesSettings
        open={userPreferencesOpen}
        onClose={() => setUserPreferencesOpen(false)}
      />
    </Box>
  );
}
