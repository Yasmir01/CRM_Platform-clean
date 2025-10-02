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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import { FileStorageService, StoredFile } from "../services/FileStorageService";
import { useCrmData } from "../contexts/CrmDataContext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
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
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface WorkOrderUpdate {
  id: string;
  status: "Assigned" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
  description: string;
  date: string;
  updatedBy: string;
  attachments?: string[];
}

interface Note {
  id: string;
  content: string;
  date: string;
  createdBy: string;
  type: "General" | "Technical" | "Cost" | "Safety" | "Quality";
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: "Before Photo" | "After Photo" | "Invoice" | "Receipt" | "Permit" | "Other";
  url: string;
  dataUrl?: string; // Base64 data for file storage
  preview?: string; // Preview/thumbnail for images
}

interface WorkOrderDetailProps {
  workOrderId: string;
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
      id={`workorder-tabpanel-${index}`}
      aria-labelledby={`workorder-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WorkOrderDetailPage({ workOrderId, onBack }: WorkOrderDetailProps) {
  const { state, addDocument } = useCrmData();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = React.useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = React.useState(false);
  const [openMessageDialog, setOpenMessageDialog] = React.useState(false);
  const [messageType, setMessageType] = React.useState<"SMS" | "Email">("SMS");
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewDocument, setPreviewDocument] = React.useState<Document | null>(null);
  const [openDocumentPreview, setOpenDocumentPreview] = React.useState(false);

  // Mock work order data
  const workOrder = {
    id: workOrderId,
    title: "Kitchen Faucet Repair",
    description: "Kitchen sink faucet is leaking from the base. Tenant reports constant dripping.",
    property: "Sunset Apartments",
    unit: "2A",
    tenant: "Sarah Johnson",
    tenantPhone: "(555) 123-4567",
    tenantEmail: "sarah.johnson@email.com",
    status: "In Progress" as const,
    priority: "High" as const,
    category: "Plumbing",
    assignedTo: "ABC Plumbing Services",
    assignedContact: "David Wilson",
    assignedPhone: "(555) 777-8888",
    assignedEmail: "david@abcplumbing.com",
    createdDate: "2024-01-18T08:00:00Z",
    assignedDate: "2024-01-18T09:00:00Z",
    dueDate: "2024-01-20T17:00:00Z",
    estimatedCost: 150,
    actualCost: 135,
    completionPercentage: 75,
    createdBy: "John Manager",
    emergencyOrder: false
  };

  const [updates] = React.useState<WorkOrderUpdate[]>([
    {
      id: "1",
      status: "Assigned",
      description: "Work order created and assigned to ABC Plumbing Services",
      date: "2024-01-18T09:00:00Z",
      updatedBy: "John Manager"
    },
    {
      id: "2", 
      status: "In Progress",
      description: "Technician arrived on site. Diagnosis in progress.",
      date: "2024-01-18T14:30:00Z",
      updatedBy: "David Wilson"
    },
    {
      id: "3",
      status: "In Progress", 
      description: "Parts ordered. Will return tomorrow to complete repair.",
      date: "2024-01-18T16:00:00Z",
      updatedBy: "David Wilson"
    }
  ]);

  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: "1",
      content: "Tenant very cooperative. Access to unit easy. Problem is worn O-ring and valve seat.",
      date: "2024-01-18T15:00:00Z",
      createdBy: "David Wilson",
      type: "Technical"
    }
  ]);

  // Load documents from CRM context for this work order
  const [documents, setDocuments] = React.useState<Document[]>(() => {
    // Get documents from CRM context that are associated with this work order
    const workOrderDocs = state.documents?.filter(doc =>
      doc.workOrderId === workOrderId ||
      doc.entityId === workOrderId ||
      doc.tags?.includes(`work-order-${workOrderId}`)
    ) || [];

    // If no docs found, use mock data for demo
    if (workOrderDocs.length === 0) {
      return [
        {
          id: "1",
          name: "Before_repair_photo.jpg",
          type: "image/jpeg",
          size: 1200000,
          uploadDate: "2024-01-18T14:45:00Z",
          uploadedBy: "David Wilson",
          category: "Before Photo",
          url: "#",
          dataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNnB4Ij5CZWZvcmUgUGhvdG88L3RleHQ+PC9zdmc+"
        }
      ];
    }

    return workOrderDocs.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type || 'application/octet-stream',
      size: doc.size || 0,
      uploadDate: doc.uploadedAt || doc.createdAt || new Date().toISOString(),
      uploadedBy: doc.uploadedBy || 'Unknown',
      category: (doc.category as Document['category']) || 'Other',
      url: doc.url || '#',
      dataUrl: doc.dataUrl,
      preview: doc.preview
    }));
  });

  const [newNote, setNewNote] = React.useState({
    content: "",
    type: "General" as Note["type"]
  });

  const [newUpdate, setNewUpdate] = React.useState({
    status: workOrder.status,
    description: "",
    completionPercentage: workOrder.completionPercentage
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

  const handleUpdateWorkOrder = () => {
    if (newUpdate.description.trim()) {
      alert(`Work order updated: ${newUpdate.description}`);
      setNewUpdate({ status: workOrder.status, description: "", completionPercentage: workOrder.completionPercentage });
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

  const handleUploadDocument = async () => {
    if (!newDocument.file) return;

    setIsUploading(true);

    try {
      // Process file using FileStorageService
      const result = await FileStorageService.processFiles([newDocument.file]);

      if (!result.success || !result.files || result.files.length === 0) {
        throw new Error(result.error || 'Failed to process file');
      }

      const processedFile = result.files[0];

      // Create document object
      const document = {
        name: processedFile.name,
        type: processedFile.type,
        size: processedFile.size,
        url: processedFile.dataUrl, // Use dataUrl as the primary storage
        dataUrl: processedFile.dataUrl, // Store base64 data
        preview: processedFile.preview, // Store preview/thumbnail if available
        category: newDocument.category,
        workOrderId: workOrderId,
        entityId: workOrderId,
        entityType: 'workOrder',
        uploadedBy: 'Current User',
        description: newDocument.description,
        tags: [`work-order-${workOrderId}`, 'work-order-document']
      };

      // Save document to CRM context
      const savedDocument = addDocument(document);

      // Update local documents state
      const newDoc: Document = {
        id: savedDocument.id,
        name: savedDocument.name,
        type: savedDocument.type,
        size: savedDocument.size,
        uploadDate: savedDocument.uploadedAt || new Date().toISOString(),
        uploadedBy: savedDocument.uploadedBy,
        category: savedDocument.category as Document['category'],
        url: savedDocument.url,
        dataUrl: savedDocument.dataUrl,
        preview: savedDocument.preview
      };

      setDocuments(prev => [newDoc, ...prev]);

      // Reset form and close dialog
      setNewDocument({ file: null, category: "Other", description: "" });
      setOpenDocumentDialog(false);

      alert(`Document "${processedFile.name}" uploaded successfully!`);

    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: WorkOrderUpdate["status"]) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      case "Assigned": return "warning";
      case "On Hold": return "info";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low": return "info";
      case "Medium": return "warning";
      case "High": return "error";
      case "Emergency": return "error";
      default: return "default";
    }
  };

  const getStepIcon = (status: WorkOrderUpdate["status"]) => {
    switch (status) {
      case "Assigned": return <AssignmentRoundedIcon />;
      case "In Progress": return <PlayArrowRoundedIcon />;
      case "On Hold": return <PauseRoundedIcon />;
      case "Completed": return <CheckCircleRoundedIcon />;
      case "Cancelled": return <PendingRoundedIcon />;
      default: return <AssignmentRoundedIcon />;
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="Back to Work Orders">
          <IconButton onClick={onBack}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Tooltip>
        <Avatar sx={{ bgcolor: "primary.main", width: 60, height: 60 }}>
          <BuildRoundedIcon fontSize="large" />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {workOrder.id} - {workOrder.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {workOrder.property} {workOrder.unit && `• Unit ${workOrder.unit}`} • {workOrder.category}
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
            Update Status
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
                  label={workOrder.status}
                  color={getStatusColor(workOrder.status)}
                  size="small"
                />
                <Chip
                  label={workOrder.priority}
                  color={getPriorityColor(workOrder.priority)}
                  size="small"
                  variant="outlined"
                />
                {workOrder.emergencyOrder && (
                  <Chip
                    label="EMERGENCY"
                    color="error"
                    size="small"
                  />
                )}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Progress: {workOrder.completionPercentage}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, workOrder.completionPercentage || 0))} 
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
                <Typography variant="h6">Tenant</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonRoundedIcon fontSize="small" />
                  <Typography variant="body2">{workOrder.tenant}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2"
                    component="a"
                    href={`tel:${workOrder.tenantPhone}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {workOrder.tenantPhone}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmailRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2" 
                    component="a" 
                    href={`mailto:${workOrder.tenantEmail}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {workOrder.tenantEmail}
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
                <Typography variant="h6">Assigned To</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BusinessRoundedIcon fontSize="small" />
                  <Typography variant="body2">{workOrder.assignedTo}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PersonRoundedIcon fontSize="small" />
                  <Typography variant="body2">{workOrder.assignedContact}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2"
                    component="a"
                    href={`tel:${workOrder.assignedPhone}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {workOrder.assignedPhone}
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
                <Typography variant="h6">Timeline & Cost</Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(workOrder.createdDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Due:</strong> {new Date(workOrder.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Estimated:</strong> ${workOrder.estimatedCost}
                </Typography>
                {workOrder.actualCost && (
                  <Typography variant="body2">
                    <strong>Actual:</strong> ${workOrder.actualCost}
                  </Typography>
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
          <Tab label="Notes & Communication" />
          <Tab label="Documents & Photos" />
          <Tab label="Details" />
        </Tabs>
      </Box>

      {/* Progress & Updates Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Work Order Progress</Typography>
              <Stepper orientation="vertical">
                {updates.map((update, index) => (
                  <Step key={update.id} active={true} completed={index < updates.length - 1}>
                    <StepLabel
                      icon={getStepIcon(update.status)}
                      optional={
                        <Typography variant="caption">
                          {new Date(update.date).toLocaleString()} • by {update.updatedBy}
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
                  Update Status
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
                  Upload Photo/Document
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notes & Communication Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Work Order Notes</Typography>
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
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditNote(note)}
                        title="Edit Note"
                      >
                        <EditRoundedIcon />
                      </IconButton>
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
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhoneRoundedIcon />}
                  href={`tel:${workOrder.tenantPhone}`}
                >
                  Call Tenant
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhoneRoundedIcon />}
                  href={`tel:${workOrder.assignedPhone}`}
                >
                  Call Service Provider
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Documents & Photos Tab */}
      <TabPanel value={currentTab} index={2}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Documents & Photos</Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={() => setOpenDocumentDialog(true)}
            >
              Upload File
            </Button>
          </Stack>
          <List>
            {documents.map((doc) => (
              <ListItem key={doc.id} divider>
                <ListItemIcon>
                  {FileStorageService.isImageFile(doc.type, doc.name) ? (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {doc.preview || doc.dataUrl ? (
                        <Box
                          component="img"
                          src={doc.preview || doc.dataUrl}
                          alt={doc.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 16px;">📷</div>';
                            }
                          }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: 16 }}>📷</Typography>
                      )}
                    </Box>
                  ) : FileStorageService.isPdfFile(doc.type) ? (
                    <Typography sx={{ fontSize: 24 }}>📄</Typography>
                  ) : (
                    <AttachFileRoundedIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={doc.name}
                  secondary={`${doc.category} • ${formatFileSize(doc.size)} • Uploaded by ${doc.uploadedBy} on ${new Date(doc.uploadDate).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setPreviewDocument(doc);
                          setOpenDocumentPreview(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (doc.dataUrl) {
                            // Create a temporary stored file object for download
                            const storedFile: StoredFile = {
                              id: doc.id,
                              name: doc.name,
                              size: doc.size,
                              type: doc.type,
                              lastModified: new Date(doc.uploadDate).getTime(),
                              dataUrl: doc.dataUrl,
                              preview: doc.preview
                            };
                            FileStorageService.downloadFile(storedFile);
                          } else {
                            alert('File data not available for download');
                          }
                        }}
                      >
                        <DownloadRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </TabPanel>

      {/* Details Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Work Order Details</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{workOrder.description}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{workOrder.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{workOrder.createdBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Property Details</Typography>
                  <Typography variant="body1">
                    {workOrder.property} {workOrder.unit && `- Unit ${workOrder.unit}`}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Cost Breakdown</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Estimated Cost</Typography>
                  <Typography variant="h6">${workOrder.estimatedCost}</Typography>
                </Box>
                {workOrder.actualCost && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Actual Cost</Typography>
                    <Typography variant="h6" color={workOrder.actualCost > workOrder.estimatedCost ? "error.main" : "success.main"}>
                      ${workOrder.actualCost}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Cost Variance</Typography>
                  <Typography variant="body1" color={workOrder.actualCost && workOrder.actualCost > workOrder.estimatedCost ? "error.main" : "success.main"}>
                    {workOrder.actualCost ? 
                      `${workOrder.actualCost > workOrder.estimatedCost ? '+' : ''}$${workOrder.actualCost - workOrder.estimatedCost}` 
                      : 'TBD'
                    }
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
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Cost">Cost</MenuItem>
                <MenuItem value="Safety">Safety</MenuItem>
                <MenuItem value="Quality">Quality</MenuItem>
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

      {/* Update Work Order Dialog */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Work Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newUpdate.status}
                label="Status"
                onChange={(e) => setNewUpdate({ ...newUpdate, status: e.target.value as WorkOrderUpdate["status"] })}
              >
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
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
              placeholder="Describe the work performed or status change..."
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
          <Button variant="contained" onClick={handleUpdateWorkOrder}>
            Update Work Order
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
                placeholder={`Work Order ${workOrder.id} Update`}
              />
            )}
            <RichTextEditor
              label={`${messageType} Content`}
              value={newMessage.content}
              onChange={(value) => setNewMessage({ ...newMessage, content: value })}
              placeholder={`Send update about work order ${workOrder.id}...`}
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
        <DialogTitle>Upload Document/Photo</DialogTitle>
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
                disabled={isUploading}
              >
                {isUploading ? "Processing..." : (newDocument.file ? newDocument.file.name : "Choose File")}
              </Button>
            </label>
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newDocument.category}
                label="Category"
                onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value as Document["category"] })}
              >
                <MenuItem value="Before Photo">Before Photo</MenuItem>
                <MenuItem value="After Photo">After Photo</MenuItem>
                <MenuItem value="Invoice">Invoice</MenuItem>
                <MenuItem value="Receipt">Receipt</MenuItem>
                <MenuItem value="Permit">Permit</MenuItem>
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
            disabled={!newDocument.file || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadRoundedIcon />}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={openDocumentPreview}
        onClose={() => setOpenDocumentPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{previewDocument?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {previewDocument && formatFileSize(previewDocument.size)} • {previewDocument?.type}
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenDocumentPreview(false)}>
              <DownloadRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {previewDocument && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {FileStorageService.isImageFile(previewDocument.type, previewDocument.name) ? (
                previewDocument.dataUrl || previewDocument.preview ? (
                  <Box
                    component="img"
                    src={previewDocument.dataUrl || previewDocument.preview}
                    alt={previewDocument.name}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                    onError={(e) => {
                      console.error('Image preview failed to load for:', previewDocument.name);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parentContainer = target.parentElement;
                      if (parentContainer) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.style.cssText = `
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          height: 200px;
                          background-color: #f5f5f5;
                          border: 2px dashed #ddd;
                          border-radius: 8px;
                          color: #666;
                          text-align: center;
                          padding: 20px;
                        `;
                        fallbackDiv.innerHTML = `
                          <div style="font-size: 32px; margin-bottom: 8px;">📄</div>
                          <div style="font-weight: bold; margin-bottom: 4px;">${previewDocument.name}</div>
                          <div style="font-size: 12px;">Preview not available</div>
                        `;
                        parentContainer.appendChild(fallbackDiv);
                      }
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 400,
                      height: 200,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      margin: '0 auto'
                    }}
                  >
                    <Stack spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: 32 }}>📷</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {previewDocument.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Image preview unavailable
                      </Typography>
                    </Stack>
                  </Box>
                )
              ) : FileStorageService.isPdfFile(previewDocument.type) ? (
                <Box>
                  <Typography sx={{ fontSize: 64, mb: 2 }}>📄</Typography>
                  <Typography>
                    PDF preview not available. Click download to view the file.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography sx={{ fontSize: 64, mb: 2 }}>📎</Typography>
                  <Typography>
                    Preview not available for this file type. Click download to view the file.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDocumentPreview(false)}>Close</Button>
          {previewDocument && (
            <Button
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={() => {
                if (previewDocument.dataUrl) {
                  const storedFile: StoredFile = {
                    id: previewDocument.id,
                    name: previewDocument.name,
                    size: previewDocument.size,
                    type: previewDocument.type,
                    lastModified: new Date(previewDocument.uploadDate).getTime(),
                    dataUrl: previewDocument.dataUrl,
                    preview: previewDocument.preview
                  };
                  FileStorageService.downloadFile(storedFile);
                } else {
                  alert('File data not available for download');
                }
                setOpenDocumentPreview(false);
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
