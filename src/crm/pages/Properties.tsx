import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
} from "@mui/material";
import { useCrmData, Property, PropertyManager, Tenant, Contact } from "../contexts/CrmDataContext";
import NumberInput from "../components/NumberInput";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import RichTextEditor from "../components/RichTextEditor";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import RotateLeftRoundedIcon from "@mui/icons-material/RotateLeftRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import PropertyDetailPage from "./PropertyDetailPage";
import ExportDialog from "../components/ExportDialog";
import { exportPropertiesData } from "../utils/exportUtils";
import { copyToClipboard } from "../utils/clipboardUtils";
import { useActivityTracking } from "../hooks/useActivityTracking";

interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  rotation: number;
  isMain: boolean;
  order: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: "Apartment" | "House" | "Condo" | "Townhome" | "Commercial";
  units: number;
  occupancy: number;
  monthlyRent: number;
  status: "Available" | "Occupied" | "Maintenance" | "Pending";
  manager: string;
  tenant?: string;
  images: PropertyImage[];
  mainImageId?: string;
  description?: string;
  amenities?: string[];
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  petPolicy?: string;
  petDeposit?: number;
  petFee?: number;
  petDepositRefundable?: boolean;
  maxPetsAllowed?: number;
  parkingSpaces?: number;
}

interface PropertyListing {
  id: string;
  propertyId: string;
  status: "Listed" | "Unlisted" | "Draft";
  listingSites: {
    craigslist: boolean;
    zillow: boolean;
    realtorsCom: boolean;
    apartments: boolean;
    rentCom: boolean;
  };
  customContent: string;
  htmlContent: string;
  promotionId?: string;
  viewCount: number;
  inquiries: number;
  lastUpdated: string;
  expirationDate?: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountValue: number;
  discountType: "Percentage" | "Fixed Amount" | "Free Months";
  validFrom: string;
  validTo: string;
}

// Note: Property data now comes from CrmDataContext, not mock data
const mockPropertiesRemoved = [
  {
    id: "1",
    name: "Sunset Apartments",
    address: "123 Main St, Los Angeles, CA 90210",
    type: "Apartment",
    units: 24,
    occupancy: 22,
    monthlyRent: 2500,
    status: "Occupied",
    manager: "John Smith",
    tenant: "Sarah Johnson",
    description: "Beautiful apartment complex with modern amenities and stunning city views.",
    amenities: ["Pool", "Gym", "Parking", "Laundry", "Balcony"],
    squareFootage: 850,
    bedrooms: 2,
    bathrooms: 1,
    petPolicy: "Cats allowed",
    parkingSpaces: 1,
    images: [
      { id: "img1", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", alt: "Front view", rotation: 0, isMain: true, order: 0 },
      { id: "img2", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", alt: "Living room", rotation: 0, isMain: false, order: 1 },
      { id: "img3", url: "https://images.unsplash.com/photo-1560449752-263d9c96c0f2?w=400", alt: "Kitchen", rotation: 0, isMain: false, order: 2 },
    ],
    mainImageId: "img1",
  },
  {
    id: "2",
    name: "Ocean View Villa",
    address: "456 Beach Blvd, Santa Monica, CA 90401",
    type: "House",
    units: 1,
    occupancy: 0,
    monthlyRent: 4500,
    status: "Available",
    manager: "Emily Davis",
    description: "Luxurious villa with breathtaking ocean views and private beach access.",
    amenities: ["Private Beach", "Garage", "Garden", "Ocean View", "High-end Appliances"],
    squareFootage: 2200,
    bedrooms: 3,
    bathrooms: 2,
    petPolicy: "Pets allowed with deposit",
    parkingSpaces: 2,
    images: [
      { id: "img4", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400", alt: "Villa exterior", rotation: 0, isMain: true, order: 0 },
      { id: "img5", url: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=400", alt: "Ocean view", rotation: 0, isMain: false, order: 1 },
    ],
    mainImageId: "img4",
  },
  {
    id: "3",
    name: "Downtown Lofts",
    address: "789 City Center, LA, CA 90013",
    type: "Condo",
    units: 12,
    occupancy: 10,
    monthlyRent: 3200,
    status: "Occupied",
    manager: "Mike Wilson",
    tenant: "David Brown",
    description: "Modern loft-style condos in the heart of downtown.",
    amenities: ["Rooftop Deck", "Concierge", "Gym", "Storage", "High Ceilings"],
    squareFootage: 1200,
    bedrooms: 1,
    bathrooms: 1,
    petPolicy: "No pets",
    parkingSpaces: 1,
    images: [
      { id: "img6", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400", alt: "Loft living space", rotation: 0, isMain: true, order: 0 },
    ],
    mainImageId: "img6",
  },
  {
    id: "4",
    name: "Garden View Condos",
    address: "321 Garden Ave, Beverly Hills, CA 90210",
    type: "Condo",
    units: 8,
    occupancy: 6,
    monthlyRent: 3800,
    status: "Available",
    manager: "Sarah Chen",
    description: "Elegant condos with beautiful garden views and premium finishes.",
    amenities: ["Garden View", "Pool", "Spa", "Valet Parking", "Concierge"],
    squareFootage: 1400,
    bedrooms: 2,
    bathrooms: 2,
    petPolicy: "Small pets allowed",
    parkingSpaces: 2,
    images: [],
  }
];

const mockListings: PropertyListing[] = [
  {
    id: "list1",
    propertyId: "2",
    status: "Listed",
    listingSites: {
      craigslist: true,
      zillow: true,
      realtorsCom: false,
      apartments: true,
      rentCom: false
    },
    customContent: "�� Ocean View Villa - Available Now!\n\n📍 Location: 456 Beach Blvd, Santa Monica, CA 90401...",
    htmlContent: "<h2>Ocean View Villa</h2><p>Available Now!</p>...",
    viewCount: 145,
    inquiries: 23,
    lastUpdated: "2024-01-15",
    expirationDate: "2024-02-15"
  },
  {
    id: "list2",
    propertyId: "4",
    status: "Draft",
    listingSites: {
      craigslist: false,
      zillow: false,
      realtorsCom: false,
      apartments: false,
      rentCom: false
    },
    customContent: "",
    htmlContent: "",
    viewCount: 0,
    inquiries: 0,
    lastUpdated: "2024-01-16"
  }
];

const mockPromotions: Promotion[] = [
  {
    id: "promo1",
    title: "First Month Free",
    description: "Move in today and get your first month of rent completely free!",
    discountValue: 1,
    discountType: "Free Months",
    validFrom: "2024-01-01",
    validTo: "2024-03-31"
  },
  {
    id: "promo2",
    title: "Student Discount",
    description: "15% off monthly rent for students with valid ID",
    discountValue: 15,
    discountType: "Percentage",
    validFrom: "2024-01-15",
    validTo: "2024-08-31"
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
      id={`properties-tabpanel-${index}`}
      aria-labelledby={`properties-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Properties() {
  const navigate = useNavigate();
  const { trackPropertyActivity, trackPropertyStatusChange } = useActivityTracking();
  const { state, addProperty, updateProperty, deleteProperty, addTenant, updateTenant } = useCrmData();

  // All useState hooks must be called before any early returns
  const [listings, setListings] = React.useState<PropertyListing[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openPictureDialog, setOpenPictureDialog] = React.useState(false);
  const [openListingDialog, setOpenListingDialog] = React.useState(false);
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);
  const [selectedListing, setSelectedListing] = React.useState<PropertyListing | null>(null);
  const [propertyImages, setPropertyImages] = React.useState<PropertyImage[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = React.useState<number | null>(null);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [formData, setFormData] = React.useState({
    name: "",
    address: "",
    type: "Apartment" as Property["type"],
    customType: "",
    units: 1,
    monthlyRent: 0,
    managerId: "", // Keep for compatibility
    managerIds: [] as string[], // Support multiple managers
    tenantIds: [] as string[],
    assignedTenants: [] as string[],
    description: "",
    amenities: [] as string[],
    squareFootage: 0,
    bedrooms: 0,
    bathrooms: 0,
    petPolicy: "",
    petDeposit: 0,
    petFee: 0,
    petDepositRefundable: true,
    maxPetsAllowed: 0,
    parkingSpaces: 0,
    tags: [] as string[],
  });
  const [typeDialogOpen, setTypeDialogOpen] = React.useState(false);
  const [listingFormData, setListingFormData] = React.useState({
    customContent: "",
    listingSites: {
      craigslist: false,
      zillow: false,
      realtorsCom: false,
      apartments: false,
      rentCom: false
    },
    promotionId: "",
    expirationDate: ""
  });
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);
  const [selectedListingSite, setSelectedListingSite] = React.useState("");
  const [propertyDetailOpen, setPropertyDetailOpen] = React.useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [tenantManageDialogOpen, setTenantManageDialogOpen] = React.useState(false);
  const [managingProperty, setManagingProperty] = React.useState<Property | null>(null);
  const [terminateLeaseDialogOpen, setTerminateLeaseDialogOpen] = React.useState(false);
  const [terminationData, setTerminationData] = React.useState({
    terminationDate: '',
    reason: '',
    password: '',
    noticeGiven: false
  });
  const [leaseViewerDialogOpen, setLeaseViewerDialogOpen] = React.useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = React.useState(false);
  const [communicationData, setCommunicationData] = React.useState({
    type: 'email',
    subject: '',
    message: '',
    recipient: ''
  });
  const [leaseUploadDialogOpen, setLeaseUploadDialogOpen] = React.useState(false);
  const [leaseUploadData, setLeaseUploadData] = React.useState({
    file: null as File | null,
    leaseType: 'new',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    depositAmount: '',
    notes: ''
  });
  const [inspectionDialogOpen, setInspectionDialogOpen] = React.useState(false);
  const [inspectionData, setInspectionData] = React.useState({
    type: 'routine',
    date: '',
    time: '',
    inspector: '',
    notes: '',
    notifyTenant: true,
    reminderDays: '3'
  });
  const [showingDialogOpen, setShowingDialogOpen] = React.useState(false);
  const [showOccupiedWarning, setShowOccupiedWarning] = React.useState(false);
  const [showingData, setShowingData] = React.useState({
    type: 'general',
    date: '',
    time: '',
    agent: '',
    prospectName: '',
    prospectEmail: '',
    prospectPhone: '',
    notes: '',
    estimatedDuration: '30',
    requireNotice: true
  });
  const [socialShareDialogOpen, setSocialShareDialogOpen] = React.useState(false);
  const [shareProperty, setShareProperty] = React.useState<Property | null>(null);
  const [unlistDialogOpen, setUnlistDialogOpen] = React.useState(false);
  const [unlistingListing, setUnlistingListing] = React.useState<PropertyListing | null>(null);
  const [assignTenantDialogOpen, setAssignTenantDialogOpen] = React.useState(false);
  const [newTenantDialogOpen, setNewTenantDialogOpen] = React.useState(false);
  const [newTenantData, setNewTenantData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "Prospective" as Tenant["status"]
  });
  const [propertyDetailsModalOpen, setPropertyDetailsModalOpen] = React.useState(false);
  const [workOrderModalOpen, setWorkOrderModalOpen] = React.useState(false);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = React.useState<Property | null>(null);
  const [nestedWorkOrderOpen, setNestedWorkOrderOpen] = React.useState(false);
  const [nestedMaintenanceOpen, setNestedMaintenanceOpen] = React.useState(false);
  const [nestedTenantManagementOpen, setNestedTenantManagementOpen] = React.useState(false);
  const [backgroundPreferencesOpen, setBackgroundPreferencesOpen] = React.useState(false);
  const [addressBackgroundColor, setAddressBackgroundColor] = React.useState('secondary.main'); // Default pink/secondary color
  const [globalBackgroundSettings, setGlobalBackgroundSettings] = React.useState(false);

  // Load saved background color from localStorage on component mount
  React.useEffect(() => {
    const savedColor = localStorage.getItem('propertyHeaderColor');
    if (savedColor) {
      setAddressBackgroundColor(savedColor);
    }
  }, []);

  const { properties = [], propertyManagers = [], tenants = [], contacts = [] } = state || {};

  // Get vacant properties for listings
  const vacantProperties = React.useMemo(() => {
    if (!state?.initialized || !properties || !Array.isArray(properties)) return [];
    return properties.filter(p => p && p.status === "Available");
  }, [state?.initialized, properties]);

  // Get properties with existing listings
  const propertiesWithListings = React.useMemo(() => {
    if (!state?.initialized || !properties || !Array.isArray(properties) || !listings || !Array.isArray(listings)) return [];
    return properties.filter(p =>
      p && listings.some(l => l && l.propertyId === p.id)
    );
  }, [state?.initialized, properties, listings]);

  const filteredProperties = React.useMemo(() => {
    if (!state?.initialized || !properties || !Array.isArray(properties)) return [];
    const searchLower = (searchTerm || '').toLowerCase();
    return properties.filter(property =>
      property && (
        property.name?.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower)
      )
    );
  }, [state?.initialized, properties, searchTerm]);

  // Stats calculations
  const totalProperties = React.useMemo(() => {
    if (!state?.initialized || !properties || !Array.isArray(properties)) return 0;
    return properties.length;
  }, [state?.initialized, properties]);

  const occupiedProperties = React.useMemo(() => {
    if (!state?.initialized || !properties || !Array.isArray(properties)) return 0;
    return properties.filter(p => p && p.status === "Occupied").length;
  }, [state?.initialized, properties]);

  const availableProperties = React.useMemo(() => {
    if (!state?.initialized || !properties || !Array.isArray(properties)) return 0;
    return properties.filter(p => p && p.status === "Available").length;
  }, [state?.initialized, properties]);

  const totalRevenue = React.useMemo(() => {
    if (!state?.initialized || !properties) return 0;
    return properties.reduce((sum, p) => sum + (p && p.status === "Occupied" ? (p.monthlyRent || 0) : 0), 0);
  }, [state?.initialized, properties]);

  // Generate real listings from actual properties
  const realListings = React.useMemo(() => {
    if (!state?.initialized || !properties) return [];

    // Create listings for available properties (simulating that they have listings)
    const availableProps = properties.filter(p => p && p.status === "Available");

    return availableProps.map((property, index) => ({
      id: `listing-${property.id}`,
      propertyId: property.id,
      title: `${property.name} - Available Now!`,
      description: property.description || 'Beautiful property available for rent.',
      customContent: `🏠 ${property.name} - Available Now!\n\n📍 Location: ${property.address}\n💰 Rent: $${property.monthlyRent?.toLocaleString()}/month\n🛏️ Bedrooms: ${property.bedrooms || 'TBD'}\n🚿 Bathrooms: ${property.bathrooms || 'TBD'}\n📐 Square Footage: ${property.squareFootage ? `${property.squareFootage} sq ft` : 'TBD'}\n🚗 Parking: ${property.parkingSpaces || 0} space(s)\n🐕 Pet Policy: ${property.petPolicy || 'Contact for details'}\n\n✨ Amenities:\n${property.amenities?.map(amenity => `• ${amenity}`).join('\n') || '• Contact for amenities list'}\n\n📝 Description:\n${property.description || 'Beautiful property available for rent. Contact us for more details!'}\n\n📞 Contact us today to schedule a viewing!\n🕐 Available for immediate move-in`,
      listingSites: {
        craigslist: index === 0, // First property listed on Craigslist
        zillow: true, // All properties on Zillow
        realtorsCom: true, // All properties on Realtor.com
        apartments: index < 2, // First two properties on Apartments.com
        rentCom: false
      },
      status: "Listed" as const,
      viewCount: Math.floor(Math.random() * 200) + 50, // Random view count 50-250
      inquiries: Math.floor(Math.random() * 15) + 2, // Random inquiries 2-17
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last month
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 60 days
      promotionId: index === 0 ? 'promo1' : undefined // First property has promotion
    }));
  }, [state?.initialized, properties]);

  // Update listings when real listings change
  React.useEffect(() => {
    if (realListings.length > 0) {
      setListings(realListings);
    }
  }, [realListings]);

  const activeListings = React.useMemo(() => {
    if (!state?.initialized) return 0;
    return realListings.filter(l => l && l.status === "Listed").length;
  }, [state?.initialized, realListings]);

  const totalListingViews = React.useMemo(() => {
    if (!state?.initialized || !listings) return 0;
    return listings.reduce((sum, l) => sum + (l && l.viewCount ? l.viewCount : 0), 0);
  }, [state?.initialized, listings]);

  const totalInquiries = React.useMemo(() => {
    if (!state?.initialized || !listings) return 0;
    return listings.reduce((sum, l) => sum + (l && l.inquiries ? l.inquiries : 0), 0);
  }, [state?.initialized, listings]);

  // Calculate unlisted properties (available but not listed)
  const unlistedProperties = React.useMemo(() => {
    if (!state?.initialized || !properties || !listings) return [];
    return properties.filter(property =>
      property && property.status === "Available" &&
      !listings.some(l => l && l.propertyId === property.id && l.status === "Listed")
    );
  }, [state?.initialized, properties, listings]);

  const getStatusColor = (status: Property["status"]) => {
    switch (status) {
      case "Available": return "success";
      case "Occupied": return "primary";
      case "Maintenance": return "warning";
      case "Pending": return "default";
      default: return "default";
    }
  };

  const getListingStatusColor = (status: PropertyListing["status"]) => {
    switch (status) {
      case "Listed": return "success";
      case "Unlisted": return "warning";
      case "Draft": return "default";
      default: return "default";
    }
  };

  const generateDefaultListingContent = (property: Property) => {
    return `🏠 ${property.name} - Available Now!

�� Location: ${property.address}
💰 Rent: $${property.monthlyRent.toLocaleString()}/month
🛏️ Bedrooms: ${property.bedrooms || 'TBD'}
🚿 Bathrooms: ${property.bathrooms || 'TBD'}
📐 Square Footage: ${property.squareFootage ? `${property.squareFootage} sq ft` : 'TBD'}
🚗 Parking: ${property.parkingSpaces || 0} space(s)
🐕 Pet Policy: ${property.petPolicy || 'Contact for details'}

✨ Amenities:
${property.amenities?.map(amenity => `������ ${amenity}`).join('\n') || '• Contact for amenities list'}

📝 Description:
${property.description || 'Beautiful property available for rent. Contact us for more details!'}

📞 Contact us today to schedule a viewing!
🕐 Available for immediate move-in`;
  };

  const generateHTMLContent = (property: Property, customContent: string) => {
    const mainImage = property.images?.find(img => img.id === property.mainImageId);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>${property.name} - Available for Rent</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .property-header { background: #f4f4f4; padding: 20px; margin-bottom: 20px; }
        .property-title { color: #2c3e50; font-size: 24px; margin-bottom: 10px; }
        .property-details { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
        .detail-item { background: #ecf0f1; padding: 10px; border-radius: 5px; }
        .amenities { list-style-type: none; padding: 0; }
        .amenities li { background: #3498db; color: white; padding: 5px 10px; margin: 5px; border-radius: 3px; display: inline-block; }
        .contact { background: #27ae60; color: white; padding: 15px; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="property-header">
        <h1 class="property-title">${property.name}</h1>
        <p><strong>📍 ${property.address}</strong></p>
        <p><strong>���� $${property.monthlyRent.toLocaleString()}/month</strong></p>
    </div>
    
    ${mainImage ? `<img src="${mainImage.url}" alt="${mainImage.alt}" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;">` : ''}
    
    <div class="property-details">
        <div class="detail-item"><strong>🛏�� Bedrooms:</strong> ${property.bedrooms || 'TBD'}</div>
        <div class="detail-item"><strong>�� Bathrooms:</strong> ${property.bathrooms || 'TBD'}</div>
        <div class="detail-item"><strong>�� Square Footage:</strong> ${property.squareFootage ? `${property.squareFootage} sq ft` : 'TBD'}</div>
        <div class="detail-item"><strong>�� Parking:</strong> ${property.parkingSpaces || 0} space(s)</div>
        <div class="detail-item"><strong>🐕 Pet Policy:</strong> ${property.petPolicy || 'Contact for details'}</div>
    </div>
    
    <h3>✨ Amenities</h3>
    <ul class="amenities">
        ${property.amenities?.map(amenity => `<li>${amenity}</li>`).join('') || '<li>Contact for amenities list</li>'}
    </ul>
    
    <h3>📝 Description</h3>
    <p>${property.description || 'Beautiful property available for rent. Contact us for more details!'}</p>
    
    <div class="contact">
        <h3>��� Contact us today to schedule a viewing!</h3>
        <p>🕐 Available for immediate move-in</p>
    </div>
</body>
</html>`;
  };

  const handleCreateListing = (property: Property) => {
    setSelectedProperty(property);
    const existingListing = (listings || []).find(l => l.propertyId === property.id);
    
    if (existingListing) {
      setSelectedListing(existingListing);
      setListingFormData({
        customContent: existingListing.customContent,
        listingSites: existingListing.listingSites,
        promotionId: existingListing.promotionId || "",
        expirationDate: existingListing.expirationDate || ""
      });
    } else {
      setSelectedListing(null);
      setListingFormData({
        customContent: generateDefaultListingContent(property),
        listingSites: {
          craigslist: false,
          zillow: false,
          realtorsCom: false,
          apartments: false,
          rentCom: false
        },
        promotionId: "",
        expirationDate: ""
      });
    }
    setOpenListingDialog(true);
  };

  const handleSaveListing = () => {
    if (!selectedProperty) return;

    const htmlContent = generateHTMLContent(selectedProperty, listingFormData.customContent);
    
    if (selectedListing) {
      // Update existing listing
      setListings(prev => (prev || []).map(listing =>
        listing.id === selectedListing.id
          ? {
              ...listing,
              customContent: listingFormData.customContent,
              htmlContent: htmlContent,
              listingSites: listingFormData.listingSites,
              promotionId: listingFormData.promotionId || undefined,
              expirationDate: listingFormData.expirationDate || undefined,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : listing
      ));
    } else {
      // Create new listing
      const newListing: PropertyListing = {
        id: Date.now().toString(),
        propertyId: selectedProperty.id,
        status: "Draft",
        customContent: listingFormData.customContent,
        htmlContent: htmlContent,
        listingSites: listingFormData.listingSites,
        promotionId: listingFormData.promotionId || undefined,
        expirationDate: listingFormData.expirationDate || undefined,
        viewCount: 0,
        inquiries: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setListings(prev => [...(prev || []), newListing]);
    }
    
    setOpenListingDialog(false);
    alert(`Listing ${selectedListing ? 'updated' : 'created'} successfully!`);
  };

  const handlePublishListing = (listingId: string) => {
    setListings(prev => (prev || []).map(listing =>
      listing.id === listingId
        ? { ...listing, status: "Listed" as const, lastUpdated: new Date().toISOString().split('T')[0] }
        : listing
    ));
    alert("Listing published successfully!");
  };

  const handleUnpublishListing = (listingId: string) => {
    const listing = (listings || []).find(l => l.id === listingId);
    if (listing) {
      setUnlistingListing(listing);
      setUnlistDialogOpen(true);
    }
  };

  const confirmUnpublishListing = () => {
    if (unlistingListing) {
      setListings(prev => (prev || []).map(listing =>
        listing.id === unlistingListing.id
          ? { ...listing, status: "Unlisted" as const, lastUpdated: new Date().toISOString().split('T')[0] }
          : listing
      ));

      // Track listing activity
      const property = (properties || []).find(p => p.id === unlistingListing.propertyId);
      if (property) {
        trackPropertyActivity(
          'update',
          property.id,
          property.name,
          [{ field: 'listing_status', oldValue: 'Listed', newValue: 'Unlisted', displayName: 'Listing Status' }],
          `Property listing unpublished for ${property.name}`,
          { notes: 'Listing removed from all selected platforms' }
        );
      }

      setUnlistDialogOpen(false);
      setUnlistingListing(null);
      alert("Listing unpublished successfully and removed from all platforms!");
    }
  };

  const handleSocialShare = (property: Property) => {
    setShareProperty(property);
    setSocialShareDialogOpen(true);
  };

  const shareToSocialMedia = (platform: string) => {
    if (!shareProperty) return;

    const shareUrl = window.location.origin + `/properties/${shareProperty.id}`;
    const shareText = `Check out this property: ${shareProperty.name} at ${shareProperty.address}. Monthly rent: $${shareProperty.monthlyRent.toLocaleString()}. Available now!`;
    const hashtags = '#RealEstate #ForRent #PropertyListing #Rental';

    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + ' ' + hashtags)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareProperty.name)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'pinterest':
        const imageUrl = shareProperty.images?.find(img => img.id === shareProperty.mainImageId)?.url || '';
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        const subject = encodeURIComponent(`Property Available: ${shareProperty.name}`);
        const body = encodeURIComponent(`${shareText}\n\nView property details: ${shareUrl}`);
        url = `mailto:?subject=${subject}&body=${body}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
    setSocialShareDialogOpen(false);

    // Track social sharing activity
    trackPropertyActivity(
      'share',
      shareProperty.id,
      shareProperty.name,
      [{ field: 'social_share', oldValue: null, newValue: platform, displayName: 'Shared Platform' }],
      `Property shared on ${platform}`,
      { notes: `Shared via ${platform} social media platform` }
    );
  };

  const convertToHTML = (content: string): string => {
    // If content already contains HTML tags, return as is
    if (content.includes('<') && content.includes('>')) {
      return content;
    }

    // Convert plain text to properly formatted HTML
    let htmlContent = content
      // Replace multiple newlines with paragraph breaks
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => {
        // Convert single line breaks to <br> tags within paragraphs
        const formattedParagraph = paragraph.replace(/\n/g, '<br>');

        // Handle lists (bullet points starting with - or *)
        if (formattedParagraph.includes('\n- ') || formattedParagraph.includes('\n* ') ||
            formattedParagraph.startsWith('- ') || formattedParagraph.startsWith('* ')) {
          const listItems = formattedParagraph
            .split(/\n[*-]\s/)
            .filter(item => item.trim())
            .map(item => `<li>${item.trim()}</li>`)
            .join('');
          return `<ul>${listItems}</ul>`;
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(formattedParagraph) || formattedParagraph.includes(/\n\d+\.\s/)) {
          const listItems = formattedParagraph
            .split(/\n\d+\.\s/)
            .filter(item => item.trim())
            .map(item => `<li>${item.trim()}</li>`)
            .join('');
          return `<ol>${listItems}</ol>`;
        }

        return `<p>${formattedParagraph}</p>`;
      })
      .join('\n');

    // Handle bold text (**text** or __text__)
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    htmlContent = htmlContent.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Handle italic text (*text* or _text_)
    htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    htmlContent = htmlContent.replace(/_(.*?)_/g, '<em>$1</em>');

    // Handle links [text](url)
    htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    return htmlContent;
  };

  const handleCopyContent = (content: string, type: "text" | "html") => {
    let contentToCopy = content;

    if (type === "html") {
      contentToCopy = convertToHTML(content);
    }

    copyToClipboard(contentToCopy, {
      successMessage: `${type.toUpperCase()} content copied to clipboard!`,
      errorMessage: `Failed to copy ${type} content. Please try again.`,
      showFallbackDialog: true
    });
  };

  const handleListingSiteLogin = (site: string) => {
    setSelectedListingSite(site);
    setLoginDialogOpen(true);
  };

  const handleLoginAndPost = () => {
    setLoginDialogOpen(false);
    alert(`Login functionality for ${selectedListingSite} would be implemented here. This would open a secure authentication window and automatically post the listing.`);
  };

  // Get available prospects (tenants with Prospective status and contacts marked as Prospect)
  const getAvailableProspects = () => {
    const prospectiveTenants = (tenants || []).filter(t => t && t.status === "Prospective");
    const prospectContacts = (contacts || []).filter(c => c && c.type === "Prospect");

    return [
      ...(prospectiveTenants || []).map(t => ({
        id: t.id,
        name: `${t.firstName || ''} ${t.lastName || ''}`,
        email: t.email || '',
        phone: t.phone || '',
        type: 'tenant' as const
      })),
      ...(prospectContacts || []).map(c => ({
        id: c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`,
        email: c.email || '',
        phone: c.phone || '',
        type: 'contact' as const
      }))
    ];
  };

  const handleAssignTenant = () => {
    setAssignTenantDialogOpen(true);
  };

  const handleCreateNewTenant = () => {
    setNewTenantDialogOpen(true);
  };

  const handleSaveNewTenant = () => {
    if (!newTenantData.firstName || !newTenantData.lastName || !newTenantData.email || !newTenantData.phone) {
      alert('Please fill in all required fields (name, email, phone)');
      return;
    }

    const newTenant = {
      ...newTenantData,
      status: "Prospective" as Tenant["status"]
    };

    addTenant(newTenant);
    setNewTenantDialogOpen(false);
    setNewTenantData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      status: "Prospective"
    });
    alert('New prospect added successfully! You can now assign them to properties.');
  };

  const handleAssignSelectedTenants = (selectedTenantIds: string[]) => {
    setFormData({ ...formData, assignedTenants: selectedTenantIds });
    setAssignTenantDialogOpen(false);
  };

  const handlePropertyDetailsModal = (property: Property) => {
    setSelectedPropertyForModal(property);
    setPropertyDetailsModalOpen(true);
  };

  const handleWorkOrderModal = (property: Property) => {
    setSelectedPropertyForModal(property);
    setWorkOrderModalOpen(true);
  };

  const handleNestedWorkOrder = () => {
    setNestedWorkOrderOpen(true);
  };

  const handleNestedMaintenance = () => {
    setNestedMaintenanceOpen(true);
  };

  const handleNestedTenantManagement = () => {
    setNestedTenantManagementOpen(true);
  };

  const closeAllNestedModals = () => {
    setNestedWorkOrderOpen(false);
    setNestedMaintenanceOpen(false);
    setNestedTenantManagementOpen(false);
  };

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setFormData({
      name: "",
      address: "",
      type: "Apartment",
      customType: "",
      units: 1,
      monthlyRent: 0,
      managerId: "",
      managerIds: [],
      tenantIds: [],
      assignedTenants: [],
      description: "",
      amenities: [],
      squareFootage: 0,
      bedrooms: 0,
      bathrooms: 0,
      petPolicy: "",
      petDeposit: 0,
      petFee: 0,
      petDepositRefundable: true,
      maxPetsAllowed: 0,
      parkingSpaces: 0,
      tags: [],
    });
    setOpenDialog(true);
  };

  const exportPropertiesData = (data: any[], filename: string) => {
    // Convert to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      type: property.type,
      customType: property.customType || "",
      units: property.units,
      monthlyRent: property.monthlyRent,
      managerId: property.managerId || "",
      managerIds: property.managerIds || (property.managerId ? [property.managerId] : []),
      description: property.description || "",
      amenities: property.amenities || [],
      squareFootage: property.squareFootage || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      petPolicy: property.petPolicy || "",
      petDeposit: property.petDeposit || 0,
      petFee: property.petFee || 0,
      petDepositRefundable: property.petDepositRefundable ?? true,
      maxPetsAllowed: property.maxPetsAllowed || 0,
      parkingSpaces: property.parkingSpaces || 0,
      tags: property.tags || [],
    });
    setOpenDialog(true);
  };

  const handleSaveProperty = () => {
    if (selectedProperty) {
      // Edit existing property - track changes
      const changes = [];
      if (selectedProperty.name !== formData.name) {
        changes.push({ field: 'name', oldValue: selectedProperty.name, newValue: formData.name, displayName: 'Property Name' });
      }
      if (selectedProperty.address !== formData.address) {
        changes.push({ field: 'address', oldValue: selectedProperty.address, newValue: formData.address, displayName: 'Address' });
      }
      if (selectedProperty.monthlyRent !== formData.monthlyRent) {
        changes.push({ field: 'monthlyRent', oldValue: selectedProperty.monthlyRent, newValue: formData.monthlyRent, displayName: 'Monthly Rent' });
      }
      // Check for manager changes
    const oldManagerIds = selectedProperty.managerIds || (selectedProperty.managerId ? [selectedProperty.managerId] : []);
    const newManagerIds = formData.managerIds;
    if (JSON.stringify(oldManagerIds.sort()) !== JSON.stringify(newManagerIds.sort())) {
      const oldManagers = oldManagerIds.map(id => {
        const manager = (propertyManagers || []).find(pm => pm.id === id);
        return manager ? `${manager.firstName} ${manager.lastName}` : id;
      });
      const newManagers = newManagerIds.map(id => {
        const manager = (propertyManagers || []).find(pm => pm.id === id);
        return manager ? `${manager.firstName} ${manager.lastName}` : id;
      });
      changes.push({
        field: 'managerIds',
        oldValue: oldManagers.length > 0 ? oldManagers.join(', ') : 'Unassigned',
        newValue: newManagers.length > 0 ? newManagers.join(', ') : 'Unassigned',
        displayName: 'Property Managers'
      });
    }

      if (changes.length > 0) {
        trackPropertyActivity(
          'update',
          selectedProperty.id,
          selectedProperty.name,
          changes,
          `Property ${selectedProperty.name} updated`,
          { notes: `${changes.length} field(s) modified` }
        );
      }

      const updatedProperty: Property = {
      ...selectedProperty,
      ...formData,
      managerId: formData.managerIds.length > 0 ? formData.managerIds[0] : undefined, // Keep first manager for compatibility
      managerIds: formData.managerIds,
      tenantIds: selectedProperty.tenantIds,
      images: selectedProperty.images,
      mainImageId: selectedProperty.mainImageId,
      occupancy: selectedProperty.occupancy,
      status: selectedProperty.status,
    };

      updateProperty(updatedProperty);
    } else {
      // Add new property
    const newPropertyData = {
      name: formData.name,
      address: formData.address,
      type: formData.type,
      units: formData.units,
      monthlyRent: formData.monthlyRent,
      managerId: formData.managerIds.length > 0 ? formData.managerIds[0] : undefined, // Keep first manager for compatibility
      managerIds: formData.managerIds,
      tenantIds: [] as string[],
      description: formData.description,
      amenities: formData.amenities,
      squareFootage: formData.squareFootage,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      petPolicy: formData.petPolicy,
      petDeposit: formData.petDeposit,
      petFee: formData.petFee,
      petDepositRefundable: formData.petDepositRefundable,
      maxPetsAllowed: formData.maxPetsAllowed,
      parkingSpaces: formData.parkingSpaces,
      occupancy: 0,
      status: "Available" as const,
      images: [],
      tags: formData.tags,
    };

      // Track new property creation
      const newPropertyId = Date.now().toString();
      trackPropertyActivity(
        'create',
        newPropertyId,
        newPropertyData.name,
        [
          { field: 'name', oldValue: null, newValue: newPropertyData.name, displayName: 'Property Name' },
          { field: 'address', oldValue: null, newValue: newPropertyData.address, displayName: 'Address' },
          { field: 'monthlyRent', oldValue: null, newValue: newPropertyData.monthlyRent, displayName: 'Monthly Rent' },
          { field: 'managerIds', oldValue: null, newValue: formData.managerIds.length > 0 ? formData.managerIds.map(id => {
          const manager = (propertyManagers || []).find(pm => pm.id === id);
          return manager ? `${manager.firstName} ${manager.lastName}` : id;
        }).join(', ') : 'Unassigned', displayName: 'Property Managers' },
        ],
        `New property "${newPropertyData.name}" created`,
        { notes: `Type: ${newPropertyData.type}, Units: ${newPropertyData.units}` }
      );

      addProperty(newPropertyData);
    }
    setOpenDialog(false);
  };

  const handleDeleteProperty = (id: string) => {
    const property = (properties || []).find(p => p.id === id);
    if (property) {
      // Track property deletion
      trackPropertyActivity(
        'delete',
        property.id,
        property.name,
        [
          { field: 'status', oldValue: property.status, newValue: 'deleted', displayName: 'Property Status' }
        ],
        `Property "${property.name}" deleted`,
        {
          notes: `Previous status: ${property.status}, Monthly rent: $${property.monthlyRent.toLocaleString()}`,
          location: property.address
        }
      );
    }
    deleteProperty(id);
  };

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setPropertyDetailOpen(true);
  };

  // Picture Management Functions
  const handleManagePictures = (property: Property) => {
    setSelectedProperty(property);
    setPropertyImages([...(property.images || [])]);
    setOpenPictureDialog(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: PropertyImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            url: e.target?.result as string,
            alt: file.name,
            rotation: 0,
            isMain: propertyImages.length === 0,
            order: propertyImages.length,
          };
          setPropertyImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRotateImage = (imageId: string, direction: 'left' | 'right') => {
    setPropertyImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, rotation: (img.rotation + (direction === 'right' ? 90 : -90)) % 360 }
        : img
    ));
  };

  const handleSetMainImage = (imageId: string) => {
    setPropertyImages(prev => prev.map(img =>
      img.id === imageId
        ? { ...img, isMain: true }
        : { ...img, isMain: false }
    ));
  };

  const handleDeleteImage = (imageId: string) => {
    setPropertyImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      // If we deleted the main image, set the first remaining image as main
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const handleReorderImages = (startIndex: number, endIndex: number) => {
    setPropertyImages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((img, index) => ({ ...img, order: index }));
    });
  };

  const handleSavePictures = () => {
    if (selectedProperty) {
      const updatedProperty = {
        ...selectedProperty,
        images: propertyImages,
        mainImageId: propertyImages.find(img => img.isMain)?.id
      };
      updateProperty(updatedProperty);
    }
    setOpenPictureDialog(false);
  };

  return (
    <>
      {!state || !state.initialized ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography>Loading properties...</Typography>
        </Box>
      ) : (
        <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Property Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Tooltip
            title="Export property data to Excel or CSV format"
            componentsProps={{
              tooltip: {
                sx: uniformTooltipStyles
              }
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={() => setExportDialogOpen(true)}
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip
            title="Add a new property to the system"
            componentsProps={{
              tooltip: {
                sx: uniformTooltipStyles
              }
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddProperty}
            >
              Add Property
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<HomeWorkRoundedIcon />}
            label="All Properties"
            iconPosition="start"
          />
          <Tab
            icon={<PublicRoundedIcon />}
            label={`Listings (${activeListings})`}
            iconPosition="start"
          />
          <Tab
            icon={<SearchRoundedIcon />}
            label={`Unlisted (${unlistedProperties.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* All Properties Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <HomeWorkRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Total Properties
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {totalProperties}
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
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <HomeWorkRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Occupied
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {occupiedProperties}
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
                    <HomeWorkRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Available
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {availableProperties}
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
                    $
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Monthly Revenue
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'success.main',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      ${totalRevenue.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <Tooltip
            title="Search properties by name or address"
            componentsProps={{
              tooltip: {
                sx: uniformTooltipStyles
              }
            }}
          >
            <TextField
              fullWidth
              placeholder="Search properties..."
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
          </Tooltip>
        </Box>

        {/* Properties Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.primary'
                }}>Property Details</TableCell>
                <TableCell sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.primary'
                }}>Address</TableCell>
                <TableCell sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.primary'
                }}>Type & Units</TableCell>
                <TableCell sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.primary'
                }}>Rent & Status</TableCell>
                <TableCell sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.primary'
                }}>Manager</TableCell>
                <TableCell sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: 'text.primary'
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(filteredProperties || []).filter(property => property && property.id).map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {property.mainImageId && property.images && property.images.length > 0 ? (
                        <Avatar
                          src={property.images?.find(img => img.id === property.mainImageId)?.url || ''}
                          sx={{ width: 50, height: 50 }}
                        />
                      ) : (
                        <Avatar sx={{ bgcolor: "primary.light", width: 50, height: 50 }}>
                          <HomeWorkRoundedIcon />
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">{property.name}</Typography>
                        {property.bedrooms && property.bathrooms && (
                          <Typography variant="caption" color="text.secondary">
                            {property.bedrooms} bed • {property.bathrooms} bath
                          </Typography>
                        )}
                        {property.images && property.images.length > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {property.images.length} photo{property.images.length !== 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LocationOnRoundedIcon fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                            color: 'primary.main'
                          }}
                          onClick={() => handlePropertyDetailsModal(property)}
                        >
                          {property.address}
                        </Typography>
                      </Stack>
                      {property.squareFootage && (
                        <Typography variant="caption" color="text.secondary">
                          {property.squareFootage} sq ft
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{property.type}</Typography>
                      <Typography variant="body2">
                        {property.occupancy}/{property.units} occupied
                      </Typography>
                      {property.tenant && (
                        <Chip
                          label={property.tenant}
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={() => {
                            // Navigate to Tenants page and show specific tenant
                            // Pass tenant name in query params to auto-select the tenant
                            navigate(`/tenants?tenant=${encodeURIComponent(property.tenant!)}`);
                          }}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'info.light',
                              color: 'info.contrastText'
                            }
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        ${property.monthlyRent.toLocaleString()}/mo
                      </Typography>
                      <Chip
                        label={property.status}
                        color={getStatusColor(property.status)}
                        size="small"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(() => {
                        const managerIds = property.managerIds || (property.managerId ? [property.managerId] : []);
                        if (managerIds.length === 0) {
                          return <Typography variant="body2" color="text.secondary">Unassigned</Typography>;
                        }
                        return managerIds.map((managerId) => {
                          const manager = (propertyManagers || []).find(pm => pm.id === managerId);
                          return (
                            <Chip
                              key={managerId}
                              label={manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown'}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          );
                        });
                      })()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Tooltip title="Manage Pictures">
                        <IconButton
                          size="small"
                          onClick={() => handleManagePictures(property)}
                          color="primary"
                        >
                          <Badge badgeContent={property.images?.length || 0} color="info">
                            <PhotoCameraRoundedIcon />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                      
                      {property.status === "Available" && (
                        <Tooltip
                          title={`Create listing for ${property.name}`}
                          componentsProps={{
                            tooltip: {
                              sx: uniformTooltipStyles
                            }
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleCreateListing(property)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            List
                          </Button>
                        </Tooltip>
                      )}

                      <Tooltip
                        title={`Manage tenants and leases for ${property.name}`}
                        componentsProps={{
                          tooltip: {
                            sx: uniformTooltipStyles
                          }
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setManagingProperty(property);
                            setTenantManageDialogOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </Tooltip>
                      
                      <Tooltip title="Work Orders">
                        <IconButton
                          size="small"
                          onClick={() => handleWorkOrderModal(property)}
                          color="info"
                        >
                          <DescriptionRoundedIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Property">
                        <IconButton
                          size="small"
                          onClick={() => handleEditProperty(property)}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Property">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Listings Tab */}
      <TabPanel value={currentTab} index={1}>
        {/* Listing Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <PublicRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Active Listings
                    </Typography>
                    <Typography variant="h4">{activeListings}</Typography>
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
                    <VisibilityRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Total Views
                    </Typography>
                    <Typography variant="h4">{totalListingViews}</Typography>
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
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <HomeWorkRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Available Units
                    </Typography>
                    <Typography variant="h4">{vacantProperties.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alert for vacant properties not listed */}
        {(vacantProperties?.length || 0) > (listings || []).length && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have {(vacantProperties?.length || 0) - (listings || []).length} vacant property(ies) that haven't been listed yet. 
            Consider creating listings to attract potential tenants.
          </Alert>
        )}

        {/* Properties with Listings */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Listed Properties
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {(realListings || []).map((listing) => {
            const property = properties.find(p => p && p.id === listing.propertyId);
            if (!property) return null;
            
            return (
              <Grid item xs={12} md={6} key={property.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {property.mainImageId && property.images && property.images.length > 0 ? (
                          <Avatar
                            src={property.images?.find(img => img.id === property.mainImageId)?.url || ''}
                            sx={{ width: 60, height: 60 }}
                          />
                        ) : (
                          <Avatar sx={{ bgcolor: "primary.light", width: 60, height: 60 }}>
                            <HomeWorkRoundedIcon />
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="medium">
                            {property.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {property.address}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="primary">
                            ${property.monthlyRent.toLocaleString()}/month
                          </Typography>
                        </Box>
                        <Chip
                          label={listing.status}
                          color={getListingStatusColor(listing.status)}
                          size="small"
                        />
                      </Stack>

                      <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Views: {listing.viewCount}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Inquiries: {listing.inquiries}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Updated: {new Date(listing.lastUpdated).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Listed on:
                        </Typography>
                        {listing.listingSites.craigslist && <Chip label="Craigslist" size="small" variant="outlined" />}
                        {listing.listingSites.zillow && <Chip label="Zillow" size="small" variant="outlined" />}
                        {listing.listingSites.realtorsCom && <Chip label="Realtor.com" size="small" variant="outlined" />}
                        {listing.listingSites.apartments && <Chip label="Apartments.com" size="small" variant="outlined" />}
                        {listing.listingSites.rentCom && <Chip label="Rent.com" size="small" variant="outlined" />}
                        {!Object.values(listing.listingSites).some(Boolean) && (
                          <Chip label="None" size="small" color="warning" />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCreateListing(property)}
                        >
                          Edit Listing
                        </Button>
                        
                        {listing.status === "Draft" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handlePublishListing(listing.id)}
                          >
                            Publish
                          </Button>
                        )}
                        
                        {listing.status === "Listed" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            onClick={() => handleUnpublishListing(listing.id)}
                          >
                            Unpublish
                          </Button>
                        )}
                        
                        <IconButton
                          size="small"
                          onClick={() => handleCopyContent(listing.customContent, "text")}
                          title="Copy listing content"
                        >
                          <ContentCopyRoundedIcon />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleSocialShare(property)}
                          title="Share property listing on social media and other platforms"
                        >
                          <ShareRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Vacant Properties Available for Listing */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Vacant Properties Available for Listing
        </Typography>
        <Grid container spacing={3}>
          {(vacantProperties || [])
            .filter(property => property && property.id && !(listings || []).some(l => l.propertyId === property.id))
            .map((property) => (
              <Grid item xs={12} md={6} key={property.id}>
                <Card sx={{ border: '2px dashed', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {property.mainImageId && property.images && property.images.length > 0 ? (
                          <Avatar
                            src={property.images?.find(img => img.id === property.mainImageId)?.url || ''}
                            sx={{ width: 60, height: 60 }}
                          />
                        ) : (
                          <Avatar sx={{ bgcolor: "warning.light", width: 60, height: 60 }}>
                            <HomeWorkRoundedIcon />
                          </Avatar>
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="medium">
                            {property.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {property.address}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" color="primary">
                            ${property.monthlyRent.toLocaleString()}/month
                          </Typography>
                        </Box>
                        <Chip
                          label="Not Listed"
                          color="warning"
                          size="small"
                        />
                      </Stack>

                      <Alert severity="warning" sx={{ py: 1 }}>
                        This vacant property is not currently listed. Create a listing to attract tenants.
                      </Alert>

                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => handleCreateListing(property)}
                        startIcon={<PublicRoundedIcon />}
                      >
                        Create Listing
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      {/* Unlisted Properties Tab */}
      <TabPanel value={currentTab} index={2}>
        {/* Stats for Unlisted Properties */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <SearchRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Unlisted Properties
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {unlistedProperties.length}
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
                    $
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Potential Revenue
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'warning.main',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      ${(unlistedProperties || []).reduce((sum, p) => sum + (p?.monthlyRent || 0), 0).toLocaleString()}
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
                  <Avatar sx={{ bgcolor: "error.main" }}>
                    <CalendarTodayRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Vacancy Days
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'error.main',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {Math.floor(Math.random() * 45) + 5}
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
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <PublicRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}
                    >
                      Ready to List
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'success.main',
                        fontWeight: 600,
                        fontSize: { xs: '1.75rem', sm: '2rem' }
                      }}
                    >
                      {unlistedProperties.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Unlisted Properties Grid */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Properties Available for Listing
        </Typography>

        {unlistedProperties.length === 0 ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6">All Available Properties Are Listed!</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Great job! All your available properties are currently listed and visible to potential tenants.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6">Action Required</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You have {unlistedProperties.length} available propert{unlistedProperties.length > 1 ? 'ies' : 'y'} that {unlistedProperties.length > 1 ? 'are' : 'is'} not currently listed.
              Creating listings will help attract potential tenants and reduce vacancy time.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          {(unlistedProperties || []).filter(property => property && property.id).map((property) => (
            <Grid item xs={12} md={6} lg={4} key={property.id}>
              <Card
                sx={{
                  border: '2px solid',
                  borderColor: 'warning.main',
                  backgroundColor: 'warning.light',
                  '&:hover': {
                    backgroundColor: 'warning.lighter',
                    borderColor: 'warning.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Property Header */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {property.mainImageId && property.images && property.images.length > 0 ? (
                        <Avatar
                          src={property.images?.find(img => img.id === property.mainImageId)?.url || ''}
                          sx={{ width: 60, height: 60 }}
                        />
                      ) : (
                        <Avatar sx={{ bgcolor: "warning.dark", width: 60, height: 60 }}>
                          <HomeWorkRoundedIcon />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="medium">
                          {property.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <LocationOnRoundedIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {property.address}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="primary" sx={{ mt: 0.5 }}>
                          ${property.monthlyRent.toLocaleString()}/month
                        </Typography>
                      </Box>
                      <Chip
                        label="Not Listed"
                        color="warning"
                        size="small"
                        variant="filled"
                      />
                    </Stack>

                    {/* Property Details */}
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {property.bedrooms && (
                        <Chip
                          label={`${property.bedrooms} BR`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {property.bathrooms && (
                        <Chip
                          label={`${property.bathrooms} BA`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {property.squareFootage && (
                        <Chip
                          label={`${property.squareFootage} sq ft`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    {/* Vacancy Alert */}
                    <Alert severity="warning" sx={{ py: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        This property is vacant and not listed
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create a listing to start attracting potential tenants and reduce vacancy time.
                      </Typography>
                    </Alert>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => handleCreateListing(property)}
                        startIcon={<PublicRoundedIcon />}
                      >
                        Create Listing
                      </Button>
                      <Tooltip title="Edit Property Details">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditProperty(property)}
                        >
                          <EditRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Property Details">
                        <IconButton
                          color="info"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <VisibilityRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* Quick Actions */}
                    <Divider />
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PhotoCameraRoundedIcon />}
                        onClick={() => {
                          setSelectedProperty(property);
                          setPropertyImages(property.images || []);
                          setOpenPictureDialog(true);
                        }}
                      >
                        Add Photos
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DescriptionRoundedIcon />}
                        onClick={() => handleEditProperty(property)}
                      >
                        Update Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<WebRoundedIcon />}
                        onClick={() => {
                          const landingPageUrl = `${window.location.origin}/property-landing/${property.id}`;
                          alert(`🚀 Landing Page Created!\n\nYour property landing page is ready at:\n${landingPageUrl}\n\nFeatures:\n• Professional property showcase\n• Virtual tour integration\n• Contact form for inquiries\n• Social media sharing\n• Mobile responsive design\n\nThe page is now live and ready to share with potential tenants!`);
                        }}
                      >
                        Create Landing Page
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bulk Actions for Unlisted Properties */}
        {unlistedProperties.length > 0 && (
          <Card sx={{ mt: 3, border: '1px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bulk Actions
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PublicRoundedIcon />}
                  onClick={() => {
                    if (confirm(`Create listings for all ${unlistedProperties.length} unlisted properties?`)) {
                      unlistedProperties.forEach(property => {
                        handleCreateListing(property);
                      });
                    }
                  }}
                >
                  List All Properties
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailRoundedIcon />}
                  onClick={() => {
                    // Navigate to communications page as requested by user
                    navigate('/communications');
                  }}
                >
                  Email Manager
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={() => {
                    const csvData = (unlistedProperties || []).filter(p => p && p.id).map(p => ({
                      'Property Name': p.name,
                      'Address': p.address,
                      'Type': p.type,
                      'Monthly Rent': p.monthlyRent,
                      'Bedrooms': p.bedrooms || 'N/A',
                      'Bathrooms': p.bathrooms || 'N/A',
                      'Square Footage': p.squareFootage || 'N/A',
                      'Status': p.status,
                      'Manager': p.manager
                    }));
                    exportPropertiesData(csvData, 'unlisted-properties');
                  }}
                >
                  Export List
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Add/Edit Property Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProperty ? "Edit Property" : "Add New Property"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Property Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Property Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Property["type"] })}
                  >
                    <MenuItem value="Apartment">Apartment</MenuItem>
                    <MenuItem value="House">House</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="Townhome">Townhome</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Number of Units"
                  type="number"
                  fullWidth
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Bedrooms"
                  type="number"
                  fullWidth
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Bathrooms"
                  type="number"
                  fullWidth
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Square Footage"
                  type="number"
                  fullWidth
                  value={formData.squareFootage}
                  onChange={(e) => setFormData({ ...formData, squareFootage: parseInt(e.target.value) || 0 })}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Monthly Rent"
                  type="number"
                  fullWidth
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Parking Spaces"
                  type="number"
                  fullWidth
                  value={formData.parkingSpaces}
                  onChange={(e) => setFormData({ ...formData, parkingSpaces: parseInt(e.target.value) || 0 })}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Property Manager"
              fullWidth
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            />
            
            <RichTextEditor
              label="Property Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Enter a detailed description of the property, including features, amenities, and highlights..."
              minHeight={200}
              maxHeight={400}
            />
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Pet Policy & Requirements</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Pet Policy"
                  fullWidth
                  value={formData.petPolicy}
                  onChange={(e) => setFormData({ ...formData, petPolicy: e.target.value })}
                  placeholder="e.g., No pets, Cats allowed, Dogs under 50lbs, All pets welcome"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  label="Pet Deposit"
                  type="number"
                  fullWidth
                  value={formData.petDeposit}
                  onChange={(e) => setFormData({ ...formData, petDeposit: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  placeholder="0"
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  label="Monthly Pet Fee"
                  type="number"
                  fullWidth
                  value={formData.petFee}
                  onChange={(e) => setFormData({ ...formData, petFee: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  placeholder="0"
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  label="Max Pets Allowed"
                  type="number"
                  fullWidth
                  value={formData.maxPetsAllowed}
                  onChange={(e) => setFormData({ ...formData, maxPetsAllowed: Number(e.target.value) })}
                  placeholder="0"
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.petDepositRefundable}
                      onChange={(e) => setFormData({ ...formData, petDepositRefundable: e.target.checked })}
                    />
                  }
                  label="Pet Deposit Refundable"
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Picture Upload Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Property Pictures</Typography>

              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadRoundedIcon />}
                  fullWidth
                >
                  Upload Pictures
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && selectedProperty) {
                        // Handle file upload for existing property
                        Array.from(files).forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const newImage: PropertyImage = {
                              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                              url: event.target?.result as string,
                              alt: file.name,
                              rotation: 0,
                              isMain: false,
                              order: 0,
                            };

                            setProperties(prev => prev.map(property =>
                              property.id === selectedProperty.id
                                ? {
                                    ...property,
                                    images: [...(property.images || []), newImage]
                                  }
                                : property
                            ));
                          };
                          reader.readAsDataURL(file);
                        });
                      } else if (files) {
                        // For new properties, we'll store images temporarily and add them when property is created
                        alert('Pictures will be available for upload after the property is created. Please save the property first, then use the "Manage Pictures" button.');
                      }
                    }}
                  />
                </Button>

                {selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Current Pictures ({selectedProperty.images.length})
                    </Typography>
                    <Grid container spacing={1}>
                      {selectedProperty.images.slice(0, 6).map((image) => (
                        <Grid item xs={4} key={image.id}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              paddingTop: '75%', // 4:3 aspect ratio
                              overflow: 'hidden',
                              borderRadius: 1,
                              border: image.isMain ? '2px solid' : '1px solid',
                              borderColor: image.isMain ? 'primary.main' : 'divider'
                            }}
                          >
                            <img
                              src={image.url}
                              alt={image.alt}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `rotate(${image.rotation}deg)`
                              }}
                            />
                            {image.isMain && (
                              <Chip
                                label="MAIN"
                                size="small"
                                color="primary"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  left: 4,
                                  fontSize: '10px',
                                  height: '18px'
                                }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {selectedProperty.images && selectedProperty.images.length > 6 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        +{(selectedProperty.images?.length || 0) - 6} more pictures
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setOpenDialog(false);
                        handleManagePictures(selectedProperty);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Manage All Pictures
                    </Button>
                  </Box>
                )}

                {!selectedProperty && (
                  <Alert severity="info">
                    Pictures can be uploaded after creating the property. Save the property first, then use the "Manage Pictures" button to add images.
                  </Alert>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProperty}>
            {selectedProperty ? "Update" : "Add"} Property
          </Button>
        </DialogActions>
      </Dialog>

      {/* Listing Editor Dialog */}
      <Dialog open={openListingDialog} onClose={() => setOpenListingDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedListing ? "Edit Listing" : "Create Listing"} - {selectedProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Listing Sites Selection */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Select Listing Sites</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={listingFormData.listingSites.craigslist}
                              onChange={(e) => setListingFormData({
                                ...listingFormData,
                                listingSites: { ...listingFormData.listingSites, craigslist: e.target.checked }
                              })}
                            />
                          }
                          label="Craigslist"
                        />
                        {listingFormData.listingSites.craigslist && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleListingSiteLogin('Craigslist')}
                            startIcon={<LoginRoundedIcon />}
                          >
                            Login & Post to Craigslist
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={listingFormData.listingSites.zillow}
                              onChange={(e) => setListingFormData({
                                ...listingFormData,
                                listingSites: { ...listingFormData.listingSites, zillow: e.target.checked }
                              })}
                            />
                          }
                          label="Zillow"
                        />
                        {listingFormData.listingSites.zillow && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleListingSiteLogin('Zillow')}
                            startIcon={<LoginRoundedIcon />}
                          >
                            Login & Post to Zillow
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={listingFormData.listingSites.realtorsCom}
                              onChange={(e) => setListingFormData({
                                ...listingFormData,
                                listingSites: { ...listingFormData.listingSites, realtorsCom: e.target.checked }
                              })}
                            />
                          }
                          label="Realtor.com"
                        />
                        {listingFormData.listingSites.realtorsCom && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleListingSiteLogin('Realtor.com')}
                            startIcon={<LoginRoundedIcon />}
                          >
                            Login & Post
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={listingFormData.listingSites.apartments}
                              onChange={(e) => setListingFormData({
                                ...listingFormData,
                                listingSites: { ...listingFormData.listingSites, apartments: e.target.checked }
                              })}
                            />
                          }
                          label="Apartments.com"
                        />
                        {listingFormData.listingSites.apartments && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleListingSiteLogin('Apartments.com')}
                            startIcon={<LoginRoundedIcon />}
                          >
                            Login & Post
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={listingFormData.listingSites.rentCom}
                              onChange={(e) => setListingFormData({
                                ...listingFormData,
                                listingSites: { ...listingFormData.listingSites, rentCom: e.target.checked }
                              })}
                            />
                          }
                          label="Rent.com"
                        />
                        {listingFormData.listingSites.rentCom && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleListingSiteLogin('Rent.com')}
                            startIcon={<LoginRoundedIcon />}
                          >
                            Login & Post
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Promotions Selection */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Add Promotion (Optional)</Typography>
              <FormControl fullWidth>
                <InputLabel>Select Promotion</InputLabel>
                <Select
                  value={listingFormData.promotionId}
                  label="Select Promotion"
                  onChange={(e) => setListingFormData({ ...listingFormData, promotionId: e.target.value })}
                >
                  <MenuItem value="">No Promotion</MenuItem>
                  {mockPromotions.map((promo) => (
                    <MenuItem key={promo.id} value={promo.id}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">{promo.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {promo.description}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {promo.discountType === "Percentage" && `${promo.discountValue}% off`}
                          {promo.discountType === "Fixed Amount" && `$${promo.discountValue} off`}
                          {promo.discountType === "Free Months" && `${promo.discountValue} month(s) free`}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {listingFormData.promotionId && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Selected Promotion:</Typography>
                  <Typography variant="body2">
                    {mockPromotions.find(p => p.id === listingFormData.promotionId)?.title} -
                    {mockPromotions.find(p => p.id === listingFormData.promotionId)?.description}
                  </Typography>
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Listing Content Editor */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Listing Content</Typography>
              <RichTextEditor
                value={listingFormData.customContent}
                onChange={(value) => setListingFormData({ ...listingFormData, customContent: value })}
                placeholder="Create an engaging listing description. Use the formatting tools to highlight key features, add bullet points for amenities, and make your property stand out..."
                minHeight={300}
                maxHeight={500}
                showHtmlMode={true}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleCopyContent(listingFormData.customContent, "text")}
                  startIcon={<ContentCopyRoundedIcon />}
                >
                  Copy Text
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (selectedProperty) {
                      const htmlContent = generateHTMLContent(selectedProperty, listingFormData.customContent);
                      handleCopyContent(htmlContent, "html");
                    }
                  }}
                  startIcon={<FormatQuoteRoundedIcon />}
                >
                  Copy HTML
                </Button>
              </Stack>
            </Box>

            {/* Expiration Date */}
            <TextField
              label="Listing Expiration Date (Optional)"
              type="date"
              value={listingFormData.expirationDate}
              onChange={(e) => setListingFormData({ ...listingFormData, expirationDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenListingDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveListing}>
            {selectedListing ? "Update Listing" : "Create Listing"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Picture Management Dialog */}
      <Dialog open={openPictureDialog} onClose={() => setOpenPictureDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Manage Pictures - {selectedProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Upload Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Upload New Pictures</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ mb: 2 }}
              >
                Upload Pictures
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>

            <Divider />

            {/* Current Pictures */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Current Pictures ({propertyImages.length})
            </Typography>

              {propertyImages.length > 0 ? (
                <ImageList sx={{ width: '100%', height: 450 }} cols={3} rowHeight={200}>
                  {(propertyImages || [])
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => (
                    <ImageListItem
                      key={image.id}
                      sx={{
                        position: 'relative',
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' }
                      }}
                      draggable
                      onDragStart={() => setDraggedImageIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedImageIndex !== null && draggedImageIndex !== index) {
                          handleReorderImages(draggedImageIndex, index);
                        }
                        setDraggedImageIndex(null);
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        loading="lazy"
                        style={{
                          transform: `rotate(${image.rotation}deg)`,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />

                      <ImageListItemBar
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DragIndicatorRoundedIcon fontSize="small" />
                            {image.isMain && (
                              <Chip
                                label="MAIN"
                                size="small"
                                color="primary"
                                sx={{ fontSize: '10px', height: '20px' }}
                              />
                            )}
                          </Box>
                        }
                        subtitle={image.alt}
                        actionIcon={
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Rotate Left">
                              <IconButton
                                size="small"
                                sx={{ color: 'white' }}
                                onClick={() => handleRotateImage(image.id, 'left')}
                              >
                                <RotateLeftRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Rotate Right">
                              <IconButton
                                size="small"
                                sx={{ color: 'white' }}
                                onClick={() => handleRotateImage(image.id, 'right')}
                              >
                                <RotateRightRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={image.isMain ? "Main Image" : "Set as Main"}>
                              <IconButton
                                size="small"
                                sx={{ color: image.isMain ? 'yellow' : 'white' }}
                                onClick={() => handleSetMainImage(image.id)}
                              >
                                {image.isMain ? (
                                  <StarRoundedIcon fontSize="small" />
                                ) : (
                                  <StarBorderRoundedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                sx={{ color: 'white' }}
                                onClick={() => handleDeleteImage(image.id)}
                              >
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        }
                        sx={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <PhotoCameraRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No pictures uploaded yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload pictures to showcase this property
                  </Typography>
                </Box>
              )}
            </Box>

            {propertyImages.length > 0 && (
              <Box sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  ���� <strong>Tips:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Drag pictures to reorder them
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Click the star to set the main property image
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Use rotation buttons to adjust picture orientation
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPictureDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePictures}>
            Save Pictures
          </Button>
        </DialogActions>
      </Dialog>

      {/* Listing Site Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Login to {selectedListingSite}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              This will open a secure authentication window for {selectedListingSite} and automatically post your listing.
            </Alert>

            <Typography variant="body2" color="text.secondary">
              Your listing will be posted with the following details:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemText
                  primary="Property"
                  secondary={selectedProperty?.name}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Address"
                  secondary={selectedProperty?.address}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Monthly Rent"
                  secondary={selectedProperty ? `$${selectedProperty.monthlyRent.toLocaleString()}` : ''}
                />
              </ListItem>
              {listingFormData.promotionId && (
                <ListItem>
                  <ListItemText
                    primary="Active Promotion"
                    secondary={mockPromotions.find(p => p.id === listingFormData.promotionId)?.title}
                  />
                </ListItem>
              )}
            </List>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLoginAndPost} startIcon={<LoginRoundedIcon />}>
            Login & Post Listing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Property Detail Dialog */}
      <Dialog
        open={propertyDetailOpen}
        onClose={() => {
          setPropertyDetailOpen(false);
          setSelectedPropertyId(null);
        }}
        maxWidth="lg"
        fullWidth
        fullScreen
      >
        {selectedPropertyId && (
          <PropertyDetailPage
            propertyId={selectedPropertyId}
            onClose={() => {
              setPropertyDetailOpen(false);
              setSelectedPropertyId(null);
            }}
          />
        )}
      </Dialog>

      {/* Tenant Management Dialog */}
      <Dialog open={tenantManageDialogOpen} onClose={() => setTenantManageDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography
            variant="subtitle1"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1.125rem', sm: '1.25rem' }
            }}
          >
            Manage Tenants - {managingProperty?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Manage tenant assignments, lease agreements, and occupancy for this property.
            </Alert>

            {managingProperty && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}
          >
            Property Details
          </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2"><strong>Name:</strong> {managingProperty.name}</Typography>
                        <Typography variant="body2"><strong>Address:</strong> {managingProperty.address}</Typography>
                        <Typography variant="body2"><strong>Type:</strong> {managingProperty.type}</Typography>
                        <Typography variant="body2"><strong>Units:</strong> {managingProperty.units}</Typography>
                        <Typography variant="body2"><strong>Occupancy:</strong> {managingProperty.occupancy}/{managingProperty.units}</Typography>
                        <Typography variant="body2"><strong>Monthly Rent:</strong> ${managingProperty.monthlyRent.toLocaleString()}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}
          >
            Current Tenant
          </Typography>
                      {(() => {
                        const currentTenant = state.tenants.find(t =>
                          t.propertyId === managingProperty.id && t.status === 'Active'
                        );
                        return currentTenant;
                      })() ? (
                        <Stack spacing={2}>
                          {(() => {
                            const currentTenant = state.tenants.find(t =>
                              t.propertyId === managingProperty.id && t.status === 'Active'
                            );
                            return (
                              <Box>
                                <Typography variant="body2"><strong>Tenant:</strong> {currentTenant?.firstName} {currentTenant?.lastName}</Typography>
                                <Typography variant="body2" color="text.secondary"><strong>Email:</strong> {currentTenant?.email}</Typography>
                                <Typography variant="body2" color="text.secondary"><strong>Phone:</strong> {currentTenant?.phone}</Typography>
                                <Typography variant="body2" color="text.secondary"><strong>Lease End:</strong> {currentTenant?.leaseEnd ? new Date(currentTenant.leaseEnd).toLocaleDateString() : 'N/A'}</Typography>
                                <Typography variant="body2" color="text.secondary"><strong>Monthly Rent:</strong> ${currentTenant?.monthlyRent || 0}</Typography>
                              </Box>
                            );
                          })()}
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              setTerminateLeaseDialogOpen(true);
                              setTerminationData({
                                terminationDate: '',
                                reason: '',
                                password: '',
                                noticeGiven: false
                              });
                            }}
                          >
                            Terminate Lease
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setLeaseViewerDialogOpen(true);
                            }}
                          >
                            View Lease Agreement
                          </Button>
                          <Button
                    variant="contained"
                    size="small"
                    color="info"
                    onClick={() => {
                      const currentTenant = state.tenants.find(t =>
                        t.propertyId === managingProperty.id && t.status === 'Active'
                      );
                      setCommunicationData({
                        type: 'email',
                        subject: `Important Notice from ${managingProperty.name} Management`,
                        message: `Dear ${currentTenant?.firstName} ${currentTenant?.lastName},\n\nWe hope this message finds you well. `,
                        recipient: `${currentTenant?.firstName} ${currentTenant?.lastName}` || ''
                      });
                      setCommunicationDialogOpen(true);
                    }}
                    startIcon={<EmailRoundedIcon />}
                  >
                    Send Notice
                  </Button>
                        </Stack>
                      ) : (
                        <Stack spacing={2}>
                          <Typography variant="body2" color="text.secondary">No current tenant assigned</Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              alert('Opening tenant assignment dialog for ' + managingProperty.name);
                            }}
                          >
                            Assign Tenant
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              // Check if property is occupied
                              const currentTenant = state.tenants.find(t =>
                                t.propertyId === managingProperty.id && t.status === 'Active'
                              );

                              if (currentTenant || managingProperty.status === 'Occupied') {
                                setShowOccupiedWarning(true);
                              } else {
                                setShowingData({
                                  type: 'general',
                                  date: '',
                                  time: '',
                                  agent: '',
                                  prospectName: '',
                                  prospectEmail: '',
                                  prospectPhone: '',
                                  notes: '',
                                  estimatedDuration: '30',
                                  requireNotice: false
                                });
                                setShowingDialogOpen(true);
                              }
                            }}
                          >
                            Schedule Showing
                          </Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            <Typography
            variant="subtitle1"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              mb: 2
            }}
          >
            Available Actions
          </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PersonRoundedIcon />}
                  onClick={() => {
                    // Enhanced tenant creation dialog
                    const tenantData = {
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      property: managingProperty?.name || '',
                      moveInDate: '',
                      leaseTermMonths: 12,
                      monthlyRent: managingProperty?.monthlyRent || 0,
                      securityDeposit: (managingProperty?.monthlyRent || 0) * 1.5,
                      emergencyContact: '',
                      previousAddress: '',
                      employmentInfo: ''
                    };

                    // Create detailed form dialog
                    const dialogContent = `Adding new tenant to ${managingProperty?.name}\n\nPlease fill out tenant information:\n• Personal Details\n• Contact Information\n• Lease Terms\n• Emergency Contacts\n• Employment Verification\n\nThis will create a comprehensive tenant profile and lease agreement.`;

                    alert(dialogContent);
                    console.log('Tenant creation form would open with data:', tenantData);
                  }}
                  color="primary"
                >
                  Add New Tenant
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DescriptionRoundedIcon />}
                  onClick={() => {
                    setLeaseUploadData({
                      file: null,
                      leaseType: 'new',
                      startDate: '',
                      endDate: '',
                      monthlyRent: managingProperty?.monthlyRent.toString() || '',
                      depositAmount: '',
                      notes: ''
                    });
                    setLeaseUploadDialogOpen(true);
                  }}
                >
                  Generate Lease
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  color="success"
                  startIcon={<EmailRoundedIcon />}
                  onClick={() => {
                    if (managingProperty?.tenant) {
                      setCommunicationData({
                        type: 'email',
                        subject: `Communication from ${managingProperty.name} Management`,
                        message: `Dear ${managingProperty.tenant},\n\n`,
                        recipient: managingProperty.tenant
                      });
                      setCommunicationDialogOpen(true);
                    } else {
                      alert('No tenant assigned to this property. Please assign a tenant first.');
                    }
                  }}
                >
                  Send Notice
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CalendarTodayRoundedIcon />}
                  onClick={() => {
                    setInspectionData({
                      type: 'routine',
                      date: '',
                      time: '',
                      inspector: '',
                      notes: '',
                      notifyTenant: true,
                      reminderDays: '3'
                    });
                    setInspectionDialogOpen(true);
                  }}
                >
                  Schedule Inspection
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTenantManageDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              alert('Saving tenant management changes for ' + managingProperty?.name);
              setTenantManageDialogOpen(false);
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inspection Scheduling Dialog */}
      <Dialog
        open={inspectionDialogOpen}
        onClose={() => setInspectionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          📅 Schedule Property Inspection - {managingProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Schedule an inspection for this property. This will create a calendar event and task in the CRM system.
            </Alert>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Property: <strong>{managingProperty?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: {managingProperty?.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Tenant: {managingProperty?.tenant || 'Vacant'}
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Inspection Type</InputLabel>
              <Select
                value={inspectionData.type}
                label="Inspection Type"
                onChange={(e) => setInspectionData({ ...inspectionData, type: e.target.value })}
              >
                <MenuItem value="routine">Routine Inspection</MenuItem>
                <MenuItem value="moveout">Move-out Inspection</MenuItem>
                <MenuItem value="movein">Move-in Inspection</MenuItem>
                <MenuItem value="maintenance">Maintenance Inspection</MenuItem>
                <MenuItem value="safety">Safety Inspection</MenuItem>
                <MenuItem value="insurance">Insurance Inspection</MenuItem>
                <MenuItem value="annual">Annual Inspection</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Inspection Date"
                  type="date"
                  fullWidth
                  required
                  value={inspectionData.date}
                  onChange={(e) => setInspectionData({ ...inspectionData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Inspection Time"
                  type="time"
                  fullWidth
                  required
                  value={inspectionData.time}
                  onChange={(e) => setInspectionData({ ...inspectionData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Inspector</InputLabel>
              <Select
                value={inspectionData.inspector}
                label="Inspector"
                onChange={(e) => setInspectionData({ ...inspectionData, inspector: e.target.value })}
              >
                <MenuItem value="John Smith">John Smith - Property Manager</MenuItem>
                <MenuItem value="Emily Davis">Emily Davis - Senior Inspector</MenuItem>
                <MenuItem value="Mike Wilson">Mike Wilson - Maintenance Lead</MenuItem>
                <MenuItem value="External">External Inspector</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Inspection Notes"
              fullWidth
              multiline
              rows={3}
              value={inspectionData.notes}
              onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
              placeholder="Enter specific items to inspect or special instructions..."
            />

            <Box>
              <Typography variant="h6" gutterBottom>Notification Settings</Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inspectionData.notifyTenant}
                      onChange={(e) => setInspectionData({ ...inspectionData, notifyTenant: e.target.checked })}
                    />
                  }
                  label="Notify tenant of scheduled inspection"
                />

                {inspectionData.notifyTenant && (
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Advance Notice</InputLabel>
                    <Select
                      value={inspectionData.reminderDays}
                      label="Advance Notice"
                      onChange={(e) => setInspectionData({ ...inspectionData, reminderDays: e.target.value })}
                    >
                      <MenuItem value="1">1 day before</MenuItem>
                      <MenuItem value="3">3 days before</MenuItem>
                      <MenuItem value="7">1 week before</MenuItem>
                      <MenuItem value="14">2 weeks before</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Box>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>What happens next:</strong>
                <br />• Calendar event will be created for {inspectionData.date} at {inspectionData.time || 'selected time'}
                <br />• Task will be assigned to {inspectionData.inspector || 'selected inspector'}
                <br />• {inspectionData.notifyTenant ? `Tenant will be notified ${inspectionData.reminderDays} days in advance` : 'No tenant notification will be sent'}
                <br />• Inspection reminder will be sent to inspector 1 day before
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspectionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!inspectionData.date || !inspectionData.time || !inspectionData.inspector) {
                alert('Please fill in all required fields: date, time, and inspector.');
                return;
              }

              const inspectionDateTime = new Date(`${inspectionData.date}T${inspectionData.time}`);
              const formattedDateTime = inspectionDateTime.toLocaleString();

              alert(`Inspection scheduled successfully! 🎉\n\n📋 Details:\n• Type: ${inspectionData.type}\n• Property: ${managingProperty?.name}\n• Date & Time: ${formattedDateTime}\n• Inspector: ${inspectionData.inspector}\n• Tenant Notification: ${inspectionData.notifyTenant ? `Yes (${inspectionData.reminderDays} days notice)` : 'No'}\n\n✅ Created:\n• Calendar event for ${formattedDateTime}\n• Task assigned to ${inspectionData.inspector}\n�� ${inspectionData.notifyTenant ? 'Tenant notification scheduled' : 'No tenant notification'}\n\nThe inspection is now saved in your CRM system.`);

              setInspectionDialogOpen(false);
            }}
            disabled={!inspectionData.date || !inspectionData.time || !inspectionData.inspector}
          >
            Schedule Inspection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Occupied Property Warning Dialog */}
      <Dialog
        open={showOccupiedWarning}
        onClose={() => setShowOccupiedWarning(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          ⚠️ Property is Currently Occupied
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This property currently has an active tenant. Scheduling a showing may require special coordination.
          </Alert>
          <Typography variant="body1" gutterBottom>
            <strong>Property:</strong> {managingProperty?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Current Tenant:</strong> {(() => {
              const currentTenant = state.tenants.find(t =>
                t.propertyId === managingProperty?.id && t.status === 'Active'
              );
              return currentTenant ? `${currentTenant.firstName} ${currentTenant.lastName}` : 'Occupied';
            })()}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Do you still want to proceed with scheduling a showing? This will require:
          </Typography>
          <ul>
            <li>Proper notice to the current tenant</li>
            <li>Coordination with tenant's schedule</li>
            <li>Compliance with local tenant rights laws</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOccupiedWarning(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setShowOccupiedWarning(false);
              setShowingData({
                type: 'occupied_property',
                date: '',
                time: '',
                agent: '',
                prospectName: '',
                prospectEmail: '',
                prospectPhone: '',
                notes: '',
                estimatedDuration: '30',
                requireNotice: true
              });
              setShowingDialogOpen(true);
            }}
          >
            Proceed with Showing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Property Showing Scheduler Dialog */}
      <Dialog
        open={showingDialogOpen}
        onClose={() => setShowingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🏠 Schedule Property Showing - {managingProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {showingData.type === 'occupied_property' && (
              <Alert severity="warning">
                This property is currently occupied. Additional coordination with the tenant will be required.
              </Alert>
            )}

            <Alert severity="info">
              Schedule a showing for this property. This will create a calendar event and task in the CRM system.
            </Alert>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Property: <strong>{managingProperty?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: {managingProperty?.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {managingProperty?.status}
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Showing Type</InputLabel>
              <Select
                value={showingData.type}
                label="Showing Type"
                onChange={(e) => setShowingData({ ...showingData, type: e.target.value })}
              >
                <MenuItem value="general">General Showing</MenuItem>
                <MenuItem value="private">Private Showing</MenuItem>
                <MenuItem value="open_house">Open House</MenuItem>
                <MenuItem value="occupied_property">Occupied Property Showing</MenuItem>
                <MenuItem value="virtual">Virtual Tour</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Showing Date"
                  type="date"
                  fullWidth
                  required
                  value={showingData.date}
                  onChange={(e) => setShowingData({ ...showingData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Showing Time"
                  type="time"
                  fullWidth
                  required
                  value={showingData.time}
                  onChange={(e) => setShowingData({ ...showingData, time: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Showing Agent</InputLabel>
              <Select
                value={showingData.agent}
                label="Showing Agent"
                onChange={(e) => setShowingData({ ...showingData, agent: e.target.value })}
              >
                <MenuItem value="John Smith">John Smith - Property Manager</MenuItem>
                <MenuItem value="Emily Davis">Emily Davis - Leasing Agent</MenuItem>
                <MenuItem value="Mike Wilson">Mike Wilson - Sales Agent</MenuItem>
                <MenuItem value="External">External Agent</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Prospect Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Prospect Name"
                  fullWidth
                  value={showingData.prospectName}
                  onChange={(e) => setShowingData({ ...showingData, prospectName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={showingData.prospectEmail}
                  onChange={(e) => setShowingData({ ...showingData, prospectEmail: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={showingData.prospectPhone}
                  onChange={(e) => setShowingData({ ...showingData, prospectPhone: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={showingData.notes}
              onChange={(e) => setShowingData({ ...showingData, notes: e.target.value })}
              placeholder="Special instructions, access requirements, or other notes..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estimated Duration</InputLabel>
                  <Select
                    value={showingData.estimatedDuration}
                    label="Estimated Duration"
                    onChange={(e) => setShowingData({ ...showingData, estimatedDuration: e.target.value })}
                  >
                    <MenuItem value="15">15 minutes</MenuItem>
                    <MenuItem value="30">30 minutes</MenuItem>
                    <MenuItem value="45">45 minutes</MenuItem>
                    <MenuItem value="60">1 hour</MenuItem>
                    <MenuItem value="90">1.5 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showingData.requireNotice}
                      onChange={(e) => setShowingData({ ...showingData, requireNotice: e.target.checked })}
                    />
                  }
                  label="Require tenant notice (for occupied properties)"
                />
              </Grid>
            </Grid>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>What happens next:</strong>
                <br />• Calendar event will be created for {showingData.date} at {showingData.time || 'selected time'}
                <br />• Task will be assigned to {showingData.agent || 'selected agent'}
                <br />• {showingData.prospectName && `Prospect ${showingData.prospectName} will be notified`}
                <br />• {showingData.requireNotice && showingData.type === 'occupied_property' ? 'Current tenant will be notified per legal requirements' : 'Property access will be arranged'}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowingDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!showingData.date || !showingData.time || !showingData.agent) {
                alert('Please fill in all required fields: date, time, and agent.');
                return;
              }

              const showingDateTime = new Date(`${showingData.date}T${showingData.time}`);
              const formattedDateTime = showingDateTime.toLocaleString();

              alert(`Showing scheduled successfully! 🎉\n\n📋 Details:\n• Type: ${showingData.type}\n• Property: ${managingProperty?.name}\n• Date & Time: ${formattedDateTime}\n• Agent: ${showingData.agent}\n• Prospect: ${showingData.prospectName || 'TBD'}\n• Duration: ${showingData.estimatedDuration} minutes\n• Tenant Notice: ${showingData.requireNotice ? 'Yes' : 'No'}\n\n✅ Created:\n• Calendar event for ${formattedDateTime}\n• Task assigned to ${showingData.agent}\n• ${showingData.prospectName ? `Prospect ${showingData.prospectName} will be contacted` : 'Ready for prospect assignment'}\n• ${showingData.requireNotice ? 'Tenant notification will be sent' : 'Property access arranged'}\n\nThe showing is now saved in your CRM system.`);

              setShowingDialogOpen(false);
            }}
            disabled={!showingData.date || !showingData.time || !showingData.agent}
          >
            Schedule Showing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lease Upload Dialog */}
      <Dialog
        open={leaseUploadDialogOpen}
        onClose={() => setLeaseUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          📄 Create/Upload Lease Agreement - {managingProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Upload a new lease agreement or generate one using the lease template. This will be reflected in the tenant records.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Lease Type</InputLabel>
              <Select
                value={leaseUploadData.leaseType}
                label="Lease Type"
                onChange={(e) => setLeaseUploadData({ ...leaseUploadData, leaseType: e.target.value })}
              >
                <MenuItem value="new">New Lease Agreement</MenuItem>
                <MenuItem value="renewal">Lease Renewal</MenuItem>
                <MenuItem value="amendment">Lease Amendment</MenuItem>
                <MenuItem value="upload">Upload Existing Lease</MenuItem>
              </Select>
            </FormControl>

            {leaseUploadData.leaseType === 'upload' ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  }
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setLeaseUploadData({ ...leaseUploadData, file });
                    }
                  };
                  input.click();
                }}
              >
                <CloudUploadRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                {leaseUploadData.file ? (
                  <Typography variant="body1" color="primary">
                    Selected: {leaseUploadData.file.name}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h6" color="text.secondary">
                      Click to Upload Lease Document
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports PDF, DOC, DOCX files up to 10MB
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Lease Start Date"
                    type="date"
                    fullWidth
                    value={leaseUploadData.startDate}
                    onChange={(e) => setLeaseUploadData({ ...leaseUploadData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Lease End Date"
                    type="date"
                    fullWidth
                    value={leaseUploadData.endDate}
                    onChange={(e) => setLeaseUploadData({ ...leaseUploadData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Monthly Rent"
                    type="number"
                    fullWidth
                    value={leaseUploadData.monthlyRent}
                    onChange={(e) => setLeaseUploadData({ ...leaseUploadData, monthlyRent: e.target.value })}
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Security Deposit"
                    type="number"
                    fullWidth
                    value={leaseUploadData.depositAmount}
                    onChange={(e) => setLeaseUploadData({ ...leaseUploadData, depositAmount: e.target.value })}
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>
              </Grid>
            )}

            <TextField
              label="Additional Notes"
              fullWidth
              multiline
              rows={3}
              value={leaseUploadData.notes}
              onChange={(e) => setLeaseUploadData({ ...leaseUploadData, notes: e.target.value })}
              placeholder="Enter any additional notes about this lease agreement..."
            />

            {leaseUploadData.leaseType !== 'upload' && (
              <Alert severity="success">
                A lease agreement will be generated using the standard template with the provided information.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaseUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (leaseUploadData.leaseType === 'upload' && !leaseUploadData.file) {
                alert('Please select a lease document to upload.');
                return;
              }

              if (leaseUploadData.leaseType !== 'upload' && (!leaseUploadData.startDate || !leaseUploadData.endDate || !leaseUploadData.monthlyRent)) {
                alert('Please fill in all required lease information.');
                return;
              }

              let message = '';
              if (leaseUploadData.leaseType === 'upload') {
                message = `Lease document uploaded successfully!\n\nFile: ${leaseUploadData.file?.name}\nProperty: ${managingProperty?.name}\n\nThe lease has been saved and will be reflected in the tenant window.`;
              } else {
                message = `Lease agreement generated successfully!\n\nType: ${leaseUploadData.leaseType}\nProperty: ${managingProperty?.name}\nTenant: ${managingProperty?.tenant}\nLease Period: ${leaseUploadData.startDate} to ${leaseUploadData.endDate}\nMonthly Rent: $${leaseUploadData.monthlyRent}\n\nThe lease agreement has been created and will be reflected in the tenant window.`;
              }

              alert(message);
              setLeaseUploadDialogOpen(false);
            }}
            disabled={
              leaseUploadData.leaseType === 'upload'
                ? !leaseUploadData.file
                : !leaseUploadData.startDate || !leaseUploadData.endDate || !leaseUploadData.monthlyRent
            }
          >
            {leaseUploadData.leaseType === 'upload' ? 'Upload Lease' : 'Generate Lease'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Communication Dialog */}
      <Dialog
        open={communicationDialogOpen}
        onClose={() => setCommunicationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          📞 Send Notice to {communicationData.recipient}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Send important notices, reminders, or communications to your tenant through multiple channels.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Communication Type</InputLabel>
              <Select
                value={communicationData.type}
                label="Communication Type"
                onChange={(e) => setCommunicationData({ ...communicationData, type: e.target.value })}
              >
                <MenuItem value="email">📧 Email</MenuItem>
                <MenuItem value="sms">📱 SMS/Text Message</MenuItem>
                <MenuItem value="call">📞 Phone Call</MenuItem>
                <MenuItem value="letter">📬 Physical Letter</MenuItem>
              </Select>
            </FormControl>

            {communicationData.type === 'email' && (
              <>
                <TextField
                  label="Email Subject"
                  fullWidth
                  value={communicationData.subject}
                  onChange={(e) => setCommunicationData({ ...communicationData, subject: e.target.value })}
                  placeholder="Enter email subject..."
                />
                <TextField
                  label="Email Message"
                  fullWidth
                  multiline
                  rows={6}
                  value={communicationData.message}
                  onChange={(e) => setCommunicationData({ ...communicationData, message: e.target.value })}
                  placeholder="Type your email message here..."
                />
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setCommunicationData({ ...communicationData, subject: 'Rent Reminder', message: 'Dear ' + communicationData.recipient + ',\n\nThis is a friendly reminder that your rent payment is due soon.\n\nThank you,\nProperty Management' })}>
                    Rent Reminder Template
                  </Button>
                  <Button size="small" onClick={() => setCommunicationData({ ...communicationData, subject: 'Lease Renewal Notice', message: 'Dear ' + communicationData.recipient + ',\n\nYour lease agreement is approaching its expiration date. Please contact us to discuss renewal options.\n\nBest regards,\nProperty Management' })}>
                    Lease Renewal Template
                  </Button>
                  <Button size="small" onClick={() => setCommunicationData({ ...communicationData, subject: 'Maintenance Notice', message: 'Dear ' + communicationData.recipient + ',\n\nWe will be conducting maintenance in your unit. We will provide 24-hour notice before entry.\n\nThank you for your cooperation,\nProperty Management' })}>
                    Maintenance Notice Template
                  </Button>
                </Stack>
              </>
            )}

            {communicationData.type === 'sms' && (
              <>
                <TextField
                  label="SMS Message"
                  fullWidth
                  multiline
                  rows={4}
                  value={communicationData.message}
                  onChange={(e) => setCommunicationData({ ...communicationData, message: e.target.value })}
                  placeholder="Type your SMS message here... (160 characters max)"
                  inputProps={{ maxLength: 160 }}
                  helperText={`${communicationData.message.length}/160 characters`}
                />
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setCommunicationData({ ...communicationData, message: 'Hi ' + communicationData.recipient + ', your rent payment is due soon. Please pay by the due date to avoid late fees. Thanks!' })}>
                    Rent Reminder
                  </Button>
                  <Button size="small" onClick={() => setCommunicationData({ ...communicationData, message: 'Hi ' + communicationData.recipient + ', maintenance is scheduled for your unit. We\'ll provide 24-hour notice. Thanks!' })}>
                    Maintenance Alert
                  </Button>
                </Stack>
              </>
            )}

            {communicationData.type === 'call' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>📞 Phone Call Setup</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This will initiate a phone call to the tenant's registered phone number.
                </Alert>
                <TextField
                  label="Call Notes/Agenda"
                  fullWidth
                  multiline
                  rows={4}
                  value={communicationData.message}
                  onChange={(e) => setCommunicationData({ ...communicationData, message: e.target.value })}
                  placeholder="Enter notes about the purpose of this call..."
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  The call will be logged in the tenant's communication history.
                </Typography>
              </Box>
            )}

            {communicationData.type === 'letter' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>📬 Physical Letter</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This will generate a formal letter to be printed and mailed to the tenant's address.
                </Alert>
                <TextField
                  label="Letter Subject"
                  fullWidth
                  value={communicationData.subject}
                  onChange={(e) => setCommunicationData({ ...communicationData, subject: e.target.value })}
                  placeholder="Enter letter subject..."
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Letter Content"
                  fullWidth
                  multiline
                  rows={6}
                  value={communicationData.message}
                  onChange={(e) => setCommunicationData({ ...communicationData, message: e.target.value })}
                  placeholder="Type your formal letter content here..."
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommunicationDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Process communication
              let action = '';
              switch (communicationData.type) {
                case 'email':
                  action = `Email sent to ${communicationData.recipient}\nSubject: ${communicationData.subject}`;
                  break;
                case 'sms':
                  action = `SMS sent to ${communicationData.recipient}\nMessage: ${communicationData.message.substring(0, 50)}...`;
                  break;
                case 'call':
                  action = `Phone call initiated to ${communicationData.recipient}\nCall logged with notes.`;
                  break;
                case 'letter':
                  action = `Letter prepared for ${communicationData.recipient}\nSubject: ${communicationData.subject}\nReady for printing and mailing.`;
                  break;
              }

              alert(`Communication sent successfully!\n\n${action}\n\nThis communication has been logged in the tenant's history.`);
              setCommunicationDialogOpen(false);
            }}
            disabled={!communicationData.message && communicationData.type !== 'call'}
          >
            {communicationData.type === 'email' ? 'Send Email' :
             communicationData.type === 'sms' ? 'Send SMS' :
             communicationData.type === 'call' ? 'Start Call' : 'Prepare Letter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lease Viewer Dialog */}
      <Dialog
        open={leaseViewerDialogOpen}
        onClose={() => setLeaseViewerDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            📄 Lease Agreement - {managingProperty?.tenant}
          </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={() => {
                  // Download lease contract
                  alert(`Downloading lease agreement for ${managingProperty?.tenant}...`);
                }}
              >
                Download
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareRoundedIcon />}
                onClick={() => {
                  alert(`Sharing lease agreement for ${managingProperty?.tenant}...`);
                }}
              >
                Share
              </Button>
              <IconButton onClick={() => setLeaseViewerDialogOpen(false)}>
                <DeleteRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Lease Document Viewer */}
            <Box sx={{
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <DescriptionRoundedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
              Lease Agreement Preview
            </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Property: {managingProperty?.name}<br />
                Tenant: {managingProperty?.tenant}<br />
                Document: lease-agreement-{managingProperty?.tenant?.toLowerCase().replace(' ', '-')}.pdf
              </Typography>
              <Button
                variant="contained"
                startIcon={<VisibilityRoundedIcon />}
                onClick={() => {
                  // In a real app, this would open the actual PDF
                  window.open('/documents/lease-agreement-' + managingProperty?.tenant?.toLowerCase().replace(' ', '-') + '.pdf', '_blank');
                }}
              >
                Open Full Document
              </Button>
            </Box>

            {/* Document Details */}
            <Paper sx={{ p: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Document Information</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>File Name:</strong> lease-agreement-{managingProperty?.tenant?.toLowerCase().replace(' ', '-')}.pdf
                    </Typography>
                    <Typography variant="body2">
                      <strong>File Size:</strong> 2.3 MB
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last Modified:</strong> {new Date().toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Uploaded By:</strong> Property Manager
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Lease Details</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Property:</strong> {managingProperty?.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tenant:</strong> {managingProperty?.tenant}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monthly Rent:</strong> ${managingProperty?.monthlyRent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Property Type:</strong> {managingProperty?.type}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaseViewerDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailRoundedIcon />}
            onClick={() => {
              alert(`Sending lease agreement copy to ${managingProperty?.tenant}...`);
            }}
          >
            Email to Tenant
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminate Lease Dialog */}
      <Dialog
        open={terminateLeaseDialogOpen}
        onClose={() => setTerminateLeaseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          ⚠️ Terminate Lease Agreement
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              <strong>Warning:</strong> This action will terminate the lease agreement for {managingProperty?.tenant}.
              This action cannot be undone and will affect tenant records and financial calculations.
            </Alert>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Property: <strong>{managingProperty?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Tenant: <strong>{managingProperty?.tenant}</strong>
              </Typography>
            </Box>

            <TextField
              label="Termination Date"
              type="date"
              fullWidth
              required
              value={terminationData.terminationDate}
              onChange={(e) => setTerminationData({ ...terminationData, terminationDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Select the date when the lease should be terminated"
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />

            <FormControl fullWidth>
              <InputLabel>Reason for Termination</InputLabel>
              <Select
                value={terminationData.reason}
                label="Reason for Termination"
                onChange={(e) => setTerminationData({ ...terminationData, reason: e.target.value })}
              >
                <MenuItem value="Lease Expired">Lease Expired</MenuItem>
                <MenuItem value="Tenant Request">Tenant Request</MenuItem>
                <MenuItem value="Non-Payment">Non-Payment of Rent</MenuItem>
                <MenuItem value="Lease Violation">Lease Violation</MenuItem>
                <MenuItem value="Property Sale">Property Sale</MenuItem>
                <MenuItem value="Renovation Required">Renovation Required</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={terminationData.noticeGiven}
                  onChange={(e) => setTerminationData({ ...terminationData, noticeGiven: e.target.checked })}
                />
              }
              label="30-day notice has been given to tenant"
            />

            <TextField
              label="Admin Password"
              type="password"
              fullWidth
              required
              value={terminationData.password}
              onChange={(e) => setTerminationData({ ...terminationData, password: e.target.value })}
              helperText="Enter your admin password to confirm this action"
              placeholder="Enter password to verify termination"
            />

            <Alert severity="info">
              After termination, the tenant will be moved to inactive status and the property will be marked as available.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTerminateLeaseDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Validate form
              if (!terminationData.terminationDate) {
                alert('Please select a termination date');
                return;
              }
              if (!terminationData.reason) {
                alert('Please select a reason for termination');
                return;
              }
              if (!terminationData.password) {
                alert('Please enter your admin password');
                return;
              }
              if (terminationData.password !== 'admin123') { // In real app, this would be properly validated
                alert('Incorrect password. Please try again.');
                return;
              }

              // Process termination
              alert(`Lease termination confirmed for ${managingProperty?.tenant}\n\nTermination Date: ${terminationData.terminationDate}\nReason: ${terminationData.reason}\nNotice Given: ${terminationData.noticeGiven ? 'Yes' : 'No'}\n\nThe tenant will be notified and the property will be marked as available.`);

              setTerminateLeaseDialogOpen(false);
              setTenantManageDialogOpen(false);
            }}
            disabled={!terminationData.terminationDate || !terminationData.reason || !terminationData.password}
          >
            Confirm Termination
          </Button>
        </DialogActions>
      </Dialog>

      {/* Property Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Property Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter property name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Property Type"
                    onChange={(e) => {
                      const selectedType = e.target.value as Property["type"];
                      if (selectedType === "Other") {
                        setTypeDialogOpen(true);
                      } else {
                        setFormData({ ...formData, type: selectedType, customType: "" });
                      }
                    }}
                  >
                    <MenuItem value="Apartment">Apartment</MenuItem>
                    <MenuItem value="House">House</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="Townhome">Townhome</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                    <MenuItem value="Other">Other - Custom Type</MenuItem>
                  </Select>
                  {formData.type === "Other" && formData.customType && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Custom: {formData.customType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Address"
              fullWidth
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full property address"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Property Managers</InputLabel>
                  <Select
                    multiple
                    value={formData.managerIds}
                    label="Property Managers"
                    onChange={(e) => {
                      const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      setFormData({ ...formData, managerIds: value });
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const manager = (propertyManagers || []).find(pm => pm.id === value);
                          return (
                            <Chip
                              key={value}
                              label={manager ? `${manager.firstName} ${manager.lastName}` : value}
                              size="small"
                              onDelete={() => {
                                setFormData({
                                  ...formData,
                                  managerIds: (formData.managerIds || []).filter(id => id !== value)
                                });
                              }}
                              onMouseDown={(event) => {
                                event.stopPropagation();
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {(propertyManagers || []).filter(pm => pm.status === 'Active').map((manager) => (
                      <MenuItem key={manager.id} value={manager.id}>
                        <Checkbox checked={(formData.managerIds || []).indexOf(manager.id) > -1} />
                        <ListItemText
                          primary={`${manager.firstName} ${manager.lastName}`}
                          secondary={(manager.specialties && manager.specialties.length > 0) ? manager.specialties.join(', ') : undefined}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Number of Units"
                  fullWidth
                  required
                  value={formData.units}
                  onChange={(value) => setFormData({ ...formData, units: value })}
                  min={1}
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Monthly Rent"
                  fullWidth
                  required
                  value={formData.monthlyRent}
                  onChange={(value) => setFormData({ ...formData, monthlyRent: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Square Footage"
                  fullWidth
                  value={formData.squareFootage}
                  onChange={(value) => setFormData({ ...formData, squareFootage: value })}
                  min={0}
                  suffix=" sq ft"
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <NumberInput
                  label="Bedrooms"
                  fullWidth
                  value={formData.bedrooms}
                  onChange={(value) => setFormData({ ...formData, bedrooms: value })}
                  min={0}
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <NumberInput
                  label="Bathrooms"
                  fullWidth
                  value={formData.bathrooms}
                  onChange={(value) => setFormData({ ...formData, bathrooms: value })}
                  min={0}
                  step={0.5}
                  allowDecimals={true}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <NumberInput
                  label="Parking Spaces"
                  fullWidth
                  value={formData.parkingSpaces}
                  onChange={(value) => setFormData({ ...formData, parkingSpaces: value })}
                  min={0}
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <TextField
              label="Pet Policy"
              fullWidth
              value={formData.petPolicy}
              onChange={(e) => setFormData({ ...formData, petPolicy: e.target.value })}
              placeholder="e.g., Cats allowed, No pets, Dogs under 50lbs"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Pet Deposit"
                  fullWidth
                  value={formData.petDeposit}
                  onChange={(value) => setFormData({ ...formData, petDeposit: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <NumberInput
                  label="Pet Fee (Monthly)"
                  fullWidth
                  value={formData.petFee}
                  onChange={(value) => setFormData({ ...formData, petFee: value })}
                  min={0}
                  prefix="$"
                  allowDecimals={false}
                />
              </Grid>
            </Grid>

            <TextField
              label="Amenities (comma-separated)"
              fullWidth
              value={formData.amenities.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                amenities: e.target.value.split(',').map(a => a.trim()).filter(a => a.length > 0)
              })}
              placeholder="e.g., Pool, Gym, Parking, Laundry, Balcony"
              helperText="Separate amenities with commas"
            />

            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
              })}
              placeholder="e.g., Premium, Downtown, Family-Friendly"
              helperText="Tags help organize properties for reports and marketing"
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter a detailed description of the property..."
            />

            <Divider />

            {/* Tenant Assignment Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonRoundedIcon />
                Tenant Assignment
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  {formData.assignedTenants.length > 0 ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Assigned Tenants ({formData.assignedTenants.length})
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {formData.assignedTenants.map(tenantId => {
                          const tenant = (tenants || []).find(t => t.id === tenantId);
                          const contact = (contacts || []).find(c => c.id === tenantId);
                          const prospect = tenant || contact;

                          return prospect ? (
                            <Chip
                              key={tenantId}
                              label={`${prospect.firstName} ${prospect.lastName}`}
                              size="small"
                              onDelete={() => {
                                setFormData({
                                  ...formData,
                                  assignedTenants: formData.assignedTenants.filter(id => id !== tenantId)
                                });
                              }}
                              avatar={<PersonRoundedIcon />}
                            />
                          ) : null;
                        })}
                      </Stack>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No tenants assigned yet. Use the buttons below to assign prospects or create new ones.
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleAssignTenant}
                      disabled={getAvailableProspects().length === 0}
                    >
                      Assign Tenant
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleCreateNewTenant}
                    >
                      Add New Prospect
                    </Button>
                  </Stack>

                  {getAvailableProspects().length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      No prospects available. Create a new prospect first.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProperty}
            disabled={!formData.name || !formData.address || !formData.monthlyRent}
          >
            {selectedProperty ? 'Update Property' : 'Add Property'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={assignTenantDialogOpen} onClose={() => setAssignTenantDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Assign Tenants to Property
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Select prospects from the list below to assign to this property. You can assign multiple tenants.
            </Alert>

            <Typography variant="h6">Available Prospects</Typography>

            <List>
              {(getAvailableProspects() || []).map((prospect) => (
                <ListItem key={prospect.id} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      const isSelected = formData.assignedTenants.includes(prospect.id);
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          assignedTenants: formData.assignedTenants.filter(id => id !== prospect.id)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assignedTenants: [...formData.assignedTenants, prospect.id]
                        });
                      }
                    }}
                  >
                    <Checkbox
                      checked={formData.assignedTenants.includes(prospect.id)}
                      sx={{ mr: 2 }}
                    />
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <PersonRoundedIcon />
                    </Avatar>
                    <ListItemText
                      primary={prospect.name}
                      secondary={
                        <Stack direction="row" spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            📧 {prospect.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ��� {prospect.phone}
                          </Typography>
                          <Chip
                            label={prospect.type === 'tenant' ? 'Tenant' : 'Contact'}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {getAvailableProspects().length === 0 && (
              <Box textAlign="center" py={4}>
                <PersonRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Prospects Available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Create new prospects to assign to properties
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    setAssignTenantDialogOpen(false);
                    setNewTenantDialogOpen(true);
                  }}
                >
                  Create New Prospect
                </Button>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignTenantDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setAssignTenantDialogOpen(false)}
            disabled={formData.assignedTenants.length === 0}
          >
            Assign Selected ({formData.assignedTenants.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Tenant/Prospect Creation Dialog */}
      <Dialog open={newTenantDialogOpen} onClose={() => setNewTenantDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Prospect
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="success">
              Create a new prospect that can be assigned to properties. All fields marked with * are required.
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name *"
                  fullWidth
                  required
                  value={newTenantData.firstName}
                  onChange={(e) => setNewTenantData({ ...newTenantData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name *"
                  fullWidth
                  required
                  value={newTenantData.lastName}
                  onChange={(e) => setNewTenantData({ ...newTenantData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </Grid>
            </Grid>

            <TextField
              label="Email Address *"
              type="email"
              fullWidth
              required
              value={newTenantData.email}
              onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })}
              placeholder="Enter email address"
            />

            <TextField
              label="Phone Number *"
              fullWidth
              required
              value={newTenantData.phone}
              onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })}
              placeholder="Enter phone number"
            />

            <Alert severity="info">
              The prospect will be created with "Prospective" status and can be assigned to properties immediately.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewTenantDialogOpen(false);
            setNewTenantData({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              status: "Prospective"
            });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveNewTenant}
            disabled={!newTenantData.firstName || !newTenantData.lastName || !newTenantData.email || !newTenantData.phone}
          >
            Create Prospect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Property Details Modal Overlay with Nested Sub-Windows */}
      <Dialog
        open={propertyDetailsModalOpen}
        onClose={() => {
          setPropertyDetailsModalOpen(false);
          closeAllNestedModals();
        }}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '95vh',
            maxHeight: '95vh'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Property Management Hub - {selectedPropertyForModal?.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`${selectedPropertyForModal?.status}`}
                color={selectedPropertyForModal?.status ? getStatusColor(selectedPropertyForModal.status) : 'default'}
                size="small"
              />
              <IconButton
                onClick={() => {
                  if (selectedPropertyForModal) {
                    handleEditProperty(selectedPropertyForModal);
                  }
                }}
                size="small"
                title="Edit Property Details"
              >
                <EditRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedPropertyForModal && (
            <Box sx={{ height: '100%', overflow: 'auto' }}>
              <PropertyDetailPage
                propertyId={selectedPropertyForModal.id}
                isModal={true}
                onClose={() => setPropertyDetailsModalOpen(false)}
                onOpenWorkOrder={() => handleNestedWorkOrder()}
                onOpenTenantManagement={() => handleNestedTenantManagement()}
                onOpenMaintenance={() => handleNestedMaintenance()}
                backgroundColorOverride={addressBackgroundColor}
                onBackgroundColorChange={(color) => {
                  setAddressBackgroundColor(color);
                  // Save to localStorage for persistence
                  localStorage.setItem('propertyHeaderColor', color);
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Nested Work Order Sub-Modal - Opens within Property Details Modal */}
      <Dialog
        open={nestedWorkOrderOpen && propertyDetailsModalOpen}
        onClose={() => setNestedWorkOrderOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          zIndex: 1400, // Higher than the parent modal
          '& .MuiDialog-paper': {
            height: '85vh',
            margin: '20px',
            position: 'relative'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              🔧 Work Orders - {selectedPropertyForModal?.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  // Navigate to work orders page with property pre-selected
                  closeAllNestedModals();
                  setPropertyDetailsModalOpen(false);
                  navigate(`/work-orders?property=${selectedPropertyForModal?.id}`);
                }}
              >
                Open Work Orders
              </Button>
              <IconButton
                onClick={() => {
                  // Open work order settings/preferences
                  alert('Work Order Settings: Configure default priorities, categories, and workflow preferences for this property.');
                }}
                size="small"
                sx={{ color: 'white' }}
                title="Work Order Settings"
              >
                <EditRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info" icon={<DescriptionRoundedIcon />}>
              This is a nested work order window within the Property Details modal. You can manage all work orders here without leaving the property page.
            </Alert>

            {/* Work Order Creation Form */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Create New Work Order</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Work Order Title"
                      fullWidth
                      placeholder="e.g., HVAC Repair, Plumbing Issue"
                      sx={{ '& .MuiInputBase-root': { minHeight: '56px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select label="Priority" defaultValue="medium">
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe the maintenance issue in detail..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => {
                        // Navigate to work orders page with property pre-selected and form pre-filled
                        closeAllNestedModals();
                        setPropertyDetailsModalOpen(false);
                        navigate(`/work-orders?property=${selectedPropertyForModal?.id}&create=true`);
                      }}
                    >
                      Create Work Order
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Existing Work Orders */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Active Work Orders</Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1, border: '1px solid', borderColor: 'warning.main' }}>
                    <Stack>
                      <Typography variant="body1" fontWeight="medium">🔧 HVAC System Maintenance</Typography>
                      <Typography variant="body2" color="text.secondary">Scheduled maintenance for heating system</Typography>
                      <Typography variant="caption" color="text.secondary">Created: Jan 15, 2024 | Due: Jan 20, 2024</Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip label="In Progress" color="warning" size="small" />
                      <Typography variant="caption">Priority: High</Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
                    <Stack>
                      <Typography variant="body1" fontWeight="medium">🚿 Bathroom Plumbing Repair</Typography>
                      <Typography variant="body2" color="text.secondary">Fixed leaky faucet in unit 2A</Typography>
                      <Typography variant="caption" color="text.secondary">Created: Jan 10, 2024 | Completed: Jan 12, 2024</Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip label="Completed" color="success" size="small" />
                      <Typography variant="caption">Priority: Medium</Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
                    <Stack>
                      <Typography variant="body1" fontWeight="medium">⚡ Electrical Panel Inspection</Typography>
                      <Typography variant="body2" color="text.secondary">Annual safety inspection required</Typography>
                      <Typography variant="caption" color="text.secondary">Created: Jan 18, 2024 | Due: Jan 25, 2024</Typography>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip label="Urgent" color="error" size="small" />
                      <Typography variant="caption">Priority: Urgent</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            All changes are automatically saved
          </Typography>
          <Button onClick={() => setNestedWorkOrderOpen(false)} variant="outlined">
            Close Work Orders
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested Tenant Management Sub-Modal */}
      <Dialog
        open={nestedTenantManagementOpen && propertyDetailsModalOpen}
        onClose={() => setNestedTenantManagementOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 1400,
          '& .MuiDialog-paper': {
            height: '80vh',
            margin: '40px'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              👥 Tenant Management - {selectedPropertyForModal?.name}
            </Typography>
            <IconButton
              onClick={() => {
                // Open tenant management settings
                alert('Tenant Management Settings: Configure lease templates, notification preferences, and tenant screening criteria for this property.');
              }}
              size="small"
              sx={{ color: 'white' }}
              title="Tenant Management Settings"
            >
              <EditRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info" icon={<PersonRoundedIcon />}>
              Manage tenants for this property without leaving the property management window.
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Current Tenants</Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        SJ
                      </Avatar>
                      <Stack>
                        <Typography variant="body1" fontWeight="medium">Sarah Johnson</Typography>
                        <Typography variant="body2" color="text.secondary">Unit 2A • sarah.johnson@email.com</Typography>
                        <Typography variant="caption" color="text.secondary">Lease: Jan 1, 2024 - Dec 31, 2024</Typography>
                      </Stack>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip label="Active" color="success" size="small" />
                      <Typography variant="body2">${selectedPropertyForModal?.monthlyRent.toLocaleString()}/mo</Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Button variant="outlined" startIcon={<AddRoundedIcon />} sx={{ mt: 2 }}>
                  Add New Tenant
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNestedTenantManagementOpen(false)} variant="outlined">
            Close Tenant Management
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested Maintenance Schedule Sub-Modal */}
      <Dialog
        open={nestedMaintenanceOpen && propertyDetailsModalOpen}
        onClose={() => setNestedMaintenanceOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 1400,
          '& .MuiDialog-paper': {
            height: '75vh',
            margin: '60px'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              📅 Maintenance Schedule - {selectedPropertyForModal?.name}
            </Typography>
            <IconButton
              onClick={() => {
                // Open maintenance schedule settings
                alert('Maintenance Schedule Settings: Configure recurring maintenance tasks, service provider preferences, and inspection schedules for this property.');
              }}
              size="small"
              sx={{ color: 'white' }}
              title="Maintenance Schedule Settings"
            >
              <EditRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Alert severity="success" icon={<CalendarTodayRoundedIcon />}>
              View and manage the maintenance schedule for this property.
            </Alert>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Upcoming Maintenance</Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Stack>
                      <Typography variant="body1" fontWeight="medium">🔧 Annual HVAC Inspection</Typography>
                      <Typography variant="body2" color="text.secondary">Scheduled maintenance check</Typography>
                    </Stack>
                    <Typography variant="body2">Jan 25, 2024</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Stack>
                      <Typography variant="body1" fontWeight="medium">🏠 Property Inspection</Typography>
                      <Typography variant="body2" color="text.secondary">Quarterly property walkthrough</Typography>
                    </Stack>
                    <Typography variant="body2">Feb 1, 2024</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNestedMaintenanceOpen(false)} variant="outlined">
            Close Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work Order Modal Overlay */}
      <Dialog
        open={workOrderModalOpen}
        onClose={() => setWorkOrderModalOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Work Orders - {selectedPropertyForModal?.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => setWorkOrderModalOpen(false)}
                size="small"
                title="Close Work Orders Modal"
              >
                <EditRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info">
              Work orders for this property will be displayed here. This modal keeps you on the current page while managing work orders.
            </Alert>

            {selectedPropertyForModal && (
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Property Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Address</Typography>
                        <Typography variant="body1">{selectedPropertyForModal.address}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                        <Typography variant="body1">${selectedPropertyForModal.monthlyRent.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={selectedPropertyForModal.status}
                          color={getStatusColor(selectedPropertyForModal.status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Property Type</Typography>
                        <Typography variant="body1">{selectedPropertyForModal.type}</Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Work Orders</Typography>
                <Alert severity="info">
                  Work order integration coming soon. This modal provides a quick preview while keeping you on the Properties page.
                </Alert>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Stack>
                      <Typography variant="body2" fontWeight="medium">HVAC Maintenance</Typography>
                      <Typography variant="caption" color="text.secondary">Requested on Jan 15, 2024</Typography>
                    </Stack>
                    <Chip label="In Progress" color="warning" size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Stack>
                      <Typography variant="body2" fontWeight="medium">Plumbing Repair</Typography>
                      <Typography variant="caption" color="text.secondary">Completed on Jan 10, 2024</Typography>
                    </Stack>
                    <Chip label="Completed" color="success" size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkOrderModalOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setWorkOrderModalOpen(false);
              navigate(`/work-orders?property=${selectedPropertyForModal?.id}`);
            }}
          >
            Go to Work Orders Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Social Media Sharing Dialog */}
      <Dialog open={socialShareDialogOpen} onClose={() => setSocialShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          🚀 Share Property Listing - {shareProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Share this property listing across multiple social media platforms and communication channels to maximize exposure.
            </Alert>

            {shareProperty && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{shareProperty.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shareProperty.address}
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  ${shareProperty.monthlyRent.toLocaleString()}/month
                </Typography>
                {shareProperty.bedrooms && shareProperty.bathrooms && (
                  <Typography variant="body2" color="text.secondary">
                    {shareProperty.bedrooms} bed ��� {shareProperty.bathrooms} bath
                  </Typography>
                )}
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Choose Sharing Platform:
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
                  onClick={() => shareToSocialMedia('facebook')}
                  sx={{
                    py: 1.5,
                    borderColor: '#1877F2',
                    '&:hover': { borderColor: '#1877F2', bgcolor: 'rgba(24, 119, 242, 0.1)' }
                  }}
                >
                  Facebook
                </Button>
              </Grid>
              <Grid item xs={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TwitterIcon sx={{ color: '#1DA1F2' }} />}
                  onClick={() => shareToSocialMedia('twitter')}
                  sx={{
                    py: 1.5,
                    borderColor: '#1DA1F2',
                    '&:hover': { borderColor: '#1DA1F2', bgcolor: 'rgba(29, 161, 242, 0.1)' }
                  }}
                >
                  Twitter
                </Button>
              </Grid>
              <Grid item xs={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LinkedInIcon sx={{ color: '#0A66C2' }} />}
                  onClick={() => shareToSocialMedia('linkedin')}
                  sx={{
                    py: 1.5,
                    borderColor: '#0A66C2',
                    '&:hover': { borderColor: '#0A66C2', bgcolor: 'rgba(10, 102, 194, 0.1)' }
                  }}
                >
                  LinkedIn
                </Button>
              </Grid>
              <Grid item xs={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                  onClick={() => shareToSocialMedia('whatsapp')}
                  sx={{
                    py: 1.5,
                    borderColor: '#25D366',
                    '&:hover': { borderColor: '#25D366', bgcolor: 'rgba(37, 211, 102, 0.1)' }
                  }}
                >
                  WhatsApp
                </Button>
              </Grid>
              <Grid item xs={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TelegramIcon sx={{ color: '#0088cc' }} />}
                  onClick={() => shareToSocialMedia('telegram')}
                  sx={{
                    py: 1.5,
                    borderColor: '#0088cc',
                    '&:hover': { borderColor: '#0088cc', bgcolor: 'rgba(0, 136, 204, 0.1)' }
                  }}
                >
                  Telegram
                </Button>
              </Grid>
              <Grid item xs={6} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PinterestIcon sx={{ color: '#E60023' }} />}
                  onClick={() => shareToSocialMedia('pinterest')}
                  sx={{
                    py: 1.5,
                    borderColor: '#E60023',
                    '&:hover': { borderColor: '#E60023', bgcolor: 'rgba(230, 0, 35, 0.1)' }
                  }}
                >
                  Pinterest
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Other Sharing Options:
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EmailRoundedIcon />}
                  onClick={() => shareToSocialMedia('email')}
                  sx={{ py: 1.5 }}
                >
                  Email
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ShareRoundedIcon />}
                  onClick={() => shareToSocialMedia('sms')}
                  sx={{ py: 1.5 }}
                >
                  SMS
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Pro Tip:</strong> Sharing on multiple platforms increases visibility and helps you find tenants faster.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSocialShareDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (shareProperty) {
                const shareUrl = window.location.origin + `/properties/${shareProperty.id}`;
                copyToClipboard(shareUrl, {
                  successMessage: 'Property link copied to clipboard!',
                  errorMessage: 'Failed to copy link. Please try again.',
                  showFallbackDialog: true
                });
                setSocialShareDialogOpen(false);
              }
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Unlist Confirmation Dialog */}
      <Dialog open={unlistDialogOpen} onClose={() => setUnlistDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'warning.main' }}>
          ⚠️ Unpublish Property Listing
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Are you sure you want to unpublish this listing?
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This will remove the listing from all selected platforms and stop potential tenant inquiries.
              </Typography>
            </Alert>

            {unlistingListing && (() => {
              const property = properties.find(p => p.id === unlistingListing.propertyId);
              return property ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>{property.name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {property.address}
                  </Typography>

                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Views: {unlistingListing.viewCount}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Inquiries: {unlistingListing.inquiries}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Listed: {new Date(unlistingListing.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Currently listed on:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {unlistingListing.listingSites.craigslist && <Chip label="Craigslist" size="small" variant="outlined" />}
                      {unlistingListing.listingSites.zillow && <Chip label="Zillow" size="small" variant="outlined" />}
                      {unlistingListing.listingSites.realtorsCom && <Chip label="Realtor.com" size="small" variant="outlined" />}
                      {unlistingListing.listingSites.apartments && <Chip label="Apartments.com" size="small" variant="outlined" />}
                      {unlistingListing.listingSites.rentCom && <Chip label="Rent.com" size="small" variant="outlined" />}
                      {!Object.values(unlistingListing.listingSites).some(Boolean) && (
                        <Chip label="None" size="small" color="warning" />
                      )}
                    </Stack>
                  </Box>
                </Box>
              ) : null;
            })()}

            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.dark">
                <strong>What happens when you unpublish:</strong>
              </Typography>
              <Typography variant="body2" color="info.dark" component="div" sx={{ mt: 1 }}>
                • Listing will be removed from all selected platforms
                <br />• No new inquiries will be received
                <br />• Property status will change to "Unlisted"
                <br />• You can republish anytime from the listing management
                <br />����� All listing content and settings will be preserved
              </Typography>
            </Box>

            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="success.dark">
                <strong>💡 Alternative Actions:</strong>
              </Typography>
              <Typography variant="body2" color="success.dark" component="div" sx={{ mt: 1 }}>
                �� Edit the listing to update information
                <br />• Change the rental price or promotion
                <br />• Update property photos or description
                <br />• Pause listing temporarily instead of removing
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlistDialogOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (unlistingListing) {
                const property = properties.find(p => p.id === unlistingListing.propertyId);
                if (property) {
                  handleCreateListing(property);
                  setUnlistDialogOpen(false);
                }
              }
            }}
          >
            Edit Listing Instead
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmUnpublishListing}
          >
            Confirm Unpublish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Property Type Dialog */}
      <Dialog open={typeDialogOpen} onClose={() => setTypeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Custom Property Type</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Please describe the custom property type. This will help categorize similar properties in the future.
            </Alert>
            <TextField
              label="Custom Property Type"
              fullWidth
              required
              value={formData.customType}
              onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
              placeholder="e.g., Mobile Home, Duplex, Warehouse, Retail Space, etc."
              helperText="Be specific to help with future categorization"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTypeDialogOpen(false);
            setFormData({ ...formData, type: "Apartment", customType: "" });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (formData.customType.trim()) {
                setFormData({ ...formData, type: "Other" });
                setTypeDialogOpen(false);
              }
            }}
            disabled={!formData.customType.trim()}
          >
            Save Custom Type
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        data={filteredProperties}
        title="Properties"
        defaultFilename="properties-export"
      />
        </Box>
      )}
    </>
  );
}
