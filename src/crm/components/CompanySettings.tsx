import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  taxId?: string;
  licenseNumber?: string;
  businessHours: string;
  emergencyLine: string;
}

interface CompanySettingsProps {
  open: boolean;
  onClose: () => void;
  onSave: (companyInfo: CompanyInfo) => void;
  currentInfo?: CompanyInfo;
}

const defaultCompanyInfo: CompanyInfo = {
  name: "Your Property Management Company",
  address: "123 Business Ave, Suite 100, City, State 12345",
  phone: "(555) 555-0123",
  email: "info@yourcompany.com",
  website: "www.yourcompany.com",
  businessHours: "Monday - Friday, 9:00 AM - 6:00 PM",
  emergencyLine: "(555) 555-HELP",
  taxId: "12-3456789",
  licenseNumber: "RE-123456"
};

export default function CompanySettings({ open, onClose, onSave, currentInfo }: CompanySettingsProps) {
  const [companyInfo, setCompanyInfo] = React.useState<CompanyInfo>(currentInfo || defaultCompanyInfo);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(currentInfo?.logo || null);

  React.useEffect(() => {
    if (currentInfo) {
      setCompanyInfo(currentInfo);
      setLogoPreview(currentInfo.logo || null);
    }
  }, [currentInfo]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        setLogoPreview(logoData);
        setCompanyInfo(prev => ({ ...prev, logo: logoData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(companyInfo);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <BusinessRoundedIcon />
          <Typography variant="h5">Company Information & Branding</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            This information will be automatically included in all rental applications, 
            templates, and printable documents for a professional appearance.
          </Alert>

          {/* Logo Upload Section */}
          <Paper sx={{ p: 3, bgcolor: "grey.50" }}>
            <Typography variant="h6" gutterBottom>
              Company Logo
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center" }}>
                  {logoPreview ? (
                    <Avatar
                      src={logoPreview}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: "auto",
                        border: "2px solid",
                        borderColor: "primary.main"
                      }}
                      variant="rounded"
                    />
                  ) : (
                    <Avatar
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: "auto",
                        bgcolor: "primary.light",
                        border: "2px dashed",
                        borderColor: "primary.main"
                      }}
                      variant="rounded"
                    >
                      <BusinessRoundedIcon fontSize="large" />
                    </Avatar>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Upload your company logo to include in all documents and applications. 
                    Recommended size: 400x400px or larger, square format.
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadRoundedIcon />}
                  >
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => {
                        setLogoPreview(null);
                        setCompanyInfo(prev => ({ ...prev, logo: undefined }));
                      }}
                    >
                      Remove Logo
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Basic Company Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Business Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address"
                  fullWidth
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Website"
                  fullWidth
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emergency Line"
                  fullWidth
                  value={companyInfo.emergencyLine}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, emergencyLine: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Additional Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Business Hours"
                  fullWidth
                  value={companyInfo.businessHours}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, businessHours: e.target.value }))}
                  placeholder="e.g., Monday - Friday, 9:00 AM - 6:00 PM"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tax ID / EIN (Optional)"
                  fullWidth
                  value={companyInfo.taxId || ""}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="License Number (Optional)"
                  fullWidth
                  value={companyInfo.licenseNumber || ""}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, licenseNumber: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Preview Section */}
          <Paper sx={{ p: 3, bgcolor: "info.light" }}>
            <Typography variant="h6" gutterBottom color="info.contrastText">
              Preview - How it will appear in documents
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center">
              {logoPreview && (
                <Avatar
                  src={logoPreview}
                  sx={{ width: 60, height: 60 }}
                  variant="rounded"
                />
              )}
              <Box>
                <Typography variant="h6" color="info.contrastText">
                  {companyInfo.name}
                </Typography>
                <Typography variant="body2" color="info.contrastText">
                  {companyInfo.address}
                </Typography>
                <Typography variant="body2" color="info.contrastText">
                  📞 {companyInfo.phone} • ✉️ {companyInfo.email}
                </Typography>
                {companyInfo.website && (
                  <Typography variant="body2" color="info.contrastText">
                    🌐 {companyInfo.website}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} startIcon={<SaveRoundedIcon />}>
          Save Company Information
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Export company info for use in templates and documents
export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = React.useState<CompanyInfo>(() => {
    const saved = localStorage.getItem("companyInfo");
    return saved ? JSON.parse(saved) : defaultCompanyInfo;
  });

  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    localStorage.setItem("companyInfo", JSON.stringify(info));
  };

  return { companyInfo, updateCompanyInfo };
};

export type { CompanyInfo };
