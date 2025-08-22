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
import {
  ArrowBack,
  Email,
  Phone,
  Edit,
  Delete,
  Add,
  Business,
  Person,
  Schedule,
  Note,
  Tag,
  Message,
  Event,
  Task,
  Assignment,
  ExpandMore,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useCrmData, Contact } from "../contexts/CrmDataContext";
import CommunicationDialog from "../components/CommunicationDialog";
import RichTextEditor from "../components/RichTextEditor";
import { LocalStorageService } from "../services/LocalStorageService";

interface ContactDetailPageProps {
  contact: Contact;
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ContactDetailPage: React.FC<ContactDetailPageProps> = ({ contact, onBack }) => {
  const { updateContact, deleteContact } = useCrmData();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact>>(contact);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm(contact || {});
    }
  };

  const handleSaveEdit = () => {
    if (contact && editForm) {
      updateContact(contact.id, editForm);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(contact || {});
  };

  const handleDeleteContact = () => {
    if (contact) {
      deleteContact(contact.id);
      onBack();
    }
  };

  const handleFormChange = (field: keyof Contact, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };


  const statusColor = contact.status === "Active" ? "success" : "error";

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onBack}
            variant="outlined"
          >
            Back to Contacts
          </Button>
          <Typography variant="h4">
            {contact.firstName} {contact.lastName}
          </Typography>
          <Chip
            label={contact.status}
            color={statusColor}
            size="small"
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Send Communication">
            <IconButton
              color="primary"
              onClick={() => setShowCommunicationDialog(true)}
            >
              <Message />
            </IconButton>
          </Tooltip>
          <Tooltip title={isEditing ? "Cancel Edit" : "Edit Contact"}>
            <IconButton
              color="primary"
              onClick={isEditing ? handleCancelEdit : handleEditToggle}
            >
              {isEditing ? <VisibilityOff /> : <Edit />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Contact">
            <IconButton
              color="error"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Contact Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: "2rem",
                  }}
                >
                  {contact.firstName[0]}{contact.lastName[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {contact.firstName} {contact.lastName}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {contact.company || "No Company"}
                    </Typography>
                    <Chip label={contact.type} size="small" variant="outlined" />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{contact.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{contact.phone}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Contact
                  </Typography>
                  <Typography variant="body2">
                    {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : "Never"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tags
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                    {contact.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Communications" />
            <Tab label="Notes" />
            <Tab label="Activity" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  {isEditing ? (
                    <Stack spacing={2}>
                      <TextField
                        label="First Name"
                        value={editForm.firstName || ""}
                        onChange={(e) => handleFormChange("firstName", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Last Name"
                        value={editForm.lastName || ""}
                        onChange={(e) => handleFormChange("lastName", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Phone"
                        value={editForm.phone || ""}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Company"
                        value={editForm.company || ""}
                        onChange={(e) => handleFormChange("company", e.target.value)}
                        fullWidth
                      />
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editForm.status || "Active"}
                          onChange={(e) => handleFormChange("status", e.target.value)}
                        >
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button onClick={handleCancelEdit}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveEdit}>
                          Save Changes
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <List>
                      <ListItem>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText
                          primary="Name"
                          secondary={`${contact.firstName} ${contact.lastName}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Email /></ListItemIcon>
                        <ListItemText primary="Email" secondary={contact.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone /></ListItemIcon>
                        <ListItemText primary="Phone" secondary={contact.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Business /></ListItemIcon>
                        <ListItemText
                          primary="Company"
                          secondary={contact.company || "No Company"}
                        />
                      </ListItem>
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contact.notes || "No notes available"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Communications Tab */}
          <Typography variant="h6" gutterBottom>
            Communications History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Communication history will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Notes Tab */}
          <Typography variant="h6" gutterBottom>
            Contact Notes
          </Typography>
          <Paper sx={{ p: 2, minHeight: 200 }}>
            <Typography variant="body1">
              {contact.notes || "No notes available for this contact."}
            </Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Activity Tab */}
          <Typography variant="h6" gutterBottom>
            Activity Timeline
          </Typography>

          {/* Real-time Application Activities */}
          {(() => {
            const contactApplications = LocalStorageService.getApplications().filter(app =>
              app.applicantEmail === contact.email ||
              (app.formData?.email && app.formData.email === contact.email) ||
              (app.formData?.applicant_email && app.formData.applicant_email === contact.email)
            );

            if (contactApplications.length === 0) {
              return (
                <Typography variant="body2" color="text.secondary">
                  No application activity found for this contact.
                </Typography>
              );
            }

            const applicationActivities = contactApplications.flatMap(app => [
              {
                id: `app-submitted-${app.id}`,
                type: 'Application Submitted',
                date: app.submittedDate || app.createdAt || new Date().toISOString(),
                content: `Application ${app.id} submitted for ${app.propertyName || app.propertyCode || 'property'}`,
                status: app.status,
                paymentStatus: app.paymentStatus,
                applicationFee: app.applicationFee
              },
              ...(app.status !== 'New' ? [{
                id: `app-status-${app.id}`,
                type: 'Status Update',
                date: app.updatedAt || new Date().toISOString(),
                content: `Application ${app.id} status changed to ${app.status}`,
                status: app.status,
                paymentStatus: app.paymentStatus
              }] : []),
              ...(app.paymentStatus === 'Paid' ? [{
                id: `app-payment-${app.id}`,
                type: 'Payment Received',
                date: app.paymentDate || app.updatedAt || new Date().toISOString(),
                content: `Payment of $${app.applicationFee} received for application ${app.id}`,
                status: app.status,
                paymentStatus: app.paymentStatus,
                amount: app.applicationFee
              }] : [])
            ]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return (
              <Stack spacing={2}>
                {applicationActivities.map((activity) => (
                  <Card key={activity.id} variant="outlined">
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Chip
                              label={activity.type}
                              size="small"
                              color={
                                activity.type === 'Application Submitted' ? 'primary' :
                                activity.type === 'Status Update' ? 'secondary' :
                                activity.type === 'Payment Received' ? 'success' : 'default'
                              }
                            />
                            {activity.status && (
                              <Chip
                                label={activity.status}
                                size="small"
                                variant="outlined"
                                color={
                                  activity.status === 'Denied' ? 'error' :
                                  activity.status === 'Archived' ? 'success' :
                                  activity.status === 'Pending' ? 'warning' : 'default'
                                }
                              />
                            )}
                            {activity.paymentStatus && (
                              <Chip
                                label={`Payment ${activity.paymentStatus}`}
                                size="small"
                                variant="outlined"
                                color={activity.paymentStatus === 'Paid' ? 'success' : 'warning'}
                              />
                            )}
                          </Stack>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {activity.content}
                          </Typography>
                          {activity.amount && (
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              Amount: ${activity.amount.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            );
          })()}
        </TabPanel>
      </Paper>

      {/* Communication Dialog */}
      {showCommunicationDialog && (
        <CommunicationDialog
          open={showCommunicationDialog}
          onClose={() => setShowCommunicationDialog(false)}
          contact={{
            id: contact.id,
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            phone: contact.phone,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {contact.firstName} {contact.lastName}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteContact}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactDetailPage;
