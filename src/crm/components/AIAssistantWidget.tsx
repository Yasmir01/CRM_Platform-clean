import * as React from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Slide,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: string;
  suggestions?: string[];
  actionButtons?: Array<{
    label: string;
    action: string;
    variant?: 'contained' | 'outlined';
  }>;
}

interface TaskAutomation {
  id: string;
  title: string;
  description: string;
  category: 'properties' | 'tenants' | 'communications' | 'reports' | 'maintenance' | 'general';
  estimatedTime: string;
  complexity: 'simple' | 'medium' | 'complex';
  status: 'available' | 'in_progress' | 'completed';
}

const mockAutomations: TaskAutomation[] = [
  {
    id: 'auto-1',
    title: 'Generate Property Report',
    description: 'Create a comprehensive property performance report for the last quarter',
    category: 'reports',
    estimatedTime: '2 minutes',
    complexity: 'simple',
    status: 'available'
  },
  {
    id: 'auto-2',
    title: 'Send Rent Reminders',
    description: 'Automatically send rent reminder emails to tenants with upcoming due dates',
    category: 'communications',
    estimatedTime: '30 seconds',
    complexity: 'simple',
    status: 'available'
  },
  {
    id: 'auto-3',
    title: 'Update Property Listings',
    description: 'Sync property information across all listing platforms',
    category: 'properties',
    estimatedTime: '5 minutes',
    complexity: 'medium',
    status: 'available'
  },
  {
    id: 'auto-4',
    title: 'Maintenance Schedule Optimization',
    description: 'Analyze and optimize maintenance schedules based on property history',
    category: 'maintenance',
    estimatedTime: '3 minutes',
    complexity: 'complex',
    status: 'available'
  }
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      message: 'Hello! I\'m your AI assistant. I can help you automate CRM tasks, generate reports, send communications, and much more. What would you like to do today?',
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        'Show me available automations',
        'Generate a property report',
        'Send tenant communications',
        'Help with maintenance scheduling'
      ]
    }
  ]);
  const [automations, setAutomations] = React.useState<TaskAutomation[]>(mockAutomations);
  const [currentView, setCurrentView] = React.useState<'chat' | 'automations'>('chat');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(inputValue);
      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    if (input.includes('automation') || input.includes('available')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: 'I found several automations available for you. Here are the most relevant ones based on your current workflow:',
        timestamp: new Date().toLocaleTimeString(),
        actionButtons: [
          { label: 'View All Automations', action: 'show_automations', variant: 'contained' },
          { label: 'Quick Setup', action: 'quick_setup', variant: 'outlined' }
        ]
      };
    } else if (input.includes('report') || input.includes('analytics')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: 'I can generate various reports for you. What type of report would you like?',
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          'Property performance report',
          'Tenant payment analytics',
          'Maintenance cost analysis',
          'Occupancy rate trends'
        ]
      };
    } else if (input.includes('communication') || input.includes('email') || input.includes('tenant')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: 'I can help you with tenant communications. I can send rent reminders, maintenance notifications, or custom messages.',
        timestamp: new Date().toLocaleTimeString(),
        actionButtons: [
          { label: 'Send Rent Reminders', action: 'rent_reminders', variant: 'contained' },
          { label: 'Maintenance Notifications', action: 'maintenance_notif', variant: 'outlined' }
        ]
      };
    } else if (input.includes('maintenance') || input.includes('work order')) {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: 'I can help optimize your maintenance operations. I can schedule preventive maintenance, analyze costs, or create work order templates.',
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          'Schedule preventive maintenance',
          'Analyze maintenance costs',
          'Create work order templates',
          'Find cost-effective vendors'
        ]
      };
    } else {
      return {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: 'I understand you need help with that. Let me suggest some popular automations that might be useful:',
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          'Property report generation',
          'Tenant communication automation',
          'Maintenance scheduling',
          'Financial analytics'
        ]
      };
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleActionClick = (action: string) => {
    if (action === 'show_automations') {
      setCurrentView('automations');
    } else if (action === 'rent_reminders') {
      // Simulate automation execution
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        message: '✅ Automation started! Sending rent reminders to 23 tenants. You\'ll be notified when complete.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const runAutomation = (automationId: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === automationId 
        ? { ...auto, status: 'in_progress' }
        : auto
    ));

    // Simulate automation completion
    setTimeout(() => {
      setAutomations(prev => prev.map(auto => 
        auto.id === automationId 
          ? { ...auto, status: 'completed' }
          : auto
      ));

      const automation = automations.find(a => a.id === automationId);
      if (automation) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          message: `✅ Automation "${automation.title}" completed successfully! The task has been executed and results are available in your dashboard.`,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, newMessage]);
        setCurrentView('chat');
      }
    }, 3000);
  };

  const getCategoryIcon = (category: TaskAutomation['category']) => {
    switch (category) {
      case 'properties': return <BuildRoundedIcon />;
      case 'tenants': return <PersonAddRoundedIcon />;
      case 'communications': return <EmailRoundedIcon />;
      case 'reports': return <AnalyticsRoundedIcon />;
      case 'maintenance': return <BuildRoundedIcon />;
      default: return <AutoAwesomeRoundedIcon />;
    }
  };

  const getComplexityColor = (complexity: TaskAutomation['complexity']) => {
    switch (complexity) {
      case 'simple': return 'success';
      case 'medium': return 'warning';
      case 'complex': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
        }}
      >
        <SmartToyRoundedIcon sx={{ fontSize: 28 }} />
      </Fab>

      {/* AI Assistant Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            position: 'fixed',
            bottom: 100,
            left: 24,
            m: 0,
            width: 400,
            maxWidth: '90vw',
            height: isMinimized ? 60 : 600,
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }
        }}
        BackdropProps={{
          style: { backgroundColor: 'transparent' }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SupportAgentRoundedIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                CRM Task Automation
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
              sx={{ color: 'white' }}
            >
              <MinimizeRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        {!isMinimized && (
          <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 1 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={currentView === 'chat' ? 'contained' : 'text'}
                  size="small"
                  onClick={() => setCurrentView('chat')}
                  startIcon={<SupportAgentRoundedIcon />}
                >
                  Chat
                </Button>
                <Button
                  variant={currentView === 'automations' ? 'contained' : 'text'}
                  size="small"
                  onClick={() => setCurrentView('automations')}
                  startIcon={<AutoFixHighRoundedIcon />}
                >
                  Automations
                </Button>
              </Stack>
            </Box>

            {currentView === 'chat' ? (
              <>
                {/* Chat Messages */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflow: 'auto', 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2,
                  maxHeight: 400
                }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                          color: message.type === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                          ...(message.type === 'assistant' && {
                            border: '1px solid',
                            borderColor: 'divider'
                          })
                        }}
                      >
                        <Typography variant="body2">
                          {message.message}
                        </Typography>
                        
                        {message.suggestions && (
                          <Stack spacing={1} sx={{ mt: 2 }}>
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                onClick={() => handleSuggestionClick(suggestion)}
                                startIcon={<LightbulbRoundedIcon />}
                                sx={{ 
                                  justifyContent: 'flex-start',
                                  textAlign: 'left',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </Stack>
                        )}

                        {message.actionButtons && (
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            {message.actionButtons.map((button, index) => (
                              <Button
                                key={index}
                                variant={button.variant || 'contained'}
                                size="small"
                                onClick={() => handleActionClick(button.action)}
                              >
                                {button.label}
                              </Button>
                            ))}
                          </Stack>
                        )}
                      </Paper>
                      <Typography variant="caption" color="text.secondary" sx={{ 
                        mt: 0.5, 
                        display: 'block',
                        textAlign: message.type === 'user' ? 'right' : 'left'
                      }}>
                        {message.timestamp}
                      </Typography>
                    </Box>
                  ))}
                  
                  {isProcessing && (
                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                      <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="body2">AI is thinking...</Typography>
                          <LinearProgress />
                        </Stack>
                      </Paper>
                    </Box>
                  )}
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Ask me anything about CRM automation..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isProcessing}
                      sx={{ minWidth: 44, borderRadius: 2 }}
                    >
                      <SendRoundedIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Box>
              </>
            ) : (
              // Automations View
              <Box sx={{ p: 2, overflow: 'auto', maxHeight: 500 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Available Automations
                </Typography>
                <Stack spacing={2}>
                  {automations.map((automation) => (
                    <Card key={automation.id} variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={1} alignItems="center">
                              {getCategoryIcon(automation.category)}
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {automation.title}
                              </Typography>
                            </Stack>
                            <Chip
                              label={automation.status === 'available' ? 'Ready' : automation.status === 'in_progress' ? 'Running' : 'Done'}
                              color={automation.status === 'available' ? 'success' : automation.status === 'in_progress' ? 'warning' : 'info'}
                              size="small"
                            />
                          </Stack>
                          
                          <Typography variant="body2" color="text.secondary">
                            {automation.description}
                          </Typography>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                label={automation.complexity} 
                                color={getComplexityColor(automation.complexity)}
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                <ScheduleRoundedIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {automation.estimatedTime}
                              </Typography>
                            </Stack>
                            
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => runAutomation(automation.id)}
                              disabled={automation.status !== 'available'}
                              startIcon={
                                automation.status === 'in_progress' ? 
                                  <AutoAwesomeRoundedIcon /> : 
                                  <AutoFixHighRoundedIcon />
                              }
                            >
                              {automation.status === 'available' ? 'Run' : 
                               automation.status === 'in_progress' ? 'Running...' : 'Completed'}
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
