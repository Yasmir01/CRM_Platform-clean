import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import MouseRoundedIcon from "@mui/icons-material/MouseRounded";
import ConversionIcon from "@mui/icons-material/Transform";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for analytics
const revenueData = [
  { month: 'Jan', revenue: 45000, properties: 28, tenants: 145 },
  { month: 'Feb', revenue: 52000, properties: 32, tenants: 168 },
  { month: 'Mar', revenue: 48000, properties: 30, tenants: 156 },
  { month: 'Apr', revenue: 61000, properties: 38, tenants: 201 },
  { month: 'May', revenue: 55000, properties: 35, tenants: 185 },
  { month: 'Jun', revenue: 67000, properties: 42, tenants: 223 },
];

const salesFunnelData = [
  { stage: 'Leads', count: 1250, value: 2500000 },
  { stage: 'Qualified', count: 425, value: 1850000 },
  { stage: 'Proposals', count: 185, value: 920000 },
  { stage: 'Negotiations', count: 78, value: 650000 },
  { stage: 'Closed Won', count: 32, value: 480000 },
];

const marketingMetrics = [
  { channel: 'Email', sent: 15420, opened: 6842, clicked: 1368, converted: 274 },
  { channel: 'Social Media', sent: 8960, opened: 4032, clicked: 896, converted: 179 },
  { channel: 'Google Ads', sent: 5240, opened: 2095, clicked: 472, converted: 118 },
  { channel: 'Direct Mail', sent: 2850, opened: 1140, clicked: 171, converted: 57 },
];

const propertyPerformance = [
  { property: 'Sunset Apartments', occupancy: 95, revenue: 45000, satisfaction: 4.8 },
  { property: 'Ocean View Villa', occupancy: 88, revenue: 38000, satisfaction: 4.6 },
  { property: 'Downtown Lofts', occupancy: 92, revenue: 52000, satisfaction: 4.7 },
  { property: 'Garden Heights', occupancy: 78, revenue: 28000, satisfaction: 4.2 },
  { property: 'Harbor Bay', occupancy: 85, revenue: 41000, satisfaction: 4.5 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: '#0088FE' },
  { name: 'Referrals', value: 28, color: '#00C49F' },
  { name: 'Social Media', value: 18, color: '#FFBB28' },
  { name: 'Cold Calls', value: 12, color: '#FF8042' },
  { name: 'Events', value: 7, color: '#8884D8' },
];

const customerLifetimeValue = [
  { segment: 'Enterprise', customers: 45, clv: 125000, retention: 95 },
  { segment: 'Mid-Market', customers: 128, clv: 65000, retention: 88 },
  { segment: 'Small Business', customers: 267, clv: 28000, retention: 72 },
  { segment: 'Startup', customers: 89, clv: 15000, retention: 65 },
];

const kpiMetrics = {
  totalRevenue: 298000,
  revenueGrowth: 12.5,
  totalCustomers: 529,
  customerGrowth: 8.3,
  avgDealSize: 45000,
  dealSizeGrowth: -2.1,
  salesCycleLength: 45,
  cycleGrowth: -5.2,
  churnRate: 3.2,
  churnChange: -0.8,
  netPromoterScore: 72,
  npsChange: 4.1,
};

export default function AnalyticsInsights() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [timeRange, setTimeRange] = React.useState("6months");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const TrendIndicator = ({ value, isPositive }: { value: number; isPositive?: boolean }) => {
    const positive = isPositive !== undefined ? isPositive : value > 0;
    const Icon = positive ? TrendingUpRoundedIcon : TrendingDownRoundedIcon;
    const color = positive ? 'success.main' : 'error.main';
    
    return (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Icon sx={{ fontSize: 16, color }} />
        <Typography variant="caption" color={color} fontWeight="medium">
          {Math.abs(value).toFixed(1)}%
        </Typography>
      </Stack>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Analytics & Insights
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => console.log('Refresh data')}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={() => console.log('Export analytics')}
          >
            Export
          </Button>
        </Stack>
      </Stack>

      {/* Key Performance Indicators */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    <MonetizationOnRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(kpiMetrics.totalRevenue)}
                </Typography>
                <TrendIndicator value={kpiMetrics.revenueGrowth} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: "info.main", width: 32, height: 32 }}>
                    <PeopleRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Total Customers
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {kpiMetrics.totalCustomers.toLocaleString()}
                </Typography>
                <TrendIndicator value={kpiMetrics.customerGrowth} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
                    <SellRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Avg Deal Size
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(kpiMetrics.avgDealSize)}
                </Typography>
                <TrendIndicator value={kpiMetrics.dealSizeGrowth} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: "warning.main", width: 32, height: 32 }}>
                    <SpeedRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Sales Cycle
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {kpiMetrics.salesCycleLength} days
                </Typography>
                <TrendIndicator value={kpiMetrics.cycleGrowth} isPositive={kpiMetrics.cycleGrowth < 0} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: "error.main", width: 32, height: 32 }}>
                    <TrendingDownRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Churn Rate
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {formatPercentage(kpiMetrics.churnRate)}
                </Typography>
                <TrendIndicator value={kpiMetrics.churnChange} isPositive={kpiMetrics.churnChange < 0} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
                    <StarRoundedIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    NPS Score
                  </Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                  {kpiMetrics.netPromoterScore}
                </Typography>
                <TrendIndicator value={kpiMetrics.npsChange} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<MonetizationOnRoundedIcon />}
            label="Revenue"
            iconPosition="start"
          />
          <Tab
            icon={<SellRoundedIcon />}
            label="Sales"
            iconPosition="start"
          />
          <Tab
            icon={<CampaignRoundedIcon />}
            label="Marketing"
            iconPosition="start"
          />
          <Tab
            icon={<HomeWorkRoundedIcon />}
            label="Properties"
            iconPosition="start"
          />
          <Tab
            icon={<PeopleRoundedIcon />}
            label="Customers"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Revenue Analytics Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="revenue" orientation="left" />
                    <YAxis yAxisId="properties" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(Number(value)) : value,
                        name === 'revenue' ? 'Revenue' : name === 'properties' ? 'Properties' : 'Tenants'
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      fill="#8884d8"
                      stroke="#8884d8"
                      fillOpacity={0.6}
                      name="revenue"
                    />
                    <Bar yAxisId="properties" dataKey="properties" fill="#82ca9d" name="properties" />
                    <Line yAxisId="properties" type="monotone" dataKey="tenants" stroke="#ffc658" name="tenants" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Breakdown
                </Typography>
                <List>
                  {[
                    { label: 'Property Rent', value: 245000, color: '#0088FE' },
                    { label: 'Service Fees', value: 35000, color: '#00C49F' },
                    { label: 'Late Fees', value: 12000, color: '#FFBB28' },
                    { label: 'Other Income', value: 6000, color: '#FF8042' },
                  ].map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={formatCurrency(item.value)}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sales Analytics Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sales Funnel
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesFunnelData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={80} />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lead Sources
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Marketing Analytics Tab */}
      <TabPanel value={currentTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Marketing Channel Performance
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={marketingMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
                <Bar dataKey="converted" fill="#ff7300" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Property Analytics Tab */}
      <TabPanel value={currentTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Property Performance Dashboard
            </Typography>
            <Grid container spacing={2}>
              {propertyPerformance.map((property, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        {property.property}
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              Occupancy
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {property.occupancy}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={property.occupancy}
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                          />
                        </Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Monthly Revenue
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(property.revenue)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Satisfaction
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <StarRoundedIcon fontSize="small" color="warning" />
                            <Typography variant="body2" fontWeight="medium">
                              {property.satisfaction}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Customer Analytics Tab */}
      <TabPanel value={currentTab} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Lifetime Value by Segment
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={customerLifetimeValue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis yAxisId="clv" orientation="left" />
                <YAxis yAxisId="retention" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'clv' ? formatCurrency(Number(value)) : `${value}%`,
                    name === 'clv' ? 'CLV' : name === 'retention' ? 'Retention' : 'Customers'
                  ]}
                />
                <Legend />
                <Bar yAxisId="clv" dataKey="clv" fill="#8884d8" name="clv" />
                <Bar yAxisId="clv" dataKey="customers" fill="#82ca9d" name="customers" />
                <Line yAxisId="retention" type="monotone" dataKey="retention" stroke="#ffc658" name="retention" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}
