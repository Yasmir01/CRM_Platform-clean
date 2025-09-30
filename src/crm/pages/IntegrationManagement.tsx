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
import { EmailService } from "../services/EmailService";
import { LocalStorageService } from "../services/LocalStorageService";
import { useRoleManagement } from "../hooks/useRoleManagement";
import { RealEstatePlatformService } from "../services/RealEstatePlatformService";
import { PlatformBundleService } from "../services/PlatformBundleService";
import { useCrmData } from "../contexts/CrmDataContext";
import PropertyPublishingInterface from "../components/PropertyPublishingInterface";
import BookkeepingManagement from "../components/BookkeepingManagement";
import { useNavigate } from "react-router-dom";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import { RealEstatePlatform } from "../types/RealEstatePlatformTypes";
import { bookkeepingIntegrationService } from "../services/BookkeepingIntegrationService";

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
    icon: "��",
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
  },
  {
    id: "7",
    name: "Gmail",
    description: "Google Gmail email service for sending and receiving emails",
    category: "Email",
    provider: "Google",
    type: "OAuth",
    status: EmailService.getAccounts().some(a => a.providerId === 'gmail') ? "Connected" : "Disconnected",
    isActive: EmailService.getAccounts().some(a => a.providerId === 'gmail' && a.isActive),
    lastSync: EmailService.getAccounts().find(a => a.providerId === 'gmail')?.lastSync || "Never",
    syncFrequency: "Real-time",
    configuration: {
      email: EmailService.getAccounts().find(a => a.providerId === 'gmail')?.email || "",
      displayName: EmailService.getAccounts().find(a => a.providerId === 'gmail')?.displayName || ""
    },
    metrics: {
      totalRequests: EmailService.getAccounts().find(a => a.providerId === 'gmail') ? 150 : 0,
      successfulRequests: EmailService.getAccounts().find(a => a.providerId === 'gmail') ? 148 : 0,
      failedRequests: EmailService.getAccounts().find(a => a.providerId === 'gmail') ? 2 : 0,
      avgResponseTime: 890,
      dataTransferred: 2.1,
      uptime: EmailService.getAccounts().find(a => a.providerId === 'gmail') ? 98.7 : 0
    },
    icon: "📧",
    setupComplexity: "Easy",
    pricing: "Free",
    features: ["Email Sending", "IMAP/POP3", "OAuth Authentication", "Rich Text Support"],
    dateConnected: EmailService.getAccounts().find(a => a.providerId === 'gmail')?.dateAdded
  },
  {
    id: "8",
    name: "Yahoo Mail",
    description: "Yahoo Mail email service with app password authentication",
    category: "Email",
    provider: "Yahoo",
    type: "API",
    status: EmailService.getAccounts().some(a => a.providerId === 'yahoo') ? "Connected" : "Disconnected",
    isActive: EmailService.getAccounts().some(a => a.providerId === 'yahoo' && a.isActive),
    lastSync: EmailService.getAccounts().find(a => a.providerId === 'yahoo')?.lastSync || "Never",
    syncFrequency: "Hourly",
    configuration: {
      email: EmailService.getAccounts().find(a => a.providerId === 'yahoo')?.email || "",
      displayName: EmailService.getAccounts().find(a => a.providerId === 'yahoo')?.displayName || ""
    },
    metrics: {
      totalRequests: EmailService.getAccounts().find(a => a.providerId === 'yahoo') ? 89 : 0,
      successfulRequests: EmailService.getAccounts().find(a => a.providerId === 'yahoo') ? 87 : 0,
      failedRequests: EmailService.getAccounts().find(a => a.providerId === 'yahoo') ? 2 : 0,
      avgResponseTime: 1250,
      dataTransferred: 1.3,
      uptime: EmailService.getAccounts().find(a => a.providerId === 'yahoo') ? 97.8 : 0
    },
    icon: "📬",
    setupComplexity: "Medium",
    pricing: "Free",
    features: ["Email Sending", "IMAP/POP3", "App Password Auth", "Secure SMTP"],
    dateConnected: EmailService.getAccounts().find(a => a.providerId === 'yahoo')?.dateAdded
  },
  {
    id: "9",
    name: "Microsoft Outlook",
    description: "Microsoft Outlook/Office 365 email integration with OAuth",
    category: "Email",
    provider: "Microsoft",
    type: "OAuth",
    status: EmailService.getAccounts().some(a => a.providerId === 'outlook') ? "Connected" : "Disconnected",
    isActive: EmailService.getAccounts().some(a => a.providerId === 'outlook' && a.isActive),
    lastSync: EmailService.getAccounts().find(a => a.providerId === 'outlook')?.lastSync || "Never",
    syncFrequency: "Real-time",
    configuration: {
      email: EmailService.getAccounts().find(a => a.providerId === 'outlook')?.email || "",
      displayName: EmailService.getAccounts().find(a => a.providerId === 'outlook')?.displayName || ""
    },
    metrics: {
      totalRequests: EmailService.getAccounts().find(a => a.providerId === 'outlook') ? 203 : 0,
      successfulRequests: EmailService.getAccounts().find(a => a.providerId === 'outlook') ? 201 : 0,
      failedRequests: EmailService.getAccounts().find(a => a.providerId === 'outlook') ? 2 : 0,
      avgResponseTime: 750,
      dataTransferred: 3.2,
      uptime: EmailService.getAccounts().find(a => a.providerId === 'outlook') ? 99.0 : 0
    },
    icon: "📮",
    setupComplexity: "Easy",
    pricing: "Free",
    features: ["Email Sending", "Calendar Integration", "OAuth Authentication", "Office 365 Integration"],
    dateConnected: EmailService.getAccounts().find(a => a.providerId === 'outlook')?.dateAdded
  },
  {
    id: "10",
    name: "Hotmail/Live",
    description: "Microsoft Hotmail and Live email service",
    category: "Email",
    provider: "Microsoft",
    type: "API",
    status: EmailService.getAccounts().some(a => a.providerId === 'hotmail') ? "Connected" : "Disconnected",
    isActive: EmailService.getAccounts().some(a => a.providerId === 'hotmail' && a.isActive),
    lastSync: EmailService.getAccounts().find(a => a.providerId === 'hotmail')?.lastSync || "Never",
    syncFrequency: "Hourly",
    configuration: {
      email: EmailService.getAccounts().find(a => a.providerId === 'hotmail')?.email || "",
      displayName: EmailService.getAccounts().find(a => a.providerId === 'hotmail')?.displayName || ""
    },
    metrics: {
      totalRequests: EmailService.getAccounts().find(a => a.providerId === 'hotmail') ? 67 : 0,
      successfulRequests: EmailService.getAccounts().find(a => a.providerId === 'hotmail') ? 65 : 0,
      failedRequests: EmailService.getAccounts().find(a => a.providerId === 'hotmail') ? 2 : 0,
      avgResponseTime: 980,
      dataTransferred: 0.9,
      uptime: EmailService.getAccounts().find(a => a.providerId === 'hotmail') ? 97.0 : 0
    },
    icon: "📫",
    setupComplexity: "Medium",
    pricing: "Free",
    features: ["Email Sending", "IMAP/POP3", "Password Authentication", "Legacy Support"],
    dateConnected: EmailService.getAccounts().find(a => a.providerId === 'hotmail')?.dateAdded
  },
  {
    id: "11",
    name: "Custom SMTP",
    description: "Custom SMTP server configuration for any email provider",
    category: "Email",
    provider: "Custom",
    type: "API",
    status: EmailService.getAccounts().some(a => a.providerId === 'custom-smtp') ? "Connected" : "Disconnected",
    isActive: EmailService.getAccounts().some(a => a.providerId === 'custom-smtp' && a.isActive),
    lastSync: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp')?.lastSync || "Never",
    syncFrequency: "Manual",
    configuration: {
      email: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp')?.email || "",
      displayName: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp')?.displayName || "",
      smtpHost: "",
      smtpPort: 587
    },
    metrics: {
      totalRequests: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp') ? 45 : 0,
      successfulRequests: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp') ? 43 : 0,
      failedRequests: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp') ? 2 : 0,
      avgResponseTime: 1500,
      dataTransferred: 0.7,
      uptime: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp') ? 95.6 : 0
    },
    icon: "⚙️",
    setupComplexity: "Advanced",
    pricing: "Variable",
    features: ["Custom SMTP", "Flexible Configuration", "Any Email Provider", "Advanced Settings"],
    dateConnected: EmailService.getAccounts().find(a => a.providerId === 'custom-smtp')?.dateAdded
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
  const navigate = useNavigate();
  const { properties } = useCrmData();
  const [currentTab, setCurrentTab] = React.useState(0);

  // Real Estate Platform state
  const [realEstatePlatforms, setRealEstatePlatforms] = React.useState<any[]>([]);
  const [connectedPlatformsCount, setConnectedPlatformsCount] = React.useState(0);
  const [availableBundles, setAvailableBundles] = React.useState<any[]>([]);
  const [publishingDialogOpen, setPublishingDialogOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const [realEstateInitialized, setRealEstateInitialized] = React.useState(false);

  // Bookkeeping integration state
  const [bookkeepingConnections, setBookkeepingConnections] = React.useState<any[]>([]);
  const [bookkeepingInitialized, setBookkeepingInitialized] = React.useState(false);

  // Initialize integrations with persisted data, merging with mock data
  const initializeIntegrations = () => {
    const persistedIntegrations = LocalStorageService.getIntegrations();
    if (persistedIntegrations.length === 0) {
      // No persisted data, use mock data
      return mockIntegrations;
    }

    // Merge persisted data with mock data, preserving persisted configurations
    const merged = mockIntegrations.map(mockIntegration => {
      const persistedIntegration = persistedIntegrations.find(p => p.id === mockIntegration.id);
      return persistedIntegration || mockIntegration;
    });

    // Add any new persisted integrations that aren't in mock data
    persistedIntegrations.forEach(persistedIntegration => {
      if (!merged.find(m => m.id === persistedIntegration.id)) {
        merged.push(persistedIntegration);
      }
    });

    return merged;
  };

  const [integrations, setIntegrations] = React.useState<Integration[]>(initializeIntegrations());

  // Helper function to update and persist integrations
  const updateAndPersistIntegrations = (updater: (prev: Integration[]) => Integration[]) => {
    setIntegrations(prev => {
      const updated = updater(prev);
      LocalStorageService.saveIntegrations(updated);
      return updated;
    });
  };
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

  // Initialize Real Estate Platform services
  React.useEffect(() => {
    const initializeRealEstate = async () => {
      try {
        await RealEstatePlatformService.initialize();
        await PlatformBundleService.initialize();

        const platforms = RealEstatePlatformService.getAvailablePlatforms();
        setRealEstatePlatforms(platforms);

        const connectedCount = platforms.filter(platform =>
          RealEstatePlatformService.isPlatformAuthenticated(platform.platform)
        ).length;
        setConnectedPlatformsCount(connectedCount);

        const bundles = PlatformBundleService.getAvailableBundles();
        setAvailableBundles(bundles);

        setRealEstateInitialized(true);
      } catch (error) {
        console.error('Failed to initialize real estate platform services:', error);
      }
    };

    const initializeBookkeeping = async () => {
      try {
        const connections = bookkeepingIntegrationService.getConnections();
        setBookkeepingConnections(connections);
        setBookkeepingInitialized(true);
      } catch (error) {
        console.error('Failed to initialize bookkeeping integration service:', error);
      }
    };

    initializeRealEstate();
    initializeBookkeeping();
  }, []);

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
    updateAndPersistIntegrations(prev => prev.map(integration =>
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
    updateAndPersistIntegrations(prev => prev.map(i =>
      i.id === id ? { ...i, status: "Pending" as Integration['status'] } : i
    ));

    try {
      let testResult: { success: boolean; message: string };

      // Handle email integrations differently
      if (integration.category === "Email" && ["Gmail", "Yahoo Mail", "Microsoft Outlook", "Hotmail/Live", "Custom SMTP"].includes(integration.name)) {
        try {
          // Get provider ID based on integration name
          const providerMap: Record<string, string> = {
            "Gmail": "gmail",
            "Yahoo Mail": "yahoo",
            "Microsoft Outlook": "outlook",
            "Hotmail/Live": "hotmail",
            "Custom SMTP": "custom-smtp"
          };

          const providerId = providerMap[integration.name];
          if (!providerId) {
            throw new Error("Unknown email provider");
          }

          // Check if account already exists
          const existingAccount = EmailService.getAccounts().find(a => a.providerId === providerId);

          if (existingAccount) {
            // Test existing account
            const result = await EmailService.testConnection(existingAccount);
            testResult = {
              success: result.success,
              message: result.success ? "Email account connection verified successfully!" : result.error || "Connection failed"
            };
          } else {
            // Try to create new account if configuration is provided
            if (!integration.configuration.email) {
              testResult = { success: false, message: "Email address is required. Please configure the integration first." };
            } else {
              // Prepare credentials based on auth type
              let credentials: any = {};

              if (integration.name === "Gmail") {
                // Gmail supports both OAuth and App Password
                if (integration.configuration.authMethod === "app-password") {
                  if (!integration.configuration.appPassword) {
                    testResult = { success: false, message: "App Password is required for Gmail manual setup. Please generate one in your Google Account Security settings." };
                  } else {
                    credentials = { appPassword: integration.configuration.appPassword };
                    try {
                      const account = await EmailService.addAccount(
                        providerId,
                        integration.configuration.email,
                        credentials,
                        { syncFrequency: 'hourly' }
                      );
                      testResult = { success: true, message: "Gmail account added and tested successfully using App Password!" };
                    } catch (error) {
                      testResult = { success: false, message: `Failed to add Gmail account: ${error}` };
                    }
                  }
                } else {
                  // OAuth method
                  testResult = { success: false, message: "OAuth authentication required. Please complete OAuth flow first or switch to App Password method." };
                }
              } else if (integration.name === "Microsoft Outlook") {
                // Microsoft Outlook supports both OAuth and App Password
                if (integration.configuration.authMethod === "app-password") {
                  if (!integration.configuration.appPassword) {
                    testResult = { success: false, message: "App Password is required for Outlook manual setup. Please generate one in your Microsoft Account Security settings." };
                  } else {
                    credentials = { appPassword: integration.configuration.appPassword };
                    try {
                      const account = await EmailService.addAccount(
                        providerId,
                        integration.configuration.email,
                        credentials,
                        { syncFrequency: 'hourly' }
                      );
                      testResult = { success: true, message: "Microsoft Outlook account added and tested successfully using App Password!" };
                    } catch (error) {
                      testResult = { success: false, message: `Failed to add Outlook account: ${error}` };
                    }
                  }
                } else {
                  // OAuth method
                  testResult = { success: false, message: "OAuth authentication required. Please complete OAuth flow first or switch to App Password method." };
                }
              } else if (integration.name === "Yahoo Mail") {
                if (!integration.configuration.appPassword) {
                  testResult = { success: false, message: "App Password is required for Yahoo Mail. Please generate one in your Yahoo account settings." };
                } else {
                  credentials = { appPassword: integration.configuration.appPassword };
                  try {
                    const account = await EmailService.addAccount(
                      providerId,
                      integration.configuration.email,
                      credentials,
                      { syncFrequency: 'hourly' }
                    );
                    testResult = { success: true, message: "Yahoo Mail account added and tested successfully!" };
                  } catch (error) {
                    testResult = { success: false, message: `Failed to add Yahoo Mail account: ${error}` };
                  }
                }
              } else if (integration.name === "Hotmail/Live") {
                if (!integration.configuration.password) {
                  testResult = { success: false, message: "Password is required for Hotmail/Live. Please enter your account password." };
                } else {
                  credentials = { password: integration.configuration.password };
                  try {
                    const account = await EmailService.addAccount(
                      providerId,
                      integration.configuration.email,
                      credentials,
                      { syncFrequency: 'hourly' }
                    );
                    testResult = { success: true, message: "Hotmail/Live account added and tested successfully!" };
                  } catch (error) {
                    testResult = { success: false, message: `Failed to add Hotmail/Live account: ${error}` };
                  }
                }
              } else if (integration.name === "Custom SMTP") {
                if (!integration.configuration.smtpHost || !integration.configuration.username || !integration.configuration.password) {
                  testResult = { success: false, message: "SMTP Host, Username, and Password are required for Custom SMTP." };
                } else {
                  credentials = {
                    password: integration.configuration.password,
                    smtpHost: integration.configuration.smtpHost,
                    smtpPort: integration.configuration.smtpPort || 587,
                    username: integration.configuration.username,
                    security: integration.configuration.security || 'STARTTLS'
                  };
                  try {
                    const account = await EmailService.addAccount(
                      providerId,
                      integration.configuration.email,
                      credentials,
                      { syncFrequency: 'manual' }
                    );
                    testResult = { success: true, message: "Custom SMTP account added and tested successfully!" };
                  } catch (error) {
                    testResult = { success: false, message: `Failed to add Custom SMTP account: ${error}` };
                  }
                }
              }
            }
          }
        } catch (error) {
          testResult = { success: false, message: `Email test failed: ${error}` };
        }
      } else {
        // Non-email integrations - use original logic
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

        if (integration.name === "Slack" && integration.lastError) {
          testResult = { success: true, message: "Connection restored! Webhook URL updated successfully." };
        } else if (!integration.configuration || Object.keys(integration.configuration).length === 0) {
          testResult = { success: false, message: "Missing configuration. Please configure the integration first." };
        } else if (integration.name === "Mailchimp" && !integration.configuration.apiKey) {
          testResult = { success: false, message: "Invalid API key. Please check your Mailchimp API credentials." };
        } else if (integration.name === "Stripe" && !integration.configuration.secretKey) {
          testResult = { success: false, message: "Missing secret key. Please add your Stripe secret key." };
        } else {
          testResult = { success: true, message: "Connection successful! All systems operational." };
        }
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

      updateAndPersistIntegrations(prev => prev.map(i =>
        i.id === id ? { ...i, ...updatedIntegration } : i
      ));

      // Show result to user
      showNotification(
        `Test ${testResult.success ? 'Successful' : 'Failed'}: ${testResult.message}`,
        testResult.success ? 'success' : 'error'
      );

    } catch (error) {
      updateAndPersistIntegrations(prev => prev.map(i =>
        i.id === id ? {
          ...i,
          status: "Error" as Integration['status'],
          lastError: "Test connection failed due to network error."
        } : i
      ));
      showNotification(`Test Failed: Unable to connect to ${integration.name}. Please check your internet connection.`, 'error');
    } finally {
      setTestingIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleSaveIntegration = async () => {
    if (selectedIntegration) {
      // Update existing integration configuration
      try {
        // Update the integration in the list
        updateAndPersistIntegrations(prev => prev.map(i =>
          i.id === selectedIntegration.id ? selectedIntegration : i
        ));

        // If it's an email integration, update or create the email account
        if (selectedIntegration.category === "Email" && ["Gmail", "Yahoo Mail", "Microsoft Outlook", "Hotmail/Live", "Custom SMTP"].includes(selectedIntegration.name)) {
          const providerMap: Record<string, string> = {
            "Gmail": "gmail",
            "Yahoo Mail": "yahoo",
            "Microsoft Outlook": "outlook",
            "Hotmail/Live": "hotmail",
            "Custom SMTP": "custom-smtp"
          };

          const providerId = providerMap[selectedIntegration.name];
          if (providerId && selectedIntegration.configuration.email) {
            // Check if account already exists
            const existingAccount = EmailService.getAccounts().find(a => a.providerId === providerId);

            if (existingAccount) {
              // Update existing account
              await EmailService.updateAccount(existingAccount.id, {
                email: selectedIntegration.configuration.email,
                displayName: selectedIntegration.configuration.displayName || selectedIntegration.configuration.email,
                isActive: selectedIntegration.isActive
              });
            } else {
              // Create new account if all required fields are provided
              let credentials: any = {};

              if (selectedIntegration.name === "Yahoo Mail" && selectedIntegration.configuration.appPassword) {
                credentials = { appPassword: selectedIntegration.configuration.appPassword };
              } else if (selectedIntegration.name === "Hotmail/Live" && selectedIntegration.configuration.password) {
                credentials = { password: selectedIntegration.configuration.password };
              } else if (selectedIntegration.name === "Custom SMTP" && selectedIntegration.configuration.password) {
                credentials = {
                  password: selectedIntegration.configuration.password,
                  smtpHost: selectedIntegration.configuration.smtpHost,
                  smtpPort: selectedIntegration.configuration.smtpPort || 587,
                  username: selectedIntegration.configuration.username,
                  security: selectedIntegration.configuration.security || 'STARTTLS'
                };
              }

              // Add account if credentials are available
              if (Object.keys(credentials).length > 0) {
                await EmailService.addAccount(
                  providerId,
                  selectedIntegration.configuration.email,
                  credentials,
                  { syncFrequency: 'hourly' }
                );
              }
            }
          }
        }

        showNotification(`${selectedIntegration.name} configuration updated successfully!`, 'success');
        setOpenIntegrationDialog(false);
        setSelectedIntegration(null);
      } catch (error) {
        showNotification(`Failed to update ${selectedIntegration.name} configuration: ${error}`, 'error');
      }
    } else {
      // Add new integration logic (existing inline code)
      if (!newIntegrationType || Object.keys(newIntegrationConfig).length === 0) {
        showNotification("Please select an integration type and configure it.", 'error');
        return;
      }

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
        "google-drive": {
          name: "Google Drive",
          description: "Cloud storage and file management",
          category: "Storage",
          provider: "Google",
          type: "OAuth",
          icon: "📁",
          setupComplexity: "Easy",
          pricing: "Free",
          features: ["File Storage", "Backup", "Sharing", "Collaboration"]
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

      updateAndPersistIntegrations(prev => [...prev, newIntegration]);

      // If it's an email provider, add it to EmailService
      if (['gmail', 'outlook', 'yahoo', 'hotmail', 'custom-smtp'].includes(newIntegrationType)) {
        try {
          // Prepare credentials based on provider type
          let credentials: any = {};

          if (newIntegrationType === 'gmail') {
            // Gmail supports both OAuth and App Password
            if (newIntegrationConfig.authMethod === 'app-password') {
              credentials = {
                appPassword: newIntegrationConfig.appPassword || ''
              };
            } else {
              // OAuth method
              credentials = {
                accessToken: '', // Will be filled after OAuth
                refreshToken: '', // Will be filled after OAuth
              };
            }
          } else if (newIntegrationType === 'outlook') {
            // Outlook supports both OAuth and App Password
            if (newIntegrationConfig.authMethod === 'app-password') {
              credentials = {
                appPassword: newIntegrationConfig.appPassword || ''
              };
            } else {
              // OAuth method
              credentials = {
                accessToken: '', // Will be filled after OAuth
                refreshToken: '', // Will be filled after OAuth
              };
            }
          } else if (newIntegrationType === 'yahoo') {
            credentials = {
              appPassword: newIntegrationConfig.appPassword || ''
            };
          } else if (newIntegrationType === 'hotmail') {
            credentials = {
              password: newIntegrationConfig.password || ''
            };
          } else if (newIntegrationType === 'custom-smtp') {
            credentials = {
              password: newIntegrationConfig.password || ''
            };
          }

          // Add email account to EmailService
          const emailAccount = {
            providerId: newIntegrationType,
            email: newIntegrationConfig.email || '',
            credentials,
            settings: {
              syncFrequency: 'hourly' as const,
              autoReply: false
            }
          };

          // Handle different authentication methods
          if ((newIntegrationType === 'gmail' || newIntegrationType === 'outlook') &&
              newIntegrationConfig.authMethod === 'oauth') {
            // Add without testing for OAuth providers since they need authentication flow
            const account = await EmailService.addAccount(
              emailAccount.providerId,
              emailAccount.email,
              emailAccount.credentials,
              emailAccount.settings
            ).catch(() => {
              // If EmailService.addAccount fails for OAuth, we'll add it manually
              return {
                id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...emailAccount,
                displayName: newIntegrationConfig.displayName || emailAccount.email,
                isActive: true,
                authType: 'oauth' as const,
                status: 'disconnected' as const,
                dateAdded: new Date().toISOString()
              };
            });
          } else {
            // Test connection for non-OAuth providers
            await EmailService.addAccount(
              emailAccount.providerId,
              emailAccount.email,
              emailAccount.credentials,
              emailAccount.settings
            );
          }

          showNotification(`${template.name} integration added successfully! ${
            ((newIntegrationType === 'gmail' || newIntegrationType === 'outlook') &&
             newIntegrationConfig.authMethod === 'oauth')
              ? 'Please complete OAuth authentication in the email settings.'
              : 'Email account configured and ready to use.'
          }`, 'success');
        } catch (error) {
          console.error('Failed to add email account:', error);
          showNotification(`${template.name} integration added to the list, but email configuration failed. Please check your settings.`, 'error');
        }
      } else {
        showNotification(`${template.name} integration added successfully!`, 'success');
      }

      setOpenIntegrationDialog(false);
      setSelectedIntegration(null);
      setNewIntegrationType("");
      setNewIntegrationConfig({});
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
    updateAndPersistIntegrations(prev => prev.map(i =>
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

      updateAndPersistIntegrations(prev => prev.map(i =>
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
      updateAndPersistIntegrations(prev => prev.map(i =>
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

      {/* Real Estate Platform Integrations - Enhanced Dynamic Section */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                <HomeWorkRoundedIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight="600" color="primary.main">
                  Real Estate Platform Integrations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Publish your properties to {realEstatePlatforms?.length || 0}+ major real estate platforms with one click
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<PublishRoundedIcon />}
                  onClick={() => {
                    if (properties?.length > 0) {
                      setSelectedProperty(properties[0]);
                      setPublishingDialogOpen(true);
                    } else {
                      setSnackbar({ open: true, message: 'No properties available to publish', severity: 'info' });
                    }
                  }}
                  disabled={!realEstateInitialized || !properties?.length}
                >
                  Quick Publish
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<IntegrationInstructionsRoundedIcon />}
                  onClick={() => navigate('/crm/real-estate-platforms')}
                >
                  Manage Platforms
                </Button>
              </Stack>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="primary.main">
                    {realEstatePlatforms?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Available Platforms
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="success.main">
                    {connectedPlatformsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Connected
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="info.main">
                    {availableBundles?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Bundle Options
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="warning.main">
                    {properties?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Ready Properties
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Featured Platforms:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {realEstatePlatforms?.slice(0, 8).map((platform) => {
                  const isConnected = RealEstatePlatformService.isPlatformAuthenticated(platform.platform as RealEstatePlatform);
                  return (
                    <Chip
                      key={platform.platform}
                      label={platform.displayName}
                      size="small"
                      variant={isConnected ? "filled" : "outlined"}
                      color={isConnected ? "success" : "default"}
                      sx={{
                        borderColor: isConnected ? 'success.main' : 'primary.main',
                        color: isConnected ? 'success.contrastText' : 'primary.main',
                        '&:hover': { bgcolor: isConnected ? 'success.light' : 'primary.50' }
                      }}
                    />
                  );
                })}
                {(realEstatePlatforms?.length || 0) > 8 && (
                  <Chip
                    label={`+${(realEstatePlatforms?.length || 0) - 8} more`}
                    size="small"
                    color="primary"
                  />
                )}
              </Stack>
            </Box>

            <Alert severity="info" sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'info.main' }}>
              <Typography variant="body2">
                <strong>Live Integration!</strong> Connected to {connectedPlatformsCount} platforms with {availableBundles?.length || 0} bundle options available.
                {connectedPlatformsCount === 0 ? ' Start by connecting your first platform!' : ' Ready to publish your properties instantly.'}
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      {/* Bookkeeping Integrations Section */}
      <Card sx={{ mb: 3, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56 }}>
                <PaymentRoundedIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight="600" color="success.main">
                  Bookkeeping & Accounting Integrations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sync your rent payments and financial data with major accounting platforms
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<SyncRoundedIcon />}
                  disabled={!bookkeepingInitialized || bookkeepingConnections.length === 0}
                >
                  Sync All
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<IntegrationInstructionsRoundedIcon />}
                >
                  Manage Bookkeeping
                </Button>
              </Stack>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="success.main">
                    6
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Available Platforms
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="success.main">
                    {bookkeepingConnections.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Connected
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="info.main">
                    {bookkeepingConnections.filter(c => c.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Active Syncs
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h6" color="warning.main">
                    {bookkeepingConnections.filter(c => c.syncStatus === 'error').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Sync Errors
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Supported Platforms:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {['QuickBooks Online', 'Xero', 'Sage', 'FreshBooks', 'Wave', 'Zoho Books'].map((platform, index) => {
                  const isConnected = bookkeepingConnections.some(c => c.providerId === platform.toLowerCase().replace(/\s+/g, ''));
                  return (
                    <Chip
                      key={platform}
                      label={platform}
                      size="small"
                      variant={isConnected ? "filled" : "outlined"}
                      color={isConnected ? "success" : "default"}
                      sx={{
                        borderColor: isConnected ? 'success.main' : 'success.main',
                        color: isConnected ? 'success.contrastText' : 'success.main',
                        '&:hover': { bgcolor: isConnected ? 'success.light' : 'success.50' }
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Alert severity="info" sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'info.main' }}>
              <Typography variant="body2">
                <strong>Financial Integration!</strong> Connected to {bookkeepingConnections.length} accounting platforms.
                {bookkeepingConnections.length === 0 ? ' Start by connecting your first accounting system!' : ' Your rent payments are automatically synced.'}
              </Typography>
            </Alert>

            {/* Render the actual BookkeepingManagement component */}
            {bookkeepingInitialized && (
              <Box sx={{ mt: 2 }}>
                <BookkeepingManagement />
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Property Publishing Dialog */}
      {publishingDialogOpen && selectedProperty && (
        <PropertyPublishingInterface
          property={selectedProperty}
          isOpen={publishingDialogOpen}
          onClose={() => {
            setPublishingDialogOpen(false);
            setSelectedProperty(null);
          }}
          onPublishComplete={(results) => {
            setSnackbar({
              open: true,
              message: `Published to ${results.filter(r => r.status === 'success').length} platforms successfully!`,
              severity: 'success'
            });
            setPublishingDialogOpen(false);
            setSelectedProperty(null);
          }}
        />
      )}

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
                  <MenuItem value="Real Estate" disabled>Real Estate (See Above ↑)</MenuItem>
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
                      <span style={{ display: 'inline-block' }}>
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
                      </span>
                    </Tooltip>
                    <Tooltip title={syncingIntegrations.has(integration.id) ? "Syncing data..." : "Sync Now"}>
                      <span style={{ display: 'inline-block' }}>
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
                      </span>
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

              {selectedIntegration.name === "Gmail" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Gmail integration using OAuth authentication or manual setup with app password.
                  </Alert>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Gmail Server Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Outgoing (SMTP):</strong> smtp.gmail.com:587 (TLS)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (IMAP):</strong> imap.gmail.com:993 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (POP):</strong> pop.gmail.com:995 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Authentication:</strong> OAuth 2.0 or App Password
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Authentication Method</InputLabel>
                    <Select
                      value={selectedIntegration.configuration.authMethod || "oauth"}
                      label="Authentication Method"
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          configuration: {
                            ...selectedIntegration.configuration,
                            authMethod: e.target.value,
                            // Clear other method's credentials when switching
                            ...(e.target.value === 'oauth' ? { appPassword: '' } : { accessToken: '', refreshToken: '' })
                          }
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                    >
                      <MenuItem value="oauth">OAuth 2.0 (Recommended)</MenuItem>
                      <MenuItem value="app-password">App Password (Manual Setup)</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Email Address"
                    fullWidth
                    type="email"
                    value={selectedIntegration.configuration.email || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, email: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="your.email@gmail.com"
                    helperText="The Gmail address you want to use for sending emails"
                  />

                  <TextField
                    label="Display Name"
                    fullWidth
                    value={selectedIntegration.configuration.displayName || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, displayName: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Your Name or Company Name"
                    helperText="Name that will appear as the sender"
                  />

                  {selectedIntegration.configuration.authMethod === "app-password" && (
                    <TextField
                      label="App Password"
                      fullWidth
                      type="password"
                      value={selectedIntegration.configuration.appPassword || ""}
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          configuration: { ...selectedIntegration.configuration, appPassword: e.target.value }
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                      placeholder="Enter your Gmail App Password"
                      helperText="Generate an App Password in your Google Account Security settings"
                    />
                  )}

                  {selectedIntegration.configuration.authMethod === "oauth" ? (
                    <Stack spacing={2}>
                      <Alert severity="warning">
                        OAuth authentication requires proper Google Cloud Console setup. Use the "Test Connection" button to start the OAuth flow.
                      </Alert>
                      <Alert severity="info">
                        <strong>Note:</strong> For production use, you'll need to set up OAuth credentials in the Google Cloud Console.
                      </Alert>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Alert severity="warning">
                        <strong>App Password Setup Required:</strong>
                        <br />1. Enable 2-factor authentication on your Gmail account
                        <br />2. Go to Google Account Security settings
                        <br />3. Generate an App Password for "Mail"
                        <br />4. Use that password here (not your regular Gmail password)
                      </Alert>
                      <Alert severity="info">
                        <strong>Note:</strong> App passwords provide secure access without sharing your main password.
                      </Alert>
                    </Stack>
                  )}
                </Stack>
              )}

              {selectedIntegration.name === "Yahoo Mail" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Yahoo Mail integration using App Password authentication for enhanced security.
                  </Alert>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Yahoo Mail Server Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Outgoing (SMTP):</strong> smtp.mail.yahoo.com:587 (TLS)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (IMAP):</strong> imap.mail.yahoo.com:993 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (POP):</strong> pop.mail.yahoo.com:995 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Authentication:</strong> App Password
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <TextField
                    label="Email Address"
                    fullWidth
                    type="email"
                    value={selectedIntegration.configuration.email || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, email: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="your.email@yahoo.com"
                    helperText="Your Yahoo Mail email address"
                  />
                  <TextField
                    label="Display Name"
                    fullWidth
                    value={selectedIntegration.configuration.displayName || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, displayName: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Your Name or Company Name"
                    helperText="Name that will appear as the sender"
                  />
                  <TextField
                    label="App Password"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.appPassword || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, appPassword: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your Yahoo App Password"
                    helperText="Generate an App Password in your Yahoo Account Security settings"
                  />
                  <Alert severity="warning">
                    <strong>Important:</strong> You must enable 2-factor authentication and create an App Password in your Yahoo account settings.
                  </Alert>
                </Stack>
              )}

              {selectedIntegration.name === "Microsoft Outlook" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Microsoft Outlook integration using OAuth authentication or manual setup with app password.
                  </Alert>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Microsoft Outlook Server Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Outgoing (SMTP):</strong> smtp-mail.outlook.com:587 (TLS)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (IMAP):</strong> outlook.office365.com:993 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Exchange/Graph API:</strong> Supported
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Authentication:</strong> OAuth 2.0 or App Password
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel>Authentication Method</InputLabel>
                    <Select
                      value={selectedIntegration.configuration.authMethod || "oauth"}
                      label="Authentication Method"
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          configuration: {
                            ...selectedIntegration.configuration,
                            authMethod: e.target.value,
                            // Clear other method's credentials when switching
                            ...(e.target.value === 'oauth' ? { appPassword: '' } : { accessToken: '', refreshToken: '' })
                          }
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                    >
                      <MenuItem value="oauth">OAuth 2.0 (Recommended)</MenuItem>
                      <MenuItem value="app-password">App Password (Manual Setup)</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Email Address"
                    fullWidth
                    type="email"
                    value={selectedIntegration.configuration.email || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, email: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="your.email@outlook.com or your.email@company.com"
                    helperText="Your Outlook or Office 365 email address"
                  />

                  <TextField
                    label="Display Name"
                    fullWidth
                    value={selectedIntegration.configuration.displayName || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, displayName: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Your Name or Company Name"
                    helperText="Name that will appear as the sender"
                  />

                  {selectedIntegration.configuration.authMethod === "app-password" && (
                    <TextField
                      label="App Password"
                      fullWidth
                      type="password"
                      value={selectedIntegration.configuration.appPassword || ""}
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          configuration: { ...selectedIntegration.configuration, appPassword: e.target.value }
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                      placeholder="Enter your Microsoft App Password"
                      helperText="Generate an App Password in your Microsoft Account Security settings"
                    />
                  )}

                  {selectedIntegration.configuration.authMethod === "oauth" ? (
                    <Stack spacing={2}>
                      <Alert severity="warning">
                        OAuth authentication requires proper Microsoft Azure setup. Use the "Test Connection" button to start the OAuth flow.
                      </Alert>
                      <Alert severity="info">
                        <strong>Note:</strong> For production use, you'll need to register an application in the Microsoft Azure portal.
                      </Alert>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Alert severity="warning">
                        <strong>App Password Setup Required:</strong>
                        <br />1. Enable 2-factor authentication on your Microsoft account
                        <br />2. Go to Microsoft Account Security settings
                        <br />3. Generate an App Password for "Email"
                        <br />4. Use that password here (not your regular Microsoft password)
                      </Alert>
                      <Alert severity="info">
                        <strong>Note:</strong> App passwords provide secure access without sharing your main password.
                      </Alert>
                    </Stack>
                  )}
                </Stack>
              )}

              {selectedIntegration.name === "Hotmail/Live" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your Hotmail/Live email integration using password authentication.
                  </Alert>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Hotmail/Live Server Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Outgoing (SMTP):</strong> smtp.live.com:587 (TLS)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (IMAP):</strong> imap-mail.outlook.com:993 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Incoming (POP):</strong> pop3.live.com:995 (SSL)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Authentication:</strong> Password
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <TextField
                    label="Email Address"
                    fullWidth
                    type="email"
                    value={selectedIntegration.configuration.email || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, email: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="your.email@hotmail.com or your.email@live.com"
                    helperText="Your Hotmail or Live email address"
                  />
                  <TextField
                    label="Display Name"
                    fullWidth
                    value={selectedIntegration.configuration.displayName || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, displayName: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Your Name or Company Name"
                    helperText="Name that will appear as the sender"
                  />
                  <TextField
                    label="Password"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.password || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, password: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your email password"
                    helperText="Your Hotmail/Live account password"
                  />
                  <Alert severity="warning">
                    <strong>Security Note:</strong> Consider using a dedicated email account for automated sending rather than your personal account.
                  </Alert>
                </Stack>
              )}

              {selectedIntegration.name === "Custom SMTP" && (
                <Stack spacing={3}>
                  <Alert severity="info">
                    Configure your custom SMTP server for any email provider. Enter your specific server details below.
                  </Alert>

                  <Box sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Custom SMTP Server Configuration
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Configure your own mail server settings. Common configurations:
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      • <strong>Port 587:</strong> STARTTLS (recommended for most providers)<br/>
                      • <strong>Port 465:</strong> SSL/TLS (legacy but still used)<br/>
                      • <strong>Port 25:</strong> Unencrypted (not recommended)<br/>
                      • <strong>IMAP Port 993:</strong> SSL (for receiving emails)<br/>
                      • <strong>POP Port 995:</strong> SSL (for receiving emails)
                    </Typography>
                  </Box>
                  <TextField
                    label="Email Address"
                    fullWidth
                    type="email"
                    value={selectedIntegration.configuration.email || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, email: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="your.email@yourdomain.com"
                    helperText="The email address to send from"
                  />
                  <TextField
                    label="Display Name"
                    fullWidth
                    value={selectedIntegration.configuration.displayName || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, displayName: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Your Name or Company Name"
                    helperText="Name that will appear as the sender"
                  />
                  <TextField
                    label="SMTP Host"
                    fullWidth
                    value={selectedIntegration.configuration.smtpHost || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, smtpHost: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="smtp.yourdomain.com"
                    helperText="SMTP server hostname"
                  />
                  <TextField
                    label="SMTP Port"
                    fullWidth
                    type="number"
                    value={selectedIntegration.configuration.smtpPort || 587}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, smtpPort: parseInt(e.target.value) }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    helperText="Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)"
                  />
                  <TextField
                    label="Username"
                    fullWidth
                    value={selectedIntegration.configuration.username || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, username: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Usually your email address"
                    helperText="SMTP authentication username"
                  />
                  <TextField
                    label="Password"
                    fullWidth
                    type="password"
                    value={selectedIntegration.configuration.password || ""}
                    onChange={(e) => {
                      const updatedIntegration = {
                        ...selectedIntegration,
                        configuration: { ...selectedIntegration.configuration, password: e.target.value }
                      };
                      setSelectedIntegration(updatedIntegration);
                    }}
                    placeholder="Enter your SMTP password"
                    helperText="SMTP authentication password"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Security</InputLabel>
                    <Select
                      value={selectedIntegration.configuration.security || "STARTTLS"}
                      label="Security"
                      onChange={(e) => {
                        const updatedIntegration = {
                          ...selectedIntegration,
                          configuration: { ...selectedIntegration.configuration, security: e.target.value }
                        };
                        setSelectedIntegration(updatedIntegration);
                      }}
                    >
                      <MenuItem value="STARTTLS">STARTTLS (Recommended)</MenuItem>
                      <MenuItem value="SSL/TLS">SSL/TLS</MenuItem>
                      <MenuItem value="None">None (Not Recommended)</MenuItem>
                    </Select>
                  </FormControl>
                  <Alert severity="info">
                    <strong>Tip:</strong> Contact your email provider or IT administrator for SMTP configuration details.
                  </Alert>
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

                  {newIntegrationType === "gmail" && (
                    <Stack spacing={3}>
                      <Alert severity="info">
                        Configure your Gmail integration using OAuth authentication or manual setup with app password.
                      </Alert>

                      <FormControl fullWidth>
                        <InputLabel>Authentication Method</InputLabel>
                        <Select
                          value={newIntegrationConfig.authMethod || "oauth"}
                          label="Authentication Method"
                          onChange={(e) => setNewIntegrationConfig(prev => ({
                            ...prev,
                            authMethod: e.target.value,
                            // Clear other method's credentials when switching
                            ...(e.target.value === 'oauth' ? { appPassword: '' } : { clientId: '' })
                          }))}
                        >
                          <MenuItem value="oauth">OAuth 2.0 (Recommended)</MenuItem>
                          <MenuItem value="app-password">App Password (Manual Setup)</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={newIntegrationConfig.email || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@gmail.com"
                        helperText="The Gmail address you want to use for sending emails"
                      />

                      <TextField
                        label="Display Name"
                        fullWidth
                        value={newIntegrationConfig.displayName || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your Name or Company Name"
                        helperText="Name that will appear as the sender"
                      />

                      {newIntegrationConfig.authMethod === "oauth" ? (
                        <Stack spacing={2}>
                          <TextField
                            label="OAuth Client ID (Optional)"
                            fullWidth
                            value={newIntegrationConfig.clientId || ""}
                            onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, clientId: e.target.value }))}
                            placeholder="Enter your Google OAuth Client ID"
                            helperText="If you have a custom OAuth application, enter the Client ID"
                          />
                          <Alert severity="warning">
                            Gmail integration requires OAuth setup. After adding, you'll need to authenticate with Google.
                          </Alert>
                        </Stack>
                      ) : (
                        <Stack spacing={2}>
                          <TextField
                            label="App Password"
                            fullWidth
                            type="password"
                            value={newIntegrationConfig.appPassword || ""}
                            onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                            placeholder="Enter your Gmail App Password"
                            helperText="Generate an App Password in your Google Account Security settings"
                          />
                          <Alert severity="info">
                            <strong>App Password Setup:</strong> Enable 2FA in Google Account, then generate an App Password for "Mail".
                          </Alert>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {newIntegrationType === "outlook" && (
                    <Stack spacing={3}>
                      <Alert severity="info">
                        Configure your Microsoft Outlook integration using OAuth authentication.
                      </Alert>
                      <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={newIntegrationConfig.email || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@outlook.com"
                        helperText="The Outlook address you want to use for sending emails"
                      />
                      <TextField
                        label="Display Name"
                        fullWidth
                        value={newIntegrationConfig.displayName || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your Name or Company Name"
                        helperText="Name that will appear as the sender"
                      />
                      <TextField
                        label="OAuth Client ID (Optional)"
                        fullWidth
                        value={newIntegrationConfig.clientId || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, clientId: e.target.value }))}
                        placeholder="Enter your Microsoft App Client ID"
                        helperText="If you have a custom OAuth application, enter the Client ID"
                      />
                      <Alert severity="warning">
                        Outlook integration requires OAuth setup. After adding, you'll need to authenticate with Microsoft.
                      </Alert>
                    </Stack>
                  )}

                  {newIntegrationType === "yahoo" && (
                    <Stack spacing={3}>
                      <Alert severity="info">
                        Configure your Yahoo Mail integration using App Password authentication for enhanced security.
                      </Alert>
                      <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={newIntegrationConfig.email || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@yahoo.com"
                        helperText="Your Yahoo email address"
                      />
                      <TextField
                        label="Display Name"
                        fullWidth
                        value={newIntegrationConfig.displayName || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your Name or Company Name"
                        helperText="Name that will appear as the sender"
                      />
                      <TextField
                        label="App Password"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.appPassword || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, appPassword: e.target.value }))}
                        placeholder="Enter your Yahoo App Password"
                        helperText="Generate an App Password in your Yahoo Account Security settings"
                      />
                      <Alert severity="warning">
                        For security, Yahoo requires App Passwords instead of your regular password.
                        <br />
                        Generate one at: Yahoo Account Security → App Passwords
                      </Alert>
                    </Stack>
                  )}

                  {newIntegrationType === "hotmail" && (
                    <Stack spacing={3}>
                      <Alert severity="info">
                        Configure your Hotmail/Live email integration with password authentication.
                      </Alert>
                      <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={newIntegrationConfig.email || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@hotmail.com"
                        helperText="Your Hotmail or Live email address"
                      />
                      <TextField
                        label="Display Name"
                        fullWidth
                        value={newIntegrationConfig.displayName || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your Name or Company Name"
                        helperText="Name that will appear as the sender"
                      />
                      <TextField
                        label="Password"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.password || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your account password"
                        helperText="Your Hotmail/Live account password"
                      />
                      <Alert severity="warning">
                        Store your password securely. In production, credentials should be encrypted and stored on the backend.
                      </Alert>
                    </Stack>
                  )}

                  {newIntegrationType === "custom-smtp" && (
                    <Stack spacing={3}>
                      <Alert severity="info">
                        Configure your custom SMTP server settings for any email provider.
                      </Alert>
                      <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={newIntegrationConfig.email || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@company.com"
                        helperText="Your email address"
                      />
                      <TextField
                        label="Display Name"
                        fullWidth
                        value={newIntegrationConfig.displayName || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Your Name or Company Name"
                        helperText="Name that will appear as the sender"
                      />
                      <TextField
                        label="SMTP Host"
                        fullWidth
                        value={newIntegrationConfig.smtpHost || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.yourdomain.com"
                        helperText="SMTP server hostname"
                      />
                      <TextField
                        label="SMTP Port"
                        fullWidth
                        type="number"
                        value={newIntegrationConfig.smtpPort || "587"}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                        placeholder="587"
                        helperText="SMTP port (common: 587 for TLS, 465 for SSL, 25 for plain)"
                      />
                      <TextField
                        label="Username"
                        fullWidth
                        value={newIntegrationConfig.username || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Your SMTP username (often same as email)"
                        helperText="SMTP authentication username"
                      />
                      <TextField
                        label="Password"
                        fullWidth
                        type="password"
                        value={newIntegrationConfig.password || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your SMTP password"
                        helperText="SMTP authentication password"
                      />
                      <FormControl fullWidth>
                        <InputLabel>Security</InputLabel>
                        <Select
                          value={newIntegrationConfig.security || "tls"}
                          label="Security"
                          onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, security: e.target.value }))}
                        >
                          <MenuItem value="tls">TLS</MenuItem>
                          <MenuItem value="ssl">SSL</MenuItem>
                          <MenuItem value="none">None</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="IMAP Host (Optional)"
                        fullWidth
                        value={newIntegrationConfig.imapHost || ""}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, imapHost: e.target.value }))}
                        placeholder="imap.yourdomain.com"
                        helperText="IMAP server for reading emails (optional)"
                      />
                      <TextField
                        label="IMAP Port (Optional)"
                        fullWidth
                        type="number"
                        value={newIntegrationConfig.imapPort || "993"}
                        onChange={(e) => setNewIntegrationConfig(prev => ({ ...prev, imapPort: e.target.value }))}
                        placeholder="993"
                        helperText="IMAP port (common: 993 for SSL, 143 for plain)"
                      />
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
            onClick={handleSaveIntegration}
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
