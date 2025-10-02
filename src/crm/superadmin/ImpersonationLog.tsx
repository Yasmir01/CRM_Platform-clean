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
  Button,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import * as XLSX from "xlsx";

export default function ImpersonationLog() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function fetchLogs() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (status) query.append("status", status);
      if (from) query.append("from", from);
      if (to) query.append("to", to);
      const qs = query.toString();
      const res = await fetch(`/api/superadmin/impersonation/logs${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCSV = () => {
    const header = ["Organization", "Super Admin", "Email", "Started", "Ended", "Status"];
    const rows = logs.map((log) => [
      log.orgName || "",
      log.superAdmin || "",
      log.superAdminEmail || "",
      new Date(log.startedAt).toISOString(),
      log.endedAt ? new Date(log.endedAt).toISOString() : "",
      log.endedAt ? "Closed" : "Active",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impersonation_logs.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const wsData = logs.map((log) => ({
      Organization: log.orgName || "",
      "Super Admin": log.superAdmin || "",
      Email: log.superAdminEmail || "",
      Started: new Date(log.startedAt).toLocaleString(),
      Ended: log.endedAt ? new Date(log.endedAt).toLocaleString() : "",
      Status: log.endedAt ? "Closed" : "Active",
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Impersonation Logs");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impersonation_logs.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Impersonation Logs
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} size="small">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>
        <TextField type="date" label="From" size="small" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} />
        <TextField type="date" label="To" size="small" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="outlined" onClick={fetchLogs}>Apply Filters</Button>
        <Button variant="contained" onClick={exportCSV}>Export CSV</Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
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
                    <TableCell>{log.endedAt ? new Date(log.endedAt).toLocaleString() : "—"}</TableCell>
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
      )}
    </Box>
  );
}
