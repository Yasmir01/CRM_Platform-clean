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
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
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

interface CallLog {
  id: string;
  type: "Incoming" | "Outgoing" | "Missed";
  duration: number;
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
  subject?: string;
  userWhoSent?: string;
}

interface Note {
  id: string;
  content: string;
  date: string;
  createdBy: string;
  type: "General" | "Communication" | "Application" | "Follow-up" | "Viewing";
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  category: "Application" | "Communication" | "Legal" | "Other";
  url: string;
}

interface ProspectDetailProps {
  prospectId: string;
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
      id={`prospect-tabpanel-${index}`}
      aria-labelledby={`prospect-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProspectDetailPage({ prospectId, onBack }: ProspectDetailProps) {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("All");
  const [dateFilter, setDateFilter] = React.useState("");
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = React.useState(false);
  const [openMessageDialog, setOpenMessageDialog] = React.useState(false);
  const [messageType, setMessageType] = React.useState<"SMS" | "Email">("SMS");
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);

  // Mock prospect data
  const prospect = {
    id: prospectId,
    firstName: "Michael",
    lastName: "Davis",
    email: "michael.davis@email.com",
    phone: "(555) 987-6543",
    status: "Active" as const,
    source: "Website",
    interestedIn: "Downtown Lofts",
    budget: "$2000-2500",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    notes: "Looking for 2BR apartment, prefers downtown area"
  };

  const [callLogs] = React.useState<CallLog[]>([
    {
      id: "1",
      type: "Outgoing",
      duration: 240,
      date: "2024-01-19T15:30:00Z",
      notes: "Initial contact call, discussed requirements",
      userWhoMadeCall: "John Manager"
    }
  ]);

  const [messageLogs] = React.useState<MessageLog[]>([
    {
      id: "1",
      type: "Email",
      direction: "Sent",
      content: "Thank you for your interest in our properties. I've attached some listings that match your criteria.",
      subject: "Property Listings - Downtown Lofts",
      date: "2024-01-18T10:00:00Z",
      userWhoSent: "John Manager"
    }
  ]);

  const [notes, setNotes] = React.useState<Note[]>([
    {
      id: "1",
      content: "Prospect is very interested in downtown locations. Prefers 2BR with parking. Available to move in within 2 months.",
      date: "2024-01-17T14:00:00Z",
      createdBy: "John Manager",
      type: "General"
    }
  ]);

  const [documents] = React.useState<Document[]>([
    {
      id: "1",
      name: "Application Form.pdf",
      type: "PDF",
      size: 850000,
      uploadDate: "2024-01-16T11:00:00Z",
      uploadedBy: "Michael Davis",
      category: "Application",
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

  const allLogs = [
    ...callLogs.map(log => ({ ...log, logType: 'call' as const })),
    ...messageLogs.map(log => ({ ...log, logType: 'message' as const })),
    ...notes.map(note => ({ ...note, logType: 'note' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || 
      (filterType === "Calls" && log.logType === 'call') ||
      (filterType === "Messages" && log.logType === 'message') ||
      (filterType === "Notes" && log.logType === 'note');
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
          src={prospect.profilePicture}
          sx={{ width: 60, height: 60 }}
        >
          {`${prospect.firstName[0]}${prospect.lastName[0]}`}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {prospect.firstName} {prospect.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Prospect • Interested in {prospect.interestedIn}
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
            href={`tel:${prospect.phone}`}
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
                  label={prospect.status}
                  color="primary"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Source: {prospect.source}
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
                    href={`mailto:${prospect.email}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {prospect.email}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneRoundedIcon fontSize="small" />
                  <Typography 
                    variant="body2"
                    component="a"
                    href={`tel:${prospect.phone}`}
                    sx={{ 
                      color: 'primary.main', 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {prospect.phone}
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
                <Typography variant="h6">Preferences</Typography>
                <Typography variant="body2">
                  <strong>Budget:</strong> {prospect.budget}
                </Typography>
                <Typography variant="body2">
                  <strong>Interested in:</strong> {prospect.interestedIn}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Notes</Typography>
                <Typography variant="body2" color="text.secondary">
                  {prospect.notes}
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
          <Tab label="Documents" />
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
                        </>
                      }
                      secondary={
                        <>
                          {log.logType === 'call' && (log as any).notes}
                          {log.logType === 'message' && (log as any).content}
                          {log.logType === 'note' && (log as any).content}
                          {' • '}
                          {new Date(log.date).toLocaleString()}
                          {log.logType === 'call' && ` • by ${(log as any).userWhoMadeCall}`}
                          {log.logType === 'message' && (log as any).userWhoSent && ` • by ${(log as any).userWhoSent}`}
                          {log.logType === 'note' && ` • by ${(log as any).createdBy}`}
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

      {/* Documents Tab */}
      <TabPanel value={currentTab} index={1}>
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
                <MenuItem value="Communication">Communication</MenuItem>
                <MenuItem value="Application">Application</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Viewing">Viewing</MenuItem>
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
                <MenuItem value="Application">Application</MenuItem>
                <MenuItem value="Communication">Communication</MenuItem>
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
    </Box>
  );
}
