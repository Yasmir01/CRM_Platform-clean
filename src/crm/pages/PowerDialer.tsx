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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { displayContactName } from '@/crm/utils/contactDisplay';
import SMSConnectionDialog from "../components/SMSConnectionDialog";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import PhoneForwardedRoundedIcon from "@mui/icons-material/PhoneForwardedRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import SimCardRoundedIcon from "@mui/icons-material/SimCardRounded";
import PhonelinkRingRoundedIcon from "@mui/icons-material/PhonelinkRingRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property?: string;
  type: "Tenant" | "Lead" | "Service Provider" | "Manager";
  status: "Not Called" | "Called" | "Answered" | "Voicemail" | "Busy" | "No Answer";
  lastCalled?: string;
  notes?: string;
}

interface CallSession {
  isActive: boolean;
  currentContact?: Contact;
  callDuration: number;
  totalCalls: number;
  successfulCalls: number;
  dialingMode: "Manual" | "Auto" | "Predictive";
  isPaused: boolean;
}

interface SMSProvider {
  id: string;
  name: string;
  logo?: string;
  isConnected: boolean;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  applicationSid?: string;
  apiKey?: string;
  apiSecret?: string;
  voiceUrl?: string;
  statusCallbackUrl?: string;
  recordingCallbackUrl?: string;
  region?: string;
  edge?: string;
}

interface TextGridConfig {
  apiKey: string;
  apiSecret: string;
  phoneNumber: string;
  webhookUrl?: string;
  statusWebhookUrl?: string;
  appId?: string;
  endpoint?: string;
}

interface BandwidthConfig {
  accountId: string;
  username: string;
  password: string;
  phoneNumber: string;
  applicationId?: string;
  subaccountId?: string;
  siteId?: string;
  webhookUrl?: string;
  region?: string;
}

interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  phoneNumber: string;
  applicationId?: string;
  privateKey?: string;
  webhookUrl?: string;
  statusWebhookUrl?: string;
  region?: string;
}

interface PlivoConfig {
  authId: string;
  authToken: string;
  phoneNumber: string;
  applicationId?: string;
  webhookUrl?: string;
  fallbackUrl?: string;
  hangupUrl?: string;
  region?: string;
}

interface SignalWireConfig {
  projectId: string;
  authToken: string;
  spaceUrl: string;
  phoneNumber: string;
  applicationSid?: string;
  webhookUrl?: string;
  statusCallbackUrl?: string;
  region?: string;
}

interface TelnyxConfig {
  apiKey: string;
  phoneNumber: string;
  messagingProfileId?: string;
  applicationId?: string;
  webhookUrl?: string;
  statusWebhookUrl?: string;
  connectionId?: string;
  region?: string;
}

interface RingCentralConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  phoneNumber: string;
  extension?: string;
  webhookUrl?: string;
  environment?: string;
}

interface SMSConnectionConfig {
  selectedProvider: string;
  providers: SMSProvider[];
  twilio: TwilioConfig;
  textgrid: TextGridConfig;
  bandwidth: BandwidthConfig;
  vonage: VonageConfig;
  plivo: PlivoConfig;
  signalwire: SignalWireConfig;
  telnyx: TelnyxConfig;
  ringcentral: RingCentralConfig;
}

interface SimConnection {
  isConnected: boolean;
  deviceName: string;
  carrier: string;
  signalStrength: number;
  qrCode: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    phone: "(555) 123-4567",
    email: "sarah.johnson@email.com",
    property: "Sunset Apartments",
    type: "Tenant",
    status: "Not Called",
  },
  {
    id: "2",
    name: "Mike Property Services",
    phone: "(555) 234-5678",
    email: "mike@propertyservices.com",
    type: "Service Provider",
    status: "Called",
    lastCalled: "2024-01-15T10:30:00Z",
  },
  {
    id: "3",
    name: "Emma Wilson",
    phone: "(555) 345-6789",
    email: "emma.wilson@email.com",
    property: "Ocean View Villa",
    type: "Lead",
    status: "Answered",
    lastCalled: "2024-01-15T14:20:00Z",
  },
];

export default function PowerDialer() {
  const [contacts, setContacts] = React.useState<Contact[]>(mockContacts);
  const [callSession, setCallSession] = React.useState<CallSession>({
    isActive: false,
    callDuration: 0,
    totalCalls: 0,
    successfulCalls: 0,
    dialingMode: "Manual",
    isPaused: false,
  });
  const [smsConnection, setSmsConnection] = React.useState<SMSConnectionConfig>({
    selectedProvider: "twilio",
    providers: [
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
      region: "us1",
      edge: "dublin",
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
      region: "us-east",
    },
    vonage: {
      apiKey: "",
      apiSecret: "",
      phoneNumber: "",
      applicationId: "",
      privateKey: "",
      webhookUrl: "",
      statusWebhookUrl: "",
      region: "US",
    },
    plivo: {
      authId: "",
      authToken: "",
      phoneNumber: "",
      applicationId: "",
      webhookUrl: "",
      fallbackUrl: "",
      hangupUrl: "",
      region: "us-east-1",
    },
    signalwire: {
      projectId: "",
      authToken: "",
      spaceUrl: "",
      phoneNumber: "",
      applicationSid: "",
      webhookUrl: "",
      statusCallbackUrl: "",
      region: "us-west",
    },
    telnyx: {
      apiKey: "",
      phoneNumber: "",
      messagingProfileId: "",
      applicationId: "",
      webhookUrl: "",
      statusWebhookUrl: "",
      connectionId: "",
      region: "us-east",
    },
    ringcentral: {
      clientId: "",
      clientSecret: "",
      username: "",
      password: "",
      phoneNumber: "",
      extension: "",
      webhookUrl: "",
      environment: "production",
    },
  });
  const [manualDialNumber, setManualDialNumber] = React.useState("");
  const [openSmsConnectionDialog, setOpenSmsConnectionDialog] = React.useState(false);
  const [openManualDialDialog, setOpenManualDialDialog] = React.useState(false);
  const [simConnection, setSimConnection] = React.useState<SimConnection>({
    isConnected: false,
    deviceName: "",
    carrier: "",
    signalStrength: 0,
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CRM_SIM_CONNECT_" + Date.now(),
  });
  const [openTwilioDialog, setOpenTwilioDialog] = React.useState(false);
  const [openSimDialog, setOpenSimDialog] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  // Add keyboard support for manual dialer
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!openManualDialDialog) return;

      const key = event.key;

      // Handle number keys, * and #
      if (/^[0-9*#]$/.test(key)) {
        event.preventDefault();
        setManualDialNumber(prev => prev + key);
        // Add haptic feedback simulation
        navigator.vibrate && navigator.vibrate(50);
      }

      // Handle backspace
      if (key === 'Backspace') {
        event.preventDefault();
        setManualDialNumber(prev => prev.slice(0, -1));
      }

      // Handle escape to clear
      if (key === 'Escape' && event.ctrlKey) {
        event.preventDefault();
        setManualDialNumber("");
      }

      // Handle Enter to call
      if (key === 'Enter' && manualDialNumber.trim()) {
        event.preventDefault();
        handleManualDial();
      }
    };

    if (openManualDialDialog) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openManualDialDialog, manualDialNumber]);

  // Timer effect for call duration
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callSession.isActive && !callSession.isPaused) {
      interval = setInterval(() => {
        setCallSession(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callSession.isActive, callSession.isPaused]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCalling = () => {
    const nextContact = contacts.find(c => c.status === "Not Called");
    if (nextContact) {
      setCallSession(prev => ({
        ...prev,
        isActive: true,
        currentContact: nextContact,
        callDuration: 0,
        isPaused: false,
      }));
      setSelectedContact(nextContact);
    }
  };

  const handlePauseCalling = () => {
    setCallSession(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleStopCalling = () => {
    setCallSession(prev => ({
      ...prev,
      isActive: false,
      currentContact: undefined,
      callDuration: 0,
      isPaused: false,
    }));
    setSelectedContact(null);
  };

  const handleNextContact = () => {
    const currentIndex = contacts.findIndex(c => c.id === callSession.currentContact?.id);
    const nextContact = contacts.find((c, index) => index > currentIndex && c.status === "Not Called");
    
    if (nextContact) {
      setCallSession(prev => ({
        ...prev,
        currentContact: nextContact,
        callDuration: 0,
        totalCalls: prev.totalCalls + 1,
      }));
      setSelectedContact(nextContact);
    } else {
      handleStopCalling();
    }
  };

  const handleCallResult = (result: Contact["status"]) => {
    if (callSession.currentContact) {
      setContacts(prev =>
        prev.map(c =>
          c.id === callSession.currentContact!.id
            ? { ...c, status: result, lastCalled: new Date().toISOString() }
            : c
        )
      );

      setCallSession(prev => ({
        ...prev,
        successfulCalls: result === "Answered" ? prev.successfulCalls + 1 : prev.successfulCalls,
        totalCalls: prev.totalCalls + 1,
      }));

      // Show success message
      alert(`Call marked as: ${result}`);

      if (callSession.dialingMode === "Auto" || callSession.dialingMode === "Predictive") {
        setTimeout(() => handleNextContact(), 2000);
      }
    }
  };

  const handleSmsProviderConnect = () => {
    const provider = smsConnection.selectedProvider;
    const config = smsConnection[provider as keyof typeof smsConnection];

    // Validate required fields based on provider
    let requiredFields: string[] = [];
    let isValid = false;

    switch (provider) {
      case 'twilio':
        requiredFields = ['accountSid', 'authToken', 'phoneNumber'];
        break;
      case 'textgrid':
        requiredFields = ['apiKey', 'apiSecret', 'phoneNumber'];
        break;
      case 'bandwidth':
        requiredFields = ['accountId', 'username', 'password', 'phoneNumber'];
        break;
      case 'vonage':
        requiredFields = ['apiKey', 'apiSecret', 'phoneNumber'];
        break;
      case 'plivo':
        requiredFields = ['authId', 'authToken', 'phoneNumber'];
        break;
      case 'signalwire':
        requiredFields = ['projectId', 'authToken', 'spaceUrl', 'phoneNumber'];
        break;
      case 'telnyx':
        requiredFields = ['apiKey', 'phoneNumber'];
        break;
      case 'ringcentral':
        requiredFields = ['clientId', 'clientSecret', 'username', 'password', 'phoneNumber'];
        break;
    }

    // Check if all required fields are filled
    if (typeof config === 'object' && config !== null) {
      const missingFields = requiredFields.filter(field =>
        !(config as any)[field] || (config as any)[field].trim() === ''
      );

      if (missingFields.length === 0) {
        isValid = true;
      } else {
        alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }
    }

    if (isValid) {
      // Update provider connection status
      setSmsConnection(prev => ({
        ...prev,
        providers: prev.providers.map(p =>
          p.id === provider
            ? { ...p, isConnected: true }
            : { ...p, isConnected: false } // Disconnect other providers
        )
      }));

      setOpenSmsConnectionDialog(false);
      alert(`${smsConnection.providers.find(p => p.id === provider)?.name} connected successfully!`);
    }
  };

  const handleManualDial = () => {
    if (manualDialNumber) {
      alert(`Dialing ${manualDialNumber}...`);
      setOpenManualDialDialog(false);
      setManualDialNumber("");
    } else {
      alert("Please enter a phone number to dial.");
    }
  };

  const handleSimConnect = () => {
    // Simulate SIM connection
    setSimConnection(prev => ({
      ...prev,
      isConnected: true,
      deviceName: "Mobile Device",
      carrier: "Verizon",
      signalStrength: 85,
    }));
    setOpenSimDialog(false);
  };

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "Answered": return "success";
      case "Called": return "info";
      case "Voicemail": return "warning";
      case "Busy": case "No Answer": return "error";
      default: return "default";
    }
  };

  const pendingCalls = contacts.filter(c => c.status === "Not Called").length;
  const completedCalls = contacts.filter(c => c.status !== "Not Called").length;
  const successRate = completedCalls > 0 ? Math.round((callSession.successfulCalls / completedCalls) * 100) : 0;

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
          Power Dialer
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SmsRoundedIcon />}
            onClick={() => setOpenSmsConnectionDialog(true)}
          >
            SMS Connection
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhoneRoundedIcon />}
            onClick={() => setOpenManualDialDialog(true)}
          >
            Manual Dial
          </Button>
          <Button
            variant="outlined"
            startIcon={<QrCodeRoundedIcon />}
            onClick={() => setOpenSimDialog(true)}
          >
            SIM Connect
          </Button>
        </Stack>
      </Stack>

      {/* Connection Status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: smsConnection.providers.some(p => p.isConnected) ? "success.main" : "error.main" }}>
                  <SmsRoundedIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">SMS Connection</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {smsConnection.providers.some(p => p.isConnected)
                      ? `Connected (${smsConnection.providers.find(p => p.isConnected)?.name})`
                      : "Not Connected"}
                  </Typography>
                </Box>
                {smsConnection.providers.some(p => p.isConnected) ? (
                  <CheckCircleRoundedIcon color="success" />
                ) : (
                  <ErrorRoundedIcon color="error" />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: simConnection.isConnected ? "success.main" : "warning.main" }}>
                  <SimCardRoundedIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">SIM Connection</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {simConnection.isConnected ? `${simConnection.carrier} (${simConnection.signalStrength}%)` : "Not Connected"}
                  </Typography>
                </Box>
                {simConnection.isConnected ? (
                  <CheckCircleRoundedIcon color="success" />
                ) : (
                  <PhonelinkRingRoundedIcon color="warning" />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Call Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PhoneCallbackRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Pending Calls
                  </Typography>
                  <Typography variant="h4">{pendingCalls}</Typography>
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
                  <PhoneForwardedRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Completed Calls
                  </Typography>
                  <Typography variant="h4">{completedCalls}</Typography>
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
                    Success Rate
                  </Typography>
                  <Typography variant="h4">{successRate}%</Typography>
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
                  ⏱️
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Call Duration
                  </Typography>
                  <Typography variant="h4">{formatDuration(callSession.callDuration)}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Call Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Call Controls</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Dialing Mode</InputLabel>
              <Select
                value={callSession.dialingMode}
                label="Dialing Mode"
                onChange={(e) => setCallSession(prev => ({ ...prev, dialingMode: e.target.value as any }))}
              >
                <MenuItem value="Manual">Manual</MenuItem>
                <MenuItem value="Auto">Auto Dialer</MenuItem>
                <MenuItem value="Predictive">Predictive</MenuItem>
              </Select>
            </FormControl>

            <Stack spacing={2}>
              {!callSession.isActive ? (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={handleStartCalling}
                  disabled={pendingCalls === 0}
                >
                  Start Calling
                </Button>
              ) : (
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={callSession.isPaused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
                    onClick={handlePauseCalling}
                  >
                    {callSession.isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<StopRoundedIcon />}
                    onClick={handleStopCalling}
                    color="error"
                  >
                    Stop Calling
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SkipNextRoundedIcon />}
                    onClick={handleNextContact}
                  >
                    Next Contact
                  </Button>
                </Stack>
              )}
            </Stack>

            {/* Current Call */}
            {callSession.isActive && selectedContact && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "primary.light", borderRadius: 1, border: 2, borderColor: "primary.main" }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>🔊 Currently Calling:</Typography>
                <Typography variant="h6">{displayContactName(selectedContact)}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedContact.phone}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedContact.type}</Typography>
                <Typography variant="body2" color="text.secondary">
                  📞 Call Duration: {formatDuration(callSession.callDuration)}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleCallResult("Answered")}
                    sx={{ minWidth: 80 }}
                  >
                    ✅ Answered
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => handleCallResult("Voicemail")}
                    sx={{ minWidth: 80 }}
                  >
                    📧 Voicemail
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleCallResult("No Answer")}
                    sx={{ minWidth: 80 }}
                  >
                    ❌ No Answer
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    onClick={() => handleCallResult("Busy")}
                    sx={{ minWidth: 80 }}
                  >
                    📞 Busy
                  </Button>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Contact List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Contact List</Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Called</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow 
                      key={contact.id}
                      sx={{ 
                        bgcolor: contact.id === selectedContact?.id ? "action.selected" : "inherit" 
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">{displayContactName(contact)}</Typography>
                        {contact.property && (
                          <Typography variant="body2" color="text.secondary">
                            {contact.property}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={contact.status}
                          color={getStatusColor(contact.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {contact.lastCalled ? new Date(contact.lastCalled).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* SMS Connection Dialog */}
      <SMSConnectionDialog
        open={openSmsConnectionDialog}
        onClose={() => setOpenSmsConnectionDialog(false)}
        smsConnection={smsConnection}
        setSmsConnection={setSmsConnection}
        onConnect={handleSmsProviderConnect}
      />

      {/* SIM Connection Dialog */}
      <Dialog open={openSimDialog} onClose={() => setOpenSimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>SIM Card Connection</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Scan the QR code with your mobile app to connect your device's SIM card for direct calling.
            </Alert>
            <Box sx={{ textAlign: "center" }}>
              <img 
                src={simConnection.qrCode} 
                alt="QR Code for SIM connection" 
                style={{ maxWidth: "200px", height: "auto" }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Scan this QR code with the CRM mobile app
              </Typography>
            </Box>
            <TextField
              label="Device Name"
              fullWidth
              value="Waiting for connection..."
              disabled
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSimDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSimConnect}>
            Simulate Connection
          </Button>
        </DialogActions>
      </Dialog>


      {/* Manual Dial Dialog */}
      <Dialog open={openManualDialDialog} onClose={() => setOpenManualDialDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manual Dialer</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Phone Number"
              fullWidth
              value={manualDialNumber}
              onChange={(e) => setManualDialNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              helperText={
                manualDialNumber
                  ? `${manualDialNumber.replace(/\D/g, '').length} digits entered`
                  : "Enter the phone number you want to dial"
              }
              error={manualDialNumber.length > 0 && manualDialNumber.replace(/\D/g, '').length < 10}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneRoundedIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '1.1rem',
                  fontFamily: 'monospace',
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '1.1rem',
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                }
              }}
            />

            {/* Enhanced Number Pad */}
            <Box sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              bgcolor: 'grey.50'
            }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                📞 Number Pad
              </Typography>
              <Grid container spacing={1}>
                {[
                  { digit: '1', letters: '' },
                  { digit: '2', letters: 'ABC' },
                  { digit: '3', letters: 'DEF' },
                  { digit: '4', letters: 'GHI' },
                  { digit: '5', letters: 'JKL' },
                  { digit: '6', letters: 'MNO' },
                  { digit: '7', letters: 'PQRS' },
                  { digit: '8', letters: 'TUV' },
                  { digit: '9', letters: 'WXYZ' },
                  { digit: '*', letters: '' },
                  { digit: '0', letters: '+' },
                  { digit: '#', letters: '' }
                ].map(({ digit, letters }) => (
                  <Grid item xs={4} key={digit}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        py: 2,
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        minHeight: 70,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        '&:hover': {
                          bgcolor: 'primary.light',
                          borderColor: 'primary.main'
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                          transition: 'transform 0.1s'
                        }
                      }}
                      onClick={() => {
                        setManualDialNumber(prev => prev + digit);
                        // Add haptic feedback simulation
                        navigator.vibrate && navigator.vibrate(50);
                      }}
                    >
                      <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
                        {digit}
                      </Typography>
                      {letters && (
                        <Typography variant="caption" component="span" sx={{
                          fontSize: '0.7rem',
                          opacity: 0.7,
                          fontWeight: 'normal'
                        }}>
                          {letters}
                        </Typography>
                      )}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setManualDialNumber(prev => prev.slice(0, -1))}
                  fullWidth
                  sx={{ py: 1.5 }}
                  startIcon={<span>⌫</span>}
                >
                  Backspace
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setManualDialNumber("")}
                  fullWidth
                  sx={{ py: 1.5 }}
                  startIcon={<span>🗑️</span>}
                >
                  Clear
                </Button>
              </Stack>

              {/* Quick Actions */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setManualDialNumber(prev => '+1' + prev)}
                  disabled={manualDialNumber.startsWith('+1')}
                >
                  +1 (US)
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Format as (xxx) xxx-xxxx
                    const numbers = manualDialNumber.replace(/\D/g, '');
                    if (numbers.length === 10) {
                      setManualDialNumber(`(${numbers.slice(0,3)}) ${numbers.slice(3,6)}-${numbers.slice(6)}`);
                    }
                  }}
                  disabled={manualDialNumber.replace(/\D/g, '').length !== 10}
                >
                  Format
                </Button>
              </Stack>
            </Box>

            {/* Keyboard Shortcuts Info */}
            <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
              <Typography variant="body2" component="div">
                <strong>Keyboard Shortcuts:</strong>
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                • <kbd>0-9</kbd>, <kbd>*</kbd>, <kbd>#</kbd> - Enter digits<br/>
                • <kbd>Backspace</kbd> - Delete last digit<br/>
                • <kbd>Ctrl+Esc</kbd> - Clear all<br/>
                • <kbd>Enter</kbd> - Call number
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManualDialDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleManualDial} startIcon={<PhoneRoundedIcon />}>
            📞 Call Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
