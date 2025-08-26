import * as React from "react";
import { useSearchParams } from "react-router-dom";
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
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
} from "@mui/material";
import { useCrmData } from "../contexts/CrmDataContext";
import TenantDetailPage from "./TenantDetailPage";
import TenantFinancialIndicators from "../components/TenantFinancialIndicators";
import { tenantFinancialService } from "../services/TenantFinancialService";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";

interface CommunicationPreferences {
  smsEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
  achOptIn: boolean;
  autoPayEnabled: boolean;
}

interface TenantPaymentInfo {
  bankAccountLast4?: string;
  routingNumber?: string;
  cardLast4?: string;
  cardType?: string;
  autoPayAmount?: number;
  autoPayDate?: number; // day of month
}

interface Tenant {
  id: string;
  accountNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  property: string;
  unit?: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  status: "Active" | "Pending" | "Inactive" | "Late Payment";
  emergencyContact: string;
  emergencyPhone: string;
  profilePicture?: string;
  communicationPrefs: CommunicationPreferences;
  paymentInfo?: TenantPaymentInfo;
}

// Note: Tenant data now comes from CrmDataContext, not mock data

export default function Tenants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, addTenant, updateTenant, dispatch } = useCrmData();
  const { tenants, properties } = state;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState<any | null>(null);
  const [profilePicture, setProfilePicture] = React.useState<string>("");
  const [showTenantDetail, setShowTenantDetail] = React.useState(false);
  const [detailTenantId, setDetailTenantId] = React.useState<string>("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    propertyId: "",
    unit: "",
    leaseStart: "",
    leaseEnd: "",
    monthlyRent: 0,
    emergencyContact: "",
    emergencyPhone: "",
    communicationPrefs: {
      smsEnabled: true,
      emailEnabled: true,
      phoneEnabled: true,
      achOptIn: false,
      autoPayEnabled: false,
    },
    paymentInfo: {
      bankAccountLast4: "",
      routingNumber: "",
      cardLast4: "",
      cardType: "",
      autoPayAmount: 0,
      autoPayDate: 1,
    },
  });

  // Handle navigation from Properties page
  React.useEffect(() => {
    const tenantNameFromUrl = searchParams.get('tenant');
    if (tenantNameFromUrl) {
      // Find tenant by name and show their details
      const foundTenant = tenants.find(tenant =>
        `${tenant.firstName} ${tenant.lastName}` === tenantNameFromUrl
      );
      if (foundTenant) {
        setDetailTenantId(foundTenant.id);
        setShowTenantDetail(true);
        // Clear the search param after processing
        setSearchParams({});
        console.log(`Navigated to tenant: ${foundTenant.firstName} ${foundTenant.lastName}`);
      } else {
        console.warn(`Tenant not found: ${tenantNameFromUrl}`);
      }
    }
  }, [searchParams, tenants, setSearchParams]);

  // Auto-populate monthly rent when property is selected
  React.useEffect(() => {
    if (formData.propertyId && !formData.monthlyRent) {
      const selectedProperty = properties.find(p => p.id === formData.propertyId);
      if (selectedProperty) {
        setFormData(prev => ({ ...prev, monthlyRent: selectedProperty.monthlyRent }));
      }
    }
  }, [formData.propertyId, properties]);

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setProfilePicture("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      propertyId: "",
      unit: "",
      leaseStart: "",
      leaseEnd: "",
      monthlyRent: 0,
      emergencyContact: "",
      emergencyPhone: "",
      communicationPrefs: {
        smsEnabled: true,
        emailEnabled: true,
        phoneEnabled: true,
        achOptIn: false,
        autoPayEnabled: false,
      },
      paymentInfo: {
        bankAccountLast4: "",
        routingNumber: "",
        cardLast4: "",
        cardType: "",
        autoPayAmount: 0,
        autoPayDate: 1,
      },
    });
    setOpenDialog(true);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setProfilePicture(tenant.profilePicture || "");
    setFormData({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      propertyId: tenant.propertyId || "",
      unit: tenant.unit || "",
      leaseStart: tenant.leaseStart,
      leaseEnd: tenant.leaseEnd,
      monthlyRent: tenant.monthlyRent,
      emergencyContact: tenant.emergencyContact,
      emergencyPhone: tenant.emergencyPhone,
      communicationPrefs: tenant.communicationPrefs,
      paymentInfo: tenant.paymentInfo || {
        bankAccountLast4: "",
        routingNumber: "",
        cardLast4: "",
        cardType: "",
        autoPayAmount: 0,
        autoPayDate: 1,
      },
    });
    setOpenDialog(true);
  };

  const handleSaveTenant = () => {
    // Validate required fields
    if (!formData.firstName.trim()) {
      alert('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      alert('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email address is required');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Phone number is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (selectedTenant) {
      // Edit existing tenant
      const updatedTenant = {
        ...selectedTenant,
        ...formData,
        profilePicture: profilePicture || selectedTenant.profilePicture,
        updatedAt: new Date().toISOString(),
      };
      updateTenant(updatedTenant);
    } else {
      // Add new tenant
      const newTenantData = {
        ...formData,
        status: "Pending" as const,
        profilePicture: profilePicture,
        emergencyContact: formData.emergencyContact ? {
          name: formData.emergencyContact,
          phone: formData.emergencyPhone,
          relationship: "Emergency Contact"
        } : undefined,
      };
      addTenant(newTenantData);
    }
    setOpenDialog(false);
  };

  const handleDeleteTenant = (id: string) => {
    dispatch({ type: 'DELETE_TENANT', payload: id });
  };

  const handleViewTenantDetail = (tenantId: string) => {
    setDetailTenantId(tenantId);
    setShowTenantDetail(true);
  };

  const handleBackToTenantList = () => {
    setShowTenantDetail(false);
    setDetailTenantId("");
  };

  const filteredTenants = tenants.filter(tenant => {
    const property = properties.find(p => p.id === tenant.propertyId);
    const propertyName = property ? property.name : '';

    return `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           propertyName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: Tenant["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "Pending": return "warning";
      case "Inactive": return "default";
      case "Late Payment": return "error";
      default: return "default";
    }
  };

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === "Active").length;
  const latePayments = tenants.filter(t => t.status === "Late Payment").length;
  const totalRevenue = tenants.filter(t => t.status === "Active").reduce((sum, t) => sum + t.monthlyRent, 0);

  // Show tenant detail page if selected
  if (showTenantDetail && detailTenantId) {
    return (
      <TenantDetailPage
        tenantId={detailTenantId}
        onBack={handleBackToTenantList}
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
          Tenant Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddTenant}
          data-testid="add-tenant-button"
        >
          Add Tenant
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Tenants
                  </Typography>
                  <Typography variant="h4">{totalTenants}</Typography>
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
                  <PersonRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Tenants
                  </Typography>
                  <Typography variant="h4">{activeTenants}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <PersonRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Late Payments
                  </Typography>
                  <Typography variant="h4">{latePayments}</Typography>
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
                  $
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Revenue
                  </Typography>
                  <Typography variant="h4">${totalRevenue.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search tenants..."
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
      </Box>

      {/* Tenants Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Account #</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Lease Period</TableCell>
              <TableCell>Monthly Rent</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={tenant.profilePicture}
                      sx={{ bgcolor: "primary.light", width: 40, height: 40 }}
                    >
                      {!tenant.profilePicture && `${tenant.firstName[0]}${tenant.lastName[0]}`}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => handleViewTenantDetail(tenant.id)}
                      >
                        {tenant.firstName} {tenant.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tenant.unit && `Unit ${tenant.unit}`}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {tenant.accountNumber || 'Not generated'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailRoundedIcon
                        fontSize="small"
                        color={tenant.communicationPrefs?.emailEnabled ? "primary" : "disabled"}
                      />
                      <Typography variant="body2">{tenant.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneRoundedIcon
                        fontSize="small"
                        color={tenant.communicationPrefs?.phoneEnabled ? "primary" : "disabled"}
                      />
                      <Typography variant="body2">{tenant.phone}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Tooltip title={tenant.communicationPrefs?.smsEnabled ? "SMS Enabled" : "SMS Disabled"}>
                        <SmsRoundedIcon
                          fontSize="small"
                          color={tenant.communicationPrefs?.smsEnabled ? "primary" : "disabled"}
                        />
                      </Tooltip>
                      <Tooltip title={tenant.communicationPrefs?.achOptIn ? "ACH Enabled" : "ACH Disabled"}>
                        <AccountBalanceRoundedIcon
                          fontSize="small"
                          color={tenant.communicationPrefs?.achOptIn ? "success" : "disabled"}
                        />
                      </Tooltip>
                      {tenant.communicationPrefs?.autoPayEnabled && (
                        <Tooltip title="Auto Pay Enabled">
                          <CheckCircleRoundedIcon
                            fontSize="small"
                            color="success"
                          />
                        </Tooltip>
                      )}
                      {tenant.paymentInfo?.cardLast4 && (
                        <Tooltip title={`Card ending in ${tenant.paymentInfo.cardLast4}`}>
                          <CreditCardRoundedIcon
                            fontSize="small"
                            color="info"
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HomeWorkRoundedIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {(() => {
                        const property = properties.find(p => p.id === tenant.propertyId);
                        return property ? property.name : 'No property assigned';
                      })()}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>${tenant.monthlyRent.toLocaleString()}</TableCell>
                <TableCell>
                  <TenantFinancialIndicators tenantId={tenant.id} compact />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tenant.status}
                    color={getStatusColor(tenant.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Tenant">
                      <IconButton
                        size="small"
                        onClick={() => handleEditTenant(tenant)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Tenant">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTenant(tenant.id)}
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

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTenant ? "Edit Tenant" : "Add New Tenant"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name *"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  error={!formData.firstName && formData.firstName !== undefined}
                  helperText={!formData.firstName && formData.firstName !== undefined ? "First name is required" : ""}
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name *"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  error={!formData.lastName && formData.lastName !== undefined}
                  helperText={!formData.lastName && formData.lastName !== undefined ? "Last name is required" : ""}
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Account Number Display */}
            {selectedTenant && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Account Number"
                    fullWidth
                    value={selectedTenant.accountNumber || 'Will be generated on save'}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      minHeight: '80px',
                      '& .MuiInputBase-root': {
                        minHeight: '56px',
                        backgroundColor: 'grey.50'
                      }
                    }}
                    helperText="Account number is automatically generated"
                  />
                </Grid>
              </Grid>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  error={!formData.email && formData.email !== undefined}
                  helperText={!formData.email && formData.email !== undefined ? "Email address is required" : ""}
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone Number *"
                  fullWidth
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  error={!formData.phone && formData.phone !== undefined}
                  helperText={!formData.phone && formData.phone !== undefined ? "Phone number is required" : ""}
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <FormControl
                  fullWidth
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                >
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.propertyId}
                    label="Property"
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    sx={{
                      '& .MuiSelect-select': {
                        whiteSpace: 'normal',
                        lineHeight: 1.4,
                        minHeight: '56px',
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a property</em>
                    </MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {property.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {property.address}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Unit Number"
                  fullWidth
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., 2A, 101"
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Lease Start Date"
                  type="date"
                  fullWidth
                  value={formData.leaseStart}
                  onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Lease End Date"
                  type="date"
                  fullWidth
                  value={formData.leaseEnd}
                  onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Monthly Rent"
                  type="number"
                  fullWidth
                  value={formData.monthlyRent || (() => {
                    const selectedProperty = properties.find(p => p.id === formData.propertyId);
                    return selectedProperty ? selectedProperty.monthlyRent : 0;
                  })()}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={
                    formData.propertyId && properties.find(p => p.id === formData.propertyId)
                      ? `Default: $${properties.find(p => p.id === formData.propertyId)?.monthlyRent.toLocaleString()}`
                      : "Auto-fills from property"
                  }
                  sx={{
                    minHeight: '80px',
                    '& .MuiInputBase-root': {
                      minHeight: '56px'
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Profile Picture Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Profile Picture</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={profilePicture}
                  sx={{ width: 80, height: 80 }}
                >
                  {!profilePicture && formData.firstName && formData.lastName &&
                    `${formData.firstName[0]}${formData.lastName[0]}`}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadRoundedIcon />}
                >
                  Upload Picture
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </Button>
                {profilePicture && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => setProfilePicture("")}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Communication Preferences */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Communication Preferences</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.communicationPrefs.emailEnabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          communicationPrefs: {
                            ...formData.communicationPrefs,
                            emailEnabled: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Email Communications"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.communicationPrefs.smsEnabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          communicationPrefs: {
                            ...formData.communicationPrefs,
                            smsEnabled: e.target.checked
                          }
                        })}
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.communicationPrefs.phoneEnabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          communicationPrefs: {
                            ...formData.communicationPrefs,
                            phoneEnabled: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Phone Calls"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.communicationPrefs.achOptIn}
                        onChange={(e) => setFormData({
                          ...formData,
                          communicationPrefs: {
                            ...formData.communicationPrefs,
                            achOptIn: e.target.checked
                          }
                        })}
                      />
                    }
                    label="ACH Payments"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Payment Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Payment Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Bank Account (Last 4 Digits)"
                    fullWidth
                    value={formData.paymentInfo.bankAccountLast4}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentInfo: {
                        ...formData.paymentInfo,
                        bankAccountLast4: e.target.value
                      }
                    })}
                    placeholder="1234"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Routing Number"
                    fullWidth
                    value={formData.paymentInfo.routingNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentInfo: {
                        ...formData.paymentInfo,
                        routingNumber: e.target.value
                      }
                    })}
                    placeholder="121000248"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Card (Last 4 Digits)"
                    fullWidth
                    value={formData.paymentInfo.cardLast4}
                    onChange={(e) => setFormData({
                      ...formData,
                      paymentInfo: {
                        ...formData.paymentInfo,
                        cardLast4: e.target.value
                      }
                    })}
                    placeholder="5678"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Card Type</InputLabel>
                    <Select
                      value={formData.paymentInfo.cardType}
                      label="Card Type"
                      onChange={(e) => setFormData({
                        ...formData,
                        paymentInfo: {
                          ...formData.paymentInfo,
                          cardType: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="Visa">Visa</MenuItem>
                      <MenuItem value="Mastercard">Mastercard</MenuItem>
                      <MenuItem value="American Express">American Express</MenuItem>
                      <MenuItem value="Discover">Discover</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.communicationPrefs.autoPayEnabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          communicationPrefs: {
                            ...formData.communicationPrefs,
                            autoPayEnabled: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Enable Auto Pay"
                  />
                </Grid>
                {formData.communicationPrefs.autoPayEnabled && (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        label="Auto Pay Amount"
                        type="number"
                        fullWidth
                        value={formData.paymentInfo.autoPayAmount}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentInfo: {
                            ...formData.paymentInfo,
                            autoPayAmount: parseInt(e.target.value) || 0
                          }
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Auto Pay Date (Day of Month)"
                        type="number"
                        fullWidth
                        value={formData.paymentInfo.autoPayDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentInfo: {
                            ...formData.paymentInfo,
                            autoPayDate: parseInt(e.target.value) || 1
                          }
                        })}
                        inputProps={{ min: 1, max: 31 }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Emergency Contact"
                  fullWidth
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Emergency Phone"
                  fullWidth
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTenant}
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
          >
            {selectedTenant ? "Update" : "Add"} Tenant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
