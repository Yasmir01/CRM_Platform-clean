import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';
import { useCrmData } from '../contexts/CrmDataContext';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import AnnouncementRoundedIcon from '@mui/icons-material/AnnouncementRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import { useNavigate } from 'react-router-dom';

export default function TenantView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canSwitchToManagementMode } = useMode();
  const { state } = useCrmData();
  const { properties, tenants } = state;

  // Get tenant data - either from current user (if tenant) or mock data for management users
  const tenantData = React.useMemo(() => {
    if (user?.role === 'Tenant') {
      // Real tenant user
      const tenant = tenants.find(t => t.email === user.email);
      const property = tenant?.propertyId ? properties.find(p => p.id === tenant.propertyId) : null;

      return {
        name: `${user.firstName} ${user.lastName}`,
        property: property ? `${property.name} - Unit ${tenant?.unit || 'N/A'}` : 'No Property Assigned',
        leaseEnd: tenant?.leaseEnd || '2024-12-31',
        monthlyRent: tenant?.monthlyRent || property?.monthlyRent || 0,
        balance: 0,
        lastPayment: "2024-01-01",
        isRealTenant: true
      };
    } else {
      // Management user viewing tenant mode
      return {
        name: "Sarah Johnson",
        property: "Sunset Apartments - Unit 2A",
        leaseEnd: "2024-12-31",
        monthlyRent: 2500,
        balance: 0,
        lastPayment: "2024-01-01",
        isRealTenant: false
      };
    }
  }, [user, tenants, properties]);

  const recentMessages = [
    {
      id: 1,
      type: "announcement",
      title: "Pool Maintenance Schedule",
      message: "The pool will be closed for maintenance on Jan 15-16.",
      date: "2024-01-12",
      priority: "medium"
    },
    {
      id: 2,
      type: "policy",
      title: "New Parking Policy Effective February 1st",
      message: "Starting February 1st, we will be implementing a new parking policy.",
      date: "2024-01-10",
      priority: "high"
    },
    {
      id: 3,
      type: "event",
      title: "Community BBQ Event - January 25th",
      message: "Join us for our monthly community BBQ on Saturday, January 25th.",
      date: "2024-01-08",
      priority: "medium"
    }
  ];

  const workOrders = [
    {
      id: "WO-001",
      title: "Kitchen Faucet Leak",
      status: "In Progress",
      submitted: "2024-01-20",
      description: "Kitchen faucet is leaking from the base"
    },
    {
      id: "WO-002", 
      title: "AC Filter Replacement",
      status: "Completed",
      submitted: "2024-01-15",
      description: "Monthly AC filter replacement"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircleRoundedIcon fontSize="small" />;
      case 'in progress': return <PendingRoundedIcon fontSize="small" />;
      case 'pending': return <ReportProblemRoundedIcon fontSize="small" />;
      default: return <PendingRoundedIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Stack spacing={4}>
        {/* Welcome Header */}
        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <HomeRoundedIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Welcome, {tenantData.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {tenantData.property}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Quick Info Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AccountBalanceWalletRoundedIcon color="primary" />
                  <Box>
                    <Typography variant="h6">Rent Status</Typography>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                      PAID
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last payment: {tenantData.lastPayment}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <BuildRoundedIcon color="warning" />
                  <Box>
                    <Typography variant="h6">Work Orders</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {workOrders.filter(wo => wo.status !== 'Completed').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active requests
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AnnouncementRoundedIcon color="info" />
                  <Box>
                    <Typography variant="h6">Messages</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {recentMessages.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recent announcements
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Work Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Work Orders
                  </Typography>
                  <Button variant="outlined" size="small">
                    Submit Request
                  </Button>
                </Stack>
                <List>
                  {workOrders.map((order) => (
                    <ListItem key={order.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getStatusIcon(order.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography component="span" variant="subtitle2">{order.title}</Typography>
                            <Chip
                              label={order.status}
                              size="small"
                              color={getStatusColor(order.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="div">
                            <Typography component="div" variant="body2" color="text.secondary">
                              {order.description}
                            </Typography>
                            <Typography component="div" variant="caption" color="text.secondary">
                              Submitted: {order.submitted}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Messages */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Announcements
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/news')}
                  >
                    View All
                  </Button>
                </Stack>
                <Stack spacing={2}>
                  {recentMessages.slice(0, 2).map((message) => (
                    <Alert
                      key={message.id}
                      severity={message.priority === 'high' ? 'warning' : 'info'}
                      variant="outlined"
                    >
                      <Typography component="div" variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {message.title}
                      </Typography>
                      <Typography component="div" variant="body2" sx={{ mt: 0.5 }}>
                        {message.message}
                      </Typography>
                      <Typography component="div" variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {message.date}
                      </Typography>
                    </Alert>
                  ))}
                  {recentMessages.length > 2 && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                      +{recentMessages.length - 2} more announcements
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountBalanceWalletRoundedIcon />}
                  sx={{ py: 1.5 }}
                >
                  Pay Rent
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BuildRoundedIcon />}
                  sx={{ py: 1.5 }}
                >
                  Submit Work Order
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EmailRoundedIcon />}
                  sx={{ py: 1.5 }}
                >
                  Contact Management
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PhoneRoundedIcon />}
                  sx={{ py: 1.5 }}
                >
                  Emergency Contact
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Troubleshooting Info */}
        {!tenantData.isRealTenant && canSwitchToManagementMode && (
          <Alert severity="info" variant="outlined">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              🔧 Troubleshooting Mode Active
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              You are viewing the simplified tenant interface. This mode helps management understand the tenant experience for troubleshooting purposes.
              Switch back to Management Mode to access full CRM features.
            </Typography>
          </Alert>
        )}

        {tenantData.isRealTenant && (
          <Alert severity="success" variant="outlined">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              🏠 Tenant Portal
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Welcome to your tenant portal. Here you can manage your lease, submit maintenance requests, view announcements, and contact management.
            </Typography>
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
