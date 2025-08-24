import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Switch,
  FormControlLabel,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed" | "In Progress" | "Overdue";
  assignedTo?: string;
  attendees?: string[];
  location?: string;
  client?: string;
  property?: string;
  recurring?: boolean;
}

interface Conflict {
  id: string;
  type: "time_overlap" | "double_booking" | "location_conflict" | "resource_conflict" | "travel_time" | "availability";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  conflictingEvents: CalendarEvent[];
  suggestedResolutions: Resolution[];
  autoResolvable: boolean;
}

interface Resolution {
  id: string;
  type: "reschedule" | "relocate" | "reassign" | "split" | "cancel" | "buffer_time";
  title: string;
  description: string;
  suggestedDateTime?: Date;
  suggestedLocation?: string;
  suggestedAssignee?: string;
  impact: "minimal" | "moderate" | "significant";
  confidence: number;
}

interface ConflictDetectionProps {
  newEvent: Partial<CalendarEvent>;
  existingEvents: CalendarEvent[];
  onResolve: (conflicts: Conflict[], resolutions: Resolution[]) => void;
  onCancel: () => void;
  autoDetect?: boolean;
}

const ConflictDetection: React.FC<ConflictDetectionProps> = ({
  newEvent,
  existingEvents,
  onResolve,
  onCancel,
  autoDetect = true,
}) => {
  const theme = useTheme();
  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [selectedResolutions, setSelectedResolutions] = React.useState<Map<string, Resolution>>(new Map());
  const [open, setOpen] = React.useState(false);
  const [autoResolveEnabled, setAutoResolveEnabled] = React.useState(true);

  // Mock conflicts for demonstration
  const mockConflicts: Conflict[] = [
    {
      id: "conflict-1",
      type: "time_overlap",
      severity: "high",
      title: "Time Overlap Detected",
      description: "The new event overlaps with an existing appointment",
      conflictingEvents: [
        {
          id: "existing-1",
          title: "Client Meeting - Sarah Johnson",
          date: newEvent.date || "",
          time: "10:00",
          endTime: "11:00",
          type: "Meeting",
          priority: "High",
          status: "Pending",
          assignedTo: "John Smith",
          client: "Sarah Johnson",
          location: "Main Office"
        }
      ],
      suggestedResolutions: [
        {
          id: "res-1",
          type: "reschedule",
          title: "Reschedule to 11:30 AM",
          description: "Move the new event to 11:30 AM to avoid overlap",
          suggestedDateTime: new Date(new Date(newEvent.date || "").getTime() + 90 * 60 * 1000),
          impact: "minimal",
          confidence: 95
        },
        {
          id: "res-2",
          type: "reschedule",
          title: "Move to Tomorrow",
          description: "Schedule for tomorrow at the same time",
          suggestedDateTime: new Date(new Date(newEvent.date || "").getTime() + 24 * 60 * 60 * 1000),
          impact: "moderate",
          confidence: 85
        }
      ],
      autoResolvable: true
    },
    {
      id: "conflict-2",
      type: "travel_time",
      severity: "medium",
      title: "Insufficient Travel Time",
      description: "Not enough time to travel between locations",
      conflictingEvents: [
        {
          id: "existing-2",
          title: "Property Inspection - Downtown",
          date: newEvent.date || "",
          time: "09:00",
          endTime: "10:00",
          type: "Inspection",
          priority: "Medium",
          status: "Pending",
          location: "Downtown Office",
          assignedTo: "John Smith"
        }
      ],
      suggestedResolutions: [
        {
          id: "res-3",
          type: "buffer_time",
          title: "Add 30-minute buffer",
          description: "Reschedule to allow for travel time",
          suggestedDateTime: new Date(new Date(newEvent.date || "").getTime() + 30 * 60 * 1000),
          impact: "minimal",
          confidence: 90
        },
        {
          id: "res-4",
          type: "relocate",
          title: "Change to video call",
          description: "Convert to virtual meeting to eliminate travel",
          suggestedLocation: "Video Call",
          impact: "moderate",
          confidence: 80
        }
      ],
      autoResolvable: false
    }
  ];

  React.useEffect(() => {
    if (autoDetect && newEvent.date && newEvent.time) {
      detectConflicts();
    }
  }, [newEvent, existingEvents, autoDetect]);

  const detectConflicts = () => {
    // Simulate conflict detection
    const detectedConflicts = mockConflicts.filter(conflict => {
      // Simple simulation - show conflicts if the new event has time and date
      return newEvent.time && newEvent.date;
    });

    setConflicts(detectedConflicts);
    
    // Auto-select best resolutions
    const autoSelections = new Map<string, Resolution>();
    detectedConflicts.forEach(conflict => {
      if (conflict.autoResolvable && autoResolveEnabled) {
        const bestResolution = conflict.suggestedResolutions
          .sort((a, b) => b.confidence - a.confidence)[0];
        if (bestResolution) {
          autoSelections.set(conflict.id, bestResolution);
        }
      }
    });
    setSelectedResolutions(autoSelections);

    if (detectedConflicts.length > 0) {
      setOpen(true);
    }
  };

  const handleResolutionSelect = (conflictId: string, resolution: Resolution) => {
    setSelectedResolutions(prev => {
      const newMap = new Map(prev);
      newMap.set(conflictId, resolution);
      return newMap;
    });
  };

  const handleApplyResolutions = () => {
    const resolutionsArray = Array.from(selectedResolutions.values());
    onResolve(conflicts, resolutionsArray);
    setOpen(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <ErrorRoundedIcon sx={{ color: theme.palette.error.main }} />;
      case "medium":
        return <WarningRoundedIcon sx={{ color: theme.palette.warning.main }} />;
      case "low":
        return <NotificationsActiveRoundedIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return <WarningRoundedIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getImpactChipProps = (impact: string) => {
    switch (impact) {
      case "minimal":
        return { color: "success" as const, label: "Minimal Impact" };
      case "moderate":
        return { color: "warning" as const, label: "Moderate Impact" };
      case "significant":
        return { color: "error" as const, label: "Significant Impact" };
      default:
        return { color: "default" as const, label: impact };
    }
  };

  const getResolutionIcon = (type: string) => {
    switch (type) {
      case "reschedule":
        return <CalendarTodayRoundedIcon />;
      case "relocate":
        return <LocationOnRoundedIcon />;
      case "reassign":
        return <PersonRoundedIcon />;
      case "buffer_time":
        return <AccessTimeRoundedIcon />;
      case "split":
        return <SwapHorizRoundedIcon />;
      case "cancel":
        return <EventBusyRoundedIcon />;
      default:
        return <AutoFixHighRoundedIcon />;
    }
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          minHeight: '60vh',
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'warning.main' }}>
            <SmartToyRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">Smart Conflict Detection</Typography>
            <Typography variant="caption" color="text.secondary">
              {conflicts.length} potential conflict{conflicts.length !== 1 ? 's' : ''} detected
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Auto-resolve toggle */}
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Smart Auto-Resolution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatically select the best resolution based on AI analysis
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoResolveEnabled}
                      onChange={(e) => setAutoResolveEnabled(e.target.checked)}
                    />
                  }
                  label=""
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Conflicts List */}
          <Stack spacing={2}>
            {conflicts.map((conflict) => (
              <Card
                key={conflict.id}
                sx={{
                  border: `2px solid ${getSeverityColor(conflict.severity)}`,
                  bgcolor: alpha(getSeverityColor(conflict.severity), 0.05),
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Conflict Header */}
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Avatar sx={{ bgcolor: alpha(getSeverityColor(conflict.severity), 0.2) }}>
                        {getSeverityIcon(conflict.severity)}
                      </Avatar>
                      <Box flex={1}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {conflict.title}
                          </Typography>
                          <Chip
                            label={conflict.severity.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: getSeverityColor(conflict.severity),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                          {conflict.autoResolvable && (
                            <Chip
                              label="Auto-resolvable"
                              size="small"
                              color="success"
                              icon={<AutoFixHighRoundedIcon />}
                            />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {conflict.description}
                        </Typography>

                        {/* Conflicting Events */}
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Conflicting Events:
                          </Typography>
                          <Stack spacing={1}>
                            {conflict.conflictingEvents.map((event) => (
                              <Alert
                                key={event.id}
                                severity="warning"
                                size="small"
                                sx={{ py: 0 }}
                              >
                                <Typography variant="body2">
                                  <strong>{event.title}</strong> - {event.time}
                                  {event.endTime && ` to ${event.endTime}`}
                                  {event.location && ` at ${event.location}`}
                                </Typography>
                              </Alert>
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    </Stack>

                    <Divider />

                    {/* Resolution Options */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Suggested Resolutions:
                      </Typography>
                      <Stack spacing={2}>
                        {conflict.suggestedResolutions.map((resolution) => {
                          const isSelected = selectedResolutions.get(conflict.id)?.id === resolution.id;
                          const impactProps = getImpactChipProps(resolution.impact);

                          return (
                            <Card
                              key={resolution.id}
                              sx={{
                                cursor: 'pointer',
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: isSelected
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : 'background.paper',
                                borderColor: isSelected
                                  ? theme.palette.primary.main
                                  : theme.palette.divider,
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                }
                              }}
                              onClick={() => handleResolutionSelect(conflict.id, resolution)}
                            >
                              <CardContent sx={{ py: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar
                                    sx={{
                                      bgcolor: isSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.2),
                                      width: 32,
                                      height: 32
                                    }}
                                  >
                                    {getResolutionIcon(resolution.type)}
                                  </Avatar>
                                  <Box flex={1}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {resolution.title}
                                      </Typography>
                                      <Chip
                                        label={`${resolution.confidence}% confidence`}
                                        size="small"
                                        color={resolution.confidence >= 90 ? "success" : resolution.confidence >= 75 ? "warning" : "default"}
                                      />
                                      <Chip
                                        {...impactProps}
                                        size="small"
                                      />
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                      {resolution.description}
                                    </Typography>
                                    
                                    {/* Resolution Details */}
                                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                      {resolution.suggestedDateTime && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <CalendarTodayRoundedIcon fontSize="small" />
                                          <Typography variant="caption">
                                            {resolution.suggestedDateTime.toLocaleString()}
                                          </Typography>
                                        </Stack>
                                      )}
                                      {resolution.suggestedLocation && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <LocationOnRoundedIcon fontSize="small" />
                                          <Typography variant="caption">
                                            {resolution.suggestedLocation}
                                          </Typography>
                                        </Stack>
                                      )}
                                      {resolution.suggestedAssignee && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                          <PersonRoundedIcon fontSize="small" />
                                          <Typography variant="caption">
                                            {resolution.suggestedAssignee}
                                          </Typography>
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Box>
                                  {isSelected && (
                                    <CheckCircleRoundedIcon
                                      sx={{ color: 'primary.main' }}
                                    />
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Summary */}
          <Alert
            severity={conflicts.some(c => c.severity === 'high') ? 'error' : 'warning'}
            icon={<SmartToyRoundedIcon />}
          >
            <Typography variant="body2">
              <strong>AI Recommendation:</strong> {selectedResolutions.size > 0
                ? `Apply ${selectedResolutions.size} resolution${selectedResolutions.size !== 1 ? 's' : ''} to resolve conflicts with minimal impact.`
                : 'Select resolutions for each conflict to proceed with scheduling.'
              }
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel}>
          Cancel Scheduling
        </Button>
        <Button
          onClick={() => setOpen(false)}
        >
          Ignore Conflicts
        </Button>
        <Button
          variant="contained"
          disabled={selectedResolutions.size === 0}
          onClick={handleApplyResolutions}
          startIcon={<AutoFixHighRoundedIcon />}
        >
          Apply Resolutions ({selectedResolutions.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictDetection;
