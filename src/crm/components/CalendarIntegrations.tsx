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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SyncAltRoundedIcon from "@mui/icons-material/SyncAltRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";

interface CalendarIntegration {
  id: string;
  name: string;
  provider: "google" | "microsoft" | "calendly" | "outlook" | "apple";
  email?: string;
  isConnected: boolean;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: "success" | "error" | "warning" | "syncing";
  eventsCount?: number;
  twoWaySync: boolean;
  calendarId?: string;
}

interface CalendarIntegrationsProps {
  open: boolean;
  onClose: () => void;
  integrations?: CalendarIntegration[];
  onUpdateIntegration?: (integration: CalendarIntegration) => void;
}

const CalendarIntegrations: React.FC<CalendarIntegrationsProps> = ({
  open,
  onClose,
  integrations: propIntegrations,
  onUpdateIntegration,
}) => {
  const theme = useTheme();
  const [integrations, setIntegrations] = React.useState<CalendarIntegration[]>(
    propIntegrations || [
      {
        id: "google-1",
        name: "Google Calendar",
        provider: "google",
        email: "john@atlantahipainting.com",
        isConnected: true,
        isActive: true,
        lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        syncStatus: "success",
        eventsCount: 24,
        twoWaySync: true,
        calendarId: "primary"
      },
      {
        id: "outlook-1",
        name: "Outlook Calendar",
        provider: "microsoft",
        email: "john@company.com",
        isConnected: true,
        isActive: false,
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        syncStatus: "warning",
        eventsCount: 18,
        twoWaySync: false,
        calendarId: "AAMkAGVmMDEzMTM4LTZmYWUtNDdkNC1hMDZiLTU1OGY5OTZhYmY4OAAuAAAAAAAiQ8W967B7TKBjgx9rVEURAQAiIsqMbYjsT5e-T8KzowKTAAAAAAEGAAA="
      },
      {
        id: "calendly-1",
        name: "Calendly",
        provider: "calendly",
        email: "john@atlantahipainting.com",
        isConnected: false,
        isActive: false,
        syncStatus: "error",
        twoWaySync: false
      }
    ]
  );

  const [connectDialog, setConnectDialog] = React.useState<{
    open: boolean;
    provider?: string;
    step: "provider" | "auth" | "settings";
  }>({
    open: false,
    step: "provider"
  });

  const [syncingIntegrations, setSyncingIntegrations] = React.useState<Set<string>>(new Set());
  const [settingsDialog, setSettingsDialog] = React.useState<{ open: boolean; integration?: CalendarIntegration }>({ open: false });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return <GoogleIcon sx={{ color: "#4285F4" }} />;
      case "microsoft":
      case "outlook":
        return <MicrosoftIcon sx={{ color: "#0078D4" }} />;
      case "calendly":
        return <CalendarTodayRoundedIcon sx={{ color: "#006BFF" }} />;
      case "apple":
        return <CalendarTodayRoundedIcon sx={{ color: "#000000" }} />;
      default:
        return <CalendarTodayRoundedIcon />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleRoundedIcon sx={{ color: theme.palette.success.main }} />;
      case "error":
        return <ErrorRoundedIcon sx={{ color: theme.palette.error.main }} />;
      case "warning":
        return <WarningRoundedIcon sx={{ color: theme.palette.warning.main }} />;
      case "syncing":
        return <CircularProgress size={20} />;
      default:
        return null;
    }
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, isActive: !integration.isActive }
          : integration
      )
    );
  };

  const handleSyncCalendar = async (integrationId: string) => {
    setSyncingIntegrations(prev => new Set([...prev, integrationId]));
    
    // Simulate sync
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === integrationId
            ? {
                ...integration,
                lastSync: new Date(),
                syncStatus: "success" as const
              }
            : integration
        )
      );
      setSyncingIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }, 3000);
  };

  const handleConnectCalendar = (provider: string) => {
    setConnectDialog({
      open: true,
      provider,
      step: "auth"
    });
  };

  const handleCompleteConnection = () => {
    // Simulate successful connection
    const newIntegration: CalendarIntegration = {
      id: `${connectDialog.provider}-${Date.now()}`,
      name: `${connectDialog.provider?.charAt(0).toUpperCase()}${connectDialog.provider?.slice(1)} Calendar`,
      provider: connectDialog.provider as any,
      email: "john@atlantahipainting.com",
      isConnected: true,
      isActive: true,
      lastSync: new Date(),
      syncStatus: "success",
      eventsCount: 0,
      twoWaySync: connectDialog.provider !== "calendly",
      calendarId: "new-calendar-id"
    };

    setIntegrations(prev => [...prev, newIntegration]);
    setConnectDialog({ open: false, step: "provider" });
  };

  const availableProviders = [
    {
      id: "google",
      name: "Google Calendar",
      description: "Sync with Google Calendar for seamless integration",
      icon: <GoogleIcon sx={{ color: "#4285F4" }} />,
      features: ["Two-way sync", "Multiple calendars", "Real-time updates"]
    },
    {
      id: "microsoft",
      name: "Microsoft Outlook",
      description: "Connect with Outlook and Office 365 calendars",
      icon: <MicrosoftIcon sx={{ color: "#0078D4" }} />,
      features: ["Exchange integration", "Teams meeting links", "Contact sync"]
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Import your Calendly booking schedules",
      icon: <CalendarTodayRoundedIcon sx={{ color: "#006BFF" }} />,
      features: ["Automated bookings", "Availability sync", "Client scheduling"]
    },
    {
      id: "apple",
      name: "Apple Calendar",
      description: "Sync with iCloud Calendar",
      icon: <CalendarTodayRoundedIcon sx={{ color: "#000000" }} />,
      features: ["iCloud sync", "iOS integration", "macOS compatibility"]
    }
  ];

  const connectedProviders = integrations.filter(int => int.isConnected).map(int => int.provider);
  const availableToConnect = availableProviders.filter(provider => !connectedProviders.includes(provider.id as any));

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            minHeight: '70vh',
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SyncAltRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Calendar Integrations</Typography>
              <Typography variant="caption" color="text.secondary">
                Connect and sync with external calendar services
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Connected Integrations */}
            {integrations.filter(int => int.isConnected).length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Connected Calendars
                </Typography>
                <Stack spacing={2}>
                  {integrations.filter(int => int.isConnected).map((integration) => (
                    <Card
                      key={integration.id}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: integration.isActive
                          ? alpha(theme.palette.success.main, 0.05)
                          : alpha(theme.palette.grey[500], 0.05)
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                              <Avatar>
                                {getProviderIcon(integration.provider)}
                              </Avatar>
                              <Box flex={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {integration.name}
                                  </Typography>
                                  {getStatusIcon(
                                    syncingIntegrations.has(integration.id) ? "syncing" : integration.syncStatus
                                  )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {integration.email}
                                </Typography>
                                {integration.lastSync && (
                                  <Typography variant="caption" color="text.secondary">
                                    Last synced: {integration.lastSync.toLocaleString()}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>

                            <Stack alignItems="flex-end" spacing={1}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={integration.isActive}
                                    onChange={() => handleToggleIntegration(integration.id)}
                                    size="small"
                                  />
                                }
                                label="Active"
                                labelPlacement="start"
                              />
                              {integration.eventsCount !== undefined && (
                                <Chip
                                  label={`${integration.eventsCount} events`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={2} alignItems="center">
                            <Stack direction="row" spacing={1} flex={1}>
                              {integration.twoWaySync && (
                                <Chip
                                  label="Two-way sync"
                                  size="small"
                                  color="success"
                                  icon={<SyncAltRoundedIcon />}
                                />
                              )}
                              {integration.syncStatus === "warning" && (
                                <Chip
                                  label="Sync issues"
                                  size="small"
                                  color="warning"
                                  icon={<WarningRoundedIcon />}
                                />
                              )}
                              {integration.syncStatus === "error" && (
                                <Chip
                                  label="Connection error"
                                  size="small"
                                  color="error"
                                  icon={<ErrorRoundedIcon />}
                                />
                              )}
                            </Stack>

                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                startIcon={syncingIntegrations.has(integration.id) ? <CircularProgress size={16} /> : <SyncRoundedIcon />}
                                onClick={() => handleSyncCalendar(integration.id)}
                                disabled={syncingIntegrations.has(integration.id) || !integration.isActive}
                              >
                                {syncingIntegrations.has(integration.id) ? "Syncing..." : "Sync Now"}
                              </Button>
                              <Tooltip title="Settings">
                                <IconButton size="small" onClick={() => setSettingsDialog({ open: true, integration })}>
                                  <SettingsRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Available Integrations */}
            {availableToConnect.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Available Integrations
                </Typography>
                <Stack spacing={2}>
                  {availableToConnect.map((provider) => (
                    <Card
                      key={provider.id}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: theme.shadows[2],
                        }
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                            <Avatar>
                              {provider.icon}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {provider.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {provider.description}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {provider.features.map((feature, index) => (
                                  <Chip
                                    key={index}
                                    label={feature}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          </Stack>

                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LinkRoundedIcon />}
                            onClick={() => handleConnectCalendar(provider.id)}
                          >
                            Connect
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Sync Statistics */}
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sync Statistics
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">
                      {integrations.filter(int => int.isConnected && int.isActive).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Calendars
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {integrations.reduce((total, int) => total + (int.eventsCount || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Synced Events
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {integrations.filter(int => int.syncStatus === "success").length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Healthy Syncs
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Sync Settings */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Sync Frequency:</strong> Calendars are automatically synced every 15 minutes. 
                You can also manually sync at any time. Two-way sync allows events created in the CRM 
                to appear in your external calendars.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => setConnectDialog({ open: true, step: "provider" })}
          >
            Add Integration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog.open}
        onClose={() => setSettingsDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Integration Settings</DialogTitle>
        <DialogContent>
          {settingsDialog.integration && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="subtitle1">{settingsDialog.integration.name}</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settingsDialog.integration.twoWaySync}
                    onChange={(e) => {
                      const updated = { ...settingsDialog.integration!, twoWaySync: e.target.checked };
                      setIntegrations(prev => prev.map(i => i.id === updated.id ? updated : i));
                      onUpdateIntegration?.(updated);
                      setSettingsDialog({ open: true, integration: updated });
                    }}
                  />
                }
                label="Enable two-way sync"
              />
              <TextField
                label="Calendar ID"
                value={settingsDialog.integration.calendarId || ""}
                onChange={(e) => {
                  const updated = { ...settingsDialog.integration!, calendarId: e.target.value };
                  setIntegrations(prev => prev.map(i => i.id === updated.id ? updated : i));
                  onUpdateIntegration?.(updated);
                  setSettingsDialog({ open: true, integration: updated });
                }}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog({ open: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Connect Calendar Dialog */}
      <Dialog
        open={connectDialog.open}
        onClose={() => setConnectDialog({ open: false, step: "provider" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Connect Calendar Service
        </DialogTitle>
        <DialogContent>
          {connectDialog.step === "provider" && (
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Choose a calendar service to integrate with your CRM:
              </Typography>
              <Stack spacing={2}>
                {availableToConnect.map((provider) => (
                  <Card
                    key={provider.id}
                    sx={{
                      cursor: 'pointer',
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                    onClick={() => handleConnectCalendar(provider.id)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {provider.icon}
                        <Box>
                          <Typography variant="subtitle1">{provider.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {provider.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}

          {connectDialog.step === "auth" && (
            <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                {getProviderIcon(connectDialog.provider || "")}
              </Avatar>
              <Typography variant="h6" textAlign="center">
                Connecting to {connectDialog.provider?.charAt(0).toUpperCase()}{connectDialog.provider?.slice(1)} Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Authorizing connection… this may take a few seconds.
              </Typography>
              <Alert severity="info" sx={{ width: '100%' }}>
                <Typography variant="body2">
                  <strong>Permissions needed:</strong>
                  <br />• Read calendar events
                  <br />• Create new events
                  <br />• Update existing events
                  <br />• Delete events (CRM-created only)
                </Typography>
              </Alert>
              <CircularProgress />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialog({ open: false, step: "provider" })}>
            Cancel
          </Button>
          {connectDialog.step === "auth" && (
            <Button variant="contained" onClick={handleCompleteConnection}>
              Complete Connection
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarIntegrations;
