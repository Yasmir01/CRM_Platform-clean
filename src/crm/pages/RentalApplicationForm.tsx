import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControlLabel,
  Checkbox,
  Paper,
  LinearProgress,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCrmData } from '../contexts/CrmDataContext';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ApplicationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  
  // Current Address
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  currentLandlord: string;
  currentLandlordPhone: string;
  currentRent: string;
  moveInDate: string;
  reasonForMoving: string;
  
  // Employment Information
  employerName: string;
  employerAddress: string;
  employerPhone: string;
  jobTitle: string;
  employmentLength: string;
  monthlyIncome: string;
  additionalIncome: string;
  additionalIncomeSource: string;
  
  // Financial Information
  bankName: string;
  accountType: string;
  creditScore: string;
  bankruptcyHistory: string;
  evictionHistory: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Additional Information
  pets: boolean;
  petDescription: string;
  smokingPreference: string;
  vehicleInfo: string;
  additionalNotes: string;
  
  // Agreements
  backgroundCheckConsent: boolean;
  creditCheckConsent: boolean;
  termsAndConditions: boolean;
}

export default function RentalApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useCrmData();
  const { properties } = state;
  
  // Extract property ID and code from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const propertyId = urlParams.get('property');
  const propertyCode = urlParams.get('code');
  
  // Find the property details
  const property = properties.find(p => p.id === propertyId);
  
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    socialSecurityNumber: '',
    currentAddress: '',
    currentCity: '',
    currentState: '',
    currentZip: '',
    currentLandlord: '',
    currentLandlordPhone: '',
    currentRent: '',
    moveInDate: '',
    reasonForMoving: '',
    employerName: '',
    employerAddress: '',
    employerPhone: '',
    jobTitle: '',
    employmentLength: '',
    monthlyIncome: '',
    additionalIncome: '',
    additionalIncomeSource: '',
    bankName: '',
    accountType: 'Checking',
    creditScore: '',
    bankruptcyHistory: 'No',
    evictionHistory: 'No',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    pets: false,
    petDescription: '',
    smokingPreference: 'Non-smoking',
    vehicleInfo: '',
    additionalNotes: '',
    backgroundCheckConsent: false,
    creditCheckConsent: false,
    termsAndConditions: false,
  });
  
  const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const steps = [
    { title: 'Personal Information', icon: <PersonIcon /> },
    { title: 'Current Housing', icon: <HomeIcon /> },
    { title: 'Employment & Income', icon: <WorkIcon /> },
    { title: 'Financial & Background', icon: <PaymentIcon /> },
    { title: 'Review & Submit', icon: <CheckCircleIcon /> },
  ];
  
  const handleInputChange = (field: keyof ApplicationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCheckboxChange = (field: keyof ApplicationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate application submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create application record
      const applicationData = {
        ...formData,
        propertyId: propertyId || '',
        propertyCode: propertyCode || '',
        propertyName: property?.name || '',
        propertyAddress: property?.address || '',
        applicationFee: 75, // Default application fee
        paymentStatus: 'Pending' as const,
        paymentMethod: 'Credit Card',
        status: 'New' as const,
        submittedDate: new Date().toISOString(),
        applicantName: `${formData.firstName} ${formData.lastName}`,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        moveInDate: formData.moveInDate,
        creditScore: parseInt(formData.creditScore) || undefined,
        backgroundCheck: 'Pending' as const,
        employmentVerification: 'Pending' as const,
      };
      
      // In a real app, this would be sent to your backend
      console.log('Application submitted:', applicationData);
      
      setSubmitDialogOpen(true);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderPersonalInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Personal Information</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          required
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Last Name"
          required
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange('email')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone Number"
          required
          value={formData.phone}
          onChange={handleInputChange('phone')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={handleInputChange('dateOfBirth')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Social Security Number"
          required
          value={formData.socialSecurityNumber}
          onChange={handleInputChange('socialSecurityNumber')}
          placeholder="XXX-XX-XXXX"
        />
      </Grid>
    </Grid>
  );
  
  const renderCurrentHousing = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Current Housing Information</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Current Address"
          required
          value={formData.currentAddress}
          onChange={handleInputChange('currentAddress')}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="City"
          required
          value={formData.currentCity}
          onChange={handleInputChange('currentCity')}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="State"
          required
          value={formData.currentState}
          onChange={handleInputChange('currentState')}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="ZIP Code"
          required
          value={formData.currentZip}
          onChange={handleInputChange('currentZip')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Current Landlord Name"
          value={formData.currentLandlord}
          onChange={handleInputChange('currentLandlord')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Current Landlord Phone"
          value={formData.currentLandlordPhone}
          onChange={handleInputChange('currentLandlordPhone')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Current Monthly Rent"
          type="number"
          value={formData.currentRent}
          onChange={handleInputChange('currentRent')}
          InputProps={{ startAdornment: '$' }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Desired Move-In Date"
          type="date"
          required
          value={formData.moveInDate}
          onChange={handleInputChange('moveInDate')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Reason for Moving"
          multiline
          rows={3}
          value={formData.reasonForMoving}
          onChange={handleInputChange('reasonForMoving')}
        />
      </Grid>
    </Grid>
  );
  
  const renderEmploymentIncome = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Employment & Income Information</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Employer Name"
          required
          value={formData.employerName}
          onChange={handleInputChange('employerName')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Job Title"
          required
          value={formData.jobTitle}
          onChange={handleInputChange('jobTitle')}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Employer Address"
          value={formData.employerAddress}
          onChange={handleInputChange('employerAddress')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Employer Phone"
          value={formData.employerPhone}
          onChange={handleInputChange('employerPhone')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Length of Employment"
          value={formData.employmentLength}
          onChange={handleInputChange('employmentLength')}
          placeholder="e.g., 2 years, 6 months"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Monthly Income"
          type="number"
          required
          value={formData.monthlyIncome}
          onChange={handleInputChange('monthlyIncome')}
          InputProps={{ startAdornment: '$' }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Additional Monthly Income"
          type="number"
          value={formData.additionalIncome}
          onChange={handleInputChange('additionalIncome')}
          InputProps={{ startAdornment: '$' }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Income Source"
          value={formData.additionalIncomeSource}
          onChange={handleInputChange('additionalIncomeSource')}
          placeholder="e.g., Side business, investments, alimony"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Emergency Contact</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Name"
          required
          value={formData.emergencyContactName}
          onChange={handleInputChange('emergencyContactName')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Emergency Contact Phone"
          required
          value={formData.emergencyContactPhone}
          onChange={handleInputChange('emergencyContactPhone')}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Relationship to Emergency Contact"
          required
          value={formData.emergencyContactRelationship}
          onChange={handleInputChange('emergencyContactRelationship')}
          placeholder="e.g., Parent, Sibling, Friend"
        />
      </Grid>
    </Grid>
  );
  
  const renderFinancialBackground = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Financial & Background Information</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Bank Name"
          value={formData.bankName}
          onChange={handleInputChange('bankName')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Account Type</InputLabel>
          <Select
            value={formData.accountType}
            label="Account Type"
            onChange={handleInputChange('accountType')}
          >
            <MenuItem value="Checking">Checking</MenuItem>
            <MenuItem value="Savings">Savings</MenuItem>
            <MenuItem value="Both">Both</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Credit Score (if known)"
          type="number"
          value={formData.creditScore}
          onChange={handleInputChange('creditScore')}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Bankruptcy History</InputLabel>
          <Select
            value={formData.bankruptcyHistory}
            label="Bankruptcy History"
            onChange={handleInputChange('bankruptcyHistory')}
          >
            <MenuItem value="No">No</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Eviction History</InputLabel>
          <Select
            value={formData.evictionHistory}
            label="Eviction History"
            onChange={handleInputChange('evictionHistory')}
          >
            <MenuItem value="No">No</MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Smoking Preference</InputLabel>
          <Select
            value={formData.smokingPreference}
            label="Smoking Preference"
            onChange={handleInputChange('smokingPreference')}
          >
            <MenuItem value="Non-smoking">Non-smoking</MenuItem>
            <MenuItem value="Smoking">Smoking</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.pets}
              onChange={handleCheckboxChange('pets')}
            />
          }
          label="Do you have pets?"
        />
      </Grid>
      {formData.pets && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Pet Description"
            multiline
            rows={2}
            value={formData.petDescription}
            onChange={handleInputChange('petDescription')}
            placeholder="Please describe your pets (type, breed, size, etc.)"
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Vehicle Information"
          value={formData.vehicleInfo}
          onChange={handleInputChange('vehicleInfo')}
          placeholder="Year, Make, Model, License Plate (if applicable)"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes"
          multiline
          rows={3}
          value={formData.additionalNotes}
          onChange={handleInputChange('additionalNotes')}
          placeholder="Any additional information you'd like to provide"
        />
      </Grid>
    </Grid>
  );
  
  const renderReviewSubmit = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Review & Submit Application</Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Please review all information carefully before submitting your application.
        </Alert>
      </Grid>
      
      {/* Property Information */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Property Information</Typography>
          <Typography><strong>Property:</strong> {property?.name || 'Unknown Property'}</Typography>
          <Typography><strong>Address:</strong> {property?.address || 'Unknown Address'}</Typography>
          <Typography><strong>Property Code:</strong> {propertyCode}</Typography>
          <Typography><strong>Monthly Rent:</strong> ${property?.monthlyRent?.toLocaleString() || 'N/A'}</Typography>
        </Paper>
      </Grid>
      
      {/* Application Summary */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Application Summary</Typography>
          <Typography><strong>Applicant:</strong> {formData.firstName} {formData.lastName}</Typography>
          <Typography><strong>Email:</strong> {formData.email}</Typography>
          <Typography><strong>Phone:</strong> {formData.phone}</Typography>
          <Typography><strong>Monthly Income:</strong> ${formData.monthlyIncome}</Typography>
          <Typography><strong>Move-In Date:</strong> {formData.moveInDate}</Typography>
        </Paper>
      </Grid>
      
      {/* Consent and Agreements */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Consent & Agreements</Typography>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.backgroundCheckConsent}
                onChange={handleCheckboxChange('backgroundCheckConsent')}
                required
              />
            }
            label="I consent to a background check being performed"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.creditCheckConsent}
                onChange={handleCheckboxChange('creditCheckConsent')}
                required
              />
            }
            label="I consent to a credit check being performed"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.termsAndConditions}
                onChange={handleCheckboxChange('termsAndConditions')}
                required
              />
            }
            label="I agree to the terms and conditions of this rental application"
          />
        </Stack>
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Application Fee:</strong> A non-refundable application fee of $75 will be charged upon submission.
            This fee covers background check, credit check, and application processing costs.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );
  
  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInformation();
      case 1:
        return renderCurrentHousing();
      case 2:
        return renderEmploymentIncome();
      case 3:
        return renderFinancialBackground();
      case 4:
        return renderReviewSubmit();
      default:
        return null;
    }
  };
  
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.dateOfBirth && formData.socialSecurityNumber;
      case 1:
        return formData.currentAddress && formData.currentCity && formData.currentState && formData.currentZip && formData.moveInDate;
      case 2:
        return formData.employerName && formData.jobTitle && formData.monthlyIncome && formData.emergencyContactName && formData.emergencyContactPhone && formData.emergencyContactRelationship;
      case 3:
        return true; // All fields are optional in this step
      case 4:
        return formData.backgroundCheckConsent && formData.creditCheckConsent && formData.termsAndConditions;
      default:
        return false;
    }
  };
  
  if (!property && propertyId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Property Not Found</Typography>
          <Typography>The property you're trying to apply for could not be found.</Typography>
        </Alert>
        <Button onClick={() => navigate('/crm/properties')} sx={{ mt: 2 }}>
          Return to Properties
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h4" gutterBottom>
          Rental Application
        </Typography>
        {property && (
          <Stack spacing={1}>
            <Typography variant="h6">{property.name}</Typography>
            <Typography variant="body1">{property.address}</Typography>
            <Chip
              label={`Property Code: ${propertyCode}`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit', width: 'fit-content' }}
            />
          </Stack>
        )}
      </Paper>
      
      {/* Progress Indicator */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(currentStep + 1) / steps.length * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      
      {/* Form Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {getStepContent()}
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Button
          onClick={handleBack}
          disabled={currentStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        
        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => navigate('/crm/properties')}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              variant="contained"
              startIcon={isSubmitting ? <LinearProgress size={20} /> : <CheckCircleIcon />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              variant="contained"
            >
              Next
            </Button>
          )}
        </Stack>
      </Stack>
      
      {/* Success Dialog */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h5">Application Submitted Successfully!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography>
              Thank you for submitting your rental application for <strong>{property?.name}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your application has been received and will be reviewed by our team. You will receive an email confirmation shortly.
            </Typography>
            <Alert severity="info">
              <Typography variant="body2">
                Application processing typically takes 1-3 business days. We'll contact you if we need any additional information.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => navigate('/crm/applications')}
            variant="contained"
            size="large"
          >
            View Application Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
