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
  FormControlLabel,
  Switch,
  Checkbox,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
} from "@mui/material";
import { useCrmData } from "../contexts/CrmDataContext";
import ProspectDetailPage from "./ProspectDetailPage";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CommunicationDialog, { Contact } from "../components/CommunicationDialog";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import NewsletterRoundedIcon from "@mui/icons-material/CampaignRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";
import { Tooltip } from "@mui/material";
import {
  fixedFormControlStyles,
  fixedInputLabelStyles,
  responsiveStackStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";

interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "New" | "Contacted" | "Viewed" | "Applied" | "Approved" | "Rejected" | "Archived";
  source: "Website" | "Craigslist" | "Zillow" | "Referral" | "Walk-in" | "Phone" | "Social Media" | "Other";
  interestedProperty?: string;
  dateAdded: string;
  lastContact?: string;
  notes: string;
  creditScore?: number;
  monthlyIncome?: number;
  employment?: string;
  references?: number;
  pets?: boolean;
  moveInDate?: string;
  budget?: {
    min: number;
    max: number;
  };
  newsletterOptIn: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  rating: number;
  followUpDate?: string;
  applicationDate?: string;
  documents?: {
    application: boolean;
    creditCheck: boolean;
    income: boolean;
    references: boolean;
  };
}

interface WaitingListEntry {
  id: string;
  prospectId: string;
  propertyId: string;
  propertyName: string;
  dateAdded: string;
  priority: "High" | "Medium" | "Low";
  notes?: string;
  notifyWhenAvailable: boolean;
}

const mockProspects: Prospect[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    status: "Applied",
    source: "Zillow",
    interestedProperty: "Ocean View Villa",
    dateAdded: "2024-01-10",
    lastContact: "2024-01-15",
    notes: "Very interested in oceanfront properties. Has excellent credit and stable income. Prefers to move in by March.",
    creditScore: 780,
    monthlyIncome: 8500,
    employment: "Senior Software Engineer at Tech Corp",
    references: 3,
    pets: false,
    moveInDate: "2024-03-01",
    budget: { min: 4000, max: 5000 },
    newsletterOptIn: true,
    communicationPreferences: {
      email: true,
      sms: true,
      phone: false
    },
    rating: 5,
    followUpDate: "2024-01-20",
    applicationDate: "2024-01-15",
    documents: {
      application: true,
      creditCheck: true,
      income: true,
      references: true
    }
  },
  {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@email.com",
    phone: "(555) 234-5678",
    status: "Viewed",
    source: "Website",
    interestedProperty: "Downtown Lofts",
    dateAdded: "2024-01-12",
    lastContact: "2024-01-14",
    notes: "Viewed property on weekend. Interested but wants to see more units. Budget conscious but qualified.",
    creditScore: 720,
    monthlyIncome: 6200,
    employment: "Marketing Manager",
    references: 2,
    pets: true,
    moveInDate: "2024-02-15",
    budget: { min: 3000, max: 3500 },
    newsletterOptIn: true,
    communicationPreferences: {
      email: true,
      sms: false,
      phone: true
    },
    rating: 4,
    followUpDate: "2024-01-18",
    documents: {
      application: false,
      creditCheck: false,
      income: false,
      references: false
    }
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "Rodriguez",
    email: "emma.r@email.com",
    phone: "(555) 345-6789",
    status: "New",
    source: "Craigslist",
    dateAdded: "2024-01-16",
    notes: "Initial inquiry about Garden View Condos. Haven't responded to follow-up yet.",
    newsletterOptIn: false,
    communicationPreferences: {
      email: true,
      sms: false,
      phone: false
    },
    rating: 3,
    documents: {
      application: false,
      creditCheck: false,
      income: false,
      references: false
    }
  },
  {
    id: "4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@email.com",
    phone: "(555) 456-7890",
    status: "Rejected",
    source: "Referral",
    interestedProperty: "Sunset Apartments",
    dateAdded: "2024-01-08",
    lastContact: "2024-01-12",
    notes: "Application rejected due to insufficient income. Interested in lower-priced units.",
    creditScore: 650,
    monthlyIncome: 3200,
    employment: "Part-time Retail",
    references: 1,
    pets: false,
    budget: { min: 1500, max: 2000 },
    newsletterOptIn: true,
    communicationPreferences: {
      email: true,
      sms: true,
      phone: false
    },
    rating: 2,
    documents: {
      application: true,
      creditCheck: true,
      income: true,
      references: false
    }
  }
];

const mockWaitingList: WaitingListEntry[] = [
  {
    id: "w1",
    prospectId: "4",
    propertyId: "1",
    propertyName: "Sunset Apartments",
    dateAdded: "2024-01-12",
    priority: "High",
    notes: "Interested in any 1-bedroom unit under $2000",
    notifyWhenAvailable: true
  },
  {
    id: "w2",
    prospectId: "2",
    propertyId: "3",
    propertyName: "Downtown Lofts",
    dateAdded: "2024-01-14",
    priority: "Medium",
    notes: "Wants pet-friendly unit",
    notifyWhenAvailable: true
  }
];

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
      id={`prospects-tabpanel-${index}`}
      aria-labelledby={`prospects-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Prospects() {
  const { state } = useCrmData();
  const { properties } = state;
  const [prospects, setProspects] = React.useState<Prospect[]>(mockProspects);
  const [waitingList, setWaitingList] = React.useState<WaitingListEntry[]>(mockWaitingList);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [sourceFilter, setSourceFilter] = React.useState("All");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openWaitingListDialog, setOpenWaitingListDialog] = React.useState(false);
  const [selectedProspect, setSelectedProspect] = React.useState<Prospect | null>(null);
  const [communicationDialogOpen, setCommunicationDialogOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [showProspectDetail, setShowProspectDetail] = React.useState(false);
  const [detailProspectId, setDetailProspectId] = React.useState<string>("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "Website" as Prospect["source"],
    interestedPropertyId: "",
    notes: "",
    creditScore: 0,
    monthlyIncome: 0,
    employment: "",
    pets: false,
    moveInDate: "",
    budgetMin: 0,
    budgetMax: 0,
    newsletterOptIn: true,
    emailPref: true,
    smsPref: false,
    phonePref: false,
  });
  const [waitingListForm, setWaitingListForm] = React.useState({
    prospectId: "",
    propertyId: "",
    priority: "Medium" as WaitingListEntry["priority"],
    notes: "",
    notifyWhenAvailable: true
  });

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = 
      prospect.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "All" || prospect.status === statusFilter;
    const matchesSource = sourceFilter === "All" || prospect.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const getStatusColor = (status: Prospect["status"]) => {
    switch (status) {
      case "New": return "info";
      case "Contacted": return "primary";
      case "Viewed": return "warning";
      case "Applied": return "secondary";
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Archived": return "default";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: WaitingListEntry["priority"]) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "info";
      default: return "default";
    }
  };

  const handleAddProspect = () => {
    setSelectedProspect(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      source: "Website",
      interestedPropertyId: "",
      notes: "",
      creditScore: 0,
      monthlyIncome: 0,
      employment: "",
      pets: false,
      moveInDate: "",
      budgetMin: 0,
      budgetMax: 0,
      newsletterOptIn: true,
      emailPref: true,
      smsPref: false,
      phonePref: false,
    });
    setOpenDialog(true);
  };

  const handleViewProspectDetail = (prospectId: string) => {
    setDetailProspectId(prospectId);
    setShowProspectDetail(true);
  };

  const handleEditProspect = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setFormData({
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      email: prospect.email,
      phone: prospect.phone,
      source: prospect.source,
      interestedPropertyId: prospect.interestedProperty || "",
      notes: prospect.notes,
      creditScore: prospect.creditScore || 0,
      monthlyIncome: prospect.monthlyIncome || 0,
      employment: prospect.employment || "",
      pets: prospect.pets || false,
      moveInDate: prospect.moveInDate || "",
      budgetMin: prospect.budget?.min || 0,
      budgetMax: prospect.budget?.max || 0,
      newsletterOptIn: prospect.newsletterOptIn,
      emailPref: prospect.communicationPreferences.email,
      smsPref: prospect.communicationPreferences.sms,
      phonePref: prospect.communicationPreferences.phone,
    });
    setOpenDialog(true);
  };

  const handleSaveProspect = () => {
    const prospectData: Partial<Prospect> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      interestedProperty: formData.interestedPropertyId || undefined,
      notes: formData.notes,
      creditScore: formData.creditScore || undefined,
      monthlyIncome: formData.monthlyIncome || undefined,
      employment: formData.employment || undefined,
      pets: formData.pets,
      moveInDate: formData.moveInDate || undefined,
      budget: formData.budgetMin || formData.budgetMax ? {
        min: formData.budgetMin,
        max: formData.budgetMax
      } : undefined,
      newsletterOptIn: formData.newsletterOptIn,
      communicationPreferences: {
        email: formData.emailPref,
        sms: formData.smsPref,
        phone: formData.phonePref
      },
    };

    if (selectedProspect) {
      setProspects(prev => prev.map(p => 
        p.id === selectedProspect.id 
          ? { ...p, ...prospectData }
          : p
      ));
    } else {
      const newProspect: Prospect = {
        id: Date.now().toString(),
        ...prospectData,
        status: "New",
        dateAdded: new Date().toISOString().split('T')[0],
        rating: 3,
        documents: {
          application: false,
          creditCheck: false,
          income: false,
          references: false
        }
      } as Prospect;
      
      setProspects(prev => [...prev, newProspect]);
    }
    setOpenDialog(false);
  };

  const handleUpdateStatus = (prospectId: string, newStatus: Prospect["status"]) => {
    setProspects(prev => prev.map(p => 
      p.id === prospectId 
        ? { 
            ...p, 
            status: newStatus,
            lastContact: new Date().toISOString().split('T')[0],
            ...(newStatus === "Applied" && { applicationDate: new Date().toISOString().split('T')[0] })
          }
        : p
    ));
  };

  const handleAddToWaitingList = (prospect: Prospect) => {
    setWaitingListForm({
      prospectId: prospect.id,
      propertyId: "",
      priority: "Medium",
      notes: "",
      notifyWhenAvailable: true
    });
    setOpenWaitingListDialog(true);
  };

  const handleSaveWaitingList = () => {
    const newEntry: WaitingListEntry = {
      id: Date.now().toString(),
      prospectId: waitingListForm.prospectId,
      propertyId: waitingListForm.propertyId,
      propertyName: "Property Name", // Would be looked up from propertyId
      dateAdded: new Date().toISOString().split('T')[0],
      priority: waitingListForm.priority,
      notes: waitingListForm.notes,
      notifyWhenAvailable: waitingListForm.notifyWhenAvailable
    };
    
    setWaitingList(prev => [...prev, newEntry]);
    setOpenWaitingListDialog(false);
    alert("Added to waiting list successfully!");
  };

  const handleDeleteProspect = (id: string) => {
    setProspects(prev => prev.filter(p => p.id !== id));
  };

  const handleRemoveFromWaitingList = (id: string) => {
    setWaitingList(prev => prev.filter(w => w.id !== id));
  };

  const handleNotifyProspect = (prospect: Prospect) => {
    const contact: Contact = {
      id: prospect.id,
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      email: prospect.email,
      phone: prospect.phone
    };

    setSelectedContact(contact);
    setCommunicationDialogOpen(true);
  };

  const totalProspects = prospects.length;
  const newProspects = prospects.filter(p => p.status === "New").length;
  const appliedProspects = prospects.filter(p => p.status === "Applied").length;
  const approvedProspects = prospects.filter(p => p.status === "Approved").length;
  const newsletterSubscribers = prospects.filter(p => p.newsletterOptIn).length;
  const totalWaitingList = waitingList.length;
  const highPriorityWaiting = waitingList.filter(w => w.priority === "High").length;

  if (showProspectDetail) {
    return (
      <ProspectDetailPage
        prospectId={detailProspectId}
        onBack={() => setShowProspectDetail(false)}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Prospect Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GroupRoundedIcon />}
            onClick={() => {
              // Create CSV export of prospects data
              const csvData = filteredProspects.map(p => ({
                name: `${p.firstName} ${p.lastName}`,
                email: p.email,
                phone: p.phone,
                status: p.status,
                source: p.source,
                interestedProperty: p.interestedProperty,
                followUpDate: p.followUpDate
              }));

              const csvContent = [
                Object.keys(csvData[0]).join(','),
                ...csvData.map(row => Object.values(row).join(','))
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `prospects-export-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);

              alert("Prospects exported to CSV file!");
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddProspect}
          >
            Add Prospect
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<PersonRoundedIcon />}
            label={`All Prospects (${totalProspects})`}
            iconPosition="start"
          />
          <Tab
            icon={<PriorityHighRoundedIcon />}
            label={`Waiting List (${totalWaitingList})`}
            iconPosition="start"
          />
          <Tab
            icon={<NewsletterRoundedIcon />}
            label={`Newsletter (${newsletterSubscribers})`}
            iconPosition="start"
          />
          <Tab
            icon={<TrendingUpRoundedIcon />}
            label="Analytics"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* All Prospects Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <PersonRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Total Prospects
                    </Typography>
                    <Typography variant="h4">{totalProspects}</Typography>
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
                    <StarRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      New Prospects
                    </Typography>
                    <Typography variant="h4">{newProspects}</Typography>
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
                    <PendingRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Applications
                    </Typography>
                    <Typography variant="h4">{appliedProspects}</Typography>
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
                      Approved
                    </Typography>
                    <Typography variant="h4">{approvedProspects}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Tooltip
              title="Search prospects by name, email, or phone number"
              componentsProps={{
                tooltip: {
                  sx: uniformTooltipStyles
                }
              }}
            >
              <TextField
                fullWidth
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={fixedFormControlStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={6} md={3}>
            <Tooltip
              title="Filter prospects by their current status"
              componentsProps={{
                tooltip: {
                  sx: uniformTooltipStyles
                }
              }}
            >
              <FormControl fullWidth sx={fixedFormControlStyles}>
                <InputLabel sx={fixedInputLabelStyles}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Contacted">Contacted</MenuItem>
                  <MenuItem value="Viewed">Viewed</MenuItem>
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
          <Grid item xs={6} md={3}>
            <Tooltip
              title="Filter prospects by where they came from"
              componentsProps={{
                tooltip: {
                  sx: uniformTooltipStyles
                }
              }}
            >
              <FormControl fullWidth sx={fixedFormControlStyles}>
                <InputLabel sx={fixedInputLabelStyles}>Source</InputLabel>
                <Select
                  value={sourceFilter}
                  label="Source"
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <MenuItem value="All">All Sources</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Craigslist">Craigslist</MenuItem>
                  <MenuItem value="Zillow">Zillow</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Walk-in">Walk-in</MenuItem>
                  <MenuItem value="Phone">Phone</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Prospects Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prospect Details</TableCell>
                <TableCell>Contact Info</TableCell>
                <TableCell>Status & Source</TableCell>
                <TableCell>Financial Info</TableCell>
                <TableCell>Interested Property</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProspects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: "primary.light" }}>
                          {prospect.firstName[0]}{prospect.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight="medium"
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => handleViewProspectDetail(prospect.id)}
                          >
                            {prospect.firstName} {prospect.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Added: {new Date(prospect.dateAdded).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                      {prospect.pets && (
                        <Chip label="Has Pets" size="small" color="info" variant="outlined" />
                      )}
                      {prospect.newsletterOptIn && (
                        <Chip label="Newsletter" size="small" color="success" variant="outlined" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EmailRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2">{prospect.email}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2">{prospect.phone}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        {prospect.communicationPreferences.email && (
                          <Chip label="Email" size="small" variant="outlined" />
                        )}
                        {prospect.communicationPreferences.sms && (
                          <Chip label="SMS" size="small" variant="outlined" />
                        )}
                        {prospect.communicationPreferences.phone && (
                          <Chip label="Phone" size="small" variant="outlined" />
                        )}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: formElementWidths.large }}>
                    <Stack spacing={layoutSpacing.compact} sx={{ maxWidth: formElementWidths.large }}>
                      <Tooltip
                        title={`Prospect status: ${prospect.status}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <Chip
                          label={prospect.status}
                          color={getStatusColor(prospect.status)}
                          size="small"
                          sx={{ maxWidth: 'fit-content' }}
                        />
                      </Tooltip>

                      <Tooltip
                        title={`Lead source: ${prospect.source}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: formElementWidths.medium
                          }}
                        >
                          from {prospect.source}
                        </Typography>
                      </Tooltip>

                      {prospect.lastContact && (
                        <Tooltip
                          title={`Last contacted on ${new Date(prospect.lastContact).toLocaleDateString()}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.65rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: formElementWidths.medium
                            }}
                          >
                            Last: {new Date(prospect.lastContact).toLocaleDateString()}
                          </Typography>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {prospect.monthlyIncome && (
                        <Typography variant="body2">
                          💰 ${prospect.monthlyIncome.toLocaleString()}/mo
                        </Typography>
                      )}
                      {prospect.creditScore && (
                        <Typography variant="body2">
                          📊 Credit: {prospect.creditScore}
                        </Typography>
                      )}
                      {prospect.budget && (
                        <Typography variant="body2" color="text.secondary">
                          Budget: ${prospect.budget.min} - ${prospect.budget.max}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {prospect.interestedProperty ? (
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight="medium">
                          🏠 {(() => {
                            const property = properties.find(p => p.id === prospect.interestedProperty);
                            return property ? property.name : prospect.interestedProperty;
                          })()}
                        </Typography>
                        {prospect.moveInDate && (
                          <Typography variant="caption" color="text.secondary">
                            Move-in: {new Date(prospect.moveInDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No specific property
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Rating value={prospect.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={layoutSpacing.normal} sx={{ minWidth: formElementWidths.large }}>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        <Tooltip
                          title={`Edit ${prospect.firstName} ${prospect.lastName}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEditProspect(prospect)}
                            sx={{
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                            }}
                          >
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={`View details for ${prospect.firstName} ${prospect.lastName}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleViewProspectDetail(prospect.id)}
                            sx={{
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'info.light', color: 'info.main' }
                            }}
                          >
                            <VisibilityRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <FormControl
                        size="small"
                        sx={{
                          minWidth: formElementWidths.medium,
                          ...fixedFormControlStyles
                        }}
                      >
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={prospect.status}
                          label="Status"
                          onChange={(e) => handleUpdateStatus(prospect.id, e.target.value as Prospect["status"])}
                        >
                          <MenuItem value="New">New</MenuItem>
                          <MenuItem value="Contacted">Contacted</MenuItem>
                          <MenuItem value="Viewed">Viewed</MenuItem>
                          <MenuItem value="Applied">Applied</MenuItem>
                          <MenuItem value="Approved">Approved</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                          <MenuItem value="Archived">Archived</MenuItem>
                        </Select>
                      </FormControl>

                      <Tooltip
                        title="Add this prospect to a property waiting list"
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAddToWaitingList(prospect)}
                          sx={{
                            minWidth: formElementWidths.large,
                            whiteSpace: 'nowrap',
                            fontSize: '0.75rem'
                          }}
                        >
                          Add to Waiting List
                        </Button>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Waiting List Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <GroupRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Total Waiting
                    </Typography>
                    <Typography variant="h4">{totalWaitingList}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "error.main" }}>
                    <PriorityHighRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      High Priority
                    </Typography>
                    <Typography variant="h4">{highPriorityWaiting}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prospect</TableCell>
                <TableCell>Property Interest</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Date Added</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waitingList.map((entry) => {
                const prospect = prospects.find(p => p.id === entry.prospectId);
                if (!prospect) return null;
                
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: "primary.light" }}>
                          {prospect.firstName[0]}{prospect.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {prospect.firstName} {prospect.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {prospect.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        🏠 {entry.propertyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.priority}
                        color={getPriorityColor(entry.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(entry.dateAdded).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {entry.notes || "No notes"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Tooltip
                          title={`Notify ${prospect.firstName} ${prospect.lastName} about available properties`}
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
                            onClick={() => handleNotifyProspect(prospect)}
                            sx={{ minWidth: formElementWidths.small }}
                          >
                            Notify
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title={`Remove ${prospect.firstName} ${prospect.lastName} from waiting list`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFromWaitingList(entry.id)}
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Newsletter Tab */}
      <TabPanel value={currentTab} index={2}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Newsletter Subscribers
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <NewsletterRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Subscribers
                    </Typography>
                    <Typography variant="h4">{newsletterSubscribers}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subscriber</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscribed Date</TableCell>
                <TableCell>Communication Preferences</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prospects
                .filter(p => p.newsletterOptIn)
                .map((prospect) => (
                  <TableRow key={prospect.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: "primary.light" }}>
                          {prospect.firstName[0]}{prospect.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {prospect.firstName} {prospect.lastName}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{prospect.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prospect.status}
                        color={getStatusColor(prospect.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(prospect.dateAdded).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {prospect.communicationPreferences.email && (
                          <Chip label="Email" size="small" variant="outlined" color="primary" />
                        )}
                        {prospect.communicationPreferences.sms && (
                          <Chip label="SMS" size="small" variant="outlined" color="success" />
                        )}
                        {prospect.communicationPreferences.phone && (
                          <Chip label="Phone" size="small" variant="outlined" color="info" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Tooltip
                          title={`Send email to ${prospect.firstName} ${prospect.lastName}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EmailRoundedIcon />}
                            onClick={() => alert(`Send email to ${prospect.firstName}`)}
                            sx={{ minWidth: formElementWidths.small }}
                          >
                            Email
                          </Button>
                        </Tooltip>
                        <Tooltip
                          title={`Remove ${prospect.firstName} ${prospect.lastName} from newsletter`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setProspects(prev => prev.map(p =>
                                p.id === prospect.id
                                  ? { ...p, newsletterOptIn: false }
                                  : p
                              ));
                            }}
                            sx={{ minWidth: formElementWidths.medium }}
                          >
                            Unsubscribe
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={currentTab} index={3}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Prospect Analytics
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Prospects by Status
                </Typography>
                <Stack spacing={2}>
                  {["New", "Contacted", "Viewed", "Applied", "Approved", "Rejected"].map((status) => {
                    const count = prospects.filter(p => p.status === status).length;
                    const percentage = totalProspects > 0 ? (count / totalProspects) * 100 : 0;
                    
                    return (
                      <Box key={status}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{status}</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {count} ({percentage.toFixed(1)}%)
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: 'primary.main',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Lead Sources
                </Typography>
                <Stack spacing={2}>
                  {["Website", "Zillow", "Craigslist", "Referral", "Walk-in", "Phone", "Social Media", "Other"].map((source) => {
                    const count = prospects.filter(p => p.source === source).length;
                    const percentage = totalProspects > 0 ? (count / totalProspects) * 100 : 0;
                    
                    return (
                      <Box key={source}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{source}</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {count} ({percentage.toFixed(1)}%)
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: 'success.main',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add/Edit Prospect Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProspect ? "Edit Prospect" : "Add New Prospect"}
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Stack spacing={layoutSpacing.comfortable} sx={{ mt: layoutSpacing.normal, minWidth: formElementWidths.extraLarge }}>
            <Grid container spacing={layoutSpacing.normal}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  sx={fixedFormControlStyles}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  sx={fixedFormControlStyles}
                  required
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={layoutSpacing.normal}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={fixedFormControlStyles}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  sx={fixedFormControlStyles}
                  placeholder="(555) 123-4567"
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={layoutSpacing.normal}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={fixedFormControlStyles}>
                  <InputLabel sx={fixedInputLabelStyles}>Source</InputLabel>
                  <Select
                    value={formData.source}
                    label="Source"
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as Prospect["source"] })}
                  >
                    <MenuItem value="Website">Website</MenuItem>
                    <MenuItem value="Craigslist">Craigslist</MenuItem>
                    <MenuItem value="Zillow">Zillow</MenuItem>
                    <MenuItem value="Referral">Referral</MenuItem>
                    <MenuItem value="Walk-in">Walk-in</MenuItem>
                    <MenuItem value="Phone">Phone</MenuItem>
                    <MenuItem value="Social Media">Social Media</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={fixedFormControlStyles}>
                  <InputLabel sx={fixedInputLabelStyles}>Interested Property</InputLabel>
                  <Select
                    value={formData.interestedPropertyId}
                    label="Interested Property"
                    onChange={(e) => setFormData({ ...formData, interestedPropertyId: e.target.value })}
                  >
                    <MenuItem value="">
                      <em>No specific property</em>
                    </MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - ${property.monthlyRent.toLocaleString()}/mo
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={layoutSpacing.normal}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Credit Score"
                  type="number"
                  fullWidth
                  value={formData.creditScore}
                  onChange={(e) => setFormData({ ...formData, creditScore: Number(e.target.value) })}
                  sx={fixedFormControlStyles}
                  inputProps={{ min: 300, max: 850 }}
                  placeholder="300-850"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Monthly Income"
                  type="number"
                  fullWidth
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                  sx={{
                    ...fixedFormControlStyles,
                    '& .MuiInputLabel-root': {
                      ...fixedFormControlStyles['& .MuiInputLabel-root'],
                      transform: 'translate(34px, 6px) scale(0.75)',
                      '&.Mui-focused, &.MuiFormLabel-filled, &.MuiInputLabel-shrink': {
                        transform: 'translate(34px, -9px) scale(0.75)',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  placeholder="0"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Move-in Date"
                  type="date"
                  fullWidth
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  sx={fixedFormControlStyles}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={layoutSpacing.normal}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Budget Min"
                  type="number"
                  fullWidth
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                  sx={{
                    ...fixedFormControlStyles,
                    '& .MuiInputLabel-root': {
                      ...fixedFormControlStyles['& .MuiInputLabel-root'],
                      transform: 'translate(34px, 6px) scale(0.75)',
                      '&.Mui-focused, &.MuiFormLabel-filled, &.MuiInputLabel-shrink': {
                        transform: 'translate(34px, -9px) scale(0.75)',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  placeholder="0"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Budget Max"
                  type="number"
                  fullWidth
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                  sx={{
                    ...fixedFormControlStyles,
                    '& .MuiInputLabel-root': {
                      ...fixedFormControlStyles['& .MuiInputLabel-root'],
                      transform: 'translate(34px, 6px) scale(0.75)',
                      '&.Mui-focused, &.MuiFormLabel-filled, &.MuiInputLabel-shrink': {
                        transform: 'translate(34px, -9px) scale(0.75)',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  placeholder="0"
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Employment"
              fullWidth
              value={formData.employment}
              onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
              sx={fixedFormControlStyles}
              placeholder="e.g., Software Engineer at Tech Corp"
            />

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              sx={{
                ...fixedFormControlStyles,
                '& .MuiInputLabel-root': {
                  ...fixedFormControlStyles['& .MuiInputLabel-root'],
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -9px) scale(0.75)',
                  },
                },
              }}
              placeholder="Additional notes about the prospect..."
            />
            
            <Stack spacing={2}>
              <Typography variant="h6">Preferences</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.pets}
                    onChange={(e) => setFormData({ ...formData, pets: e.target.checked })}
                  />
                }
                label="Has Pets"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.newsletterOptIn}
                    onChange={(e) => setFormData({ ...formData, newsletterOptIn: e.target.checked })}
                  />
                }
                label="Subscribe to Newsletter"
              />
              
              <Typography variant="subtitle2">Communication Preferences</Typography>
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.emailPref}
                      onChange={(e) => setFormData({ ...formData, emailPref: e.target.checked })}
                    />
                  }
                  label="Email"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.smsPref}
                      onChange={(e) => setFormData({ ...formData, smsPref: e.target.checked })}
                    />
                  }
                  label="SMS"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.phonePref}
                      onChange={(e) => setFormData({ ...formData, phonePref: e.target.checked })}
                    />
                  }
                  label="Phone"
                />
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProspect}>
            {selectedProspect ? "Update" : "Add"} Prospect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add to Waiting List Dialog */}
      <Dialog open={openWaitingListDialog} onClose={() => setOpenWaitingListDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Waiting List</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={waitingListForm.propertyId}
                label="Property"
                onChange={(e) => setWaitingListForm({ ...waitingListForm, propertyId: e.target.value })}
              >
                <MenuItem value="">
                  <em>Select a property</em>
                </MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name} - ${property.monthlyRent.toLocaleString()}/mo ({property.status})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={waitingListForm.priority}
                label="Priority"
                onChange={(e) => setWaitingListForm({ ...waitingListForm, priority: e.target.value as WaitingListEntry["priority"] })}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={waitingListForm.notes}
              onChange={(e) => setWaitingListForm({ ...waitingListForm, notes: e.target.value })}
              placeholder="Any specific requirements or notes..."
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={waitingListForm.notifyWhenAvailable}
                  onChange={(e) => setWaitingListForm({ ...waitingListForm, notifyWhenAvailable: e.target.checked })}
                />
              }
              label="Notify when property becomes available"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWaitingListDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveWaitingList}>
            Add to Waiting List
          </Button>
        </DialogActions>
      </Dialog>

      {/* Communication Dialog */}
      <CommunicationDialog
        open={communicationDialogOpen}
        onClose={() => {
          setCommunicationDialogOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        defaultMessage="Hi! We have great news - a property matching your criteria has become available. Would you be interested in scheduling a viewing?"
        title="Notify About Property Availability"
      />
    </Box>
  );
}
