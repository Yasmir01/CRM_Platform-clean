import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useCrmData, Tenant } from "../contexts/CrmDataContext";

// Local interface for the dialog's form handling (extends the CRM context tenant)
interface TenantFormData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  propertyName: string;
  unit?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  status: "Active" | "Inactive" | "Pending" | "Moving Out";
  profileImage?: string;
  documents?: any[];
  notes?: string;
}

interface TenantDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyName?: string;
  onTenantCreated?: (tenant: TenantFormData) => void;
  existingTenant?: TenantFormData | null;
}

export default function TenantDialog({ 
  open, 
  onClose, 
  propertyId, 
  propertyName,
  onTenantCreated,
  existingTenant
}: TenantDialogProps) {
  const { state, addTenant, updateTenant } = useCrmData();
  const { properties, tenants } = state;
  
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [confirmationMessage, setConfirmationMessage] = React.useState("");
  
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    propertyId: propertyId || "",
    propertyName: propertyName || "",
    unit: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    leaseStartDate: "",
    leaseEndDate: "",
    monthlyRent: "",
    securityDeposit: "",
    notes: "",
    status: "Active" as Tenant["status"]
  });

  // Check for existing tenant when property is selected
  React.useEffect(() => {
    if (formData.propertyId && open) {
      const existingTenantForProperty = tenants.find(t => t.propertyId === formData.propertyId && t.status === "Active");
      if (existingTenantForProperty && !existingTenant) {
        setConfirmationMessage(
          `Property "${formData.propertyName}" already has an active tenant: ${existingTenantForProperty.firstName} ${existingTenantForProperty.lastName}. Do you want to replace this tenant or assign to a different unit?`
        );
        setShowConfirmation(true);
      }
    }
  }, [formData.propertyId, tenants, open, existingTenant, formData.propertyName]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      if (existingTenant) {
        setFormData({
          firstName: existingTenant.firstName,
          lastName: existingTenant.lastName,
          email: existingTenant.email,
          phone: existingTenant.phone,
          propertyId: existingTenant.propertyId,
          propertyName: existingTenant.propertyName,
          unit: existingTenant.unit || "",
          emergencyContactName: existingTenant.emergencyContact?.name || "",
          emergencyContactPhone: existingTenant.emergencyContact?.phone || "",
          emergencyContactRelationship: existingTenant.emergencyContact?.relationship || "",
          leaseStartDate: existingTenant.leaseStartDate || "",
          leaseEndDate: existingTenant.leaseEndDate || "",
          monthlyRent: existingTenant.monthlyRent?.toString() || "",
          securityDeposit: existingTenant.securityDeposit?.toString() || "",
          notes: existingTenant.notes || "",
          status: existingTenant.status
        });
      } else if (propertyId && propertyName) {
        setFormData(prev => ({
          ...prev,
          propertyId,
          propertyName
        }));
      }
    }
  }, [open, existingTenant, propertyId, propertyName]);

  const handleSubmit = () => {
    // Map form data to CrmDataContext Tenant interface
    const tenantData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      propertyId: formData.propertyId,
      emergencyContact: formData.emergencyContactName ? {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelationship
      } : undefined,
      leaseStart: formData.leaseStartDate,
      leaseEnd: formData.leaseEndDate,
      monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
      depositAmount: formData.securityDeposit ? parseFloat(formData.securityDeposit) : undefined,
      // Map status values to CrmDataContext enum
      status: (formData.status === "Pending" || formData.status === "Moving Out")
        ? "Prospective" as const
        : formData.status as "Active" | "Inactive"
    };

    if (existingTenant) {
      updateTenant({ ...tenantData, id: existingTenant.id } as Tenant);
    } else {
      addTenant(tenantData);
    }

    // Create a compatible object for the callback
    if (onTenantCreated) {
      const callbackTenant = {
        id: existingTenant?.id || Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        propertyId: formData.propertyId,
        propertyName: formData.propertyName,
        unit: formData.unit,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        } : undefined,
        leaseStartDate: formData.leaseStartDate,
        leaseEndDate: formData.leaseEndDate,
        monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : undefined,
        status: formData.status,
        notes: formData.notes
      };
      onTenantCreated(callbackTenant as any);
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      propertyId: propertyId || "",
      propertyName: propertyName || "",
      unit: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      leaseStartDate: "",
      leaseEndDate: "",
      monthlyRent: "",
      securityDeposit: "",
      notes: "",
      status: "Active"
    });
    setShowConfirmation(false);
    setConfirmationMessage("");
    onClose();
  };

  const handleConfirmationProceed = () => {
    setShowConfirmation(false);
    setConfirmationMessage("");
  };

  const handleConfirmationCancel = () => {
    setShowConfirmation(false);
    setConfirmationMessage("");
    setFormData(prev => ({ ...prev, propertyId: "", propertyName: "" }));
  };

  if (showConfirmation) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Existing Tenant Found</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {confirmationMessage}
          </Alert>
          <Typography variant="body2">
            You can still proceed to add this tenant, but make sure to specify a different unit or update the existing tenant record.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmationProceed}>
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {existingTenant ? "Edit Tenant" : "Add New Tenant"}
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
              />
            </Grid>
          </Grid>

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
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <FormControl fullWidth required>
                <InputLabel>Property</InputLabel>
                <Select
                  value={formData.propertyId}
                  label="Property"
                  disabled={!!propertyId} // Disable if property is pre-selected
                  onChange={(e) => {
                    const selectedProperty = properties.find(p => p.id === e.target.value);
                    setFormData({
                      ...formData,
                      propertyId: e.target.value,
                      propertyName: selectedProperty ? selectedProperty.name : ""
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>Select a property</em>
                  </MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      <Box>
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
                {propertyId && (
                  <Typography variant="caption" color="primary" sx={{ mt: 0.5 }}>
                    Pre-selected property
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Unit Number"
                fullWidth
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Unit #"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Emergency Contact Name"
                fullWidth
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Full name"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Emergency Contact Phone"
                fullWidth
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="Phone number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Relationship"
                fullWidth
                value={formData.emergencyContactRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                placeholder="e.g., Spouse, Parent"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Lease Start Date"
                type="date"
                fullWidth
                value={formData.leaseStartDate}
                onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Lease End Date"
                type="date"
                fullWidth
                value={formData.leaseEndDate}
                onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Monthly Rent"
                type="number"
                fullWidth
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Security Deposit"
                type="number"
                fullWidth
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Tenant["status"] })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Moving Out">Moving Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Additional Notes"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information about the tenant..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.propertyId}
        >
          {existingTenant ? "Update" : "Add"} Tenant
        </Button>
      </DialogActions>
    </Dialog>
  );
}
