import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { BarChart } from "@mui/x-charts/BarChart";
import { useCrmData } from "../contexts/CrmDataContext";

export default function CrmSalesChart() {
  const theme = useTheme();
  const { state } = useCrmData();
  const [timeRange, setTimeRange] = React.useState("year");
  const [customDialogOpen, setCustomDialogOpen] = React.useState(false);
  const [customDateRange, setCustomDateRange] = React.useState({
    startDate: '',
    endDate: ''
  });

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null,
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const handleCustomDateApply = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setTimeRange('custom');
      setCustomDialogOpen(false);
      // In a real app, this would trigger data fetching with the custom date range
      console.log('Applied custom date range:', customDateRange);
    }
  };

  const getDisplayLabel = () => {
    switch (timeRange) {
      case 'month': return 'Month';
      case 'quarter': return 'Quarter';
      case 'ytd': return 'Year to Date';
      case 'year': return 'Year';
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          return `${new Date(customDateRange.startDate).toLocaleDateString()} - ${new Date(customDateRange.endDate).toLocaleDateString()}`;
        }
        return 'Custom Range';
      default: return 'Year';
    }
  };

  // Generate monthly data
  const currentYear = new Date().getFullYear();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Calculate real rental income from CRM data
  const { rentalIncomeData, pastDueData, previousYearData } = React.useMemo(() => {
    if (!state?.initialized) {
      // Fallback to demo data if CRM not loaded
      return {
        rentalIncomeData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        pastDueData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        previousYearData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    }

    const { tenants = [] } = state;
    const activeTenants = tenants.filter((t: any) => t.status === "Active");
    const currentMonthlyIncome = activeTenants.reduce((sum: number, tenant: any) =>
      sum + (tenant.monthlyRent || 0), 0
    );

    // Calculate outstanding balances (past due)
    const totalPastDue = activeTenants.reduce((sum: number, tenant: any) =>
      sum + (tenant.balance || 0), 0
    );

    // Generate realistic monthly data based on current income
    const baseIncome = currentMonthlyIncome;
    const monthlyIncomes = Array.from({ length: 12 }, (_, i) => {
      // Add some variation (±5%) to simulate realistic monthly changes
      const variation = (Math.random() - 0.5) * 0.1;
      return Math.round(baseIncome * (1 + variation));
    });

    // Past due amounts distributed across months
    const monthlyPastDue = Array.from({ length: 12 }, (_, i) => {
      // Distribute current past due amount with some variation
      const basePastDue = totalPastDue / 12;
      const variation = (Math.random() - 0.5) * 0.5;
      return Math.round(basePastDue * (1 + variation));
    });

    // Previous year data (roughly 10% less than current year)
    const prevYearIncomes = monthlyIncomes.map(income =>
      Math.round(income * 0.9 * (1 + (Math.random() - 0.5) * 0.1))
    );

    return {
      rentalIncomeData: monthlyIncomes,
      pastDueData: monthlyPastDue,
      previousYearData: prevYearIncomes
    };
  }, [state]);

  // Calculate YTD data (January through current month)
  const currentMonth = new Date().getMonth(); // 0-based
  const ytdData = {
    rentalIncome: rentalIncomeData.slice(0, currentMonth + 1),
    pastDue: pastDueData.slice(0, currentMonth + 1),
    previousYear: previousYearData.slice(0, currentMonth + 1),
    xAxis: monthNames.slice(0, currentMonth + 1)
  };

  // Get the appropriate data based on time range
  const getChartData = () => {
    switch (timeRange) {
      case 'ytd':
        return {
          rentalIncome: ytdData.rentalIncome,
          pastDue: ytdData.pastDue,
          previousYear: ytdData.previousYear,
          xAxisLabels: ytdData.xAxis
        };
      case 'month':
        // Show last 4 weeks for month view
        const weeklyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        return {
          rentalIncome: [62000, 58000, 65000, 61000],
          pastDue: [3000, 2000, 4000, 3500],
          previousYear: [57000, 54000, 60000, 58000],
          xAxisLabels: weeklyLabels
        };
      case 'quarter':
        // Show 3 months of current quarter
        const quarterLabels = ['Month 1', 'Month 2', 'Month 3'];
        const currentQuarter = Math.floor(currentMonth / 3);
        const quarterStart = currentQuarter * 3;
        return {
          rentalIncome: rentalIncomeData.slice(quarterStart, quarterStart + 3),
          pastDue: pastDueData.slice(quarterStart, quarterStart + 3),
          previousYear: previousYearData.slice(quarterStart, quarterStart + 3),
          xAxisLabels: quarterLabels
        };
      default: // year and custom
        return {
          rentalIncome: rentalIncomeData,
          pastDue: pastDueData,
          previousYear: previousYearData,
          xAxisLabels: monthNames
        };
    }
  };

  const chartData = getChartData();

  const xAxisData = {
    scaleType: "band" as const,
    data: chartData.xAxisLabels,
    tickLabelStyle: {
      angle: 0,
      textAnchor: "middle",
      fontSize: 12,
    },
  };

  // Format y-axis labels to show $ and K for thousands
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Rental Income & Collections
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
          >
            <ToggleButton value="month" aria-label="month view">
              Month
            </ToggleButton>
            <ToggleButton value="quarter" aria-label="quarter view">
              Quarter
            </ToggleButton>
            <ToggleButton value="ytd" aria-label="year to date view">
              YTD
            </ToggleButton>
            <ToggleButton value="year" aria-label="year view">
              Year
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setCustomDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            Custom Range
          </Button>
        </Stack>

        <Box sx={{ flexGrow: 1, width: "100%", height: "300px" }}>
          <BarChart
            series={[
              {
                data: chartData.rentalIncome,
                label: "Rental Income",
                color: theme.palette.success.main,
                valueFormatter: (value) => (value ? formatYAxis(value) : ""),
              },
              {
                data: chartData.pastDue,
                label: "Past Due",
                color: theme.palette.error.main,
                valueFormatter: (value) => (value ? formatYAxis(value) : ""),
              },
              {
                data: chartData.previousYear,
                label: "Previous Year",
                color: theme.palette.grey[400],
                valueFormatter: (value) => (value ? formatYAxis(value) : ""),
              },
            ]}
            xAxis={[xAxisData]}
            yAxis={[
              {
                label: "Amount ($)",
                valueFormatter: formatYAxis,
              },
            ]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 60, right: 10 }}
            slotProps={{
              legend: {
                position: { vertical: "top", horizontal: "middle" },
              },
            }}
          />
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Viewing: {getDisplayLabel()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Income: {formatYAxis(chartData.rentalIncome.reduce((sum, val) => sum + val, 0))}
          </Typography>
        </Stack>
      </CardContent>

      {/* Custom Date Range Dialog */}
      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCustomDateApply}
            variant="contained"
            disabled={!customDateRange.startDate || !customDateRange.endDate}
          >
            Apply Range
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
