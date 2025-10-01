import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Select, MenuItem } from "@mui/material";

export default function ComplianceLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/compliance?origin=" + filter)
      .then((r) => r.json())
      .then(setLogs);
  }, [filter]);

  return (
    <Box p={3}>
      <Typography variant="h6">Compliance Logs</Typography>
      <Paper sx={{ p: 2, my: 2 }}>
        <Select value={filter} onChange={(e) => setFilter(String(e.target.value))}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="server">Server</MenuItem>
          <MenuItem value="offline-sync">Offline Sync</MenuItem>
        </Select>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Origin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                <TableCell>{l.actor}</TableCell>
                <TableCell>{l.action}</TableCell>
                <TableCell>{l.entity}</TableCell>
                <TableCell>{l.origin}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
