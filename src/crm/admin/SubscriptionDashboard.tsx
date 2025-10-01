import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import SubscriptionDetails from "./SubscriptionDetails";
import SubscriptionHistory from "./SubscriptionHistory";

type FeatureToggle = {
  id: string;
  featureKey: string;
  enabled: boolean;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: FeatureToggle[];
};

type OrganizationSubscription = {
  id: string;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd: string;
};

export default function SubscriptionDashboard() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscriptions/current");
        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!subscription) {
    return (
      <Box p={3}>
        <Typography variant="h6">No active subscription found.</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3}>
        <SubscriptionDetails />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Included Features
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            {subscription.plan.features.map((f) => (
              <Box key={f.id} display="flex" alignItems="center" gap={1}>
                {f.enabled ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Cancel color="error" fontSize="small" />
                )}
                <Typography variant="body2">
                  {f.featureKey} {f.enabled ? "(Enabled)" : "(Disabled)"}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <SubscriptionHistory />
    </Box>
  );
}
