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
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
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
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import PropertyDetailPage from "./PropertyDetailPage";

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

const mockProperties: Property[] = [
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
    customContent: "Stunning oceanfront villa available for rent! This property features...",
    htmlContent: "<h2>Stunning Oceanfront Villa</h2><p>This property features...</p>",
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

export default function PropertiesEnhanced() {
  const [properties, setProperties] = React.useState<Property[]>(mockProperties);
  const [listings, setListings] = React.useState<PropertyListing[]>(mockListings);
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
    type: "Apartment",
    units: 1,
    monthlyRent: 0,
    manager: "",
    description: "",
    amenities: [] as string[],
    squareFootage: 0,
    bedrooms: 0,
    bathrooms: 0,
    petPolicy: "",
    parkingSpaces: 0,
  });
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
  const [propertyDetailOpen, setPropertyDetailOpen] = React.useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | null>(null);

  // Get vacant properties for listings
  const vacantProperties = properties.filter(p => p.status === "Available");
  
  // Get properties with existing listings
  const propertiesWithListings = properties.filter(p => 
    listings.some(l => l.propertyId === p.id)
  );

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleCreateListing = (property: Property) => {
    setSelectedProperty(property);
    const existingListing = listings.find(l => l.propertyId === property.id);
    
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

  const generateDefaultListingContent = (property: Property) => {
    return `🏠 ${property.name} - Available Now!

📍 Location: ${property.address}
💰 Rent: $${property.monthlyRent.toLocaleString()}/month
🛏️ Bedrooms: ${property.bedrooms || 'TBD'}
🚿 Bathrooms: ${property.bathrooms || 'TBD'}
📐 Square Footage: ${property.squareFootage ? `${property.squareFootage} sq ft` : 'TBD'}
🚗 Parking: ${property.parkingSpaces || 0} space(s)
🐕 Pet Policy: ${property.petPolicy || 'Contact for details'}

✨ Amenities:
${property.amenities?.map(amenity => `• ${amenity}`).join('\n') || '• Contact for amenities list'}

📝 Description:
${property.description || 'Beautiful property available for rent. Contact us for more details!'}

📞 Contact us today to schedule a viewing!
🕐 Available for immediate move-in`;
  };

  const generateHTMLContent = (property: Property, customContent: string) => {
    const mainImage = property.images.find(img => img.id === property.mainImageId);
    
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
        <p><strong>💰 $${property.monthlyRent.toLocaleString()}/month</strong></p>
    </div>
    
    ${mainImage ? `<img src="${mainImage.url}" alt="${mainImage.alt}" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;">` : ''}
    
    <div class="property-details">
        <div class="detail-item"><strong>🛏️ Bedrooms:</strong> ${property.bedrooms || 'TBD'}</div>
        <div class="detail-item"><strong>🚿 Bathrooms:</strong> ${property.bathrooms || 'TBD'}</div>
        <div class="detail-item"><strong>📐 Square Footage:</strong> ${property.squareFootage ? `${property.squareFootage} sq ft` : 'TBD'}</div>
        <div class="detail-item"><strong>🚗 Parking:</strong> ${property.parkingSpaces || 0} space(s)</div>
        <div class="detail-item"><strong>🐕 Pet Policy:</strong> ${property.petPolicy || 'Contact for details'}</div>
    </div>
    
    <h3>✨ Amenities</h3>
    <ul class="amenities">
        ${property.amenities?.map(amenity => `<li>${amenity}</li>`).join('') || '<li>Contact for amenities list</li>'}
    </ul>
    
    <h3>📝 Description</h3>
    <p>${property.description || 'Beautiful property available for rent. Contact us for more details!'}</p>
    
    <div class="contact">
        <h3>📞 Contact us today to schedule a viewing!</h3>
        <p>🕐 Available for immediate move-in</p>
    </div>
</body>
</html>`;
  };

  const handleSaveListing = () => {
    if (!selectedProperty) return;

    const htmlContent = generateHTMLContent(selectedProperty, listingFormData.customContent);
    
    if (selectedListing) {
      // Update existing listing
      setListings(prev => prev.map(listing =>
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
      setListings(prev => [...prev, newListing]);
    }
    
    setOpenListingDialog(false);
    alert(`Listing ${selectedListing ? 'updated' : 'created'} successfully!`);
  };

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setPropertyDetailOpen(true);
  };

  const handlePublishListing = (listingId: string) => {
    setListings(prev => prev.map(listing =>
      listing.id === listingId
        ? { ...listing, status: "Listed" as const, lastUpdated: new Date().toISOString().split('T')[0] }
        : listing
    ));
    alert("Listing published successfully!");
  };

  const handleUnpublishListing = (listingId: string) => {
    setListings(prev => prev.map(listing =>
      listing.id === listingId
        ? { ...listing, status: "Unlisted" as const, lastUpdated: new Date().toISOString().split('T')[0] }
        : listing
    ));
    alert("Listing unpublished successfully!");
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

    navigator.clipboard.writeText(contentToCopy).then(() => {
      alert(`${type.toUpperCase()} content copied to clipboard!`);
    }).catch((err) => {
      console.error('Failed to copy content: ', err);
      alert('Failed to copy content to clipboard. Please try again.');
    });
  };

  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === "Occupied").length;
  const availableProperties = properties.filter(p => p.status === "Available").length;
  const totalRevenue = properties.reduce((sum, p) => sum + (p.status === "Occupied" ? p.monthlyRent : 0), 0);
  const activeListings = listings.filter(l => l.status === "Listed").length;
  const totalListingViews = listings.reduce((sum, l) => sum + l.viewCount, 0);
  const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Property Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => {
            setSelectedProperty(null);
            setFormData({
              name: "",
              address: "",
              type: "Apartment",
              units: 1,
              monthlyRent: 0,
              manager: "",
              description: "",
              amenities: [],
              squareFootage: 0,
              bedrooms: 0,
              bathrooms: 0,
              petPolicy: "",
              parkingSpaces: 0,
            });
            setOpenDialog(true);
          }}
        >
          Add Property
        </Button>
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
                    <Typography variant="h6" color="text.secondary">
                      Total Properties
                    </Typography>
                    <Typography variant="h4">{totalProperties}</Typography>
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
                    <Typography variant="h6" color="text.secondary">
                      Occupied
                    </Typography>
                    <Typography variant="h4">{occupiedProperties}</Typography>
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
                    <Typography variant="h6" color="text.secondary">
                      Available
                    </Typography>
                    <Typography variant="h4">{availableProperties}</Typography>
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
                    <Typography variant="h6" color="text.secondary">
                      Monthly Revenue
                    </Typography>
                    <Typography variant="h4">${totalRevenue.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
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
        </Box>

        {/* Properties Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property Details</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Type & Units</TableCell>
                <TableCell>Rent & Status</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {property.mainImageId && property.images.length > 0 ? (
                        <Avatar
                          src={property.images.find(img => img.id === property.mainImageId)?.url}
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
                        {property.images.length > 0 && (
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
                          onClick={() => handlePropertyClick(property.id)}
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
                    <Typography variant="body2">{property.manager}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      <Tooltip title="Manage Pictures">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProperty(property);
                            setPropertyImages([...property.images]);
                            setOpenPictureDialog(true);
                          }}
                          color="primary"
                        >
                          <Badge badgeContent={property.images.length} color="info">
                            <PhotoCameraRoundedIcon />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                      
                      {property.status === "Available" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleCreateListing(property)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          List
                        </Button>
                      )}
                      
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => alert('Tenant management feature - would open tenant assignment dialog')}
                      >
                        Manage
                      </Button>
                      
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedProperty(property);
                          setFormData({
                            name: property.name,
                            address: property.address,
                            type: property.type,
                            units: property.units,
                            monthlyRent: property.monthlyRent,
                            manager: property.manager,
                            description: property.description || "",
                            amenities: property.amenities || [],
                            squareFootage: property.squareFootage || 0,
                            bedrooms: property.bedrooms || 0,
                            bathrooms: property.bathrooms || 0,
                            petPolicy: property.petPolicy || "",
                            parkingSpaces: property.parkingSpaces || 0,
                          });
                          setOpenDialog(true);
                        }}
                      >
                        <EditRoundedIcon />
                      </IconButton>
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
        {vacantProperties.length > listings.length && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have {vacantProperties.length - listings.length} vacant property(ies) that haven't been listed yet. 
            Consider creating listings to attract potential tenants.
          </Alert>
        )}

        {/* Properties with Listings */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Properties with Listings
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {propertiesWithListings.map((property) => {
            const listing = listings.find(l => l.propertyId === property.id);
            if (!listing) return null;
            
            return (
              <Grid item xs={12} md={6} key={property.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {property.mainImageId && property.images.length > 0 ? (
                          <Avatar
                            src={property.images.find(img => img.id === property.mainImageId)?.url}
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
                        >
                          <ContentCopyRoundedIcon />
                        </IconButton>
                        
                        <IconButton size="small">
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
          {vacantProperties
            .filter(property => !listings.some(l => l.propertyId === property.id))
            .map((property) => (
              <Grid item xs={12} md={6} key={property.id}>
                <Card sx={{ border: '2px dashed', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {property.mainImageId && property.images.length > 0 ? (
                          <Avatar
                            src={property.images.find(img => img.id === property.mainImageId)?.url}
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

      {/* Listing Editor Dialog */}
      <Dialog open={openListingDialog} onClose={() => setOpenListingDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedListing ? "Edit Listing" : "Create Listing"} - {selectedProperty?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Listing Sites Selection */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Select Listing Sites</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={2}>
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
                </Grid>
                <Grid item xs={6} md={2}>
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
                </Grid>
                <Grid item xs={6} md={2}>
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
                </Grid>
                <Grid item xs={6} md={2}>
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
                </Grid>
                <Grid item xs={6} md={2}>
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
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Promotions Selection */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Add Promotion (Optional)</Typography>
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
                      {promo.title} - {promo.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Listing Content Editor */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Listing Content</Typography>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={listingFormData.customContent}
                onChange={(e) => setListingFormData({ ...listingFormData, customContent: e.target.value })}
                placeholder="Enter your listing description..."
                variant="outlined"
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

      {/* Include all the existing dialogs and other components... */}
      {/* This would include the Add/Edit Property Dialog and Picture Management Dialog from the original component */}

      {/* Property Detail Page */}
      {propertyDetailOpen && selectedPropertyId && (
        <PropertyDetailPage
          propertyId={selectedPropertyId}
          onClose={() => {
            setPropertyDetailOpen(false);
            setSelectedPropertyId(null);
          }}
        />
      )}
    </Box>
  );
}
