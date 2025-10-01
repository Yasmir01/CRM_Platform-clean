import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";

type HistoryItem = {
  id: string;
  plan: string;
  active: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SubscriptionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/subscriptions/history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Billing History
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Plan</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((h) => (
            <TableRow key={h.id}>
              <TableCell>{h.plan}</TableCell>
              <TableCell>{h.active ? "Active" : "Inactive"}</TableCell>
              <TableCell>{new Date(h.startDate).toLocaleDateString()}</TableCell>
              <TableCell>
                {h.endDate ? new Date(h.endDate).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell>{new Date(h.updatedAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
