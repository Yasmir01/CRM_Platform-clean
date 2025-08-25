import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
  Toolbar,
  Tooltip,
  IconButton,
  Alert,
  Stack,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  Assignment,
  TrendingUp,
  GetApp,
  Refresh,
  EditNote,
  Analytics,
  FilterList,
  Sort
} from '@mui/icons-material';
import { suggestionService } from '../services/SuggestionService';
import {
  Suggestion,
  SuggestionStatus,
  SuggestionPriority,
  SuggestionStats,
  StatusLabels,
  PriorityLabels,
  CategoryLabels
} from '../types/SuggestionTypes';
import { useAuth } from '../contexts/AuthContext';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface SuggestionAdminPanelProps {
  onRefresh?: () => void;
}

export default function SuggestionAdminPanel({ onRefresh }: SuggestionAdminPanelProps) {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stats, setStats] = useState<SuggestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form states for editing
  const [editForm, setEditForm] = useState({
    status: SuggestionStatus.NEW,
    priority: SuggestionPriority.MEDIUM,
    adminNotes: '',
    implementationNotes: '',
    estimatedEffort: '',
    targetVersion: ''
  });

  // Bulk update form
  const [bulkForm, setBulkForm] = useState({
    status: SuggestionStatus.UNDER_REVIEW,
    priority: SuggestionPriority.MEDIUM
  });

  const loadData = () => {
    try {
      setLoading(true);
      const allSuggestions = suggestionService.getAllSuggestions();
      setSuggestions(allSuggestions);
      const suggestionStats = suggestionService.getSuggestionStats();
      setStats(suggestionStats);
      setError(null);
    } catch (err) {
      setError('Failed to load suggestions');
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSuggestions(suggestions.map(s => s.id));
    } else {
      setSelectedSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleEditSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setEditForm({
      status: suggestion.status,
      priority: suggestion.priority,
      adminNotes: suggestion.adminNotes || '',
      implementationNotes: suggestion.implementationNotes || '',
      estimatedEffort: suggestion.estimatedEffort || '',
      targetVersion: suggestion.targetVersion || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSuggestion || !user) return;

    try {
      const updated = suggestionService.updateSuggestion(
        selectedSuggestion.id,
        editForm,
        user.id
      );

      if (updated) {
        loadData();
        setEditDialogOpen(false);
        onRefresh?.();
      } else {
        setError('Failed to update suggestion');
      }
    } catch (err) {
      setError('Error updating suggestion');
      console.error('Error updating suggestion:', err);
    }
  };

  const handleBulkUpdate = () => {
    if (selectedSuggestions.length === 0 || !user) return;

    try {
      const success = suggestionService.bulkUpdateStatus(
        selectedSuggestions,
        bulkForm.status,
        user.id
      );

      if (success) {
        loadData();
        setBulkUpdateDialogOpen(false);
        setSelectedSuggestions([]);
        onRefresh?.();
      } else {
        setError('Failed to update suggestions');
      }
    } catch (err) {
      setError('Error performing bulk update');
      console.error('Error bulk updating:', err);
    }
  };

  const handleDeleteSuggestion = (suggestionId: string) => {
    try {
      const success = suggestionService.deleteSuggestion(suggestionId);
      
      if (success) {
        loadData();
        setDeleteConfirmOpen(false);
        onRefresh?.();
      } else {
        setError('Failed to delete suggestion');
      }
    } catch (err) {
      setError('Error deleting suggestion');
      console.error('Error deleting suggestion:', err);
    }
  };

  const handleExportSuggestions = () => {
    try {
      const csvData = suggestionService.exportSuggestions();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `suggestions_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export suggestions');
      console.error('Error exporting:', err);
    }
  };

  const getStatusColor = (status: SuggestionStatus) => {
    const colors: Record<SuggestionStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      [SuggestionStatus.NEW]: 'info',
      [SuggestionStatus.UNDER_REVIEW]: 'primary',
      [SuggestionStatus.PLANNED]: 'secondary',
      [SuggestionStatus.IN_DEVELOPMENT]: 'warning',
      [SuggestionStatus.TESTING]: 'primary',
      [SuggestionStatus.COMPLETED]: 'success',
      [SuggestionStatus.REJECTED]: 'error',
      [SuggestionStatus.DUPLICATE]: 'default',
      [SuggestionStatus.ON_HOLD]: 'warning'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: SuggestionPriority) => {
    const colors: Record<SuggestionPriority, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      [SuggestionPriority.LOW]: 'info',
      [SuggestionPriority.MEDIUM]: 'primary',
      [SuggestionPriority.HIGH]: 'warning',
      [SuggestionPriority.CRITICAL]: 'error'
    };
    return colors[priority];
  };

  // Statistics Cards Component
  const StatsCards = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Suggestions
            </Typography>
            <Typography variant="h4">
              {stats?.total || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              New Submissions
            </Typography>
            <Typography variant="h4">
              {stats?.byStatus[SuggestionStatus.NEW] || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              In Development
            </Typography>
            <Typography variant="h4">
              {stats?.byStatus[SuggestionStatus.IN_DEVELOPMENT] || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Completed
            </Typography>
            <Typography variant="h4">
              {stats?.byStatus[SuggestionStatus.COMPLETED] || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Suggestions Table Component
  const SuggestionsTable = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Suggestions Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<BulkUpdate />}
            onClick={() => setBulkUpdateDialogOpen(true)}
            disabled={selectedSuggestions.length === 0}
          >
            Bulk Update ({selectedSuggestions.length})
          </Button>
          <Button startIcon={<GetApp />} onClick={handleExportSuggestions}>
            Export
          </Button>
          <IconButton onClick={loadData}>
            <Refresh />
          </IconButton>
        </Stack>
      </Toolbar>

      {loading && <LinearProgress />}

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedSuggestions.length > 0 && selectedSuggestions.length < suggestions.length}
                  checked={suggestions.length > 0 && selectedSuggestions.length === suggestions.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Votes</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suggestions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((suggestion) => (
                <TableRow hover key={suggestion.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedSuggestions.includes(suggestion.id)}
                      onChange={() => handleSelectSuggestion(suggestion.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {suggestion.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {suggestion.description.length > 50 
                        ? `${suggestion.description.substring(0, 50)}...` 
                        : suggestion.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={CategoryLabels[suggestion.category]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={StatusLabels[suggestion.status]}
                      size="small"
                      color={getStatusColor(suggestion.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={PriorityLabels[suggestion.priority]}
                      size="small"
                      color={getPriorityColor(suggestion.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{suggestion.voteCount}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {suggestion.upvotes}↑ {suggestion.downvotes}↓
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{suggestion.submittedByName}</TableCell>
                  <TableCell>{suggestion.submittedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditSuggestion(suggestion)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={suggestions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Suggestion Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Manage Suggestions" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <StatsCards />
        <Alert severity="info">
          Use this admin panel to manage user suggestions, update statuses, set priorities, and track development progress.
        </Alert>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SuggestionsTable />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Alert severity="info">
          Advanced analytics dashboard coming soon - vote trends, user engagement metrics, category analysis, and more.
        </Alert>
      </TabPanel>

      {/* Edit Suggestion Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Suggestion</DialogTitle>
        <DialogContent>
          {selectedSuggestion && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedSuggestion.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSuggestion.description}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as SuggestionStatus })}
                  >
                    {Object.entries(StatusLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as SuggestionPriority })}
                  >
                    {Object.entries(PriorityLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Admin Notes"
                  multiline
                  rows={3}
                  fullWidth
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  placeholder="Internal notes about this suggestion..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Implementation Notes"
                  multiline
                  rows={2}
                  fullWidth
                  value={editForm.implementationNotes}
                  onChange={(e) => setEditForm({ ...editForm, implementationNotes: e.target.value })}
                  placeholder="Technical implementation details..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Estimated Effort"
                  fullWidth
                  value={editForm.estimatedEffort}
                  onChange={(e) => setEditForm({ ...editForm, estimatedEffort: e.target.value })}
                  placeholder="e.g., 2 weeks, 1 sprint"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Target Version"
                  fullWidth
                  value={editForm.targetVersion}
                  onChange={(e) => setEditForm({ ...editForm, targetVersion: e.target.value })}
                  placeholder="e.g., v2.1, Q3 2024"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialogOpen} onClose={() => setBulkUpdateDialogOpen(false)}>
        <DialogTitle>Bulk Update Suggestions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Updating {selectedSuggestions.length} suggestion(s):
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={bulkForm.status}
                  onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value as SuggestionStatus })}
                >
                  {Object.entries(StatusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained">Update All</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this suggestion? This action cannot be undone.
          </Typography>
          {selectedSuggestion && (
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
              "{selectedSuggestion.title}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedSuggestion && handleDeleteSuggestion(selectedSuggestion.id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
