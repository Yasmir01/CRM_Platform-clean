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
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  InputAdornment,
  Alert,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  LinearProgress,
  Autocomplete,
} from "@mui/material";
import {
  Send as SendIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import ApplicationPaymentForm from "./ApplicationPaymentForm";
import TermsAndConditions from "./TermsAndConditions";
import PhoneNumberField, { isValidPhoneNumber } from "./PhoneNumberField";
import StateSelectionField from "./StateSelectionField";
import { LocalStorageService } from "../services/LocalStorageService";
import TransUnionService, { CreditCheckRequest } from "../services/TransUnionService";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
  section?: string;
  description?: string;
  defaultValue?: string;
  fileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  instructions?: string;
}

interface Template {
  id: string;
  name: string;
  formFields?: FormField[];
  applicationFee?: number;
  paymentMethods?: PaymentMethod[];
  termsAndConditions?: any[];
  requirePaymentBeforeSubmission?: boolean;
  content: string;
}

interface ApplicationFormRendererProps {
  template: Template;
  propertyId?: string;
  propertyAddress?: string;
  onSubmit: (applicationData: any) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface FileUpload {
  fieldId: string;
  files: File[];
}

export default function ApplicationFormRenderer({
  template,
  propertyId,
  propertyAddress,
  onSubmit,
  onCancel,
  isOpen
}: ApplicationFormRendererProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [fileUploads, setFileUploads] = React.useState<FileUpload[]>([]);
  const [termsAccepted, setTermsAccepted] = React.useState<string[]>([]);
  const [paymentCompleted, setPaymentCompleted] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState<any>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [showTermsDialog, setShowTermsDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [creditCheckInProgress, setCreditCheckInProgress] = React.useState(false);
  const [creditCheckResults, setCreditCheckResults] = React.useState<any>(null);

  const formFields = template.formFields || [];
  const sections = [...new Set(formFields.map(field => field.section).filter(Boolean))];
  const unSectionedFields = formFields.filter(field => !field.section && field.type !== "section");
  
  // Group fields by section
  const fieldsBySections = sections.map(sectionName => ({
    name: sectionName,
    fields: formFields.filter(field => field.section === sectionName && field.type !== "section")
  }));

  const totalSteps = fieldsBySections.length + (unSectionedFields.length > 0 ? 1 : 0) + 
                   (template.termsAndConditions?.length ? 1 : 0) + 
                   (template.applicationFee ? 1 : 0) + 1; // +1 for review step

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error if field now has value
    if (value && validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (fieldId: string, files: File[]) => {
    setFileUploads(prev => {
      const existing = prev.find(upload => upload.fieldId === fieldId);
      if (existing) {
        return prev.map(upload => 
          upload.fieldId === fieldId 
            ? { ...upload, files }
            : upload
        );
      }
      return [...prev, { fieldId, files }];
    });
  };

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};
    let currentFields: FormField[] = [];

    if (currentStep < fieldsBySections.length) {
      currentFields = fieldsBySections[currentStep].fields;
    } else if (unSectionedFields.length > 0 && currentStep === fieldsBySections.length) {
      currentFields = unSectionedFields;
    }

    currentFields.forEach(field => {
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors[field.id] = `${field.label} is required`;
        }

        // Email validation
        if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
          errors[field.id] = "Please enter a valid email address";
        }

        // Phone validation
        if (field.type === "phone" && value && !isValidPhoneNumber(value)) {
          errors[field.id] = "Please enter a valid 10-digit phone number";
        }
      }

      // Validate grantor fields when grantor is needed
      if (field.id === 'grantor_needed' && formData[field.id] === 'yes') {
        const grantorFields = [
          { id: 'grantor_ssn', label: 'Grantor SSN', pattern: /^\d{3}-\d{2}-\d{4}$/ },
          { id: 'grantor_name', label: 'Grantor Name' },
          { id: 'grantor_email', label: 'Grantor Email', pattern: /\S+@\S+\.\S+/ },
          { id: 'grantor_phone', label: 'Grantor Phone', pattern: /^\(\d{3}\) \d{3}-\d{4}$/ },
          { id: 'grantor_address', label: 'Grantor Address' }
        ];

        grantorFields.forEach(grantorField => {
          const grantorValue = formData[grantorField.id];
          if (!grantorValue || grantorValue.trim() === '') {
            errors[grantorField.id] = `${grantorField.label} is required when grantor is needed`;
          } else if (grantorField.pattern && !grantorField.pattern.test(grantorValue)) {
            if (grantorField.id === 'grantor_ssn') {
              errors[grantorField.id] = 'Please enter a valid SSN (XXX-XX-XXXX)';
            } else if (grantorField.id === 'grantor_email') {
              errors[grantorField.id] = 'Please enter a valid email address';
            } else if (grantorField.id === 'grantor_phone') {
              errors[grantorField.id] = 'Please enter a valid phone number';
            }
          }
        });
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleTermsAccept = (acceptedTerms: string[]) => {
    setTermsAccepted(acceptedTerms);
    setShowTermsDialog(false);
    handleNextStep();
  };

  const handlePaymentSuccess = (payment: any) => {
    setPaymentData(payment);
    setPaymentCompleted(true);
    setShowPaymentDialog(false);
    handleNextStep();
  };

  const performCreditCheck = async () => {
    setCreditCheckInProgress(true);
    const transUnionService = TransUnionService.getInstance();

    if (!transUnionService.isServiceConnected()) {
      setCreditCheckInProgress(false);
      return null;
    }

    try {
      const creditCheckRequest: CreditCheckRequest = {
        firstName: formData["first_name"] || formData["applicant_name"]?.split(' ')[0] || '',
        lastName: formData["last_name"] || formData["applicant_name"]?.split(' ').slice(1).join(' ') || '',
        ssn: formData["ssn"] || '',
        dateOfBirth: formData["date_of_birth"] || formData["birth_date"] || '',
        address: {
          street: formData["address"] || formData["street_address"] || '',
          city: formData["city"] || '',
          state: formData["state"] || '',
          zipCode: formData["zip_code"] || formData["postal_code"] || ''
        },
        email: formData["email"] || formData["applicant_email"] || '',
        phone: formData["phone"] || formData["applicant_phone"] || '',
        grantorInfo: formData["grantor_needed"] === 'yes' ? {
          firstName: formData["grantor_name"]?.split(' ')[0] || '',
          lastName: formData["grantor_name"]?.split(' ').slice(1).join(' ') || '',
          ssn: formData["grantor_ssn"] || '',
          email: formData["grantor_email"] || '',
          phone: formData["grantor_phone"] || '',
          address: formData["grantor_address"] || ''
        } : undefined
      };

      const creditCheckResult = await transUnionService.performCreditCheck(creditCheckRequest);
      setCreditCheckResults(creditCheckResult);
      return creditCheckResult;
    } catch (error) {
      console.error('Credit check failed:', error);
      // Don't block submission if credit check fails
      return null;
    } finally {
      setCreditCheckInProgress(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Perform credit check if TransUnion is connected
      const creditResults = await performCreditCheck();

      const applicationData = {
        id: `APP-${Date.now()}`,
        templateId: template.id,
        templateName: template.name,
        propertyId,
        propertyAddress,
        formData,
        fileUploads,
        termsAccepted,
        paymentData,
        status: "New",
        submittedDate: new Date().toISOString(),
        applicantName: formData["applicant_name"] || formData["first_name"] + " " + formData["last_name"] || "Unknown Applicant",
        applicantEmail: formData["email"] || formData["applicant_email"] || "",
        applicantPhone: formData["phone"] || formData["applicant_phone"] || "",
        applicationFee: (template.applicationFee || 0) * (formData["grantor_needed"] === 'yes' ? 2 : 1),
        paymentStatus: paymentCompleted ? "Paid" : "Pending",
        paymentMethod: paymentData?.method || "Pending",
        creditCheckResults: creditResults,
        creditScore: creditResults?.applicant?.creditScore,
        grantorCreditScore: creditResults?.grantor?.creditScore,
        grantorNeeded: formData["grantor_needed"] === 'yes'
      };

      // Save to localStorage for demo purposes
      const existingApplications = LocalStorageService.getApplications();
      LocalStorageService.saveApplications([...existingApplications, applicationData]);

      onSubmit(applicationData);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || field.defaultValue || "";
    const error = validationErrors[field.id];

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            margin="normal"
          />
        );

      case "email":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            margin="normal"
          />
        );

      case "phone":
        return (
          <PhoneNumberField
            key={field.id}
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={value}
            onChange={(newValue) => handleFieldChange(field.id, newValue)}
            error={!!error}
            helperText={error || field.description}
            margin="normal"
          />
        );

      case "number":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            margin="normal"
          />
        );

      case "date":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            type="date"
            required={field.required}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        );

      case "textarea":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error || field.description}
            margin="normal"
          />
        );

      case "select":
        // Check if this is a state field
        if (field.label.toLowerCase().includes('state') || field.id.toLowerCase().includes('state')) {
          return (
            <StateSelectionField
              key={field.id}
              fullWidth
              label={field.label}
              required={field.required}
              value={value}
              onChange={(newValue) => handleFieldChange(field.id, newValue)}
              error={!!error}
              helperText={error || field.description}
              margin="normal"
            />
          );
        }

        return (
          <FormControl key={field.id} fullWidth margin="normal" error={!!error}>
            <InputLabel>{field.label} {field.required && "*"}</InputLabel>
            <Select
              value={value}
              label={field.label}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {(error || field.description) && (
              <Typography variant="caption" color={error ? "error" : "text.secondary"}>
                {error || field.description}
              </Typography>
            )}
          </FormControl>
        );

      case "checkbox":
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              />
            }
            label={field.label + (field.required ? " *" : "")}
            sx={{ my: 1 }}
          />
        );

      case "radio":
        return (
          <FormControl key={field.id} component="fieldset" margin="normal" error={!!error}>
            <FormLabel component="legend">{field.label} {field.required && "*"}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => {
                handleFieldChange(field.id, e.target.value);
                // Handle grantor selection for fee calculation
                if (field.id === 'grantor_needed' && field.label.toLowerCase().includes('grantor')) {
                  setFormData(prev => ({ ...prev, grantor_needed: e.target.value }));
                }
              }}
            >
              {field.options?.map((option, index) => {
                // Support multiple description lines for each option
                const optionDescriptions = field.description ? field.description.split('\n') : [];
                const optionDescription = optionDescriptions[index] || '';

                return (
                  <Box key={index} sx={{ mb: 1 }}>
                    <FormControlLabel
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                    {optionDescription && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          ml: 4,
                          mt: 0.5,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {optionDescription}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </RadioGroup>
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}

            {/* Conditional SSN field for grantor */}
            {field.id === 'grantor_needed' && value === 'yes' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Grantor Information Required
                </Typography>
                <TextField
                  fullWidth
                  label="Grantor Social Security Number"
                  placeholder="XXX-XX-XXXX"
                  required
                  value={formData['grantor_ssn'] || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 4) {
                      value = value.slice(0, 3) + '-' + value.slice(3);
                    }
                    if (value.length >= 7) {
                      value = value.slice(0, 6) + '-' + value.slice(6, 10);
                    }
                    handleFieldChange('grantor_ssn', value);
                  }}
                  error={!!validationErrors['grantor_ssn']}
                  helperText={validationErrors['grantor_ssn'] || "Required for credit check and background verification"}
                  margin="normal"
                  inputProps={{ maxLength: 11 }}
                />
                <TextField
                  fullWidth
                  label="Grantor Full Name"
                  required
                  value={formData['grantor_name'] || ''}
                  onChange={(e) => handleFieldChange('grantor_name', e.target.value)}
                  error={!!validationErrors['grantor_name']}
                  helperText={validationErrors['grantor_name']}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Grantor Email"
                  type="email"
                  required
                  value={formData['grantor_email'] || ''}
                  onChange={(e) => handleFieldChange('grantor_email', e.target.value)}
                  error={!!validationErrors['grantor_email']}
                  helperText={validationErrors['grantor_email']}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Grantor Phone Number"
                  required
                  value={formData['grantor_phone'] || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 4) {
                      value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
                    }
                    if (value.length >= 10) {
                      value = value.slice(0, 9) + '-' + value.slice(9, 13);
                    }
                    handleFieldChange('grantor_phone', value);
                  }}
                  error={!!validationErrors['grantor_phone']}
                  helperText={validationErrors['grantor_phone']}
                  margin="normal"
                  inputProps={{ maxLength: 14 }}
                />
                <TextField
                  fullWidth
                  label="Grantor Address"
                  required
                  value={formData['grantor_address'] || ''}
                  onChange={(e) => handleFieldChange('grantor_address', e.target.value)}
                  error={!!validationErrors['grantor_address']}
                  helperText={validationErrors['grantor_address']}
                  margin="normal"
                />
              </Box>
            )}
          </FormControl>
        );

      case "yesno":
        return (
          <FormControl key={field.id} component="fieldset" margin="normal" error={!!error}>
            <FormLabel component="legend">{field.label} {field.required && "*"}</FormLabel>
            <RadioGroup
              row
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            {(error || field.description) && (
              <Typography variant="caption" color={error ? "error" : "text.secondary"}>
                {error || field.description}
              </Typography>
            )}
          </FormControl>
        );

      case "file_upload":
        return (
          <FileUploadField
            key={field.id}
            field={field}
            onFilesChange={(files) => handleFileUpload(field.id, files)}
            error={error}
          />
        );

      case "signature":
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            placeholder="Type your full name as electronic signature"
            required={field.required}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            error={!!error}
            helperText={error || field.description || "By typing your name, you agree this serves as your electronic signature"}
            margin="normal"
            InputProps={{
              style: {
                fontFamily: 'cursive',
                fontSize: '1.2rem'
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  const FileUploadField = ({ field, onFilesChange, error }: { field: FormField, onFilesChange: (files: File[]) => void, error?: string }) => {
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
      accept: field.fileTypes ? field.fileTypes.reduce((acc, type) => {
        acc[`.${type}`] = [];
        return acc;
      }, {} as any) : undefined,
      maxFiles: field.maxFiles || 5,
      maxSize: (field.maxFileSize || 10) * 1024 * 1024, // Convert MB to bytes
      onDrop: onFilesChange
    });

    return (
      <Box key={field.id} sx={{ my: 2 }}>
        <Typography variant="body1" gutterBottom>
          {field.label} {field.required && "*"}
        </Typography>
        
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            border: "2px dashed",
            borderColor: error ? "error.main" : isDragActive ? "primary.main" : "grey.300",
            textAlign: "center",
            cursor: "pointer",
            bgcolor: isDragActive ? "action.hover" : "background.paper",
            "&:hover": { bgcolor: "action.hover" }
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography color="text.secondary">
            {isDragActive ? "Drop files here..." : "Drag & drop files here or click to browse"}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {field.fileTypes && `Accepted: ${field.fileTypes.join(", ")}`}
            {field.maxFiles && ` • Max ${field.maxFiles} files`}
            {field.maxFileSize && ` • Max ${field.maxFileSize}MB per file`}
          </Typography>
        </Paper>

        {acceptedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Uploaded Files:</Typography>
            {acceptedFiles.map((file, index) => (
              <Chip
                key={index}
                icon={<AttachFileIcon />}
                label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {(error || field.description) && (
          <Typography variant="caption" color={error ? "error" : "text.secondary"} sx={{ mt: 1, display: "block" }}>
            {error || field.description}
          </Typography>
        )}
      </Box>
    );
  };

  const getCurrentStepContent = () => {
    if (currentStep < fieldsBySections.length) {
      const section = fieldsBySections[currentStep];
      return (
        <Box>
          <Typography variant="h6" gutterBottom>{section.name}</Typography>
          <Stack spacing={2}>
            {section.fields.map(field => renderField(field))}
          </Stack>
        </Box>
      );
    }

    if (unSectionedFields.length > 0 && currentStep === fieldsBySections.length) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Additional Information</Typography>
          <Stack spacing={2}>
            {unSectionedFields.map(field => renderField(field))}
          </Stack>
        </Box>
      );
    }

    const termsStepIndex = fieldsBySections.length + (unSectionedFields.length > 0 ? 1 : 0);
    if (template.termsAndConditions?.length && currentStep === termsStepIndex) {
      return (
        <Box>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowTermsDialog(true)}
            startIcon={<SecurityIcon />}
            sx={{ mb: 2 }}
          >
            Review and Accept Terms & Conditions
          </Button>
          {termsAccepted.length > 0 && (
            <Alert severity="success">
              <Typography variant="body2">
                Terms and conditions have been accepted. You may proceed to the next step.
              </Typography>
            </Alert>
          )}
        </Box>
      );
    }

    const paymentStepIndex = termsStepIndex + (template.termsAndConditions?.length ? 1 : 0);
    if (template.applicationFee && currentStep === paymentStepIndex) {
      return (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              An application fee of <strong>${template.applicationFee}</strong> is required to process your rental application.
            </Typography>
          </Alert>
          
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowPaymentDialog(true)}
            startIcon={<PaymentIcon />}
            disabled={paymentCompleted}
            sx={{ mb: 2 }}
          >
            {paymentCompleted ? "Payment Completed" : `Pay Application Fee - $${template.applicationFee}`}
          </Button>
          
          {paymentCompleted && paymentData && (
            <Alert severity="success">
              <Typography variant="body2">
                Payment completed successfully. Confirmation: {paymentData.confirmationCode}
              </Typography>
            </Alert>
          )}
        </Box>
      );
    }

    // Review step
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Review Your Application</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Please review all information before submitting your application. Once submitted, changes cannot be made.
        </Alert>

        <Grid container spacing={3}>
          {fieldsBySections.map((section, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>{section.name}</Typography>
                  <Grid container spacing={2}>
                    {section.fields.map(field => {
                      const value = formData[field.id];
                      if (!value) return null;
                      
                      return (
                        <Grid item xs={12} sm={6} key={field.id}>
                          <Typography variant="body2" color="text.secondary">
                            {field.label}:
                          </Typography>
                          <Typography variant="body1">
                            {Array.isArray(value) ? value.join(", ") : value.toString()}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {unSectionedFields.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Additional Information</Typography>
                  <Grid container spacing={2}>
                    {unSectionedFields.map(field => {
                      const value = formData[field.id];
                      if (!value) return null;
                      
                      return (
                        <Grid item xs={12} sm={6} key={field.id}>
                          <Typography variant="body2" color="text.secondary">
                            {field.label}:
                          </Typography>
                          <Typography variant="body1">
                            {Array.isArray(value) ? value.join(", ") : value.toString()}
                          </Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {fileUploads.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
                  {fileUploads.map((upload, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        {formFields.find(f => f.id === upload.fieldId)?.label}:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {upload.files.map((file, fileIndex) => (
                          <Chip
                            key={fileIndex}
                            icon={<AttachFileIcon />}
                            label={file.name}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Credit Check Status */}
        {creditCheckInProgress && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CircularProgress size={20} />
              <Typography variant="body2">
                Performing credit check with TransUnion...
              </Typography>
            </Stack>
          </Alert>
        )}

        {creditCheckResults && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Credit Check Completed</strong>
            </Typography>
            <Typography variant="body2">
              Applicant Credit Score: {creditCheckResults.applicant.creditScore} ({creditCheckResults.applicant.creditRating})
            </Typography>
            {creditCheckResults.grantor && (
              <Typography variant="body2">
                Grantor Credit Score: {creditCheckResults.grantor.creditScore} ({creditCheckResults.grantor.creditRating})
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleFinalSubmit}
            disabled={isSubmitting || creditCheckInProgress}
            startIcon={(isSubmitting || creditCheckInProgress) ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isSubmitting ? "Submitting..." : creditCheckInProgress ? "Processing Credit Check..." : "Submit Application"}
          </Button>
        </Box>
      </Box>
    );
  };

  const isLastStep = currentStep === totalSteps - 1;
  const canProceedToNext = React.useCallback(() => {
    const termsStepIndex = fieldsBySections.length + (unSectionedFields.length > 0 ? 1 : 0);
    const paymentStepIndex = termsStepIndex + (template.termsAndConditions?.length ? 1 : 0);

    // Special handling for terms step
    if (template.termsAndConditions?.length && currentStep === termsStepIndex) {
      return termsAccepted.length > 0;
    }

    // Special handling for payment step
    if (template.applicationFee && currentStep === paymentStepIndex) {
      return paymentCompleted;
    }

    // For regular form steps, check if required fields have values
    let currentFields: FormField[] = [];
    if (currentStep < fieldsBySections.length) {
      currentFields = fieldsBySections[currentStep].fields;
    } else if (unSectionedFields.length > 0 && currentStep === fieldsBySections.length) {
      currentFields = unSectionedFields;
    }

    // If no fields in current step, allow proceeding
    if (currentFields.length === 0) {
      return true;
    }

    // Check required fields
    const requiredFields = currentFields.filter(field => field.required);

    // If no required fields, allow proceeding
    if (requiredFields.length === 0) {
      return true;
    }

    // Check each required field
    for (const field of requiredFields) {
      const value = formData[field.id];

      // Handle different field types
      switch (field.type) {
        case 'checkbox':
          if (value !== true) return false;
          break;
        case 'yesno':
        case 'radio':
          if (!value || value === '') return false;

          // Check grantor fields if grantor is needed
          if (field.id === 'grantor_needed' && value === 'yes') {
            const grantorFields = ['grantor_ssn', 'grantor_name', 'grantor_email', 'grantor_phone', 'grantor_address'];
            for (const grantorFieldId of grantorFields) {
              const grantorValue = formData[grantorFieldId];
              if (!grantorValue || grantorValue.trim() === '') {
                return false;
              }

              // Additional validation for specific fields
              if (grantorFieldId === 'grantor_ssn' && !/^\d{3}-\d{2}-\d{4}$/.test(grantorValue)) {
                return false;
              }
              if (grantorFieldId === 'grantor_email' && !/\S+@\S+\.\S+/.test(grantorValue)) {
                return false;
              }
              if (grantorFieldId === 'grantor_phone' && !/^\(\d{3}\) \d{3}-\d{4}$/.test(grantorValue)) {
                return false;
              }
            }
          }
          break;
        case 'select':
          if (!value || value === '') return false;
          break;
        case 'file_upload':
          const uploadedFiles = fileUploads.find(upload => upload.fieldId === field.id);
          if (!uploadedFiles || uploadedFiles.files.length === 0) return false;
          break;
        default:
          // text, email, phone, number, date, textarea, signature
          if (!value || value === '' || (typeof value === 'string' && value.trim() === '')) {
            return false;
          }
          break;
      }
    }

    return true;
  }, [currentStep, fieldsBySections, unSectionedFields, template.termsAndConditions, template.applicationFee, termsAccepted.length, paymentCompleted, formData, fileUploads]);

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "80vh" }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">{template.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {propertyAddress && `Property: ${propertyAddress}`}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Step {currentStep + 1} of {totalSteps}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentStep + 1) / totalSteps * 100} 
              sx={{ width: 100, mt: 1 }}
            />
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ minHeight: "400px" }}>
        {template.content && currentStep === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box dangerouslySetInnerHTML={{ __html: template.content }} />
          </Alert>
        )}
        
        {getCurrentStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        {currentStep > 0 && (
          <Button onClick={handlePreviousStep}>Previous</Button>
        )}
        {!isLastStep && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextStep}
            disabled={!canProceedToNext()}
            sx={{
              minWidth: '80px',
              '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            Next
          </Button>
        )}
      </DialogActions>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onClose={() => setShowTermsDialog(false)} maxWidth="lg" fullWidth>
        <DialogContent>
          <TermsAndConditions
            customTerms={template.termsAndConditions}
            applicationFee={template.applicationFee}
            propertyAddress={propertyAddress}
            onAccept={handleTermsAccept}
            onDecline={() => setShowTermsDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <ApplicationPaymentForm
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        applicationFee={template.applicationFee || 0}
        paymentMethods={template.paymentMethods || []}
        applicantName={formData["applicant_name"] || formData["first_name"] + " " + formData["last_name"] || "Applicant"}
        applicationId={`TEMP-${Date.now()}`}
        grantorNeeded={formData["grantor_needed"] === 'yes'}
        formData={formData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={(error) => {
          console.error("Payment error:", error);
          alert("Payment failed: " + error);
        }}
      />
    </Dialog>
  );
}
