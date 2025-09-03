import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  TextField
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LightbulbIcon from '@mui/icons-material/Lightbulb';;

interface AISuggestion {
  id: string;
  text: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'empathetic';
  confidence: number;
  context: string;
  personalized: boolean;
}

const AIResponseSuggestions: React.FC = () => {
  const [suggestions] = useState<AISuggestion[]>([
    {
      id: 'sugg_001',
      text: "Hi [TENANT_NAME], thank you for reaching out about the maintenance request. I've scheduled our team to visit tomorrow at 2 PM. Is this time convenient for you?",
      tone: 'professional',
      confidence: 0.94,
      context: 'Maintenance request follow-up',
      personalized: true
    },
    {
      id: 'sugg_002', 
      text: "Thanks for your interest in our 2BR unit! I'd love to schedule a viewing at your earliest convenience. When would work best for you?",
      tone: 'friendly',
      confidence: 0.87,
      context: 'Property inquiry response',
      personalized: true
    },
    {
      id: 'sugg_003',
      text: "I understand your concern about the lease renewal terms. Let me connect you with our leasing specialist who can discuss flexible options that work for your situation.",
      tone: 'empathetic',
      confidence: 0.91,
      context: 'Lease renewal concern',
      personalized: false
    }
  ]);

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'primary';
      case 'friendly': return 'success';
      case 'urgent': return 'error';
      case 'empathetic': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PsychologyIcon />
        AI Response Suggestions
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          🤖 AI analyzes context, sentiment, and past successful responses to suggest optimal replies
        </Typography>
      </Alert>

      <Stack spacing={2}>
        {suggestions.map((suggestion) => (
          <Paper key={suggestion.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <AutoAwesomeIcon color="primary" />
                  <Typography variant="subtitle2">{suggestion.context}</Typography>
                  <Chip 
                    label={suggestion.tone} 
                    size="small" 
                    color={getToneColor(suggestion.tone) as any}
                  />
                  {suggestion.personalized && (
                    <Chip label="Personalized" size="small" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="caption" color="primary.main">
                  {Math.round(suggestion.confidence * 100)}% confidence
                </Typography>
              </Stack>
              
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                "{suggestion.text}"
              </Typography>
              
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <IconButton size="small" color="success">
                  <ThumbUpIcon />
                </IconButton>
                <IconButton size="small" color="error">
                  <ThumbDownIcon />
                </IconButton>
                <IconButton size="small">
                  <ContentCopyIcon />
                </IconButton>
                <Button size="small" variant="contained" startIcon={<SendIcon />}>
                  Use Response
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default AIResponseSuggestions;
