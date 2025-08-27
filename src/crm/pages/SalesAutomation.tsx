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
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Switch,
  FormControlLabel,
  InputAdornment,
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
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import PipelineIcon from "@mui/icons-material/AccountTree";
import QuoteIcon from "@mui/icons-material/RequestQuoteRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ViewColumnRoundedIcon from "@mui/icons-material/ViewColumnRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SubscriptionsIcon from "@mui/icons-material/SubscriptionsRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useCrmData, Deal, Quote, Contact } from "../contexts/CrmDataContext";
import NumberInput from "../components/NumberInput";

// CRM Add-on Sale specific interfaces
interface AddOnDeal {
  id: string;
  productName: string;
  productType: "Power Tools Suite" | "Power Dialer Pro" | "Properties Pack" | "Maintenance Scheduler" | "Photography Service" | "Custom Package";
  customerName: string;
  customerEmail: string;
  currentPlan: "Basic" | "Premium" | "Enterprise";
  stage: "Interest" | "Demo Scheduled" | "Trial Active" | "Purchase Decision" | "Activated" | "Cancelled";
  value: number;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  source: "In-App Notification" | "Support Request" | "Account Manager" | "Marketplace Browse" | "Referral" | "Renewal";
  assignedTo: string;
  description: string;
  tags: string[];
  activities: DealActivity[];
  customFields: Record<string, any>;
  dateCreated: string;
  dateModified: string;
  lostReason?: string;
  nextAction?: string;
  notes: string[];
  trialStartDate?: string;
  trialEndDate?: string;
  demoScheduledDate?: string;
  activationDate?: string;
}

interface DealActivity {
  id: string;
  type: "call" | "email" | "demo" | "trial_start" | "trial_end" | "support" | "follow_up";
  title: string;
  description: string;
  date: string;
  duration?: number;
  outcome?: string;
  nextAction?: string;
  attachments?: string[];
}

interface AddOnQuote {
  id: string;
  dealId: string;
  quoteNumber: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  validUntil: string;
  createdBy: string;
  dateCreated: string;
  dateModified: string;
  notes: string;
  trialOffered: boolean;
  trialDuration?: number;
}

interface QuoteItem {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  billingCycle: "one-time" | "monthly" | "yearly";
}

interface AddOnPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
}

interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  order: number;
  color: string;
  description: string;
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
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// CRM Add-on Sales Pipeline
const addOnPipeline: AddOnPipeline = {
  id: "addon_pipeline",
  name: "CRM Add-on Sales Process",
  isDefault: true,
  stages: [
    { 
      id: "1", 
      name: "Interest", 
      probability: 20, 
      order: 1, 
      color: "#2196f3",
      description: "Customer shows interest in add-on features"
    },
    { 
      id: "2", 
      name: "Demo Scheduled", 
      probability: 40, 
      order: 2, 
      color: "#ff9800",
      description: "Demo or trial setup scheduled"
    },
    { 
      id: "3", 
      name: "Trial Active", 
      probability: 65, 
      order: 3, 
      color: "#9c27b0",
      description: "Customer actively using trial version"
    },
    { 
      id: "4", 
      name: "Purchase Decision", 
      probability: 80, 
      order: 4, 
      color: "#ff5722",
      description: "Customer evaluating purchase decision"
    },
    { 
      id: "5", 
      name: "Activated", 
      probability: 100, 
      order: 5, 
      color: "#4caf50",
      description: "Add-on purchased and activated"
    },
    { 
      id: "6", 
      name: "Cancelled", 
      probability: 0, 
      order: 6, 
      color: "#607d8b",
      description: "Trial cancelled or purchase declined"
    },
  ]
};

// Mock CRM add-on deals
const mockAddOnDeals: AddOnDeal[] = [
  {
    id: "addon_1",
    productName: "Power Tools Suite",
    productType: "Power Tools Suite",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@techproperties.com",
    currentPlan: "Premium",
    stage: "Trial Active",
    value: 29.99,
    probability: 75,
    expectedCloseDate: "2024-02-15",
    source: "In-App Notification",
    assignedTo: "John Smith",
    description: "Customer interested in QR-it and Win-it tools for their marketing campaigns",
    tags: ["Marketing", "Tools", "Trial User"],
    activities: [
      {
        id: "1",
        type: "demo",
        title: "Power Tools Demo",
        description: "Demonstrated QR-it campaign creation and Win-it prize setup",
        date: "2024-01-20",
        duration: 30,
        outcome: "Very interested, started 7-day trial"
      },
      {
        id: "2",
        type: "trial_start",
        title: "Trial Activated",
        description: "7-day trial of Power Tools Suite activated",
        date: "2024-01-20",
        outcome: "Trial code: PT7D-2024-001"
      }
    ],
    customFields: { urgency: "Medium", propertiesCount: 15 },
    dateCreated: "2024-01-18",
    dateModified: "2024-01-20",
    nextAction: "Follow up on trial experience day 5",
    notes: ["Loves the QR code analytics", "Wants to try Win-it for tenant events"],
    trialStartDate: "2024-01-20",
    trialEndDate: "2024-01-27",
    demoScheduledDate: "2024-01-20"
  },
  {
    id: "addon_2",
    productName: "Power Dialer Pro",
    productType: "Power Dialer Pro",
    customerName: "Michael Chen",
    customerEmail: "m.chen@globalproperties.com",
    currentPlan: "Enterprise",
    stage: "Purchase Decision",
    value: 19.99,
    probability: 85,
    expectedCloseDate: "2024-01-30",
    source: "Support Request",
    assignedTo: "Emily Davis",
    description: "Heavy phone user needs professional dialing solution for team",
    tags: ["Communication", "Team License", "High Volume"],
    activities: [
      {
        id: "3",
        type: "call",
        title: "Needs Assessment",
        description: "Discussed current calling challenges and team size",
        date: "2024-01-22",
        duration: 45,
        outcome: "Perfect fit - needs multi-user license"
      },
      {
        id: "4",
        type: "demo",
        title: "Team Demo",
        description: "Demonstrated dialer features to property management team",
        date: "2024-01-23",
        duration: 60,
        outcome: "Team impressed with professional interface"
      }
    ],
    customFields: { urgency: "High", teamSize: 8 },
    dateCreated: "2024-01-21",
    dateModified: "2024-01-23",
    nextAction: "Send team licensing quote",
    notes: ["Needs 8 user licenses", "Budget approved by management"]
  },
  {
    id: "addon_3",
    productName: "Additional Properties Pack (x3)",
    productType: "Properties Pack",
    customerName: "Lisa Rodriguez",
    customerEmail: "lisa@startuprentals.com",
    currentPlan: "Basic",
    stage: "Interest",
    value: 45.00, // 3 packs x $15
    probability: 60,
    expectedCloseDate: "2024-02-10",
    source: "Marketplace Browse",
    assignedTo: "Mike Wilson",
    description: "Growing startup needs to add 15 more properties to Basic plan",
    tags: ["Growth", "Scaling", "Basic Plan"],
    activities: [
      {
        id: "5",
        type: "email",
        title: "Scaling Options",
        description: "Sent information about property packs vs plan upgrade",
        date: "2024-01-24",
        outcome: "Customer prefers flexible property packs"
      }
    ],
    customFields: { urgency: "Medium", currentProperties: 5 },
    dateCreated: "2024-01-24",
    dateModified: "2024-01-24",
    nextAction: "Schedule growth planning call",
    notes: ["Fast-growing company", "Prefers monthly over annual"]
  },
  {
    id: "addon_4",
    productName: "Professional Photography Service",
    productType: "Photography Service",
    customerName: "Robert Kim",
    customerEmail: "robert@luxurymanagement.com",
    currentPlan: "Enterprise",
    stage: "Demo Scheduled",
    value: 499.99,
    probability: 70,
    expectedCloseDate: "2024-02-05",
    source: "Account Manager",
    assignedTo: "Jennifer Adams",
    description: "Luxury property manager needs professional photos for 3 high-end units",
    tags: ["Photography", "Luxury", "Multiple Properties"],
    activities: [
      {
        id: "6",
        type: "call",
        title: "Portfolio Review",
        description: "Reviewed current property photos and discussed upgrade needs",
        date: "2024-01-25",
        duration: 30,
        outcome: "Interested in Premium package for 3 units"
      }
    ],
    customFields: { urgency: "High", propertyValue: "Luxury" },
    dateCreated: "2024-01-25",
    dateModified: "2024-01-25",
    nextAction: "Send sample work and schedule shoot",
    notes: ["High-end market focus", "Quality is priority over price"],
    demoScheduledDate: "2024-01-28"
  }
];

// Mock add-on quotes
const mockAddOnQuotes: AddOnQuote[] = [
  {
    id: "quote_addon_1",
    dealId: "addon_2",
    quoteNumber: "AO-2024-001",
    productName: "Power Dialer Pro - Team License",
    customerName: "Michael Chen",
    customerEmail: "m.chen@globalproperties.com",
    items: [
      {
        id: "1",
        product: "Power Dialer Pro",
        description: "Professional dialing system with analytics",
        quantity: 8,
        unitPrice: 16.99,
        total: 135.92,
        billingCycle: "monthly"
      },
      {
        id: "2",
        product: "Setup & Training",
        description: "Team onboarding and setup assistance",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        billingCycle: "one-time"
      }
    ],
    subtotal: 135.92,
    discount: 15.92, // Team discount
    total: 120.00,
    status: "Sent",
    validUntil: "2024-02-15",
    createdBy: "Emily Davis",
    dateCreated: "2024-01-24",
    dateModified: "2024-01-24",
    notes: "Team pricing discount applied - special rate for 8+ users",
    trialOffered: true,
    trialDuration: 7
  },
  {
    id: "quote_addon_2",
    dealId: "addon_4",
    quoteNumber: "AO-2024-002",
    productName: "Professional Photography - Premium Package",
    customerName: "Robert Kim",
    customerEmail: "robert@luxurymanagement.com",
    items: [
      {
        id: "3",
        product: "Premium Photography Package",
        description: "40 photos + virtual tour + drone shots per property",
        quantity: 3,
        unitPrice: 499.99,
        total: 1499.97,
        billingCycle: "one-time"
      },
      {
        id: "4",
        product: "Rush Delivery",
        description: "24-hour turnaround instead of 48 hours",
        quantity: 3,
        unitPrice: 100.00,
        total: 300.00,
        billingCycle: "one-time"
      }
    ],
    subtotal: 1799.97,
    discount: 300.00, // Multiple property discount
    total: 1499.97,
    status: "Draft",
    validUntil: "2024-02-10",
    createdBy: "Jennifer Adams",
    dateCreated: "2024-01-25",
    dateModified: "2024-01-25",
    notes: "Bulk discount for 3 properties. Rush delivery requested.",
    trialOffered: false
  }
];

const getStageColor = (stage: AddOnDeal["stage"]) => {
  const stageColors = {
    "Interest": "info",
    "Demo Scheduled": "warning", 
    "Trial Active": "secondary",
    "Purchase Decision": "primary",
    "Activated": "success",
    "Cancelled": "default"
  } as const;
  
  return stageColors[stage] || "default";
};

const getQuoteStatusColor = (status: AddOnQuote["status"]) => {
  switch (status) {
    case "Sent": return "info";
    case "Accepted": return "success";
    case "Rejected": return "error";
    case "Draft": return "default";
    case "Expired": return "warning";
    default: return "default";
  }
};

const getProductIcon = (productType: AddOnDeal["productType"]) => {
  switch (productType) {
    case "Power Tools Suite": return <BuildRoundedIcon />;
    case "Power Dialer Pro": return <PhoneRoundedIcon />;
    case "Properties Pack": return <HomeRoundedIcon />;
    case "Maintenance Scheduler": return <SmartToyRoundedIcon />;
    case "Photography Service": return <PhotoCameraRoundedIcon />;
    default: return <ExtensionRoundedIcon />;
  }
};

export default function SalesAutomation() {
  const navigate = useNavigate();
  const { trackPropertyActivity } = useActivityTracking();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStage, setFilterStage] = React.useState("All");
  const [filterProduct, setFilterProduct] = React.useState("All");
  const [deals] = React.useState<AddOnDeal[]>(mockAddOnDeals);
  const [quotes] = React.useState<AddOnQuote[]>(mockAddOnQuotes);
  const [openDealDialog, setOpenDealDialog] = React.useState(false);
  const [openQuoteDialog, setOpenQuoteDialog] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<AddOnDeal | null>(null);
  const [selectedQuote, setSelectedQuote] = React.useState<AddOnQuote | null>(null);

  // Form state for new opportunities
  const [dealFormData, setDealFormData] = React.useState({
    productType: "Power Tools Suite" as AddOnDeal["productType"],
    productName: "",
    customerName: "",
    customerEmail: "",
    currentPlan: "Premium" as AddOnDeal["currentPlan"],
    stage: "Interest" as AddOnDeal["stage"],
    value: 29.99,
    billingCycle: "monthly" as "monthly" | "yearly" | "one-time",
    probability: 50,
    expectedCloseDate: "",
    source: "Marketplace Browse" as AddOnDeal["source"],
    assignedTo: "Account Manager",
    description: "",
    tags: [] as string[],
    trialOffered: false,
    trialDuration: 7,
    notes: ""
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === "All" || deal.stage === filterStage;
    const matchesProduct = filterProduct === "All" || deal.productType === filterProduct;
    
    return matchesSearch && matchesStage && matchesProduct;
  });

  // Calculate metrics
  const totalDealsValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const activatedDeals = deals.filter(d => d.stage === "Activated");
  const totalActivatedValue = activatedDeals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealSize = deals.length > 0 ? totalDealsValue / deals.length : 0;
  const conversionRate = deals.length > 0 ? (activatedDeals.length / deals.length) * 100 : 0;
  const trialDeals = deals.filter(d => d.stage === "Trial Active");

  const getDealsByStage = (stage: string) => {
    return filteredDeals.filter(deal => deal.stage === stage);
  };

  const handleAddDeal = () => {
    // Reset form when adding new deal
    setSelectedDeal(null);
    setDealFormData({
      productType: "Power Tools Suite",
      productName: "Power Tools Suite",
      customerName: "",
      customerEmail: "",
      currentPlan: "Premium",
      stage: "Interest",
      value: 29.99,
      billingCycle: "monthly",
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      source: "Marketplace Browse",
      assignedTo: "Account Manager",
      description: "",
      tags: [],
      trialOffered: false,
      trialDuration: 7,
      notes: ""
    });
    setOpenDealDialog(true);
  };

  const handleEditDeal = (deal: AddOnDeal) => {
    setSelectedDeal(deal);
    setDealFormData({
      productType: deal.productType,
      productName: deal.productName,
      customerName: deal.customerName,
      customerEmail: deal.customerEmail,
      currentPlan: deal.currentPlan,
      stage: deal.stage,
      value: deal.value,
      billingCycle: deal.productType === "Photography Service" ? "one-time" : "monthly",
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      source: deal.source,
      assignedTo: deal.assignedTo,
      description: deal.description,
      tags: deal.tags,
      trialOffered: !!deal.trialStartDate,
      trialDuration: 7,
      notes: deal.notes.join('\n')
    });
    setOpenDealDialog(true);
  };

  const handleAddQuote = () => {
    setOpenQuoteDialog(true);
  };

  const handleEditQuote = (quote: AddOnQuote) => {
    setSelectedQuote(quote);
    setOpenQuoteDialog(true);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            CRM Add-on Sales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage sales of Power Tools, Dialer Pro, Properties Packs, and Services
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={() => console.log('Export add-on sales data')}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<QuoteIcon />}
            onClick={handleAddQuote}
          >
            New Quote
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddDeal}
          >
            Add Opportunity
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<PipelineIcon />}
            label="Add-on Pipeline"
            iconPosition="start"
          />
          <Tab
            icon={<QuoteIcon />}
            label={`Quotes (${quotes.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<DashboardRoundedIcon />}
            label="Sales Analytics"
            iconPosition="start"
          />
          <Tab
            icon={<PlayArrowRoundedIcon />}
            label={`Active Trials (${trialDeals.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Add-on Pipeline Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Sales Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <SellRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Pipeline</Typography>
                    <Typography variant="h4">${totalDealsValue.toFixed(0)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {deals.length} opportunities
                    </Typography>
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
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Activated</Typography>
                    <Typography variant="h4">${totalActivatedValue.toFixed(0)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activatedDeals.length} add-ons sold
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <PlayArrowRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Active Trials</Typography>
                    <Typography variant="h4">{trialDeals.length}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Currently testing add-ons
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <TrendingUpRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Conversion Rate</Typography>
                    <Typography variant="h4">{conversionRate.toFixed(0)}%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Trial to activation
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pipeline Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TextField
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 300 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={filterStage}
                    label="Stage"
                    onChange={(e) => setFilterStage(e.target.value)}
                  >
                    <MenuItem value="All">All Stages</MenuItem>
                    {addOnPipeline.stages.map((stage) => (
                      <MenuItem key={stage.id} value={stage.name}>
                        {stage.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={filterProduct}
                    label="Product"
                    onChange={(e) => setFilterProduct(e.target.value)}
                  >
                    <MenuItem value="All">All Products</MenuItem>
                    <MenuItem value="Power Tools Suite">Power Tools Suite</MenuItem>
                    <MenuItem value="Power Dialer Pro">Power Dialer Pro</MenuItem>
                    <MenuItem value="Properties Pack">Properties Pack</MenuItem>
                    <MenuItem value="Maintenance Scheduler">Maintenance Scheduler</MenuItem>
                    <MenuItem value="Photography Service">Photography Service</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="kanban">
                  <ViewColumnRoundedIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListRoundedIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </CardContent>
        </Card>

        {viewMode === 'kanban' ? (
          /* Kanban View */
          <Grid container spacing={2}>
            {addOnPipeline.stages.map((stage) => {
              const stageDeals = getDealsByStage(stage.name);
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
              
              return (
                <Grid item xs={12} sm={6} md={2} key={stage.id}>
                  <Paper
                    sx={{
                      p: 2,
                      minHeight: 500,
                      bgcolor: 'background.default',
                      border: `2px solid ${stage.color}20`,
                      borderTop: `4px solid ${stage.color}`
                    }}
                  >
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" fontWeight="medium" color={stage.color}>
                          {stage.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stageDeals.length} deals • ${stageValue.toFixed(0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {stage.description}
                        </Typography>
                      </Box>
                      
                      {stageDeals.map((deal) => (
                        <Card 
                          key={deal.id}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 3 }
                          }}
                          onClick={() => handleEditDeal(deal)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                              {getProductIcon(deal.productType)}
                              <Typography variant="subtitle2" fontWeight="medium" noWrap>
                                {deal.productName}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {deal.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {deal.currentPlan} Plan
                            </Typography>
                            <Box sx={{ mt: 1, mb: 1 }}>
                              <Typography variant="h6" color="primary.main">
                                ${deal.value}
                                <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                                  {deal.productType === "Photography Service" ? "" : "/mo"}
                                </Typography>
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {deal.probability}% • {new Date(deal.expectedCloseDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            {deal.trialStartDate && deal.stage === "Trial Active" && (
                              <Alert severity="info" sx={{ mt: 1, p: 0.5 }}>
                                <Typography variant="caption">
                                  Trial ends {new Date(deal.trialEndDate!).toLocaleDateString()}
                                </Typography>
                              </Alert>
                            )}
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                              {deal.tags.slice(0, 2).map((tag, index) => (
                                <Chip key={index} label={tag} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          /* List View */
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product & Customer</TableCell>
                  <TableCell>Current Plan</TableCell>
                  <TableCell>Value & Stage</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Expected Close</TableCell>
                  <TableCell>Trial Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {getProductIcon(deal.productType)}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {deal.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {deal.customerName}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={deal.currentPlan} size="small" />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="medium">
                          ${deal.value}{deal.productType === "Photography Service" ? "" : "/mo"}
                        </Typography>
                        <Chip
                          label={deal.stage}
                          color={getStageColor(deal.stage)}
                          size="small"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{deal.probability}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, deal.probability || 0))}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {deal.trialStartDate ? (
                        <Box>
                          <Typography variant="caption" color="success.main">
                            Active Trial
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Ends {new Date(deal.trialEndDate!).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No trial
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleEditDeal(deal)}
                          >
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Quotes Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <QuoteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Quotes</Typography>
                    <Typography variant="h4">{quotes.length}</Typography>
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
                    <ThumbUpRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Accepted</Typography>
                    <Typography variant="h4">
                      {quotes.filter(q => q.status === "Accepted").length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <CalendarTodayRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Pending</Typography>
                    <Typography variant="h4">
                      {quotes.filter(q => q.status === "Sent").length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>$</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Quote Value</Typography>
                    <Typography variant="h4">
                      ${quotes.reduce((sum, q) => sum + q.total, 0).toFixed(0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quote #</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell>Trial Offered</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {quote.quoteNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{quote.productName}</TableCell>
                  <TableCell>{quote.customerName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ${quote.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={quote.status}
                      color={getQuoteStatusColor(quote.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(quote.validUntil).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {quote.trialOffered ? (
                      <Chip label={`${quote.trialDuration} days`} color="info" size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">No</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit Quote">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <EditRoundedIcon />
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

      {/* Sales Analytics Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most Popular Add-ons
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Power Tools Suite</Typography>
                      <Typography variant="body2" fontWeight="medium">45% of sales</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={45} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Properties Pack</Typography>
                      <Typography variant="body2" fontWeight="medium">30% of sales</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={30} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Power Dialer Pro</Typography>
                      <Typography variant="body2" fontWeight="medium">15% of sales</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={15} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Photography Service</Typography>
                      <Typography variant="body2" fontWeight="medium">10% of sales</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={10} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversion by Plan Type
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Enterprise Plan</Typography>
                      <Typography variant="body2" fontWeight="medium">85% conversion</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={85} color="success" />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Premium Plan</Typography>
                      <Typography variant="body2" fontWeight="medium">65% conversion</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={65} color="warning" />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Basic Plan</Typography>
                      <Typography variant="body2" fontWeight="medium">35% conversion</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={35} color="error" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Active Trials Tab */}
      <TabPanel value={currentTab} index={3}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Active Trial Management</Typography>
          <Typography variant="body2">
            Monitor and manage customers who are currently testing add-on features. Follow up before trials expire to maximize conversion.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {trialDeals.map((deal) => (
            <Grid item xs={12} md={6} lg={4} key={deal.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {getProductIcon(deal.productType)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{deal.productName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {deal.customerName}
                        </Typography>
                      </Box>
                      <Chip label="TRIAL" color="secondary" size="small" />
                    </Stack>

                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Trial Progress
                      </Typography>
                      {deal.trialStartDate && deal.trialEndDate && (
                        <Box>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="caption">
                              Started: {new Date(deal.trialStartDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption">
                              Ends: {new Date(deal.trialEndDate).toLocaleDateString()}
                            </Typography>
                          </Stack>
                          {(() => {
                            const start = new Date(deal.trialStartDate).getTime();
                            const end = new Date(deal.trialEndDate).getTime();
                            const now = new Date().getTime();
                            const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                            const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                            
                            return (
                              <>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progress}
                                  color={daysLeft <= 2 ? "error" : daysLeft <= 5 ? "warning" : "primary"}
                                />
                                <Typography variant="caption" color={daysLeft <= 2 ? "error.main" : "text.secondary"}>
                                  {daysLeft > 0 ? `${daysLeft} days remaining` : "Trial expired"}
                                </Typography>
                              </>
                            );
                          })()}
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        ${deal.value}/month after trial
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {deal.probability}% likelihood to convert
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => alert(`Following up with ${deal.customerName} about their ${deal.productName} trial`)}
                      >
                        Follow Up
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleEditDeal(deal)}
                      >
                        Convert
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add/Edit Opportunity Dialog */}
      <Dialog open={openDealDialog} onClose={() => setOpenDealDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            {getProductIcon(dealFormData.productType)}
            <Typography variant="h6">
              {selectedDeal ? "Edit Opportunity" : "Add New Opportunity"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Product Selection */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary.main">
                  🛍️ Product & Pricing
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Product Type</InputLabel>
                  <Select
                    value={dealFormData.productType}
                    label="Product Type"
                    onChange={(e) => {
                      const productType = e.target.value as AddOnDeal["productType"];
                      const productInfo = {
                        "Power Tools Suite": { name: "Power Tools Suite", price: 29.99, billing: "monthly" },
                        "Power Dialer Pro": { name: "Power Dialer Pro", price: 19.99, billing: "monthly" },
                        "Properties Pack": { name: "Additional Properties Pack", price: 15.00, billing: "monthly" },
                        "Maintenance Scheduler": { name: "Smart Maintenance Scheduler", price: 2.50, billing: "monthly" },
                        "Photography Service": { name: "Professional Photography", price: 299.99, billing: "one-time" },
                        "Custom Package": { name: "Custom Package", price: 0, billing: "monthly" }
                      }[productType];

                      setDealFormData(prev => ({
                        ...prev,
                        productType,
                        productName: productInfo.name,
                        value: productInfo.price,
                        billingCycle: productInfo.billing as any
                      }));
                    }}
                  >
                    <MenuItem value="Power Tools Suite">🛠️ Power Tools Suite</MenuItem>
                    <MenuItem value="Power Dialer Pro">📞 Power Dialer Pro</MenuItem>
                    <MenuItem value="Properties Pack">🏠 Properties Pack</MenuItem>
                    <MenuItem value="Maintenance Scheduler">🔧 Maintenance Scheduler</MenuItem>
                    <MenuItem value="Photography Service">📸 Photography Service</MenuItem>
                    <MenuItem value="Custom Package">📦 Custom Package</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={dealFormData.productName}
                  onChange={(e) => setDealFormData(prev => ({...prev, productName: e.target.value}))}
                  placeholder="Customize product name if needed"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={dealFormData.value}
                  onChange={(e) => setDealFormData(prev => ({...prev, value: parseFloat(e.target.value) || 0}))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Billing Cycle</InputLabel>
                  <Select
                    value={dealFormData.billingCycle}
                    label="Billing Cycle"
                    onChange={(e) => setDealFormData(prev => ({...prev, billingCycle: e.target.value as any}))}
                  >
                    <MenuItem value="monthly">Monthly Subscription</MenuItem>
                    <MenuItem value="yearly">Yearly Subscription</MenuItem>
                    <MenuItem value="one-time">One-time Payment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Revenue Impact
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ${dealFormData.billingCycle === "yearly"
                      ? (dealFormData.value * 12).toFixed(0)
                      : dealFormData.value.toFixed(0)}
                    {dealFormData.billingCycle === "yearly" ? "/year" :
                     dealFormData.billingCycle === "monthly" ? "/month" : " total"}
                  </Typography>
                </Box>
              </Grid>

              {/* Customer Information */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="h6" gutterBottom color="primary.main" sx={{ mt: 2 }}>
                  👤 Customer Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={dealFormData.customerName}
                  onChange={(e) => setDealFormData(prev => ({...prev, customerName: e.target.value}))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  type="email"
                  value={dealFormData.customerEmail}
                  onChange={(e) => setDealFormData(prev => ({...prev, customerEmail: e.target.value}))}
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Current Plan</InputLabel>
                  <Select
                    value={dealFormData.currentPlan}
                    label="Current Plan"
                    onChange={(e) => setDealFormData(prev => ({...prev, currentPlan: e.target.value as any}))}
                  >
                    <MenuItem value="Basic">Basic Plan</MenuItem>
                    <MenuItem value="Premium">Premium Plan</MenuItem>
                    <MenuItem value="Enterprise">Enterprise Plan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Lead Source</InputLabel>
                  <Select
                    value={dealFormData.source}
                    label="Lead Source"
                    onChange={(e) => setDealFormData(prev => ({...prev, source: e.target.value as any}))}
                  >
                    <MenuItem value="In-App Notification">In-App Notification</MenuItem>
                    <MenuItem value="Support Request">Support Request</MenuItem>
                    <MenuItem value="Account Manager">Account Manager</MenuItem>
                    <MenuItem value="Marketplace Browse">Marketplace Browse</MenuItem>
                    <MenuItem value="Referral">Referral</MenuItem>
                    <MenuItem value="Renewal">Renewal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Assigned To"
                  value={dealFormData.assignedTo}
                  onChange={(e) => setDealFormData(prev => ({...prev, assignedTo: e.target.value}))}
                />
              </Grid>

              {/* Sales Pipeline */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="h6" gutterBottom color="primary.main" sx={{ mt: 2 }}>
                  📈 Sales Pipeline
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Pipeline Stage</InputLabel>
                  <Select
                    value={dealFormData.stage}
                    label="Pipeline Stage"
                    onChange={(e) => setDealFormData(prev => ({...prev, stage: e.target.value as any}))}
                  >
                    <MenuItem value="Interest">Interest</MenuItem>
                    <MenuItem value="Demo Scheduled">Demo Scheduled</MenuItem>
                    <MenuItem value="Trial Active">Trial Active</MenuItem>
                    <MenuItem value="Purchase Decision">Purchase Decision</MenuItem>
                    <MenuItem value="Activated">Activated</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Probability (%)"
                  type="number"
                  value={dealFormData.probability}
                  onChange={(e) => setDealFormData(prev => ({...prev, probability: parseInt(e.target.value) || 0}))}
                  InputProps={{
                    inputProps: { min: 0, max: 100 },
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Expected Close Date"
                  type="date"
                  value={dealFormData.expectedCloseDate}
                  onChange={(e) => setDealFormData(prev => ({...prev, expectedCloseDate: e.target.value}))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Trial Setup */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="h6" gutterBottom color="primary.main" sx={{ mt: 2 }}>
                  🔄 Trial Setup
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dealFormData.trialOffered}
                      onChange={(e) => setDealFormData(prev => ({...prev, trialOffered: e.target.checked}))}
                    />
                  }
                  label="Offer Free Trial"
                />
                {dealFormData.trialOffered && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Trial will generate activation code for customer
                  </Alert>
                )}
              </Grid>

              {dealFormData.trialOffered && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Trial Duration"
                    type="number"
                    value={dealFormData.trialDuration}
                    onChange={(e) => setDealFormData(prev => ({...prev, trialDuration: parseInt(e.target.value) || 7}))}
                    InputProps={{
                      inputProps: { min: 1, max: 30 },
                      endAdornment: <InputAdornment position="end">days</InputAdornment>
                    }}
                  />
                </Grid>
              )}

              {/* Additional Details */}
              <Grid item xs={12}>
                <Divider />
                <Typography variant="h6" gutterBottom color="primary.main" sx={{ mt: 2 }}>
                  📝 Additional Details
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description & Notes"
                  multiline
                  rows={3}
                  value={dealFormData.description}
                  onChange={(e) => setDealFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe customer needs, product fit, key discussion points..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma-separated)"
                  value={dealFormData.tags.join(', ')}
                  onChange={(e) => setDealFormData(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  placeholder="e.g., high-priority, enterprise, trial-user"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDealDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Here you would normally save to your backend/state management
              console.log('Saving opportunity:', dealFormData);

              // Show success message
              alert(`✅ Opportunity ${selectedDeal ? 'updated' : 'created'} successfully!\n\nProduct: ${dealFormData.productName}\nCustomer: ${dealFormData.customerName}\nValue: $${dealFormData.value}/${dealFormData.billingCycle}\nStage: ${dealFormData.stage}${dealFormData.trialOffered ? '\n🔄 Trial offered: ' + dealFormData.trialDuration + ' days' : ''}`);

              setOpenDealDialog(false);
            }}
            startIcon={selectedDeal ? <EditRoundedIcon /> : <AddRoundedIcon />}
          >
            {selectedDeal ? "Update Opportunity" : "Create Opportunity"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quote Dialog (Enhanced) */}
      <Dialog open={openQuoteDialog} onClose={() => setOpenQuoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedQuote ? "Edit Quote" : "Create New Quote"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enhanced quote creation with pricing tiers, discounts, and trial offers will be implemented here.
            Features will include:
            • Product selection from marketplace
            • Volume discounts for multiple licenses
            • Trial period offerings
            • Custom pricing for enterprise deals
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This will integrate with the opportunity data and support all billing cycles (monthly, yearly, one-time).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuoteDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<QuoteIcon />}>
            {selectedQuote ? "Update Quote" : "Create Quote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
