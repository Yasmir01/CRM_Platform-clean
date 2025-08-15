import * as React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useCrmData } from "../contexts/CrmDataContext";

interface CrmQuickInsightsProps {
  maxHeight?: number;
}

export default function CrmQuickInsights({ maxHeight = 400 }: CrmQuickInsightsProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state } = useCrmData();

  // Calculate insights from CRM data
  const { properties = [], tenants = [] } = state || {};

  const insights = React.useMemo(() => {
    const totalProperties = properties.length;
    const activeTenants = tenants.filter(t => t.status === "Active").length;
    const occupiedProperties = properties.filter(p => p.status === "Occupied").length;
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
    
    // Calculate monthly revenue
    const monthlyRevenue = tenants
      .filter(t => t.status === "Active" && t.monthlyRent)
      .reduce((sum, t) => sum + (t.monthlyRent || 0), 0);

    // Calculate leases expiring soon
    const today = new Date();
    const threeMonthsFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringSoon = tenants.filter(t => {
      if (!t.leaseEnd || t.status !== "Active") return false;
      const leaseEndDate = new Date(t.leaseEnd);
      return leaseEndDate <= threeMonthsFromNow && leaseEndDate >= today;
    }).length;

    // Calculate vacant properties
    const vacantProperties = properties.filter(p => p.status === "Vacant").length;

    return [
      {
        id: 1,
        title: "Occupancy Rate",
        value: `${occupancyRate}%`,
        subtitle: `${occupiedProperties}/${totalProperties} properties`,
        trend: occupancyRate >= 90 ? "up" : occupancyRate >= 70 ? "flat" : "down",
        color: occupancyRate >= 90 ? "success" : occupancyRate >= 70 ? "warning" : "error",
        icon: <HomeIcon />,
        progress: occupancyRate,
        action: () => navigate("/crm/properties")
      },
      {
        id: 2,
        title: "Monthly Revenue",
        value: `$${(monthlyRevenue / 1000).toFixed(1)}K`,
        subtitle: `From ${activeTenants} active tenants`,
        trend: monthlyRevenue > 0 ? "up" : "flat",
        color: monthlyRevenue > 0 ? "success" : "default",
        icon: <AttachMoneyIcon />,
        progress: Math.min(100, (monthlyRevenue / 50000) * 100), // Assuming 50K target
        action: () => navigate("/crm/reports")
      },
      {
        id: 3,
        title: "Leases Expiring",
        value: expiringSoon.toString(),
        subtitle: "In next 3 months",
        trend: expiringSoon > 2 ? "down" : "flat",
        color: expiringSoon > 2 ? "warning" : "success",
        icon: <CalendarTodayIcon />,
        progress: Math.min(100, (expiringSoon / Math.max(1, activeTenants)) * 100),
        action: () => navigate("/crm/tenants")
      },
      {
        id: 4,
        title: "Vacant Properties",
        value: vacantProperties.toString(),
        subtitle: "Ready for marketing",
        trend: vacantProperties > 2 ? "down" : "flat",
        color: vacantProperties > 2 ? "error" : "success",
        icon: <PersonIcon />,
        progress: Math.min(100, (vacantProperties / Math.max(1, totalProperties)) * 100),
        action: () => navigate("/crm/properties")
      }
    ];
  }, [properties, tenants, navigate]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUpIcon sx={{ fontSize: 16 }} />;
      case "down":
        return <TrendingDownIcon sx={{ fontSize: 16 }} />;
      default:
        return <TrendingFlatIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "primary";
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: 300, sm: 350, md: 400 },
        maxHeight: maxHeight,
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ p: 2, pb: 1 }}
        >
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 600
            }}
          >
            Quick Insights
          </Typography>
          <Button 
            endIcon={<ArrowForwardRoundedIcon />} 
            size="small"
            onClick={() => navigate("/crm/analytics")}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 }
            }}
          >
            View Analytics
          </Button>
        </Stack>

        <List 
          sx={{ 
            width: "100%", 
            bgcolor: "background.paper",
            overflow: "auto",
            maxHeight: maxHeight - 120,
            px: { xs: 1, sm: 2 }
          }}
        >
          {insights.map((insight) => (
            <ListItem
              key={insight.id}
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                onClick={insight.action}
                sx={{
                  py: { xs: 1.5, sm: 1 },
                  px: { xs: 1, sm: 2 },
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: theme.palette.action.hover,
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: `${insight.color}.main`,
                      color: 'white'
                    }}
                  >
                    {React.cloneElement(insight.icon, { sx: { fontSize: 18 } })}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.9rem' },
                          fontWeight: 600
                        }}
                      >
                        {insight.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            fontWeight: 700,
                            color: `${insight.color}.main`
                          }}
                        >
                          {insight.value}
                        </Typography>
                        <Chip
                          icon={getTrendIcon(insight.trend)}
                          label=""
                          size="small"
                          color={insight.color as any}
                          variant="outlined"
                          sx={{
                            width: 24,
                            height: 24,
                            "& .MuiChip-label": { display: 'none' },
                            "& .MuiChip-icon": { margin: 0 }
                          }}
                        />
                      </Stack>
                    </Stack>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          display: 'block',
                          mb: 0.5
                        }}
                      >
                        {insight.subtitle}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={insight.progress}
                        color={getProgressColor(insight.color) as any}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: theme.palette.action.hover
                        }}
                      />
                    </Box>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <Tooltip title="View Details">
                  <IconButton edge="end" size="small">
                    <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
