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
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import DesignServicesRoundedIcon from "@mui/icons-material/DesignServicesRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { quickCopy } from "../utils/clipboardUtils";
import RichTextEditor from "../components/RichTextEditor";
import TourScheduling from "../components/TourScheduling";

interface PropertyLanding {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  landingUrl: string;
  status: "Draft" | "Published" | "Archived";
  theme: "Modern" | "Classic" | "Luxury" | "Minimal";
  createdDate: string;
  lastModified: string;
  views: number;
  inquiries: number;
  applications: number;
  featured: boolean;
  customDomain?: string;
  seoEnabled: boolean;
}

interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  theme: string;
  thumbnail: string;
  features: string[];
}

const mockLandingPages: PropertyLanding[] = [
  {
    id: "1",
    propertyId: "PROP-001",
    propertyName: "Sunset Apartments",
    propertyAddress: "123 Sunset Blvd, Los Angeles, CA",
    landingUrl: "sunset-apartments-123",
    status: "Published",
    theme: "Modern",
    createdDate: "2024-01-10",
    lastModified: "2024-01-15",
    views: 248,
    inquiries: 15,
    applications: 8,
    featured: true,
    customDomain: "sunsetapts.com",
    seoEnabled: true
  },
  {
    id: "2",
    propertyId: "PROP-002",
    propertyName: "Downtown Lofts",
    propertyAddress: "456 Main St, New York, NY",
    landingUrl: "downtown-lofts-456",
    status: "Published",
    theme: "Luxury",
    createdDate: "2024-01-08",
    lastModified: "2024-01-12",
    views: 189,
    inquiries: 22,
    applications: 12,
    featured: false,
    seoEnabled: true
  },
  {
    id: "3",
    propertyId: "PROP-003",
    propertyName: "Garden View Condos",
    propertyAddress: "789 Garden Ave, Chicago, IL",
    landingUrl: "garden-view-condos-789",
    status: "Draft",
    theme: "Classic",
    createdDate: "2024-01-16",
    lastModified: "2024-01-16",
    views: 0,
    inquiries: 0,
    applications: 0,
    featured: false,
    seoEnabled: false
  }
];

// Mock properties for dropdown selection
const mockProperties = [
  {
    id: "1",
    name: "Sunset Apartments",
    address: "123 Sunset Blvd, Los Angeles, CA",
    monthlyRent: 2500,
    bedrooms: 2,
    bathrooms: 1.5,
    squareFootage: 850,
    amenities: ["Pool", "Gym", "Parking", "Laundry"],
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
    description: "Beautiful apartment complex with modern amenities and stunning city views.",
    petPolicy: "Cats allowed with deposit",
    parkingSpaces: 1
  },
  {
    id: "2",
    name: "Ocean View Villa",
    address: "456 Beach Blvd, Santa Monica, CA",
    monthlyRent: 4500,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 2200,
    amenities: ["Private Beach", "Garage", "Garden", "Ocean View"],
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"],
    description: "Luxurious villa with breathtaking ocean views and private beach access.",
    petPolicy: "Pets allowed with deposit",
    parkingSpaces: 2
  },
  {
    id: "3",
    name: "Downtown Lofts",
    address: "789 City Center, LA, CA",
    monthlyRent: 3200,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 1200,
    amenities: ["Rooftop Deck", "Concierge", "Gym", "Storage"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
    description: "Modern loft-style condos in the heart of downtown.",
    petPolicy: "No pets",
    parkingSpaces: 1
  }
];

const mockTemplates: LandingPageTemplate[] = [
  {
    id: "1",
    name: "Modern Minimalist",
    description: "Clean, modern design with focus on property photos",
    theme: "Modern",
    thumbnail: "🏢",
    features: ["Photo Gallery", "Virtual Tour", "Floor Plans", "Amenities List", "Contact Form"]
  },
  {
    id: "2",
    name: "Luxury Showcase",
    description: "Premium design for high-end properties",
    theme: "Luxury",
    thumbnail: "🏛️",
    features: ["Hero Video", "3D Tour", "Concierge Info", "Premium Gallery", "VIP Contact"]
  },
  {
    id: "3",
    name: "Classic Elegance",
    description: "Traditional design with warm, welcoming feel",
    theme: "Classic",
    thumbnail: "🏘️",
    features: ["Property Story", "Neighborhood Guide", "Testimonials", "Photo Carousel", "Apply Now"]
  },
  {
    id: "4",
    name: "Simple & Clean",
    description: "Minimal design focusing on essential information",
    theme: "Minimal",
    thumbnail: "🏠",
    features: ["Key Details", "Photo Grid", "Location Map", "Quick Contact", "Basic Form"]
  }
];

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
      id={`landing-tabpanel-${index}`}
      aria-labelledby={`landing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PropertyLandingPages() {
  const [landingPages, setLandingPages] = React.useState<PropertyLanding[]>(mockLandingPages);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<LandingPageTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<LandingPageTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const [tourSchedulingOpen, setTourSchedulingOpen] = React.useState(false);
  const [customizeOptions, setCustomizeOptions] = React.useState({
    title: '',
    description: '',
    features: [] as string[],
    images: [] as string[],
    contactForm: false,
    virtualTour: false,
    videoWalkthrough: false,
    floorPlans: false,
    neighborhoodInfo: false,
    financingInfo: false,
    availabilityCalendar: false,
    reviewsTestimonials: false
  });
  const [newPageForm, setNewPageForm] = React.useState({
    propertyId: "",
    propertyName: "",
    template: "",
    customUrl: "",
    theme: "Modern" as PropertyLanding["theme"],
    seoEnabled: true,
    featured: false
  });

  const filteredPages = landingPages.filter(page => {
    const matchesSearch = 
      page.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.landingUrl.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || page.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PropertyLanding["status"]) => {
    switch (status) {
      case "Published": return "success";
      case "Draft": return "warning";
      case "Archived": return "default";
      default: return "default";
    }
  };

  const getThemeColor = (theme: PropertyLanding["theme"]) => {
    switch (theme) {
      case "Modern": return "primary";
      case "Luxury": return "secondary";
      case "Classic": return "info";
      case "Minimal": return "default";
      default: return "default";
    }
  };

  const handleCreatePage = () => {
    const newPage: PropertyLanding = {
      id: Date.now().toString(),
      propertyId: newPageForm.propertyId,
      propertyName: newPageForm.propertyName,
      propertyAddress: "Address TBD",
      landingUrl: newPageForm.customUrl || newPageForm.propertyName.toLowerCase().replace(/\s+/g, '-'),
      status: "Draft",
      theme: newPageForm.theme,
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      views: 0,
      inquiries: 0,
      applications: 0,
      featured: newPageForm.featured,
      seoEnabled: newPageForm.seoEnabled
    };
    
    setLandingPages(prev => [...prev, newPage]);
    setCreateDialogOpen(false);
    setNewPageForm({
      propertyId: "",
      propertyName: "",
      template: "",
      customUrl: "",
      theme: "Modern",
      seoEnabled: true,
      featured: false
    });
    alert(`Landing page created: ${newPage.propertyName}`);
  };

  const handlePublishPage = (pageId: string) => {
    setLandingPages(prev => 
      prev.map(page => 
        page.id === pageId 
          ? { ...page, status: "Published" as const, lastModified: new Date().toISOString().split('T')[0] }
          : page
      )
    );
    alert("Landing page published successfully!");
  };

  const handleArchivePage = (pageId: string) => {
    setLandingPages(prev => 
      prev.map(page => 
        page.id === pageId 
          ? { ...page, status: "Archived" as const, lastModified: new Date().toISOString().split('T')[0] }
          : page
      )
    );
  };

  const handleCopyUrl = (url: string) => {
    quickCopy(`https://properties.yoursite.com/${url}`, "Landing page URL copied to clipboard!");
  };

  const handleEditPage = (pageId: string) => {
    const pageToEdit = landingPages.find(page => page.id === pageId);
    if (pageToEdit) {
      // Find the template and property objects
      const template = mockTemplates.find(t => t.theme === pageToEdit.theme);
      const property = mockProperties.find(p => p.id === pageToEdit.propertyId);

      // Set the page data for editing
      setSelectedTemplate(template || null);
      setSelectedProperty(property || null);
      setCustomizeOptions({
        title: pageToEdit.customTitle || '',
        description: pageToEdit.customDescription || '',
        features: pageToEdit.customFeatures || [],
        images: pageToEdit.customImages || [],
        contactForm: pageToEdit.hasContactForm || false,
        virtualTour: pageToEdit.hasVirtualTour || false,
        videoWalkthrough: pageToEdit.hasVideoWalkthrough || false,
        floorPlans: pageToEdit.hasFloorPlans || false,
        neighborhoodInfo: pageToEdit.hasNeighborhoodInfo || false,
        financingInfo: pageToEdit.hasFinancingInfo || false,
        availabilityCalendar: pageToEdit.hasAvailabilityCalendar || false,
        reviewsTestimonials: pageToEdit.hasReviewsTestimonials || false
      });
      // Open the template editor for editing
      setTemplateEditorOpen(true);
    }
  };

  const totalPages = landingPages.length;
  const publishedPages = landingPages.filter(p => p.status === "Published").length;
  const totalViews = landingPages.reduce((sum, p) => sum + p.views, 0);
  const totalInquiries = landingPages.reduce((sum, p) => sum + p.inquiries, 0);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Property Landing Pages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Landing Page
        </Button>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<HomeRoundedIcon />}
            label="All Pages"
            iconPosition="start"
          />
          <Tab
            icon={<DesignServicesRoundedIcon />}
            label="Templates"
            iconPosition="start"
          />
          <Tab
            icon={<AnalyticsRoundedIcon />}
            label="Analytics"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* All Pages Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <PublicRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Total Pages
                    </Typography>
                    <Typography variant="h4">{totalPages}</Typography>
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
                      Published
                    </Typography>
                    <Typography variant="h4">{publishedPages}</Typography>
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
                    <Typography variant="h4">{totalViews}</Typography>
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
                    <EmailRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Inquiries
                    </Typography>
                    <Typography variant="h4">{totalInquiries}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search landing pages..."
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
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Landing Pages Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Landing URL</TableCell>
                <TableCell>Theme</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell>Last Modified</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight="medium">
                        🏠 {page.propertyName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {page.propertyAddress}
                      </Typography>
                      {page.featured && (
                        <Chip label="Featured" size="small" color="warning" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={1}>
                      <Typography variant="body2" fontFamily="monospace">
                        /{page.landingUrl}
                      </Typography>
                      {page.customDomain && (
                        <Typography variant="caption" color="primary">
                          {page.customDomain}
                        </Typography>
                      )}
                      <Tooltip title="Copy Landing Page URL">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyUrl(page.landingUrl)}
                        >
                          <ContentCopyRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={page.theme}
                      color={getThemeColor(page.theme)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={page.status}
                      color={getStatusColor(page.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        👁️ {page.views} views
                      </Typography>
                      <Typography variant="body2">
                        📧 {page.inquiries} inquiries
                      </Typography>
                      <Typography variant="body2">
                        📋 {page.applications} applications
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(page.lastModified).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {page.status === "Published" && (
                        <Tooltip title="View Published Page">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`https://properties.yoursite.com/${page.landingUrl}`, '_blank')}
                          >
                            <LaunchRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit Landing Page">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPage(page.id)}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      {page.status === "Draft" && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handlePublishPage(page.id)}
                        >
                          Publish
                        </Button>
                      )}
                      {page.status === "Published" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleArchivePage(page.id)}
                        >
                          Archive
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Templates Tab */}
      <TabPanel value={currentTab} index={1}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Landing Page Templates
        </Typography>
        <Grid container spacing={3}>
          {mockTemplates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        height: 120,
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        fontSize: 48
                      }}
                    >
                      {template.thumbnail}
                    </Box>
                    <Typography variant="h6" fontWeight="medium">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Chip
                      label={template.theme}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <List dense>
                      {template.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircleRoundedIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ variant: "body2" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon />}
                        onClick={() => {
                          setPreviewTemplate(template);
                          setPreviewDialogOpen(true);
                        }}
                        sx={{ flex: 1 }}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setTemplateEditorOpen(true);
                        }}
                        sx={{ flex: 1 }}
                      >
                        Use Template
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={currentTab} index={2}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Landing Page Analytics
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Performing Pages
                </Typography>
                <Stack spacing={2}>
                  {landingPages
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5)
                    .map((page) => (
                      <Paper key={page.id} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2">
                              {page.propertyName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {page.views} views • {page.inquiries} inquiries
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {((page.inquiries / Math.max(page.views, 1)) * 100).toFixed(1)}%
                          </Typography>
                        </Stack>
                      </Paper>
                    ))
                  }
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Conversion Rates by Theme
                </Typography>
                <Stack spacing={2}>
                  {["Modern", "Luxury", "Classic", "Minimal"].map((theme) => {
                    const themePages = landingPages.filter(p => p.theme === theme);
                    const totalViews = themePages.reduce((sum, p) => sum + p.views, 0);
                    const totalInquiries = themePages.reduce((sum, p) => sum + p.inquiries, 0);
                    const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
                    
                    return (
                      <Paper key={theme} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2">{theme}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {themePages.length} pages • {totalViews} views
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {conversionRate.toFixed(1)}%
                          </Typography>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Create Landing Page Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Create New Landing Page
          {selectedTemplate && (
            <Typography variant="body2" color="text.secondary">
              Using template: {selectedTemplate.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Property Name"
              fullWidth
              value={newPageForm.propertyName}
              onChange={(e) => setNewPageForm({ ...newPageForm, propertyName: e.target.value })}
            />
            
            <TextField
              label="Property ID (Optional)"
              fullWidth
              value={newPageForm.propertyId}
              onChange={(e) => setNewPageForm({ ...newPageForm, propertyId: e.target.value })}
              placeholder="Link to existing property"
            />
            
            <TextField
              label="Custom URL Slug"
              fullWidth
              value={newPageForm.customUrl}
              onChange={(e) => setNewPageForm({ ...newPageForm, customUrl: e.target.value })}
              placeholder="custom-property-name"
              helperText="Leave blank to auto-generate from property name"
            />
            
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={newPageForm.theme}
                label="Theme"
                onChange={(e) => setNewPageForm({ ...newPageForm, theme: e.target.value as PropertyLanding["theme"] })}
              >
                <MenuItem value="Modern">Modern</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
                <MenuItem value="Classic">Classic</MenuItem>
                <MenuItem value="Minimal">Minimal</MenuItem>
              </Select>
            </FormControl>
            
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newPageForm.seoEnabled}
                    onChange={(e) => setNewPageForm({ ...newPageForm, seoEnabled: e.target.checked })}
                  />
                }
                label="Enable SEO optimization"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newPageForm.featured}
                    onChange={(e) => setNewPageForm({ ...newPageForm, featured: e.target.checked })}
                  />
                }
                label="Mark as featured property"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setSelectedTemplate(null);
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreatePage}>
            Create Landing Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              Template Preview: {previewTemplate?.name}
            </Typography>
            <Chip
              label={previewTemplate?.theme}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          {previewTemplate && (
            <Stack spacing={3}>
              {/* Template Preview Mockup */}
              <Paper
                sx={{
                  p: 3,
                  minHeight: "500px",
                  bgcolor: previewTemplate.theme === "Luxury" ? "grey.900" :
                          previewTemplate.theme === "Classic" ? "warning.light" :
                          previewTemplate.theme === "Minimal" ? "grey.50" : "primary.light",
                  color: previewTemplate.theme === "Luxury" || previewTemplate.theme === "Minimal" ? "text.primary" : "white",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Mockup Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h2" component="div" sx={{
                    fontWeight: "bold",
                    fontSize: previewTemplate.theme === "Luxury" ? "3rem" : "2.5rem",
                    color: previewTemplate.theme === "Luxury" ? "gold" : "inherit"
                  }}>
                    {previewTemplate.thumbnail} Sample Property
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 2, opacity: 0.9 }}>
                    123 Beautiful Street, Dream City
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Starting at $2,500/month
                  </Typography>
                </Box>

                {/* Feature Preview Grid */}
                <Grid container spacing={3}>
                  {previewTemplate.features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={feature}>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          textAlign: "center"
                        }}
                      >
                        <Box sx={{ fontSize: "2rem", mb: 1 }}>
                          {index === 0 && "📸"}
                          {index === 1 && "🏠"}
                          {index === 2 && "📋"}
                          {index === 3 && "✨"}
                          {index === 4 && "📞"}
                        </Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {feature}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Sample Content Area */}
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    This is a preview of how your landing page will look with the {previewTemplate.name} template.
                    The actual page will include your property photos, details, and contact information.
                  </Typography>
                </Box>

                {/* Mock CTA Button */}
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: previewTemplate.theme === "Luxury" ? "gold" : "white",
                      color: previewTemplate.theme === "Luxury" ? "black" : "primary.main",
                      "&:hover": {
                        bgcolor: previewTemplate.theme === "Luxury" ? "gold" : "grey.100"
                      }
                    }}
                  >
                    Schedule a Tour
                  </Button>
                </Box>
              </Paper>

              {/* Template Details */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Template Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {previewTemplate.description}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Included Features:
                  </Typography>
                  <List dense>
                    {previewTemplate.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <CheckCircleRoundedIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Close Preview
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (previewTemplate) {
                setSelectedTemplate(previewTemplate);
                setNewPageForm(prev => ({ ...prev, template: previewTemplate.id, theme: previewTemplate.theme as PropertyLanding["theme"] }));
                setPreviewDialogOpen(false);
                setCreateDialogOpen(true);
              }
            }}
          >
            Use This Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={templateEditorOpen} onClose={() => setTemplateEditorOpen(false)} maxWidth="lg" fullWidth fullScreen>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              Edit Landing Page Template: {selectedTemplate?.name}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                // Save the landing page
                const newPage: PropertyLanding = {
                  id: Date.now().toString(),
                  propertyId: selectedProperty?.id || "",
                  propertyName: selectedProperty?.name || "",
                  propertyAddress: selectedProperty?.address || "",
                  landingUrl: selectedProperty?.name?.toLowerCase().replace(/\s+/g, '-') || "",
                  status: "Draft",
                  theme: selectedTemplate?.theme as PropertyLanding["theme"] || "Modern",
                  createdDate: new Date().toISOString().split('T')[0],
                  lastModified: new Date().toISOString().split('T')[0],
                  views: 0,
                  inquiries: 0,
                  applications: 0,
                  featured: false,
                  seoEnabled: true
                };
                setLandingPages(prev => [...prev, newPage]);
                setTemplateEditorOpen(false);
                alert("Landing page created successfully!");
              }}
              disabled={!selectedProperty}
            >
              Save Landing Page
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Grid container spacing={3} sx={{ height: "80vh" }}>
              {/* Left Panel - Property Selection and Settings */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: "100%", overflow: "auto" }}>
                  <Typography variant="h6" gutterBottom>
                    Property Selection
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Property</InputLabel>
                    <Select
                      value={selectedProperty?.id || ""}
                      label="Select Property"
                      onChange={(e) => {
                        const property = mockProperties.find(p => p.id === e.target.value);
                        setSelectedProperty(property);
                      }}
                    >
                      {mockProperties.map((property) => (
                        <MenuItem key={property.id} value={property.id}>
                          {property.name} - ${property.monthlyRent.toLocaleString()}/month
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedProperty && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Property Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Name:</strong> {selectedProperty.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Address:</strong> {selectedProperty.address}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Rent:</strong> ${selectedProperty.monthlyRent.toLocaleString()}/month
                        </Typography>
                        <Typography variant="body2">
                          <strong>Details:</strong> {selectedProperty.bedrooms} bed, {selectedProperty.bathrooms} bath, {selectedProperty.squareFootage} sq ft
                        </Typography>
                        <Typography variant="body2">
                          <strong>Amenities:</strong> {selectedProperty.amenities.join(", ")}
                        </Typography>
                      </Stack>
                    </Paper>
                  )}

                  <Typography variant="h6" gutterBottom>
                    Template Features
                  </Typography>
                  <List dense>
                    {selectedTemplate.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleRoundedIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Right Panel - Template Preview */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
                  <Typography variant="h6" gutterBottom>
                    Landing Page Preview
                  </Typography>

                  {selectedProperty ? (
                    <Stack spacing={3}>
                      {/* Hero Section Preview */}
                      <Paper
                        sx={{
                          p: 4,
                          minHeight: "400px",
                          bgcolor: selectedTemplate.theme === "Luxury" ? "grey.900" :
                                  selectedTemplate.theme === "Classic" ? "warning.light" :
                                  selectedTemplate.theme === "Minimal" ? "grey.50" : "primary.light",
                          color: selectedTemplate.theme === "Luxury" || selectedTemplate.theme === "Minimal" ? "text.primary" : "white",
                          position: "relative",
                          backgroundImage: selectedProperty.images[0] ? `url(${selectedProperty.images[0]})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundBlendMode: 'overlay'
                        }}
                      >
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          borderRadius: 'inherit'
                        }} />

                        <Box sx={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center' }}>
                          <Typography variant="h2" component="div" sx={{
                            fontWeight: "bold",
                            fontSize: selectedTemplate.theme === "Luxury" ? "3rem" : "2.5rem",
                            mb: 2
                          }}>
                            {selectedProperty.name}
                          </Typography>
                          <Typography variant="h5" sx={{ mb: 2 }}>
                            {selectedProperty.address}
                          </Typography>
                          <Typography variant="h4" sx={{ mb: 3 }}>
                            ${selectedProperty.monthlyRent.toLocaleString()}/month
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 3 }}>
                            {selectedProperty.bedrooms} Bed • {selectedProperty.bathrooms} Bath • {selectedProperty.squareFootage} sq ft
                          </Typography>

                          {/* CTA Buttons */}
                          <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                              variant="contained"
                              size="large"
                              onClick={() => setTourSchedulingOpen(true)}
                              sx={{
                                bgcolor: selectedTemplate.theme === "Luxury" ? "gold" : "white",
                                color: selectedTemplate.theme === "Luxury" ? "black" : "primary.main",
                                "&:hover": {
                                  bgcolor: selectedTemplate.theme === "Luxury" ? "gold" : "grey.100"
                                }
                              }}
                            >
                              Schedule a Tour
                            </Button>
                            <Button
                              variant="outlined"
                              size="large"
                              sx={{
                                borderColor: "white",
                                color: "white",
                                "&:hover": {
                                  borderColor: "white",
                                  bgcolor: "rgba(255,255,255,0.1)"
                                }
                              }}
                            >
                              Apply Now
                            </Button>
                          </Stack>
                        </Box>
                      </Paper>

                      {/* Property Details Section */}
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>Property Details</Typography>
                        <Typography variant="body1" paragraph>
                          {selectedProperty.description}
                        </Typography>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Amenities</Typography>
                        <Grid container spacing={1}>
                          {selectedProperty.amenities.map((amenity, index) => (
                            <Grid item key={index}>
                              <Chip label={amenity} variant="outlined" />
                            </Grid>
                          ))}
                        </Grid>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">Pet Policy</Typography>
                            <Typography variant="body1">{selectedProperty.petPolicy}</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">Parking</Typography>
                            <Typography variant="body1">{selectedProperty.parkingSpaces} space(s)</Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Editable Content Section */}
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Custom Content (Editable)
                        </Typography>
                        <RichTextEditor
                          value=""
                          onChange={() => {}}
                          placeholder="Add custom content for this landing page..."
                          minHeight={200}
                          label="Custom Content"
                        />
                      </Paper>
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Select a property to preview the landing page
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose a property from the dropdown to see how the template will look with real data
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Tour Scheduling Dialog */}
      <TourScheduling
        open={tourSchedulingOpen}
        onClose={() => setTourSchedulingOpen(false)}
        propertyName={selectedProperty?.name}
        propertyAddress={selectedProperty?.address}
        onScheduleTour={(tourRequest) => {
          // In a real app, this would be added to calendar and dashboard
          console.log("Tour request:", tourRequest);
          alert(`Tour request submitted for ${tourRequest.propertyName} on ${tourRequest.requestedDate} at ${tourRequest.requestedTime}`);
        }}
      />
    </Box>
  );
}
