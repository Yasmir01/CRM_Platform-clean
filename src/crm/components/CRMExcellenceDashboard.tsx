import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  Badge,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  EmojiEvents as ExcellenceIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Router as RouterIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AttachMoney as AttachMoneyIcon,
  BusinessCenter as BusinessCenterIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Handshake as HandshakeIcon,
  SupportAgent as SupportAgentIcon,
  Campaign as CampaignIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import UnifiedCommunicationDashboard from './UnifiedCommunicationDashboard';
import AILeadScoringEngine from './AILeadScoringEngine';
import AdvancedWorkflowEngine from './AdvancedWorkflowEngine';
import IntelligentLeadRouting from './IntelligentLeadRouting';

interface ExcellenceMetric {
  id: string;
  name: string;
  category: 'communication' | 'lead_management' | 'automation' | 'performance' | 'satisfaction';
  score: number;
  target: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'medium' | 'low';
  lastUpdated: string;
  details: string;
  icon: React.ReactNode;
}

interface CRMHealthMetrics {
  overallScore: number;
  categories: {
    communication: number;
    leadManagement: number;
    automation: number;
    customerExperience: number;
    agentPerformance: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    impact: string;
  }[];
  keyAchievements: string[];
  areasForImprovement: string[];
}

const excellenceMetrics: ExcellenceMetric[] = [
  {
    id: 'response_time',
    name: 'Avg Response Time',
    category: 'communication',
    score: 8.5,
    target: 10,
    trend: 'increasing',
    impact: 'high',
    lastUpdated: new Date().toISOString(),
    details: 'Average response time across all communication channels',
    icon: <SpeedIcon />
  },
  {
    id: 'lead_conversion',
    name: 'Lead Conversion Rate',
    category: 'lead_management',
    score: 74,
    target: 70,
    trend: 'increasing',
    impact: 'high',
    lastUpdated: new Date().toISOString(),
    details: 'Percentage of leads converted to tenants',
    icon: <TrendingUpIcon />
  },
  {
    id: 'workflow_efficiency',
    name: 'Workflow Automation Efficiency',
    category: 'automation',
    score: 89,
    target: 85,
    trend: 'stable',
    impact: 'medium',
    lastUpdated: new Date().toISOString(),
    details: 'Automated processes completion rate',
    icon: <RouterIcon />
  },
  {
    id: 'ai_accuracy',
    name: 'AI Prediction Accuracy',
    category: 'lead_management',
    score: 92,
    target: 90,
    trend: 'increasing',
    impact: 'high',
    lastUpdated: new Date().toISOString(),
    details: 'AI lead scoring and routing accuracy',
    icon: <PsychologyIcon />
  },
  {
    id: 'customer_satisfaction',
    name: 'Customer Satisfaction',
    category: 'satisfaction',
    score: 4.7,
    target: 4.5,
    trend: 'increasing',
    impact: 'high',
    lastUpdated: new Date().toISOString(),
    details: 'Average customer satisfaction rating',
    icon: <StarIcon />
  },
  {
    id: 'communication_coverage',
    name: 'Communication Channel Coverage',
    category: 'communication',
    score: 95,
    target: 90,
    trend: 'stable',
    impact: 'medium',
    lastUpdated: new Date().toISOString(),
    details: 'Percentage of communication channels actively used',
    icon: <TimelineIcon />
  }
];

const crmHealthMetrics: CRMHealthMetrics = {
  overallScore: 87,
  categories: {
    communication: 91,
    leadManagement: 88,
    automation: 85,
    customerExperience: 89,
    agentPerformance: 82
  },
  recommendations: [
    {
      priority: 'high',
      title: 'Implement Advanced AI Response Suggestions',
      description: 'Deploy AI-powered response suggestions to improve agent efficiency and response quality',
      action: 'Enable AI suggestion engine',
      impact: 'Reduce response time by 25%, improve consistency'
    },
    {
      priority: 'medium',
      title: 'Enhance Real-time Analytics',
      description: 'Implement real-time communication analytics for better decision making',
      action: 'Deploy real-time analytics dashboard',
      impact: 'Improve response times and conversion rates'
    },
    {
      priority: 'medium',
      title: 'Optimize Agent Workload Distribution',
      description: 'Fine-tune intelligent routing to better balance agent workloads',
      action: 'Adjust routing algorithms',
      impact: 'Increase agent satisfaction and performance'
    },
    {
      priority: 'low',
      title: 'Expand Multilingual Support',
      description: 'Add more language options for international tenant engagement',
      action: 'Configure additional languages',
      impact: 'Broader market reach and inclusion'
    }
  ],
  keyAchievements: [
    'Unified communication system successfully integrates 6+ channels',
    'AI lead scoring achieved 92% accuracy rate',
    'Automated workflows handle 75% of routine tasks',
    'Lead conversion rate improved by 23% this quarter',
    'Customer satisfaction rating increased to 4.7/5'
  ],
  areasForImprovement: [
    'Agent performance consistency across teams',
    'Real-time analytics implementation',
    'Advanced tenant engagement scoring',
    'Cross-channel communication tracking'
  ]
};

const CRMExcellenceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [metrics, setMetrics] = useState(excellenceMetrics);
  const [healthMetrics] = useState(crmHealthMetrics);
  const [refreshing, setRefreshing] = useState(false);

  const getScoreColor = (score: number, target: number): string => {
    const percentage = (score / target) * 100;
    if (percentage >= 110) return 'success';
    if (percentage >= 90) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUpIcon color="success" fontSize="small" />;
      case 'decreasing': return <WarningIcon color="warning" fontSize="small" />;
      default: return <InfoIcon color="info" fontSize="small" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const handleRefreshMetrics = async () => {
    setRefreshing(true);
    // Simulate metrics refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const renderOverviewTab = () => (
    <Box>
      {/* Overall CRM Health Score */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {healthMetrics.overallScore}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                CRM Excellence Score
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Industry-leading property management CRM performance
              </Typography>
            </Box>
            <ExcellenceIcon sx={{ fontSize: 80, opacity: 0.8 }} />
          </Stack>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(healthMetrics.categories).map(([category, score]) => (
          <Grid item xs={12} sm={6} md={2.4} key={category}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CircularProgress
                  variant="determinate"
                  value={score}
                  size={60}
                  thickness={4}
                  sx={{ mb: 2, color: getScoreColor(score, 85) + '.main' }}
                />
                <Typography variant="h6" color={getScoreColor(score, 85) + '.main'}>
                  {score}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Key Achievements & Improvements */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                Key Achievements
              </Typography>
              <List dense>
                {healthMetrics.keyAchievements.map((achievement, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={achievement} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Areas for Enhancement
              </Typography>
              <List dense>
                {healthMetrics.areasForImprovement.map((area, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={area} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Excellence Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon />
            Excellence Metrics
          </Typography>
          <Grid container spacing={2}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {metric.icon}
                      <Typography variant="subtitle2">{metric.name}</Typography>
                    </Box>
                    {getTrendIcon(metric.trend)}
                  </Stack>
                  
                  <Typography variant="h5" color={getScoreColor(metric.score, metric.target) + '.main'} sx={{ mb: 1 }}>
                    {metric.category === 'satisfaction' ? `${metric.score}/5` : 
                     metric.category === 'communication' && metric.name.includes('Time') ? `${metric.score}m` :
                     `${metric.score}${metric.category === 'performance' ? '%' : ''}`}
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={(metric.score / metric.target) * 100}
                    color={getScoreColor(metric.score, metric.target) as any}
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="caption" color="text.secondary">
                    Target: {metric.target} • Impact: {metric.impact}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderRecommendationsTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          AI-Powered Recommendations
        </Typography>
        <Typography variant="body2">
          Our AI analyzes your CRM performance and provides actionable recommendations to achieve excellence.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {healthMetrics.recommendations.map((recommendation, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Typography variant="h6">{recommendation.title}</Typography>
                  <Chip 
                    label={recommendation.priority} 
                    size="small" 
                    color={getPriorityColor(recommendation.priority) as any}
                  />
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {recommendation.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Recommended Action:</Typography>
                  <Typography variant="body2">{recommendation.action}</Typography>
                  
                  <Typography variant="subtitle2">Expected Impact:</Typography>
                  <Typography variant="body2" color="success.main">{recommendation.impact}</Typography>
                </Stack>
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  startIcon={<AutoAwesomeIcon />}
                >
                  Implement Recommendation
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ExcellenceIcon />
          CRM Excellence Center
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={handleRefreshMetrics}
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
          >
            Configure Excellence
          </Button>
        </Stack>
      </Stack>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Excellence Overview" icon={<ExcellenceIcon />} />
        <Tab label="AI Recommendations" icon={<AutoAwesomeIcon />} />
        <Tab label="Communication Hub" icon={<TimelineIcon />} />
        <Tab label="Lead Intelligence" icon={<PsychologyIcon />} />
        <Tab label="Workflow Automation" icon={<RouterIcon />} />
        <Tab label="Smart Routing" icon={<GroupIcon />} />
      </Tabs>

      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderRecommendationsTab()}
      {activeTab === 2 && <UnifiedCommunicationDashboard />}
      {activeTab === 3 && <AILeadScoringEngine />}
      {activeTab === 4 && <AdvancedWorkflowEngine />}
      {activeTab === 5 && <IntelligentLeadRouting />}
    </Box>
  );
};

export default CRMExcellenceDashboard;
