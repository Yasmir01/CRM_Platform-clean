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
} from "@mui/material";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed" | "In Progress" | "Overdue";
}

interface CalendarGridProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDateSelect?: (date: Date) => void;
  events: CalendarEvent[];
  selectedDate?: Date | null;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  onDateChange,
  onDateSelect,
  events,
  selectedDate,
}) => {
  const theme = useTheme();

  // Get first day of the month and last day
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the first day of the week (Sunday = 0, Monday = 1, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Create array of all days to display (including previous/next month padding)
  const daysInMonth = lastDayOfMonth.getDate();
  const daysFromPrevMonth = firstDayOfWeek;
  const totalCells = 42; // 6 rows × 7 days
  
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

  const navigateMonth = (direction: 'prev' | 'next') => {
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

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Previous Month">
            <IconButton size="small" onClick={() => navigateMonth('prev')}>
              <ArrowBackIosRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Go to Today">
            <IconButton size="small" onClick={goToToday}>
              <TodayRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next Month">
            <IconButton size="small" onClick={() => navigateMonth('next')}>
              <ArrowForwardIosRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

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
                py: 1
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid */}
      <Grid container sx={{ minHeight: 300 }}>
        {days.map((dayInfo, index) => {
          const hasEvents = dayInfo.events.length > 0;
          const hasHighPriorityEvents = dayInfo.events.some(event => event.priority === 'High');
          const hasOverdueEvents = dayInfo.events.some(event => event.status === 'Overdue');

          return (
            <Grid item xs key={index}>
              <Box
                onClick={() => handleDateClick(dayInfo.date)}
                sx={{
                  position: 'relative',
                  height: 50,
                  cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  m: 0.25,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  pt: 0.5,
                  bgcolor: dayInfo.isSelected
                    ? alpha(theme.palette.primary.main, 0.1)
                    : dayInfo.isToday
                    ? alpha(theme.palette.primary.main, 0.05)
                    : 'transparent',
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
                    fontSize: '0.75rem'
                  }}
                >
                  {dayInfo.date.getDate()}
                </Typography>

                {/* Event indicators */}
                {hasEvents && (
                  <Stack direction="row" spacing={0.25} sx={{ mt: 0.25 }}>
                    {dayInfo.events.slice(0, 2).map((event, eventIndex) => (
                      <Box
                        key={eventIndex}
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: getEventPriorityColor(event.priority),
                        }}
                      />
                    ))}
                    {dayInfo.events.length > 2 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.6rem',
                          color: 'text.secondary',
                          lineHeight: 1,
                        }}
                      >
                        +{dayInfo.events.length - 2}
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
                      width: 6,
                      height: 6,
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
                      width: 6,
                      height: 6,
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

      {/* Legend */}
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
    </Paper>
  );
};

export default CalendarGrid;
