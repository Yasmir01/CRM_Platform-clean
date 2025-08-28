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
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PersonIcon from "@mui/icons-material/Person";
import LinkIcon from "@mui/icons-material/Link";
import {
  processUploadedFile,
  validateCombinedData,
  generateCombinedTemplate,
  ImportResult,
  ImportError,
  CombinedImportData
} from "../utils/bulkUploadUtils";

interface CombinedBulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: CombinedImportData) => Promise<void>;
  existingProperties?: any[];
  existingTenants?: any[];
}

const steps = ['Upload File', 'Validate Data', 'Review & Import'];

export default function CombinedBulkUploadDialog({
  open,
  onClose,
  onImport,
  existingProperties = [],
  existingTenants = []
}: CombinedBulkUploadDialogProps) {
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
      const result = validateCombinedData(rawData, existingProperties, existingTenants);
      setValidationResult(result);
      setActiveStep(2);
      setIsProcessing(false);
    }, 1000);
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.data) {
      alert('No valid data to import');
      return;
    }

    setImporting(true);
    try {
      await onImport(validationResult.data as CombinedImportData);
      setActiveStep(0);
      setUploadedFile(null);
      setRawData([]);
      setValidationResult(null);
      setPreviewData([]);
      onClose();
      
      const combinedData = validationResult.data as CombinedImportData;
      alert(`Successfully imported ${combinedData.properties.length} properties and ${combinedData.tenants.length} tenants`);
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
    const templateContent = generateCombinedTemplate();
    const filename = 'properties-tenants-template.csv';
    
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

  const getDataSummary = () => {
    if (!validationResult?.data) return { properties: 0, tenants: 0, relationships: 0 };
    
    const combinedData = validationResult.data as CombinedImportData;
    return {
      properties: combinedData.properties.length,
      tenants: combinedData.tenants.length,
      relationships: combinedData.propertyTenantsMap.size
    };
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '700px' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              🏠👥 Combined Bulk Import - Properties & Tenants
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload properties and tenants together in a single file with automatic linking
            </Typography>
          </Box>
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
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Combined Upload Instructions</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Use the 'type' column to distinguish between Property and Tenant rows
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Property rows: Include property details (name, address, type, etc.)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Tenant rows: Include tenant details and 'propertyName' to link to properties
              </Typography>
              <Typography variant="body2">
                • Properties will be created first, then tenants will be automatically linked
              </Typography>
            </Alert>

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
                {isDragActive ? 'Drop files here...' : 'Drag & drop your combined CSV or JSON file here'}
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
                  Processing combined file...
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
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {Object.keys(previewData[0] || {}).slice(0, 6).map((key) => (
                              <TableCell key={key}>{key}</TableCell>
                            ))}
                            <TableCell>...</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {previewData.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).slice(0, 6).map((value: any, cellIndex) => (
                                <TableCell key={cellIndex}>{value || '-'}</TableCell>
                              ))}
                              <TableCell>...</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
                  Combined Data Validation
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Click "Validate" to check your properties and tenants data for errors and validate property-tenant relationships.
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
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                      <HomeWorkIcon sx={{ fontSize: 24, color: 'success.main', mb: 1 }} />
                      <Typography variant="caption">Properties Expected</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                      <PersonIcon sx={{ fontSize: 24, color: 'info.main', mb: 1 }} />
                      <Typography variant="caption">Tenants Expected</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {isProcessing && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                      Validating combined data and relationships...
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
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <HomeWorkIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {getDataSummary().properties}
                    </Typography>
                    <Typography variant="caption">Properties</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" color="info.main">
                      {getDataSummary().tenants}
                    </Typography>
                    <Typography variant="caption">Tenants</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LinkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary.main">
                      {getDataSummary().relationships}
                    </Typography>
                    <Typography variant="caption">Property Links</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
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
            </Grid>

            {validationResult.errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <AlertTitle>Validation Errors Found</AlertTitle>
                <Typography variant="body2">
                  {validationResult.errors.length} error(s) found in your combined data. 
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
                  {getDataSummary().properties} properties and {getDataSummary().tenants} tenants ready for import with automatic linking.
                </Typography>
              </Alert>
            )}

            {importing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  Importing properties and tenants with automatic linking...
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
            Validate Combined Data
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!validationResult || validationResult.successfulRecords === 0 || importing}
            startIcon={<LinkIcon />}
          >
            Import {getDataSummary().properties + getDataSummary().tenants} Records
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
