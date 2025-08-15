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

const mockSimCards: SimCard[] = [
  {
    id: "sim_001",
    iccid: "8901410123456789012",
    phoneNumber: "+1-555-0101",
    carrier: "AT&T",
    status: "Active",
    dataUsage: { used: 2.1, total: 10, period: "Nov 2024" },
    signalStrength: 85,
    lastActivity: "2024-01-18T14:32:00Z",
    monthlyFee: 15.99,
    isRoaming: false,
    location: { country: "United States", city: "New York" },
  },
  {
    id: "sim_002",
    iccid: "8901410123456789013",
    phoneNumber: "+1-555-0102",
    carrier: "Verizon",
    status: "Active",
    dataUsage: { used: 7.3, total: 25, period: "Nov 2024" },
    signalStrength: 92,
    lastActivity: "2024-01-18T15:45:00Z",
    monthlyFee: 29.99,
    isRoaming: false,
    location: { country: "United States", city: "Los Angeles" },
  },
  {
    id: "sim_003",
    iccid: "8901410123456789014",
    phoneNumber: "+1-555-0103",
    carrier: "T-Mobile",
    status: "Inactive",
    dataUsage: { used: 0, total: 5, period: "Nov 2024" },
    signalStrength: 0,
    lastActivity: "2024-01-15T09:12:00Z",
    monthlyFee: 9.99,
    isRoaming: false,
    location: { country: "United States", city: "Chicago" },
  },
];

const mockCommunications: CommunicationRecord[] = [
  {
    id: "comm_001",
    type: "SMS",
    direction: "Outbound",
    contact: { name: "John Smith", number: "+1-555-1234" },
    message: "Your property viewing is scheduled for tomorrow at 2 PM. Please confirm your attendance.",
    timestamp: "2024-01-18T14:30:00Z",
    status: "Delivered",
    cost: 0.05,
    simCardId: "sim_001",
  },
  {
    id: "comm_002",
    type: "Voice",
    direction: "Inbound",
    contact: { name: "Sarah Johnson", number: "+1-555-5678" },
    duration: 312,
    timestamp: "2024-01-18T13:15:00Z",
    status: "Delivered",
    cost: 0.12,
    simCardId: "sim_002",
  },
  {
    id: "comm_003",
    type: "Email",
    direction: "Outbound",
    contact: { name: "Mike Davis", number: "+1-555-9012", email: "mike.davis@email.com" },
    message: "Property lease agreement attached for your review.",
    timestamp: "2024-01-18T12:45:00Z",
    status: "Read",
  },
];

const mockFaxDocuments: FaxDocument[] = [
  {
    id: "fax_001",
    fileName: "lease_agreement_2024.pdf",
    recipientNumber: "+1-555-1111",
    senderNumber: "+1-555-0101",
    direction: "Outbound",
    pages: 5,
    timestamp: "2024-01-18T11:30:00Z",
    status: "Sent",
    fileSize: "2.3 MB",
  },
  {
    id: "fax_002",
    fileName: "maintenance_request.pdf",
    recipientNumber: "+1-555-0101",
    senderNumber: "+1-555-2222",
    direction: "Inbound",
    pages: 2,
    timestamp: "2024-01-18T10:15:00Z",
    status: "Received",
    fileSize: "1.1 MB",
  },
];

export default function Communications() {
  const { isTenantMode } = useMode();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [simCards, setSimCards] = React.useState<SimCard[]>(mockSimCards);
  const [communications, setCommunications] = React.useState<CommunicationRecord[]>(mockCommunications);
  const [faxDocuments, setFaxDocuments] = React.useState<FaxDocument[]>(mockFaxDocuments);
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
    const newFax: FaxDocument = {
      id: `fax_${Date.now()}`,
      fileName: "new_document.pdf",
      recipientNumber: "+1-555-1234",
      senderNumber: "+1-555-0101",
      direction: "Outbound",
      pages: 1,
      timestamp: new Date().toISOString(),
      status: "Processing",
      fileSize: "1.5 MB",
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
    alert(`Selected contact list: ${listName}`);
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
                  {["Prospects", "Tenants", "Property Managers", "Service Providers"].map((listName) => (
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
                            {Math.floor(Math.random() * 50) + 10} contacts
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
