import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface AISchedulingSuggestion {
  id: string;
  title: string;
  suggestedDate: Date;
  suggestedTime: string;
  duration: number;
  confidence: number;
  reason: string;
  conflicts?: string[];
  attendees?: string[];
  location?: string;
  type: "meeting" | "call" | "task" | "inspection" | "appointment";
}

interface AISchedulingAssistantProps {
  open: boolean;
  onClose: () => void;
  onScheduleEvent: (suggestion: AISchedulingSuggestion) => void;
  existingEvents?: any[];
  selectedDate?: Date;
}

const AISchedulingAssistant: React.FC<AISchedulingAssistantProps> = ({
  open,
  onClose,
  onScheduleEvent,
  existingEvents = [],
  selectedDate,
}) => {
  const theme = useTheme();
  const [prompt, setPrompt] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<AISchedulingSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<AISchedulingSuggestion | null>(null);

  const mockSuggestions: AISchedulingSuggestion[] = [
    {
      id: "1",
      title: "Property Inspection - Ocean View Villa",
      suggestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      suggestedTime: "10:00 AM",
      duration: 120,
      confidence: 95,
      reason: "Optimal time based on tenant availability and your schedule",
      type: "inspection",
      location: "456 Ocean Drive, Unit 3B",
      attendees: ["John Smith", "Property Manager"]
    },
    {
      id: "2",
      title: "Follow-up Call with Sarah Johnson",
      suggestedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      suggestedTime: "2:30 PM",
      duration: 30,
      confidence: 88,
      reason: "Best time based on client's previous availability patterns",
      type: "call",
      attendees: ["Sarah Johnson"]
    },
    {
      id: "3",
      title: "Team Meeting - Weekly Sync",
      suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      suggestedTime: "9:00 AM",
      duration: 60,
      confidence: 92,
      reason: "All team members available, minimal conflicts",
      type: "meeting",
      attendees: ["All Team Members"],
      conflicts: ["Mike has another meeting at 9:30 AM"]
    }
  ];

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Filter suggestions based on prompt keywords
      const filteredSuggestions = mockSuggestions.filter(suggestion =>
        prompt.toLowerCase().includes(suggestion.type) ||
        prompt.toLowerCase().includes("meeting") ||
        prompt.toLowerCase().includes("inspection") ||
        prompt.toLowerCase().includes("call") ||
        prompt.toLowerCase().includes("schedule")
      );

      setSuggestions(filteredSuggestions.length > 0 ? filteredSuggestions : mockSuggestions);
      setIsProcessing(false);
    }, 2000);
  };

  const handleScheduleSuggestion = (suggestion: AISchedulingSuggestion) => {
    onScheduleEvent(suggestion);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "inspection":
        return <LocationOnRoundedIcon />;
      case "call":
        return <PersonRoundedIcon />;
      case "meeting":
        return <GroupRoundedIcon />;
      case "appointment":
        return <CalendarTodayRoundedIcon />;
      default:
        return <EventAvailableRoundedIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "inspection":
        return theme.palette.info.main;
      case "call":
        return theme.palette.success.main;
      case "meeting":
        return theme.palette.primary.main;
      case "appointment":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const quickPrompts = [
    "Schedule a property inspection for this week",
    "Set up a tenant meeting for lease renewal",
    "Plan maintenance coordination call",
    "Arrange team weekly sync meeting",
    "Book client consultation appointment"
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          minHeight: '70vh',
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SmartToyRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">AI Scheduling Assistant</Typography>
              <Typography variant="caption" color="text.secondary">
                Smart suggestions powered by AI analysis
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <Stack spacing={3}>
          {/* Input Section */}
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                What would you like to schedule?
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="e.g., 'Schedule a property inspection for Ocean View Villa next week' or 'Set up a call with Sarah Johnson to discuss lease renewal'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isProcessing}
                />
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                  <Button
                    variant="contained"
                    onClick={handleSubmitPrompt}
                    disabled={!prompt.trim() || isProcessing}
                    startIcon={isProcessing ? <CircularProgress size={16} /> : <AutoAwesomeRoundedIcon />}
                  >
                    {isProcessing ? "Analyzing..." : "Get AI Suggestions"}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    AI will analyze your schedule and suggest optimal times
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          {!isProcessing && suggestions.length === 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Quick suggestions:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {quickPrompts.map((quickPrompt, index) => (
                  <Chip
                    key={index}
                    label={quickPrompt}
                    variant="outlined"
                    size="small"
                    clickable
                    onClick={() => setPrompt(quickPrompt)}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                AI Scheduling Suggestions
              </Typography>
              <Stack spacing={2}>
                {suggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                    onClick={() => setSelectedSuggestion(suggestion)}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        {/* Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                            <Avatar sx={{ bgcolor: getTypeColor(suggestion.type), width: 40, height: 40 }}>
                              {getTypeIcon(suggestion.type)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {suggestion.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {suggestion.reason}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack alignItems="flex-end" spacing={1}>
                            <Chip
                              label={`${suggestion.confidence}% confidence`}
                              size="small"
                              color={suggestion.confidence >= 90 ? "success" : suggestion.confidence >= 75 ? "warning" : "default"}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {suggestion.duration} minutes
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Time & Date */}
                        <Stack direction="row" spacing={3} alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayRoundedIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {suggestion.suggestedDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric"
                              })}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeRoundedIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {suggestion.suggestedTime}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Additional Details */}
                        <Stack spacing={1}>
                          {suggestion.attendees && suggestion.attendees.length > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <GroupRoundedIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {suggestion.attendees.join(", ")}
                              </Typography>
                            </Stack>
                          )}
                          {suggestion.location && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationOnRoundedIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {suggestion.location}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>

                        {/* Conflicts Warning */}
                        {suggestion.conflicts && suggestion.conflicts.length > 0 && (
                          <Alert severity="warning" size="small">
                            <Typography variant="body2">
                              <strong>Potential conflicts:</strong> {suggestion.conflicts.join(", ")}
                            </Typography>
                          </Alert>
                        )}

                        {/* Actions */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSuggestion(suggestion);
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CalendarTodayRoundedIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScheduleSuggestion(suggestion);
                            }}
                          >
                            Schedule Now
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}

          {/* Processing State */}
          {isProcessing && (
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  AI is analyzing your request...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Checking calendar availability, attendee schedules, and optimal timing
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeRoundedIcon />}
          onClick={() => {
            setPrompt("");
            setSuggestions([]);
          }}
          disabled={isProcessing}
        >
          New Request
        </Button>
      </DialogActions>

      {/* Suggestion Detail Dialog */}
      <Dialog
        open={selectedSuggestion !== null}
        onClose={() => setSelectedSuggestion(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSuggestion && (
          <>
            <DialogTitle>
              <Typography variant="h6">Scheduling Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="h6">{selectedSuggestion.title}</Typography>
                
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CalendarTodayRoundedIcon color="action" />
                    <Typography>
                      {selectedSuggestion.suggestedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AccessTimeRoundedIcon color="action" />
                    <Typography>
                      {selectedSuggestion.suggestedTime} ({selectedSuggestion.duration} minutes)
                    </Typography>
                  </Stack>

                  {selectedSuggestion.location && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <LocationOnRoundedIcon color="action" />
                      <Typography>{selectedSuggestion.location}</Typography>
                    </Stack>
                  )}

                  {selectedSuggestion.attendees && (
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <GroupRoundedIcon color="action" />
                      <Typography>{selectedSuggestion.attendees.join(", ")}</Typography>
                    </Stack>
                  )}
                </Stack>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>AI Reasoning:</strong> {selectedSuggestion.reason}
                  </Typography>
                </Alert>

                {selectedSuggestion.conflicts && selectedSuggestion.conflicts.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Potential Conflicts:</strong>
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedSuggestion.conflicts.map((conflict, index) => (
                        <li key={index}>
                          <Typography variant="body2">{conflict}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSuggestion(null)}>Back</Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleScheduleSuggestion(selectedSuggestion);
                  setSelectedSuggestion(null);
                }}
              >
                Schedule Event
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Dialog>
  );
};

export default AISchedulingAssistant;
