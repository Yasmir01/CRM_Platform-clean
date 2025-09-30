// src/crm/tenant/TenantDashboard.tsx
import React from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell"; // ✅ fixed path

const data = [
  { name: "Collected", value: 7500 },
  { name: "Outstanding", value: 2500 },
];

const COLORS = ["#4caf50", "#f44336"];

export default function TenantDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardShell title="Tenant Dashboard" userName="John Tenant">
      {/* Quick Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Properties</Typography>
              <Typography variant="h4">12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tenants</Typography>
              <Typography variant="h4">34</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Open Requests</Typography>
              <Typography variant="h4">5</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Outstanding Rent</Typography>
              <Typography variant="h4">$2,500</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Box sx={{ mt: 4, height: 300 }}>
        <Typography variant="h6" gutterBottom>
          Rent Collection This Month
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Actions */}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" sx={{ mr: 2 }} onClick={() => console.log("Exporting...")}>
          Export Report
        </Button>
        <Button variant="outlined" onClick={() => navigate("/tenants")}>
          View Tenants
        </Button>
      </Box>
    </DashboardShell>
  );
}
