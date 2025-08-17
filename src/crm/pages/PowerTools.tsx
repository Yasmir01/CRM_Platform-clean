import * as React from "react";
import RichTextEditor from "../components/RichTextEditor";
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Avatar,
  Tooltip,
  Slider,
  RadioGroup,
  Radio,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PoolRoundedIcon from "@mui/icons-material/PoolRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import GiftRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DesignServicesRoundedIcon from "@mui/icons-material/DesignServicesRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import RedeemRoundedIcon from "@mui/icons-material/RedeemRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import MoneyRoundedIcon from "@mui/icons-material/MoneyRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PublicIcon from "@mui/icons-material/Public";
import AddIcon from "@mui/icons-material/Add";
import { uniformTooltipStyles } from "../utils/formStyles";
import QRCodeGenerator from "../components/QRCodeGenerator";
import QRAnalyticsDashboard from "../components/QRAnalyticsDashboard";
import { LocalStorageService } from "../services/LocalStorageService";

// QR Code interfaces
interface QRCodeData {
  id: string;
  title: string;
  content: string;
  type: "URL" | "Text" | "WiFi" | "Contact" | "Property" | "Payment" | "Location" | "Event" | "Email" | "Phone" | "SMS" | "WhatsApp";
  qrCodeUrl: string;
  customization: QRCustomization;
  createdAt: string;
  updatedAt: string;
  downloads: number;
  scans: number;
  analytics: QRAnalytics;
  tracking: QRTracking;
  status: "Active" | "Paused" | "Expired";
  expiryDate?: string;
  password?: string;
  isPasswordProtected: boolean;
}

interface QRCustomization {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  logoSize: number;
  style: "square" | "rounded" | "dots" | "circle";
  pattern: "square" | "circle" | "rounded";
  eyeStyle: "square" | "circle" | "rounded";
  gradientEnabled: boolean;
  gradientColors?: string[];
  frameStyle?: "none" | "simple" | "rounded" | "shadow";
  frameColor?: string;
  frameText?: string;
}

interface QRAnalytics {
  totalScans: number;
  uniqueScans: number;
  scansByDate: { [date: string]: number };
  scansByLocation: { [location: string]: number };
  scansByDevice: { [device: string]: number };
  scansByBrowser: { [browser: string]: number };
  conversionRate: number;
  peakScanTime: string;
}

interface QRTracking {
  trackScans: boolean;
  trackLocation: boolean;
  trackDevice: boolean;
  trackTime: boolean;
  captureLeads: boolean;
  requireContact: boolean;
  landingPageUrl?: string;
  utmParameters?: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  };
}

interface ContactCapture {
  id: string;
  qrCodeId: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  capturedAt: string;
  location?: string;
  device?: string;
  browser?: string;
  ipAddress?: string;
}

// Contest interfaces  
interface Contest {
  id: string;
  title: string;
  description: string;
  type: "Photo" | "Referral" | "Review" | "Social Media" | "Video" | "Other";
  customType?: string;
  status: "Draft" | "Active" | "Ended" | "Paused";
  startDate: string;
  endDate: string;
  prizes: ContestPrize[];
  participants: number;
  entries: number;
  rules: string[];
  requirements: string[];
}

interface ContestPrize {
  place: number;
  title: string;
  value: number;
  description: string;
}

// Pool interfaces
interface Pool {
  id: string;
  title: string;
  description: string;
  type: "Survey" | "Prediction" | "Voting" | "Collection" | "Knowledge" | "Other";
  status: "Active" | "Closed" | "Draft";
  createdAt: string;
  endDate?: string;
  participants: number;
  totalContributions: number;
  questions: PoolQuestion[];
  results: PoolResult[];
}

interface PoolQuestion {
  id: string;
  question: string;
  type: "Multiple Choice" | "Yes/No" | "Text" | "Rating" | "Number";
  options?: string[];
  required: boolean;
}

interface PoolResult {
  questionId: string;
  answers: { [key: string]: number };
  totalResponses: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// New Power Tools Interfaces
interface FundraisingCampaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  currency: string;
  status: "Draft" | "Active" | "Completed" | "Paused";
  startDate: string;
  endDate?: string;
  category: "Property" | "Community" | "Charity" | "Business" | "Personal";
  image?: string;
  donations: number;
  supporters: string[];
  updates: CampaignUpdate[];
  rewards: FundraisingReward[];
}

interface FundraisingReward {
  id: string;
  title: string;
  description: string;
  amount: number;
  claimed: number;
  available: number;
}

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: "update" | "milestone" | "thank_you";
}

interface SmartLink {
  id: string;
  title: string;
  originalUrl: string;
  shortUrl: string;
  description?: string;
  isActive: boolean;
  clickCount: number;
  uniqueClicks: number;
  createdAt: string;
  expiresAt?: string;
  password?: string;
  tags: string[];
  analytics: LinkAnalytics;
  customization: LinkCustomization;
}

interface LinkAnalytics {
  clicksByDate: { date: string; clicks: number }[];
  clicksByLocation: { country: string; clicks: number }[];
  clicksByDevice: { device: string; clicks: number }[];
  clicksByReferrer: { referrer: string; clicks: number }[];
  conversionRate: number;
}

interface LinkCustomization {
  backgroundColor: string;
  textColor: string;
  logoUrl?: string;
  customDomain?: string;
  socialMetaTags: {
    title: string;
    description: string;
    imageUrl?: string;
  };
}

interface DesignTemplate {
  id: string;
  title: string;
  category: "Flyer" | "Social Post" | "Business Card" | "Banner" | "Logo" | "Brochure" | "Poster";
  thumbnail: string;
  description: string;
  isCustomizable: boolean;
  isPremium: boolean;
  dimensions: string;
  tags: string[];
  useCount: number;
  rating: number;
}

// Mock design templates data
const mockDesignTemplates: DesignTemplate[] = [
  // Flyer Templates
  {
    id: "flyer-1",
    title: "Luxury Property Flyer",
    category: "Flyer",
    thumbnail: "https://via.placeholder.com/300x400/1976d2/ffffff?text=Luxury+Property",
    description: "Professional real estate flyer for luxury properties",
    isCustomizable: true,
    isPremium: false,
    dimensions: "8.5x11 inches",
    tags: ["real estate", "luxury", "property"],
    useCount: 245,
    rating: 4.8
  },
  {
    id: "flyer-2",
    title: "Modern Apartment Flyer",
    category: "Flyer",
    thumbnail: "https://via.placeholder.com/300x400/4caf50/ffffff?text=Modern+Apt",
    description: "Sleek design for modern apartment listings",
    isCustomizable: true,
    isPremium: true,
    dimensions: "8.5x11 inches",
    tags: ["modern", "apartment", "rental"],
    useCount: 189,
    rating: 4.6
  },
  // Social Post Templates
  {
    id: "social-1",
    title: "Property Showcase Post",
    category: "Social Post",
    thumbnail: "https://via.placeholder.com/400x400/e91e63/ffffff?text=Property+Post",
    description: "Eye-catching social media post for property highlights",
    isCustomizable: true,
    isPremium: false,
    dimensions: "1080x1080 px",
    tags: ["social media", "property", "instagram"],
    useCount: 567,
    rating: 4.9
  },
  {
    id: "social-2",
    title: "Open House Announcement",
    category: "Social Post",
    thumbnail: "https://via.placeholder.com/400x400/ff5722/ffffff?text=Open+House",
    description: "Engaging post template for open house events",
    isCustomizable: true,
    isPremium: false,
    dimensions: "1080x1080 px",
    tags: ["open house", "event", "social"],
    useCount: 423,
    rating: 4.7
  },
  // Business Card Templates
  {
    id: "card-1",
    title: "Professional Realtor Card",
    category: "Business Card",
    thumbnail: "https://via.placeholder.com/350x200/9c27b0/ffffff?text=Realtor+Card",
    description: "Clean and professional business card for real estate agents",
    isCustomizable: true,
    isPremium: true,
    dimensions: "3.5x2 inches",
    tags: ["business card", "realtor", "professional"],
    useCount: 334,
    rating: 4.8
  },
  // Banner Templates
  {
    id: "banner-1",
    title: "Property Sale Banner",
    category: "Banner",
    thumbnail: "https://via.placeholder.com/600x200/ff9800/ffffff?text=Sale+Banner",
    description: "Bold banner for property sale announcements",
    isCustomizable: true,
    isPremium: false,
    dimensions: "1200x400 px",
    tags: ["sale", "banner", "promotion"],
    useCount: 278,
    rating: 4.5
  },
  // Logo Templates
  {
    id: "logo-1",
    title: "Real Estate Logo",
    category: "Logo",
    thumbnail: "https://via.placeholder.com/300x300/607d8b/ffffff?text=RE+Logo",
    description: "Modern logo design for real estate businesses",
    isCustomizable: true,
    isPremium: true,
    dimensions: "500x500 px",
    tags: ["logo", "real estate", "branding"],
    useCount: 156,
    rating: 4.9
  },
  // Brochure Templates
  {
    id: "brochure-1",
    title: "Property Portfolio Brochure",
    category: "Brochure",
    thumbnail: "https://via.placeholder.com/300x400/795548/ffffff?text=Portfolio",
    description: "Comprehensive brochure for property portfolios",
    isCustomizable: true,
    isPremium: true,
    dimensions: "11x8.5 inches",
    tags: ["brochure", "portfolio", "corporate"],
    useCount: 123,
    rating: 4.7
  }
];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`powertools-tabpanel-${index}`}
      aria-labelledby={`powertools-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data with enhanced structure
const mockQRCodes: QRCodeData[] = [
  {
    id: "qr1",
    title: "Property Listing - Sunset Apartments",
    content: "https://crm.example.com/properties/sunset-apartments",
    type: "Property",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://crm.example.com/properties/sunset-apartments",
    customization: {
      foregroundColor: "#1976d2",
      backgroundColor: "#ffffff",
      logoUrl: "https://via.placeholder.com/60x60/1976d2/ffffff?text=PROP",
      logoSize: 20,
      style: "rounded",
      pattern: "square",
      eyeStyle: "rounded",
      gradientEnabled: false,
      frameStyle: "rounded",
      frameColor: "#1976d2",
      frameText: "View Property"
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    downloads: 25,
    scans: 142,
    status: "Active",
    isPasswordProtected: false,
    analytics: {
      totalScans: 142,
      uniqueScans: 89,
      scansByDate: {
        "2024-01-15": 23,
        "2024-01-16": 31,
        "2024-01-17": 28,
        "2024-01-18": 35,
        "2024-01-19": 25
      },
      scansByLocation: {
        "New York": 45,
        "Los Angeles": 32,
        "Chicago": 28
      },
      scansByDevice: {
        "iPhone": 56,
        "Android": 48,
        "Desktop": 23
      },
      scansByBrowser: {
        "Safari": 45,
        "Chrome": 52,
        "Firefox": 25
      },
      conversionRate: 23.5,
      peakScanTime: "2:00 PM - 4:00 PM"
    },
    tracking: {
      trackScans: true,
      trackLocation: true,
      trackDevice: true,
      trackTime: true,
      captureLeads: true,
      requireContact: false,
      landingPageUrl: "https://crm.example.com/properties/sunset-apartments",
      utmParameters: {
        source: "qr_code",
        medium: "print",
        campaign: "property_listing"
      }
    }
  },
  {
    id: "qr2",
    title: "WiFi Guest Network",
    content: "WIFI:T:WPA;S:GuestNetwork;P:welcome123;;",
    type: "WiFi",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WIFI:T:WPA;S:GuestNetwork;P:welcome123;;",
    customization: {
      foregroundColor: "#4caf50",
      backgroundColor: "#ffffff",
      logoUrl: "https://via.placeholder.com/60x60/4caf50/ffffff?text=WiFi",
      logoSize: 15,
      style: "dots",
      pattern: "circle",
      eyeStyle: "circle",
      gradientEnabled: true,
      gradientColors: ["#4caf50", "#8bc34a"],
      frameStyle: "simple",
      frameColor: "#4caf50",
      frameText: "Free WiFi"
    },
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
    downloads: 8,
    scans: 89,
    status: "Active",
    isPasswordProtected: false,
    analytics: {
      totalScans: 89,
      uniqueScans: 67,
      scansByDate: {
        "2024-01-10": 12,
        "2024-01-11": 18,
        "2024-01-12": 15,
        "2024-01-13": 22,
        "2024-01-14": 22
      },
      scansByLocation: {
        "Los Angeles": 35,
        "San Francisco": 28,
        "San Diego": 26
      },
      scansByDevice: {
        "iPhone": 38,
        "Android": 32,
        "iPad": 19
      },
      scansByBrowser: {
        "Safari": 42,
        "Chrome": 31,
        "Firefox": 16
      },
      conversionRate: 18.2,
      peakScanTime: "10:00 AM - 12:00 PM"
    },
    tracking: {
      trackScans: true,
      trackLocation: true,
      trackDevice: true,
      trackTime: true,
      captureLeads: false,
      requireContact: false,
      utmParameters: {
        source: "qr_code",
        medium: "print",
        campaign: "wifi_access"
      }
    }
  }
];

const mockContactCaptures: ContactCapture[] = [
  {
    id: "contact-1",
    qrCodeId: "qr1",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+1234567890",
    company: "Real Estate Ventures",
    message: "Interested in scheduling a viewing",
    capturedAt: "2024-01-18T14:30:00Z",
    location: "New York",
    device: "iPhone",
    browser: "Safari",
    ipAddress: "192.168.1.1"
  },
  {
    id: "contact-2",
    qrCodeId: "qr1",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "+1987654321",
    capturedAt: "2024-01-18T16:45:00Z",
    location: "Los Angeles",
    device: "Android",
    browser: "Chrome",
    ipAddress: "192.168.1.2"
  }
];

const mockContests: Contest[] = [
  {
    id: "contest1",
    title: "Best Balcony Garden Photo Contest",
    description: "Share photos of your beautiful balcony garden for a chance to win prizes!",
    type: "Photo",
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2024-02-01",
    prizes: [
      { place: 1, title: "Grand Prize", value: 500, description: "$500 rent credit" },
      { place: 2, title: "Second Place", value: 250, description: "$250 gift card" },
      { place: 3, title: "Third Place", value: 100, description: "$100 gift card" }
    ],
    participants: 23,
    entries: 45,
    rules: [
      "Must be a current tenant",
      "Photos must be taken on your balcony",
      "Submit up to 3 photos",
      "Original photos only"
    ],
    requirements: [
      "High resolution photos (min 1920x1080)",
      "Include brief description",
      "Tag @PropertyManagement"
    ]
  }
];

const mockPools: Pool[] = [
  {
    id: "pool1",
    title: "Community Amenity Preferences",
    description: "Help us decide which amenities to prioritize for our next renovation project",
    type: "Survey",
    status: "Active",
    createdAt: "2024-01-10",
    endDate: "2024-02-10",
    participants: 87,
    totalContributions: 124,
    questions: [
      {
        id: "q1",
        question: "Which amenity would you most like to see improved?",
        type: "Multiple Choice",
        options: ["Fitness Center", "Pool Area", "Community Room", "Playground", "BBQ Area"],
        required: true
      },
      {
        id: "q2", 
        question: "How important is a dog park to you?",
        type: "Rating",
        required: false
      }
    ],
    results: [
      {
        questionId: "q1",
        answers: { "Fitness Center": 32, "Pool Area": 28, "Community Room": 15, "Playground": 12, "BBQ Area": 8 },
        totalResponses: 95
      }
    ]
  }
];

export default function PowerTools() {
  const [currentTab, setCurrentTab] = React.useState(0);

  // QR Code states - Load from localStorage if available, fallback to mock data
  const [qrCodes, setQrCodes] = React.useState<QRCodeData[]>(() => {
    const savedQRCodes = LocalStorageService.getQRCodes();
    return savedQRCodes.length > 0 ? savedQRCodes : mockQRCodes;
  });
  const [contactCaptures, setContactCaptures] = React.useState<ContactCapture[]>(() => {
    const savedCaptures = LocalStorageService.getContactCaptures();
    return savedCaptures.length > 0 ? savedCaptures : mockContactCaptures;
  });
  const [openQRDialog, setOpenQRDialog] = React.useState(false);
  const [openAnalyticsDialog, setOpenAnalyticsDialog] = React.useState(false);
  const [selectedQR, setSelectedQR] = React.useState<QRCodeData | null>(null);
  const [qrFormData, setQrFormData] = React.useState({
    title: "",
    content: "",
    type: "URL" as QRCodeData["type"]
  });

  // Helper function to update QR codes and save to localStorage
  const updateQRCodes = React.useCallback((updater: (prev: QRCodeData[]) => QRCodeData[]) => {
    setQrCodes(prev => {
      const updated = updater(prev);
      try {
        LocalStorageService.saveQRCodes(updated);
        console.log('QR codes updated and saved to localStorage');
      } catch (error) {
        console.error('Failed to save QR codes after update:', error);
      }
      return updated;
    });
  }, []);

  // Contest states
  const [contests, setContests] = React.useState<Contest[]>(mockContests);
  const [openContestDialog, setOpenContestDialog] = React.useState(false);
  const [contestFormData, setContestFormData] = React.useState({
    title: "",
    description: "",
    type: "Photo" as Contest["type"],
    customType: "",
    startDate: "",
    endDate: "",
    rules: [""],
    prizes: [{ place: 1, title: "First Place", value: 0, description: "" }]
  });

  // Pool states
  const [pools, setPools] = React.useState<Pool[]>(mockPools);
  const [openPoolDialog, setOpenPoolDialog] = React.useState(false);
  const [poolFormData, setPoolFormData] = React.useState({
    title: "",
    description: "",
    type: "Survey" as Pool["type"],
    customTypeDescription: "",
    endDate: "",
    questions: [{ question: "", type: "Multiple Choice" as PoolQuestion["type"], options: [""], required: true }]
  });

  // New Power Tools states
  const [openFundraiseDialog, setOpenFundraiseDialog] = React.useState(false);
  const [openLinkDialog, setOpenLinkDialog] = React.useState(false);
  const [openDesignDialog, setOpenDesignDialog] = React.useState(false);
  const [openRewardDialog, setOpenRewardDialog] = React.useState(false);
  const [openWishlistDialog, setOpenWishlistDialog] = React.useState(false);

  // Design Studio states
  const [selectedDesignCategory, setSelectedDesignCategory] = React.useState<string>("");
  const [designMode, setDesignMode] = React.useState<"browse" | "create">("browse");
  const [selectedTemplate, setSelectedTemplate] = React.useState<DesignTemplate | null>(null);

  // Wish-it form data and items management
  const [wishlistFormData, setWishlistFormData] = React.useState({
    name: "",
    description: "",
    category: "",
    isPublic: false,
    allowContributions: false
  });
  const [wishlistItems, setWishlistItems] = React.useState<Array<{
    id: string;
    name: string;
    description: string;
    priority: "High" | "Medium" | "Low";
    completed: boolean;
    notes: string;
    estimatedCost?: number;
    targetDate?: string;
  }>>([{
    id: "item-1",
    name: "",
    description: "",
    priority: "Medium",
    completed: false,
    notes: ""
  }]);
  const [openBuildDialog, setOpenBuildDialog] = React.useState(false);
  const [openWordPressDialog, setOpenWordPressDialog] = React.useState(false);

  // Build-it form data and content management
  const [buildFormData, setBuildFormData] = React.useState({
    assetType: "",
    name: "",
    description: "",
    template: "",
    colorScheme: "",
    analyticsEnabled: true,
    mobileResponsive: true,
    content: "<p>Start building your content here...</p>",
    formFields: [] as Array<{
      id: string;
      type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio";
      label: string;
      placeholder: string;
      required: boolean;
      options?: string[];
    }>,
    calculatorConfig: {
      title: "",
      description: "",
      fields: [] as Array<{
        id: string;
        label: string;
        type: "number" | "currency" | "percentage";
        variable: string;
        defaultValue: string;
      }>,
      formula: "",
      resultLabel: "Result"
    }
  });

  // WordPress integration form data
  const [wordPressFormData, setWordPressFormData] = React.useState({
    siteName: "",
    domain: "",
    siteType: "",
    template: "",
    hostingPlan: "basic",
    features: {
      blog: true,
      ecommerce: false,
      booking: false,
      gallery: true,
      contact: true,
      seo: true,
      analytics: true,
      ssl: true
    },
    pages: [] as Array<{
      id: string;
      title: string;
      type: string;
      content: string;
    }>,
    customization: {
      primaryColor: "#1976d2",
      logoUrl: "",
      businessInfo: {
        name: "",
        address: "",
        phone: "",
        email: ""
      }
    }
  });

  // Fundraise-it form data
  const [fundraiseFormData, setFundraiseFormData] = React.useState({
    title: "",
    description: "",
    goalAmount: "",
    category: "",
    customCategory: "",
    startDate: "",
    endDate: ""
  });

  // Reward-it form data
  const [rewardFormData, setRewardFormData] = React.useState({
    programName: "",
    description: "",
    programType: "",
    customProgramType: "",
    pointsPerDollar: "1",
    minimumRedemption: "100"
  });

  // Mock data for new tools
  const [fundraiseCampaigns, setFundraiseCampaigns] = React.useState<FundraisingCampaign[]>([
    {
      id: "fundraise_1",
      title: "Community Garden Project",
      description: "Help us create a beautiful community garden space for residents",
      goal: 15000,
      raised: 8500,
      currency: "USD",
      status: "Active",
      startDate: "2024-01-01",
      endDate: "2024-03-01",
      category: "Community",
      donations: 45,
      supporters: ["user1", "user2", "user3"],
      updates: [],
      rewards: []
    }
  ]);

  const [smartLinks, setSmartLinks] = React.useState<SmartLink[]>([
    {
      id: "link_1",
      title: "Property Listing - Downtown",
      originalUrl: "https://properties.example.com/downtown-apartment",
      shortUrl: "link.property.com/downtown-apartment",
      description: "Modern downtown apartment listing",
      isActive: true,
      clickCount: 1247,
      uniqueClicks: 892,
      createdAt: "2024-01-15",
      tags: ["property", "downtown"],
      analytics: {
      clicksByDate: [
        { date: "2024-01-15", clicks: 45 },
        { date: "2024-01-16", clicks: 62 },
        { date: "2024-01-17", clicks: 38 },
        { date: "2024-01-18", clicks: 71 },
        { date: "2024-01-19", clicks: 55 }
      ],
      clicksByLocation: [
        { country: "United States", clicks: 723 },
        { country: "Canada", clicks: 298 },
        { country: "United Kingdom", clicks: 156 },
        { country: "Australia", clicks: 70 }
      ],
      clicksByDevice: [
        { device: "Desktop", clicks: 612 },
        { device: "Mobile", clicks: 455 },
        { device: "Tablet", clicks: 180 }
      ],
      clicksByReferrer: [
        { referrer: "Google", clicks: 543 },
        { referrer: "Facebook", clicks: 289 },
        { referrer: "Direct", clicks: 234 },
        { referrer: "Twitter", clicks: 181 }
      ],
      conversionRate: 3.4
    },
      customization: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        socialMetaTags: {
          title: "Downtown Apartment",
          description: "Modern apartment in the heart of downtown"
        }
      }
    },
    {
      id: "link_2",
      title: "Contact Form",
      originalUrl: "https://properties.example.com/contact-us",
      shortUrl: "link.property.com/contact-us",
      description: "Property contact form for inquiries",
      isActive: true,
      clickCount: 756,
      uniqueClicks: 623,
      createdAt: "2024-01-10",
      tags: ["contact", "form"],
      analytics: {
        clicksByDate: [
          { date: "2024-01-10", clicks: 32 },
          { date: "2024-01-11", clicks: 48 },
          { date: "2024-01-12", clicks: 29 },
          { date: "2024-01-13", clicks: 55 },
          { date: "2024-01-14", clicks: 41 }
        ],
        clicksByLocation: [
          { country: "United States", clicks: 445 },
          { country: "Canada", clicks: 178 },
          { country: "Mexico", clicks: 89 },
          { country: "United Kingdom", clicks: 44 }
        ],
        clicksByDevice: [
          { device: "Mobile", clicks: 412 },
          { device: "Desktop", clicks: 234 },
          { device: "Tablet", clicks: 110 }
        ],
        clicksByReferrer: [
          { referrer: "Google", clicks: 298 },
          { referrer: "Direct", clicks: 189 },
          { referrer: "Facebook", clicks: 156 },
          { referrer: "LinkedIn", clicks: 113 }
        ],
        conversionRate: 2.8
      },
      customization: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        socialMetaTags: {
          title: "Contact Us",
          description: "Get in touch with our property team"
        }
      }
    }
  ]);

  // QR Code functions
  const handleEditQR = (qr: QRCodeData) => {
    setSelectedQR(qr);
    setOpenQRDialog(true);
  };

  const handleViewAnalytics = (qr: QRCodeData) => {
    setSelectedQR(qr);
    setOpenAnalyticsDialog(true);
  };

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
    setSelectedQR(null);
  };

  const handleCloseAnalyticsDialog = () => {
    setOpenAnalyticsDialog(false);
    setSelectedQR(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadQR = async (qrCode: QRCodeData) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to simple download
        const link = document.createElement('a');
        link.href = qrCode.qrCodeUrl;
        link.download = `${qrCode.title.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';

      qrImage.onload = async () => {
        canvas.width = 300;
        canvas.height = 300;

        // Draw QR code
        ctx.drawImage(qrImage, 0, 0, 300, 300);

        // Add logo if present
        if (qrCode.customization.logoUrl) {
          const logoImage = new Image();
          logoImage.crossOrigin = 'anonymous';
          logoImage.onload = () => {
            const logoSize = (qrCode.customization.logoSize / 100) * 300;
            const logoX = (300 - logoSize) / 2;
            const logoY = (300 - logoSize) / 2;

            // Add white background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

            // Draw logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

            // Download the canvas as image
            const link = document.createElement('a');
            link.download = `${qrCode.title.replace(/\s+/g, '_')}_QR.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update download count
            updateQRCodes(prev => prev.map(qr =>
              qr.id === qrCode.id ? { ...qr, downloads: qr.downloads + 1 } : qr
            ));
          };

          logoImage.onerror = () => {
            // Download without logo if logo fails to load
            const link = document.createElement('a');
            link.download = `${qrCode.title.replace(/\s+/g, '_')}_QR.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update download count
            updateQRCodes(prev => prev.map(qr =>
              qr.id === qrCode.id ? { ...qr, downloads: qr.downloads + 1 } : qr
            ));
          };

          logoImage.src = qrCode.customization.logoUrl;
        } else {
          // Download without logo
          const link = document.createElement('a');
          link.download = `${qrCode.title.replace(/\s+/g, '_')}_QR.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Update download count
          updateQRCodes(prev => prev.map(qr =>
            qr.id === qrCode.id ? { ...qr, downloads: qr.downloads + 1 } : qr
          ));
        }
      };

      qrImage.onerror = () => {
        // Fallback to simple download
        const link = document.createElement('a');
        link.href = qrCode.qrCodeUrl;
        link.download = `${qrCode.title.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update download count
        updateQRCodes(prev => prev.map(qr =>
          qr.id === qrCode.id ? { ...qr, downloads: qr.downloads + 1 } : qr
        ));
      };

      qrImage.src = qrCode.qrCodeUrl;
    } catch (error) {
      // Fallback to simple download
      const link = document.createElement('a');
      link.href = qrCode.qrCodeUrl;
      link.download = `${qrCode.title.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      updateQRCodes(prev => prev.map(qr =>
        qr.id === qrCode.id ? { ...qr, downloads: qr.downloads + 1 } : qr
      ));
    }
  };

  const shareQR = async (qrCode: QRCodeData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: qrCode.title,
          text: `Check out this QR code: ${qrCode.title}`,
          url: qrCode.content
        });
      } catch (error) {
        copyToClipboard(qrCode.content);
      }
    } else {
      copyToClipboard(qrCode.content);
    }
  };

  // Link-it Functions
  const handleLinkAnalytics = (link: SmartLink) => {
    // Create analytics modal content
    const analyticsContent = `
Link Analytics for: ${link.title}

📊 Performance Metrics:
• Total Clicks: ${link.clickCount}
• Unique Clicks: ${link.uniqueClicks}
• Conversion Rate: ${link.analytics.conversionRate}%
• Created: ${new Date(link.createdAt).toLocaleDateString()}

🌍 Top Locations:
${link.analytics.clicksByLocation.map(loc => `• ${loc.country}: ${loc.clicks} clicks`).join('\n')}

📱 Top Devices:
${link.analytics.clicksByDevice.map(device => `• ${device.device}: ${device.clicks} clicks`).join('\n')}

🔗 Original URL: ${link.originalUrl}
💫 Short URL: ${link.shortUrl}
    `;

    alert(analyticsContent);
  };

  const handleCopyShortLink = (link: SmartLink) => {
    copyToClipboard(link.shortUrl);
  };

  const handleCreateContest = () => {
    const newContest: Contest = {
      id: Date.now().toString(),
      title: contestFormData.title,
      description: contestFormData.description,
      type: contestFormData.type,
      customType: contestFormData.type === "Other" ? contestFormData.customType : undefined,
      status: "Draft",
      startDate: contestFormData.startDate,
      endDate: contestFormData.endDate,
      prizes: contestFormData.prizes,
      participants: 0,
      entries: 0,
      rules: contestFormData.rules.filter(rule => rule.trim()),
      requirements: []
    };
    
    setContests(prev => [...prev, newContest]);
    setOpenContestDialog(false);
    setContestFormData({
      title: "",
      description: "",
      type: "Photo",
      customType: "",
      startDate: "",
      endDate: "",
      rules: [""],
      prizes: [{ place: 1, title: "First Place", value: 0, description: "" }]
    });
  };

  const handleCreatePool = () => {
    const newPool: Pool = {
      id: Date.now().toString(),
      title: poolFormData.title,
      description: poolFormData.description,
      type: poolFormData.type,
      status: "Draft",
      createdAt: new Date().toISOString().split('T')[0],
      endDate: poolFormData.endDate,
      participants: 0,
      totalContributions: 0,
      questions: poolFormData.questions.filter(q => q.question.trim()),
      results: []
    };

    setPools(prev => [...prev, newPool]);
    setOpenPoolDialog(false);
    setPoolFormData({
      title: "",
      description: "",
      type: "Survey",
      customTypeDescription: "",
      endDate: "",
      questions: [{ question: "", type: "Multiple Choice", options: [""], required: true }]
    });
  };

  const getFeatureDescription = (feature: string): string => {
    const descriptions: Record<string, string> = {
      blog: "News and updates section",
      ecommerce: "Online payments and booking",
      booking: "Appointment scheduling system",
      gallery: "Photo and video galleries",
      contact: "Contact forms and information",
      seo: "Search engine optimization",
      analytics: "Website traffic tracking",
      ssl: "Secure HTTPS connection"
    };
    return descriptions[feature] || "Additional functionality";
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          🔧 Power Tools
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate QR codes, create contests, and manage community pools
        </Typography>
      </Stack>

      {/* Tools Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main", width: 60, height: 60 }}>
                  <QrCodeRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">QR-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate QR codes for properties, WiFi, contacts, and more
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    {qrCodes.length} codes created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main", width: 60, height: 60 }}>
                  <EmojiEventsRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Win-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create contests and giveaways to engage your community
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {contests.filter(c => c.status === 'Active').length} active contests
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main", width: 60, height: 60 }}>
                  <PoolRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Pool-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collect community feedback through surveys and polls
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    {pools.filter(p => p.status === 'Active').length} active pools
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main", width: 60, height: 60 }}>
                  <AttachMoneyRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Fundraise-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create fundraising campaigns and donation tracking
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    2 active campaigns
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "secondary.main", width: 60, height: 60 }}>
                  <LinkRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Link-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create smart links and track engagement analytics
                  </Typography>
                  <Typography variant="caption" color="secondary.main">
                    15 smart links created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "error.main", width: 60, height: 60 }}>
                  <EditRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Design-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered graphic design and content creation
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    50+ templates available
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main", width: 60, height: 60 }}>
                  <RedeemRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Reward-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create loyalty programs and reward systems
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    3 reward programs active
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "pink", width: 60, height: 60 }}>
                  <FavoriteRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Wish-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create and manage wishlists for clients and teams
                  </Typography>
                  <Typography variant="caption" sx={{ color: "pink" }}>
                    8 wishlists created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.2s' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "purple", width: 60, height: 60 }}>
                  <BuildRoundedIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Build-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Build custom web assets, forms, and widgets
                  </Typography>
                  <Typography variant="caption" sx={{ color: "purple" }}>
                    12 web assets deployed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-4px)' },
              transition: 'transform 0.2s'
            }}
            onClick={() => setOpenWordPressDialog(true)}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "indigo", width: 60, height: 60 }}>
                  <PublicIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">WordPress-it</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create professional WordPress websites instantly
                  </Typography>
                  <Typography variant="caption" sx={{ color: "indigo" }}>
                    5 websites created
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab
            icon={<QrCodeRoundedIcon />}
            label="QR-it"
            iconPosition="start"
          />
          <Tab
            icon={<EmojiEventsRoundedIcon />}
            label="Win-it"
            iconPosition="start"
          />
          <Tab
            icon={<PoolRoundedIcon />}
            label="Pool-it"
            iconPosition="start"
          />
          <Tab
            icon={<AttachMoneyRoundedIcon />}
            label="Fundraise-it"
            iconPosition="start"
          />
          <Tab
            icon={<LinkRoundedIcon />}
            label="Link-it"
            iconPosition="start"
          />
          <Tab
            icon={<DesignServicesRoundedIcon />}
            label="Design-it"
            iconPosition="start"
          />
          <Tab
            icon={<RedeemRoundedIcon />}
            label="Reward-it"
            iconPosition="start"
          />
          <Tab
            icon={<FavoriteRoundedIcon />}
            label="Wish-it"
            iconPosition="start"
          />
          <Tab
            icon={<BuildRoundedIcon />}
            label="Build-it"
            iconPosition="start"
          />
          <Tab
            icon={<PublicIcon />}
            label="WordPress-it"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* QR-it Tab */}
      <TabPanel value={currentTab} index={0}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">QR Code Generator</Typography>
          <Button
            variant="contained"
            startIcon={<QrCodeRoundedIcon />}
            onClick={() => {
              setSelectedQR(null);
              setOpenQRDialog(true);
            }}
          >
            Create QR Code
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {qrCodes.map((qr) => (
            <Grid item xs={12} sm={6} md={4} key={qr.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: 'calc(100% - 80px)' }}>
                        <Typography variant="h6" noWrap>{qr.title}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          <Chip label={qr.type} size="small" color="primary" />
                          <Chip
                            label={qr.status}
                            size="small"
                            color={qr.status === 'Active' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                      <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleViewAnalytics(qr)}>
                        <Avatar src={qr.qrCodeUrl} sx={{ width: 60, height: 60 }} />
                        {qr.customization.logoUrl && (
                          <Avatar
                            src={qr.customization.logoUrl}
                            sx={{
                              width: qr.customization.logoSize,
                              height: qr.customization.logoSize,
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              border: 1,
                              borderColor: 'white'
                            }}
                          />
                        )}
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {qr.content}
                    </Typography>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="primary.main">
                          📊 {qr.analytics.totalScans} scans
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="success.main">
                          👥 {qr.analytics.uniqueScans} unique
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption">
                          📥 {qr.downloads} downloads
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption">
                          📈 {qr.analytics.conversionRate}% conv.
                        </Typography>
                      </Grid>
                    </Grid>

                    {qr.tracking.captureLeads && (
                      <Alert severity="info" sx={{ py: 0.5 }}>
                        <Typography variant="caption">
                          💼 {contactCaptures.filter(c => c.qrCodeId === qr.id).length} leads captured
                        </Typography>
                      </Alert>
                    )}

                    <Stack direction="row" spacing={0.5} sx={{ mt: 'auto' }}>
                      <Tooltip title="View Analytics">
                        <IconButton size="small" onClick={() => handleViewAnalytics(qr)}>
                          <AnalyticsRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit QR Code">
                        <IconButton size="small" onClick={() => handleEditQR(qr)}>
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download QR Code">
                        <IconButton size="small" onClick={() => downloadQR(qr)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy Content">
                        <IconButton size="small" onClick={() => copyToClipboard(qr.content)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton size="small" onClick={() => shareQR(qr)}>
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Win-it Tab */}
      <TabPanel value={currentTab} index={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Contest & Giveaway Manager</Typography>
          <Button
            variant="contained"
            startIcon={<EmojiEventsRoundedIcon />}
            onClick={() => setOpenContestDialog(true)}
          >
            Create Contest
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {contests.map((contest) => (
            <Grid item xs={12} md={6} key={contest.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6">{contest.title}</Typography>
                        <Chip 
                          label={contest.status} 
                          size="small" 
                          color={contest.status === 'Active' ? 'success' : 'default'} 
                        />
                      </Box>
                      <Typography variant="h4" color="primary.main">
                        🏆
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      {contest.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption">👥 {contest.participants} participants</Typography>
                      <Typography variant="caption">📝 {contest.entries} entries</Typography>
                    </Stack>
                    
                    <Typography variant="caption" color="text.secondary">
                      {contest.startDate} → {contest.endDate}
                    </Typography>
                    
                    <Divider />
                    
                    <Typography variant="subtitle2">Prizes:</Typography>
                    {contest.prizes.slice(0, 3).map((prize) => (
                      <Stack direction="row" justifyContent="space-between" key={prize.place}>
                        <Typography variant="body2">{prize.title}</Typography>
                        <Typography variant="body2" fontWeight="bold">${prize.value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Pool-it Tab */}
      <TabPanel value={currentTab} index={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Community Pools & Surveys</Typography>
          <Button
            variant="contained"
            startIcon={<PoolRoundedIcon />}
            onClick={() => setOpenPoolDialog(true)}
          >
            Create Pool
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {pools.map((pool) => (
            <Grid item xs={12} md={6} key={pool.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box>
                        <Typography variant="h6">{pool.title}</Typography>
                        <Chip 
                          label={pool.status} 
                          size="small" 
                          color={pool.status === 'Active' ? 'info' : 'default'} 
                        />
                      </Box>
                      <Typography variant="h4" color="info.main">
                        🗳️
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary">
                      {pool.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={2}>
                      <Typography variant="caption">👥 {pool.participants} participants</Typography>
                      <Typography variant="caption">💬 {pool.totalContributions} responses</Typography>
                    </Stack>
                    
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(pool.createdAt).toLocaleDateString()}
                      {pool.endDate && ` • Ends: ${new Date(pool.endDate).toLocaleDateString()}`}
                    </Typography>
                    
                    <Divider />
                    
                    <Typography variant="subtitle2">{pool.questions.length} Questions</Typography>
                    {pool.questions.slice(0, 2).map((question, index) => (
                      <Typography variant="body2" key={index}>
                        {index + 1}. {question.question}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Fundraise-it Tab */}
      <TabPanel value={currentTab} index={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Fundraising Campaigns</Typography>
          <Button
            variant="contained"
            startIcon={<AttachMoneyRoundedIcon />}
            onClick={() => setOpenFundraiseDialog(true)}
          >
            Create Campaign
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Launch fundraising campaigns for property development, community projects, or charitable causes. Track donations, manage rewards, and engage supporters.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Community Garden Project</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Help us create a beautiful community garden space for residents
                  </Typography>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">$8,500 raised of $15,000 goal</Typography>
                      <Typography variant="body2" color="success.main">57%</Typography>
                    </Stack>
                    <Box sx={{ width: "100%", mt: 1 }}>
                      <div style={{ width: "100%", height: 8, backgroundColor: "#e0e0e0", borderRadius: 4 }}>
                        <div style={{ width: "57%", height: 8, backgroundColor: "#4caf50", borderRadius: 4 }} />
                      </div>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">🎯 15 days left</Typography>
                    <Typography variant="caption">👥 23 supporters</Typography>
                    <Typography variant="caption">💝 45 donations</Typography>
                  </Stack>
                  <Button variant="outlined" fullWidth onClick={() => {
                    alert("Opening Community Garden Project management dashboard...");
                  }}>
                    Manage Campaign
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Property Renovation Fund</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upgrade common areas and amenities for our residents
                  </Typography>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">$12,300 raised of $20,000 goal</Typography>
                      <Typography variant="body2" color="warning.main">62%</Typography>
                    </Stack>
                    <Box sx={{ width: "100%", mt: 1 }}>
                      <div style={{ width: "100%", height: 8, backgroundColor: "#e0e0e0", borderRadius: 4 }}>
                        <div style={{ width: "62%", height: 8, backgroundColor: "#ff9800", borderRadius: 4 }} />
                      </div>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">🎯 32 days left</Typography>
                    <Typography variant="caption">👥 41 supporters</Typography>
                    <Typography variant="caption">💝 67 donations</Typography>
                  </Stack>
                  <Button variant="outlined" fullWidth onClick={() => {
                    alert("Opening Property Renovation Fund management dashboard...");
                  }}>
                    Manage Campaign
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Link-it Tab */}
      <TabPanel value={currentTab} index={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Smart Link Manager</Typography>
          <Button
            variant="contained"
            startIcon={<LinkRoundedIcon />}
            onClick={() => setOpenLinkDialog(true)}
          >
            Create Smart Link
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Create smart links with custom domains, track clicks, and analyze engagement. Perfect for marketing campaigns and property listings.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Property Listing - Downtown</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    link.property.com/downtown-apartment
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">🔗 1,247 clicks</Typography>
                    <Typography variant="caption">👥 892 unique</Typography>
                    <Typography variant="caption">📈 CTR 3.4%</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AnalyticsRoundedIcon />}
                      onClick={() => handleLinkAnalytics(smartLinks[0])}
                    >
                      Analytics
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopyShortLink(smartLinks[0])}
                    >
                      Copy
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Contact Form</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    link.property.com/contact-us
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">🔗 756 clicks</Typography>
                    <Typography variant="caption">👥 623 unique</Typography>
                    <Typography variant="caption">📈 CTR 2.8%</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AnalyticsRoundedIcon />}
                      onClick={() => handleLinkAnalytics(smartLinks[1])}
                    >
                      Analytics
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => handleCopyShortLink(smartLinks[1])}
                    >
                      Copy
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Design-it Tab */}
      <TabPanel value={currentTab} index={5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">AI Design Studio</Typography>
          <Button
            variant="contained"
            startIcon={<DesignServicesRoundedIcon />}
            onClick={() => {
              setSelectedDesignCategory("");
              setDesignMode("create");
              setOpenDesignDialog(true);
            }}
          >
            Create Design
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Create professional designs using AI-powered templates. Perfect for marketing materials, social media posts, and property flyers.
        </Alert>

        <Grid container spacing={3}>
          {["Property Flyer", "Social Media Post", "Business Card", "Banner", "Brochure", "Logo"].map((category, index) => (
            <Grid item xs={12} sm={6} md={4} key={category}>
              <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' }, transition: 'transform 0.2s' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                      <PaletteRoundedIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6">{category}</Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {8 + index} premium templates
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => {
                      setSelectedDesignCategory(category);
                      setDesignMode("browse");
                      setOpenDesignDialog(true);
                    }}>
                      Browse Templates
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Reward-it Tab */}
      <TabPanel value={currentTab} index={6}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Reward Programs</Typography>
          <Button
            variant="contained"
            startIcon={<RedeemRoundedIcon />}
            onClick={() => setOpenRewardDialog(true)}
          >
            Create Program
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Build customer loyalty with points, cashback, and tier-based reward programs. Track member engagement and redemptions.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Tenant Loyalty Program</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Earn points for on-time payments and referrals
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">👥 156 members</Typography>
                    <Typography variant="caption">⭐ 12,450 points awarded</Typography>
                    <Typography variant="caption">🎁 89 rewards claimed</Typography>
                  </Stack>
                  <Button variant="outlined" fullWidth onClick={() => {
                    setOpenRewardDialog(true);
                  }}>
                    Manage Program
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Referral Rewards</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get rewarded for successful property referrals
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">👥 89 members</Typography>
                    <Typography variant="caption">⭐ 8,920 points awarded</Typography>
                    <Typography variant="caption">🎁 45 rewards claimed</Typography>
                  </Stack>
                  <Button variant="outlined" fullWidth onClick={() => {
                    setOpenRewardDialog(true);
                  }}>
                    Manage Program
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Wish-it Tab */}
      <TabPanel value={currentTab} index={7}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Wishlists</Typography>
          <Button
            variant="contained"
            startIcon={<FavoriteRoundedIcon />}
            onClick={() => setOpenWishlistDialog(true)}
          >
            Create Wishlist
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Create and manage wishlists for client preferences, team goals, and project requirements. Share lists and track progress.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Client Property Preferences</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dream home features and requirements
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">📋 12 items</Typography>
                    <Typography variant="caption">✅ 4 completed</Typography>
                    <Typography variant="caption">🔒 Private</Typography>
                  </Stack>
                  <Button variant="outlined" fullWidth onClick={() => {
                    setOpenWishlistDialog(true);
                  }}>
                    View Wishlist
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Office Equipment Needs</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items needed for the new office setup
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="caption">📋 8 items</Typography>
                    <Typography variant="caption">✅ 6 completed</Typography>
                    <Typography variant="caption">🌐 Public</Typography>
                  </Stack>
                  <Button variant="outlined" fullWidth onClick={() => {
                    setOpenWishlistDialog(true);
                  }}>
                    View Wishlist
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Build-it Tab */}
      <TabPanel value={currentTab} index={8}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Web Assets Builder</Typography>
          <Button
            variant="contained"
            startIcon={<BuildRoundedIcon />}
            onClick={() => setOpenBuildDialog(true)}
          >
            Create Asset
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Build custom web assets without coding. Create landing pages, forms, widgets, chatbots, and more with drag-and-drop simplicity.
        </Alert>

        <Grid container spacing={3}>
          {[
            { type: "Landing Page", icon: "🌐", count: 5, description: "Custom property showcase pages" },
            { type: "Contact Form", icon: "📝", count: 3, description: "Lead capture and inquiry forms" },
            { type: "Chat Widget", icon: "💬", count: 2, description: "Automated customer support" },
            { type: "Popup", icon: "📢", count: 4, description: "Promotional and notification popups" },
            { type: "Banner", icon: "🎨", count: 6, description: "Marketing and event banners" },
            { type: "Calculator", icon: "🧮", count: 1, description: "Mortgage and rent calculators" }
          ].map((asset, index) => (
            <Grid item xs={12} sm={6} md={4} key={asset.type}>
              <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)' }, transition: 'transform 0.2s' }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h2">{asset.icon}</Typography>
                    <Typography variant="h6">{asset.type}</Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {asset.description}
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      {asset.count} active
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => {
                      setOpenBuildDialog(true);
                    }}>
                      Create {asset.type}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* WordPress-it Tab */}
      <TabPanel value={currentTab} index={9}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">WordPress Integration</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenWordPressDialog(true)}
          >
            Create Website
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          🌐 Create professional WordPress websites instantly! Choose from templates, customize your brand, and launch your property management website in minutes.
        </Alert>

        <Grid container spacing={3}>
          {[
            {
              type: "Property Showcase",
              icon: "🏠",
              price: "$29/month",
              features: ["Property listings", "Virtual tours", "Contact forms", "SEO optimized"],
              description: "Perfect for showcasing rental properties"
            },
            {
              type: "Property Management",
              icon: "🏢",
              price: "$49/month",
              features: ["Tenant portal", "Maintenance requests", "Payment processing", "Document management"],
              description: "Complete property management solution"
            },
            {
              type: "Real Estate Agency",
              icon: "🏘️",
              price: "$69/month",
              features: ["MLS integration", "Agent profiles", "Lead management", "Analytics"],
              description: "Professional real estate agency website"
            },
            {
              type: "Community Portal",
              icon: "👥",
              price: "$39/month",
              features: ["Resident directory", "Event calendar", "Announcements", "Forums"],
              description: "Build community engagement"
            },
            {
              type: "Maintenance Service",
              icon: "🔧",
              price: "$25/month",
              features: ["Service booking", "Technician profiles", "Quote requests", "Reviews"],
              description: "For property service providers"
            },
            {
              type: "Custom Solution",
              icon: "⚡",
              price: "Quote",
              features: ["Custom design", "Advanced features", "API integrations", "Premium support"],
              description: "Tailored to your specific needs"
            }
          ].map((template, index) => (
            <Grid item xs={12} sm={6} md={4} key={template.type}>
              <Card sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
                transition: 'all 0.2s',
                position: 'relative'
              }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={2} sx={{ height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h2">{template.icon}</Typography>
                      <Chip
                        label={template.price}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {template.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Features:
                      </Typography>
                      <Stack spacing={0.5}>
                        {template.features.map((feature, idx) => (
                          <Typography key={idx} variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            ✓ {feature}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => setOpenWordPressDialog(true)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => {
                          setWordPressFormData({
                            ...wordPressFormData,
                            siteType: template.type,
                            template: template.type.toLowerCase().replace(/\s+/g, '-')
                          });
                          setOpenWordPressDialog(true);
                        }}
                      >
                        Get Started
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent WordPress Sites */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent WordPress Sites
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: "Sunset Properties", domain: "sunset-properties.com", status: "Live", visits: "1,234" },
              { name: "Downtown Rentals", domain: "downtown-rentals.org", status: "In Progress", visits: "856" },
              { name: "Garden View Community", domain: "gardenview.net", status: "Live", visits: "2,103" }
            ].map((site, index) => (
              <Grid item xs={12} md={4} key={site.name}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {site.name}
                        </Typography>
                        <Chip
                          label={site.status}
                          color={site.status === "Live" ? "success" : "warning"}
                          size="small"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {site.domain}
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        📊 {site.visits} monthly visits
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />}>
                          View
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />}>
                          Edit
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>

      {/* Fundraise-it Dialog */}
      <Dialog open={openFundraiseDialog} onClose={() => setOpenFundraiseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Fundraising Campaign</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Campaign Title"
              fullWidth
              placeholder="e.g., Community Garden Project"
              value={fundraiseFormData.title}
              onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your fundraising goal..."
              value={fundraiseFormData.description}
              onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Goal Amount ($)"
                  type="number"
                  fullWidth
                  placeholder="15000"
                  value={fundraiseFormData.goalAmount}
                  onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, goalAmount: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={fundraiseFormData.category}
                    label="Category"
                    onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, category: e.target.value })}
                  >
                    <MenuItem value="Property">Property Development</MenuItem>
                    <MenuItem value="Community">Community Project</MenuItem>
                    <MenuItem value="Charity">Charitable Cause</MenuItem>
                    <MenuItem value="Business">Business Expansion</MenuItem>
                    <MenuItem value="Other">Other (Custom)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {fundraiseFormData.category === "Other" && (
              <TextField
                label="Custom Category Description"
                fullWidth
                required
                value={fundraiseFormData.customCategory}
                onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, customCategory: e.target.value })}
                placeholder="Please describe your custom fundraising category"
                helperText="Required when 'Other' is selected"
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={fundraiseFormData.startDate}
                  onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={fundraiseFormData.endDate}
                  onChange={(e) => setFundraiseFormData({ ...fundraiseFormData, endDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFundraiseDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenFundraiseDialog(false);
              alert(`Fundraising campaign "${fundraiseFormData.title}" created successfully!`);
              // Reset form
              setFundraiseFormData({
                title: "",
                description: "",
                goalAmount: "",
                category: "",
                customCategory: "",
                startDate: "",
                endDate: ""
              });
            }}
            disabled={!fundraiseFormData.title || (fundraiseFormData.category === "Other" && !fundraiseFormData.customCategory)}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link-it Dialog */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Smart Link</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Link Title" fullWidth placeholder="e.g., Property Listing - Downtown" />
            <TextField label="Original URL" fullWidth placeholder="https://example.com/your-long-url" />
            <TextField label="Custom Short URL (Optional)" fullWidth placeholder="link.property.com/custom-name" />
            <TextField label="Description" fullWidth multiline rows={2} placeholder="Brief description of this link..." />
            <FormControlLabel control={<Switch />} label="Enable Click Tracking" />
            <FormControlLabel control={<Switch />} label="Password Protection" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setOpenLinkDialog(false);
            alert("Smart link created successfully!");
          }}>Create Link</Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Design-it Dialog */}
      <Dialog
        open={openDesignDialog}
        onClose={() => {
          setOpenDesignDialog(false);
          setSelectedTemplate(null);
          setSelectedDesignCategory("");
        }}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <DesignServicesRoundedIcon color="primary" />
              <Typography variant="h6">
                AI Design Studio
                {selectedDesignCategory && ` - ${selectedDesignCategory}`}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant={designMode === "browse" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDesignMode("browse")}
              >
                Browse Templates
              </Button>
              <Button
                variant={designMode === "create" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDesignMode("create")}
              >
                Create Design
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {designMode === "browse" ? (
            <Stack spacing={3}>
              {/* Template Browser */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {selectedDesignCategory ? `${selectedDesignCategory} Templates` : "All Templates"}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={selectedDesignCategory}
                    label="Filter by Category"
                    onChange={(e) => setSelectedDesignCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Property Flyer">Property Flyer</MenuItem>
                    <MenuItem value="Social Media Post">Social Media Post</MenuItem>
                    <MenuItem value="Business Card">Business Card</MenuItem>
                    <MenuItem value="Banner">Banner</MenuItem>
                    <MenuItem value="Logo">Logo</MenuItem>
                    <MenuItem value="Brochure">Brochure</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Template Grid */}
              <Grid container spacing={3}>
                {mockDesignTemplates
                  .filter(template => !selectedDesignCategory || template.category === selectedDesignCategory)
                  .map((template) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedTemplate?.id === template.id ? 2 : 1,
                          borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={template.thumbnail}
                            alt={template.title}
                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                          {template.isPremium && (
                            <Chip
                              label="Premium"
                              color="warning"
                              size="small"
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                            />
                          )}
                          <Box sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Chip
                              label={`⭐ ${template.rating}`}
                              size="small"
                              sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                            />
                            <Chip
                              label={`${template.useCount} uses`}
                              size="small"
                              sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
                            />
                          </Box>
                        </Box>
                        <CardContent>
                          <Typography variant="subtitle1" noWrap>{template.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {template.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {template.dimensions}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>

              {/* Selected Template Details */}
              {selectedTemplate && (
                <Paper sx={{ p: 3, border: 1, borderColor: 'primary.main' }}>
                  <Stack spacing={2}>
                    <Typography variant="h6">Selected Template: {selectedTemplate.title}</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <img
                          src={selectedTemplate.thumbnail}
                          alt={selectedTemplate.title}
                          style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                          <Typography variant="body1">{selectedTemplate.description}</Typography>
                          <Stack direction="row" spacing={2}>
                            <Chip label={selectedTemplate.category} color="primary" />
                            <Chip label={selectedTemplate.dimensions} variant="outlined" />
                            <Chip label={`⭐ ${selectedTemplate.rating}`} variant="outlined" />
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedTemplate.tags.map((tag, index) => (
                              <Chip key={index} label={tag} size="small" variant="outlined" />
                            ))}
                          </Stack>
                          <Button
                            variant="contained"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => {
                              setDesignMode("create");
                              // Template selection would pre-populate the create form
                            }}
                          >
                            Customize This Template
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Stack>
                </Paper>
              )}
            </Stack>
          ) : (
            /* Create Design Mode */
            <Stack spacing={3}>
              <Typography variant="h6">Create Custom Design</Typography>
              {selectedTemplate && (
                <Alert severity="info">
                  Creating a design based on: <strong>{selectedTemplate.title}</strong>
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Design Type</InputLabel>
                      <Select
                        value={selectedDesignCategory}
                        label="Design Type"
                        onChange={(e) => setSelectedDesignCategory(e.target.value)}
                      >
                        <MenuItem value="Property Flyer">Property Flyer</MenuItem>
                        <MenuItem value="Social Media Post">Social Media Post</MenuItem>
                        <MenuItem value="Business Card">Business Card</MenuItem>
                        <MenuItem value="Banner">Marketing Banner</MenuItem>
                        <MenuItem value="Brochure">Property Brochure</MenuItem>
                        <MenuItem value="Logo">Company Logo</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Design Title"
                      fullWidth
                      placeholder="e.g., Luxury Apartment Flyer"
                      defaultValue={selectedTemplate?.title || ""}
                    />

                    <TextField
                      label="Design Description"
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Describe what you want to create..."
                      defaultValue={selectedTemplate?.description || ""}
                    />

                    <Stack spacing={2}>
                      <Typography variant="subtitle1">Color Scheme</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField label="Primary Color" type="color" fullWidth defaultValue="#1976d2" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Secondary Color" type="color" fullWidth defaultValue="#ffffff" />
                        </Grid>
                      </Grid>
                    </Stack>

                    <Stack spacing={2}>
                      <Typography variant="subtitle1">Content</Typography>
                      <TextField label="Headline Text" fullWidth placeholder="Property Title or Main Message" />
                      <TextField label="Body Text" fullWidth multiline rows={3} placeholder="Detailed description..." />
                      <TextField label="Contact Information" fullWidth placeholder="Phone, Email, Website" />
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Typography variant="subtitle1">Design Preview</Typography>
                    <Paper
                      sx={{
                        height: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.50',
                        border: '2px dashed',
                        borderColor: 'grey.300'
                      }}
                    >
                      {selectedTemplate ? (
                        <Stack alignItems="center" spacing={2}>
                          <img
                            src={selectedTemplate.thumbnail}
                            alt="Preview"
                            style={{ maxWidth: '200px', maxHeight: '250px', objectFit: 'contain' }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Live preview will update as you customize
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack alignItems="center" spacing={2}>
                          <PaletteRoundedIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                          <Typography variant="body2" color="text.secondary">
                            Design preview will appear here
                          </Typography>
                        </Stack>
                      )}
                    </Paper>

                    <Stack spacing={2}>
                      <Typography variant="subtitle1">Advanced Options</Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="High Resolution Export"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Include QR Code"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Include Logo/Branding"
                      />
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => {
            setOpenDesignDialog(false);
            setSelectedTemplate(null);
            setSelectedDesignCategory("");
          }}>
            Cancel
          </Button>

          {designMode === "browse" ? (
            <Button
              variant="contained"
              disabled={!selectedTemplate}
              onClick={() => setDesignMode("create")}
              startIcon={<EditRoundedIcon />}
            >
              Customize Selected Template
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<VisibilityRoundedIcon />}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={() => {
                  setOpenDesignDialog(false);
                  alert("AI design generation started! Your custom design will be ready in 2-3 minutes. We'll notify you when it's complete.");
                }}
              >
                Generate Design
              </Button>
            </Stack>
          )}
        </DialogActions>
      </Dialog>

      {/* Reward-it Dialog */}
      <Dialog open={openRewardDialog} onClose={() => setOpenRewardDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Reward Program</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Program Name"
              fullWidth
              placeholder="e.g., Tenant Loyalty Program"
              value={rewardFormData.programName}
              onChange={(e) => setRewardFormData({ ...rewardFormData, programName: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              placeholder="Describe your reward program..."
              value={rewardFormData.description}
              onChange={(e) => setRewardFormData({ ...rewardFormData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Program Type</InputLabel>
              <Select
                value={rewardFormData.programType}
                label="Program Type"
                onChange={(e) => setRewardFormData({ ...rewardFormData, programType: e.target.value })}
              >
                <MenuItem value="points">Points-Based</MenuItem>
                <MenuItem value="cashback">Cashback</MenuItem>
                <MenuItem value="tier">Tier System</MenuItem>
                <MenuItem value="referral">Referral Program</MenuItem>
                <MenuItem value="other">Other (Custom)</MenuItem>
              </Select>
            </FormControl>

            {rewardFormData.programType === "other" && (
              <TextField
                label="Custom Program Type Description"
                fullWidth
                required
                value={rewardFormData.customProgramType}
                onChange={(e) => setRewardFormData({ ...rewardFormData, customProgramType: e.target.value })}
                placeholder="Please describe your custom reward program type"
                helperText="Required when 'Other' is selected"
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Points per $1 Spent"
                  type="number"
                  fullWidth
                  value={rewardFormData.pointsPerDollar}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, pointsPerDollar: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Minimum Redemption"
                  type="number"
                  fullWidth
                  value={rewardFormData.minimumRedemption}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, minimumRedemption: e.target.value })}
                />
              </Grid>
            </Grid>
            <FormControlLabel control={<Switch defaultChecked />} label="Auto-enroll existing customers" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRewardDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenRewardDialog(false);
              alert(`Reward program "${rewardFormData.programName}" created successfully!`);
              // Reset form
              setRewardFormData({
                programName: "",
                description: "",
                programType: "",
                customProgramType: "",
                pointsPerDollar: "1",
                minimumRedemption: "100"
              });
            }}
            disabled={!rewardFormData.programName || (rewardFormData.programType === "other" && !rewardFormData.customProgramType)}
          >
            Create Program
          </Button>
        </DialogActions>
      </Dialog>

      {/* Wish-it Dialog */}
      <Dialog open={openWishlistDialog} onClose={() => setOpenWishlistDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 3 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Create Wishlist
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Build and organize your wishlist with multiple items and priorities
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Basic Wishlist Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Wishlist Details
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Wishlist Name"
                  fullWidth
                  placeholder="e.g., Dream Home Features, Office Upgrade Needs"
                  value={wishlistFormData.name}
                  onChange={(e) => setWishlistFormData({...wishlistFormData, name: e.target.value})}
                  variant="outlined"
                  sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe what this wishlist is for and any important details..."
                  value={wishlistFormData.description}
                  onChange={(e) => setWishlistFormData({...wishlistFormData, description: e.target.value})}
                  variant="outlined"
                />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={wishlistFormData.category}
                        label="Category"
                        onChange={(e) => setWishlistFormData({...wishlistFormData, category: e.target.value})}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="property">Property Features</MenuItem>
                        <MenuItem value="office">Office Equipment</MenuItem>
                        <MenuItem value="personal">Personal Items</MenuItem>
                        <MenuItem value="team">Team Goals</MenuItem>
                        <MenuItem value="business">Business Needs</MenuItem>
                        <MenuItem value="technology">Technology</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={wishlistFormData.isPublic}
                            onChange={(e) => setWishlistFormData({...wishlistFormData, isPublic: e.target.checked})}
                          />
                        }
                        label="Make this wishlist public"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={wishlistFormData.allowContributions}
                            onChange={(e) => setWishlistFormData({...wishlistFormData, allowContributions: e.target.checked})}
                          />
                        }
                        label="Allow others to contribute"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Divider />

            {/* Wishlist Items Management */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Wishlist Items ({wishlistItems.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newItem = {
                      id: `item-${Date.now()}`,
                      name: "",
                      description: "",
                      priority: "Medium" as const,
                      completed: false,
                      notes: ""
                    };
                    setWishlistItems([...wishlistItems, newItem]);
                  }}
                  size="small"
                >
                  Add Item
                </Button>
              </Stack>

              <Stack spacing={3}>
                {wishlistItems.map((item, index) => (
                  <Card key={item.id} variant="outlined" sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Item #{index + 1}
                        </Typography>
                        {wishlistItems.length > 1 && (
                          <IconButton
                            onClick={() => {
                              setWishlistItems(wishlistItems.filter(i => i.id !== item.id));
                            }}
                            size="small"
                            color="error"
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          <TextField
                            label="Item Name"
                            fullWidth
                            value={item.name}
                            onChange={(e) => {
                              const updatedItems = wishlistItems.map(i =>
                                i.id === item.id ? {...i, name: e.target.value} : i
                              );
                              setWishlistItems(updatedItems);
                            }}
                            placeholder="e.g., Home Office Desk, Kitchen Island, New Laptop"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel>Priority</InputLabel>
                            <Select
                              value={item.priority}
                              label="Priority"
                              onChange={(e) => {
                                const updatedItems = wishlistItems.map(i =>
                                  i.id === item.id ? {...i, priority: e.target.value as any} : i
                                );
                                setWishlistItems(updatedItems);
                              }}
                            >
                              <MenuItem value="High">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                                  High Priority
                                </Box>
                              </MenuItem>
                              <MenuItem value="Medium">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                  Medium Priority
                                </Box>
                              </MenuItem>
                              <MenuItem value="Low">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                                  Low Priority
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const updatedItems = wishlistItems.map(i =>
                                i.id === item.id ? {...i, description: e.target.value} : i
                              );
                              setWishlistItems(updatedItems);
                            }}
                            placeholder="Describe this item, specifications, or why it's important..."
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Estimated Cost"
                            fullWidth
                            type="number"
                            value={item.estimatedCost || ""}
                            onChange={(e) => {
                              const updatedItems = wishlistItems.map(i =>
                                i.id === item.id ? {...i, estimatedCost: Number(e.target.value) || undefined} : i
                              );
                              setWishlistItems(updatedItems);
                            }}
                            placeholder="0"
                            variant="outlined"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Target Date"
                            fullWidth
                            type="date"
                            value={item.targetDate || ""}
                            onChange={(e) => {
                              const updatedItems = wishlistItems.map(i =>
                                i.id === item.id ? {...i, targetDate: e.target.value} : i
                              );
                              setWishlistItems(updatedItems);
                            }}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Notes"
                            fullWidth
                            multiline
                            rows={2}
                            value={item.notes}
                            onChange={(e) => {
                              const updatedItems = wishlistItems.map(i =>
                                i.id === item.id ? {...i, notes: e.target.value} : i
                              );
                              setWishlistItems(updatedItems);
                            }}
                            placeholder="Additional notes, links, or reminders for this item..."
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              {wishlistItems.length === 0 && (
                <Alert severity="info" sx={{ textAlign: 'center' }}>
                  No items added yet. Click "Add Item" to get started!
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
          <Button
            onClick={() => {
              setOpenWishlistDialog(false);
              // Reset form
              setWishlistFormData({
                name: "",
                description: "",
                category: "",
                isPublic: false,
                allowContributions: false
              });
              setWishlistItems([{
                id: "item-1",
                name: "",
                description: "",
                priority: "Medium",
                completed: false,
                notes: ""
              }]);
            }}
            size="large"
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const validItems = wishlistItems.filter(item => item.name.trim());
              if (wishlistFormData.name.trim() && validItems.length > 0) {
                setOpenWishlistDialog(false);
                alert(`Wishlist "${wishlistFormData.name}" created successfully with ${validItems.length} items!`);
                // Reset form
                setWishlistFormData({
                  name: "",
                  description: "",
                  category: "",
                  isPublic: false,
                  allowContributions: false
                });
                setWishlistItems([{
                  id: "item-1",
                  name: "",
                  description: "",
                  priority: "Medium",
                  completed: false,
                  notes: ""
                }]);
              } else {
                alert("Please provide a wishlist name and at least one item with a name.");
              }
            }}
            size="large"
            sx={{ minWidth: 140, minHeight: 44 }}
            disabled={!wishlistFormData.name.trim() || !wishlistItems.some(item => item.name.trim())}
          >
            Create Wishlist
          </Button>
        </DialogActions>
      </Dialog>

      {/* Build-it Dialog */}
      <Dialog open={openBuildDialog} onClose={() => setOpenBuildDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ pb: 3 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Build Web Asset
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create professional forms, banners, and calculators with rich content tools
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Asset Configuration */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Asset Configuration
              </Typography>
              <Stack spacing={3}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  🚀 Build custom web assets with rich text content, interactive forms, and advanced calculators. No coding required!
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Asset Type</InputLabel>
                      <Select
                        value={buildFormData.assetType}
                        label="Asset Type"
                        onChange={(e) => setBuildFormData({...buildFormData, assetType: e.target.value})}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="landing_page">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'primary.main' }} />
                            <Box>
                              <Typography>Landing Page</Typography>
                              <Typography variant="caption" color="text.secondary">Full-page marketing content</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="form">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'success.main' }} />
                            <Box>
                              <Typography>Contact Form</Typography>
                              <Typography variant="caption" color="text.secondary">Interactive data collection</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="banner">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'warning.main' }} />
                            <Box>
                              <Typography>Marketing Banner</Typography>
                              <Typography variant="caption" color="text.secondary">Eye-catching promotional content</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="calculator">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'info.main' }} />
                            <Box>
                              <Typography>Calculator Tool</Typography>
                              <Typography variant="caption" color="text.secondary">Interactive calculations</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="popup">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'error.main' }} />
                            <Box>
                              <Typography>Popup/Modal</Typography>
                              <Typography variant="caption" color="text.secondary">Overlay content displays</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="widget">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: 'secondary.main' }} />
                            <Box>
                              <Typography>Chat Widget</Typography>
                              <Typography variant="caption" color="text.secondary">Embedded communication tool</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Asset Name"
                      fullWidth
                      placeholder="e.g., Property Inquiry Form, Mortgage Calculator"
                      value={buildFormData.name}
                      onChange={(e) => setBuildFormData({...buildFormData, name: e.target.value})}
                      variant="outlined"
                      sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Describe what this asset will do and its purpose..."
                      value={buildFormData.description}
                      onChange={(e) => setBuildFormData({...buildFormData, description: e.target.value})}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Template Style</InputLabel>
                      <Select
                        value={buildFormData.template}
                        label="Template Style"
                        onChange={(e) => setBuildFormData({...buildFormData, template: e.target.value})}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="modern">Modern Design</MenuItem>
                        <MenuItem value="classic">Classic Layout</MenuItem>
                        <MenuItem value="minimal">Minimal Style</MenuItem>
                        <MenuItem value="professional">Professional</MenuItem>
                        <MenuItem value="creative">Creative & Bold</MenuItem>
                        <MenuItem value="custom">Custom Build</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Color Scheme</InputLabel>
                      <Select
                        value={buildFormData.colorScheme}
                        label="Color Scheme"
                        onChange={(e) => setBuildFormData({...buildFormData, colorScheme: e.target.value})}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="blue">Professional Blue</MenuItem>
                        <MenuItem value="green">Nature Green</MenuItem>
                        <MenuItem value="red">Bold Red</MenuItem>
                        <MenuItem value="purple">Creative Purple</MenuItem>
                        <MenuItem value="orange">Energy Orange</MenuItem>
                        <MenuItem value="dark">Dark Theme</MenuItem>
                        <MenuItem value="custom">Custom Colors</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={buildFormData.analyticsEnabled}
                            onChange={(e) => setBuildFormData({...buildFormData, analyticsEnabled: e.target.checked})}
                          />
                        }
                        label="Analytics tracking"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={buildFormData.mobileResponsive}
                            onChange={(e) => setBuildFormData({...buildFormData, mobileResponsive: e.target.checked})}
                          />
                        }
                        label="Mobile responsive"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            <Divider />

            {/* Rich Content Editor */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Rich Content Editor
              </Typography>
              <Stack spacing={3}>
                <Alert severity="success" variant="outlined">
                  ✨ Use the rich text editor below to create compelling content with formatting, links, images, and more!
                </Alert>
                <RichTextEditor
                  label="Asset Content"
                  value={buildFormData.content}
                  onChange={(value) => setBuildFormData({...buildFormData, content: value})}
                  placeholder="Create your content here. Use rich formatting, add images, links, and style your text to match your brand..."
                  minHeight={300}
                  maxHeight={500}
                />
              </Stack>
            </Box>

            {/* Form Builder (only for form type) */}
            {buildFormData.assetType === 'form' && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Form Fields ({buildFormData.formFields.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newField = {
                          id: `field-${Date.now()}`,
                          type: "text" as const,
                          label: "",
                          placeholder: "",
                          required: false
                        };
                        setBuildFormData({
                          ...buildFormData,
                          formFields: [...buildFormData.formFields, newField]
                        });
                      }}
                      size="small"
                    >
                      Add Field
                    </Button>
                  </Stack>

                  <Stack spacing={3}>
                    {buildFormData.formFields.map((field, index) => (
                      <Card key={field.id} variant="outlined" sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                              <InputLabel>Field Type</InputLabel>
                              <Select
                                value={field.type}
                                label="Field Type"
                                onChange={(e) => {
                                  const updatedFields = buildFormData.formFields.map(f =>
                                    f.id === field.id ? {...f, type: e.target.value as any} : f
                                  );
                                  setBuildFormData({...buildFormData, formFields: updatedFields});
                                }}
                              >
                                <MenuItem value="text">Text Input</MenuItem>
                                <MenuItem value="email">Email</MenuItem>
                                <MenuItem value="phone">Phone</MenuItem>
                                <MenuItem value="textarea">Text Area</MenuItem>
                                <MenuItem value="select">Dropdown</MenuItem>
                                <MenuItem value="checkbox">Checkbox</MenuItem>
                                <MenuItem value="radio">Radio Buttons</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Field Label"
                              value={field.label}
                              onChange={(e) => {
                                const updatedFields = buildFormData.formFields.map(f =>
                                  f.id === field.id ? {...f, label: e.target.value} : f
                                );
                                setBuildFormData({...buildFormData, formFields: updatedFields});
                              }}
                              placeholder="e.g., Full Name, Email Address"
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Placeholder"
                              value={field.placeholder}
                              onChange={(e) => {
                                const updatedFields = buildFormData.formFields.map(f =>
                                  f.id === field.id ? {...f, placeholder: e.target.value} : f
                                );
                                setBuildFormData({...buildFormData, formFields: updatedFields});
                              }}
                              placeholder="Enter placeholder text"
                            />
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={field.required}
                                  onChange={(e) => {
                                    const updatedFields = buildFormData.formFields.map(f =>
                                      f.id === field.id ? {...f, required: e.target.checked} : f
                                    );
                                    setBuildFormData({...buildFormData, formFields: updatedFields});
                                  }}
                                />
                              }
                              label="Required"
                              labelPlacement="top"
                            />
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <IconButton
                              onClick={() => {
                                const updatedFields = buildFormData.formFields.filter(f => f.id !== field.id);
                                setBuildFormData({...buildFormData, formFields: updatedFields});
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}

                    {buildFormData.formFields.length === 0 && (
                      <Alert severity="info" sx={{ textAlign: 'center' }}>
                        No form fields added yet. Click "Add Field" to start building your form!
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </>
            )}

            {/* Calculator Builder (only for calculator type) */}
            {buildFormData.assetType === 'calculator' && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Calculator Configuration
                  </Typography>
                  <Stack spacing={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Calculator Title"
                          value={buildFormData.calculatorConfig.title}
                          onChange={(e) => setBuildFormData({
                            ...buildFormData,
                            calculatorConfig: {...buildFormData.calculatorConfig, title: e.target.value}
                          })}
                          placeholder="e.g., Mortgage Payment Calculator"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Result Label"
                          value={buildFormData.calculatorConfig.resultLabel}
                          onChange={(e) => setBuildFormData({
                            ...buildFormData,
                            calculatorConfig: {...buildFormData.calculatorConfig, resultLabel: e.target.value}
                          })}
                          placeholder="e.g., Monthly Payment, Total Cost"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Calculator Description"
                          value={buildFormData.calculatorConfig.description}
                          onChange={(e) => setBuildFormData({
                            ...buildFormData,
                            calculatorConfig: {...buildFormData.calculatorConfig, description: e.target.value}
                          })}
                          placeholder="Describe what this calculator does and how to use it..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Calculation Formula"
                          value={buildFormData.calculatorConfig.formula}
                          onChange={(e) => setBuildFormData({
                            ...buildFormData,
                            calculatorConfig: {...buildFormData.calculatorConfig, formula: e.target.value}
                          })}
                          placeholder="e.g., (principal * rate) / 12 * months"
                          helperText="Use variable names from your input fields"
                        />
                      </Grid>
                    </Grid>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Input Fields ({buildFormData.calculatorConfig.fields.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newField = {
                            id: `calc-field-${Date.now()}`,
                            label: "",
                            type: "number" as const,
                            variable: "",
                            defaultValue: ""
                          };
                          setBuildFormData({
                            ...buildFormData,
                            calculatorConfig: {
                              ...buildFormData.calculatorConfig,
                              fields: [...buildFormData.calculatorConfig.fields, newField]
                            }
                          });
                        }}
                        size="small"
                      >
                        Add Input Field
                      </Button>
                    </Stack>

                    {buildFormData.calculatorConfig.fields.map((field) => (
                      <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Field Label"
                              value={field.label}
                              onChange={(e) => {
                                const updatedFields = buildFormData.calculatorConfig.fields.map(f =>
                                  f.id === field.id ? {...f, label: e.target.value} : f
                                );
                                setBuildFormData({
                                  ...buildFormData,
                                  calculatorConfig: {...buildFormData.calculatorConfig, fields: updatedFields}
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Type</InputLabel>
                              <Select
                                value={field.type}
                                label="Type"
                                onChange={(e) => {
                                  const updatedFields = buildFormData.calculatorConfig.fields.map(f =>
                                    f.id === field.id ? {...f, type: e.target.value as any} : f
                                  );
                                  setBuildFormData({
                                    ...buildFormData,
                                    calculatorConfig: {...buildFormData.calculatorConfig, fields: updatedFields}
                                  });
                                }}
                              >
                                <MenuItem value="number">Number</MenuItem>
                                <MenuItem value="currency">Currency</MenuItem>
                                <MenuItem value="percentage">Percentage</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Variable Name"
                              value={field.variable}
                              onChange={(e) => {
                                const updatedFields = buildFormData.calculatorConfig.fields.map(f =>
                                  f.id === field.id ? {...f, variable: e.target.value} : f
                                );
                                setBuildFormData({
                                  ...buildFormData,
                                  calculatorConfig: {...buildFormData.calculatorConfig, fields: updatedFields}
                                });
                              }}
                              placeholder="e.g., principal"
                            />
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Default Value"
                              value={field.defaultValue}
                              onChange={(e) => {
                                const updatedFields = buildFormData.calculatorConfig.fields.map(f =>
                                  f.id === field.id ? {...f, defaultValue: e.target.value} : f
                                );
                                setBuildFormData({
                                  ...buildFormData,
                                  calculatorConfig: {...buildFormData.calculatorConfig, fields: updatedFields}
                                });
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <IconButton
                              onClick={() => {
                                const updatedFields = buildFormData.calculatorConfig.fields.filter(f => f.id !== field.id);
                                setBuildFormData({
                                  ...buildFormData,
                                  calculatorConfig: {...buildFormData.calculatorConfig, fields: updatedFields}
                                });
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
          <Button
            onClick={() => {
              setOpenBuildDialog(false);
              // Reset form
              setBuildFormData({
                assetType: "",
                name: "",
                description: "",
                template: "",
                colorScheme: "",
                analyticsEnabled: true,
                mobileResponsive: true,
                content: "<p>Start building your content here...</p>",
                formFields: [],
                calculatorConfig: {
                  title: "",
                  description: "",
                  fields: [],
                  formula: "",
                  resultLabel: "Result"
                }
              });
            }}
            size="large"
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (buildFormData.assetType && buildFormData.name.trim()) {
                setOpenBuildDialog(false);
                let message = `"${buildFormData.name}" (${buildFormData.assetType}) created successfully!`;

                if (buildFormData.assetType === 'form' && buildFormData.formFields.length > 0) {
                  message += ` Form includes ${buildFormData.formFields.length} fields.`;
                }
                if (buildFormData.assetType === 'calculator' && buildFormData.calculatorConfig.fields.length > 0) {
                  message += ` Calculator includes ${buildFormData.calculatorConfig.fields.length} input fields.`;
                }

                alert(message + " Opening asset builder...");

                // Reset form
                setBuildFormData({
                  assetType: "",
                  name: "",
                  description: "",
                  template: "",
                  colorScheme: "",
                  analyticsEnabled: true,
                  mobileResponsive: true,
                  content: "<p>Start building your content here...</p>",
                  formFields: [],
                  calculatorConfig: {
                    title: "",
                    description: "",
                    fields: [],
                    formula: "",
                    resultLabel: "Result"
                  }
                });
              } else {
                alert("Please select an asset type and provide a name.");
              }
            }}
            size="large"
            sx={{ minWidth: 160, minHeight: 44 }}
            disabled={!buildFormData.assetType || !buildFormData.name.trim()}
          >
            Create Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* WordPress Integration Dialog */}
      <Dialog open={openWordPressDialog} onClose={() => setOpenWordPressDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ pb: 3 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Create WordPress Website
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Launch your professional property management website in minutes
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Site Configuration */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Website Configuration
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Website Name"
                    fullWidth
                    value={wordPressFormData.siteName}
                    onChange={(e) => setWordPressFormData({...wordPressFormData, siteName: e.target.value})}
                    placeholder="e.g., Sunset Property Management"
                    variant="outlined"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Domain Name"
                    fullWidth
                    value={wordPressFormData.domain}
                    onChange={(e) => setWordPressFormData({...wordPressFormData, domain: e.target.value})}
                    placeholder="e.g., sunsetproperties.com"
                    variant="outlined"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                    helperText="Choose your custom domain name"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Website Type</InputLabel>
                    <Select
                      value={wordPressFormData.siteType}
                      label="Website Type"
                      onChange={(e) => setWordPressFormData({...wordPressFormData, siteType: e.target.value})}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="Property Showcase">Property Showcase</MenuItem>
                      <MenuItem value="Property Management">Property Management</MenuItem>
                      <MenuItem value="Real Estate Agency">Real Estate Agency</MenuItem>
                      <MenuItem value="Community Portal">Community Portal</MenuItem>
                      <MenuItem value="Maintenance Service">Maintenance Service</MenuItem>
                      <MenuItem value="Custom Solution">Custom Solution</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Hosting Plan</InputLabel>
                    <Select
                      value={wordPressFormData.hostingPlan}
                      label="Hosting Plan"
                      onChange={(e) => setWordPressFormData({...wordPressFormData, hostingPlan: e.target.value})}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="basic">Basic ($19/month) - Up to 10GB storage</MenuItem>
                      <MenuItem value="professional">Professional ($39/month) - Up to 50GB storage</MenuItem>
                      <MenuItem value="enterprise">Enterprise ($79/month) - Unlimited storage</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Features Selection */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Website Features
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(wordPressFormData.features).map(([feature, enabled]) => (
                  <Grid item xs={12} sm={6} md={4} key={feature}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enabled}
                          onChange={(e) => setWordPressFormData({
                            ...wordPressFormData,
                            features: {...wordPressFormData.features, [feature]: e.target.checked}
                          })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {feature === 'seo' ? 'SEO Optimization' : feature.replace(/([A-Z])/g, ' $1')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getFeatureDescription(feature)}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider />

            {/* Business Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Business Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Business Name"
                    fullWidth
                    value={wordPressFormData.customization.businessInfo.name}
                    onChange={(e) => setWordPressFormData({
                      ...wordPressFormData,
                      customization: {
                        ...wordPressFormData.customization,
                        businessInfo: {...wordPressFormData.customization.businessInfo, name: e.target.value}
                      }
                    })}
                    placeholder="Your business name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Business Email"
                    fullWidth
                    type="email"
                    value={wordPressFormData.customization.businessInfo.email}
                    onChange={(e) => setWordPressFormData({
                      ...wordPressFormData,
                      customization: {
                        ...wordPressFormData.customization,
                        businessInfo: {...wordPressFormData.customization.businessInfo, email: e.target.value}
                      }
                    })}
                    placeholder="contact@yourbusiness.com"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Business Phone"
                    fullWidth
                    value={wordPressFormData.customization.businessInfo.phone}
                    onChange={(e) => setWordPressFormData({
                      ...wordPressFormData,
                      customization: {
                        ...wordPressFormData.customization,
                        businessInfo: {...wordPressFormData.customization.businessInfo, phone: e.target.value}
                      }
                    })}
                    placeholder="(555) 123-4567"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Primary Color"
                    type="color"
                    fullWidth
                    value={wordPressFormData.customization.primaryColor}
                    onChange={(e) => setWordPressFormData({
                      ...wordPressFormData,
                      customization: {...wordPressFormData.customization, primaryColor: e.target.value}
                    })}
                    variant="outlined"
                    InputProps={{
                      sx: { height: 56 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Business Address"
                    fullWidth
                    multiline
                    rows={2}
                    value={wordPressFormData.customization.businessInfo.address}
                    onChange={(e) => setWordPressFormData({
                      ...wordPressFormData,
                      customization: {
                        ...wordPressFormData.customization,
                        businessInfo: {...wordPressFormData.customization.businessInfo, address: e.target.value}
                      }
                    })}
                    placeholder="Complete business address"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* WordPress.org Integration Info */}
            <Alert severity="success" variant="outlined">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🌐 WordPress.org Integration Benefits
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  ��� Full control over your website with WordPress.org hosting
                </Typography>
                <Typography variant="body2">
                  ✓ Access to 50,000+ plugins and themes from WordPress repository
                </Typography>
                <Typography variant="body2">
                  ✓ Custom domain setup and SSL certificate included
                </Typography>
                <Typography variant="body2">
                  ✓ Professional email setup (contact@yourdomain.com)
                </Typography>
                <Typography variant="body2">
                  ✓ SEO optimization and Google Analytics integration
                </Typography>
                <Typography variant="body2">
                  ✓ Automatic backups and security monitoring
                </Typography>
              </Stack>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
          <Button
            onClick={() => {
              setOpenWordPressDialog(false);
              // Reset form
              setWordPressFormData({
                siteName: "",
                domain: "",
                siteType: "",
                template: "",
                hostingPlan: "basic",
                features: {
                  blog: true,
                  ecommerce: false,
                  booking: false,
                  gallery: true,
                  contact: true,
                  seo: true,
                  analytics: true,
                  ssl: true
                },
                pages: [],
                customization: {
                  primaryColor: "#1976d2",
                  logoUrl: "",
                  businessInfo: {
                    name: "",
                    address: "",
                    phone: "",
                    email: ""
                  }
                }
              });
            }}
            size="large"
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (wordPressFormData.siteName.trim() && wordPressFormData.domain.trim()) {
                setOpenWordPressDialog(false);
                alert(`WordPress website "${wordPressFormData.siteName}" is being created at ${wordPressFormData.domain}. You'll receive setup instructions via email within 24 hours!`);
                // Reset form
                setWordPressFormData({
                  siteName: "",
                  domain: "",
                  siteType: "",
                  template: "",
                  hostingPlan: "basic",
                  features: {
                    blog: true,
                    ecommerce: false,
                    booking: false,
                    gallery: true,
                    contact: true,
                    seo: true,
                    analytics: true,
                    ssl: true
                  },
                  pages: [],
                  customization: {
                    primaryColor: "#1976d2",
                    logoUrl: "",
                    businessInfo: {
                      name: "",
                      address: "",
                      phone: "",
                      email: ""
                    }
                  }
                });
              } else {
                alert("Please provide a website name and domain.");
              }
            }}
            size="large"
            sx={{ minWidth: 180, minHeight: 44 }}
            disabled={!wordPressFormData.siteName.trim() || !wordPressFormData.domain.trim()}
            startIcon={<PublicIcon />}
          >
            Create WordPress Site
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced QR Code Generator */}
      <QRCodeGenerator
        open={openQRDialog}
        onClose={handleCloseQRDialog}
        qrCodes={qrCodes}
        setQrCodes={updateQRCodes}
        selectedQR={selectedQR}
      />

      {/* QR Analytics Dashboard */}
      {selectedQR && (
        <QRAnalyticsDashboard
          open={openAnalyticsDialog}
          onClose={handleCloseAnalyticsDialog}
          qrCode={selectedQR}
          contactCaptures={contactCaptures}
        />
      )}

      {/* Contest Creation Dialog */}
      <Dialog open={openContestDialog} onClose={() => setOpenContestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Contest</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Contest Title"
              fullWidth
              value={contestFormData.title}
              onChange={(e) => setContestFormData({ ...contestFormData, title: e.target.value })}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={contestFormData.description}
              onChange={(e) => setContestFormData({ ...contestFormData, description: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '12px 14px',
                  lineHeight: 1.5,
                  verticalAlign: 'top',
                  alignItems: 'flex-start'
                },
                '& .MuiInputBase-root': {
                  alignItems: 'flex-start'
                }
              }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Contest Type</InputLabel>
                  <Select
                    value={contestFormData.type}
                    label="Contest Type"
                    onChange={(e) => setContestFormData({ ...contestFormData, type: e.target.value as Contest["type"] })}
                  >
                    <MenuItem value="Photo">Photo Contest</MenuItem>
                    <MenuItem value="Referral">Referral Program</MenuItem>
                    <MenuItem value="Review">Review Contest</MenuItem>
                    <MenuItem value="Social Media">Social Media</MenuItem>
                    <MenuItem value="Video">Video Contest</MenuItem>
                    <MenuItem value="Other">Other (Custom)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={contestFormData.startDate}
                  onChange={(e) => setContestFormData({ ...contestFormData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={contestFormData.endDate}
                  onChange={(e) => setContestFormData({ ...contestFormData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {contestFormData.type === "Other" && (
              <TextField
                label="Custom Contest Type Description"
                fullWidth
                required
                value={contestFormData.customType}
                onChange={(e) => setContestFormData({ ...contestFormData, customType: e.target.value })}
                placeholder="Please describe your custom contest type"
                helperText="Required when 'Other' is selected"
                sx={{
                  mt: 2,
                  '& .MuiInputBase-input': {
                    padding: '12px 14px',
                    lineHeight: 1.5
                  }
                }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateContest}
            disabled={!contestFormData.title || (contestFormData.type === "Other" && !contestFormData.customType)}
          >
            Create Contest
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pool Creation Dialog */}
      <Dialog open={openPoolDialog} onClose={() => setOpenPoolDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Pool</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Pool Title"
              fullWidth
              value={poolFormData.title}
              onChange={(e) => setPoolFormData({ ...poolFormData, title: e.target.value })}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={poolFormData.description}
              onChange={(e) => setPoolFormData({ ...poolFormData, description: e.target.value })}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Pool Type</InputLabel>
                  <Select
                    value={poolFormData.type}
                    label="Pool Type"
                    onChange={(e) => setPoolFormData({ ...poolFormData, type: e.target.value as Pool["type"] })}
                  >
                    <MenuItem value="Survey">Survey</MenuItem>
                    <MenuItem value="Prediction">Prediction</MenuItem>
                    <MenuItem value="Voting">Voting</MenuItem>
                    <MenuItem value="Collection">Collection</MenuItem>
                    <MenuItem value="Knowledge">Knowledge Pool</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Date (Optional)"
                  type="date"
                  fullWidth
                  value={poolFormData.endDate}
                  onChange={(e) => setPoolFormData({ ...poolFormData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {poolFormData.type === 'Other' && (
              <TextField
                fullWidth
                label="Describe the type of pool"
                placeholder="e.g., Community Discussion, Opinion Poll, Feedback Collection"
                value={poolFormData.customTypeDescription}
                onChange={(e) => setPoolFormData({...poolFormData, customTypeDescription: e.target.value})}
                helperText="Please specify what type of pool this is"
                sx={{ mt: 2 }}
              />
            )}

            <Typography variant="h6">Questions</Typography>
            {poolFormData.questions.map((question, index) => (
              <Stack key={index} spacing={2}>
                <TextField
                  label={`Question ${index + 1}`}
                  fullWidth
                  value={question.question}
                  onChange={(e) => {
                    const newQuestions = [...poolFormData.questions];
                    newQuestions[index].question = e.target.value;
                    setPoolFormData({ ...poolFormData, questions: newQuestions });
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={question.type}
                    label="Question Type"
                    onChange={(e) => {
                      const newQuestions = [...poolFormData.questions];
                      newQuestions[index].type = e.target.value as PoolQuestion["type"];
                      setPoolFormData({ ...poolFormData, questions: newQuestions });
                    }}
                  >
                    <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
                    <MenuItem value="Yes/No">Yes/No</MenuItem>
                    <MenuItem value="Text">Text</MenuItem>
                    <MenuItem value="Rating">Rating</MenuItem>
                    <MenuItem value="Number">Number</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            ))}
            
            <Button
              variant="outlined"
              onClick={() => setPoolFormData({
                ...poolFormData,
                questions: [...poolFormData.questions, { question: "", type: "Multiple Choice", options: [""], required: true }]
              })}
            >
              Add Question
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPoolDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreatePool}
            disabled={!poolFormData.title}
          >
            Create Pool
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
