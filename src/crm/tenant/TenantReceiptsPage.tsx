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
  Button,
} from "@mui/material";
import { format } from "date-fns";

type ReceiptRow = {
  id: string;
  amount: string;
  status: string;
  method: string;
  date: string;
  pdfUrl?: string;
};

export default function TenantReceiptsPage() {
  const [rows, setRows] = useState<ReceiptRow[]>([]);

  useEffect(() => {
    const mock: ReceiptRow[] = [
      {
        id: "rcpt1",
        amount: "1800.00",
        status: "SUCCEEDED",
        method: "Visa •••• 1234",
        date: new Date().toISOString(),
      },
    ];
    setRows(mock);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Payment Receipts
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>${row.amount}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell>{format(new Date(row.date), "PPpp")}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={row.pdfUrl}
                    target="_blank"
                    disabled={!row.pdfUrl}
                  >
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
