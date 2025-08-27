/**
 * Platform Pricing Management Page
 * Dedicated page for managing platform pricing and bundles
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack,
  Edit as EditIcon,
  Add as AddIcon,
  MonetizationOn,
  TrendingUp,
  Assessment,
  Category,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { RealEstatePlatformService } from '../services/RealEstatePlatformService';
import { PlatformBundleService } from '../services/PlatformBundleService';
import {
  PlatformConfiguration,
  PlatformBundle,
  PlatformPricing
} from '../types/RealEstatePlatformTypes';

export default function PlatformPricingManagement() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = React.useState<PlatformConfiguration[]>([]);
  const [bundles, setBundles] = React.useState<PlatformBundle[]>([]);
  const [selectedPricing, setSelectedPricing] = React.useState<PlatformPricing | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

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
      console.error('Failed to initialize pricing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPricing = (pricing: PlatformPricing) => {
    setSelectedPricing(pricing);
    setEditDialogOpen(true);
  };

  const handleSavePricing = async (pricingData: Partial<PlatformPricing>) => {
    if (!selectedPricing) return;

    try {
      await RealEstatePlatformService.updatePlatformConfig(
        selectedPricing.platform,
        { pricing: { ...selectedPricing, ...pricingData } },
        'admin_user'
      );
      
      setPlatforms(prev => prev.map(p => 
        p.pricing.platform === selectedPricing.platform 
          ? { ...p, pricing: { ...p.pricing, ...pricingData } }
          : p
      ));
      
      setEditDialogOpen(false);
      setSelectedPricing(null);
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  const getTotalRevenue = () => {
    return platforms.reduce((total, platform) => total + platform.pricing.basePrice, 0);
  };

  const getActivePlatformCount = () => {
    return platforms.filter(p => p.pricing.isActive).length;
  };

  const getBundleEligibleCount = () => {
    return platforms.filter(p => p.pricing.bundleEligible).length;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading pricing data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/crm/real-estate-platforms')}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4">Platform Pricing Management</Typography>
          <Typography variant="body1" color="text.secondary">
            Manage pricing for all real estate platforms and bundles
          </Typography>
        </Box>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <MonetizationOn color="primary" />
                <Box>
                  <Typography variant="h4" color="primary">
                    ${getTotalRevenue()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue/Month
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingUp color="success" />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {getActivePlatformCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Platforms
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Category color="warning" />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {bundles.filter(b => b.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Bundles
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Assessment color="info" />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {getBundleEligibleCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bundle Eligible
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Platform Pricing Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Pricing
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell>Pricing Model</TableCell>
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
                      <Stack>
                        <Typography variant="subtitle2">
                          {platform.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {platform.platform}
                        </Typography>
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
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditPricing(platform.pricing)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Bundles Section */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Platform Bundles
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/crm/real-estate-platforms')}
            >
              Manage Bundles
            </Button>
          </Stack>
          
          <Grid container spacing={2}>
            {bundles.map((bundle) => (
              <Grid item xs={12} md={6} lg={4} key={bundle.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="subtitle1">{bundle.name}</Typography>
                        {bundle.isPopular && (
                          <Chip label="Popular" color="secondary" size="small" />
                        )}
                      </Stack>
                      <Typography variant="h4" color="primary">
                        ${bundle.totalPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bundle.platforms.length} platforms included
                      </Typography>
                      <Chip 
                        label={bundle.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={bundle.isActive ? 'success' : 'default'}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Edit Pricing Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Pricing</DialogTitle>
        <DialogContent>
          {selectedPricing && (
            <PricingEditForm 
              pricing={selectedPricing}
              onSave={handleSavePricing}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// Pricing Edit Form Component
function PricingEditForm({ 
  pricing, 
  onSave, 
  onCancel 
}: { 
  pricing: PlatformPricing;
  onSave: (data: Partial<PlatformPricing>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = React.useState({
    basePrice: pricing.basePrice,
    priceType: pricing.priceType,
    bundleEligible: pricing.bundleEligible,
    isActive: pricing.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Base Price"
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Price Type</InputLabel>
            <Select
              value={formData.priceType}
              label="Price Type"
              onChange={(e) => setFormData(prev => ({ ...prev, priceType: e.target.value as any }))}
            >
              <MenuItem value="per_listing">Per Listing</MenuItem>
              <MenuItem value="monthly_subscription">Monthly Subscription</MenuItem>
              <MenuItem value="flat_fee">Flat Fee</MenuItem>
              <MenuItem value="commission_based">Commission Based</MenuItem>
            </Select>
          </FormControl>
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
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
            }
            label="Active"
          />
        </Grid>
      </Grid>
      
      <DialogActions sx={{ px: 0, mt: 3 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
          Save Changes
        </Button>
      </DialogActions>
    </Box>
  );
}
