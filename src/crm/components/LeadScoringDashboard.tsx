import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Avatar,
  IconButton,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Alert,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Rating
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';;
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { advancedLeadScoringService } from '../services/AdvancedLeadScoringService';
import { uniformTooltipStyles } from '../utils/formStyles';
import { useCrmData } from '../contexts/CrmDataContext';

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
      id={`scoring-tabpanel-${index}`}
      aria-labelledby={`scoring-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const gradeColors = {
  A: '#4caf50',
  B: '#8bc34a',
  C: '#ff9800',
  D: '#ff5722',
  F: '#f44336'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function LeadScoringDashboard() {
  const { state } = useCrmData();
  const { prospects } = state;
  const [currentTab, setCurrentTab] = React.useState(0);
  const [selectedProspect, setSelectedProspect] = React.useState<any>(null);
  const [openScoreDialog, setOpenScoreDialog] = React.useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = React.useState(false);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [scoringAnalytics, setScoringAnalytics] = React.useState<any>(null);
  const [topProspects, setTopProspects] = React.useState<any[]>([]);
  const [leadScore, setLeadScore] = React.useState<any>(null);
  const [recommendations, setRecommendations] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadDashboardData();
  }, [prospects]);

  const loadDashboardData = async () => {
    try {
      setIsCalculating(true);
      
      // Calculate scores for all prospects
      const scores = advancedLeadScoringService.calculateBulkScores(prospects);
      
      // Get analytics
      const analytics = advancedLeadScoringService.getScoringAnalytics();
      setScoringAnalytics(analytics);
      
      // Get top prospects
      const top = advancedLeadScoringService.getTopProspects(10);
      setTopProspects(top);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCalculateScore = async (prospectId: string) => {
    const prospect = prospects.find(p => p.id === prospectId);
    if (!prospect) return;

    setIsCalculating(true);
    try {
      const score = advancedLeadScoringService.calculateLeadScore(prospectId, prospect, {
        includeAI: true,
        includeBehavioral: true,
        forceBehaviorRefresh: true
      });
      
      setLeadScore(score);
      
      const recs = advancedLeadScoringService.getRecommendations(prospectId);
      setRecommendations(recs);
      
      setOpenScoreDialog(true);
    } catch (error) {
      console.error('Error calculating score:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRecalculateAll = async () => {
    setIsCalculating(true);
    try {
      // Force recalculation of all scores
      const scores = advancedLeadScoringService.calculateBulkScores(prospects.map(p => ({ ...p, forceRefresh: true })));
      await loadDashboardData();
    } catch (error) {
      console.error('Error recalculating scores:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A': return <EmojiEventsIcon sx={{ color: gradeColors.A }} />;
      case 'B': return <CheckCircleIcon sx={{ color: gradeColors.B }} />;
      case 'C': return <SpeedIcon sx={{ color: gradeColors.C }} />;
      case 'D': return <WarningIcon sx={{ color: gradeColors.D }} />;
      case 'F': return <WarningIcon sx={{ color: gradeColors.F }} />;
      default: return <PersonIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Prospects</Typography>
                    <Typography variant="h4">{scoringAnalytics?.totalProspects || 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AnalyticsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Average Score</Typography>
                    <Typography variant="h4">{scoringAnalytics?.averageScore?.toFixed(1) || '0.0'}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">High Probability</Typography>
                    <Typography variant="h4">{scoringAnalytics?.conversionPredictions?.high || 0}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Predicted Value</Typography>
                    <Typography variant="h4">
                      {formatCurrency(topProspects.reduce((sum, p) => sum + (p.prediction?.lifetimeValue || 0), 0))}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Grade Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Grade Distribution</Typography>
            {scoringAnalytics?.gradeDistribution && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={Object.entries(scoringAnalytics.gradeDistribution).map(([grade, count], index) => ({
                      name: `Grade ${grade}`,
                      value: count,
                      color: gradeColors[grade as keyof typeof gradeColors] || COLORS[index]
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {Object.entries(scoringAnalytics.gradeDistribution).map(([grade], index) => (
                      <Cell key={index} fill={gradeColors[grade as keyof typeof gradeColors] || COLORS[index]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Category Averages */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Category Performance</Typography>
            {scoringAnalytics?.categoryAverages && (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={Object.entries(scoringAnalytics.categoryAverages).map(([category, score]) => ({
                  category: category.charAt(0).toUpperCase() + category.slice(1),
                  score: score
                }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 20]} />
                  <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Scoring Trends */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Scoring Trends (Last 30 Days)</Typography>
            {scoringAnalytics?.trends && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoringAnalytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="averageScore" 
                    stroke="#8884d8" 
                    name="Average Score"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="totalProspects" 
                    stroke="#82ca9d" 
                    name="Total Prospects"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTopProspectsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Top Scoring Prospects</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRecalculateAll}
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Recalculate All'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={() => setOpenSettingsDialog(true)}
            >
              Scoring Settings
            </Button>
          </Stack>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prospect</TableCell>
                <TableCell>Score & Grade</TableCell>
                <TableCell>Conversion Probability</TableCell>
                <TableCell>Predicted Value</TableCell>
                <TableCell>Time to Convert</TableCell>
                <TableCell>Churn Risk</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topProspects.map((prospect) => (
                <TableRow key={prospect.prospectId}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar>
                        {getGradeIcon(prospect.grade)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {prospect.entity?.title || `Prospect ${prospect.prospectId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last updated: {new Date(prospect.lastUpdated).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack alignItems="center" spacing={1}>
                      <Typography variant="h6" color="primary.main">
                        {prospect.totalScore.toFixed(1)}
                      </Typography>
                      <Chip
                        label={`Grade ${prospect.grade}`}
                        size="small"
                        sx={{
                          bgcolor: gradeColors[prospect.grade],
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack alignItems="center" spacing={1}>
                      <Typography variant="body2">
                        {formatPercentage(prospect.prediction.conversionProbability)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={prospect.prediction.conversionProbability * 100}
                        sx={{ width: 60, height: 8, borderRadius: 4 }}
                        color={prospect.prediction.conversionProbability > 0.7 ? 'success' : 
                               prospect.prediction.conversionProbability > 0.4 ? 'warning' : 'error'}
                      />
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      {formatCurrency(prospect.prediction.lifetimeValue)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {prospect.prediction.timeToConversion} days
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Stack alignItems="center" spacing={1}>
                      <Typography variant="body2">
                        {formatPercentage(prospect.prediction.churnRisk)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={prospect.prediction.churnRisk * 100}
                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                        color={prospect.prediction.churnRisk < 0.3 ? 'success' : 
                               prospect.prediction.churnRisk < 0.6 ? 'warning' : 'error'}
                      />
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Detailed Score" sx={uniformTooltipStyles}>
                        <IconButton
                          size="small"
                          onClick={() => handleCalculateScore(prospect.prospectId)}
                        >
                          <AnalyticsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Contact Prospect" sx={uniformTooltipStyles}>
                        <IconButton size="small">
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Schedule Meeting" sx={uniformTooltipStyles}>
                        <IconButton size="small">
                          <ScheduleIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );

  const renderAIInsightsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">AI-Powered Lead Intelligence</Typography>
          <Typography variant="body2">
            Advanced behavioral analysis and predictive insights powered by machine learning algorithms.
          </Typography>
        </Alert>
      </Grid>

      {/* Behavioral Patterns */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Behavioral Patterns
            </Typography>
            <Stack spacing={2}>
              {[
                { pattern: 'High Engagement', count: 23, trend: 'up', description: 'Prospects with multiple property views and quick responses' },
                { pattern: 'Email Avoiders', count: 12, trend: 'down', description: 'Prefer phone calls over email communication' },
                { pattern: 'Weekend Browsers', count: 34, trend: 'up', description: 'Most active during weekends' },
                { pattern: 'Price Sensitive', count: 18, trend: 'stable', description: 'Focus heavily on rental rates and fees' }
              ].map((pattern, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">{pattern.pattern}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pattern.description}
                      </Typography>
                    </Box>
                    <Stack alignItems="center" spacing={1}>
                      <Badge badgeContent={pattern.count} color="primary">
                        {pattern.trend === 'up' ? <TrendingUpIcon color="success" /> :
                         pattern.trend === 'down' ? <TrendingDownIcon color="error" /> :
                         <TrendingUpIcon color="action" />}
                      </Badge>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Predictive Insights */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <InsightsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Predictive Insights
            </Typography>
            <Stack spacing={2}>
              {[
                { 
                  insight: 'Conversion Rate Optimization', 
                  impact: 'High',
                  description: 'Focus on prospects who view 3+ properties - 85% conversion rate',
                  confidence: 92
                },
                { 
                  insight: 'Optimal Contact Timing', 
                  impact: 'Medium',
                  description: 'Tuesday-Thursday 2-4 PM shows highest response rates',
                  confidence: 78
                },
                { 
                  insight: 'Financial Pre-qualification', 
                  impact: 'High',
                  description: 'Early financial screening reduces time to conversion by 40%',
                  confidence: 89
                },
                { 
                  insight: 'Email Sequence Optimization', 
                  impact: 'Medium',
                  description: 'Personalized follow-ups increase engagement by 60%',
                  confidence: 84
                }
              ].map((insight, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{insight.insight}</Typography>
                      <Chip 
                        label={insight.impact} 
                        size="small" 
                        color={insight.impact === 'High' ? 'error' : 'warning'}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {insight.description}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption">AI Confidence</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LinearProgress
                          variant="determinate"
                          value={insight.confidence}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                          color="success"
                        />
                        <Typography variant="caption">{insight.confidence}%</Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Conversion Predictions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Next 30 Days Conversion Predictions</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main">
                    {scoringAnalytics?.conversionPredictions?.high || 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    High Probability (70%+)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Expected revenue: {formatCurrency(
                      (scoringAnalytics?.conversionPredictions?.high || 0) * 2500
                    )}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="warning.main">
                    {scoringAnalytics?.conversionPredictions?.medium || 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Medium Probability (40-70%)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Expected revenue: {formatCurrency(
                      (scoringAnalytics?.conversionPredictions?.medium || 0) * 1500
                    )}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" color="error.main">
                    {scoringAnalytics?.conversionPredictions?.low || 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Low Probability (40%-)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Expected revenue: {formatCurrency(
                      (scoringAnalytics?.conversionPredictions?.low || 0) * 500
                    )}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Advanced Lead Scoring Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          {isCalculating && <CircularProgress size={24} />}
          <Chip
            icon={<PsychologyIcon />}
            label="AI-Powered"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<AnalyticsIcon />}
            label="Overview"
            iconPosition="start"
          />
          <Tab
            icon={<StarIcon />}
            label="Top Prospects"
            iconPosition="start"
          />
          <Tab
            icon={<PsychologyIcon />}
            label="AI Insights"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderTopProspectsTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderAIInsightsTab()}
      </TabPanel>

      {/* Detailed Score Dialog */}
      <Dialog 
        open={openScoreDialog} 
        onClose={() => setOpenScoreDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Detailed Lead Score Analysis
          {leadScore && (
            <Chip
              label={`Grade ${leadScore.grade} - ${leadScore.totalScore.toFixed(1)} points`}
              sx={{
                ml: 2,
                bgcolor: gradeColors[leadScore.grade],
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {leadScore && (
            <Grid container spacing={3}>
              {/* Score Breakdown */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Score Breakdown</Typography>
                <Stack spacing={2}>
                  {Object.entries(leadScore.categoryScores).map(([category, score]) => (
                    <Box key={category}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {(score as number).toFixed(1)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (score as number) * 5)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Grid>

              {/* Predictions */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>AI Predictions</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Conversion Probability</Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatPercentage(leadScore.prediction.conversionProbability)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Expected Time to Convert</Typography>
                    <Typography variant="h6">{leadScore.prediction.timeToConversion} days</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Predicted Lifetime Value</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(leadScore.prediction.lifetimeValue)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Churn Risk</Typography>
                    <Typography variant="h6" color={leadScore.prediction.churnRisk > 0.5 ? 'error.main' : 'success.main'}>
                      {formatPercentage(leadScore.prediction.churnRisk)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Insights */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>AI Insights</Typography>
                <Stack spacing={1}>
                  {leadScore.insights.map((insight: string, index: number) => (
                    <Alert key={index} severity="info" variant="outlined">
                      {insight}
                    </Alert>
                  ))}
                </Stack>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Recommendations</Typography>
                <Stack spacing={2}>
                  {recommendations.map((rec, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2">{rec.action}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rec.reason}
                          </Typography>
                        </Box>
                        <Stack alignItems="center" spacing={1}>
                          <Chip 
                            label={rec.priority} 
                            size="small"
                            color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                          />
                          <Typography variant="caption">
                            +{rec.expectedImpact}% impact
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScoreDialog(false)}>Close</Button>
          <Button variant="contained">Take Action</Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={openSettingsDialog} 
        onClose={() => setOpenSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Lead Scoring Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure scoring criteria, weights, and AI settings to optimize lead scoring for your business.
          </Alert>
          
          <Typography variant="h6" gutterBottom>Coming Soon</Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced scoring configuration interface will be available in the next update.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
