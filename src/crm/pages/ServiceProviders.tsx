import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Switch,
  FormControlLabel,
  Alert,
  Tooltip,
} from "@mui/material";
import { uniformTooltipStyles } from "../utils/formStyles";
import ServiceProviderDetailPage from "./ServiceProviderDetailPage";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

interface ServiceProvider {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceType: "Plumbing" | "Electrical" | "HVAC" | "Landscaping" | "Cleaning" | "General Maintenance" | "Security" | "Other";
  customServiceType?: string;
  hourlyRate: number;
  rating: number;
  status: "Active" | "Inactive" | "Pending Approval";
  licenseNumber?: string;
  insurance: boolean;
  insuranceExpirationDate?: string;
  insuranceCertificate?: string;
  availableHours: string;
  lastServiceDate?: string;
  completedJobs: number;
  profilePicture?: string;
}

const mockProviders: ServiceProvider[] = [
  {
    id: "1",
    companyName: "ABC Plumbing Services",
    contactPerson: "Mike Johnson",
    email: "mike@abcplumbing.com",
    phone: "(555) 111-1111",
    serviceType: "Plumbing",
    hourlyRate: 85,
    rating: 4.5,
    status: "Active",
    licenseNumber: "PL-12345",
    insurance: true,
    availableHours: "8 AM - 6 PM",
    lastServiceDate: "2024-01-10",
    completedJobs: 23,
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "2",
    companyName: "Bright Electric Co.",
    contactPerson: "Sarah Wilson",
    email: "sarah@brightelectric.com",
    phone: "(555) 222-2222",
    serviceType: "Electrical",
    hourlyRate: 95,
    rating: 4.8,
    status: "Active",
    licenseNumber: "EL-67890",
    insurance: true,
    availableHours: "24/7",
    lastServiceDate: "2024-01-12",
    completedJobs: 45,
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612c94c?w=150",
  },
  {
    id: "3",
    companyName: "Green Thumb Landscaping",
    contactPerson: "David Green",
    email: "david@greenthumb.com",
    phone: "(555) 333-3333",
    serviceType: "Landscaping",
    hourlyRate: 45,
    rating: 4.2,
    status: "Pending Approval",
    insurance: false,
    availableHours: "7 AM - 5 PM",
    completedJobs: 0,
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
];

export default function ServiceProviders() {
  const [providers, setProviders] = React.useState<ServiceProvider[]>(mockProviders);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<ServiceProvider | null>(null);
  const [showProviderDetail, setShowProviderDetail] = React.useState(false);
  const [detailProviderId, setDetailProviderId] = React.useState<string>("");
  const [profilePicture, setProfilePicture] = React.useState<string>("");
  const [formData, setFormData] = React.useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    serviceType: "General Maintenance" as ServiceProvider["serviceType"],
    customServiceType: "",
    hourlyRate: 0,
    licenseNumber: "",
    insurance: false,
    insuranceExpirationDate: "",
    insuranceCertificate: "",
    availableHours: "",
  });
  const [selectedProfileImage, setSelectedProfileImage] = React.useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = React.useState<string>("");

  const handleViewProviderDetail = (providerId: string) => {
    setDetailProviderId(providerId);
    setShowProviderDetail(true);
  };

  const handleAddProvider = () => {
    setSelectedProvider(null);
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      serviceType: "General Maintenance",
      customServiceType: "",
      hourlyRate: 0,
      licenseNumber: "",
      insurance: false,
      insuranceExpirationDate: "",
      insuranceCertificate: "",
      availableHours: "",
    });
    setSelectedProfileImage(null);
    setProfileImagePreview("");
    setOpenDialog(true);
  };

  const handleEditProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setFormData({
      companyName: provider.companyName,
      contactPerson: provider.contactPerson,
      email: provider.email,
      phone: provider.phone,
      serviceType: provider.serviceType,
      customServiceType: provider.customServiceType || "",
      hourlyRate: provider.hourlyRate,
      licenseNumber: provider.licenseNumber || "",
      insurance: provider.insurance,
      insuranceExpirationDate: provider.insuranceExpirationDate || "",
      insuranceCertificate: provider.insuranceCertificate || "",
      availableHours: provider.availableHours,
    });
    setSelectedProfileImage(null);
    setProfileImagePreview(provider.profilePicture || "");
    setOpenDialog(true);
  };

  const handleSaveProvider = () => {
    // Validation
    if (formData.serviceType === "Other" && !formData.customServiceType.trim()) {
      alert("Please specify the custom service type when 'Other' is selected.");
      return;
    }

    if (formData.insurance && !formData.insuranceExpirationDate) {
      alert("Please provide the insurance expiration date.");
      return;
    }

    // In a real app, you would upload the image to a server here
    // For demo purposes, we'll use the preview URL or existing URL
    const profilePictureUrl = selectedProfileImage ? profileImagePreview :
                             (selectedProvider ? selectedProvider.profilePicture : "");

    if (selectedProvider) {
      // Edit existing provider
      setProviders(prev =>
        prev.map(p =>
          p.id === selectedProvider.id
            ? { ...p, ...formData, profilePicture: profilePictureUrl }
            : p
        )
      );
    } else {
      // Add new provider
      const newProvider: ServiceProvider = {
        id: Date.now().toString(),
        ...formData,
        rating: 0,
        status: "Pending Approval",
        completedJobs: 0,
        profilePicture: profilePictureUrl,
      };
      setProviders(prev => [...prev, newProvider]);
    }
    setOpenDialog(false);
  };

  const handleDeleteProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      setSelectedProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = () => {
    setSelectedProfileImage(null);
    setProfileImagePreview("");
  };

  const filteredProviders = providers.filter(provider =>
    provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: ServiceProvider["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "Pending Approval": return "warning";
      case "Inactive": return "error";
      default: return "default";
    }
  };

  const totalProviders = providers.length;
  const activeProviders = providers.filter(p => p.status === "Active").length;
  const avgRating = providers.filter(p => p.rating > 0).reduce((sum, p) => sum + p.rating, 0) / providers.filter(p => p.rating > 0).length || 0;
  const avgHourlyRate = providers.reduce((sum, p) => sum + p.hourlyRate, 0) / providers.length || 0;

  if (showProviderDetail) {
    return (
      <ServiceProviderDetailPage
        providerId={detailProviderId}
        onBack={() => setShowProviderDetail(false)}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Service Providers
        </Typography>
        <Tooltip
          title="Add a new service provider to your network"
          componentsProps={{
            tooltip: {
              sx: uniformTooltipStyles
            }
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddProvider}
          >
            Add Provider
          </Button>
        </Tooltip>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <HandymanRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Providers
                  </Typography>
                  <Typography variant="h4">{totalProviders}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <HandymanRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Providers
                  </Typography>
                  <Typography variant="h4">{activeProviders}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  ⭐
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Avg Rating
                  </Typography>
                  <Typography variant="h4">{avgRating.toFixed(1)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <AttachMoneyRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Avg Rate
                  </Typography>
                  <Typography variant="h4">${Math.round(avgHourlyRate)}/hr</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <Tooltip
          title="Search providers by company name, contact person, or service type"
          componentsProps={{
            tooltip: {
              sx: uniformTooltipStyles
            }
          }}
        >
          <TextField
            fullWidth
            placeholder="Search service providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />
        </Tooltip>
      </Box>

      {/* Providers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Service Type</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Insurance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProviders.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={provider.profilePicture}
                      sx={{ bgcolor: "primary.light", width: 40, height: 40 }}
                    >
                      {!provider.profilePicture && <BusinessRoundedIcon />}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleViewProviderDetail(provider.id)}
                      >
                        {provider.companyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {provider.contactPerson}
                      </Typography>
                      {provider.licenseNumber && (
                        <Typography variant="caption" color="text.secondary">
                          License: {provider.licenseNumber}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{provider.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{provider.phone}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Available: {provider.availableHours}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={provider.serviceType === "Other" && provider.customServiceType ? provider.customServiceType : provider.serviceType}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ${provider.hourlyRate}/hr
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack alignItems="flex-start">
                    <Rating value={provider.rating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {provider.completedJobs} jobs
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={provider.status}
                    color={getStatusColor(provider.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Chip
                      label={provider.insurance ? "Insured" : "Not Insured"}
                      color={provider.insurance ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                    {provider.insurance && provider.insuranceExpirationDate && (
                      <Typography variant="caption" color="text.secondary">
                        Expires: {new Date(provider.insuranceExpirationDate).toLocaleDateString()}
                      </Typography>
                    )}
                    {provider.insurance && provider.insuranceExpirationDate &&
                     new Date(provider.insuranceExpirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                      <Chip
                        label="Expiring Soon"
                        color="warning"
                        size="small"
                        icon={<WarningRoundedIcon />}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip
                      title={`Edit ${provider.companyName} details`}
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={`Delete ${provider.companyName} from providers`}
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProvider ? "Edit Service Provider" : "Add New Service Provider"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Company Name"
                  fullWidth
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Contact Person"
                  fullWidth
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Profile Picture Upload Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Picture
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      position: 'relative',
                      minHeight: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    {profileImagePreview ? (
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={profileImagePreview}
                          sx={{ width: 80, height: 80, mb: 1 }}
                        />
                        <Tooltip
                          title="Remove profile picture"
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' }
                            }}
                            onClick={handleRemoveProfileImage}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <>
                        <CloudUploadRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Drag & drop or click to upload
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          PNG, JPG up to 5MB
                        </Typography>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Upload a professional photo of the service provider or company logo.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ��� Recommended size: 400x400 pixels
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Supported formats: JPG, PNG, GIF
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Maximum file size: 5MB
                    </Typography>
                    {selectedProfileImage && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        New image selected: {selectedProfileImage.name}
                      </Alert>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Service Type</InputLabel>
                  <Select
                    value={formData.serviceType}
                    label="Service Type"
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceProvider["serviceType"] })}
                  >
                    <MenuItem value="Plumbing">Plumbing</MenuItem>
                    <MenuItem value="Electrical">Electrical</MenuItem>
                    <MenuItem value="HVAC">HVAC</MenuItem>
                    <MenuItem value="Landscaping">Landscaping</MenuItem>
                    <MenuItem value="Cleaning">Cleaning</MenuItem>
                    <MenuItem value="General Maintenance">General Maintenance</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Hourly Rate"
                  type="number"
                  fullWidth
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
            {formData.serviceType === "Other" && (
              <TextField
                label="Custom Service Type"
                fullWidth
                required
                value={formData.customServiceType}
                onChange={(e) => setFormData({ ...formData, customServiceType: e.target.value })}
                placeholder="Please specify the type of service this vendor provides"
                helperText="This field is required when 'Other' is selected for proper tagging"
              />
            )}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="License Number (Optional)"
                  fullWidth
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Available Hours"
                  fullWidth
                  value={formData.availableHours}
                  onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
                  placeholder="e.g., 8 AM - 6 PM"
                />
              </Grid>
            </Grid>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.checked })}
                  />
                }
                label="Has Insurance Coverage"
              />
            </Box>
            {formData.insurance && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Insurance Expiration Date"
                      type="date"
                      fullWidth
                      required
                      value={formData.insuranceExpirationDate}
                      onChange={(e) => setFormData({ ...formData, insuranceExpirationDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      helperText="We'll alert you 30 days before expiration"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Certificate of Insurance"
                      fullWidth
                      value={formData.insuranceCertificate}
                      onChange={(e) => setFormData({ ...formData, insuranceCertificate: e.target.value })}
                      placeholder="Upload certificate or paste URL"
                      helperText="Upload a copy of the insurance certificate"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              title="Upload insurance certificate (PDF, JPG, PNG)"
                              componentsProps={{
                                tooltip: {
                                  sx: uniformTooltipStyles
                                }
                              }}
                            >
                              <IconButton component="label">
                                <UploadFileRoundedIcon />
                                <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                {formData.insuranceExpirationDate &&
                 new Date(formData.insuranceExpirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                  <Alert severity="warning" icon={<WarningRoundedIcon />}>
                    Insurance expires within 30 days! Please request an updated certificate.
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProvider}>
            {selectedProvider ? "Update" : "Add"} Provider
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
