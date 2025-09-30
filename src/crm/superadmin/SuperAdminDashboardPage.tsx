// src/crm/superadmin/SuperAdminDashboardPage.tsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import DashboardShell from "../../components/DashboardShell"; // ✅ unified shell

export default function SuperAdminDashboardPage() {
  return (
    <DashboardShell title="Super Admin Dashboard" userName="Sophia SuperAdmin">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Subscribers</Typography>
              <Typography variant="h4">210</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Tenants</Typography>
              <Typography variant="h4">1,482</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Compliance Checks</Typography>
              <Typography variant="h4">98%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">System Health</Typography>
              <Typography variant="h4">Stable</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Recent Super Admin Updates</Typography>
        <Typography variant="body2" color="text.secondary">
          - Accounting integrations synced successfully<br />
          - New compliance export generated<br />
          - 2 system alerts acknowledged
        </Typography>
      </Box>
    </DashboardShell>
  );
}
