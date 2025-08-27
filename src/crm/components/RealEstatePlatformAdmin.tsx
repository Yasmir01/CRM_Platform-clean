/**
 * Real Estate Platform Administration Dashboard
 * Super Admin interface for managing platform configurations, pricing, and bundles
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
  IconButton,
  TextField,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  InputAdornment,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  Category as BundleIcon,
  Hub as PlatformIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

import { RealEstatePlatformService } from '../services/RealEstatePlatformService';
import { PlatformBundleService } from '../services/PlatformBundleService';
import {
  RealEstatePlatform,
  PlatformConfiguration,
  PlatformBundle,
  PlatformPricing,
  SuperAdminPlatformSettings,
  AuthenticationType,
  PlatformStatus
} from '../types/RealEstatePlatformTypes';

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
      id={`platform-admin-tabpanel-${index}`}
      aria-labelledby={`platform-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RealEstatePlatformAdmin() {
  const [tabValue, setTabValue] = React.useState(0);
  const [platforms, setPlatforms] = React.useState<PlatformConfiguration[]>([]);
  const [bundles, setBundles] = React.useState<PlatformBundle[]>([]);
  const [selectedPlatform, setSelectedPlatform] = React.useState<PlatformConfiguration | null>(null);
  const [selectedBundle, setSelectedBundle] = React.useState<PlatformBundle | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Dialog states
  const [platformDialogOpen, setPlatformDialogOpen] = React.useState(false);
  const [bundleDialogOpen, setBundleDialogOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ type: 'platform' | 'bundle'; id: string } | null>(null);

  React.useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      await RealEstatePlatformService.initialize();
      await PlatformBundleService.initialize();
      
      setPlatforms(RealEstatePlatformService.getAvailablePlatforms());
      setBundles(PlatformBundleService.getAvailableBundles());
    } catch (error) {
      console.error('Failed to initialize data:', error);
      showSnackbar('Failed to load platform data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlatformToggle = async (platform: PlatformConfiguration) => {
    try {
      const newStatus: PlatformStatus = platform.status === 'active' ? 'inactive' : 'active';
      await RealEstatePlatformService.updatePlatformConfig(
        platform.platform, 
        { status: newStatus },
        'super_admin_001'
      );
      
      setPlatforms(prev => prev.map(p => 
        p.platform === platform.platform ? { ...p, status: newStatus } : p
      ));
      
      showSnackbar(`Platform ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      showSnackbar('Failed to update platform status', 'error');
    }
  };

  const handleBundleToggle = async (bundleId: string) => {
    try {
      const bundle = bundles.find(b => b.id === bundleId);
      if (!bundle) return;

      const updatedBundle = await PlatformBundleService.updateBundle(bundleId, {
        isActive: !bundle.isActive
      });

      if (updatedBundle) {
        setBundles(prev => prev.map(b => 
          b.id === bundleId ? updatedBundle : b
        ));
        showSnackbar(`Bundle ${updatedBundle.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      }
    } catch (error) {
      showSnackbar('Failed to update bundle status', 'error');
    }
  };

  const handleEditPlatform = (platform: PlatformConfiguration) => {
    setSelectedPlatform(platform);
    setPlatformDialogOpen(true);
  };

  const handleEditBundle = (bundle: PlatformBundle) => {
    setSelectedBundle(bundle);
    setBundleDialogOpen(true);
  };

  const handleDeleteItem = (type: 'platform' | 'bundle', id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'bundle') {
        await PlatformBundleService.deleteBundle(itemToDelete.id);
        setBundles(prev => prev.filter(b => b.id !== itemToDelete.id));
        showSnackbar('Bundle deleted successfully', 'success');
      }
      // Note: Platform deletion might not be allowed in production
    } catch (error) {
      showSnackbar('Failed to delete item', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const getStatusIcon = (status: PlatformStatus) => {
    switch (status) {
      case 'active': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'suspended': return <WarningIcon color="warning" />;
      default: return <VisibilityOffIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: PlatformStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'error': return 'error';
      case 'suspended': return 'warning';
      default: return 'default';
    }
  };

  const PlatformManagementTab = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Platform Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedPlatform(null);
            setPlatformDialogOpen(true);
          }}
        >
          Add Platform
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {platforms.map((platform) => (
          <Grid item xs={12} md={6} lg={4} key={platform.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{platform.displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {platform.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getStatusIcon(platform.status)}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={platform.status === 'active'}
                            onChange={() => handlePlatformToggle(platform)}
                            size="small"
                          />
                        }
                        label=""
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label={platform.status} 
                      size="small" 
                      color={getStatusColor(platform.status) as any}
                    />
                    <Chip 
                      label={platform.authenticationType} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`$${platform.pricing.basePrice}`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="body2">
                    <strong>Supported Types:</strong> {platform.supportedPropertyTypes.join(', ')}
                  </Typography>

                  <Typography variant="body2">
                    <strong>Max Photos:</strong> {platform.maxPhotos} | 
                    <strong> Processing:</strong> {platform.processingTime}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleEditPlatform(platform)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteItem('platform', platform.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <AnalyticsIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const BundleManagementTab = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Bundle Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedBundle(null);
            setBundleDialogOpen(true);
          }}
        >
          Create Bundle
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {bundles.map((bundle) => (
          <Grid item xs={12} md={6} lg={4} key={bundle.id}>
            <Card sx={{ position: 'relative' }}>
              {bundle.isPopular && (
                <Chip
                  label="Most Popular"
                  color="secondary"
                  size="small"
                  sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                />
              )}
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{bundle.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bundle.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={bundle.isActive}
                          onChange={() => handleBundleToggle(bundle.id)}
                          size="small"
                        />
                      }
                      label=""
                    />
                  </Stack>

                  <Box>
                    <Typography variant="h4" color="primary" component="span">
                      ${bundle.totalPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                      /month
                    </Typography>
                    {bundle.originalPrice && bundle.originalPrice > bundle.totalPrice && (
                      <Typography variant="body2" component="div">
                        <span style={{ textDecoration: 'line-through' }}>
                          ${bundle.originalPrice}
                        </span>
                        <Chip 
                          label={`${bundle.discountPercentage}% OFF`} 
                          size="small" 
                          color="success" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Included Platforms ({bundle.platforms.length}):
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {bundle.platforms.slice(0, 3).map((platform) => (
                        <Chip key={platform} label={platform} size="small" variant="outlined" />
                      ))}
                      {bundle.platforms.length > 3 && (
                        <Chip label={`+${bundle.platforms.length - 3} more`} size="small" />
                      )}
                    </Stack>
                  </Box>

                  <List dense>
                    {bundle.features.slice(0, 3).map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 20 }}>
                          <CheckCircleIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {bundle.features.length > 3 && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary={`+${bundle.features.length - 3} more features`}
                          primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleEditBundle(bundle)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteItem('bundle', bundle.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <AnalyticsIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const PricingManagementTab = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Pricing Management</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Platform</TableCell>
              <TableCell>Pricing Type</TableCell>
              <TableCell align="right">Base Price</TableCell>
              <TableCell>Bundle Eligible</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {platforms.map((platform) => (
              <TableRow key={platform.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="subtitle2">{platform.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {platform.platform}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={platform.pricing.priceType.replace('_', ' ')} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">
                    ${platform.pricing.basePrice}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={platform.pricing.bundleEligible ? 'Yes' : 'No'}
                    size="small"
                    color={platform.pricing.bundleEligible ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={platform.pricing.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={platform.pricing.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEditPlatform(platform)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const AnalyticsTab = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Platform Analytics</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h4" color="primary">
                  {platforms.filter(p => p.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Platforms
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h4" color="success.main">
                  {bundles.filter(b => b.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Bundles
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h4" color="warning.main">
                  $12,543
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h4" color="info.main">
                  1,234
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Listings
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Platform Performance</Typography>
              <Alert severity="info">
                Detailed analytics and reporting features will be implemented in the next phase.
                This will include platform usage statistics, revenue metrics, user engagement data, and more.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading platform administration...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Real Estate Platform Administration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage platform configurations, pricing, bundles, and monitor system performance
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <PlatformIcon />
                <span>Platforms</span>
                <Badge badgeContent={platforms.filter(p => p.status === 'active').length} color="primary" />
              </Stack>
            }
          />
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <BundleIcon />
                <span>Bundles</span>
                <Badge badgeContent={bundles.filter(b => b.isActive).length} color="secondary" />
              </Stack>
            }
          />
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <MoneyIcon />
                <span>Pricing</span>
              </Stack>
            }
          />
          <Tab 
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <AnalyticsIcon />
                <span>Analytics</span>
              </Stack>
            }
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <PlatformManagementTab />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <BundleManagementTab />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <PricingManagementTab />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <AnalyticsTab />
      </TabPanel>

      {/* Platform Edit Dialog */}
      <Dialog
        open={platformDialogOpen}
        onClose={() => setPlatformDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPlatform ? `Edit ${selectedPlatform.displayName}` : 'Add New Platform'}
        </DialogTitle>
        <DialogContent>
          <PlatformEditForm
            platform={selectedPlatform}
            onSave={handleSavePlatform}
            onCancel={() => setPlatformDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Bundle Edit Dialog */}
      <Dialog
        open={bundleDialogOpen}
        onClose={() => setBundleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedBundle ? `Edit ${selectedBundle.name}` : 'Create New Bundle'}
        </DialogTitle>
        <DialogContent>
          <BundleEditForm
            bundle={selectedBundle}
            availablePlatforms={platforms}
            onSave={handleSaveBundle}
            onCancel={() => setBundleDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
