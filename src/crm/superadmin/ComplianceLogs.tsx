import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from "@mui/material";
import { format } from "date-fns";

type Log = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
};

export default function ComplianceLogs() {
  const [rows, setRows] = useState<Log[]>([]);

  useEffect(() => {
    const mock: Log[] = [
      {
        id: "log1",
        actor: "Admin Jane",
        action: "Created Lease",
        entity: "Lease #1234",
        timestamp: new Date().toISOString(),
      },
      {
        id: "log2",
        actor: "Tenant Alex",
        action: "Made Payment",
        entity: "Payment #5678",
        timestamp: new Date().toISOString(),
      },
    ];
    setRows(mock);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Compliance Logs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Actor</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.actor}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.entity}</TableCell>
                <TableCell>{format(new Date(row.timestamp), "PPpp")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
