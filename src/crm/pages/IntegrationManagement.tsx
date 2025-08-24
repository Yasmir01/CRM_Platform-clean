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
  Snackbar,
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
import { TransUnionService } from "../services/TransUnionService";
import { useRoleManagement } from "../hooks/useRoleManagement";

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
    name: "TransUnion",
    description: "Credit reporting and background check services for tenant screening",
    category: "Finance",
    provider: "TransUnion",
    type: "API",
    status: TransUnionService.isConfigured() ? "Connected" : "Disconnected",
    isActive: TransUnionService.isConfigured(),
    lastSync: TransUnionService.isConfigured() ? "2024-01-18T09:30:00Z" : "Never",
    syncFrequency: "Manual",
    configuration: {
      apiKey: import.meta.env.VITE_TRANSUNION_API_KEY || "",
      environment: import.meta.env.VITE_TRANSUNION_ENV || "sandbox",
      baseUrl: import.meta.env.VITE_TRANSUNION_BASE_URL || ""
    },
    metrics: {
      totalRequests: TransUnionService.isConfigured() ? 45 : 0,
      successfulRequests: TransUnionService.isConfigured() ? 42 : 0,
      failedRequests: TransUnionService.isConfigured() ? 3 : 0,
      avgResponseTime: 1250,
      dataTransferred: 0.8,
      uptime: TransUnionService.isConfigured() ? 93.3 : 0
    },
    icon: "🔍",
    setupComplexity: "Advanced",
    pricing: "Per Report",
    features: ["Credit Reports", "Background Checks", "Identity Verification", "Criminal Records"],
    dateConnected: TransUnionService.isConfigured() ? "2024-01-01" : undefined,
    lastError: TransUnionService.isConfigured() ? undefined : "API credentials not configured"
  },
  {
    id: "6",
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
  const { isSuperAdmin } = useRoleManagement();
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
  const [newIntegrationType, setNewIntegrationType] = React.useState("");
  const [newIntegrationConfig, setNewIntegrationConfig] = React.useState<Record<string, any>>({});
  const [testingIntegrations, setTestingIntegrations] = React.useState<Set<string>>(new Set());
  const [syncingIntegrations, setSyncingIntegrations] = React.useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredIntegrations = integrations.filter(integration => {
    // Only show TransUnion to super admins
    if (integration.name === "TransUnion" && !isSuperAdmin()) {
      return false;
    }

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

  const handleTestIntegration = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    // Set loading state
    setTestingIntegrations(prev => new Set(prev).add(id));

    // Update integration status to show testing in progress
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: "Pending" as Integration['status'] } : i
    ));

    try {
      // Simulate API test call with different outcomes based on integration
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

      // Simulate different test results based on integration configuration
      let testResult: { success: boolean; message: string };

      if (integration.name === "Slack" && integration.lastError) {
        // Simulate fixing the error
        testResult = { success: true, message: "Connection restored! Webhook URL updated successfully." };
      } else if (!integration.configuration || Object.keys(integration.configuration).length === 0) {
        testResult = { success: false, message: "Missing configuration. Please configure the integration first." };
      } else if (integration.name === "Mailchimp" && !integration.configuration.apiKey) {
        testResult = { success: false, message: "Invalid API key. Please check your Mailchimp API credentials." };
      } else if (integration.name === "Stripe" && !integration.configuration.secretKey) {
        testResult = { success: false, message: "Missing secret key. Please add your Stripe secret key." };
      } else {
        // Successful test
        testResult = { success: true, message: "Connection successful! All systems operational." };
      }

      // Update integration based on test result
      const updatedIntegration: Partial<Integration> = {
        status: testResult.success ? "Connected" : "Error",
        lastSync: testResult.success ? new Date().toISOString() : integration.lastSync,
        lastError: testResult.success ? undefined : testResult.message,
        metrics: testResult.success ? {
          ...integration.metrics,
          totalRequests: integration.metrics.totalRequests + 1,
          successfulRequests: integration.metrics.successfulRequests + 1,
          uptime: Math.min(100, integration.metrics.uptime + 0.1)
        } : {
          ...integration.metrics,
          totalRequests: integration.metrics.totalRequests + 1,
          failedRequests: integration.metrics.failedRequests + 1,
          uptime: Math.max(0, integration.metrics.uptime - 1)
        }
      };

      setIntegrations(prev => prev.map(i =>
        i.id === id ? { ...i, ...updatedIntegration } : i
      ));

      // Show result to user
      showNotification(
        `Test ${testResult.success ? 'Successful' : 'Failed'}: ${testResult.message}`,
        testResult.success ? 'success' : 'error'
      );

    } catch (error) {
      // Handle test failure
      setIntegrations(prev => prev.map(i =>
        i.id === id ? {
          ...i,
          status: "Error" as Integration['status'],
          lastError: "Test connection failed due to network error."
        } : i
      ));
      showNotification(`Test Failed: Unable to connect to ${integration.name}. Please check your internet connection.`, 'error');
    } finally {
      // Clear loading state
      setTestingIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleSyncIntegration = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    if (integration.status !== "Connected") {
      showNotification("Cannot sync: Integration is not connected. Please test the connection first.", 'error');
      return;
    }

    // Set loading state
    setSyncingIntegrations(prev => new Set(prev).add(id));

    // Show sync in progress
    const originalSyncFreq = integration.syncFrequency;
    setIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, syncFrequency: "Syncing..." as Integration['syncFrequency'] } : i
    ));

    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay

      // Simulate data sync based on integration type
      let syncResult: { success: boolean; recordsProcessed: number; message: string };

      switch (integration.name) {
        case "Mailchimp":
          syncResult = {
            success: true,
            recordsProcessed: Math.floor(Math.random() * 50) + 25,
            message: "Contacts synchronized successfully with Mailchimp."
          };
          break;
        case "Stripe":
          syncResult = {
            success: true,
            recordsProcessed: Math.floor(Math.random() * 20) + 10,
            message: "Payment records synchronized with Stripe."
          };
          break;
        case "Google Drive":
          syncResult = {
            success: true,
            recordsProcessed: Math.floor(Math.random() * 15) + 5,
            message: "Documents backed up to Google Drive."
          };
          break;
        case "Encharge.io":
          syncResult = {
            success: true,
            recordsProcessed: Math.floor(Math.random() * 30) + 15,
            message: "Customer journey data synchronized with Encharge.io."
          };
          break;
        default:
          syncResult = {
            success: true,
            recordsProcessed: Math.floor(Math.random() * 25) + 10,
            message: `Data synchronized successfully with ${integration.name}.`
          };
      }

      // Update integration with sync results
      const updatedMetrics = {
        ...integration.metrics,
        totalRequests: integration.metrics.totalRequests + syncResult.recordsProcessed,
        successfulRequests: integration.metrics.successfulRequests + syncResult.recordsProcessed,
        dataTransferred: integration.metrics.dataTransferred + (syncResult.recordsProcessed * 0.1),
        uptime: Math.min(100, integration.metrics.uptime + 0.2)
      };

      setIntegrations(prev => prev.map(i =>
        i.id === id ? {
          ...i,
          lastSync: new Date().toISOString(),
          syncFrequency: originalSyncFreq,
          metrics: updatedMetrics,
          lastError: undefined
        } : i
      ));

      showNotification(`Sync Completed! ${syncResult.message} Records processed: ${syncResult.recordsProcessed}`, 'success');

    } catch (error) {
      // Handle sync failure
      setIntegrations(prev => prev.map(i =>
        i.id === id ? {
          ...i,
          syncFrequency: originalSyncFreq,
          lastError: "Sync failed due to network error."
        } : i
      ));
      showNotification(`Sync Failed: Unable to synchronize with ${integration.name}. Please try again later.`, 'error');
    } finally {
      // Clear loading state
      setSyncingIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
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

                  {/* Status Messages */}
                  {testingIntegrations.has(integration.id) && (
                    <Alert severity="info" size="small">
                      Testing connection to {integration.name}...
                    </Alert>
                  )}
                  {syncingIntegrations.has(integration.id) && (
                    <Alert severity="info" size="small">
                      Synchronizing data with {integration.name}...
                    </Alert>
                  )}
                  {integration.status === "Error" && integration.lastError && !testingIntegrations.has(integration.id) && !syncingIntegrations.has(integration.id) && (
                    <Alert severity="error" size="small">
                      {integration.lastError}
                    </Alert>
                  )}
                  {integration.status === "Connected" && !integration.lastError && !testingIntegrations.has(integration.id) && !syncingIntegrations.has(integration.id) && integration.lastSync && (
                    <Alert severity="success" size="small">
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
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
                    <Tooltip title={testingIntegrations.has(integration.id) ? "Testing connection..." : "Test Connection"}>
                      <IconButton
                        size="small"
                        disabled={testingIntegrations.has(integration.id) || syncingIntegrations.has(integration.id)}
                        onClick={() => handleTestIntegration(integration.id)}
                        sx={{
                          ...(testingIntegrations.has(integration.id) && {
                            animation: 'pulse 1s infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.5 },
                              '100%': { opacity: 1 }
                            }
                          })
                        }}
                      >
                        {testingIntegrations.has(integration.id) ? <RefreshRoundedIcon /> : <BugReportRoundedIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={syncingIntegrations.has(integration.id) ? "Syncing data..." : "Sync Now"}>
                      <IconButton
                        size="small"
                        disabled={testingIntegrations.has(integration.id) || syncingIntegrations.has(integration.id) || integration.status !== "Connected"}
                        onClick={() => handleSyncIntegration(integration.id)}
                        sx={{
                          ...(syncingIntegrations.has(integration.id) && {
                            animation: 'spin 2s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            }
                          })
                        }}
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

              {selectedIntegration.name === "TransUnion" && (
                <Stack spacing={3}>
                  <Alert severity="warning">
                    <strong>Super Admin Only:</strong> TransUnion integration provides credit reporting and background check services for tenant screening. This integration requires special API credentials and handles sensitive financial data.
                  </Alert>
                  <Alert severity="info">
                    Configure your TransUnion API credentials. These settings are stored securely and only accessible to super administrators.
                  </Alert>
                  <TextField
                    label="API Key"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.apiKey || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, apiKey: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your TransUnion API key"
                    helperText="Your TransUnion API key provided by TransUnion for credit reporting services"
                  />
                  <TextField
                    label="API Secret"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.apiSecret || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, apiSecret: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your TransUnion API secret"
                    helperText="Your TransUnion API secret - keep this secure and never share it"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Environment</InputLabel>
                    <Select
                      value={selectedIntegration.configuration.environment || "sandbox"}
                      label="Environment"
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          configuration: { ...selectedIntegration.configuration, environment: e.target.value }
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                    >
                      <MenuItem value="sandbox">Sandbox (Testing)</MenuItem>
                      <MenuItem value="production">Production (Live)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Base URL"
                    fullWidth
                    value={selectedIntegration.configuration.baseUrl || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, baseUrl: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="https://api.transunion.com"
                    helperText="TransUnion API base URL (use sandbox URL for testing)"
                  />
                  <Alert severity="warning">
                    <strong>Important:</strong> In production, API credentials should be stored on your secure backend server, not in the frontend application. This configuration is for development and testing purposes.
                  </Alert>
                </Stack>
              )}

              {selectedIntegration.name === "Encharge.io" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Encharge.io integration for advanced email automation.
                  </Alert>
                  <TextField
                    label="API Key"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.apiKey || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, apiKey: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your Encharge.io API key"
                    helperText="You can find your API key in your Encharge.io account settings under API & Webhooks"
                  />
                  <TextField
                    label="Account ID"
                    fullWidth
                    value={selectedIntegration.configuration.accountId || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, accountId: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your Encharge.io account ID"
                    helperText="Your unique Encharge.io account identifier"
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
                  value={newIntegrationType}
                  label="Integration Type"
                  onChange={(e) => {
                    setNewIntegrationType(e.target.value);
                    setNewIntegrationConfig({});
                  }}
                >
                  <MenuItem value="mailchimp">Mailchimp - Email Marketing</MenuItem>
                  <MenuItem value="stripe">Stripe - Payment Processing</MenuItem>
                  <MenuItem value="google-drive">Google Drive - Cloud Storage</MenuItem>
                  <MenuItem value="slack">Slack - Team Communication</MenuItem>
                  <MenuItem value="encharge">Encharge.io - Email Automation</MenuItem>
                  <MenuItem value="zapier">Zapier - Workflow Automation</MenuItem>
                  <MenuItem value="hubspot">HubSpot - CRM Integration</MenuItem>
                  <MenuItem value="gmail">Gmail - Email Provider</MenuItem>
                  <MenuItem value="outlook">Microsoft Outlook - Email Provider</MenuItem>
                  <MenuItem value="yahoo">Yahoo Mail - Email Provider</MenuItem>
                  <MenuItem value="hotmail">Hotmail/Live - Email Provider</MenuItem>
                  <MenuItem value="custom-smtp">Custom SMTP - Email Provider</MenuItem>
                  {isSuperAdmin() && (
                    <MenuItem value="transunion">TransUnion - Credit Reports & Background Checks</MenuItem>
                  )}
                </Select>
              </FormControl>

              {newIntegrationType && (
                <Box sx={{ mt: 3, p: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Configuration for {newIntegrationType.charAt(0).toUpperCase() + newIntegrationType.slice(1)}
                  </Typography>

                  {newIntegrationType === "mailchimp" && (
                    <Stack spacing={2}>
                      <TextField
                        label="API Key"
                        fullWidth
                        value={newIntegrationConfig.apiKey || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, apiKey: e.target.value}))}
                        placeholder="Enter your Mailchimp API key"
                        helperText="Find your API key in Mailchimp account settings"
                      />
                      <TextField
                        label="List ID"
                        fullWidth
                        value={newIntegrationConfig.listId || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, listId: e.target.value}))}
                        placeholder="Enter your default list ID"
                      />
                    </Stack>
                  )}

                  {newIntegrationType === "stripe" && (
                    <Stack spacing={2}>
                      <TextField
                        label="Publishable Key"
                        fullWidth
                        value={newIntegrationConfig.publicKey || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, publicKey: e.target.value}))}
                        placeholder="pk_live_..."
                      />
                      <TextField
                        label="Secret Key"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.secretKey || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, secretKey: e.target.value}))}
                        placeholder="sk_live_..."
                      />
                    </Stack>
                  )}

                  {newIntegrationType === "encharge" && (
                    <Stack spacing={2}>
                      <TextField
                        label="API Key"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.apiKey || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, apiKey: e.target.value}))}
                        placeholder="Enter your Encharge.io API key"
                      />
                      <TextField
                        label="Account ID"
                        fullWidth
                        value={newIntegrationConfig.accountId || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, accountId: e.target.value}))}
                        placeholder="Enter your account ID"
                      />
                    </Stack>
                  )}

                  {newIntegrationType === "transunion" && (
                    <Stack spacing={2}>
                      <Alert severity="warning">
                        <strong>Super Admin Only:</strong> This integration handles sensitive financial data and requires special credentials.
                      </Alert>
                      <TextField
                        label="API Key"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.apiKey || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, apiKey: e.target.value}))}
                        placeholder="Enter your TransUnion API key"
                      />
                      <TextField
                        label="API Secret"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.apiSecret || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({...prev, apiSecret: e.target.value}))}
                        placeholder="Enter your TransUnion API secret"
                      />
                      <FormControl fullWidth>
                        <InputLabel>Environment</InputLabel>
                        <Select
                          value={newIntegrationConfig.environment || "sandbox"}
                          onChange={(e) => setNewIntegrationConfig(prev => ({...prev, environment: e.target.value}))}
                        >
                          <MenuItem value="sandbox">Sandbox (Testing)</MenuItem>
                          <MenuItem value="production">Production (Live)</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  )}

                  {(newIntegrationType === "slack" || newIntegrationType === "google-drive" || newIntegrationType === "zapier" || newIntegrationType === "hubspot") && (
                    <Alert severity="info">
                      This integration requires OAuth authentication. Click "Add Integration" to begin the OAuth flow.
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIntegrationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedIntegration && !newIntegrationType}
            onClick={() => {
              if (selectedIntegration) {
                // Update existing integration
                if (selectedIntegration.name === "TransUnion") {
                  // Update TransUnion service configuration
                  TransUnionService.initialize({
                    apiKey: selectedIntegration.configuration.apiKey,
                    apiSecret: selectedIntegration.configuration.apiSecret,
                    environment: selectedIntegration.configuration.environment,
                    baseUrl: selectedIntegration.configuration.baseUrl
                  });

                  // Update integration status based on configuration
                  const updatedIntegration = {
                    ...selectedIntegration,
                    status: TransUnionService.isConfigured() ? "Connected" : "Disconnected" as Integration['status'],
                    isActive: TransUnionService.isConfigured()
                  };
                  setSelectedIntegration(updatedIntegration);
                  setIntegrations(prev => prev.map(integration =>
                    integration.id === updatedIntegration.id ? updatedIntegration : integration
                  ));
                  showNotification(
                    TransUnionService.isConfigured()
                      ? "TransUnion integration updated and connected successfully!"
                      : "TransUnion configuration saved. Please verify your credentials.",
                    TransUnionService.isConfigured() ? 'success' : 'info'
                  );
                } else {
                  setIntegrations(prev => prev.map(integration =>
                    integration.id === selectedIntegration.id ? selectedIntegration : integration
                  ));
                }
              } else if (newIntegrationType) {
                // Add new integration
                const newId = (integrations.length + 1).toString();

                const integrationTemplates: Record<string, Partial<Integration>> = {
                  mailchimp: {
                    name: "Mailchimp",
                    description: "Email marketing and automation platform",
                    category: "Email",
                    provider: "Mailchimp",
                    type: "API",
                    icon: "📧",
                    setupComplexity: "Easy",
                    pricing: "$10/month",
                    features: ["Email Campaigns", "Automation", "Analytics", "Segmentation"]
                  },
                  stripe: {
                    name: "Stripe",
                    description: "Payment processing and billing",
                    category: "Payments",
                    provider: "Stripe",
                    type: "API",
                    icon: "💳",
                    setupComplexity: "Medium",
                    pricing: "2.9% + 30¢",
                    features: ["Payment Processing", "Subscriptions", "Invoicing", "Reporting"]
                  },
                  encharge: {
                    name: "Encharge.io",
                    description: "Email marketing automation and customer lifecycle management",
                    category: "Email",
                    provider: "Encharge",
                    type: "API",
                    icon: "📧",
                    setupComplexity: "Medium",
                    pricing: "$49/month",
                    features: ["Email Automation", "Customer Journey", "Segmentation", "Analytics", "A/B Testing"]
                  },
                  slack: {
                    name: "Slack",
                    description: "Team communication and notifications",
                    category: "Communication",
                    provider: "Slack",
                    type: "Webhook",
                    icon: "💬",
                    setupComplexity: "Easy",
                    pricing: "Free",
                    features: ["Notifications", "Alerts", "Team Updates", "Channel Integration"]
                  },
                  transunion: {
                    name: "TransUnion",
                    description: "Credit reporting and background check services for tenant screening",
                    category: "Finance",
                    provider: "TransUnion",
                    type: "API",
                    icon: "🔍",
                    setupComplexity: "Advanced",
                    pricing: "Per Report",
                    features: ["Credit Reports", "Background Checks", "Identity Verification", "Criminal Records"]
                  },
                  gmail: {
                    name: "Gmail",
                    description: "Google Gmail email integration for sending and receiving emails",
                    category: "Email",
                    provider: "Google",
                    type: "OAuth",
                    icon: "📧",
                    setupComplexity: "Medium",
                    pricing: "Free",
                    features: ["Email Sending", "Email Receiving", "SMTP/IMAP", "OAuth Authentication"]
                  },
                  outlook: {
                    name: "Outlook",
                    description: "Microsoft Outlook email integration with Office 365 support",
                    category: "Email",
                    provider: "Microsoft",
                    type: "OAuth",
                    icon: "📮",
                    setupComplexity: "Medium",
                    pricing: "Free",
                    features: ["Email Sending", "Email Receiving", "Exchange Integration", "OAuth Authentication"]
                  },
                  yahoo: {
                    name: "Yahoo Mail",
                    description: "Yahoo Mail email integration with app password authentication",
                    category: "Email",
                    provider: "Yahoo",
                    type: "API",
                    icon: "📬",
                    setupComplexity: "Easy",
                    pricing: "Free",
                    features: ["Email Sending", "Email Receiving", "SMTP/IMAP", "App Password Auth"]
                  },
                  hotmail: {
                    name: "Hotmail/Live",
                    description: "Microsoft Hotmail/Live email integration",
                    category: "Email",
                    provider: "Microsoft",
                    type: "API",
                    icon: "📫",
                    setupComplexity: "Easy",
                    pricing: "Free",
                    features: ["Email Sending", "Email Receiving", "SMTP/IMAP", "Password Authentication"]
                  },
                  "custom-smtp": {
                    name: "Custom SMTP",
                    description: "Custom SMTP server configuration for any email provider",
                    category: "Email",
                    provider: "Custom",
                    type: "API",
                    icon: "⚙️",
                    setupComplexity: "Advanced",
                    pricing: "Varies",
                    features: ["Email Sending", "Custom SMTP", "IMAP Support", "Flexible Configuration"]
                  }
                };

                const template = integrationTemplates[newIntegrationType] || {
                  name: newIntegrationType.charAt(0).toUpperCase() + newIntegrationType.slice(1),
                  description: "Custom integration",
                  category: "CRM",
                  provider: newIntegrationType,
                  type: "API",
                  icon: "🔗",
                  setupComplexity: "Medium",
                  pricing: "Custom",
                  features: ["Custom Integration"]
                };

                const newIntegration: Integration = {
                  id: newId,
                  ...template,
                  status: "Connected",
                  isActive: true,
                  lastSync: new Date().toISOString(),
                  syncFrequency: "Hourly",
                  configuration: newIntegrationConfig,
                  metrics: {
                    totalRequests: 0,
                    successfulRequests: 0,
                    failedRequests: 0,
                    avgResponseTime: 0,
                    dataTransferred: 0,
                    uptime: 100
                  },
                  dateConnected: new Date().toISOString().split('T')[0]
                } as Integration;

                setIntegrations(prev => [...prev, newIntegration]);
                alert(`${template.name} integration added successfully!`);
              }
              setOpenIntegrationDialog(false);
              setSelectedIntegration(null);
              setNewIntegrationType("");
              setNewIntegrationConfig({});
            }}
          >
            {selectedIntegration ? "Update Configuration" : "Add Integration"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWebhookDialog} onClose={() => setOpenWebhookDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Webhook Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                const newWebhook: Webhook = {
                  id: (webhooks.length + 1).toString(),
                  name: "New Webhook",
                  url: "",
                  events: [],
                  status: "Inactive",
                  secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
                  lastTriggered: "Never",
                  successCount: 0,
                  failureCount: 0,
                  headers: { "Content-Type": "application/json" }
                };
                setWebhooks(prev => [...prev, newWebhook]);
              }}
            >
              Add Webhook
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Manage your webhook endpoints for real-time event notifications. Webhooks allow external systems to receive instant updates when events occur in your CRM.
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
                      <Tooltip title="Test Webhook">
                        <IconButton
                          size="small"
                          onClick={() => {
                            console.log(`Testing webhook ${webhook.id}...`);
                            // Simulate webhook test
                            alert(`Testing webhook: ${webhook.name}\nSending test payload to: ${webhook.url}`);
                          }}
                        >
                          <PlayArrowRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Webhook">
                        <IconButton
                          size="small"
                          onClick={() => {
                            const newName = prompt("Enter webhook name:", webhook.name);
                            const newUrl = prompt("Enter webhook URL:", webhook.url);
                            if (newName && newUrl) {
                              setWebhooks(prev => prev.map(w =>
                                w.id === webhook.id
                                  ? { ...w, name: newName, url: newUrl }
                                  : w
                              ));
                            }
                          }}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Webhook">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete webhook "${webhook.name}"?`)) {
                              setWebhooks(prev => prev.filter(w => w.id !== webhook.id));
                            }
                          }}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Tooltip>
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
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">API Key Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                const newKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
                const newAPIKey: APIKey = {
                  id: (apiKeys.length + 1).toString(),
                  name: "New API Key",
                  key: newKey,
                  permissions: ["read"],
                  status: "Active",
                  usageCount: 0,
                  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                  createdAt: new Date().toISOString()
                };
                setAPIKeys(prev => [...prev, newAPIKey]);
                alert(`New API Key generated:\n${newKey}\n\nPlease copy this key now as it won't be shown again!`);
              }}
            >
              Generate API Key
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Manage your API keys for secure access to CRM data. Keep your keys secure and rotate them regularly.
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
                      <Tooltip title="Edit API Key">
                        <IconButton
                          size="small"
                          onClick={() => {
                            const newName = prompt("Enter API key name:", apiKey.name);
                            if (newName) {
                              setAPIKeys(prev => prev.map(key =>
                                key.id === apiKey.id
                                  ? { ...key, name: newName }
                                  : key
                              ));
                            }
                          }}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Revoke API Key">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (confirm(`Are you sure you want to revoke API key "${apiKey.name}"?\nThis action cannot be undone.`)) {
                              setAPIKeys(prev => prev.map(key =>
                                key.id === apiKey.id
                                  ? { ...key, status: "Revoked" as APIKey['status'] }
                                  : key
                              ));
                            }
                          }}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy API Key">
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey.key).then(() => {
                              alert('API key copied to clipboard!');
                            }).catch(() => {
                              alert(`API Key: ${apiKey.key}`);
                            });
                          }}
                        >
                          <LinkRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAPIKeyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
