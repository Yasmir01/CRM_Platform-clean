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

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
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
        applicationFee: template.applicationFee || 0,
        paymentStatus: paymentCompleted ? "Paid" : "Pending",
        paymentMethod: paymentData?.method || "Pending",
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
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {(error || field.description) && (
              <Typography variant="caption" color={error ? "error" : "text.secondary"}>
                {error || field.description}
              </Typography>
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

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </Box>
      </Box>
    );
  };

  const isLastStep = currentStep === totalSteps - 1;
  const canProceedToNext = React.useCallback(() => {
    const termsStepIndex = fieldsBySections.length + (unSectionedFields.length > 0 ? 1 : 0);
    const paymentStepIndex = termsStepIndex + (template.termsAndConditions?.length ? 1 : 0);

    if (template.termsAndConditions?.length && currentStep === termsStepIndex) {
      return termsAccepted.length > 0;
    }

    if (template.applicationFee && currentStep === paymentStepIndex) {
      return paymentCompleted;
    }

    // For regular form steps, check if required fields have values (without triggering validation state update)
    let currentFields: FormField[] = [];
    if (currentStep < fieldsBySections.length) {
      currentFields = fieldsBySections[currentStep].fields;
    } else if (unSectionedFields.length > 0 && currentStep === fieldsBySections.length) {
      currentFields = unSectionedFields;
    }

    // Check required fields without updating state
    for (const field of currentFields) {
      if (field.required) {
        const value = formData[field.id];

        // Handle different field types properly
        if (field.type === 'checkbox') {
          // For checkboxes, required means it must be checked (true)
          if (value !== true) {
            return false;
          }
        } else {
          // For other fields, check if value exists and is not empty
          if (!value || value === '' || (typeof value === 'string' && value.trim() === '')) {
            return false;
          }
        }
      }
    }

    return true;
  }, [currentStep, fieldsBySections, unSectionedFields, template.termsAndConditions, template.applicationFee, termsAccepted.length, paymentCompleted, formData]);

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
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={(error) => {
          console.error("Payment error:", error);
          alert("Payment failed: " + error);
        }}
      />
    </Dialog>
  );
}
