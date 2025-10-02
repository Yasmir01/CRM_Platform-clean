// src/crm/pages/RentCollection.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { paymentService } from "../services/PaymentService";

export default function RentCollection() {
  const payments = paymentService.listPayments();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rent Collection
      </Typography>
      <Typography variant="body1">
        Total Payments: {payments.length}
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() =>
          paymentService.createPayment({
            id: Date.now().toString(),
            tenantId: "demo-tenant",
            amount: 1000,
            method: "card",
            status: "completed",
            createdAt: new Date(),
          })
        }
      >
        Add Demo Payment
      </Button>
    </Box>
  );
}
