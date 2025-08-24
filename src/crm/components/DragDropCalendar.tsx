import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed" | "In Progress" | "Overdue";
  description?: string;
  location?: string;
  attendees?: string[];
  client?: string;
  property?: string;
  assignedTo?: string;
}

interface DragDropCalendarProps {
  events: CalendarEvent[];
  onEventMove: (eventId: string, newDate: string, newTime: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: "week" | "day";
}

const DragDropCalendar: React.FC<DragDropCalendarProps> = ({
  events,
  onEventMove,
  onEventClick,
  currentDate,
  onDateChange,
  view,
}) => {
  const theme = useTheme();
  const [draggedEvent, setDraggedEvent] = React.useState<CalendarEvent | null>(null);
  const [dragOverSlot, setDragOverSlot] = React.useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    event?: CalendarEvent;
    oldDateTime?: string;
    newDateTime?: string;
  }>({ open: false });

  // Generate time slots (24 hours in 30-minute intervals)
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  }, []);

  // Get days to display based on view
  const displayDays = React.useMemo(() => {
    if (view === 'day') {
      return [new Date(currentDate)];
    } else {
      // Week view
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
      });
    }
  }, [currentDate, view]);

  const getSlotId = (date: Date, time: string) => {
    return `${date.toISOString().split('T')[0]}_${time}`;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Call': return <PhoneRoundedIcon />;
      case 'Email': return <EmailRoundedIcon />;
      case 'Task': return <TaskRoundedIcon />;
      case 'Appointment': return <EventRoundedIcon />;
      case 'Inspection': return <LocationOnRoundedIcon />;
      case 'Meeting': return <EventRoundedIcon />;
      default: return <EventRoundedIcon />;
    }
  };

  const getEventPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (!draggedEvent) return;
    
    const newDate = date.toISOString().split('T')[0];
    const oldDateTime = `${draggedEvent.date} ${draggedEvent.time}`;
    const newDateTime = `${newDate} ${time}`;
    
    if (oldDateTime === newDateTime) {
      setDraggedEvent(null);
      return;
    }
    
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      event: draggedEvent,
      oldDateTime,
      newDateTime,
    });
  };

  const handleConfirmMove = () => {
    if (confirmDialog.event && confirmDialog.newDateTime) {
      const [newDate, newTime] = confirmDialog.newDateTime.split(' ');
      onEventMove(confirmDialog.event.id, newDate, newTime);
    }
    setConfirmDialog({ open: false });
    setDraggedEvent(null);
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getEventsForSlot = (date: Date, time: string) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (event.date !== dateString) return false;
      
      // Check if event overlaps with this time slot
      const eventStart = event.time;
      const eventEnd = event.endTime || event.time;
      
      return eventStart <= time && time < eventEnd;
    });
  };

  // Only show time slots during business hours for better UX
  const businessHours = timeSlots.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 6 && hour <= 22; // 6 AM to 10 PM
  });

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Drag & Drop Calendar - {view === 'day' ? 'Day View' : 'Week View'}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - (view === 'day' ? 1 : 7));
              onDateChange(newDate);
            }}
          >
            ←
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDateChange(new Date())}
          >
            <CalendarTodayRoundedIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + (view === 'day' ? 1 : 7));
              onDateChange(newDate);
            }}
          >
            →
          </IconButton>
        </Stack>
      </Stack>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Drag and drop events to reschedule them. Hold and drag any event to move it to a different time or date.
        </Typography>
      </Alert>

      {/* Calendar Grid */}
      <Card>
        <CardContent sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 600 }}>
            {/* Day Headers */}
            <Box sx={{ display: 'flex', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ width: 80, flexShrink: 0, p: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
              </Box>
              {displayDays.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      p: 1,
                      textAlign: 'center',
                      borderLeft: index > 0 ? `1px solid ${theme.palette.divider}` : 'none',
                      bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: isToday ? 600 : 400,
                        color: isToday ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {date.toLocaleDateString('en-US', {
                        weekday: view === 'week' ? 'short' : 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Time Slots */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {businessHours.map((time) => (
                <Box
                  key={time}
                  sx={{
                    display: 'flex',
                    minHeight: 60,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Time Label */}
                  <Box
                    sx={{
                      width: 80,
                      flexShrink: 0,
                      p: 1,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeDisplay(time)}
                    </Typography>
                  </Box>

                  {/* Day Slots */}
                  {displayDays.map((date, dayIndex) => {
                    const slotId = getSlotId(date, time);
                    const slotEvents = getEventsForSlot(date, time);
                    const isDragOver = dragOverSlot === slotId;

                    return (
                      <Box
                        key={dayIndex}
                        sx={{
                          flex: 1,
                          position: 'relative',
                          minHeight: 60,
                          borderLeft: dayIndex > 0 ? `1px solid ${theme.palette.divider}` : 'none',
                          bgcolor: isDragOver
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                          transition: 'background-color 0.2s ease',
                        }}
                        onDragOver={(e) => handleDragOver(e, slotId)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, date, time)}
                      >
                        {slotEvents.map((event, eventIndex) => {
                          const isDragging = draggedEvent?.id === event.id;
                          
                          return (
                            <Card
                              key={event.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                              onClick={() => onEventClick?.(event)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                left: 4 + (eventIndex * 8), // Offset overlapping events
                                right: 4,
                                zIndex: isDragging ? 1000 : 1 + eventIndex,
                                cursor: 'grab',
                                opacity: isDragging ? 0.5 : 1,
                                transform: isDragging ? 'rotate(5deg)' : 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow: theme.shadows[4],
                                },
                                '&:active': {
                                  cursor: 'grabbing',
                                },
                                border: `2px solid ${getEventPriorityColor(event.priority)}`,
                                bgcolor: alpha(getEventPriorityColor(event.priority), 0.1),
                              }}
                            >
                              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <DragIndicatorRoundedIcon
                                    sx={{ fontSize: 12, color: 'text.secondary' }}
                                  />
                                  {getEventTypeIcon(event.type)}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 600,
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {event.title}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <AccessTimeRoundedIcon sx={{ fontSize: 10 }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {formatTimeDisplay(event.time)}
                                        {event.endTime && ` - ${formatTimeDisplay(event.endTime)}`}
                                      </Typography>
                                    </Stack>
                                    {(event.client || event.location) && (
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        {event.client && (
                                          <>
                                            <PersonRoundedIcon sx={{ fontSize: 10 }} />
                                            <Typography variant="caption" color="text.secondary">
                                              {event.client}
                                            </Typography>
                                          </>
                                        )}
                                        {event.location && (
                                          <>
                                            <LocationOnRoundedIcon sx={{ fontSize: 10 }} />
                                            <Typography variant="caption" color="text.secondary">
                                              {event.location}
                                            </Typography>
                                          </>
                                        )}
                                      </Stack>
                                    )}
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}

                        {/* Drop zone indicator */}
                        {isDragOver && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              border: `2px dashed ${theme.palette.primary.main}`,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              zIndex: 999,
                            }}
                          >
                            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                              Drop here to reschedule
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <WarningRoundedIcon color="warning" />
            <Typography variant="h6">Confirm Event Move</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {confirmDialog.event && (
            <Stack spacing={2}>
              <Typography variant="body1">
                Are you sure you want to move this event?
              </Typography>
              
              <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {confirmDialog.event.title}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayRoundedIcon fontSize="small" />
                      <Typography variant="body2">
                        <strong>From:</strong> {new Date(confirmDialog.oldDateTime || '').toLocaleString()}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayRoundedIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="primary.main">
                        <strong>To:</strong> {new Date(confirmDialog.newDateTime || '').toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDialog({ open: false });
              setDraggedEvent(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmMove}
            startIcon={<CheckCircleRoundedIcon />}
          >
            Confirm Move
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DragDropCalendar;
