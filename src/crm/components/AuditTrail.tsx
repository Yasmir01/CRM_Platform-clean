import * as React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Pagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  action: string;
  module: "Users" | "Properties" | "Tenants" | "Payments" | "Communications" | "Reports" | "System" | "Security" | "Maintenance";
  details: string;
  ipAddress: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  entityType?: string;
  entityId?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-16T14:30:00Z",
    user: {
      name: "John Admin",
      email: "john@company.com",
      role: "Administrator"
    },
    action: "User Login",
    module: "Security",
    details: "Successful login from new device",
    ipAddress: "192.168.1.100",
    severity: "Low"
  },
  {
    id: "2",
    timestamp: "2024-01-16T14:25:00Z",
    user: {
      name: "Sarah Manager",
      email: "sarah@company.com",
      role: "Property Manager"
    },
    action: "Property Created",
    module: "Properties",
    details: "Created new property: Oak Street Apartments",
    ipAddress: "192.168.1.101",
    severity: "Medium",
    entityType: "Property",
    entityId: "PROP-123"
  },
  {
    id: "3",
    timestamp: "2024-01-16T14:20:00Z",
    user: {
      name: "Mike Tenant",
      email: "mike@tenant.com",
      role: "Tenant"
    },
    action: "Payment Submitted",
    module: "Payments",
    details: "Rent payment of $1,200 submitted via ACH",
    ipAddress: "203.0.113.15",
    severity: "Medium",
    entityType: "Payment",
    entityId: "PAY-456"
  },
  {
    id: "4",
    timestamp: "2024-01-16T14:15:00Z",
    user: {
      name: "Admin System",
      email: "system@company.com",
      role: "System"
    },
    action: "Data Export",
    module: "Reports",
    details: "Monthly financial report exported to PDF",
    ipAddress: "127.0.0.1",
    severity: "Low",
    entityType: "Report",
    entityId: "RPT-789"
  },
  {
    id: "5",
    timestamp: "2024-01-16T14:10:00Z",
    user: {
      name: "Sarah Manager",
      email: "sarah@company.com",
      role: "Property Manager"
    },
    action: "Tenant Updated",
    module: "Tenants",
    details: "Updated tenant contact information",
    ipAddress: "192.168.1.101",
    severity: "Medium",
    entityType: "Tenant",
    entityId: "TEN-321",
    changes: [
      {
        field: "phone",
        oldValue: "(555) 123-4567",
        newValue: "(555) 987-6543"
      },
      {
        field: "email",
        oldValue: "old@email.com",
        newValue: "new@email.com"
      }
    ]
  },
  {
    id: "6",
    timestamp: "2024-01-16T14:05:00Z",
    user: {
      name: "John Admin",
      email: "john@company.com",
      role: "Administrator"
    },
    action: "Password Reset",
    module: "Security",
    details: "Password reset for user: sarah@company.com",
    ipAddress: "192.168.1.100",
    severity: "High",
    entityType: "User",
    entityId: "USR-654"
  },
  {
    id: "7",
    timestamp: "2024-01-16T14:00:00Z",
    user: {
      name: "Tom Service",
      email: "tom@service.com",
      role: "Service Provider"
    },
    action: "Work Order Completed",
    module: "Maintenance",
    details: "Completed HVAC repair at Unit 2B",
    ipAddress: "198.51.100.25",
    severity: "Medium",
    entityType: "WorkOrder",
    entityId: "WO-987"
  },
  {
    id: "8",
    timestamp: "2024-01-16T13:55:00Z",
    user: {
      name: "Sarah Manager",
      email: "sarah@company.com",
      role: "Property Manager"
    },
    action: "Bulk Email Sent",
    module: "Communications",
    details: "Sent maintenance notice to 25 tenants",
    ipAddress: "192.168.1.101",
    severity: "Low",
    entityType: "EmailCampaign",
    entityId: "EMAIL-147"
  }
];

interface AuditTrailProps {
  height?: number;
  showFilters?: boolean;
}

export default function AuditTrail({ height = 600, showFilters = true }: AuditTrailProps) {
  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>(mockAuditEntries);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [moduleFilter, setModuleFilter] = React.useState<string>("All");
  const [severityFilter, setSeverityFilter] = React.useState<string>("All");
  const [userFilter, setUserFilter] = React.useState<string>("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedEntry, setSelectedEntry] = React.useState<AuditEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const itemsPerPage = 10;

  const getModuleIcon = (module: AuditEntry["module"]) => {
    switch (module) {
      case "Users": return <PersonRoundedIcon />;
      case "Properties": return <HomeRoundedIcon />;
      case "Tenants": return <PersonRoundedIcon />;
      case "Payments": return <PaymentRoundedIcon />;
      case "Communications": return <EmailRoundedIcon />;
      case "Reports": return <SettingsRoundedIcon />;
      case "System": return <SettingsRoundedIcon />;
      case "Security": return <SecurityRoundedIcon />;
      case "Maintenance": return <BuildRoundedIcon />;
      default: return <SettingsRoundedIcon />;
    }
  };

  const getSeverityColor = (severity: AuditEntry["severity"]) => {
    switch (severity) {
      case "Low": return "info";
      case "Medium": return "warning";
      case "High": return "error";
      case "Critical": return "error";
      default: return "default";
    }
  };

  const getModuleColor = (module: AuditEntry["module"]) => {
    switch (module) {
      case "Users": return "primary";
      case "Properties": return "success";
      case "Tenants": return "info";
      case "Payments": return "warning";
      case "Communications": return "secondary";
      case "Reports": return "default";
      case "System": return "default";
      case "Security": return "error";
      case "Maintenance": return "warning";
      default: return "default";
    }
  };

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = moduleFilter === "All" || entry.module === moduleFilter;
    const matchesSeverity = severityFilter === "All" || entry.severity === severityFilter;
    const matchesUser = userFilter === "All" || entry.user.name === userFilter;
    
    return matchesSearch && matchesModule && matchesSeverity && matchesUser;
  });

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const uniqueUsers = [...new Set(auditEntries.map(entry => entry.user.name))];

  const handleViewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  };

  const stats = {
    totalEntries: auditEntries.length,
    todayEntries: auditEntries.filter(entry => 
      new Date(entry.timestamp).toDateString() === new Date().toDateString()
    ).length,
    criticalEvents: auditEntries.filter(entry => 
      entry.severity === "Critical" || entry.severity === "High"
    ).length,
    uniqueUsers: uniqueUsers.length
  };

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  📋
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Entries
                  </Typography>
                  <Typography variant="h4">{stats.totalEntries}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  📅
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Today's Events
                  </Typography>
                  <Typography variant="h4">{stats.todayEntries}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  ⚠️
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Critical Events
                  </Typography>
                  <Typography variant="h4">{stats.criticalEvents}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  👥
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Users
                  </Typography>
                  <Typography variant="h4">{stats.uniqueUsers}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search audit entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  value={moduleFilter}
                  label="Module"
                  onChange={(e) => setModuleFilter(e.target.value)}
                >
                  <MenuItem value="All">All Modules</MenuItem>
                  <MenuItem value="Users">Users</MenuItem>
                  <MenuItem value="Properties">Properties</MenuItem>
                  <MenuItem value="Tenants">Tenants</MenuItem>
                  <MenuItem value="Payments">Payments</MenuItem>
                  <MenuItem value="Communications">Communications</MenuItem>
                  <MenuItem value="Reports">Reports</MenuItem>
                  <MenuItem value="System">System</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  label="Severity"
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="All">All Severities</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={userFilter}
                  label="User"
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <MenuItem value="All">All Users</MenuItem>
                  {uniqueUsers.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Audit Table */}
      <TableContainer component={Paper} sx={{ maxHeight: height }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      {entry.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.user.role}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {entry.action}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getModuleIcon(entry.module)}
                    label={entry.module}
                    color={getModuleColor(entry.module)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {entry.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.severity}
                    color={getSeverityColor(entry.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {entry.ipAddress}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(entry)}
                    >
                      <VisibilityRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
        />
      </Stack>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Audit Entry Details
        </DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1">
                    {selectedEntry.user.name} ({selectedEntry.user.role})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEntry.user.email}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Action
                  </Typography>
                  <Typography variant="body1">
                    {selectedEntry.action}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Module
                  </Typography>
                  <Chip
                    icon={getModuleIcon(selectedEntry.module)}
                    label={selectedEntry.module}
                    color={getModuleColor(selectedEntry.module)}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Details
                </Typography>
                <Typography variant="body1">
                  {selectedEntry.details}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip
                    label={selectedEntry.severity}
                    color={getSeverityColor(selectedEntry.severity)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    IP Address
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedEntry.ipAddress}
                  </Typography>
                </Grid>
              </Grid>

              {selectedEntry.entityType && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Entity Type
                    </Typography>
                    <Typography variant="body1">
                      {selectedEntry.entityType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Entity ID
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace">
                      {selectedEntry.entityId}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Changes Made
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Field</TableCell>
                          <TableCell>Old Value</TableCell>
                          <TableCell>New Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedEntry.changes.map((change, index) => (
                          <TableRow key={index}>
                            <TableCell>{change.field}</TableCell>
                            <TableCell>{change.oldValue}</TableCell>
                            <TableCell>{change.newValue}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
