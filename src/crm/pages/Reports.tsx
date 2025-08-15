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
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Alert,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AuditTrail from "../components/AuditTrail";
import { useCrmData } from "../contexts/CrmDataContext";
import NumberInput from "../components/NumberInput";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface Report {
  id: string;
  name: string;
  type: "Financial" | "Property" | "Tenant" | "Maintenance" | "Marketing" | "Custom" | "Audit" | "Activity";
  dateRange: string;
  status: "Generated" | "Generating" | "Scheduled" | "Failed";
  createdDate: string;
  lastRun?: string;
  format: "PDF" | "Excel" | "CSV";
  schedule?: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  description?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `reports-tab-${index}`,
    'aria-controls': `reports-tabpanel-${index}`,
  };
}

const mockReports: Report[] = [
  {
    id: "1",
    name: "Monthly Rental Income Report",
    type: "Financial",
    dateRange: "Last 30 days",
    status: "Generated",
    createdDate: "2024-01-15",
    lastRun: "2024-01-15T09:00:00Z",
    format: "PDF",
    schedule: "Monthly",
    description: "Comprehensive rental income analysis with past due balances",
  },
  {
    id: "2",
    name: "Property Occupancy Report",
    type: "Property",
    dateRange: "Current month",
    status: "Generated",
    createdDate: "2024-01-14",
    lastRun: "2024-01-14T08:30:00Z",
    format: "Excel",
    description: "Property occupancy rates and availability analysis",
  },
  {
    id: "3",
    name: "Tenant Communication Log",
    type: "Marketing",
    dateRange: "Last 7 days",
    status: "Generating",
    createdDate: "2024-01-16",
    format: "CSV",
    description: "Email and SMS communication tracking",
  },
  {
    id: "4",
    name: "Maintenance Requests Summary",
    type: "Maintenance",
    dateRange: "Last 30 days",
    status: "Scheduled",
    createdDate: "2024-01-10",
    format: "PDF",
    schedule: "Weekly",
    description: "Summary of maintenance requests and completion rates",
  },
  {
    id: "5",
    name: "Daily Activity Report",
    type: "Activity",
    dateRange: "Today",
    status: "Generated",
    createdDate: "2024-01-16",
    lastRun: "2024-01-16T08:00:00Z",
    format: "PDF",
    schedule: "Daily",
    description: "Daily summary of all system activities and user actions",
  },
  {
    id: "6",
    name: "Security Audit Trail",
    type: "Audit",
    dateRange: "Last 7 days",
    status: "Generated",
    createdDate: "2024-01-16",
    lastRun: "2024-01-16T06:00:00Z",
    format: "Excel",
    schedule: "Weekly",
    description: "Comprehensive audit trail of all system access and modifications",
  },
  {
    id: "7",
    name: "User Activity Summary",
    type: "Activity",
    dateRange: "Last 30 days",
    status: "Scheduled",
    createdDate: "2024-01-15",
    format: "PDF",
    schedule: "Monthly",
    description: "Monthly summary of user activities and system usage",
  },
];

export default function Reports() {
  const { state } = useCrmData();
  const { properties, tenants } = state;
  const [reports, setReports] = React.useState<Report[]>(mockReports);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("All");
  const [filterStatus, setFilterStatus] = React.useState("All");
  const [filterDateRange, setFilterDateRange] = React.useState("All");
  const [filterProperty, setFilterProperty] = React.useState("All");
  const [filterFormat, setFilterFormat] = React.useState("All");
  const [filterSchedule, setFilterSchedule] = React.useState("All");
  const [customDateFrom, setCustomDateFrom] = React.useState("");
  const [customDateTo, setCustomDateTo] = React.useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [openReportDialog, setOpenReportDialog] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [formData, setFormData] = React.useState({
    name: "",
    type: "Financial" as Report["type"],
    dateRange: "Last 30 days",
    format: "PDF" as Report["format"],
    schedule: "" as Report["schedule"] | "",
    description: "",
    includeCharts: true,
    includeDetails: true,
    filterByProperty: false,
    selectedProperties: [] as string[],
  });

  const handleCreateReport = () => {
    setSelectedReport(null);
    setFormData({
      name: "",
      type: "Financial",
      dateRange: "Last 30 days",
      format: "PDF",
      schedule: "",
      description: "",
      includeCharts: true,
      includeDetails: true,
      filterByProperty: false,
      selectedProperties: [],
    });
    setOpenReportDialog(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setFormData({
      name: report.name,
      type: report.type,
      dateRange: report.dateRange,
      format: report.format,
      schedule: report.schedule || "",
      description: report.description || "",
      includeCharts: true,
      includeDetails: true,
      filterByProperty: false,
      selectedProperties: [],
    });
    setOpenReportDialog(true);
  };

  const handleSaveReport = () => {
    if (selectedReport) {
      setReports(prev => 
        prev.map(r => 
          r.id === selectedReport.id 
            ? { ...r, ...formData, status: "Scheduled" as const }
            : r
        )
      );
    } else {
      const newReport: Report = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        dateRange: formData.dateRange,
        format: formData.format,
        schedule: formData.schedule || undefined,
        description: formData.description,
        status: "Scheduled",
        createdDate: new Date().toISOString().split('T')[0],
      };
      setReports(prev => [...prev, newReport]);
    }
    setOpenReportDialog(false);
  };

  const handleGenerateReport = (reportId: string) => {
    setReports(prev => 
      prev.map(r => 
        r.id === reportId 
          ? { 
              ...r, 
              status: "Generating" as const,
              lastRun: new Date().toISOString()
            }
          : r
      )
    );

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => 
        prev.map(r => 
          r.id === reportId 
            ? { ...r, status: "Generated" as const }
            : r
        )
      );
      alert("Report generated successfully!");
    }, 2000);
  };

  const handleDownloadReport = (report: Report) => {
    alert(`Downloading ${report.name} as ${report.format}...`);
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setFilterType("All");
    setFilterStatus("All");
    setFilterDateRange("All");
    setFilterProperty("All");
    setFilterFormat("All");
    setFilterSchedule("All");
    setCustomDateFrom("");
    setCustomDateTo("");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterType !== "All") count++;
    if (filterStatus !== "All") count++;
    if (filterDateRange !== "All") count++;
    if (filterProperty !== "All") count++;
    if (filterFormat !== "All") count++;
    if (filterSchedule !== "All") count++;
    return count;
  };

  const mockProperties = ["Ocean View Villa", "Sunset Apartments", "Downtown Loft", "Garden Complex", "Luxury Tower"];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "All" || report.type === filterType;
    const matchesStatus = filterStatus === "All" || report.status === filterStatus;
    const matchesDateRange = filterDateRange === "All" || report.dateRange === filterDateRange;
    const matchesFormat = filterFormat === "All" || report.format === filterFormat;
    const matchesSchedule = filterSchedule === "All" ||
      (filterSchedule === "Scheduled" && report.schedule) ||
      (filterSchedule === "One-time" && !report.schedule) ||
      report.schedule === filterSchedule;

    // Custom date range filtering
    let matchesCustomDate = true;
    if (filterDateRange === "Custom" && customDateFrom && customDateTo) {
      const reportDate = new Date(report.createdDate);
      const fromDate = new Date(customDateFrom);
      const toDate = new Date(customDateTo);
      matchesCustomDate = reportDate >= fromDate && reportDate <= toDate;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDateRange &&
           matchesFormat && matchesSchedule && matchesCustomDate;
  });

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "Generated": return "success";
      case "Generating": return "info";
      case "Scheduled": return "warning";
      case "Failed": return "error";
      default: return "default";
    }
  };

  const getTypeColor = (type: Report["type"]) => {
    switch (type) {
      case "Financial": return "success";
      case "Property": return "primary";
      case "Tenant": return "info";
      case "Maintenance": return "warning";
      case "Marketing": return "secondary";
      case "Custom": return "default";
      case "Audit": return "error";
      case "Activity": return "warning";
      default: return "default";
    }
  };

  const totalReports = reports.length;
  const generatedReports = reports.filter(r => r.status === "Generated").length;
  const scheduledReports = reports.filter(r => r.schedule).length;
  const pendingReports = reports.filter(r => r.status === "Generating").length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<AssessmentRoundedIcon />}
            label="Standard Reports"
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            icon={<SecurityRoundedIcon />}
            label="Audit Trail"
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            icon={<TodayRoundedIcon />}
            label="Daily Activity"
            iconPosition="start"
            {...a11yProps(2)}
          />
          <Tab
            icon={<AssessmentRoundedIcon />}
            label="Financial Reports"
            iconPosition="start"
            {...a11yProps(3)}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <AssessmentRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Reports
                  </Typography>
                  <Typography variant="h4">{totalReports}</Typography>
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
                  <FileDownloadRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Generated
                  </Typography>
                  <Typography variant="h4">{generatedReports}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <CalendarTodayRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="h4">{scheduledReports}</Typography>
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
                  ⏳
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Processing
                  </Typography>
                  <Typography variant="h4">{pendingReports}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Search and Filters */}
      <Box sx={{ mb: 3 }}>
        {/* Search Bar */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search reports by name, type, or description..."
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
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
              <Button
                variant={showAdvancedFilters ? "contained" : "outlined"}
                startIcon={<FilterListRoundedIcon />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{ minWidth: 140 }}
              >
                Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
              </Button>
              {getActiveFilterCount() > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ClearRoundedIcon />}
                  onClick={handleClearAllFilters}
                  color="error"
                >
                  Clear All
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Basic Filters Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={filterType}
                label="Report Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Financial">Financial</MenuItem>
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Tenant">Tenant</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Audit">Audit</MenuItem>
                <MenuItem value="Activity">Activity</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Generated">Generated</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Generating">Generating</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filterDateRange}
                label="Date Range"
                onChange={(e) => setFilterDateRange(e.target.value)}
              >
                <MenuItem value="All">All Ranges</MenuItem>
                <MenuItem value="Today">Today</MenuItem>
                <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                <MenuItem value="Last 90 days">Last 90 days</MenuItem>
                <MenuItem value="This Year">This Year</MenuItem>
                <MenuItem value="Custom">Custom Date Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={filterFormat}
                label="Format"
                onChange={(e) => setFilterFormat(e.target.value)}
              >
                <MenuItem value="All">All Formats</MenuItem>
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="Excel">Excel</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Custom Date Range Fields */}
        {filterDateRange === "Custom" && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Select the start date for your custom range"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Select the end date for your custom range"
                inputProps={{ min: customDateFrom }}
              />
            </Grid>
          </Grid>
        )}

        {/* Advanced Filters Accordion */}
        {showAdvancedFilters && (
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Typography variant="h6">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Property Filter</InputLabel>
                    <Select
                      value={filterProperty}
                      label="Property Filter"
                      onChange={(e) => setFilterProperty(e.target.value)}
                    >
                      <MenuItem value="All">All Properties</MenuItem>
                      {mockProperties.map((property) => (
                        <MenuItem key={property} value={property}>{property}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Schedule Type</InputLabel>
                    <Select
                      value={filterSchedule}
                      label="Schedule Type"
                      onChange={(e) => setFilterSchedule(e.target.value)}
                    >
                      <MenuItem value="All">All Schedules</MenuItem>
                      <MenuItem value="One-time">One-time Reports</MenuItem>
                      <MenuItem value="Scheduled">Scheduled Reports</MenuItem>
                      <MenuItem value="Daily">Daily</MenuItem>
                      <MenuItem value="Weekly">Weekly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                      <MenuItem value="Quarterly">Quarterly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Filter Tips:</strong> Use multiple filters to narrow down results.
                      Search works across report names, types, and descriptions.
                      Custom date ranges filter by report creation date.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Active Filters:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`Search: "${searchTerm}"`}
                  onDelete={() => setSearchTerm("")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filterType !== "All" && (
                <Chip
                  label={`Type: ${filterType}`}
                  onDelete={() => setFilterType("All")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filterStatus !== "All" && (
                <Chip
                  label={`Status: ${filterStatus}`}
                  onDelete={() => setFilterStatus("All")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filterDateRange !== "All" && (
                <Chip
                  label={`Date: ${filterDateRange}`}
                  onDelete={() => setFilterDateRange("All")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filterFormat !== "All" && (
                <Chip
                  label={`Format: ${filterFormat}`}
                  onDelete={() => setFilterFormat("All")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filterSchedule !== "All" && (
                <Chip
                  label={`Schedule: ${filterSchedule}`}
                  onDelete={() => setFilterSchedule("All")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {filterProperty !== "All" && (
                <Chip
                  label={`Property: ${filterProperty}`}
                  onDelete={() => setFilterProperty("All")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Results Summary */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Showing {filteredReports.length} of {reports.length} reports
          {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} applied)`}
        </Typography>
      </Box>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Run</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      📊 {report.name}
                    </Typography>
                    {report.description && (
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                    )}
                    {report.schedule && (
                      <Chip 
                        label={`${report.schedule} Schedule`} 
                        size="small" 
                        variant="outlined"
                        color="info"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.type}
                    color={getTypeColor(report.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{report.dateRange}</TableCell>
                <TableCell>
                  <Chip
                    label={report.format}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={report.status}
                    color={getStatusColor(report.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {report.lastRun ? new Date(report.lastRun).toLocaleString() : "Never"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {report.status === "Generated" && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={() => handleDownloadReport(report)}
                      >
                        Download
                      </Button>
                    )}
                    {(report.status === "Scheduled" || report.status === "Failed") && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        Generate
                      </Button>
                    )}
                    <Tooltip title="View/Edit Report">
                      <IconButton
                        size="small"
                        onClick={() => handleEditReport(report)}
                      >
                        <VisibilityRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Security Audit Trail
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Complete audit trail of all system activities, user actions, and security events.
        </Typography>
        <AuditTrail height={700} showFilters={true} />
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Daily Activity Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Daily summary of system activities, user actions, and key metrics.
        </Typography>

        {/* Quick Stats for Today */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>📊</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Today's Actions
                    </Typography>
                    <Typography variant="h4">127</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>👥</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Active Users
                    </Typography>
                    <Typography variant="h4">24</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>💰</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Payments Today
                    </Typography>
                    <Typography variant="h4">$8,450</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>🔧</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Work Orders
                    </Typography>
                    <Typography variant="h4">7</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <AuditTrail height={600} showFilters={false} />

        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => alert("Generating daily activity report...")}
          >
            Download Today's Report
          </Button>
        </Stack>
      </TabPanel>

      {/* Financial Reports Tab */}
      <TabPanel value={currentTab} index={3}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Financial Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Monthly income and expenses by property grouping, with filtering by tags, type, and location.
        </Typography>

        {/* Financial Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Group By</InputLabel>
                  <Select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)} label="Group By">
                    <MenuItem value="All">All Properties</MenuItem>
                    <MenuItem value="Type">Property Type</MenuItem>
                    <MenuItem value="Tag">Tags</MenuItem>
                    <MenuItem value="Manager">Property Manager</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>{property.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="From Date"
                  type="date"
                  fullWidth
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="To Date"
                  type="date"
                  fullWidth
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={() => {
                    const reportData = properties.map(p => ({
                      propertyName: p.name,
                      monthlyIncome: p.status === 'Occupied' ? p.monthlyRent : 0,
                      type: p.type,
                      tags: p.tags?.join(', ') || 'None'
                    }));
                    console.log('Generating financial report for:', reportData);
                    alert('Financial report generated! Check downloads folder.');
                  }}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>💰</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Monthly Income</Typography>
                    <Typography variant="h4">
                      ${properties.reduce((sum, p) => sum + (p.status === 'Occupied' ? p.monthlyRent : 0), 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>🏠</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Occupied Units</Typography>
                    <Typography variant="h4">
                      {properties.reduce((sum, p) => sum + p.occupancy, 0)} / {properties.reduce((sum, p) => sum + p.units, 0)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "info.main" }}>📊</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Occupancy Rate</Typography>
                    <Typography variant="h4">
                      {properties.length > 0 ? Math.round((properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.reduce((sum, p) => sum + p.units, 0)) * 100) : 0}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>🏢</Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Properties</Typography>
                    <Typography variant="h4">{properties.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Income by Property Type Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Monthly Income by Property Type</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const typeData = properties.reduce((acc, property) => {
                  const income = property.status === 'Occupied' ? property.monthlyRent : 0;
                  acc[property.type] = (acc[property.type] || 0) + income;
                  return acc;
                }, {} as Record<string, number>);
                return Object.entries(typeData).map(([type, income]) => ({ type, income }));
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Income']} />
                <Bar dataKey="income" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Income Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Property Income Details</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Property Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Monthly Rent</TableCell>
                    <TableCell>Occupancy</TableCell>
                    <TableCell>Tags</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>{property.name}</TableCell>
                      <TableCell>{property.type}</TableCell>
                      <TableCell>
                        <Chip label={property.status} color={property.status === 'Occupied' ? 'success' : 'warning'} size="small" />
                      </TableCell>
                      <TableCell>${property.monthlyRent.toLocaleString()}</TableCell>
                      <TableCell>{property.occupancy}/{property.units}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {property.tags?.slice(0, 2).map((tag, index) => (
                            <Chip key={index} label={tag} size="small" variant="outlined" />
                          ))}
                          {(property.tags?.length || 0) > 2 && (
                            <Chip label={`+${(property.tags?.length || 0) - 2}`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Create/Edit Report Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReport ? "Edit Report" : "Create New Report"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Report Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Report Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Report["type"] })}
                  >
                    <MenuItem value="Financial">Financial</MenuItem>
                    <MenuItem value="Property">Property</MenuItem>
                    <MenuItem value="Tenant">Tenant</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Custom">Custom</MenuItem>
                    <MenuItem value="Audit">Audit Trail</MenuItem>
                    <MenuItem value="Activity">Daily Activity</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={formData.dateRange}
                    label="Date Range"
                    onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                  >
                    <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                    <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                    <MenuItem value="Last 3 months">Last 3 months</MenuItem>
                    <MenuItem value="Last 6 months">Last 6 months</MenuItem>
                    <MenuItem value="Last year">Last year</MenuItem>
                    <MenuItem value="Current month">Current month</MenuItem>
                    <MenuItem value="Current year">Current year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Output Format</InputLabel>
                  <Select
                    value={formData.format}
                    label="Output Format"
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as Report["format"] })}
                  >
                    <MenuItem value="PDF">PDF</MenuItem>
                    <MenuItem value="Excel">Excel</MenuItem>
                    <MenuItem value="CSV">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Schedule (Optional)</InputLabel>
                  <Select
                    value={formData.schedule}
                    label="Schedule (Optional)"
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value as Report["schedule"] | "" })}
                  >
                    <MenuItem value="">One-time only</MenuItem>
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Stack spacing={2}>
              <Typography variant="h6">Report Options</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeCharts}
                    onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                  />
                }
                label="Include Charts and Graphs"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeDetails}
                    onChange={(e) => setFormData({ ...formData, includeDetails: e.target.checked })}
                  />
                }
                label="Include Detailed Data"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.filterByProperty}
                    onChange={(e) => setFormData({ ...formData, filterByProperty: e.target.checked })}
                  />
                }
                label="Filter by Specific Properties"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveReport}>
            {selectedReport ? "Update" : "Create"} Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
