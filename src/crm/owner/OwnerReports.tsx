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

type ReportRow = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export default function OwnerReports() {
  const [rows, setRows] = useState<ReportRow[]>([]);

  useEffect(() => {
    const mock: ReportRow[] = [
      { month: "Jan 2025", income: 5400, expenses: 1200, net: 4200 },
      { month: "Feb 2025", income: 5600, expenses: 1000, net: 4600 },
    ];
    setRows(mock);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Owner Reports (Income & Expenses)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Income</TableCell>
              <TableCell>Expenses</TableCell>
              <TableCell>Net</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                <TableCell>${row.income.toFixed(2)}</TableCell>
                <TableCell>${row.expenses.toFixed(2)}</TableCell>
                <TableCell>${row.net.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
