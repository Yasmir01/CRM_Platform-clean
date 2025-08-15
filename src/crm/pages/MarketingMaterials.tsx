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
  Checkbox,
  ListItemText,
  OutlinedInput,
  Divider,
  LinearProgress,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Badge,
  CardMedia,
  CardActions,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from "@mui/material";
import {
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing,
} from "../utils/formStyles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VideoFileRoundedIcon from "@mui/icons-material/VideoFileRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";

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
      id={`marketing-tabpanel-${index}`}
      aria-labelledby={`marketing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface MarketingMaterial {
  id: string;
  title: string;
  type: "Image" | "Video" | "Document" | "Website" | "Flyer" | "Brochure" | "Banner" | "Social Post";
  category: "Property Listing" | "Brand Assets" | "Campaign" | "Educational" | "Promotional" | "Event";
  fileUrl?: string;
  thumbnailUrl?: string;
  description: string;
  tags: string[];
  status: "Active" | "Archived" | "Draft" | "Review";
  createdDate: string;
  lastModified: string;
  createdBy: string;
  fileSize?: string;
  dimensions?: string;
  usage: {
    views: number;
    downloads: number;
    shares: number;
  };
  socialMediaPosts: {
    platform: string;
    postId: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }[];
  performance: {
    rating: number;
    feedback: string[];
  };
}

interface SocialMediaAccount {
  id: string;
  platform: "Facebook" | "Instagram" | "Twitter" | "LinkedIn" | "YouTube" | "Pinterest" | "TikTok" | "WhatsApp" | "Telegram";
  accountName: string;
  username: string;
  accountId: string;
  isActive: boolean;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  credentials: {
    accessToken: string;
    refreshToken?: string;
    apiKey?: string;
    secretKey?: string;
    appId?: string;
    pageId?: string;
    businessId?: string;
    expiresAt?: string;
  };
  lastSync: string;
  accountType: "Personal" | "Business" | "Creator";
  verificationStatus: "Verified" | "Unverified" | "Pending";
  analytics: {
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    period: string;
  };
}

interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  type: "Social Media" | "Email" | "SMS" | "Multi-Channel" | "Website" | "Print";
  status: "Planning" | "Active" | "Paused" | "Completed" | "Cancelled";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  materials: string[];
  socialAccounts: string[];
  metrics: {
    reach: number;
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
  };
  targetAudience: {
    demographics: string[];
    interests: string[];
    location: string[];
  };
}

const mockMaterials: MarketingMaterial[] = [
  {
    id: "mat_001",
    title: "Luxury Ocean View Villa - Hero Image",
    type: "Image",
    category: "Property Listing",
    fileUrl: "/images/villa-ocean-view.jpg",
    thumbnailUrl: "/images/villa-ocean-view-thumb.jpg",
    description: "High-quality hero image for luxury ocean view villa listing",
    tags: ["luxury", "ocean view", "villa", "property", "real estate"],
    status: "Active",
    createdDate: "2024-01-15T10:00:00Z",
    lastModified: "2024-01-16T14:30:00Z",
    createdBy: "Sarah Johnson",
    fileSize: "2.4 MB",
    dimensions: "1920x1080",
    usage: { views: 1247, downloads: 89, shares: 23 },
    socialMediaPosts: [
      { platform: "Instagram", postId: "post_123", likes: 245, comments: 18, shares: 12, reach: 3400 },
      { platform: "Facebook", postId: "post_456", likes: 189, comments: 31, shares: 45, reach: 5200 },
    ],
    performance: { rating: 4.8, feedback: ["Great quality", "Perfect lighting", "Excellent composition"] },
  },
  {
    id: "mat_002",
    title: "Property Investment Guide 2024",
    type: "Document",
    category: "Educational",
    fileUrl: "/documents/investment-guide-2024.pdf",
    description: "Comprehensive guide for property investment in 2024",
    tags: ["investment", "guide", "2024", "property", "education"],
    status: "Active",
    createdDate: "2024-01-10T09:00:00Z",
    lastModified: "2024-01-12T16:45:00Z",
    createdBy: "Mike Davis",
    fileSize: "5.7 MB",
    usage: { views: 892, downloads: 156, shares: 67 },
    socialMediaPosts: [
      { platform: "LinkedIn", postId: "post_789", likes: 78, comments: 12, shares: 23, reach: 2100 },
    ],
    performance: { rating: 4.6, feedback: ["Very informative", "Great resource", "Well structured"] },
  },
  {
    id: "mat_003",
    title: "Virtual Property Tour Video",
    type: "Video",
    category: "Property Listing",
    fileUrl: "/videos/virtual-tour-downtown.mp4",
    thumbnailUrl: "/images/video-thumb-downtown.jpg",
    description: "360-degree virtual tour of downtown apartment complex",
    tags: ["virtual tour", "video", "downtown", "apartment", "interactive"],
    status: "Active",
    createdDate: "2024-01-12T11:30:00Z",
    lastModified: "2024-01-13T09:15:00Z",
    createdBy: "Alex Chen",
    fileSize: "45.2 MB",
    dimensions: "1920x1080",
    usage: { views: 654, downloads: 23, shares: 89 },
    socialMediaPosts: [
      { platform: "YouTube", postId: "post_101", likes: 134, comments: 28, shares: 56, reach: 8900 },
      { platform: "Facebook", postId: "post_202", likes: 67, comments: 9, shares: 34, reach: 2300 },
    ],
    performance: { rating: 4.9, feedback: ["Excellent quality", "Very engaging", "Professional production"] },
  },
];

const mockSocialAccounts: SocialMediaAccount[] = [
  {
    id: "social_001",
    platform: "Facebook",
    accountName: "Premier Properties Inc",
    username: "premierproperties",
    accountId: "facebook_12345",
    isActive: true,
    followers: 15420,
    following: 1200,
    posts: 456,
    engagement: 6.8,
    credentials: {
      accessToken: "fb_access_token_encrypted",
      refreshToken: "fb_refresh_token_encrypted",
      appId: "facebook_app_123",
      pageId: "page_456",
      businessId: "business_789",
      expiresAt: "2024-12-31T23:59:59Z",
    },
    lastSync: "2024-01-18T12:00:00Z",
    accountType: "Business",
    verificationStatus: "Verified",
    analytics: {
      reach: 45200,
      impressions: 78900,
      engagement: 5640,
      clicks: 1890,
      period: "Last 30 days",
    },
  },
  {
    id: "social_002",
    platform: "Instagram",
    accountName: "Premier Properties",
    username: "premier_properties",
    accountId: "instagram_67890",
    isActive: true,
    followers: 8930,
    following: 850,
    posts: 234,
    engagement: 8.2,
    credentials: {
      accessToken: "ig_access_token_encrypted",
      refreshToken: "ig_refresh_token_encrypted",
      businessId: "ig_business_456",
      expiresAt: "2024-12-31T23:59:59Z",
    },
    lastSync: "2024-01-18T11:45:00Z",
    accountType: "Business",
    verificationStatus: "Verified",
    analytics: {
      reach: 28400,
      impressions: 52300,
      engagement: 4280,
      clicks: 1230,
      period: "Last 30 days",
    },
  },
  {
    id: "social_003",
    platform: "LinkedIn",
    accountName: "Premier Properties Inc.",
    username: "premier-properties-inc",
    accountId: "linkedin_13579",
    isActive: true,
    followers: 3420,
    following: 1890,
    posts: 89,
    engagement: 5.4,
    credentials: {
      accessToken: "li_access_token_encrypted",
      apiKey: "linkedin_api_key",
      secretKey: "linkedin_secret_key",
      expiresAt: "2024-12-31T23:59:59Z",
    },
    lastSync: "2024-01-18T10:30:00Z",
    accountType: "Business",
    verificationStatus: "Verified",
    analytics: {
      reach: 12800,
      impressions: 23400,
      engagement: 1670,
      clicks: 560,
      period: "Last 30 days",
    },
  },
];

const mockCampaigns: MarketingCampaign[] = [
  {
    id: "camp_001",
    name: "Q1 Luxury Properties Campaign",
    description: "Showcase luxury properties with high-end marketing materials",
    type: "Multi-Channel",
    status: "Active",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-03-31T23:59:59Z",
    budget: 25000,
    spent: 8750,
    materials: ["mat_001", "mat_003"],
    socialAccounts: ["social_001", "social_002"],
    metrics: {
      reach: 125000,
      impressions: 340000,
      clicks: 12400,
      conversions: 89,
      roi: 3.2,
    },
    targetAudience: {
      demographics: ["Age 35-55", "High Income", "Professional"],
      interests: ["Luxury Living", "Real Estate Investment", "Property Management"],
      location: ["New York", "Los Angeles", "Miami"],
    },
  },
  {
    id: "camp_002",
    name: "First-Time Buyer Education Series",
    description: "Educational content for first-time property buyers",
    type: "Social Media",
    status: "Planning",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-04-30T23:59:59Z",
    budget: 15000,
    spent: 0,
    materials: ["mat_002"],
    socialAccounts: ["social_003"],
    metrics: {
      reach: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      roi: 0,
    },
    targetAudience: {
      demographics: ["Age 25-40", "First-time Buyers", "Young Professionals"],
      interests: ["Home Buying", "Real Estate", "Financial Planning"],
      location: ["Chicago", "Austin", "Seattle"],
    },
  },
];

export default function MarketingMaterials() {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [materials, setMaterials] = React.useState<MarketingMaterial[]>(mockMaterials);
  const [socialAccounts, setSocialAccounts] = React.useState<SocialMediaAccount[]>(mockSocialAccounts);
  const [campaigns, setCampaigns] = React.useState<MarketingCampaign[]>(mockCampaigns);
  const [openMaterialDialog, setOpenMaterialDialog] = React.useState(false);
  const [openSocialDialog, setOpenSocialDialog] = React.useState(false);
  const [openCampaignDialog, setOpenCampaignDialog] = React.useState(false);
  const [selectedMaterial, setSelectedMaterial] = React.useState<MarketingMaterial | null>(null);
  const [selectedSocialAccount, setSelectedSocialAccount] = React.useState<SocialMediaAccount | null>(null);
  const [expandedCredentials, setExpandedCredentials] = React.useState<string[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook": return <FacebookIcon />;
      case "instagram": return <InstagramIcon />;
      case "twitter": return <TwitterIcon />;
      case "linkedin": return <LinkedInIcon />;
      case "youtube": return <YouTubeIcon />;
      case "pinterest": return <PinterestIcon />;
      case "whatsapp": return <WhatsAppIcon />;
      case "telegram": return <TelegramIcon />;
      default: return <ShareRoundedIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": case "verified": return "success";
      case "pending": case "planning": case "review": return "warning";
      case "inactive": case "cancelled": case "archived": return "error";
      case "paused": case "draft": return "default";
      default: return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "image": return <ImageRoundedIcon />;
      case "video": return <VideoFileRoundedIcon />;
      case "document": return <ArticleRoundedIcon />;
      case "website": return <WebRoundedIcon />;
      default: return <CampaignRoundedIcon />;
    }
  };

  const handleToggleCredentials = (accountId: string) => {
    setExpandedCredentials(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSyncSocialAccount = (accountId: string) => {
    setSocialAccounts(prev => prev.map(account =>
      account.id === accountId 
        ? { ...account, lastSync: new Date().toISOString() }
        : account
    ));
    alert("Social media account synced successfully!");
  };

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMaterials = materials.filter(m => m.status === "Active").length;
  const totalViews = materials.reduce((sum, m) => sum + m.usage.views, 0);
  const totalDownloads = materials.reduce((sum, m) => sum + m.usage.downloads, 0);
  const activeSocialAccounts = socialAccounts.filter(s => s.isActive).length;
  const totalFollowers = socialAccounts.reduce((sum, s) => sum + s.followers, 0);
  const avgEngagement = socialAccounts.reduce((sum, s) => sum + s.engagement, 0) / socialAccounts.length;
  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

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
          Marketing Materials & Social Media
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpenMaterialDialog(true)}
          >
            Add Material
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareRoundedIcon />}
            onClick={() => setOpenSocialDialog(true)}
          >
            Add Social Account
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ImageRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Materials
                  </Typography>
                  <Typography variant="h4">{activeMaterials}</Typography>
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
                  <VisibilityRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Views
                  </Typography>
                  <Typography variant="h4">{totalViews.toLocaleString()}</Typography>
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
                  <ShareRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Social Accounts
                  </Typography>
                  <Typography variant="h4">{activeSocialAccounts}</Typography>
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
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Followers
                  </Typography>
                  <Typography variant="h4">{totalFollowers.toLocaleString()}</Typography>
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
            icon={<ImageRoundedIcon />}
            label="Materials Library"
            iconPosition="start"
          />
          <Tab
            icon={<ShareRoundedIcon />}
            label="Social Media Accounts"
            iconPosition="start"
          />
          <Tab
            icon={<CampaignRoundedIcon />}
            label="Marketing Campaigns"
            iconPosition="start"
          />
          <Tab
            icon={<AnalyticsRoundedIcon />}
            label="Analytics & Tracking"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Materials Library Tab */}
      <TabPanel value={selectedTab} index={0}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            placeholder="Search materials by title, tags, or category..."
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

          <Grid container spacing={3}>
            {filteredMaterials.map((material) => (
              <Grid item xs={12} sm={6} md={4} key={material.id}>
                <Card sx={{ height: "100%" }}>
                  {material.thumbnailUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={material.thumbnailUrl}
                      alt={material.title}
                    />
                  )}
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                          {material.title}
                        </Typography>
                        <Chip
                          label={material.status}
                          color={getStatusColor(material.status) as any}
                          size="small"
                        />
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getTypeIcon(material.type)}
                        <Typography variant="body2" color="text.secondary">
                          {material.type} • {material.category}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                        {material.description.substring(0, 80)}...
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                        {material.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                        {material.tags.length > 3 && (
                          <Chip label={`+${material.tags.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Stack>

                      <Divider />

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} sx={{ fontSize: "0.75rem" }}>
                          <Typography variant="caption">
                            👀 {material.usage.views}
                          </Typography>
                          <Typography variant="caption">
                            ⬇️ {material.usage.downloads}
                          </Typography>
                          <Typography variant="caption">
                            📤 {material.usage.shares}
                          </Typography>
                        </Stack>
                        <Rating value={material.performance.rating} precision={0.1} size="small" readOnly />
                      </Stack>

                      {material.socialMediaPosts.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Posted on:
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            {material.socialMediaPosts.map((post) => (
                              <Tooltip 
                                key={post.postId} 
                                title={`${post.platform}: ${post.likes} likes, ${post.comments} comments`}
                                sx={uniformTooltipStyles}
                              >
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  {getSocialIcon(post.platform)}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Download" sx={uniformTooltipStyles}>
                      <IconButton size="small">
                        <DownloadRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" sx={uniformTooltipStyles}>
                      <IconButton size="small" onClick={() => {
                        setSelectedMaterial(material);
                        setOpenMaterialDialog(true);
                      }}>
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share" sx={uniformTooltipStyles}>
                      <IconButton size="small">
                        <ShareRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Analytics" sx={uniformTooltipStyles}>
                      <IconButton size="small">
                        <AnalyticsRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </TabPanel>

      {/* Social Media Accounts Tab */}
      <TabPanel value={selectedTab} index={1}>
        <Grid container spacing={3}>
          {socialAccounts.map((account) => (
            <Grid item xs={12} md={6} lg={4} key={account.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Badge
                          badgeContent={account.verificationStatus === "Verified" ? "✓" : ""}
                          color="primary"
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {getSocialIcon(account.platform)}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="h6">{account.accountName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{account.username}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack alignItems="flex-end">
                        <Chip
                          label={account.isActive ? "Active" : "Inactive"}
                          color={account.isActive ? "success" : "error"}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {account.accountType}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider />

                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="primary.main">
                            {account.followers.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Followers
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="info.main">
                            {account.posts}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Posts
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack alignItems="center">
                          <Typography variant="h6" color="success.main">
                            {account.engagement}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Engagement
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Recent Analytics ({account.analytics.period})
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Reach:</Typography>
                          <Typography variant="caption">{account.analytics.reach.toLocaleString()}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Impressions:</Typography>
                          <Typography variant="caption">{account.analytics.impressions.toLocaleString()}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">Clicks:</Typography>
                          <Typography variant="caption">{account.analytics.clicks.toLocaleString()}</Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={expandedCredentials.includes(account.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => handleToggleCredentials(account.id)}
                        sx={{ mb: 1 }}
                      >
                        API Credentials
                      </Button>
                      <Collapse in={expandedCredentials.includes(account.id)}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              <KeyRoundedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              Access Token: {account.credentials.accessToken.substring(0, 20)}...
                            </Typography>
                            {account.credentials.apiKey && (
                              <Typography variant="caption" color="text.secondary">
                                <SecurityRoundedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                API Key: {account.credentials.apiKey.substring(0, 15)}...
                              </Typography>
                            )}
                            {account.credentials.expiresAt && (
                              <Typography variant="caption" color="text.secondary">
                                Expires: {new Date(account.credentials.expiresAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Stack>
                        </Alert>
                      </Collapse>
                    </Box>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSyncSocialAccount(account.id)}
                        startIcon={<AnalyticsRoundedIcon />}
                      >
                        Sync
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedSocialAccount(account);
                          setOpenSocialDialog(true);
                        }}
                        startIcon={<SettingsRoundedIcon />}
                      >
                        Settings
                      </Button>
                      <Tooltip title="Open Platform" sx={uniformTooltipStyles}>
                        <IconButton size="small">
                          <LaunchRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Last synced: {new Date(account.lastSync).toLocaleString()}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Marketing Campaigns Tab */}
      <TabPanel value={selectedTab} index={2}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Marketing Campaigns</Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setOpenCampaignDialog(true)}
            >
              Create Campaign
            </Button>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <CampaignRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Active Campaigns
                      </Typography>
                      <Typography variant="h4">{activeCampaigns}</Typography>
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
                      <TrendingUpRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Total Budget
                      </Typography>
                      <Typography variant="h4">${totalBudget.toLocaleString()}</Typography>
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
                      <AnalyticsRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Avg. Engagement
                      </Typography>
                      <Typography variant="h4">{avgEngagement.toFixed(1)}%</Typography>
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
                      <ShareRoundedIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Total Downloads
                      </Typography>
                      <Typography variant="h4">{totalDownloads}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Stack>
                        <Typography variant="subtitle2">{campaign.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {campaign.description.substring(0, 50)}...
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={campaign.type} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant="body2">
                          ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(campaign.spent / campaign.budget) * 100}
                          sx={{ width: 100, height: 4 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          Reach: {campaign.metrics.reach.toLocaleString()}
                        </Typography>
                        <Typography variant="caption">
                          Clicks: {campaign.metrics.clicks.toLocaleString()}
                        </Typography>
                        <Typography variant="caption">
                          ROI: {campaign.metrics.roi}x
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Campaign" sx={uniformTooltipStyles}>
                          <IconButton size="small">
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Analytics" sx={uniformTooltipStyles}>
                          <IconButton size="small">
                            <AnalyticsRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </TabPanel>

      {/* Analytics & Tracking Tab */}
      <TabPanel value={selectedTab} index={3}>
        <Stack spacing={3}>
          <Typography variant="h6">Analytics & Performance Tracking</Typography>
          
          <Alert severity="info">
            Comprehensive analytics and tracking for all marketing materials and social media campaigns will be displayed here. Integration with Google Analytics, Facebook Insights, and other analytics platforms provides detailed performance metrics.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Top Performing Materials
                  </Typography>
                  <List>
                    {materials
                      .sort((a, b) => b.usage.views - a.usage.views)
                      .slice(0, 5)
                      .map((material) => (
                        <ListItem key={material.id}>
                          <ListItemIcon>
                            {getTypeIcon(material.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={material.title}
                            secondary={`${material.usage.views} views • ${material.usage.downloads} downloads`}
                          />
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Social Media Performance
                  </Typography>
                  <List>
                    {socialAccounts
                      .sort((a, b) => b.engagement - a.engagement)
                      .map((account) => (
                        <ListItem key={account.id}>
                          <ListItemIcon>
                            {getSocialIcon(account.platform)}
                          </ListItemIcon>
                          <ListItemText
                            primary={account.accountName}
                            secondary={`${account.followers.toLocaleString()} followers • ${account.engagement}% engagement`}
                          />
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </TabPanel>

      {/* Material Dialog - Placeholder */}
      <Dialog open={openMaterialDialog} onClose={() => setOpenMaterialDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMaterial ? "Edit Material" : "Add New Material"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            Material upload and editing functionality will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMaterialDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Social Dialog - Placeholder */}
      <Dialog open={openSocialDialog} onClose={() => setOpenSocialDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSocialAccount ? "Edit Social Account" : "Add Social Media Account"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            Social media account configuration and API credentials setup will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSocialDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Dialog - Placeholder */}
      <Dialog open={openCampaignDialog} onClose={() => setOpenCampaignDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create Marketing Campaign</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            Campaign creation with material selection, social media account integration, and target audience configuration will be implemented here.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCampaignDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Campaign</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
