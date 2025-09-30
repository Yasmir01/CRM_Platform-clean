// src/crm/vendor/VendorDashboard.tsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import DashboardShell from "../../components/DashboardShell"; // ✅ fixed path

export default function VendorDashboard() {
  return (
    <DashboardShell title="Vendor Dashboard" userName="Victor Vendor">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Work Orders</Typography>
              <Typography variant="h4">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Completed Jobs</Typography>
              <Typography variant="h4">87</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Recent Vendor Notes</Typography>
        <Typography variant="body2" color="text.secondary">
          - Completed HVAC maintenance<br />
          - Awaiting approval on plumbing job<br />
          - Updated insurance documents
        </Typography>
      </Box>
    </DashboardShell>
  );
}
