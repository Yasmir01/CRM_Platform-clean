import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { format } from "date-fns";

type SyncLog = {
  id: string;
  runAt: string;
  provider: string;
  scope: string;
  status: string;
  itemCount: number;
};

export default function SyncLogs() {
  const [rows, setRows] = useState<SyncLog[]>([]);

  useEffect(() => {
    const mock: SyncLog[] = [
      {
        id: "log1",
        runAt: new Date().toISOString(),
        provider: "QUICKBOOKS",
        scope: "payments",
        status: "success",
        itemCount: 15,
      },
      {
        id: "log2",
        runAt: new Date().toISOString(),
        provider: "XERO",
        scope: "invoices",
        status: "error",
        itemCount: 0,
      },
    ];
    setRows(mock);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Sync Logs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Run At</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{format(new Date(row.runAt), "PPpp")}</TableCell>
                <TableCell>{row.provider}</TableCell>
                <TableCell>{row.scope}</TableCell>
                <TableCell>
                  <Chip label={row.status} color={row.status === "success" ? "success" : "error"} size="small" />
                </TableCell>
                <TableCell>{row.itemCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
