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
  TextField,
  Paper,
  Divider,
  Alert,
  Rating,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SentimentVerySatisfiedRoundedIcon from "@mui/icons-material/SentimentVerySatisfiedRounded";
import SentimentSatisfiedRoundedIcon from "@mui/icons-material/SentimentSatisfiedRounded";
import SentimentNeutralRoundedIcon from "@mui/icons-material/SentimentNeutralRounded";
import SentimentDissatisfiedRoundedIcon from "@mui/icons-material/SentimentDissatisfiedRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { uniformTooltipStyles } from "../utils/formStyles";
import { CallRecording } from "./CallRecordingManager";

interface QualityMetrics {
  overallScore: number;
  audioClarity: number;
  backgroundNoise: number;
  speechPace: number;
  silenceRatio: number;
  volumeConsistency: number;
  sentimentScore: number;
  professionalismScore: number;
  customerSatisfaction: number;
}

interface QualityScorecard {
  id: string;
  name: string;
  criteria: QualityCriteria[];
  weights: { [key: string]: number };
  passingScore: number;
  isDefault: boolean;
}

interface QualityCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoreType: "rating" | "percentage" | "boolean";
  maxScore: number;
  keywords?: string[];
  required: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  recordingIds: string[];
  skillAreas: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDuration: number;
  completionRate: number;
  averageScore: number;
}

interface CallQualityAnalyzerProps {
  recordings: CallRecording[];
  onUpdateRecording: (recordingId: string, updates: Partial<CallRecording>) => void;
}

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
      id={`quality-tabpanel-${index}`}
      aria-labelledby={`quality-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CallQualityAnalyzer({
  recordings,
  onUpdateRecording,
}: CallQualityAnalyzerProps) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedRecording, setSelectedRecording] = React.useState<CallRecording | null>(null);
  const [qualityDialogOpen, setQualityDialogOpen] = React.useState(false);
  const [editingScorecard, setEditingScorecard] = React.useState(false);
  
  // Default quality scorecards
  const [scorecards, setScorecards] = React.useState<QualityScorecard[]>([
    {
      id: "default",
      name: "Customer Service Quality",
      criteria: [
        {
          id: "greeting",
          name: "Professional Greeting",
          description: "Agent properly introduces themselves and company",
          weight: 15,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "listening",
          name: "Active Listening",
          description: "Agent demonstrates they are listening and understanding",
          weight: 20,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "knowledge",
          name: "Product Knowledge",
          description: "Agent demonstrates good understanding of products/services",
          weight: 20,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "problem_solving",
          name: "Problem Solving",
          description: "Agent effectively addresses customer concerns",
          weight: 25,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "closing",
          name: "Professional Closing",
          description: "Agent properly summarizes and closes the call",
          weight: 10,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "compliance",
          name: "Compliance",
          description: "Agent follows required compliance procedures",
          weight: 10,
          scoreType: "boolean",
          maxScore: 1,
          required: true,
        },
      ],
      weights: {},
      passingScore: 75,
      isDefault: true,
    },
    {
      id: "sales",
      name: "Sales Performance",
      criteria: [
        {
          id: "rapport",
          name: "Building Rapport",
          description: "Agent establishes connection with prospect",
          weight: 15,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "needs_discovery",
          name: "Needs Discovery",
          description: "Agent asks effective questions to understand needs",
          weight: 25,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "presentation",
          name: "Solution Presentation",
          description: "Agent presents relevant solutions clearly",
          weight: 20,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "objection_handling",
          name: "Objection Handling",
          description: "Agent effectively addresses concerns and objections",
          weight: 20,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
        {
          id: "closing_technique",
          name: "Closing Technique",
          description: "Agent uses appropriate closing techniques",
          weight: 20,
          scoreType: "rating",
          maxScore: 5,
          required: true,
        },
      ],
      weights: {},
      passingScore: 80,
      isDefault: false,
    },
  ]);

  // Training modules
  const [trainingModules] = React.useState<TrainingModule[]>([
    {
      id: "customer_service_basics",
      title: "Customer Service Fundamentals",
      description: "Learn the basics of professional customer service",
      recordingIds: recordings.filter(r => r.quality === "Excellent" && r.disposition !== "Sale").slice(0, 5).map(r => r.id),
      skillAreas: ["Communication", "Listening", "Problem Solving"],
      difficulty: "Beginner",
      estimatedDuration: 30,
      completionRate: 85,
      averageScore: 82,
    },
    {
      id: "sales_mastery",
      title: "Sales Conversation Mastery",
      description: "Advanced techniques for successful sales calls",
      recordingIds: recordings.filter(r => r.disposition === "Sale").slice(0, 8).map(r => r.id),
      skillAreas: ["Sales Techniques", "Persuasion", "Objection Handling"],
      difficulty: "Advanced",
      estimatedDuration: 45,
      completionRate: 67,
      averageScore: 78,
    },
    {
      id: "difficult_customers",
      title: "Handling Difficult Customers",
      description: "Strategies for managing challenging customer interactions",
      recordingIds: recordings.filter(r => r.disposition === "Complaint").slice(0, 6).map(r => r.id),
      skillAreas: ["De-escalation", "Empathy", "Resolution"],
      difficulty: "Intermediate",
      estimatedDuration: 35,
      completionRate: 72,
      averageScore: 75,
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleAnalyzeQuality = (recording: CallRecording) => {
    setSelectedRecording(recording);
    setQualityDialogOpen(true);
  };

  // Generate quality metrics for a recording
  const generateQualityMetrics = (recording: CallRecording): QualityMetrics => {
    // Simulate AI-powered quality analysis
    const baseScore = recording.quality === "Excellent" ? 90 : 
                     recording.quality === "Good" ? 80 :
                     recording.quality === "Fair" ? 65 : 45;
    
    return {
      overallScore: baseScore + Math.random() * 10 - 5,
      audioClarity: Math.min(100, baseScore + Math.random() * 15 - 5),
      backgroundNoise: recording.backgroundNoise === "Low" ? 90 : 
                      recording.backgroundNoise === "Medium" ? 70 : 40,
      speechPace: 75 + Math.random() * 20,
      silenceRatio: 80 + Math.random() * 15,
      volumeConsistency: 85 + Math.random() * 10,
      sentimentScore: recording.sentimentScore || (60 + Math.random() * 30),
      professionalismScore: baseScore + Math.random() * 10,
      customerSatisfaction: recording.customer_satisfaction || (70 + Math.random() * 25),
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 70) return "warning";
    return "error";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircleRoundedIcon color="success" />;
    if (score >= 70) return <WarningRoundedIcon color="warning" />;
    return <ErrorRoundedIcon color="error" />;
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 80) return <SentimentVerySatisfiedRoundedIcon color="success" />;
    if (score >= 60) return <SentimentSatisfiedRoundedIcon color="info" />;
    if (score >= 40) return <SentimentNeutralRoundedIcon color="warning" />;
    return <SentimentDissatisfiedRoundedIcon color="error" />;
  };

  // Calculate team performance metrics
  const teamMetrics = React.useMemo(() => {
    const nonArchived = recordings.filter(r => !r.isArchived);
    const totalCalls = nonArchived.length;
    const excellentCalls = nonArchived.filter(r => r.quality === "Excellent").length;
    const goodCalls = nonArchived.filter(r => r.quality === "Good").length;
    const avgQualityScore = totalCalls > 0 ? 
      ((excellentCalls * 95 + goodCalls * 85 + (totalCalls - excellentCalls - goodCalls) * 60) / totalCalls) : 0;
    
    const salesCalls = nonArchived.filter(r => r.disposition === "Sale").length;
    const conversionRate = totalCalls > 0 ? (salesCalls / totalCalls) * 100 : 0;
    
    return {
      totalCalls,
      avgQualityScore: Math.round(avgQualityScore),
      conversionRate: Math.round(conversionRate),
      excellentRate: totalCalls > 0 ? Math.round((excellentCalls / totalCalls) * 100) : 0,
    };
  }, [recordings]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <AssessmentRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1">
              Call Quality Analyzer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered quality scoring and training recommendations
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Performance Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <AssessmentRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Avg Quality Score
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h4">{teamMetrics.avgQualityScore}%</Typography>
                    {teamMetrics.avgQualityScore >= 85 ? (
                      <TrendingUpRoundedIcon color="success" />
                    ) : (
                      <TrendingDownRoundedIcon color="error" />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Excellent Calls
                  </Typography>
                  <Typography variant="h4">{teamMetrics.excellentRate}%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h4">{teamMetrics.conversionRate}%</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <SchoolRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Training Modules
                  </Typography>
                  <Typography variant="h4">{trainingModules.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab
            icon={<AssessmentRoundedIcon />}
            label="Quality Analysis"
            iconPosition="start"
          />
          <Tab
            icon={<SchoolRoundedIcon />}
            label="Training Modules"
            iconPosition="start"
          />
          <Tab
            icon={<EditRoundedIcon />}
            label="Scorecards"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Quality Analysis Tab */}
      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          {/* Recent Calls Quality */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Call Quality Scores</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Contact</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Quality</TableCell>
                        <TableCell>AI Score</TableCell>
                        <TableCell>Sentiment</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recordings.filter(r => !r.isArchived).slice(0, 10).map((recording) => {
                        const metrics = generateQualityMetrics(recording);
                        return (
                          <TableRow key={recording.id} hover>
                            <TableCell>
                              <Stack>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {recording.contactName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {recording.agentName}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {Math.floor(recording.duration / 60)}:{String(recording.duration % 60).padStart(2, '0')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={recording.quality}
                                color={
                                  recording.quality === "Excellent" ? "success" :
                                  recording.quality === "Good" ? "info" :
                                  recording.quality === "Fair" ? "warning" : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {getScoreIcon(metrics.overallScore)}
                                <Typography variant="body2">
                                  {Math.round(metrics.overallScore)}%
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {getSentimentIcon(metrics.sentimentScore)}
                                <Typography variant="body2">
                                  {Math.round(metrics.sentimentScore)}%
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => handleAnalyzeQuality(recording)}
                              >
                                Analyze
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Quality Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Quality Distribution</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Excellent (85%+)</Typography>
                      <Typography variant="body2">{recordings.filter(r => !r.isArchived && r.quality === "Excellent").length}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={teamMetrics.totalCalls > 0 ? (recordings.filter(r => !r.isArchived && r.quality === "Excellent").length / teamMetrics.totalCalls) * 100 : 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Good (70-84%)</Typography>
                      <Typography variant="body2">{recordings.filter(r => !r.isArchived && r.quality === "Good").length}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={teamMetrics.totalCalls > 0 ? (recordings.filter(r => !r.isArchived && r.quality === "Good").length / teamMetrics.totalCalls) * 100 : 0}
                      color="info"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Fair (50-69%)</Typography>
                      <Typography variant="body2">{recordings.filter(r => !r.isArchived && r.quality === "Fair").length}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={teamMetrics.totalCalls > 0 ? (recordings.filter(r => !r.isArchived && r.quality === "Fair").length / teamMetrics.totalCalls) * 100 : 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Poor (&lt;50%)</Typography>
                      <Typography variant="body2">{recordings.filter(r => !r.isArchived && r.quality === "Poor").length}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={teamMetrics.totalCalls > 0 ? (recordings.filter(r => !r.isArchived && r.quality === "Poor").length / teamMetrics.totalCalls) * 100 : 0}
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Improvement Areas</Typography>
                <Stack spacing={1}>
                  <Alert severity="warning" sx={{ fontSize: '0.875rem' }}>
                    <Typography variant="body2">
                      <strong>Background Noise:</strong> 23% of calls have high background noise
                    </Typography>
                  </Alert>
                  <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                    <Typography variant="body2">
                      <strong>Speech Pace:</strong> Consider training on optimal speaking speed
                    </Typography>
                  </Alert>
                  <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
                    <Typography variant="body2">
                      <strong>Professionalism:</strong> Team consistently scores well
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Training Modules Tab */}
      <TabPanel value={selectedTab} index={1}>
        <Grid container spacing={3}>
          {trainingModules.map((module) => (
            <Grid item xs={12} md={6} lg={4} key={module.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6">{module.title}</Typography>
                        <Chip
                          label={module.difficulty}
                          size="small"
                          color={
                            module.difficulty === "Beginner" ? "success" :
                            module.difficulty === "Intermediate" ? "warning" : "error"
                          }
                        />
                      </Box>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <SchoolRoundedIcon />
                      </Avatar>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {module.skillAreas.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2">
                          {module.estimatedDuration} min
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Recordings
                        </Typography>
                        <Typography variant="body2">
                          {module.recordingIds.length} examples
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption">Completion Rate</Typography>
                        <Typography variant="caption">{module.completionRate}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={module.completionRate}
                        color={module.completionRate >= 80 ? "success" : "warning"}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption">Average Score</Typography>
                        <Typography variant="caption">{module.averageScore}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={module.averageScore}
                        color={module.averageScore >= 80 ? "success" : "warning"}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    
                    <Button variant="contained" fullWidth>
                      Start Training
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Scorecards Tab */}
      <TabPanel value={selectedTab} index={2}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Quality Scorecards</Typography>
            <Button variant="contained" startIcon={<EditRoundedIcon />}>
              Create Scorecard
            </Button>
          </Stack>
          
          <Grid container spacing={3}>
            {scorecards.map((scorecard) => (
              <Grid item xs={12} lg={6} key={scorecard.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{scorecard.name}</Typography>
                        <Stack direction="row" spacing={1}>
                          {scorecard.isDefault && (
                            <Chip label="Default" color="primary" size="small" />
                          )}
                          <Chip
                            label={`${scorecard.passingScore}% pass`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                      
                      <Typography variant="body2" color="text.secondary">
                        {scorecard.criteria.length} evaluation criteria
                      </Typography>
                      
                      <List dense>
                        {scorecard.criteria.slice(0, 3).map((criteria) => (
                          <ListItem key={criteria.id}>
                            <ListItemIcon>
                              <CheckCircleRoundedIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={criteria.name}
                              secondary={`${criteria.weight}% weight`}
                            />
                          </ListItem>
                        ))}
                        {scorecard.criteria.length > 3 && (
                          <ListItem>
                            <ListItemText
                              primary={`+${scorecard.criteria.length - 3} more criteria`}
                              sx={{ color: 'text.secondary' }}
                            />
                          </ListItem>
                        )}
                      </List>
                      
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined">
                          Edit
                        </Button>
                        <Button size="small" variant="contained">
                          Use for Scoring
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </TabPanel>

      {/* Quality Analysis Dialog */}
      <Dialog
        open={qualityDialogOpen}
        onClose={() => setQualityDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Quality Analysis - {selectedRecording?.contactName}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedRecording && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Audio Quality Metrics</Typography>
                    {(() => {
                      const metrics = generateQualityMetrics(selectedRecording);
                      return (
                        <Stack spacing={2}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Overall Score</Typography>
                              <Typography variant="h6" color={getScoreColor(metrics.overallScore) + '.main'}>
                                {Math.round(metrics.overallScore)}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.overallScore}
                              color={getScoreColor(metrics.overallScore) as any}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Audio Clarity</Typography>
                              <Typography variant="body2">{Math.round(metrics.audioClarity)}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.audioClarity}
                              color={getScoreColor(metrics.audioClarity) as any}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Background Noise</Typography>
                              <Typography variant="body2">{Math.round(metrics.backgroundNoise)}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.backgroundNoise}
                              color={getScoreColor(metrics.backgroundNoise) as any}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Speech Pace</Typography>
                              <Typography variant="body2">{Math.round(metrics.speechPace)}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.speechPace}
                              color={getScoreColor(metrics.speechPace) as any}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Stack>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Performance Metrics</Typography>
                    {(() => {
                      const metrics = generateQualityMetrics(selectedRecording);
                      return (
                        <Stack spacing={2}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Customer Sentiment</Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {getSentimentIcon(metrics.sentimentScore)}
                                <Typography variant="body2">{Math.round(metrics.sentimentScore)}%</Typography>
                              </Stack>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.sentimentScore}
                              color={getScoreColor(metrics.sentimentScore) as any}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Professionalism</Typography>
                              <Typography variant="body2">{Math.round(metrics.professionalismScore)}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.professionalismScore}
                              color={getScoreColor(metrics.professionalismScore) as any}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">Customer Satisfaction</Typography>
                              <Typography variant="body2">{Math.round(metrics.customerSatisfaction)}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={metrics.customerSatisfaction}
                              color={getScoreColor(metrics.customerSatisfaction) as any}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Stack>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>AI Recommendations</Typography>
                    <Stack spacing={1}>
                      <Alert severity="success">
                        <Typography variant="body2">
                          <strong>Strengths:</strong> Excellent greeting and professional tone throughout the call
                        </Typography>
                      </Alert>
                      <Alert severity="warning">
                        <Typography variant="body2">
                          <strong>Improvement:</strong> Consider reducing background noise for better audio quality
                        </Typography>
                      </Alert>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Training:</strong> Review "Active Listening Techniques" module for enhanced customer engagement
                        </Typography>
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setQualityDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<SaveRoundedIcon />}>
            Save Analysis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
