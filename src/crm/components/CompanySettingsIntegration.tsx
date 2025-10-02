import * as React from "react";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import CompanySettings, { useCompanyInfo } from "./CompanySettings";
import { LocalStorageService } from "../services/LocalStorageService";

interface CompanySettingsIntegrationProps {
  userRole: {
    role: string;
    permissions: string[];
  };
}

export default function CompanySettingsIntegration({ userRole }: CompanySettingsIntegrationProps) {
  const [companySettingsOpen, setCompanySettingsOpen] = React.useState(false);
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();
  
  const isAdmin = userRole.role === 'admin' || userRole.role === 'super_admin';
  const isSuperAdmin = userRole.role === 'super_admin';

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <BusinessRoundedIcon color="primary" />
              <Typography variant="h6">Company Information</Typography>
              {isSuperAdmin && (
                <Chip size="small" label="Super Admin" color="secondary" />
              )}
              {isAdmin && !isSuperAdmin && (
                <Chip size="small" label="Admin" color="primary" />
              )}
            </Stack>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Company information is automatically included in all templates, documents, and reports.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Company Name"
                  value={companyInfo.name}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={companyInfo.email}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  value={companyInfo.phone}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Website"
                  value={companyInfo.website}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={companyInfo.address}
                  fullWidth
                  disabled
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SettingsRoundedIcon />}
              onClick={() => setCompanySettingsOpen(true)}
              sx={{ mt: 2 }}
              fullWidth
            >
              Manage Company Settings
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Company Settings Dialog */}
      <CompanySettings
        open={companySettingsOpen}
        onClose={() => setCompanySettingsOpen(false)}
        onSave={updateCompanyInfo}
        currentInfo={companyInfo}
      />
    </>
  );
}
