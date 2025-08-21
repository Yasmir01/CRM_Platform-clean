import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Alert,
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
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import WebhookRoundedIcon from "@mui/icons-material/WebhookRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import MonitorRoundedIcon from "@mui/icons-material/MonitorRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "Email" | "Payments" | "Storage" | "Analytics" | "Communication" | "CRM" | "Marketing" | "Finance";
  provider: string;
  type: "API" | "Webhook" | "OAuth" | "Direct";
  status: "Connected" | "Disconnected" | "Error" | "Pending";
  isActive: boolean;
  lastSync: string;
  syncFrequency: "Real-time" | "Hourly" | "Daily" | "Weekly" | "Manual";
  configuration: Record<string, any>;
  metrics: IntegrationMetrics;
  icon: string;
  setupComplexity: "Easy" | "Medium" | "Advanced";
  pricing: string;
  features: string[];
  dateConnected?: string;
  lastError?: string;
}

interface IntegrationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  dataTransferred: number;
  uptime: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "Active" | "Inactive" | "Error";
  secret: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  headers: Record<string, string>;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: "Active" | "Revoked" | "Expired";
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  usageCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const mockIntegrations: Integration[] = [
  {
    id: "1",
    name: "Mailchimp",
    description: "Email marketing and automation platform",
    category: "Email",
    provider: "Mailchimp",
    type: "API",
    status: "Connected",
    isActive: true,
    lastSync: "2024-01-18T10:30:00Z",
    syncFrequency: "Hourly",
    configuration: { apiKey: "mc_12345...", listId: "abc123" },
    metrics: {
      totalRequests: 1250,
      successfulRequests: 1225,
      failedRequests: 25,
      avgResponseTime: 125,
      dataTransferred: 2.5,
      uptime: 99.8
    },
    icon: "📧",
    setupComplexity: "Easy",
    pricing: "$10/month",
    features: ["Email Campaigns", "Automation", "Analytics", "Segmentation"],
    dateConnected: "2024-01-01"
  },
  {
    id: "2",
    name: "Stripe",
    description: "Payment processing and billing",
    category: "Payments",
    provider: "Stripe",
    type: "API",
    status: "Connected",
    isActive: true,
    lastSync: "2024-01-18T11:15:00Z",
    syncFrequency: "Real-time",
    configuration: { publicKey: "pk_live_...", webhookSecret: "whsec_..." },
    metrics: {
      totalRequests: 3420,
      successfulRequests: 3398,
      failedRequests: 22,
      avgResponseTime: 89,
      dataTransferred: 5.2,
      uptime: 99.9
    },
    icon: "💳",
    setupComplexity: "Medium",
    pricing: "2.9% + 30¢",
    features: ["Payment Processing", "Subscriptions", "Invoicing", "Reporting"],
    dateConnected: "2024-01-02"
  },
  {
    id: "3",
    name: "Google Drive",
    description: "Cloud storage and file management",
    category: "Storage",
    provider: "Google",
    type: "OAuth",
    status: "Connected",
    isActive: true,
    lastSync: "2024-01-18T09:45:00Z",
    syncFrequency: "Daily",
    configuration: { folderId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" },
    metrics: {
      totalRequests: 890,
      successfulRequests: 885,
      failedRequests: 5,
      avgResponseTime: 200,
      dataTransferred: 12.8,
      uptime: 99.4
    },
    icon: "📁",
    setupComplexity: "Easy",
    pricing: "Free",
    features: ["File Storage", "Backup", "Sharing", "Collaboration"],
    dateConnected: "2024-01-03"
  },
  {
    id: "4",
    name: "Slack",
    description: "Team communication and notifications",
    category: "Communication",
    provider: "Slack",
    type: "Webhook",
    status: "Error",
    isActive: false,
    lastSync: "2024-01-17T14:20:00Z",
    syncFrequency: "Real-time",
    configuration: { webhookUrl: "https://hooks.slack.com/...", channel: "#crm-alerts" },
    metrics: {
      totalRequests: 245,
      successfulRequests: 180,
      failedRequests: 65,
      avgResponseTime: 450,
      dataTransferred: 0.8,
      uptime: 73.5
    },
    icon: "💬",
    setupComplexity: "Easy",
    pricing: "Free",
    features: ["Notifications", "Alerts", "Team Updates", "Channel Integration"],
    dateConnected: "2024-01-05",
    lastError: "Webhook URL is invalid or expired"
  },
  {
    id: "5",
    name: "Encharge.io",
    description: "Email marketing automation and customer lifecycle management",
    category: "Email",
    provider: "Encharge",
    type: "API",
    status: "Disconnected",
    isActive: false,
    lastSync: "Never",
    syncFrequency: "Hourly",
    configuration: { apiKey: "", accountId: "" },
    metrics: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      dataTransferred: 0,
      uptime: 0
    },
    icon: "📧",
    setupComplexity: "Medium",
    pricing: "$49/month",
    features: ["Email Automation", "Customer Journey", "Segmentation", "Analytics", "A/B Testing"],
    dateConnected: undefined
  }
];

const mockWebhooks: Webhook[] = [
  {
    id: "1",
    name: "Property Created",
    url: "https://api.example.com/webhooks/property-created",
    events: ["property.created", "property.updated"],
    status: "Active",
    secret: "whsec_1234567890abcdef",
    lastTriggered: "2024-01-18T10:15:00Z",
    successCount: 142,
    failureCount: 3,
    headers: { "Content-Type": "application/json" }
  },
  {
    id: "2",
    name: "Payment Received",
    url: "https://finance.company.com/api/payment-received",
    events: ["payment.success", "payment.failed"],
    status: "Active",
    secret: "whsec_abcdef1234567890",
    lastTriggered: "2024-01-18T11:30:00Z",
    successCount: 89,
    failureCount: 1,
    headers: { "Content-Type": "application/json", "Authorization": "Bearer token123" }
  }
];

const mockAPIKeys: APIKey[] = [
  {
    id: "1",
    name: "Mobile App",
    key: "pk_live_5GsQOTHR...",
    permissions: ["read:properties", "write:tenants", "read:analytics"],
    status: "Active",
    lastUsed: "2024-01-18T11:45:00Z",
    expiresAt: "2024-12-31T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z",
    usageCount: 5420
  },
  {
    id: "2",
    name: "Partner Integration",
    key: "pk_test_4KJHGF...",
    permissions: ["read:properties", "read:tenants"],
    status: "Active",
    lastUsed: "2024-01-17T16:20:00Z",
    expiresAt: "2024-06-30T23:59:59Z",
    createdAt: "2024-01-10T00:00:00Z",
    usageCount: 1250
  }
];

const getStatusColor = (status: Integration["status"]) => {
  switch (status) {
    case "Connected": return "success";
    case "Disconnected": return "default";
    case "Error": return "error";
    case "Pending": return "warning";
    default: return "default";
  }
};

const getStatusIcon = (status: Integration["status"]) => {
  switch (status) {
    case "Connected": return <CheckCircleRoundedIcon />;
    case "Disconnected": return <LinkOffRoundedIcon />;
    case "Error": return <ErrorRoundedIcon />;
    case "Pending": return <WarningRoundedIcon />;
    default: return <LinkRoundedIcon />;
  }
};

const getCategoryIcon = (category: Integration["category"]) => {
  switch (category) {
    case "Email": return <EmailRoundedIcon />;
    case "Payments": return <PaymentRoundedIcon />;
    case "Storage": return <StorageRoundedIcon />;
    case "Analytics": return <MonitorRoundedIcon />;
    case "Communication": return <IntegrationInstructionsRoundedIcon />;
    case "CRM": return <ApiRoundedIcon />;
    case "Marketing": return <WebhookRoundedIcon />;
    case "Finance": return <SecurityRoundedIcon />;
    default: return <CloudRoundedIcon />;
  }
};

export default function IntegrationManagement() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [integrations, setIntegrations] = React.useState<Integration[]>(mockIntegrations);
  const [webhooks, setWebhooks] = React.useState<Webhook[]>(mockWebhooks);
  const [apiKeys, setAPIKeys] = React.useState<APIKey[]>(mockAPIKeys);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("All");
  const [filterStatus, setFilterStatus] = React.useState("All");
  const [openIntegrationDialog, setOpenIntegrationDialog] = React.useState(false);
  const [openWebhookDialog, setOpenWebhookDialog] = React.useState(false);
  const [openAPIKeyDialog, setOpenAPIKeyDialog] = React.useState(false);
  const [selectedIntegration, setSelectedIntegration] = React.useState<Integration | null>(null);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || integration.category === filterCategory;
    const matchesStatus = filterStatus === "All" || integration.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalIntegrations = integrations.length;
  const connectedIntegrations = integrations.filter(i => i.status === "Connected").length;
  const activeIntegrations = integrations.filter(i => i.isActive).length;
  const errorIntegrations = integrations.filter(i => i.status === "Error").length;

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === id
        ? { ...integration, isActive: !integration.isActive }
        : integration
    ));
  };

  const handleTestIntegration = (id: string) => {
    console.log(`Testing integration ${id}...`);
    // In real app, this would make an API call to test the integration
  };

  const handleSyncIntegration = (id: string) => {
    console.log(`Syncing integration ${id}...`);
    // In real app, this would trigger a sync
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Integration Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ApiRoundedIcon />}
            onClick={() => setOpenAPIKeyDialog(true)}
          >
            API Keys
          </Button>
          <Button
            variant="outlined"
            startIcon={<WebhookRoundedIcon />}
            onClick={() => setOpenWebhookDialog(true)}
          >
            Webhooks
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenIntegrationDialog(true)}
          >
            Add Integration
          </Button>
        </Stack>
      </Stack>

      {/* Integration Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <IntegrationInstructionsRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Integrations</Typography>
                  <Typography variant="h4">{totalIntegrations}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Connected</Typography>
                  <Typography variant="h4">{connectedIntegrations}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <PlayArrowRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Active</Typography>
                  <Typography variant="h4">{activeIntegrations}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <ErrorRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Errors</Typography>
                  <Typography variant="h4">{errorIntegrations}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Email">Email</MenuItem>
                  <MenuItem value="Payments">Payments</MenuItem>
                  <MenuItem value="Storage">Storage</MenuItem>
                  <MenuItem value="Analytics">Analytics</MenuItem>
                  <MenuItem value="Communication">Communication</MenuItem>
                  <MenuItem value="CRM">CRM</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Connected">Connected</MenuItem>
                  <MenuItem value="Disconnected">Disconnected</MenuItem>
                  <MenuItem value="Error">Error</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredIntegrations.length} integrations
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <Grid container spacing={3}>
        {filteredIntegrations.map((integration) => (
          <Grid item xs={12} md={6} lg={4} key={integration.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ width: 48, height: 48, fontSize: 24 }}>
                        {integration.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {integration.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {integration.provider}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        icon={getStatusIcon(integration.status)}
                        label={integration.status}
                        color={getStatusColor(integration.status)}
                        size="small"
                      />
                    </Stack>
                  </Stack>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary">
                    {integration.description}
                  </Typography>

                  {/* Metrics */}
                  <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Uptime</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {integration.metrics.uptime.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Requests</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {integration.metrics.totalRequests.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">Sync</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {integration.syncFrequency}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Error Message */}
                  {integration.status === "Error" && integration.lastError && (
                    <Alert severity="error" size="small">
                      {integration.lastError}
                    </Alert>
                  )}

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={integration.isActive}
                          onChange={() => handleToggleIntegration(integration.id)}
                          size="small"
                        />
                      }
                      label="Active"
                    />
                    <Box flex={1} />
                    <Tooltip title="Test Connection">
                      <IconButton
                        size="small"
                        onClick={() => handleTestIntegration(integration.id)}
                      >
                        <BugReportRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sync Now">
                      <IconButton
                        size="small"
                        onClick={() => handleSyncIntegration(integration.id)}
                      >
                        <SyncRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Configure">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setOpenIntegrationDialog(true);
                        }}
                      >
                        <SettingsRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialogs */}
      <Dialog open={openIntegrationDialog} onClose={() => setOpenIntegrationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedIntegration ? `Configure ${selectedIntegration.name}` : "Add New Integration"}
        </DialogTitle>
        <DialogContent>
          {selectedIntegration ? (
            <Box sx={{ mt: 2 }}>
              {/* Provider-specific configuration */}
              {selectedIntegration.name === "Mailchimp" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Mailchimp integration settings below.
                  </Alert>
                  <TextField
                    label="API Key"
                    fullWidth
                    value={selectedIntegration.configuration.apiKey || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, apiKey: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your Mailchimp API key"
                    helperText="You can find your API key in your Mailchimp account settings"
                  />
                  <TextField
                    label="List ID"
                    fullWidth
                    value={selectedIntegration.configuration.listId || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, listId: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your default Mailchimp list ID"
                    helperText="The default list to sync contacts with"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Sync Frequency</InputLabel>
                    <Select
                      value={selectedIntegration.syncFrequency}
                      label="Sync Frequency"
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          syncFrequency: e.target.value as Integration['syncFrequency']
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                    >
                      <MenuItem value="Real-time">Real-time</MenuItem>
                      <MenuItem value="Hourly">Hourly</MenuItem>
                      <MenuItem value="Daily">Daily</MenuItem>
                      <MenuItem value="Weekly">Weekly</MenuItem>
                      <MenuItem value="Manual">Manual</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              )}

              {selectedIntegration.name === "Stripe" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Stripe payment processing settings.
                  </Alert>
                  <TextField
                    label="Publishable Key"
                    fullWidth
                    value={selectedIntegration.configuration.publicKey || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, publicKey: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="pk_live_..."
                    helperText="Your Stripe publishable key (safe to expose in frontend)"
                  />
                  <TextField
                    label="Secret Key"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.secretKey || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, secretKey: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="sk_live_..."
                    helperText="Your Stripe secret key (keep this secure)"
                  />
                  <TextField
                    label="Webhook Secret"
                    fullWidth
                    value={selectedIntegration.configuration.webhookSecret || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, webhookSecret: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="whsec_..."
                    helperText="Webhook endpoint secret for verification"
                  />
                </Stack>
              )}

              {selectedIntegration.name === "Google Drive" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Google Drive integration for document storage.
                  </Alert>
                  <TextField
                    label="Folder ID"
                    fullWidth
                    value={selectedIntegration.configuration.folderId || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, folderId: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    helperText="The Google Drive folder ID where documents will be stored"
                  />
                  <TextField
                    label="Service Account Email"
                    fullWidth
                    value={selectedIntegration.configuration.serviceAccountEmail || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, serviceAccountEmail: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="service-account@project.iam.gserviceaccount.com"
                    helperText="Google Service Account email for API access"
                  />
                </Stack>
              )}

              {selectedIntegration.name === "Slack" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Slack integration for team notifications.
                  </Alert>
                  <TextField
                    label="Bot Token"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.botToken || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, botToken: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="xoxb-..."
                    helperText="Your Slack bot token for sending messages"
                  />
                  <TextField
                    label="Default Channel"
                    fullWidth
                    value={selectedIntegration.configuration.defaultChannel || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, defaultChannel: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="#general"
                    helperText="Default channel for CRM notifications"
                  />
                </Stack>
              )}

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedIntegration.isActive}
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          isActive: e.target.checked
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                    />
                  }
                  label="Enable Integration"
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Select an integration type to add to your CRM system.
              </Alert>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Integration Type</InputLabel>
                <Select
                  value=""
                  label="Integration Type"
                  onChange={(e) => {
                    // Handle new integration selection
                    console.log('Selected integration:', e.target.value);
                  }}
                >
                  <MenuItem value="mailchimp">Mailchimp - Email Marketing</MenuItem>
                  <MenuItem value="stripe">Stripe - Payment Processing</MenuItem>
                  <MenuItem value="google-drive">Google Drive - Cloud Storage</MenuItem>
                  <MenuItem value="slack">Slack - Team Communication</MenuItem>
                  <MenuItem value="encharge">Encharge.io - Email Automation</MenuItem>
                  <MenuItem value="zapier">Zapier - Workflow Automation</MenuItem>
                  <MenuItem value="hubspot">HubSpot - CRM Integration</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIntegrationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedIntegration) {
                // Update existing integration
                setIntegrations(prev => prev.map(integration =>
                  integration.id === selectedIntegration.id ? selectedIntegration : integration
                ));
              }
              setOpenIntegrationDialog(false);
              setSelectedIntegration(null);
            }}
          >
            {selectedIntegration ? "Update Configuration" : "Add Integration"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWebhookDialog} onClose={() => setOpenWebhookDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Webhook Management</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Webhook management interface would include creation, testing, and monitoring capabilities.
          </Alert>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Events</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>{webhook.name}</TableCell>
                    <TableCell>{webhook.url}</TableCell>
                    <TableCell>{webhook.events.join(", ")}</TableCell>
                    <TableCell>
                      <Chip label={webhook.status} size="small" color={webhook.status === "Active" ? "success" : "error"} />
                    </TableCell>
                    <TableCell>
                      {((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><EditRoundedIcon /></IconButton>
                      <IconButton size="small"><DeleteRoundedIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWebhookDialog(false)}>Close</Button>
          <Button variant="contained">Add Webhook</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAPIKeyDialog} onClose={() => setOpenAPIKeyDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>API Key Management</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            API key management interface for creating, monitoring, and revoking access keys.
          </Alert>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Key</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>{apiKey.key}...</TableCell>
                    <TableCell>{apiKey.permissions.join(", ")}</TableCell>
                    <TableCell>
                      <Chip label={apiKey.status} size="small" color={apiKey.status === "Active" ? "success" : "error"} />
                    </TableCell>
                    <TableCell>{apiKey.usageCount.toLocaleString()}</TableCell>
                    <TableCell>
                      {apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><EditRoundedIcon /></IconButton>
                      <IconButton size="small"><DeleteRoundedIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAPIKeyDialog(false)}>Close</Button>
          <Button variant="contained">Generate API Key</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
