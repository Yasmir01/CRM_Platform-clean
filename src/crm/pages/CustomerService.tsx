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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  Badge,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  category: "Technical" | "Billing" | "Feature Request" | "Bug Report" | "General";
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  responseTime?: number;
  resolutionTime?: number;
  satisfaction?: number;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: "Customer" | "Agent" | "System";
  };
  timestamp: string;
  attachments?: string[];
  isInternal?: boolean;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  rating: number;
}

interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description: string;
  articleCount: number;
  icon: string;
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
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const mockTickets: SupportTicket[] = [
  {
    id: "T-001",
    title: "Unable to upload property photos",
    description: "Getting error when trying to upload photos to property listing",
    status: "Open",
    priority: "High",
    category: "Technical",
    customer: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@techsolutions.com",
      phone: "(555) 123-4567",
      company: "Tech Solutions Inc"
    },
    tags: ["upload", "photos", "bug"],
    createdAt: "2024-01-18T10:30:00Z",
    updatedAt: "2024-01-18T11:15:00Z",
    messages: [
      {
        id: "1",
        content: "I'm trying to upload photos to my property listing but keep getting a 'File too large' error even with small images.",
        author: { id: "1", name: "Sarah Johnson", role: "Customer" },
        timestamp: "2024-01-18T10:30:00Z"
      },
      {
        id: "2",
        content: "Hi Sarah, thank you for reporting this issue. Can you tell me what file format and size you're trying to upload?",
        author: { id: "agent1", name: "Mike Wilson", role: "Agent" },
        timestamp: "2024-01-18T11:15:00Z"
      }
    ]
  },
  {
    id: "T-002",
    title: "Billing question about subscription",
    description: "Need clarification on billing cycle and features included",
    status: "Resolved",
    priority: "Medium",
    category: "Billing",
    customer: {
      id: "2",
      name: "Michael Chen",
      email: "michael@globalcorp.com",
      company: "Global Corp"
    },
    assignedTo: "Emily Davis",
    tags: ["billing", "subscription"],
    createdAt: "2024-01-17T14:20:00Z",
    updatedAt: "2024-01-18T09:45:00Z",
    resolvedAt: "2024-01-18T09:45:00Z",
    responseTime: 45,
    resolutionTime: 1245,
    satisfaction: 5,
    messages: [
      {
        id: "3",
        content: "I was charged for features I don't think I'm using. Can you explain what's included in my plan?",
        author: { id: "2", name: "Michael Chen", role: "Customer" },
        timestamp: "2024-01-17T14:20:00Z"
      },
      {
        id: "4",
        content: "I've reviewed your account and sent you a detailed breakdown of your subscription. The charges are correct for your Pro plan features.",
        author: { id: "agent2", name: "Emily Davis", role: "Agent" },
        timestamp: "2024-01-18T09:45:00Z"
      }
    ]
  }
];

const mockKnowledgeBaseCategories: KnowledgeBaseCategory[] = [
  {
    id: "1",
    name: "Getting Started",
    description: "Basic setup and onboarding guides",
    articleCount: 12,
    icon: "🚀"
  },
  {
    id: "2",
    name: "Property Management",
    description: "Managing properties, tenants, and listings",
    articleCount: 25,
    icon: "🏠"
  },
  {
    id: "3",
    name: "Billing & Subscriptions",
    description: "Payment, billing, and subscription information",
    articleCount: 8,
    icon: "💳"
  },
  {
    id: "4",
    name: "Troubleshooting",
    description: "Common issues and solutions",
    articleCount: 18,
    icon: "🔧"
  },
  {
    id: "5",
    name: "Integrations",
    description: "Third-party integrations and API usage",
    articleCount: 15,
    icon: "🔗"
  }
];

const mockKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
  {
    id: "1",
    title: "How to Add Your First Property",
    content: "Step-by-step guide to adding properties to your CRM...",
    summary: "Learn how to quickly add and configure your first property in the system",
    category: "Getting Started",
    tags: ["properties", "setup", "beginner"],
    author: "Support Team",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    published: true,
    views: 1250,
    helpful: 89,
    notHelpful: 12,
    rating: 4.7
  },
  {
    id: "2",
    title: "Understanding Your Billing Cycle",
    content: "Detailed explanation of billing cycles, prorations, and charges...",
    summary: "Everything you need to know about billing and subscription management",
    category: "Billing & Subscriptions",
    tags: ["billing", "subscription", "payments"],
    author: "Support Team",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
    published: true,
    views: 890,
    helpful: 67,
    notHelpful: 8,
    rating: 4.5
  }
];

const getStatusColor = (status: SupportTicket["status"]) => {
  switch (status) {
    case "Open": return "error";
    case "In Progress": return "warning";
    case "Pending": return "info";
    case "Resolved": return "success";
    case "Closed": return "default";
    default: return "default";
  }
};

const getPriorityColor = (priority: SupportTicket["priority"]) => {
  switch (priority) {
    case "Urgent": return "error";
    case "High": return "warning";
    case "Medium": return "info";
    case "Low": return "success";
    default: return "default";
  }
};

export default function CustomerService() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [tickets, setTickets] = React.useState<SupportTicket[]>(mockTickets);
  const [knowledgeBase, setKnowledgeBase] = React.useState<KnowledgeBaseArticle[]>(mockKnowledgeBaseArticles);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("All");
  const [filterPriority, setFilterPriority] = React.useState("All");
  const [openTicketDialog, setOpenTicketDialog] = React.useState(false);
  const [openArticleDialog, setOpenArticleDialog] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [selectedArticle, setSelectedArticle] = React.useState<KnowledgeBaseArticle | null>(null);
  const [newTicketFormData, setNewTicketFormData] = React.useState({
    title: "",
    priority: "Medium" as SupportTicket["priority"],
    category: "General" as SupportTicket["category"],
    customerEmail: "",
    customerName: "",
    customerPhone: "",
    customerCompany: "",
    description: "",
    assignedTo: ""
  });
  const [articleFormData, setArticleFormData] = React.useState({
    title: "",
    content: "",
    summary: "",
    category: "",
    tags: "",
    status: "Draft"
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "All" || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === "Open").length;
  const inProgressTickets = tickets.filter(t => t.status === "In Progress").length;
  const resolvedToday = tickets.filter(t => 
    t.resolvedAt && new Date(t.resolvedAt).toDateString() === new Date().toDateString()
  ).length;

  const avgResponseTime = tickets
    .filter(t => t.responseTime)
    .reduce((sum, t) => sum + (t.responseTime || 0), 0) / 
    tickets.filter(t => t.responseTime).length || 0;

  const avgSatisfaction = tickets
    .filter(t => t.satisfaction)
    .reduce((sum, t) => sum + (t.satisfaction || 0), 0) /
    tickets.filter(t => t.satisfaction).length || 0;

  const handleCreateTicket = () => {
    // Validate required fields
    if (!newTicketFormData.title.trim()) {
      alert('Please enter a ticket title');
      return;
    }
    if (!newTicketFormData.customerEmail.trim()) {
      alert('Please enter customer email');
      return;
    }
    if (!newTicketFormData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    // Create new ticket
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      id: `T-${String(tickets.length + 1).padStart(3, '0')}`,
      title: newTicketFormData.title,
      description: newTicketFormData.description,
      status: "Open",
      priority: newTicketFormData.priority,
      category: newTicketFormData.category,
      customer: {
        id: Date.now().toString(),
        name: newTicketFormData.customerName || newTicketFormData.customerEmail.split('@')[0],
        email: newTicketFormData.customerEmail,
        phone: newTicketFormData.customerPhone || undefined,
        company: newTicketFormData.customerCompany || undefined
      },
      assignedTo: newTicketFormData.assignedTo || undefined,
      tags: [newTicketFormData.category.toLowerCase().replace(' ', '-')],
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: "1",
          content: newTicketFormData.description,
          author: {
            id: Date.now().toString(),
            name: newTicketFormData.customerName || newTicketFormData.customerEmail.split('@')[0],
            role: "Customer"
          },
          timestamp: now
        }
      ]
    };

    // Add ticket to state
    setTickets(prev => [newTicket, ...prev]);

    // Reset form and close dialog
    setNewTicketFormData({
      title: "",
      priority: "Medium",
      category: "General",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      customerCompany: "",
      description: "",
      assignedTo: ""
    });
    setOpenTicketDialog(false);

    alert(`Ticket ${newTicket.id} created successfully!`);
  };

  const handleOpenNewTicketDialog = () => {
    setSelectedTicket(null);
    setNewTicketFormData({
      title: "",
      priority: "Medium",
      category: "General",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      customerCompany: "",
      description: "",
      assignedTo: ""
    });
    setOpenTicketDialog(true);
  };

  const handleUpdateTicketField = (ticketId: string, field: string, value: any) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            [field]: value,
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));

    // Also update the selectedTicket if it's the one being edited
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, [field]: value } : null);
    }

    // Show visual feedback
    const fieldNames: { [key: string]: string } = {
      status: 'Status',
      assignedTo: 'Assignment',
      priority: 'Priority'
    };

    const fieldName = fieldNames[field] || field;
    const displayValue = value || 'None';

    // You could replace this with a toast notification for better UX
    console.log(`✓ ${fieldName} updated to: ${displayValue}`);
  };

  const handleSaveArticle = (status: string) => {
    const now = new Date().toISOString();
    const tagsArray = articleFormData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);

    if (selectedArticle) {
      const updatedArticle: KnowledgeBaseArticle = {
        ...selectedArticle,
        title: articleFormData.title,
        content: articleFormData.content,
        summary: articleFormData.summary,
        category: articleFormData.category,
        tags: tagsArray,
        published: status === "Published",
        updatedAt: now
      };

      setKnowledgeBase(prev =>
        prev.map(article => article.id === selectedArticle.id ? updatedArticle : article)
      );
    } else {
      const newArticle: KnowledgeBaseArticle = {
        id: Date.now().toString(),
        title: articleFormData.title,
        content: articleFormData.content,
        summary: articleFormData.summary,
        category: articleFormData.category,
        tags: tagsArray,
        author: "Current User",
        createdAt: now,
        updatedAt: now,
        published: status === "Published",
        views: 0,
        helpful: 0,
        notHelpful: 0,
        rating: 0
      };

      setKnowledgeBase(prev => [newArticle, ...prev]);
    }

    setOpenArticleDialog(false);
    setSelectedArticle(null);
    setArticleFormData({
      title: "",
      content: "",
      summary: "",
      category: "",
      tags: "",
      status: "Draft"
    });
  };

  const handleEditArticle = (article: KnowledgeBaseArticle) => {
    setSelectedArticle(article);
    setArticleFormData({
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.category,
      tags: article.tags.join(", "),
      status: article.published ? "Published" : "Draft"
    });
    setOpenArticleDialog(true);
  };

  const handleDeleteArticle = (articleId: string) => {
    setKnowledgeBase(prev => prev.filter(article => article.id !== articleId));
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
          Customer Service
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<MenuBookRoundedIcon />}
            onClick={() => setOpenArticleDialog(true)}
          >
            Add Article
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenNewTicketDialog}
          >
            New Ticket
          </Button>
        </Stack>
      </Stack>

      {/* Support Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ConfirmationNumberRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Tickets</Typography>
                  <Typography variant="h4">{totalTickets}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <PriorityHighRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Open Tickets</Typography>
                  <Typography variant="h4">{openTickets}</Typography>
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
                  <AccessTimeRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">In Progress</Typography>
                  <Typography variant="h4">{inProgressTickets}</Typography>
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
                  <CheckCircleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Resolved Today</Typography>
                  <Typography variant="h4">{resolvedToday}</Typography>
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
                  <StarRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Avg Satisfaction</Typography>
                  <Typography variant="h4">{avgSatisfaction.toFixed(1)}</Typography>
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
            icon={<ConfirmationNumberRoundedIcon />}
            label={`Tickets (${openTickets})`}
            iconPosition="start"
          />
          <Tab
            icon={<MenuBookRoundedIcon />}
            label="Knowledge Base"
            iconPosition="start"
          />
          <Tab
            icon={<QuestionAnswerRoundedIcon />}
            label="Live Chat"
            iconPosition="start"
          />
          <Tab
            icon={<SupportAgentRoundedIcon />}
            label="Analytics"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Support Tickets Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Ticket Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search tickets..."
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Resolved">Resolved</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    label="Priority"
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <MenuItem value="All">All Priorities</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  {filteredTickets.length} tickets
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticket</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {ticket.id} - {ticket.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.category}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {ticket.customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.customer.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {ticket.assignedTo || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Ticket">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setOpenTicketDialog(true);
                          }}
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

      {/* Knowledge Base Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {/* Categories */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Categories
                </Typography>
                <List>
                  {mockKnowledgeBaseCategories.map((category) => (
                    <ListItem key={category.id}>
                      <ListItemIcon>
                        <Typography fontSize="1.5rem">{category.icon}</Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={category.name}
                        secondary={`${category.articleCount} articles`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Articles */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {knowledgeBase.map((article) => (
                <Card key={article.id}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          {article.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {article.summary}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          {article.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            {article.views} views
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {article.helpful} helpful
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <StarRoundedIcon fontSize="small" color="warning" />
                            <Typography variant="caption" color="text.secondary">
                              {article.rating}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Article">
                          <IconButton
                            size="small"
                            onClick={() => handleEditArticle(article)}
                          >
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Article">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteArticle(article.id)}
                            color="error"
                          >
                            <DeleteRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Live Chat Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          {/* Active Chats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Chats
                </Typography>
                <Stack spacing={2}>
                  {[
                    { id: 1, customer: "John Smith", lastMessage: "I need help with my account", time: "2 min ago", unread: 2 },
                    { id: 2, customer: "Emma Wilson", lastMessage: "When will my issue be resolved?", time: "5 min ago", unread: 1 },
                    { id: 3, customer: "Robert Brown", lastMessage: "Thank you for the help!", time: "10 min ago", unread: 0 }
                  ].map((chat) => (
                    <Paper key={chat.id} sx={{ p: 2, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar>
                          <PersonRoundedIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">{chat.customer}</Typography>
                            {chat.unread > 0 && (
                              <Badge badgeContent={chat.unread} color="primary" />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {chat.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {chat.time}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Chat Interface */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 600 }}>
              <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" gutterBottom>
                  Chat with John Smith
                </Typography>

                {/* Messages Area */}
                <Box
                  flex={1}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                    bgcolor: "background.default",
                    overflowY: "auto"
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ alignSelf: "flex-start", maxWidth: "70%" }}>
                      <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
                        <Typography variant="body2">
                          I need help with my account. I can't access my properties.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          John Smith • 2:30 PM
                        </Typography>
                      </Paper>
                    </Box>
                    <Box sx={{ alignSelf: "flex-end", maxWidth: "70%" }}>
                      <Paper sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                        <Typography variant="body2">
                          Hi John! I'd be happy to help you with your account access. Can you tell me what specific error you're seeing?
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          Support Agent • 2:32 PM
                        </Typography>
                      </Paper>
                    </Box>
                  </Stack>
                </Box>

                {/* Message Input */}
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    multiline
                    maxRows={3}
                  />
                  <Button variant="contained" sx={{ minWidth: "auto" }}>
                    <ChatRoundedIcon />
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Average Response Time</Typography>
                      <Typography variant="h6" color="primary">{Math.round(avgResponseTime)} min</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Resolution Rate</Typography>
                      <Typography variant="h6" color="success.main">87%</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Customer Satisfaction</Typography>
                      <Typography variant="h6" color="warning.main">{avgSatisfaction.toFixed(1)}/5</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">First Contact Resolution</Typography>
                      <Typography variant="h6" color="info.main">72%</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Stack spacing={2}>
                  {[
                    { action: "Ticket T-001 resolved", agent: "Mike Wilson", time: "10 min ago", type: "success" },
                    { action: "New ticket T-003 created", agent: "System", time: "25 min ago", type: "info" },
                    { action: "Article updated", agent: "Sarah Johnson", time: "1 hour ago", type: "primary" },
                    { action: "Chat session ended", agent: "Emily Davis", time: "2 hours ago", type: "default" }
                  ].map((activity, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: `${activity.type}.main`, width: 32, height: 32 }}>
                        <CheckCircleRoundedIcon fontSize="small" />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2">{activity.action}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.agent} • {activity.time}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Trending Issues */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trending Issues This Week
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { issue: "Photo Upload Errors", count: 15, trend: "up", severity: "high" },
                    { issue: "Billing Questions", count: 12, trend: "stable", severity: "medium" },
                    { issue: "Account Access", count: 8, trend: "down", severity: "medium" },
                    { issue: "Property Listing", count: 6, trend: "up", severity: "low" }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color={
                          item.severity === "high" ? "error.main" :
                          item.severity === "medium" ? "warning.main" : "success.main"
                        }>
                          {item.count}
                        </Typography>
                        <Typography variant="body2" gutterBottom>{item.issue}</Typography>
                        <Chip
                          label={item.trend}
                          size="small"
                          color={item.trend === "up" ? "error" : item.trend === "down" ? "success" : "default"}
                          icon={<TrendingUpRoundedIcon />}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialogs */}
      <Dialog open={openTicketDialog} onClose={() => setOpenTicketDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedTicket ? `Ticket ${selectedTicket.id} - ${selectedTicket.title}` : "Create New Ticket"}
        </DialogTitle>
        <DialogContent>
          {selectedTicket ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Ticket Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Ticket Information</Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={selectedTicket.status}
                              onChange={(e) => handleUpdateTicketField(selectedTicket.id, 'status', e.target.value)}
                            >
                              <MenuItem value="Open">Open</MenuItem>
                              <MenuItem value="In Progress">In Progress</MenuItem>
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Resolved">Resolved</MenuItem>
                              <MenuItem value="Closed">Closed</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Priority</Typography>
                          <Chip
                            label={selectedTicket.priority}
                            color={getPriorityColor(selectedTicket.priority)}
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Category</Typography>
                          <Typography variant="body1">{selectedTicket.category}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Assigned To</Typography>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={selectedTicket.assignedTo || ""}
                              onChange={(e) => handleUpdateTicketField(selectedTicket.id, 'assignedTo', e.target.value || undefined)}
                            >
                              <MenuItem value="">Unassigned</MenuItem>
                              <MenuItem value="Mike Wilson">Mike Wilson</MenuItem>
                              <MenuItem value="Emily Davis">Emily Davis</MenuItem>
                              <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Customer Information</Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonRoundedIcon fontSize="small" />
                          <Typography variant="body1">{selectedTicket.customer.name}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailRoundedIcon fontSize="small" />
                          <Typography variant="body2">{selectedTicket.customer.email}</Typography>
                        </Stack>
                        {selectedTicket.customer.phone && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneRoundedIcon fontSize="small" />
                            <Typography variant="body2">{selectedTicket.customer.phone}</Typography>
                          </Stack>
                        )}
                        {selectedTicket.customer.company && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedTicket.customer.company}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Conversation History */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Conversation History</Typography>
                  <Stack spacing={2}>
                    {selectedTicket.messages.map((message) => (
                      <Paper
                        key={message.id}
                        sx={{
                          p: 2,
                          bgcolor: message.author.role === "Customer" ? "background.default" : "primary.main",
                          color: message.author.role === "Customer" ? "text.primary" : "primary.contrastText"
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2">
                            {message.author.name} ({message.author.role})
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {new Date(message.timestamp).toLocaleString()}
                          </Typography>
                        </Stack>
                        <Typography variant="body2">{message.content}</Typography>
                      </Paper>
                    ))}
                  </Stack>

                  {/* Add Response */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>Add Response</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Type your response..."
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button variant="outlined">Add Internal Note</Button>
                      <Button variant="contained">Send Response</Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Creating New Support Ticket</strong><br />
                  Fill out the form below to create a new customer support ticket. Required fields are marked with *.
                </Typography>
              </Alert>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Title"
                    fullWidth
                    required
                    value={newTicketFormData.title}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newTicketFormData.priority}
                      label="Priority"
                      onChange={(e) => setNewTicketFormData({ ...newTicketFormData, priority: e.target.value as SupportTicket["priority"] })}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newTicketFormData.category}
                      label="Category"
                      onChange={(e) => setNewTicketFormData({ ...newTicketFormData, category: e.target.value as SupportTicket["category"] })}
                    >
                      <MenuItem value="Technical">Technical</MenuItem>
                      <MenuItem value="Billing">Billing</MenuItem>
                      <MenuItem value="Feature Request">Feature Request</MenuItem>
                      <MenuItem value="Bug Report">Bug Report</MenuItem>
                      <MenuItem value="General">General</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Email"
                    fullWidth
                    required
                    type="email"
                    value={newTicketFormData.customerEmail}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, customerEmail: e.target.value })}
                    placeholder="customer@example.com"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Name"
                    fullWidth
                    value={newTicketFormData.customerName}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, customerName: e.target.value })}
                    placeholder="John Smith"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Phone (Optional)"
                    fullWidth
                    type="tel"
                    value={newTicketFormData.customerPhone}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, customerPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Company (Optional)"
                    fullWidth
                    value={newTicketFormData.customerCompany}
                    onChange={(e) => setNewTicketFormData({ ...newTicketFormData, customerCompany: e.target.value })}
                    placeholder="Company Name"
                  />
                </Grid>
              </Grid>

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={6}
                required
                value={newTicketFormData.description}
                onChange={(e) => setNewTicketFormData({ ...newTicketFormData, description: e.target.value })}
                placeholder="Detailed description of the issue..."
              />

              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newTicketFormData.assignedTo}
                  label="Assign To"
                  onChange={(e) => setNewTicketFormData({ ...newTicketFormData, assignedTo: e.target.value })}
                >
                  <MenuItem value="">Auto-assign</MenuItem>
                  <MenuItem value="Mike Wilson">Mike Wilson</MenuItem>
                  <MenuItem value="Emily Davis">Emily Davis</MenuItem>
                  <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenTicketDialog(false);
            setSelectedTicket(null);
            // Reset form data when canceling
            setNewTicketFormData({
              title: "",
              priority: "Medium",
              category: "General",
              customerEmail: "",
              customerName: "",
              customerPhone: "",
              customerCompany: "",
              description: "",
              assignedTo: ""
            });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={selectedTicket ? () => {
              alert(`Ticket ${selectedTicket.id} updated successfully!`);
              setOpenTicketDialog(false);
              setSelectedTicket(null);
            } : handleCreateTicket}
            disabled={selectedTicket ? false : (!newTicketFormData.title.trim() || !newTicketFormData.customerEmail.trim() || !newTicketFormData.description.trim())}
          >
            {selectedTicket ? "Close Ticket" : "Create Ticket"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openArticleDialog} onClose={() => setOpenArticleDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedArticle ? `Edit Article: ${selectedArticle.title}` : "Create Knowledge Base Article"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Article Title"
                  fullWidth
                  required
                  value={articleFormData.title}
                  onChange={(e) => setArticleFormData({ ...articleFormData, title: e.target.value })}
                  placeholder="Enter a clear, descriptive title"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={articleFormData.category}
                    label="Category"
                    onChange={(e) => setArticleFormData({ ...articleFormData, category: e.target.value })}
                  >
                    <MenuItem value="Getting Started">Getting Started</MenuItem>
                    <MenuItem value="Property Management">Property Management</MenuItem>
                    <MenuItem value="Tenant Management">Tenant Management</MenuItem>
                    <MenuItem value="Work Orders">Work Orders</MenuItem>
                    <MenuItem value="Billing & Payments">Billing & Payments</MenuItem>
                    <MenuItem value="Reports">Reports</MenuItem>
                    <MenuItem value="Troubleshooting">Troubleshooting</MenuItem>
                    <MenuItem value="Account Management">Account Management</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Article Summary"
              fullWidth
              multiline
              rows={2}
              value={articleFormData.summary}
              onChange={(e) => setArticleFormData({ ...articleFormData, summary: e.target.value })}
              placeholder="Brief description of what this article covers"
              helperText="This will be shown in search results and article listings"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Article Content
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={articleFormData.content}
                onChange={(e) => setArticleFormData({ ...articleFormData, content: e.target.value })}
                placeholder="Write your article content here. You can use basic formatting and include step-by-step instructions."
                helperText="Pro tip: Use clear headings, bullet points, and numbered steps for better readability"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tags (comma-separated)"
                  fullWidth
                  value={articleFormData.tags}
                  onChange={(e) => setArticleFormData({ ...articleFormData, tags: e.target.value })}
                  placeholder="e.g., rental, maintenance, setup"
                  helperText="Help users find this article"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={articleFormData.status}
                    label="Status"
                    onChange={(e) => setArticleFormData({ ...articleFormData, status: e.target.value })}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Review">Under Review</MenuItem>
                    <MenuItem value="Published">Published</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>Article Publishing:</strong> This article will be available to all users once published.
                You can save as draft to continue editing later.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArticleDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={() => {
              setArticleFormData({ ...articleFormData, status: "Draft" });
              handleSaveArticle("Draft");
            }}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSaveArticle("Published")}
            disabled={!articleFormData.title || !articleFormData.content || !articleFormData.category}
          >
            {selectedArticle ? "Update Article" : "Publish Article"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
