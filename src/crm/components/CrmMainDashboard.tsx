import * as React from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Copyright from "../../dashboard/internals/components/Copyright";
import CrmStatCard from "./CrmStatCard";
import CrmRecentActivitiesTable from "./CrmRecentActivitiesTable";
import CrmUpcomingTasks from "./CrmUpcomingTasks";
import CrmQuickInsights from "./CrmQuickInsights";
import UniversalDashboardLayout from "./UniversalDashboardLayout";
import CrmSalesChart from "./CrmSalesChart";
import CrmLeadsBySourceChart from "./CrmLeadsBySourceChart";
import DashboardReminders from "./DashboardReminders";
import DashboardNotificationsPanel from "./DashboardNotificationsPanel";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { useCrmData } from "../contexts/CrmDataContext";
import { useAuth } from "../contexts/AuthContext";

export default function CrmMainDashboard() {
  const navigate = useNavigate();
  const { state } = useCrmData();
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = React.useState(new Date());

  // Monitor performance to prevent blank screens
  const { getMetrics } = usePerformanceMonitor('CrmMainDashboard');

  // Calculate real stats from CRM data
  const { properties = [], tenants = [] } = state || {};

  const totalProperties = properties.length;
  const activeTenants = tenants.filter(t => t.status === "Active").length;
  const occupiedProperties = properties.filter(p => p.status === "Occupied").length;
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

  // Calculate monthly revenue from active tenants
  const monthlyRevenue = tenants
    .filter(t => t.status === "Active" && t.monthlyRent)
    .reduce((sum, t) => sum + (t.monthlyRent || 0), 0);

  // Generate trending data for charts (simplified for now)
  const generateTrendData = (currentValue: number, days = 30) => {
    const data = [];
    const variation = currentValue * 0.1; // 10% variation
    for (let i = days; i > 0; i--) {
      const randomVariation = (Math.random() - 0.5) * variation;
      data.push(Math.max(0, Math.round(currentValue + randomVariation)));
    }
    return data;
  };

  const statCardsData = [
    {
      title: "Total Properties",
      value: totalProperties.toString(),
      interval: "Real-time data",
      trend: totalProperties > 0 ? "up" as const : "neutral" as const,
      trendValue: totalProperties > 0 ? `${totalProperties}` : "0",
      data: generateTrendData(totalProperties),
    },
    {
      title: "Monthly Revenue",
      value: `$${(monthlyRevenue / 1000).toFixed(0)}K`,
      interval: "Active tenants",
      trend: monthlyRevenue > 0 ? "up" as const : "neutral" as const,
      trendValue: monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString()}` : "$0",
      data: generateTrendData(monthlyRevenue / 1000),
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      interval: "Real-time data",
      trend: occupancyRate > 80 ? "up" as const : occupancyRate > 50 ? "neutral" as const : "down" as const,
      trendValue: `${occupiedProperties}/${totalProperties}`,
      data: generateTrendData(occupancyRate),
    },
    {
      title: "Active Tenants",
      value: activeTenants.toString(),
      interval: "Real-time data",
      trend: activeTenants > 0 ? "up" as const : "neutral" as const,
      trendValue: activeTenants > 0 ? `${activeTenants}` : "0",
      data: generateTrendData(activeTenants),
    },
  ];

  // Update date and time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleAddProperty = () => {
    navigate('/properties');
    // Simulate clicking the "Add Property" button after navigation
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="add-property-button"]') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
      }
    }, 100);
  };

  const handleAddTenant = () => {
    navigate('/tenants');
    // Simulate clicking the "Add Tenant" button after navigation
    setTimeout(() => {
      const addButton = document.querySelector('[data-testid="add-tenant-button"]') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
      }
    }, 100);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { sm: "100%", md: "1700px" },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 77, 77, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(156, 39, 176, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: -1,
        }
      }}
    >
      {/* Enhanced Header with gradient background */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            zIndex: 0,
          }
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome Back, {user?.firstName || 'User'} 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Here's what's happening with your properties today
              </Typography>
            </Box>
            <Stack spacing={2} alignItems={{ xs: "flex-start", sm: "flex-end" }}>
              {/* Date and Time Display */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    opacity: 0.95,
                    textAlign: { xs: "left", sm: "right" }
                  }}
                >
                  {formatDateTime(currentDateTime)}
                </Typography>
              </Stack>

              {/* Action Buttons */}
              {user?.role !== 'Tenant' && user?.role !== 'Service Provider' && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddProperty}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      }
                    }}
                  >
                    Add Property
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddTenant}
                    sx={{
                      borderColor: "rgba(255,255,255,0.5)",
                      color: "white",
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      }
                    }}
                  >
                    Add Tenant
                  </Button>
                </Stack>
              )}

              {user?.role === 'Tenant' && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button variant="contained" onClick={() => navigate('/crm/rent-collection')}>Pay Rent</Button>
                  <Button variant="outlined" onClick={() => navigate('/crm/work-orders')}>Submit Task</Button>
                  <Button variant="outlined" onClick={() => navigate('/crm/suggestions')}>Share Suggestion</Button>
                  <Button variant="outlined" onClick={() => navigate('/crm/communications')}>Communicate</Button>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Dashboard Reminders */}
      <DashboardReminders />

      {/* Dashboard Notifications Panel */}
      <DashboardNotificationsPanel />

      {user?.role !== 'Tenant' && user?.role !== 'Service Provider' && (<>
      {/* Stats Cards row with enhanced spacing */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCardsData.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <CrmStatCard
              title={card.title}
              value={card.value}
              interval={card.interval}
              trend={card.trend as "up" | "down"}
              trendValue={card.trendValue}
              data={card.data}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts row with enhanced spacing */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Box sx={{
            borderRadius: 3,
            overflow: "hidden",
            "& .MuiCard-root": {
              borderRadius: 3,
            }
          }}>
            <CrmSalesChart />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{
            borderRadius: 3,
            overflow: "hidden",
            "& .MuiCard-root": {
              borderRadius: 3,
            }
          }}>
            <CrmLeadsBySourceChart />
          </Box>
        </Grid>
      </Grid>

      {/* Universal Draggable Widgets Section */}
      <UniversalDashboardLayout
        storageKey="crm-main-dashboard-layout"
        defaultLayouts={{
          'recent-activities': { x: 20, y: 20, width: 820, height: 400 },
          'upcoming-tasks': { x: 20, y: 440, width: 400, height: 350 },
          'quick-insights': { x: 440, y: 440, width: 400, height: 350 }
        }}
      >
        <div
          data-widget-id="recent-activities"
          data-widget-title="Recent Activities"
        >
          <CrmRecentActivitiesTable />
        </div>
        <div
          data-widget-id="upcoming-tasks"
          data-widget-title="Upcoming Tasks"
        >
          <CrmUpcomingTasks maxHeight={350} />
        </div>
        <div
          data-widget-id="quick-insights"
          data-widget-title="Quick Insights"
        >
          <CrmQuickInsights maxHeight={350} />
        </div>
      </UniversalDashboardLayout>
      </>)}

      <Copyright sx={{ mt: 3, mb: 4 }} />
    </Box>
  );
}
