import React from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Loading component for charts
function ChartLoader({ label = "Loading chart..." }: { label?: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 200,
        flexDirection: "column",
        gap: 2
      }}
    >
      <CircularProgress size={24} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

// Lazy load MUI X Charts
export const LazyLineChart = React.lazy(() => 
  import("@mui/x-charts/LineChart").then(module => ({ default: module.LineChart }))
);

export const LazyPieChart = React.lazy(() => 
  import("@mui/x-charts/PieChart").then(module => ({ default: module.PieChart }))
);

export const LazyBarChart = React.lazy(() => 
  import("@mui/x-charts/BarChart").then(module => ({ default: module.BarChart }))
);

export const LazySparkLineChart = React.lazy(() => 
  import("@mui/x-charts/SparkLineChart").then(module => ({ default: module.SparkLineChart }))
);

// Lazy load Recharts components
export const LazyRechartsLineChart = React.lazy(() => 
  import("recharts").then(module => ({ default: module.LineChart }))
);

export const LazyRechartsBarChart = React.lazy(() => 
  import("recharts").then(module => ({ default: module.BarChart }))
);

export const LazyRechartsPieChart = React.lazy(() => 
  import("recharts").then(module => ({ default: module.PieChart }))
);

export const LazyRechartsAreaChart = React.lazy(() => 
  import("recharts").then(module => ({ default: module.AreaChart }))
);

export const LazyRechartsComposedChart = React.lazy(() => 
  import("recharts").then(module => ({ default: module.ComposedChart }))
);

export const LazyRechartsRadarChart = React.lazy(() => 
  import("recharts").then(module => ({ default: module.RadarChart }))
);

export const LazyRechartsResponsiveContainer = React.lazy(() => 
  import("recharts").then(module => ({ default: module.ResponsiveContainer }))
);

// Lazy load MUI X Data Grid
export const LazyDataGrid = React.lazy(() => 
  import("@mui/x-data-grid").then(module => ({ default: module.DataGrid }))
);

// HOC for wrapping charts with Suspense
export function withChartSuspense<T extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<T>>,
  fallbackLabel?: string
) {
  return function WrappedChart(props: T) {
    return (
      <React.Suspense fallback={<ChartLoader label={fallbackLabel} />}>
        <Component {...props} />
      </React.Suspense>
    );
  };
}

// Pre-wrapped components ready to use
export const LineChart = withChartSuspense(LazyLineChart, "Loading line chart...");
export const PieChart = withChartSuspense(LazyPieChart, "Loading pie chart...");
export const BarChart = withChartSuspense(LazyBarChart, "Loading bar chart...");
export const SparkLineChart = withChartSuspense(LazySparkLineChart, "Loading spark chart...");
export const DataGrid = withChartSuspense(LazyDataGrid, "Loading data grid...");

// Recharts wrapped components
export const RechartsLineChart = withChartSuspense(LazyRechartsLineChart, "Loading line chart...");
export const RechartsBarChart = withChartSuspense(LazyRechartsBarChart, "Loading bar chart...");
export const RechartsPieChart = withChartSuspense(LazyRechartsPieChart, "Loading pie chart...");
export const RechartsAreaChart = withChartSuspense(LazyRechartsAreaChart, "Loading area chart...");
export const RechartsComposedChart = withChartSuspense(LazyRechartsComposedChart, "Loading chart...");
export const RechartsRadarChart = withChartSuspense(LazyRechartsRadarChart, "Loading radar chart...");
export const RechartsResponsiveContainer = withChartSuspense(LazyRechartsResponsiveContainer, "Loading chart...");
