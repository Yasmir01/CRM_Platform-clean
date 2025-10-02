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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import BundleIcon from '@mui/icons-material/Category';
import PlatformIcon from '@mui/icons-material/Hub';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';;

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

// Platform Edit Form Component
function PlatformEditForm({
  platform,
  onSave,
  onCancel
}: {
  platform: PlatformConfiguration | null;
  onSave: (data: Partial<PlatformConfiguration>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = React.useState({
    displayName: platform?.displayName || '',
    description: platform?.description || '',
    websiteUrl: platform?.websiteUrl || '',
    status: platform?.status || 'inactive' as PlatformStatus,
    basePrice: platform?.pricing.basePrice || 0,
    priceType: platform?.pricing.priceType || 'per_listing' as any,
    bundleEligible: platform?.pricing.bundleEligible || false,
    maxPhotos: platform?.maxPhotos || 20,
    maxDescriptionLength: platform?.maxDescriptionLength || 1000,
    processingTime: platform?.processingTime || '1-2 hours',
    listingDuration: platform?.listingDuration || 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: formData.displayName,
      description: formData.description,
      websiteUrl: formData.websiteUrl,
      status: formData.status,
      pricing: {
        ...platform?.pricing,
        basePrice: formData.basePrice,
        priceType: formData.priceType,
        bundleEligible: formData.bundleEligible
      },
      maxPhotos: formData.maxPhotos,
      maxDescriptionLength: formData.maxDescriptionLength,
      processingTime: formData.processingTime,
      listingDuration: formData.listingDuration,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Display Name"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PlatformStatus }))}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Website URL"
            value={formData.websiteUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Processing Time"
            value={formData.processingTime}
            onChange={(e) => setFormData(prev => ({ ...prev, processingTime: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Base Price"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Max Photos"
            type="number"
            value={formData.maxPhotos}
            onChange={(e) => setFormData(prev => ({ ...prev, maxPhotos: parseInt(e.target.value) || 0 }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Listing Duration (days)"
            type="number"
            value={formData.listingDuration}
            onChange={(e) => setFormData(prev => ({ ...prev, listingDuration: parseInt(e.target.value) || 0 }))}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.bundleEligible}
                onChange={(e) => setFormData(prev => ({ ...prev, bundleEligible: e.target.checked }))}
              />
            }
            label="Bundle Eligible"
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ px: 0, mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
          Save Platform
        </Button>
      </DialogActions>
    </Box>
  );
}

// Bundle Edit Form Component
function BundleEditForm({
  bundle,
  availablePlatforms,
  onSave,
  onCancel
}: {
  bundle: PlatformBundle | null;
  availablePlatforms: PlatformConfiguration[];
  onSave: (data: Partial<PlatformBundle>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = React.useState({
    name: bundle?.name || '',
    description: bundle?.description || '',
    platforms: bundle?.platforms || [],
    totalPrice: bundle?.totalPrice || 0,
    discountPercentage: bundle?.discountPercentage || 0,
    isPopular: bundle?.isPopular || false,
    isActive: bundle?.isActive !== false,
    features: bundle?.features || []
  });

  const [newFeature, setNewFeature] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const originalPrice = formData.platforms.reduce((total, platformName) => {
      const platform = availablePlatforms.find(p => p.platform === platformName);
      return total + (platform?.pricing.basePrice || 0);
    }, 0);

    onSave({
      name: formData.name,
      description: formData.description,
      platforms: formData.platforms,
      totalPrice: formData.totalPrice,
      originalPrice,
      discountPercentage: formData.discountPercentage,
      isPopular: formData.isPopular,
      isActive: formData.isActive,
      features: formData.features,
      updatedAt: new Date().toISOString()
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Bundle Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Total Price"
            type="number"
            value={formData.totalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, totalPrice: parseFloat(e.target.value) || 0 }))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Included Platforms</InputLabel>
            <Select
              multiple
              value={formData.platforms}
              label="Included Platforms"
              onChange={(e) => setFormData(prev => ({ ...prev, platforms: e.target.value as RealEstatePlatform[] }))}
            >
              {availablePlatforms.map((platform) => (
                <MenuItem key={platform.platform} value={platform.platform}>
                  {platform.displayName} (${platform.pricing.basePrice})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Discount Percentage"
            type="number"
            value={formData.discountPercentage}
            onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseFloat(e.target.value) || 0 }))}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPopular}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                />
              }
              label="Mark as Popular"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>Features</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField
              size="small"
              placeholder="Add feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button size="small" onClick={addFeature} variant="outlined">
              Add
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {formData.features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                onDelete={() => removeFeature(index)}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>

      <DialogActions sx={{ px: 0, mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
          Save Bundle
        </Button>
      </DialogActions>
    </Box>
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

  const handleSavePlatform = async (platformData: Partial<PlatformConfiguration>) => {
    try {
      if (selectedPlatform) {
        // Update existing platform
        await RealEstatePlatformService.updatePlatformConfig(
          selectedPlatform.platform,
          platformData,
          'super_admin_001'
        );
        setPlatforms(prev => prev.map(p =>
          p.platform === selectedPlatform.platform ? { ...p, ...platformData } : p
        ));
        showSnackbar('Platform updated successfully', 'success');
      } else {
        // Create new platform (would need additional implementation)
        showSnackbar('Platform creation not implemented yet', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save platform', 'error');
    } finally {
      setPlatformDialogOpen(false);
      setSelectedPlatform(null);
    }
  };

  const handleSaveBundle = async (bundleData: Partial<PlatformBundle>) => {
    try {
      if (selectedBundle) {
        // Update existing bundle
        const updatedBundle = await PlatformBundleService.updateBundle(selectedBundle.id, bundleData);
        if (updatedBundle) {
          setBundles(prev => prev.map(b =>
            b.id === selectedBundle.id ? updatedBundle : b
          ));
          showSnackbar('Bundle updated successfully', 'success');
        }
      } else {
        // Create new bundle
        const newBundle = await PlatformBundleService.createBundle(bundleData as Omit<PlatformBundle, 'id'>);
        if (newBundle) {
          setBundles(prev => [...prev, newBundle]);
          showSnackbar('Bundle created successfully', 'success');
        }
      }
    } catch (error) {
      showSnackbar('Failed to save bundle', 'error');
    } finally {
      setBundleDialogOpen(false);
      setSelectedBundle(null);
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
