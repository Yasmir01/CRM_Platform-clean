import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  Tab,
  Tabs,
  LinearProgress,
  Avatar,
  Menu,
  MenuList,
  ListItemButton,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Upload as UploadIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Shield as ShieldIcon,
  Fingerprint as FingerprintIcon,
  VpnKey as VpnKeyIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  FilePresent as FilePresentIcon,
  InsertDriveFile as InsertDriveFileIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Image as ImageIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { documentSecurityService } from '../services/DocumentSecurityService';
import { uniformTooltipStyles } from '../utils/formStyles';
import { useCrmData } from '../contexts/CrmDataContext';

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
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <PictureAsPdfIcon color="error" />;
  if (fileType.includes('image')) return <ImageIcon color="primary" />;
  if (fileType.includes('text') || fileType.includes('document')) return <DescriptionIcon color="info" />;
  return <InsertDriveFileIcon />;
};

const getRiskColor = (riskScore: number) => {
  if (riskScore > 70) return 'error';
  if (riskScore > 40) return 'warning';
  return 'success';
};

const getComplianceColor = (status: string) => {
  switch (status) {
    case 'compliant': return 'success';
    case 'warning': return 'warning';
    case 'violation': return 'error';
    default: return 'default';
  }
};

interface EnhancedDocumentManagerProps {
  entityId?: string;
  entityType?: string;
}

export default function EnhancedDocumentManager({ entityId, entityType }: EnhancedDocumentManagerProps) {
  const { state } = useCrmData();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState<any>(null);
  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [openVersionDialog, setOpenVersionDialog] = React.useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = React.useState(false);
  const [openShareDialog, setOpenShareDialog] = React.useState(false);
  const [openAuditDialog, setOpenAuditDialog] = React.useState(false);
  const [versionHistory, setVersionHistory] = React.useState<any[]>([]);
  const [accessLog, setAccessLog] = React.useState<any[]>([]);
  const [auditReports, setAuditReports] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState<null | HTMLElement>(null);
  
  // Upload form state
  const [uploadData, setUploadData] = React.useState({
    category: 'Other',
    tags: '',
    description: '',
    isConfidential: false,
    file: null as File | null
  });

  // Share form state
  const [shareData, setShareData] = React.useState({
    expiresIn: 24,
    password: '',
    allowDownload: true,
    maxViews: 0
  });

  // Version form state
  const [versionData, setVersionData] = React.useState({
    changeNotes: '',
    file: null as File | null
  });

  React.useEffect(() => {
    loadDocuments();
    loadAuditReports();
  }, [entityId, entityType]);

  const loadDocuments = () => {
    // In a real implementation, this would filter by entity
    const allDocs = Array.from(documentSecurityService['documents'].values());
    const filteredDocs = entityId 
      ? allDocs.filter(doc => doc.entityId === entityId && doc.entityType === entityType)
      : allDocs;
    setDocuments(filteredDocs);
  };

  const loadAuditReports = () => {
    const reports = documentSecurityService.generateAuditReport();
    setAuditReports(reports);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadData({ ...uploadData, file: acceptedFiles[0] });
        setOpenUploadDialog(true);
      }
    },
    multiple: false
  });

  const handleUploadDocument = async () => {
    if (!uploadData.file) return;

    setUploading(true);
    try {
      const metadata = {
        category: uploadData.category,
        entityId: entityId || 'general',
        entityType: entityType || 'general',
        tags: uploadData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        description: uploadData.description,
        isConfidential: uploadData.isConfidential,
        userId: 'current_user', // In real app, get from auth context
        userEmail: 'user@example.com'
      };

      await documentSecurityService.encryptDocument(uploadData.file, metadata);
      
      setOpenUploadDialog(false);
      setUploadData({
        category: 'Other',
        tags: '',
        description: '',
        isConfidential: false,
        file: null
      });
      
      loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = async (document: any) => {
    try {
      const result = await documentSecurityService.decryptDocument(
        document.id,
        'current_user',
        'user@example.com'
      );
      
      // Create blob and download/view
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      loadDocuments(); // Refresh to update access logs
    } catch (error) {
      console.error('Failed to view document:', error);
      alert('Failed to view document: ' + (error as Error).message);
    }
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const result = await documentSecurityService.decryptDocument(
        document.id,
        'current_user',
        'user@example.com'
      );
      
      // Create download link
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      loadDocuments();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + (error as Error).message);
    }
  };

  const handleViewVersionHistory = (document: any) => {
    const history = documentSecurityService.getVersionHistory(document.id, 'current_user');
    setVersionHistory(history);
    setSelectedDocument(document);
    setOpenVersionDialog(true);
  };

  const handleViewAccessLog = (document: any) => {
    const log = documentSecurityService.getAccessLog(document.id, 'current_user');
    setAccessLog(log);
    setSelectedDocument(document);
    setOpenAuditDialog(true);
  };

  const handleCreateVersion = async () => {
    if (!versionData.file || !selectedDocument) return;

    try {
      await documentSecurityService.createDocumentVersion(
        selectedDocument.id,
        versionData.file,
        versionData.changeNotes,
        'current_user',
        'user@example.com'
      );
      
      setOpenVersionDialog(false);
      setVersionData({ changeNotes: '', file: null });
      loadDocuments();
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const handleGenerateShareLink = () => {
    if (!selectedDocument) return;

    try {
      const link = documentSecurityService.generateShareableLink(
        selectedDocument.id,
        {
          expiresIn: shareData.expiresIn,
          password: shareData.password || undefined,
          allowDownload: shareData.allowDownload,
          maxViews: shareData.maxViews || undefined
        },
        'current_user',
        'user@example.com'
      );
      
      navigator.clipboard.writeText(link);
      alert('Share link copied to clipboard!');
      setOpenShareDialog(false);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  };

  const handleDeleteDocument = (document: any) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        documentSecurityService.deleteDocument(document.id, 'current_user', 'user@example.com');
        loadDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderDocumentsTab = () => (
    <Grid container spacing={3}>
      {/* Upload Area */}
      <Grid item xs={12}>
        <Card
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'primary.50' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50'
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All files are automatically encrypted and versioned
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
              <Chip icon={<SecurityIcon />} label="Encrypted" size="small" />
              <Chip icon={<HistoryIcon />} label="Versioned" size="small" />
              <Chip icon={<ShieldIcon />} label="Secure" size="small" />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Documents Table */}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Security</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Access</TableCell>
                <TableCell>Modified</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar>
                        {getFileIcon(doc.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{doc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(doc.size)} • {doc.category}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1}>
                        {doc.metadata.isConfidential && (
                          <Chip icon={<LockIcon />} label="Confidential" size="small" color="error" />
                        )}
                        <Chip 
                          icon={<SecurityIcon />} 
                          label={doc.encryption.algorithm} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Encrypted by {doc.encryption.encryptedBy}
                      </Typography>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack>
                      <Typography variant="body2">v{doc.currentVersion}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.versions.length} version{doc.versions.length !== 1 ? 's' : ''}
                      </Typography>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack>
                      <Typography variant="body2">
                        {doc.accessLog.length} access{doc.accessLog.length !== 1 ? 'es' : ''}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Chip 
                          icon={<PersonIcon />} 
                          label={doc.permissions.viewers.length + doc.permissions.editors.length + 1} 
                          size="small" 
                          variant="outlined" 
                        />
                        {doc.permissions.shareableLink && (
                          <Chip icon={<ShareIcon />} label="Shared" size="small" color="info" />
                        )}
                      </Stack>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack>
                      <Typography variant="body2">
                        {formatDateTime(doc.metadata.lastModified)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {doc.metadata.modifiedBy}
                      </Typography>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Document" sx={uniformTooltipStyles}>
                        <IconButton size="small" onClick={() => handleViewDocument(doc)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download" sx={uniformTooltipStyles}>
                        <IconButton size="small" onClick={() => handleDownloadDocument(doc)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Version History" sx={uniformTooltipStyles}>
                        <IconButton size="small" onClick={() => handleViewVersionHistory(doc)}>
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setSelectedDocument(doc);
                          setActionMenuAnchor(e.currentTarget);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );

  const renderSecurityTab = () => (
    <Grid container spacing={3}>
      {/* Security Overview */}
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">Document Security Overview</Typography>
          <Typography variant="body2">
            All documents are encrypted with AES-256 encryption and include comprehensive audit trails.
          </Typography>
        </Alert>
      </Grid>

      {/* Security Stats */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.secondary">Encrypted Files</Typography>
                <Typography variant="h4">{documents.length}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <LockIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.secondary">Confidential</Typography>
                <Typography variant="h4">
                  {documents.filter(d => d.metadata.isConfidential).length}
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
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <ShareIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.secondary">Shared Links</Typography>
                <Typography variant="h4">
                  {documents.filter(d => d.permissions.shareableLink).length}
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
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" color="text.secondary">Audit Events</Typography>
                <Typography variant="h4">
                  {documents.reduce((sum, d) => sum + d.accessLog.length, 0)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Audit Reports */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Security Audit Reports</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Compliance</TableCell>
                <TableCell>Access Stats</TableCell>
                <TableCell>Recommendations</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditReports.map((report) => {
                const doc = documents.find(d => d.id === report.documentId);
                return (
                  <TableRow key={report.documentId}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {doc?.name || 'Unknown Document'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LinearProgress
                          variant="determinate"
                          value={report.riskScore}
                          sx={{ width: 60, height: 8, borderRadius: 4 }}
                          color={getRiskColor(report.riskScore) as any}
                        />
                        <Typography variant="body2">
                          {report.riskScore.toFixed(0)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={report.complianceStatus}
                        size="small"
                        color={getComplianceColor(report.complianceStatus) as any}
                        icon={
                          report.complianceStatus === 'compliant' ? <CheckCircleIcon /> :
                          report.complianceStatus === 'warning' ? <WarningIcon /> :
                          <ErrorIcon />
                        }
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">
                          {report.totalAccesses} accesses
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.uniqueUsers} unique users
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {report.recommendations.length} recommendation{report.recommendations.length !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="View Details" sx={uniformTooltipStyles}>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedDocument(doc);
                            handleViewAccessLog(doc);
                          }}
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Enhanced Document Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip icon={<SecurityIcon />} label="Enterprise Security" color="primary" />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenUploadDialog(true)}
          >
            Upload Document
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<FilePresentIcon />}
            label="Documents"
            iconPosition="start"
          />
          <Tab
            icon={<SecurityIcon />}
            label="Security & Audit"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {renderDocumentsTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderSecurityTab()}
      </TabPanel>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Secure Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Your document will be encrypted with AES-256 encryption and stored securely with full audit trails.
            </Alert>
            
            <TextField
              label="File"
              value={uploadData.file?.name || ''}
              disabled
              helperText="Drag and drop a file or click browse to select"
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={uploadData.category}
                label="Category"
                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              >
                <MenuItem value="Lease">Lease</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="Inspection">Inspection</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <MenuItem value="Financial">Financial</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Tags"
              value={uploadData.tags}
              onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
              placeholder="Enter tags separated by commas"
              helperText="Tags help with document organization and search"
            />
            
            <TextField
              label="Description"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              multiline
              rows={3}
              placeholder="Optional description of the document"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={uploadData.isConfidential}
                  onChange={(e) => setUploadData({ ...uploadData, isConfidential: e.target.checked })}
                />
              }
              label="Mark as Confidential (extra security restrictions)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUploadDocument}
            disabled={!uploadData.file || uploading}
            startIcon={uploading ? <SecurityIcon /> : <UploadIcon />}
          >
            {uploading ? 'Encrypting...' : 'Upload & Encrypt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      {actionMenuAnchor && (
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => setActionMenuAnchor(null)}
        >
          <MenuList>
            <ListItemButton onClick={() => {
              setOpenShareDialog(true);
              setActionMenuAnchor(null);
            }}>
              <ListItemIcon><ShareIcon /></ListItemIcon>
              <ListItemText>Share Document</ListItemText>
            </ListItemButton>
            <ListItemButton onClick={() => {
              setOpenPermissionsDialog(true);
              setActionMenuAnchor(null);
            }}>
              <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
              <ListItemText>Manage Permissions</ListItemText>
            </ListItemButton>
            <ListItemButton onClick={() => {
              if (selectedDocument) handleViewAccessLog(selectedDocument);
              setActionMenuAnchor(null);
            }}>
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText>View Audit Log</ListItemText>
            </ListItemButton>
            <Divider />
            <ListItemButton
              onClick={() => {
                if (selectedDocument) handleDeleteDocument(selectedDocument);
                setActionMenuAnchor(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
              <ListItemText>Delete Document</ListItemText>
            </ListItemButton>
          </MenuList>
        </Menu>
      )}

      {/* Other dialogs would go here - Share, Permissions, Audit, etc. */}
      {/* For brevity, I'm including just the basic structure */}
      
      {/* Share Dialog */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Share Link</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="warning">
              Shared links provide temporary access to this document. Use with caution.
            </Alert>

            <TextField
              label="Expires in (hours)"
              type="number"
              value={shareData.expiresIn}
              onChange={(e) => setShareData({ ...shareData, expiresIn: parseInt(e.target.value) })}
              helperText="Link will expire after this many hours"
            />

            <TextField
              label="Password (optional)"
              type="password"
              value={shareData.password}
              onChange={(e) => setShareData({ ...shareData, password: e.target.value })}
              helperText="Add password protection for extra security"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={shareData.allowDownload}
                  onChange={(e) => setShareData({ ...shareData, allowDownload: e.target.checked })}
                />
              }
              label="Allow download"
            />

            <TextField
              label="Maximum views (0 = unlimited)"
              type="number"
              value={shareData.maxViews}
              onChange={(e) => setShareData({ ...shareData, maxViews: parseInt(e.target.value) })}
              helperText="Limit the number of times this link can be accessed"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateShareLink} startIcon={<ShareIcon />}>
            Generate Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={openVersionDialog} onClose={() => setOpenVersionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Version History - {selectedDocument?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Create New Version */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Create New Version</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <input
                    type="file"
                    onChange={(e) => setVersionData({ ...versionData, file: e.target.files?.[0] || null })}
                    style={{ marginBottom: 16 }}
                  />
                  <TextField
                    label="Change Notes"
                    value={versionData.changeNotes}
                    onChange={(e) => setVersionData({ ...versionData, changeNotes: e.target.value })}
                    multiline
                    rows={3}
                    placeholder="Describe what changed in this version"
                  />
                  <Button
                    variant="contained"
                    onClick={handleCreateVersion}
                    disabled={!versionData.file}
                    startIcon={<HistoryIcon />}
                  >
                    Create Version
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Version History */}
            <Typography variant="h6">Version History</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {versionHistory.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <Typography variant="subtitle2">v{version.version}</Typography>
                      </TableCell>
                      <TableCell>{formatFileSize(version.size)}</TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">
                            {formatDateTime(version.createdAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {version.createdBy}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {version.changeNotes}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {version.isActive ? (
                          <Chip label="Current" size="small" color="primary" />
                        ) : (
                          <Chip label="Archived" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Version" sx={uniformTooltipStyles}>
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Version" sx={uniformTooltipStyles}>
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVersionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={openAuditDialog} onClose={() => setOpenAuditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Security Audit Log - {selectedDocument?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Alert severity="info">
              Complete audit trail of all document access and modifications.
            </Alert>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accessLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(entry.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.action}
                          size="small"
                          color={
                            entry.action === 'view' ? 'info' :
                            entry.action === 'download' ? 'success' :
                            entry.action === 'edit' ? 'warning' :
                            entry.action === 'delete' ? 'error' :
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{entry.userEmail}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {entry.userId}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {entry.success ? (
                          <Chip icon={<CheckCircleIcon />} label="Success" size="small" color="success" />
                        ) : (
                          <Chip icon={<ErrorIcon />} label="Failed" size="small" color="error" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {entry.details?.action || entry.errorMessage || 'No additional details'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuditDialog(false)}>Close</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={openPermissionsDialog} onClose={() => setOpenPermissionsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Document Permissions - {selectedDocument?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Configure who can view, edit, or manage this document.
            </Alert>

            <Typography variant="h6">Access Levels</Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Viewers (Read Only)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Users who can view and download the document
                  </Typography>
                  <TextField
                    label="Add viewer by email"
                    placeholder="user@example.com"
                    fullWidth
                  />
                  <List>
                    {selectedDocument?.permissions.viewers.map((viewer: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon><VisibilityIcon /></ListItemIcon>
                        <ListItemText primary={viewer} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Editors (Read & Write)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Users who can view, download, and upload new versions
                  </Typography>
                  <TextField
                    label="Add editor by email"
                    placeholder="user@example.com"
                    fullWidth
                  />
                  <List>
                    {selectedDocument?.permissions.editors.map((editor: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon><EditIcon /></ListItemIcon>
                        <ListItemText primary={editor} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Security Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={selectedDocument?.permissions.restrictions.preventDownload} />}
                    label="Prevent Download"
                  />
                  <FormControlLabel
                    control={<Switch checked={selectedDocument?.permissions.restrictions.preventPrint} />}
                    label="Prevent Print"
                  />
                  <FormControlLabel
                    control={<Switch checked={selectedDocument?.permissions.restrictions.preventCopy} />}
                    label="Prevent Copy"
                  />
                  <FormControlLabel
                    control={<Switch checked={selectedDocument?.permissions.restrictions.requireAuthentication} />}
                    label="Require Authentication"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermissionsDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SecurityIcon />}>
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
