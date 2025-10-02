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
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Divider,
  Avatar,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TransformIcon from '@mui/icons-material/Transform';
import RouterIcon from '@mui/icons-material/Router';
import FlagIcon from '@mui/icons-material/Flag';;

interface WorkflowTrigger {
  id: string;
  type: 'lead_created' | 'lead_scored' | 'email_opened' | 'property_viewed' | 'application_submitted' | 'payment_due' | 'maintenance_requested' | 'lease_expiring' | 'custom_event';
  name: string;
  conditions: WorkflowCondition[];
  description: string;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number;
  logicalOperator?: 'AND' | 'OR';
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'send_sms' | 'make_call' | 'create_task' | 'update_field' | 'add_tag' | 'move_stage' | 'assign_user' | 'wait' | 'webhook' | 'ai_action';
  name: string;
  parameters: { [key: string]: any };
  delay?: number; // in minutes
  description: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  statistics: {
    triggered: number;
    completed: number;
    failed: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
  category: 'lead_nurturing' | 'tenant_engagement' | 'maintenance' | 'renewals' | 'marketing' | 'custom';
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  contactId: string;
  contactName: string;
  currentStep: number;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  executionLog: {
    stepId: string;
    action: string;
    status: 'success' | 'failed' | 'skipped';
    timestamp: string;
    message?: string;
  }[];
}

const mockWorkflows: Workflow[] = [
  {
    id: 'wf_001',
    name: 'Lead Nurturing Sequence',
    description: 'Automated follow-up sequence for new leads with AI-powered personalization',
    status: 'active',
    trigger: {
      id: 'trigger_001',
      type: 'lead_created',
      name: 'New Lead Created',
      conditions: [
        { id: 'cond_001', field: 'lead_score', operator: 'greater_than', value: 60 }
      ],
      description: 'Triggers when a new lead is created with score > 60'
    },
    actions: [
      {
        id: 'action_001',
        type: 'send_email',
        name: 'Welcome Email',
        parameters: {
          template: 'welcome_lead',
          subject: 'Welcome to [PROPERTY_NAME]',
          personalized: true
        },
        delay: 0,
        description: 'Send personalized welcome email immediately'
      },
      {
        id: 'action_002',
        type: 'wait',
        name: 'Wait 1 Day',
        parameters: { duration: 1440 },
        delay: 1440,
        description: 'Wait 24 hours before next action'
      },
      {
        id: 'action_003',
        type: 'ai_action',
        name: 'AI Property Recommendations',
        parameters: {
          type: 'property_match',
          sendMethod: 'email',
          includeVirtualTour: true
        },
        description: 'AI generates personalized property recommendations'
      },
      {
        id: 'action_004',
        type: 'create_task',
        name: 'Schedule Follow-up Call',
        parameters: {
          title: 'Follow-up call with [CONTACT_NAME]',
          dueDate: '+3 days',
          assignTo: 'best_match_agent'
        },
        delay: 4320,
        description: 'Create follow-up task for best matched agent'
      }
    ],
    statistics: {
      triggered: 45,
      completed: 38,
      failed: 2,
      conversionRate: 0.67
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    category: 'lead_nurturing'
  },
  {
    id: 'wf_002',
    name: 'Lease Renewal Campaign',
    description: 'Automated lease renewal process with tenant engagement tracking',
    status: 'active',
    trigger: {
      id: 'trigger_002',
      type: 'lease_expiring',
      name: 'Lease Expiring Soon',
      conditions: [
        { id: 'cond_002', field: 'days_until_expiry', operator: 'equals', value: 90 }
      ],
      description: 'Triggers 90 days before lease expiration'
    },
    actions: [
      {
        id: 'action_005',
        type: 'send_email',
        name: 'Renewal Notice',
        parameters: {
          template: 'lease_renewal_notice',
          subject: 'Your Lease Renewal Options',
          attachments: ['renewal_terms.pdf']
        },
        description: 'Send initial renewal notice with terms'
      },
      {
        id: 'action_006',
        type: 'wait',
        name: 'Wait 2 Weeks',
        parameters: { duration: 20160 },
        delay: 20160,
        description: 'Wait for tenant response'
      },
      {
        id: 'action_007',
        type: 'send_sms',
        name: 'SMS Reminder',
        parameters: {
          message: 'Hi [TENANT_NAME], just checking if you received our lease renewal information. Reply YES if interested!',
          trackResponse: true
        },
        description: 'Send SMS reminder if no response'
      }
    ],
    statistics: {
      triggered: 23,
      completed: 19,
      failed: 1,
      conversionRate: 0.78
    },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    category: 'renewals'
  },
  {
    id: 'wf_003',
    name: 'Maintenance Request Follow-up',
    description: 'Automated tenant satisfaction and follow-up after maintenance completion',
    status: 'active',
    trigger: {
      id: 'trigger_003',
      type: 'maintenance_requested',
      name: 'Maintenance Completed',
      conditions: [
        { id: 'cond_003', field: 'status', operator: 'equals', value: 'completed' }
      ],
      description: 'Triggers when maintenance request is marked as completed'
    },
    actions: [
      {
        id: 'action_008',
        type: 'wait',
        name: 'Wait 2 Hours',
        parameters: { duration: 120 },
        delay: 120,
        description: 'Allow time for tenant to notice completion'
      },
      {
        id: 'action_009',
        type: 'send_sms',
        name: 'Completion Notification',
        parameters: {
          message: 'Your maintenance request has been completed. Rate your experience: [SURVEY_LINK]',
          includeSurvey: true
        },
        description: 'Notify tenant of completion with satisfaction survey'
      },
      {
        id: 'action_010',
        type: 'create_task',
        name: 'Follow-up Task',
        parameters: {
          title: 'Follow up on maintenance satisfaction for [TENANT_NAME]',
          dueDate: '+1 day',
          assignTo: 'property_manager'
        },
        delay: 1440,
        description: 'Create follow-up task for property manager'
      }
    ],
    statistics: {
      triggered: 67,
      completed: 62,
      failed: 3,
      conversionRate: 0.91
    },
    createdAt: '2024-01-08T14:30:00Z',
    updatedAt: '2024-01-22T16:15:00Z',
    category: 'maintenance'
  }
];

const mockExecutions: WorkflowExecution[] = [
  {
    id: 'exec_001',
    workflowId: 'wf_001',
    contactId: 'contact_001',
    contactName: 'Michael Chen',
    currentStep: 2,
    status: 'running',
    startedAt: '2024-01-23T10:30:00Z',
    executionLog: [
      {
        stepId: 'action_001',
        action: 'Welcome Email Sent',
        status: 'success',
        timestamp: '2024-01-23T10:30:00Z',
        message: 'Email sent successfully to michael.chen@email.com'
      },
      {
        stepId: 'action_002',
        action: 'Wait Period',
        status: 'success',
        timestamp: '2024-01-24T10:30:00Z',
        message: 'Wait period completed'
      }
    ]
  }
];

const AdvancedWorkflowEngine: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(mockExecutions);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [executionsDialogOpen, setExecutionsDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    status: 'draft',
    category: 'custom'
  });

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'lead_created': return <GroupIcon />;
      case 'lead_scored': return <PsychologyIcon />;
      case 'email_opened': return <EmailIcon />;
      case 'property_viewed': return <InfoIcon />;
      case 'application_submitted': return <AssignmentIcon />;
      case 'payment_due': return <ScheduleIcon />;
      case 'maintenance_requested': return <SettingsIcon />;
      case 'lease_expiring': return <WarningIcon />;
      default: return <FlagIcon />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <EmailIcon />;
      case 'send_sms': return <SmsIcon />;
      case 'make_call': return <PhoneIcon />;
      case 'create_task': return <AssignmentIcon />;
      case 'wait': return <ScheduleIcon />;
      case 'ai_action': return <AutoAwesomeIcon />;
      default: return <TransformIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'draft': return 'warning';
      case 'running': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(wf => 
        wf.id === workflowId 
          ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' as any }
          : wf
      )
    );
  };

  const duplicateWorkflow = (workflow: Workflow) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `wf_${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      status: 'draft',
      statistics: {
        triggered: 0,
        completed: 0,
        failed: 0,
        conversionRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouterIcon />
          Advanced Workflow Engine
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => setExecutionsDialogOpen(true)}
            startIcon={<TimelineIcon />}
          >
            View Executions
          </Button>
          <Button
            variant="contained"
            onClick={() => setWorkflowDialogOpen(true)}
            startIcon={<AddIcon />}
          >
            Create Workflow
          </Button>
        </Stack>
      </Stack>

      {/* Workflow Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Workflows
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {workflows.filter(wf => wf.status === 'active').length}
                  </Typography>
                </Box>
                <PlayArrowIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Running Executions
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {executions.filter(ex => ex.status === 'running').length}
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
                    Avg Conversion Rate
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {Math.round((workflows.reduce((sum, wf) => sum + wf.statistics.conversionRate, 0) / workflows.length) * 100)}%
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                    Total Triggered
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {workflows.reduce((sum, wf) => sum + wf.statistics.triggered, 0)}
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Workflows List */}
      <Grid container spacing={3}>
        {workflows.map((workflow) => (
          <Grid item xs={12} lg={6} key={workflow.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6">{workflow.name}</Typography>
                      <Chip 
                        label={workflow.status} 
                        size="small" 
                        color={getStatusColor(workflow.status) as any}
                      />
                      <Chip 
                        label={workflow.category} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {workflow.description}
                    </Typography>
                  </Box>
                </Stack>

                {/* Trigger Information */}
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {getTriggerIcon(workflow.trigger.type)}
                      <Typography variant="subtitle2">
                        Trigger: {workflow.trigger.name}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {workflow.trigger.description}
                    </Typography>
                    {workflow.trigger.conditions.map((condition, index) => (
                      <Chip 
                        key={index}
                        label={`${condition.field} ${condition.operator} ${condition.value}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mt: 1 }}
                      />
                    ))}
                  </AccordionDetails>
                </Accordion>

                {/* Actions Preview */}
                <Typography variant="subtitle2" gutterBottom>
                  Actions ({workflow.actions.length}):
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  {workflow.actions.slice(0, 4).map((action) => (
                    <Tooltip key={action.id} title={action.description}>
                      <Chip
                        icon={getActionIcon(action.type)}
                        label={action.name}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  ))}
                  {workflow.actions.length > 4 && (
                    <Chip 
                      label={`+${workflow.actions.length - 4} more`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Stack>

                {/* Statistics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Triggered</Typography>
                    <Typography variant="body2" color="primary.main">
                      {workflow.statistics.triggered}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                    <Typography variant="body2" color="success.main">
                      {workflow.statistics.completed}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Failed</Typography>
                    <Typography variant="body2" color="error.main">
                      {workflow.statistics.failed}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Conversion</Typography>
                    <Typography variant="body2" color="info.main">
                      {Math.round(workflow.statistics.conversionRate * 100)}%
                    </Typography>
                  </Grid>
                </Grid>

                {/* Actions */}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => duplicateWorkflow(workflow)}
                    startIcon={<AddIcon />}
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setWorkflowDialogOpen(true);
                    }}
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant={workflow.status === 'active' ? 'outlined' : 'contained'}
                    color={workflow.status === 'active' ? 'error' : 'success'}
                    onClick={() => toggleWorkflowStatus(workflow.id)}
                    startIcon={workflow.status === 'active' ? <PauseIcon /> : <PlayArrowIcon />}
                  >
                    {workflow.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Workflow Dialog */}
      <Dialog 
        open={workflowDialogOpen} 
        onClose={() => {
          setWorkflowDialogOpen(false);
          setSelectedWorkflow(null);
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          {selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Create sophisticated automation workflows with triggers, conditions, and AI-powered actions.
              Workflows can include email sequences, SMS campaigns, task creation, field updates, and intelligent routing.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Workflow Name"
                value={selectedWorkflow?.name || newWorkflow.name || ''}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={selectedWorkflow?.description || newWorkflow.description || ''}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedWorkflow?.category || newWorkflow.category || 'custom'}
                  label="Category"
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <MenuItem value="lead_nurturing">Lead Nurturing</MenuItem>
                  <MenuItem value="tenant_engagement">Tenant Engagement</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="renewals">Lease Renewals</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Workflow Builder</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  🚀 Visual workflow builder coming soon!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Features:
                  • Drag & drop workflow designer
                  • AI-powered action suggestions
                  • Real-time workflow validation
                  • A/B testing capabilities
                  • Advanced branching logic
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setWorkflowDialogOpen(false);
            setSelectedWorkflow(null);
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Handle workflow creation/update
              console.log('Saving workflow:', selectedWorkflow || newWorkflow);
              setWorkflowDialogOpen(false);
              setSelectedWorkflow(null);
              setNewWorkflow({ name: '', description: '', status: 'draft', category: 'custom' });
            }}
          >
            {selectedWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Executions Dialog */}
      <Dialog 
        open={executionsDialogOpen} 
        onClose={() => setExecutionsDialogOpen(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>Workflow Executions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Monitor real-time workflow executions and track progress through each step.
          </Typography>
          
          <List>
            {executions.map((execution) => (
              <ListItem key={execution.id} divider>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: getStatusColor(execution.status) + '.light' }}>
                    {execution.contactName.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="subtitle1">{execution.contactName}</Typography>
                      <Chip 
                        label={execution.status} 
                        size="small" 
                        color={getStatusColor(execution.status) as any}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Step {execution.currentStep + 1}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Workflow: {workflows.find(wf => wf.id === execution.workflowId)?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Started: {new Date(execution.startedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecutionsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedWorkflowEngine;
