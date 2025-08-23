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
import { getDisplayApplicantName } from "../utils/nameUtils";
import { useAutoSave } from "../hooks/useAutoSave";

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
  onUnsavedChanges?: (hasChanges: boolean) => void;
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
  onUnsavedChanges,
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Create a unique draft key for this form
  const draftKey = `app_draft_${template.id}_${propertyId || 'new'}_${Date.now()}`;

  // Auto-save draft data
  const draftData = React.useMemo(() => {
    // Convert fileUploads to object format for consistency
    const fileUploadsObject = fileUploads.reduce((acc, upload) => {
      acc[upload.fieldId] = upload.files;
      return acc;
    }, {} as Record<string, File[]>);

    return {
      formData,
      fileUploads: fileUploadsObject,
      termsAccepted,
      paymentCompleted,
      paymentData,
      currentStep,
      timestamp: Date.now()
    };
  }, [formData, fileUploads, termsAccepted, paymentCompleted, paymentData, currentStep]);

  // Use auto-save hook for draft management and beforeunload protection
  const { isSaving, lastSaved, saveData } = useAutoSave(draftData, draftKey, {
    delay: 2000, // Save every 2 seconds
    enabled: hasUnsavedChanges && isOpen
  });

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

  // Restore draft data on mount
  React.useEffect(() => {
    if (!isOpen) return;

    const savedDrafts = LocalStorageService.getFormData();
    const matchingDrafts = Object.entries(savedDrafts)
      .filter(([key]) => key.startsWith(`app_draft_${template.id}_${propertyId || 'new'}`))
      .sort(([, a], [, b]) => (b as any).timestamp - (a as any).timestamp); // Most recent first

    if (matchingDrafts.length > 0) {
      const [, mostRecentDraft] = matchingDrafts[0];
      const draft = mostRecentDraft as any;

      // Only restore if the draft is less than 24 hours old
      const draftAge = Date.now() - (draft.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (draftAge < maxAge) {
        setFormData(draft.formData || {});

        // Handle both legacy array format and new object format for fileUploads
        if (draft.fileUploads) {
          if (Array.isArray(draft.fileUploads)) {
            // Legacy array format: [{fieldId, files}, ...]
            setFileUploads(draft.fileUploads);
          } else {
            // New object format: {fieldId: files, ...} - convert back to array for internal state
            const fileUploadsArray = Object.entries(draft.fileUploads).map(([fieldId, files]) => ({
              fieldId,
              files: Array.isArray(files) ? files : [files]
            }));
            setFileUploads(fileUploadsArray);
          }
        } else {
          setFileUploads([]);
        }

        setTermsAccepted(draft.termsAccepted || []);
        setPaymentCompleted(draft.paymentCompleted || false);
        setPaymentData(draft.paymentData || null);
        setCurrentStep(draft.currentStep || 0);
        console.log('Restored application draft from', new Date(draft.timestamp).toLocaleString());
      }
    }
  }, [isOpen, template.id, propertyId]);

  // Track changes to mark as unsaved
  React.useEffect(() => {
    const hasData = Object.keys(formData).length > 0 ||
                   fileUploads.length > 0 ||
                   termsAccepted.length > 0 ||
                   paymentCompleted;
    const newHasUnsavedChanges = hasData && !isSubmitting;
    setHasUnsavedChanges(newHasUnsavedChanges);

    // Notify parent component about unsaved changes
    if (onUnsavedChanges) {
      onUnsavedChanges(newHasUnsavedChanges);
    }
  }, [formData, fileUploads, termsAccepted, paymentCompleted, isSubmitting, onUnsavedChanges]);

  // Clean up old drafts periodically
  React.useEffect(() => {
    const cleanupOldDrafts = () => {
      const savedDrafts = LocalStorageService.getFormData();
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      Object.entries(savedDrafts).forEach(([key, draft]) => {
        const draftAge = now - ((draft as any).timestamp || 0);
        if (draftAge > maxAge) {
          LocalStorageService.clearFormData(key);
        }
      });
    };

    cleanupOldDrafts();
  }, []);

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
        // For multiple file uploads, append new files to existing ones
        // For single file uploads, replace the existing file
        const field = formFields.find(f => f.id === fieldId);
        const maxFiles = field?.maxFiles || 5;

        let updatedFiles = files;
        if (maxFiles > 1) {
          // Append new files to existing, but respect maxFiles limit
          updatedFiles = [...existing.files, ...files].slice(0, maxFiles);
        }

        return prev.map(upload =>
          upload.fieldId === fieldId
            ? { ...upload, files: updatedFiles }
            : upload
        );
      }
      return [...prev, { fieldId, files }];
    });

    // Mark form as having unsaved changes
    setHasUnsavedChanges(true);
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

        // Handle file upload validation differently
        if (field.type === "file_upload") {
          const uploadedFiles = fileUploads.find(upload => upload.fieldId === field.id);
          if (!uploadedFiles || uploadedFiles.files.length === 0) {
            errors[field.id] = `${field.label} is required`;
          }
        } else {
          // Standard validation for other field types
          if (!value || (Array.isArray(value) && value.length === 0)) {
            errors[field.id] = `${field.label} is required`;
          }
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
      // Convert fileUploads array to object format expected by Applications view
      const fileUploadsObject = fileUploads.reduce((acc, upload) => {
        acc[upload.fieldId] = upload.files;
        return acc;
      }, {} as Record<string, File[]>);

      const applicationData = {
        id: `APP-${Date.now()}`,
        templateId: template.id,
        templateName: template.name,
        propertyId,
        propertyAddress,
        formData,
        fileUploads: fileUploadsObject,
        termsAccepted,
        paymentData,
        status: "New",
        submittedDate: new Date().toISOString(),
        applicantName: getDisplayApplicantName(formData),
        applicantEmail: formData["email"] || formData["applicant_email"] || "",
        applicantPhone: formData["phone"] || formData["applicant_phone"] || "",
        applicationFee: template.applicationFee || 0,
        paymentStatus: paymentCompleted ? "Paid" : "Pending",
        paymentMethod: paymentData?.method || "Pending",
      };

      // Save to localStorage for demo purposes
      const existingApplications = LocalStorageService.getApplications();
      LocalStorageService.saveApplications([...existingApplications, applicationData]);

      // Clear all drafts for this form since it was successfully submitted
      const savedDrafts = LocalStorageService.getFormData();
      Object.keys(savedDrafts).forEach(key => {
        if (key.startsWith(`app_draft_${template.id}_${propertyId || 'new'}`)) {
          LocalStorageService.clearFormData(key);
        }
      });

      setHasUnsavedChanges(false);
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

      case "terms":
        return (
          <FormControl key={field.id} component="fieldset" margin="normal" error={!!error}>
            <FormLabel component="legend">{field.label} {field.required && "*"}</FormLabel>
            {field.placeholder && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {field.placeholder}
              </Typography>
            )}
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options && field.options.length > 0 ? (
                field.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))
              ) : (
                <FormControlLabel
                  value="I / We understand and agree"
                  control={<Radio />}
                  label="I / We understand and agree"
                />
              )}
            </RadioGroup>
            {(error || field.description) && (
              <Typography variant="caption" color={error ? "error" : "text.secondary"}>
                {error || field.description || "Read carefully and if agree, click on the I / We Understand and agree to proceed"}
              </Typography>
            )}
          </FormControl>
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
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: field.fileTypes ? field.fileTypes.reduce((acc, type) => {
        acc[`.${type}`] = [];
        return acc;
      }, {} as any) : undefined,
      maxFiles: field.maxFiles || 5,
      maxSize: (field.maxFileSize || 10) * 1024 * 1024, // Convert MB to bytes
      onDrop: (files) => {
        onFilesChange(files);
      }
    });

    // Get the current saved files for this field from fileUploads state
    const currentFiles = fileUploads.find(upload => upload.fieldId === field.id)?.files || [];

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

        {currentFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Uploaded Files:</Typography>
            {currentFiles.map((file, index) => (
              <Chip
                key={index}
                icon={<AttachFileIcon />}
                label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
                onDelete={() => {
                  // Remove this file from the uploaded files
                  const updatedFiles = currentFiles.filter((_, i) => i !== index);
                  onFilesChange(updatedFiles);
                }}
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
          break;
        case 'select':
          if (!value || value === '') return false;
          break;
        case 'file_upload':
          const uploadedFiles = fileUploads.find(upload => upload.fieldId === field.id);
          if (!uploadedFiles || uploadedFiles.files.length === 0) return false;
          break;
        case 'terms':
          if (!value || value === '') return false;
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
        applicantName={getDisplayApplicantName(formData, "Applicant", template.formFields)}
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
