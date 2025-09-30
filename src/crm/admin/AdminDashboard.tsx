// src/crm/admin/AdminDashboard.tsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import DashboardShell from "../../components/DashboardShell"; // ✅ fixed path

export default function AdminDashboard() {
  return (
    <DashboardShell title="Admin Dashboard" userName="Alice Admin">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Users</Typography>
              <Typography variant="h4">134</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">System Logs</Typography>
              <Typography variant="h4">482</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payments Processed</Typography>
              <Typography variant="h4">$92,000</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Admin Notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          - New vendor onboarded<br />
          - Backup completed<br />
          - 2FA enabled for all users
        </Typography>
      </Box>
    </DashboardShell>
  );
}
