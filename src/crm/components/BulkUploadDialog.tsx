import * as React from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  processUploadedFile,
  validatePropertyData,
  validateContactData,
  validateTenantData,
  generatePropertyTemplate,
  generateContactTemplate,
  generateTenantTemplate,
  ImportResult,
  ImportError
} from "../utils/bulkUploadUtils";

export type DataType = 'properties' | 'contacts' | 'tenants';

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  dataType: DataType;
  onImport: (data: any[]) => Promise<void>;
  existingData?: any[];
  relatedData?: { properties?: any[]; contacts?: any[]; tenants?: any[] };
}

const steps = ['Upload File', 'Validate Data', 'Review & Import'];

const getDataTypeDisplayName = (dataType: DataType): string => {
  switch (dataType) {
    case 'properties': return 'Properties';
    case 'contacts': return 'Contacts'; 
    case 'tenants': return 'Tenants';
    default: return 'Data';
  }
};

export default function BulkUploadDialog({
  open,
  onClose,
  dataType,
  onImport,
  existingData = [],
  relatedData = {}
}: BulkUploadDialogProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [rawData, setRawData] = React.useState<any[]>([]);
  const [validationResult, setValidationResult] = React.useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [showErrors, setShowErrors] = React.useState(false);
  const [importing, setImporting] = React.useState(false);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      processUploadedFile(file)
        .then((data) => {
          setRawData(data);
          setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
          setActiveStep(1);
        })
        .catch((error) => {
          alert(`Error processing file: ${error.message}`);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleValidateData = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      let result: ImportResult;
      
      switch (dataType) {
        case 'properties':
          result = validatePropertyData(rawData, existingData);
          break;
        case 'contacts':
          result = validateContactData(rawData, existingData);
          break;
        case 'tenants':
          result = validateTenantData(rawData, existingData, relatedData.properties || []);
          break;
        default:
          result = {
            success: false,
            totalRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            errors: [{ row: 0, message: 'Unknown data type' }],
            data: []
          };
      }
      
      setValidationResult(result);
      setActiveStep(2);
      setIsProcessing(false);
    }, 1000);
  };

  const handleImport = async () => {
    if (!validationResult || validationResult.data.length === 0) {
      alert('No valid data to import');
      return;
    }

    setImporting(true);
    try {
      await onImport(validationResult.data);
      setActiveStep(0);
      setUploadedFile(null);
      setRawData([]);
      setValidationResult(null);
      setPreviewData([]);
      onClose();
      alert(`Successfully imported ${validationResult.successfulRecords} ${getDataTypeDisplayName(dataType).toLowerCase()}`);
    } catch (error) {
      alert(`Import failed: ${(error as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setUploadedFile(null);
    setRawData([]);
    setValidationResult(null);
    setPreviewData([]);
    setShowErrors(false);
  };

  const downloadTemplate = () => {
    let templateContent = '';
    let filename = '';
    
    switch (dataType) {
      case 'properties':
        templateContent = generatePropertyTemplate();
        filename = 'properties-template.csv';
        break;
      case 'contacts':
        templateContent = generateContactTemplate();
        filename = 'contacts-template.csv';
        break;
      case 'tenants':
        templateContent = generateTenantTemplate();
        filename = 'tenants-template.csv';
        break;
    }
    
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFieldDisplayName = (field: string): string => {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      monthlyRent: 'Monthly Rent',
      leaseStart: 'Lease Start',
      leaseEnd: 'Lease End',
      propertyName: 'Property Name',
      propertyId: 'Property ID',
      squareFootage: 'Square Footage',
      petPolicy: 'Pet Policy',
      petDeposit: 'Pet Deposit',
      petFee: 'Pet Fee',
      parkingSpaces: 'Parking Spaces',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: 'Emergency Phone'
    };
    return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Bulk Import {getDataTypeDisplayName(dataType)}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={downloadTemplate}
            size="small"
          >
            Download Template
          </Button>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step 1: Upload File */}
        {activeStep === 0 && (
          <Box>
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                backgroundColor: isDragActive ? 'primary.50' : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here...' : 'Drag & drop your CSV or JSON file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: CSV, JSON (Max size: 10MB)
              </Typography>
            </Paper>

            {uploadedFile && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CheckCircleIcon color="success" />
                    <Box>
                      <Typography variant="subtitle2">{uploadedFile.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <IconButton onClick={() => setUploadedFile(null)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {isProcessing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Processing file...
                </Typography>
              </Box>
            )}

            {previewData.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Data Preview ({rawData.length} total records)
                  </Typography>
                  <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
                    <pre style={{ fontSize: '12px', margin: 0 }}>
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Step 2: Validate Data */}
        {activeStep === 1 && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Validation
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Click "Validate" to check your data for errors and duplicates.
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {rawData.length}
                      </Typography>
                      <Typography variant="caption">Total Records</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info">
                        {Object.keys(rawData[0] || {}).length}
                      </Typography>
                      <Typography variant="caption">Fields</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {isProcessing && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                      Validating data...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Step 3: Review & Import */}
        {activeStep === 2 && validationResult && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {validationResult.successfulRecords}
                    </Typography>
                    <Typography variant="caption">Valid Records</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" color="error.main">
                      {validationResult.failedRecords}
                    </Typography>
                    <Typography variant="caption">Errors</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" color="warning.main">
                      {validationResult.totalRecords}
                    </Typography>
                    <Typography variant="caption">Total Records</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {validationResult.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <AlertTitle>Validation Errors Found</AlertTitle>
                <Typography variant="body2">
                  {validationResult.errors.length} error(s) found in your data. 
                  Please review and fix these issues before importing.
                </Typography>
                <Button
                  size="small"
                  startIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowErrors(!showErrors)}
                  sx={{ mt: 1 }}
                >
                  {showErrors ? 'Hide' : 'Show'} Error Details
                </Button>
                <Collapse in={showErrors}>
                  <List dense sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                    {validationResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ErrorIcon color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Row ${error.row}${error.field ? ` - ${getFieldDisplayName(error.field)}` : ''}`}
                          secondary={error.message}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Alert>
            )}

            {validationResult.successfulRecords > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <AlertTitle>Ready to Import</AlertTitle>
                <Typography variant="body2">
                  {validationResult.successfulRecords} valid record(s) ready for import.
                </Typography>
              </Alert>
            )}

            {importing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Importing data...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing || importing}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleReset} disabled={isProcessing || importing}>
            Start Over
          </Button>
        )}

        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleValidateData}
            disabled={!uploadedFile || isProcessing}
          >
            Validate Data
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!validationResult || validationResult.successfulRecords === 0 || importing}
          >
            Import {validationResult?.successfulRecords || 0} Records
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
