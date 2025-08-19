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
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
    employmentVerification: "Pending"
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
    employmentVerification: "Verified"
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
      setApplications(savedApplications);
    }
  }, []);

  const getApplicationsByStatus = (status: Application["status"]) => {
    return applications.filter(app => {
      const property = properties.find(p => p.id === app.propertyId);
      const propertyName = property ? property.name : (app.propertyName || '');

      return app.status === status &&
        (app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const renderApplicationCard = (application: Application) => (
    <Card key={application.id} sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" fontWeight="medium">
                {application.applicantName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(() => {
                  const property = properties.find(p => p.id === application.propertyId);
                  const propertyCode = application.propertyCode || application.propertyId;
                  return property ? `${property.name} • ${property.address}${propertyCode ? ` • Code: ${propertyCode}` : ''}` :
                         `${application.propertyName || 'Unknown Property'} • ${application.propertyAddress || ''}${propertyCode ? ` • Code: ${propertyCode}` : ''}`;
                })()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Applied: {new Date(application.submittedDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`$${application.applicationFee}`}
                size="small"
                color={getPaymentStatusColor(application.paymentStatus)}
                variant="outlined"
              />
              <Tooltip title="More Actions">
                <IconButton
                  size="small"
                  onClick={(e) => handleActionMenuOpen(e, application)}
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
                Income: ${application.monthlyIncome.toLocaleString()}
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
                Application fee ${selectedApplication.applicationFee} - {selectedApplication.paymentStatus} via {selectedApplication.paymentMethod}
              </Alert>

              {/* Applicant Information */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Applicant Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" />
                      <Typography>{selectedApplication.applicantName}</Typography>
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
                    <Typography variant="h6">${selectedApplication.monthlyIncome.toLocaleString()}</Typography>
                  </Grid>
                  {selectedApplication.creditScore && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Credit Score</Typography>
                      <Typography variant="h6">{selectedApplication.creditScore}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Background Checks */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Background Checks</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Background Check</Typography>
                    <Chip
                      label={selectedApplication.backgroundCheck || "Not Started"}
                      size="small"
                      color={selectedApplication.backgroundCheck === "Approved" ? "success" : selectedApplication.backgroundCheck === "Failed" ? "error" : "warning"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Employment Verification</Typography>
                    <Chip
                      label={selectedApplication.employmentVerification || "Not Started"}
                      size="small"
                      color={selectedApplication.employmentVerification === "Verified" ? "success" : selectedApplication.employmentVerification === "Failed" ? "error" : "warning"}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Notes */}
              {selectedApplication.notes && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography variant="body2">{selectedApplication.notes}</Typography>
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

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {selectedAppForAction && (
          <>
            <MenuItem onClick={() => handleViewApplication(selectedAppForAction)}>
              <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
              View Details
            </MenuItem>
            {selectedAppForAction.status === "New" && (
              <>
                <MenuItem onClick={() => handleStatusChange(selectedAppForAction.id, "Pending")}>
                  <PendingIcon sx={{ mr: 1 }} fontSize="small" />
                  Move to Pending
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange(selectedAppForAction.id, "Denied")}>
                  <CancelIcon sx={{ mr: 1 }} fontSize="small" />
                  Deny Application
                </MenuItem>
              </>
            )}
            {selectedAppForAction.status === "Pending" && (
              <>
                <MenuItem onClick={() => handleStatusChange(selectedAppForAction.id, "Archived")}>
                  <CheckCircleRoundedIcon sx={{ mr: 1 }} fontSize="small" />
                  Approve & Archive
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange(selectedAppForAction.id, "Denied")}>
                  <CancelIcon sx={{ mr: 1 }} fontSize="small" />
                  Deny Application
                </MenuItem>
              </>
            )}
            {selectedAppForAction.status === "Denied" && (
              <MenuItem onClick={() => handleStatusChange(selectedAppForAction.id, "Pending")}>
                <PendingIcon sx={{ mr: 1 }} fontSize="small" />
                Reconsider Application
              </MenuItem>
            )}
          </>
        )}
      </Menu>

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
    </Box>
  );
}
