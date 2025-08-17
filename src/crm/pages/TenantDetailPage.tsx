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
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import CommunicationDialog from "../components/CommunicationDialog";
import { useCrmData, Tenant } from "../contexts/CrmDataContext";
import { activityTracker } from "../services/ActivityTrackingService";
import { useActivityTracking } from "../hooks/useActivityTracking";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import CallReceivedRoundedIcon from "@mui/icons-material/CallReceivedRounded";
import CallMissedRoundedIcon from "@mui/icons-material/CallMissedRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

interface CallLog {
  id: string;
  type: "Incoming" | "Outgoing" | "Missed";
  duration: number; // in seconds
  date: string;
  notes?: string;
  userWhoMadeCall: string;
}

interface MessageLog {
  id: string;
  type: "SMS" | "Email";
  direction: "Sent" | "Received";
  content: string;
  date: string;
  subject?: string; // for emails
  userWhoSent?: string;
}

interface Note {
  id: string;
  content: string;
  date: string;
  createdBy: string;
  type: "General" | "Payment" | "Maintenance" | "Communication" | "Legal" | "Call Log - Incoming" | "Call Log - Outgoing" | "Call Log - Missed";
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  method: "ACH" | "Credit Card" | "Check" | "Cash" | "Money Order" | "Wire Transfer" | "Online";
  status: "Completed" | "Pending" | "Failed" | "Refunded" | "Processing";
  description: string;
  propertyId?: string;
  tenantId?: string;
  recordedBy: string;
  transactionId?: string;
  category: "Rent" | "Security Deposit" | "Pet Deposit" | "Late Fee" | "Utilities" | "Maintenance" | "Other";
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Charge {
  id: string;
  amount: number;
  type: "Late Fee" | "Pet Fee" | "Damage" | "Utilities" | "Other";
  description: string;
  date: string;
  addedBy: string;
  isPaid: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: "Lease" | "Payment" | "Legal" | "Maintenance" | "Communication" | "Application" | "Other";
  url: string;
}

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdDate: string;
  assignedTo?: string;
  category: "Plumbing" | "Electrical" | "HVAC" | "General" | "Appliance" | "Other";
}

interface ApplicationUpdate {
  id: string;
  type: "Application Approved" | "Application Received" | "Application Denied" | "Move-in Completed";
  date: string;
  details: string;
  updatedBy: string;
}

interface LeaseDetails {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  petDeposit?: number;
  lateFeeDays: number;
  lateFeeAmount: number;
  renewalOption: boolean;
  renewalTerms?: string;
  specialTerms?: string;
  leaseDocument?: string;
}

interface TenantDetailProps {
  tenantId: string;
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
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function TenantDetailPage({ tenantId, onBack }: TenantDetailProps) {
  const { state, updateTenant, addNote, addDocument, addPayment } = useCrmData();
  const { getEntityActivities } = useActivityTracking();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("All");
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [openChargeDialog, setOpenChargeDialog] = React.useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = React.useState(false);
  const [openMessageDialog, setOpenMessageDialog] = React.useState(false);
  const [openPropertyLinkDialog, setOpenPropertyLinkDialog] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [dateFilter, setDateFilter] = React.useState("");
  const [messageType, setMessageType] = React.useState<"SMS" | "Email">("SMS");
  const [communicationDialogOpen, setCommunicationDialogOpen] = React.useState(false);
  const [contractViewModalOpen, setContractViewModalOpen] = React.useState(false);
  const [communicationData, setCommunicationData] = React.useState({
    type: 'email' as 'email' | 'sms' | 'call',
    recipient: '',
    subject: '',
    message: ''
  });

  // Get real tenant data from CRM context
  const tenant = state.tenants.find(t => t.id === tenantId);
  const tenantProperty = tenant ? state.properties.find(p => p.id === tenant.propertyId) : null;

  // If tenant not found, show error
  if (!tenant) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Tenant not found
        </Typography>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBackRoundedIcon />}>
          Back to Tenants
        </Button>
      </Box>
    );
  }

  const [callLogs] = React.useState<CallLog[]>([]); // Empty for new tenants - should be populated from real data

  // Mock data kept only for demonstration - in real app these would be empty for new tenants
  const [mockCallLogs] = React.useState<CallLog[]>([
    {
      id: "1",
      type: "Outgoing",
      duration: 180,
      date: "2024-01-20T10:30:00Z",
      notes: "Discussed rent payment schedule",
      userWhoMadeCall: "John Manager"
    },
    {
      id: "2",
      type: "Incoming",
      duration: 45,
      date: "2024-01-18T14:20:00Z",
      notes: "Tenant called about heating issue",
      userWhoMadeCall: "Sarah Johnson"
    },
    {
      id: "3",
      type: "Missed",
      duration: 0,
      date: "2024-01-17T09:15:00Z",
      userWhoMadeCall: "Sarah Johnson"
    }
  ]);

  const [messageLogs] = React.useState<MessageLog[]>([]); // Empty for new tenants
  const [mockMessageLogs] = React.useState<MessageLog[]>([
    {
      id: "1",
      type: "Email",
      direction: "Sent",
      content: "Reminder: Your rent payment is due tomorrow.",
      subject: "Rent Payment Reminder",
      date: "2024-01-19T16:00:00Z",
      userWhoSent: "John Manager"
    },
    {
      id: "2",
      type: "SMS",
      direction: "Received",
      content: "Hi, I'll pay the rent by tomorrow morning. Thanks!",
      date: "2024-01-19T16:30:00Z"
    },
    {
      id: "3",
      type: "SMS",
      direction: "Sent",
      content: "Thank you for the update. Looking forward to receiving your payment.",
      date: "2024-01-19T16:45:00Z",
      userWhoSent: "John Manager"
    }
  ]);

  const [notes, setNotes] = React.useState<Note[]>([]); // Empty for new tenants
  const [mockNotes] = React.useState<Note[]>([
    {
      id: "1",
      content: "Tenant is very responsive and keeps the unit clean. Excellent communication.",
      date: "2024-01-15T11:00:00Z",
      createdBy: "John Manager",
      type: "General"
    },
    {
      id: "2",
      content: "Late payment fee of $50 applied for January rent. Payment received 3 days late.",
      date: "2024-01-05T09:00:00Z",
      createdBy: "Jane Admin",
      type: "Payment"
    }
  ]);

  // Get real payments from CrmDataContext for this tenant
  const payments = state.payments.filter(payment => payment.tenantId === tenant.id); // Empty for new tenants
  const [mockPayments] = React.useState<Payment[]>([
    {
      id: "1",
      amount: 2500,
      date: "2024-01-01T00:00:00Z",
      method: "ACH",
      status: "Completed",
      description: "January 2024 Rent",
      recordedBy: "System",
      transactionId: "ACH-001234"
    },
    {
      id: "2",
      amount: 2550,
      date: "2023-12-01T00:00:00Z",
      method: "Credit Card",
      status: "Completed",
      description: "December 2023 Rent + Late Fee",
      recordedBy: "Jane Admin",
      transactionId: "CC-005678"
    }
  ]);

  const [charges, setCharges] = React.useState<Charge[]>([
    {
      id: "1",
      amount: 50,
      type: "Late Fee",
      description: "3-day late payment penalty",
      date: "2024-01-05T00:00:00Z",
      addedBy: "Jane Admin",
      isPaid: true
    }
  ]);

  // Get real documents from CrmDataContext for this tenant
  const documents = state.documents.filter(doc => doc.tenantId === tenant.id);

  const [workOrders] = React.useState<WorkOrder[]>([]); // Empty for new tenants
  const [mockWorkOrders] = React.useState<WorkOrder[]>([
    {
      id: "WO-001",
      title: "Kitchen Faucet Leak",
      description: "Kitchen sink faucet is dripping constantly",
      status: "Completed",
      priority: "Medium",
      createdDate: "2024-01-10T08:30:00Z",
      assignedTo: "ABC Plumbing Services",
      category: "Plumbing"
    },
    {
      id: "WO-002",
      title: "Heating Issue",
      description: "Heater not working properly in living room",
      status: "In Progress",
      priority: "High",
      createdDate: "2024-01-18T14:00:00Z",
      assignedTo: "HVAC Experts Inc",
      category: "HVAC"
    }
  ]);

  const [applicationUpdates] = React.useState<ApplicationUpdate[]>([]); // Empty for new tenants
  const [mockApplicationUpdates] = React.useState<ApplicationUpdate[]>([
    {
      id: "1",
      type: "Application Approved",
      date: "2023-12-20T10:00:00Z",
      details: "Application approved for Sunset Apartments Unit 2A. Move-in scheduled for January 1st, 2024.",
      updatedBy: "John Manager"
    },
    {
      id: "2",
      type: "Move-in Completed",
      date: "2024-01-01T12:00:00Z",
      details: "Tenant successfully moved in. Keys provided and orientation completed.",
      updatedBy: "Jane Admin"
    }
  ]);

  const leaseDetails: LeaseDetails = {
    id: "1",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    monthlyRent: 2500,
    securityDeposit: 2500,
    petDeposit: 500,
    lateFeeDays: 3,
    lateFeeAmount: 50,
    renewalOption: true,
    renewalTerms: "6-month automatic renewal with 60-day notice",
    specialTerms: "No smoking. Pets allowed with deposit. Parking space #12 included.",
    leaseDocument: "lease-2024-sarah-johnson.pdf"
  };

  const [newNote, setNewNote] = React.useState({
    content: "",
    type: "General" as Note["type"],
    relatedCall: "",
    duration: 0
  });

  const resetNoteForm = () => {
    setNewNote({ content: "", type: "General", relatedCall: "", duration: 0 });
    setEditingNote(null);
  };

  const [newPayment, setNewPayment] = React.useState({
    amount: 0,
    method: "ACH" as Payment["method"],
    description: "",
    transactionId: ""
  });

  const [newCharge, setNewCharge] = React.useState({
    amount: 0,
    type: "Late Fee" as Charge["type"],
    description: ""
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

  const handleAddNote = () => {
    if (newNote.content.trim()) {
      let noteContent = newNote.content;

      // If it's a call log note, add call details to content
      if (newNote.type.startsWith('Call Log')) {
        const callType = newNote.type.split(' - ')[1];
        if (newNote.duration > 0) {
          noteContent += `\n\nCall Details:\nType: ${callType}\nDuration: ${formatDuration(newNote.duration)}`;
        } else {
          noteContent += `\n\nCall Details:\nType: ${callType}`;
        }
      }

      if (editingNote) {
        // Update existing note - for now just update local state
        // TODO: Implement note updating in CrmDataContext
        const updatedNote: Note = {
          ...editingNote,
          content: noteContent,
          type: newNote.type
        };
        setNotes(prev => prev.map(note => note.id === editingNote.id ? updatedNote : note));
      } else {
        // Create new note using CrmDataContext for persistence
        const noteData = {
          title: `${newNote.type} - ${tenant.firstName} ${tenant.lastName}`,
          content: noteContent,
          category: 'Tenant' as const,
          tenantId: tenant.id,
          tags: [newNote.type],
          isPrivate: false,
          isPinned: false,
          createdBy: 'Current User'
        };

        // Save to CrmDataContext for persistence
        const savedNote = addNote(noteData);

        // Also track as activity for the timeline
        activityTracker.trackActivity({
          userId: 'current-user',
          userDisplayName: 'Current User',
          action: 'create',
          entityType: 'tenant',
          entityId: tenant.id,
          entityName: `${tenant.firstName} ${tenant.lastName}`,
          changes: [
            {
              field: 'notes',
              oldValue: '',
              newValue: newNote.type,
              displayName: 'Note Added'
            }
          ],
          description: `${newNote.type}: ${noteContent.substring(0, 100)}${noteContent.length > 100 ? '...' : ''}`,
          metadata: {
            notes: noteContent,
            noteType: newNote.type,
            ...(newNote.duration > 0 && { callDuration: newNote.duration })
          },
          severity: 'low',
          category: 'communication'
        });

        // Update local state to show in the UI immediately
        const localNote: Note = {
          id: savedNote.id,
          content: noteContent,
          date: savedNote.createdAt,
          createdBy: "Current User",
          type: newNote.type
        };
        setNotes(prev => [localNote, ...prev]);
      }

      resetNoteForm();
      setOpenNoteDialog(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      content: note.content,
      type: note.type,
      relatedCall: "",
      duration: 0
    });
    setOpenNoteDialog(true);
  };

  const handleAddPayment = () => {
    if (newPayment.amount > 0) {
      // Save payment to CrmDataContext
      const savedPayment = addPayment({
        amount: newPayment.amount,
        date: new Date().toISOString(),
        method: newPayment.method,
        status: "Completed",
        description: newPayment.description || `Manual payment entry`,
        propertyId: tenant.propertyId,
        tenantId: tenant.id,
        recordedBy: "Current User",
        transactionId: newPayment.transactionId,
        category: "Rent", // Default to rent, could be made selectable
        paidDate: new Date().toISOString(),
      });

      // Track activity for the payment
      activityTracker.trackActivity({
        userId: 'current-user',
        userDisplayName: 'Current User',
        action: 'create',
        entityType: 'tenant',
        entityId: tenant.id,
        entityName: `${tenant.firstName} ${tenant.lastName}`,
        changes: [
          {
            field: 'payments',
            oldValue: '',
            newValue: `$${newPayment.amount}`,
            displayName: 'Payment Recorded'
          }
        ],
        description: `Payment recorded: $${newPayment.amount} via ${newPayment.method}`,
        metadata: {
          paymentAmount: newPayment.amount,
          paymentMethod: newPayment.method,
          transactionId: newPayment.transactionId
        },
        severity: 'low',
        category: 'financial'
      });

      setNewPayment({ amount: 0, method: "ACH", description: "", transactionId: "" });
      setOpenPaymentDialog(false);
      alert("Payment recorded successfully!");
    }
  };

  const handleAddCharge = () => {
    if (newCharge.amount > 0) {
      const charge: Charge = {
        id: Date.now().toString(),
        amount: newCharge.amount,
        type: newCharge.type,
        description: newCharge.description,
        date: new Date().toISOString(),
        addedBy: "Current User",
        isPaid: false
      };
      setCharges(prev => [charge, ...prev]);
      setNewCharge({ amount: 0, type: "Late Fee", description: "" });
      setOpenChargeDialog(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.content.trim()) {
      // In real app, send the message
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
      // Create a blob URL for the file to simulate file storage
      const fileUrl = URL.createObjectURL(newDocument.file);

      // Save document to CrmDataContext
      const savedDocument = addDocument({
        name: newDocument.file.name,
        type: newDocument.file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN',
        size: newDocument.file.size,
        url: fileUrl,
        category: newDocument.category,
        tenantId: tenant.id,
        uploadedBy: "Current User",
        description: newDocument.description,
        tags: []
      });

      // Track activity for the upload
      activityTracker.trackActivity({
        userId: 'current-user',
        userDisplayName: 'Current User',
        action: 'create',
        entityType: 'tenant',
        entityId: tenant.id,
        entityName: `${tenant.firstName} ${tenant.lastName}`,
        changes: [
          {
            field: 'documents',
            oldValue: '',
            newValue: newDocument.file.name,
            displayName: 'Document Uploaded'
          }
        ],
        description: `Document uploaded: ${newDocument.file.name}`,
        metadata: {
          documentCategory: newDocument.category,
          fileSize: newDocument.file.size,
          fileType: newDocument.file.type
        },
        severity: 'low',
        category: 'documentation'
      });

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

  const getPaymentStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "Completed": return "success";
      case "Pending": return "warning";
      case "Failed": return "error";
      case "Refunded": return "info";
      default: return "default";
    }
  };

  // Get real activities from the activity tracking system
  const tenantActivities = getEntityActivities('tenant', tenant.id);

  const allLogs = [
    ...callLogs.map(log => ({ ...log, logType: 'call' as const })),
    ...messageLogs.map(log => ({ ...log, logType: 'message' as const })),
    ...notes.map(note => ({ ...note, logType: 'note' as const })),
    ...workOrders.map(wo => ({ ...wo, logType: 'workorder' as const, date: wo.createdDate, content: wo.description })),
    ...applicationUpdates.map(app => ({ ...app, logType: 'application' as const, content: app.details, createdBy: app.updatedBy })),
    // Add real activities from the activity tracking service
    ...tenantActivities.map(activity => ({
      id: activity.id,
      logType: 'activity' as const,
      date: activity.timestamp,
      content: activity.description,
      createdBy: activity.userDisplayName,
      type: activity.action,
      metadata: activity.metadata
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" ||
      (filterType === "Calls" && log.logType === 'call') ||
      (filterType === "Messages" && log.logType === 'message') ||
      (filterType === "Notes" && (log.logType === 'note' || log.logType === 'activity')) ||
      (filterType === "Work Orders" && log.logType === 'workorder') ||
      (filterType === "Applications" && log.logType === 'application');

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
          src={tenant.profilePicture}
          sx={{ width: 60, height: 60 }}
        >
          {`${tenant.firstName[0]}${tenant.lastName[0]}`}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {tenant.firstName} {tenant.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tenantProperty?.name || 'No property assigned'} {tenant.unit && `• Unit ${tenant.unit}`}
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
            href={`tel:${tenant.phone}`}
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
                  label={tenant.status}
                  color={tenant.status === "Active" ? "success" : "warning"}
                  size="small"
                />
                <FormControl size="small" sx={{ mt: 1 }}>
                  <InputLabel>Change Status</InputLabel>
                  <Select
                    value={tenant.status}
                    label="Change Status"
                    onChange={(e) => {
                      const updatedTenant = {
                        ...tenant,
                        status: e.target.value as Tenant['status']
                      };
                      updateTenant(updatedTenant);
                    }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Late Payment">Late Payment</MenuItem>
                    <MenuItem value="Past Tenant">Past Tenant</MenuItem>
                  </Select>
                </FormControl>
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
                    href={`mailto:${tenant.email}`}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {tenant.email}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    component="a"
                    href={`tel:${tenant.phone}`}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {tenant.phone}
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
                <Typography variant="h6">Outstanding Balance</Typography>
                <Typography
                  variant="h4"
                  color="success.main"
                >
                  $0
                </Typography>
                {false && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Past due amount
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Property</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <HomeWorkRoundedIcon fontSize="small" />
                  <Typography variant="body2">{tenantProperty?.name || 'No property assigned'}</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Lease: {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                </Typography>
                <Button
                  size="small"
                  startIcon={<LinkRoundedIcon />}
                  onClick={() => setOpenPropertyLinkDialog(true)}
                >
                  Change Property
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Status Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Text Communication</Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">
                    {tenant.textCommunicationAccepted ? "Accepted" : "Not Accepted"}
                  </Typography>
                  <Chip
                    label={tenant.textCommunicationAccepted ? "Active" : "Pending"}
                    color={tenant.textCommunicationAccepted ? "success" : "warning"}
                    size="small"
                  />
                </Stack>
                {!tenant.textCommunicationAccepted && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SmsRoundedIcon />}
                    onClick={() => alert('Text communication invite sent!')}
                  >
                    Send Invite
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Auto Pay</Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">
                    {tenant.autoPayEnrolled ? "Enrolled" : "Not Enrolled"}
                  </Typography>
                  <Chip
                    label={tenant.autoPayEnrolled ? "Active" : "Inactive"}
                    color={tenant.autoPayEnrolled ? "success" : "default"}
                    size="small"
                  />
                </Stack>
                {!tenant.autoPayEnrolled && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CreditCardRoundedIcon />}
                    onClick={() => alert('Auto pay enrollment invite sent with instructions!')}
                  >
                    Send Enrollment Invite
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Tenant Insurance</Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">
                    Not Available
                  </Typography>
                  <Chip
                    label="Not Available"
                    color="default"
                    size="small"
                  />
                </Stack>
                {false && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Expires: {new Date(tenant.insuranceExpiry).toLocaleDateString()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setCommunicationData({
                          type: 'email',
                          recipient: `${tenant.firstName} ${tenant.lastName}`,
                          subject: 'Insurance Renewal Notice',
                          message: `Dear ${tenant.firstName},\n\nThis is a reminder that your insurance policy expires on ${new Date(tenant.insuranceExpiry!).toLocaleDateString()}. Please renew your policy to maintain coverage.\n\nThank you.`
                        });
                        setCommunicationDialogOpen(true);
                      }}
                    >
                      Send Renewal Notice
                    </Button>
                  </>
                )}
                {true && (
                  <Stack spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setCommunicationData({
                          type: 'email',
                          recipient: `${tenant.firstName} ${tenant.lastName}`,
                          subject: 'Insurance Enrollment Required',
                          message: `Dear ${tenant.firstName},\n\nWe notice that you currently do not have insurance coverage. As per your lease agreement, insurance is required. Please provide proof of insurance or enroll in our recommended insurance program.\n\nThank you.`
                        });
                        setCommunicationDialogOpen(true);
                      }}
                    >
                      Send Insurance Notice
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => window.open('https://example-insurance.com/enroll', '_blank')}
                    >
                      Get Insurance Link
                    </Button>
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
          <Tab label="Activity & Logs" />
          <Tab label="Payment History" />
          <Tab label="Documents" />
          <Tab label="Lease Details" />
        </Tabs>
      </Box>

      {/* Activity & Logs Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Search and Filter */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search logs, notes, messages..."
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
                  <MenuItem value="Applications">Applications</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Activity Timeline */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Activity Timeline</Typography>
              {filteredLogs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No activities found. Add a note to get started.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredLogs.map((log) => (
                    <ListItem key={`${log.logType}-${log.id}`} divider>
                      <ListItemIcon>
                        {log.logType === 'call' && getCallIcon((log as any).type)}
                        {log.logType === 'message' &&
                          ((log as any).type === 'SMS' ? <SmsRoundedIcon /> : <EmailRoundedIcon />)}
                        {log.logType === 'note' && <NoteAddRoundedIcon />}
                        {log.logType === 'activity' && <NoteAddRoundedIcon />}
                        {log.logType === 'workorder' && <BuildRoundedIcon />}
                        {log.logType === 'application' && <PersonRoundedIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <>
                            {log.logType === 'call' &&
                              `${(log as any).type} Call • ${formatDuration((log as any).duration)}`
                            }
                            {log.logType === 'message' &&
                              `${(log as any).type} ${(log as any).direction}${(log as any).subject ? ` • ${(log as any).subject}` : ''}`
                            }
                            {log.logType === 'note' &&
                              `Note • ${(log as any).type}`
                            }
                            {log.logType === 'activity' &&
                              `Activity • ${(log as any).type}`
                            }
                            {log.logType === 'workorder' &&
                              `Work Order • ${(log as any).status} • ${(log as any).title}`
                            }
                            {log.logType === 'application' &&
                              `${(log as any).type}`
                            }
                          </>
                        }
                        secondary={
                          <>
                            {log.logType === 'call' && (log as any).notes}
                            {log.logType === 'message' && (log as any).content}
                            {log.logType === 'note' && (log as any).content}
                            {log.logType === 'activity' && (log as any).content}
                            {log.logType === 'workorder' && `${(log as any).content} • Priority: ${(log as any).priority}${(log as any).assignedTo ? ` • Assigned to: ${(log as any).assignedTo}` : ''}`}
                            {log.logType === 'application' && (log as any).content}
                            {' • '}
                            {new Date(log.date).toLocaleString()}
                            {log.logType === 'call' && ` • by ${(log as any).userWhoMadeCall}`}
                            {log.logType === 'message' && (log as any).userWhoSent && ` • by ${(log as any).userWhoSent}`}
                            {log.logType === 'note' && ` • by ${(log as any).createdBy}`}
                            {log.logType === 'activity' && ` • by ${(log as any).createdBy}`}
                            {log.logType === 'workorder' && ` • Created by Tenant`}
                            {log.logType === 'application' && ` • by ${(log as any).createdBy}`}
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
              )}
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
                  startIcon={<PaymentRoundedIcon />}
                  onClick={() => setOpenPaymentDialog(true)}
                >
                  Record Payment
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<WarningRoundedIcon />}
                  onClick={() => setOpenChargeDialog(true)}
                >
                  Add Charge/Fee
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

      {/* Payment History Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Payment History</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Recorded By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={payment.method} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={getPaymentStatusColor(payment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell>{payment.recordedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Outstanding Charges</Typography>
              <List>
                {charges.filter(c => !c.isPaid).map((charge) => (
                  <ListItem key={charge.id}>
                    <ListItemText
                      primary={`${charge.type} - $${charge.amount}`}
                      secondary={`${charge.description} • ${new Date(charge.date).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Mark as Paid">
                        <IconButton size="small">
                          <CheckCircleRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
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
                    <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{doc.uploadedBy}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          // Simulate document download
                          const link = document.createElement('a');
                          link.href = doc.url || '#';
                          link.download = doc.name;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);

                          // Show feedback to user
                          alert(`Downloading ${doc.name}...`);
                        }}
                        title={`Download ${doc.name}`}
                      >
                        <DownloadRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* Lease Details Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Lease Information</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityRoundedIcon />}
                    onClick={() => {
                      // Open lease contract in modal
                      if (leaseDetails.leaseDocument) {
                        setContractViewModalOpen(true);
                      } else {
                        alert('Lease contract not found. Please upload the lease document.');
                      }
                    }}
                  >
                    View Contract
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadRoundedIcon />}
                    onClick={() => {
                      // Download lease contract
                      if (leaseDetails.leaseDocument) {
                        const link = document.createElement('a');
                        link.href = `/documents/${leaseDetails.leaseDocument}`;
                        link.download = leaseDetails.leaseDocument;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        alert(`Downloading ${leaseDetails.leaseDocument}...`);
                      } else {
                        alert('Lease contract not found. Please upload the lease document.');
                      }
                    }}
                  >
                    Download
                  </Button>
                </Stack>
              </Stack>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Lease Period</Typography>
                  <Typography variant="body1">
                    {new Date(leaseDetails.startDate).toLocaleDateString()} - {new Date(leaseDetails.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Monthly Rent</Typography>
                  <Typography variant="h6">${leaseDetails.monthlyRent.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Security Deposit</Typography>
                  <Typography variant="body1">${leaseDetails.securityDeposit.toLocaleString()}</Typography>
                </Box>
                {leaseDetails.petDeposit && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Pet Deposit</Typography>
                    <Typography variant="body1">${leaseDetails.petDeposit.toLocaleString()}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Late Fee Policy</Typography>
                  <Typography variant="body1">
                    ${leaseDetails.lateFeeAmount} after {leaseDetails.lateFeeDays} days
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Special Terms</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Renewal Option</Typography>
                <Typography variant="body1">
                  {leaseDetails.renewalOption ? "Available" : "Not Available"}
                </Typography>
                {leaseDetails.renewalTerms && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {leaseDetails.renewalTerms}
                  </Typography>
                )}
              </Box>
              
              {leaseDetails.specialTerms && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Additional Terms</Typography>
                  <Typography variant="body2">{leaseDetails.specialTerms}</Typography>
                </Box>
              )}
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
                <MenuItem value="Payment">Payment</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Communication">Communication</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <Divider />
                <MenuItem value="Call Log - Incoming">Call Log - Incoming Call</MenuItem>
                <MenuItem value="Call Log - Outgoing">Call Log - Outgoing Call</MenuItem>
                <MenuItem value="Call Log - Missed">Call Log - Missed Call</MenuItem>
              </Select>
            </FormControl>

            {newNote.type.startsWith('Call Log') && (
              <TextField
                label="Call Duration (seconds)"
                type="number"
                fullWidth
                value={newNote.duration || ""}
                onChange={(e) => setNewNote({ ...newNote, duration: parseInt(e.target.value) || 0 })}
                placeholder="Enter call duration in seconds (0 for missed calls)"
                helperText="Leave as 0 for missed calls or if duration is unknown"
              />
            )}
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

      {/* Record Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={newPayment.amount || ""}
              onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={newPayment.method}
                label="Payment Method"
                onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as Payment["method"] })}
              >
                <MenuItem value="ACH">ACH</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Money Order">Money Order</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              value={newPayment.description}
              onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
              placeholder="e.g., February 2024 Rent"
            />
            <TextField
              label="Transaction ID (Optional)"
              fullWidth
              value={newPayment.transactionId}
              onChange={(e) => setNewPayment({ ...newPayment, transactionId: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPayment}>Record Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Add Charge Dialog */}
      <Dialog open={openChargeDialog} onClose={() => setOpenChargeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Charge/Fee</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Charge Type</InputLabel>
              <Select
                value={newCharge.type}
                label="Charge Type"
                onChange={(e) => setNewCharge({ ...newCharge, type: e.target.value as Charge["type"] })}
              >
                <MenuItem value="Late Fee">Late Fee</MenuItem>
                <MenuItem value="Pet Fee">Pet Fee</MenuItem>
                <MenuItem value="Damage">Damage</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={newCharge.amount || ""}
              onChange={(e) => setNewCharge({ ...newCharge, amount: parseFloat(e.target.value) || 0 })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newCharge.description}
              onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
              placeholder="Describe the reason for this charge..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChargeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCharge}>Add Charge</Button>
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
                <MenuItem value="Lease">Lease</MenuItem>
                <MenuItem value="Payment">Payment</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Communication">Communication</MenuItem>
                <MenuItem value="Application">Application</MenuItem>
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

      {/* Property Link Dialog */}
      <Dialog open={openPropertyLinkDialog} onClose={() => setOpenPropertyLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Property Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Select a new property to assign this tenant to.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select value={tenant.propertyId || ""} label="Property">
                <MenuItem value="">
                  <em>No property assigned</em>
                </MenuItem>
                {state.properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
                <MenuItem value="Downtown Lofts">Downtown Lofts</MenuItem>
                <MenuItem value="Garden View Condos">Garden View Condos</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Unit"
              fullWidth
              value={tenant.unit}
              placeholder="e.g., 2A, 101, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPropertyLinkDialog(false)}>Cancel</Button>
          <Button variant="contained">Update Property</Button>
        </DialogActions>
      </Dialog>

      {/* Communication Dialog */}
      <CommunicationDialog
        open={communicationDialogOpen}
        onClose={() => {
          setCommunicationDialogOpen(false);
          setCommunicationData({
            type: 'email',
            recipient: '',
            subject: '',
            message: ''
          });
        }}
        contact={{
          name: `${tenant.firstName} ${tenant.lastName}`,
          email: tenant.email,
          phone: tenant.phone
        }}
        initialData={communicationData}
        onSend={(data) => {
          console.log('Sending communication:', data);
          alert(`${data.type.toUpperCase()} sent successfully!\n\nThis communication has been logged in the tenant's history.`);
          setCommunicationDialogOpen(false);
          setCommunicationData({
            type: 'email',
            recipient: '',
            subject: '',
            message: ''
          });
        }}
      />

      {/* Contract View Modal */}
      <Dialog
        open={contractViewModalOpen}
        onClose={() => setContractViewModalOpen(false)}
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
              Lease Contract - {tenant.firstName} {tenant.lastName}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={() => {
                  // Download lease contract
                  if (leaseDetails.leaseDocument) {
                    const link = document.createElement('a');
                    link.href = `/documents/${leaseDetails.leaseDocument}`;
                    link.download = leaseDetails.leaseDocument;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    alert(`Downloading ${leaseDetails.leaseDocument}...`);
                  }
                }}
              >
                Download
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {leaseDetails.leaseDocument ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f5f5f5'
              }}
            >
              {/* PDF Viewer or Document Preview */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'white',
                  m: 2,
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }}
              >
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <DescriptionRoundedIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Lease Contract Preview
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Document: {leaseDetails.leaseDocument}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    In a real application, this would display the actual PDF content using a PDF viewer component.
                    For demo purposes, this shows a preview placeholder.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<VisibilityRoundedIcon />}
                      onClick={() => {
                        // In a real app, this would open the PDF in a viewer
                        window.open(`/documents/${leaseDetails.leaseDocument}`, '_blank');
                      }}
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadRoundedIcon />}
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `/documents/${leaseDetails.leaseDocument}`;
                        link.download = leaseDetails.leaseDocument;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        alert(`Downloading ${leaseDetails.leaseDocument}...`);
                      }}
                    >
                      Download PDF
                    </Button>
                  </Stack>

                  {/* Sample Contract Info Display */}
                  <Divider sx={{ width: '100%', my: 2 }} />
                  <Stack spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Contract Details:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Tenant:</Typography>
                        <Typography variant="body1">{tenant.firstName} {tenant.lastName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Property:</Typography>
                        <Typography variant="body1">{tenantProperty?.name || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Lease Period:</Typography>
                        <Typography variant="body1">
                          {new Date(leaseDetails.startDate).toLocaleDateString()} - {new Date(leaseDetails.endDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Monthly Rent:</Typography>
                        <Typography variant="body1" color="success.main" fontWeight="bold">
                          ${leaseDetails.monthlyRent.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                Contract Not Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please upload the lease contract document to view it here.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractViewModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
