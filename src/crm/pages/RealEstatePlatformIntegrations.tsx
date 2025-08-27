/**
 * Real Estate Platform Integrations Hub
 * Main page for accessing all platform integration features
 */

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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar
} from '@mui/material';
import {
  Publish,
  CheckCircle,
  Error,
  Warning,
  Settings,
  Analytics,
  Help,
  Launch,
  MonetizationOn,
  Security,
  Refresh,
  TrendingUp,
  Speed,
  Group,
  Assignment,
  Close
} from '@mui/icons-material';

import { useCrmData } from '../contexts/CrmDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useRoleManagement } from '../hooks/useRoleManagement';
import RealEstatePlatformAdmin from '../components/RealEstatePlatformAdmin';
import PropertyPublishingInterface from '../components/PropertyPublishingInterface';
import { RealEstatePlatformService } from '../services/RealEstatePlatformService';
import { PlatformBundleService } from '../services/PlatformBundleService';
import {
  RealEstatePlatform,
  PlatformConfiguration,
  PlatformBundle,
  PublishingJob
} from '../types/RealEstatePlatformTypes';

export default function RealEstatePlatformIntegrations() {
  const { properties } = useCrmData();
  const { user } = useAuth();
  const { isSuperAdmin } = useRoleManagement();
  
  const [platforms, setPlatforms] = React.useState<PlatformConfiguration[]>([]);
  const [bundles, setBundles] = React.useState<PlatformBundle[]>([]);
  const [recentJobs, setRecentJobs] = React.useState<PublishingJob[]>([]);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [adminDialogOpen, setAdminDialogOpen] = React.useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });

  React.useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      
      // Initialize services
      await RealEstatePlatformService.initialize();
      await PlatformBundleService.initialize();
      
      // Load data
      const availablePlatforms = RealEstatePlatformService.getAvailablePlatforms();
      const availableBundles = PlatformBundleService.getAvailableBundles();
      
      setPlatforms(availablePlatforms);
      setBundles(availableBundles);
      
      // Load recent publishing jobs (mock data for demo)
      const mockJobs: PublishingJob[] = (properties || []).slice(0, 3).map((property, index) => ({
        id: `job_${index}`,
        propertyId: property.id,
        platforms: ['zillow', 'apartments_com', 'trulia'] as RealEstatePlatform[],
        status: Math.random() > 0.3 ? 'completed' : 'failed',
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        results: [],
        totalPlatforms: 3,
        successfulPlatforms: Math.random() > 0.3 ? 2 : 0,
        failedPlatforms: Math.random() > 0.3 ? 1 : 3
      }));
      
      setRecentJobs(mockJobs);
      
    } catch (error) {
      console.error('Failed to initialize integration data:', error);
      showSnackbar('Failed to load integration data');
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleQuickPublish = (property: any) => {
    setSelectedProperty(property);
    setPublishDialogOpen(true);
  };

  const handlePublishComplete = (job: PublishingJob) => {
    setRecentJobs(prev => [job, ...prev.slice(0, 4)]);
    showSnackbar(`Publishing completed for ${job.successfulPlatforms} platforms`);
  };

  const getConnectedPlatformsCount = () => {
    return platforms.filter(p => RealEstatePlatformService.isPlatformAuthenticated(p.platform)).length;
  };

  const getActiveBundlesCount = () => {
    return bundles.filter(b => b.isActive).length;
  };

  const getRecentSuccessRate = () => {
    if (recentJobs.length === 0) return 0;
    const successfulJobs = recentJobs.filter(job => job.status === 'completed').length;
    return Math.round((successfulJobs / recentJobs.length) * 100);
  };

  const getTotalListingsPublished = () => {
    return recentJobs.reduce((total, job) => total + job.successfulPlatforms, 0);
  };

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading platform integrations...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Real Estate Platform Integrations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Publish your properties to 15+ real estate platforms with one click
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {isSuperAdmin && (
              <Button
                variant="outlined"
                startIcon={<Settings />}
                onClick={() => setAdminDialogOpen(true)}
              >
                Admin Settings
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Help />}
              onClick={() => window.open('/help?category=platform-integrations', '_blank')}
            >
              Help & Guides
            </Button>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">🚀 Platform Integration System Ready!</Typography>
          <Typography variant="body2">
            Connect to major real estate platforms and start publishing your properties instantly. 
            Choose from individual platforms or save with bundle packages.
          </Typography>
        </Alert>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }}
                >
                  <Launch />
                </Box>
                <Box>
                  <Typography variant="h4" color="primary">
                    {getConnectedPlatformsCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connected Platforms
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
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'success.light',
                    color: 'success.contrastText'
                  }}
                >
                  <TrendingUp />
                </Box>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {getTotalListingsPublished()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Listings Published
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
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'warning.light',
                    color: 'warning.contrastText'
                  }}
                >
                  <Speed />
                </Box>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {getRecentSuccessRate()}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
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
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText'
                  }}
                >
                  <Group />
                </Box>
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    {getActiveBundlesCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Bundles
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Publish />}
                  disabled={!properties?.length}
                  onClick={() => {
                    if (properties?.length > 0) {
                      handleQuickPublish(properties[0]);
                    }
                  }}
                >
                  Publish Property to Platforms
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<MonetizationOn />}
                  onClick={() => window.open('/help?article=platform-pricing-overview', '_blank')}
                >
                  View Pricing & Bundles
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Security />}
                  onClick={() => window.open('/help?article=platform-authentication-overview', '_blank')}
                >
                  Setup Platform Authentication
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Analytics />}
                  disabled
                >
                  View Analytics Dashboard (Coming Soon)
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Platform Status
                </Typography>
                <IconButton size="small" onClick={initializeData}>
                  <Refresh />
                </IconButton>
              </Stack>
              
              <List>
                {platforms.slice(0, 5).map((platform) => {
                  const isConnected = RealEstatePlatformService.isPlatformAuthenticated(platform.platform);
                  return (
                    <ListItem key={platform.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        {isConnected ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Error color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={platform.displayName}
                        secondary={`$${platform.pricing.basePrice} - ${isConnected ? 'Connected' : 'Not Connected'}`}
                      />
                      <Chip
                        label={platform.status}
                        size="small"
                        color={platform.status === 'active' ? 'success' : 'default'}
                      />
                    </ListItem>
                  );
                })}
              </List>
              
              {(platforms?.length || 0) > 5 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button size="small" onClick={() => setAdminDialogOpen(true)}>
                    View All {platforms?.length || 0} Platforms
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Publishing Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Publishing Activity
              </Typography>
              
              {(recentJobs?.length || 0) === 0 ? (
                <Alert severity="info">
                  No recent publishing activity. Start by publishing your first property!
                </Alert>
              ) : (
                <List>
                  {recentJobs.map((job) => {
                    const property = properties?.find(p => p.id === job.propertyId);
                    const successRate = Math.round((job.successfulPlatforms / job.totalPlatforms) * 100);
                    
                    return (
                      <ListItem key={job.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {job.status === 'completed' ? (
                            <CheckCircle color="success" />
                          ) : (
                            <Error color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={property?.name || 'Unknown Property'}
                          secondary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2">
                                {job.successfulPlatforms}/{job.totalPlatforms} platforms successful
                              </Typography>
                              <Chip
                                label={`${successRate}% success`}
                                size="small"
                                color={successRate >= 80 ? 'success' : successRate >= 50 ? 'warning' : 'error'}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(job.submittedAt).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Properties */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Properties Ready for Publishing
              </Typography>
              
              {(!properties?.length) ? (
                <Alert severity="warning">
                  No properties available. Add properties first to start publishing.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {(properties || []).slice(0, 6).map((property) => (
                    <Grid item xs={12} sm={6} md={4} key={property.id}>
                      <Card variant="outlined">
                        <CardContent sx={{ pb: 1 }}>
                          <Typography variant="subtitle1" noWrap>
                            {property.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {property.address}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            ${property.monthlyRent}/month
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip label={property.type} size="small" />
                            <Chip 
                              label={property.status} 
                              size="small" 
                              color={property.status === 'Available' ? 'success' : 'default'}
                            />
                          </Stack>
                          <Button
                            size="small"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 2 }}
                            startIcon={<Publish />}
                            onClick={() => handleQuickPublish(property)}
                          >
                            Publish
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {(properties?.length || 0) > 6 && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button variant="outlined">
                    View All {properties?.length || 0} Properties
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Dialog */}
      {isSuperAdmin && (
        <Dialog 
          open={adminDialogOpen} 
          onClose={() => setAdminDialogOpen(false)} 
          maxWidth="xl" 
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Platform Administration</Typography>
              <IconButton onClick={() => setAdminDialogOpen(false)}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <RealEstatePlatformAdmin />
          </DialogContent>
        </Dialog>
      )}

      {/* Publishing Dialog */}
      {selectedProperty && (
        <PropertyPublishingInterface
          property={selectedProperty}
          isOpen={publishDialogOpen}
          onClose={() => {
            setPublishDialogOpen(false);
            setSelectedProperty(null);
          }}
          onPublishComplete={handlePublishComplete}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
