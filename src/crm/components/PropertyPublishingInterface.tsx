/**
 * One-Click Property Publishing Interface
 * Main interface for publishing properties to multiple real estate platforms
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Switch,
  Snackbar
} from '@mui/material';
import Publish from '@mui/icons-material/Publish';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import Warning from '@mui/icons-material/Warning';
import Info from '@mui/icons-material/Info';
import Edit from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Launch from '@mui/icons-material/Launch';
import Refresh from '@mui/icons-material/Refresh';
import Schedule from '@mui/icons-material/Schedule';
import MonetizationOn from '@mui/icons-material/MonetizationOn';
import Security from '@mui/icons-material/Security';
import Speed from '@mui/icons-material/Speed';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Close from '@mui/icons-material/Close';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';;

import { useCrmData, Property } from '../contexts/CrmDataContext';
import { useAuth } from '../contexts/AuthContext';
import { RealEstatePlatformService } from '../services/RealEstatePlatformService';
import { PropertyPublishingEngine } from '../services/PropertyPublishingEngine';
import { PlatformBundleService } from '../services/PlatformBundleService';
import PlatformAuthenticationFlow from './PlatformAuthenticationFlow';
import {
  RealEstatePlatform,
  PlatformConfiguration,
  PropertyListingData,
  PublishingJob,
  PublishingResult,
  ValidationResult,
  PlatformBundle
} from '../types/RealEstatePlatformTypes';

interface PropertyPublishingInterfaceProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onPublishComplete?: (job: PublishingJob) => void;
}

interface PlatformSelection {
  platform: RealEstatePlatform;
  config: PlatformConfiguration;
  selected: boolean;
  authenticated: boolean;
  validation?: ValidationResult;
  cost: number;
  bundle?: PlatformBundle;
}

export default function PropertyPublishingInterface({
  property,
  isOpen,
  onClose,
  onPublishComplete
}: PropertyPublishingInterfaceProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = React.useState(0);
  const [platforms, setPlatforms] = React.useState<PlatformSelection[]>([]);
  const [availableBundles, setAvailableBundles] = React.useState<PlatformBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = React.useState<PlatformBundle | null>(null);
  const [listingData, setListingData] = React.useState<PropertyListingData | null>(null);
  const [publishingJob, setPublishingJob] = React.useState<PublishingJob | null>(null);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [selectedPlatformForAuth, setSelectedPlatformForAuth] = React.useState<PlatformSelection | null>(null);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  React.useEffect(() => {
    if (isOpen) {
      initializePublishingFlow();
    }
  }, [isOpen, property]);

  const initializePublishingFlow = async () => {
    try {
      // Initialize services
      await RealEstatePlatformService.initialize();
      await PlatformBundleService.initialize();

      // Get available platforms
      const availablePlatforms = RealEstatePlatformService.getAvailablePlatforms();
      const bundles = PlatformBundleService.getAvailableBundles();

      // Setup platform selections
      const platformSelections: PlatformSelection[] = availablePlatforms.map(config => ({
        platform: config.platform,
        config,
        selected: false,
        authenticated: RealEstatePlatformService.isPlatformAuthenticated(config.platform),
        cost: config.pricing.basePrice
      }));

      setPlatforms(platformSelections);
      setAvailableBundles(bundles);

      // Convert property to listing data
      const listing = PropertyPublishingEngine.convertPropertyToListingData(property, {
        name: user?.name || 'Property Manager',
        phone: user?.profile?.phone || '(555) 000-0000',
        email: user?.email || 'contact@property.com'
      });

      setListingData(listing);

      // Validate for all platforms
      validateAllPlatforms(listing, platformSelections);

    } catch (error) {
      console.error('Failed to initialize publishing flow:', error);
      showSnackbar('Failed to initialize publishing flow', 'error');
    }
  };

  const validateAllPlatforms = (listing: PropertyListingData, platformList: PlatformSelection[]) => {
    const platformNames = platformList.map(p => p.platform);
    const validations = PropertyPublishingEngine.validateListingForPlatforms(platformNames, listing);

    const updatedPlatforms = platformList.map(platform => ({
      ...platform,
      validation: validations[platform.platform]
    }));

    setPlatforms(updatedPlatforms);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePlatformToggle = (platform: RealEstatePlatform) => {
    setPlatforms(prev => prev.map(p => 
      p.platform === platform ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleBundleSelect = (bundle: PlatformBundle | null) => {
    setSelectedBundle(bundle);
    
    if (bundle) {
      // Auto-select bundle platforms
      setPlatforms(prev => prev.map(p => ({
        ...p,
        selected: bundle.platforms.includes(p.platform),
        bundle: bundle.platforms.includes(p.platform) ? bundle : undefined
      })));
    } else {
      // Clear bundle selections
      setPlatforms(prev => prev.map(p => ({
        ...p,
        bundle: undefined
      })));
    }
  };

  const handleAuthenticationNeeded = (platform: PlatformSelection) => {
    setSelectedPlatformForAuth(platform);
    setAuthDialogOpen(true);
  };

  const handleAuthenticationSuccess = (platform: RealEstatePlatform) => {
    setPlatforms(prev => prev.map(p => 
      p.platform === platform ? { ...p, authenticated: true } : p
    ));
    setAuthDialogOpen(false);
    setSelectedPlatformForAuth(null);
    showSnackbar(`Successfully authenticated with ${platform}`, 'success');
  };

  const handlePublish = async () => {
    if (!listingData || !user) return;

    const selectedPlatforms = platforms
      .filter(p => p.selected && p.authenticated)
      .map(p => p.platform);

    if (selectedPlatforms.length === 0) {
      showSnackbar('Please select at least one authenticated platform', 'error');
      return;
    }

    setIsPublishing(true);
    setActiveStep(2); // Move to publishing step

    try {
      const job = await RealEstatePlatformService.publishProperty(
        listingData,
        selectedPlatforms,
        user.id
      );

      setPublishingJob(job);
      
      // Monitor publishing progress
      monitorPublishingProgress(job.id);

    } catch (error) {
      console.error('Publishing failed:', error);
      showSnackbar('Failed to start publishing process', 'error');
      setIsPublishing(false);
    }
  };

  const monitorPublishingProgress = (jobId: string) => {
    const interval = setInterval(() => {
      const job = RealEstatePlatformService.getPublishingJob(jobId);
      if (job) {
        setPublishingJob(job);
        
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setIsPublishing(false);
          setActiveStep(3); // Move to results step
          
          if (onPublishComplete) {
            onPublishComplete(job);
          }
          
          const successCount = job.successfulPlatforms;
          const totalCount = job.totalPlatforms;
          
          if (successCount === totalCount) {
            showSnackbar(`Successfully published to all ${totalCount} platforms!`, 'success');
          } else if (successCount > 0) {
            showSnackbar(`Published to ${successCount} of ${totalCount} platforms`, 'success');
          } else {
            showSnackbar('Publishing failed for all platforms', 'error');
          }
        }
      }
    }, 2000);
  };

  const calculateTotalCost = () => {
    if (selectedBundle) {
      return selectedBundle.totalPrice;
    }
    
    return platforms
      .filter(p => p.selected)
      .reduce((total, p) => total + p.cost, 0);
  };

  const getSelectedPlatformCount = () => {
    return platforms.filter(p => p.selected).length;
  };

  const getAuthenticatedSelectedCount = () => {
    return platforms.filter(p => p.selected && p.authenticated).length;
  };

  const getPlatformIcon = (platform: RealEstatePlatform) => {
    // In a real app, you'd have platform-specific icons
    return <Launch />;
  };

  const getValidationIcon = (validation?: ValidationResult) => {
    if (!validation) return <Info color="disabled" />;
    if (validation.isValid) return <CheckCircle color="success" />;
    if (validation.errors.length > 0) return <Error color="error" />;
    return <Warning color="warning" />;
  };

  const PlatformSelectionStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Publishing Platforms
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose which platforms to publish your property listing to. Make sure you're authenticated with each platform.
      </Typography>

      {/* Bundle Selection */}
      {availableBundles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Bundle Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedBundle === null ? 2 : 1,
                    borderColor: selectedBundle === null ? 'primary.main' : 'divider'
                  }}
                  onClick={() => handleBundleSelect(null)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">Individual</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pay per platform
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {availableBundles.map((bundle) => (
                <Grid item xs={12} sm={6} md={4} key={bundle.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedBundle?.id === bundle.id ? 2 : 1,
                      borderColor: selectedBundle?.id === bundle.id ? 'primary.main' : 'divider',
                      position: 'relative'
                    }}
                    onClick={() => handleBundleSelect(bundle)}
                  >
                    {bundle.isPopular && (
                      <Chip
                        label="Popular"
                        color="secondary"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6">{bundle.name}</Typography>
                      <Typography variant="h4" color="primary">
                        ${bundle.totalPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bundle.platforms.length} platforms
                      </Typography>
                      {bundle.discountPercentage > 0 && (
                        <Chip 
                          label={`${bundle.discountPercentage}% OFF`} 
                          color="success" 
                          size="small" 
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Platform List */}
      <Grid container spacing={2}>
        {platforms.map((platform) => (
          <Grid item xs={12} sm={6} md={4} key={platform.platform}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                opacity: platform.selected ? 1 : 0.7,
                border: platform.selected ? 2 : 1,
                borderColor: platform.selected ? 'primary.main' : 'divider'
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{platform.config.displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {platform.config.description}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platform.selected}
                          onChange={() => handlePlatformToggle(platform.platform)}
                        />
                      }
                      label=""
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {getValidationIcon(platform.validation)}
                    <Typography variant="body2">
                      {platform.validation?.isValid ? 'Ready to publish' : 
                       platform.validation?.errors.length ? 'Has errors' : 'Validation pending'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label={platform.authenticated ? 'Connected' : 'Not Connected'}
                      color={platform.authenticated ? 'success' : 'warning'}
                      size="small"
                    />
                    <Chip 
                      label={`$${platform.cost}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Stack>

                  {!platform.authenticated && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={() => handleAuthenticationNeeded(platform)}
                    >
                      Connect
                    </Button>
                  )}

                  {platform.validation && !platform.validation.isValid && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2">
                          {platform.validation.errors.length} errors, {platform.validation.warnings.length} warnings
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1}>
                          {platform.validation.errors.map((error, index) => (
                            <Alert key={index} severity="error" sx={{ py: 0 }}>
                              <Typography variant="body2">{error.message}</Typography>
                            </Alert>
                          ))}
                          {platform.validation.warnings.map((warning, index) => (
                            <Alert key={index} severity="warning" sx={{ py: 0 }}>
                              <Typography variant="body2">{warning.message}</Typography>
                            </Alert>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {getSelectedPlatformCount()} platforms selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getAuthenticatedSelectedCount()} authenticated
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" color="primary">
                ${calculateTotalCost().toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total cost
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  const ReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Publish
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your selections and click publish to start posting your property.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Property Details</Typography>
              <Stack spacing={1}>
                <Typography><strong>Name:</strong> {property.name}</Typography>
                <Typography><strong>Address:</strong> {property.address}</Typography>
                <Typography><strong>Type:</strong> {property.type}</Typography>
                <Typography><strong>Rent:</strong> ${property.monthlyRent}/month</Typography>
                <Typography><strong>Bedrooms:</strong> {property.bedrooms || 'N/A'}</Typography>
                <Typography><strong>Bathrooms:</strong> {property.bathrooms || 'N/A'}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Selected Platforms</Typography>
              <List>
                {platforms.filter(p => p.selected).map((platform) => (
                  <ListItem key={platform.platform} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getPlatformIcon(platform.platform)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={platform.config.displayName}
                      secondary={`$${platform.cost} - ${platform.authenticated ? 'Ready' : 'Not authenticated'}`}
                    />
                    <ListItemSecondaryAction>
                      {getValidationIcon(platform.validation)}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6">Total Cost:</Typography>
                <Typography variant="h6" color="primary">
                  ${calculateTotalCost().toFixed(2)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        Your property will be published to the selected platforms. This process may take a few minutes.
      </Alert>
    </Box>
  );

  const PublishingStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Publishing in Progress
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your property is being published to the selected platforms. Please wait...
      </Typography>

      {publishingJob && (
        <Stack spacing={3}>
          <LinearProgress 
            variant="determinate" 
            value={(publishingJob.results.length / publishingJob.totalPlatforms) * 100} 
          />
          
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {publishingJob.results.length} of {publishingJob.totalPlatforms} platforms completed
          </Typography>

          <List>
            {publishingJob.results.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {result.status === 'published' ? 
                    <CheckCircle color="success" /> : 
                    <Error color="error" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={result.platform}
                  secondary={result.message || result.error}
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      )}
    </Box>
  );

  const ResultsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Publishing Complete
      </Typography>
      
      {publishingJob && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h4" color="success.main">
                      {publishingJob.successfulPlatforms}
                    </Typography>
                    <Typography variant="body2">Successful</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h4" color="error.main">
                      {publishingJob.failedPlatforms}
                    </Typography>
                    <Typography variant="body2">Failed</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h4" color="primary.main">
                      {publishingJob.totalPlatforms}
                    </Typography>
                    <Typography variant="body2">Total</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <List>
            {publishingJob.results.map((result, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {result.status === 'published' ? 
                    <CheckCircle color="success" /> : 
                    <Error color="error" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>{result.platform}</Typography>
                      {result.status === 'published' && (
                        <Chip label="Published" color="success" size="small" />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        {result.message || result.error}
                      </Typography>
                      {result.listingUrl && (
                        <Button
                          size="small"
                          startIcon={<Launch />}
                          onClick={() => window.open(result.listingUrl, '_blank')}
                        >
                          View Listing
                        </Button>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Stack>
      )}
    </Box>
  );

  const steps = [
    { label: 'Select Platforms', content: <PlatformSelectionStep /> },
    { label: 'Review & Publish', content: <ReviewStep /> },
    { label: 'Publishing', content: <PublishingStep /> },
    { label: 'Results', content: <ResultsStep /> }
  ];

  const handleNext = () => {
    if (activeStep === 0) {
      const selectedCount = getSelectedPlatformCount();
      const authenticatedCount = getAuthenticatedSelectedCount();
      
      if (selectedCount === 0) {
        showSnackbar('Please select at least one platform', 'error');
        return;
      }
      
      if (authenticatedCount < selectedCount) {
        showSnackbar('Please authenticate with all selected platforms', 'error');
        return;
      }
    }
    
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const canProceed = () => {
    if (activeStep === 0) {
      return getSelectedPlatformCount() > 0 && getAuthenticatedSelectedCount() === getSelectedPlatformCount();
    }
    return true;
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5">
                Publish Property: {property.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Publish to multiple real estate platforms with one click
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {steps[activeStep]?.content}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isPublishing}>
            {activeStep === 3 ? 'Close' : 'Cancel'}
          </Button>
          {activeStep > 0 && activeStep < 3 && (
            <Button onClick={handleBack} disabled={isPublishing}>
              Back
            </Button>
          )}
          {activeStep === 0 && (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
          {activeStep === 1 && (
            <Button 
              variant="contained" 
              onClick={handlePublish}
              disabled={isPublishing || !canProceed()}
              startIcon={<Publish />}
            >
              Publish Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Authentication Dialog */}
      {selectedPlatformForAuth && (
        <PlatformAuthenticationFlow
          platform={selectedPlatformForAuth.platform}
          config={selectedPlatformForAuth.config}
          isOpen={authDialogOpen}
          onClose={() => {
            setAuthDialogOpen(false);
            setSelectedPlatformForAuth(null);
          }}
          onSuccess={handleAuthenticationSuccess}
          userId={user?.id || ''}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </>
  );
}
