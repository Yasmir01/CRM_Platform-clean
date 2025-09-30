// src/crm/manager/ManagerDashboard.tsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import DashboardShell from "../../components/DashboardShell"; // ✅ fixed path

export default function ManagerDashboard() {
  return (
    <DashboardShell title="Manager Dashboard" userName="Michael Manager">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tenants Managed</Typography>
              <Typography variant="h4">45</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Open Requests</Typography>
              <Typography variant="h4">9</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Owners Overseen</Typography>
              <Typography variant="h4">6</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Latest Manager Updates</Typography>
        <Typography variant="body2" color="text.secondary">
          - Inspections scheduled<br />
          - Rent reminders sent<br />
          - Vendor jobs assigned
        </Typography>
      </Box>
    </DashboardShell>
  );
}
