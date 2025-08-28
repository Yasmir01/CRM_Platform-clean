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
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useCrmData } from "../contexts/CrmDataContext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
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
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

interface CallLog {
  id: string;
  type: "Incoming" | "Outgoing" | "Missed";
  duration: number;
  date: string;
  notes?: string;
  contactName: string;
  contactType: "Tenant" | "Owner" | "Vendor" | "Internal";
}

interface MessageLog {
  id: string;
  type: "SMS" | "Email";
  direction: "Sent" | "Received";
  content: string;
  date: string;
  subject?: string;
  contactName: string;
  contactType: "Tenant" | "Owner" | "Vendor" | "Internal";
}

interface Note {
  id: string;
  content: string;
  date: string;
  createdBy: string;
  type: "General" | "Property" | "Tenant" | "Performance" | "Training" | "Issue";
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate: string;
  assignedDate: string;
  assignedBy: string;
  category: "Maintenance" | "Inspection" | "Administration" | "Tenant Relations" | "Other";
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: "HR" | "Certification" | "Training" | "Performance" | "Legal" | "Other";
  url: string;
}

interface PropertyManagerDetailProps {
  managerId: string;
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
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PropertyManagerDetailPage({ managerId, onBack }: PropertyManagerDetailProps) {
  const { state, addDocument, deleteDocument } = useCrmData();
  const { trackPropertyActivity } = useActivityTracking();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("All");
  const [dateFilter, setDateFilter] = React.useState("");
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = React.useState(false);
  const [openMessageDialog, setOpenMessageDialog] = React.useState(false);
  const [openTaskDialog, setOpenTaskDialog] = React.useState(false);
  const [messageType, setMessageType] = React.useState<"SMS" | "Email">("SMS");
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);

  // Mock manager data
  const manager = {
    id: managerId,
    firstName: "John",
    lastName: "Manager",
    email: "john.manager@company.com",
    phone: "(555) 123-4567",
    status: "Active" as const,
    hireDate: "2022-03-15",
    experience: 5,
    department: "Property Management",
    role: "Senior Property Manager",
    certifications: ["CAM", "CPM", "CCIM"],
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    properties: ["Sunset Apartments", "Ocean View Villa", "Downtown Lofts"],
    performance: {
      rating: 4.8,
      tenantsManaged: 45,
      workOrdersCompleted: 128,
      occupancyRate: 96.5
    }
  };

  const [callLogs] = React.useState<CallLog[]>([
    {
      id: "1",
      type: "Outgoing",
      duration: 180,
      date: "2024-01-20T10:30:00Z",
      notes: "Discussed maintenance schedule with tenant",
      contactName: "Sarah Johnson",
      contactType: "Tenant"
    },
    {
      id: "2",
      type: "Incoming",
      duration: 45,
      date: "2024-01-19T14:20:00Z",
      notes: "Owner inquiry about property performance",
      contactName: "Robert Smith",
      contactType: "Owner"
    }
  ]);

  const [messageLogs] = React.useState<MessageLog[]>([
    {
      id: "1",
      type: "Email",
      direction: "Sent",
      content: "Monthly property report attached. Occupancy rate increased to 96.5%.",
      subject: "Monthly Property Report - January 2024",
      date: "2024-01-18T09:00:00Z",
      contactName: "Property Owners",
      contactType: "Owner"
    }
  ]);

  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: "1",
      content: "Completed quarterly property inspections. All units in good condition. Minor maintenance items noted.",
      date: "2024-01-15T14:00:00Z",
      createdBy: "John Manager",
      type: "Property"
    }
  ]);

  const [tasks] = React.useState<Task[]>([
    {
      id: "1",
      title: "Monthly Property Inspection",
      description: "Conduct monthly inspection of all common areas and exterior",
      status: "In Progress",
      priority: "High",
      dueDate: "2024-01-25T00:00:00Z",
      assignedDate: "2024-01-20T00:00:00Z",
      assignedBy: "Regional Manager",
      category: "Inspection"
    },
    {
      id: "2",
      title: "Tenant Lease Renewals",
      description: "Process lease renewals for Q2 2024",
      status: "Pending",
      priority: "Medium",
      dueDate: "2024-02-01T00:00:00Z",
      assignedDate: "2024-01-15T00:00:00Z",
      assignedBy: "Regional Manager",
      category: "Administration"
    }
  ]);

  const [documents] = React.useState<Document[]>([
    {
      id: "1",
      name: "Property Management License.pdf",
      type: "PDF",
      size: 1200000,
      uploadDate: "2024-01-01T10:00:00Z",
      uploadedBy: "HR Department",
      category: "Certification",
      url: "#"
    },
    {
      id: "2",
      name: "Performance Review 2023.pdf",
      type: "PDF",
      size: 850000,
      uploadDate: "2023-12-15T10:00:00Z",
      uploadedBy: "Regional Manager",
      category: "Performance",
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

  const [newTask, setNewTask] = React.useState({
    title: "",
    description: "",
    priority: "Medium" as Task["priority"],
    dueDate: "",
    category: "Other" as Task["category"]
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

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      alert(`Task "${newTask.title}" assigned successfully!`);
      setNewTask({ title: "", description: "", priority: "Medium", dueDate: "", category: "Other" });
      setOpenTaskDialog(false);
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

  const getTaskStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      case "Pending": return "warning";
      case "Overdue": return "error";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "Low": return "info";
      case "Medium": return "warning";
      case "High": return "error";
      case "Urgent": return "error";
      default: return "default";
    }
  };

  const allLogs = [
    ...callLogs.map(log => ({ ...log, logType: 'call' as const })),
    ...messageLogs.map(log => ({ ...log, logType: 'message' as const })),
    ...notes.map(note => ({ ...note, logType: 'note' as const })),
    ...tasks.map(task => ({ ...task, logType: 'task' as const, date: task.assignedDate, content: task.description }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || 
      (filterType === "Calls" && log.logType === 'call') ||
      (filterType === "Messages" && log.logType === 'message') ||
      (filterType === "Notes" && log.logType === 'note') ||
      (filterType === "Tasks" && log.logType === 'task');
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
          src={manager.profilePicture}
          sx={{ width: 60, height: 60 }}
        >
          {`${manager.firstName[0]}${manager.lastName[0]}`}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {manager.firstName} {manager.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {manager.role} • {manager.department}
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
            href={`tel:${manager.phone}`}
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
                <Typography variant="h6">Status</Typography>
                <Chip
                  label={manager.status}
                  color={manager.status === "Active" ? "success" : "warning"}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Experience: {manager.experience} years
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hired: {new Date(manager.hireDate).toLocaleDateString()}
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
                    href={`mailto:${manager.email}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {manager.email}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2"
                    component="a"
                    href={`tel:${manager.phone}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {manager.phone}
                  </Typography>
                </Stack>
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
                  <strong>Rating:</strong> {manager.performance.rating}/5.0
                </Typography>
                <Typography variant="body2">
                  <strong>Tenants:</strong> {manager.performance.tenantsManaged}
                </Typography>
                <Typography variant="body2">
                  <strong>Occupancy:</strong> {manager.performance.occupancyRate}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Certifications</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {manager.certifications.map((cert) => (
                    <Chip
                      key={cert}
                      label={cert}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Properties: {manager.properties.length}
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
          <Tab label="Tasks & Assignments" />
          <Tab label="Documents" />
          <Tab label="Properties" />
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
                  <MenuItem value="Tasks">Tasks</MenuItem>
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
                      {log.logType === 'task' && <AssignmentRoundedIcon />}
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
                          {log.logType === 'task' &&
                            `Task • ${(log as any).title} • ${(log as any).priority} Priority`
                          }
                        </>
                      }
                      secondary={
                        <>
                          {log.logType === 'call' && (log as any).notes}
                          {log.logType === 'message' && (log as any).content}
                          {log.logType === 'note' && (log as any).content}
                          {log.logType === 'task' && `${(log as any).content} • Due: ${new Date((log as any).dueDate).toLocaleDateString()}`}
                          {' • '}
                          {new Date(log.date).toLocaleString()}
                          {log.logType === 'call' && ` • Contact Type: ${(log as any).contactType}`}
                          {log.logType === 'message' && ` • Contact Type: ${(log as any).contactType}`}
                          {log.logType === 'note' && ` • by ${(log as any).createdBy}`}
                          {log.logType === 'task' && ` • Assigned by ${(log as any).assignedBy}`}
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
                  startIcon={<AssignmentRoundedIcon />}
                  onClick={() => setOpenTaskDialog(true)}
                >
                  Assign Task
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

      {/* Tasks & Assignments Tab */}
      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Tasks & Assignments</Typography>
            <Button
              variant="contained"
              startIcon={<AssignmentRoundedIcon />}
              onClick={() => setOpenTaskDialog(true)}
            >
              Assign New Task
            </Button>
          </Stack>
          <List>
            {tasks.map((task) => (
              <ListItem key={task.id} divider>
                <ListItemIcon>
                  <Badge 
                    color={getPriorityColor(task.priority)} 
                    variant="dot"
                  >
                    <AssignmentRoundedIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      <Chip
                        label={task.status}
                        color={getTaskStatusColor(task.status)}
                        size="small"
                      />
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  secondary={
                    <>
                      {task.description}
                      <br />
                      Due: {new Date(task.dueDate).toLocaleDateString()} • 
                      Category: {task.category} • 
                      Assigned by: {task.assignedBy}
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

      {/* Properties Tab */}
      <TabPanel value={currentTab} index={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Managed Properties</Typography>
          <Grid container spacing={2}>
            {manager.properties.map((property, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <HomeWorkRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {property}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Management
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
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
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Tenant">Tenant</MenuItem>
                <MenuItem value="Performance">Performance</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
                <MenuItem value="Issue">Issue</MenuItem>
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
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Certification">Certification</MenuItem>
                <MenuItem value="Training">Training</MenuItem>
                <MenuItem value="Performance">Performance</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
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

      {/* Assign Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task["priority"] })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newTask.category}
                label="Category"
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task["category"] })}
              >
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Inspection">Inspection</MenuItem>
                <MenuItem value="Administration">Administration</MenuItem>
                <MenuItem value="Tenant Relations">Tenant Relations</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTask}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
