import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import TransUnionIntegration from "../components/TransUnionIntegration";

export default function TransUnionSettings() {
  const [isConnected, setIsConnected] = React.useState(false);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/crm">
          CRM
        </Link>
        <Link underline="hover" color="inherit" href="/crm/settings">
          Settings
        </Link>
        <Typography color="text.primary">TransUnion Integration</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            TransUnion Credit Check Integration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure and manage TransUnion credit check services for rental applications
          </Typography>
        </Box>
      </Stack>

      {/* Connection Status Alert */}
      <Alert 
        severity={isConnected ? "success" : "warning"} 
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          {isConnected 
            ? "TransUnion integration is active. Credit checks will be performed automatically during application processing."
            : "TransUnion integration is not configured. Configure the integration below to enable automatic credit checks."
          }
        </Typography>
      </Alert>

      {/* Integration Component */}
      <TransUnionIntegration onConnectionChange={setIsConnected} />

      {/* Information Cards */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                How It Works
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2">
                  1. <strong>Configure Integration:</strong> Enter your TransUnion API credentials to establish a secure connection.
                </Typography>
                <Typography variant="body2">
                  2. <strong>Automatic Processing:</strong> When applications are submitted, credit checks are automatically performed for both applicants and grantors (if applicable).
                </Typography>
                <Typography variant="body2">
                  3. <strong>Results Integration:</strong> Credit scores and reports are automatically attached to application records for review.
                </Typography>
                <Typography variant="body2">
                  4. <strong>Compliance Logging:</strong> All credit check activities are securely logged for audit and compliance purposes.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Features & Benefits
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body2">
                  • <strong>Automated Credit Checks:</strong> Eliminate manual credit check processes
                </Typography>
                <Typography variant="body2">
                  • <strong>Grantor Support:</strong> Handle co-signers and guarantors seamlessly
                </Typography>
                <Typography variant="body2">
                  • <strong>Real-time Results:</strong> Get instant credit scores and risk assessments
                </Typography>
                <Typography variant="body2">
                  • <strong>Secure & Compliant:</strong> Industry-standard security and FCRA compliance
                </Typography>
                <Typography variant="body2">
                  • <strong>Audit Trail:</strong> Complete logging for compliance and reporting
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requirements Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Integration Requirements
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                TransUnion Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active TransUnion business account with API access enabled. Contact TransUnion sales for account setup.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                API Credentials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                API key, member number, and security code provided by TransUnion after account verification.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                FCRA Compliance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ensure your organization is FCRA compliant and has proper permissible purpose for credit checks.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
