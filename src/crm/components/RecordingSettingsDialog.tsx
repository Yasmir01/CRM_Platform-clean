import * as React from "react";
import {
  Box,
  Typography,
  Button,
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
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRoundedIcon";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import TranscribeRoundedIcon from "@mui/icons-material/TranscribeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRoundedIcon";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export interface RecordingSettings {
  autoRecord: boolean;
  recordInbound: boolean;
  recordOutbound: boolean;
  enableTranscription: boolean;
  retentionDays: number;
  qualityAnalysis: boolean;
  customerConsent: boolean;
  storageLocation: "local" | "cloud" | "both";
  compressionEnabled: boolean;
  transcriptionLanguage: string;
  sentimentAnalysis: boolean;
  keywordDetection: boolean;
  complianceMonitoring: boolean;
  autoTagging: boolean;
  webhookUrl?: string;
  encryptionEnabled: boolean;
  accessControlEnabled: boolean;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  lastTrigger?: string;
  secretKey?: string;
}

interface RecordingSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: RecordingSettings;
  onUpdateSettings: (settings: RecordingSettings) => void;
}

export default function RecordingSettingsDialog({
  open,
  onClose,
  settings,
  onUpdateSettings,
}: RecordingSettingsDialogProps) {
  const [localSettings, setLocalSettings] = React.useState<RecordingSettings>(settings);
  const [webhookEndpoints, setWebhookEndpoints] = React.useState<WebhookEndpoint[]>([
    {
      id: "1",
      name: "Main Recording Webhook",
      url: "https://your-domain.com/api/webhooks/recordings",
      events: ["recording.completed", "transcription.completed", "analysis.completed"],
      isActive: true,
      lastTrigger: new Date().toISOString(),
      secretKey: "whsec_" + Math.random().toString(36).substring(2, 15),
    },
    {
      id: "2", 
      name: "Quality Alerts",
      url: "https://your-domain.com/api/webhooks/quality-alerts",
      events: ["quality.poor", "compliance.violation"],
      isActive: true,
      secretKey: "whsec_" + Math.random().toString(36).substring(2, 15),
    },
  ]);

  const [newWebhook, setNewWebhook] = React.useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const handleSettingChange = (key: keyof RecordingSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleAddWebhook = () => {
    if (newWebhook.name && newWebhook.url && newWebhook.events.length > 0) {
      setWebhookEndpoints(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          ...newWebhook,
          isActive: true,
          secretKey: "whsec_" + Math.random().toString(36).substring(2, 15),
        },
      ]);
      setNewWebhook({ name: "", url: "", events: [] });
    }
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhookEndpoints(prev => prev.filter(w => w.id !== id));
  };

  const toggleWebhookActive = (id: string) => {
    setWebhookEndpoints(prev =>
      prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w)
    );
  };

  const availableEvents = [
    "recording.started",
    "recording.completed",
    "recording.failed",
    "transcription.completed",
    "transcription.failed",
    "analysis.completed",
    "quality.excellent",
    "quality.poor",
    "compliance.violation",
    "sentiment.negative",
    "keyword.detected",
    "storage.archived",
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SettingsRoundedIcon />
          <Box>
            <Typography variant="h6">Call Recording Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure recording behavior, compliance, and integrations
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Basic Recording Settings */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SettingsRoundedIcon color="primary" />
                  <Typography variant="h6">Recording Configuration</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.autoRecord}
                          onChange={(e) => handleSettingChange("autoRecord", e.target.checked)}
                        />
                      }
                      label="Auto-record all calls"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.customerConsent}
                          onChange={(e) => handleSettingChange("customerConsent", e.target.checked)}
                        />
                      }
                      label="Require customer consent"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.recordInbound}
                          onChange={(e) => handleSettingChange("recordInbound", e.target.checked)}
                        />
                      }
                      label="Record inbound calls"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.recordOutbound}
                          onChange={(e) => handleSettingChange("recordOutbound", e.target.checked)}
                        />
                      }
                      label="Record outbound calls"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Storage Location</InputLabel>
                      <Select
                        value={localSettings.storageLocation}
                        label="Storage Location"
                        onChange={(e) => handleSettingChange("storageLocation", e.target.value)}
                      >
                        <MenuItem value="local">Local Storage</MenuItem>
                        <MenuItem value="cloud">Cloud Storage</MenuItem>
                        <MenuItem value="both">Both (Redundant)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Retention Period: {localSettings.retentionDays} days
                      </Typography>
                      <Slider
                        value={localSettings.retentionDays}
                        onChange={(e, value) => handleSettingChange("retentionDays", value)}
                        min={30}
                        max={2555} // 7 years
                        marks={[
                          { value: 30, label: "30d" },
                          { value: 90, label: "90d" },
                          { value: 365, label: "1yr" },
                          { value: 2555, label: "7yr" },
                        ]}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.compressionEnabled}
                          onChange={(e) => handleSettingChange("compressionEnabled", e.target.checked)}
                        />
                      }
                      label="Enable audio compression to save storage space"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Transcription & Analysis */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TranscribeRoundedIcon color="primary" />
                  <Typography variant="h6">Transcription & Analysis</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.enableTranscription}
                          onChange={(e) => handleSettingChange("enableTranscription", e.target.checked)}
                        />
                      }
                      label="Enable automatic transcription"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Transcription Language</InputLabel>
                      <Select
                        value={localSettings.transcriptionLanguage}
                        label="Transcription Language"
                        onChange={(e) => handleSettingChange("transcriptionLanguage", e.target.value)}
                      >
                        <MenuItem value="en-US">English (US)</MenuItem>
                        <MenuItem value="en-GB">English (UK)</MenuItem>
                        <MenuItem value="es-ES">Spanish</MenuItem>
                        <MenuItem value="fr-FR">French</MenuItem>
                        <MenuItem value="de-DE">German</MenuItem>
                        <MenuItem value="it-IT">Italian</MenuItem>
                        <MenuItem value="pt-BR">Portuguese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.sentimentAnalysis}
                          onChange={(e) => handleSettingChange("sentimentAnalysis", e.target.checked)}
                        />
                      }
                      label="Sentiment analysis"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.keywordDetection}
                          onChange={(e) => handleSettingChange("keywordDetection", e.target.checked)}
                        />
                      }
                      label="Keyword detection"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.qualityAnalysis}
                          onChange={(e) => handleSettingChange("qualityAnalysis", e.target.checked)}
                        />
                      }
                      label="Audio quality analysis"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.autoTagging}
                          onChange={(e) => handleSettingChange("autoTagging", e.target.checked)}
                        />
                      }
                      label="Automatic tagging"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Security & Compliance */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SecurityRoundedIcon color="primary" />
                  <Typography variant="h6">Security & Compliance</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.encryptionEnabled}
                          onChange={(e) => handleSettingChange("encryptionEnabled", e.target.checked)}
                        />
                      }
                      label="Enable end-to-end encryption"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.accessControlEnabled}
                          onChange={(e) => handleSettingChange("accessControlEnabled", e.target.checked)}
                        />
                      }
                      label="Role-based access control"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.complianceMonitoring}
                          onChange={(e) => handleSettingChange("complianceMonitoring", e.target.checked)}
                        />
                      }
                      label="Compliance monitoring"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        When compliance monitoring is enabled, calls are automatically scanned for policy violations,
                        sensitive information, and regulatory compliance issues (GDPR, HIPAA, PCI-DSS).
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Webhook Configuration */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LinkRoundedIcon color="primary" />
                  <Typography variant="h6">Webhook Endpoints</Typography>
                  <Chip
                    label={`${webhookEndpoints.filter(w => w.isActive).length} active`}
                    size="small"
                    color="primary"
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <Typography variant="body2" color="text.secondary">
                    Configure webhook endpoints to receive real-time notifications about recording events.
                    These integrate with your provider webhook URLs from the SMS connection settings.
                  </Typography>
                  
                  {/* Existing Webhooks */}
                  <List>
                    {webhookEndpoints.map((webhook) => (
                      <ListItem key={webhook.id} divider>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: webhook.isActive ? "success.main" : "grey.400",
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={webhook.name}
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography variant="caption">{webhook.url}</Typography>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {webhook.events.map((event) => (
                                  <Chip key={event} label={event} size="small" variant="outlined" />
                                ))}
                              </Stack>
                              {webhook.lastTrigger && (
                                <Typography variant="caption" color="text.secondary">
                                  Last triggered: {new Date(webhook.lastTrigger).toLocaleString()}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Switch
                              checked={webhook.isActive}
                              onChange={() => toggleWebhookActive(webhook.id)}
                              size="small"
                            />
                            <IconButton size="small" onClick={() => handleDeleteWebhook(webhook.id)}>
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  {/* Add New Webhook */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>Add New Webhook</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Webhook Name"
                            value={newWebhook.name}
                            onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., CRM Integration"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Webhook URL"
                            value={newWebhook.url}
                            onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://your-app.com/webhooks"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Events</InputLabel>
                            <Select
                              multiple
                              value={newWebhook.events}
                              label="Events"
                              onChange={(e) => setNewWebhook(prev => ({ ...prev, events: e.target.value as string[] }))}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                  ))}
                                </Box>
                              )}
                            >
                              {availableEvents.map((event) => (
                                <MenuItem key={event} value={event}>
                                  {event}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            startIcon={<AddRoundedIcon />}
                            onClick={handleAddWebhook}
                            disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                          >
                            Add Webhook
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Provider Integration Status */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CloudRoundedIcon color="primary" />
                  <Typography variant="h6">Provider Integration</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Recording webhook URLs are configured in your provider settings and will automatically
                  receive recording callbacks when calls are completed.
                </Alert>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Twilio Integration</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recording callbacks: ✅ Configured
                        </Typography>
                        <Typography variant="caption">
                          https://your-domain.com/webhooks/twilio/recordings
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">SMS-IT Integration</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Recording callbacks: ✅ Configured
                        </Typography>
                        <Typography variant="caption">
                          https://your-domain.com/webhooks/sms-it/recordings
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
