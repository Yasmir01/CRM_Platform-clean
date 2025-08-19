import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Slider,
  TextField
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Money as MoneyIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';

interface LeadScoringFactor {
  id: string;
  name: string;
  category: 'demographic' | 'behavioral' | 'financial' | 'engagement' | 'contextual';
  weight: number;
  description: string;
  aiPowered: boolean;
}

interface LeadScore {
  id: string;
  contactId: string;
  contactName: string;
  totalScore: number;
  previousScore?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: {
    [factorId: string]: {
      score: number;
      confidence: number;
      reasoning: string;
    };
  };
  predictedConversion: number;
  recommendedActions: string[];
  lastUpdated: string;
  riskLevel: 'low' | 'medium' | 'high';
  lifetimeValue: number;
  urgencyScore: number;
}

interface AIInsight {
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  impact: 'low' | 'medium' | 'high';
}

const scoringFactors: LeadScoringFactor[] = [
  {
    id: 'income_verification',
    name: 'Income Verification',
    category: 'financial',
    weight: 0.25,
    description: 'Verified income vs. rent ratio and stability',
    aiPowered: true
  },
  {
    id: 'credit_score',
    name: 'Credit Score Analysis',
    category: 'financial',
    weight: 0.20,
    description: 'Credit score trends and financial reliability',
    aiPowered: true
  },
  {
    id: 'engagement_frequency',
    name: 'Engagement Frequency',
    category: 'engagement',
    weight: 0.15,
    description: 'Frequency and quality of interactions',
    aiPowered: true
  },
  {
    id: 'response_time',
    name: 'Response Time',
    category: 'behavioral',
    weight: 0.10,
    description: 'How quickly prospect responds to communications',
    aiPowered: false
  },
  {
    id: 'property_match',
    name: 'Property Match Quality',
    category: 'contextual',
    weight: 0.12,
    description: 'AI-powered matching of preferences to available properties',
    aiPowered: true
  },
  {
    id: 'demographic_fit',
    name: 'Demographic Profile',
    category: 'demographic',
    weight: 0.08,
    description: 'Age, family size, lifestyle compatibility',
    aiPowered: true
  },
  {
    id: 'urgency_indicators',
    name: 'Urgency Signals',
    category: 'behavioral',
    weight: 0.10,
    description: 'Language analysis for urgency and intent',
    aiPowered: true
  }
];

const mockLeadScores: LeadScore[] = [
  {
    id: 'score_001',
    contactId: 'prospect_001',
    contactName: 'Michael Chen',
    totalScore: 89,
    previousScore: 82,
    trend: 'increasing',
    factors: {
      income_verification: { score: 95, confidence: 0.92, reasoning: 'Income 3.2x rent requirement, stable employment history' },
      credit_score: { score: 88, confidence: 0.87, reasoning: 'Credit score 750+, no recent negative marks' },
      engagement_frequency: { score: 92, confidence: 0.95, reasoning: 'High engagement, quick responses, multiple touchpoints' },
      response_time: { score: 85, confidence: 1.0, reasoning: 'Average response time under 2 hours' },
      property_match: { score: 91, confidence: 0.89, reasoning: 'Perfect match for 2BR preferences and budget' },
      demographic_fit: { score: 78, confidence: 0.83, reasoning: 'Young professional, fits community profile' },
      urgency_indicators: { score: 87, confidence: 0.91, reasoning: 'Language indicates immediate need, lease ending soon' }
    },
    predictedConversion: 0.87,
    recommendedActions: [
      'Schedule immediate property viewing',
      'Fast-track application process',
      'Consider premium unit offering'
    ],
    lastUpdated: new Date().toISOString(),
    riskLevel: 'low',
    lifetimeValue: 28500,
    urgencyScore: 85
  },
  {
    id: 'score_002',
    contactId: 'prospect_002',
    contactName: 'Emily Rodriguez',
    totalScore: 76,
    previousScore: 79,
    trend: 'decreasing',
    factors: {
      income_verification: { score: 82, confidence: 0.88, reasoning: 'Income meets requirements but borderline ratio' },
      credit_score: { score: 75, confidence: 0.92, reasoning: 'Credit score 680, some recent inquiries' },
      engagement_frequency: { score: 68, confidence: 0.94, reasoning: 'Moderate engagement, some delayed responses' },
      response_time: { score: 72, confidence: 1.0, reasoning: 'Average response time 4-6 hours' },
      property_match: { score: 84, confidence: 0.86, reasoning: 'Good match but some compromise on preferences' },
      demographic_fit: { score: 79, confidence: 0.81, reasoning: 'Good fit but slightly outside typical age range' },
      urgency_indicators: { score: 65, confidence: 0.88, reasoning: 'Some urgency but flexible timeline mentioned' }
    },
    predictedConversion: 0.68,
    recommendedActions: [
      'Address financing concerns',
      'Provide flexible payment options',
      'Follow up on application timeline'
    ],
    lastUpdated: new Date().toISOString(),
    riskLevel: 'medium',
    lifetimeValue: 22800,
    urgencyScore: 62
  },
  {
    id: 'score_003',
    contactId: 'prospect_003',
    contactName: 'David Park',
    totalScore: 94,
    previousScore: 91,
    trend: 'increasing',
    factors: {
      income_verification: { score: 98, confidence: 0.96, reasoning: 'Income 4.1x rent requirement, executive position' },
      credit_score: { score: 96, confidence: 0.94, reasoning: 'Excellent credit score 820+, perfect payment history' },
      engagement_frequency: { score: 89, confidence: 0.97, reasoning: 'Regular engagement, asks detailed questions' },
      response_time: { score: 94, confidence: 1.0, reasoning: 'Very quick responses, usually within 1 hour' },
      property_match: { score: 93, confidence: 0.91, reasoning: 'Perfect match for luxury unit preferences' },
      demographic_fit: { score: 92, confidence: 0.89, reasoning: 'Ideal demographic profile for premium properties' },
      urgency_indicators: { score: 96, confidence: 0.93, reasoning: 'Strong urgency signals, ready to move immediately' }
    },
    predictedConversion: 0.94,
    recommendedActions: [
      'Offer premium unit immediately',
      'Schedule VIP tour',
      'Prepare lease agreement',
      'Consider incentives for immediate signing'
    ],
    lastUpdated: new Date().toISOString(),
    riskLevel: 'low',
    lifetimeValue: 42000,
    urgencyScore: 95
  }
];

const aiInsights: AIInsight[] = [
  {
    type: 'opportunity',
    title: 'High-Value Lead Identified',
    description: 'David Park shows exceptional conversion potential with 94% predicted success rate',
    confidence: 0.94,
    actionable: true,
    impact: 'high'
  },
  {
    type: 'risk',
    title: 'Engagement Decline Detected',
    description: 'Emily Rodriguez showing decreased engagement patterns, may need intervention',
    confidence: 0.87,
    actionable: true,
    impact: 'medium'
  },
  {
    type: 'trend',
    title: 'Response Time Correlation',
    description: 'Leads with <2hr response time show 3.2x higher conversion rates',
    confidence: 0.91,
    actionable: false,
    impact: 'medium'
  },
  {
    type: 'recommendation',
    title: 'Optimize Follow-up Timing',
    description: 'AI suggests optimal follow-up time is 2.5 hours after initial contact',
    confidence: 0.89,
    actionable: true,
    impact: 'high'
  }
];

const AILeadScoringEngine: React.FC = () => {
  const [leadScores, setLeadScores] = useState<LeadScore[]>(mockLeadScores);
  const [selectedLead, setSelectedLead] = useState<LeadScore | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [factors, setFactors] = useState<LeadScoringFactor[]>(scoringFactors);
  const [insights] = useState<AIInsight[]>(aiInsights);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUpIcon color="success" />;
      case 'decreasing': return <WarningIcon color="warning" />;
      default: return <StarIcon color="info" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <CheckCircleIcon color="success" />;
      case 'risk': return <WarningIcon color="warning" />;
      case 'trend': return <AnalyticsIcon color="info" />;
      case 'recommendation': return <AutoAwesomeIcon color="primary" />;
      default: return <PsychologyIcon />;
    }
  };

  const handleRecalculateScores = () => {
    // Simulate AI recalculation
    console.log('Recalculating AI scores...');
    // In real implementation, this would trigger the AI scoring pipeline
  };

  const handleFactorWeightChange = (factorId: string, newWeight: number) => {
    setFactors(prev => 
      prev.map(factor => 
        factor.id === factorId ? { ...factor, weight: newWeight } : factor
      )
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon />
          AI Lead Scoring Engine
        </Typography>
        <Stack direction="row" spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="outlined"
            onClick={() => setSettingsOpen(true)}
            startIcon={<SettingsIcon />}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            onClick={handleRecalculateScores}
            startIcon={<RefreshIcon />}
          >
            Recalculate
          </Button>
        </Stack>
      </Stack>

      {/* AI Insights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon />
            AI Insights & Recommendations
          </Typography>
          <Grid container spacing={2}>
            {insights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Alert 
                  severity={insight.type === 'risk' ? 'warning' : insight.type === 'opportunity' ? 'success' : 'info'}
                  icon={getInsightIcon(insight.type)}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2">
                    {insight.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={`${Math.round(insight.confidence * 100)}% confidence`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`${insight.impact} impact`} 
                      size="small" 
                      color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                    />
                  </Stack>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Lead Scores */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            Lead Scores & Predictions
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Conversion</TableCell>
                  <TableCell>Lifetime Value</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leadScores.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{lead.contactName.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">{lead.contactName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Updated {new Date(lead.lastUpdated).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6" color={`${getScoreColor(lead.totalScore)}.main`}>
                            {lead.totalScore}
                          </Typography>
                          {lead.previousScore && (
                            <Typography variant="caption" color="text.secondary">
                              ({lead.previousScore > lead.totalScore ? '-' : '+'}{Math.abs(lead.totalScore - lead.previousScore)})
                            </Typography>
                          )}
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={lead.totalScore} 
                          color={getScoreColor(lead.totalScore) as any}
                          sx={{ width: 100 }}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getTrendIcon(lead.trend)}
                        <Typography variant="body2" color="text.secondary">
                          {lead.trend}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="primary.main">
                          {Math.round(lead.predictedConversion * 100)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={lead.predictedConversion * 100} 
                          color="primary"
                          sx={{ width: 80 }}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        ${lead.lifetimeValue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={lead.riskLevel} 
                        size="small"
                        color={lead.riskLevel === 'low' ? 'success' : lead.riskLevel === 'medium' ? 'warning' : 'error'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedLead(lead);
                          setDetailsOpen(true);
                        }}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
        {selectedLead && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {selectedLead.contactName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedLead.contactName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score: {selectedLead.totalScore} • Conversion: {Math.round(selectedLead.predictedConversion * 100)}%
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Scoring Factors</Typography>
                  <List>
                    {Object.entries(selectedLead.factors).map(([factorId, factorData]) => {
                      const factor = factors.find(f => f.id === factorId);
                      if (!factor) return null;
                      
                      return (
                        <ListItem key={factorId}>
                          <ListItemIcon>
                            {factor.aiPowered ? <PsychologyIcon color="primary" /> : <AnalyticsIcon />}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body1">{factor.name}</Typography>
                                <Chip 
                                  label={factorData.score} 
                                  size="small" 
                                  color={getScoreColor(factorData.score) as any}
                                />
                              </Stack>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {factorData.reasoning}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={factorData.confidence * 100} 
                                  sx={{ mt: 1, width: '60%' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round(factorData.confidence * 100)}% confidence
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>AI Recommendations</Typography>
                  <List>
                    {selectedLead.recommendedActions.map((action, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <AutoAwesomeIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>Key Metrics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Urgency Score</Typography>
                      <Typography variant="h6">{selectedLead.urgencyScore}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Risk Level</Typography>
                      <Chip 
                        label={selectedLead.riskLevel} 
                        color={selectedLead.riskLevel === 'low' ? 'success' : selectedLead.riskLevel === 'medium' ? 'warning' : 'error'}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<AutoAwesomeIcon />}>
                Apply AI Recommendations
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>AI Scoring Configuration</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>Factor Weights</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Adjust the importance of each scoring factor. Changes affect future scoring calculations.
          </Typography>
          
          {factors.map((factor) => (
            <Box key={factor.id} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ minWidth: 200 }}>
                  {factor.name}
                </Typography>
                {factor.aiPowered && (
                  <Chip label="AI Powered" size="small" color="primary" />
                )}
              </Stack>
              <Slider
                value={factor.weight}
                onChange={(e, newValue) => handleFactorWeightChange(factor.id, newValue as number)}
                min={0}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              />
              <Typography variant="body2" color="text.secondary">
                {factor.description}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AILeadScoringEngine;
