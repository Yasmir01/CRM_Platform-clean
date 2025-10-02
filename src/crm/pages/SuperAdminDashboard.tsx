import * as React from 'react';
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
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Badge,
  Divider,
  Tooltip
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/Cancel';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { SuperAdminData } from './SuperAdminLogin';
import SubscriptionManager from '../components/SubscriptionManager';
import SuperAdminRoleManager from '../components/SuperAdminRoleManager';
import SuperAdminMarketplaceManager from '../components/SuperAdminMarketplaceManager';
import SuperAdminRevenueDashboard from '../components/SuperAdminRevenueDashboard';
import { useRoleManagement } from '../hooks/useRoleManagement';
import { LocalStorageService } from '../services/LocalStorageService';

interface SubscriberAccount {
  id: string;
  companyName: string;
  contactEmail: string;
  contactName: string;
  phone: string;
  plan: 'Basic' | 'Professional' | 'Enterprise' | 'Custom';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Trial' | 'Overdue';
  subscriptionDate: string;
  lastPayment: string;
  nextPayment: string;
  monthlyFee: number;
  userCount: number;
  propertyCount: number;
  lastLogin: string;
  features: string[];
  paymentStatus: 'Current' | 'Overdue' | 'Failed' | 'Pending';
  trialDaysLeft?: number;
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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const mockSubscribers: SubscriberAccount[] = [
  {
    id: "1",
    companyName: "ABC Property Management",
    contactEmail: "admin@abcproperty.com",
    contactName: "John Smith",
    phone: "+1 (555) 123-4567",
    plan: "Professional",
    status: "Active",
    subscriptionDate: "2024-01-15",
    lastPayment: "2024-01-15",
    nextPayment: "2024-02-15",
    monthlyFee: 149,
    userCount: 8,
    propertyCount: 45,
    lastLogin: "2024-01-16T10:30:00",
    features: ["Properties", "Tenants", "Work Orders", "Communication", "Reports"],
    paymentStatus: "Current"
  },
  {
    id: "2",
    companyName: "Sunset Realty Group",
    contactEmail: "manager@sunsetrealty.com",
    contactName: "Sarah Johnson",
    phone: "+1 (555) 987-6543",
    plan: "Enterprise",
    status: "Active",
    subscriptionDate: "2023-11-20",
    lastPayment: "2024-01-10",
    nextPayment: "2024-02-10",
    monthlyFee: 299,
    userCount: 15,
    propertyCount: 120,
    lastLogin: "2024-01-16T14:20:00",
    features: ["Properties", "Tenants", "Work Orders", "Communication", "Reports", "Analytics", "API Access"],
    paymentStatus: "Current"
  },
  {
    id: "3",
    companyName: "Metro Housing Solutions",
    contactEmail: "contact@metrohousing.com",
    contactName: "Mike Wilson",
    phone: "+1 (555) 456-7890",
    plan: "Basic",
    status: "Overdue",
    subscriptionDate: "2024-01-01",
    lastPayment: "2024-01-01",
    nextPayment: "2024-01-15",
    monthlyFee: 79,
    userCount: 3,
    propertyCount: 12,
    lastLogin: "2024-01-14T09:15:00",
    features: ["Properties", "Tenants", "Communication"],
    paymentStatus: "Overdue"
  },
  {
    id: "4",
    companyName: "Prime Properties LLC",
    contactEmail: "info@primeproperties.com",
    contactName: "Emily Davis",
    phone: "+1 (555) 321-0987",
    plan: "Professional",
    status: "Trial",
    subscriptionDate: "2024-01-10",
    lastPayment: "2024-01-10",
    nextPayment: "2024-02-10",
    monthlyFee: 149,
    userCount: 5,
    propertyCount: 8,
    lastLogin: "2024-01-16T16:45:00",
    features: ["Properties", "Tenants", "Work Orders", "Communication", "Reports"],
    paymentStatus: "Pending",
    trialDaysLeft: 7
  }
];

interface SuperAdminDashboardProps {
  adminData: SuperAdminData;
  onLogout: () => void;
}

export default function SuperAdminDashboard({ adminData, onLogout }: SuperAdminDashboardProps) {
  const { isSuperAdmin } = useRoleManagement();
  React.useEffect(() => {
    try { if (!isSuperAdmin()) { console.warn('Access denied: Super Admin only'); } } catch {}
  }, [isSuperAdmin]);
  const [subscribers, setSubscribers] = React.useState<SubscriberAccount[]>(mockSubscribers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [planFilter, setPlanFilter] = React.useState<string>("All");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [selectedSubscriber, setSelectedSubscriber] = React.useState<SubscriberAccount | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [actionDialogOpen, setActionDialogOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<'activate' | 'deactivate' | 'suspend' | 'delete'>('activate');
  const [subscriptionManagerOpen, setSubscriptionManagerOpen] = React.useState(false);
  const [multiManagementEnabled, setMultiManagementEnabled] = React.useState(
    LocalStorageService.isMultiManagementEnabled()
  );

  const handleMultiManagementToggle = (enabled: boolean) => {
    LocalStorageService.setMultiManagementEnabled(enabled);
    setMultiManagementEnabled(enabled);

    // Show notification of change
    alert(enabled
      ? "Multi-management mode enabled. Properties can now have multiple managers assigned."
      : "Single management mode activated. Properties will fall back to single manager assignment."
    );
  };

  const handleAccountAction = (subscriber: SubscriberAccount, action: 'activate' | 'deactivate' | 'suspend' | 'delete') => {
    setSelectedSubscriber(subscriber);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const executeAccountAction = () => {
    if (!selectedSubscriber) return;

    let newStatus: SubscriberAccount['status'];
    switch (actionType) {
      case 'activate':
        newStatus = 'Active';
        break;
      case 'deactivate':
        newStatus = 'Inactive';
        break;
      case 'suspend':
        newStatus = 'Suspended';
        break;
      case 'delete':
        setSubscribers(prev => prev.filter(s => s.id !== selectedSubscriber.id));
        setActionDialogOpen(false);
        return;
    }

    setSubscribers(prev => prev.map(s => 
      s.id === selectedSubscriber.id 
        ? { ...s, status: newStatus }
        : s
    ));
    setActionDialogOpen(false);
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || subscriber.status === statusFilter;
    const matchesPlan = planFilter === "All" || subscriber.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusColor = (status: SubscriberAccount['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Suspended': return 'error';
      case 'Trial': return 'info';
      case 'Overdue': return 'warning';
      default: return 'default';
    }
  };

  const getPlanColor = (plan: SubscriberAccount['plan']) => {
    switch (plan) {
      case 'Basic': return 'default';
      case 'Professional': return 'primary';
      case 'Enterprise': return 'secondary';
      case 'Custom': return 'info';
      default: return 'default';
    }
  };

  // Statistics
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.status === 'Active').length;
  const trialSubscribers = subscribers.filter(s => s.status === 'Trial').length;
  const overdueSubscribers = subscribers.filter(s => s.status === 'Overdue').length;
  const totalRevenue = subscribers
    .filter(s => s.status === 'Active' || s.status === 'Trial')
    .reduce((sum, s) => sum + s.monthlyFee, 0);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'error.main' }}>
            <AdminPanelSettingsRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Super Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {adminData.username} ��� Master Control Panel
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AutorenewRoundedIcon />}
            onClick={() => setSubscriptionManagerOpen(true)}
            color="primary"
          >
            Manage Subscriptions
          </Button>
          <Button
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={onLogout}
            color="error"
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <BusinessRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Subscribers</Typography>
                  <Typography variant="h4">{totalSubscribers}</Typography>
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
                  <Typography variant="h6" color="text.secondary">Active Accounts</Typography>
                  <Typography variant="h4">{activeSubscribers}</Typography>
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
                  <WarningRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Overdue Accounts</Typography>
                  <Typography variant="h4">{overdueSubscribers}</Typography>
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
                  <AttachMoneyRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Monthly Revenue</Typography>
                  <Typography variant="h4">${totalRevenue.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Subscriber Accounts" />
          <Tab label="Role Management" />
          <Tab label="Marketplace Management" />
          <Tab label="System Analytics" />
          <Tab label="Billing Management" />
          <Tab label="System Settings" />
        </Tabs>
      </Box>

      {/* Subscriber Accounts Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by company, email, or contact name..."
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
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Trial">Trial</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={planFilter}
                label="Plan"
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <MenuItem value="All">All Plans</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Subscribers Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        {subscriber.companyName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Since {new Date(subscriber.subscriptionDate).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{subscriber.contactName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subscriber.contactEmail}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip 
                        label={subscriber.plan} 
                        color={getPlanColor(subscriber.plan)}
                        size="small" 
                      />
                      <Typography variant="caption" color="text.secondary">
                        ${subscriber.monthlyFee}/month
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip 
                        label={subscriber.status} 
                        color={getStatusColor(subscriber.status)}
                        size="small" 
                      />
                      {subscriber.trialDaysLeft && (
                        <Typography variant="caption" color="warning.main">
                          {subscriber.trialDaysLeft} days left
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        👥 {subscriber.userCount} users
                      </Typography>
                      <Typography variant="body2">
                        🏠 {subscriber.propertyCount} properties
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        Next: {new Date(subscriber.nextPayment).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={subscriber.paymentStatus} 
                        color={subscriber.paymentStatus === 'Current' ? 'success' : 'error'}
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSubscriber(subscriber);
                            setDetailDialogOpen(true);
                          }}
                        >
                          <VisibilityRoundedIcon />
                        </IconButton>
                      </Tooltip>

                      {subscriber.status === 'Inactive' && (
                        <Tooltip title="Activate Account">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAccountAction(subscriber, 'activate')}
                          >
                            <CheckCircleRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {subscriber.status === 'Active' && (
                        <Tooltip title="Deactivate Account">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAccountAction(subscriber, 'deactivate')}
                          >
                            <CancelRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Suspend Account">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleAccountAction(subscriber, 'suspend')}
                        >
                          <WarningRoundedIcon />
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

      {/* Role Management Tab */}
      <TabPanel value={currentTab} index={1}>
        <SuperAdminRoleManager />
      </TabPanel>

      {/* Marketplace Management Tab */}
      <TabPanel value={currentTab} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Manage marketplace products, add-ons, services, and subscriptions.
        </Alert>
        <SuperAdminMarketplaceManager />
      </TabPanel>

      {/* System Analytics Tab */}
      <TabPanel value={currentTab} index={3}>
        <Alert severity="info" sx={{ mb: 3 }}>
          System analytics dashboard showing platform usage, performance metrics, and subscriber insights.
        </Alert>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Platform Usage</Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time system metrics and performance data would be displayed here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue Trends</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly recurring revenue and growth analytics would be shown here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Billing Management Tab */}
      <TabPanel value={currentTab} index={4}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Billing management system for processing payments, managing subscriptions, and handling billing disputes.
        </Alert>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Billing Overview</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comprehensive billing management tools and revenue analytics.
                </Typography>
                <SuperAdminRevenueDashboard />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* System Settings Tab */}
      <TabPanel value={currentTab} index={5}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">System-Wide Configuration</Typography>
          <Typography variant="body2">
            These settings affect all CRM instances globally. Changes will be applied immediately and saved permanently.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Management Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={multiManagementEnabled}
                      onChange={(e) => handleMultiManagementToggle(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Multi-Management Mode
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {multiManagementEnabled
                          ? "Properties can have multiple managers assigned. Each manager can access and manage the property."
                          : "Properties are limited to single manager assignment. Only one manager per property is allowed."
                        }
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    '& .MuiFormControlLabel-label': { mt: -0.5 }
                  }}
                />

                <Alert
                  severity={multiManagementEnabled ? "success" : "info"}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2">
                    <strong>Current Mode:</strong> {multiManagementEnabled ? "Multi-Management" : "Single Management"}
                  </Typography>
                  <Typography variant="body2">
                    {multiManagementEnabled
                      ? "Properties will support multiple managers with shared access and responsibilities."
                      : "Properties will fall back to single manager assignment with fallback support for multiple users with the same role to assist."
                    }
                  </Typography>
                </Alert>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Implementation Details:
                  </Typography>
                  <Typography variant="body2" component="div">
                    • <strong>Multi-Management:</strong> Multiple managers can be assigned to each property
                    <br />
                    • <strong>Single Management:</strong> One primary manager per property with assistant users
                    <br />
                    • <strong>Fallback:</strong> Multiple users with same role can assist with property management
                    <br />
                    • Changes are applied system-wide and saved to localStorage
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional System Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      Additional system-wide settings can be configured here as the platform grows.
                      This includes tenant communication defaults, work order routing, and notification preferences.
                    </Typography>
                  </Alert>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Global Notifications</Typography>
                    <Switch defaultChecked />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Auto-backup Settings</Typography>
                    <Switch defaultChecked />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Advanced Analytics</Typography>
                    <Switch defaultChecked />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Subscriber Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Subscriber Account Details
        </DialogTitle>
        <DialogContent>
          {selectedSubscriber && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Company Information</Typography>
                <Typography variant="body2">Company: {selectedSubscriber.companyName}</Typography>
                <Typography variant="body2">Contact: {selectedSubscriber.contactName}</Typography>
                <Typography variant="body2">Email: {selectedSubscriber.contactEmail}</Typography>
                <Typography variant="body2">Phone: {selectedSubscriber.phone}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Subscription Details</Typography>
                <Typography variant="body2">Plan: {selectedSubscriber.plan}</Typography>
                <Typography variant="body2">Status: {selectedSubscriber.status}</Typography>
                <Typography variant="body2">Monthly Fee: ${selectedSubscriber.monthlyFee}</Typography>
                <Typography variant="body2">Next Payment: {selectedSubscriber.nextPayment}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Features</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {selectedSubscriber.features.map((feature, index) => (
                    <Chip key={index} label={feature} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Account Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Account Action
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to {actionType} the account for {selectedSubscriber?.companyName}?
          </Alert>
          <Typography variant="body2">
            This action will immediately change the account status and may affect the subscriber's access to the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={actionType === 'delete' ? 'error' : 'primary'}
            onClick={executeAccountAction}
          >
            {actionType.charAt(0).toUpperCase() + actionType.slice(1)} Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Manager */}
      <SubscriptionManager
        open={subscriptionManagerOpen}
        onClose={() => setSubscriptionManagerOpen(false)}
      />
    </Box>
  );
}
