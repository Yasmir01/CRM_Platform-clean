import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import InsightCard from "../../components/InsightCard";

type Insight = {
  id: string;
  type: "LEASE" | "PAYMENT" | "MAINTENANCE" | "GENERAL";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
};

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const mock: Insight[] = [
      {
        id: "ins1",
        type: "LEASE",
        title: "Lease Expiring Soon",
        description: "Lease for Unit 2B (Tenant: Alex Tenant) expires in 30 days.",
        severity: "medium",
      },
      {
        id: "ins2",
        type: "PAYMENT",
        title: "Late Payment Risk",
        description: "Tenant John Doe has missed 2 payments in the last 6 months.",
        severity: "high",
      },
      {
        id: "ins3",
        type: "MAINTENANCE",
        title: "Unresolved Work Orders",
        description: "3 work orders are overdue for completion.",
        severity: "low",
      },
    ];
    setInsights(mock);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        AI Insights
      </Typography>
      <Grid container spacing={2}>
        {insights.map((insight) => (
          <Grid item xs={12} md={6} lg={4} key={insight.id}>
            <InsightCard {...insight} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
