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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import RichTextEditor from "../components/RichTextEditor";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import LockIcon from "@mui/icons-material/Lock";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownload";
import { useCrmData } from "../contexts/CrmDataContext";
import { documentSecurityService } from "../services/DocumentSecurityService";
import TwoStepAssignmentSelector from "../components/TwoStepAssignmentSelector";

interface TaskUpdate {
  id: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue" | "Cancelled";
  description: string;
  date: string;
  updatedBy: string;
  completionPercentage?: number;
}

interface Note {
  id: string;
  content: string;
  date: string;
  createdBy: string;
  type: "General" | "Progress" | "Issue" | "Solution" | "Resource";
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: "Instructions" | "Reference" | "Deliverable" | "Resource" | "Other";
  url: string;
  isEncrypted?: boolean;
  securityDocumentId?: string;
  isDecryptedForPreview?: boolean;
}

interface SubTask {
  id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
}

interface TaskDetailProps {
  taskId: string;
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
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper functions
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isValidBase64 = (str: string): boolean => {
  try {
    // Basic validation: check if string matches Base64 pattern
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Pattern.test(str) || str.length === 0) {
      return false;
    }
    // Try decoding to validate
    const decoded = atob(str);
    return decoded.length > 0;
  } catch (e) {
    return false;
  }
};

export default function TaskDetailPage({ taskId, onBack }: TaskDetailProps) {
  const { state } = useCrmData();
  const { properties, tenants } = state;
  const [currentTab, setCurrentTab] = React.useState(0);
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = React.useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = React.useState(false);
  const [openMessageDialog, setOpenMessageDialog] = React.useState(false);
  const [openSubTaskDialog, setOpenSubTaskDialog] = React.useState(false);
  const [messageType, setMessageType] = React.useState<"SMS" | "Email">("SMS");
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [openDocumentPreview, setOpenDocumentPreview] = React.useState(false);
  const [openDocumentHistory, setOpenDocumentHistory] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = React.useState<Document | null>(null);

  // Mock task data
  const task = {
    id: taskId,
    title: "Monthly Property Inspection - Sunset Apartments",
    description: "Conduct comprehensive monthly inspection of all common areas, exterior, and selected units at Sunset Apartments. Check for maintenance issues, safety concerns, and tenant compliance.",
    status: "In Progress" as const,
    priority: "High" as const,
    category: "Inspection",
    assignedTo: "John Manager",
    assignedBy: "Regional Director",
    assignedDate: "2024-01-15T09:00:00Z",
    dueDate: "2024-01-25T17:00:00Z",
    estimatedHours: 8,
    actualHours: 5.5,
    completionPercentage: 70,
    property: "Sunset Apartments",
    relatedWorkOrders: ["WO-123", "WO-124"],
    tags: ["Monthly", "Inspection", "Compliance"],
    recurring: true,
    recurringPattern: "Monthly - Last Friday"
  };

  const [updates] = React.useState<TaskUpdate[]>([
    {
      id: "1",
      status: "Pending",
      description: "Task assigned to John Manager for monthly property inspection",
      date: "2024-01-15T09:00:00Z",
      updatedBy: "Regional Director"
    },
    {
      id: "2", 
      status: "In Progress",
      description: "Started inspection of common areas. Elevator and lobby completed.",
      date: "2024-01-20T10:30:00Z",
      updatedBy: "John Manager",
      completionPercentage: 40
    },
    {
      id: "3",
      status: "In Progress", 
      description: "Exterior inspection completed. Minor gutter maintenance needed.",
      date: "2024-01-22T14:00:00Z",
      updatedBy: "John Manager",
      completionPercentage: 70
    }
  ]);

  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: "1",
      content: "Found minor issue with parking lot lighting - bulb replacement needed in zone 3. Created work order WO-125.",
      date: "2024-01-20T11:00:00Z",
      createdBy: "John Manager",
      type: "Issue"
    },
    {
      id: "2",
      content: "Tenant in Unit 3B reported satisfaction with recent HVAC repair. Inspection shows good working condition.",
      date: "2024-01-22T15:30:00Z",
      createdBy: "John Manager", 
      type: "Progress"
    }
  ]);

  const [subTasks] = React.useState<SubTask[]>([
    {
      id: "1",
      title: "Inspect Common Areas",
      description: "Check lobby, hallways, elevators, and mailroom",
      status: "Completed",
      assignedTo: "John Manager",
      dueDate: "2024-01-20T17:00:00Z",
      completedDate: "2024-01-20T12:00:00Z"
    },
    {
      id: "2",
      title: "Exterior Inspection", 
      description: "Check building exterior, parking lot, landscaping",
      status: "Completed",
      assignedTo: "John Manager",
      dueDate: "2024-01-22T17:00:00Z",
      completedDate: "2024-01-22T14:30:00Z"
    },
    {
      id: "3",
      title: "Sample Unit Inspections",
      description: "Inspect 3 random units for compliance and condition",
      status: "In Progress",
      assignedTo: "John Manager",
      dueDate: "2024-01-25T17:00:00Z"
    },
    {
      id: "4",
      title: "Generate Inspection Report",
      description: "Compile findings and recommendations into formal report",
      status: "Pending",
      assignedTo: "John Manager", 
      dueDate: "2024-01-25T17:00:00Z"
    }
  ]);

  const [documents, setDocuments] = React.useState<Document[]>([
    {
      id: "1",
      name: "Monthly Inspection Checklist.pdf",
      type: "PDF",
      size: 850000,
      uploadDate: "2024-01-15T09:30:00Z",
      uploadedBy: "Regional Director",
      category: "Instructions",
      url: "#"
    },
    {
      id: "2",
      name: "Exterior_photos_Jan22.zip", 
      type: "ZIP",
      size: 12000000,
      uploadDate: "2024-01-22T15:00:00Z",
      uploadedBy: "John Manager",
      category: "Deliverable",
      url: "#"
    }
  ]);

  const [newNote, setNewNote] = React.useState({
    content: "",
    type: "General" as Note["type"]
  });

  const [newUpdate, setNewUpdate] = React.useState({
    status: task.status,
    description: "",
    completionPercentage: task.completionPercentage
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

  const [newSubTask, setNewSubTask] = React.useState({
    title: "",
    description: "",
    assignedTo: task.assignedTo,
    dueDate: ""
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

  const handleUpdateTask = () => {
    if (newUpdate.description.trim()) {
      alert(`Task updated: ${newUpdate.description}`);
      setNewUpdate({ status: task.status, description: "", completionPercentage: task.completionPercentage });
      setOpenUpdateDialog(false);
    }
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
      const uploadedDocument: Document = {
        id: Date.now().toString(),
        name: newDocument.file.name,
        type: newDocument.file.type || "Unknown",
        size: newDocument.file.size,
        uploadDate: new Date().toISOString(),
        uploadedBy: "Current User",
        category: newDocument.category,
        url: URL.createObjectURL(newDocument.file), // Create object URL for local file
      };

      setDocuments(prev => [uploadedDocument, ...prev]);
      alert(`Document "${newDocument.file.name}" uploaded successfully!`);
      setNewDocument({ file: null, category: "Other", description: "" });
      setOpenDocumentDialog(false);
    }
  };

  const handleAddSubTask = () => {
    if (newSubTask.title.trim()) {
      alert(`Sub-task "${newSubTask.title}" added successfully!`);
      setNewSubTask({ title: "", description: "", assignedTo: task.assignedTo, dueDate: "" });
      setOpenSubTaskDialog(false);
    }
  };

  const handleDownloadDocument = (doc: Document) => {
    // In a real app, this would trigger a download from the server
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    alert(`Downloading ${doc.name}...`);
  };

  const handleViewDocument = async (doc: Document) => {
    // Mock current user for now
    const currentUser = { id: "user1", email: "user@example.com" };

    if (doc.isEncrypted && doc.securityDocumentId) {
      try {
        // Decrypt the document for preview
        const decryptedDocument = await documentSecurityService.decryptDocument(
          doc.securityDocumentId,
          currentUser.id,
          currentUser.email
        );

        // Convert decrypted content to blob URL for preview
        let byteArray: Uint8Array;

        try {
          // Validate and decode Base64 content
          if (!isValidBase64(decryptedDocument.content)) {
            throw new Error('Decrypted content is not valid Base64');
          }

          const byteCharacters = atob(decryptedDocument.content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          byteArray = new Uint8Array(byteNumbers);
        } catch (base64Error) {
          console.error('Base64 decoding failed:', base64Error);
          // Fallback: treat as binary string
          const byteNumbers = new Array(decryptedDocument.content.length);
          for (let i = 0; i < decryptedDocument.content.length; i++) {
            byteNumbers[i] = decryptedDocument.content.charCodeAt(i);
          }
          byteArray = new Uint8Array(byteNumbers);
        }

        const blob = new Blob([byteArray], { type: decryptedDocument.mimeType });
        const url = URL.createObjectURL(blob);

        const previewDocument: Document = {
          ...doc,
          url,
          name: decryptedDocument.filename,
          type: decryptedDocument.mimeType,
          isDecryptedForPreview: true
        };

        setSelectedDocument(previewDocument);
        setOpenDocumentPreview(true);
      } catch (error) {
        console.error('Failed to decrypt document for preview:', error);
        alert('Failed to decrypt document for preview. Please check your permissions or contact support.');
      }
    } else {
      // Non-encrypted document
      setSelectedDocument(doc);
      setOpenDocumentPreview(true);
    }
  };

  const handleViewDocumentHistory = (document: Document) => {
    setSelectedDocument(document);
    setOpenDocumentHistory(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
      alert(`Document "${documentToDelete.name}" deleted successfully!`);
      setDocumentToDelete(null);
    }
  };

  const getStatusColor = (status: TaskUpdate["status"] | SubTask["status"]) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      case "Pending": return "warning";
      case "Overdue": return "error";
      case "Cancelled": return "default";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low": return "info";
      case "Medium": return "warning";
      case "High": return "error";
      case "Urgent": return "error";
      default: return "default";
    }
  };

  const getStepIcon = (status: TaskUpdate["status"]) => {
    switch (status) {
      case "Pending": return <PendingRoundedIcon />;
      case "In Progress": return <PlayArrowRoundedIcon />;
      case "Completed": return <CheckCircleRoundedIcon />;
      case "Overdue": return <AccessTimeRoundedIcon />;
      case "Cancelled": return <PendingRoundedIcon />;
      default: return <AssignmentRoundedIcon />;
    }
  };

  const completedSubTasks = subTasks.filter(st => st.status === "Completed").length;
  const totalSubTasks = subTasks.length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Back to Tasks">
          <IconButton onClick={onBack}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Tooltip>
        <Avatar sx={{ bgcolor: "primary.main", width: 60, height: 60 }}>
          <TaskRoundedIcon fontSize="large" />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {task.id} - {task.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {task.category} • Assigned to {task.assignedTo}
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
            Send Update
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            onClick={() => setOpenUpdateDialog(true)}
          >
            Update Task
          </Button>
        </Stack>
      </Stack>

      {/* Status and Quick Info */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Status & Priority</Typography>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  size="small"
                />
                <Chip
                  label={task.priority}
                  color={getPriorityColor(task.priority)}
                  size="small"
                  variant="outlined"
                />
                {task.recurring && (
                  <Chip
                    label="RECURRING"
                    color="info"
                    size="small"
                  />
                )}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Progress: {task.completionPercentage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={task.completionPercentage} 
                    sx={{ height: 8 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Assignment</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonRoundedIcon fontSize="small" />
                  <Typography variant="body2">{task.assignedTo}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  <strong>Assigned by:</strong> {task.assignedBy}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Assigned:</strong> {new Date(task.assignedDate).toLocaleDateString()}
                </Typography>
                {task.property && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Property:</strong> {task.property}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Timeline</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarTodayRoundedIcon fontSize="small" />
                  <Typography variant="body2">
                    <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  <strong>Est. Hours:</strong> {task.estimatedHours}h
                </Typography>
                <Typography variant="body2">
                  <strong>Actual Hours:</strong> {task.actualHours}h
                </Typography>
                {task.recurringPattern && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Recurring:</strong> {task.recurringPattern}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Sub-Tasks</Typography>
                <Typography variant="h4">
                  {completedSubTasks}/{totalSubTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {((completedSubTasks / totalSubTasks) * 100).toFixed(0)}% Complete
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(completedSubTasks / totalSubTasks) * 100} 
                  sx={{ height: 6 }}
                />
                {task.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {task.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="Progress & Updates" />
          <Tab label="Sub-Tasks" />
          <Tab label="Notes & Communication" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* Progress & Updates Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Task Progress</Typography>
              <Stepper orientation="vertical">
                {updates.map((update, index) => (
                  <Step key={update.id} active={true} completed={index < updates.length - 1}>
                    <StepLabel
                      icon={getStepIcon(update.status)}
                      optional={
                        <Typography variant="caption">
                          {new Date(update.date).toLocaleString()} ��� by {update.updatedBy}
                        </Typography>
                      }
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2">{update.status}</Typography>
                        <Chip
                          label={update.status}
                          color={getStatusColor(update.status)}
                          size="small"
                        />
                        {update.completionPercentage && (
                          <Chip
                            label={`${update.completionPercentage}%`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {update.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => setOpenUpdateDialog(true)}
                >
                  Update Task
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentRoundedIcon />}
                  onClick={() => setOpenSubTaskDialog(true)}
                >
                  Add Sub-Task
                </Button>
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

      {/* Sub-Tasks Tab */}
      <TabPanel value={currentTab} index={1}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Sub-Tasks ({completedSubTasks}/{totalSubTasks} Complete)</Typography>
            <Button
              variant="contained"
              startIcon={<AssignmentRoundedIcon />}
              onClick={() => setOpenSubTaskDialog(true)}
            >
              Add Sub-Task
            </Button>
          </Stack>
          <List>
            {subTasks.map((subTask) => (
              <ListItem key={subTask.id} divider>
                <ListItemIcon>
                  <Checkbox
                    checked={subTask.status === "Completed"}
                    color="primary"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">{subTask.title}</Typography>
                      <Chip
                        label={subTask.status}
                        color={getStatusColor(subTask.status)}
                        size="small"
                      />
                    </Stack>
                  }
                  secondary={
                    <>
                      {subTask.description}
                      <br />
                      Assigned to: {subTask.assignedTo} • 
                      Due: {new Date(subTask.dueDate).toLocaleDateString()}
                      {subTask.completedDate && ` • Completed: ${new Date(subTask.completedDate).toLocaleDateString()}`}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </TabPanel>

      {/* Notes & Communication Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Task Notes</Typography>
              <List>
                {notes.map((note) => (
                  <ListItem key={note.id} divider>
                    <ListItemIcon>
                      <NoteAddRoundedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2">Note • {note.type}</Typography>
                          <Chip label={note.type} size="small" variant="outlined" />
                        </Stack>
                      }
                      secondary={
                        <>
                          {note.content}
                          <br />
                          {new Date(note.date).toLocaleString()} • by {note.createdBy}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip
                        title="Edit this note"
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleEditNote(note)}
                          sx={{
                            bgcolor: 'action.hover',
                            '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                          }}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Communication</Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SmsRoundedIcon />}
                  onClick={() => {
                    setMessageType("SMS");
                    setOpenMessageDialog(true);
                  }}
                >
                  Send SMS Update
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailRoundedIcon />}
                  onClick={() => {
                    setMessageType("Email");
                    setOpenMessageDialog(true);
                  }}
                >
                  Send Email Update
                </Button>
                <Divider />
                <Typography variant="subtitle2">Related Work Orders</Typography>
                {task.relatedWorkOrders.map((wo, index) => (
                  <Chip
                    key={index}
                    label={wo}
                    size="small"
                    variant="outlined"
                    clickable
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Documents Tab */}
      <TabPanel value={currentTab} index={3}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Task Documents</Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={() => setOpenDocumentDialog(true)}
            >
              Upload Document
            </Button>
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AttachFileRoundedIcon fontSize="small" />
                        <Typography variant="body2">{doc.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={doc.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>{doc.uploadedBy}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip
                          title={`View ${doc.name}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleViewDocument(doc)}
                            sx={{
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                            }}
                          >
                            <VisibilityRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={`Download ${doc.name}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadDocument(doc)}
                            sx={{
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'success.light', color: 'success.main' }
                            }}
                          >
                            <DownloadRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title="View Document History"
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleViewDocumentHistory(doc)}
                            sx={{
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'info.light', color: 'info.main' }
                            }}
                          >
                            <DescriptionRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={`Delete ${doc.name}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteDocument(doc)}
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
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
                <MenuItem value="Progress">Progress</MenuItem>
                <MenuItem value="Issue">Issue</MenuItem>
                <MenuItem value="Solution">Solution</MenuItem>
                <MenuItem value="Resource">Resource</MenuItem>
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

      {/* Update Task Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newUpdate.status}
                label="Status"
                onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value as TaskUpdate["status"] })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Update Description"
              fullWidth
              multiline
              rows={4}
              value={newUpdate.description}
              onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
              placeholder="Describe the progress made or status change..."
            />
            <TextField
              label="Completion Percentage"
              type="number"
              fullWidth
              value={newUpdate.completionPercentage || ""}
              onChange={(e) => setNewUpdate({ ...newUpdate, completionPercentage: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0, max: 100 }}
              InputProps={{ endAdornment: "%" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateTask}>
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Sub-Task Dialog */}
      <Dialog open={openSubTaskDialog} onClose={() => setOpenSubTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Sub-Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Sub-Task Title"
              fullWidth
              value={newSubTask.title}
              onChange={(e) => setNewSubTask({ ...newSubTask, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newSubTask.description}
              onChange={(e) => setNewSubTask({ ...newSubTask, description: e.target.value })}
            />
            <TwoStepAssignmentSelector
              value={newSubTask.assignedTo}
              onChange={(value) => setNewSubTask({ ...newSubTask, assignedTo: value })}
              label="Assigned To"
            />
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              value={newSubTask.dueDate}
              onChange={(e) => setNewSubTask({ ...newSubTask, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddSubTask}>
            Add Sub-Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send {messageType} Update</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {messageType === "Email" && (
              <TextField
                label="Subject"
                fullWidth
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder={`Task ${task.id} Update`}
              />
            )}
            <RichTextEditor
              label={`${messageType} Content`}
              value={newMessage.content}
              onChange={(value) => setNewMessage({ ...newMessage, content: value })}
              placeholder={`Send update about task ${task.id}...`}
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
                <MenuItem value="Instructions">Instructions</MenuItem>
                <MenuItem value="Reference">Reference</MenuItem>
                <MenuItem value="Deliverable">Deliverable</MenuItem>
                <MenuItem value="Resource">Resource</MenuItem>
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

      {/* Document Preview Dialog */}
      <Dialog
        open={openDocumentPreview}
        onClose={() => {
          // Clean up blob URL if it was created for encrypted document preview
          if (selectedDocument?.isDecryptedForPreview && selectedDocument?.url) {
            URL.revokeObjectURL(selectedDocument.url);
          }
          setSelectedDocument(null);
          setOpenDocumentPreview(false);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Document Preview - {selectedDocument?.name || 'Unknown Document'}
              {selectedDocument?.isEncrypted && (
                <Chip
                  icon={<LockIcon />}
                  label="Encrypted"
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={() => {
                  if (selectedDocument) {
                    handleDownloadDocument(selectedDocument);
                  }
                }}
              >
                Download
              </Button>
              <IconButton onClick={() => {
                // Clean up blob URL if it was created for encrypted document preview
                if (selectedDocument?.isDecryptedForPreview && selectedDocument?.url) {
                  URL.revokeObjectURL(selectedDocument.url);
                }
                setSelectedDocument(null);
                setOpenDocumentPreview(false);
              }}>
                <DeleteRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {selectedDocument ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f5f5f5'
              }}
            >
              {/* Document Preview based on type */}
              {selectedDocument.type?.toLowerCase().includes('image') ||
               selectedDocument.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // Image Preview
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                  <Box
                    component="img"
                    src={selectedDocument.url || ''}
                    alt={selectedDocument.name || 'Document preview'}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      boxShadow: 3,
                      borderRadius: 1
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #666;">
                            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                            <div>Unable to display image</div>
                            <div style="font-size: 12px; margin-top: 8px;">Use download button to view the file</div>
                          </div>
                        `;
                      }
                    }}
                  />
                </Box>
              ) : selectedDocument.type?.toLowerCase().includes('pdf') ||
                 selectedDocument.name?.toLowerCase().endsWith('.pdf') ? (
                // PDF Preview
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <DescriptionRoundedIcon sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>PDF Document</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    PDF preview is not available in this view. You can download the document or open it in a new tab.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => window.open(selectedDocument.url, '_blank')}
                    startIcon={<VisibilityRoundedIcon />}
                  >
                    Open in New Tab
                  </Button>
                </Box>
              ) : (
                // Other file types
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                  <AttachFileRoundedIcon sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {selectedDocument.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    Preview not available for this file type. Download the document to view its contents.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (selectedDocument) {
                        handleDownloadDocument(selectedDocument);
                      }
                    }}
                    startIcon={<FileDownloadRoundedIcon />}
                  >
                    Download to View
                  </Button>
                </Box>
              )}

              {/* Document Info Panel */}
              <Paper sx={{ p: 2, m: 2, mt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">File Name</Typography>
                    <Typography variant="body1">{selectedDocument.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Typography variant="body1">{selectedDocument.category}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Size</Typography>
                    <Typography variant="body1">{formatFileSize(selectedDocument.size)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Uploaded</Typography>
                    <Typography variant="body1">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Uploaded By</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1">{selectedDocument.uploadedBy}</Typography>
                      {selectedDocument.isEncrypted && (
                        <Chip
                          icon={<LockIcon />}
                          label="Encrypted"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            // Clean up blob URL if it was created for encrypted document preview
            if (selectedDocument?.isDecryptedForPreview && selectedDocument?.url) {
              URL.revokeObjectURL(selectedDocument.url);
            }
            setSelectedDocument(null);
            setOpenDocumentPreview(false);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document History Dialog */}
      <Dialog open={openDocumentHistory} onClose={() => setOpenDocumentHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <DescriptionRoundedIcon />
            <Box>
              <Typography variant="h6">Document History</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDocument?.name}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="h6">Version History</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Version 1.0 (Current)"
                  secondary={`Uploaded by ${selectedDocument?.uploadedBy} on ${selectedDocument && new Date(selectedDocument.uploadDate).toLocaleDateString()}`}
                />
              </ListItem>
            </List>

            <Divider />

            <Typography variant="h6">Access Log</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Document Created"
                  secondary={`${selectedDocument?.uploadedBy} uploaded this document on ${selectedDocument && new Date(selectedDocument.uploadDate).toLocaleDateString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Last Accessed"
                  secondary="Document was last accessed today"
                />
              </ListItem>
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocumentHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      <Dialog
        open={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <DeleteRoundedIcon color="error" />
            <Typography variant="h6">Delete Document</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body1">
              Are you sure you want to delete this document? This action cannot be undone.
            </Typography>
            {documentToDelete && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2">{documentToDelete.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {documentToDelete.category} • {formatFileSize(documentToDelete.size)}
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentToDelete(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteDocument}
            startIcon={<DeleteRoundedIcon />}
          >
            Delete Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
