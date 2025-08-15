import * as React from "react";
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Collapse,
  Tooltip,
  Badge,
} from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  context?: string; // Current page context
}

interface GlobalAIAssistantProps {
  currentPage?: string;
  currentContext?: any;
}

export default function GlobalAIAssistant({ currentPage = "CRM", currentContext }: GlobalAIAssistantProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `Hi! I'm your CRM AI Assistant. I'm here to help you with:
      
• Property management questions
• Tenant communication assistance
• Work order guidance  
• Report generation help
• Feature explanations
• Best practices and tips

What can I help you with today?`,
      timestamp: new Date().toISOString(),
      context: currentPage
    }
  ]);
  const [newMessage, setNewMessage] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: "How to add property?", icon: "🏠" },
    { label: "Create work order", icon: "🔧" },
    { label: "Tenant communication tips", icon: "💬" },
    { label: "Generate report help", icon: "📊" },
    { label: "Property maintenance", icon: "🛠️" },
    { label: "CRM navigation", icon: "🧭" }
  ];

  const pageSpecificHelp = React.useMemo(() => {
    const helpMap: Record<string, string[]> = {
      "Properties": [
        "How to add a new property",
        "Property management best practices",
        "Setting rental rates",
        "Managing property images"
      ],
      "Tenants": [
        "Adding new tenants",
        "Lease management",
        "Tenant communication",
        "Rent collection tips"
      ],
      "WorkOrders": [
        "Creating work orders",
        "Assigning to vendors",
        "Tracking progress",
        "Emergency procedures"
      ],
      "Analytics": [
        "Understanding reports",
        "Revenue analysis",
        "Performance metrics",
        "Data export options"
      ]
    };
    return helpMap[currentPage] || [];
  }, [currentPage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnreadCount(prev => prev + 1);
    } else {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const generateContextualResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Context-aware responses based on current page
    if (currentPage === "Properties") {
      if (message.includes("add") || message.includes("create")) {
        return "To add a new property, click the 'Add Property' button and fill in the required details like name, address, rent amount, and property type. Make sure to add photos and set the right status (Available/Occupied/Maintenance).";
      }
      if (message.includes("rent") || message.includes("price")) {
        return "When setting rental prices, consider market rates, property condition, amenities, and location. You can research comparable properties and adjust based on demand in your area.";
      }
    }
    
    if (currentPage === "Tenants") {
      if (message.includes("add") || message.includes("new tenant")) {
        return "To add a new tenant, go to the Tenants section and click 'Add Tenant'. Fill in their contact information, select the property they'll be renting, and set up their lease details including start/end dates and rent amount.";
      }
      if (message.includes("communication") || message.includes("contact")) {
        return "For tenant communication, you can use the built-in messaging system, email templates, or SMS features. Always keep records of important communications and be responsive to maintenance requests.";
      }
    }

    if (currentPage === "WorkOrders") {
      if (message.includes("create") || message.includes("work order")) {
        return "To create a work order, click 'Create Work Order', select the property, describe the issue, set priority level, and assign to a service provider. You can track progress and add photos for documentation.";
      }
      if (message.includes("emergency") || message.includes("urgent")) {
        return "For emergency work orders, set priority to 'Urgent', contact the tenant immediately, and assign to available emergency contractors. Keep detailed logs of response times and actions taken.";
      }
    }

    // General CRM help
    if (message.includes("navigate") || message.includes("how to use")) {
      return "The CRM has several main sections: Properties (manage your real estate), Tenants (tenant relationships), Work Orders (maintenance tasks), Reports (analytics), and Settings. Use the sidebar to navigate between sections.";
    }

    if (message.includes("report") || message.includes("analytics")) {
      return "Access detailed reports in the Analytics section. You can view revenue trends, occupancy rates, maintenance costs, and tenant satisfaction metrics. Export data to Excel or PDF for external use.";
    }

    if (message.includes("help") || message.includes("support")) {
      return "I'm here to help! You can ask me about any CRM feature, best practices for property management, how to perform specific tasks, or general questions about managing your real estate business efficiently.";
    }

    // Default contextual response
    return `Great question! For ${currentPage}-related help, I recommend checking out the specific features available on this page. You can also try the quick actions below or ask me more specific questions about what you're trying to accomplish.`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: newMessage,
      timestamp: new Date().toISOString(),
      context: currentPage
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateContextualResponse(newMessage),
        timestamp: new Date().toISOString(),
        context: currentPage
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
    handleSendMessage();
  };

  const clearConversation = () => {
    setMessages([{
      id: "welcome",
      type: "assistant",
      content: `Hi! I'm your CRM AI Assistant. I'm here to help you with property management, tenant relations, and any CRM-related questions. What can I help you with today?`,
      timestamp: new Date().toISOString(),
      context: currentPage
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Tooltip title="AI Assistant - Ask me anything about the CRM!" placement="left">
        <Fab
          color="primary"
          aria-label="AI Assistant"
          onClick={() => setIsOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            zIndex: 1300,
            '&:hover': {
              transform: 'scale(1.1)',
            },
            transition: 'transform 0.2s ease'
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <SmartToyRoundedIcon />
          </Badge>
        </Fab>
      </Tooltip>
    );
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => setIsOpen(false)}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          position: 'fixed',
          bottom: 24,
          right: 24,
          top: 'auto',
          left: 'auto',
          m: 0,
          maxHeight: isMinimized ? 60 : '70vh',
          width: 400,
          transition: 'all 0.3s ease'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <SmartToyRoundedIcon />
          <Typography variant="h6">CRM AI Assistant</Typography>
          <Chip 
            label={currentPage} 
            size="small" 
            sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText' }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton 
            size="small" 
            onClick={() => setIsMinimized(!isMinimized)}
            sx={{ color: 'primary.contrastText' }}
          >
            {isMinimized ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => setIsOpen(false)}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Collapse in={!isMinimized}>
        <DialogContent sx={{ p: 0, height: 400 }}>
          {/* Page-specific help section */}
          {pageSpecificHelp.length > 0 && (
            <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TipsAndUpdatesRoundedIcon fontSize="small" />
                Quick help for {currentPage}:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {pageSpecificHelp.slice(0, 2).map((help, index) => (
                  <Chip 
                    key={index}
                    label={help}
                    size="small"
                    variant="outlined"
                    onClick={() => handleQuickAction(help)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Messages area */}
          <Box sx={{ 
            height: pageSpecificHelp.length > 0 ? 300 : 350, 
            overflow: 'auto', 
            p: 2 
          }}>
            {messages.map((message) => (
              <Box key={message.id} sx={{ mb: 2 }}>
                <Stack 
                  direction="row" 
                  spacing={1} 
                  alignItems="flex-start"
                  justifyContent={message.type === 'user' ? 'flex-end' : 'flex-start'}
                >
                  {message.type === 'assistant' && (
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <SmartToyRoundedIcon fontSize="small" />
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: '80%',
                      bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                      color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                  {message.type === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <PersonRoundedIcon fontSize="small" />
                    </Avatar>
                  )}
                </Stack>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <SmartToyRoundedIcon fontSize="small" />
                  </Avatar>
                  <Paper sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary">
                      AI is thinking...
                    </Typography>
                  </Paper>
                </Stack>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick actions */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Quick Actions:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {quickActions.slice(0, 4).map((action, index) => (
                <Chip
                  key={index}
                  label={`${action.icon} ${action.label}`}
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuickAction(action.label)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <TextField
            fullWidth
            placeholder="Ask me anything about the CRM..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            disabled={isTyping}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={clearConversation}
                    size="small"
                    title="Clear conversation"
                  >
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isTyping}
                    color="primary"
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogActions>
      </Collapse>
    </Dialog>
  );
}
