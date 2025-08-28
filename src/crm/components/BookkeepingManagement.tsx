import * as React from "react";
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
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TestRoundedIcon from "@mui/icons-material/TestRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CloudSyncRoundedIcon from "@mui/icons-material/CloudSyncRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import { uniformTooltipStyles } from "../utils/formStyles";
import BookkeepingIntegrationDialog from "./BookkeepingIntegrationDialog";
import { 
  BookkeepingConnection, 
  SyncResult,
  bookkeepingIntegrationService 
} from "../services/BookkeepingIntegrationService";
import { PaymentService } from "../services/PaymentService";
import { TenantFinancialService } from "../services/TenantFinancialService";

interface ReconciliationRecord {
  id: string;
  type: 'payment' | 'invoice' | 'journal_entry';
  crmId: string;
  externalId?: string;
  amount: number;
  date: string;
  description: string;
  status: 'synced' | 'pending' | 'error' | 'manual_review';
  lastSync?: string;
  errorMessage?: string;
  provider: string;
}

interface SyncProgress {
  isRunning: boolean;
  connectionId: string;
  progress: number;
  currentRecord: string;
  totalRecords: number;
  processedRecords: number;
}

export default function BookkeepingManagement() {
  const [connections, setConnections] = React.useState<BookkeepingConnection[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [integrationDialogOpen, setIntegrationDialogOpen] = React.useState(false);
  const [editingConnection, setEditingConnection] = React.useState<BookkeepingConnection | null>(null);
  const [syncProgress, setSyncProgress] = React.useState<SyncProgress | null>(null);
  const [reconciliationRecords, setReconciliationRecords] = React.useState<ReconciliationRecord[]>([]);
  const [selectedConnection, setSelectedConnection] = React.useState<BookkeepingConnection | null>(null);
  const [reconciliationDialogOpen, setReconciliationDialogOpen] = React.useState(false);
  const [lastSyncResults, setLastSyncResults] = React.useState<Map<string, SyncResult>>(new Map());

  React.useEffect(() => {
    loadConnections();
    loadReconciliationRecords();
  }, []);

  const loadConnections = () => {
    const allConnections = bookkeepingIntegrationService.getConnections();
    setConnections(allConnections);
  };

  const loadReconciliationRecords = () => {
    // Simulate loading reconciliation records
    // In a real app, this would come from the backend
    const mockRecords: ReconciliationRecord[] = [
      {
        id: '1',
        type: 'payment',
        crmId: 'payment_001',
        externalId: 'xero_inv_123',
        amount: 1500,
        date: '2024-01-15',
        description: 'Rent Payment - January',
        status: 'synced',
        lastSync: '2024-01-15T10:30:00Z',
        provider: 'xero'
      },
      {
        id: '2',
        type: 'invoice',
        crmId: 'invoice_002',
        amount: 2200,
        date: '2024-01-16',
        description: 'Monthly Rent Invoice',
        status: 'pending',
        provider: 'quickbooks'
      },
      {
        id: '3',
        type: 'payment',
        crmId: 'payment_003',
        amount: 150,
        date: '2024-01-17',
        description: 'Late Fee Payment',
        status: 'error',
        errorMessage: 'Customer not found in QuickBooks',
        provider: 'quickbooks'
      }
    ];
    setReconciliationRecords(mockRecords);
  };

  const handleAddConnection = () => {
    setEditingConnection(null);
    setIntegrationDialogOpen(true);
  };

  const handleEditConnection = (connection: BookkeepingConnection) => {
    setEditingConnection(connection);
    setIntegrationDialogOpen(true);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (window.confirm('Are you sure you want to delete this connection? This action cannot be undone.')) {
      try {
        await bookkeepingIntegrationService.deleteConnection(connectionId);
        loadConnections();
      } catch (error) {
        console.error('Failed to delete connection:', error);
      }
    }
  };

  const handleTestConnection = async (connection: BookkeepingConnection) => {
    try {
      const result = await bookkeepingIntegrationService.testConnection(connection);
      alert(`Connection test ${result.success ? 'successful' : 'failed'}: ${result.message}`);
    } catch (error) {
      alert(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSyncData = async (connection: BookkeepingConnection) => {
    setSyncProgress({
      isRunning: true,
      connectionId: connection.id,
      progress: 0,
      currentRecord: 'Initializing...',
      totalRecords: 0,
      processedRecords: 0
    });

    try {
      // Get recent payments to sync
      const payments = await PaymentService.getRentPayments();
      const recentPayments = payments.filter(payment => 
        new Date(payment.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      );

      setSyncProgress(prev => prev ? {
        ...prev,
        totalRecords: recentPayments.length,
        currentRecord: 'Starting batch sync...'
      } : null);

      // Simulate progress updates
      for (let i = 0; i < recentPayments.length; i++) {
        const payment = recentPayments[i];
        
        setSyncProgress(prev => prev ? {
          ...prev,
          progress: ((i + 1) / recentPayments.length) * 100,
          currentRecord: `Syncing payment ${payment.id}...`,
          processedRecords: i + 1
        } : null);

        // Add delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Sync the payments
      const result = await bookkeepingIntegrationService.syncRentPaymentsBatch(connection.id, recentPayments);
      
      // Store the result
      setLastSyncResults(prev => new Map(prev).set(connection.id, result));

      // Update connection status
      const updatedConnection = await bookkeepingIntegrationService.updateConnection(connection.id, {
        lastSync: new Date().toISOString(),
        syncStatus: result.success ? 'active' : 'error',
        lastError: result.success ? undefined : result.errors[0]?.message
      });

      loadConnections();
      loadReconciliationRecords();

      alert(`Sync completed! Processed ${result.recordsProcessed} records, created ${result.recordsCreated}, errors: ${result.errors.length}`);

    } catch (error) {
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncProgress(null);
    }
  };

  const handleViewReconciliation = (connection: BookkeepingConnection) => {
    setSelectedConnection(connection);
    setReconciliationDialogOpen(true);
  };

  const getStatusColor = (status: BookkeepingConnection['syncStatus']) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'error': return 'error';
      case 'disconnected': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: BookkeepingConnection['syncStatus']) => {
    switch (status) {
      case 'active': return <CheckCircleRoundedIcon />;
      case 'paused': return <WarningRoundedIcon />;
      case 'error': return <ErrorRoundedIcon />;
      case 'disconnected': return <CloudSyncRoundedIcon />;
      default: return <CloudSyncRoundedIcon />;
    }
  };

  const getProviderIcon = (providerId: string) => {
    const iconMap: Record<string, string> = {
      'xero': '🔵',
      'quickbooks': '🟢',
      'sage': '🟡',
      'freshbooks': '🔴',
      'wave': '🌊',
      'zoho': '🟠',
      'buildium': '🏢',
      'appfolio': '🏠'
    };
    return iconMap[providerId] || '💼';
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.providerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || connection.syncStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeConnections = connections.filter(c => c.syncStatus === 'active').length;
  const totalSyncedRecords = Array.from(lastSyncResults.values()).reduce((sum, result) => sum + result.recordsCreated, 0);
  const pendingRecords = reconciliationRecords.filter(r => r.status === 'pending').length;
  const errorRecords = reconciliationRecords.filter(r => r.status === 'error').length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <AccountBalanceRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1">
              Bookkeeping Integrations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect and sync financial data with accounting software
            </Typography>
          </Box>
        </Stack>
        
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddConnection}
        >
          Add Integration
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Connections
                  </Typography>
                  <Typography variant="h4">{activeConnections}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <SyncRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Records Synced
                  </Typography>
                  <Typography variant="h4">{totalSyncedRecords}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last 30 days
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
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <AccessTimeRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Pending Sync
                  </Typography>
                  <Typography variant="h4">{pendingRecords}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <ErrorRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Sync Errors
                  </Typography>
                  <Typography variant="h4">{errorRecords}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sync Progress */}
      {syncProgress && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Stack spacing={1} sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">
                Syncing data for {connections.find(c => c.id === syncProgress.connectionId)?.providerId}...
              </Typography>
              <Typography variant="caption">
                {syncProgress.processedRecords} / {syncProgress.totalRecords}
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={syncProgress.progress} />
            <Typography variant="caption" color="text.secondary">
              {syncProgress.currentRecord}
            </Typography>
          </Stack>
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="disconnected">Disconnected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Connections List */}
      <Grid container spacing={2}>
        {filteredConnections.map((connection) => {
          const provider = bookkeepingIntegrationService.getProvider(connection.providerId);
          const lastResult = lastSyncResults.get(connection.id);
          
          return (
            <Grid item xs={12} key={connection.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                          {getProviderIcon(connection.providerId)}
                        </Avatar>
                        
                        <Box>
                          <Typography variant="h6">{provider?.name || connection.providerId}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sync: {connection.configuration.syncFrequency.replace('_', ' ')} • 
                            Direction: {connection.configuration.syncDirection.replace(/_/g, ' ')}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          icon={getStatusIcon(connection.syncStatus)}
                          label={connection.syncStatus}
                          color={getStatusColor(connection.syncStatus) as any}
                          size="small"
                        />
                        
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Test Connection" sx={uniformTooltipStyles}>
                            <IconButton
                              size="small"
                              onClick={() => handleTestConnection(connection)}
                            >
                              <TestRoundedIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Sync Now" sx={uniformTooltipStyles}>
                            <IconButton
                              size="small"
                              onClick={() => handleSyncData(connection)}
                              disabled={syncProgress?.connectionId === connection.id}
                            >
                              <SyncRoundedIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="View Reconciliation" sx={uniformTooltipStyles}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewReconciliation(connection)}
                            >
                              <CompareArrowsRoundedIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Edit" sx={uniformTooltipStyles}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditConnection(connection)}
                            >
                              <EditRoundedIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete" sx={uniformTooltipStyles}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteConnection(connection.id)}
                              color="error"
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Account Mappings
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {Object.entries(connection.configuration.accountMappings).map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Last Sync
                          </Typography>
                          <Typography variant="body2">
                            {connection.lastSync 
                              ? new Date(connection.lastSync).toLocaleString()
                              : 'Never'
                            }
                          </Typography>
                          
                          {lastResult && (
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={`${lastResult.recordsProcessed} processed`}
                                size="small"
                                color="info"
                              />
                              <Chip
                                label={`${lastResult.recordsCreated} created`}
                                size="small"
                                color="success"
                              />
                              {lastResult.errors.length > 0 && (
                                <Chip
                                  label={`${lastResult.errors.length} errors`}
                                  size="small"
                                  color="error"
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>

                    {connection.lastError && (
                      <Alert severity="error">
                        <Typography variant="body2">{connection.lastError}</Typography>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredConnections.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'grey.100', width: 64, height: 64 }}>
              <AccountBalanceRoundedIcon sx={{ fontSize: 32, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h6" color="text.secondary">
              No bookkeeping integrations found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect to accounting software to sync your financial data automatically.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddConnection}
            >
              Add First Integration
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Integration Dialog */}
      <BookkeepingIntegrationDialog
        open={integrationDialogOpen}
        onClose={() => setIntegrationDialogOpen(false)}
        editingConnection={editingConnection}
        onConnectionCreated={() => {
          loadConnections();
          setIntegrationDialogOpen(false);
        }}
        onConnectionUpdated={() => {
          loadConnections();
          setIntegrationDialogOpen(false);
        }}
      />

      {/* Reconciliation Dialog */}
      <Dialog
        open={reconciliationDialogOpen}
        onClose={() => setReconciliationDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CompareArrowsRoundedIcon />
            <Typography variant="h6">
              Reconciliation - {selectedConnection?.providerId}
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>CRM ID</TableCell>
                  <TableCell>External ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reconciliationRecords
                  .filter(record => record.provider === selectedConnection?.providerId)
                  .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Chip
                          icon={
                            record.type === 'payment' ? <MonetizationOnRoundedIcon /> : 
                            record.type === 'invoice' ? <ReceiptRoundedIcon /> : 
                            <AssessmentRoundedIcon />
                          }
                          label={record.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{record.crmId}</TableCell>
                      <TableCell>{record.externalId || 'Not synced'}</TableCell>
                      <TableCell>${record.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'synced' ? 'success' :
                            record.status === 'pending' ? 'warning' :
                            record.status === 'error' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {record.status === 'error' && (
                          <Tooltip title={record.errorMessage} sx={uniformTooltipStyles}>
                            <IconButton size="small">
                              <ErrorRoundedIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setReconciliationDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
