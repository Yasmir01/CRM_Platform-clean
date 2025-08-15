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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing,
} from "../utils/formStyles";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CertificateRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";

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
      id={`onboarding-tabpanel-${index}`}
      aria-labelledby={`onboarding-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOptional: boolean;
  estimatedTime: string;
  category: "setup" | "configuration" | "training" | "verification";
  priority: "high" | "medium" | "low";
  prerequisites?: string[];
  resources: {
    type: "video" | "document" | "interactive" | "external";
    title: string;
    url: string;
    duration?: string;
  }[];
  checklist: {
    id: string;
    task: string;
    isCompleted: boolean;
  }[];
}

interface OnboardingGuide {
  id: string;
  title: string;
  description: string;
  type: "new_subscriber" | "advanced_setup" | "crm_workflow" | "feature_specific";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: string;
  steps: OnboardingStep[];
  tags: string[];
  completionRate: number;
  lastUpdated: string;
  featured: boolean;
}

interface UserProgress {
  userId: string;
  completedGuides: string[];
  completedSteps: string[];
  currentGuide?: string;
  currentStep?: string;
  totalProgress: number;
  certificationsEarned: string[];
  lastActivity: string;
}

const mockOnboardingGuides: OnboardingGuide[] = [
  {
    id: "guide_new_subscriber",
    title: "New Subscriber Quick Start",
    description: "Complete setup guide for new CRM subscribers to get started quickly",
    type: "new_subscriber",
    difficulty: "beginner",
    estimatedDuration: "45 minutes",
    tags: ["getting started", "basic setup", "essential"],
    completionRate: 85,
    lastUpdated: "2024-01-15T10:00:00Z",
    featured: true,
    steps: [
      {
        id: "step_account_setup",
        title: "Account Setup & Profile",
        description: "Set up your account profile and basic company information",
        isCompleted: true,
        isOptional: false,
        estimatedTime: "10 minutes",
        category: "setup",
        priority: "high",
        resources: [
          {
            type: "video",
            title: "Account Setup Walkthrough",
            url: "/videos/account-setup.mp4",
            duration: "5 minutes",
          },
          {
            type: "document",
            title: "Profile Setup Checklist",
            url: "/docs/profile-setup.pdf",
          },
        ],
        checklist: [
          { id: "check_1", task: "Complete company profile", isCompleted: true },
          { id: "check_2", task: "Upload company logo", isCompleted: true },
          { id: "check_3", task: "Set timezone and preferences", isCompleted: false },
        ],
      },
      {
        id: "step_user_management",
        title: "User Management & Permissions",
        description: "Add team members and configure user roles and permissions",
        isCompleted: false,
        isOptional: false,
        estimatedTime: "15 minutes",
        category: "configuration",
        priority: "high",
        prerequisites: ["step_account_setup"],
        resources: [
          {
            type: "video",
            title: "User Management Tutorial",
            url: "/videos/user-management.mp4",
            duration: "8 minutes",
          },
          {
            type: "interactive",
            title: "Role Configuration Tool",
            url: "/tools/role-config",
          },
        ],
        checklist: [
          { id: "check_4", task: "Invite team members", isCompleted: false },
          { id: "check_5", task: "Assign user roles", isCompleted: false },
          { id: "check_6", task: "Configure permissions", isCompleted: false },
        ],
      },
      {
        id: "step_basic_training",
        title: "CRM Basics Training",
        description: "Learn the fundamentals of using the CRM system",
        isCompleted: false,
        isOptional: false,
        estimatedTime: "20 minutes",
        category: "training",
        priority: "medium",
        prerequisites: ["step_user_management"],
        resources: [
          {
            type: "video",
            title: "CRM Basics Course",
            url: "/courses/crm-basics",
            duration: "15 minutes",
          },
          {
            type: "document",
            title: "Quick Reference Guide",
            url: "/docs/quick-reference.pdf",
          },
        ],
        checklist: [
          { id: "check_7", task: "Complete navigation tutorial", isCompleted: false },
          { id: "check_8", task: "Create first contact", isCompleted: false },
          { id: "check_9", task: "Add first property", isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "guide_advanced_setup",
    title: "Advanced Configuration",
    description: "Advanced setup for power users and administrators",
    type: "advanced_setup",
    difficulty: "advanced",
    estimatedDuration: "2 hours",
    tags: ["advanced", "configuration", "automation", "integrations"],
    completionRate: 65,
    lastUpdated: "2024-01-12T14:30:00Z",
    featured: true,
    steps: [
      {
        id: "step_api_setup",
        title: "API & Integrations Setup",
        description: "Configure API access and third-party integrations",
        isCompleted: false,
        isOptional: true,
        estimatedTime: "30 minutes",
        category: "configuration",
        priority: "medium",
        resources: [
          {
            type: "document",
            title: "API Documentation",
            url: "/docs/api-documentation.pdf",
          },
          {
            type: "external",
            title: "Developer Portal",
            url: "https://developers.example.com",
          },
        ],
        checklist: [
          { id: "check_10", task: "Generate API keys", isCompleted: false },
          { id: "check_11", task: "Configure webhooks", isCompleted: false },
          { id: "check_12", task: "Test integration", isCompleted: false },
        ],
      },
      {
        id: "step_automation_setup",
        title: "Workflow Automation",
        description: "Set up automated workflows and business rules",
        isCompleted: false,
        isOptional: false,
        estimatedTime: "45 minutes",
        category: "configuration",
        priority: "high",
        resources: [
          {
            type: "video",
            title: "Automation Masterclass",
            url: "/videos/automation-setup.mp4",
            duration: "25 minutes",
          },
          {
            type: "interactive",
            title: "Workflow Builder",
            url: "/tools/workflow-builder",
          },
        ],
        checklist: [
          { id: "check_13", task: "Create lead assignment rules", isCompleted: false },
          { id: "check_14", task: "Set up email automation", isCompleted: false },
          { id: "check_15", task: "Configure notifications", isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "guide_crm_workflow",
    title: "CRM Workflow Optimization",
    description: "Master CRM workflows for maximum efficiency and productivity",
    type: "crm_workflow",
    difficulty: "intermediate",
    estimatedDuration: "90 minutes",
    tags: ["workflow", "productivity", "best practices", "optimization"],
    completionRate: 72,
    lastUpdated: "2024-01-10T09:15:00Z",
    featured: false,
    steps: [
      {
        id: "step_lead_management",
        title: "Lead Management Best Practices",
        description: "Optimize your lead capture, qualification, and nurturing process",
        isCompleted: false,
        isOptional: false,
        estimatedTime: "30 minutes",
        category: "training",
        priority: "high",
        resources: [
          {
            type: "video",
            title: "Lead Management Strategies",
            url: "/videos/lead-management.mp4",
            duration: "20 minutes",
          },
          {
            type: "document",
            title: "Lead Scoring Guide",
            url: "/docs/lead-scoring.pdf",
          },
        ],
        checklist: [
          { id: "check_16", task: "Set up lead scoring", isCompleted: false },
          { id: "check_17", task: "Create lead nurture sequences", isCompleted: false },
          { id: "check_18", task: "Configure lead routing", isCompleted: false },
        ],
      },
      {
        id: "step_customer_journey",
        title: "Customer Journey Mapping",
        description: "Map and optimize the customer journey from lead to close",
        isCompleted: false,
        isOptional: false,
        estimatedTime: "45 minutes",
        category: "training",
        priority: "medium",
        resources: [
          {
            type: "interactive",
            title: "Journey Mapping Tool",
            url: "/tools/journey-mapper",
          },
          {
            type: "document",
            title: "Customer Journey Templates",
            url: "/docs/journey-templates.pdf",
          },
        ],
        checklist: [
          { id: "check_19", task: "Define customer stages", isCompleted: false },
          { id: "check_20", task: "Map touchpoints", isCompleted: false },
          { id: "check_21", task: "Set up stage automation", isCompleted: false },
        ],
      },
    ],
  },
];

const mockUserProgress: UserProgress = {
  userId: "user_123",
  completedGuides: [],
  completedSteps: ["step_account_setup"],
  currentGuide: "guide_new_subscriber",
  currentStep: "step_user_management",
  totalProgress: 12,
  certificationsEarned: [],
  lastActivity: "2024-01-18T15:30:00Z",
};

export default function OnboardingGuides() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [guides, setGuides] = React.useState<OnboardingGuide[]>(mockOnboardingGuides);
  const [userProgress, setUserProgress] = React.useState<UserProgress>(mockUserProgress);
  const [selectedGuide, setSelectedGuide] = React.useState<OnboardingGuide | null>(null);
  const [openGuideDialog, setOpenGuideDialog] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [expandedAccordions, setExpandedAccordions] = React.useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = React.useState<string>("all");
  const [filterType, setFilterType] = React.useState<string>("all");

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleStartGuide = (guide: OnboardingGuide) => {
    setSelectedGuide(guide);
    setActiveStep(0);
    setOpenGuideDialog(true);
    setUserProgress(prev => ({
      ...prev,
      currentGuide: guide.id,
      currentStep: guide.steps[0]?.id,
    }));
  };

  const handleCompleteStep = (stepId: string) => {
    if (!selectedGuide) return;

    setSelectedGuide(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, isCompleted: true } : step
        ),
      };
    });

    setUserProgress(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId],
      totalProgress: prev.totalProgress + 1,
    }));

    // Move to next step
    if (selectedGuide && activeStep < selectedGuide.steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleCompleteChecklistItem = (stepId: string, checklistId: string) => {
    if (!selectedGuide) return;

    setSelectedGuide(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId
            ? {
                ...step,
                checklist: step.checklist.map(item =>
                  item.id === checklistId ? { ...item, isCompleted: !item.isCompleted } : item
                ),
              }
            : step
        ),
      };
    });
  };

  const handleExpandAccordion = (accordionId: string) => {
    setExpandedAccordions(prev =>
      prev.includes(accordionId)
        ? prev.filter(id => id !== accordionId)
        : [...prev, accordionId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "success";
      case "intermediate": return "warning";
      case "advanced": return "error";
      default: return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "new_subscriber": return <PersonAddRoundedIcon />;
      case "advanced_setup": return <SettingsRoundedIcon />;
      case "crm_workflow": return <TimelineRoundedIcon />;
      case "feature_specific": return <IntegrationInstructionsRoundedIcon />;
      default: return <SchoolRoundedIcon />;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <VideoLibraryRoundedIcon />;
      case "document": return <MenuBookRoundedIcon />;
      case "interactive": return <QuizRoundedIcon />;
      case "external": return <LaunchRoundedIcon />;
      default: return <HelpRoundedIcon />;
    }
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = filterDifficulty === "all" || guide.difficulty === filterDifficulty;
    const matchesType = filterType === "all" || guide.type === filterType;
    
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const featuredGuides = guides.filter(guide => guide.featured);
  const totalSteps = guides.reduce((sum, guide) => sum + guide.steps.length, 0);
  const completedSteps = userProgress?.completedSteps?.length || 0;
  const progressPercentage = totalSteps > 0 ? Math.min(100, Math.max(0, (completedSteps / totalSteps) * 100)) : 0;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Onboarding & Setup Guides
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CertificateRoundedIcon />}
          >
            My Certificates
          </Button>
          <Button
            variant="contained"
            startIcon={<SupportAgentRoundedIcon />}
          >
            Get Support
          </Button>
        </Stack>
      </Stack>

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Your Onboarding Progress</Typography>
                  <Chip
                    label={`${completedSteps}/${totalSteps} Steps Completed`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {progressPercentage.toFixed(1)}% complete • Keep going to unlock all CRM features!
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="center">
                <Avatar sx={{ width: 64, height: 64, bgcolor: "success.main" }}>
                  <RocketLaunchRoundedIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="subtitle2">
                  {userProgress.certificationsEarned.length} Certifications Earned
                </Typography>
                {userProgress.currentGuide && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      const guide = guides.find(g => g.id === userProgress.currentGuide);
                      if (guide) handleStartGuide(guide);
                    }}
                  >
                    Continue Learning
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab
            icon={<RocketLaunchRoundedIcon />}
            label="Getting Started"
            iconPosition="start"
          />
          <Tab
            icon={<SchoolRoundedIcon />}
            label="All Guides"
            iconPosition="start"
          />
          <Tab
            icon={<CertificateRoundedIcon />}
            label="Certifications"
            iconPosition="start"
          />
          <Tab
            icon={<SupportAgentRoundedIcon />}
            label="Support Resources"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Getting Started Tab */}
      <TabPanel value={selectedTab} index={0}>
        <Stack spacing={3}>
          <Typography variant="h6">Featured Onboarding Paths</Typography>
          
          <Grid container spacing={3}>
            {featuredGuides.map((guide) => (
              <Grid item xs={12} md={6} lg={4} key={guide.id}>
                <Card sx={{ height: "100%", border: "2px solid", borderColor: "primary.main" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Badge badgeContent="Featured" color="primary">
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {getTypeIcon(guide.type)}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="h6">{guide.title}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={guide.difficulty}
                              color={getDifficultyColor(guide.difficulty) as any}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {guide.estimatedDuration}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {guide.description}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                        {guide.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Stack>

                      <Divider />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            {guide.steps.length} steps
                          </Typography>
                          <Typography variant="caption" color="success.main">
                            {guide.completionRate}% completion rate
                          </Typography>
                        </Stack>
                        
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowRoundedIcon />}
                          onClick={() => handleStartGuide(guide)}
                        >
                          Start Guide
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider />

          <Typography variant="h6">Quick Actions</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <Avatar sx={{ bgcolor: "info.main", mx: "auto", mb: 2 }}>
                  <DashboardRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Dashboard Tour
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  5-minute interactive tour
                </Typography>
                <Button size="small" variant="outlined">
                  Start Tour
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 2 }}>
                  <BusinessRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Company Setup
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure your organization
                </Typography>
                <Button size="small" variant="outlined">
                  Configure
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 2 }}>
                  <GroupsRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Team Invitation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Invite your team members
                </Typography>
                <Button size="small" variant="outlined">
                  Invite Team
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", p: 2 }}>
                <Avatar sx={{ bgcolor: "error.main", mx: "auto", mb: 2 }}>
                  <IntegrationInstructionsRoundedIcon />
                </Avatar>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Integrations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Connect external tools
                </Typography>
                <Button size="small" variant="outlined">
                  Explore
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </TabPanel>

      {/* All Guides Tab */}
      <TabPanel value={selectedTab} index={1}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HelpRoundedIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filterDifficulty}
                label="Difficulty"
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="new_subscriber">New Subscriber</MenuItem>
                <MenuItem value="advanced_setup">Advanced Setup</MenuItem>
                <MenuItem value="crm_workflow">CRM Workflow</MenuItem>
                <MenuItem value="feature_specific">Feature Specific</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Grid container spacing={3}>
            {filteredGuides.map((guide) => (
              <Grid item xs={12} md={6} lg={4} key={guide.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar>
                          {getTypeIcon(guide.type)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{guide.title}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={guide.difficulty}
                              color={getDifficultyColor(guide.difficulty) as any}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {guide.estimatedDuration}
                            </Typography>
                          </Stack>
                        </Box>
                        {guide.featured && (
                          <Chip label="Featured" color="primary" size="small" />
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {guide.description}
                      </Typography>

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          What You'll Learn:
                        </Typography>
                        <List dense>
                          {guide.steps.slice(0, 3).map((step) => (
                            <ListItem key={step.id} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {step.isCompleted ? (
                                  <CheckCircleRoundedIcon color="success" sx={{ fontSize: 16 }} />
                                ) : (
                                  <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16 }} />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={step.title}
                                primaryTypographyProps={{ variant: "body2" }}
                              />
                            </ListItem>
                          ))}
                          {guide.steps.length > 3 && (
                            <ListItem sx={{ py: 0 }}>
                              <ListItemText
                                primary={`+${guide.steps.length - 3} more steps`}
                                primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrowRoundedIcon />}
                        onClick={() => handleStartGuide(guide)}
                      >
                        Start Guide
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </TabPanel>

      {/* Certifications Tab */}
      <TabPanel value={selectedTab} index={2}>
        <Stack spacing={3}>
          <Alert severity="info">
            Complete onboarding guides to earn certifications and unlock advanced features!
          </Alert>

          <Typography variant="h6">Available Certifications</Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar sx={{ bgcolor: "gold", mx: "auto", mb: 2, width: 64, height: 64 }}>
                    <CertificateRoundedIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    CRM Fundamentals
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Master the basics of CRM usage and navigation
                  </Typography>
                  <Chip label="Not Started" color="default" sx={{ mb: 2 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Complete: New Subscriber Guide
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar sx={{ bgcolor: "silver", mx: "auto", mb: 2, width: 64, height: 64 }}>
                    <CertificateRoundedIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Advanced Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Expert-level system configuration and automation
                  </Typography>
                  <Chip label="Locked" color="default" sx={{ mb: 2 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Requires: CRM Fundamentals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar sx={{ bgcolor: "#CD7F32", mx: "auto", mb: 2, width: 64, height: 64 }}>
                    <CertificateRoundedIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Workflow Master
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Design and optimize complex business workflows
                  </Typography>
                  <Chip label="Locked" color="default" sx={{ mb: 2 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Requires: Advanced Configuration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </TabPanel>

      {/* Support Resources Tab */}
      <TabPanel value={selectedTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Help & Documentation
                </Typography>
                <List>
                  <ListItemButton>
                    <ListItemIcon>
                      <MenuBookRoundedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="User Manual"
                      secondary="Comprehensive guide to all features"
                    />
                    <LaunchRoundedIcon />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemIcon>
                      <VideoLibraryRoundedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Video Tutorials"
                      secondary="Step-by-step video guides"
                    />
                    <LaunchRoundedIcon />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemIcon>
                      <QuizRoundedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="FAQ & Troubleshooting"
                      secondary="Common questions and solutions"
                    />
                    <LaunchRoundedIcon />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Contact Support
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="info">
                    Our support team is available 24/7 to help you succeed!
                  </Alert>
                  <Button
                    variant="contained"
                    startIcon={<SupportAgentRoundedIcon />}
                    fullWidth
                  >
                    Chat with Support
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EmailRoundedIcon />}
                    fullWidth
                  >
                    Email Support
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleRoundedIcon />}
                    fullWidth
                  >
                    Schedule Call
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Guide Dialog */}
      <Dialog
        open={openGuideDialog}
        onClose={() => setOpenGuideDialog(false)}
        maxWidth="lg"
        fullWidth
        fullScreen
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack>
              <Typography variant="h6">{selectedGuide?.title}</Typography>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                <Link underline="hover" color="inherit">
                  Onboarding
                </Link>
                <Typography color="text.primary">{selectedGuide?.title}</Typography>
              </Breadcrumbs>
            </Stack>
            <Chip
              label={`Step ${activeStep + 1} of ${selectedGuide?.steps.length || 0}`}
              color="primary"
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedGuide && (
            <Stepper activeStep={activeStep} orientation="vertical">
              {selectedGuide.steps.map((step, index) => (
                <Step key={step.id}>
                  <StepLabel>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="subtitle1">{step.title}</Typography>
                      <Chip
                        label={step.category}
                        size="small"
                        variant="outlined"
                        color={step.priority === "high" ? "error" : step.priority === "medium" ? "warning" : "default"}
                      />
                      {step.isOptional && (
                        <Chip label="Optional" size="small" variant="outlined" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {step.estimatedTime}
                      </Typography>
                    </Stack>
                  </StepLabel>
                  <StepContent>
                    <Stack spacing={3}>
                      <Typography>{step.description}</Typography>

                      {step.resources.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Resources:
                          </Typography>
                          <Stack spacing={1}>
                            {step.resources.map((resource, resourceIndex) => (
                              <Card key={resourceIndex} variant="outlined">
                                <CardContent sx={{ py: 2 }}>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: "primary.light" }}>
                                      {getResourceIcon(resource.type)}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="subtitle2">
                                        {resource.title}
                                      </Typography>
                                      {resource.duration && (
                                        <Typography variant="caption" color="text.secondary">
                                          Duration: {resource.duration}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={
                                        resource.type === "external" ? (
                                          <LaunchRoundedIcon />
                                        ) : (
                                          <PlayArrowRoundedIcon />
                                        )
                                      }
                                    >
                                      {resource.type === "external" ? "Open" : "View"}
                                    </Button>
                                  </Stack>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Checklist:
                        </Typography>
                        <Stack spacing={1}>
                          {step.checklist.map((item) => (
                            <FormControlLabel
                              key={item.id}
                              control={
                                <Checkbox
                                  checked={item.isCompleted}
                                  onChange={() => handleCompleteChecklistItem(step.id, item.id)}
                                />
                              }
                              label={item.task}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          onClick={() => handleCompleteStep(step.id)}
                          disabled={step.isCompleted}
                          startIcon={
                            step.isCompleted ? (
                              <CheckCircleRoundedIcon />
                            ) : (
                              <PlayArrowRoundedIcon />
                            )
                          }
                        >
                          {step.isCompleted ? "Completed" : "Mark Complete"}
                        </Button>
                        {index < selectedGuide.steps.length - 1 && (
                          <Button
                            variant="outlined"
                            onClick={() => setActiveStep(index + 1)}
                          >
                            Next Step
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGuideDialog(false)}>Close Guide</Button>
          {selectedGuide && activeStep === selectedGuide.steps.length - 1 && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CertificateRoundedIcon />}
            >
              Complete Guide
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
