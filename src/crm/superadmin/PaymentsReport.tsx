import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { format } from "date-fns";
import { exportToCsv } from "../../utils/exportCsv";
import { exportPaymentsPdf } from "../../utils/exportPdf";

type PaymentRow = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: string;
  status: string;
  method: string;
  issuedAt: string;
};

export default function PaymentsReport() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      const mock: PaymentRow[] = [
        {
          id: "pmt1",
          tenant: "Alex Tenant",
          property: "Maple Apartments",
          unit: "2B",
          amount: "1800.00",
          status: "SUCCEEDED",
          method: "Visa •••• 1234",
          issuedAt: new Date().toISOString(),
        },
      ];
      setRows(mock);
    }
    load();
  }, []);

  const filtered = rows.filter(
    (r) =>
      r.tenant.toLowerCase().includes(filter.toLowerCase()) ||
      r.property.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        SU/Admin Payment Reporting
      </Typography>

      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          label="Search tenant or property"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={() => exportToCsv("payments-report.csv", filtered)}>
          Export CSV
        </Button>
        <Button variant="outlined" onClick={() => exportPaymentsPdf(filtered)}>
          Export PDF
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Property/Unit</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.tenant}</TableCell>
                <TableCell>
                  {row.property} / {row.unit}
                </TableCell>
                <TableCell>${row.amount}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell>{format(new Date(row.issuedAt), "PPpp")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
