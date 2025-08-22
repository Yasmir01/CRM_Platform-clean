import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { ActivityEvent, ActivityFilter } from '../services/ActivityTrackingService';

interface ActivityTimelineProps {
  entityType: 'property' | 'tenant' | 'lease' | 'all';
  entityId?: string;
  entityName?: string;
  maxItems?: number;
  showFilters?: boolean;
  showExport?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  entityType,
  entityId,
  entityName,
  maxItems = 20,
  showFilters = true,
  showExport = true,
}) => {
  const { getEntityActivities, getActivities, generateAuditReport } = useActivityTracking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get activities based on entity type
  const rawActivities = entityType === 'all' 
    ? getActivities()
    : entityId 
      ? getEntityActivities(entityType, entityId)
      : [];

  // Apply filters
  const filteredActivities = rawActivities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userDisplayName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'all' || activity.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesAction = selectedAction === 'all' || activity.action === selectedAction;

    return matchesSearch && matchesSeverity && matchesCategory && matchesAction;
  }).slice(0, maxItems);

  const handleExpandItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleExport = () => {
    const filter: ActivityFilter = {};
    if (entityType !== 'all' && entityId) {
      filter.entityType = entityType;
      filter.entityId = entityId;
    }
    
    const report = generateAuditReport(filter);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-report-${entityName || entityType}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'high': return <WarningIcon color="warning" />;
      case 'medium': return <InfoIcon color="info" />;
      case 'low': return <CheckCircleIcon color="success" />;
      default: return <InfoIcon color="disabled" />;
    }
  };

  const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  if (filteredActivities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Timeline
            {entityName && ` - ${entityName}`}
          </Typography>
          <Alert severity="info">
            No activities found{searchTerm || selectedSeverity !== 'all' || selectedCategory !== 'all' ? ' matching your filters' : ''}.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Activity Timeline
            {entityName && ` - ${entityName}`}
          </Typography>
          <Stack direction="row" spacing={1}>
            {showFilters && (
              <Tooltip title="Toggle Filters">
                <IconButton
                  size="small"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  color={showFiltersPanel ? 'primary' : 'default'}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            )}
            {showExport && (
              <Tooltip title="Export Activities">
                <IconButton size="small" onClick={handleExport}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={refreshActivities}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Filters Panel */}
        <Collapse in={showFiltersPanel}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={selectedSeverity}
                  label="Severity"
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                  <MenuItem value="communication">Communication</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={selectedAction}
                  label="Action"
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="move">Move</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Collapse>

        {/* Timeline */}
        <Timeline>
          {filteredActivities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineSeparator>
                <TimelineDot color={getSeverityColor(activity.severity)}>
                  {getSeverityIcon(activity.severity)}
                </TimelineDot>
                {index < filteredActivities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Card variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {activity.description}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                          <Chip
                            label={activity.action.replace('_', ' ').toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={activity.category.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={activity.severity.toUpperCase()}
                            size="small"
                            color={getSeverityColor(activity.severity)}
                            variant="filled"
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(activity.timestamp)} • by {activity.userDisplayName}
                        </Typography>
                      </Box>
                      {activity.changes.length > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => handleExpandItem(activity.id)}
                        >
                          {expandedItems.has(activity.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Stack>

                    {/* Expanded Details */}
                    <Collapse in={expandedItems.has(activity.id)}>
                      <Divider sx={{ my: 1 }} />
                      <Box>
                        {activity.changes.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Changes:
                            </Typography>
                            <List dense>
                              {activity.changes.map((change, changeIndex) => (
                                <ListItem key={changeIndex} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2">
                                        <strong>{change.displayName}:</strong> {' '}
                                        <span style={{ textDecoration: 'line-through', color: 'gray' }}>
                                          {change.oldValue || 'None'}
                                        </span>
                                        {' → '}
                                        <span style={{ color: 'green' }}>
                                          {change.newValue || 'None'}
                                        </span>
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {activity.metadata && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Additional Details:
                            </Typography>
                            <List dense>
                              {activity.metadata.relatedEntityName && (
                                <ListItem sx={{ py: 0.25 }}>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2">
                                        Related: {activity.metadata.relatedEntityName}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              )}
                              {activity.metadata.notes && (
                                <ListItem sx={{ py: 0.25 }}>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2">
                                        Notes: {activity.metadata.notes}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              )}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        {filteredActivities.length === maxItems && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {maxItems} most recent activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
