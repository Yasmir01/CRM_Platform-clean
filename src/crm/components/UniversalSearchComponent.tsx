import * as React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Slider,
  Tooltip,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import { enhancedSearchService } from '../services/EnhancedSearchService';
import { uniformTooltipStyles } from '../utils/formStyles';
import { useCrmData } from '../contexts/CrmDataContext';

interface UniversalSearchProps {
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  variant?: 'standard' | 'dialog';
  autoFocus?: boolean;
}

interface SearchFilters {
  entityTypes: string[];
  dateRange: {
    start: string;
    end: string;
  } | null;
  properties: string[];
  tags: string[];
  status: string[];
  customFilters: Record<string, any>;
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case 'property': return <HomeRoundedIcon />;
    case 'tenant': return <PersonRoundedIcon />;
    case 'prospect': return <GroupRoundedIcon />;
    case 'contact': return <PersonRoundedIcon />;
    case 'workorder': return <BuildRoundedIcon />;
    case 'document': return <DescriptionRoundedIcon />;
    case 'communication': return <EmailRoundedIcon />;
    case 'campaign': return <CampaignRoundedIcon />;
    case 'application': return <AssignmentRoundedIcon />;
    default: return <SearchRoundedIcon />;
  }
};

const getEntityColor = (type: string) => {
  switch (type) {
    case 'property': return 'primary';
    case 'tenant': return 'success';
    case 'prospect': return 'info';
    case 'contact': return 'secondary';
    case 'workorder': return 'warning';
    case 'document': return 'default';
    case 'communication': return 'info';
    case 'campaign': return 'secondary';
    case 'application': return 'primary';
    default: return 'default';
  }
};

export default function UniversalSearchComponent({
  onResultSelect,
  placeholder = "Search across all CRM data...",
  size = 'medium',
  fullWidth = true,
  variant = 'standard',
  autoFocus = false
}: UniversalSearchProps) {
  const { state } = useCrmData();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [popularSearches, setPopularSearches] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [showAdvancedDialog, setShowAdvancedDialog] = React.useState(false);
  const [savedSearches, setSavedSearches] = React.useState<any[]>([]);
  
  // Advanced search filters
  const [filters, setFilters] = React.useState<SearchFilters>({
    entityTypes: [],
    dateRange: null,
    properties: [],
    tags: [],
    status: [],
    customFilters: {}
  });

  // Search options
  const [searchOptions, setSearchOptions] = React.useState({
    fuzzy: true,
    exactMatch: false,
    limit: 50,
    sortBy: 'relevance' as 'relevance' | 'date' | 'title'
  });

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    // Load initial data
    setRecentSearches(enhancedSearchService.getRecentSearches());
    setPopularSearches(enhancedSearchService.getPopularSearches());
    loadSavedSearches();
  }, []);

  React.useEffect(() => {
    if (query.trim()) {
      // Debounce search
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        performSearch();
        getSuggestions();
      }, 300);
    } else {
      setResults([]);
      setSuggestions([]);
      setShowResults(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, filters, searchOptions]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchResults = enhancedSearchService.search(query, filters, searchOptions);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async () => {
    try {
      const suggestionResults = enhancedSearchService.getSuggestions(query, 8);
      setSuggestions(suggestionResults);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const handleAdvancedSearch = () => {
    const advancedQuery = {
      must: query.split(' ').filter(term => term.trim()),
      should: [],
      mustNot: [],
      filters,
      fuzzy: searchOptions.fuzzy
    };

    setIsLoading(true);
    try {
      const searchResults = enhancedSearchService.advancedSearch(advancedQuery);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Advanced search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: any) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setShowResults(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: any) => {
    setQuery(suggestion.text);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const saveCurrentSearch = () => {
    if (query.trim()) {
      const searchData = {
        id: Date.now().toString(),
        query,
        filters,
        options: searchOptions,
        timestamp: new Date().toISOString(),
        resultCount: results.length
      };

      const updated = [searchData, ...savedSearches.slice(0, 9)];
      setSavedSearches(updated);
      localStorage.setItem('saved_searches', JSON.stringify(updated));
    }
  };

  const loadSavedSearches = () => {
    try {
      const saved = localStorage.getItem('saved_searches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const applySavedSearch = (savedSearch: any) => {
    setQuery(savedSearch.query);
    setFilters(savedSearch.filters);
    setSearchOptions(savedSearch.options);
    setShowAdvancedDialog(false);
  };

  const clearFilters = () => {
    setFilters({
      entityTypes: [],
      dateRange: null,
      properties: [],
      tags: [],
      status: [],
      customFilters: {}
    });
  };

  const getActiveFilterCount = () => {
    return filters.entityTypes.length + 
           filters.properties.length + 
           filters.tags.length + 
           filters.status.length + 
           (filters.dateRange ? 1 : 0) + 
           Object.keys(filters.customFilters).length;
  };

  const renderSearchInput = () => (
    <TextField
      ref={searchInputRef}
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      autoFocus={autoFocus}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SearchRoundedIcon />
            )}
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Stack direction="row" spacing={1}>
              {getActiveFilterCount() > 0 && (
                <Badge badgeContent={getActiveFilterCount()} color="primary">
                  <Tooltip title="Active Filters" sx={uniformTooltipStyles}>
                    <IconButton size="small">
                      <FilterListRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Badge>
              )}
              <Tooltip title="Advanced Search" sx={uniformTooltipStyles}>
                <IconButton 
                  size="small" 
                  onClick={() => setShowAdvancedDialog(true)}
                >
                  <TuneRoundedIcon />
                </IconButton>
              </Tooltip>
              {query && (
                <Tooltip title="Clear Search" sx={uniformTooltipStyles}>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setQuery('');
                      setShowResults(false);
                    }}
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </InputAdornment>
        )
      }}
      onFocus={() => {
        if (query.trim() && results.length > 0) {
          setShowResults(true);
        }
      }}
    />
  );

  const renderResults = () => (
    <Paper 
      elevation={8} 
      sx={{ 
        mt: 1, 
        maxHeight: 400, 
        overflow: 'auto',
        position: 'absolute',
        zIndex: 1300,
        width: '100%'
      }}
    >
      {/* Quick suggestions */}
      {query.length > 0 && suggestions.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
            Suggestions
          </Typography>
          <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }} flexWrap="wrap" gap={1}>
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion.text}
                size="small"
                variant="outlined"
                clickable
                onClick={() => handleSuggestionClick(suggestion)}
                icon={suggestion.type === 'entity' ? getEntityIcon(suggestion.type) : <SearchRoundedIcon />}
              />
            ))}
          </Stack>
          <Divider />
        </>
      )}

      {/* Search results */}
      {results.length > 0 ? (
        <>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
            Results ({results.length})
          </Typography>
          <List sx={{ pt: 0 }}>
            {results.slice(0, 10).map((result, index) => (
              <ListItemButton
                key={index}
                onClick={() => handleResultClick(result)}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'action.hover' 
                  }
                }}
              >
                <ListItemIcon>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${getEntityColor(result.entity.type)}.main`,
                      width: 32,
                      height: 32
                    }}
                  >
                    {getEntityIcon(result.entity.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {result.entity.title}
                      </Typography>
                      <Chip 
                        label={result.entity.type} 
                        size="small" 
                        color={getEntityColor(result.entity.type) as any}
                        variant="outlined"
                      />
                      {result.score > 5 && (
                        <Chip 
                          label={`${Math.round(result.score * 10)}% match`} 
                          size="small" 
                          color="success"
                          variant="filled"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {result.entity.content.substring(0, 100)}...
                      </Typography>
                      {result.matchedFields.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" gap={0.5}>
                          {result.matchedFields.slice(0, 3).map((field, fieldIndex) => (
                            <Chip
                              key={fieldIndex}
                              label={field}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  }
                />
                <IconButton size="small">
                  <OpenInNewRoundedIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </>
      ) : query.trim() && !isLoading ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No results found for "{query}"
          </Typography>
          <Button 
            size="small" 
            startIcon={<TuneRoundedIcon />}
            onClick={() => setShowAdvancedDialog(true)}
            sx={{ mt: 1 }}
          >
            Try Advanced Search
          </Button>
        </Box>
      ) : null}

      {/* Recent searches when no query */}
      {!query.trim() && recentSearches.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
            <HistoryRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent Searches
          </Typography>
          <List sx={{ pt: 0 }}>
            {recentSearches.slice(0, 5).map((search, index) => (
              <ListItemButton
                key={index}
                onClick={() => handleRecentSearchClick(search)}
              >
                <ListItemIcon>
                  <HistoryRoundedIcon />
                </ListItemIcon>
                <ListItemText primary={search} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {/* Popular searches */}
      {!query.trim() && popularSearches.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2" sx={{ p: 2, pb: 1, color: 'text.secondary' }}>
            <TrendingUpRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Popular Searches
          </Typography>
          <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }} flexWrap="wrap" gap={1}>
            {popularSearches.slice(0, 6).map((search, index) => (
              <Chip
                key={index}
                label={`${search.query} (${search.count})`}
                size="small"
                variant="outlined"
                clickable
                onClick={() => handleRecentSearchClick(search.query)}
              />
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );

  const renderAdvancedSearchDialog = () => (
    <Dialog 
      open={showAdvancedDialog} 
      onClose={() => setShowAdvancedDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Advanced Search</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<BookmarkRoundedIcon />}
              onClick={saveCurrentSearch}
              disabled={!query.trim()}
            >
              Save Search
            </Button>
            <IconButton onClick={() => setShowAdvancedDialog(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Search Query */}
          <TextField
            label="Search Query"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search terms..."
          />

          {/* Entity Types Filter */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Entity Types {filters.entityTypes.length > 0 && `(${filters.entityTypes.length})`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {['property', 'tenant', 'prospect', 'contact', 'workorder', 'document', 'communication', 'campaign', 'application'].map((type) => (
                  <Grid item xs={6} sm={4} key={type}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.entityTypes.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.entityTypes, type]
                              : filters.entityTypes.filter(t => t !== type);
                            setFilters({ ...filters, entityTypes: newTypes });
                          }}
                        />
                      }
                      label={type.charAt(0).toUpperCase() + type.slice(1)}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Date Range Filter */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Date Range {filters.dateRange && '(Active)'}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: {
                        start: e.target.value,
                        end: filters.dateRange?.end || ''
                      }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      dateRange: {
                        start: filters.dateRange?.start || '',
                        end: e.target.value
                      }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Search Options */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Search Options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={searchOptions.fuzzy}
                      onChange={(e) => setSearchOptions({ ...searchOptions, fuzzy: e.target.checked })}
                    />
                  }
                  label="Fuzzy Search (find partial matches)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={searchOptions.exactMatch}
                      onChange={(e) => setSearchOptions({ ...searchOptions, exactMatch: e.target.checked })}
                    />
                  }
                  label="Exact Match Only"
                />
                <Box>
                  <Typography gutterBottom>Result Limit: {searchOptions.limit}</Typography>
                  <Slider
                    value={searchOptions.limit}
                    onChange={(_, value) => setSearchOptions({ ...searchOptions, limit: value as number })}
                    min={10}
                    max={200}
                    step={10}
                    marks={[
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                      { value: 200, label: '200' }
                    ]}
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={searchOptions.sortBy}
                    label="Sort By"
                    onChange={(e) => setSearchOptions({ ...searchOptions, sortBy: e.target.value as any })}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="date">Date Modified</MenuItem>
                    <MenuItem value="title">Title (A-Z)</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Saved Searches ({savedSearches.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {savedSearches.map((savedSearch, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent sx={{ py: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2">{savedSearch.query}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(savedSearch.timestamp).toLocaleDateString()} • {savedSearch.resultCount} results
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => applySavedSearch(savedSearch)}
                          >
                            Apply
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={clearFilters}>Clear Filters</Button>
        <Button onClick={() => setShowAdvancedDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleAdvancedSearch}>
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (variant === 'dialog') {
    return (
      <>
        {renderSearchInput()}
        {renderAdvancedSearchDialog()}
      </>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      {renderSearchInput()}
      {showResults && renderResults()}
      {renderAdvancedSearchDialog()}
    </Box>
  );
}
