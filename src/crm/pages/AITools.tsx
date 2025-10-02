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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Avatar,
  Tooltip,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { uniformTooltipStyles } from "../utils/formStyles";
<<<<<<< HEAD
=======
import AIInsightsDashboard from "../components/AIInsightsDashboard";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
}

interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isEnabled: boolean;
}

interface TutorSession {
  id: string;
  topic: string;
  progress: number;
  status: "active" | "completed" | "paused";
  startTime: string;
  duration: number;
  messages: ChatMessage[];
}

interface AgenticTask {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  result?: string;
  logs: string[];
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tools-tabpanel-${index}`}
      aria-labelledby={`ai-tools-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AITools() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [openChatGPTDialog, setOpenChatGPTDialog] = React.useState(false);
  const [openTutorDialog, setOpenTutorDialog] = React.useState(false);
  const [openAgenticDialog, setOpenAgenticDialog] = React.useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = React.useState(false);

  // ChatGPT Integration States
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you with your property management tasks today?",
      timestamp: new Date().toISOString(),
      model: "gpt-4"
    }
  ]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  // AI Configuration
  const [aiConfig, setAiConfig] = React.useState<AIConfig>({
    apiKey: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
    isEnabled: false
  });

  // Tutor States
  const [tutorSessions, setTutorSessions] = React.useState<TutorSession[]>([
    {
      id: "session-1",
      topic: "Property Management Best Practices",
      progress: 65,
      status: "active",
      startTime: "2024-01-20T10:00:00Z",
      duration: 45,
      messages: []
    },
    {
      id: "session-2", 
      topic: "Tenant Communication Strategies",
      progress: 100,
      status: "completed",
      startTime: "2024-01-19T14:00:00Z",
      duration: 60,
      messages: []
    }
  ]);

  // Agentic AI States
  const [agenticTasks, setAgenticTasks] = React.useState<AgenticTask[]>([
    {
      id: "task-1",
      name: "Monthly Report Generation",
      description: "Automatically generate comprehensive monthly property reports",
      status: "running",
      progress: 75,
      createdAt: "2024-01-20T09:00:00Z",
      logs: [
        "Started data collection...",
        "Processing tenant data...",
        "Generating analytics...",
        "Compiling report sections..."
      ]
    },
    {
      id: "task-2",
      name: "Lead Qualification",
      description: "Analyze and score incoming leads based on criteria",
      status: "completed",
      progress: 100,
      createdAt: "2024-01-20T08:00:00Z",
      completedAt: "2024-01-20T08:15:00Z",
      result: "Processed 15 leads, 8 qualified for follow-up",
      logs: [
        "Loading lead data...",
        "Applying qualification criteria...",
        "Scoring leads...",
        "Task completed successfully"
      ]
    }
  ]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you're asking about "${newMessage}". For property management, I recommend focusing on tenant satisfaction, regular maintenance schedules, and clear communication channels. Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date().toISOString(),
        model: aiConfig.model,
        tokens: 85
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  const startTutorSession = (topic: string) => {
    const newSession: TutorSession = {
      id: `session-${Date.now()}`,
      topic,
      progress: 0,
      status: "active",
      startTime: new Date().toISOString(),
      duration: 0,
      messages: [
        {
          id: "1",
          type: "assistant",
          content: `Welcome to the ${topic} tutorial! I'll guide you through the key concepts step by step. Let's start with the basics. What's your current experience level with this topic?`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    setTutorSessions(prev => [...prev, newSession]);
    setOpenTutorDialog(true);
  };

  const createAgenticTask = (name: string, description: string) => {
    const newTask: AgenticTask = {
      id: `task-${Date.now()}`,
      name,
      description,
      status: "pending",
      progress: 0,
      createdAt: new Date().toISOString(),
      logs: ["Task created and queued for execution..."]
    };
    setAgenticTasks(prev => [...prev, newTask]);
    
    // Simulate task execution
    setTimeout(() => {
      setAgenticTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: "running", logs: [...task.logs, "Task execution started..."] }
          : task
      ));
    }, 1000);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          🤖 AI Tools
        </Typography>
        <Button
          variant="outlined"
          startIcon={<SettingsRoundedIcon />}
          onClick={() => setOpenSettingsDialog(true)}
        >
          AI Settings
        </Button>
      </Stack>

      {/* AI Tools Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}
            onClick={() => {
              if (aiConfig.isEnabled) {
                setCurrentTab(0);
                setOpenChatGPTDialog(true);
              } else {
                setOpenSettingsDialog(true);
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main", width: 60, height: 60 }}>
                  <ChatRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">ChatGPT Integration</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered assistant for property management tasks
                  </Typography>
                  <Typography variant="caption" color={aiConfig.isEnabled ? "success.main" : "error.main"}>
                    {aiConfig.isEnabled ? "Active" : "Configuration needed"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main", width: 60, height: 60 }}>
                  <SchoolRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">AI Tutor</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Guided learning for CRM features and best practices
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {tutorSessions.filter(s => s.status === 'active').length} active sessions
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main", width: 60, height: 60 }}>
                  <AutoAwesomeRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Agentic AI</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Autonomous task execution and workflow automation
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    {agenticTasks.filter(t => t.status === 'running').length} tasks running
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* DALL·E 2 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "purple", width: 60, height: 60 }}>
                  <AutoAwesomeRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">DALL·E 2</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI image generation for property marketing materials
                  </Typography>
                  <Typography variant="caption" sx={{ color: "purple" }}>
                    50+ images generated
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

<<<<<<< HEAD
=======
        {/* AI Insights Dashboard */}
        <Grid item xs={12}>
          <AIInsightsDashboard />
        </Grid>

>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
        {/* Copy.ai */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main", width: 60, height: 60 }}>
                  <EditRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Copy.ai</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI copywriting for listings, emails, and marketing
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    125 copies generated
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Voilà.ai */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "secondary.main", width: 60, height: 60 }}>
                  <SupportAgentRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Voilà.ai</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI writing assistant for professional communications
                  </Typography>
                  <Typography variant="caption" color="secondary.main">
                    Ready to use
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedx */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.dark", width: 60, height: 60 }}>
                  <CalendarTodayRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Schedx</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered scheduling for property tours and meetings
                  </Typography>
                  <Typography variant="caption" color="success.dark">
                    45 meetings scheduled
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Claptools */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main", width: 60, height: 60 }}>
                  <TrendingUpRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Claptools</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered video and media creation tools
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    15 videos created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Overview */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">AI Integration Status</Typography>
        <Typography variant="body2">
          {aiConfig.isEnabled 
            ? "AI tools are configured and ready to use. Click on any tool below to get started."
            : "Configure your AI settings to unlock powerful automation and assistance features."}
        </Typography>
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab
            icon={<ChatRoundedIcon />}
            label="ChatGPT Assistant"
            iconPosition="start"
          />
          <Tab
            icon={<SchoolRoundedIcon />}
            label="AI Tutor"
            iconPosition="start"
          />
          <Tab
            icon={<AutoAwesomeRoundedIcon />}
            label="Agentic AI"
            iconPosition="start"
          />
          <Tab
            icon={<AnalyticsRoundedIcon />}
            label="AI Analytics"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* ChatGPT Assistant Tab */}
      <TabPanel value={currentTab} index={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">ChatGPT Assistant</Typography>
          <Button
            variant="contained"
            startIcon={<ChatRoundedIcon />}
            onClick={() => setOpenChatGPTDialog(true)}
            disabled={!aiConfig.isEnabled}
          >
            Open Chat
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Conversations</Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {chatMessages.slice(-5).map((message) => (
                    <Box key={message.id} sx={{ mb: 2, p: 2, bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100', borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                        <Typography variant="subtitle2">
                          {message.type === 'user' ? 'You' : 'AI Assistant'}
                        </Typography>
                        <Typography variant="caption">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {message.content}
                      </Typography>
                      {message.tokens && (
                        <Typography variant="caption" color="text.secondary">
                          {message.tokens} tokens • {message.model}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<HelpRoundedIcon />}
                    onClick={() => alert('Property Management Help: Access our comprehensive guides and documentation in the Help & Support section.')}
                  >
                    Property Management Help
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AnalyticsRoundedIcon />}
                    onClick={() => alert('Generate Report: Use the Analytics & Insights page to create detailed reports.')}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SupportAgentRoundedIcon />}
                    onClick={() => alert('Draft Tenant Response: AI-powered response drafting coming soon!')}
                  >
                    Draft Tenant Response
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrendingUpRoundedIcon />}
                    onClick={() => alert('Market Analysis: Advanced market analysis tools coming soon!')}
                  >
                    Market Analysis
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* AI Tutor Tab */}
      <TabPanel value={currentTab} index={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">AI Tutor Sessions</Typography>
          <Button
            variant="contained"
            startIcon={<SchoolRoundedIcon />}
            onClick={() => setOpenTutorDialog(true)}
          >
            Start New Session
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {tutorSessions.map((session) => (
            <Grid item xs={12} md={6} key={session.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6">{session.topic}</Typography>
                        <Chip 
                          label={session.status} 
                          size="small" 
                          color={session.status === 'active' ? 'success' : session.status === 'completed' ? 'primary' : 'default'} 
                        />
                      </Box>
                      <Typography variant="h4" color="primary.main">
                        📚
                      </Typography>
                    </Stack>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2" color="primary.main">{session.progress}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, session.progress || 0))} sx={{ mt: 1 }} />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Started: {new Date(session.startTime).toLocaleDateString()}
                      {session.duration > 0 && ` • Duration: ${session.duration} min`}
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={session.status === 'active' ? <PlayArrowRoundedIcon /> : <RefreshRoundedIcon />}
                      onClick={() => setOpenTutorDialog(true)}
                    >
                      {session.status === 'active' ? 'Continue Session' : 'Review Session'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Available Tutorials</Typography>
        <Grid container spacing={2}>
          {[
            "CRM Navigation Basics",
            "Property Management Workflow", 
            "Tenant Communication Best Practices",
            "Report Generation & Analytics",
            "Marketing Campaign Setup",
            "Maintenance Request Handling"
          ].map((topic, index) => (
            <Grid item xs={12} sm={6} md={4} key={topic}>
              <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' }, transition: 'transform 0.2s' }}>
                <CardContent>
                  <Stack spacing={1} alignItems="center">
                    <Typography variant="subtitle1" textAlign="center">{topic}</Typography>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => startTutorSession(topic)}
                    >
                      Start Tutorial
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Agentic AI Tab */}
      <TabPanel value={currentTab} index={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Agentic AI Tasks</Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => setOpenAgenticDialog(true)}
          >
            Create Task
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {agenticTasks.map((task) => (
            <Grid item xs={12} md={6} key={task.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6">{task.name}</Typography>
                        <Chip 
                          label={task.status} 
                          size="small" 
                          color={
                            task.status === 'running' ? 'warning' : 
                            task.status === 'completed' ? 'success' : 
                            task.status === 'failed' ? 'error' : 'default'
                          } 
                        />
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {task.status === 'running' && (
                          <IconButton size="small">
                            <StopRoundedIcon />
                          </IconButton>
                        )}
                        <IconButton size="small">
                          <RefreshRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      {task.description}
                    </Typography>
                    
                    {task.status === 'running' && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Progress</Typography>
                          <Typography variant="body2" color="warning.main">{task.progress}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, task.progress || 0))} sx={{ mt: 1 }} />
                      </Box>
                    )}
                    
                    {task.result && (
                      <Alert severity="success" variant="outlined">
                        <Typography variant="body2">{task.result}</Typography>
                      </Alert>
                    )}
                    
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography variant="subtitle2">Execution Logs</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {task.logs.map((log, index) => (
                            <ListItem key={index}>
                              <ListItemText 
                                primary={log}
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* AI Analytics Tab */}
      <TabPanel value={currentTab} index={3}>
        <Typography variant="h5" gutterBottom>AI Analytics & Usage</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Token Usage</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">This Month</Typography>
                      <Typography variant="body2" fontWeight="bold">12,547 tokens</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={65} sx={{ mt: 1 }} />
                    <Typography variant="caption" color="text.secondary">65% of monthly limit</Typography>
                  </Box>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Cost Estimate</Typography>
                    <Typography variant="body2" color="success.main">$8.45</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Usage Breakdown</Typography>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Chat Conversations</Typography>
                    <Typography variant="body2">45%</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Report Generation</Typography>
                    <Typography variant="body2">30%</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Agentic Tasks</Typography>
                    <Typography variant="body2">25%</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ChatGPT Dialog */}
      <Dialog open={openChatGPTDialog} onClose={() => setOpenChatGPTDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>ChatGPT Assistant</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, mb: 2, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
            {chatMessages.map((message) => (
              <Box key={message.id} sx={{ mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main' }}>
                    {message.type === 'user' ? <PersonRoundedIcon /> : <SmartToyRoundedIcon />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
            {isProcessing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">AI is thinking...</Typography>
              </Box>
            )}
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isProcessing}
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChatGPTDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Configuration Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Configure your OpenAI API key to enable ChatGPT integration. Your API key is stored securely and never shared.
            </Alert>
            <TextField
              label="OpenAI API Key"
              type="password"
              fullWidth
              value={aiConfig.apiKey}
              onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
              placeholder="sk-..."
            />
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={aiConfig.model}
                label="Model"
                onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
              >
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Temperature"
              type="number"
              fullWidth
              value={aiConfig.temperature}
              onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
              inputProps={{ min: 0, max: 2, step: 0.1 }}
              helperText="Controls randomness (0 = focused, 2 = creative)"
            />
            <TextField
              label="Max Tokens"
              type="number"
              fullWidth
              value={aiConfig.maxTokens}
              onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: 4000 }}
              helperText="Maximum tokens per response"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={aiConfig.isEnabled}
                  onChange={(e) => setAiConfig({ ...aiConfig, isEnabled: e.target.checked })}
                />
              }
              label="Enable AI Integration"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenSettingsDialog(false);
              alert("AI settings saved successfully!");
            }}
            startIcon={<SaveRoundedIcon />}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tutor Dialog */}
      <Dialog open={openTutorDialog} onClose={() => setOpenTutorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Start AI Tutor Session</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Choose a topic to start an interactive AI tutoring session. The AI will guide you through concepts step by step.
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Tutorial Topic</InputLabel>
              <Select defaultValue="" label="Tutorial Topic">
                <MenuItem value="crm-basics">CRM Navigation Basics</MenuItem>
                <MenuItem value="property-mgmt">Property Management Workflow</MenuItem>
                <MenuItem value="tenant-comm">Tenant Communication Best Practices</MenuItem>
                <MenuItem value="reports">Report Generation & Analytics</MenuItem>
                <MenuItem value="marketing">Marketing Campaign Setup</MenuItem>
                <MenuItem value="maintenance">Maintenance Request Handling</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Learning Goals (Optional)"
              fullWidth
              multiline
              rows={3}
              placeholder="What specific aspects would you like to focus on?"
            />
            <FormControl fullWidth>
              <InputLabel>Session Duration</InputLabel>
              <Select defaultValue="30" label="Session Duration">
                <MenuItem value="15">15 minutes</MenuItem>
                <MenuItem value="30">30 minutes</MenuItem>
                <MenuItem value="45">45 minutes</MenuItem>
                <MenuItem value="60">60 minutes</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTutorDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenTutorDialog(false);
              alert("AI Tutor session started! The AI will begin guiding you through the selected topic.");
            }}
            startIcon={<PlayArrowRoundedIcon />}
          >
            Start Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agentic Task Dialog */}
      <Dialog open={openAgenticDialog} onClose={() => setOpenAgenticDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Agentic AI Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Agentic AI can autonomously execute complex tasks. Define what you want to accomplish and the AI will break it down into steps and execute them.
            </Alert>
            <TextField
              label="Task Name"
              fullWidth
              placeholder="e.g., Generate Monthly Performance Report"
            />
            <TextField
              label="Task Description"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe what you want the AI to accomplish..."
            />
            <FormControl fullWidth>
              <InputLabel>Task Category</InputLabel>
              <Select defaultValue="" label="Task Category">
                <MenuItem value="reporting">Report Generation</MenuItem>
                <MenuItem value="analysis">Data Analysis</MenuItem>
                <MenuItem value="communication">Communication</MenuItem>
                <MenuItem value="automation">Process Automation</MenuItem>
                <MenuItem value="research">Market Research</MenuItem>
                <MenuItem value="compliance">Compliance Checking</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select defaultValue="medium" label="Priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch />}
              label="Execute immediately"
              helperText="Start task execution right away, or schedule for later"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAgenticDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenAgenticDialog(false);
              createAgenticTask("Custom Task", "User-defined autonomous task");
            }}
            startIcon={<AutoAwesomeRoundedIcon />}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Quick AI Access */}
      <Fab
        color="primary"
        aria-label="Quick AI Chat"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenChatGPTDialog(true)}
      >
        <SmartToyRoundedIcon />
      </Fab>
    </Box>
  );
}
