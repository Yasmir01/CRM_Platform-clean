import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Grid,
  Autocomplete,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Close,
  Lightbulb,
  BugReport,
  TrendingUp,
  IntegrationInstructions,
  Speed,
  Palette,
  AutoAwesome,
  Assessment,
  PhoneAndroid,
  HelpOutline
} from '@mui/icons-material';
import { suggestionService } from '../services/SuggestionService';
import {
  SuggestionCategory,
  SuggestionFormData,
  CategoryLabels
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

const categoryDescriptions: Record<SuggestionCategory, string> = {
  [SuggestionCategory.FEATURE_REQUEST]: 'New features or functionality you\'d like to see',
  [SuggestionCategory.BUG_FIX]: 'Issues or bugs that need to be fixed',
  [SuggestionCategory.IMPROVEMENT]: 'Enhancements to existing features',
  [SuggestionCategory.INTEGRATION]: 'Third-party integrations or API connections',
  [SuggestionCategory.PERFORMANCE]: 'Speed, efficiency, or performance improvements',
  [SuggestionCategory.UI_UX]: 'User interface or user experience improvements',
  [SuggestionCategory.AUTOMATION]: 'Workflow automation or smart features',
  [SuggestionCategory.REPORTING]: 'New reports, analytics, or data visualization',
  [SuggestionCategory.MOBILE]: 'Mobile app features or mobile responsiveness',
  [SuggestionCategory.OTHER]: 'Anything else that doesn\'t fit other categories'
};

const commonTags = [
  'urgent', 'quick-win', 'user-requested', 'efficiency', 'accessibility',
  'security', 'compliance', 'integration', 'mobile', 'desktop',
  'dashboard', 'reporting', 'communication', 'workflow', 'tenant-facing',
  'manager-facing', 'automation', 'ai', 'export', 'import'
];

interface SuggestionSubmissionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SuggestionSubmissionForm({ open, onClose, onSubmit }: SuggestionSubmissionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SuggestionFormData>({
    title: '',
    description: '',
    category: SuggestionCategory.FEATURE_REQUEST,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to submit suggestions');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const suggestion = suggestionService.createSuggestion(
        formData,
        user.id,
        user.name || user.email
      );

      if (suggestion) {
        setSuccess(true);
        setTimeout(() => {
          handleReset();
          onSubmit();
          onClose();
        }, 1500);
      } else {
        setError('Failed to submit suggestion. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while submitting your suggestion');
      console.error('Error submitting suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: SuggestionCategory.FEATURE_REQUEST,
      tags: []
    });
    setTagInput('');
    setError(null);
    setSuccess(false);
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      event.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const CategoryCard = ({ category }: { category: SuggestionCategory }) => (
    <Paper
      sx={{
        p: 2,
        cursor: 'pointer',
        border: formData.category === category ? 2 : 1,
        borderColor: formData.category === category ? 'primary.main' : 'divider',
        '&:hover': {
          borderColor: 'primary.main',
          elevation: 2
        }
      }}
      onClick={() => setFormData({ ...formData, category })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {categoryIcons[category]}
        <Typography variant="subtitle1" fontWeight="bold">
          {CategoryLabels[category]}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {categoryDescriptions[category]}
      </Typography>
    </Paper>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '70vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb color="primary" />
            Submit a Suggestion
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Success Message */}
          {success && (
            <Alert severity="success">
              <strong>Suggestion submitted successfully!</strong> Thank you for your feedback.
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Instructions */}
          <Alert severity="info" icon={<HelpOutline />}>
            Help us improve the CRM by sharing your ideas! Your suggestion will be visible to all users, 
            and they can vote on it to help us prioritize development.
          </Alert>

          {/* Title */}
          <TextField
            label="Suggestion Title"
            placeholder="Brief, descriptive title for your suggestion"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            helperText={`${formData.title.length}/100 characters (minimum 5)`}
            inputProps={{ maxLength: 100 }}
            error={formData.title.length > 0 && formData.title.length < 5}
          />

          {/* Description */}
          <TextField
            label="Description"
            placeholder="Provide detailed information about your suggestion. What problem does it solve? How would it work? What benefits would it provide?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={4}
            required
            helperText={`${formData.description.length}/1000 characters (minimum 20)`}
            inputProps={{ maxLength: 1000 }}
            error={formData.description.length > 0 && formData.description.length < 20}
          />

          {/* Category Selection */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Category *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose the category that best describes your suggestion:
            </Typography>
            <Grid container spacing={2}>
              {Object.values(SuggestionCategory).map((category) => (
                <Grid item xs={12} md={6} key={category}>
                  <CategoryCard category={category} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Tags */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Tags (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Add tags to help categorize your suggestion (up to 10 tags):
            </Typography>
            
            {/* Tag Input */}
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                freeSolo
                multiple
                options={commonTags}
                value={formData.tags}
                onChange={(_, newValue) => {
                  if (newValue.length <= 10) {
                    setFormData({ ...formData, tags: newValue });
                  }
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      onDelete={() => handleRemoveTag(option)}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={formData.tags.length === 0 ? "Type a tag and press Enter" : "Add more tags..."}
                    helperText={`${formData.tags.length}/10 tags`}
                  />
                )}
              />
            </Box>

            {/* Common Tags */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Common tags:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {commonTags.slice(0, 8).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant={formData.tags.includes(tag) ? "filled" : "outlined"}
                    onClick={() => {
                      if (formData.tags.includes(tag)) {
                        handleRemoveTag(tag);
                      } else {
                        handleAddTag(tag);
                      }
                    }}
                    disabled={!formData.tags.includes(tag) && formData.tags.length >= 10}
                  />
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Preview */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {formData.title || 'Your suggestion title will appear here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formData.description || 'Your suggestion description will appear here'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                <Chip
                  icon={categoryIcons[formData.category]}
                  label={CategoryLabels[formData.category]}
                  size="small"
                  color="primary"
                />
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            isSubmitting ||
            !formData.title.trim() ||
            formData.title.length < 5 ||
            !formData.description.trim() ||
            formData.description.length < 20 ||
            success
          }
          startIcon={success ? null : <Add />}
        >
          {isSubmitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Suggestion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
