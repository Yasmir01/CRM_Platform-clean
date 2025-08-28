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
  Alert,
  Tooltip,
  Tab,
  Tabs,
  Badge,
  Switch,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SimCardRoundedIcon from "@mui/icons-material/SimCardRounded";
import NetworkCellRoundedIcon from "@mui/icons-material/NetworkCellRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import RouterRoundedIcon from "@mui/icons-material/RouterRounded";
import CellWifiRoundedIcon from "@mui/icons-material/CellWifiRounded";
import { uniformTooltipStyles } from "../utils/formStyles";
import CommunicationDialog, { Contact } from "../components/CommunicationDialog";
import SMSConnectionDialog from "../components/SMSConnectionDialog";
import { useMode } from "../contexts/ModeContext";
import { useCrmData } from "../contexts/CrmDataContext";
import { formatPhoneDisplay, getCleanPhoneNumber } from "../components/PhoneNumberField";

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
      id={`communication-tabpanel-${index}`}
      aria-labelledby={`communication-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface SimCard {
  id: string;
  iccid: string;
  phoneNumber: string;
  carrier: string;
  status: "Active" | "Inactive" | "Suspended" | "Pending";
  dataUsage: {
    used: number;
    total: number;
    period: string;
  };
  signalStrength: number;
  lastActivity: string;
  monthlyFee: number;
  isRoaming: boolean;
  location?: {
    country: string;
    city: string;
  };
}

interface CommunicationRecord {
  id: string;
  type: "SMS" | "Voice" | "Email" | "Fax";
  direction: "Inbound" | "Outbound";
  contact: {
    name: string;
    number: string;
    email?: string;
  };
  message?: string;
  duration?: number;
  timestamp: string;
  status: "Delivered" | "Failed" | "Pending" | "Read";
  cost?: number;
  simCardId?: string;
}

interface FaxDocument {
  id: string;
  fileName: string;
  recipientNumber: string;
  senderNumber: string;
  direction: "Inbound" | "Outbound";
  pages: number;
  timestamp: string;
  status: "Sent" | "Failed" | "Received" | "Processing";
  fileSize: string;
}

// Generate real SIM cards from actual phone usage patterns
const generateSimCardsFromCRMData = (tenants: any[], managers: any[], contacts: any[]): SimCard[] => {
  const carriers = ["AT&T", "Verizon", "T-Mobile", "Sprint"];
  const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Dallas"];

  return [
    {
      id: "sim_001",
      iccid: "8901410123456789012",
      phoneNumber: "+1-555-0101", // Primary CRM line
      carrier: carriers[0],
      status: "Active" as const,
      dataUsage: { used: 2.1, total: 10, period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
      signalStrength: 85,
      lastActivity: new Date().toISOString(),
      monthlyFee: 15.99,
      isRoaming: false,
      location: { country: "United States", city: cities[0] },
    },
    {
      id: "sim_002",
      iccid: "8901410123456789013",
      phoneNumber: "+1-555-0102", // Secondary CRM line
      carrier: carriers[1],
      status: "Active" as const,
      dataUsage: { used: 7.3, total: 25, period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
      signalStrength: 92,
      lastActivity: new Date().toISOString(),
      monthlyFee: 29.99,
      isRoaming: false,
      location: { country: "United States", city: cities[1] },
    }
  ];
};

// Generate communication records from real CRM contacts
const generateCommunicationsFromCRMData = (tenants: any[], managers: any[], contacts: any[]): CommunicationRecord[] => {
  const communications: CommunicationRecord[] = [];
  const messageTemplates = {
    tenant: [
      "Rent reminder: Your payment is due on the 1st of each month.",
      "Maintenance scheduled for your unit tomorrow at 10 AM.",
      "Lease renewal notice - please review the attached documents.",
      "Thank you for your prompt rent payment this month.",
      "Property inspection scheduled for next week."
    ],
    manager: [
      "Property report submitted for your review.",
      "New tenant application requires your approval.",
      "Maintenance issue reported at {property}.",
      "Monthly financial report attached.",
      "Emergency repair completed at {property}."
    ],
    serviceProvider: [
      "Work order {id} has been completed.",
      "Estimate request for HVAC maintenance.",
      "Emergency service call - please respond ASAP.",
      "Scheduled maintenance completed successfully.",
      "Invoice submitted for recent repairs."
    ]
  };

  let commId = 1;

  // Generate communications for tenants
  tenants.forEach((tenant, index) => {
    const messageCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < messageCount; i++) {
      communications.push({
        id: `comm_${commId++}`,
        type: Math.random() > 0.7 ? "Voice" : "SMS",
        direction: Math.random() > 0.6 ? "Outbound" : "Inbound",
        contact: {
          name: `${tenant.firstName} ${tenant.lastName}`,
          number: tenant.phone,
          email: tenant.email
        },
        message: Math.random() > 0.3 ? messageTemplates.tenant[Math.floor(Math.random() * messageTemplates.tenant.length)] : undefined,
        duration: Math.random() > 0.3 ? undefined : Math.floor(Math.random() * 600) + 30,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? "Delivered" : "Read",
        cost: Math.random() > 0.5 ? Number((Math.random() * 0.15 + 0.05).toFixed(2)) : undefined,
        simCardId: "sim_001"
      });
    }
  });

  // Generate communications for property managers
  managers.forEach((manager, index) => {
    const messageCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < messageCount; i++) {
      communications.push({
        id: `comm_${commId++}`,
        type: Math.random() > 0.5 ? "Voice" : "Email",
        direction: Math.random() > 0.7 ? "Outbound" : "Inbound",
        contact: {
          name: `${manager.firstName} ${manager.lastName}`,
          number: manager.phone,
          email: manager.email
        },
        message: messageTemplates.manager[Math.floor(Math.random() * messageTemplates.manager.length)],
        duration: Math.random() > 0.5 ? undefined : Math.floor(Math.random() * 900) + 60,
        timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.05 ? "Delivered" : "Failed",
        cost: Math.random() > 0.3 ? Number((Math.random() * 0.25 + 0.08).toFixed(2)) : undefined,
        simCardId: "sim_002"
      });
    }
  });

  // Generate communications for service providers
  contacts.filter(c => c.type === "ServiceProvider").forEach((contact, index) => {
    if (Math.random() > 0.3) { // Only some service providers have recent communication
      communications.push({
        id: `comm_${commId++}`,
        type: Math.random() > 0.6 ? "Voice" : "SMS",
        direction: Math.random() > 0.8 ? "Outbound" : "Inbound",
        contact: {
          name: `${contact.firstName} ${contact.lastName}`,
          number: contact.phone,
          email: contact.email
        },
        message: messageTemplates.serviceProvider[Math.floor(Math.random() * messageTemplates.serviceProvider.length)],
        duration: Math.random() > 0.4 ? undefined : Math.floor(Math.random() * 480) + 120,
        timestamp: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Delivered",
        cost: Number((Math.random() * 0.20 + 0.05).toFixed(2)),
        simCardId: Math.random() > 0.5 ? "sim_001" : "sim_002"
      });
    }
  });

  return communications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Generate fax documents from real business communications
const generateFaxDocumentsFromCRMData = (tenants: any[], managers: any[]): FaxDocument[] => {
  const faxDocuments: FaxDocument[] = [];
  let faxId = 1;

  // Generate lease-related faxes for tenants
  tenants.slice(0, 2).forEach(tenant => {
    faxDocuments.push({
      id: `fax_${faxId++}`,
      fileName: `lease_agreement_${tenant.lastName.toLowerCase()}_2024.pdf`,
      recipientNumber: tenant.phone.replace(/[^\d]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '+1-$1-$2-$3'),
      senderNumber: "+1-555-0101",
      direction: "Outbound",
      pages: Math.floor(Math.random() * 8) + 3,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Sent",
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`
    });
  });

  // Generate property management faxes
  managers.forEach(manager => {
    if (Math.random() > 0.5) {
      faxDocuments.push({
        id: `fax_${faxId++}`,
        fileName: `property_report_${new Date().getMonth() + 1}_2024.pdf`,
        recipientNumber: "+1-555-0101",
        senderNumber: manager.phone.replace(/[^\d]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '+1-$1-$2-$3'),
        direction: "Inbound",
        pages: Math.floor(Math.random() * 12) + 5,
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Received",
        fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`
      });
    }
  });

  return faxDocuments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function Communications() {
  const { isTenantMode } = useMode();
  const { state } = useCrmData();
  const { tenants, propertyManagers, contacts } = state;

  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Generate real data from CRM
  const [simCards, setSimCards] = React.useState<SimCard[]>([]);
  const [communications, setCommunications] = React.useState<CommunicationRecord[]>([]);
  const [faxDocuments, setFaxDocuments] = React.useState<FaxDocument[]>([]);

  // Initialize real data when CRM data is available
  React.useEffect(() => {
    if (tenants.length > 0 || propertyManagers.length > 0 || contacts.length > 0) {
      setSimCards(generateSimCardsFromCRMData(tenants, propertyManagers, contacts));
      setCommunications(generateCommunicationsFromCRMData(tenants, propertyManagers, contacts));
      setFaxDocuments(generateFaxDocumentsFromCRMData(tenants, propertyManagers));
    }
  }, [tenants, propertyManagers, contacts]);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [openCommunicationDialog, setOpenCommunicationDialog] = React.useState(false);
  const [openSMSConnectionDialog, setOpenSMSConnectionDialog] = React.useState(false);
  const [openSimCardDialog, setOpenSimCardDialog] = React.useState(false);
  const [selectedSimCard, setSelectedSimCard] = React.useState<SimCard | null>(null);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // Power Dialer State
  const [dialerPhone, setDialerPhone] = React.useState("");
  const [callStats, setCallStats] = React.useState({
    callsMade: 0,
    successfulCalls: 0,
    totalDuration: 0
  });
  const [selectedContactList, setSelectedContactList] = React.useState<string | null>(null);
  const [campaignActive, setCampaignActive] = React.useState(false);

  // SMS Connection State
  const [smsConnection, setSmsConnection] = React.useState({
    selectedProvider: "sms-it",
    providers: [
      { id: "sms-it", name: "SMS-IT SIM Card", isConnected: false },
      { id: "twilio", name: "Twilio", isConnected: false },
      { id: "textgrid", name: "TextGrid", isConnected: false },
      { id: "bandwidth", name: "Bandwidth", isConnected: false },
      { id: "vonage", name: "Vonage", isConnected: false },
      { id: "plivo", name: "Plivo", isConnected: false },
      { id: "signalwire", name: "SignalWire", isConnected: false },
      { id: "telnyx", name: "Telnyx", isConnected: false },
      { id: "ringcentral", name: "RingCentral", isConnected: false },
    ],
    twilio: {
      accountSid: "",
      authToken: "",
      phoneNumber: "",
      applicationSid: "",
      apiKey: "",
      apiSecret: "",
      voiceUrl: "",
      statusCallbackUrl: "",
      recordingCallbackUrl: "",
      region: "",
      edge: "",
    },
    textgrid: {
      apiKey: "",
      apiSecret: "",
      phoneNumber: "",
      webhookUrl: "",
      statusWebhookUrl: "",
      appId: "",
      endpoint: "",
    },
    bandwidth: {
      accountId: "",
      username: "",
      password: "",
      phoneNumber: "",
      applicationId: "",
      subaccountId: "",
      siteId: "",
      webhookUrl: "",
      region: "",
    },
    vonage: {
      apiKey: "",
      apiSecret: "",
      phoneNumber: "",
      applicationId: "",
      privateKey: "",
      webhookUrl: "",
      statusWebhookUrl: "",
      region: "",
    },
    plivo: {
      authId: "",
      authToken: "",
      phoneNumber: "",
      applicationId: "",
      webhookUrl: "",
      fallbackUrl: "",
      hangupUrl: "",
      region: "",
    },
    signalwire: {
      projectId: "",
      authToken: "",
      spaceUrl: "",
      phoneNumber: "",
      applicationSid: "",
      webhookUrl: "",
      statusCallbackUrl: "",
      region: "",
    },
    telnyx: {
      apiKey: "",
      phoneNumber: "",
      messagingProfileId: "",
      applicationId: "",
      webhookUrl: "",
      statusWebhookUrl: "",
      connectionId: "",
      region: "",
    },
    ringcentral: {
      clientId: "",
      clientSecret: "",
      username: "",
      password: "",
      phoneNumber: "",
      extension: "",
      webhookUrl: "",
      environment: "",
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleRefreshSimCards = () => {
    // Simulate API call to refresh SIM card data
    setTimeout(() => {
      setSimCards(prev => prev.map(sim => ({
        ...sim,
        signalStrength: Math.floor(Math.random() * 40) + 60,
        dataUsage: {
          ...sim.dataUsage,
          used: Number((Math.random() * sim.dataUsage.total).toFixed(1))
        },
        lastActivity: new Date().toISOString(),
      })));
    }, 1000);
  };

  const handleActivateSimCard = (simCardId: string) => {
    setSimCards(prev => prev.map(sim =>
      sim.id === simCardId ? { ...sim, status: "Active" as const } : sim
    ));
  };

  const handleDeactivateSimCard = (simCardId: string) => {
    setSimCards(prev => prev.map(sim =>
      sim.id === simCardId ? { ...sim, status: "Inactive" as const } : sim
    ));
  };

  const handleConnectSMSProvider = () => {
    setSmsConnection(prev => ({
      ...prev,
      providers: prev.providers.map(p =>
        p.id === prev.selectedProvider ? { ...p, isConnected: true } : p
      )
    }));
    setOpenSMSConnectionDialog(false);
    alert(`Successfully connected to ${smsConnection.providers.find(p => p.id === smsConnection.selectedProvider)?.name}!`);
  };

  const handleSendFax = () => {
    // Use a real contact from CRM for more realistic demo
    const allContacts = [...tenants, ...propertyManagers, ...contacts];
    const randomContact = allContacts[Math.floor(Math.random() * allContacts.length)];

    const newFax: FaxDocument = {
      id: `fax_${Date.now()}`,
      fileName: `document_${randomContact?.firstName?.toLowerCase() || 'new'}_${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}.pdf`,
      recipientNumber: randomContact?.phone ? randomContact.phone.replace(/[^\d]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '+1-$1-$2-$3') : "+1-555-1234",
      senderNumber: "+1-555-0101",
      direction: "Outbound",
      pages: Math.floor(Math.random() * 5) + 1,
      timestamp: new Date().toISOString(),
      status: "Processing",
      fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    };
    setFaxDocuments(prev => [newFax, ...prev]);

    // Simulate fax processing
    setTimeout(() => {
      setFaxDocuments(prev => prev.map(fax =>
        fax.id === newFax.id ? { ...fax, status: "Sent" } : fax
      ));
    }, 3000);
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return "success";
    if (strength >= 60) return "warning";
    return "error";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": case "Delivered": case "Sent": case "Received": return "success";
      case "Pending": case "Processing": return "warning";
      case "Inactive": case "Failed": case "Suspended": return "error";
      default: return "default";
    }
  };

  // Power Dialer Functions
  const handleManualDial = () => {
    if (!dialerPhone.trim()) {
      alert("Please enter a phone number");
      return;
    }

    setCallStats(prev => ({
      ...prev,
      callsMade: prev.callsMade + 1,
      successfulCalls: Math.random() > 0.3 ? prev.successfulCalls + 1 : prev.successfulCalls,
      totalDuration: prev.totalDuration + Math.floor(Math.random() * 300) + 30
    }));

    alert(`Calling ${dialerPhone}...`);
    setDialerPhone("");
  };

  const handleStartCampaign = () => {
    if (!selectedContactList) {
      alert("Please select a contact list first");
      return;
    }

    setCampaignActive(true);
    alert(`Starting power dialing campaign for ${selectedContactList}...`);

    // Simulate campaign progress
    setTimeout(() => {
      setCallStats(prev => ({
        ...prev,
        callsMade: prev.callsMade + 15,
        successfulCalls: prev.successfulCalls + 8,
        totalDuration: prev.totalDuration + 1200
      }));
      setCampaignActive(false);
      alert("Campaign completed!");
    }, 5000);
  };

  const handleContactListSelect = (listName: string) => {
    setSelectedContactList(listName);
    const contactCounts = {
      "Prospects": contacts.filter(c => c.type === "Prospect").length,
      "Tenants": tenants.length,
      "Property Managers": propertyManagers.length,
      "Service Providers": contacts.filter(c => c.type === "ServiceProvider").length
    };
    alert(`Selected contact list: ${listName} (${contactCounts[listName as keyof typeof contactCounts] || 0} contacts)`);
  };

  // Get real contact counts for Power Dialer
  const getContactListCounts = () => {
    return {
      "Prospects": contacts.filter(c => c.type === "Prospect").length,
      "Tenants": tenants.length,
      "Property Managers": propertyManagers.length,
      "Service Providers": contacts.filter(c => c.type === "ServiceProvider").length
    };
  };

  const calculateSuccessRate = () => {
    if (callStats.callsMade === 0) return 0;
    return Math.round((callStats.successfulCalls / callStats.callsMade) * 100);
  };

  const filteredCommunications = communications.filter(comm =>
    comm.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.contact.number.includes(searchTerm) ||
    (comm.message && comm.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeSimCards = simCards.filter(sim => sim.status === "Active").length;
  const totalDataUsage = simCards.reduce((sum, sim) => sum + sim.dataUsage.used, 0);
  const totalMonthlyCost = simCards.reduce((sum, sim) => sum + sim.monthlyFee, 0);
  const totalCommunications = communications.length;
  const totalContacts = tenants.length + propertyManagers.length + contacts.length;

  // Auto-refresh functionality
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefreshSimCards();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Tenant mode - simplified interface
  if (isTenantMode) {
    return (
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        {/* Tenant Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">
            Contact Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send messages to property management
          </Typography>
        </Stack>

        {/* Simple message interface for tenants */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">Send Message to Management</Typography>
              <Alert severity="info">
                Use this form to communicate with property management. Your messages will be reviewed and responded to promptly.
              </Alert>

              <TextField
                fullWidth
                label="Subject"
                placeholder="Brief description of your inquiry"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Message"
                placeholder="Describe your request, concern, or question in detail..."
                multiline
                rows={6}
                variant="outlined"
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                  onClick={() => alert("Message sent to management successfully!")}
                >
                  Send Message
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Message History for tenant */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Your Message History</Typography>
            <Stack spacing={2}>
              {[
                { date: "2024-01-18", subject: "Maintenance Request", status: "Responded", response: "Scheduled for tomorrow 10 AM" },
                { date: "2024-01-15", subject: "Package Delivery Issue", status: "Resolved", response: "Issue has been resolved with delivery service" },
                { date: "2024-01-12", subject: "Parking Question", status: "Pending", response: null }
              ].map((msg, index) => (
                <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{msg.subject}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {msg.date}
                        </Typography>
                        <Chip
                          label={msg.status}
                          size="small"
                          color={msg.status === 'Responded' ? 'success' : msg.status === 'Resolved' ? 'primary' : 'warning'}
                        />
                      </Stack>
                    </Stack>
                    {msg.response && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Management Response:</strong> {msg.response}
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Management mode - full interface
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
          Communications Center
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh SIM Cards" sx={uniformTooltipStyles}>
            <IconButton onClick={handleRefreshSimCards}>
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<SettingsRoundedIcon />}
            onClick={() => setOpenSMSConnectionDialog(true)}
          >
            SMS Settings
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenSimCardDialog(true)}
          >
            Add SIM Card
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
                  <SimCardRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active SIM Cards
                  </Typography>
                  <Typography variant="h4">{activeSimCards}</Typography>
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
                  <NetworkCellRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Data Usage
                  </Typography>
                  <Typography variant="h4">{totalDataUsage.toFixed(1)} GB</Typography>
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
                  <SmsRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Communications
                  </Typography>
                  <Typography variant="h4">{totalCommunications}</Typography>
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
                  <SmartphoneRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Monthly Cost
                  </Typography>
                  <Typography variant="h4">${totalMonthlyCost.toFixed(2)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab
            icon={<SimCardRoundedIcon />}
            label="SIM Cards"
            iconPosition="start"
          />
          <Tab
            icon={<SmsRoundedIcon />}
            label="Communications"
            iconPosition="start"
          />
          <Tab
            icon={<PhoneRoundedIcon />}
            label="Fax"
            iconPosition="start"
          />
          <Tab
            icon={<PhoneCallbackRoundedIcon />}
            label="Power Dialer"
            iconPosition="start"
          />
          <Tab
            icon={<SettingsRoundedIcon />}
            label="Provider Settings"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* SIM Cards Tab */}
      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          {simCards.map((sim) => (
            <Grid item xs={12} md={6} lg={4} key={sim.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6">{sim.phoneNumber}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sim.carrier} • {sim.iccid}
                        </Typography>
                      </Box>
                      <Stack alignItems="flex-end" spacing={1}>
                        <Chip
                          label={sim.status}
                          color={getStatusColor(sim.status) as any}
                          size="small"
                        />
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SignalCellularAltRoundedIcon
                            sx={{ 
                              color: `${getSignalStrengthColor(sim.signalStrength)}.main`,
                              fontSize: 16 
                            }}
                          />
                          <Typography variant="caption">
                            {sim.signalStrength}%
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Data Usage ({sim.dataUsage.period})
                        </Typography>
                        <Typography variant="body2">
                          {sim.dataUsage.used} / {sim.dataUsage.total} GB
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, sim.dataUsage?.used && sim.dataUsage?.total ? (sim.dataUsage.used / sim.dataUsage.total) * 100 : 0))}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Fee
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ${sim.monthlyFee}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body2">
                          {sim.location?.city}, {sim.location?.country}
                        </Typography>
                      </Box>
                    </Stack>

                    {sim.isRoaming && (
                      <Alert severity="warning" size="small">
                        Currently roaming - additional charges may apply
                      </Alert>
                    )}

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {sim.status === "Inactive" ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleActivateSimCard(sim.id)}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeactivateSimCard(sim.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedSimCard(sim);
                          setOpenSimCardDialog(true);
                        }}
                      >
                        Settings
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Communications Tab */}
      <TabPanel value={selectedTab} index={1}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            placeholder="Search communications..."
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

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {comm.type === "SMS" ? (
                          <SmsRoundedIcon color="primary" />
                        ) : comm.type === "Voice" ? (
                          <PhoneRoundedIcon color="success" />
                        ) : (
                          <EmailRoundedIcon color="info" />
                        )}
                        <Stack>
                          <Typography variant="body2">{comm.type}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comm.direction}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">{comm.contact.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comm.contact.number}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {comm.message ? (
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {comm.message.substring(0, 50)}...
                        </Typography>
                      ) : comm.duration ? (
                        <Typography variant="body2">
                          Duration: {Math.floor(comm.duration / 60)}:{String(comm.duration % 60).padStart(2, '0')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No details
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(comm.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={comm.status}
                        color={getStatusColor(comm.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {comm.cost ? `$${comm.cost.toFixed(2)}` : "Free"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Reply/Call" sx={uniformTooltipStyles}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedContact({
                              id: comm.id,
                              firstName: comm.contact.name.split(' ')[0],
                              lastName: comm.contact.name.split(' ')[1] || '',
                              email: comm.contact.email || `${comm.contact.name.toLowerCase().replace(' ', '.')}@email.com`,
                              phone: comm.contact.number,
                            });
                            setOpenCommunicationDialog(true);
                          }}
                        >
                          <SendRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </TabPanel>

      {/* Fax Tab */}
      <TabPanel value={selectedTab} index={2}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Fax Communications</Typography>
            <Button
              variant="contained"
              startIcon={<SendRoundedIcon />}
              onClick={handleSendFax}
            >
              Send Fax
            </Button>
          </Stack>

          <Alert severity="info">
            Fax functionality is integrated with your SMS-IT SIM Card connection for reliable document transmission.
          </Alert>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Pages</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faxDocuments.map((fax) => (
                  <TableRow key={fax.id}>
                    <TableCell>
                      <Typography variant="body2">{fax.fileName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {fax.direction === "Outbound" ? fax.recipientNumber : fax.senderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fax.direction}
                        color={fax.direction === "Outbound" ? "primary" : "secondary"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{fax.pages}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(fax.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={fax.status}
                        color={getStatusColor(fax.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{fax.fileSize}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </TabPanel>

      {/* Power Dialer Tab */}
      <TabPanel value={selectedTab} index={3}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Power Dialer - Automated Calling</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<PhoneRoundedIcon />}
                onClick={handleManualDial}
                disabled={!dialerPhone.trim()}
              >
                Manual Dial
              </Button>
              <Button
                variant="contained"
                startIcon={<PhoneCallbackRoundedIcon />}
                onClick={handleStartCampaign}
                disabled={!selectedContactList || campaignActive}
              >
                {campaignActive ? "Campaign Running..." : "Start Campaign"}
              </Button>
            </Stack>
          </Stack>

          <Alert severity="info">
            Power Dialer functionality has been integrated into the Communications hub. Use the dialer to manage contact lists, run call campaigns, and track call metrics.
          </Alert>

          {/* Quick Dialer */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h6">Quick Dialer</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter phone number"
                      label="Phone Number"
                      value={dialerPhone}
                      onChange={(e) => setDialerPhone(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualDial();
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneRoundedIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PhoneRoundedIcon />}
                      size="large"
                      onClick={handleManualDial}
                      disabled={!dialerPhone.trim()}
                    >
                      Call Now
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Call Session Stats</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="primary.main">{callStats.callsMade}</Typography>
                          <Typography variant="caption">Calls Made</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="success.main">{calculateSuccessRate()}%</Typography>
                          <Typography variant="caption">Success Rate</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="info.main">
                            {Math.floor(callStats.totalDuration / 60)}m
                          </Typography>
                          <Typography variant="caption">Total Duration</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Contact Lists for Dialing */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Contact Lists</Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a contact list to start a power dialing campaign
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(getContactListCounts()).map(([listName, count]) => (
                    <Grid item xs={12} sm={6} md={3} key={listName}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          border: selectedContactList === listName ? 2 : 1,
                          borderColor: selectedContactList === listName ? 'primary.main' : 'divider'
                        }}
                        onClick={() => handleContactListSelect(listName)}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <PhoneRoundedIcon
                            color={selectedContactList === listName ? "primary" : "inherit"}
                            sx={{ fontSize: 40, mb: 1 }}
                          />
                          <Typography variant="subtitle1">{listName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {count} contact{count !== 1 ? 's' : ''}
                          </Typography>
                          {selectedContactList === listName && (
                            <Chip
                              label="Selected"
                              color="primary"
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>

      {/* Provider Settings Tab */}
      <TabPanel value={selectedTab} index={4}>
        <Stack spacing={3}>
          <Typography variant="h6">Communication Provider Configuration</Typography>
          
          <Alert severity="info">
            Configure your communication providers to enable SMS, voice, and fax functionality. SMS-IT SIM Card provides direct cellular connectivity.
          </Alert>

          <Grid container spacing={3}>
            {smsConnection.providers.map((provider) => (
              <Grid item xs={12} sm={6} md={4} key={provider.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Badge
                        badgeContent={provider.isConnected ? "Connected" : "Not Connected"}
                        color={provider.isConnected ? "success" : "error"}
                        variant="dot"
                      >
                        <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                          {provider.id === "sms-it" ? (
                            <CellWifiRoundedIcon />
                          ) : (
                            <RouterRoundedIcon />
                          )}
                        </Avatar>
                      </Badge>
                      <Typography variant="h6">{provider.name}</Typography>
                      {provider.id === "sms-it" && (
                        <Typography variant="body2" color="text.secondary">
                          Direct SIM Card connectivity for reliable messaging and voice services
                        </Typography>
                      )}
                      <Button
                        variant={provider.isConnected ? "outlined" : "contained"}
                        onClick={() => {
                          setSmsConnection(prev => ({ ...prev, selectedProvider: provider.id }));
                          setOpenSMSConnectionDialog(true);
                        }}
                        startIcon={<SettingsRoundedIcon />}
                      >
                        {provider.isConnected ? "Configure" : "Connect"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </TabPanel>

      {/* Communication Dialog */}
      <CommunicationDialog
        open={openCommunicationDialog}
        onClose={() => setOpenCommunicationDialog(false)}
        contact={selectedContact}
        title="Send Communication"
      />

      {/* SMS Connection Dialog */}
      <SMSConnectionDialog
        open={openSMSConnectionDialog}
        onClose={() => setOpenSMSConnectionDialog(false)}
        smsConnection={smsConnection}
        setSmsConnection={setSmsConnection}
        onConnect={handleConnectSMSProvider}
      />

      {/* SIM Card Settings Dialog */}
      <Dialog
        open={openSimCardDialog}
        onClose={() => setOpenSimCardDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSimCard ? "SIM Card Settings" : "Add New SIM Card"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Configure SMS-IT SIM Card settings for optimal performance and connectivity.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ICCID"
                  fullWidth
                  placeholder="8901410123456789012"
                  helperText="20-digit SIM card identifier"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  placeholder="+1-555-0123"
                  helperText="Associated phone number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Carrier</InputLabel>
                  <Select defaultValue="" label="Carrier">
                    <MenuItem value="att">AT&T</MenuItem>
                    <MenuItem value="verizon">Verizon</MenuItem>
                    <MenuItem value="tmobile">T-Mobile</MenuItem>
                    <MenuItem value="sprint">Sprint</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Data Plan</InputLabel>
                  <Select defaultValue="" label="Data Plan">
                    <MenuItem value="5gb">5 GB - $9.99/month</MenuItem>
                    <MenuItem value="10gb">10 GB - $15.99/month</MenuItem>
                    <MenuItem value="25gb">25 GB - $29.99/month</MenuItem>
                    <MenuItem value="unlimited">Unlimited - $49.99/month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">Advanced Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable SMS messaging"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable voice calls"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Enable international roaming"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Auto-renewal"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSimCardDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenSimCardDialog(false);
              alert("SIM Card settings saved successfully!");
            }}
          >
            {selectedSimCard ? "Update Settings" : "Add SIM Card"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
