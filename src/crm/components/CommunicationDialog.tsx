import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Stack,
  Typography,
  Box,
  Alert,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Divider
} from '@mui/material';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CommunicationDialogProps {
  open: boolean;
  onClose: () => void;
  contact: Contact | null;
  defaultMessage?: string;
  title?: string;
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
      id={`communication-tabpanel-${index}`}
      aria-labelledby={`communication-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const communicationTemplates = {
  email: [
    { 
      name: "Property Available", 
      subject: "Great News! Property Available",
      content: "Hi {firstName},\n\nI hope this email finds you well. I wanted to reach out with some exciting news - we have a property that matches your criteria that has just become available!\n\nProperty Details:\n- Location: [Property Address]\n- Type: [Property Type]\n- Rent: [Monthly Rent]\n\nWould you be interested in scheduling a viewing? Please let me know your availability and I'll arrange a time that works for you.\n\nBest regards,\n[Your Name]" 
    },
    { 
      name: "Follow Up", 
      subject: "Following up on your property inquiry",
      content: "Hi {firstName},\n\nI wanted to follow up on your recent inquiry about available properties. Do you have any questions or would you like to schedule a viewing?\n\nI'm here to help make your property search as smooth as possible.\n\nBest regards,\n[Your Name]" 
    }
  ],
  sms: [
    { 
      name: "Property Available", 
      content: "Hi {firstName}! Good news - we have a property matching your criteria available. {propertyAddress}. Interested in viewing? Reply YES to schedule. - [Your Name]" 
    },
    { 
      name: "Quick Follow Up", 
      content: "Hi {firstName}, just checking in on your property search. Any questions? Feel free to call me anytime. - [Your Name]" 
    }
  ]
};

export default function CommunicationDialog({ 
  open, 
  onClose, 
  contact, 
  defaultMessage = "",
  title = "Contact Customer"
}: CommunicationDialogProps) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailContent, setEmailContent] = React.useState(defaultMessage);
  const [smsContent, setSmsContent] = React.useState(defaultMessage);
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTemplateSelect = (template: any) => {
    if (selectedTab === 0) { // Email
      setEmailSubject(template.subject || "");
      setEmailContent(template.content.replace('{firstName}', contact?.firstName || ''));
    } else if (selectedTab === 1) { // SMS
      setSmsContent(template.content.replace('{firstName}', contact?.firstName || ''));
    }
  };

  const handleSendEmail = async () => {
    if (!contact || !emailSubject.trim() || !emailContent.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      alert(`Email sent successfully to ${contact.firstName} ${contact.lastName} (${contact.email})`);
      onClose();
    }, 2000);
  };

  const handleSendSMS = async () => {
    if (!contact || !smsContent.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsSending(true);
    
    // Simulate sending SMS
    setTimeout(() => {
      setIsSending(false);
      alert(`SMS sent successfully to ${contact.firstName} ${contact.lastName} (${contact.phone})`);
      onClose();
    }, 2000);
  };

  const handleMakeCall = () => {
    if (!contact) return;
    
    // In a real implementation, this would integrate with a phone system
    alert(`Initiating call to ${contact.firstName} ${contact.lastName} at ${contact.phone}. In a real implementation, this would connect to your phone system or VoIP service.`);
    onClose();
  };

  React.useEffect(() => {
    if (open && defaultMessage) {
      setEmailContent(defaultMessage);
      setSmsContent(defaultMessage);
    }
  }, [open, defaultMessage]);

  if (!contact) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar>
            <PersonRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.firstName} {contact.lastName}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%' }}>
          {/* Contact Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip 
                icon={<EmailRoundedIcon />} 
                label={contact.email} 
                variant="outlined" 
                size="small" 
              />
              <Chip 
                icon={<PhoneRoundedIcon />} 
                label={contact.phone} 
                variant="outlined" 
                size="small" 
              />
            </Stack>
          </Alert>

          {/* Communication Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab 
                icon={<EmailRoundedIcon />} 
                label="Email" 
                iconPosition="start"
              />
              <Tab 
                icon={<SmsRoundedIcon />} 
                label="SMS" 
                iconPosition="start"
              />
              <Tab 
                icon={<PhoneRoundedIcon />} 
                label="Call" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Email Tab */}
          <TabPanel value={selectedTab} index={0}>
            <Stack spacing={3}>
              {/* Email Templates */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Quick Templates:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {communicationTemplates.email.map((template, index) => (
                    <Chip
                      key={index}
                      label={template.name}
                      variant="outlined"
                      clickable
                      onClick={() => handleTemplateSelect(template)}
                    />
                  ))}
                </Stack>
              </Box>

              <TextField
                label="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Message"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                fullWidth
                multiline
                rows={8}
                required
                placeholder="Type your email message here..."
              />
            </Stack>
          </TabPanel>

          {/* SMS Tab */}
          <TabPanel value={selectedTab} index={1}>
            <Stack spacing={3}>
              {/* SMS Templates */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Quick Templates:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {communicationTemplates.sms.map((template, index) => (
                    <Chip
                      key={index}
                      label={template.name}
                      variant="outlined"
                      clickable
                      onClick={() => handleTemplateSelect(template)}
                    />
                  ))}
                </Stack>
              </Box>

              <TextField
                label="SMS Message"
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                fullWidth
                multiline
                rows={4}
                required
                placeholder="Type your SMS message here..."
                helperText={`${smsContent.length}/160 characters`}
                inputProps={{ maxLength: 160 }}
              />
            </Stack>
          </TabPanel>

          {/* Call Tab */}
          <TabPanel value={selectedTab} index={2}>
            <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
              <PhoneRoundedIcon sx={{ fontSize: 64, color: 'primary.main' }} />
              <Typography variant="h6" textAlign="center">
                Ready to call {contact.firstName} {contact.lastName}?
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Phone: {contact.phone}
              </Typography>
              <Alert severity="info" sx={{ width: '100%' }}>
                This will initiate a call through your configured phone system or VoIP service.
              </Alert>
            </Stack>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSending}>
          Cancel
        </Button>
        
        {selectedTab === 0 && (
          <Button 
            variant="contained" 
            onClick={handleSendEmail}
            disabled={isSending || !emailSubject.trim() || !emailContent.trim()}
            startIcon={<SendRoundedIcon />}
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        )}
        
        {selectedTab === 1 && (
          <Button 
            variant="contained" 
            onClick={handleSendSMS}
            disabled={isSending || !smsContent.trim()}
            startIcon={<SendRoundedIcon />}
          >
            {isSending ? 'Sending...' : 'Send SMS'}
          </Button>
        )}
        
        {selectedTab === 2 && (
          <Button 
            variant="contained" 
            onClick={handleMakeCall}
            startIcon={<PhoneRoundedIcon />}
            color="success"
          >
            Start Call
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export type { Contact };
