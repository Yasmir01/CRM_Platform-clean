// src/crm/owner/OwnerDashboard.tsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import DashboardShell from "../../components/DashboardShell"; // ✅ fixed path

export default function OwnerDashboard() {
  return (
    <DashboardShell title="Owner Dashboard" userName="Olivia Owner">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Properties</Typography>
              <Typography variant="h4">8</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Tenants</Typography>
              <Typography variant="h4">21</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Income</Typography>
              <Typography variant="h4">$18,400</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Recent Owner Activity</Typography>
        <Typography variant="body2" color="text.secondary">
          - Rent collected for September<br />
          - Maintenance request approved<br />
          - Ledger updated
        </Typography>
      </Box>
    </DashboardShell>
  );
}
