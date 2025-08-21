import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import TaskDetailPage from "./TaskDetailPage";
import { useCrmData } from "../contexts/CrmDataContext";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  dueDate: string;
  dueTime?: string;
  category: "Call" | "Email" | "Property" | "Maintenance" | "Work Order" | "Follow-up" | "Other";
  customCategory?: string;
  property?: string;
  propertyId?: string; // Add propertyId for better integration
  client?: string;
  clientId?: string; // Add clientId for better integration
  createdDate: string;
  completedDate?: string;
  reminder: boolean;
  workOrderId?: string;
  workOrderStatus?: string;
  estimatedCost?: number;
  vendor?: string;
}

const generateRealTasks = (crmData: any): Task[] => {
  const tasks: Task[] = [];
  const { properties = [], tenants = [], workOrders = [] } = crmData || {};

  // Generate lease renewal tasks
  tenants.forEach((tenant: any, index: number) => {
    if (tenant.status === "Active" && tenant.leaseEnd) {
      const leaseEndDate = new Date(tenant.leaseEnd);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
        const property = properties.find((p: any) => p.id === tenant.propertyId);
        const taskDate = new Date();
        taskDate.setDate(taskDate.getDate() + Math.min(daysUntilExpiry - 30, 7));

        tasks.push({
          id: `lease-${tenant.id}`,
          title: `Follow up with ${tenant.firstName} ${tenant.lastName} about lease renewal`,
          description: `Contact tenant to discuss lease renewal options for ${property?.name || 'property'}. Lease expires in ${daysUntilExpiry} days.`,
          assignedTo: "Property Manager",
          assignedBy: "System",
          priority: daysUntilExpiry <= 30 ? "High" : "Medium",
          status: "Pending",
          dueDate: taskDate.toISOString().split('T')[0],
          dueTime: "10:00",
          category: "Follow-up",
          property: property?.name || "Unknown Property",
          propertyId: property?.id,
          client: `${tenant.firstName} ${tenant.lastName}`,
          clientId: tenant.id,
          createdDate: new Date().toISOString().split('T')[0],
          reminder: true,
        });
      }
    }
  });

  // Generate work order tasks
  workOrders.forEach((workOrder: any) => {
    if (workOrder.status === "Open" || workOrder.status === "In Progress") {
      const property = properties.find((p: any) => p.id === workOrder.propertyId);
      const tenant = tenants.find((t: any) => t.propertyId === workOrder.propertyId && t.status === "Active");

      tasks.push({
        id: `wo-${workOrder.id}`,
        title: `${workOrder.type} - ${workOrder.description} [WO-${workOrder.id}]`,
        description: `Complete ${workOrder.type.toLowerCase()} work order for ${property?.name || 'property'}`,
        assignedTo: workOrder.assignedTo || "Maintenance Team",
        assignedBy: "Property Manager",
        priority: workOrder.priority === "Urgent" ? "High" : "Medium",
        status: workOrder.status === "Open" ? "Pending" : "In Progress",
        dueDate: workOrder.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: "14:00",
        category: "Work Order",
        property: property?.name || "Unknown Property",
        propertyId: property?.id,
        client: tenant ? `${tenant.firstName} ${tenant.lastName}` : undefined,
        clientId: tenant?.id,
        createdDate: workOrder.createdAt.split('T')[0],
        reminder: true,
        workOrderId: workOrder.id,
        workOrderStatus: workOrder.status,
        estimatedCost: workOrder.estimatedCost,
        vendor: workOrder.assignedTo,
      });
    }
  });

  // Generate rent collection tasks
  const today = new Date();
  if (today.getDate() <= 5) { // Beginning of month
    const tenantsWithBalance = tenants.filter((t: any) => t.status === "Active" && t.balance && t.balance > 0);

    if (tenantsWithBalance.length > 0) {
      tasks.push({
        id: "rent-collection",
        title: "Follow up on outstanding rent payments",
        description: `Contact ${tenantsWithBalance.length} tenants with outstanding balances`,
        assignedTo: "Property Manager",
        assignedBy: "System",
        priority: "High",
        status: "Pending",
        dueDate: today.toISOString().split('T')[0],
        dueTime: "09:00",
        category: "Follow-up",
        createdDate: today.toISOString().split('T')[0],
        reminder: true,
      });
    }
  }

  // Generate property inspection tasks
  properties.forEach((property: any, index: number) => {
    const lastInspection = property.lastInspection ? new Date(property.lastInspection) : new Date(2023, 0, 1);
    const daysSinceInspection = Math.ceil((today.getTime() - lastInspection.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceInspection > 90) { // Quarterly inspections overdue
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      tasks.push({
        id: `inspection-${property.id}`,
        title: `Schedule quarterly inspection for ${property.name}`,
        description: `Coordinate with service provider for quarterly property inspection. Last inspection was ${daysSinceInspection} days ago.`,
        assignedTo: "Property Manager",
        assignedBy: "System",
        priority: daysSinceInspection > 120 ? "High" : "Medium",
        status: "Pending",
        dueDate: dueDate.toISOString().split('T')[0],
        dueTime: "14:00",
        category: "Property",
        property: property.name,
        propertyId: property.id,
        createdDate: today.toISOString().split('T')[0],
        reminder: true,
      });
    }
  });

  // Generate 590 Hawkins Store Rd specific task if applicable
  const hawkinsProperty = properties.find((p: any) => p.address?.includes("590") && p.address?.includes("Hawkins"));
  if (hawkinsProperty) {
    const hawkinsTenant = tenants.find((t: any) => t.propertyId === hawkinsProperty.id && t.status === "Active");
    if (hawkinsTenant) {
      tasks.push({
        id: "hawkins-followup",
        title: `Welcome call for new tenant at 590 Hawkins Store Rd`,
        description: `Follow up with ${hawkinsTenant.firstName} ${hawkinsTenant.lastName} to ensure smooth move-in and address any questions`,
        assignedTo: "Property Manager",
        assignedBy: "System",
        priority: "Medium",
        status: "Pending",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: "10:00",
        category: "Follow-up",
        property: hawkinsProperty.name,
        propertyId: hawkinsProperty.id,
        client: `${hawkinsTenant.firstName} ${hawkinsTenant.lastName}`,
        clientId: hawkinsTenant.id,
        createdDate: today.toISOString().split('T')[0],
        reminder: true,
      });
    }
  }

  // Add some example completed tasks for demonstration
  if (tasks.length > 0) {
    const completedTask = { ...tasks[0] };
    completedTask.id = "completed-demo";
    completedTask.title = "Monthly rent reminder emails sent";
    completedTask.status = "Completed";
    completedTask.completedDate = today.toISOString().split('T')[0];
    completedTask.category = "Email";
    tasks.push(completedTask);
  }

  return tasks;
};

export default function Tasks() {
  const navigate = useNavigate();
  const { state } = useCrmData();
  const { properties, tenants } = state;

  const realTasks = React.useMemo(() => {
    if (!state?.initialized) return [];
    return generateRealTasks(state);
  }, [state]);

  const [tasks, setTasks] = React.useState<Task[]>(realTasks);

  // Update tasks when CRM data changes
  React.useEffect(() => {
    setTasks(realTasks);
  }, [realTasks]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("All");
  const [openTaskDialog, setOpenTaskDialog] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = React.useState(false);
  const [detailTaskId, setDetailTaskId] = React.useState<string>("");
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "Medium" as Task["priority"],
    dueDate: "",
    dueTime: "",
    category: "Other" as Task["category"],
    customCategory: "",
    property: "",
    propertyId: "",
    client: "",
    reminder: false,
    workOrderId: "",
    estimatedCost: "",
    vendor: "",
  });

  const handleViewTaskDetail = (taskId: string) => {
    setDetailTaskId(taskId);
    setShowTaskDetail(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      priority: "Medium",
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: "",
      category: "Other",
      customCategory: "",
      property: "",
      propertyId: "",
      client: "",
      reminder: false,
      workOrderId: "",
      estimatedCost: "",
      vendor: "",
    });
    setOpenTaskDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      assignedTo: task.assignedTo,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime || "",
      category: task.category,
      customCategory: task.customCategory || "",
      property: task.property || "",
      client: task.client || "",
      reminder: task.reminder,
      workOrderId: task.workOrderId || "",
      estimatedCost: task.estimatedCost?.toString() || "",
      vendor: task.vendor || "",
    });
    setOpenTaskDialog(true);
  };

  const handleSaveTask = () => {
    // Validation
    if (formData.category === "Other" && !formData.customCategory.trim()) {
      alert("Please specify the custom category when 'Other' is selected.");
      return;
    }

    if (selectedTask) {
      setTasks(prev =>
        prev.map(t =>
          t.id === selectedTask.id
            ? { ...t, ...formData, estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        assignedBy: "Current User",
        status: "Pending",
        createdDate: new Date().toISOString().split('T')[0],
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      };
      setTasks(prev => [...prev, newTask]);
    }
    setOpenTaskDialog(false);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: "Completed" as const,
              completedDate: new Date().toISOString().split('T')[0]
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "info";
      case "Overdue": return "error";
      case "Pending": return "warning";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "info";
      default: return "default";
    }
  };

  const getCategoryIcon = (category: Task["category"]) => {
    switch (category) {
      case "Call": return "📞";
      case "Email": return "📧";
      case "Property": return "🏠";
      case "Maintenance": return "🔧";
      case "Follow-up": return "🔄";
      default: return "📋";
    }
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const overdueTasks = tasks.filter(t => t.status === "Overdue").length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;

  if (showTaskDetail) {
    return (
      <TaskDetailPage
        taskId={detailTaskId}
        onBack={() => setShowTaskDetail(false)}
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
          Task Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<CalendarTodayRoundedIcon />}
            onClick={() => navigate('/calendar')}
          >
            View Calendar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <TaskRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Tasks
                  </Typography>
                  <Typography variant="h4">{totalTasks}</Typography>
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
                  <TaskRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h4">{pendingTasks}</Typography>
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
                  <PriorityHighRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Overdue
                  </Typography>
                  <Typography variant="h4">{overdueTasks}</Typography>
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
                  <CheckCircleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h4">{completedTasks}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
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
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter by Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="All">All Tasks</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: 'primary.main',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => handleViewTaskDetail(task.id)}
                    >
                      {task.category === "Work Order" ? <BuildRoundedIcon fontSize="small" /> : getCategoryIcon(task.category)} {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary">
                        {task.description.substring(0, 100)}...
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {task.property && (
                        <Chip label={task.property} size="small" variant="outlined" />
                      )}
                      {task.workOrderId && (
                        <Chip label={`Work Order: ${task.workOrderId}`} size="small" color="primary" />
                      )}
                      {task.estimatedCost && (
                        <Chip label={`Est: $${task.estimatedCost}`} size="small" color="info" variant="outlined" />
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: task.category === "Work Order" ? "secondary.main" : "primary.main" }}>
                      {task.category === "Work Order" ? <BuildRoundedIcon /> : <PersonRoundedIcon />}
                    </Avatar>
                    <Stack>
                      <Typography variant="body2">{task.assignedTo}</Typography>
                      {task.vendor && task.vendor !== task.assignedTo && (
                        <Typography variant="caption" color="text.secondary">
                          Vendor: {task.vendor}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    {task.dueTime && (
                      <Typography variant="caption" color="text.secondary">
                        {task.dueTime}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.category === "Other" && task.customCategory ? task.customCategory : task.category}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ minWidth: formElementWidths.large }}>
                    {task.status === "Pending" && (
                      <Tooltip
                        title={`Mark task '${task.title}' as complete`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleCompleteTask(task.id)}
                          sx={{ minWidth: formElementWidths.small }}
                        >
                          Complete
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip
                      title={`Edit task: ${task.title}`}
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEditTask(task)}
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                        }}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={`Delete task: ${task.title}`}
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTask(task.id)}
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'error.light', color: 'error.main' }
                        }}
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

      {/* Create/Edit Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'left',
                  paddingLeft: '14px'
                }
              }}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'left',
                  paddingLeft: '14px'
                }
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Assigned To"
                  fullWidth
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  sx={{
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                      paddingLeft: '14px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  fullWidth
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                      paddingLeft: '14px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Due Time"
                  type="time"
                  fullWidth
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-input': {
                      textAlign: 'left',
                      paddingLeft: '14px'
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => {
                      const selectedCategory = e.target.value as Task["category"];
                      if (selectedCategory === "Other") {
                        setCategoryDialogOpen(true);
                      } else {
                        setFormData({ ...formData, category: selectedCategory, customCategory: "" });
                      }
                    }}
                  >
                    <MenuItem value="Call">Call</MenuItem>
                    <MenuItem value="Email">Email</MenuItem>
                    <MenuItem value="Property">Property</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Work Order">Work Order</MenuItem>
                    <MenuItem value="Follow-up">Follow-up</MenuItem>
                    <MenuItem value="Other">Other - Custom Category</MenuItem>
                  </Select>
                  {formData.category === "Other" && formData.customCategory && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Custom: {formData.customCategory}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={formData.propertyId || ""}
                    label="Property"
                    onChange={(e) => {
                      const selectedProperty = properties.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        propertyId: e.target.value,
                        property: selectedProperty ? `${selectedProperty.name} - ${selectedProperty.address}` : ""
                      });
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400,
                          width: 450,
                          '& .MuiMenuItem-root': {
                            whiteSpace: 'normal',
                            minHeight: 60,
                            padding: 2,
                            alignItems: 'flex-start'
                          }
                        }
                      }
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        textAlign: 'left',
                        paddingLeft: '14px'
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Select a property (optional)
                    </MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {property.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              lineHeight: 1.3,
                              wordBreak: 'break-word'
                            }}
                          >
                            {property.address}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>


            {formData.category === "Work Order" && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Work Order ID"
                    fullWidth
                    value={formData.workOrderId}
                    onChange={(e) => setFormData({ ...formData, workOrderId: e.target.value })}
                    placeholder="e.g., WO-001"
                    sx={{
                      '& .MuiInputBase-input': {
                        textAlign: 'left',
                        paddingLeft: '14px'
                      }
                    }}
                  />
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
                    sx={{
                      '& .MuiInputBase-input': {
                        textAlign: 'left',
                        paddingLeft: '40px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Vendor/Service Provider"
                    fullWidth
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Service provider handling this work order"
                    sx={{
                      '& .MuiInputBase-input': {
                        textAlign: 'left',
                        paddingLeft: '14px'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                />
              }
              label="Set Reminder"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            {selectedTask ? "Update" : "Create"} Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Category Description Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: 400,
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TaskRoundedIcon color="primary" />
            <Typography variant="h6">Custom Task Category</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Please specify the custom category when 'Other' is selected.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will help categorize similar tasks in the future and make your task management more organized.
              </Typography>
            </Alert>

            <TextField
              label="Custom Category Name"
              fullWidth
              required
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              placeholder="e.g., Legal Review, Insurance Claim, Marketing Event, Client Meeting"
              helperText="Enter a specific category name (2-50 characters)"
              inputProps={{ maxLength: 50 }}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'left',
                  paddingLeft: '14px',
                  fontSize: '16px'
                }
              }}
            />

            <Box sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: 1,
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                Examples of good custom categories:
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">• Legal Documentation</Typography>
                <Typography variant="body2" color="text.secondary">• Insurance Processing</Typography>
                <Typography variant="body2" color="text.secondary">• Marketing Campaign</Typography>
                <Typography variant="body2" color="text.secondary">• Client Consultation</Typography>
                <Typography variant="body2" color="text.secondary">• Financial Review</Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => {
              setCategoryDialogOpen(false);
              setFormData({ ...formData, category: "Follow-up", customCategory: "" });
            }}
            sx={{ minWidth: 100 }}
          >
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
            disabled={!formData.customCategory.trim() || formData.customCategory.trim().length < 2}
            sx={{ minWidth: 150 }}
          >
            Use This Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
