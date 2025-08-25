import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Divider,
  Stack,
  Alert,
  Fab,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Add,
  FilterList,
  Sort,
  Comment,
  Visibility,
  Edit,
  Delete,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
  Lightbulb,
  BugReport,
  Speed,
  Integration,
  Palette,
  AutoAwesome,
  Assessment,
  PhoneAndroid
} from '@mui/icons-material';
import { suggestionService } from '../services/SuggestionService';
import {
  Suggestion,
  SuggestionCategory,
  SuggestionPriority,
  SuggestionStatus,
  VoteType,
  SuggestionFilters,
  CategoryLabels,
  PriorityLabels,
  StatusLabels
} from '../types/SuggestionTypes';
import { useAuth } from '../contexts/AuthContext';

const categoryIcons: Record<SuggestionCategory, React.ReactNode> = {
  [SuggestionCategory.FEATURE_REQUEST]: <Lightbulb />,
  [SuggestionCategory.BUG_FIX]: <BugReport />,
  [SuggestionCategory.IMPROVEMENT]: <TrendingUp />,
  [SuggestionCategory.INTEGRATION]: <Integration />,
  [SuggestionCategory.PERFORMANCE]: <Speed />,
  [SuggestionCategory.UI_UX]: <Palette />,
  [SuggestionCategory.AUTOMATION]: <AutoAwesome />,
  [SuggestionCategory.REPORTING]: <Assessment />,
  [SuggestionCategory.MOBILE]: <PhoneAndroid />,
  [SuggestionCategory.OTHER]: <Lightbulb />
};

const priorityColors: Record<SuggestionPriority, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [SuggestionPriority.LOW]: 'info',
  [SuggestionPriority.MEDIUM]: 'primary',
  [SuggestionPriority.HIGH]: 'warning',
  [SuggestionPriority.CRITICAL]: 'error'
};

const statusColors: Record<SuggestionStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
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

interface SuggestionBoxProps {
  onCreateNew?: () => void;
}

export default function SuggestionBox({ onCreateNew }: SuggestionBoxProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'date' | 'priority' | 'status'>('votes');
  const [sortAscending, setSortAscending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState<SuggestionFilters>({
    category: [],
    priority: [],
    status: [],
    searchText: ''
  });

  // Load suggestions
  const loadSuggestions = () => {
    try {
      setLoading(true);
      const allSuggestions = suggestionService.getSuggestionsSorted(sortBy, sortAscending);
      setSuggestions(allSuggestions);
      setError(null);
    } catch (err) {
      setError('Failed to load suggestions');
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    try {
      const filtered = suggestionService.filterSuggestions(filters);
      const sorted = filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'votes':
            comparison = a.voteCount - b.voteCount;
            break;
          case 'date':
            comparison = a.submittedAt.getTime() - b.submittedAt.getTime();
            break;
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                        (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sortAscending ? comparison : -comparison;
      });
      setFilteredSuggestions(sorted);
    } catch (err) {
      setError('Failed to filter suggestions');
      console.error('Error filtering suggestions:', err);
    }
  };

  // Handle voting
  const handleVote = async (suggestion: Suggestion, voteType: VoteType) => {
    if (!user) {
      setError('You must be logged in to vote');
      return;
    }

    try {
      const success = suggestionService.voteOnSuggestion(
        suggestion.id,
        user.id,
        user.name || user.email,
        voteType
      );

      if (success) {
        loadSuggestions();
        // If details are open, refresh the selected suggestion
        if (selectedSuggestion?.id === suggestion.id) {
          const updated = suggestionService.getSuggestionById(suggestion.id);
          if (updated) setSelectedSuggestion(updated);
        }
      } else {
        setError('Failed to record vote');
      }
    } catch (err) {
      setError('Failed to vote on suggestion');
      console.error('Error voting:', err);
    }
  };

  // Handle removing vote
  const handleRemoveVote = async (suggestion: Suggestion) => {
    if (!user) return;

    try {
      const success = suggestionService.removeUserVote(suggestion.id, user.id);
      if (success) {
        loadSuggestions();
        if (selectedSuggestion?.id === suggestion.id) {
          const updated = suggestionService.getSuggestionById(suggestion.id);
          if (updated) setSelectedSuggestion(updated);
        }
      }
    } catch (err) {
      setError('Failed to remove vote');
      console.error('Error removing vote:', err);
    }
  };

  // Get user's vote for a suggestion
  const getUserVote = (suggestion: Suggestion) => {
    if (!user) return null;
    return suggestionService.getUserVote(suggestion.id, user.id);
  };

  // Initialize component
  useEffect(() => {
    loadSuggestions();
  }, [sortBy, sortAscending]);

  useEffect(() => {
    applyFilters();
  }, [suggestions, filters]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(newSortBy);
      setSortAscending(false);
    }
  };

  const SuggestionCard = ({ suggestion }: { suggestion: Suggestion }) => {
    const userVote = getUserVote(suggestion);
    const hasUpvoted = userVote?.voteType === VoteType.UPVOTE;
    const hasDownvoted = userVote?.voteType === VoteType.DOWNVOTE;

    return (
      <Card sx={{ mb: 2, '&:hover': { elevation: 4 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                {suggestion.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {suggestion.description.length > 150 
                  ? `${suggestion.description.substring(0, 150)}...` 
                  : suggestion.description}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  icon={categoryIcons[suggestion.category]}
                  label={CategoryLabels[suggestion.category]}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={PriorityLabels[suggestion.priority]}
                  size="small"
                  color={priorityColors[suggestion.priority]}
                />
                <Chip
                  label={StatusLabels[suggestion.status]}
                  size="small"
                  color={statusColors[suggestion.status]}
                  variant="filled"
                />
              </Stack>

              {suggestion.tags.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                  {suggestion.tags.slice(0, 3).map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                  {suggestion.tags.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{suggestion.tags.length - 3} more
                    </Typography>
                  )}
                </Stack>
              )}

              <Typography variant="caption" color="text.secondary">
                By {suggestion.submittedByName} • {suggestion.submittedAt.toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2 }}>
              <Typography variant="h6" align="center">
                {suggestion.voteCount}
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center">
                votes
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<ThumbUp />}
                onClick={() => hasUpvoted ? handleRemoveVote(suggestion) : handleVote(suggestion, VoteType.UPVOTE)}
                color={hasUpvoted ? 'primary' : 'inherit'}
                variant={hasUpvoted ? 'contained' : 'outlined'}
              >
                {suggestion.upvotes}
              </Button>
              <Button
                size="small"
                startIcon={<ThumbDown />}
                onClick={() => hasDownvoted ? handleRemoveVote(suggestion) : handleVote(suggestion, VoteType.DOWNVOTE)}
                color={hasDownvoted ? 'error' : 'inherit'}
                variant={hasDownvoted ? 'contained' : 'outlined'}
              >
                {suggestion.downvotes}
              </Button>
            </Stack>

            <Button
              size="small"
              startIcon={<Visibility />}
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setDetailsOpen(true);
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const FilterDialog = () => (
    <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Filter Suggestions</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search in titles, descriptions, and tags..."
              value={filters.searchText || ''}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                value={filters.category || []}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as SuggestionCategory[] })}
                renderValue={(selected) => selected.length + ' selected'}
              >
                {Object.entries(CategoryLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                multiple
                value={filters.priority || []}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as SuggestionPriority[] })}
                renderValue={(selected) => selected.length + ' selected'}
              >
                {Object.entries(PriorityLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filters.status || []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as SuggestionStatus[] })}
                renderValue={(selected) => selected.length + ' selected'}
              >
                {Object.entries(StatusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setFilters({ category: [], priority: [], status: [], searchText: '' });
        }}>
          Clear All
        </Button>
        <Button onClick={() => setFiltersOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const SuggestionDetailsDialog = () => (
    <Dialog 
      open={detailsOpen} 
      onClose={() => setDetailsOpen(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      {selectedSuggestion && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {categoryIcons[selectedSuggestion.category]}
              {selectedSuggestion.title}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="body1">
                {selectedSuggestion.description}
              </Typography>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Category:</strong> {CategoryLabels[selectedSuggestion.category]}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Priority:</strong> {PriorityLabels[selectedSuggestion.priority]}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> {StatusLabels[selectedSuggestion.status]}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Submitted:</strong> {selectedSuggestion.submittedAt.toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {selectedSuggestion.tags.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedSuggestion.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}

              {selectedSuggestion.adminNotes && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Admin Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSuggestion.adminNotes}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Voting Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="h4" color="primary">
                      {selectedSuggestion.voteCount}
                    </Typography>
                    <Typography variant="caption">Total Score</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h4" color="success.main">
                      {selectedSuggestion.upvotes}
                    </Typography>
                    <Typography variant="caption">Upvotes</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h4" color="error.main">
                      {selectedSuggestion.downvotes}
                    </Typography>
                    <Typography variant="caption">Downvotes</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {user && (
                  <>
                    <Button
                      startIcon={<ThumbUp />}
                      onClick={() => {
                        const userVote = getUserVote(selectedSuggestion);
                        const hasUpvoted = userVote?.voteType === VoteType.UPVOTE;
                        hasUpvoted ? handleRemoveVote(selectedSuggestion) : handleVote(selectedSuggestion, VoteType.UPVOTE);
                      }}
                      color={getUserVote(selectedSuggestion)?.voteType === VoteType.UPVOTE ? 'primary' : 'inherit'}
                      variant={getUserVote(selectedSuggestion)?.voteType === VoteType.UPVOTE ? 'contained' : 'outlined'}
                    >
                      Upvote
                    </Button>
                    <Button
                      startIcon={<ThumbDown />}
                      onClick={() => {
                        const userVote = getUserVote(selectedSuggestion);
                        const hasDownvoted = userVote?.voteType === VoteType.DOWNVOTE;
                        hasDownvoted ? handleRemoveVote(selectedSuggestion) : handleVote(selectedSuggestion, VoteType.DOWNVOTE);
                      }}
                      color={getUserVote(selectedSuggestion)?.voteType === VoteType.DOWNVOTE ? 'error' : 'inherit'}
                      variant={getUserVote(selectedSuggestion)?.voteType === VoteType.DOWNVOTE ? 'contained' : 'outlined'}
                    >
                      Downvote
                    </Button>
                  </>
                )}
              </Box>
              <Button onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Suggestion Box
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FilterList />}
            onClick={() => setFiltersOpen(true)}
            variant="outlined"
          >
            Filter
          </Button>
          <Button
            startIcon={<Sort />}
            onClick={() => handleSortChange(sortBy)}
            variant="outlined"
          >
            Sort by {sortBy} {sortAscending ? '↑' : '↓'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredSuggestions.length} of {suggestions.length} suggestions
        </Typography>
      </Box>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 && !loading ? (
        <Alert severity="info">
          No suggestions found. {filters.searchText || filters.category?.length || filters.priority?.length || filters.status?.length 
            ? 'Try adjusting your filters.' 
            : 'Be the first to submit a suggestion!'}
        </Alert>
      ) : (
        filteredSuggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))
      )}

      {/* Floating Action Button */}
      {onCreateNew && (
        <Fab
          color="primary"
          aria-label="add suggestion"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={onCreateNew}
        >
          <Add />
        </Fab>
      )}

      {/* Dialogs */}
      <FilterDialog />
      <SuggestionDetailsDialog />
    </Box>
  );
}
