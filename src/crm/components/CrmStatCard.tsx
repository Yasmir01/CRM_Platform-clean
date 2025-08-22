import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { SparkLineChart } from "./LazyCharts";
import { areaElementClasses } from "@mui/x-charts/LineChart";

export type CrmStatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: "up" | "down";
  trendValue: string;
  data: number[];
};

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function CrmStatCard({
  title,
  value,
  interval,
  trend,
  trendValue,
  data,
}: CrmStatCardProps) {
  const theme = useTheme();

  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
  };

  const labelColors = {
    up: "success" as const,
    down: "error" as const,
  };

  const trendIcons = {
    up: <ArrowUpwardRoundedIcon fontSize="small" />,
    down: <ArrowDownwardRoundedIcon fontSize="small" />,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const trendIcon = trendIcons[trend];

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.3)",
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              component="h3"
              variant="subtitle2"
              gutterBottom
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem"
              }}
            >
              {title}
            </Typography>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="h3"
                component="p"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {value}
              </Typography>
              <Chip
                size="small"
                color={color}
                label={trendValue}
                icon={trendIcon}
                variant="filled"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 28,
                  "& .MuiChip-icon": {
                    fontSize: "16px",
                    marginLeft: "5px",
                    marginRight: "-4px",
                  },
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500
              }}
            >
              {interval}
            </Typography>
          </Box>

          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: Array.from(
                  { length: data.length },
                  (_, i) => `Day ${i + 1}`,
                ),
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${title.replace(/\s+/g, "-").toLowerCase()})`,
                },
              }}
            >
              <AreaGradient
                color={chartColor}
                id={`area-gradient-${title.replace(/\s+/g, "-").toLowerCase()}`}
              />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
