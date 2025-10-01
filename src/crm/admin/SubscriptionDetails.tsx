import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

type CurrentSubscription = {
  mode?: 'TIER' | 'PLAN';
  id?: string;
  plan: {
    name: string;
    price: number;
    billingCycle: string;
  };
  status: string;
  currentPeriodEnd: string | null;
};

export default function SubscriptionDetails() {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCurrent() {
      try {
        const res = await fetch("/api/subscriptions/current");
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        console.error("Failed to fetch current subscription:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrent();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!subscription) {
    return (
      <Typography variant="body1" color="text.secondary">
        No active subscription found.
      </Typography>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6">Active Plan</Typography>
      <Stack spacing={1} mt={1}>
        <Typography>
          <strong>Plan:</strong> {subscription.plan.name}
        </Typography>
        <Typography>
          <strong>Price:</strong> ${subscription.plan.price}/{subscription.plan.billingCycle}
        </Typography>
        <Typography>
          <strong>Status:</strong> {subscription.status}
        </Typography>
        <Typography>
          <strong>Renews on:</strong>{" "}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </Typography>
      </Stack>

      <Box mt={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/crm/admin/subscription-upgrade")}
        >
          Change Plan
        </Button>
      </Box>
    </Box>
  );
}
