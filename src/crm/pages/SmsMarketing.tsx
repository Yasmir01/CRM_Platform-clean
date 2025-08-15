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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Divider,
  LinearProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import FormControlLabel from "@mui/material/FormControlLabel";

interface SmsCampaign {
  id: string;
  name: string;
  message: string;
  recipients: string[];
  recipientGroups: string[];
  status: "Draft" | "Scheduled" | "Sent" | "Sending";
  sentDate?: string;
  scheduledDate?: string;
  deliveryRate?: number;
  responseRate?: number;
  totalSent: number;
  totalDelivered: number;
  totalResponses: number;
  characterCount: number;
  estimatedCost: number;
}

const mockCampaigns: SmsCampaign[] = [
  {
    id: "1",
    name: "Rent Reminder - January",
    message: "Hi {TENANT_NAME}, your rent payment of {RENT_AMOUNT} is due tomorrow. Pay online at {PAYMENT_LINK}. Questions? Call {OFFICE_PHONE}.",
    recipients: ["+15551234567", "+15559876543"],
    recipientGroups: ["All Tenants"],
    status: "Sent",
    sentDate: "2024-01-15T09:00:00Z",
    deliveryRate: 98,
    responseRate: 12,
    totalSent: 45,
    totalDelivered: 44,
    totalResponses: 5,
    characterCount: 128,
    estimatedCost: 4.50,
  },
  {
    id: "2",
    name: "Maintenance Alert",
    message: "Maintenance notice: Water will be shut off in Building A from 10 AM - 2 PM today. Plan accordingly. Contact {MANAGER_PHONE} for questions.",
    recipients: [],
    recipientGroups: ["Building A Tenants"],
    status: "Scheduled",
    scheduledDate: "2024-01-20T08:00:00Z",
    totalSent: 0,
    totalDelivered: 0,
    totalResponses: 0,
    characterCount: 134,
    estimatedCost: 2.40,
  },
  {
    id: "3",
    name: "Property Showing Alert",
    message: "New property available! 2BR/2BA Ocean View Villa. Schedule your tour: {BOOKING_LINK} or call {AGENT_PHONE}.",
    recipients: [],
    recipientGroups: ["Prospects", "Wait List"],
    status: "Draft",
    totalSent: 0,
    totalDelivered: 0,
    totalResponses: 0,
    characterCount: 115,
    estimatedCost: 8.70,
  },
];

const recipientGroups = [
  "All Tenants",
  "All Prospects", 
  "All Property Managers",
  "All Service Providers",
  "Building A Tenants",
  "Building B Tenants",
  "Active Leases",
  "Expiring Leases",
  "Wait List",
  "VIP Clients",
  "Late Payment",
  "Emergency Contacts"
];

export default function SmsMarketing() {
  const [campaigns, setCampaigns] = React.useState<SmsCampaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<SmsCampaign | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    message: "",
    recipients: "",
    recipientGroups: [] as string[],
    scheduleDate: "",
    scheduleTime: "",
    selectedTemplate: "",
    saveAsTemplate: false,
    templateName: "",
  });

  const [templates, setTemplates] = React.useState([
    { id: "rent-reminder", name: "Rent Reminder", content: "Hi {TENANT_NAME}, your rent payment of ${RENT_AMOUNT} is due tomorrow. Pay online at {PAYMENT_LINK}. Questions? Call {OFFICE_PHONE}." },
    { id: "maintenance-alert", name: "Maintenance Alert", content: "Maintenance notice: {MAINTENANCE_DETAILS}. Contact {MANAGER_PHONE} for questions." },
    { id: "property-showing", name: "Property Showing", content: "New property available! {PROPERTY_DETAILS}. Schedule your tour: {BOOKING_LINK} or call {AGENT_PHONE}." },
    { id: "payment-confirmation", name: "Payment Confirmation", content: "Thank you {TENANT_NAME}! We received your payment of ${PAYMENT_AMOUNT} for {PROPERTY_NAME}. Receipt: {RECEIPT_NUMBER}" },
    { id: "emergency-notice", name: "Emergency Notice", content: "URGENT: {EMERGENCY_DETAILS}. Immediate action required. Contact {EMERGENCY_CONTACT} for assistance." },
  ]);

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setFormData({
      name: "",
      message: "",
      recipients: "",
      recipientGroups: [],
      scheduleDate: "",
      scheduleTime: "",
      selectedTemplate: "",
      saveAsTemplate: false,
      templateName: "",
    });
    setOpenDialog(true);
  };

  const handleEditCampaign = (campaign: SmsCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      message: campaign.message,
      recipients: campaign.recipients.join(", "),
      recipientGroups: campaign.recipientGroups,
      scheduleDate: campaign.scheduledDate ? campaign.scheduledDate.split('T')[0] : "",
      scheduleTime: campaign.scheduledDate ? campaign.scheduledDate.split('T')[1].substring(0, 5) : "",
      selectedTemplate: "",
      saveAsTemplate: false,
      templateName: "",
    });
    setOpenDialog(true);
  };

  const handleSaveCampaign = () => {
    const recipientsArray = formData.recipients.split(",").map(r => r.trim()).filter(r => r);
    const scheduledDate = formData.scheduleDate && formData.scheduleTime
      ? `${formData.scheduleDate}T${formData.scheduleTime}:00Z`
      : undefined;

    // Save as template if requested
    if (formData.saveAsTemplate && formData.templateName.trim()) {
      const newTemplate = {
        id: Date.now().toString(),
        name: formData.templateName,
        content: formData.message,
      };
      setTemplates(prev => [...prev, newTemplate]);
    }

    const characterCount = formData.message.length;
    const estimatedRecipients = recipientsArray.length + (formData.recipientGroups.length * 15); // Estimate 15 per group
    const estimatedCost = Math.ceil(characterCount / 160) * estimatedRecipients * 0.10; // $0.10 per SMS segment

    if (selectedCampaign) {
      // Edit existing campaign
      setCampaigns(prev => 
        prev.map(c => 
          c.id === selectedCampaign.id 
            ? { 
                ...c, 
                name: formData.name,
                message: formData.message,
                recipients: recipientsArray,
                recipientGroups: formData.recipientGroups,
                scheduledDate,
                status: scheduledDate ? "Scheduled" : c.status,
                characterCount,
                estimatedCost,
              }
            : c
        )
      );
    } else {
      // Add new campaign
      const newCampaign: SmsCampaign = {
        id: Date.now().toString(),
        name: formData.name,
        message: formData.message,
        recipients: recipientsArray,
        recipientGroups: formData.recipientGroups,
        scheduledDate,
        status: scheduledDate ? "Scheduled" : "Draft",
        totalSent: 0,
        totalDelivered: 0,
        totalResponses: 0,
        characterCount,
        estimatedCost,
      };
      setCampaigns(prev => [...prev, newCampaign]);
    }
    setOpenDialog(false);
  };

  const handleSendNow = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(c => 
        c.id === campaignId 
          ? { 
              ...c, 
              status: "Sending" as const,
              sentDate: new Date().toISOString(),
            }
          : c
      )
    );

    // Simulate sending process
    setTimeout(() => {
      setCampaigns(prev => 
        prev.map(c => 
          c.id === campaignId 
            ? { 
                ...c, 
                status: "Sent" as const,
                totalSent: 25, // Mock data
                totalDelivered: 24,
                totalResponses: 3,
                deliveryRate: 96,
                responseRate: 12,
              }
            : c
        )
      );
    }, 3000);
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: SmsCampaign["status"]) => {
    switch (status) {
      case "Sent": return "success";
      case "Scheduled": return "info";
      case "Sending": return "warning";
      case "Draft": return "default";
      default: return "default";
    }
  };

  const characterCount = formData.message.length;
  const smsSegments = Math.ceil(characterCount / 160);
  const remainingChars = 160 - (characterCount % 160);

  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === "Sent").length;
  const totalSmsSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
  const avgDeliveryRate = campaigns.filter(c => c.deliveryRate).reduce((sum, c) => sum + (c.deliveryRate || 0), 0) / campaigns.filter(c => c.deliveryRate).length || 0;

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
          SMS Marketing
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleCreateCampaign}
        >
          Create SMS Campaign
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <SmsRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Campaigns
                  </Typography>
                  <Typography variant="h4">{totalCampaigns}</Typography>
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
                  <SendRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Sent Campaigns
                  </Typography>
                  <Typography variant="h4">{sentCampaigns}</Typography>
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
                  <PeopleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    SMS Sent
                  </Typography>
                  <Typography variant="h4">{totalSmsSent}</Typography>
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
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Delivery Rate
                  </Typography>
                  <Typography variant="h4">{Math.round(avgDeliveryRate)}%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search SMS campaigns..."
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
      </Box>

      {/* Campaigns Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent/Scheduled</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.light" }}>
                      <SmsRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                        {campaign.message.substring(0, 50)}...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {campaign.characterCount} chars, {Math.ceil(campaign.characterCount / 160)} segment(s)
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {campaign.recipientGroups.map((group) => (
                      <Chip key={group} label={group} size="small" variant="outlined" />
                    ))}
                    {campaign.recipients.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        +{campaign.recipients.length} individual numbers
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack alignItems="flex-start" spacing={1}>
                    <Chip
                      label={campaign.status}
                      color={getStatusColor(campaign.status)}
                      size="small"
                    />
                    {campaign.status === "Sending" && (
                      <LinearProgress sx={{ width: 80 }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {campaign.sentDate ? 
                      `Sent: ${new Date(campaign.sentDate).toLocaleString()}` :
                      campaign.scheduledDate ?
                      `Scheduled: ${new Date(campaign.scheduledDate).toLocaleString()}` :
                      "Not scheduled"
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  {campaign.status === "Sent" ? (
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        📱 {campaign.totalSent} sent
                      </Typography>
                      <Typography variant="body2">
                        ✅ {campaign.deliveryRate}% delivered ({campaign.totalDelivered})
                      </Typography>
                      <Typography variant="body2">
                        💬 {campaign.responseRate}% responded ({campaign.totalResponses})
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data yet
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ${campaign.estimatedCost.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    estimated
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Campaign">
                      <IconButton
                        size="small"
                        onClick={() => handleEditCampaign(campaign)}
                        disabled={campaign.status === "Sent" || campaign.status === "Sending"}
                      >
                        <OpenInNewRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    {(campaign.status === "Draft" || campaign.status === "Scheduled") && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SendRoundedIcon />}
                        onClick={() => handleSendNow(campaign.id)}
                        disabled={campaign.status === "Sending"}
                      >
                        Send Now
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCampaign ? "Edit SMS Campaign" : "Create SMS Campaign"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="Campaign Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select
                    label="Template"
                    value={formData.selectedTemplate}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      setFormData({
                        ...formData,
                        selectedTemplate: e.target.value,
                        message: template ? template.content : formData.message
                      });
                    }}
                  >
                    <MenuItem value="">No Template</MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <TextField
                label="SMS Message"
                fullWidth
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your SMS message here. Use variables like {TENANT_NAME}, {RENT_AMOUNT}, etc."
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {characterCount}/160 characters • {smsSegments} segment{smsSegments > 1 ? 's' : ''}
                </Typography>
                <Typography variant="caption" color={remainingChars <= 20 ? "error" : "text.secondary"}>
                  {remainingChars} remaining in current segment
                </Typography>
              </Stack>
              {smsSegments > 1 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Your message will be sent as {smsSegments} segments, which may increase costs.
                </Alert>
              )}
            </Box>

            <FormControl fullWidth>
              <InputLabel>Recipient Groups</InputLabel>
              <Select
                multiple
                value={formData.recipientGroups}
                onChange={(e) => setFormData({ ...formData, recipientGroups: e.target.value as string[] })}
                input={<OutlinedInput label="Recipient Groups" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {recipientGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    <Checkbox checked={formData.recipientGroups.indexOf(group) > -1} />
                    <ListItemText primary={group} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Additional Recipients (comma separated)"
              fullWidth
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="+15551234567, +15559876543"
              helperText="Enter phone numbers with country code (+1 for US)"
            />

            <Divider />
            <Typography variant="h6">Schedule Options</Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Schedule Date"
                  type="date"
                  fullWidth
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave empty to save as draft"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Schedule Time"
                  type="time"
                  fullWidth
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Alert severity="info">
              <Typography variant="subtitle2">Available Variables:</Typography>
              <Typography variant="body2">
                {`{TENANT_NAME}, {RENT_AMOUNT}, {PROPERTY_NAME}, {PAYMENT_LINK}, {OFFICE_PHONE}, {MANAGER_PHONE}, {AGENT_PHONE}, {BOOKING_LINK}`}
              </Typography>
            </Alert>

            <Divider />
            <Typography variant="h6">Template Options</Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.saveAsTemplate}
                      onChange={(e) => setFormData({ ...formData, saveAsTemplate: e.target.checked })}
                    />
                  }
                  label="Save as Template"
                />
              </Grid>
              {formData.saveAsTemplate && (
                <Grid item xs={8}>
                  <TextField
                    label="Template Name"
                    fullWidth
                    required
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    placeholder="Enter a name for this template"
                  />
                </Grid>
              )}
            </Grid>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Estimated Cost:</strong> ${(smsSegments * (formData.recipientGroups.length * 15 + formData.recipients.split(',').filter(r => r.trim()).length) * 0.10).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Based on {smsSegments} segment(s) × estimated recipients × $0.10 per segment
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {formData.saveAsTemplate && (
            <Button
              variant="outlined"
              startIcon={<SaveRoundedIcon />}
              onClick={() => {
                if (!formData.templateName.trim()) {
                  alert("Please enter a template name");
                  return;
                }
                const newTemplate = {
                  id: Date.now().toString(),
                  name: formData.templateName,
                  content: formData.message,
                };
                setTemplates(prev => [...prev, newTemplate]);
                alert("SMS template saved successfully!");
              }}
            >
              Save Template Only
            </Button>
          )}
          <Button variant="outlined" onClick={handleSaveCampaign}>
            Save as Draft
          </Button>
          <Button variant="contained" onClick={handleSaveCampaign} startIcon={<SendRoundedIcon />}>
            {formData.scheduleDate ? "Schedule Campaign" : "Send Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
