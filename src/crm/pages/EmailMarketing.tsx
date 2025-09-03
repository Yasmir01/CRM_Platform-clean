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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Divider,
  LinearProgress,
  Alert,
  FormControlLabel,
  Tabs,
  Tab,
  Tooltip,
} from "@mui/material";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PixelIcon from "@mui/icons-material/MonitorRounded";
import RichTextEditor from "../components/RichTextEditor";
import NewsletterAnalytics from "../components/NewsletterAnalytics";
import SafeHtml from "../components/SafeHtml";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  recipients: string[];
  recipientGroups: string[];
  status: "Draft" | "Scheduled" | "Sent" | "Sending";
  sentDate?: string;
  scheduledDate?: string;
  openRate?: number;
  clickRate?: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  template?: string;
  content: string;
  isTemplate?: boolean;
  trackingPixel?: boolean;
  analyticsData?: {
    bounceRate: number;
    unsubscribeRate: number;
    forwardRate: number;
    deviceStats: { desktop: number; mobile: number; tablet: number };
    locationStats: { [key: string]: number };
  };
}

interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  thumbnail?: string;
  category: "Welcome" | "Rent Reminder" | "Property Showcase" | "Maintenance" | "Newsletter" | "Marketing" | "Custom";
  createdDate: string;
  lastUsed?: string;
  usageCount: number;
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: "1",
    name: "January Rent Reminder",
    subject: "Rent Due Tomorrow - January 2024",
    recipients: ["sarah.johnson@email.com", "david.brown@email.com"],
    recipientGroups: ["All Tenants"],
    status: "Sent",
    sentDate: "2024-01-15T09:00:00Z",
    openRate: 85,
    clickRate: 23,
    totalSent: 45,
    totalOpened: 38,
    totalClicked: 10,
    content: "Dear tenant, this is a friendly reminder that your rent payment is due tomorrow...",
  },
  {
    id: "2",
    name: "New Property Showcase",
    subject: "Beautiful New Property Available - Ocean View Villa",
    recipients: [],
    recipientGroups: ["Prospects", "Wait List"],
    status: "Scheduled",
    scheduledDate: "2024-01-20T10:00:00Z",
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    content: "We're excited to announce a stunning new property that's now available for rent...",
  },
  {
    id: "3",
    name: "Maintenance Notice",
    subject: "Scheduled Maintenance - Building A",
    recipients: [],
    recipientGroups: ["Building A Tenants"],
    status: "Draft",
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    content: "We wanted to inform you about scheduled maintenance that will take place...",
  },
];

const recipientGroups = [
  "All Tenants",
  "All Prospects",
  "All Property Managers",
  "All Service Providers",
  "Building A Tenants",
  "Building B Tenants",
  "Active Leases",
  "Expiring Leases",
  "Wait List",
  "VIP Clients"
];

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
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

interface TemplatesSectionProps {
  templates: NewsletterTemplate[];
  onEdit: (template: NewsletterTemplate) => void;
  onDelete: (templateId: string) => void;
  onUse: (template: NewsletterTemplate) => void;
  onDuplicate: (template: NewsletterTemplate) => void;
  onPreview: (template: NewsletterTemplate) => void;
}

function TemplatesSection({ templates, onEdit, onDelete, onUse, onDuplicate, onPreview }: TemplatesSectionProps) {
  const [templateSearchTerm, setTemplateSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(templateSearchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))];

  return (
    <Box>
      {/* Template Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <SaveRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Templates</Typography>
                  <Typography variant="h4">{templates.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Most Used</Typography>
                  <Typography variant="h4">
                    {templates.length > 0 ? Math.max(...templates.map(t => t.usageCount)) : 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <EmailRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Categories</Typography>
                  <Typography variant="h4">{categories.length - 1}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search templates..."
            value={templateSearchTerm}
            onChange={(e) => setTemplateSearchTerm(e.target.value)}
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
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip
                        title={`Edit template: ${template.name}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => onEdit(template)}
                          sx={{
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                          }}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={`Duplicate template: ${template.name}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => onDuplicate(template)}
                          sx={{
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'warning.light', color: 'warning.main' }
                          }}
                        >
                          <ContentCopyRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={`Delete template: ${template.name}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(template.id)}
                          sx={{
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'error.light', color: 'error.main' }
                          }}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{
                    backgroundColor: 'grey.50',
                    p: 1,
                    borderRadius: 1,
                    maxHeight: 100,
                    overflow: 'hidden'
                  }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {template.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </Typography>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Used {template.usageCount} times
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(template.createdDate).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>

              <Stack direction="row" spacing={1} sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  startIcon={<PreviewRoundedIcon />}
                  onClick={() => onPreview(template)}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  startIcon={<EmailRoundedIcon />}
                  onClick={() => onUse(template)}
                >
                  Use Template
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {templateSearchTerm || categoryFilter !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Create your first template to get started"}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = React.useState<EmailCampaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<EmailCampaign | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<NewsletterTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [previewTemplate, setPreviewTemplate] = React.useState<NewsletterTemplate | null>(null);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = React.useState(false);
  const [selectedAnalyticsCampaign, setSelectedAnalyticsCampaign] = React.useState<EmailCampaign | null>(null);
  const [currentTab, setCurrentTab] = React.useState(0); // 0: Campaigns, 1: Templates
  const [formData, setFormData] = React.useState({
    name: "",
    subject: "",
    recipients: "",
    recipientGroups: [] as string[],
    content: "",
    scheduleDate: "",
    scheduleTime: "",
    selectedTemplate: "",
    saveAsTemplate: false,
    templateName: "",
    trackingPixel: true,
  });

  const [templateFormData, setTemplateFormData] = React.useState({
    name: "",
    description: "",
    content: "",
    category: "Custom" as NewsletterTemplate["category"],
  });

  const [templates, setTemplates] = React.useState<NewsletterTemplate[]>([
    {
      id: "welcome",
      name: "Welcome Email",
      description: "Welcome new tenants to their property",
      content: "<h2>Welcome to Our Property Management Service!</h2><p>Dear {TENANT_NAME},</p><p>We're excited to welcome you to {PROPERTY_NAME}. Below you'll find important information about your new home...</p>",
      category: "Welcome",
      createdDate: "2024-01-01",
      usageCount: 15
    },
    {
      id: "rent-reminder",
      name: "Rent Reminder",
      description: "Monthly rent payment reminder for tenants",
      content: "<h2>Rent Payment Reminder</h2><p>Dear {TENANT_NAME},</p><p>This is a friendly reminder that your rent payment of <strong>${RENT_AMOUNT}</strong> for {PROPERTY_NAME} is due on {DUE_DATE}.</p>",
      category: "Rent Reminder",
      createdDate: "2024-01-01",
      usageCount: 42
    },
    {
      id: "property-showcase",
      name: "Property Showcase",
      description: "Showcase available properties to prospects",
      content: "<h2>Beautiful New Property Available</h2><p>We're excited to showcase a stunning new property that's now available for rent!</p><p><strong>Property Details:</strong></p><ul><li>Address: {PROPERTY_ADDRESS}</li><li>Rent: ${RENT_AMOUNT}/month</li><li>Bedrooms: {BEDROOMS}</li><li>Bathrooms: {BATHROOMS}</li></ul>",
      category: "Property Showcase",
      createdDate: "2024-01-01",
      usageCount: 8
    },
    {
      id: "monthly-newsletter",
      name: "Monthly Newsletter",
      description: "Monthly newsletter template for community updates",
      content: "<h1>Property Community Newsletter</h1><h2>This Month's Highlights</h2><p>Dear Residents,</p><p>Welcome to this month's community newsletter! Here's what's happening in our property community:</p><h3>🏠 Property Updates</h3><p>• New amenities coming soon<br>�� Maintenance schedule updates<br>• Community events</p><h3>📋 Important Reminders</h3><p>• Rent due dates<br>• Maintenance requests<br>• Community guidelines</p><h3>🎉 Community Events</h3><p>Join us for upcoming community events and activities!</p><p>Best regards,<br>Your Property Management Team</p>",
      category: "Newsletter",
      createdDate: "2024-01-15",
      usageCount: 3
    },
    {
      id: "maintenance-notice",
      name: "Maintenance Notice",
      description: "Notify tenants about scheduled maintenance",
      content: "<h2>Scheduled Maintenance Notice</h2><p>Dear {TENANT_NAME},</p><p>We wanted to inform you about scheduled maintenance that will take place at {PROPERTY_NAME}:</p><ul><li><strong>Date:</strong> {MAINTENANCE_DATE}</li><li><strong>Time:</strong> {MAINTENANCE_TIME}</li><li><strong>Type:</strong> {MAINTENANCE_TYPE}</li><li><strong>Duration:</strong> {MAINTENANCE_DURATION}</li></ul><p>Please ensure access to your unit during this time. Thank you for your cooperation.</p>",
      category: "Maintenance",
      createdDate: "2024-01-10",
      usageCount: 12
    }
  ]);

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setFormData({
      name: "",
      subject: "",
      recipients: "",
      recipientGroups: [],
      content: "",
      scheduleDate: "",
      scheduleTime: "",
      selectedTemplate: "",
      saveAsTemplate: false,
      templateName: "",
      trackingPixel: true,
    });
    setOpenDialog(true);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      recipients: campaign.recipients.join(", "),
      recipientGroups: campaign.recipientGroups,
      content: campaign.content,
      scheduleDate: campaign.scheduledDate ? campaign.scheduledDate.split('T')[0] : "",
      scheduleTime: campaign.scheduledDate ? campaign.scheduledDate.split('T')[1].substring(0, 5) : "",
      selectedTemplate: "",
      saveAsTemplate: false,
      templateName: "",
      trackingPixel: campaign.trackingPixel ?? true,
    });
    setOpenDialog(true);
  };

  const handleSaveCampaign = () => {
    const recipientsArray = formData.recipients.split(",").map(r => r.trim()).filter(r => r);
    const scheduledDate = formData.scheduleDate && formData.scheduleTime
      ? `${formData.scheduleDate}T${formData.scheduleTime}:00Z`
      : undefined;

    // Save as template if requested
    if (formData.saveAsTemplate && formData.templateName.trim()) {
      const newTemplate = {
        id: Date.now().toString(),
        name: formData.templateName,
        content: formData.content,
      };
      setTemplates(prev => [...prev, newTemplate]);
    }

    if (selectedCampaign) {
      // Edit existing campaign
      setCampaigns(prev =>
        prev.map(c =>
          c.id === selectedCampaign.id
            ? {
                ...c,
                name: formData.name,
                subject: formData.subject,
                recipients: recipientsArray,
                recipientGroups: formData.recipientGroups,
                content: formData.content,
                scheduledDate,
                status: scheduledDate ? "Scheduled" : c.status,
              }
            : c
        )
      );
    } else {
      // Add new campaign
      const newCampaign: EmailCampaign = {
        id: Date.now().toString(),
        name: formData.name,
        subject: formData.subject,
        recipients: recipientsArray,
        recipientGroups: formData.recipientGroups,
        content: formData.content,
        scheduledDate,
        status: scheduledDate ? "Scheduled" : "Draft",
        totalSent: 0,
        totalOpened: 0,
        totalClicked: 0,
        trackingPixel: formData.trackingPixel,
        analyticsData: {
          bounceRate: 0,
          unsubscribeRate: 0,
          forwardRate: 0,
          deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
          locationStats: {}
        }
      };
      setCampaigns(prev => [...prev, newCampaign]);
    }
    setOpenDialog(false);
  };

  const handleSendNow = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(c => 
        c.id === campaignId 
          ? { 
              ...c, 
              status: "Sending" as const,
              sentDate: new Date().toISOString(),
            }
          : c
      )
    );

    // Simulate sending process
    setTimeout(() => {
      setCampaigns(prev => 
        prev.map(c => 
          c.id === campaignId 
            ? { 
                ...c, 
                status: "Sent" as const,
                totalSent: 50, // Mock data
                totalOpened: 42,
                totalClicked: 12,
                openRate: 84,
                clickRate: 24,
              }
            : c
        )
      );
    }, 3000);
  };

  // Template Management Functions
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setTemplateFormData({
      name: "",
      description: "",
      content: "",
      category: "Custom",
    });
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: NewsletterTemplate) => {
    setSelectedTemplate(template);
    setTemplateFormData({
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
    });
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, ...templateFormData }
          : t
      ));
    } else {
      // Create new template
      const newTemplate: NewsletterTemplate = {
        id: Date.now().toString(),
        ...templateFormData,
        createdDate: new Date().toISOString().split('T')[0],
        usageCount: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setTemplateDialogOpen(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleUseTemplate = (template: NewsletterTemplate) => {
    // Update usage count
    setTemplates(prev => prev.map(t =>
      t.id === template.id
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString().split('T')[0] }
        : t
    ));

    // Apply template to form
    setFormData(prev => ({
      ...prev,
      content: template.content,
      selectedTemplate: template.id,
      name: template.name,
      subject: `${template.name} - ${new Date().toLocaleDateString()}`
    }));

    setTemplateDialogOpen(false);
    setOpenDialog(true);
  };

  const handleDuplicateTemplate = (template: NewsletterTemplate) => {
    const duplicatedTemplate: NewsletterTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0,
      lastUsed: undefined
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: EmailCampaign["status"]) => {
    switch (status) {
      case "Sent": return "success";
      case "Scheduled": return "info";
      case "Sending": return "warning";
      case "Draft": return "default";
      default: return "default";
    }
  };

  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === "Sent").length;
  const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const avgOpenRate = campaigns.filter(c => c.openRate).reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.filter(c => c.openRate).length || 0;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Email Marketing & Newsletter System
        </Typography>
        <Stack direction="row" spacing={2}>
          {currentTab === 1 && (
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleCreateTemplate}
            >
              Create Template
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<EmailRoundedIcon />}
            label="Email Campaigns"
            iconPosition="start"
          />
          <Tab
            icon={<SaveRoundedIcon />}
            label={`Templates (${templates.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <EmailRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Campaigns
                  </Typography>
                  <Typography variant="h4">{totalCampaigns}</Typography>
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
                  <SendRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Sent Campaigns
                  </Typography>
                  <Typography variant="h4">{sentCampaigns}</Typography>
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
                  <PeopleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Emails Sent
                  </Typography>
                  <Typography variant="h4">{totalEmailsSent}</Typography>
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
                  <Typography variant="h6" color="text.secondary">
                    Avg Open Rate
                  </Typography>
                  <Typography variant="h4">{Math.round(avgOpenRate)}%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
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
      </Box>

      {/* Campaigns Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent/Scheduled</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      <EmailRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.subject}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {campaign.recipientGroups.map((group) => (
                      <Chip key={group} label={group} size="small" variant="outlined" />
                    ))}
                    {campaign.recipients.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        +{campaign.recipients.length} individual recipients
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack alignItems="flex-start" spacing={1}>
                    <Chip
                      label={campaign.status}
                      color={getStatusColor(campaign.status)}
                      size="small"
                    />
                    {campaign.status === "Sending" && (
                      <LinearProgress sx={{ width: 80 }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {campaign.sentDate ? 
                      `Sent: ${new Date(campaign.sentDate).toLocaleString()}` :
                      campaign.scheduledDate ?
                      `Scheduled: ${new Date(campaign.scheduledDate).toLocaleString()}` :
                      "Not scheduled"
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  {campaign.status === "Sent" ? (
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        ���� {campaign.totalSent} sent
                      </Typography>
                      <Typography variant="body2">
                        👁️ {campaign.openRate}% opened ({campaign.totalOpened})
                      </Typography>
                      <Typography variant="body2">
                        🔗 {campaign.clickRate}% clicked ({campaign.totalClicked})
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data yet
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ minWidth: formElementWidths.large }}>
                    <Tooltip
                      title={`Edit campaign: ${campaign.name}`}
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleEditCampaign(campaign)}
                          disabled={campaign.status === "Sent" || campaign.status === "Sending"}
                          sx={{
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'primary.light', color: 'primary.main' },
                            '&:disabled': { bgcolor: 'action.disabledBackground' }
                          }}
                        >
                          <OpenInNewRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {campaign.status === "Sent" && (
                      <Tooltip
                        title={`View analytics for: ${campaign.name}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedAnalyticsCampaign(campaign);
                            setAnalyticsDialogOpen(true);
                          }}
                          sx={{
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                          }}
                        >
                          <AnalyticsRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(campaign.status === "Draft" || campaign.status === "Scheduled") && (
                      <Tooltip
                        title={`Send campaign now: ${campaign.name}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <span>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<SendRoundedIcon />}
                            onClick={() => handleSendNow(campaign.id)}
                            disabled={campaign.status === "Sending"}
                            sx={{ minWidth: formElementWidths.small }}
                          >
                            Send Now
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </TabPanel>

      {/* Templates Tab */}
      <TabPanel value={currentTab} index={1}>
        <TemplatesSection
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onUse={handleUseTemplate}
          onDuplicate={handleDuplicateTemplate}
          onPreview={(template) => {
            setPreviewTemplate(template);
            setPreviewDialogOpen(true);
          }}
        />
      </TabPanel>

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedCampaign ? "Edit Campaign" : "Create Email Campaign"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="Campaign Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    label="Template"
                    value={formData.selectedTemplate}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        selectedTemplate: e.target.value,
                        content: template ? template.content : formData.content
                      });
                    }}
                  >
                    <MenuItem value="">No Template</MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Subject Line"
              fullWidth
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter email subject"
            />

            <FormControl fullWidth>
              <InputLabel>Recipient Groups</InputLabel>
              <Select
                multiple
                value={formData.recipientGroups}
                onChange={(e) => setFormData({ ...formData, recipientGroups: e.target.value as string[] })}
                input={<OutlinedInput label="Recipient Groups" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {recipientGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    <Checkbox checked={formData.recipientGroups.indexOf(group) > -1} />
                    <ListItemText primary={group} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Additional Recipients (comma separated)"
              fullWidth
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
              helperText="Enter individual email addresses separated by commas"
            />

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Email Content</Typography>

              <RichTextEditor
                value={formData.content || '<p>Enter your email content here. You can use variables like {TENANT_NAME}, {PROPERTY_NAME}, etc.</p>'}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Enter your email content here. You can use variables like {TENANT_NAME}, {PROPERTY_NAME}, etc."
                minHeight={300}
              />

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Available Variables:</Typography>
                <Typography variant="body2">
                  {`{TENANT_NAME}, {PROPERTY_NAME}, {PROPERTY_ADDRESS}, {RENT_AMOUNT}, {DUE_DATE}, {BEDROOMS}, {BATHROOMS}`}
                </Typography>
              </Alert>
            </Box>

            <Divider />
            <Typography variant="h6">Template Options</Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.saveAsTemplate}
                      onChange={(e) => setFormData({ ...formData, saveAsTemplate: e.target.checked })}
                    />
                  }
                  label="Save as Template"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.trackingPixel}
                      onChange={(e) => setFormData({ ...formData, trackingPixel: e.target.checked })}
                    />
                  }
                  label="Enable Tracking Pixel"
                />
              </Grid>
              {formData.saveAsTemplate && (
                <Grid item xs={8}>
                  <TextField
                    label="Template Name"
                    fullWidth
                    required
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    placeholder="Enter a name for this template"
                  />
                </Grid>
              )}
            </Grid>

            <Divider />
            <Typography variant="h6">Schedule Options</Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Schedule Date"
                  type="date"
                  fullWidth
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty to save as draft"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Schedule Time"
                  type="time"
                  fullWidth
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {formData.saveAsTemplate && (
            <Button
              variant="outlined"
              startIcon={<SaveRoundedIcon />}
              onClick={() => {
                if (!formData.templateName.trim()) {
                  alert("Please enter a template name");
                  return;
                }
                const newTemplate = {
                  id: Date.now().toString(),
                  name: formData.templateName,
                  content: formData.content,
                };
                setTemplates(prev => [...prev, newTemplate]);
                alert("Template saved successfully!");
              }}
            >
              Save Template Only
            </Button>
          )}
          <Button variant="outlined" onClick={handleSaveCampaign}>
            Save as Draft
          </Button>
          <Button variant="contained" onClick={handleSaveCampaign} startIcon={<SendRoundedIcon />}>
            {formData.scheduleDate ? "Schedule Campaign" : "Send Now"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Creation/Edit Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedTemplate ? "Edit Template" : "Create Newsletter Template"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="Template Name"
                  fullWidth
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={templateFormData.category}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, category: e.target.value as NewsletterTemplate["category"] })}
                  >
                    <MenuItem value="Welcome">Welcome</MenuItem>
                    <MenuItem value="Rent Reminder">Rent Reminder</MenuItem>
                    <MenuItem value="Property Showcase">Property Showcase</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Newsletter">Newsletter</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Description"
              fullWidth
              value={templateFormData.description}
              onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
              placeholder="Brief description of this template"
              multiline
              rows={2}
            />

            <Box>
              <Typography variant="h6" gutterBottom>Template Content</Typography>
              <RichTextEditor
                value={templateFormData.content}
                onChange={(content) => setTemplateFormData({ ...templateFormData, content })}
                placeholder="Create your newsletter template here. Use variables like {TENANT_NAME}, {PROPERTY_NAME}, etc."
                minHeight={300}
              />
            </Box>

            <Alert severity="info">
              <Typography variant="subtitle2">Available Variables:</Typography>
              <Typography variant="body2">
                {`{TENANT_NAME}, {PROPERTY_NAME}, {PROPERTY_ADDRESS}, {RENT_AMOUNT}, {DUE_DATE}, {BEDROOMS}, {BATHROOMS}, {MAINTENANCE_DATE}, {MAINTENANCE_TIME}, {MAINTENANCE_TYPE}, {MAINTENANCE_DURATION}`}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTemplate}
            disabled={!templateFormData.name.trim() || !templateFormData.content.trim()}
            startIcon={<SaveRoundedIcon />}
          >
            {selectedTemplate ? "Update Template" : "Create Template"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          setPreviewTemplate(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PreviewRoundedIcon />
            <Box>
              <Typography variant="h6">
                Template Preview: {previewTemplate?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {previewTemplate?.category} • Created {previewTemplate?.createdDate ? new Date(previewTemplate.createdDate).toLocaleDateString() : 'Unknown'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              <Typography variant="body2">
                This is how your email template will appear to recipients. Variables like {'{TENANT_NAME}'}, {'{PROPERTY_NAME}'}, etc. will be replaced with actual data when sent.
              </Typography>
            </Alert>

            <Paper
              sx={{
                p: 3,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 400,
                overflow: 'auto'
              }}
            >
              <Box
                sx={{
                  '& h1, & h2, & h3': {
                    color: 'primary.main',
                    mb: 1
                  },
                  '& p': {
                    mb: 1.5,
                    lineHeight: 1.6
                  },
                  '& ul, & ol': {
                    pl: 2,
                    '& li': {
                      mb: 0.5
                    }
                  },
                  '& strong': {
                    fontWeight: 600
                  }
                }}
              >
                <SafeHtml html={previewTemplate?.content || ''} />
              </Box>
            </Paper>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Template Information:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {previewTemplate?.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Usage Count:</strong> {previewTemplate?.usageCount || 0} times
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {previewTemplate?.description}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPreviewDialogOpen(false);
            setPreviewTemplate(null);
          }}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            onClick={() => {
              if (previewTemplate) {
                setPreviewDialogOpen(false);
                handleEditTemplate(previewTemplate);
              }
            }}
          >
            Edit Template
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailRoundedIcon />}
            onClick={() => {
              if (previewTemplate) {
                setPreviewDialogOpen(false);
                // onUse(previewTemplate); // This would be called if available
                alert(`Using template "${previewTemplate.name}" for new campaign`);
              }
            }}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Newsletter Analytics Dialog */}
      <NewsletterAnalytics
        open={analyticsDialogOpen}
        onClose={() => {
          setAnalyticsDialogOpen(false);
          setSelectedAnalyticsCampaign(null);
        }}
        campaign={selectedAnalyticsCampaign}
      />
    </Box>
  );
}
