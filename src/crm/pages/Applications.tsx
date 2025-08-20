import * as React from "react";
import WorkflowService from "../services/WorkflowService";
import { useCrmData } from "../contexts/CrmDataContext";
import { LocalStorageService } from "../services/LocalStorageService";
import ApplicationFormRenderer from "../components/ApplicationFormRenderer";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Button,
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
  Tabs,
  Tab,
  Badge,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import ArchiveIcon from "@mui/icons-material/Archive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  propertyId: string;
  propertyCode?: string;
  propertyName?: string; // Keep for backwards compatibility
  propertyAddress?: string; // Keep for backwards compatibility
  applicationFee: number;
  paymentStatus: "Paid" | "Pending" | "Failed";
  paymentMethod: string;
  status: "New" | "Pending" | "Denied" | "Archived";
  submittedDate: string;
  monthlyIncome: number;
  moveInDate: string;
  notes?: string;
  creditScore?: number;
  backgroundCheck?: "Pending" | "Approved" | "Failed";
  employmentVerification?: "Pending" | "Verified" | "Failed";
}

const mockApplications: Application[] = [
  {
    id: "APP-001",
    applicantName: "Sarah Johnson",
    applicantEmail: "sarah.johnson@email.com",
    applicantPhone: "(555) 123-4567",
    propertyId: "1", // Uses first property from global state
    propertyCode: "PROP-001",
    propertyName: "Sunset Apartments", // Fallback for compatibility
    propertyAddress: "123 Main St, Unit 2B",
    applicationFee: 75,
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    status: "New",
    submittedDate: "2024-01-20",
    monthlyIncome: 5500,
    moveInDate: "2024-02-15",
    creditScore: 750,
    backgroundCheck: "Pending",
    employmentVerification: "Pending",
    fileUploads: {
      "id_proof": [
        { name: "passport.pdf", size: 245760, type: "application/pdf", lastModified: 1690000000000 },
        { name: "drivers_license.jpg", size: 125000, type: "image/jpeg", lastModified: 1690000100000 }
      ],
      "income_verification": [
        { name: "paystub_january.pdf", size: 156000, type: "application/pdf", lastModified: 1690000200000 },
        { name: "bank_statement.pdf", size: 234000, type: "application/pdf", lastModified: 1690000300000 }
      ]
    }
  },
  {
    id: "APP-002",
    applicantName: "Michael Chen",
    applicantEmail: "m.chen@email.com",
    applicantPhone: "(555) 987-6543",
    propertyId: "1", // Uses first property from global state
    propertyCode: "PROP-002",
    propertyName: "Ocean View Villa",
    propertyAddress: "456 Beach Blvd",
    applicationFee: 100,
    paymentStatus: "Paid",
    paymentMethod: "PayPal",
    status: "Pending",
    submittedDate: "2024-01-18",
    monthlyIncome: 7200,
    moveInDate: "2024-03-01",
    creditScore: 680,
    backgroundCheck: "Approved",
    employmentVerification: "Verified",
    fileUploads: [
      {
        fieldId: "employment_letter",
        files: [
          { name: "employment_verification.pdf", size: 178000, type: "application/pdf", lastModified: 1690000400000 }
        ]
      },
      {
        fieldId: "references",
        files: [
          { name: "reference_letter_1.pdf", size: 98000, type: "application/pdf", lastModified: 1690000500000 },
          { name: "reference_letter_2.pdf", size: 87000, type: "application/pdf", lastModified: 1690000600000 }
        ]
      }
    ]
  },
  {
    id: "APP-003",
    applicantName: "Lisa Rodriguez",
    applicantEmail: "lisa.r@email.com",
    applicantPhone: "(555) 456-7890",
    propertyId: "1", // Uses first property from global state
    propertyCode: "PROP-003",
    propertyName: "Downtown Lofts",
    propertyAddress: "789 City Center, Loft 12",
    applicationFee: 50,
    paymentStatus: "Failed",
    paymentMethod: "Debit Card",
    status: "New",
    submittedDate: "2024-01-19",
    monthlyIncome: 4800,
    moveInDate: "2024-02-20",
    notes: "Payment declined - insufficient funds"
  }
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
      id={`applications-tabpanel-${index}`}
      aria-labelledby={`applications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Applications() {
  const { state } = useCrmData();
  const { properties } = state;
  const [applications, setApplications] = React.useState<Application[]>(mockApplications);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [selectedApplication, setSelectedApplication] = React.useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedAppForAction, setSelectedAppForAction] = React.useState<Application | null>(null);
  const [filePreviewOpen, setFilePreviewOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<any>(null);
  const [expandedFiles, setExpandedFiles] = React.useState<Set<string>>(new Set());
  const [inlinePreviewMode, setInlinePreviewMode] = React.useState(true);
  const [newApplicationDialog, setNewApplicationDialog] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [templateSelectionDialog, setTemplateSelectionDialog] = React.useState(false);

  // State for prospects and tenants (for workflow integration)
  const [prospects, setProspects] = React.useState<any[]>([]);
  const [tenants, setTenants] = React.useState<any[]>([]);
  const [workflowLog, setWorkflowLog] = React.useState<string[]>([]);

  // Initialize workflow service and load templates
  React.useEffect(() => {
    const workflowService = WorkflowService.getInstance();
    workflowService.registerCallbacks({
      updateProspects: setProspects,
      addTenant: (tenant) => setTenants(prev => [...prev, tenant]),
      logActivity: (message) => {
        setWorkflowLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
        console.log('Workflow:', message);
      }
    });

    // Load templates and applications from localStorage
    const savedTemplates = LocalStorageService.getTemplates();
    const savedApplications = LocalStorageService.getApplications();
    setTemplates(savedTemplates);
    if (savedApplications.length > 0) {
      // Normalize applications to ensure consistent data structure
      const normalizeApp = (app: any) => {
        const applicantName =
          app.applicantName ||
          app.formData?.applicant_name ||
          ((app.formData?.first_name || app.formData?.last_name)
            ? `${app.formData?.first_name || ''} ${app.formData?.last_name || ''}`.trim()
            : undefined) ||
          'Unknown Applicant';

        const applicantEmail =
          app.applicantEmail ||
          app.formData?.email ||
          app.formData?.applicant_email ||
          '';

        const applicantPhone =
          app.applicantPhone ||
          app.formData?.phone ||
          app.formData?.applicant_phone ||
          '';

        return { ...app, applicantName, applicantEmail, applicantPhone };
      };

      const normalized = savedApplications.map(normalizeApp);
      setApplications(normalized);

      // Save the normalized data back to localStorage to prevent future issues
      LocalStorageService.saveApplications(normalized);
    }
  }, []);

  const getApplicationsByStatus = (status: Application["status"]) => {
    return applications.filter(app => {
      const property = properties.find(p => p.id === app.propertyId);
      const propertyName = property ? property.name : (app.propertyName || '');

      return app.status === status &&
        ((app.applicantName || 'Unknown Applicant').toLowerCase().includes(searchTerm.toLowerCase()) ||
         propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  };

  const newApplications = getApplicationsByStatus("New");
  const pendingApplications = getApplicationsByStatus("Pending");
  const deniedApplications = getApplicationsByStatus("Denied");
  const archivedApplications = getApplicationsByStatus("Archived");

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "New": return "info";
      case "Pending": return "warning";
      case "Denied": return "error";
      case "Archived": return "default";
      default: return "default";
    }
  };

  const getPaymentStatusColor = (status: Application["paymentStatus"]) => {
    switch (status) {
      case "Paid": return "success";
      case "Pending": return "warning";
      case "Failed": return "error";
      default: return "default";
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application["status"]) => {
    // Find the current application and its old status
    const currentApp = applications.find(app => app.id === applicationId);
    if (!currentApp) return;

    const oldStatus = currentApp.status;

    // Update application status
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: newStatus }
          : app
      )
    );

    // Trigger workflow automation
    const workflowService = WorkflowService.getInstance();
    await workflowService.handleApplicationStatusChange(
      { ...currentApp, status: newStatus },
      newStatus,
      oldStatus
    );

    setActionMenuAnchor(null);
    setSelectedAppForAction(null);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, application: Application) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAppForAction(application);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedAppForAction(null);
  };

  const getFileIcon = (file: any) => {
    if (!file.type) return <AttachFileIcon />;

    if (file.type.includes('pdf')) return <PictureAsPdfIcon />;
    if (file.type.includes('image')) return <ImageIcon />;
    if (file.type.includes('document') || file.type.includes('text')) return <ArticleIcon />;
    return <AttachFileIcon />;
  };

  const handleFileView = (file: any) => {
    setSelectedFile(file);
    setFilePreviewOpen(true);
  };

  const handleFileDownload = (file: any) => {
    // Create a mock download since we don't have actual file data
    // In a real application, this would download the actual file
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show a notification that this is a demo
    alert(`Download initiated for: ${file.name}\n\nNote: This is a demo - no actual file will be downloaded.`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleFileExpansion = (fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const renderInlineFilePreview = (file: any, fieldId: string, index: number) => {
    const fileId = `${fieldId}_${index}`;
    const isExpanded = expandedFiles.has(fileId);

    if (!isExpanded) return null;

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        {file.type?.includes('image') ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Image Preview
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 200,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'white',
                margin: '0 auto'
              }}
            >
              <Stack spacing={1} alignItems="center">
                <ImageIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                <Typography variant="body2" color="text.secondary">
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Image content would be displayed here
                </Typography>
              </Stack>
            </Box>
          </Box>
        ) : file.type?.includes('pdf') ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              PDF Document Preview
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 300,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'white'
              }}
            >
              <Stack spacing={1} alignItems="center">
                <PictureAsPdfIcon sx={{ fontSize: 32, color: 'error.main' }} />
                <Typography variant="body2" color="text.secondary">
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PDF content would be embedded here
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({formatFileSize(file.size || 0)})
                </Typography>
              </Stack>
            </Box>
          </Box>
        ) : file.type?.includes('text') ? (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Text File Preview
            </Typography>
            <Box
              sx={
                {
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: 200,
                  overflow: 'auto'
                }
              }
            >
              <Typography variant="body2" color="text.secondary" style={{ fontFamily: 'monospace' }}>
                Sample text content would be displayed here...
                <br />File: {file.name}
                <br />Size: {formatFileSize(file.size || 0)}
                <br />Type: {file.type}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              File Information
            </Typography>
            <Box
              sx={
                {
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1
                }
              }
            >
              <Stack spacing={1} alignItems="center">
                {getFileIcon(file)}
                <Typography variant="body2">{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size || 0)} • {file.type || 'Unknown type'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Preview not available - use download to view
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderApplicationCard = (application: Application) => (
    <Card key={application.id} sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight="medium">
                {application.applicantName || 'Unknown Applicant'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(() => {
                  const property = properties.find(p => p.id === application.propertyId);
                  const propertyCode = application.propertyCode || application.propertyId;
                  return property ? `${property.name} • ${property.address}${propertyCode ? ` • Code: ${propertyCode}` : ''}` :
                         `${application.propertyName || 'Unknown Property'} • ${application.propertyAddress || ''}${propertyCode ? ` ��� Code: ${propertyCode}` : ''}`;
                })()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Applied: {new Date(application.submittedDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`$${application.applicationFee || 0}`}
                size="small"
                color={getPaymentStatusColor(application.paymentStatus)}
                variant="outlined"
              />
              <Tooltip title="More Actions">
                <IconButton
                  id="action-menu-button"
                  size="small"
                  onClick={(e) => handleActionMenuOpen(e, application)}
                  aria-controls={actionMenuAnchor ? 'action-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={actionMenuAnchor ? 'true' : undefined}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <PaymentIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {application.paymentStatus} - {application.paymentMethod}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Income: ${(application.monthlyIncome || 0).toLocaleString()}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Chip
                label={application.status}
                size="small"
                color={getStatusColor(application.status)}
              />
              {application.creditScore && (
                <Chip
                  label={`Credit: ${application.creditScore}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
            <Button
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => handleViewApplication(application)}
            >
              View Details
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const tabData = [
    { label: "New", count: newApplications.length, applications: newApplications, icon: <DescriptionIcon /> },
    { label: "Pending", count: pendingApplications.length, applications: pendingApplications, icon: <PendingIcon /> },
    { label: "Denied", count: deniedApplications.length, applications: deniedApplications, icon: <CancelIcon /> },
    { label: "Archived", count: archivedApplications.length, applications: archivedApplications, icon: <ArchiveIcon /> },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Rental Applications
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={() => setTemplateSelectionDialog(true)}
          >
            New Application
          </Button>
          <Badge badgeContent={newApplications.length} color="error">
            <DescriptionIcon />
          </Badge>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tabData.map((tab, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: `${getStatusColor(tab.label as Application["status"])}.main` }}>
                    {tab.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      {tab.label}
                    </Typography>
                    <Typography variant="h4">{tab.count}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search applications by name, property, or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          {tabData.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={
                <Badge badgeContent={tab.count} color="error" max={99}>
                  <Typography>{tab.label}</Typography>
                </Badge>
              }
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabData.map((tab, index) => (
        <TabPanel key={index} value={currentTab} index={index}>
          {tab.applications.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No {tab.label.toLowerCase()} applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tab.label === "New" && "New applications will appear here when submitted."}
                {tab.label === "Pending" && "Applications under review will appear here."}
                {tab.label === "Denied" && "Rejected applications will appear here."}
                {tab.label === "Archived" && "Completed applications will appear here."}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {tab.applications.map((application) => (
                <Grid item xs={12} md={6} lg={4} key={application.id}>
                  {renderApplicationCard(application)}
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      ))}

      {/* Application Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Application Details - {selectedApplication?.applicantName}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Payment Status Alert */}
              <Alert
                severity={selectedApplication.paymentStatus === "Paid" ? "success" : selectedApplication.paymentStatus === "Pending" ? "warning" : "error"}
              >
                Application fee ${selectedApplication.applicationFee || 0} - {selectedApplication.paymentStatus} via {selectedApplication.paymentMethod}
              </Alert>

              {/* Applicant Information */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Applicant Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" />
                      <Typography>{selectedApplication.applicantName || 'Unknown Applicant'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" />
                      <Typography>{selectedApplication.applicantEmail}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon fontSize="small" />
                      <Typography>{selectedApplication.applicantPhone}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon fontSize="small" />
                      <Typography>Move-in: {new Date(selectedApplication.moveInDate).toLocaleDateString()}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              {/* Property Information */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Property Information</Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <HomeIcon fontSize="small" />
                  <Typography>
                    {(() => {
                      const property = properties.find(p => p.id === selectedApplication.propertyId);
                      return property ? property.name : selectedApplication.propertyName || 'Unknown Property';
                    })()}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {(() => {
                    const property = properties.find(p => p.id === selectedApplication.propertyId);
                    return property ? property.address : selectedApplication.propertyAddress || '';
                  })()}
                </Typography>
                {(selectedApplication.propertyCode || selectedApplication.propertyId) && (
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                    Property Code: {selectedApplication.propertyCode || selectedApplication.propertyId}
                  </Typography>
                )}
              </Paper>

              {/* Financial Information */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Financial Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Monthly Income</Typography>
                    <Typography variant="h6">${(selectedApplication.monthlyIncome || 0).toLocaleString()}</Typography>
                  </Grid>
                  {selectedApplication.creditScore && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                      <Typography variant="h6">{selectedApplication.creditScore}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* TransUnion Integration & Background Checks */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>TransUnion Screening</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Credit Report</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={selectedApplication.creditScore ? `Score: ${selectedApplication.creditScore}` : "Not Requested"}
                        size="small"
                        color={selectedApplication.creditScore ? "success" : "default"}
                      />
                      {selectedApplication.paymentStatus === "Paid" && !selectedApplication.creditScore && (
                        <Chip
                          label="Available"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Background Check</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={selectedApplication.backgroundCheck || "Not Started"}
                        size="small"
                        color={selectedApplication.backgroundCheck === "Approved" ? "success" : selectedApplication.backgroundCheck === "Failed" ? "error" : "warning"}
                      />
                      {selectedApplication.paymentStatus === "Paid" && !selectedApplication.backgroundCheck && (
                        <Chip
                          label="Available"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Employment Verification</Typography>
                    <Chip
                      label={selectedApplication.employmentVerification || "Not Started"}
                      size="small"
                      color={selectedApplication.employmentVerification === "Verified" ? "success" : selectedApplication.employmentVerification === "Failed" ? "error" : "warning"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Integration Status</Typography>
                    <Chip
                      label={selectedApplication.paymentStatus === "Paid" ? "Active" : "Pending Payment"}
                      size="small"
                      color={selectedApplication.paymentStatus === "Paid" ? "success" : "warning"}
                    />
                  </Grid>
                </Grid>

                {selectedApplication.paymentStatus === "Paid" && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    TransUnion integration is active. Credit reports and background checks will be automatically requested when the application moves to pending status with proper consent.
                  </Alert>
                )}

                {selectedApplication.paymentStatus !== "Paid" && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    TransUnion integration will activate once the application fee is paid.
                  </Alert>
                )}
              </Paper>

              {/* Notes */}
              {selectedApplication.notes && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography variant="body2">{selectedApplication.notes}</Typography>
                </Paper>
              )}

              {/* Complete Application Form Data */}
              {selectedApplication.formData && Object.keys(selectedApplication.formData).length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Complete Application Data</Typography>
                  <Grid container spacing={2}>
                    {(() => {
                      const formData = selectedApplication.formData || {};
                      const template = templates.find(t => t.id === selectedApplication.templateId);

                      if (template && template.formFields) {
                        // Organize fields by sections
                        const fieldsBySection: { [key: string]: any[] } = {};
                        const unSectionedFields: any[] = [];

                        template.formFields.forEach(field => {
                          if (field.type === 'section') return; // Skip section headers

                          const value = formData[field.id];
                          if (value !== undefined && value !== null && value !== '') {
                            const fieldWithValue = { ...field, value };

                            if (field.section) {
                              if (!fieldsBySection[field.section]) {
                                fieldsBySection[field.section] = [];
                              }
                              fieldsBySection[field.section].push(fieldWithValue);
                            } else {
                              unSectionedFields.push(fieldWithValue);
                            }
                          }
                        });

                        return (
                          <>
                            {/* Render fields by sections */}
                            {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
                              <Grid item xs={12} key={sectionName}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                  {sectionName}
                                </Typography>
                                <Grid container spacing={2}>
                                  {fields.map((field) => (
                                    <Grid item xs={12} sm={6} key={field.id}>
                                      <Typography variant="body2" color="text.secondary">
                                        {field.label}
                                      </Typography>
                                      <Typography variant="body1">
                                        {field.type === 'checkbox' && Array.isArray(field.value)
                                          ? field.value.join(', ')
                                          : field.type === 'yesno'
                                          ? field.value ? 'Yes' : 'No'
                                          : field.type === 'date'
                                          ? new Date(field.value).toLocaleDateString()
                                          : field.type === 'number'
                                          ? typeof field.value === 'number' ? field.value.toLocaleString() : field.value
                                          : String(field.value)
                                        }
                                      </Typography>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Grid>
                            ))}

                            {/* Render unsectioned fields */}
                            {unSectionedFields.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                  Additional Information
                                </Typography>
                                <Grid container spacing={2}>
                                  {unSectionedFields.map((field) => (
                                    <Grid item xs={12} sm={6} key={field.id}>
                                      <Typography variant="body2" color="text.secondary">
                                        {field.label}
                                      </Typography>
                                      <Typography variant="body1">
                                        {field.type === 'checkbox' && Array.isArray(field.value)
                                          ? field.value.join(', ')
                                          : field.type === 'yesno'
                                          ? field.value ? 'Yes' : 'No'
                                          : field.type === 'date'
                                          ? new Date(field.value).toLocaleDateString()
                                          : field.type === 'number'
                                          ? typeof field.value === 'number' ? field.value.toLocaleString() : field.value
                                          : String(field.value)
                                        }
                                      </Typography>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Grid>
                            )}
                          </>
                        );
                      } else {
                        // Fallback: show raw form data if template not found
                        return Object.entries(formData).map(([key, value]) => (
                          <Grid item xs={12} sm={6} key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Typography>
                            <Typography variant="body1">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </Typography>
                          </Grid>
                        ));
                      }
                    })()}
                  </Grid>
                </Paper>
              )}

              {/* File Uploads */}
              {(() => {
                // Handle both legacy array format and new object format
                let fileUploadsToDisplay = {};

                if (selectedApplication.fileUploads) {
                  if (Array.isArray(selectedApplication.fileUploads)) {
                    // Legacy array format: [{fieldId, files}, ...] - convert to object
                    fileUploadsToDisplay = selectedApplication.fileUploads.reduce((acc: any, upload: any) => {
                      acc[upload.fieldId] = upload.files;
                      return acc;
                    }, {});
                  } else {
                    // New object format: {fieldId: files, ...}
                    fileUploadsToDisplay = selectedApplication.fileUploads;
                  }
                }

                return Object.keys(fileUploadsToDisplay).length > 0 && (
                  <Paper sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6">Uploaded Files</Typography>
                      <Tooltip title="Toggle inline preview mode">
                        <IconButton
                          size="small"
                          onClick={() => setInlinePreviewMode(!inlinePreviewMode)}
                          color={inlinePreviewMode ? "primary" : "default"}
                        >
                          <ViewColumnIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Grid container spacing={2}>
                      {Object.entries(fileUploadsToDisplay).map(([fieldId, files]) => {
                        const template = templates.find(t => t.id === selectedApplication.templateId);
                        const field = template?.formFields?.find(f => f.id === fieldId);
                        const fieldLabel = field?.label || fieldId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                        return (
                          <Grid item xs={12} key={fieldId}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {fieldLabel}
                            </Typography>
                            {Array.isArray(files) ? files.map((file: any, index: number) => (
                              <Card key={index} variant="outlined" sx={{ mr: 1, mb: 1, display: 'inline-block', maxWidth: 300 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {getFileIcon(file)}
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                      <Typography variant="body2" noWrap title={file.name}>
                                        {file.name || `File ${index + 1}`}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatFileSize(file.size || 0)} • {file.type || 'Unknown'}
                                      </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                      {inlinePreviewMode && (
                                        <Tooltip title={expandedFiles.has(`${fieldId}_${index}`) ? "Collapse Preview" : "Expand Preview"}>
                                          <IconButton
                                            size="small"
                                            onClick={() => toggleFileExpansion(`${fieldId}_${index}`)}
                                            color="primary"
                                          >
                                            {expandedFiles.has(`${fieldId}_${index}`) ?
                                              <ExpandLessIcon fontSize="small" /> :
                                              <ExpandMoreIcon fontSize="small" />
                                            }
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      <Tooltip title="View in Modal">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleFileView(file)}
                                          color="primary"
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Download File">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleFileDownload(file)}
                                          color="primary"
                                        >
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                </CardContent>
                                {renderInlineFilePreview(file, fieldId, index)}
                              </Card>
                            )) : (
                              <Card variant="outlined" sx={{ mr: 1, mb: 1, display: 'inline-block', maxWidth: 300 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {getFileIcon(files)}
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                      <Typography variant="body2" noWrap title={files.name}>
                                        {files.name || 'File'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatFileSize(files.size || 0)} • {files.type || 'Unknown'}
                                      </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                      {inlinePreviewMode && (
                                        <Tooltip title={expandedFiles.has(`${fieldId}_0`) ? "Collapse Preview" : "Expand Preview"}>
                                          <IconButton
                                            size="small"
                                            onClick={() => toggleFileExpansion(`${fieldId}_0`)}
                                            color="primary"
                                          >
                                            {expandedFiles.has(`${fieldId}_0`) ?
                                              <ExpandLessIcon fontSize="small" /> :
                                              <ExpandMoreIcon fontSize="small" />
                                            }
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                      <Tooltip title="View in Modal">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleFileView(files)}
                                          color="primary"
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Download File">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleFileDownload(files)}
                                          color="primary"
                                        >
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                </CardContent>
                                {renderInlineFilePreview(files, fieldId, 0)}
                              </Card>
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                );
              })()}

              {/* Terms Accepted */}
              {selectedApplication.termsAccepted && selectedApplication.termsAccepted.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Terms & Conditions</Typography>
                  <Stack spacing={1}>
                    {selectedApplication.termsAccepted.map((term: any, index: number) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={index}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">
                          {term.title || `Term ${index + 1}`} - Accepted on {new Date(term.acceptedAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedApplication && selectedApplication.status === "New" && (
            <>
              <Button
                color="error"
                onClick={() => {
                  if (selectedApplication) {
                    handleStatusChange(selectedApplication.id, "Denied");
                    setViewDialogOpen(false);
                  }
                }}
              >
                Deny
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (selectedApplication) {
                    handleStatusChange(selectedApplication.id, "Pending");
                    setViewDialogOpen(false);
                  }
                }}
              >
                Approve for Review
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog
        open={filePreviewOpen}
        onClose={() => setFilePreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedFile && getFileIcon(selectedFile)}
            <Box>
              <Typography variant="h6">{selectedFile?.name || 'File Preview'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedFile && (
                  `${formatFileSize(selectedFile.size || 0)} • ${selectedFile.type || 'Unknown type'}`
                )}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {selectedFile.type?.includes('image') ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Image Preview
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 400,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                      <Typography color="text.secondary">
                        Image preview would be displayed here
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In a real application, the actual image would be loaded from storage
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              ) : selectedFile.type?.includes('pdf') ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    PDF Document
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 400,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <PictureAsPdfIcon sx={{ fontSize: 64, color: 'error.main' }} />
                      <Typography color="text.secondary">
                        PDF viewer would be embedded here
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In a real application, a PDF viewer would display the document content
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    File Information
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      {getFileIcon(selectedFile)}
                      <Typography color="text.secondary">
                        Preview not available for this file type
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        File can be downloaded for viewing
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilePreviewOpen(false)}>Close</Button>
          {selectedFile && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                handleFileDownload(selectedFile);
                setFilePreviewOpen(false);
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      {actionMenuAnchor && (
        <Menu
          id="action-menu"
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          MenuListProps={{
            'aria-labelledby': 'action-menu-button',
          }}
        >
          {selectedAppForAction && (
            <>
              <MenuItem onClick={() => {
                handleViewApplication(selectedAppForAction);
                handleActionMenuClose();
              }}>
                <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
                View Details
              </MenuItem>
              {selectedAppForAction.status === "New" && (
                <>
                  <MenuItem onClick={() => {
                    handleStatusChange(selectedAppForAction.id, "Pending");
                    handleActionMenuClose();
                  }}>
                    <PendingIcon sx={{ mr: 1 }} fontSize="small" />
                    Move to Pending
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleStatusChange(selectedAppForAction.id, "Denied");
                    handleActionMenuClose();
                  }}>
                    <CancelIcon sx={{ mr: 1 }} fontSize="small" />
                    Deny Application
                  </MenuItem>
                </>
              )}
              {selectedAppForAction.status === "Pending" && (
                <>
                  <MenuItem onClick={() => {
                    handleStatusChange(selectedAppForAction.id, "Archived");
                    handleActionMenuClose();
                  }}>
                    <CheckCircleRoundedIcon sx={{ mr: 1 }} fontSize="small" />
                    Approve & Archive
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleStatusChange(selectedAppForAction.id, "Denied");
                    handleActionMenuClose();
                  }}>
                    <CancelIcon sx={{ mr: 1 }} fontSize="small" />
                    Deny Application
                  </MenuItem>
                </>
              )}
              {selectedAppForAction.status === "Denied" && (
                <MenuItem onClick={() => {
                  handleStatusChange(selectedAppForAction.id, "Pending");
                  handleActionMenuClose();
                }}>
                  <PendingIcon sx={{ mr: 1 }} fontSize="small" />
                  Reconsider Application
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      )}

      {/* Workflow Activity Log */}
      {workflowLog.length > 0 && (
        <Card sx={{ mt: 3, maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge color="success" variant="dot" />
              Recent Workflow Activities
            </Typography>
            <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
              {workflowLog.slice(-5).reverse().map((activity, index) => (
                <Alert key={index} severity="success" variant="outlined" sx={{ fontSize: '0.875rem' }}>
                  {activity}
                </Alert>
              ))}
            </Stack>
            {workflowLog.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Showing latest 5 activities ({workflowLog.length} total)
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Selection Dialog */}
      <Dialog open={templateSelectionDialog} onClose={() => setTemplateSelectionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Application Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a template to create a new rental application form:
          </Typography>

          {templates.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                No application templates found. Create templates in the Templates section first.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {templates
                .filter(template => template.type === "Rental Application")
                .map((template) => (
                <Grid item xs={12} sm={6} key={template.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      "&:hover": { boxShadow: 2 },
                      ...(selectedTemplate?.id === template.id && {
                        borderColor: "primary.main",
                        boxShadow: 2
                      })
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.formFields?.length || 0} fields
                        {template.applicationFee && ` • $${template.applicationFee} fee`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(template.createdDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateSelectionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setTemplateSelectionDialog(false);
              setNewApplicationDialog(true);
            }}
            disabled={!selectedTemplate}
          >
            Start Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Form Dialog */}
      {selectedTemplate && (
        <ApplicationFormRenderer
          template={selectedTemplate}
          propertyId="1" // Default property for demo
          propertyAddress="Demo Property Address"
          isOpen={newApplicationDialog}
          onSubmit={(applicationData) => {
            // Add to applications list
            setApplications(prev => [...prev, applicationData]);

            // Save to localStorage
            const existingApplications = LocalStorageService.getApplications();
            LocalStorageService.saveApplications([...existingApplications, applicationData]);

            setNewApplicationDialog(false);
            setSelectedTemplate(null);

            // Log workflow activity
            setWorkflowLog(prev => [...prev, `${new Date().toLocaleTimeString()}: New application submitted for ${applicationData.applicantName}`]);
          }}
          onCancel={() => {
            setNewApplicationDialog(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </Box>
  );
}
