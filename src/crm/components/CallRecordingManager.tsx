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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Tooltip,
  Tab,
  Tabs,
  Badge,
  Switch,
  FormControlLabel,
  LinearProgress,
  Slider,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  ListItemButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import CallReceivedRoundedIcon from "@mui/icons-material/CallReceivedRounded";
import CallMadeRoundedIcon from "@mui/icons-material/CallMadeRounded";
import TranscribeRoundedIcon from "@mui/icons-material/TranscribeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import { uniformTooltipStyles } from "../utils/formStyles";

export interface CallRecording {
  id: string;
  callId: string;
  contactName: string;
  contactNumber: string;
  direction: "Inbound" | "Outbound";
  duration: number;
  timestamp: string;
  recordingUrl: string;
  fileSize: string;
  transcription?: string;
  tags: string[];
  notes?: string;
  quality: "Excellent" | "Good" | "Fair" | "Poor";
  agentId: string;
  agentName: string;
  disposition: "Sale" | "Follow-up" | "No Interest" | "Callback" | "Information" | "Complaint" | "Other";
  isStarred: boolean;
  isArchived: boolean;
  qualityScore?: number;
  sentimentScore?: number;
  keyTopics?: string[];
  complianceFlags?: string[];
  customer_satisfaction?: number;
  language?: string;
  backgroundNoise?: "Low" | "Medium" | "High";
  audioClarity?: number;
  isTrainingExample?: boolean;
}

export interface RecordingSettings {
  autoRecord: boolean;
  recordInbound: boolean;
  recordOutbound: boolean;
  enableTranscription: boolean;
  retentionDays: number;
  qualityAnalysis: boolean;
  customerConsent: boolean;
  storageLocation: "local" | "cloud" | "both";
  compressionEnabled: boolean;
  transcriptionLanguage: string;
  sentimentAnalysis: boolean;
  keywordDetection: boolean;
  complianceMonitoring: boolean;
  autoTagging: boolean;
  webhookUrl?: string;
  encryptionEnabled: boolean;
  accessControlEnabled: boolean;
}

interface CallRecordingManagerProps {
  recordings: CallRecording[];
  onUpdateRecording: (recordingId: string, updates: Partial<CallRecording>) => void;
  onDeleteRecording: (recordingId: string) => void;
  recordingSettings: RecordingSettings;
  onUpdateSettings: (settings: RecordingSettings) => void;
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
      id={`recording-tabpanel-${index}`}
      aria-labelledby={`recording-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CallRecordingManager({
  recordings,
  onUpdateRecording,
  onDeleteRecording,
  recordingSettings,
  onUpdateSettings,
}: CallRecordingManagerProps) {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRecording, setSelectedRecording] = React.useState<CallRecording | null>(null);
  const [playerOpen, setPlayerOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  
  // Audio player state
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(100);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  
  // Filters
  const [filters, setFilters] = React.useState({
    direction: "all",
    quality: "all",
    disposition: "all",
    dateRange: "all",
    agent: "all",
    starred: false,
    hasTranscription: false,
  });
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRecordingForMenu, setSelectedRecordingForMenu] = React.useState<CallRecording | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handlePlayRecording = (recording: CallRecording) => {
    setSelectedRecording(recording);
    setPlayerOpen(true);
    setIsPlaying(true);
  };

  const handleStarRecording = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      onUpdateRecording(recordingId, { isStarred: !recording.isStarred });
    }
  };

  const handleArchiveRecording = (recordingId: string) => {
    const recording = recordings.find(r => r.id === recordingId);
    if (recording) {
      onUpdateRecording(recordingId, { isArchived: !recording.isArchived });
    }
  };

  const handleDownloadRecording = (recording: CallRecording) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = recording.recordingUrl;
    link.download = `call_recording_${recording.contactName}_${new Date(recording.timestamp).toISOString().split('T')[0]}.mp3`;
    link.click();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Excellent": return "success";
      case "Good": return "info";
      case "Fair": return "warning";
      case "Poor": return "error";
      default: return "default";
    }
  };

  const getDispositionColor = (disposition: string) => {
    switch (disposition) {
      case "Sale": return "success";
      case "Follow-up": return "info";
      case "Callback": return "warning";
      case "No Interest": return "error";
      default: return "default";
    }
  };

  // Filter recordings based on search and filters
  const filteredRecordings = recordings.filter(recording => {
    if (recording.isArchived && selectedTab !== 2) return false;
    
    const matchesSearch = recording.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.contactNumber.includes(searchTerm) ||
      (recording.transcription && recording.transcription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      recording.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDirection = filters.direction === "all" || recording.direction === filters.direction;
    const matchesQuality = filters.quality === "all" || recording.quality === filters.quality;
    const matchesDisposition = filters.disposition === "all" || recording.disposition === filters.disposition;
    const matchesStarred = !filters.starred || recording.isStarred;
    const matchesTranscription = !filters.hasTranscription || recording.transcription;

    return matchesSearch && matchesDirection && matchesQuality && 
           matchesDisposition && matchesStarred && matchesTranscription;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, recording: CallRecording) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecordingForMenu(recording);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecordingForMenu(null);
  };

  const qualityAnalytics = React.useMemo(() => {
    const total = recordings.filter(r => !r.isArchived).length;
    const excellent = recordings.filter(r => !r.isArchived && r.quality === "Excellent").length;
    const good = recordings.filter(r => !r.isArchived && r.quality === "Good").length;
    const fair = recordings.filter(r => !r.isArchived && r.quality === "Fair").length;
    const poor = recordings.filter(r => !r.isArchived && r.quality === "Poor").length;
    
    return { total, excellent, good, fair, poor };
  }, [recordings]);

  const dispositionAnalytics = React.useMemo(() => {
    const nonArchived = recordings.filter(r => !r.isArchived);
    const sales = nonArchived.filter(r => r.disposition === "Sale").length;
    const followUps = nonArchived.filter(r => r.disposition === "Follow-up").length;
    const callbacks = nonArchived.filter(r => r.disposition === "Callback").length;
    const noInterest = nonArchived.filter(r => r.disposition === "No Interest").length;
    
    return { sales, followUps, callbacks, noInterest };
  }, [recordings]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <RecordVoiceOverRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1">
              Call Recording Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and analyze your call recordings for quality and training
            </Typography>
          </Box>
        </Stack>
        
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="list">
              <ViewListRoundedIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleRoundedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            variant="outlined"
            startIcon={<FilterListRoundedIcon />}
            size="small"
          >
            Filters
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SettingsRoundedIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
        </Stack>
      </Stack>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <MicRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Recordings
                  </Typography>
                  <Typography variant="h4">{qualityAnalytics.total}</Typography>
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
                  <AssessmentRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Quality Score
                  </Typography>
                  <Typography variant="h4">
                    {qualityAnalytics.total > 0 
                      ? Math.round(((qualityAnalytics.excellent * 4 + qualityAnalytics.good * 3 + qualityAnalytics.fair * 2 + qualityAnalytics.poor * 1) / qualityAnalytics.total / 4) * 100)
                      : 0}%
                  </Typography>
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
                  <TranscribeRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Transcriptions
                  </Typography>
                  <Typography variant="h4">
                    {recordings.filter(r => !r.isArchived && r.transcription).length}
                  </Typography>
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
                  <StarRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Starred
                  </Typography>
                  <Typography variant="h4">
                    {recordings.filter(r => !r.isArchived && r.isStarred).length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search recordings by contact, transcription, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Direction</InputLabel>
                <Select
                  value={filters.direction}
                  label="Direction"
                  onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Inbound">Inbound</MenuItem>
                  <MenuItem value="Outbound">Outbound</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Quality</InputLabel>
                <Select
                  value={filters.quality}
                  label="Quality"
                  onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Excellent">Excellent</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Fair">Fair</MenuItem>
                  <MenuItem value="Poor">Poor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Disposition</InputLabel>
                <Select
                  value={filters.disposition}
                  label="Disposition"
                  onChange={(e) => setFilters(prev => ({ ...prev, disposition: e.target.value }))}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Sale">Sale</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Callback">Callback</MenuItem>
                  <MenuItem value="No Interest">No Interest</MenuItem>
                  <MenuItem value="Information">Information</MenuItem>
                  <MenuItem value="Complaint">Complaint</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.starred}
                      onChange={(e) => setFilters(prev => ({ ...prev, starred: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Starred only"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.hasTranscription}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasTranscription: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Has transcription"
                />
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab
            icon={
              <Badge badgeContent={filteredRecordings.length} color="primary" max={99}>
                <RecordVoiceOverRoundedIcon />
              </Badge>
            }
            label="All Recordings"
            iconPosition="start"
          />
          <Tab
            icon={<AnalyticsRoundedIcon />}
            label="Analytics"
            iconPosition="start"
          />
          <Tab
            icon={<ArchiveRoundedIcon />}
            label="Archived"
            iconPosition="start"
          />
          <Tab
            icon={<SchoolRoundedIcon />}
            label="Training"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* All Recordings Tab */}
      <TabPanel value={selectedTab} index={0}>
        {viewMode === "list" ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Quality</TableCell>
                  <TableCell>Disposition</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecordings.map((recording) => (
                  <TableRow key={recording.id} hover>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {recording.contactName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {recording.contactNumber}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {recording.direction === "Inbound" ? (
                          <CallReceivedRoundedIcon color="info" fontSize="small" />
                        ) : (
                          <CallMadeRoundedIcon color="primary" fontSize="small" />
                        )}
                        <Typography variant="body2">{recording.direction}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDuration(recording.duration)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={recording.quality}
                        color={getQualityColor(recording.quality) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={recording.disposition}
                        color={getDispositionColor(recording.disposition) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(recording.timestamp).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {recording.agentName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Play Recording" sx={uniformTooltipStyles}>
                          <IconButton
                            size="small"
                            onClick={() => handlePlayRecording(recording)}
                          >
                            <PlayArrowRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={recording.isStarred ? "Unstar" : "Star"} sx={uniformTooltipStyles}>
                          <IconButton
                            size="small"
                            onClick={() => handleStarRecording(recording.id)}
                            color={recording.isStarred ? "warning" : "default"}
                          >
                            {recording.isStarred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="More Actions" sx={uniformTooltipStyles}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, recording)}
                          >
                            <MoreVertRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={2}>
            {filteredRecordings.map((recording) => (
              <Grid item xs={12} sm={6} md={4} key={recording.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {recording.contactName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {recording.contactNumber}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleStarRecording(recording.id)}
                          color={recording.isStarred ? "warning" : "default"}
                        >
                          {recording.isStarred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                        </IconButton>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {recording.direction === "Inbound" ? (
                          <Chip icon={<CallReceivedRoundedIcon />} label="Inbound" color="info" size="small" />
                        ) : (
                          <Chip icon={<CallMadeRoundedIcon />} label="Outbound" color="primary" size="small" />
                        )}
                        <Chip
                          label={recording.quality}
                          color={getQualityColor(recording.quality) as any}
                          size="small"
                        />
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          Duration: {formatDuration(recording.duration)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(recording.timestamp).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      
                      {recording.transcription && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Transcription preview:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {recording.transcription}
                          </Typography>
                        </Box>
                      )}
                      
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          startIcon={<PlayArrowRoundedIcon />}
                          onClick={() => handlePlayRecording(recording)}
                        >
                          Play
                        </Button>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, recording)}
                        >
                          <MoreVertRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={selectedTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Call Quality Distribution</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Excellent</Typography>
                      <Typography variant="body2">{qualityAnalytics.excellent}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (qualityAnalytics.excellent / qualityAnalytics.total) * 100 : 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Good</Typography>
                      <Typography variant="body2">{qualityAnalytics.good}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (qualityAnalytics.good / qualityAnalytics.total) * 100 : 0}
                      color="info"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Fair</Typography>
                      <Typography variant="body2">{qualityAnalytics.fair}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (qualityAnalytics.fair / qualityAnalytics.total) * 100 : 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Poor</Typography>
                      <Typography variant="body2">{qualityAnalytics.poor}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (qualityAnalytics.poor / qualityAnalytics.total) * 100 : 0}
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Call Disposition Analysis</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Sales</Typography>
                      <Typography variant="body2">{dispositionAnalytics.sales}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (dispositionAnalytics.sales / qualityAnalytics.total) * 100 : 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Follow-ups</Typography>
                      <Typography variant="body2">{dispositionAnalytics.followUps}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (dispositionAnalytics.followUps / qualityAnalytics.total) * 100 : 0}
                      color="info"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Callbacks</Typography>
                      <Typography variant="body2">{dispositionAnalytics.callbacks}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (dispositionAnalytics.callbacks / qualityAnalytics.total) * 100 : 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">No Interest</Typography>
                      <Typography variant="body2">{dispositionAnalytics.noInterest}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={qualityAnalytics.total > 0 ? (dispositionAnalytics.noInterest / qualityAnalytics.total) * 100 : 0}
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Archived Tab */}
      <TabPanel value={selectedTab} index={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Archived recordings are stored for compliance but excluded from analytics and training.
        </Alert>
        <Typography variant="h6">
          Archived Recordings ({recordings.filter(r => r.isArchived).length})
        </Typography>
        {/* Similar table/grid layout for archived recordings */}
      </TabPanel>

      {/* Training Tab */}
      <TabPanel value={selectedTab} index={3}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Use starred recordings as training examples for new agents and quality improvement.
        </Alert>
        
        <Stack spacing={3}>
          <Typography variant="h6">Training Materials</Typography>
          
          <Grid container spacing={2}>
            {recordings.filter(r => r.isStarred && !r.isArchived).map((recording) => (
              <Grid item xs={12} md={6} key={recording.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">{recording.contactName}</Typography>
                        <Chip label={recording.quality} color={getQualityColor(recording.quality) as any} size="small" />
                      </Stack>
                      
                      <Typography variant="body2" color="text.secondary">
                        {recording.disposition} call • {formatDuration(recording.duration)}
                      </Typography>
                      
                      {recording.transcription && (
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          "{recording.transcription.substring(0, 100)}..."
                        </Typography>
                      )}
                      
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" startIcon={<PlayArrowRoundedIcon />}>
                          Review
                        </Button>
                        <Button size="small" startIcon={<ShareRoundedIcon />}>
                          Share
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

      {/* Recording Player Dialog */}
      <Dialog
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{selectedRecording?.contactName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRecording?.contactNumber} • {selectedRecording ? formatDuration(selectedRecording.duration) : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => selectedRecording && handleDownloadRecording(selectedRecording)}>
                <DownloadRoundedIcon />
              </IconButton>
              <IconButton onClick={() => selectedRecording && handleStarRecording(selectedRecording.id)}>
                {selectedRecording?.isStarred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3}>
            {/* Audio Player Controls */}
            <Paper sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="center" spacing={2}>
                  <IconButton
                    size="large"
                    onClick={() => setIsPlaying(!isPlaying)}
                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                    {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  </IconButton>
                  <IconButton>
                    <StopRoundedIcon />
                  </IconButton>
                </Stack>
                
                <Slider
                  value={currentTime}
                  max={selectedRecording?.duration || 100}
                  onChange={(e, value) => setCurrentTime(value as number)}
                />
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption">
                    {formatDuration(currentTime)} / {selectedRecording ? formatDuration(selectedRecording.duration) : '0:00'}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption">Speed:</Typography>
                    <Select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(e.target.value as number)}
                      size="small"
                      sx={{ minWidth: 80 }}
                    >
                      <MenuItem value={0.5}>0.5x</MenuItem>
                      <MenuItem value={0.75}>0.75x</MenuItem>
                      <MenuItem value={1}>1x</MenuItem>
                      <MenuItem value={1.25}>1.25x</MenuItem>
                      <MenuItem value={1.5}>1.5x</MenuItem>
                      <MenuItem value={2}>2x</MenuItem>
                    </Select>
                    
                    <VolumeUpRoundedIcon />
                    <Slider
                      value={volume}
                      onChange={(e, value) => setVolume(value as number)}
                      sx={{ width: 100 }}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
            
            {/* Recording Details */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Quality</Typography>
                <Chip label={selectedRecording?.quality} color={getQualityColor(selectedRecording?.quality || '') as any} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Disposition</Typography>
                <Chip label={selectedRecording?.disposition} color={getDispositionColor(selectedRecording?.disposition || '') as any} variant="outlined" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Agent</Typography>
                <Typography variant="body2">{selectedRecording?.agentName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                <Typography variant="body2">
                  {selectedRecording ? new Date(selectedRecording.timestamp).toLocaleString() : ''}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Transcription */}
            {selectedRecording?.transcription && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography variant="subtitle1">Call Transcription</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedRecording.transcription}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
            
            {/* Notes */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Notes</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={selectedRecording?.notes || ''}
                onChange={(e) => {
                  if (selectedRecording) {
                    onUpdateRecording(selectedRecording.id, { notes: e.target.value });
                  }
                }}
                placeholder="Add notes about this call..."
              />
            </Box>
            
            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Tags</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedRecording?.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    onDelete={() => {
                      if (selectedRecording) {
                        const newTags = selectedRecording.tags.filter((_, i) => i !== index);
                        onUpdateRecording(selectedRecording.id, { tags: newTags });
                      }
                    }}
                  />
                ))}
                <Chip
                  icon={<LabelRoundedIcon />}
                  label="Add Tag"
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const tag = prompt('Enter tag:');
                    if (tag && selectedRecording) {
                      const newTags = [...selectedRecording.tags, tag];
                      onUpdateRecording(selectedRecording.id, { tags: newTags });
                    }
                  }}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPlayerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedRecordingForMenu) {
            handleDownloadRecording(selectedRecordingForMenu);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DownloadRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedRecordingForMenu) {
            onUpdateRecording(selectedRecordingForMenu.id, { isTrainingExample: !selectedRecordingForMenu.isTrainingExample });
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <SchoolRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {selectedRecordingForMenu?.isTrainingExample ? 'Remove from Training' : 'Add to Training'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedRecordingForMenu) {
            handleArchiveRecording(selectedRecordingForMenu.id);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ArchiveRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {selectedRecordingForMenu?.isArchived ? 'Unarchive' : 'Archive'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          if (selectedRecordingForMenu && window.confirm('Are you sure you want to delete this recording?')) {
            onDeleteRecording(selectedRecordingForMenu.id);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Recording Settings Dialog - Will be implemented in the next step */}
      {settingsOpen && (
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Recording Settings</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Recording settings configuration will be implemented in the next component.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
