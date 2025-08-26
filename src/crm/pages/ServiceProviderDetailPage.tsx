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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Alert,
  Badge,
  Rating,
  LinearProgress,
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import WorkOrderDialog from "../components/WorkOrderDialog";
import { useCrmData } from "../contexts/CrmDataContext";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useAuth } from "../contexts/AuthContext";
import { documentSecurityService } from "../services/DocumentSecurityService";
import { useRoleManagement } from "../hooks/useRoleManagement";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import CallReceivedRoundedIcon from "@mui/icons-material/CallReceivedRounded";
import CallMissedRoundedIcon from "@mui/icons-material/CallMissedRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

interface CallLog {
  id: string;
  type: "Incoming" | "Outgoing" | "Missed";
  duration: number;
  date: string;
  notes?: string;
  contactName: string;
  contactType: "Property Manager" | "Tenant" | "Vendor" | "Office";
}

interface MessageLog {
  id: string;
  type: "SMS" | "Email";
  direction: "Sent" | "Received";
  content: string;
  date: string;
  subject?: string;
  contactName: string;
  contactType: "Property Manager" | "Tenant" | "Vendor" | "Office";
}

interface Note {
  id: string;
  content: string;
  date: string;
  createdBy: string;
  type: "General" | "Work Order" | "Performance" | "Invoice" | "Quality" | "Safety";
}

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: "Assigned" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Emergency";
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  property: string;
  unit?: string;
  category: "Plumbing" | "Electrical" | "HVAC" | "General" | "Appliance" | "Pest Control" | "Landscaping" | "Other";
  estimatedCost?: number;
  actualCost?: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: "Contract" | "Insurance" | "License" | "Invoice" | "Certification" | "Other";
  url: string;
}

interface ServiceProviderDetailProps {
  providerId: string;
  onBack: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`provider-tabpanel-${index}`}
      aria-labelledby={`provider-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ServiceProviderDetailPage({ providerId, onBack }: ServiceProviderDetailProps) {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("All");
  const [dateFilter, setDateFilter] = React.useState("");
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = React.useState(false);
  const [openMessageDialog, setOpenMessageDialog] = React.useState(false);
  const [messageType, setMessageType] = React.useState<"SMS" | "Email">("SMS");
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [openWorkOrderDialog, setOpenWorkOrderDialog] = React.useState(false);

  const { refreshActivities } = useActivityTracking();

  // Mock service provider data
  const provider = {
    id: providerId,
    companyName: "ABC Plumbing Services",
    contactName: "David Wilson",
    email: "david@abcplumbing.com",
    phone: "(555) 777-8888",
    status: "Active" as const,
    category: "Plumbing",
    rating: 4.7,
    joinDate: "2023-01-15",
    address: "123 Service St, City, State 12345",
    licenseNumber: "PL-12345",
    insuranceExpiry: "2024-12-31",
    profilePicture: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
    specialties: ["Emergency Repairs", "Pipe Installation", "Drain Cleaning"],
    performance: {
      completedJobs: 156,
      onTimeCompletion: 94.2,
      averageRating: 4.7,
      responseTime: "2.4 hours"
    }
  };

  const [callLogs] = React.useState<CallLog[]>([
    {
      id: "1",
      type: "Incoming",
      duration: 120,
      date: "2024-01-20T09:15:00Z",
      notes: "Emergency call - tenant reported water leak in unit 2A",
      contactName: "John Manager",
      contactType: "Property Manager"
    }
  ]);

  const [messageLogs] = React.useState<MessageLog[]>([
    {
      id: "1",
      type: "Email",
      direction: "Sent",
      content: "Work order #WO-123 has been completed. Invoice attached. All plumbing fixtures are now working properly.",
      subject: "Work Order WO-123 Completed - Invoice",
      date: "2024-01-19T16:30:00Z",
      contactName: "John Manager",
      contactType: "Property Manager"
    }
  ]);

  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: "1",
      content: "Excellent work quality. Completed emergency repair quickly and professionally. Tenant was very satisfied.",
      date: "2024-01-18T15:00:00Z",
      createdBy: "John Manager",
      type: "Performance"
    }
  ]);

  const [workOrders] = React.useState<WorkOrder[]>([
    {
      id: "WO-123",
      title: "Kitchen Sink Leak Repair",
      description: "Repair leak under kitchen sink in unit 2A. Replace faulty pipes and fittings.",
      status: "Completed",
      priority: "High",
      assignedDate: "2024-01-18T08:00:00Z",
      dueDate: "2024-01-18T17:00:00Z",
      completedDate: "2024-01-18T14:30:00Z",
      property: "Sunset Apartments",
      unit: "2A",
      category: "Plumbing",
      estimatedCost: 150,
      actualCost: 135
    },
    {
      id: "WO-124",
      title: "Bathroom Faucet Installation",
      description: "Install new bathroom faucet in unit 1B",
      status: "In Progress",
      priority: "Medium",
      assignedDate: "2024-01-20T09:00:00Z",
      dueDate: "2024-01-21T17:00:00Z",
      property: "Ocean View Villa",
      unit: "1B",
      category: "Plumbing",
      estimatedCost: 200
    }
  ]);

  const [documents] = React.useState<Document[]>([
    {
      id: "1",
      name: "Plumbing License.pdf",
      type: "PDF",
      size: 850000,
      uploadDate: "2023-01-15T10:00:00Z",
      uploadedBy: "David Wilson",
      category: "License",
      url: "#"
    },
    {
      id: "2",
      name: "Liability Insurance Certificate.pdf",
      type: "PDF",
      size: 1200000,
      uploadDate: "2024-01-01T10:00:00Z",
      uploadedBy: "David Wilson",
      category: "Insurance",
      url: "#"
    }
  ]);

  const [newNote, setNewNote] = React.useState({
    content: "",
    type: "General" as Note["type"]
  });

  const [newMessage, setNewMessage] = React.useState({
    content: "",
    subject: ""
  });

  const [newDocument, setNewDocument] = React.useState({
    file: null as File | null,
    category: "Other" as Document["category"],
    description: ""
  });

  const resetNoteForm = () => {
    setNewNote({ content: "", type: "General" });
    setEditingNote(null);
  };

  const handleAddNote = () => {
    if (newNote.content.trim()) {
      if (editingNote) {
        const updatedNote: Note = {
          ...editingNote,
          content: newNote.content,
          type: newNote.type
        };
        setNotes(prev => prev.map(note => note.id === editingNote.id ? updatedNote : note));
      } else {
        const note: Note = {
          id: Date.now().toString(),
          content: newNote.content,
          date: new Date().toISOString(),
          createdBy: "Current User",
          type: newNote.type
        };
        setNotes(prev => [note, ...prev]);
      }
      resetNoteForm();
      setOpenNoteDialog(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      content: note.content,
      type: note.type
    });
    setOpenNoteDialog(true);
  };

  const handleSendMessage = () => {
    if (newMessage.content.trim()) {
      alert(`${messageType} sent successfully!`);
      setNewMessage({ content: "", subject: "" });
      setOpenMessageDialog(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocument({ ...newDocument, file });
    }
  };

  const handleUploadDocument = () => {
    if (newDocument.file) {
      alert(`Document "${newDocument.file.name}" uploaded successfully!`);
      setNewDocument({ file: null, category: "Other", description: "" });
      setOpenDocumentDialog(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCallIcon = (type: CallLog["type"]) => {
    switch (type) {
      case "Incoming": return <CallReceivedRoundedIcon color="success" />;
      case "Outgoing": return <CallMadeRoundedIcon color="primary" />;
      case "Missed": return <CallMissedRoundedIcon color="error" />;
    }
  };

  const getWorkOrderStatusColor = (status: WorkOrder["status"]) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      case "Assigned": return "warning";
      case "On Hold": return "info";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: WorkOrder["priority"]) => {
    switch (priority) {
      case "Low": return "info";
      case "Medium": return "warning";
      case "High": return "error";
      case "Emergency": return "error";
      default: return "default";
    }
  };

  const allLogs = [
    ...callLogs.map(log => ({ ...log, logType: 'call' as const })),
    ...messageLogs.map(log => ({ ...log, logType: 'message' as const })),
    ...notes.map(note => ({ ...note, logType: 'note' as const })),
    ...workOrders.map(wo => ({ ...wo, logType: 'workorder' as const, date: wo.assignedDate, content: wo.description }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || 
      (filterType === "Calls" && log.logType === 'call') ||
      (filterType === "Messages" && log.logType === 'message') ||
      (filterType === "Notes" && log.logType === 'note') ||
      (filterType === "Work Orders" && log.logType === 'workorder');
    const matchesDate = !dateFilter || new Date(log.date).toLocaleDateString().includes(dateFilter);
    return matchesSearch && matchesFilter && matchesDate;
  });

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={onBack}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Avatar
          src={provider.profilePicture}
          sx={{ width: 60, height: 60 }}
        >
          <BusinessRoundedIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {provider.companyName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {provider.category} Service Provider • Contact: {provider.contactName}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SmsRoundedIcon />}
            onClick={() => {
              setMessageType("SMS");
              setOpenMessageDialog(true);
            }}
          >
            Send SMS
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailRoundedIcon />}
            onClick={() => {
              setMessageType("Email");
              setOpenMessageDialog(true);
            }}
          >
            Send Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhoneRoundedIcon />}
            href={`tel:${provider.phone}`}
          >
            Call
          </Button>
        </Stack>
      </Stack>

      {/* Status and Quick Info */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Status & Rating</Typography>
                <Chip
                  label={provider.status}
                  color={provider.status === "Active" ? "success" : "warning"}
                  size="small"
                />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Rating value={provider.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2">{provider.rating}/5.0</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  License: {provider.licenseNumber}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Contact</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmailRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href={`mailto:${provider.email}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {provider.email}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2"
                    component="a"
                    href={`tel:${provider.phone}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {provider.phone}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {provider.address}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Performance</Typography>
                <Typography variant="body2">
                  <strong>Completed Jobs:</strong> {provider.performance.completedJobs}
                </Typography>
                <Box>
                  <Typography variant="body2">
                    <strong>On-Time Rate:</strong> {provider.performance.onTimeCompletion}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, provider.performance?.onTimeCompletion || 0))}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Typography variant="body2">
                  <strong>Response Time:</strong> {provider.performance.responseTime}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Specialties</Typography>
                <Stack spacing={0.5}>
                  {provider.specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Insurance expires: {new Date(provider.insuranceExpiry).toLocaleDateString()}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Activity & Communication" />
          <Tab label="Work Orders" />
          <Tab label="Documents" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      {/* Activity & Communication Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Search and Filter */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search activities, notes, messages..."
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
              <TextField
                label="From Date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <TextField
                label="To Date"
                type="date"
                value=""
                onChange={(e) => {}}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 140 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterType}
                  label="Filter"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Calls">Calls</MenuItem>
                  <MenuItem value="Messages">Messages</MenuItem>
                  <MenuItem value="Notes">Notes</MenuItem>
                  <MenuItem value="Work Orders">Work Orders</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Activity Timeline */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Activity Timeline</Typography>
              <List>
                {filteredLogs.map((log) => (
                  <ListItem key={`${log.logType}-${log.id}`} divider>
                    <ListItemIcon>
                      {log.logType === 'call' && getCallIcon((log as any).type)}
                      {log.logType === 'message' && 
                        ((log as any).type === 'SMS' ? <SmsRoundedIcon /> : <EmailRoundedIcon />)}
                      {log.logType === 'note' && <NoteAddRoundedIcon />}
                      {log.logType === 'workorder' && <BuildRoundedIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <>
                          {log.logType === 'call' &&
                            `${(log as any).type} Call • ${formatDuration((log as any).duration)} • ${(log as any).contactName}`
                          }
                          {log.logType === 'message' &&
                            `${(log as any).type} ${(log as any).direction} • ${(log as any).contactName}${(log as any).subject ? ` • ${(log as any).subject}` : ''}`
                          }
                          {log.logType === 'note' &&
                            `Note • ${(log as any).type}`
                          }
                          {log.logType === 'workorder' &&
                            `Work Order • ${(log as any).status} • ${(log as any).title}`
                          }
                        </>
                      }
                      secondary={
                        <>
                          {log.logType === 'call' && (log as any).notes}
                          {log.logType === 'message' && (log as any).content}
                          {log.logType === 'note' && (log as any).content}
                          {log.logType === 'workorder' && `${(log as any).content} • ${(log as any).property} ${(log as any).unit ? `Unit ${(log as any).unit}` : ''}`}
                          {' • '}
                          {new Date(log.date).toLocaleString()}
                          {log.logType === 'call' && ` • ${(log as any).contactType}`}
                          {log.logType === 'message' && ` • ${(log as any).contactType}`}
                          {log.logType === 'note' && ` • by ${(log as any).createdBy}`}
                          {log.logType === 'workorder' && ` • Due: ${new Date((log as any).dueDate).toLocaleDateString()}`}
                        </>
                      }
                      primaryTypographyProps={{
                        variant: "subtitle2",
                        component: "span"
                      }}
                      secondaryTypographyProps={{
                        variant: "body2",
                        component: "span"
                      }}
                    />
                    {log.logType === 'note' && (
                      <ListItemSecondaryAction>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditNote(log as any)}
                          title="Edit Note"
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<NoteAddRoundedIcon />}
                  onClick={() => setOpenNoteDialog(true)}
                >
                  Add Note
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BuildRoundedIcon />}
                  onClick={() => setOpenWorkOrderDialog(true)}
                >
                  Create Work Order
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={() => setOpenDocumentDialog(true)}
                >
                  Upload Document
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Work Orders Tab */}
      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Work Orders</Typography>
            <Button
              variant="contained"
              startIcon={<BuildRoundedIcon />}
              onClick={() => setOpenWorkOrderDialog(true)}
            >
              Create Work Order
            </Button>
          </Stack>
          <List>
            {workOrders.map((order) => (
              <ListItem key={order.id} divider>
                <ListItemIcon>
                  <Badge 
                    color={getPriorityColor(order.priority)} 
                    variant="dot"
                  >
                    <BuildRoundedIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">{order.id} - {order.title}</Typography>
                      <Chip
                        label={order.status}
                        color={getWorkOrderStatusColor(order.status)}
                        size="small"
                      />
                      <Chip
                        label={order.priority}
                        color={getPriorityColor(order.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={
                    <>
                      {order.description}
                      <br />
                      Property: {order.property} {order.unit && `• Unit: ${order.unit}`} • 
                      Category: {order.category} • 
                      Due: {new Date(order.dueDate).toLocaleDateString()}
                      {order.estimatedCost && ` • Est. Cost: $${order.estimatedCost}`}
                      {order.actualCost && ` • Actual Cost: $${order.actualCost}`}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </TabPanel>

      {/* Documents Tab */}
      <TabPanel value={currentTab} index={2}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Documents</Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={() => setOpenDocumentDialog(true)}
            >
              Upload Document
            </Button>
          </Stack>
          <List>
            {documents.map((doc) => (
              <ListItem key={doc.id} divider>
                <ListItemIcon>
                  <AttachFileRoundedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={doc.name}
                  secondary={`${doc.category} • ${formatFileSize(doc.size)} • Uploaded by ${doc.uploadedBy} on ${new Date(doc.uploadDate).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <DownloadRoundedIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Performance Metrics</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">Overall Rating</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating value={provider.performance.averageRating} precision={0.1} readOnly />
                    <Typography variant="h6">{provider.performance.averageRating}/5.0</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">Completed Jobs</Typography>
                  <Typography variant="h6">{provider.performance.completedJobs}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">On-Time Completion Rate</Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, provider.performance?.onTimeCompletion || 0))}
                      sx={{ flexGrow: 1, height: 8 }}
                    />
                    <Typography variant="body2">{provider.performance.onTimeCompletion}%</Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="medium">Average Response Time</Typography>
                  <Typography variant="h6">{provider.performance.responseTime}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Reviews</Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating value={5} size="small" readOnly />
                    <Typography variant="body2" fontWeight="medium">Excellent Service</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    "Very professional and completed the job quickly. Highly recommended!"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    - John Manager, 2 days ago
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating value={4} size="small" readOnly />
                    <Typography variant="body2" fontWeight="medium">Good Work</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    "Job was completed on time and tenant was satisfied."
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    - Sarah Admin, 1 week ago
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => { setOpenNoteDialog(false); resetNoteForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Note Type</InputLabel>
              <Select
                value={newNote.type}
                label="Note Type"
                onChange={(e) => setNewNote({ ...newNote, type: e.target.value as Note["type"] })}
              >
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Work Order">Work Order</MenuItem>
                <MenuItem value="Performance">Performance</MenuItem>
                <MenuItem value="Invoice">Invoice</MenuItem>
                <MenuItem value="Quality">Quality</MenuItem>
                <MenuItem value="Safety">Safety</MenuItem>
              </Select>
            </FormControl>
            <RichTextEditor
              label="Note Content"
              value={newNote.content}
              onChange={(value) => setNewNote({ ...newNote, content: value })}
              placeholder="Enter your note here..."
              minHeight={200}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenNoteDialog(false); resetNoteForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNote}>
            {editingNote ? 'Update Note' : 'Add Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send {messageType}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {messageType === "Email" && (
              <TextField
                label="Subject"
                fullWidth
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
            )}
            <RichTextEditor
              label={`${messageType} Content`}
              value={newMessage.content}
              onChange={(value) => setNewMessage({ ...newMessage, content: value })}
              placeholder={`Enter your ${messageType.toLowerCase()} message here...`}
              minHeight={messageType === "Email" ? 300 : 150}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendMessage}
            startIcon={<SendRoundedIcon />}
          >
            Send {messageType}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={openDocumentDialog} onClose={() => setOpenDocumentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 2 }}
              >
                {newDocument.file ? newDocument.file.name : "Choose File"}
              </Button>
            </label>
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newDocument.category}
                label="Category"
                onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value as Document["category"] })}
              >
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="License">License</MenuItem>
                <MenuItem value="Invoice">Invoice</MenuItem>
                <MenuItem value="Certification">Certification</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={2}
              value={newDocument.description}
              onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
              placeholder="Brief description of the document..."
            />
            
            {newDocument.file && (
              <Alert severity="info">
                File: {newDocument.file.name} ({formatFileSize(newDocument.file.size)})
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocumentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUploadDocument}
            disabled={!newDocument.file}
            startIcon={<CloudUploadRoundedIcon />}
          >
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work Order Dialog */}
      <WorkOrderDialog
        open={openWorkOrderDialog}
        onClose={() => setOpenWorkOrderDialog(false)}
        assignedTo={`${provider.companyName} (${provider.contactName})`}
        onWorkOrderCreated={(workOrder) => {
          // Refresh activities to show the new work order in real-time
          refreshActivities();

          // Force re-render to update work orders list
          setCurrentTab(currentTab === 1 ? 0 : 1);
          setTimeout(() => setCurrentTab(1), 100);
        }}
      />
    </Box>
  );
}
