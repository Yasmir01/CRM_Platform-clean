import * as React from "react";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CalendarViewMonthRoundedIcon from "@mui/icons-material/CalendarViewMonthRounded";
import CalendarViewWeekRoundedIcon from "@mui/icons-material/CalendarViewWeekRounded";
import CalendarViewDayRoundedIcon from "@mui/icons-material/CalendarViewDayRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "transparent",
    border: `1px solid ${theme.palette.divider}`,
  }),
}));

interface CrmDateRangePickerProps {
  onChange?: (range: { label: string; value: string; fromDate?: string; toDate?: string }) => void;
  defaultRange?: string;
}

const dateRanges = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Quarter", value: "thisQuarter" },
  { label: "Last Quarter", value: "lastQuarter" },
  { label: "This Year", value: "thisYear" },
  { label: "Custom Range", value: "custom" },
];

const calendarActions = [
  {
    label: "Open Calendar",
    value: "open-calendar",
    icon: <CalendarTodayRoundedIcon />,
    description: "View full calendar"
  },
  {
    label: "Month View",
    value: "month-view",
    icon: <CalendarViewMonthRoundedIcon />,
    description: "Calendar grid for current month"
  },
  {
    label: "Week View",
    value: "week-view",
    icon: <CalendarViewWeekRoundedIcon />,
    description: "Weekly calendar view"
  },
  {
    label: "Today's Schedule",
    value: "today-schedule",
    icon: <CalendarViewDayRoundedIcon />,
    description: "Today's tasks and events"
  },
  {
    label: "All Events",
    value: "all-events",
    icon: <EventRoundedIcon />,
    description: "View all scheduled events"
  },
  {
    label: "Add Event",
    value: "add-event",
    icon: <AddRoundedIcon />,
    description: "Create new task or appointment"
  },
];

export default function CrmDateRangePicker({ onChange, defaultRange = "thisMonth" }: CrmDateRangePickerProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRange, setSelectedRange] = React.useState(dateRanges.find(r => r.value === defaultRange) || dateRanges[4]);
  const [customFromDate, setCustomFromDate] = React.useState("");
  const [customToDate, setCustomToDate] = React.useState("");
  const [showCustomDates, setShowCustomDates] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowCustomDates(false);
  };

  const handleRangeSelect = (range: (typeof dateRanges)[0]) => {
    if (range.value === "custom") {
      setShowCustomDates(true);
      setSelectedRange(range);
    } else {
      setSelectedRange(range);
      setShowCustomDates(false);
      if (onChange) {
        onChange(range);
      }
      handleClose();
    }
  };

  const handleCalendarAction = (action: (typeof calendarActions)[0]) => {
    switch (action.value) {
      case "open-calendar":
        navigate("/crm/calendar");
        break;
      case "month-view":
        navigate("/crm/calendar?view=month");
        break;
      case "week-view":
        navigate("/crm/calendar?view=week");
        break;
      case "today-schedule":
        navigate("/crm/calendar?view=day&date=today");
        break;
      case "all-events":
        navigate("/crm/calendar?filter=all");
        break;
      case "add-event":
        navigate("/crm/calendar?action=add");
        break;
    }
    handleClose();
  };

  const handleCustomDateApply = () => {
    if (customFromDate && customToDate) {
      const customRange = {
        label: `${customFromDate} to ${customToDate}`,
        value: "custom",
        fromDate: customFromDate,
        toDate: customToDate
      };
      setSelectedRange(customRange);
      if (onChange) {
        onChange(customRange);
      }
      handleClose();
    }
  };

  return (
    <div>
      <StyledButton
        id="date-range-button"
        aria-controls={open ? "date-range-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        endIcon={<ArrowDropDownRoundedIcon />}
        startIcon={<CalendarTodayRoundedIcon />}
        size="small"
      >
        {selectedRange.label}
      </StyledButton>
      <Menu
        id="date-range-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "date-range-button",
        }}
        PaperProps={{
          sx: { minWidth: showCustomDates ? 320 : 240 }
        }}
      >
        {/* Calendar Actions Section */}
        {calendarActions.map((action) => (
          <MenuItem
            key={action.value}
            onClick={() => handleCalendarAction(action)}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {action.icon}
            </ListItemIcon>
            <ListItemText
              primary={action.label}
              secondary={action.description}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Date Range Section */}
        {dateRanges.map((range) => (
          <MenuItem
            key={range.value}
            onClick={() => handleRangeSelect(range)}
            selected={range.value === selectedRange.value}
            sx={{ py: 0.75 }}
          >
            {range.label}
          </MenuItem>
        ))}

        {showCustomDates && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label="From Date"
                  type="date"
                  size="small"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="To Date"
                  type="date"
                  size="small"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => setShowCustomDates(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleCustomDateApply}
                    disabled={!customFromDate || !customToDate}
                  >
                    Apply
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </>
        )}
      </Menu>
    </div>
  );
}
