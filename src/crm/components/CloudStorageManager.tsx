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
  Avatar,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  RadioGroup,
  Radio,
  CheckboxTree
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import StorageIcon from '@mui/icons-material/Storage';
import BackupIcon from '@mui/icons-material/Backup';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import FolderIcon from '@mui/icons-material/Folder';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/GetApp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CostIcon from '@mui/icons-material/MonetizationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';;
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cloudStorageService } from '../services/CloudStorageService';
import { uniformTooltipStyles } from '../utils/formStyles';

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
      id={`cloud-storage-tabpanel-${index}`}
      aria-labelledby={`cloud-storage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const providerColors = {
  aws_s3: '#FF9900',
  google_cloud: '#4285F4',
  azure_blob: '#0078D4',
  dropbox: '#0061FF',
  onedrive: '#0078D4',
  box: '#0061D5',
  custom: '#666666'
};

const providerIcons = {
  aws_s3: '🪣',
  google_cloud: '☁️',
  azure_blob: '🔷',
  dropbox: '📦',
  onedrive: '☁️',
  box: '📦',
  custom: '🔧'
};

export default function CloudStorageManager() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [providers, setProviders] = React.useState<any[]>([]);
  const [cloudFiles, setCloudFiles] = React.useState<any[]>([]);
  const [syncOperations, setSyncOperations] = React.useState<any[]>([]);
  const [conflicts, setConflicts] = React.useState<any[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Dialog states
  const [openProviderDialog, setOpenProviderDialog] = React.useState(false);
  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [openBackupDialog, setOpenBackupDialog] = React.useState(false);
  const [openConflictDialog, setOpenConflictDialog] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<any>(null);
  const [selectedFile, setSelectedFile] = React.useState<any>(null);
  const [selectedConflict, setSelectedConflict] = React.useState<any>(null);
  
  // Form states
  const [providerForm, setProviderForm] = React.useState({
    type: 'aws_s3',
    name: '',
    config: {
      apiKey: '',
      secretKey: '',
      region: 'us-east-1',
      bucket: '',
      endpoint: '',
      authMethod: 'api_key',
      syncSettings: {
        autoSync: true,
        syncInterval: 30,
        bidirectional: true,
        conflictResolution: 'timestamp'
      }
    }
  });

  const [uploadForm, setUploadForm] = React.useState({
    providerId: '',
    path: '/',
    encrypt: true,
    public: false,
    metadata: {
      category: 'general',
      tags: ''
    }
  });

  React.useEffect(() => {
    loadCloudStorageData();
    
    // Set up event listeners
    cloudStorageService.on('provider_added', handleProviderAdded);
    cloudStorageService.on('file_uploaded', handleFileUploaded);
    cloudStorageService.on('sync_completed', handleSyncCompleted);
    cloudStorageService.on('conflict_detected', handleConflictDetected);

    return () => {
      cloudStorageService.off('provider_added', handleProviderAdded);
      cloudStorageService.off('file_uploaded', handleFileUploaded);
      cloudStorageService.off('sync_completed', handleSyncCompleted);
      cloudStorageService.off('conflict_detected', handleConflictDetected);
    };
  }, []);

  const loadCloudStorageData = async () => {
    setLoading(true);
    try {
      // Load mock data for demonstration
      const mockProviders = [
        {
          id: 'aws_s3_1',
          name: 'AWS S3 - Main Storage',
          type: 'aws_s3',
          status: 'connected',
          totalStorage: 1099511627776, // 1TB
          usedStorage: 549755813888, // 512GB
          isDefault: true,
          lastSync: '2024-01-18T14:30:00Z',
          filesCount: 1250
        },
        {
          id: 'google_cloud_1',
          name: 'Google Cloud - Backup',
          type: 'google_cloud',
          status: 'connected',
          totalStorage: 2199023255552, // 2TB
          usedStorage: 219902325555, // 200GB
          isDefault: false,
          lastSync: '2024-01-18T13:45:00Z',
          filesCount: 345
        },
        {
          id: 'dropbox_1',
          name: 'Dropbox - Documents',
          type: 'dropbox',
          status: 'connected',
          totalStorage: 107374182400, // 100GB
          usedStorage: 32212254720, // 30GB
          isDefault: false,
          lastSync: '2024-01-18T12:00:00Z',
          filesCount: 890
        }
      ];
      setProviders(mockProviders);

      const mockFiles = [
        {
          id: 'file_1',
          name: 'Property_Lease_Agreement_2024.pdf',
          size: 2048576,
          provider: 'aws_s3_1',
          syncStatus: 'synced',
          lastModified: '2024-01-18T10:30:00Z',
          metadata: { category: 'legal', isPublic: false },
          versions: 3
        },
        {
          id: 'file_2',
          name: 'Tenant_Application_Photos.zip',
          size: 15728640,
          provider: 'google_cloud_1',
          syncStatus: 'pending',
          lastModified: '2024-01-18T09:15:00Z',
          metadata: { category: 'documents', isPublic: false },
          versions: 1
        },
        {
          id: 'file_3',
          name: 'Monthly_Reports_January.xlsx',
          size: 1048576,
          provider: 'dropbox_1',
          syncStatus: 'conflict',
          lastModified: '2024-01-18T08:45:00Z',
          metadata: { category: 'reports', isPublic: true },
          versions: 2
        }
      ];
      setCloudFiles(mockFiles);

      const mockOperations = [
        {
          id: 'op_1',
          type: 'upload',
          fileName: 'Insurance_Documents.pdf',
          provider: 'aws_s3_1',
          status: 'in_progress',
          progress: 75,
          startedAt: '2024-01-18T14:20:00Z'
        },
        {
          id: 'op_2',
          type: 'download',
          fileName: 'Backup_Database.sql',
          provider: 'google_cloud_1',
          status: 'completed',
          progress: 100,
          startedAt: '2024-01-18T14:10:00Z'
        }
      ];
      setSyncOperations(mockOperations);

      const mockConflicts = [
        {
          id: 'conflict_1',
          fileName: 'Monthly_Reports_January.xlsx',
          provider: 'dropbox_1',
          conflictType: 'modification',
          detectedAt: '2024-01-18T08:45:00Z',
          localVersion: { lastModified: '2024-01-18T08:44:00Z', size: 1048576 },
          cloudVersion: { lastModified: '2024-01-18T08:45:30Z', size: 1058816 }
        }
      ];
      setConflicts(mockConflicts);

      const mockAnalytics = cloudStorageService.getAnalytics();
      setAnalytics(mockAnalytics);

    } catch (error) {
      console.error('Error loading cloud storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAdded = (provider: any) => {
    setProviders(prev => [...prev, provider]);
  };

  const handleFileUploaded = (file: any) => {
    setCloudFiles(prev => [...prev, file]);
  };

  const handleSyncCompleted = (operation: any) => {
    setSyncOperations(prev => prev.map(op => 
      op.id === operation.id ? operation : op
    ));
  };

  const handleConflictDetected = (conflict: any) => {
    setConflicts(prev => [...prev, conflict]);
  };

  const handleAddProvider = async () => {
    try {
      await cloudStorageService.addProvider(
        providerForm.type as any,
        providerForm.name,
        providerForm.config
      );
      setOpenProviderDialog(false);
      setProviderForm({
        type: 'aws_s3',
        name: '',
        config: {
          apiKey: '',
          secretKey: '',
          region: 'us-east-1',
          bucket: '',
          endpoint: '',
          authMethod: 'api_key',
          syncSettings: {
            autoSync: true,
            syncInterval: 30,
            bidirectional: true,
            conflictResolution: 'timestamp'
          }
        }
      });
      loadCloudStorageData();
    } catch (error) {
      console.error('Error adding provider:', error);
    }
  };

  const handleSyncAll = async () => {
    try {
      await cloudStorageService.syncAll();
      loadCloudStorageData();
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  const handleResolveConflict = async (resolution: string) => {
    if (!selectedConflict) return;
    
    try {
      await cloudStorageService.resolveConflict(
        selectedConflict.id,
        resolution as any,
        'current_user'
      );
      setConflicts(prev => prev.filter(c => c.id !== selectedConflict.id));
      setOpenConflictDialog(false);
      setSelectedConflict(null);
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'synced': case 'completed': return 'success';
      case 'pending': case 'in_progress': case 'configuring': return 'warning';
      case 'error': case 'failed': case 'conflict': return 'error';
      case 'disconnected': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Storage Overview */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Storage Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <CloudIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Storage</Typography>
                    <Typography variant="h4">
                      {formatBytes(providers.reduce((sum, p) => sum + p.totalStorage, 0))}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <StorageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Used Storage</Typography>
                    <Typography variant="h4">
                      {formatBytes(providers.reduce((sum, p) => sum + p.usedStorage, 0))}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <FileIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Files</Typography>
                    <Typography variant="h4">{cloudFiles.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <SyncProblemIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Conflicts</Typography>
                    <Typography variant="h4">{conflicts.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Storage Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Storage Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="usedStorage"
                  data={providers}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, usedStorage }) => `${name}: ${formatBytes(usedStorage)}`}
                >
                  {providers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatBytes(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Storage Utilization Trend */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Storage Utilization (30 Days)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.storageUtilization || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatBytes} />
                <RechartsTooltip formatter={(value) => formatBytes(value as number)} />
                <Area 
                  type="monotone" 
                  dataKey="totalSize" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Provider Status */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Connected Providers</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenProviderDialog(true)}
              >
                Add Provider
              </Button>
            </Stack>
            
            <Grid container spacing={2}>
              {providers.map((provider) => (
                <Grid item xs={12} md={6} lg={4} key={provider.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="h6">{providerIcons[provider.type as keyof typeof providerIcons]}</Typography>
                              <Typography variant="h6">{provider.name}</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {provider.type.toUpperCase().replace('_', ' ')}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip 
                              label={provider.status} 
                              size="small" 
                              color={getStatusColor(provider.status) as any}
                            />
                            {provider.isDefault && (
                              <Chip label="Default" size="small" color="primary" />
                            )}
                          </Stack>
                        </Stack>

                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Storage Usage
                            </Typography>
                            <Typography variant="body2">
                              {formatBytes(provider.usedStorage)} / {formatBytes(provider.totalStorage)}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(provider.usedStorage / provider.totalStorage) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">Files</Typography>
                            <Typography variant="h6">{provider.filesCount}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Last Sync</Typography>
                            <Typography variant="body2">
                              {formatDateTime(provider.lastSync)}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Sync Now" sx={uniformTooltipStyles}>
                            <IconButton size="small">
                              <SyncIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Settings" sx={uniformTooltipStyles}>
                            <IconButton size="small">
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Files" sx={uniformTooltipStyles}>
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Cloud Files</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CloudSyncIcon />}
              onClick={handleSyncAll}
            >
              Sync All
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setOpenUploadDialog(true)}
            >
              Upload File
            </Button>
          </Stack>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Modified</TableCell>
                    <TableCell>Versions</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cloudFiles.map((file) => {
                    const provider = providers.find(p => p.id === file.provider);
                    return (
                      <TableRow key={file.id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <FileIcon />
                            <Box>
                              <Typography variant="subtitle2">{file.name}</Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip 
                                  label={file.metadata.category} 
                                  size="small" 
                                  variant="outlined" 
                                />
                                {file.metadata.isPublic && (
                                  <Chip 
                                    label="Public" 
                                    size="small" 
                                    color="warning" 
                                    icon={<PublicIcon />}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2">{providerIcons[provider?.type as keyof typeof providerIcons]}</Typography>
                            <Typography variant="body2">{provider?.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatBytes(file.size)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={file.syncStatus} 
                            size="small" 
                            color={getStatusColor(file.syncStatus) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDateTime(file.lastModified)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{file.versions} version{file.versions !== 1 ? 's' : ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Download" sx={uniformTooltipStyles}>
                              <IconButton size="small">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share" sx={uniformTooltipStyles}>
                              <IconButton size="small">
                                <ShareIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Versions" sx={uniformTooltipStyles}>
                              <IconButton size="small">
                                <TimelineIcon />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small">
                              <MoreVertIcon />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSyncTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Sync Operations</Typography>
      </Grid>

      {/* Active Operations */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Active Operations</Typography>
            <Stack spacing={2}>
              {syncOperations.filter(op => op.status === 'in_progress').map((operation) => (
                <Paper key={operation.id} sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2">{operation.fileName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {operation.type} • {providers.find(p => p.id === operation.provider)?.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${operation.progress}%`} 
                        color="primary" 
                        size="small" 
                      />
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={operation.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Stack>
                </Paper>
              ))}
              
              {syncOperations.filter(op => op.status === 'in_progress').length === 0 && (
                <Alert severity="info">No active sync operations</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Sync Conflicts */}
      {conflicts.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Sync Conflicts ({conflicts.length})
              </Typography>
              <Stack spacing={2}>
                {conflicts.map((conflict) => (
                  <Alert 
                    key={conflict.id} 
                    severity="warning"
                    action={
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={() => {
                          setSelectedConflict(conflict);
                          setOpenConflictDialog(true);
                        }}
                      >
                        Resolve
                      </Button>
                    }
                  >
                    <Typography variant="subtitle2">{conflict.fileName}</Typography>
                    <Typography variant="body2">
                      Conflict detected: {conflict.conflictType} conflict in {providers.find(p => p.id === conflict.provider)?.name}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Recent Operations */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Recent Operations</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>File</TableCell>
                    <TableCell>Operation</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {syncOperations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{operation.fileName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.type} 
                          size="small" 
                          color={operation.type === 'upload' ? 'primary' : 'secondary'}
                          icon={operation.type === 'upload' ? <CloudUploadIcon /> : <CloudDownloadIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {providers.find(p => p.id === operation.provider)?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.status} 
                          size="small" 
                          color={getStatusColor(operation.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(operation.startedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LinearProgress
                            variant="determinate"
                            value={operation.progress}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {operation.progress}%
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAnalyticsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Storage Analytics</Typography>
      </Grid>

      {/* Cost Breakdown */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Monthly Cost Estimate</Typography>
            {analytics?.costEstimate && (
              <>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  ${analytics.costEstimate.monthly.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Yearly: ${analytics.costEstimate.yearly.toFixed(2)} (10% savings)
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1}>
                  {Object.entries(analytics.costEstimate.breakdown).map(([provider, cost]) => (
                    <Stack key={provider} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{provider}</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${(cost as number).toFixed(2)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Sync Operations Stats */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Sync Statistics</Typography>
            {analytics?.syncOperations && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main">
                      {analytics.syncOperations.today}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {analytics.syncOperations.thisWeek}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Week
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {analytics.syncOperations.thisMonth}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This Month
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {analytics.syncOperations.failed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Failed
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Storage Growth */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Storage Growth (30 Days)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.storageUtilization || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={formatBytes} />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip 
                  formatter={(value, name) => [
                    name === 'totalSize' ? formatBytes(value as number) : value,
                    name === 'totalSize' ? 'Storage Size' : 'Files Count'
                  ]}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalSize" 
                  stroke="#8884d8" 
                  name="Storage Size"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="filesCount" 
                  stroke="#82ca9d" 
                  name="Files Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Cloud Storage Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip icon={<CloudIcon />} label="Multi-Cloud" color="primary" />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCloudStorageData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setOpenBackupDialog(true)}
          >
            Backup Settings
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<AssessmentIcon />}
            label="Overview"
            iconPosition="start"
          />
          <Tab
            icon={<FileIcon />}
            label="Files"
            iconPosition="start"
          />
          <Tab
            icon={<SyncIcon />}
            label="Sync"
            iconPosition="start"
          />
          <Tab
            icon={<CostIcon />}
            label="Analytics"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderFilesTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderSyncTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {renderAnalyticsTab()}
      </TabPanel>

      {/* Add Provider Dialog */}
      <Dialog open={openProviderDialog} onClose={() => setOpenProviderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Cloud Storage Provider</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Provider Type</InputLabel>
              <Select
                value={providerForm.type}
                label="Provider Type"
                onChange={(e) => setProviderForm({ ...providerForm, type: e.target.value })}
              >
                <MenuItem value="aws_s3">Amazon S3</MenuItem>
                <MenuItem value="google_cloud">Google Cloud Storage</MenuItem>
                <MenuItem value="azure_blob">Azure Blob Storage</MenuItem>
                <MenuItem value="dropbox">Dropbox</MenuItem>
                <MenuItem value="onedrive">OneDrive</MenuItem>
                <MenuItem value="box">Box</MenuItem>
                <MenuItem value="custom">Custom Provider</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Provider Name"
              value={providerForm.name}
              onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
              placeholder="e.g., AWS S3 - Main Storage"
              required
            />

            {providerForm.type === 'aws_s3' && (
              <>
                <TextField
                  label="API Key"
                  value={providerForm.config.apiKey}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config, apiKey: e.target.value }
                  })}
                  type="password"
                />
                <TextField
                  label="Secret Key"
                  value={providerForm.config.secretKey}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config, secretKey: e.target.value }
                  })}
                  type="password"
                />
                <TextField
                  label="Region"
                  value={providerForm.config.region}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config, region: e.target.value }
                  })}
                />
                <TextField
                  label="Bucket Name"
                  value={providerForm.config.bucket}
                  onChange={(e) => setProviderForm({ 
                    ...providerForm, 
                    config: { ...providerForm.config, bucket: e.target.value }
                  })}
                />
              </>
            )}

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Sync Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={providerForm.config.syncSettings.autoSync}
                        onChange={(e) => setProviderForm({ 
                          ...providerForm, 
                          config: { 
                            ...providerForm.config, 
                            syncSettings: { 
                              ...providerForm.config.syncSettings, 
                              autoSync: e.target.checked 
                            }
                          }
                        })}
                      />
                    }
                    label="Enable Auto Sync"
                  />
                  
                  <TextField
                    label="Sync Interval (minutes)"
                    type="number"
                    value={providerForm.config.syncSettings.syncInterval}
                    onChange={(e) => setProviderForm({ 
                      ...providerForm, 
                      config: { 
                        ...providerForm.config, 
                        syncSettings: { 
                          ...providerForm.config.syncSettings, 
                          syncInterval: parseInt(e.target.value) 
                        }
                      }
                    })}
                    inputProps={{ min: 5, max: 1440 }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProviderDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddProvider}>
            Add Provider
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Resolution Dialog */}
      <Dialog open={openConflictDialog} onClose={() => setOpenConflictDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resolve Sync Conflict</DialogTitle>
        <DialogContent>
          {selectedConflict && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="warning">
                A sync conflict was detected for <strong>{selectedConflict.fileName}</strong>.
                Choose how to resolve this conflict:
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Local Version</Typography>
                      <Typography variant="body2">
                        Modified: {formatDateTime(selectedConflict.localVersion.lastModified)}
                      </Typography>
                      <Typography variant="body2">
                        Size: {formatBytes(selectedConflict.localVersion.size)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Cloud Version</Typography>
                      <Typography variant="body2">
                        Modified: {formatDateTime(selectedConflict.cloudVersion.lastModified)}
                      </Typography>
                      <Typography variant="body2">
                        Size: {formatBytes(selectedConflict.cloudVersion.size)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6">Resolution Options:</Typography>
              
              <RadioGroup>
                <FormControlLabel 
                  value="use_local" 
                  control={<Radio />} 
                  label="Use Local Version (overwrite cloud)" 
                />
                <FormControlLabel 
                  value="use_cloud" 
                  control={<Radio />} 
                  label="Use Cloud Version (overwrite local)" 
                />
                <FormControlLabel 
                  value="create_copy" 
                  control={<Radio />} 
                  label="Keep Both (create copy)" 
                />
                <FormControlLabel 
                  value="merge" 
                  control={<Radio />} 
                  label="Merge Versions (if possible)" 
                />
              </RadioGroup>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConflictDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleResolveConflict('use_local')}
          >
            Resolve Conflict
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
