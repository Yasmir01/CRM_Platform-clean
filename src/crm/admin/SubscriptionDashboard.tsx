import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

type Plan = {
  id: string;
  name: string;
  price: number;
  billingCycle?: string;
  interval?: string;
  features?: any;
};

export default function SubscriptionDashboard() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const featureList = (p: Plan) => {
    const f = p?.features;
    if (!f) return "";
    if (Array.isArray(f)) {
      if (f.length === 0) return "";
      if (typeof f[0] === "string") return (f as string[]).join(", ");
      return (f as { featureKey?: string; id?: string; enabled?: boolean }[])
        .map((x) => x?.featureKey || "")
        .filter(Boolean)
        .join(", ");
    }
    return String(f);
  };

  const fetchAll = async (explicitOrgId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const orgParam = explicitOrgId || orgId || '';
      const currentUrl = orgParam ? `/api/subscriptions/current?orgId=${orgParam}` : `/api/subscriptions/current`;
      const historyUrl = orgParam ? `/api/history/list?orgId=${orgParam}` : null;

      const requests: Promise<Response>[] = [
        fetch(currentUrl),
        fetch("/api/subscriptions/plans"),
        historyUrl ? fetch(historyUrl) : Promise.resolve(new Response(JSON.stringify([]))),
      ];

      const [subRes, plansRes, histRes] = await Promise.all(requests);
      const [subJson, plansJson, histJson] = await Promise.all([
        subRes.json(),
        plansRes.json(),
        histRes.json(),
      ]);

      if (subRes.ok) setSubscription(subJson);
      else setError(subJson?.error || "Failed to load subscription");

      if (Array.isArray(plansJson)) setPlans(plansJson);
      if (Array.isArray(histJson)) setHistory(histJson);

      if (!explicitOrgId && subJson?.orgId) setOrgId(subJson.orgId);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(orgId || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {};
      if (orgId) payload.orgId = orgId;
      payload.planId = planId;
      const res = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upgrade failed");
      await fetchAll(orgId || undefined);
    } catch (e: any) {
      setError(e?.message || "Upgrade failed");
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {};
      if (orgId) payload.orgId = orgId;
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Cancel failed");
      await fetchAll(orgId || undefined);
    } catch (e: any) {
      setError(e?.message || "Cancel failed");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
        <Typography variant="body2">Loading subscription...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Subscription Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1">Current Plan</Typography>
          <Typography>
            {subscription?.plan || subscription?.tier || "No active plan"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mode: {subscription?.mode || "Unknown"}
          </Typography>
          <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={handleCancel}>
            Cancel Subscription
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Available Plans
      </Typography>
      <Stack spacing={2} mb={4}>
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent>
              <Typography variant="subtitle1">{plan.name}</Typography>
              <Typography>
                ${plan.price} / {plan.interval || plan.billingCycle || "monthly"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {featureList(plan)}
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleUpgrade(plan.id)}>
                Upgrade to {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Typography variant="h6" gutterBottom>
        Subscription History
      </Typography>
      <Card>
        <CardContent>
          {history.length === 0 ? (
            <Typography color="text.secondary">No subscription events yet.</Typography>
          ) : (
            <List>
              {history.map((log) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText
                      primary={log.action}
                      secondary={new Date(log.createdAt).toLocaleString()}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {error ? (
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      ) : null}
    </Box>
  );
}
