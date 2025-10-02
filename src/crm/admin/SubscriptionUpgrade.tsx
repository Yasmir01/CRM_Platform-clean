import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";

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
  features: Array<FeatureToggle | string>;
};

export default function SubscriptionUpgrade() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/subscriptions/plans");
        const data = await res.json();
        if (Array.isArray(data)) setPlans(data);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleUpgrade = async (planId: string, mode: "TIER" | "PLAN") => {
    try {
      const payload = mode === "TIER" ? { tier: planId } : { planId };
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Upgrade failed");
      alert("✅ Subscription updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update subscription");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Choose Your Plan
      </Typography>
      <Stack spacing={3}>
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent>
              <Typography variant="h6">{plan.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                ${plan.price}/{plan.billingCycle}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Stack spacing={1}>
                {(plan.features || []).map((f, i) => (
                  <Typography key={typeof f === 'string' ? `${plan.id}-${i}` : (f as FeatureToggle).id} variant="body2">
                    • {typeof f === 'string' ? f : (f as FeatureToggle).featureKey}
                  </Typography>
                ))}
              </Stack>

              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const tierIds = ["FREE","BASIC","PREMIUM","ENTERPRISE"];
                    const mode = tierIds.includes(String(plan.id).toUpperCase()) ? "TIER" : "PLAN";
                    handleUpgrade(plan.id, mode);
                  }}
                >
                  Select {plan.name}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
