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
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { useCrmData } from '../contexts/CrmDataContext';
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
  children?: ReactNode;
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

// Month labels for charts
const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AnalyticsInsights() {
  const [currentTab, setCurrentTab] = useState(0);
  const [timeRange, setTimeRange] = useState("6months");
  const { state } = useCrmData();

  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [pRes, sRes, plRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/subscriptions'),
        fetch('/api/subscription-plans'),
      ]);
      const [p, s, pl] = await Promise.all([pRes.json(), sRes.json(), plRes.json()]);
      setPayments(Array.isArray(p) ? p : []);
      setSubscriptions(Array.isArray(s) ? s : []);
      setPlans(Array.isArray(pl) ? pl : []);
    } catch {
      setPayments([]); setSubscriptions([]); setPlans([]);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const revenueData = useMemo(() => {
    const now = new Date();
    const months: { key: string; month: string; year: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: monthLabels[d.getMonth()], year: d.getFullYear(), revenue: 0 });
    }
    const map = new Map(months.map(m => [m.key, m]));
    for (const pay of payments) {
      const dt = new Date(pay.createdAt);
      const k = `${dt.getFullYear()}-${dt.getMonth()}`;
      const target = map.get(k);
      if (target) target.revenue += Number(pay.amount || 0);
    }
    return months.map(m => ({ month: m.month, revenue: m.revenue, properties: state.properties.length, tenants: state.tenants.length }));
  }, [payments, state.properties.length, state.tenants.length]);

  const salesFunnelData = useMemo(() => {
    const stages = ['Lead','Qualified','Proposal','Negotiation','Closed Won','Closed Lost'] as const;
    const counts: Record<string, number> = Object.fromEntries(stages.map(s => [s, 0]));
    const values: Record<string, number> = Object.fromEntries(stages.map(s => [s, 0]));
    state.deals.forEach(d => { counts[d.stage] = (counts[d.stage]||0)+1; values[d.stage] = (values[d.stage]||0) + (Number(d.value)||0); });
    return stages.map(s => ({ stage: s, count: counts[s], value: values[s] }));
  }, [state.deals]);

  const leadSourceData = useMemo(() => {
    const colors = ['#0088FE','#00C49F','#FFBB28','#FF8042','#8884D8','#AA66CC'];
    const bySource = new Map<string, number>();
    state.contacts.forEach(c => { const src = c.source || 'Other'; bySource.set(src, (bySource.get(src)||0)+1); });
    const entries = Array.from(bySource.entries());
    const total = entries.reduce((s,[,v])=>s+v,0) || 1;
    return entries.map(([name, v], i) => ({ name, value: Math.round((v/total)*100), color: colors[i % colors.length] }));
  }, [state.contacts]);

  const marketingMetrics = useMemo(() => {
    const agg: Record<string, { channel: string; sent: number; opened: number; clicked: number; converted: number }>= {};
    state.campaigns.forEach(c => {
      const key = c.type;
      if (!agg[key]) agg[key] = { channel: key, sent: 0, opened: 0, clicked: 0, converted: 0 } as any;
      agg[key].sent += c.metrics?.sent || 0;
      agg[key].opened += c.metrics?.opened || 0;
      agg[key].clicked += c.metrics?.clicked || 0;
      agg[key].converted += c.metrics?.converted || 0;
    });
    return Object.values(agg);
  }, [state.campaigns]);

  const propertyPerformance = useMemo(() => {
    return state.properties.slice(0, 9).map(p => ({
      property: p.name,
      occupancy: Math.max(0, Math.min(100, Number(p.occupancy) || 0)),
      revenue: Number(p.monthlyRent) || 0,
      satisfaction: Math.max(1, Math.min(5, 3 + (Number(p.occupancy)||0)/25)),
    }));
  }, [state.properties]);

  const customerLifetimeValue = useMemo(() => {
    const planMap = new Map(plans.map((pl: any) => [pl.id, pl]));
    const byPlan: Record<string, { segment: string; customers: number; clv: number; canceled: number }>= {};
    const payBySubId = new Map<string, number>();
    payments.forEach(p => { const k = p.subscriptionId; if (k) payBySubId.set(k, (payBySubId.get(k)||0) + Number(p.amount||0)); });
    subscriptions.forEach(sub => {
      const plan = sub.planId ? planMap.get(sub.planId) : undefined;
      const seg = plan?.name || 'Unknown';
      if (!byPlan[seg]) byPlan[seg] = { segment: seg, customers: 0, clv: 0, canceled: 0 };
      byPlan[seg].customers += 1;
      byPlan[seg].clv += payBySubId.get(sub.id) || 0;
      if (sub.status === 'canceled') byPlan[seg].canceled += 1;
    });
    return Object.values(byPlan).map(x => ({ segment: x.segment, customers: x.customers, clv: x.clv, retention: x.customers ? Math.round(((x.customers - x.canceled)/x.customers)*100) : 0 }));
  }, [subscriptions, payments, plans]);

  const kpiMetrics = useMemo(() => {
    const totalRevenue = payments.reduce((s,p)=>s+Number(p.amount||0),0);
    const now = new Date();
    const lastMonthKey = `${now.getFullYear()}-${now.getMonth()-1}`;
    const prevMonthKey = `${now.getFullYear()}-${now.getMonth()-2}`;
    const sumForKey = (key:string) => payments.filter(p=>{ const d=new Date(p.createdAt); return `${d.getFullYear()}-${d.getMonth()}`===key; }).reduce((s,p)=>s+Number(p.amount||0),0);
    const lm = sumForKey(lastMonthKey); const pm = sumForKey(prevMonthKey);
    const revenueGrowth = pm ? ((lm-pm)/pm)*100 : 0;
    const totalCustomers = state.contacts.filter(c=>['Customer','Active'].includes(c.status)).length;
    const avgDealSize = state.deals.length ? state.deals.reduce((s,d)=>s+Number(d.value||0),0)/state.deals.length : 0;
    const closed = state.deals.filter(d=>d.stage==='Closed Won');
    const salesCycleLength = closed.length ? Math.round(closed.reduce((s,d)=>s+(new Date(d.updatedAt).getTime()-new Date(d.createdAt).getTime()),0)/closed.length/ (1000*60*60*24)) : 0;
    const active = subscriptions.filter((s:any)=>s.status==='active').length;
    const canceled30 = subscriptions.filter((s:any)=>s.status==='canceled' && s.endDate && (Date.now()-new Date(s.endDate).getTime())<=30*24*60*60*1000).length;
    const churnRate = active ? (canceled30/(active+canceled30))*100 : 0;
    return {
      totalRevenue,
      revenueGrowth,
      totalCustomers,
      customerGrowth: 0,
      avgDealSize,
      dealSizeGrowth: 0,
      salesCycleLength,
      cycleGrowth: 0,
      churnRate,
      churnChange: 0,
      netPromoterScore: 0,
      npsChange: 0,
    };
  }, [payments, state.contacts, state.deals, subscriptions]);

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
            onClick={refresh}
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
