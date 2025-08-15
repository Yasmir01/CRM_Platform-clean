import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  TextField,
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
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

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

interface SmsItConfig {
  simCardIccid: string;
  simCardNumber: string;
  accountId: string;
  apiKey: string;
  apiSecret: string;
  carrier: string;
  dataPlan: string;
  webhookUrl?: string;
  enableSms: boolean;
  enableVoice: boolean;
  enableRoaming: boolean;
  autoRenewal: boolean;
}

interface SMSConnectionConfig {
  selectedProvider: string;
  providers: SMSProvider[];
  smsit: SmsItConfig;
  twilio: TwilioConfig;
  textgrid: TextGridConfig;
  bandwidth: BandwidthConfig;
  vonage: VonageConfig;
  plivo: PlivoConfig;
  signalwire: SignalWireConfig;
  telnyx: TelnyxConfig;
  ringcentral: RingCentralConfig;
}

interface SMSConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  smsConnection: SMSConnectionConfig;
  setSmsConnection: (config: SMSConnectionConfig | ((prev: SMSConnectionConfig) => SMSConnectionConfig)) => void;
  onConnect: () => void;
}

const SmsItConfigForm = ({ config, onChange }: { config: SmsItConfig; onChange: (config: SmsItConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 SMS-IT SIM Card Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="SIM Card ICCID *"
          fullWidth
          value={config.simCardIccid}
          onChange={(e) => onChange({ ...config, simCardIccid: e.target.value })}
          placeholder="8901410123456789012"
          helperText="20-digit SIM card identifier"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.simCardNumber}
          onChange={(e) => onChange({ ...config, simCardNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your SMS-IT phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Account ID *"
          fullWidth
          value={config.accountId}
          onChange={(e) => onChange({ ...config, accountId: e.target.value })}
          placeholder="Your SMS-IT Account ID"
          helperText="SMS-IT account identifier"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Key *"
          fullWidth
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="Your SMS-IT API Key"
          helperText="SMS-IT API authentication key"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Secret *"
          type="password"
          fullWidth
          value={config.apiSecret}
          onChange={(e) => onChange({ ...config, apiSecret: e.target.value })}
          placeholder="Your API Secret"
          helperText="SMS-IT API Secret"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Carrier</InputLabel>
          <Select
            value={config.carrier}
            label="Carrier"
            onChange={(e) => onChange({ ...config, carrier: e.target.value })}
          >
            <MenuItem value="att">AT&T</MenuItem>
            <MenuItem value="verizon">Verizon</MenuItem>
            <MenuItem value="tmobile">T-Mobile</MenuItem>
            <MenuItem value="sprint">Sprint</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Data Plan</InputLabel>
          <Select
            value={config.dataPlan}
            label="Data Plan"
            onChange={(e) => onChange({ ...config, dataPlan: e.target.value })}
          >
            <MenuItem value="5gb">5 GB - $9.99/month</MenuItem>
            <MenuItem value="10gb">10 GB - $15.99/month</MenuItem>
            <MenuItem value="25gb">25 GB - $29.99/month</MenuItem>
            <MenuItem value="unlimited">Unlimited - $49.99/month</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/sms-it"
          helperText="URL to receive SMS-IT webhooks and notifications"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={config.enableSms}
              onChange={(e) => onChange({ ...config, enableSms: e.target.checked })}
            />
          }
          label="Enable SMS messaging"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={config.enableVoice}
              onChange={(e) => onChange({ ...config, enableVoice: e.target.checked })}
            />
          }
          label="Enable voice calls"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={config.enableRoaming}
              onChange={(e) => onChange({ ...config, enableRoaming: e.target.checked })}
            />
          }
          label="Enable international roaming"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={config.autoRenewal}
              onChange={(e) => onChange({ ...config, autoRenewal: e.target.checked })}
            />
          }
          label="Auto-renewal"
        />
      </Grid>
    </Grid>
  </>
);

const TwilioConfigForm = ({ config, onChange }: { config: TwilioConfig; onChange: (config: TwilioConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 Twilio Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Account SID *"
          fullWidth
          value={config.accountSid}
          onChange={(e) => onChange({ ...config, accountSid: e.target.value })}
          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          helperText="Your main Twilio Account SID"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Auth Token *"
          type="password"
          fullWidth
          value={config.authToken}
          onChange={(e) => onChange({ ...config, authToken: e.target.value })}
          placeholder="Your Auth Token"
          helperText="Primary authentication token"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="App SID"
          fullWidth
          value={config.applicationSid}
          onChange={(e) => onChange({ ...config, applicationSid: e.target.value })}
          placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          helperText="TwiML Application SID"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your Twilio phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API SID"
          fullWidth
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          helperText="API Key SID for authentication"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Secret"
          type="password"
          fullWidth
          value={config.apiSecret}
          onChange={(e) => onChange({ ...config, apiSecret: e.target.value })}
          placeholder="Your API Secret"
          helperText="API Secret for secure access"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="SMS Webhook URL"
          fullWidth
          value={config.statusCallbackUrl}
          onChange={(e) => onChange({ ...config, statusCallbackUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/sms"
          helperText="URL to receive SMS webhook notifications"
        />
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          label="Voice Webhook URL"
          fullWidth
          value={config.voiceUrl}
          onChange={(e) => onChange({ ...config, voiceUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/voice"
          helperText="URL to handle incoming voice calls"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Voice Webhook Method</InputLabel>
          <Select value="POST" label="Voice Webhook Method" disabled>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="GET">GET</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Status Webhook URL"
          fullWidth
          value={config.recordingCallbackUrl}
          onChange={(e) => onChange({ ...config, recordingCallbackUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/status"
          helperText="URL to receive call status updates"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Region</InputLabel>
          <Select
            value={config.region}
            label="Region"
            onChange={(e) => onChange({ ...config, region: e.target.value })}
          >
            <MenuItem value="us1">US1 (Virginia)</MenuItem>
            <MenuItem value="us2">US2 (Oregon)</MenuItem>
            <MenuItem value="au1">AU1 (Australia)</MenuItem>
            <MenuItem value="dublin">Dublin</MenuItem>
            <MenuItem value="singapore">Singapore</MenuItem>
            <MenuItem value="sydney">Sydney</MenuItem>
            <MenuItem value="tokyo">Tokyo</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Edge Location</InputLabel>
          <Select
            value={config.edge}
            label="Edge Location"
            onChange={(e) => onChange({ ...config, edge: e.target.value })}
          >
            <MenuItem value="dublin">Dublin</MenuItem>
            <MenuItem value="sydney">Sydney</MenuItem>
            <MenuItem value="tokyo">Tokyo</MenuItem>
            <MenuItem value="singapore">Singapore</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </>
);

const TextGridConfigForm = ({ config, onChange }: { config: TextGridConfig; onChange: (config: TextGridConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 TextGrid Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Key *"
          fullWidth
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="Your TextGrid API Key"
          helperText="TextGrid API authentication key"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Secret *"
          type="password"
          fullWidth
          value={config.apiSecret}
          onChange={(e) => onChange({ ...config, apiSecret: e.target.value })}
          placeholder="Your API Secret"
          helperText="TextGrid API Secret"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your TextGrid phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="App ID"
          fullWidth
          value={config.appId}
          onChange={(e) => onChange({ ...config, appId: e.target.value })}
          placeholder="Your Application ID"
          helperText="TextGrid Application ID"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/textgrid"
          helperText="URL to receive TextGrid webhooks"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Status Webhook URL"
          fullWidth
          value={config.statusWebhookUrl}
          onChange={(e) => onChange({ ...config, statusWebhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/textgrid/status"
          helperText="URL to receive status updates"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Endpoint"
          fullWidth
          value={config.endpoint}
          onChange={(e) => onChange({ ...config, endpoint: e.target.value })}
          placeholder="https://api.textgrid.com"
          helperText="TextGrid API endpoint URL"
        />
      </Grid>
    </Grid>
  </>
);

const BandwidthConfigForm = ({ config, onChange }: { config: BandwidthConfig; onChange: (config: BandwidthConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 Bandwidth Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Account ID *"
          fullWidth
          value={config.accountId}
          onChange={(e) => onChange({ ...config, accountId: e.target.value })}
          placeholder="Your Bandwidth Account ID"
          helperText="Bandwidth Account identifier"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Username *"
          fullWidth
          value={config.username}
          onChange={(e) => onChange({ ...config, username: e.target.value })}
          placeholder="API Username"
          helperText="Bandwidth API username"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Password *"
          type="password"
          fullWidth
          value={config.password}
          onChange={(e) => onChange({ ...config, password: e.target.value })}
          placeholder="API Password"
          helperText="Bandwidth API password"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your Bandwidth phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Application ID"
          fullWidth
          value={config.applicationId}
          onChange={(e) => onChange({ ...config, applicationId: e.target.value })}
          placeholder="Application ID"
          helperText="Bandwidth Application ID"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Subaccount ID"
          fullWidth
          value={config.subaccountId}
          onChange={(e) => onChange({ ...config, subaccountId: e.target.value })}
          placeholder="Subaccount ID"
          helperText="Bandwidth Subaccount ID"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/bandwidth"
          helperText="URL to receive Bandwidth webhooks"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Region</InputLabel>
          <Select
            value={config.region}
            label="Region"
            onChange={(e) => onChange({ ...config, region: e.target.value })}
          >
            <MenuItem value="us-east">US East</MenuItem>
            <MenuItem value="us-west">US West</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </>
);

// Similar forms for other providers...
const VonageConfigForm = ({ config, onChange }: { config: VonageConfig; onChange: (config: VonageConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 Vonage Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Key *"
          fullWidth
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="Your Vonage API Key"
          helperText="Vonage API Key"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Secret *"
          type="password"
          fullWidth
          value={config.apiSecret}
          onChange={(e) => onChange({ ...config, apiSecret: e.target.value })}
          placeholder="Your API Secret"
          helperText="Vonage API Secret"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your Vonage phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Application ID"
          fullWidth
          value={config.applicationId}
          onChange={(e) => onChange({ ...config, applicationId: e.target.value })}
          placeholder="Application ID"
          helperText="Vonage Application ID"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Private Key"
          multiline
          rows={4}
          fullWidth
          value={config.privateKey}
          onChange={(e) => onChange({ ...config, privateKey: e.target.value })}
          placeholder="-----BEGIN PRIVATE KEY-----"
          helperText="Vonage Application Private Key"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/vonage"
          helperText="URL to receive Vonage webhooks"
        />
      </Grid>
    </Grid>
  </>
);

const PlivoConfigForm = ({ config, onChange }: { config: PlivoConfig; onChange: (config: PlivoConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 Plivo Configuration  
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Auth ID *"
          fullWidth
          value={config.authId}
          onChange={(e) => onChange({ ...config, authId: e.target.value })}
          placeholder="Your Plivo Auth ID"
          helperText="Plivo Authentication ID"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Auth Token *"
          type="password"
          fullWidth
          value={config.authToken}
          onChange={(e) => onChange({ ...config, authToken: e.target.value })}
          placeholder="Your Auth Token"
          helperText="Plivo Authentication Token"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your Plivo phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Application ID"
          fullWidth
          value={config.applicationId}
          onChange={(e) => onChange({ ...config, applicationId: e.target.value })}
          placeholder="Application ID"
          helperText="Plivo Application ID"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/plivo"
          helperText="URL to receive Plivo webhooks"
        />
      </Grid>
    </Grid>
  </>
);

const SignalWireConfigForm = ({ config, onChange }: { config: SignalWireConfig; onChange: (config: SignalWireConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 SignalWire Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Project ID *"
          fullWidth
          value={config.projectId}
          onChange={(e) => onChange({ ...config, projectId: e.target.value })}
          placeholder="Your SignalWire Project ID"
          helperText="SignalWire Project identifier"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Auth Token *"
          type="password"
          fullWidth
          value={config.authToken}
          onChange={(e) => onChange({ ...config, authToken: e.target.value })}
          placeholder="Your Auth Token"
          helperText="SignalWire Authentication Token"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Space URL *"
          fullWidth
          value={config.spaceUrl}
          onChange={(e) => onChange({ ...config, spaceUrl: e.target.value })}
          placeholder="yourspace.signalwire.com"
          helperText="Your SignalWire Space URL"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your SignalWire phone number"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/signalwire"
          helperText="URL to receive SignalWire webhooks"
        />
      </Grid>
    </Grid>
  </>
);

const TelnyxConfigForm = ({ config, onChange }: { config: TelnyxConfig; onChange: (config: TelnyxConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 Telnyx Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="API Key *"
          type="password"
          fullWidth
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="KEYxxxxxxxxxxxxxxxxxxxxxxx"
          helperText="Your Telnyx API Key"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your Telnyx phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Messaging Profile ID"
          fullWidth
          value={config.messagingProfileId}
          onChange={(e) => onChange({ ...config, messagingProfileId: e.target.value })}
          placeholder="Messaging Profile ID"
          helperText="Telnyx Messaging Profile ID"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Connection ID"
          fullWidth
          value={config.connectionId}
          onChange={(e) => onChange({ ...config, connectionId: e.target.value })}
          placeholder="Connection ID"
          helperText="Telnyx Connection ID"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/telnyx"
          helperText="URL to receive Telnyx webhooks"
        />
      </Grid>
    </Grid>
  </>
);

const RingCentralConfigForm = ({ config, onChange }: { config: RingCentralConfig; onChange: (config: RingCentralConfig) => void }) => (
  <>
    <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
      📱 RingCentral Configuration
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Client ID *"
          fullWidth
          value={config.clientId}
          onChange={(e) => onChange({ ...config, clientId: e.target.value })}
          placeholder="Your RingCentral Client ID"
          helperText="RingCentral App Client ID"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Client Secret *"
          type="password"
          fullWidth
          value={config.clientSecret}
          onChange={(e) => onChange({ ...config, clientSecret: e.target.value })}
          placeholder="Your Client Secret"
          helperText="RingCentral App Client Secret"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Username *"
          fullWidth
          value={config.username}
          onChange={(e) => onChange({ ...config, username: e.target.value })}
          placeholder="Your RingCentral Username"
          helperText="RingCentral account username"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Password *"
          type="password"
          fullWidth
          value={config.password}
          onChange={(e) => onChange({ ...config, password: e.target.value })}
          placeholder="Your Password"
          helperText="RingCentral account password"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number *"
          fullWidth
          value={config.phoneNumber}
          onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          helperText="Your RingCentral phone number"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Extension"
          fullWidth
          value={config.extension}
          onChange={(e) => onChange({ ...config, extension: e.target.value })}
          placeholder="101"
          helperText="Phone extension (optional)"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Webhook URL"
          fullWidth
          value={config.webhookUrl}
          onChange={(e) => onChange({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-domain.com/webhooks/ringcentral"
          helperText="URL to receive RingCentral webhooks"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Environment</InputLabel>
          <Select
            value={config.environment}
            label="Environment"
            onChange={(e) => onChange({ ...config, environment: e.target.value })}
          >
            <MenuItem value="production">Production</MenuItem>
            <MenuItem value="sandbox">Sandbox</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </>
);

export default function SMSConnectionDialog({ 
  open, 
  onClose, 
  smsConnection, 
  setSmsConnection, 
  onConnect 
}: SMSConnectionDialogProps) {
  const renderProviderConfig = () => {
    const provider = smsConnection.selectedProvider;

    switch (provider) {
      case 'sms-it':
        return (
          <SmsItConfigForm
            config={smsConnection.smsit || {
              simCardIccid: '',
              simCardNumber: '',
              accountId: '',
              apiKey: '',
              apiSecret: '',
              carrier: '',
              dataPlan: '',
              webhookUrl: '',
              enableSms: true,
              enableVoice: true,
              enableRoaming: false,
              autoRenewal: true
            }}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, smsit: config }))}
          />
        );
      case 'twilio':
        return (
          <TwilioConfigForm
            config={smsConnection.twilio}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, twilio: config }))}
          />
        );
      case 'textgrid':
        return (
          <TextGridConfigForm
            config={smsConnection.textgrid}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, textgrid: config }))}
          />
        );
      case 'bandwidth':
        return (
          <BandwidthConfigForm
            config={smsConnection.bandwidth}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, bandwidth: config }))}
          />
        );
      case 'vonage':
        return (
          <VonageConfigForm
            config={smsConnection.vonage}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, vonage: config }))}
          />
        );
      case 'plivo':
        return (
          <PlivoConfigForm
            config={smsConnection.plivo}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, plivo: config }))}
          />
        );
      case 'signalwire':
        return (
          <SignalWireConfigForm
            config={smsConnection.signalwire}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, signalwire: config }))}
          />
        );
      case 'telnyx':
        return (
          <TelnyxConfigForm
            config={smsConnection.telnyx}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, telnyx: config }))}
          />
        );
      case 'ringcentral':
        return (
          <RingCentralConfigForm
            config={smsConnection.ringcentral}
            onChange={(config) => setSmsConnection(prev => ({ ...prev, ringcentral: config }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SmsRoundedIcon />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>SMS Connection Setup</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your SMS and voice communication provider
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={4} sx={{ mt: 1 }}>
          <Alert severity="info">
            Select and configure your preferred SMS/Voice provider for communication functionality.
          </Alert>

          {/* Provider Selection */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
              📡 Select Provider
            </Typography>
            <FormControl fullWidth>
              <InputLabel>SMS/Voice Provider</InputLabel>
              <Select
                value={smsConnection.selectedProvider}
                label="SMS/Voice Provider"
                onChange={(e) => setSmsConnection(prev => ({ ...prev, selectedProvider: e.target.value }))}
              >
                {smsConnection.providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>{provider.name}</Typography>
                      {provider.isConnected && (
                        <Chip label="Connected" color="success" size="small" />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Provider-specific Configuration */}
          <Box>
            {renderProviderConfig()}
          </Box>

          {/* Connection Status */}
          {smsConnection.providers.find(p => p.id === smsConnection.selectedProvider)?.isConnected && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ {smsConnection.providers.find(p => p.id === smsConnection.selectedProvider)?.name} is successfully connected and configured!
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} size="large">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onConnect}
          size="large"
          startIcon={<PhoneRoundedIcon />}
        >
          {smsConnection.providers.find(p => p.id === smsConnection.selectedProvider)?.isConnected 
            ? "Update Configuration" 
            : `Connect ${smsConnection.providers.find(p => p.id === smsConnection.selectedProvider)?.name}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
