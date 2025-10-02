import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

export default function ImpersonationLog() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/superadmin/impersonation/logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Error loading logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
        <Typography variant="body2">Loading impersonation logs...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Impersonation Logs
      </Typography>

      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization</TableCell>
                <TableCell>Super Admin</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Ended</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.orgName || log.orgId}</TableCell>
                  <TableCell>
                    {log.superAdmin} ({log.superAdminEmail})
                  </TableCell>
                  <TableCell>{new Date(log.startedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {log.endedAt ? new Date(log.endedAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    {log.endedAt ? (
                      <Chip label="Closed" color="success" size="small" />
                    ) : (
                      <Chip label="Active" color="warning" size="small" />
                    )}
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
