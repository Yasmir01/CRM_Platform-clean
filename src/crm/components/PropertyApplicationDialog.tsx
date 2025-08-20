import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Snackbar,
} from "@mui/material";
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Send as SendIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { LocalStorageService } from "../services/LocalStorageService";
import { PropertyCodeGenerator } from "../utils/propertyCodeGenerator";
import { useNotifications } from "./GlobalNotificationProvider";
import ApplicationFormRenderer from "./ApplicationFormRenderer";

interface Property {
  id: string;
  name: string;
  address: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyCode?: string;
  description?: string;
  amenities?: string[];
  petPolicy?: string;
  status: string;
}

interface PropertyApplicationDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted?: (applicationData: any) => void;
}

interface Template {
  id: string;
  name: string;
  type: string;
  isDefault?: boolean;
  formFields?: any[];
  applicationFee?: number;
  paymentMethods?: any[];
  termsAndConditions?: any[];
  requirePaymentBeforeSubmission?: boolean;
  content: string;
}

export default function PropertyApplicationDialog({
  property,
  isOpen,
  onClose,
  onApplicationSubmitted
}: PropertyApplicationDialogProps) {
  const [defaultTemplate, setDefaultTemplate] = React.useState<Template | null>(null);
  const [showApplicationForm, setShowApplicationForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [propertyCode, setPropertyCode] = React.useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [applicationData, setApplicationData] = React.useState<any>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const notifications = useNotifications();

  React.useEffect(() => {
    if (isOpen && property) {
      loadDefaultTemplate();
      generateOrGetPropertyCode();
    }
  }, [isOpen, property]);

  const loadDefaultTemplate = () => {
    setLoading(true);
    try {
      const templates = LocalStorageService.getTemplates();
      const defaultRentalTemplate = templates.find(
        t => t.type === "Rental Application" && t.isDefault
      );
      
      if (defaultRentalTemplate) {
        setDefaultTemplate(defaultRentalTemplate);
      } else {
        // Fall back to the first rental application template
        const firstRentalTemplate = templates.find(t => t.type === "Rental Application");
        setDefaultTemplate(firstRentalTemplate || null);
      }
    } catch (error) {
      console.error("Error loading default template:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrGetPropertyCode = () => {
    if (!property) return;

    // Check if property already has a code
    if (property.propertyCode && PropertyCodeGenerator.isValidCode(property.propertyCode)) {
      setPropertyCode(property.propertyCode);
      PropertyCodeGenerator.registerExistingCode(property.propertyCode);
    } else {
      // Generate new code
      try {
        const newCode = PropertyCodeGenerator.generateCode();
        setPropertyCode(newCode);
        
        // Update property with new code (in localStorage for demo)
        updatePropertyWithCode(newCode);
      } catch (error) {
        console.error("Error generating property code:", error);
        setPropertyCode(`GEN${Math.floor(Math.random() * 1000)}`); // Fallback
      }
    }
  };

  const updatePropertyWithCode = (code: string) => {
    try {
      const properties = LocalStorageService.getProperties();
      const updatedProperties = properties.map(p => 
        p.id === property?.id ? { ...p, propertyCode: code } : p
      );
      LocalStorageService.saveProperties(updatedProperties);
    } catch (error) {
      console.error("Error updating property with code:", error);
    }
  };

  const handleStartApplication = () => {
    if (!defaultTemplate) {
      alert("No default template found. Please create a rental application template first.");
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSubmit = (appData: any) => {
    // Enhanced application data with property code
    const enhancedAppData = {
      ...appData,
      propertyCode,
      propertyId: property?.id,
      propertyName: property?.name,
      propertyAddress: property?.address,
      monthlyRent: property?.monthlyRent,
      submittedAt: new Date().toISOString(),
    };

    setApplicationData(enhancedAppData);
    setShowApplicationForm(false);

    // Show success notification
    notifications.showApplicationSuccess(
      enhancedAppData.applicantName || 'Applicant',
      property?.name || 'Property',
      enhancedAppData.propertyCode || propertyCode
    );

    // Callback to parent component
    onApplicationSubmitted?.(enhancedAppData);

    // Close dialog after short delay
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    if (hasUnsavedChanges && showApplicationForm) {
      setShowCloseConfirmation(true);
    } else {
      setShowApplicationForm(false);
      setShowSuccessMessage(false);
      setApplicationData(null);
      setHasUnsavedChanges(false);
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    setShowApplicationForm(false);
    setShowSuccessMessage(false);
    setApplicationData(null);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
  };

  if (!property) return null;

  return (
    <>
      {/* Main Application Dialog */}
      <Dialog 
        open={isOpen && !showApplicationForm} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: "600px" }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2}>
              <HomeIcon color="primary" />
              <Box>
                <Typography variant="h5">Apply for Rental</Typography>
                <Typography variant="body2" color="text.secondary">
                  Submit your application for this property
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Property Information Card */}
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <HomeIcon color="primary" />
                    <Typography variant="h6">Property Information</Typography>
                  </Stack>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="h6">{property.name}</Typography>
                      </Stack>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {property.address}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                      <Typography variant="h6" color="primary">
                        ${property.monthlyRent?.toLocaleString()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Bedrooms</Typography>
                      <Typography variant="h6">{property.bedrooms}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                      <Typography variant="h6">{property.bathrooms}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Square Footage</Typography>
                      <Typography variant="h6">{property.squareFootage?.toLocaleString()} sq ft</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">Property Code</Typography>
                      <Typography variant="h6" fontFamily="monospace" color="primary">
                        {PropertyCodeGenerator.formatCodeForDisplay(propertyCode)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={property.status} 
                      color={property.status === "Available" ? "success" : "default"}
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Application Template Information */}
              {defaultTemplate && (
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6">Application Template</Typography>
                    </Stack>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" fontWeight="medium">
                          {defaultTemplate.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {defaultTemplate.formFields?.length || 0} form sections
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {defaultTemplate.isDefault && (
                            <Chip label="Default" color="success" size="small" />
                          )}
                          {defaultTemplate.applicationFee && (
                            <Chip 
                              label={`$${defaultTemplate.applicationFee} fee`} 
                              color="info" 
                              size="small"
                              icon={<PaymentIcon />}
                            />
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Application Process Info */}
              <Alert severity="info" icon={<InfoIcon />}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Application Process
                </Typography>
                <Typography variant="body2">
                  • Complete all required sections of the application form<br/>
                  • Upload required documents (ID, proof of income, references)<br/>
                  • Review and accept terms and conditions<br/>
                  • Pay application fee securely online<br/>
                  • Receive instant confirmation upon submission
                </Typography>
              </Alert>

              {!defaultTemplate && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    No default rental application template found. Please contact the administrator to set up application templates.
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} size="large">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleStartApplication}
            disabled={!defaultTemplate || loading}
            size="large"
            startIcon={<SendIcon />}
          >
            Start Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Form Dialog */}
      {defaultTemplate && (
        <ApplicationFormRenderer
          template={defaultTemplate}
          propertyId={property.id}
          propertyAddress={property.address}
          isOpen={showApplicationForm}
          onSubmit={handleApplicationSubmit}
          onCancel={() => setShowApplicationForm(false)}
        />
      )}

      {/* Success Message Snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setShowSuccessMessage(false)} 
          severity="success" 
          variant="filled"
          icon={<CheckCircleIcon />}
          sx={{ width: "100%" }}
        >
          <Typography variant="body2" fontWeight="medium">
            Application Submitted Successfully!
          </Typography>
          <Typography variant="body2">
            Your application for {property.name} has been received. 
            Reference: {PropertyCodeGenerator.formatCodeForDisplay(propertyCode)}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}
