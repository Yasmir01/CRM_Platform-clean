import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Avatar,
  IconButton,
  Fade,
  useTheme,
  alpha,
  CardActionArea,
  Divider,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import IntegrationInstructionsRoundedIcon from "@mui/icons-material/IntegrationInstructionsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import { useRoleManagement } from "../hooks/useRoleManagement";

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  articleCount: number;
  popularTags: string[];
  featured?: boolean;
}

interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  helpful: number;
  lastUpdated: string;
  planRequired?: "Basic" | "Professional" | "Enterprise" | "Custom";
  superAdminOnly?: boolean;
}

const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Essential guides to help you set up and begin using your CRM",
    icon: <HelpRoundedIcon />,
    color: "#1976d2",
    articleCount: 8,
    popularTags: ["setup", "onboarding", "basics", "first-time"],
    featured: true,
  },
  {
    id: "properties",
    title: "Property Management",
    description: "Managing properties, listings, and property-related features",
    icon: <HomeRoundedIcon />,
    color: "#2e7d32",
    articleCount: 12,
    popularTags: ["properties", "listings", "management", "rental"],
  },
  {
    id: "tenants",
    title: "Tenant Management",
    description: "Managing tenants, leases, communications, and relationships",
    icon: <PersonRoundedIcon />,
    color: "#ed6c02",
    articleCount: 15,
    popularTags: ["tenants", "leases", "communication", "applications"],
  },
  {
    id: "payments",
    title: "Payments & Financial",
    description: "Payment processing, financial management, and rent collection",
    icon: <PaymentRoundedIcon />,
    color: "#9c27b0",
    articleCount: 10,
    popularTags: ["payments", "financial", "rent", "billing"],
  },
  {
    id: "maintenance",
    title: "Maintenance & Work Orders",
    description: "Managing maintenance requests, work orders, and service providers",
    icon: <BuildRoundedIcon />,
    color: "#d32f2f",
    articleCount: 8,
    popularTags: ["maintenance", "work-orders", "repairs", "contractors"],
  },
  {
    id: "integrations",
    title: "Integrations & Email",
    description: "Setting up email, API integrations, and external services",
    icon: <IntegrationInstructionsRoundedIcon />,
    color: "#0288d1",
    articleCount: 18,
    popularTags: ["email", "integration", "api", "oauth", "setup"],
    featured: true,
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    description: "Generating reports, analytics, and business insights",
    icon: <AssessmentRoundedIcon />,
    color: "#f57c00",
    articleCount: 6,
    popularTags: ["reports", "analytics", "insights", "data"],
  },
  {
    id: "security",
    title: "Security & Admin",
    description: "User roles, permissions, security settings, and advanced features",
    icon: <SecurityRoundedIcon />,
    color: "#7b1fa2",
    articleCount: 9,
    popularTags: ["security", "admin", "permissions", "roles"],
  },
];

const sampleArticles: HelpArticle[] = [
  {
    id: "email-setup-overview",
    title: "Email Integration Setup Overview",
    summary: "Complete guide to setting up email integration for automated emails and password resets",
    content: [
      "Email integration enables automated password resets and professional email communication",
      "Supported providers include Gmail, Outlook, Yahoo, Hotmail, and custom SMTP servers",
      "OAuth authentication provides enhanced security for Gmail and Outlook",
      "App passwords are required for Yahoo Mail integration",
      "Configure your provider in Integrations → Add Integration → Email Provider",
      "Test your connection in Email Management after setup",
      "All email activity is tracked for monitoring and compliance"
    ],
    category: "integrations",
    tags: ["email", "integration", "setup", "oauth", "automation"],
    difficulty: "Beginner",
    readTime: "5 min",
    helpful: 98,
    lastUpdated: "2024-01-15",
    planRequired: "Basic"
  },
  {
    id: "tenant-application-process",
    title: "Managing Tenant Applications",
    summary: "Step-by-step guide to processing and managing rental applications",
    content: [
      "Applications can be received through property landing pages and direct submissions",
      "Review applications in the Applications section with filtering and sorting options",
      "Verify applicant information including employment, references, and credit history",
      "Use built-in scoring and evaluation tools to compare applicants",
      "Approve applications and automatically convert prospects to tenants",
      "Send automated notification emails for application status updates",
      "Track all application communication in the activity timeline"
    ],
    category: "tenants",
    tags: ["applications", "tenants", "screening", "approval", "process"],
    difficulty: "Intermediate",
    readTime: "7 min",
    helpful: 94,
    lastUpdated: "2024-01-12"
  },
  {
    id: "property-financial-tracking",
    title: "Property Financial Management",
    summary: "Comprehensive guide to tracking property finances and generating reports",
    content: [
      "Track all property income including rent, fees, and additional charges",
      "Record expenses such as maintenance, repairs, and property management costs",
      "Generate financial reports for individual properties or portfolios",
      "Monitor rent collection rates and identify delinquent accounts",
      "Set up automated late fees and payment reminders",
      "Export financial data for accounting software integration",
      "Use analytics to identify profitable properties and improvement opportunities"
    ],
    category: "payments",
    tags: ["financial", "tracking", "reports", "income", "expenses"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 91,
    lastUpdated: "2024-01-10",
    planRequired: "Professional"
  },
  {
    id: "super-admin-features",
    title: "Super Admin Advanced Features",
    summary: "Exclusive features and capabilities available to Super Administrator users",
    content: [
      "Access to all system settings and global configurations",
      "Manage user roles and permissions across the entire platform",
      "View and manage TransUnion integration for credit reports and background checks",
      "Configure advanced security settings and access controls",
      "Set up white-label branding and custom domain configuration",
      "Access detailed system analytics and user activity logs",
      "Manage backup and restore operations for data protection",
      "Configure enterprise integrations and API access"
    ],
    category: "security",
    tags: ["super-admin", "advanced", "permissions", "security", "enterprise"],
    difficulty: "Advanced",
    readTime: "12 min",
    helpful: 89,
    lastUpdated: "2024-01-08",
    planRequired: "Enterprise",
    superAdminOnly: true
  }
];

const quickActions = [
  { label: "Getting Started", tag: "setup", color: "primary" },
  { label: "Email Setup", tag: "email", color: "info" },
  { label: "Property Management", tag: "properties", color: "success" },
  { label: "Tenant Applications", tag: "applications", color: "warning" },
  { label: "Payment Processing", tag: "payments", color: "secondary" },
  { label: "Work Orders", tag: "work-orders", color: "error" },
];

export default function HelpSupportModern() {
  const theme = useTheme();
  const { isSuperAdmin } = useRoleManagement();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>("");
  const [selectedArticle, setSelectedArticle] = React.useState<HelpArticle | null>(null);
  const [filterOpen, setFilterOpen] = React.useState(false);

  // Check if user is super admin
  const isUserSuperAdmin = React.useMemo(() => isSuperAdmin(), []);

  // Filter articles based on search and filters
  const filteredArticles = React.useMemo(() => {
    return sampleArticles.filter(article => {
      // Filter out super admin only articles for non-super admins
      if (article.superAdminOnly && !isUserSuperAdmin) {
        return false;
      }

      // Search filter
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = !selectedCategory || article.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty = !selectedDifficulty || article.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, isUserSuperAdmin]);

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return helpCategories;
    
    return helpCategories.filter(category => 
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.popularTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const handleQuickAction = (tag: string) => {
    setSearchTerm(tag);
    setSelectedCategory("");
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = helpCategories.find(c => c.id === categoryId);
    return category?.icon || <HelpRoundedIcon />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "success";
      case "Intermediate": return "warning";
      case "Advanced": return "error";
      default: return "default";
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Help & Support Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find answers, guides, and get the help you need to make the most of your CRM
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SupportAgentRoundedIcon />}
          size="large"
        >
          Contact Support
        </Button>
      </Stack>

      {/* Search Section */}
      <Card sx={{ mb: 4, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
        <CardContent sx={{ py: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography variant="h5" textAlign="center" sx={{ fontWeight: 500 }}>
              What can we help you with?
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Search help articles, guides, and documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              sx={{ 
                maxWidth: 600,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">
                      {filteredArticles.length} results
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

            {/* Quick Actions */}
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" gap={1}>
              {quickActions.map((action) => (
                <Chip
                  key={action.tag}
                  label={action.label}
                  onClick={() => handleQuickAction(action.tag)}
                  color={action.color as any}
                  variant={searchTerm === action.tag ? "filled" : "outlined"}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Filters */}
      {(searchTerm || selectedCategory || selectedDifficulty) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Filters:
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {helpCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={selectedDifficulty}
                  label="Difficulty"
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedDifficulty("");
                }}
              >
                Clear All
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                {filteredArticles.length} articles found
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Featured Categories or Search Results */}
      {!searchTerm ? (
        <>
          {/* Help Categories Grid */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Browse Help Topics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredCategories.map((category) => (
              <Grid item xs={12} sm={6} lg={4} key={category.id}>
                <Fade in timeout={300}>
                  <Card 
                    sx={{ 
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      border: category.featured ? `2px solid ${alpha(category.color, 0.3)}` : "1px solid",
                      borderColor: category.featured ? alpha(category.color, 0.3) : "divider",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[8],
                        borderColor: category.color,
                      }
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardActionArea sx={{ height: "100%" }}>
                      <CardContent sx={{ p: 3, height: "100%" }}>
                        <Stack spacing={2} height="100%">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar 
                              sx={{ 
                                bgcolor: category.color,
                                width: 48,
                                height: 48
                              }}
                            >
                              {category.icon}
                            </Avatar>
                            {category.featured && (
                              <Chip 
                                label="Popular" 
                                size="small" 
                                color="primary" 
                                variant="filled"
                              />
                            )}
                          </Stack>
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {category.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {category.description}
                            </Typography>
                          </Box>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Badge 
                              badgeContent={category.articleCount} 
                              color="primary"
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontSize: '0.75rem',
                                  minWidth: '20px',
                                  height: '20px'
                                }
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                Articles
                              </Typography>
                            </Badge>
                          </Stack>
                          
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {category.popularTags.slice(0, 3).map((tag) => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 24,
                                  borderColor: alpha(category.color, 0.5),
                                  color: category.color
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Quick Support Options */}
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Need More Help?
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent sx={{ py: 4 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                    <VideoLibraryRoundedIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>Video Tutorials</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Watch step-by-step video guides
                  </Typography>
                  <Button variant="outlined" size="small">Browse Videos</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent sx={{ py: 4 }}>
                  <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                    <ChatRoundedIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>Live Chat</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get instant help from our team
                  </Typography>
                  <Button variant="outlined" size="small">Start Chat</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent sx={{ py: 4 }}>
                  <Avatar sx={{ bgcolor: "warning.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                    <EmailRoundedIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>Email Support</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Submit detailed questions
                  </Typography>
                  <Button variant="outlined" size="small">Send Email</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent sx={{ py: 4 }}>
                  <Avatar sx={{ bgcolor: "error.main", width: 56, height: 56, mx: "auto", mb: 2 }}>
                    <PhoneRoundedIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1 }}>Phone Support</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Speak with our experts
                  </Typography>
                  <Button variant="outlined" size="small">Call Now</Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        /* Search Results */
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Search Results
          </Typography>
          {filteredArticles.length === 0 ? (
            <Card sx={{ textAlign: "center", py: 6 }}>
              <CardContent>
                <SearchRoundedIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No articles found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search terms or browse our help categories above
                </Typography>
                <Button variant="outlined" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredArticles.map((article) => (
                <Grid item xs={12} md={6} key={article.id}>
                  <Card 
                    sx={{ 
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                      }
                    }}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardActionArea sx={{ height: "100%" }}>
                      <CardContent sx={{ height: "100%" }}>
                        <Stack spacing={2} height="100%">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {getCategoryIcon(article.category)}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {article.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {article.summary}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                            <Chip 
                              label={article.difficulty} 
                              size="small" 
                              color={getDifficultyColor(article.difficulty) as any}
                            />
                            <Chip 
                              label={article.readTime} 
                              size="small" 
                              variant="outlined"
                            />
                            {article.planRequired && (
                              <Chip 
                                label={`${article.planRequired}+ Plan`} 
                                size="small" 
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                            {article.superAdminOnly && (
                              <Chip 
                                label="Super Admin" 
                                size="small" 
                                color="error"
                                variant="filled"
                              />
                            )}
                          </Stack>
                          
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                            {article.tags.slice(0, 4).map((tag) => (
                              <Chip 
                                key={tag} 
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22 }}
                              />
                            ))}
                          </Stack>
                          
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto" }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                👍 {article.helpful} helpful
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Updated {article.lastUpdated}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Article Detail Dialog */}
      <Dialog 
        open={selectedArticle !== null} 
        onClose={() => setSelectedArticle(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                {getCategoryIcon(selectedArticle.category)}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{selectedArticle.title}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={selectedArticle.difficulty} 
                      size="small" 
                      color={getDifficultyColor(selectedArticle.difficulty) as any}
                    />
                    <Chip label={selectedArticle.readTime} size="small" variant="outlined" />
                  </Stack>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                  {selectedArticle.summary}
                </Typography>
                
                <Divider />
                
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Steps to Follow:</Typography>
                  <Stack spacing={1.5}>
                    {selectedArticle.content.map((step, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: "primary.main",
                            fontSize: "0.8rem"
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Typography variant="body1">{step}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
                
                <Divider />
                
                <Stack spacing={2}>
                  <Typography variant="subtitle2">Tags:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                    {selectedArticle.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedArticle(null)}>Close</Button>
              <Button variant="outlined" startIcon={<BookmarkRoundedIcon />}>
                Bookmark
              </Button>
              <Button variant="contained" startIcon={<CheckCircleRoundedIcon />}>
                Mark as Helpful
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
