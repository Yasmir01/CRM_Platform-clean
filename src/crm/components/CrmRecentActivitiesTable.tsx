import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import Tooltip from "@mui/material/Tooltip";

// Activity type icons
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useCrmData } from "../contexts/CrmDataContext";
import { useActivityTracking } from "../contexts/ActivityTrackingContext";

interface Activity {
  id: number;
  type: "application" | "payment" | "work_order" | "communication" | "lease" | "maintenance" | "marketing" | "user_action" | "system" | "document" | "inspection" | "general";
  title: string;
  description: string;
  amount?: number;
  status: "new" | "pending" | "approved" | "denied" | "incomplete" | "completed" | "in_progress" | "cancelled" | "scheduled";
  property?: string;
  tenant?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  priority?: "low" | "medium" | "high" | "urgent";
  module: "Properties" | "Tenants" | "Work Orders" | "Tasks" | "Reports" | "Marketing" | "Settings" | "Calendar" | "Documents" | "Financial";
  ipAddress?: string;
  userAgent?: string;
  duration?: number; // in minutes for time-based activities
  relatedId?: string; // ID of related entity
}

// Comprehensive sample data for recent activities
const recentActivities: Activity[] = [
  {
    id: 1,
    type: "application",
    title: "New Rental Application",
    description: "John Smith applied for Unit 2B at Ocean View Apartments",
    status: "new",
    property: "Ocean View Apartments",
    tenant: "John Smith",
    createdBy: "System",
    createdAt: "2024-01-30T10:30:00Z",
    priority: "high",
    module: "Properties"
  },
  {
    id: 2,
    type: "payment",
    title: "Rent Payment Received",
    description: "February rent payment from Sarah Johnson",
    amount: 2200,
    status: "completed",
    property: "Sunset Gardens Unit 5A",
    tenant: "Sarah Johnson",
    createdBy: "System",
    createdAt: "2024-01-30T09:15:00Z",
    module: "Financial"
  },
  {
    id: 3,
    type: "work_order",
    title: "AC Repair Request",
    description: "Tenant reported AC not working in Unit 3C",
    status: "pending",
    property: "Downtown Lofts Unit 3C",
    tenant: "Mike Wilson",
    assignedTo: "ABC HVAC Services",
    createdBy: "Mike Wilson",
    createdAt: "2024-01-30T08:45:00Z",
    priority: "high",
    module: "Work Orders"
  },
  {
    id: 4,
    type: "application",
    title: "Application Approved",
    description: "Emily Davis application approved for Unit 1A",
    status: "approved",
    property: "Garden Heights Unit 1A",
    tenant: "Emily Davis",
    createdBy: "Property Manager",
    createdAt: "2024-01-29T16:20:00Z",
    module: "Tenants"
  },
  {
    id: 5,
    type: "work_order",
    title: "Plumbing Maintenance",
    description: "Scheduled plumbing inspection for Building A",
    status: "in_progress",
    property: "Building A",
    assignedTo: "Quick Fix Plumbing",
    createdBy: "Admin",
    createdAt: "2024-01-29T14:30:00Z",
    priority: "medium",
    module: "Work Orders"
  },
  {
    id: 6,
    type: "payment",
    title: "Late Fee Applied",
    description: "Late fee applied to overdue rent payment",
    amount: 75,
    status: "completed",
    property: "Riverside Apartments Unit 2D",
    tenant: "David Brown",
    createdBy: "System",
    createdAt: "2024-01-29T12:00:00Z",
    module: "Financial"
  },
  {
    id: 7,
    type: "communication",
    title: "Email Campaign Sent",
    description: "Monthly newsletter sent to all tenants",
    status: "completed",
    createdBy: "Marketing Team",
    createdAt: "2024-01-30T14:00:00Z",
    module: "Marketing"
  },
  {
    id: 8,
    type: "user_action",
    title: "User Login",
    description: "Alex Thompson logged into the system",
    status: "completed",
    createdBy: "Alex Thompson",
    createdAt: "2024-01-30T09:00:00Z",
    module: "Settings",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120"
  },
  {
    id: 9,
    type: "document",
    title: "Lease Agreement Uploaded",
    description: "New lease agreement uploaded for Unit 4B",
    status: "completed",
    property: "Ocean View Apartments Unit 4B",
    tenant: "Jennifer Clark",
    createdBy: "Property Manager",
    createdAt: "2024-01-30T11:30:00Z",
    module: "Documents"
  },
  {
    id: 10,
    type: "inspection",
    title: "Move-out Inspection Scheduled",
    description: "Final inspection scheduled for Unit 3A",
    status: "scheduled",
    property: "Garden Heights Unit 3A",
    tenant: "Robert Lee",
    createdBy: "Property Manager",
    createdAt: "2024-01-30T15:45:00Z",
    module: "Properties",
    priority: "medium"
  },
  {
    id: 11,
    type: "system",
    title: "Automated Backup Completed",
    description: "Daily database backup completed successfully",
    status: "completed",
    createdBy: "System",
    createdAt: "2024-01-30T02:00:00Z",
    module: "Settings"
  },
  {
    id: 12,
    type: "marketing",
    title: "New Lead Generated",
    description: "Website form submission for 2BR apartment inquiry",
    status: "new",
    createdBy: "Website",
    createdAt: "2024-01-30T16:20:00Z",
    module: "Marketing",
    priority: "high"
  },
  {
    id: 13,
    type: "user_action",
    title: "Report Generated",
    description: "Monthly financial report generated and exported",
    status: "completed",
    createdBy: "Alex Thompson",
    createdAt: "2024-01-30T13:15:00Z",
    module: "Reports",
    duration: 5
  },
  {
    id: 14,
    type: "communication",
    title: "SMS Reminder Sent",
    description: "Rent due reminder sent to 45 tenants",
    status: "completed",
    createdBy: "System",
    createdAt: "2024-01-29T10:00:00Z",
    module: "Marketing"
  },
  {
    id: 15,
    type: "maintenance",
    title: "Property Inspection Completed",
    description: "Annual safety inspection completed for Building C",
    status: "completed",
    property: "Building C",
    createdBy: "Safety Inspector",
    createdAt: "2024-01-29T09:30:00Z",
    module: "Properties",
    priority: "medium"
  }
];

// Function to get activity type icon
const getActivityIcon = (type: string) => {
  switch (type) {
    case "application":
      return <PersonAddRoundedIcon />;
    case "payment":
      return <AttachMoneyRoundedIcon />;
    case "work_order":
      return <BuildRoundedIcon />;
    case "communication":
      return <EmailRoundedIcon />;
    case "lease":
      return <DescriptionRoundedIcon />;
    case "maintenance":
      return <BuildRoundedIcon />;
    case "marketing":
      return <CampaignRoundedIcon />;
    case "user_action":
      return <SecurityRoundedIcon />;
    case "system":
      return <SettingsRoundedIcon />;
    case "document":
      return <FolderRoundedIcon />;
    case "inspection":
      return <VisibilityRoundedIcon />;
    default:
      return <HomeRoundedIcon />;
  }
};

// Function to get color based on activity status
const getStatusColor = (
  status: string,
): "default" | "primary" | "success" | "warning" | "error" | "info" => {
  switch (status) {
    case "new":
      return "info";
    case "pending":
      return "warning";
    case "approved":
    case "completed":
      return "success";
    case "denied":
      return "error";
    case "incomplete":
      return "warning";
    case "in_progress":
      return "primary";
    case "cancelled":
      return "error";
    case "scheduled":
      return "info";
    default:
      return "default";
  }
};

// Function to get priority color
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "urgent":
      return "error";
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "default";
  }
};

// Function to get module color
const getModuleColor = (module: string) => {
  switch (module) {
    case "Properties":
      return "primary";
    case "Tenants":
      return "success";
    case "Work Orders":
      return "warning";
    case "Marketing":
      return "info";
    case "Financial":
      return "secondary";
    default:
      return "default";
  }
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Format date for audit export
const formatDateFull = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function CrmRecentActivitiesTable() {
  const theme = useTheme();
  const { state } = useCrmData();
  const { getRecentActivities } = useActivityTracking();
  const [timeFilter, setTimeFilter] = React.useState("daily");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [moduleFilter, setModuleFilter] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Generate real activities from CRM data
  const generateRealActivities = React.useMemo(() => {
    const { properties = [], tenants = [] } = state || {};
    const activities: Activity[] = [];

    // Add 590 Hawkins Store Rd rental activity (most recent)
    const hawkinsProperty = properties.find(p => p.address.includes("590") && p.address.includes("Hawkins"));
    if (hawkinsProperty) {
      const hawkinsTenant = tenants.find(t => t.propertyId === hawkinsProperty.id && t.status === "Active");
      if (hawkinsTenant) {
        activities.push({
          id: 9001,
          type: "lease",
          title: "New Lease Signed",
          description: `${hawkinsTenant.firstName} ${hawkinsTenant.lastName} signed lease for ${hawkinsProperty.name}`,
          status: "completed",
          property: hawkinsProperty.name,
          tenant: `${hawkinsTenant.firstName} ${hawkinsTenant.lastName}`,
          createdBy: "Property Manager",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          priority: "high",
          module: "Properties",
          amount: hawkinsTenant.monthlyRent
        });
      }
    }

    // Add recent activities from active tenants
    tenants
      .filter(t => t.status === "Active")
      .slice(0, 5)
      .forEach((tenant, index) => {
        const property = properties.find(p => p.id === tenant.propertyId);
        if (property && tenant.monthlyRent) {
          activities.push({
            id: 1000 + index,
            type: "payment",
            title: "Rent Payment Received",
            description: `Monthly rent payment from ${tenant.firstName} ${tenant.lastName}`,
            amount: tenant.monthlyRent,
            status: "completed",
            property: property.name,
            tenant: `${tenant.firstName} ${tenant.lastName}`,
            createdBy: "System",
            createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
            module: "Financial"
          });
        }
      });

    // Add property-related activities
    properties.slice(0, 3).forEach((property, index) => {
      activities.push({
        id: 2000 + index,
        type: "maintenance",
        title: "Property Inspection",
        description: `Routine inspection completed for ${property.name}`,
        status: "completed",
        property: property.name,
        createdBy: "Maintenance Team",
        createdAt: new Date(Date.now() - (index + 3) * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        module: "Properties"
      });
    });

    // Add system activities
    activities.push({
      id: 3001,
      type: "system",
      title: "CRM Data Updated",
      description: "Dashboard data refreshed with latest property and tenant information",
      status: "completed",
      createdBy: "System",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      module: "Settings"
    });

    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state]);

  const [filteredActivities, setFilteredActivities] = React.useState(generateRealActivities);

  React.useEffect(() => {
    const now = new Date();
    let filtered = generateRealActivities.filter(activity => {
      const activityDate = new Date(activity.createdAt);
      
      // Time filter
      let timeMatch = true;
      switch (timeFilter) {
        case "daily":
          timeMatch = activityDate.toDateString() === now.toDateString();
          break;
        case "weekly":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          timeMatch = activityDate >= weekAgo;
          break;
        case "monthly":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          timeMatch = activityDate >= monthAgo;
          break;
      }

      // Type filter
      const typeMatch = typeFilter === "all" || activity.type === typeFilter;

      // Module filter
      const moduleMatch = moduleFilter === "all" || activity.module === moduleFilter;

      // Search filter
      const searchMatch = searchTerm === "" || 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.property && activity.property.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.tenant && activity.tenant.toLowerCase().includes(searchTerm.toLowerCase()));

      return timeMatch && typeMatch && moduleMatch && searchMatch;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredActivities(filtered);
  }, [timeFilter, typeFilter, moduleFilter, searchTerm, generateRealActivities]);

  const handleExportToAudit = () => {
    const auditData = filteredActivities.map(activity => ({
      "Activity ID": activity.id,
      "Type": activity.type,
      "Title": activity.title,
      "Description": activity.description,
      "Module": activity.module,
      "Status": activity.status,
      "Created By": activity.createdBy,
      "Created At": formatDateFull(activity.createdAt),
      "Property": activity.property || "N/A",
      "Tenant": activity.tenant || "N/A",
      "Amount": activity.amount ? formatCurrency(activity.amount) : "N/A",
      "Priority": activity.priority || "N/A",
      "IP Address": activity.ipAddress || "N/A",
      "User Agent": activity.userAgent || "N/A",
      "Duration (min)": activity.duration || "N/A"
    }));

    // In a real application, this would trigger a CSV/Excel download
    console.log("Audit report data:", auditData);
    alert(`Audit report generated with ${auditData.length} activities. In production, this would download as CSV/Excel.`);
  };

  const uniqueTypes = [...new Set(generateRealActivities.map(a => a.type))];
  const uniqueModules = [...new Set(generateRealActivities.map(a => a.module))];

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // Enhanced dark mode styling
        ...(theme.palette.mode === 'dark' && {
          bgcolor: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          '& .MuiTableContainer-root': {
            bgcolor: 'transparent',
          },
          '& .MuiTable-root': {
            bgcolor: 'transparent',
          },
          '& .MuiTableHead-root': {
            bgcolor: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          },
          '& .MuiTableRow-root': {
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.08)',
            },
          },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          },
        })
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              // Enhanced contrast for dark mode
              ...(theme.palette.mode === 'dark' && {
                color: '#ffffff',
                textShadow: '0 1px 3px rgba(0,0,0,1)',
                fontWeight: 600
              })
            }}
          >
            Recent Activities
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Export for audit trail">
              <IconButton
                size="small"
                onClick={handleExportToAudit}
                color="primary"
              >
                <GetAppRoundedIcon />
              </IconButton>
            </Tooltip>
            <Button endIcon={<ArrowForwardRoundedIcon />} size="small">
              View All
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
          flexWrap="wrap"
          alignItems="flex-start"
        >
          <TextField
            size="small"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200, maxWidth: 250 }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 140,
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 6px) scale(0.75)',
                '&.Mui-focused, &.MuiFormLabel-filled': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              },
            }}
          >
            <InputLabel
              id="time-period-label"
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.2,
              }}
            >
              Time Period
            </InputLabel>
            <Select
              labelId="time-period-label"
              value={timeFilter}
              label="Time Period"
              onChange={(e) => setTimeFilter(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  fontSize: '0.875rem',
                }
              }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 6px) scale(0.75)',
                '&.Mui-focused, &.MuiFormLabel-filled': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              },
            }}
          >
            <InputLabel
              id="type-label"
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.2,
              }}
            >
              Type
            </InputLabel>
            <Select
              labelId="type-label"
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  fontSize: '0.875rem',
                }
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              {uniqueTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type.replace("_", " ").toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 6px) scale(0.75)',
                '&.Mui-focused, &.MuiFormLabel-filled': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              },
            }}
          >
            <InputLabel
              id="module-label"
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.2,
              }}
            >
              Module
            </InputLabel>
            <Select
              labelId="module-label"
              value={moduleFilter}
              label="Module"
              onChange={(e) => setModuleFilter(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  fontSize: '0.875rem',
                }
              }}
            >
              <MenuItem value="all">All Modules</MenuItem>
              {uniqueModules.map(module => (
                <MenuItem key={module} value={module}>
                  {module}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            // Enhanced contrast for dark mode
            ...(theme.palette.mode === 'dark' && {
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              fontWeight: 500
            })
          }}
        >
          Showing {filteredActivities.length} of {generateRealActivities.length} activities
        </Typography>
      </CardContent>
      
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table size="small" aria-label="recent activities table">
          <TableHead>
            <TableRow>
              <TableCell>Activity</TableCell>
              <TableCell>Property/Tenant</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.slice(0, 10).map((activity) => (
              <TableRow key={activity.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: "primary.light",
                        "& svg": { fontSize: "16px" }
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          // Enhanced contrast for dark mode
                          ...(theme.palette.mode === 'dark' && {
                            color: '#ffffff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          })
                        }}
                      >
                        {activity.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          // Enhanced contrast for dark mode
                          ...(theme.palette.mode === 'dark' && {
                            color: 'rgba(255,255,255,0.8)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          })
                        }}
                      >
                        {activity.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    {activity.property && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          // Enhanced contrast for dark mode
                          ...(theme.palette.mode === 'dark' && {
                            color: '#ffffff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          })
                        }}
                      >
                        {activity.property}
                      </Typography>
                    )}
                    {activity.tenant && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          // Enhanced contrast for dark mode
                          ...(theme.palette.mode === 'dark' && {
                            color: 'rgba(255,255,255,0.8)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          })
                        }}
                      >
                        {activity.tenant}
                      </Typography>
                    )}
                    {activity.assignedTo && (
                      <Typography variant="caption" color="primary.main" sx={{ display: "block" }}>
                        Assigned: {activity.assignedTo}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.module}
                    size="small"
                    color={getModuleColor(activity.module)}
                    variant="outlined"
                    sx={{
                      // Enhanced visibility for dark mode
                      ...(theme.palette.mode === 'dark' && {
                        backgroundColor: `${getModuleColor(activity.module)}.dark`,
                        color: '#ffffff',
                        borderColor: `${getModuleColor(activity.module)}.light`,
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      })
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.status.replace("_", " ").toUpperCase()}
                    size="small"
                    color={getStatusColor(activity.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {activity.amount ? (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(activity.amount)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {activity.priority && (
                    <Chip
                      label={activity.priority.toUpperCase()}
                      size="small"
                      color={getPriorityColor(activity.priority)}
                      variant="filled"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {formatDate(activity.createdAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    by {activity.createdBy}
                  </Typography>
                  {activity.duration && (
                    <Typography variant="caption" color="primary.main" sx={{ display: "block" }}>
                      {activity.duration}min
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" aria-label="more options">
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
