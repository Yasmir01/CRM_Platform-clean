import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Divider,
  Stack,
  Alert,
  LinearProgress,
  Tooltip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import FaxIcon from '@mui/icons-material/Fax';
import ChatIcon from '@mui/icons-material/Chat';
import ReplyIcon from '@mui/icons-material/Reply';
import ForwardIcon from '@mui/icons-material/Forward';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TimelineIcon from '@mui/icons-material/Timeline';;
import { formatDistanceToNow } from 'date-fns';

interface CommunicationItem {
  id: string;
  type: 'email' | 'sms' | 'phone' | 'fax' | 'chat' | 'video';
  contactId: string;
  contactName: string;
  contactType: 'tenant' | 'prospect' | 'vendor' | 'manager';
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  direction: 'inbound' | 'outbound';
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  starred: boolean;
  propertyId?: string;
  propertyName?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiSuggestions?: string[];
  responseTime?: number; // in minutes
  campaignId?: string;
}

interface CommunicationStats {
  totalCommunications: number;
  todayCount: number;
  responseRate: number;
  avgResponseTime: number;
  channelBreakdown: Record<string, number>;
  sentimentBreakdown: Record<string, number>;
  pendingActions: number;
}

const mockCommunications: CommunicationItem[] = [
  {
    id: 'comm_001',
    type: 'email',
    contactId: 'tenant_001',
    contactName: 'Sarah Johnson',
    contactType: 'tenant',
    subject: 'Maintenance Request Follow-up',
    content: 'Thank you for submitting your maintenance request. Our team will be there tomorrow at 2 PM.',
    status: 'read',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    starred: false,
    propertyId: 'prop_001',
    propertyName: 'Sunset Apartments',
    sentiment: 'positive',
    responseTime: 15
  },
  {
    id: 'comm_002',
    type: 'sms',
    contactId: 'prospect_001',
    contactName: 'Michael Chen',
    contactType: 'prospect',
    content: 'Hi! I\'m interested in viewing the 2BR unit at Riverside Commons. When would be a good time?',
    status: 'delivered',
    direction: 'inbound',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    priority: 'high',
    starred: true,
    propertyId: 'prop_002',
    propertyName: 'Riverside Commons',
    sentiment: 'positive',
    aiSuggestions: [
      'Suggest available viewing slots today and tomorrow',
      'Ask about preferred contact method',
      'Send property highlights and virtual tour link'
    ]
  },
  {
    id: 'comm_003',
    type: 'phone',
    contactId: 'vendor_001',
    contactName: 'ABC Maintenance Co.',
    contactType: 'vendor',
    content: 'Called regarding urgent HVAC repair - unit 204. Scheduled for emergency service.',
    status: 'delivered',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: 'urgent',
    starred: false,
    propertyId: 'prop_001',
    propertyName: 'Sunset Apartments',
    sentiment: 'neutral',
    responseTime: 5
  },
  {
    id: 'comm_004',
    type: 'email',
    contactId: 'prospect_002',
    contactName: 'Emily Rodriguez',
    contactType: 'prospect',
    subject: 'Application Status Update',
    content: 'Your rental application has been approved! Please check your email for next steps.',
    status: 'sent',
    direction: 'outbound',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    priority: 'high',
    starred: true,
    sentiment: 'positive',
    campaignId: 'camp_001'
  }
];

const UnifiedCommunicationDashboard: React.FC = () => {
  const [communications, setCommunications] = useState<CommunicationItem[]>(mockCommunications);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [quickReplyOpen, setQuickReplyOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState<CommunicationItem | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const stats: CommunicationStats = {
    totalCommunications: communications.length,
    todayCount: communications.filter(c => 
      new Date(c.timestamp).toDateString() === new Date().toDateString()
    ).length,
    responseRate: 94.2,
    avgResponseTime: 23,
    channelBreakdown: {
      email: communications.filter(c => c.type === 'email').length,
      sms: communications.filter(c => c.type === 'sms').length,
      phone: communications.filter(c => c.type === 'phone').length,
      fax: communications.filter(c => c.type === 'fax').length,
      chat: communications.filter(c => c.type === 'chat').length,
      video: communications.filter(c => c.type === 'video').length
    },
    sentimentBreakdown: {
      positive: communications.filter(c => c.sentiment === 'positive').length,
      neutral: communications.filter(c => c.sentiment === 'neutral').length,
      negative: communications.filter(c => c.sentiment === 'negative').length
    },
    pendingActions: communications.filter(c => c.direction === 'inbound' && !c.starred).length
  };

  const filteredCommunications = communications.filter(comm => {
    const channelMatch = selectedChannel === 'all' || comm.type === selectedChannel;
    const priorityMatch = selectedPriority === 'all' || comm.priority === selectedPriority;
    return channelMatch && priorityMatch;
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'phone': return <PhoneIcon />;
      case 'fax': return <FaxIcon />;
      case 'chat': return <ChatIcon />;
      case 'video': return <VideoCallIcon />;
      default: return <EmailIcon />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case 'email': return 'primary';
      case 'sms': return 'success';
      case 'phone': return 'info';
      case 'fax': return 'secondary';
      case 'chat': return 'warning';
      case 'video': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'info';
      default: return 'default';
    }
  };

  const handleQuickReply = (comm: CommunicationItem) => {
    setSelectedComm(comm);
    setQuickReplyOpen(true);
  };

  const handleSendReply = () => {
    if (selectedComm && replyMessage.trim()) {
      // Here you would implement the actual sending logic
      console.log('Sending reply:', replyMessage);
      setQuickReplyOpen(false);
      setReplyMessage('');
      setSelectedComm(null);
    }
  };

  const toggleStar = (commId: string) => {
    setCommunications(prev => 
      prev.map(comm => 
        comm.id === commId ? { ...comm, starred: !comm.starred } : comm
      )
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TimelineIcon />
        Unified Communication Center
      </Typography>

      {/* Communication Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Today's Communications
                  </Typography>
                  <Typography variant="h4">{stats.todayCount}</Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Response Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.responseRate}%
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.avgResponseTime}m
                  </Typography>
                </Box>
                <SpeedIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Pending Actions
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingActions}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Channel Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            Communication Channels Today
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.channelBreakdown).map(([channel, count]) => (
              <Grid item xs={6} sm={4} md={2} key={channel}>
                <Card variant="outlined" sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ color: `${getChannelColor(channel)}.main`, mb: 1 }}>
                    {getChannelIcon(channel)}
                  </Box>
                  <Typography variant="h6">{count}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {channel.toUpperCase()}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Filters and Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Channel</InputLabel>
              <Select
                value={selectedChannel}
                label="Channel"
                onChange={(e) => setSelectedChannel(e.target.value)}
              >
                <MenuItem value="all">All Channels</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="fax">Fax</MenuItem>
                <MenuItem value="chat">Chat</MenuItem>
                <MenuItem value="video">Video</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedPriority}
                label="Priority"
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="All Communications" />
            <Tab label="Inbound" />
            <Tab label="Outbound" />
            <Tab label="Starred" />
            <Tab label="Pending Actions" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Communication List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Communications ({filteredCommunications.length})
          </Typography>
          
          <List>
            {filteredCommunications.map((comm, index) => (
              <React.Fragment key={comm.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Badge
                      badgeContent={getChannelIcon(comm.type)}
                      color={getChannelColor(comm.type) as any}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar sx={{ bgcolor: getSentimentColor(comm.sentiment) + '.light' }}>
                        {comm.contactName.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {comm.contactName}
                        </Typography>
                        <Chip 
                          label={comm.contactType} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={comm.priority} 
                          size="small" 
                          color={getPriorityColor(comm.priority) as any}
                        />
                        {comm.direction === 'inbound' && (
                          <Chip 
                            label="Needs Response" 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        )}
                        {comm.aiSuggestions && (
                          <Tooltip title="AI suggestions available">
                            <AutoAwesomeIcon color="primary" fontSize="small" />
                          </Tooltip>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Box>
                        {comm.subject && (
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            {comm.subject}
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {comm.content}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(comm.timestamp), { addSuffix: true })}
                          </Typography>
                          {comm.propertyName && (
                            <Chip label={comm.propertyName} size="small" variant="outlined" />
                          )}
                          {comm.responseTime && (
                            <Typography variant="caption" color="success.main">
                              Responded in {comm.responseTime}m
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => toggleStar(comm.id)}
                        color={comm.starred ? 'primary' : 'default'}
                      >
                        {comm.starred ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleQuickReply(comm)}
                        color="primary"
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredCommunications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Quick Reply Dialog */}
      <Dialog open={quickReplyOpen} onClose={() => setQuickReplyOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Quick Reply to {selectedComm?.contactName}
        </DialogTitle>
        <DialogContent>
          {selectedComm?.aiSuggestions && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                AI Suggestions:
              </Typography>
              {selectedComm.aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => setReplyMessage(suggestion)}
                  sx={{ mr: 1, mb: 1 }}
                >
                  {suggestion}
                </Button>
              ))}
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Reply"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your response..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickReplyOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendReply} 
            variant="contained"
            disabled={!replyMessage.trim()}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedCommunicationDashboard;
