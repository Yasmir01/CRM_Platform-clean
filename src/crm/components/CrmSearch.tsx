import * as React from "react";
import { useNavigate } from "react-router-dom";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { alpha, styled } from "@mui/material/styles";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Popper,
  ClickAwayListener,
  Box
} from "@mui/material";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import { useSearch, SearchResult } from "../contexts/SearchContext";

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: alpha(theme.palette.common.white, 0.06),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
  }),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

// Comprehensive search data for CRM
const mockSearchData = [
  // Properties
  { id: "1", type: "property", title: "Sunset Apartments", subtitle: "123 Main St, LA • 24 units • $2,500/month", path: "/crm/properties" },
  { id: "2", type: "property", title: "Ocean View Villa", subtitle: "456 Beach Ave, Santa Monica • 3BR/2BA • $4,200/month", path: "/crm/properties" },
  { id: "3", type: "property", title: "Downtown Lofts", subtitle: "789 City Center, LA • Studio • $2,800/month", path: "/crm/properties" },
  { id: "4", type: "property", title: "Garden Heights", subtitle: "321 Oak Street, Beverly Hills • 2BR/1BA • $3,500/month", path: "/crm/properties" },

  // Tenants
  { id: "5", type: "tenant", title: "Sarah Johnson", subtitle: "Tenant at Sunset Apartments • Lease expires 12/2024", path: "/crm/tenants" },
  { id: "6", type: "tenant", title: "Michael Chen", subtitle: "Tenant at Ocean View Villa • Current • Excellent rating", path: "/crm/tenants" },
  { id: "7", type: "tenant", title: "Lisa Rodriguez", subtitle: "Tenant at Downtown Lofts • Rent due • Contact needed", path: "/crm/tenants" },
  { id: "8", type: "tenant", title: "David Kim", subtitle: "Tenant at Garden Heights • New lease signed", path: "/crm/tenants" },

  // Prospects
  { id: "9", type: "prospect", title: "John Doe", subtitle: "Interested in Ocean View Villa • Application pending", path: "/crm/prospects" },
  { id: "10", type: "prospect", title: "Emma Wilson", subtitle: "Looking for 2BR in Beverly Hills • Budget $3,000-4,000", path: "/crm/prospects" },
  { id: "11", type: "prospect", title: "Robert Taylor", subtitle: "Interested in Downtown Lofts • Viewing scheduled", path: "/crm/prospects" },

  // Tasks
  { id: "12", type: "task", title: "Follow up call", subtitle: "Contact John Doe about application • Due today", path: "/crm/tasks" },
  { id: "13", type: "task", title: "Property inspection", subtitle: "Quarterly inspection at Sunset Apartments • Due tomorrow", path: "/crm/tasks" },
  { id: "14", type: "task", title: "Lease renewal", subtitle: "Sarah Johnson renewal discussion • Due this week", path: "/crm/tasks" },
  { id: "15", type: "task", title: "Rent collection", subtitle: "Follow up on late payment - Lisa Rodriguez", path: "/crm/tasks" },

  // Work Orders
  { id: "16", type: "workOrder", title: "HVAC Repair", subtitle: "Unit 2B - Sunset Apartments • High Priority • In Progress", path: "/crm/work-orders" },
  { id: "17", type: "workOrder", title: "Plumbing Fix", subtitle: "Ocean View Villa • Kitchen faucet • Scheduled", path: "/crm/work-orders" },
  { id: "18", type: "workOrder", title: "Electrical Issue", subtitle: "Downtown Lofts • Outlet repair • Urgent", path: "/crm/work-orders" },

  // Managers & Service Providers
  { id: "19", type: "manager", title: "Emily Davis", subtitle: "Property Manager • Manages 15 properties • 5 years exp", path: "/crm/managers" },
  { id: "20", type: "manager", title: "James Wilson", subtitle: "Senior Property Manager • Downtown area specialist", path: "/crm/managers" },
  { id: "21", type: "serviceProvider", title: "ABC Plumbing", subtitle: "Licensed plumber • 24/7 emergency service", path: "/crm/service-providers" },
  { id: "22", type: "serviceProvider", title: "Elite HVAC", subtitle: "Heating & cooling specialists • Preferred vendor", path: "/crm/service-providers" },

  // Additional searchable terms
  { id: "23", type: "task", title: "Calendar", subtitle: "View calendar and schedule appointments", path: "/crm/calendar" },
  { id: "24", type: "task", title: "Reports", subtitle: "Generate property and financial reports", path: "/crm/reports" },
  { id: "25", type: "task", title: "Templates", subtitle: "Manage email and document templates", path: "/crm/templates" },
  { id: "26", type: "task", title: "Applications", subtitle: "Review rental applications", path: "/crm/applications" },
  { id: "27", type: "task", title: "Marketplace", subtitle: "Manage marketplace items and add-ons", path: "/crm/marketplace" },
  { id: "28", type: "task", title: "Settings", subtitle: "Configure CRM settings and preferences", path: "/crm/settings" },
] as SearchResult[];

const getIcon = (type: string, title?: string) => {
  // Special handling for specific pages/functions
  if (title) {
    if (title.toLowerCase().includes('calendar')) return <CalendarTodayRoundedIcon fontSize="small" />;
    if (title.toLowerCase().includes('reports')) return <BarChartRoundedIcon fontSize="small" />;
    if (title.toLowerCase().includes('templates')) return <DescriptionRoundedIcon fontSize="small" />;
    if (title.toLowerCase().includes('applications')) return <AssignmentRoundedIcon fontSize="small" />;
    if (title.toLowerCase().includes('marketplace')) return <StorefrontRoundedIcon fontSize="small" />;
    if (title.toLowerCase().includes('settings')) return <SettingsRoundedIcon fontSize="small" />;
  }

  switch (type) {
    case "property": return <HomeWorkRoundedIcon fontSize="small" />;
    case "tenant": return <PersonRoundedIcon fontSize="small" />;
    case "prospect": return <GroupRoundedIcon fontSize="small" />;
    case "task": return <TaskRoundedIcon fontSize="small" />;
    case "workOrder": return <BuildRoundedIcon fontSize="small" />;
    case "manager": return <BusinessRoundedIcon fontSize="small" />;
    case "serviceProvider": return <BuildRoundedIcon fontSize="small" />;
    default: return <SearchRoundedIcon fontSize="small" />;
  }
};

export default function CrmSearch() {
  const navigate = useNavigate();
  const { globalSearchTerm, setGlobalSearchTerm, searchResults, setSearchResults } = useSearch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showResults, setShowResults] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalSearchTerm(value);

    // Use setTimeout to completely defer search updates to avoid render conflicts
    setTimeout(() => {
      if (value.trim() === '') {
        setSearchResults([]);
        setShowResults(false);
        setAnchorEl(null);
        return;
      }

      // Filter mock data based on search term
      const filtered = mockSearchData.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(value.toLowerCase()))
      );

      setSearchResults(filtered);
      setShowResults(true);

      if (searchRef.current && !anchorEl) {
        setAnchorEl(searchRef.current);
      }
    }, 0);
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setTimeout(() => {
      setShowResults(false);
      setGlobalSearchTerm('');
      setSearchResults([]);
    }, 0);
  };

  const handleClickAway = () => {
    setTimeout(() => {
      setShowResults(false);
      setAnchorEl(null);
    }, 0);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setTimeout(() => {
        setShowResults(false);
        setGlobalSearchTerm('');
        setAnchorEl(null);
      }, 0);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <SearchWrapper ref={searchRef}>
          <SearchIconWrapper>
            <SearchRoundedIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search CRM..."
            value={globalSearchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            inputProps={{ "aria-label": "search" }}
          />
        </SearchWrapper>

        <Popper
          open={showResults && searchResults.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ zIndex: 1300, width: anchorEl?.offsetWidth || 'auto', minWidth: 300 }}
        >
          <Paper elevation={8} sx={{ mt: 1, maxHeight: 400, overflow: 'auto' }}>
            <List dense>
              {searchResults.map((result) => (
                <ListItem
                  key={result.id}
                  component="button"
                  onClick={() => handleResultClick(result)}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getIcon(result.type, result.title)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {result.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {result.subtitle}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {searchResults.length === 0 && globalSearchTerm.trim() !== '' && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "{globalSearchTerm}"
                </Typography>
              </Box>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
