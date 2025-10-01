import React from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";

type InsightProps = {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
};

const severityColors: Record<InsightProps["severity"], "default" | "warning" | "error"> = {
  low: "default",
  medium: "warning",
  high: "error",
};

export default function InsightCard({ type, title, description, severity }: InsightProps) {
  return (
    <Card sx={{ borderLeft: `6px solid`, borderColor: severity === "high" ? "error.main" : severity === "medium" ? "warning.main" : "grey.500" }}>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary">
          {type}
        </Typography>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {description}
        </Typography>
        <Chip label={severity.toUpperCase()} color={severityColors[severity]} size="small" sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
}
