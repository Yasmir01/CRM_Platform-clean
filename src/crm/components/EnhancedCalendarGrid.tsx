import * as React from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Stack,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Badge,
  Card,
  CardContent,
  SwipeableDrawer,
  useMediaQuery,
  Fab,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useSwipeable } from "react-swipeable";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import ViewWeekRoundedIcon from "@mui/icons-material/ViewWeekRounded";
import ViewDayRoundedIcon from "@mui/icons-material/ViewDayRounded";
import SwipeRoundedIcon from "@mui/icons-material/SwipeRounded";

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
}

interface EnhancedCalendarGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateSelect?: (date: Date) => void;
  events: CalendarEvent[];
  selectedDate?: Date | null;
  view?: "month" | "week" | "day";
  onViewChange?: (view: "month" | "week" | "day") => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date?: Date) => void;
}

const EnhancedCalendarGrid: React.FC<EnhancedCalendarGridProps> = ({
  currentDate,
  onDateChange,
  onDateSelect,
  events,
  selectedDate,
  view = "month",
  onViewChange,
  onEventClick,
  onAddEvent,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerEvents, setDrawerEvents] = React.useState<CalendarEvent[]>([]);
  const [drawerDate, setDrawerDate] = React.useState<Date | null>(null);
  
  // Touch/swipe handling for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateDate('next'),
    onSwipedRight: () => navigateDate('prev'),
    trackMouse: false,
    trackTouch: true,
  });

  // Get first day of the month and last day
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the first day of the week (Sunday = 0, Monday = 1, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Create array of all days to display
  const daysInMonth = lastDayOfMonth.getDate();
  const daysFromPrevMonth = firstDayOfWeek;
  const totalCells = isMobile ? 35 : 42; // 5 rows on mobile, 6 on desktop
  
  const days: Array<{
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    events: CalendarEvent[];
  }> = [];

  // Add days from previous month
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
      events: events.filter(event => new Date(event.date).toDateString() === date.toDateString())
    });
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
      events: events.filter(event => new Date(event.date).toDateString() === date.toDateString())
    });
  }

  // Add days from next month to fill the grid
  const remainingCells = totalCells - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
      events: events.filter(event => new Date(event.date).toDateString() === date.toDateString())
    });
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const handleDateClick = (date: Date, dayEvents: CalendarEvent[]) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
    
    // On mobile, show events in drawer
    if (isMobile && dayEvents.length > 0) {
      setDrawerEvents(dayEvents);
      setDrawerDate(date);
      setDrawerOpen(true);
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = isMobile 
    ? ["S", "M", "T", "W", "T", "F", "S"] // Short names for mobile
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getWeekEvents = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };

  const getDayEvents = () => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === currentDate.toDateString();
    });
  };

  const renderMonthView = () => (
    <Box {...(isMobile ? swipeHandlers : {})}>
      {/* Days of week header */}
      <Grid container sx={{ mb: 1 }}>
        {dayNames.map((day) => (
          <Grid item xs key={day}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                fontWeight: 600,
                color: 'text.secondary',
                py: isMobile ? 0.5 : 1,
                fontSize: isMobile ? '0.7rem' : '0.75rem'
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid */}
      <Grid container sx={{ minHeight: isMobile ? 250 : 300 }}>
        {days.map((dayInfo, index) => {
          const hasEvents = dayInfo.events.length > 0;
          const hasHighPriorityEvents = dayInfo.events.some(event => event.priority === 'High');
          const hasOverdueEvents = dayInfo.events.some(event => event.status === 'Overdue');

          return (
            <Grid item xs key={index}>
              <Box
                onClick={() => handleDateClick(dayInfo.date, dayInfo.events)}
                sx={{
                  position: 'relative',
                  height: isMobile ? 40 : 50,
                  cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: isMobile ? 0.5 : 1,
                  m: isMobile ? 0.125 : 0.25,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  pt: isMobile ? 0.25 : 0.5,
                  bgcolor: dayInfo.isSelected
                    ? alpha(theme.palette.primary.main, 0.1)
                    : dayInfo.isToday
                    ? alpha(theme.palette.primary.main, 0.05)
                    : (theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.03) : 'transparent'),
                  borderColor: dayInfo.isSelected
                    ? theme.palette.primary.main
                    : dayInfo.isToday
                    ? theme.palette.primary.main
                    : theme.palette.divider,
                  borderWidth: dayInfo.isSelected || dayInfo.isToday ? 2 : 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: theme.palette.primary.main,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: dayInfo.isToday ? 700 : dayInfo.isCurrentMonth ? 500 : 400,
                    color: dayInfo.isCurrentMonth
                      ? dayInfo.isToday
                        ? 'primary.main'
                        : 'text.primary'
                      : 'text.disabled',
                    fontSize: isMobile ? '0.7rem' : '0.75rem'
                  }}
                >
                  {dayInfo.date.getDate()}
                </Typography>

                {/* Event indicators */}
                {hasEvents && (
                  <Stack direction="row" spacing={isMobile ? 0.125 : 0.25} sx={{ mt: isMobile ? 0.125 : 0.25 }}>
                    {dayInfo.events.slice(0, isMobile ? 1 : 2).map((event, eventIndex) => (
                      <Box
                        key={eventIndex}
                        sx={{
                          width: isMobile ? 3 : 4,
                          height: isMobile ? 3 : 4,
                          borderRadius: '50%',
                          bgcolor: getEventPriorityColor(event.priority),
                        }}
                      />
                    ))}
                    {dayInfo.events.length > (isMobile ? 1 : 2) && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? '0.5rem' : '0.6rem',
                          color: 'text.secondary',
                          lineHeight: 1,
                        }}
                      >
                        +{dayInfo.events.length - (isMobile ? 1 : 2)}
                      </Typography>
                    )}
                  </Stack>
                )}

                {/* Priority badges */}
                {hasOverdueEvents && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: isMobile ? 4 : 6,
                      height: isMobile ? 4 : 6,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                    }}
                  />
                )}
                {hasHighPriorityEvents && !hasOverdueEvents && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: isMobile ? 4 : 6,
                      height: isMobile ? 4 : 6,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                    }}
                  />
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderWeekView = () => {
    const weekEvents = getWeekEvents();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <Box {...(isMobile ? swipeHandlers : {})}>
        <Grid container spacing={1}>
          {weekDays.map((date, index) => {
            const dayEvents = weekEvents.filter(event => 
              new Date(event.date).toDateString() === date.toDateString()
            );
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;

            return (
              <Grid item xs key={index}>
                <Card
                  sx={{
                    minHeight: isMobile ? 120 : 150,
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                    border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                    borderColor: isToday ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                  onClick={() => handleDateClick(date, dayEvents)}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography
                      variant="caption"
                      color={isToday ? 'primary.main' : 'text.secondary'}
                      sx={{ fontWeight: isToday ? 600 : 400 }}
                    >
                      {dayNames[index]} {date.getDate()}
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => (
                        <Chip
                          key={event.id}
                          label={event.title}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            bgcolor: alpha(getEventPriorityColor(event.priority), 0.2),
                            color: getEventPriorityColor(event.priority),
                            '& .MuiChip-label': {
                              px: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        />
                      ))}
                      {dayEvents.length > (isMobile ? 2 : 3) && (
                        <Typography variant="caption" color="text.secondary">
                          +{dayEvents.length - (isMobile ? 2 : 3)} more
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderDayView = () => {
    const dayEvents = getDayEvents();
    
    return (
      <Box {...(isMobile ? swipeHandlers : {})}>
        <Typography variant="h6" gutterBottom>
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </Typography>
        
        {dayEvents.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <EventRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No events for this day
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddRoundedIcon />}
              sx={{ mt: 2 }}
              onClick={() => onAddEvent?.(currentDate)}
            >
              Add Event
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {dayEvents.map((event) => (
              <Card
                key={event.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  }
                }}
                onClick={() => onEventClick?.(event)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: getEventPriorityColor(event.priority) }}>
                      {getEventTypeIcon(event.type)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {event.time}{event.endTime && ` - ${event.endTime}`}
                        </Typography>
                        <Chip label={event.type} size="small" />
                      </Stack>
                      {event.description && (
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                      )}
                      {(event.location || event.client) && (
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          {event.location && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <LocationOnRoundedIcon fontSize="small" />
                              <Typography variant="caption">{event.location}</Typography>
                            </Stack>
                          )}
                          {event.client && (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PersonRoundedIcon fontSize="small" />
                              <Typography variant="caption">{event.client}</Typography>
                            </Stack>
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <>
      <Paper
        sx={{
          p: isMobile ? 1 : 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : theme.palette.background.paper,
        }}
      >
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 600 }}>
            {view === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {view === 'week' && `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            {view === 'day' && monthNames[currentDate.getMonth()]}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Previous">
              <IconButton size="small" onClick={() => navigateDate('prev')}>
                <ArrowBackIosRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Today">
              <IconButton size="small" onClick={goToToday}>
                <TodayRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next">
              <IconButton size="small" onClick={() => navigateDate('next')}>
                <ArrowForwardIosRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* View Toggle (Mobile) */}
        {isMobile && onViewChange && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} justifyContent="center">
            <IconButton
              size="small"
              onClick={() => onViewChange('day')}
              sx={{ bgcolor: view === 'day' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
            >
              <ViewDayRoundedIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onViewChange('week')}
              sx={{ bgcolor: view === 'week' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
            >
              <ViewWeekRoundedIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onViewChange('month')}
              sx={{ bgcolor: view === 'month' ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
            >
              <ViewModuleRoundedIcon />
            </IconButton>
          </Stack>
        )}

        {/* Swipe hint for mobile */}
        {isMobile && (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
            <SwipeRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Swipe to navigate
            </Typography>
          </Stack>
        )}

        {/* Calendar Content */}
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}

        {/* Legend - Hidden on mobile */}
        {!isMobile && view === 'month' && (
          <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
              <Typography variant="caption" color="text.secondary">High Priority</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
              <Typography variant="caption" color="text.secondary">Medium Priority</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
              <Typography variant="caption" color="text.secondary">Low Priority</Typography>
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* Mobile Event Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '50vh',
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {drawerDate?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </Typography>
          <List>
            {drawerEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                <ListItem
                  button
                  onClick={() => {
                    onEventClick?.(event);
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemIcon>
                    {getEventTypeIcon(event.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={`${event.time}${event.endTime ? ` - ${event.endTime}` : ''}`}
                  />
                </ListItem>
                {index < drawerEvents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              onAddEvent?.(drawerDate);
              setDrawerOpen(false);
            }}
            sx={{ mt: 2 }}
          >
            Add Event for This Day
          </Button>
        </Box>
      </SwipeableDrawer>

      {/* Mobile FAB */}
      {isMobile && onAddEvent && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: theme.zIndex.fab,
          }}
          onClick={() => onAddEvent()}
        >
          <AddRoundedIcon />
        </Fab>
      )}
    </>
  );
};

export default EnhancedCalendarGrid;
