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
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useCrmData } from "../contexts/CrmDataContext";
import { useAuth } from "../contexts/AuthContext";
import { useMode } from "../contexts/ModeContext";
import TwoStepAssignmentSelector from "./TwoStepAssignmentSelector";
import EnhancedFileUploadField from "./EnhancedFileUploadField";
import { FileStorageService, StoredFile } from "../services/FileStorageService";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  property: string;
  propertyId: string;
  tenant: string;
  tenantId?: string;
  unit?: string;
  category: "Plumbing" | "Electrical" | "HVAC" | "Appliance" | "General Maintenance" | "Emergency" | "Landscaping" | "Cleaning" | "Other";
  customCategory?: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: "Open" | "In Progress" | "Completed" | "Cancelled";
  requestedBy: string;
  assignedTo?: string;
  createdDate: string;
  dueDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  isEmergency: boolean;
}

interface WorkOrderDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyName?: string;
  assignedTo?: string;
  onWorkOrderCreated?: (workOrder: WorkOrder) => void;
}

export default function WorkOrderDialog({
  open,
  onClose,
  propertyId,
  propertyName,
  assignedTo,
  onWorkOrderCreated
}: WorkOrderDialogProps) {
  const { state, addWorkOrder } = useCrmData();
  const { user } = useAuth();
  const { isTenantMode } = useMode();
  const { properties, tenants } = state;

  // Check if user is a tenant - either by role or by current mode
  // Also check localStorage as fallback
  const isUserTenant = user?.role === 'Tenant' || isTenantMode ||
    (user?.role !== 'Tenant' && localStorage.getItem('userMode') === 'tenant');

  // Add visual indicator in dialog title when in tenant mode for testing
  const dialogTitle = isUserTenant ? "Create New Work Order (Tenant Mode)" : "Create New Work Order";

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    propertyId: propertyId || "",
    property: propertyName || "",
    tenantId: "",
    tenant: "",
    unit: "",
    category: "General Maintenance" as WorkOrder["category"],
    customCategory: "",
    priority: "Medium" as WorkOrder["priority"],
    assignedTo: assignedTo || "",
    dueDate: "",
    estimatedCost: "",
    notes: "",
    isEmergency: false
  });

  const [attachments, setAttachments] = React.useState<StoredFile[]>([]);

  // Reset form when dialog opens with property info
  React.useEffect(() => {
    if (open && (propertyId || assignedTo)) {
      setFormData(prev => ({
        ...prev,
        propertyId: propertyId || prev.propertyId,
        property: propertyName || prev.property,
        assignedTo: assignedTo || prev.assignedTo
      }));
    }
  }, [open, propertyId, propertyName, assignedTo]);

  // Auto-populate tenant information for tenant users
  React.useEffect(() => {
    if (open && isUserTenant && user) {
      // Find the current tenant data based on user email
      const currentTenant = tenants.find(t => t.email === user.email && t.status === 'Active');
      if (currentTenant) {
        setFormData(prev => ({
          ...prev,
          tenantId: currentTenant.id,
          tenant: `${currentTenant.firstName} ${currentTenant.lastName}`,
          // Also auto-populate property if tenant has one assigned
          propertyId: currentTenant.propertyId || prev.propertyId,
          property: currentTenant.propertyId ?
            properties.find(p => p.id === currentTenant.propertyId)?.name || prev.property
            : prev.property,
          unit: currentTenant.unit || prev.unit
        }));
      } else if (user.firstName && user.lastName) {
        // Fallback to user name if tenant record not found
        setFormData(prev => ({
          ...prev,
          tenant: `${user.firstName} ${user.lastName}`
        }));
      }
    }
  }, [open, isUserTenant, user, tenants, properties]);

  const handleSubmit = () => {
    const workOrderData = {
      title: formData.title,
      description: formData.description,
      property: formData.property,
      propertyId: formData.propertyId,
      tenant: formData.tenant,
      tenantId: formData.tenantId,
      unit: formData.unit,
      category: formData.category,
      customCategory: formData.customCategory,
      priority: formData.isEmergency ? "Emergency" : formData.priority,
      status: "Open" as WorkOrder["status"],
      requestedBy: user?.name || "Unknown",
      assignedTo: formData.assignedTo,
      createdDate: new Date().toISOString(),
      dueDate: formData.dueDate,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      notes: formData.notes,
      isEmergency: formData.isEmergency
    };

    // Save to CrmDataContext (this will auto-save to localStorage)
    const savedWorkOrder = addWorkOrder(workOrderData);

    // Save attachments as documents if any
    if (attachments.length > 0) {
      attachments.forEach(attachment => {
        const document = {
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          url: attachment.dataUrl,
          dataUrl: attachment.dataUrl,
          preview: attachment.preview,
          category: 'Other', // Default category for work order attachments
          workOrderId: savedWorkOrder.id,
          entityId: savedWorkOrder.id,
          entityType: 'workOrder',
          uploadedBy: user?.name || 'Unknown',
          description: `Attached during work order creation`,
          tags: [`work-order-${savedWorkOrder.id}`, 'work-order-attachment', 'initial-attachment']
        };
        addDocument(document);
      });
    }

    // Call the callback to notify parent component (if needed)
    if (onWorkOrderCreated) {
      const newWorkOrder = {
        ...workOrderData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onWorkOrderCreated(newWorkOrder);
    }

    // Reset form and close dialog
    setFormData({
      title: "",
      description: "",
      propertyId: propertyId || "",
      property: propertyName || "",
      tenantId: "",
      tenant: "",
      unit: "",
      category: "General Maintenance",
      customCategory: "",
      priority: "Medium",
      assignedTo: "",
      dueDate: "",
      estimatedCost: "",
      notes: "",
      isEmergency: false
    });
    setAttachments([]);
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: "",
      description: "",
      propertyId: propertyId || "",
      property: propertyName || "",
      tenantId: "",
      tenant: "",
      unit: "",
      category: "General Maintenance",
      customCategory: "",
      priority: "Medium",
      assignedTo: "",
      dueDate: "",
      estimatedCost: "",
      notes: "",
      isEmergency: false
    });
    setAttachments([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{dialogTitle}</Typography>
          {isUserTenant && (
            <Chip
              label="Tenant Mode"
              color="secondary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                label="Work Order Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Fix leaky faucet in kitchen"
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isEmergency}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isEmergency: e.target.checked, 
                      priority: e.target.checked ? "Emergency" : formData.priority 
                    })}
                  />
                }
                label="Emergency"
              />
            </Grid>
          </Grid>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the issue or maintenance request in detail..."
          />

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
                      property: selectedProperty ? `${selectedProperty.name} - ${selectedProperty.address}` : ""
                    });
                  }}
                  sx={{ '& .MuiSelect-select': { whiteSpace: 'normal', lineHeight: 1.4 } }}
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
                {propertyId && (
                  <Typography variant="caption" color="primary" sx={{ mt: 0.5 }}>
                    Pre-selected property
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Unit (Optional)"
                fullWidth
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Unit number"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {isUserTenant ? (
                <TextField
                  label="Tenant"
                  fullWidth
                  value={formData.tenant}
                  disabled
                  helperText="Auto-populated for tenant users"
                />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    value={formData.tenantId}
                    label="Tenant"
                    onChange={(e) => {
                      const selectedTenant = tenants.find(t => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        tenantId: e.target.value,
                        tenant: selectedTenant ? `${selectedTenant.firstName} ${selectedTenant.lastName}` : ""
                      });
                    }}
                  >
                    <MenuItem value="">
                      <em>Select tenant (optional)</em>
                    </MenuItem>
                    {tenants.map((tenant) => (
                      <MenuItem key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName} - {tenant.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as WorkOrder["category"] })}
                >
                  <MenuItem value="Plumbing">Plumbing</MenuItem>
                  <MenuItem value="Electrical">Electrical</MenuItem>
                  <MenuItem value="HVAC">HVAC</MenuItem>
                  <MenuItem value="Appliance">Appliance</MenuItem>
                  <MenuItem value="General Maintenance">General Maintenance</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Landscaping">Landscaping</MenuItem>
                  <MenuItem value="Cleaning">Cleaning</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  disabled={formData.isEmergency}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as WorkOrder["priority"] })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Show explanation for tenant users */}
          {isUserTenant && (
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="info.dark">
                ℹ️ Cost estimation and service provider assignment will be handled by management.
              </Typography>
            </Box>
          )}

          {/* Only show estimated cost and assigned to fields for management users */}
          {!isUserTenant && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Estimated Cost"
                    type="number"
                    fullWidth
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <TwoStepAssignmentSelector
                    value={formData.assignedTo}
                    onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                    label="Assigned To"
                    propertyId={formData.propertyId}
                    excludeCategories={["tenant"]}
                  />
                </Grid>
              </Grid>
            </>
          )}

          <TextField
            label="Additional Notes"
            fullWidth
            multiline
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information..."
          />

          {/* File Upload Section */}
          <EnhancedFileUploadField
            field={{
              id: 'work-order-attachments',
              type: 'file',
              label: 'Attachments (Optional)',
              required: false,
              maxFiles: 5,
              maxFileSize: 10,
              description: 'Upload photos, documents, or other files related to this work order'
            }}
            currentFiles={attachments}
            onFilesChange={setAttachments}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!formData.title || !formData.description || !formData.propertyId}
        >
          Create Work Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
