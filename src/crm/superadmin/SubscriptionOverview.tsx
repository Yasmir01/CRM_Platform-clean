import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

export default function SubscriptionOverview() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/superadmin/orgs");
        const data = await res.json();
        setOrgs(data);
      } catch (err) {
        console.error("Error loading orgs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleImpersonate = async (orgId: string) => {
    try {
      const res = await fetch("/api/superadmin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ superAdminId: "demo-SA", targetOrgId: orgId }),
      });
      const data = await res.json();
      if (data?.token) {
        try {
          localStorage.setItem("impersonationToken", data.token);
        } catch {}
        // also set cookie for middleware compatibility
        document.cookie = `impersonationToken=${data.token}; path=/; max-age=900`;
        window.location.href = "/crm/admin/dashboard?impersonation=true";
      } else {
        alert(data?.error || "Failed to impersonate");
      }
    } catch (err) {
      console.error("Impersonation failed:", err);
      alert("Impersonation failed");
    }
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
        <Typography variant="body2">Loading organizations...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Super Admin: Subscription Overview
      </Typography>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Current Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.subscriptionMode}</TableCell>
                  <TableCell>
                    {org.mode === "PLAN" ? org.subscription?.plan?.name : org.tier}
                  </TableCell>
                  <TableCell>
                    {org.mode === "PLAN"
                      ? org.subscription?.status
                      : org.tier === "FREE"
                      ? "inactive"
                      : "active"}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => handleImpersonate(org.id)}>
                        Impersonate
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => alert("Upgrade/Downgrade route placeholder")}
                      >
                        Manage
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
