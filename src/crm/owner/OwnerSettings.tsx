import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Stack,
} from "@mui/material";

export default function OwnerSettings() {
  const [notifications, setNotifications] = useState(true);
  const [payoutMethod, setPayoutMethod] = useState("Bank Transfer");
  const [bankAccount, setBankAccount] = useState("");

  useEffect(() => {
    setBankAccount("•••• 9876");
  }, []);

  const handleSave = () => {
    console.log("Save settings", { notifications, payoutMethod, bankAccount });
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Owner Settings
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            }
            label="Enable Email Notifications"
          />

          <TextField
            label="Preferred Payout Method"
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
          />

          <TextField
            label="Bank Account"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />

          <Button variant="contained" onClick={handleSave}>
            Save Settings
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
