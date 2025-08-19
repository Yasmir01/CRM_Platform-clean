import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Divider,
  Badge,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import {
  Router as RouterIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AutoAwesome as AutoAwesomeIcon,
  Analytics as AnalyticsIcon,
  Balance as BalanceIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationOnIcon,
  Language as LanguageIcon,
  Home as HomeIcon,
  AttachMoney as AttachMoneyIcon,
  School as SchoolIcon,
  WorkOutline as WorkOutlineIcon,
  EmojiEvents as EmojiEventsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
  specialties: string[];
  languages: string[];
  workload: number; // 0-100
  performance: {
    conversionRate: number;
    avgResponseTime: number; // in minutes
    customerSatisfaction: number;
    leadsHandled: number;
    revenue: number;
  };
  availability: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    offDays: string[];
  };
  regions: string[];
  propertyTypes: string[];
  leadTypes: string[];
  maxConcurrentLeads: number;
  currentLeads: number;
}

interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  active: boolean;
  conditions: RoutingCondition[];
  assignment: {
    method: 'round_robin' | 'skill_based' | 'performance_based' | 'workload_based' | 'ai_optimal';
    criteria: string[];
    fallback?: string; // agent ID for fallback
  };
  description: string;
}

interface RoutingCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: string | number | string[];
  weight: number;
}

interface LeadAssignment {
  id: string;
  leadId: string;
  leadName: string;
  agentId: string;
  agentName: string;
  assignedAt: string;
  method: string;
  confidence: number;
  reasoning: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  responseTime?: number;
  outcome?: 'converted' | 'lost' | 'ongoing';
}

const mockAgents: Agent[] = [
  {
    id: 'agent_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    status: 'available',
    specialties: ['Luxury Properties', 'First-time Buyers', 'Investment Properties'],
    languages: ['English', 'Spanish'],
    workload: 75,
    performance: {
      conversionRate: 0.68,
      avgResponseTime: 12,
      customerSatisfaction: 4.8,
      leadsHandled: 142,
      revenue: 285000
    },
    availability: {
      timezone: 'PST',
      workingHours: { start: '08:00', end: '18:00' },
      offDays: ['Saturday', 'Sunday']
    },
    regions: ['Downtown', 'Beverly Hills', 'Santa Monica'],
    propertyTypes: ['Luxury Condo', 'Penthouse', 'Single Family'],
    leadTypes: ['High Value', 'VIP'],
    maxConcurrentLeads: 20,
    currentLeads: 15
  },
  {
    id: 'agent_002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    status: 'available',
    specialties: ['Commercial Properties', 'Multi-family', 'Property Management'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    workload: 60,
    performance: {
      conversionRate: 0.74,
      avgResponseTime: 8,
      customerSatisfaction: 4.9,
      leadsHandled: 98,
      revenue: 420000
    },
    availability: {
      timezone: 'PST',
      workingHours: { start: '09:00', end: '19:00' },
      offDays: ['Sunday']
    },
    regions: ['Chinatown', 'Financial District', 'South Bay'],
    propertyTypes: ['Commercial', 'Multi-family', 'Mixed Use'],
    leadTypes: ['Commercial', 'Investment'],
    maxConcurrentLeads: 15,
    currentLeads: 9
  },
  {
    id: 'agent_003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    status: 'busy',
    specialties: ['Affordable Housing', 'First-time Renters', 'Student Housing'],
    languages: ['English', 'Spanish', 'Portuguese'],
    workload: 90,
    performance: {
      conversionRate: 0.82,
      avgResponseTime: 15,
      customerSatisfaction: 4.7,
      leadsHandled: 186,
      revenue: 156000
    },
    availability: {
      timezone: 'PST',
      workingHours: { start: '07:00', end: '16:00' },
      offDays: ['Saturday', 'Sunday']
    },
    regions: ['East LA', 'Echo Park', 'Boyle Heights'],
    propertyTypes: ['Apartment', 'Studio', 'Shared Housing'],
    leadTypes: ['Student', 'Budget-conscious'],
    maxConcurrentLeads: 25,
    currentLeads: 22
  },
  {
    id: 'agent_004',
    name: 'David Park',
    email: 'david.park@company.com',
    status: 'available',
    specialties: ['Corporate Relocation', 'Temporary Housing', 'Executive Rentals'],
    languages: ['English', 'Korean', 'Japanese'],
    workload: 45,
    performance: {
      conversionRate: 0.71,
      avgResponseTime: 10,
      customerSatisfaction: 4.6,
      leadsHandled: 67,
      revenue: 198000
    },
    availability: {
      timezone: 'PST',
      workingHours: { start: '10:00', end: '20:00' },
      offDays: ['Monday']
    },
    regions: ['West Hollywood', 'Beverly Hills', 'Century City'],
    propertyTypes: ['Corporate Housing', 'Furnished Apartment', 'Extended Stay'],
    leadTypes: ['Corporate', 'Relocation'],
    maxConcurrentLeads: 12,
    currentLeads: 5
  }
];

const mockRoutingRules: RoutingRule[] = [
  {
    id: 'rule_001',
    name: 'VIP Lead Priority Routing',
    priority: 1,
    active: true,
    conditions: [
      { id: 'cond_001', field: 'leadScore', operator: 'greater_than', value: 85, weight: 0.4 },
      { id: 'cond_002', field: 'leadType', operator: 'equals', value: 'VIP', weight: 0.3 },
      { id: 'cond_003', field: 'budgetRange', operator: 'greater_than', value: 5000, weight: 0.3 }
    ],
    assignment: {
      method: 'performance_based',
      criteria: ['conversionRate', 'customerSatisfaction'],
      fallback: 'agent_001'
    },
    description: 'Route high-value VIP leads to top-performing agents'
  },
  {
    id: 'rule_002',
    name: 'Language Matching',
    priority: 2,
    active: true,
    conditions: [
      { id: 'cond_004', field: 'preferredLanguage', operator: 'not_equals', value: 'English', weight: 1.0 }
    ],
    assignment: {
      method: 'skill_based',
      criteria: ['languages'],
      fallback: 'agent_001'
    },
    description: 'Match leads with agents who speak their preferred language'
  },
  {
    id: 'rule_003',
    name: 'Geographic Routing',
    priority: 3,
    active: true,
    conditions: [
      { id: 'cond_005', field: 'propertyLocation', operator: 'contains', value: ['Downtown', 'Beverly Hills'], weight: 0.6 },
      { id: 'cond_006', field: 'urgency', operator: 'equals', value: 'high', weight: 0.4 }
    ],
    assignment: {
      method: 'ai_optimal',
      criteria: ['regions', 'workload', 'availability'],
      fallback: 'agent_002'
    },
    description: 'Route leads based on property location and agent regions'
  },
  {
    id: 'rule_004',
    name: 'Workload Balancing',
    priority: 4,
    active: true,
    conditions: [
      { id: 'cond_007', field: 'leadType', operator: 'equals', value: 'Standard', weight: 1.0 }
    ],
    assignment: {
      method: 'workload_based',
      criteria: ['currentLeads', 'workload'],
      fallback: 'agent_004'
    },
    description: 'Distribute standard leads evenly across available agents'
  }
];

const mockAssignments: LeadAssignment[] = [
  {
    id: 'assign_001',
    leadId: 'lead_001',
    leadName: 'Michael Chen',
    agentId: 'agent_001',
    agentName: 'Sarah Johnson',
    assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    method: 'AI Optimal',
    confidence: 0.92,
    reasoning: [
      'High lead score (89) matches agent specialty',
      'VIP lead type aligns with luxury property expertise',
      'Agent has highest conversion rate for similar leads',
      'Current workload allows for immediate attention'
    ],
    status: 'accepted',
    responseTime: 8,
    outcome: 'ongoing'
  },
  {
    id: 'assign_002',
    leadId: 'lead_002',
    leadName: 'Maria Gonzalez',
    agentId: 'agent_003',
    agentName: 'Emily Rodriguez',
    assignedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    method: 'Language Matching',
    confidence: 0.88,
    reasoning: [
      'Lead prefers Spanish communication',
      'Agent fluent in Spanish and Portuguese',
      'Specializes in affordable housing segment',
      'Geographic match with East LA preference'
    ],
    status: 'pending',
    outcome: 'ongoing'
  }
];

const IntelligentLeadRouting: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(mockRoutingRules);
  const [assignments, setAssignments] = useState<LeadAssignment[]>(mockAssignments);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'error';
    if (workload >= 70) return 'warning';
    return 'success';
  };

  const runRoutingSimulation = async () => {
    setSimulationRunning(true);
    // Simulate AI routing process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSimulationRunning(false);
  };

  const getPerformanceIcon = (metric: string) => {
    switch (metric) {
      case 'conversionRate': return <TrendingUpIcon />;
      case 'avgResponseTime': return <SpeedIcon />;
      case 'customerSatisfaction': return <StarIcon />;
      case 'revenue': return <AttachMoneyIcon />;
      default: return <AnalyticsIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouterIcon />
          Intelligent Lead Routing
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setRulesDialogOpen(true)}
            startIcon={<SettingsIcon />}
          >
            Routing Rules
          </Button>
          <Button
            variant="contained"
            onClick={runRoutingSimulation}
            startIcon={simulationRunning ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            disabled={simulationRunning}
          >
            {simulationRunning ? 'Running Simulation...' : 'Test AI Routing'}
          </Button>
        </Stack>
      </Stack>

      {/* Routing Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Available Agents
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {agents.filter(agent => agent.status === 'available').length}
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Active Rules
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {routingRules.filter(rule => rule.active).length}
                  </Typography>
                </Box>
                <BalanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    {Math.round(agents.reduce((sum, agent) => sum + agent.performance.avgResponseTime, 0) / agents.length)}m
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
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {Math.round((agents.reduce((sum, agent) => sum + agent.performance.conversionRate, 0) / agents.length) * 100)}%
                  </Typography>
                </Box>
                <EmojiEventsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agents Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {agents.map((agent) => (
          <Grid item xs={12} md={6} lg={4} key={agent.id}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                  <Badge
                    badgeContent={agent.currentLeads}
                    color="primary"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar
                      sx={{ 
                        bgcolor: getStatusColor(agent.status) + '.light',
                        color: getStatusColor(agent.status) + '.main'
                      }}
                    >
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{agent.name}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={agent.status} 
                        size="small" 
                        color={getStatusColor(agent.status) as any}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {agent.currentLeads}/{agent.maxConcurrentLeads} leads
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                {/* Workload */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">Workload</Typography>
                    <Typography variant="body2" color={getWorkloadColor(agent.workload) + '.main'}>
                      {agent.workload}%
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={agent.workload} 
                    color={getWorkloadColor(agent.workload) as any}
                  />
                </Box>

                {/* Performance Metrics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Conversion</Typography>
                    <Typography variant="body2" color="success.main">
                      {Math.round(agent.performance.conversionRate * 100)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Satisfaction</Typography>
                    <Typography variant="body2" color="warning.main">
                      {agent.performance.customerSatisfaction}/5
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Response</Typography>
                    <Typography variant="body2" color="info.main">
                      {agent.performance.avgResponseTime}m
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                    <Typography variant="body2" color="primary.main">
                      ${(agent.performance.revenue / 1000).toFixed(0)}K
                    </Typography>
                  </Grid>
                </Grid>

                {/* Specialties */}
                <Typography variant="subtitle2" gutterBottom>Specialties</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  {agent.specialties.slice(0, 2).map((specialty) => (
                    <Chip 
                      key={specialty} 
                      label={specialty} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                  {agent.specialties.length > 2 && (
                    <Chip 
                      label={`+${agent.specialties.length - 2}`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Stack>

                {/* Languages */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <LanguageIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {agent.languages.join(', ')}
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setAgentDialogOpen(true);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Assignments */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon />
            Recent Lead Assignments
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lead</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{assignment.leadName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(assignment.assignedAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {assignment.agentName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">{assignment.agentName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={assignment.method} 
                        size="small" 
                        variant="outlined"
                        icon={<AutoAwesomeIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="primary.main">
                          {Math.round(assignment.confidence * 100)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={assignment.confidence * 100} 
                          color="primary"
                          sx={{ width: 80 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={assignment.status} 
                        size="small"
                        color={
                          assignment.status === 'accepted' ? 'success' :
                          assignment.status === 'pending' ? 'warning' :
                          assignment.status === 'rejected' ? 'error' : 'info'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {assignment.responseTime ? (
                        <Typography variant="body2" color="success.main">
                          {assignment.responseTime}m
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Agent Details Dialog */}
      <Dialog open={agentDialogOpen} onClose={() => setAgentDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedAgent && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedAgent.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAgent.email}
                  </Typography>
                </Box>
                <Chip 
                  label={selectedAgent.status} 
                  color={getStatusColor(selectedAgent.status) as any}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Conversion Rate"
                        secondary={`${Math.round(selectedAgent.performance.conversionRate * 100)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Avg Response Time"
                        secondary={`${selectedAgent.performance.avgResponseTime} minutes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Customer Satisfaction"
                        secondary={`${selectedAgent.performance.customerSatisfaction}/5.0`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AttachMoneyIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Total Revenue"
                        secondary={`$${selectedAgent.performance.revenue.toLocaleString()}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Expertise & Coverage</Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Specialties</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {selectedAgent.specialties.map((specialty) => (
                      <Chip key={specialty} label={specialty} size="small" />
                    ))}
                  </Stack>
                  
                  <Typography variant="subtitle2" gutterBottom>Languages</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {selectedAgent.languages.map((language) => (
                      <Chip key={language} label={language} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  
                  <Typography variant="subtitle2" gutterBottom>Regions</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {selectedAgent.regions.map((region) => (
                      <Chip key={region} label={region} size="small" color="info" />
                    ))}
                  </Stack>
                  
                  <Typography variant="subtitle2" gutterBottom>Working Hours</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAgent.availability.workingHours.start} - {selectedAgent.availability.workingHours.end} ({selectedAgent.availability.timezone})
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAgentDialogOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<AssignmentIcon />}>
                Assign Lead
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Routing Rules Dialog */}
      <Dialog open={rulesDialogOpen} onClose={() => setRulesDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Routing Rules Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Configure intelligent routing rules that automatically assign leads to the most suitable agents based on various criteria and AI optimization.
            </Typography>
          </Alert>
          
          <List>
            {routingRules.map((rule, index) => (
              <React.Fragment key={rule.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle1">{rule.name}</Typography>
                        <Chip 
                          label={`Priority ${rule.priority}`} 
                          size="small" 
                          color="primary"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={rule.active}
                              onChange={(e) => {
                                const updatedRules = [...routingRules];
                                updatedRules[index].active = e.target.checked;
                                setRoutingRules(updatedRules);
                              }}
                            />
                          }
                          label={rule.active ? 'Active' : 'Inactive'}
                        />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {rule.description}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={rule.assignment.method.replace('_', ' ')} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`${rule.conditions.length} conditions`} 
                            size="small" 
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    }
                  />
                  <IconButton>
                    <SettingsIcon />
                  </IconButton>
                </ListItem>
                {index < routingRules.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<CheckCircleIcon />}>
            Save Rules
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntelligentLeadRouting;
