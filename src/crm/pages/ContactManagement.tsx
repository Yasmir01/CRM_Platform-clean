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
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import TaskRoundedIcon from "@mui/icons-material/TaskRoundedIcon";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useCrmData, Contact } from "../contexts/CrmDataContext";

// Using unified Contact interface from CrmDataContext

interface ContactInteraction {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "task" | "deal" | "campaign";
  title: string;
  description: string;
  date: string;
  outcome?: string;
  nextAction?: string;
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
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    company: "Tech Solutions Inc",
    position: "Marketing Director",
    address: "123 Business St",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    source: "Website",
    status: "Customer",
    tags: ["VIP", "High Value", "Tech Industry"],
    lastContact: "2024-01-15",
    nextFollowUp: "2024-01-22",
    leadScore: 95,
    lifetime_value: 125000,
    interactions: [
      { id: "1", type: "email", title: "Welcome Email", description: "Sent welcome package", date: "2024-01-15", outcome: "Opened" },
      { id: "2", type: "call", title: "Discovery Call", description: "Discussed requirements", date: "2024-01-10", outcome: "Interested" },
    ],
    customFields: { budget: "$50k-100k", decisionMaker: true },
    socialProfiles: { linkedin: "sarah-johnson-tech", twitter: "@sarahj_tech" },
    dateCreated: "2024-01-01",
    dateModified: "2024-01-15",
    assignedTo: "John Smith"
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@globalcorp.com",
    phone: "(555) 987-6543",
    company: "Global Corp",
    position: "CEO",
    address: "456 Corporate Ave",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    source: "Referral",
    status: "Prospect",
    tags: ["Enterprise", "Decision Maker", "Hot Lead"],
    lastContact: "2024-01-14",
    nextFollowUp: "2024-01-21",
    leadScore: 88,
    lifetime_value: 250000,
    interactions: [
      { id: "3", type: "meeting", title: "Product Demo", description: "Demonstrated key features", date: "2024-01-14", outcome: "Very interested" },
    ],
    customFields: { companySize: "500+", industry: "Finance" },
    socialProfiles: { linkedin: "michael-chen-ceo" },
    dateCreated: "2024-01-05",
    dateModified: "2024-01-14",
    assignedTo: "Emily Davis"
  },
  {
    id: "3",
    firstName: "Lisa",
    lastName: "Rodriguez",
    email: "lisa.r@startup.io",
    phone: "(555) 456-7890",
    company: "Startup Ventures",
    position: "Founder",
    address: "789 Innovation Blvd",
    city: "Austin",
    state: "TX",
    zipCode: "73301",
    source: "Social Media",
    status: "Lead",
    tags: ["Startup", "Early Stage", "Follow Up"],
    lastContact: "2024-01-12",
    nextFollowUp: "2024-01-19",
    leadScore: 72,
    lifetime_value: 45000,
    interactions: [
      { id: "4", type: "campaign", title: "Startup Special Offer", description: "Targeted campaign for startups", date: "2024-01-12", outcome: "Clicked" },
    ],
    customFields: { fundingStage: "Series A", employees: "25" },
    socialProfiles: { linkedin: "lisa-rodriguez-founder", twitter: "@lisastartup" },
    dateCreated: "2024-01-10",
    dateModified: "2024-01-12",
    assignedTo: "Mike Wilson"
  }
];

const getStatusColor = (status: Contact["status"]) => {
  switch (status) {
    case "Customer": return "success";
    case "Prospect": return "primary";
    case "Lead": return "warning";
    case "Qualified": return "info";
    case "Active": return "success";
    case "Inactive": return "error";
    default: return "default";
  }
};

const getLeadScoreColor = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
};

export default function ContactManagement() {
  const navigate = useNavigate();
  const { trackPropertyActivity } = useActivityTracking();
  const { state, addContact, updateContact, deleteContact } = useCrmData();
  const { contacts, tenants, propertyManagers } = state;

  // Generate contacts from CRM data (tenants, property managers, service providers)
  const allContacts = React.useMemo(() => {
    const generatedContacts: Contact[] = [];

    // Add contacts from tenants - always sync status and tags
    tenants?.forEach((tenant) => {
      // Check if contact already exists
      const existingContact = contacts?.find(c =>
        c.email === tenant.email || c.relatedEntityId === tenant.id
      );

      const tenantContact = {
        id: existingContact?.id || `tenant-${tenant.id}`,
        type: "Tenant" as const,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        status: tenant.status === "Active" ? "Active" as const : "Inactive" as const,
        tags: ["Tenant", ...(tenant.status === "Active" ? ["Current Tenant"] : ["Past Tenant"])],
        notes: `Tenant for property ID: ${tenant.propertyId}. Lease: ${tenant.leaseStart} to ${tenant.leaseEnd}`,
        lastContact: tenant.updatedAt,
        relatedEntityId: tenant.id,
        createdAt: existingContact?.createdAt || tenant.createdAt,
        updatedAt: tenant.updatedAt,
        // Preserve existing contact data if it exists
        ...(existingContact && {
          company: existingContact.company,
          position: existingContact.position,
          address: existingContact.address,
          city: existingContact.city,
          state: existingContact.state,
          zipCode: existingContact.zipCode,
          source: existingContact.source,
          nextFollowUp: existingContact.nextFollowUp,
          leadScore: existingContact.leadScore,
          lifetime_value: existingContact.lifetime_value,
          interactions: existingContact.interactions,
          customFields: existingContact.customFields,
          socialProfiles: existingContact.socialProfiles,
          assignedTo: existingContact.assignedTo
        })
      };

      // Always add/update tenant contact to ensure real-time status sync
      generatedContacts.push(tenantContact);
    });

    // Add contacts from property managers
    propertyManagers?.forEach((manager) => {
      const existingContact = contacts?.find(c =>
        c.email === manager.email || c.relatedEntityId === manager.id
      );

      if (!existingContact) {
        generatedContacts.push({
          id: `manager-${manager.id}`,
          type: "PropertyManager",
          firstName: manager.firstName,
          lastName: manager.lastName,
          email: manager.email,
          phone: manager.phone,
          company: "Property Management",
          status: manager.status === "Active" ? "Active" : "Inactive",
          tags: ["Property Manager", "Internal", ...(manager.specialties || [])],
          notes: `Property Manager. License: ${manager.licenseNumber || 'N/A'}. Specialties: ${manager.specialties?.join(', ') || 'General'}`,
          lastContact: manager.updatedAt,
          relatedEntityId: manager.id,
          createdAt: manager.createdAt,
          updatedAt: manager.updatedAt
        });
      }
    });

    // Add service providers from work orders (if available)
    if (state.workOrders) {
      const serviceProviders = new Set<string>();
      state.workOrders.forEach((workOrder: any) => {
        if (workOrder.assignedTo && !serviceProviders.has(workOrder.assignedTo)) {
          serviceProviders.add(workOrder.assignedTo);

          const existingContact = contacts?.find(c =>
            c.firstName === workOrder.assignedTo || c.company === workOrder.assignedTo
          );

          if (!existingContact) {
            generatedContacts.push({
              id: `service-${workOrder.assignedTo.replace(/\s+/g, '-').toLowerCase()}`,
              type: "ServiceProvider",
              firstName: workOrder.assignedTo.includes(' ') ? workOrder.assignedTo.split(' ')[0] : workOrder.assignedTo,
              lastName: workOrder.assignedTo.includes(' ') ? workOrder.assignedTo.split(' ').slice(1).join(' ') : '',
              email: `${workOrder.assignedTo.replace(/\s+/g, '').toLowerCase()}@service.com`,
              phone: "(555) 000-0000",
              company: workOrder.assignedTo,
              status: "Active",
              tags: ["Service Provider", "Vendor", workOrder.type || "General"],
              notes: `Service provider for ${workOrder.type || 'maintenance'} services. Work Order: ${workOrder.id}`,
              lastContact: workOrder.updatedAt || workOrder.createdAt,
              relatedEntityId: `workorder-${workOrder.id}`,
              createdAt: workOrder.createdAt,
              updatedAt: workOrder.updatedAt || workOrder.createdAt
            });
          }
        }
      });
    }

    // Add any existing manual contacts
    const manualContacts = contacts?.filter(c => !c.relatedEntityId) || [];

    // Get existing contacts that don't have updated versions in generatedContacts
    const existingContacts = contacts?.filter(c => c.relatedEntityId &&
      !generatedContacts.some(gc => gc.relatedEntityId === c.relatedEntityId)) || [];

    return [...generatedContacts, ...manualContacts, ...existingContacts];
  }, [contacts, tenants, propertyManagers]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("All");
  const [filterSource, setFilterSource] = React.useState("All");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    source: "Website",
    status: "Lead",
    tags: [] as string[],
    nextFollowUp: "",
    assignedTo: "",
    customFields: {}
  });

  const filteredContacts = allContacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "All" || contact.status === filterStatus;
    const matchesSource = filterSource === "All" || contact.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleAddContact = () => {
    setSelectedContact(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      source: "Website",
      status: "Lead",
      tags: [],
      nextFollowUp: "",
      assignedTo: "",
      customFields: {}
    });
    setOpenDialog(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company || "",
      position: "", // Not in unified interface
      address: "", // Not in unified interface
      city: "", // Not in unified interface
      state: "", // Not in unified interface
      zipCode: "", // Not in unified interface
      source: "CRM", // Default for synced contacts
      status: contact.status,
      tags: contact.tags,
      nextFollowUp: "", // Not in unified interface
      assignedTo: "", // Not in unified interface
      customFields: {}
    });
    setOpenDialog(true);
  };

  const handleSaveContact = () => {
    if (selectedContact) {
      // Update existing contact
      const updatedContact = {
        ...selectedContact,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      updateContact(updatedContact);
    } else {
      // Add new contact
      const newContactData = {
        ...formData,
        lastContact: new Date().toISOString().split('T')[0],
        notes: '' // Add missing required field
      };
      addContact(newContactData);
    }
    setOpenDialog(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const totalContacts = allContacts.length;
  const activeContacts = allContacts.filter(c => c.status === "Active").length;
  const tenantContacts = allContacts.filter(c => c.type === "Tenant").length;
  const managerContacts = allContacts.filter(c => c.type === "PropertyManager").length;
  const serviceProviders = allContacts.filter(c => c.type === "ServiceProvider").length;
  const prospects = allContacts.filter(c => c.type === "Prospect").length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Contact Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={() => console.log('Export contacts')}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <GroupRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Contacts</Typography>
                  <Typography variant="h4">{totalContacts}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <FavoriteRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Active Contacts</Typography>
                  <Typography variant="h4">{activeContacts}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <ThumbUpRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Tenants</Typography>
                  <Typography variant="h4">{tenantContacts}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Property Managers</Typography>
                  <Typography variant="h4">{managerContacts}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "secondary.main" }}>$</Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Service Providers</Typography>
                  <Typography variant="h4">{serviceProviders}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search contacts..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Customer">Customers</MenuItem>
                  <MenuItem value="Prospect">Prospects</MenuItem>
                  <MenuItem value="Lead">Leads</MenuItem>
                  <MenuItem value="Qualified">Qualified</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Source</InputLabel>
                <Select
                  value={filterSource}
                  label="Filter by Source"
                  onChange={(e) => setFilterSource(e.target.value)}
                >
                  <MenuItem value="All">All Sources</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Cold Call">Cold Call</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                  <MenuItem value="Advertisement">Advertisement</MenuItem>
                  <MenuItem value="Partner">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredContacts.length} of {totalContacts} contacts
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contact</TableCell>
              <TableCell>Company & Position</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Status & Score</TableCell>
              <TableCell>Last Contact</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      {contact.firstName[0]}{contact.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {contact.firstName} {contact.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Added {new Date(contact.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {contact.company || "No Company"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contact.position || "No Position"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{contact.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{contact.phone}</Typography>
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Chip
                      label={contact.status}
                      color={getStatusColor(contact.status)}
                      size="small"
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Type: {contact.type}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={contact.type === "Tenant" ? 100 : contact.type === "PropertyManager" ? 90 : contact.type === "ServiceProvider" ? 80 : 50}
                        color={contact.type === "Tenant" ? "success" : contact.type === "PropertyManager" ? "info" : "warning"}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : 'No contact'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(contact.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {contact.tags.slice(0, 2).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                    {contact.tags.length > 2 && (
                      <Chip label={`+${contact.tags.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit Contact">
                      <IconButton
                        size="small"
                        onClick={() => handleEditContact(contact)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Contact">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteContact(contact.id)}
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

      {/* Add/Edit Contact Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContact ? "Edit Contact" : "Add New Contact"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  value={formData.source}
                  label="Source"
                  onChange={(e) => setFormData({...formData, source: e.target.value as any})}
                >
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Cold Call">Cold Call</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                  <MenuItem value="Advertisement">Advertisement</MenuItem>
                  <MenuItem value="Partner">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <MenuItem value="Lead">Lead</MenuItem>
                  <MenuItem value="Qualified">Qualified</MenuItem>
                  <MenuItem value="Prospect">Prospect</MenuItem>
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveContact}>
            {selectedContact ? "Update" : "Add"} Contact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
