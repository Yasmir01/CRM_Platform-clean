import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
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
  LinearProgress,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemButton,
  ListItemAvatar,
} from "@mui/material";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AutomationIcon from "@mui/icons-material/Autorenew";
import SegmentIcon from "@mui/icons-material/PieChart";
import TemplateIcon from "@mui/icons-material/Description";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LaunchIcon from "@mui/icons-material/Launch";
import WebIcon from "@mui/icons-material/Web";
import SmsIcon from "@mui/icons-material/Sms";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useCrmData, Campaign } from "../contexts/CrmDataContext";
import NumberInput from "../components/NumberInput";
import EmailMarketing from "./EmailMarketing";
import SmsMarketing from "./SmsMarketing";
import Templates from "./Templates";
import PropertyLandingPages from "./PropertyLandingPages";
import Promotions from "./Promotions";

interface Campaign {
  id: string;
  name: string;
  type: "Email" | "SMS" | "Social" | "Push" | "Multi-Channel";
  status: "Draft" | "Active" | "Paused" | "Completed" | "Archived";
  audience: string;
  audienceSize: number;
  subject?: string;
  previewText?: string;
  templateId?: string;
  scheduleType: "Immediate" | "Scheduled" | "Triggered";
  scheduledDate?: string;
  metrics: CampaignMetrics;
  settings: CampaignSettings;
  content: string;
  dateCreated: string;
  dateModified: string;
  createdBy: string;
  tags: string[];
}

interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  revenue: number;
}

interface CampaignSettings {
  sendFromEmail: string;
  sendFromName: string;
  replyToEmail: string;
  trackOpens: boolean;
  trackClicks: boolean;
  enableSocialSharing: boolean;
  abTestEnabled: boolean;
  autoResponder: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: "Newsletter" | "Welcome" | "Promotion" | "Follow-up" | "Event" | "Custom";
  subject: string;
  previewText: string;
  htmlContent: string;
  textContent: string;
  thumbnail?: string;
  isActive: boolean;
  dateCreated: string;
  dateModified: string;
  usageCount: number;
}

interface MarketingAutomation {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Paused" | "Draft";
  trigger: AutomationTrigger;
  steps: AutomationStep[];
  contacts: number;
  completions: number;
  dateCreated: string;
  dateModified: string;
  createdBy: string;
}

interface AutomationTrigger {
  type: "Contact Added" | "Email Opened" | "Link Clicked" | "Form Submitted" | "Date/Time" | "Custom Event";
  conditions: Record<string, any>;
}

interface AutomationStep {
  id: string;
  type: "Email" | "SMS" | "Wait" | "Condition" | "Tag" | "Webhook";
  name: string;
  settings: Record<string, any>;
  delay?: {
    amount: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  };
}

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  contactCount: number;
  isActive: boolean;
  dateCreated: string;
  dateModified: string;
}

interface SegmentCriteria {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than";
  value: string;
  logic: "AND" | "OR";
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
      id={`marketing-tabpanel-${index}`}
      aria-labelledby={`marketing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Welcome Series - New Property Owners",
    type: "Email",
    status: "Active",
    audience: "New Property Owners",
    audienceSize: 245,
    subject: "Welcome to PropertyCRM - Get Started Today!",
    previewText: "Your journey to efficient property management starts here...",
    templateId: "welcome-001",
    scheduleType: "Triggered",
    metrics: {
      sent: 1250,
      delivered: 1225,
      opened: 525,
      clicked: 145,
      converted: 32,
      unsubscribed: 8,
      bounced: 25,
      revenue: 48000
    },
    settings: {
      sendFromEmail: "welcome@propertycrm.com",
      sendFromName: "PropertyCRM Team",
      replyToEmail: "support@propertycrm.com",
      trackOpens: true,
      trackClicks: true,
      enableSocialSharing: true,
      abTestEnabled: false,
      autoResponder: true
    },
    content: "Welcome email content here...",
    dateCreated: "2024-01-01",
    dateModified: "2024-01-15",
    createdBy: "Marketing Team",
    tags: ["Welcome", "Onboarding", "Automated"]
  },
  {
    id: "2",
    name: "Monthly Newsletter - January 2024",
    type: "Email",
    status: "Completed",
    audience: "All Active Subscribers",
    audienceSize: 3250,
    subject: "🏠 January Newsletter: New Features & Market Insights",
    previewText: "Discover what's new this month and market trends...",
    templateId: "newsletter-001",
    scheduleType: "Scheduled",
    scheduledDate: "2024-01-15",
    metrics: {
      sent: 3250,
      delivered: 3180,
      opened: 1425,
      clicked: 284,
      converted: 45,
      unsubscribed: 12,
      bounced: 70,
      revenue: 15000
    },
    settings: {
      sendFromEmail: "newsletter@propertycrm.com",
      sendFromName: "PropertyCRM",
      replyToEmail: "support@propertycrm.com",
      trackOpens: true,
      trackClicks: true,
      enableSocialSharing: true,
      abTestEnabled: true,
      autoResponder: false
    },
    content: "Newsletter content here...",
    dateCreated: "2024-01-10",
    dateModified: "2024-01-15",
    createdBy: "Sarah Johnson",
    tags: ["Newsletter", "Monthly", "Content Marketing"]
  }
];

const mockTemplates: EmailTemplate[] = [
  {
    id: "welcome-001",
    name: "Welcome Series - Part 1",
    category: "Welcome",
    subject: "Welcome to PropertyCRM!",
    previewText: "Get started with your property management journey",
    htmlContent: "<html>Welcome email HTML content...</html>",
    textContent: "Welcome to PropertyCRM! We're excited to have you.",
    thumbnail: "https://via.placeholder.com/300x200",
    isActive: true,
    dateCreated: "2024-01-01",
    dateModified: "2024-01-10",
    usageCount: 15
  },
  {
    id: "newsletter-001",
    name: "Monthly Newsletter Template",
    category: "Newsletter",
    subject: "Monthly Newsletter - {{month}} {{year}}",
    previewText: "Your monthly dose of insights and updates",
    htmlContent: "<html>Newsletter HTML content...</html>",
    textContent: "Monthly newsletter text content...",
    thumbnail: "https://via.placeholder.com/300x200",
    isActive: true,
    dateCreated: "2024-01-01",
    dateModified: "2024-01-12",
    usageCount: 8
  }
];

const mockAutomations: MarketingAutomation[] = [
  {
    id: "1",
    name: "Lead Nurturing Sequence",
    description: "5-email sequence for new leads to convert to customers",
    status: "Active",
    trigger: {
      type: "Contact Added",
      conditions: { segment: "New Leads" }
    },
    steps: [
      {
        id: "1",
        type: "Email",
        name: "Welcome & Introduction",
        settings: { templateId: "welcome-001" },
        delay: { amount: 0, unit: "minutes" }
      },
      {
        id: "2",
        type: "Wait",
        name: "Wait 2 days",
        settings: {},
        delay: { amount: 2, unit: "days" }
      },
      {
        id: "3",
        type: "Email",
        name: "Product Features",
        settings: { templateId: "features-001" },
        delay: { amount: 0, unit: "minutes" }
      }
    ],
    contacts: 1250,
    completions: 425,
    dateCreated: "2024-01-01",
    dateModified: "2024-01-10",
    createdBy: "Marketing Team"
  }
];

const mockSegments: Segment[] = [
  {
    id: "1",
    name: "New Property Owners",
    description: "Property owners who joined in the last 30 days",
    criteria: [
      {
        field: "date_created",
        operator: "greater_than",
        value: "30 days ago",
        logic: "AND"
      },
      {
        field: "user_type",
        operator: "equals",
        value: "Property Owner",
        logic: "AND"
      }
    ],
    contactCount: 245,
    isActive: true,
    dateCreated: "2024-01-01",
    dateModified: "2024-01-15"
  },
  {
    id: "2",
    name: "High-Value Customers",
    description: "Customers with lifetime value > $10,000",
    criteria: [
      {
        field: "lifetime_value",
        operator: "greater_than",
        value: "10000",
        logic: "AND"
      }
    ],
    contactCount: 156,
    isActive: true,
    dateCreated: "2024-01-05",
    dateModified: "2024-01-15"
  }
];

const mockLandingPages = [
  { id: "1", name: "Welcome New Owners", url: "/landing/welcome-owners", status: "Active" },
  { id: "2", name: "Property Management Services", url: "/landing/services", status: "Active" },
  { id: "3", name: "Premium Features Upgrade", url: "/landing/premium", status: "Draft" }
];

const mockSmsTemplates = [
  { id: "1", name: "Welcome SMS", content: "Welcome to PropertyCRM! Your journey starts here." },
  { id: "2", name: "Payment Reminder", content: "Hi {{name}}, your rent payment is due on {{date}}." },
  { id: "3", name: "Maintenance Update", content: "Your maintenance request has been updated. Check the app for details." }
];

const mockPromotions = [
  { id: "1", name: "New Owner Discount", description: "15% off first month property management", active: true },
  { id: "2", name: "Referral Bonus", description: "$100 credit for successful referrals", active: true },
  { id: "3", name: "Premium Upgrade Special", description: "2 months free premium features", active: false }
];

const getCampaignStatusColor = (status: Campaign["status"]) => {
  switch (status) {
    case "Active": return "success";
    case "Paused": return "warning";
    case "Draft": return "default";
    case "Completed": return "info";
    case "Archived": return "error";
    default: return "default";
  }
};

const getAutomationStatusColor = (status: MarketingAutomation["status"]) => {
  switch (status) {
    case "Active": return "success";
    case "Paused": return "warning";
    case "Draft": return "default";
    default: return "default";
  }
};

export default function MarketingAutomation() {
  const navigate = useNavigate();
  const { trackPropertyActivity } = useActivityTracking();
  const { state, addCampaign, updateCampaign } = useCrmData();
  const { campaigns } = state;
  const [templates, setTemplates] = React.useState<EmailTemplate[]>(mockTemplates);
  const [automations, setAutomations] = React.useState<MarketingAutomation[]>(mockAutomations);
  const [segments, setSegments] = React.useState<Segment[]>(mockSegments);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [activeMarketingTool, setActiveMarketingTool] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("All");
  const [openCampaignDialog, setOpenCampaignDialog] = React.useState(false);
  const [openTemplateDialog, setOpenTemplateDialog] = React.useState(false);
  const [openAutomationDialog, setOpenAutomationDialog] = React.useState(false);
  const [openSegmentDialog, setOpenSegmentDialog] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
  const [selectedAutomation, setSelectedAutomation] = React.useState<MarketingAutomation | null>(null);
  const [selectedSegment, setSelectedSegment] = React.useState<Segment | null>(null);
  const [automationFormData, setAutomationFormData] = React.useState({
    name: '',
    description: '',
    triggerType: 'Contact Added' as AutomationTrigger['type'],
    emailTemplate: ''
  });
  const [segmentFormData, setSegmentFormData] = React.useState({
    name: '',
    description: '',
    criteria: [{ field: 'email', operator: 'contains' as const, value: '', logic: 'AND' as const }]
  });

  const [campaignFormData, setCampaignFormData] = React.useState({
    name: "",
    type: "Email" as Campaign["type"],
    targetAudience: "",
    content: "",
    scheduledDate: "",
    status: "Draft" as Campaign["status"],
    subject: "",
    previewText: "",
    selectedTemplate: null as EmailTemplate | null,
    selectedLandingPage: "",
    selectedSmsTemplate: "",
    selectedPromotion: "",
    richTextContent: "",
    useRichText: true
  });

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + c.metrics.opened, 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + c.metrics.clicked, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddCampaign = () => {
    setSelectedCampaign(null);
    setCampaignFormData({
      name: "",
      type: "Email",
      targetAudience: "",
      content: "",
      scheduledDate: "",
      status: "Draft",
      subject: "",
      previewText: "",
      selectedTemplate: null,
      selectedLandingPage: "",
      selectedSmsTemplate: "",
      selectedPromotion: "",
      richTextContent: "",
      useRichText: true
    });
    setOpenCampaignDialog(true);
  };

  const handleRichTextFormat = (format: string) => {
    const textarea = document.getElementById('campaign-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'list':
        formattedText = `• ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](URL)`;
        break;
    }

    const newContent =
      campaignFormData.richTextContent.substring(0, start) +
      formattedText +
      campaignFormData.richTextContent.substring(end);

    setCampaignFormData({ ...campaignFormData, richTextContent: newContent });
  };

  const handleTemplateSelect = (template: EmailTemplate | null) => {
    if (template) {
      setCampaignFormData({
        ...campaignFormData,
        selectedTemplate: template,
        subject: template.subject,
        content: template.textContent,
        richTextContent: template.htmlContent
      });
    }
  };

  const handleMarketingToolIntegration = (tool: string, value: string) => {
    const integrationText = `\n\n--- ${tool.toUpperCase()} INTEGRATION ---\n${value}\n`;
    setCampaignFormData({
      ...campaignFormData,
      richTextContent: campaignFormData.richTextContent + integrationText
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignFormData({
      name: campaign.name,
      type: campaign.type,
      targetAudience: campaign.targetAudience,
      content: campaign.content,
      scheduledDate: campaign.scheduledDate || "",
      status: campaign.status
    });
    setOpenCampaignDialog(true);
  };

  const handleSaveCampaign = () => {
    const campaignData = {
      ...campaignFormData,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    };

    if (selectedCampaign) {
      updateCampaign({
        ...selectedCampaign,
        ...campaignData
      });
    } else {
      addCampaign(campaignData);
    }
    setOpenCampaignDialog(false);
  };

  const handleCampaignAction = (campaignId: string, action: "pause" | "resume" | "stop") => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      let newStatus: Campaign["status"];
      switch (action) {
        case "pause":
          newStatus = "Paused";
          break;
        case "resume":
          newStatus = "Active";
          break;
        case "stop":
          newStatus = "Completed";
          break;
        default:
          return;
      }
      updateCampaign({ ...campaign, status: newStatus });
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
          Marketing Automation
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={() => console.log('Export marketing data')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddCampaign}
          >
            New Campaign
          </Button>
        </Stack>
      </Stack>

      {/* Marketing Tools Hub */}
      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'inherit' }}>
            🚀 Interconnected Marketing Tools
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            Seamlessly navigate between all marketing tools for unified campaign management
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            <Button
              variant="outlined"
              onClick={() => setActiveMarketingTool('email-marketing')}
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            >
              📧 Email Marketing
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveMarketingTool('sms-marketing')}
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            >
              📱 SMS Marketing
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveMarketingTool('templates')}
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            >
              📄 Templates
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveMarketingTool('landing-pages')}
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            >
              🎯 Landing Pages
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveMarketingTool('promotions')}
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            >
              🎁 Promotions
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Marketing Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <CampaignRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Active Campaigns</Typography>
                  <Typography variant="h4">{activeCampaigns}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <SendRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Emails Sent</Typography>
                  <Typography variant="h4">{(totalSent / 1000).toFixed(1)}K</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <VisibilityRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Open Rate</Typography>
                  <Typography variant="h4">{avgOpenRate.toFixed(1)}%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <OpenInNewRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Click Rate</Typography>
                  <Typography variant="h4">{avgClickRate.toFixed(1)}%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "secondary.main" }}>$</Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Revenue</Typography>
                  <Typography variant="h4">${(totalRevenue / 1000).toFixed(0)}K</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<CampaignRoundedIcon />}
            label="Campaigns"
            iconPosition="start"
          />
          <Tab
            icon={<AutomationIcon />}
            label="Automations"
            iconPosition="start"
          />
          <Tab
            icon={<SegmentIcon />}
            label="Segments"
            iconPosition="start"
          />
          <Tab
            icon={<TemplateIcon />}
            label="Templates"
            iconPosition="start"
          />
          <Tab
            icon={<AnalyticsIcon />}
            label="Analytics"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Campaigns Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Campaign Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search campaigns..."
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter by Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Paused">Paused</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  {filteredCampaigns.length} campaigns
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Type & Audience</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {campaign.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created {new Date(campaign.dateCreated).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip label={campaign.type} size="small" variant="outlined" />
                      <Typography variant="body2">
                        {campaign.audience} ({campaign.audienceSize.toLocaleString()})
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        Sent: {campaign.metrics.sent.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Open: {((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">
                        Click: {((campaign.metrics.clicked / campaign.metrics.sent) * 100).toFixed(1)}%
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.status}
                      color={getCampaignStatusColor(campaign.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{campaign.scheduleType}</Typography>
                    {campaign.scheduledDate && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(campaign.scheduledDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {campaign.status === "Active" && (
                        <Tooltip title="Pause Campaign">
                          <IconButton
                            size="small"
                            onClick={() => handleCampaignAction(campaign.id, "pause")}
                          >
                            <PauseRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {campaign.status === "Paused" && (
                        <Tooltip title="Resume Campaign">
                          <IconButton
                            size="small"
                            onClick={() => handleCampaignAction(campaign.id, "resume")}
                          >
                            <PlayArrowRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit Campaign">
                        <IconButton
                          size="small"
                          onClick={() => handleEditCampaign(campaign)}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Campaign">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
                          }}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Automations Tab */}
      <TabPanel value={currentTab} index={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Marketing Automations</Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenAutomationDialog(true)}
          >
            Create Automation
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {automations.map((automation) => (
            <Grid item xs={12} md={6} lg={4} key={automation.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {automation.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {automation.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={automation.status}
                        color={getAutomationStatusColor(automation.status)}
                        size="small"
                      />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">Contacts</Typography>
                        <Typography variant="h6">{automation.contacts.toLocaleString()}</Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="body2" color="text.secondary">Completed</Typography>
                        <Typography variant="h6">{automation.completions.toLocaleString()}</Typography>
                      </Box>
                    </Stack>

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Completion Rate
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(automation.completions / automation.contacts) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {((automation.completions / automation.contacts) * 100).toFixed(1)}%
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => {
                          setSelectedAutomation(automation);
                          setAutomationFormData({
                            name: automation.name,
                            description: automation.description,
                            triggerType: automation.trigger.type,
                            emailTemplate: ''
                          });
                          setOpenAutomationDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => {
                          // Navigate to detailed analytics view
                          navigate('/crm/analytics', { state: { automationId: automation.id } });
                        }}
                      >
                        Analytics
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Segments Tab */}
      <TabPanel value={currentTab} index={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Audience Segments</Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenSegmentDialog(true)}
          >
            Create Segment
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {segments.map((segment) => (
            <Grid item xs={12} md={6} lg={4} key={segment.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">
                        {segment.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {segment.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h4" color="primary.main">
                        {segment.contactCount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        contacts in segment
                      </Typography>
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <FormControlLabel
                        control={<Switch checked={segment.isActive} size="small" />}
                        label="Active"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Updated {new Date(segment.dateModified).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => {
                          setSelectedSegment(segment);
                          setSegmentFormData({
                            name: segment.name,
                            description: segment.description,
                            criteria: segment.criteria
                          });
                          setOpenSegmentDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GroupRoundedIcon />}
                        onClick={() => {
                          // Navigate to contacts view filtered by this segment
                          navigate('/crm/contacts', { state: { segmentFilter: segment.id } });
                        }}
                      >
                        View Contacts
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Templates Tab */}
      <TabPanel value={currentTab} index={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Email Templates</Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenTemplateDialog(true)}
          >
            Create Template
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card>
                <Box
                  sx={{
                    height: 150,
                    bgcolor: 'grey.100',
                    backgroundImage: template.thumbnail ? `url(${template.thumbnail})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {!template.thumbnail && <TemplateIcon sx={{ fontSize: 40, color: 'grey.400' }} />}
                </Box>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" fontWeight="medium" noWrap>
                          {template.name}
                        </Typography>
                        <Chip label={template.category} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {template.subject}
                      </Typography>
                    </Box>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Used {template.usageCount} times
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(template.dateModified).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => {
                          // Navigate to main Templates page for editing
                          navigate('/crm/templates', { state: { editTemplateId: template.id } });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon />}
                        onClick={() => {
                          // Navigate to main Templates page for preview
                          navigate('/crm/templates', { state: { previewTemplateId: template.id } });
                        }}
                      >
                        Preview
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={currentTab} index={4}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Advanced Marketing Analytics Coming Soon</Typography>
          <Typography variant="body2">
            This section will include detailed campaign performance, ROI analysis, and attribution reporting.
          </Typography>
        </Alert>
      </TabPanel>

      {/* Marketing Tool Sub-Page Dialog */}
      <Dialog
        open={activeMarketingTool !== null}
        onClose={() => setActiveMarketingTool(null)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {activeMarketingTool === 'email-marketing' && '📧 Email Marketing Hub'}
              {activeMarketingTool === 'sms-marketing' && '📱 SMS Marketing Hub'}
              {activeMarketingTool === 'templates' && '📄 Template Library'}
              {activeMarketingTool === 'landing-pages' && '🎯 Landing Page Builder'}
              {activeMarketingTool === 'promotions' && '🎁 Promotions Manager'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setActiveMarketingTool(null)}
              size="small"
            >
              Back to Marketing Automation
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ height: '100%', overflowY: 'auto', p: 0 }}>
          {activeMarketingTool === 'email-marketing' && <EmailMarketing />}
          {activeMarketingTool === 'sms-marketing' && <SmsMarketing />}
          {activeMarketingTool === 'templates' && <Templates />}
          {activeMarketingTool === 'landing-pages' && <PropertyLandingPages />}
          {activeMarketingTool === 'promotions' && <Promotions />}
        </DialogContent>
      </Dialog>

      {/* Enhanced Campaign Dialog with Rich Text Tools */}
      <Dialog open={openCampaignDialog} onClose={() => setOpenCampaignDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedCampaign ? "Edit Campaign" : "Create New Campaign"}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LaunchIcon />}
              onClick={() => navigate('/marketing-automation')}
              size="small"
            >
              Open Automation
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Basic Campaign Info */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Campaign Name"
                  fullWidth
                  required
                  value={campaignFormData.name}
                  onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                  placeholder="Enter campaign name"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>Campaign Type</InputLabel>
                  <Select
                    value={campaignFormData.type}
                    label="Campaign Type"
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, type: e.target.value as Campaign["type"] })}
                  >
                    <MenuItem value="Email">📧 Email</MenuItem>
                    <MenuItem value="SMS">�� SMS</MenuItem>
                    <MenuItem value="Social">📱 Social Media</MenuItem>
                    <MenuItem value="Push">🔔 Push Notification</MenuItem>
                    <MenuItem value="Multi-Channel">🌐 Multi-Channel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={campaignFormData.status}
                    label="Status"
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, status: e.target.value as Campaign["status"] })}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Paused">Paused</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Subject and Preview Text for Email Campaigns */}
            {campaignFormData.type === "Email" && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Subject Line"
                    fullWidth
                    value={campaignFormData.subject}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, subject: e.target.value })}
                    placeholder="Enter email subject line"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Preview Text"
                    fullWidth
                    value={campaignFormData.previewText}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, previewText: e.target.value })}
                    placeholder="Preview text shown in inbox"
                  />
                </Grid>
              </Grid>
            )}

            {/* Marketing Tool Integrations */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">🚀 Marketing Tool Integrations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Template Library */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TemplateIcon /> Templates
                          </Typography>
                          <Autocomplete
                            options={mockTemplates}
                            getOptionLabel={(option) => option.name}
                            value={campaignFormData.selectedTemplate}
                            onChange={(_, value) => handleTemplateSelect(value)}
                            renderInput={(params) => (
                              <TextField {...params} label="Select Template" placeholder="Choose from library" />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Stack>
                                  <Typography variant="body2">{option.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {option.category} • Used {option.usageCount} times
                                  </Typography>
                                </Stack>
                              </Box>
                            )}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setActiveMarketingTool('templates')}
                            startIcon={<LaunchIcon />}
                          >
                            Manage Templates
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Landing Pages */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WebIcon /> Landing Pages
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel>Link Landing Page</InputLabel>
                            <Select
                              value={campaignFormData.selectedLandingPage}
                              label="Link Landing Page"
                              onChange={(e) => {
                                setCampaignFormData({ ...campaignFormData, selectedLandingPage: e.target.value });
                                handleMarketingToolIntegration('Landing Page', e.target.value);
                              }}
                            >
                              {mockLandingPages.map((page) => (
                                <MenuItem key={page.id} value={page.name}>
                                  {page.name} • {page.status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setActiveMarketingTool('landing-pages')}
                            startIcon={<LaunchIcon />}
                          >
                            Manage Landing Pages
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* SMS Integration */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SmsIcon /> SMS Marketing
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel>SMS Template</InputLabel>
                            <Select
                              value={campaignFormData.selectedSmsTemplate}
                              label="SMS Template"
                              onChange={(e) => {
                                setCampaignFormData({ ...campaignFormData, selectedSmsTemplate: e.target.value });
                                handleMarketingToolIntegration('SMS', e.target.value);
                              }}
                            >
                              {mockSmsTemplates.map((template) => (
                                <MenuItem key={template.id} value={template.content}>
                                  {template.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setActiveMarketingTool('sms-marketing')}
                            startIcon={<LaunchIcon />}
                          >
                            SMS Marketing
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Promotions */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalOfferIcon /> Promotions
                          </Typography>
                          <FormControl fullWidth>
                            <InputLabel>Add Promotion</InputLabel>
                            <Select
                              value={campaignFormData.selectedPromotion}
                              label="Add Promotion"
                              onChange={(e) => {
                                setCampaignFormData({ ...campaignFormData, selectedPromotion: e.target.value });
                                handleMarketingToolIntegration('Promotion', e.target.value);
                              }}
                            >
                              {mockPromotions.map((promo) => (
                                <MenuItem key={promo.id} value={promo.description}>
                                  {promo.name} • {promo.active ? 'Active' : 'Inactive'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setActiveMarketingTool('promotions')}
                            startIcon={<LaunchIcon />}
                          >
                            Manage Promotions
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Target Audience */}
            <TextField
              label="Target Audience"
              fullWidth
              required
              value={campaignFormData.targetAudience}
              onChange={(e) => setCampaignFormData({ ...campaignFormData, targetAudience: e.target.value })}
              placeholder="Describe your target audience"
              helperText="e.g., New property owners, High-value customers, etc."
            />

            {/* Rich Text Content Editor */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Campaign Content
              </Typography>

              {/* Rich Text Toolbar */}
              <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                <ButtonGroup size="small" variant="outlined">
                  <Button onClick={() => handleRichTextFormat('bold')} title="Bold">
                    <FormatBoldIcon />
                  </Button>
                  <Button onClick={() => handleRichTextFormat('italic')} title="Italic">
                    <FormatItalicIcon />
                  </Button>
                  <Button onClick={() => handleRichTextFormat('underline')} title="Underline">
                    <FormatUnderlinedIcon />
                  </Button>
                  <Button onClick={() => handleRichTextFormat('list')} title="Bullet List">
                    <FormatListBulletedIcon />
                  </Button>
                  <Button onClick={() => handleRichTextFormat('link')} title="Add Link">
                    <LinkIcon />
                  </Button>
                </ButtonGroup>
                <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                  Select text and click formatting buttons
                </Typography>
              </Paper>

              <TextField
                id="campaign-content"
                fullWidth
                multiline
                rows={10}
                required
                value={campaignFormData.richTextContent}
                onChange={(e) => setCampaignFormData({ ...campaignFormData, richTextContent: e.target.value, content: e.target.value })}
                placeholder="Enter your campaign content... Use the toolbar above for formatting."
                helperText="Use **bold**, *italic*, __underline__ for formatting. Integrations will be appended automatically."
              />
            </Box>

            {/* Schedule */}
            <TextField
              label="Scheduled Date"
              type="datetime-local"
              fullWidth
              value={campaignFormData.scheduledDate}
              onChange={(e) => setCampaignFormData({ ...campaignFormData, scheduledDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty for immediate sending"
            />

            <Alert severity="success">
              <Typography variant="body2">
                🎯 This campaign now integrates with all marketing tools for seamless automation and cross-channel messaging!
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCampaignDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/email-marketing')}
            startIcon={<EmailRoundedIcon />}
          >
            Open Email Marketing
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCampaign}
            disabled={!campaignFormData.name || !campaignFormData.targetAudience || !campaignFormData.richTextContent}
          >
            {selectedCampaign ? "Update Campaign" : "Create Campaign"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAutomationDialog} onClose={() => {
        setOpenAutomationDialog(false);
        setSelectedAutomation(null);
        setAutomationFormData({ name: '', description: '', triggerType: 'Contact Added', emailTemplate: '' });
      }} maxWidth="lg" fullWidth>
        <DialogTitle>{selectedAutomation ? 'Edit' : 'Create'} Marketing Automation</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Automation Name"
              value={automationFormData.name}
              onChange={(e) => setAutomationFormData({ ...automationFormData, name: e.target.value })}
              placeholder="e.g., Welcome Series for New Customers"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={automationFormData.description}
              onChange={(e) => setAutomationFormData({ ...automationFormData, description: e.target.value })}
              placeholder="Describe what this automation does..."
            />

            <FormControl fullWidth>
              <InputLabel>Trigger Event</InputLabel>
              <Select
                value={automationFormData.triggerType}
                label="Trigger Event"
                onChange={(e) => setAutomationFormData({ ...automationFormData, triggerType: e.target.value as AutomationTrigger['type'] })}
              >
                <MenuItem value="Contact Added">Contact Added</MenuItem>
                <MenuItem value="Email Opened">Email Opened</MenuItem>
                <MenuItem value="Link Clicked">Link Clicked</MenuItem>
                <MenuItem value="Form Submitted">Form Submitted</MenuItem>
                <MenuItem value="Date/Time">Date/Time</MenuItem>
                <MenuItem value="Custom Event">Custom Event</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              options={templates}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Email Template"
                  placeholder="Select an email template"
                />
              )}
              onChange={(_, value) => setAutomationFormData({ ...automationFormData, emailTemplate: value?.id || '' })}
            />

            <Alert severity="info">
              Advanced workflow builder with multiple steps, conditions, and triggers will be available in the full automation engine.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAutomationDialog(false);
            setSelectedAutomation(null);
            setAutomationFormData({ name: '', description: '', triggerType: 'Contact Added', emailTemplate: '' });
          }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!automationFormData.name || !automationFormData.description}
            onClick={() => {
              // Here you would save the automation
              console.log('Saving automation:', automationFormData);
              // For now, just close the dialog
              setOpenAutomationDialog(false);
              setSelectedAutomation(null);
              setAutomationFormData({ name: '', description: '', triggerType: 'Contact Added', emailTemplate: '' });
            }}
          >
            {selectedAutomation ? 'Update' : 'Create'} Automation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSegmentDialog} onClose={() => {
        setOpenSegmentDialog(false);
        setSelectedSegment(null);
        setSegmentFormData({ name: '', description: '', criteria: [{ field: 'email', operator: 'contains', value: '', logic: 'AND' }] });
      }} maxWidth="md" fullWidth>
        <DialogTitle>{selectedSegment ? 'Edit' : 'Create'} Audience Segment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Segment Name"
              value={segmentFormData.name}
              onChange={(e) => setSegmentFormData({ ...segmentFormData, name: e.target.value })}
              placeholder="e.g., High-Value Customers"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={segmentFormData.description}
              onChange={(e) => setSegmentFormData({ ...segmentFormData, description: e.target.value })}
              placeholder="Describe this segment..."
            />

            <Typography variant="h6">Segment Criteria</Typography>

            {segmentFormData.criteria.map((criterion, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Field</InputLabel>
                        <Select
                          value={criterion.field}
                          label="Field"
                          onChange={(e) => {
                            const newCriteria = [...segmentFormData.criteria];
                            newCriteria[index].field = e.target.value;
                            setSegmentFormData({ ...segmentFormData, criteria: newCriteria });
                          }}
                        >
                          <MenuItem value="email">Email</MenuItem>
                          <MenuItem value="firstName">First Name</MenuItem>
                          <MenuItem value="lastName">Last Name</MenuItem>
                          <MenuItem value="city">City</MenuItem>
                          <MenuItem value="state">State</MenuItem>
                          <MenuItem value="propertyType">Property Type</MenuItem>
                          <MenuItem value="leadScore">Lead Score</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Operator</InputLabel>
                        <Select
                          value={criterion.operator}
                          label="Operator"
                          onChange={(e) => {
                            const newCriteria = [...segmentFormData.criteria];
                            newCriteria[index].operator = e.target.value as any;
                            setSegmentFormData({ ...segmentFormData, criteria: newCriteria });
                          }}
                        >
                          <MenuItem value="equals">Equals</MenuItem>
                          <MenuItem value="not_equals">Not Equals</MenuItem>
                          <MenuItem value="contains">Contains</MenuItem>
                          <MenuItem value="not_contains">Not Contains</MenuItem>
                          <MenuItem value="greater_than">Greater Than</MenuItem>
                          <MenuItem value="less_than">Less Than</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Value"
                        value={criterion.value}
                        onChange={(e) => {
                          const newCriteria = [...segmentFormData.criteria];
                          newCriteria[index].value = e.target.value;
                          setSegmentFormData({ ...segmentFormData, criteria: newCriteria });
                        }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newCriteria = segmentFormData.criteria.filter((_, i) => i !== index);
                          setSegmentFormData({ ...segmentFormData, criteria: newCriteria });
                        }}
                        disabled={segmentFormData.criteria.length === 1}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            <Button
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setSegmentFormData({
                  ...segmentFormData,
                  criteria: [...segmentFormData.criteria, { field: 'email', operator: 'contains', value: '', logic: 'AND' }]
                });
              }}
            >
              Add Criteria
            </Button>

            <Alert severity="info">
              Advanced segment logic with nested conditions and custom fields will be available in the full segmentation engine.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenSegmentDialog(false);
            setSelectedSegment(null);
            setSegmentFormData({ name: '', description: '', criteria: [{ field: 'email', operator: 'contains', value: '', logic: 'AND' }] });
          }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!segmentFormData.name || !segmentFormData.description}
            onClick={() => {
              // Here you would save the segment
              console.log('Saving segment:', segmentFormData);
              // For now, just close the dialog
              setOpenSegmentDialog(false);
              setSelectedSegment(null);
              setSegmentFormData({ name: '', description: '', criteria: [{ field: 'email', operator: 'contains', value: '', logic: 'AND' }] });
            }}
          >
            {selectedSegment ? 'Update' : 'Create'} Segment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create Email Template</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="info">
              For the full template editing experience with rich text editor, form builder, and advanced features, please use the main Templates page.
            </Alert>
            <Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<OpenInNewRoundedIcon />}
                onClick={() => {
                  setOpenTemplateDialog(false);
                  navigate('/crm/templates');
                }}
                fullWidth
              >
                Open Full Template Editor
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
