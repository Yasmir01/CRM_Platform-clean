import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Grid,
  Divider,
  Alert,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import dayjs, { Dayjs } from "dayjs";

// Import the components we created
import AISchedulingAssistant from "./AISchedulingAssistant";
import ConflictDetection from "./ConflictDetection";
import CalendarIntegrations from "./CalendarIntegrations";

interface CalendarEvent {
  id?: string;
  title: string;
  type: "Call" | "Email" | "SMS" | "Task" | "Appointment" | "Inspection" | "Meeting";
  date: string;
  time: string;
  endTime?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  client?: string;
  property?: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed" | "In Progress" | "Overdue";
  recurring?: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
  reminder?: boolean;
  reminderMinutes?: number;
  attachments?: File[];
  videoCallLink?: string;
  notes?: string;
  assignedTo?: string;
  tags?: string[];
  estimatedDuration?: number;
  syncToExternalCalendars?: boolean;
}

interface EnhancedEventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  existingEvents?: CalendarEvent[];
  initialData?: Partial<CalendarEvent>;
  selectedDate?: Date;
  editMode?: boolean;
}

const EnhancedEventForm: React.FC<EnhancedEventFormProps> = ({
  open,
  onClose,
  onSave,
  existingEvents = [],
  initialData,
  selectedDate,
  editMode = false,
}) => {
  const theme = useTheme();
  
  // Form state
  const [formData, setFormData] = React.useState<Partial<CalendarEvent>>({
    title: "",
    type: "Appointment",
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('HH:mm'),
    priority: "Medium",
    status: "Pending",
    recurring: false,
    reminder: true,
    reminderMinutes: 15,
    estimatedDuration: 60,
    syncToExternalCalendars: true,
    attendees: [],
    tags: [],
    ...initialData,
  });

  // Dialog states
  const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);
  const [showConflictDetection, setShowConflictDetection] = React.useState(false);
  const [smartSuggestionsEnabled, setSmartSuggestionsEnabled] = React.useState(true);

  // Form validation
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Options
  const eventTypes = [
    { value: "Call", icon: <PhoneRoundedIcon />, label: "Phone Call" },
    { value: "Email", icon: <EmailRoundedIcon />, label: "Email Follow-up" },
    { value: "Task", icon: <TaskRoundedIcon />, label: "Task" },
    { value: "Appointment", icon: <EventRoundedIcon />, label: "Appointment" },
    { value: "Inspection", icon: <LocationOnRoundedIcon />, label: "Property Inspection" },
    { value: "Meeting", icon: <GroupRoundedIcon />, label: "Meeting" },
  ];

  const priorityOptions = [
    { value: "Low", color: theme.palette.info.main, label: "Low Priority" },
    { value: "Medium", color: theme.palette.warning.main, label: "Medium Priority" },
    { value: "High", color: theme.palette.error.main, label: "High Priority" },
  ];

  const reminderOptions = [
    { value: 5, label: "5 minutes before" },
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 1440, label: "1 day before" },
  ];

  const teamMembers = [
    "John Smith",
    "Emily Davis", 
    "Mike Wilson",
    "Lisa Rodriguez",
    "David Chen"
  ];

  const clients = [
    "Sarah Johnson",
    "Robert Brown",
    "Jennifer Wilson",
    "Michael Davis",
    "Amanda Taylor"
  ];

  const properties = [
    "Ocean View Villa",
    "Downtown Loft",
    "Garden Heights",
    "Sunset Apartments",
    "Metro Plaza"
  ];

  const commonTags = [
    "Urgent", "Follow-up", "New Client", "Renewal", "Maintenance", 
    "Inspection", "Viewing", "Contract", "Payment", "Documentation"
  ];

  React.useEffect(() => {
    if (smartSuggestionsEnabled && formData.type && formData.date) {
      // Simulate smart suggestions
      generateSmartSuggestions();
    }
  }, [formData.type, formData.client, formData.property, smartSuggestionsEnabled]);

  const generateSmartSuggestions = () => {
    // Simulate AI-powered suggestions based on context
    if (formData.type === "Inspection" && !formData.estimatedDuration) {
      setFormData(prev => ({ ...prev, estimatedDuration: 120 })); // 2 hours for inspections
    }
    if (formData.type === "Call" && !formData.estimatedDuration) {
      setFormData(prev => ({ ...prev, estimatedDuration: 30 })); // 30 minutes for calls
    }
    if (formData.client && !formData.title) {
      setFormData(prev => ({ 
        ...prev, 
        title: `${formData.type} with ${formData.client}` 
      }));
    }
  };

  const handleFieldChange = (field: keyof CalendarEvent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Check for conflicts if not in edit mode
    if (!editMode && formData.date && formData.time) {
      setShowConflictDetection(true);
      return;
    }

    // Save the event
    const eventToSave: CalendarEvent = {
      id: editMode ? initialData?.id : `event-${Date.now()}`,
      ...formData as CalendarEvent,
    };

    onSave(eventToSave);
    onClose();
  };

  const handleConflictResolve = (conflicts: any[], resolutions: any[]) => {
    // Apply resolutions to form data
    resolutions.forEach(resolution => {
      if (resolution.suggestedDateTime) {
        const newDate = new Date(resolution.suggestedDateTime);
        setFormData(prev => ({
          ...prev,
          date: newDate.toISOString().split('T')[0],
          time: newDate.toTimeString().slice(0, 5),
        }));
      }
      if (resolution.suggestedLocation) {
        setFormData(prev => ({ ...prev, location: resolution.suggestedLocation }));
      }
    });

    setShowConflictDetection(false);
    
    // Save after resolving conflicts
    const eventToSave: CalendarEvent = {
      id: editMode ? initialData?.id : `event-${Date.now()}`,
      ...formData as CalendarEvent,
    };

    onSave(eventToSave);
    onClose();
  };

  const handleAISchedule = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      date: suggestion.suggestedDate.toISOString().split('T')[0],
      time: suggestion.suggestedTime.slice(0, 5),
      type: suggestion.type,
      estimatedDuration: suggestion.duration,
      location: suggestion.location,
      attendees: suggestion.attendees,
    }));
    setAiAssistantOpen(false);
  };

  const getTypeIcon = (type: string) => {
    const typeOption = eventTypes.find(t => t.value === type);
    return typeOption?.icon || <EventRoundedIcon />;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {editMode ? <EventRoundedIcon /> : <CalendarTodayRoundedIcon />}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {editMode ? "Edit Event" : "Create New Event"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedDate && !editMode && `Scheduled for ${dayjs(selectedDate).format('MMMM D, YYYY')}`}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="AI Scheduling Assistant">
                <IconButton
                  size="small"
                  onClick={() => setAiAssistantOpen(true)}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                >
                  <SmartToyRoundedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Calendar Integrations">
                <IconButton
                  size="small"
                  onClick={() => setIntegrationsOpen(true)}
                  sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                >
                  <SyncRoundedIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={onClose} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pb: 0 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Smart Suggestions Toggle */}
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AutoAwesomeRoundedIcon sx={{ color: 'info.main' }} />
                    <Box>
                      <Typography variant="subtitle2">Smart Suggestions</Typography>
                      <Typography variant="caption" color="text.secondary">
                        AI-powered suggestions based on context
                      </Typography>
                    </Box>
                  </Stack>
                  <Switch
                    checked={smartSuggestionsEnabled}
                    onChange={(e) => setSmartSuggestionsEnabled(e.target.checked)}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={formData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="e.g., Client meeting with Sarah Johnson"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={formData.type || ""}
                    label="Event Type"
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                  >
                    {eventTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {type.icon}
                          <Typography>{type.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority || "Medium"}
                    label="Priority"
                    onChange={(e) => handleFieldChange("priority", e.target.value)}
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PriorityHighRoundedIcon sx={{ color: priority.color }} />
                          <Typography>{priority.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Date and Time */}
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                <CalendarTodayRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Date & Time
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <DatePicker
                    label="Date"
                    value={formData.date ? dayjs(formData.date) : null}
                    onChange={(date) => handleFieldChange("date", date?.format('YYYY-MM-DD'))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.date,
                        helperText: errors.date,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TimePicker
                    label="Start Time"
                    value={formData.time ? dayjs(`2000-01-01 ${formData.time}`) : null}
                    onChange={(time) => handleFieldChange("time", time?.format('HH:mm'))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.time,
                        helperText: errors.time,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TimePicker
                    label="End Time (Optional)"
                    value={formData.endTime ? dayjs(`2000-01-01 ${formData.endTime}`) : null}
                    onChange={(time) => handleFieldChange("endTime", time?.format('HH:mm'))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Duration Slider */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Estimated Duration: {formData.estimatedDuration} minutes
                </Typography>
                <Slider
                  value={formData.estimatedDuration || 60}
                  onChange={(_, value) => handleFieldChange("estimatedDuration", value)}
                  min={15}
                  max={480}
                  step={15}
                  marks={[
                    { value: 15, label: '15m' },
                    { value: 60, label: '1h' },
                    { value: 120, label: '2h' },
                    { value: 240, label: '4h' },
                    { value: 480, label: '8h' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Paper>

            {/* Details */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Add event details, agenda, or notes..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={clients}
                  value={formData.client || ""}
                  onChange={(_, value) => handleFieldChange("client", value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Client" placeholder="Select or type client name" />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={properties}
                  value={formData.property || ""}
                  onChange={(_, value) => handleFieldChange("property", value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Property" placeholder="Select or type property" />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location || ""}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                  placeholder="e.g., Main Office, Property Address, or Video Call"
                  InputProps={{
                    startAdornment: <LocationOnRoundedIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={teamMembers}
                  value={formData.attendees || []}
                  onChange={(_, value) => handleFieldChange("attendees", value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Attendees"
                      placeholder="Add team members or external attendees"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={commonTags}
                  value={formData.tags || []}
                  onChange={(_, value) => handleFieldChange("tags", value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        size="small"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags for better organization"
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Advanced Options */}
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Advanced Options
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.reminder || false}
                        onChange={(e) => handleFieldChange("reminder", e.target.checked)}
                      />
                    }
                    label="Set Reminder"
                  />
                  {formData.reminder && (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel>Reminder Time</InputLabel>
                      <Select
                        value={formData.reminderMinutes || 15}
                        label="Reminder Time"
                        onChange={(e) => handleFieldChange("reminderMinutes", e.target.value)}
                      >
                        {reminderOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.recurring || false}
                        onChange={(e) => handleFieldChange("recurring", e.target.checked)}
                      />
                    }
                    label="Recurring Event"
                  />
                  {formData.recurring && (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel>Repeat Pattern</InputLabel>
                      <Select
                        value={formData.recurringPattern || "weekly"}
                        label="Repeat Pattern"
                        onChange={(e) => handleFieldChange("recurringPattern", e.target.value)}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.syncToExternalCalendars !== false}
                        onChange={(e) => handleFieldChange("syncToExternalCalendars", e.target.checked)}
                      />
                    }
                    label="Sync to External Calendars (Google, Outlook, etc.)"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<SmartToyRoundedIcon />}
            onClick={() => setAiAssistantOpen(true)}
          >
            AI Assistant
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveRoundedIcon />}
          >
            {editMode ? "Update Event" : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Scheduling Assistant */}
      <AISchedulingAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onScheduleEvent={handleAISchedule}
        existingEvents={existingEvents}
        selectedDate={selectedDate}
      />

      {/* Calendar Integrations */}
      <CalendarIntegrations
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
      />

      {/* Conflict Detection */}
      {showConflictDetection && (
        <ConflictDetection
          newEvent={formData}
          existingEvents={existingEvents}
          onResolve={handleConflictResolve}
          onCancel={() => setShowConflictDetection(false)}
        />
      )}
    </>
  );
};

export default EnhancedEventForm;
