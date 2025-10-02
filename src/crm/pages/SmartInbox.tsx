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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Divider,
  Badge,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem as MenuItemComponent,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  Toolbar,
  AppBar,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing,
} from "../utils/formStyles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import ForwardRoundedIcon from "@mui/icons-material/ForwardRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import QuickReplyRoundedIcon from "@mui/icons-material/QuickReplyRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

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
      id={`inbox-tabpanel-${index}`}
      aria-labelledby={`inbox-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
}

interface InboxMessage {
  id: string;
  type: "email" | "sms" | "call" | "voicemail" | "chat" | "social" | "fax" | "video_call";
  platform?: "facebook" | "instagram" | "twitter" | "linkedin" | "whatsapp" | "telegram";
  subject?: string;
  preview: string;
  content: string;
  sender: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    company?: string;
    type: "contact" | "lead" | "customer" | "prospect" | "vendor";
  };
  recipient: {
    name: string;
    email?: string;
    phone?: string;
  };
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  labels: string[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
  }[];
  thread: {
    id: string;
    messageCount: number;
    participants: string[];
    lastActivity: string;
  };
  aiInsights: {
    sentiment: "positive" | "neutral" | "negative";
    intent: "inquiry" | "complaint" | "request" | "booking" | "follow_up" | "support";
    urgency: number; // 1-10 scale
    suggestedActions: string[];
    autoCategories: string[];
    language: string;
    translation?: string;
  };
  status: "new" | "replied" | "pending" | "resolved" | "forwarded";
  assignedTo?: string;
  duration?: number; // for calls
  recordingUrl?: string; // for calls/voicemails
}

interface SmartFilter {
  id: string;
  name: string;
  rules: {
    field: string;
    operator: string;
    value: string;
  }[];
  isActive: boolean;
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  useCount: number;
}

const mockMessages: InboxMessage[] = [
  {
    id: "msg_001",
    type: "email",
    subject: "Property Viewing Request - Ocean View Villa",
    preview: "Hi, I'm interested in scheduling a viewing for the Ocean View Villa listed on your website...",
    content: "Hi, I'm interested in scheduling a viewing for the Ocean View Villa listed on your website. I'm available this weekend or next week after 3 PM. Please let me know your availability. Best regards, Sarah.",
    sender: {
      id: "contact_001",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar: "/avatars/sarah-j.jpg",
      company: "Tech Solutions Inc",
      type: "lead",
    },
    recipient: {
      name: "Premier Properties",
      email: "info@premierproperties.com",
    },
    timestamp: "2024-01-18T14:30:00Z",
    isRead: false,
    isStarred: false,
    isArchived: false,
    priority: "high",
    labels: ["property-inquiry", "new-lead"],
    thread: {
      id: "thread_001",
      messageCount: 1,
      participants: ["contact_001", "agent_001"],
      lastActivity: "2024-01-18T14:30:00Z",
    },
    aiInsights: {
      sentiment: "positive",
      intent: "inquiry",
      urgency: 8,
      suggestedActions: ["Schedule viewing", "Send property details", "Add to CRM"],
      autoCategories: ["Property Inquiry", "High Priority"],
      language: "en",
    },
    status: "new",
  },
  {
    id: "msg_002",
    type: "sms",
    preview: "Hi! Just confirming our appointment tomorrow at 2 PM for the downtown apartment viewing.",
    content: "Hi! Just confirming our appointment tomorrow at 2 PM for the downtown apartment viewing. Should I bring anything specific? Thanks!",
    sender: {
      id: "contact_002",
      name: "Mike Davis",
      phone: "+1-555-0123",
      type: "customer",
    },
    recipient: {
      name: "John Agent",
      phone: "+1-555-0100",
    },
    timestamp: "2024-01-18T13:45:00Z",
    isRead: true,
    isStarred: true,
    isArchived: false,
    priority: "normal",
    labels: ["appointment", "confirmation"],
    thread: {
      id: "thread_002",
      messageCount: 3,
      participants: ["contact_002", "agent_002"],
      lastActivity: "2024-01-18T13:45:00Z",
    },
    aiInsights: {
      sentiment: "positive",
      intent: "booking",
      urgency: 6,
      suggestedActions: ["Confirm appointment", "Send reminder", "Prepare documents"],
      autoCategories: ["Appointment", "Customer Service"],
      language: "en",
    },
    status: "replied",
  },
  {
    id: "msg_003",
    type: "call",
    preview: "Incoming call from Alex Chen regarding lease renewal",
    content: "Voicemail: Hi, this is Alex Chen from Apt 4B. I wanted to discuss my lease renewal options. My current lease expires next month and I'd like to stay. Please call me back at your convenience. Thanks!",
    sender: {
      id: "contact_003",
      name: "Alex Chen",
      phone: "+1-555-0456",
      type: "customer",
    },
    recipient: {
      name: "Property Manager",
      phone: "+1-555-0200",
    },
    timestamp: "2024-01-18T12:15:00Z",
    isRead: false,
    isStarred: false,
    isArchived: false,
    priority: "normal",
    labels: ["lease-renewal", "voicemail"],
    duration: 45,
    recordingUrl: "/recordings/call_003.mp3",
    thread: {
      id: "thread_003",
      messageCount: 1,
      participants: ["contact_003", "manager_001"],
      lastActivity: "2024-01-18T12:15:00Z",
    },
    aiInsights: {
      sentiment: "neutral",
      intent: "request",
      urgency: 7,
      suggestedActions: ["Call back", "Send lease options", "Schedule meeting"],
      autoCategories: ["Lease Management", "Customer Retention"],
      language: "en",
    },
    status: "pending",
  },
  {
    id: "msg_004",
    type: "social",
    platform: "facebook",
    preview: "Thanks for the quick response! When can we schedule a viewing?",
    content: "Thanks for the quick response! When can we schedule a viewing? I'm very interested in the 2BR apartment and can meet this week.",
    sender: {
      id: "contact_004",
      name: "Emma Wilson",
      type: "prospect",
    },
    recipient: {
      name: "Premier Properties",
    },
    timestamp: "2024-01-18T11:30:00Z",
    isRead: true,
    isStarred: false,
    isArchived: false,
    priority: "high",
    labels: ["facebook", "scheduling"],
    thread: {
      id: "thread_004",
      messageCount: 4,
      participants: ["contact_004", "social_team"],
      lastActivity: "2024-01-18T11:30:00Z",
    },
    aiInsights: {
      sentiment: "positive",
      intent: "booking",
      urgency: 8,
      suggestedActions: ["Schedule viewing", "Send availability", "Connect to CRM"],
      autoCategories: ["Social Media", "Booking Request"],
      language: "en",
    },
    status: "new",
  },
  {
    id: "msg_005",
    type: "chat",
    preview: "I'm having issues with the heating in my apartment. Can someone help?",
    content: "I'm having issues with the heating in my apartment. It's been cold for two days now and I've tried adjusting the thermostat. Can someone come take a look?",
    sender: {
      id: "contact_005",
      name: "David Kim",
      phone: "+1-555-0789",
      type: "customer",
    },
    recipient: {
      name: "Maintenance Team",
    },
    timestamp: "2024-01-18T10:45:00Z",
    isRead: false,
    isStarred: false,
    isArchived: false,
    priority: "urgent",
    labels: ["maintenance", "urgent"],
    thread: {
      id: "thread_005",
      messageCount: 1,
      participants: ["contact_005", "maintenance_team"],
      lastActivity: "2024-01-18T10:45:00Z",
    },
    aiInsights: {
      sentiment: "negative",
      intent: "complaint",
      urgency: 9,
      suggestedActions: ["Create work order", "Assign technician", "Follow up"],
      autoCategories: ["Maintenance", "Urgent"],
      language: "en",
    },
    status: "new",
  },
];

const mockQuickReplies: QuickReply[] = [
  {
    id: "reply_001",
    title: "Thank you for your inquiry",
    content: "Thank you for your inquiry about our property. I'll be happy to assist you with scheduling a viewing. What days and times work best for you?",
    category: "inquiry",
    language: "en",
    useCount: 45,
  },
  {
    id: "reply_002",
    title: "Appointment confirmation",
    content: "Your appointment has been confirmed for {DATE} at {TIME}. Please bring a valid ID and proof of income. We look forward to meeting you!",
    category: "appointment",
    language: "en",
    useCount: 32,
  },
  {
    id: "reply_003",
    title: "Maintenance request received",
    content: "We've received your maintenance request and have assigned it ticket #{TICKET_NUMBER}. Our team will contact you within 24 hours to schedule a visit.",
    category: "maintenance",
    language: "en",
    useCount: 28,
  },
];

export default function SmartInbox() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [messages, setMessages] = React.useState<InboxMessage[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = React.useState<InboxMessage | null>(null);
  const [quickReplies, setQuickReplies] = React.useState<QuickReply[]>(mockQuickReplies);
  const [openComposeDialog, setOpenComposeDialog] = React.useState(false);
  const [openFiltersDialog, setOpenFiltersDialog] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = React.useState("timestamp");
  const [filterType, setFilterType] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false);
  const [showStarredOnly, setShowStarredOnly] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = React.useState(true);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = React.useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleMessageSelect = (message: InboxMessage) => {
    setSelectedMessage(message);
    // Mark as read
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, isRead: true } : m
    ));
  };

  const handleToggleStar = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
    ));
  };

  const handleArchiveMessage = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isArchived: true } : m
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    // Simulate sending reply
    alert("Reply sent successfully!");
    setReplyText("");
    
    // Update message status
    setMessages(prev => prev.map(m => 
      m.id === selectedMessage.id ? { ...m, status: "replied" } : m
    ));
  };

  const getMessageIcon = (type: string, platform?: string) => {
    if (type === "social" && platform) {
      switch (platform) {
        case "facebook": return <FacebookIcon />;
        case "instagram": return <InstagramIcon />;
        case "twitter": return <TwitterIcon />;
        case "linkedin": return <LinkedInIcon />;
        case "whatsapp": return <WhatsAppIcon />;
        case "telegram": return <TelegramIcon />;
        default: return <ChatRoundedIcon />;
      }
    }
    
    switch (type) {
      case "email": return <EmailRoundedIcon />;
      case "sms": return <SmsRoundedIcon />;
      case "call": case "voicemail": return <PhoneRoundedIcon />;
      case "video_call": return <VideoCallRoundedIcon />;
      case "chat": return <ChatRoundedIcon />;
      case "fax": return <AttachFileRoundedIcon />;
      default: return <InboxRoundedIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "error";
      case "high": return "warning";
      case "normal": return "info";
      case "low": return "default";
      default: return "default";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "success";
      case "neutral": return "info";
      case "negative": return "error";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "primary";
      case "replied": return "success";
      case "pending": return "warning";
      case "resolved": return "info";
      case "forwarded": return "secondary";
      default: return "default";
    }
  };

  const filteredMessages = messages
    .filter(message => {
      if (message.isArchived) return false;
      if (showUnreadOnly && message.isRead) return false;
      if (showStarredOnly && !message.isStarred) return false;
      if (filterType !== "all" && message.type !== filterType) return false;
      if (filterStatus !== "all" && message.status !== filterStatus) return false;
      if (filterPriority !== "all" && message.priority !== filterPriority) return false;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        message.subject?.toLowerCase().includes(searchLower) ||
        message.preview.toLowerCase().includes(searchLower) ||
        message.sender.name.toLowerCase().includes(searchLower) ||
        message.labels.some(label => label.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "sender":
          return a.sender.name.localeCompare(b.sender.name);
        default:
          return 0;
      }
    });

  const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;
  const starredCount = messages.filter(m => m.isStarred && !m.isArchived).length;
  const urgentCount = messages.filter(m => m.priority === "urgent" && !m.isArchived).length;

  const drawerWidth = 280;

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 120px)" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative",
            height: "100%",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SendRoundedIcon />}
            onClick={() => setOpenComposeDialog(true)}
          >
            Compose
          </Button>
        </Box>

        <List>
          <ListItemButton selected={selectedTab === 0} onClick={() => setSelectedTab(0)}>
            <ListItemIcon>
              <Badge badgeContent={unreadCount} color="primary">
                <InboxRoundedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItemButton>
          
          <ListItemButton selected={selectedTab === 1} onClick={() => setSelectedTab(1)}>
            <ListItemIcon>
              <Badge badgeContent={starredCount} color="warning">
                <StarRoundedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
          
          <ListItemButton selected={selectedTab === 2} onClick={() => setSelectedTab(2)}>
            <ListItemIcon>
              <Badge badgeContent={urgentCount} color="error">
                <PriorityHighRoundedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Urgent" />
          </ListItemButton>
          
          <ListItemButton selected={selectedTab === 3} onClick={() => setSelectedTab(3)}>
            <ListItemIcon>
              <ArchiveRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Archived" />
          </ListItemButton>
        </List>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            AI Features
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={aiSuggestionsEnabled}
                onChange={(e) => setAiSuggestionsEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Smart Suggestions"
          />
          <FormControlLabel
            control={
              <Switch
                checked={autoTranslateEnabled}
                onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Auto Translate"
          />
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Message Types
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <EmailRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary={messages.filter(m => m.type === "email").length}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SmsRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="SMS" 
                secondary={messages.filter(m => m.type === "sms").length}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ChatRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Social Media" 
                secondary={messages.filter(m => m.type === "social").length}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, [`& .MuiDrawer-paper`]: { width: drawerWidth } }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SendRoundedIcon />}
            onClick={() => { setOpenComposeDialog(true); setDrawerOpen(false); }}
          >
            Compose
          </Button>
        </Box>

        <List>
          <ListItemButton selected={selectedTab === 0} onClick={() => { setSelectedTab(0); setDrawerOpen(false); }}>
            <ListItemIcon>
              <Badge badgeContent={unreadCount} color="primary">
                <InboxRoundedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItemButton>
          <ListItemButton selected={selectedTab === 1} onClick={() => { setSelectedTab(1); setDrawerOpen(false); }}>
            <ListItemIcon>
              <Badge badgeContent={starredCount} color="warning">
                <StarRoundedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
          <ListItemButton selected={selectedTab === 2} onClick={() => { setSelectedTab(2); setDrawerOpen(false); }}>
            <ListItemIcon>
              <Badge badgeContent={urgentCount} color="error">
                <PriorityHighRoundedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Urgent" />
          </ListItemButton>
          <ListItemButton selected={selectedTab === 3} onClick={() => { setSelectedTab(3); setDrawerOpen(false); }}>
            <ListItemIcon>
              <ArchiveRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Archived" />
          </ListItemButton>
        </List>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            AI Features
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={aiSuggestionsEnabled}
                onChange={(e) => setAiSuggestionsEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Smart Suggestions"
          />
          <FormControlLabel
            control={
              <Switch
                checked={autoTranslateEnabled}
                onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Auto Translate"
          />
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Message Types
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <EmailRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={messages.filter(m => m.type === "email").length}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SmsRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="SMS"
                secondary={messages.filter(m => m.type === "sms").length}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ChatRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Social Media"
                secondary={messages.filter(m => m.type === "social").length}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Toolbar */}
        <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
          <IconButton sx={{ display: { xs: 'inline-flex', md: 'none' } }} onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <MenuRoundedIcon />
          </IconButton>
          <TextField
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: 0, sm: 300 }, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListRoundedIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          >
            Filters
          </Button>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="timestamp">Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="sender">Sender</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                size="small"
              />
            }
            label="Unread only"
          />

          <Button
            variant="outlined"
            startIcon={<SyncRoundedIcon />}
            onClick={() => alert("Syncing messages...")}
          >
            Sync
          </Button>
        </Paper>

        <Box sx={{ display: "flex", flexGrow: 1, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Message List */}
          <Paper sx={{ width: { xs: '100%', md: '40%' }, borderRadius: 0, mb: { xs: 2, md: 0 } }}>
            <List sx={{ height: "100%", overflow: "auto" }}>
              {filteredMessages.map((message) => (
                <ListItemButton
                  key={message.id}
                  selected={selectedMessage?.id === message.id}
                  onClick={() => handleMessageSelect(message)}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Stack sx={{ width: "100%", p: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {message.sender.avatar ? (
                          <img src={message.sender.avatar} alt={message.sender.name} />
                        ) : (
                          <PersonRoundedIcon />
                        )}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: message.isRead ? "normal" : "bold" }}
                          >
                            {message.sender.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                            {message.isStarred && (
                              <StarRoundedIcon color="warning" sx={{ fontSize: 16 }} />
                            )}
                            {!message.isRead && (
                              <CircleRoundedIcon color="primary" sx={{ fontSize: 8 }} />
                            )}
                          </Stack>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          {getMessageIcon(message.type, message.platform)}
                          {message.subject && (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: message.isRead ? "normal" : "bold" }}
                            >
                              {message.subject}
                            </Typography>
                          )}
                          <Chip
                            label={message.priority}
                            color={getPriorityColor(message.priority) as any}
                            size="small"
                            sx={{ height: 16, fontSize: "0.6rem" }}
                          />
                        </Stack>
                        
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {message.preview}
                        </Typography>

                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                          {message.labels.slice(0, 2).map((label) => (
                            <Chip
                              key={label}
                              label={label}
                              size="small"
                              variant="outlined"
                              sx={{ height: 16, fontSize: "0.6rem" }}
                            />
                          ))}
                          {aiSuggestionsEnabled && (
                            <Chip
                              icon={<SmartToyRoundedIcon sx={{ fontSize: 12 }} />}
                              label={message.aiInsights.intent}
                              color={getSentimentColor(message.aiInsights.sentiment) as any}
                              size="small"
                              sx={{ height: 16, fontSize: "0.6rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {/* Message Detail */}
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <Paper sx={{ p: 2, borderRadius: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar>
                        {selectedMessage.sender.avatar ? (
                          <img src={selectedMessage.sender.avatar} alt={selectedMessage.sender.name} />
                        ) : (
                          <PersonRoundedIcon />
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedMessage.sender.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedMessage.sender.email || selectedMessage.sender.phone}
                          {selectedMessage.sender.company && ` • ${selectedMessage.sender.company}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={selectedMessage.sender.type}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                    
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Star" sx={uniformTooltipStyles}>
                        <IconButton onClick={() => handleToggleStar(selectedMessage.id)}>
                          {selectedMessage.isStarred ? (
                            <StarRoundedIcon color="warning" />
                          ) : (
                            <StarBorderRoundedIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive" sx={uniformTooltipStyles}>
                        <IconButton onClick={() => handleArchiveMessage(selectedMessage.id)}>
                          <ArchiveRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" sx={uniformTooltipStyles}>
                        <IconButton onClick={() => handleDeleteMessage(selectedMessage.id)}>
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More actions" sx={uniformTooltipStyles}>
                        <IconButton>
                          <MoreVertRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {selectedMessage.subject && (
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {selectedMessage.subject}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={selectedMessage.status}
                      color={getStatusColor(selectedMessage.status) as any}
                      size="small"
                    />
                    <Chip
                      label={selectedMessage.priority}
                      color={getPriorityColor(selectedMessage.priority) as any}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                </Paper>

                {/* AI Insights */}
                {aiSuggestionsEnabled && (
                  <Paper sx={{ p: 2, borderRadius: 0, bgcolor: "background.default" }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <SmartToyRoundedIcon color="primary" />
                      <Typography variant="subtitle2">AI Insights</Typography>
                      <Chip
                        label={`${selectedMessage.aiInsights.sentiment} sentiment`}
                        color={getSentimentColor(selectedMessage.aiInsights.sentiment) as any}
                        size="small"
                      />
                      <Chip
                        label={selectedMessage.aiInsights.intent}
                        color="info"
                        size="small"
                      />
                      <Typography variant="caption">
                        Urgency: {selectedMessage.aiInsights.urgency}/10
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Suggested actions: {selectedMessage.aiInsights.suggestedActions.join(", ")}
                    </Typography>
                  </Paper>
                )}

                {/* Message Content */}
                <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {selectedMessage.content}
                  </Typography>

                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Attachments
                      </Typography>
                      <Stack spacing={1}>
                        {selectedMessage.attachments.map((attachment) => (
                          <Paper key={attachment.id} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                            <AttachFileRoundedIcon />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2">{attachment.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {attachment.size}
                              </Typography>
                            </Box>
                            <Button size="small" startIcon={<DownloadRoundedIcon />}>
                              Download
                            </Button>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {selectedMessage.recordingUrl && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Voice Recording
                      </Typography>
                      <Paper sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <PhoneRoundedIcon />
                          <Typography variant="body2">
                            Call duration: {selectedMessage.duration}s
                          </Typography>
                          <Button size="small" variant="outlined">
                            Play Recording
                          </Button>
                        </Stack>
                      </Paper>
                    </Box>
                  )}
                </Box>

                {/* Reply Section */}
                <Paper sx={{ p: 2, borderRadius: 0 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<QuickReplyRoundedIcon />}
                        size="small"
                      >
                        Quick Replies
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AutoAwesomeRoundedIcon />}
                        size="small"
                      >
                        AI Generate
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<TranslateRoundedIcon />}
                        size="small"
                      >
                        Translate
                      </Button>
                    </Stack>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <Stack direction="row" spacing={1} sx={{ alignSelf: "flex-end", mb: 1 }}>
                            <IconButton size="small">
                              <AttachFileRoundedIcon />
                            </IconButton>
                            <IconButton size="small">
                              <EmojiEmotionsRoundedIcon />
                            </IconButton>
                            <IconButton size="small">
                              <MicRoundedIcon />
                            </IconButton>
                          </Stack>
                        ),
                      }}
                    />
                    
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<ReplyRoundedIcon />}
                          size="small"
                        >
                          Reply
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ForwardRoundedIcon />}
                          size="small"
                        >
                          Forward
                        </Button>
                      </Stack>
                      
                      <Button
                        variant="contained"
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        startIcon={<SendRoundedIcon />}
                      >
                        Send Reply
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <InboxRoundedIcon sx={{ fontSize: 64, color: "text.secondary" }} />
                <Typography variant="h6" color="text.secondary">
                  Select a message to view
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a message from the list to read and respond
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Filter Messages
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="call">Calls</MenuItem>
                <MenuItem value="social">Social Media</MenuItem>
                <MenuItem value="chat">Chat</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="replied">Replied</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                label="Priority"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Menu>
    </Box>
  );
}
