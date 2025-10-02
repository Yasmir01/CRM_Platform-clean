import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

type CurrentSubscription = {
  mode?: 'TIER' | 'PLAN';
  id?: string;
  orgId?: string;
  plan?: { id?: string; name?: string; price?: number; billingCycle?: string };
  tier?: string;
  status?: string;
  currentPeriodEnd?: string | null;
};

export default function SubscriptionDashboard() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrent = async () => {
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/current");
      const data = await res.json();
      if (res.ok) setSubscription(data);
      else setError(data?.error || "Failed to load subscription");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  // Map simple actions to hybrid payloads
  const mapTierToPlanId = (tier: string) => {
    const t = tier.toUpperCase();
    if (t === 'BASIC') return 'starter';
    if (t === 'PREMIUM') return 'pro';
    if (t === 'ENTERPRISE') return 'enterprise';
    return undefined;
  };

  const handleUpgrade = async (tier: string) => {
    if (!subscription) return;
    setError(null);
    try {
      const payload: Record<string, any> = { orgId: subscription.orgId };
      if (subscription.mode === 'PLAN') {
        const planId = mapTierToPlanId(tier);
        if (!planId) throw new Error('Unsupported upgrade option');
        payload.planId = planId;
      } else {
        payload.tier = tier;
      }
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upgrade failed");
      await fetchCurrent();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: subscription.orgId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Cancel failed");
      await fetchCurrent();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Subscription Management
      </Typography>

      {subscription ? (
        <Card>
          <CardContent>
            <Typography variant="h6">
              Current Plan: {subscription.plan?.name || subscription.tier || "Free"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {subscription.status || "active"}
            </Typography>
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="contained" onClick={() => handleUpgrade("BASIC")}>
                Switch to Basic
              </Button>
              <Button variant="contained" color="secondary" onClick={() => handleUpgrade("PREMIUM")}>
                Upgrade to Premium
              </Button>
              <Button variant="outlined" color="error" onClick={handleCancel}>
                Cancel Subscription
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Typography>No active subscription found.</Typography>
      )}
    </Box>
  );
}
