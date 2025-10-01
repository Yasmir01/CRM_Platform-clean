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
} from "@mui/material";
import { format } from "date-fns";

type RefundRow = {
  id: string;
  amount: string;
  reason: string;
  date: string;
};

export default function TenantRefundHistoryPage() {
  const [rows, setRows] = useState<RefundRow[]>([]);

  useEffect(() => {
    const mock: RefundRow[] = [
      {
        id: "rfd1",
        amount: "200.00",
        reason: "Overpayment",
        date: new Date().toISOString(),
      },
    ];
    setRows(mock);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Refund History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Refund #</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>${row.amount}</TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>{format(new Date(row.date), "PPpp")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
