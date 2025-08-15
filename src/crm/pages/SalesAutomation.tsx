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
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useCrmData, Deal, Quote, Contact } from "../contexts/CrmDataContext";
import NumberInput from "../components/NumberInput";

interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: "Prospecting" | "Qualification" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  source: string;
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
}

interface DealActivity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task" | "quote" | "proposal";
  title: string;
  description: string;
  date: string;
  duration?: number;
  outcome?: string;
  nextAction?: string;
  attachments?: string[];
}

interface Quote {
  id: string;
  dealId: string;
  quoteNumber: string;
  title: string;
  customer: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  validUntil: string;
  createdBy: string;
  dateCreated: string;
  dateModified: string;
  notes: string;
}

interface QuoteItem {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Pipeline {
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
}

// Marketplace Subscription Management Interfaces
interface SubscriptionPlan {
  id: string;
  name: string;
  type: "Basic" | "Premium" | "Enterprise" | "Custom";
  price: number;
  billingCycle: "monthly" | "yearly" | "one-time";
  features: string[];
  accessLevel: string[];
  maxUsers?: number;
  maxProperties?: number;
  supportLevel: "Basic" | "Priority" | "Premium";
  description: string;
}

interface EmailCode {
  id: string;
  code: string;
  dealId: string;
  subscriptionId?: string;
  email: string;
  status: "Generated" | "Sent" | "Redeemed" | "Expired";
  generatedAt: string;
  sentAt?: string;
  redeemedAt?: string;
  expiryDate: string;
  redemptionAttempts: number;
  planId: string;
}

interface Subscription {
  id: string;
  userId?: string;
  planId: string;
  dealId?: string;
  emailCode?: string;
  status: "Active" | "Inactive" | "Pending" | "Cancelled" | "Expired";
  startDate: string;
  endDate: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Cancelled";
  accessGranted: boolean;
  features: string[];
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceDeal extends Deal {
  dealType: "Property" | "Subscription";
  subscriptionPlanId?: string;
  subscriptionDuration?: number;
  emailCodeGenerated?: boolean;
  codeDeliveryStatus?: "Pending" | "Sent" | "Delivered" | "Failed";
  accessLevel?: string[];
  isMarketplaceSale: boolean;
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

const mockPipelines: Pipeline[] = [
  {
    id: "1",
    name: "Standard Sales Process",
    isDefault: true,
    stages: [
      { id: "1", name: "Prospecting", probability: 10, order: 1, color: "#f44336" },
      { id: "2", name: "Qualification", probability: 25, order: 2, color: "#ff9800" },
      { id: "3", name: "Proposal", probability: 50, order: 3, color: "#2196f3" },
      { id: "4", name: "Negotiation", probability: 75, order: 4, color: "#9c27b0" },
      { id: "5", name: "Closed Won", probability: 100, order: 5, color: "#4caf50" },
      { id: "6", name: "Closed Lost", probability: 0, order: 6, color: "#607d8b" },
    ]
  }
];

// Marketplace Subscription Plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_basic",
    name: "Basic Plan",
    type: "Basic",
    price: 29.99,
    billingCycle: "monthly",
    features: [
      "Up to 5 properties",
      "Basic tenant management",
      "Email support",
      "Mobile app access",
      "Basic reporting"
    ],
    accessLevel: ["dashboard", "properties", "tenants"],
    maxUsers: 1,
    maxProperties: 5,
    supportLevel: "Basic",
    description: "Perfect for individual landlords managing a few properties"
  },
  {
    id: "plan_premium",
    name: "Premium Plan",
    type: "Premium",
    price: 79.99,
    billingCycle: "monthly",
    features: [
      "Up to 25 properties",
      "Advanced tenant management",
      "Work order management",
      "Financial reporting",
      "Email & phone support",
      "Custom branding",
      "API access"
    ],
    accessLevel: ["dashboard", "properties", "tenants", "workorders", "analytics", "api"],
    maxUsers: 3,
    maxProperties: 25,
    supportLevel: "Priority",
    description: "Ideal for growing property management businesses"
  },
  {
    id: "plan_enterprise",
    name: "Enterprise Plan",
    type: "Enterprise",
    price: 199.99,
    billingCycle: "monthly",
    features: [
      "Unlimited properties",
      "Multi-user access",
      "Advanced analytics",
      "Custom integrations",
      "Priority support",
      "White-label solution",
      "Advanced API access",
      "Custom workflows"
    ],
    accessLevel: ["*"], // Full access
    maxUsers: -1, // Unlimited
    maxProperties: -1, // Unlimited
    supportLevel: "Premium",
    description: "Complete solution for large property management companies"
  }
];

// Email Code Management System
const generateEmailCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createEmailCode = (dealId: string, email: string, planId: string): EmailCode => {
  const code = generateEmailCode();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // Code expires in 30 days

  return {
    id: `code_${Date.now()}`,
    code,
    dealId,
    email,
    status: "Generated",
    generatedAt: new Date().toISOString(),
    expiryDate: expiryDate.toISOString(),
    redemptionAttempts: 0,
    planId
  };
};

const validateAndRedeemCode = (code: string, email: string): { valid: boolean; subscription?: Subscription; error?: string } => {
  // This would typically validate against a database
  // For demo purposes, we'll simulate validation
  const emailCode = mockEmailCodes.find(ec => ec.code === code && ec.email === email);

  if (!emailCode) {
    return { valid: false, error: "Invalid code or email" };
  }

  if (emailCode.status === "Redeemed") {
    return { valid: false, error: "Code has already been redeemed" };
  }

  if (new Date(emailCode.expiryDate) < new Date()) {
    return { valid: false, error: "Code has expired" };
  }

  // Create subscription
  const plan = subscriptionPlans.find(p => p.id === emailCode.planId);
  if (!plan) {
    return { valid: false, error: "Invalid subscription plan" };
  }

  const endDate = new Date();
  if (plan.billingCycle === "monthly") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.billingCycle === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    planId: plan.id,
    dealId: emailCode.dealId,
    emailCode: code,
    status: "Active",
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString(),
    paymentStatus: "Paid",
    accessGranted: true,
    features: plan.features,
    autoRenewal: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { valid: true, subscription };
};

// Mock email codes for demonstration
const mockEmailCodes: EmailCode[] = [
  {
    id: "code_1",
    code: "DEMO1234",
    dealId: "deal_1",
    email: "demo@example.com",
    status: "Generated",
    generatedAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    redemptionAttempts: 0,
    planId: "plan_premium"
  }
];

const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Enterprise CRM Implementation",
    company: "Tech Solutions Inc",
    contact: "Sarah Johnson",
    value: 125000,
    stage: "Proposal",
    probability: 75,
    expectedCloseDate: "2024-02-15",
    source: "Website Inquiry",
    assignedTo: "John Smith",
    description: "Complete CRM implementation for 500+ user organization",
    tags: ["Enterprise", "High Value", "Tech"],
    activities: [
      {
        id: "1",
        type: "meeting",
        title: "Discovery Call",
        description: "Initial needs assessment and requirements gathering",
        date: "2024-01-15",
        duration: 60,
        outcome: "Positive - moving to proposal stage"
      }
    ],
    customFields: { priority: "High", segment: "Enterprise" },
    dateCreated: "2024-01-10",
    dateModified: "2024-01-15",
    nextAction: "Send detailed proposal by EOW",
    notes: ["Very interested in automation features", "Budget approved"]
  },
  {
    id: "2",
    title: "Property Management Software",
    company: "Global Corp",
    contact: "Michael Chen",
    value: 75000,
    stage: "Negotiation",
    probability: 85,
    expectedCloseDate: "2024-01-30",
    source: "Referral",
    assignedTo: "Emily Davis",
    description: "Multi-location property management solution",
    tags: ["Property", "Multi-location", "Referral"],
    activities: [
      {
        id: "2",
        type: "call",
        title: "Contract Discussion",
        description: "Reviewing contract terms and pricing",
        date: "2024-01-18",
        duration: 30,
        outcome: "Minor pricing adjustments needed"
      }
    ],
    customFields: { priority: "Medium", segment: "Mid-Market" },
    dateCreated: "2024-01-05",
    dateModified: "2024-01-18",
    nextAction: "Finalize contract terms",
    notes: ["Price sensitive", "Looking for 3-year deal"]
  },
  {
    id: "3",
    title: "Startup Package Deal",
    company: "Startup Ventures",
    contact: "Lisa Rodriguez",
    value: 25000,
    stage: "Qualification",
    probability: 40,
    expectedCloseDate: "2024-02-28",
    source: "Social Media",
    assignedTo: "Mike Wilson",
    description: "CRM solution for growing startup",
    tags: ["Startup", "Small Business", "Growth"],
    activities: [
      {
        id: "3",
        type: "email",
        title: "Product Demo Follow-up",
        description: "Sent demo video and pricing information",
        date: "2024-01-16",
        outcome: "Awaiting response"
      }
    ],
    customFields: { priority: "Low", segment: "SMB" },
    dateCreated: "2024-01-12",
    dateModified: "2024-01-16",
    nextAction: "Schedule follow-up call",
    notes: ["Limited budget", "Fast decision maker"]
  }
];

const mockQuotes: Quote[] = [
  {
    id: "1",
    dealId: "1",
    quoteNumber: "Q-2024-001",
    title: "Enterprise CRM Implementation",
    customer: "Tech Solutions Inc",
    items: [
      {
        id: "1",
        product: "CRM Platform License",
        description: "Annual license for 500 users",
        quantity: 500,
        unitPrice: 120,
        total: 60000
      },
      {
        id: "2",
        product: "Implementation Services",
        description: "Professional setup and configuration",
        quantity: 1,
        unitPrice: 45000,
        total: 45000
      },
      {
        id: "3",
        product: "Training Package",
        description: "Comprehensive user training program",
        quantity: 1,
        unitPrice: 15000,
        total: 15000
      }
    ],
    subtotal: 120000,
    tax: 9600,
    discount: 4600,
    total: 125000,
    status: "Sent",
    validUntil: "2024-02-15",
    createdBy: "John Smith",
    dateCreated: "2024-01-16",
    dateModified: "2024-01-16",
    notes: "Special pricing for multi-year commitment"
  }
];

const getStageColor = (stage: Deal["stage"]) => {
  switch (stage) {
    case "Prospecting": return "error";
    case "Qualification": return "warning";
    case "Proposal": return "info";
    case "Negotiation": return "secondary";
    case "Closed Won": return "success";
    case "Closed Lost": return "default";
    default: return "default";
  }
};

const getQuoteStatusColor = (status: Quote["status"]) => {
  switch (status) {
    case "Sent": return "info";
    case "Accepted": return "success";
    case "Rejected": return "error";
    case "Draft": return "default";
    case "Expired": return "warning";
    default: return "default";
  }
};

export default function SalesAutomation() {
  const navigate = useNavigate();
  const { trackPropertyActivity } = useActivityTracking();
  const { state, addDeal, updateDeal, addQuote, updateQuote, addContact } = useCrmData();
  const { deals, quotes, contacts } = state;
  const [pipelines] = React.useState<Pipeline[]>(mockPipelines);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStage, setFilterStage] = React.useState("All");
  const [openDealDialog, setOpenDealDialog] = React.useState(false);
  const [openQuoteDialog, setOpenQuoteDialog] = React.useState(false);
  const [dealFormData, setDealFormData] = React.useState({
    title: "",
    contactId: "",
    propertyId: "",
    stage: "Lead" as Deal["stage"],
    value: 0,
    probability: 50,
    expectedCloseDate: "",
    description: ""
  });
  const [quoteFormData, setQuoteFormData] = React.useState({
    dealId: "",
    propertyId: "",
    contactId: "",
    monthlyRent: 0,
    securityDeposit: 0,
    applicationFee: 0,
    petDeposit: 0,
    leaseTermMonths: 12,
    validUntil: "",
    notes: ""
  });
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [selectedQuote, setSelectedQuote] = React.useState<Quote | null>(null);

  // Subscription Management State
  const [emailCodes, setEmailCodes] = React.useState<EmailCode[]>(mockEmailCodes);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [codeFormData, setCodeFormData] = React.useState({
    planId: "plan_premium",
    email: "",
    dealId: ""
  });
  const [redemptionFormData, setRedemptionFormData] = React.useState({
    code: "",
    email: ""
  });

  const currentPipeline = pipelines[0]; // Using default pipeline

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === "All" || deal.stage === filterStage;
    
    return matchesSearch && matchesStage;
  });

  const totalDealsValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(d => d.stage === "Closed Won");
  const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const avgDealSize = deals.length > 0 ? totalDealsValue / deals.length : 0;
  const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;

  const getDealsByStage = (stage: string) => {
    return filteredDeals.filter(deal => deal.stage === stage);
  };

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setDealFormData({
      title: "",
      contactId: "",
      propertyId: "",
      stage: "Lead",
      value: 0,
      probability: 50,
      expectedCloseDate: "",
      description: ""
    });
    setOpenDealDialog(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setDealFormData({
      title: deal.title,
      contactId: deal.contactId,
      propertyId: deal.propertyId || "",
      stage: deal.stage,
      value: deal.value,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      description: deal.description
    });
    setOpenDealDialog(true);
  };

  const handleSaveDeal = () => {
    if (selectedDeal) {
      updateDeal({
        ...selectedDeal,
        ...dealFormData,
        activities: selectedDeal.activities
      });
    } else {
      addDeal({
        ...dealFormData,
        activities: []
      });
    }
    setOpenDealDialog(false);
  };

  const handleAddQuote = () => {
    setSelectedQuote(null);
    setQuoteFormData({
      dealId: "",
      propertyId: "",
      contactId: "",
      monthlyRent: 0,
      securityDeposit: 0,
      applicationFee: 0,
      petDeposit: 0,
      leaseTermMonths: 12,
      validUntil: "",
      notes: ""
    });
    setOpenQuoteDialog(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setQuoteFormData({
      dealId: quote.dealId,
      propertyId: quote.propertyId,
      contactId: quote.contactId,
      monthlyRent: quote.monthlyRent,
      securityDeposit: quote.securityDeposit,
      applicationFee: quote.applicationFee,
      petDeposit: quote.petDeposit || 0,
      leaseTermMonths: quote.leaseTermMonths,
      validUntil: quote.validUntil,
      notes: quote.notes || ""
    });
    setOpenQuoteDialog(true);
  };

  const handleSaveQuote = () => {
    const quoteData = {
      ...quoteFormData,
      status: "Draft" as const,
      additionalFees: []
    };

    if (selectedQuote) {
      updateQuote({
        ...selectedQuote,
        ...quoteData
      });
    } else {
      addQuote(quoteData);
    }
    setOpenQuoteDialog(false);
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
          Sales Automation
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={() => console.log('Export sales data')}
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
            Add Deal
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<PipelineIcon />}
            label="Sales Pipeline"
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
            icon={<SubscriptionsIcon />}
            label="Subscriptions"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Sales Pipeline Tab */}
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
                    <Typography variant="h4">${(totalDealsValue / 1000).toFixed(0)}K</Typography>
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
                    <MonetizationOnRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Won Deals</Typography>
                    <Typography variant="h4">${(totalWonValue / 1000).toFixed(0)}K</Typography>
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
                    <AccountBalanceRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Avg Deal Size</Typography>
                    <Typography variant="h4">${(avgDealSize / 1000).toFixed(0)}K</Typography>
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
                    <Typography variant="h6" color="text.secondary">Win Rate</Typography>
                    <Typography variant="h4">{winRate.toFixed(0)}%</Typography>
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
                  placeholder="Search deals..."
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
                  <InputLabel>Filter Stage</InputLabel>
                  <Select
                    value={filterStage}
                    label="Filter Stage"
                    onChange={(e) => setFilterStage(e.target.value)}
                  >
                    <MenuItem value="All">All Stages</MenuItem>
                    {currentPipeline.stages.map((stage) => (
                      <MenuItem key={stage.id} value={stage.name}>
                        {stage.name}
                      </MenuItem>
                    ))}
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
            {currentPipeline.stages.map((stage) => {
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
                        <Typography variant="body2" color="text.secondary">
                          {stageDeals.length} deals • ${(stageValue / 1000).toFixed(0)}K
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
                            <Typography variant="subtitle2" fontWeight="medium" noWrap>
                              {deal.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {deal.company}
                            </Typography>
                            <Box sx={{ mt: 1, mb: 1 }}>
                              <Typography variant="h6" color="primary.main">
                                ${(deal.value / 1000).toFixed(0)}K
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {deal.probability}% • {new Date(deal.expectedCloseDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
                  <TableCell>Deal</TableCell>
                  <TableCell>Company & Contact</TableCell>
                  <TableCell>Value & Stage</TableCell>
                  <TableCell>Probability</TableCell>
                  <TableCell>Close Date</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {deal.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created {new Date(deal.dateCreated).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {deal.company}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {deal.contact}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight="medium">
                          ${deal.value.toLocaleString()}
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
                      <Typography variant="body2">{deal.assignedTo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit Deal">
                          <IconButton
                            size="small"
                            onClick={() => handleEditDeal(deal)}
                          >
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Deal">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeals(prev => prev.filter(d => d.id !== deal.id));
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
                      ${(quotes.reduce((sum, q) => sum + q.total, 0) / 1000).toFixed(0)}K
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
                <TableCell>Customer</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Valid Until</TableCell>
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
                  <TableCell>{quote.customer}</TableCell>
                  <TableCell>{quote.title}</TableCell>
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
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit Quote">
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Quote">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setQuotes(prev => prev.filter(q => q.id !== quote.id));
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

      {/* Sales Analytics Tab */}
      <TabPanel value={currentTab} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Advanced Analytics Coming Soon</Typography>
          <Typography variant="body2">
            This section will include comprehensive sales analytics, forecasting, and performance metrics.
          </Typography>
        </Alert>
      </TabPanel>

      {/* Subscriptions Tab */}
      <TabPanel value={currentTab} index={3}>
        {/* Subscription Plans Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              🚀 Marketplace Subscription Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Manage subscription plans, email codes, and user access for the marketplace.
            </Typography>
          </Grid>

          {/* Subscription Plans Cards */}
          {subscriptionPlans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  border: plan.type === 'Premium' ? 2 : 1,
                  borderColor: plan.type === 'Premium' ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {plan.type === 'Premium' && (
                  <Chip
                    label="MOST POPULAR"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 'bold'
                    }}
                  />
                )}
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
                        {plan.name}
                      </Typography>
                      <Typography variant="h3" color="primary.main" fontWeight="bold">
                        ${plan.price}
                        <Typography component="span" variant="body1" color="text.secondary">
                          /{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </Typography>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Features:
                      </Typography>
                      <Stack spacing={1}>
                        {plan.features.map((feature, index) => (
                          <Stack key={index} direction="row" alignItems="center" spacing={1}>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="body2">{feature}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        • {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} user{plan.maxUsers !== 1 ? 's' : ''}
                        <br />
                        • {plan.maxProperties === -1 ? 'Unlimited' : plan.maxProperties} properties
                        <br />
                        • {plan.supportLevel} support
                      </Typography>
                    </Box>

                    <Button
                      variant={plan.type === 'Premium' ? 'contained' : 'outlined'}
                      fullWidth
                      onClick={() => {
                        // Generate email code for this plan
                        const code = createEmailCode('demo_deal', 'customer@example.com', plan.id);
                        alert(`🎉 Subscription Code Generated!\n\nCode: ${code.code}\nPlan: ${plan.name}\nValid until: ${new Date(code.expiryDate).toLocaleDateString()}\n\nThis code can be used to activate the ${plan.name} subscription.`);
                      }}
                    >
                      Generate Code
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Email Code Management Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">📧 Email Code Management</Typography>

              {/* Code Generation Form */}
              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Generate New Subscription Code
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Subscription Plan</InputLabel>
                      <Select defaultValue="plan_premium" label="Subscription Plan">
                        {subscriptionPlans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name} - ${plan.price}/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Customer Email"
                      type="email"
                      placeholder="customer@example.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ height: '56px' }}
                      onClick={() => {
                        const code = generateEmailCode();
                        alert(`✅ Code Generated: ${code}\n\nThis code has been created and can be sent to the customer for account activation.`);
                      }}
                    >
                      Generate & Send Code
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Code Redemption Section */}
              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Code Redemption System
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Redemption Code"
                      placeholder="Enter 8-character code"
                      inputProps={{ maxLength: 8, style: { textTransform: 'uppercase' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Customer Email"
                      type="email"
                      placeholder="customer@example.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ height: '56px' }}
                      onClick={() => {
                        // Demo redemption validation
                        const result = validateAndRedeemCode('DEMO1234', 'demo@example.com');
                        if (result.valid) {
                          alert(`🎉 Code Redeemed Successfully!\n\nSubscription activated for Premium Plan\nAccess granted to all features\nSubscription expires: ${new Date(result.subscription!.endDate).toLocaleDateString()}`);
                        } else {
                          alert(`❌ Redemption Failed: ${result.error}`);
                        }
                      }}
                    >
                      Validate & Redeem
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Demo Codes Table */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Email Codes
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockEmailCodes.map((code) => {
                        const plan = subscriptionPlans.find(p => p.id === code.planId);
                        return (
                          <TableRow key={code.id}>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                                {code.code}
                              </Typography>
                            </TableCell>
                            <TableCell>{code.email}</TableCell>
                            <TableCell>{plan?.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={code.status}
                                color={
                                  code.status === 'Redeemed' ? 'success' :
                                  code.status === 'Expired' ? 'error' :
                                  code.status === 'Sent' ? 'info' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(code.expiryDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => alert(`📧 Resending code ${code.code} to ${code.email}`)}
                              >
                                <EmailRoundedIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => alert(`🗑️ Code ${code.code} has been deactivated`)}
                              >
                                <DeleteRoundedIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Subscription Analytics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📊 Subscription Analytics</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Subscriptions</Typography>
                    <Typography variant="h4" color="success.main">24</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Monthly Recurring Revenue</Typography>
                    <Typography variant="h4" color="primary.main">$1,847</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Code Redemption Rate</Typography>
                    <Typography variant="h4">87%</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>⚡ Quick Actions</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<EmailRoundedIcon />}
                    onClick={() => alert('📧 Bulk email functionality would open here')}
                  >
                    Send Bulk Codes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadRoundedIcon />}
                    onClick={() => alert('📊 Subscription report exported')}
                  >
                    Export Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsRoundedIcon />}
                    onClick={() => alert('⚙️ Subscription settings would open here')}
                  >
                    Manage Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Deal Dialog */}
      <Dialog open={openDealDialog} onClose={() => setOpenDealDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedDeal ? "Edit Deal" : "Create New Deal"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Deal Title"
              fullWidth
              required
              value={dealFormData.title}
              onChange={(e) => setDealFormData({ ...dealFormData, title: e.target.value })}
              placeholder="Enter deal title"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Contact</InputLabel>
                  <Select
                    value={dealFormData.contactId}
                    label="Contact"
                    onChange={(e) => setDealFormData({ ...dealFormData, contactId: e.target.value })}
                  >
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                        {contact.company && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({contact.company})
                          </Typography>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={dealFormData.stage}
                    label="Stage"
                    onChange={(e) => setDealFormData({ ...dealFormData, stage: e.target.value as Deal["stage"] })}
                  >
                    <MenuItem value="Lead">Lead</MenuItem>
                    <MenuItem value="Qualified">Qualified</MenuItem>
                    <MenuItem value="Proposal">Proposal</MenuItem>
                    <MenuItem value="Negotiation">Negotiation</MenuItem>
                    <MenuItem value="Closed Won">Closed Won</MenuItem>
                    <MenuItem value="Closed Lost">Closed Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Deal Value"
                  fullWidth
                  required
                  value={dealFormData.value}
                  onChange={(value) => setDealFormData({ ...dealFormData, value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Probability (%)"
                  fullWidth
                  value={dealFormData.probability}
                  onChange={(value) => setDealFormData({ ...dealFormData, probability: value })}
                  min={0}
                  max={100}
                  suffix="%"
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <TextField
              label="Expected Close Date"
              type="date"
              fullWidth
              value={dealFormData.expectedCloseDate}
              onChange={(e) => setDealFormData({ ...dealFormData, expectedCloseDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={dealFormData.description}
              onChange={(e) => setDealFormData({ ...dealFormData, description: e.target.value })}
              placeholder="Enter deal description and notes..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDealDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveDeal}
            disabled={!dealFormData.title || !dealFormData.contactId || !dealFormData.value}
          >
            {selectedDeal ? "Update Deal" : "Create Deal"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog open={openQuoteDialog} onClose={() => setOpenQuoteDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedQuote ? "Edit Quote" : "Create New Quote"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={quoteFormData.propertyId}
                    label="Property"
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, propertyId: e.target.value })}
                  >
                    {state.properties.filter(p => p.status === "Available").map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - {property.address}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (${property.monthlyRent.toLocaleString()}/mo)
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Contact</InputLabel>
                  <Select
                    value={quoteFormData.contactId}
                    label="Contact"
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, contactId: e.target.value })}
                  >
                    {contacts.map((contact) => (
                      <MenuItem key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName}
                        {contact.company && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({contact.company})
                          </Typography>
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Monthly Rent"
                  fullWidth
                  required
                  value={quoteFormData.monthlyRent}
                  onChange={(value) => setQuoteFormData({ ...quoteFormData, monthlyRent: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Security Deposit"
                  fullWidth
                  value={quoteFormData.securityDeposit}
                  onChange={(value) => setQuoteFormData({ ...quoteFormData, securityDeposit: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <NumberInput
                  label="Application Fee"
                  fullWidth
                  value={quoteFormData.applicationFee}
                  onChange={(value) => setQuoteFormData({ ...quoteFormData, applicationFee: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <NumberInput
                  label="Pet Deposit"
                  fullWidth
                  value={quoteFormData.petDeposit}
                  onChange={(value) => setQuoteFormData({ ...quoteFormData, petDeposit: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <NumberInput
                  label="Lease Term (Months)"
                  fullWidth
                  value={quoteFormData.leaseTermMonths}
                  onChange={(value) => setQuoteFormData({ ...quoteFormData, leaseTermMonths: value })}
                  min={1}
                  max={36}
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <TextField
              label="Valid Until"
              type="date"
              fullWidth
              value={quoteFormData.validUntil}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, validUntil: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Quote expiration date"
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={quoteFormData.notes}
              onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
              placeholder="Additional terms, conditions, or special offers..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQuoteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveQuote}
            disabled={!quoteFormData.propertyId || !quoteFormData.contactId || !quoteFormData.monthlyRent}
          >
            {selectedQuote ? "Update Quote" : "Create Quote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
