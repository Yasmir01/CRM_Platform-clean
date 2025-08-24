import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  TextField,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Fab,
  useTheme,
  alpha,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import ViewWeekRoundedIcon from "@mui/icons-material/ViewWeekRounded";
import ViewDayRoundedIcon from "@mui/icons-material/ViewDayRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CalendarGrid from "../components/CalendarGrid";
import EnhancedCalendarGrid from "../components/EnhancedCalendarGrid";
import AISchedulingAssistant from "../components/AISchedulingAssistant";
import CalendarIntegrations from "../components/CalendarIntegrations";
import EnhancedEventForm from "../components/EnhancedEventForm";
import ConflictDetection from "../components/ConflictDetection";

type EventType = "Task" | "Call" | "Email" | "SMS" | "Appointment" | "Inspection" | "Meeting";
type CalendarView = "month" | "week" | "day";
type EventStatus = "Pending" | "Completed" | "In Progress" | "Overdue";
type EventPriority = "High" | "Medium" | "Low";

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  endTime?: string;
  description?: string;
  assignedTo?: string;
  status: EventStatus;
  priority: EventPriority;
  reminder?: boolean;
  recurring?: boolean;
  client?: string;
  property?: string;
  location?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Follow up call with Sarah Johnson",
    type: "Call",
    date: "2024-01-16",
    time: "10:00",
    endTime: "10:30",
    description: "Discuss lease renewal options and answer questions about new lease terms",
    assignedTo: "John Smith",
    status: "Pending",
    priority: "High",
    reminder: true,
    client: "Sarah Johnson",
    property: "Sunset Apartments",
  },
  {
    id: "2", 
    title: "Send rent reminder emails",
    type: "Email",
    date: "2024-01-16",
    time: "09:00",
    description: "Monthly rent reminders for all tenants due on the 1st",
    assignedTo: "Emily Davis",
    status: "Completed",
    priority: "Medium",
    recurring: true,
  },
  {
    id: "3",
    title: "Property inspection - Ocean View Villa",
    type: "Inspection",
    date: "2024-01-17",
    time: "14:00",
    endTime: "16:00",
    description: "Quarterly inspection including HVAC, plumbing, and general condition",
    assignedTo: "Mike Wilson",
    status: "Pending",
    priority: "Medium",
    property: "Ocean View Villa",
    location: "456 Ocean Drive, Unit 3B",
  },
  {
    id: "4",
    title: "New tenant application review",
    type: "Task",
    date: "2024-01-18",
    time: "11:00",
    description: "Review and process 3 new rental applications for Downtown Loft",
    assignedTo: "Lisa Rodriguez",
    status: "In Progress",
    priority: "High",
    property: "Downtown Loft",
  },
  {
    id: "5",
    title: "Maintenance coordination call",
    type: "Call",
    date: "2024-01-19",
    time: "13:00",
    endTime: "13:30",
    description: "Schedule HVAC repair with contractor for urgent request",
    assignedTo: "David Chen",
    status: "Pending",
    priority: "High",
    client: "Maintenance Team",
    property: "Garden Heights",
  },
  {
    id: "6",
    title: "Weekly team meeting",
    type: "Meeting",
    date: "2024-01-22",
    time: "09:00",
    endTime: "10:00",
    description: "Weekly sync on property management updates and new listings",
    assignedTo: "All Team",
    status: "Pending",
    priority: "Medium",
    recurring: true,
  },
  {
    id: "7",
    title: "Overdue rent follow-up",
    type: "Task",
    date: "2024-01-15", // Past date to show overdue
    time: "16:00",
    description: "Contact tenants with overdue rent payments and discuss payment plans",
    assignedTo: "John Smith",
    status: "Overdue",
    priority: "High",
  },
];

export default function Calendar() {
  const theme = useTheme();
  const [view, setView] = React.useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [events, setEvents] = React.useState<CalendarEvent[]>(mockEvents);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [enhancedFormOpen, setEnhancedFormOpen] = React.useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);
  const [useEnhancedCalendar, setUseEnhancedCalendar] = React.useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [filters, setFilters] = React.useState({
    type: "All",
    status: "All",
    priority: "All",
    assignedTo: "All"
  });
  const [searchTerm, setSearchTerm] = React.useState("");

  // Get events for the current view
  const getEventsForView = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // If a specific date is selected from the calendar grid, show only that date's events
    if (selectedDate) {
      startDate = new Date(selectedDate);
      endDate = new Date(selectedDate);
    } else {
      switch (view) {
        case "day":
          startDate = new Date(currentDate);
          endDate = new Date(currentDate);
          break;
        case "week":
          const startOfWeek = new Date(currentDate);
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          startDate = startOfWeek;
          endDate = endOfWeek;
          break;
        case "month":
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
      }
    }

    return events.filter(event => {
      const eventDate = new Date(event.date);
      const matchesDate = eventDate >= startDate && eventDate <= endDate;
      const matchesType = filters.type === "All" || event.type === filters.type;
      const matchesStatus = filters.status === "All" || event.status === filters.status;
      const matchesPriority = filters.priority === "All" || event.priority === filters.priority;
      const matchesAssignee = filters.assignedTo === "All" || event.assignedTo === filters.assignedTo;
      const matchesSearch = searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.property?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDate && matchesType && matchesStatus && matchesPriority && matchesAssignee && matchesSearch;
    });
  };

  const filteredEvents = getEventsForView();

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (view) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get the display title for current view
  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {};
    switch (view) {
      case "day":
        return currentDate.toLocaleDateString("en-US", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        });
      case "week":
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      case "month":
        return currentDate.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    }
  };

  // Get event type icon and color
  const getEventTypeDisplay = (type: EventType, priority: EventPriority) => {
    const getColor = () => {
      switch (priority) {
        case "High": return theme.palette.error.main;
        case "Medium": return theme.palette.warning.main;
        case "Low": return theme.palette.info.main;
        default: return theme.palette.text.secondary;
      }
    };

    const color = getColor();

    switch (type) {
      case "Call":
        return { icon: <PhoneRoundedIcon sx={{ color }} />, color };
      case "Email":
        return { icon: <EmailRoundedIcon sx={{ color }} />, color };
      case "SMS":
        return { icon: <SmsRoundedIcon sx={{ color }} />, color };
      case "Task":
        return { icon: <TaskRoundedIcon sx={{ color }} />, color };
      case "Appointment":
        return { icon: <EventRoundedIcon sx={{ color }} />, color };
      case "Inspection":
        return { icon: <SearchRoundedIcon sx={{ color }} />, color };
      case "Meeting":
        return { icon: <EventRoundedIcon sx={{ color }} />, color };
      default:
        return { icon: <CalendarTodayRoundedIcon sx={{ color }} />, color };
    }
  };

  // Get status chip props
  const getStatusChipProps = (status: EventStatus) => {
    switch (status) {
      case "Completed":
        return { 
          label: "Completed", 
          color: "success" as const, 
          icon: <CheckCircleRoundedIcon /> 
        };
      case "In Progress":
        return { 
          label: "In Progress", 
          color: "info" as const, 
          icon: <PendingRoundedIcon /> 
        };
      case "Overdue":
        return { 
          label: "Overdue", 
          color: "error" as const, 
          icon: <NotificationsActiveRoundedIcon /> 
        };
      default:
        return { 
          label: "Pending", 
          color: "default" as const, 
          icon: <PendingRoundedIcon /> 
        };
    }
  };

  // Render events based on view
  const renderEvents = () => {
    if (filteredEvents.length === 0) {
      return (
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? "Try adjusting your search or filters" : "Create your first event to get started"}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Box>
        {/* Header showing selected date if any */}
        {selectedDate && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Events for {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedDate(null)}
            >
              Show All Events
            </Button>
          </Stack>
        )}

        <Grid container spacing={2} sx={{ mt: selectedDate ? 0 : 1 }}>
        {filteredEvents.map((event) => {
          const { icon, color } = getEventTypeDisplay(event.type, event.priority);
          const statusProps = getStatusChipProps(event.status);
          const eventDate = new Date(event.date);
          const isToday = eventDate.toDateString() === new Date().toDateString();
          const isPast = eventDate < new Date() && !isToday;

          return (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card 
                sx={{ 
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isToday ? `2px solid ${theme.palette.primary.main}` : "1px solid",
                  borderColor: isToday ? "primary.main" : "divider",
                  bgcolor: isPast && event.status !== "Completed" ? alpha(theme.palette.error.main, 0.05) : "background.paper",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  }
                }}
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                        {icon}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {event.title}
                        </Typography>
                      </Stack>
                      <Chip size="small" {...statusProps} />
                    </Stack>

                    {/* Time and Date */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {eventDate.toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric",
                          ...(view === "month" ? {} : { weekday: "short" })
                        })}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                        {event.time}
                        {event.endTime && ` - ${event.endTime}`}
                      </Typography>
                      {event.reminder && (
                        <NotificationsActiveRoundedIcon 
                          sx={{ fontSize: 16, color: "warning.main" }} 
                        />
                      )}
                    </Stack>

                    {/* Description */}
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {event.description}
                      </Typography>
                    )}

                    {/* Additional Info */}
                    <Stack spacing={1}>
                      {event.assignedTo && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 20, height: 20, fontSize: 12 }}>
                            {event.assignedTo.split(" ").map(n => n[0]).join("")}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {event.assignedTo}
                          </Typography>
                        </Stack>
                      )}
                      {event.property && (
                        <Typography variant="caption" color="text.secondary">
                          📍 {event.property}
                        </Typography>
                      )}
                      {event.client && (
                        <Typography variant="caption" color="text.secondary">
                          👤 {event.client}
                        </Typography>
                      )}
                    </Stack>
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

  const eventTypes = ["All", "Task", "Call", "Email", "SMS", "Appointment", "Inspection", "Meeting"];
  const statuses = ["All", "Pending", "In Progress", "Completed", "Overdue"];
  const priorities = ["All", "High", "Medium", "Low"];
  const assignees = ["All", "John Smith", "Emily Davis", "Mike Wilson", "Lisa Rodriguez", "David Chen"];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Calendar & Tasks
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SmartToyRoundedIcon />}
            onClick={() => setAiAssistantOpen(true)}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            AI Assistant
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SyncRoundedIcon />}
            onClick={() => setIntegrationsOpen(true)}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Integrations
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setEnhancedFormOpen(true)}
          >
            Add Event
          </Button>
        </Stack>
      </Stack>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Navigation and View Controls */}
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2}>
              {/* Date Navigation */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={() => navigateDate("prev")}>
                  <ArrowBackRoundedIcon />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 200, textAlign: "center" }}>
                  {getViewTitle()}
                </Typography>
                <IconButton onClick={() => navigateDate("next")}>
                  <ArrowForwardRoundedIcon />
                </IconButton>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={goToToday}
                  startIcon={<TodayRoundedIcon />}
                >
                  Today
                </Button>
              </Stack>

              {/* View Toggle */}
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, newView) => newView && setView(newView)}
                size="small"
              >
                <ToggleButton value="day">
                  <ViewDayRoundedIcon sx={{ mr: 1 }} />
                  Day
                </ToggleButton>
                <ToggleButton value="week">
                  <ViewWeekRoundedIcon sx={{ mr: 1 }} />
                  Week
                </ToggleButton>
                <ToggleButton value="month">
                  <ViewModuleRoundedIcon sx={{ mr: 1 }} />
                  Month
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Search and Filters */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search events, clients, properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListRoundedIcon />}
                  onClick={() => setFilterDialogOpen(true)}
                  size="small"
                >
                  Filters
                </Button>
                <Tooltip title="Toggle Enhanced Calendar">
                  <IconButton
                    size="small"
                    onClick={() => setUseEnhancedCalendar(!useEnhancedCalendar)}
                    sx={{ bgcolor: useEnhancedCalendar ? alpha(theme.palette.primary.main, 0.1) : 'transparent' }}
                  >
                    <AutoAwesomeRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Stats */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="primary.main">
                    {filteredEvents.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="warning.main">
                    {filteredEvents.filter(e => e.status === "Pending").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="error.main">
                    {filteredEvents.filter(e => e.status === "Overdue").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    {filteredEvents.filter(e => e.status === "Completed").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* Calendar Grid and Events Layout */}
      <Grid container spacing={3}>
        {/* Calendar Grid Widget */}
        <Grid item xs={12} lg={4}>
          {useEnhancedCalendar ? (
            <EnhancedCalendarGrid
              currentDate={currentDate}
              onDateChange={(date) => setCurrentDate(date)}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setCurrentDate(date);
              }}
              events={filteredEvents}
              selectedDate={selectedDate}
              view={view}
              onViewChange={(newView) => setView(newView)}
              onEventClick={(event) => setSelectedEvent(event)}
              onAddEvent={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setCurrentDate(date);
                }
                setEnhancedFormOpen(true);
              }}
            />
          ) : (
            <CalendarGrid
              currentDate={currentDate}
              onDateChange={(date) => setCurrentDate(date)}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setCurrentDate(date);
              }}
              events={filteredEvents}
              selectedDate={selectedDate}
            />
          )}
        </Grid>

        {/* Events Grid */}
        <Grid item xs={12} lg={8}>
          {renderEvents()}
        </Grid>
      </Grid>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Events</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={filters.type}
                label="Event Type"
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                {eventTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                {priorities.map(priority => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={filters.assignedTo}
                label="Assigned To"
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              >
                {assignees.map(assignee => (
                  <MenuItem key={assignee} value={assignee}>{assignee}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilters({ type: "All", status: "All", priority: "All", assignedTo: "All" })}>
            Clear All
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog 
        open={selectedEvent !== null} 
        onClose={() => setSelectedEvent(null)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                {getEventTypeDisplay(selectedEvent.type, selectedEvent.priority).icon}
                <Typography variant="h6">{selectedEvent.title}</Typography>
                <Chip size="small" {...getStatusChipProps(selectedEvent.status)} />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={4}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {selectedEvent.time}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Priority:</strong> {selectedEvent.priority}
                  </Typography>
                </Stack>

                {selectedEvent.description && (
                  <Typography variant="body1">
                    {selectedEvent.description}
                  </Typography>
                )}

                <Stack spacing={1}>
                  {selectedEvent.assignedTo && (
                    <Typography variant="body2">
                      <strong>Assigned to:</strong> {selectedEvent.assignedTo}
                    </Typography>
                  )}
                  {selectedEvent.client && (
                    <Typography variant="body2">
                      <strong>Client:</strong> {selectedEvent.client}
                    </Typography>
                  )}
                  {selectedEvent.property && (
                    <Typography variant="body2">
                      <strong>Property:</strong> {selectedEvent.property}
                    </Typography>
                  )}
                  {selectedEvent.location && (
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedEvent.location}
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={1}>
                  {selectedEvent.reminder && (
                    <Chip label="Reminder Set" size="small" color="warning" />
                  )}
                  {selectedEvent.recurring && (
                    <Chip label="Recurring" size="small" color="info" />
                  )}
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEvent(null)}>Close</Button>
              <Button variant="contained">Edit Event</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Enhanced Event Form */}
      <EnhancedEventForm
        open={enhancedFormOpen}
        onClose={() => setEnhancedFormOpen(false)}
        onSave={(event) => {
          // Add the new event to the events list
          setEvents(prev => [...prev, event]);
          setEnhancedFormOpen(false);
        }}
        existingEvents={events}
        selectedDate={selectedDate}
      />

      {/* AI Scheduling Assistant */}
      <AISchedulingAssistant
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        onScheduleEvent={(suggestion) => {
          // Convert AI suggestion to event and add it
          const newEvent = {
            id: `ai-event-${Date.now()}`,
            title: suggestion.title,
            type: suggestion.type,
            date: suggestion.suggestedDate.toISOString().split('T')[0],
            time: suggestion.suggestedTime,
            endTime: suggestion.suggestedTime, // Calculate end time based on duration
            description: suggestion.reason,
            location: suggestion.location,
            attendees: suggestion.attendees,
            priority: "Medium" as const,
            status: "Pending" as const,
            recurring: false,
            reminder: true,
          };
          setEvents(prev => [...prev, newEvent]);
          setAiAssistantOpen(false);
        }}
        existingEvents={events}
        selectedDate={selectedDate}
      />

      {/* Calendar Integrations */}
      <CalendarIntegrations
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
      />

      {/* Legacy Add Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 4, textAlign: "center" }}>
            Event creation form would be implemented here
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" }
        }}
        onClick={() => setEnhancedFormOpen(true)}
      >
        <AddRoundedIcon />
      </Fab>

      {/* Mobile AI Assistant FAB */}
      <Fab
        color="secondary"
        size="small"
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          display: { xs: "flex", md: "none" }
        }}
        onClick={() => setAiAssistantOpen(true)}
      >
        <SmartToyRoundedIcon />
      </Fab>
    </Box>
  );
}
