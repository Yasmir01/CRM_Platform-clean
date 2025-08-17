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
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
} from "@mui/material";
import WorkOrderDetailPage from "./WorkOrderDetailPage";
import { useCrmData } from "../contexts/CrmDataContext";
import { useAuth } from "../contexts/AuthContext";
import { LocalStorageService } from "../services/LocalStorageService";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  property: string;
  propertyId?: string; // Add propertyId for better integration
  unit?: string;
  tenant: string;
  tenantId?: string; // Add tenantId for better integration
  category: "Plumbing" | "Electrical" | "HVAC" | "Appliance" | "General Maintenance" | "Emergency" | "Landscaping" | "Cleaning" | "Other";
  customCategory?: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  status: "Open" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
  assignedTo?: string;
  assignedBy?: string;
  createdBy: string;
  createdDate: string;
  assignedDate?: string;
  startDate?: string;
  completionDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  isEmergency: boolean;
}

const mockWorkOrders: WorkOrder[] = [
  {
    id: "WO-001",
    title: "AC Unit Not Working",
    description: "Tenant reports AC unit in living room not cooling. Need immediate attention due to heat wave.",
    property: "Ocean View Apartments",
    propertyId: "prop-1",
    unit: "Unit 2B",
    tenant: "John Smith",
    tenantId: "tenant-1",
    category: "HVAC",
    priority: "Emergency",
    status: "Assigned",
    assignedTo: "ABC HVAC Services",
    assignedBy: "Property Manager",
    createdBy: "John Smith",
    createdDate: "2024-01-30T10:30:00Z",
    assignedDate: "2024-01-30T11:00:00Z",
    startDate: "2024-01-30T14:00:00Z",
    estimatedCost: 350,
    isEmergency: true,
  },
  {
    id: "WO-002",
    title: "Kitchen Faucet Leak",
    description: "Slow drip from kitchen faucet handle. Tenant mentioned it's been ongoing for a week.",
    property: "Sunset Gardens",
    propertyId: "prop-2",
    unit: "Unit 5A",
    tenant: "Sarah Johnson",
    tenantId: "tenant-2",
    category: "Plumbing",
    priority: "Medium",
    status: "Open",
    createdBy: "Sarah Johnson",
    createdDate: "2024-01-29T15:20:00Z",
    estimatedCost: 125,
    isEmergency: false,
  },
  {
    id: "WO-003",
    title: "Electrical Outlet Repair",
    description: "GFCI outlet in bathroom not working. Safety concern.",
    property: "Downtown Lofts",
    propertyId: "prop-3",
    unit: "Unit 3C",
    tenant: "Mike Wilson",
    tenantId: "tenant-3",
    category: "Electrical",
    priority: "High",
    status: "In Progress",
    assignedTo: "Bright Electric Co.",
    assignedBy: "Admin",
    createdBy: "Mike Wilson",
    createdDate: "2024-01-29T09:15:00Z",
    assignedDate: "2024-01-29T10:00:00Z",
    startDate: "2024-01-30T08:00:00Z",
    estimatedCost: 200,
    isEmergency: false,
  },
  {
    id: "WO-004",
    title: "Scheduled HVAC Maintenance",
    description: "Quarterly HVAC system inspection and filter replacement for Building A.",
    property: "Garden Heights Building A",
    propertyId: "prop-4",
    category: "HVAC",
    priority: "Low",
    status: "Completed",
    assignedTo: "Climate Control Services",
    assignedBy: "Property Manager",
    createdBy: "System",
    createdDate: "2024-01-28T08:00:00Z",
    assignedDate: "2024-01-28T08:30:00Z",
    startDate: "2024-01-29T09:00:00Z",
    completionDate: "2024-01-29T12:00:00Z",
    estimatedCost: 500,
    actualCost: 475,
    tenant: "Multiple Tenants",
    tenantId: "system",
    isEmergency: false,
  },
  // Test case: Work order from before lease start (should be filtered out for tenants)
  {
    id: "WO-005",
    title: "Pre-Lease Cleaning",
    description: "Deep cleaning before tenant move-in.",
    property: "Ocean View Apartments",
    propertyId: "prop-1",
    unit: "Unit 2B",
    tenant: "John Smith",
    tenantId: "tenant-1",
    category: "Cleaning",
    priority: "Medium",
    status: "Completed",
    assignedTo: "Clean Team Pro",
    assignedBy: "Property Manager",
    createdBy: "Property Manager",
    createdDate: "2023-12-15T10:00:00Z", // Before typical lease start
    assignedDate: "2023-12-15T10:30:00Z",
    startDate: "2023-12-16T09:00:00Z",
    completionDate: "2023-12-16T15:00:00Z",
    estimatedCost: 200,
    actualCost: 200,
    isEmergency: false,
  },
  // Test case: Work order from after move-out (should be filtered out for tenants)
  {
    id: "WO-006",
    title: "Post-Move-Out Repairs",
    description: "Repair damages after tenant moved out.",
    property: "Sunset Gardens",
    propertyId: "prop-2",
    unit: "Unit 5A",
    tenant: "Sarah Johnson",
    tenantId: "tenant-2",
    category: "General Maintenance",
    priority: "Medium",
    status: "Open",
    createdBy: "Property Manager",
    createdDate: "2024-12-15T10:00:00Z", // Future date, after typical lease end
    estimatedCost: 300,
    isEmergency: false,
  },
];

const serviceProviders = [
  "ABC HVAC Services",
  "Bright Electric Co.",
  "Quick Fix Plumbing",
  "Climate Control Services",
  "Green Thumb Landscaping",
  "Sparkle Clean Services",
];

export default function WorkOrders() {
  const { state } = useCrmData();
  const { properties, tenants } = state;
  const { user } = useAuth();

  // Helper function to check if tenant can interact with a work order
  const canTenantInteractWithWorkOrder = (workOrder: WorkOrder): boolean => {
    if (user?.role !== 'Tenant') return true; // Non-tenants can interact with all work orders

    const currentTenant = tenants.find(t => t.email === user.email || t.id === user.id);
    if (!currentTenant) return false;

    // Check if work order belongs to the tenant's property
    const isForTenantProperty =
      workOrder.propertyId === currentTenant.propertyId ||
      workOrder.tenantId === currentTenant.id ||
      workOrder.tenant.toLowerCase().includes(currentTenant.firstName.toLowerCase()) ||
      workOrder.tenant.toLowerCase().includes(currentTenant.lastName.toLowerCase());

    if (!isForTenantProperty) return false;

    // Check if work order is within tenant's lease period
    const workOrderDate = new Date(workOrder.createdDate);
    const leaseStart = currentTenant.leaseStart ? new Date(currentTenant.leaseStart) : null;
    const leaseEnd = currentTenant.leaseEnd ? new Date(currentTenant.leaseEnd) : null;
    const moveOutDate = currentTenant.moveOutDate ? new Date(currentTenant.moveOutDate) : null;

    if (leaseStart && workOrderDate < leaseStart) return false;

    const endDate = moveOutDate || leaseEnd;
    if (endDate && workOrderDate > endDate) return false;

    return true;
  };
  // Load work orders from localStorage, fallback to mock data
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>(() => {
    const savedWorkOrders = LocalStorageService.getWorkOrders();
    console.log('Loading work orders from localStorage:', savedWorkOrders.length, 'work orders found');
    return savedWorkOrders.length > 0 ? savedWorkOrders : mockWorkOrders;
  });

  // Helper function to update work orders and save to localStorage
  const updateWorkOrders = React.useCallback((newWorkOrdersOrUpdater: WorkOrder[] | ((prev: WorkOrder[]) => WorkOrder[])) => {
    setWorkOrders(prev => {
      const updated = typeof newWorkOrdersOrUpdater === 'function'
        ? newWorkOrdersOrUpdater(prev)
        : newWorkOrdersOrUpdater;
      try {
        LocalStorageService.saveWorkOrders(updated);
        console.log('Work orders updated and saved to localStorage');
      } catch (error) {
        console.error('Failed to save work orders after update:', error);
      }
      return updated;
    });
  }, []);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = React.useState<WorkOrder | null>(null);
  const [showWorkOrderDetail, setShowWorkOrderDetail] = React.useState(false);
  const [detailWorkOrderId, setDetailWorkOrderId] = React.useState<string>("");
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    property: "",
    propertyId: "",
    unit: "",
    tenant: "",
    tenantId: "",
    category: "General Maintenance" as WorkOrder["category"],
    customCategory: "", // For "Other" option description
    priority: "Medium" as WorkOrder["priority"],
    assignedTo: "",
    estimatedCost: "",
    notes: "",
    isEmergency: false,
    startDate: "",
    completionDate: "",
  });
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);

  const handleViewWorkOrderDetail = (workOrderId: string) => {
    setDetailWorkOrderId(workOrderId);
    setShowWorkOrderDetail(true);
  };

  const handleCreateWorkOrder = () => {
    setSelectedWorkOrder(null);

    // Auto-populate for tenant mode
    let initialFormData = {
      title: "",
      description: "",
      property: "",
      propertyId: "",
      unit: "",
      tenant: "",
      tenantId: "",
      category: "General Maintenance",
      customCategory: "",
      priority: "Medium",
      assignedTo: "",
      estimatedCost: "",
      notes: "",
      isEmergency: false,
      startDate: "",
      completionDate: "",
    };

    // If user is a tenant, auto-populate their information and restrict to their property
    if (user?.role === 'Tenant') {
      const currentTenant = tenants.find(t => t.email === user.email || t.id === user.id);

      if (currentTenant && currentTenant.propertyId) {
        const userProperty = properties.find(p => p.id === currentTenant.propertyId);

        if (userProperty) {
          initialFormData = {
            ...initialFormData,
            property: `${userProperty.name} - ${userProperty.address}`,
            propertyId: userProperty.id,
            tenant: `${currentTenant.firstName} ${currentTenant.lastName}`,
            tenantId: currentTenant.id,
          };
        }
      } else if (user.properties && user.properties.length > 0) {
        // Fallback to user.properties if tenant data not found in tenant list
        const userProperty = properties.find(p => user.properties?.includes(p.id) || user.properties?.includes(p.name));
        if (userProperty) {
          initialFormData = {
            ...initialFormData,
            property: `${userProperty.name} - ${userProperty.address}`,
            propertyId: userProperty.id,
            tenant: `${user.firstName} ${user.lastName}`,
            tenantId: user.id,
          };
        }
      }
    }

    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    // Check if tenant is trying to edit a work order not belonging to them
    if (user?.role === 'Tenant') {
      const currentTenant = tenants.find(t => t.email === user.email || t.id === user.id);

      if (currentTenant) {
        // Check if work order belongs to the tenant
        const isForTenantProperty =
          workOrder.propertyId === currentTenant.propertyId ||
          workOrder.tenantId === currentTenant.id ||
          workOrder.tenant.toLowerCase().includes(currentTenant.firstName.toLowerCase()) ||
          workOrder.tenant.toLowerCase().includes(currentTenant.lastName.toLowerCase());

        if (!isForTenantProperty) {
          alert("You can only edit work orders for your own property.");
          return;
        }

        // Check if work order is within tenant's lease period
        const workOrderDate = new Date(workOrder.createdDate);
        const leaseStart = currentTenant.leaseStart ? new Date(currentTenant.leaseStart) : null;
        const leaseEnd = currentTenant.leaseEnd ? new Date(currentTenant.leaseEnd) : null;
        const moveOutDate = currentTenant.moveOutDate ? new Date(currentTenant.moveOutDate) : null;

        if (leaseStart && workOrderDate < leaseStart) {
          alert("You cannot edit work orders from before your lease start date.");
          return;
        }

        const endDate = moveOutDate || leaseEnd;
        if (endDate && workOrderDate > endDate) {
          alert("You cannot edit work orders from after your move-out date.");
          return;
        }
      }
    }

    setSelectedWorkOrder(workOrder);
    setFormData({
      title: workOrder.title,
      description: workOrder.description,
      property: workOrder.property,
      propertyId: workOrder.propertyId || "",
      unit: workOrder.unit || "",
      tenant: workOrder.tenant,
      tenantId: workOrder.tenantId || "",
      category: workOrder.category,
      customCategory: workOrder.customCategory || "",
      priority: workOrder.priority,
      assignedTo: workOrder.assignedTo || "",
      estimatedCost: workOrder.estimatedCost?.toString() || "",
      notes: workOrder.notes || "",
      isEmergency: workOrder.isEmergency,
      startDate: workOrder.startDate ? workOrder.startDate.split('T')[0] : "",
      completionDate: workOrder.completionDate ? workOrder.completionDate.split('T')[0] : "",
    });
    setOpenDialog(true);
  };

  const handleSaveWorkOrder = () => {
    const currentUser = user ? `${user.firstName} ${user.lastName}` : "Current User";
    
    if (selectedWorkOrder) {
      // Edit existing work order
      updateWorkOrders(prev =>
        prev.map(wo =>
          wo.id === selectedWorkOrder.id
            ? {
                ...wo,
                ...formData,
                estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
                assignedDate: formData.assignedTo && !selectedWorkOrder.assignedTo ? new Date().toISOString() : wo.assignedDate,
                assignedBy: formData.assignedTo && !selectedWorkOrder.assignedTo ? currentUser : wo.assignedBy,
                status: formData.assignedTo ? "Assigned" : wo.status,
              }
            : wo
        )
      );
    } else {
      // Add new work order
      const newWorkOrder: WorkOrder = {
        id: `WO-${String(workOrders.length + 1).padStart(3, '0')}`,
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        status: formData.assignedTo ? "Assigned" : "Open",
        createdBy: currentUser,
        createdDate: new Date().toISOString(),
        assignedDate: formData.assignedTo ? new Date().toISOString() : undefined,
        assignedBy: formData.assignedTo ? currentUser : undefined,
      };
      updateWorkOrders(prev => [...prev, newWorkOrder]);
    }
    setOpenDialog(false);
  };

  const handleDeleteWorkOrder = (id: string) => {
    // Check if tenant is trying to delete a work order not belonging to them
    if (user?.role === 'Tenant') {
      const workOrderToDelete = workOrders.find(wo => wo.id === id);
      const currentTenant = tenants.find(t => t.email === user.email || t.id === user.id);

      if (workOrderToDelete && currentTenant) {
        // Check if work order belongs to the tenant
        const isForTenantProperty =
          workOrderToDelete.propertyId === currentTenant.propertyId ||
          workOrderToDelete.tenantId === currentTenant.id ||
          workOrderToDelete.tenant.toLowerCase().includes(currentTenant.firstName.toLowerCase()) ||
          workOrderToDelete.tenant.toLowerCase().includes(currentTenant.lastName.toLowerCase());

        if (!isForTenantProperty) {
          alert("You can only delete work orders for your own property.");
          return;
        }

        // Check if work order is within tenant's lease period
        const workOrderDate = new Date(workOrderToDelete.createdDate);
        const leaseStart = currentTenant.leaseStart ? new Date(currentTenant.leaseStart) : null;
        const leaseEnd = currentTenant.leaseEnd ? new Date(currentTenant.leaseEnd) : null;
        const moveOutDate = currentTenant.moveOutDate ? new Date(currentTenant.moveOutDate) : null;

        if (leaseStart && workOrderDate < leaseStart) {
          alert("You cannot delete work orders from before your lease start date.");
          return;
        }

        const endDate = moveOutDate || leaseEnd;
        if (endDate && workOrderDate > endDate) {
          alert("You cannot delete work orders from after your move-out date.");
          return;
        }

        // Additional restriction: Tenants can only delete work orders they created
        if (workOrderToDelete.createdBy !== `${currentTenant.firstName} ${currentTenant.lastName}` &&
            workOrderToDelete.createdBy !== `${user.firstName} ${user.lastName}`) {
          alert("You can only delete work orders that you created.");
          return;
        }
      }
    }

    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
  };

  // Enhanced filtering for tenant-specific access
  const filteredWorkOrders = React.useMemo(() => {
    let filtered = workOrders;

    // If user is a tenant, filter to only show work orders for their property and lease period
    if (user?.role === 'Tenant') {
      const currentTenant = tenants.find(t => t.email === user.email || t.id === user.id);

      if (currentTenant) {
        filtered = workOrders.filter(workOrder => {
          // Check if work order is for tenant's property
          const isForTenantProperty =
            workOrder.propertyId === currentTenant.propertyId ||
            workOrder.tenant.toLowerCase().includes(currentTenant.firstName.toLowerCase()) ||
            workOrder.tenant.toLowerCase().includes(currentTenant.lastName.toLowerCase()) ||
            workOrder.tenantId === currentTenant.id;

          if (!isForTenantProperty) {
            return false;
          }

          // Check if work order is within tenant's lease period
          const workOrderDate = new Date(workOrder.createdDate);
          const leaseStart = currentTenant.leaseStart ? new Date(currentTenant.leaseStart) : null;
          const leaseEnd = currentTenant.leaseEnd ? new Date(currentTenant.leaseEnd) : null;
          const moveOutDate = currentTenant.moveOutDate ? new Date(currentTenant.moveOutDate) : null;

          // If tenant has lease dates, check if work order is within the period
          if (leaseStart) {
            // Work order must be after lease start
            if (workOrderDate < leaseStart) {
              return false;
            }
          }

          // Check end date - use moveOutDate if available, otherwise leaseEnd
          const endDate = moveOutDate || leaseEnd;
          if (endDate) {
            // Work order must be before move-out/lease end
            if (workOrderDate > endDate) {
              return false;
            }
          }

          return true;
        });
      } else {
        // If tenant not found in data, show no work orders
        filtered = [];
      }
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(workOrder =>
        workOrder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workOrder.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [workOrders, user, tenants, searchTerm]);

  const getStatusColor = (status: WorkOrder["status"]) => {
    switch (status) {
      case "Open": return "warning";
      case "Assigned": return "info";
      case "In Progress": return "primary";
      case "Completed": return "success";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "Emergency": return "error";
      case "High": return "warning";
      case "Medium": return "info";
      case "Low": return "success";
      default: return "default";
    }
  };

  const totalWorkOrders = workOrders.length;
  const openWorkOrders = workOrders.filter(wo => wo.status === "Open").length;
  const inProgressWorkOrders = workOrders.filter(wo => wo.status === "In Progress").length;
  const completedWorkOrders = workOrders.filter(wo => wo.status === "Completed").length;

  if (showWorkOrderDetail) {
    return (
      <WorkOrderDetailPage
        workOrderId={detailWorkOrderId}
        onBack={() => setShowWorkOrderDetail(false)}
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
          Work Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleCreateWorkOrder}
        >
          Create Work Order
        </Button>
      </Stack>

      {/* Tenant-specific information */}
      {user?.role === 'Tenant' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You can only view and manage work orders for your property during your lease period.
            {(() => {
              const currentTenant = tenants.find(t => t.email === user.email || t.id === user.id);
              if (currentTenant) {
                const leaseStart = currentTenant.leaseStart ? new Date(currentTenant.leaseStart).toLocaleDateString() : 'N/A';
                const leaseEnd = currentTenant.leaseEnd ? new Date(currentTenant.leaseEnd).toLocaleDateString() : 'Ongoing';
                const moveOutDate = currentTenant.moveOutDate ? new Date(currentTenant.moveOutDate).toLocaleDateString() : null;

                return (
                  <>
                    {' '}Your lease period: {leaseStart} to {moveOutDate || leaseEnd}.
                    {moveOutDate && ' (Moved out: ' + moveOutDate + ')'}
                  </>
                );
              }
              return '';
            })()}
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <BuildRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Work Orders
                  </Typography>
                  <Typography variant="h4">{totalWorkOrders}</Typography>
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
                  <AssignmentRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Open
                  </Typography>
                  <Typography variant="h4">{openWorkOrders}</Typography>
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
                  <BuildRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    In Progress
                  </Typography>
                  <Typography variant="h4">{inProgressWorkOrders}</Typography>
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
                  <BuildRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h4">{completedWorkOrders}</Typography>
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
          placeholder="Search work orders..."
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

      {/* Work Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Work Order</TableCell>
              <TableCell>Property/Tenant</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkOrders.map((workOrder) => (
              <TableRow key={workOrder.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      <BuildRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleViewWorkOrderDetail(workOrder.id)}
                      >
                        {workOrder.id} - {workOrder.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workOrder.description.length > 50 
                          ? `${workOrder.description.substring(0, 50)}...`
                          : workOrder.description
                        }
                      </Typography>
                      {workOrder.isEmergency && (
                        <Chip 
                          label="EMERGENCY" 
                          color="error" 
                          size="small" 
                          icon={<PriorityHighRoundedIcon />}
                        />
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {workOrder.property} {workOrder.unit ? `- ${workOrder.unit}` : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {workOrder.tenant}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={workOrder.category}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={workOrder.priority}
                    color={getPriorityColor(workOrder.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={workOrder.status}
                    color={getStatusColor(workOrder.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {workOrder.assignedTo ? (
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        {workOrder.assignedTo}
                      </Typography>
                      {workOrder.assignedDate && (
                        <Typography variant="caption" color="text.secondary">
                          Assigned: {new Date(workOrder.assignedDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Unassigned
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {workOrder.estimatedCost && (
                    <Typography variant="body2">
                      ${workOrder.estimatedCost}
                    </Typography>
                  )}
                  {workOrder.actualCost && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Actual: ${workOrder.actualCost}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {new Date(workOrder.createdDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    by {workOrder.createdBy}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {canTenantInteractWithWorkOrder(workOrder) && (
                      <>
                        <Tooltip title="Edit Work Order">
                          <IconButton
                            size="small"
                            onClick={() => handleEditWorkOrder(workOrder)}
                          >
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        {(user?.role !== 'Tenant' ||
                          workOrder.createdBy === `${user.firstName} ${user.lastName}`) && (
                          <Tooltip title="Delete Work Order">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteWorkOrder(workOrder.id)}
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                    {!canTenantInteractWithWorkOrder(workOrder) && user?.role === 'Tenant' && (
                      <Typography variant="caption" color="text.secondary">
                        Not accessible
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Work Order Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedWorkOrder ? "Edit Work Order" : "Create New Work Order"}
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
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isEmergency}
                      onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked, priority: e.target.checked ? "Emergency" : formData.priority })}
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
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.propertyId}
                    label="Property"
                    disabled={user?.role === 'Tenant'}
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
                  {user?.role === 'Tenant' && (
                    <Typography variant="caption" color="primary" sx={{ mt: 0.5 }}>
                      Auto-populated for your property
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
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth required>
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    value={formData.tenantId}
                    label="Tenant"
                    disabled={user?.role === 'Tenant'}
                    onChange={(e) => {
                      const selectedTenant = tenants.find(t => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        tenantId: e.target.value,
                        tenant: selectedTenant ? `${selectedTenant.firstName} ${selectedTenant.lastName}` : ""
                      });
                    }}
                    sx={{ '& .MuiSelect-select': { whiteSpace: 'normal', lineHeight: 1.4 } }}
                  >
                    <MenuItem value="">
                      <em>Select a tenant</em>
                    </MenuItem>
                    {tenants
                      .filter(tenant => !formData.propertyId || tenant.propertyId === formData.propertyId)
                      .map((tenant) => (
                        <MenuItem key={tenant.id} value={tenant.id}>
                          <Box sx={{ py: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {tenant.firstName} {tenant.lastName}
                            </Typography>
                            {tenant.propertyId && (
                              <Typography variant="caption" color="text.secondary">
                                {properties.find(p => p.id === tenant.propertyId)?.name}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                  </Select>
                  {user?.role === 'Tenant' && (
                    <Typography variant="caption" color="primary" sx={{ mt: 0.5 }}>
                      Auto-populated with your information
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => {
                      const selectedCategory = e.target.value as WorkOrder["category"];
                      if (selectedCategory === "Other") {
                        setCategoryDialogOpen(true);
                      } else {
                        setFormData({ ...formData, category: selectedCategory, customCategory: "" });
                      }
                    }}
                  >
                    <MenuItem value="Plumbing">Plumbing</MenuItem>
                    <MenuItem value="Electrical">Electrical</MenuItem>
                    <MenuItem value="HVAC">HVAC</MenuItem>
                    <MenuItem value="Appliance">Appliance</MenuItem>
                    <MenuItem value="General Maintenance">General Maintenance</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                    <MenuItem value="Landscaping">Landscaping</MenuItem>
                    <MenuItem value="Cleaning">Cleaning</MenuItem>
                    <MenuItem value="Other">Other - Custom Category</MenuItem>
                  </Select>
                  {formData.category === "Other" && formData.customCategory && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Custom: {formData.customCategory}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as WorkOrder["priority"] })}
                    disabled={formData.isEmergency}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Estimated Cost"
                  type="number"
                  fullWidth
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Assign to Service Provider</InputLabel>
              <Select
                value={formData.assignedTo}
                label="Assign to Service Provider"
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {serviceProviders.map((provider) => (
                  <MenuItem key={provider} value={provider}>{provider}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.assignedTo && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Target Completion Date"
                    type="date"
                    fullWidth
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            <TextField
              label="Additional Notes"
              fullWidth
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            {formData.isEmergency && (
              <Alert severity="error">
                This work order is marked as an emergency and will be given highest priority.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveWorkOrder}>
            {selectedWorkOrder ? "Update" : "Create"} Work Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Category Description Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Custom Work Order Category</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Please describe the custom category for this work order. This will help categorize similar requests in the future.
            </Alert>
            <TextField
              label="Custom Category Description"
              fullWidth
              required
              multiline
              rows={3}
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              placeholder="e.g., Pest Control, Window Repair, Security System, etc."
              helperText="Be specific to help with future categorization"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCategoryDialogOpen(false);
            setFormData({ ...formData, category: "General Maintenance", customCategory: "" });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (formData.customCategory.trim()) {
                setFormData({ ...formData, category: "Other" });
                setCategoryDialogOpen(false);
              }
            }}
            disabled={!formData.customCategory.trim()}
          >
            Save Custom Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
