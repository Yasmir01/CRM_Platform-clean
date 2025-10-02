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
  Paper,
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
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  FormControlLabel,
  Switch,
  Accordion,
  Checkbox,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  styled,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import { useCrmData, Property } from "../contexts/CrmDataContext";
import CrmActivitiesTimeline from "../components/CrmActivitiesTimeline";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useAuth } from "../contexts/AuthContext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import MessageRoundedIcon from "@mui/icons-material/MessageRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import InputAdornment from "@mui/material/InputAdornment";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import KitchenRoundedIcon from "@mui/icons-material/KitchenRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import DirectionsRoundedIcon from "@mui/icons-material/DirectionsRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import WorkOrderDialog from "../components/WorkOrderDialog";
import TenantDialog from "../components/TenantDialog";
import PropertyApplicationDialog from "../components/PropertyApplicationDialog";
import FormFixesSummary from "../components/FormFixesSummary";
import PropertyBankAccountSection from "../components/PropertyBankAccountSection";
import OwnersDistribution from "../components/OwnersDistribution";
import { LateFeeService } from "../services/LateFeeService";
import { activityTracker } from "../services/ActivityTrackingService";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface PropertyDetailPageProps {
  propertyId: string;
  onClose?: () => void;
  isModal?: boolean;
  onOpenWorkOrder?: () => void;
  onOpenTenantManagement?: () => void;
  onOpenMaintenance?: () => void;
  backgroundColorOverride?: string;
  onBackgroundColorChange?: (color: string) => void;
  autoOpenApplication?: boolean;
  autoOpenTenantDialog?: boolean;
}

interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  rotation: number;
  isMain: boolean;
  order: number;
}

interface ApplianceImage {
  id: string;
  url: string;
  alt: string;
  dateAdded: string;
}

interface Appliance {
  id: string;
  name: string;
  type: "Refrigerator" | "Stove" | "Dishwasher" | "Water Heater" | "HVAC Unit" | "Microwave" | "Garbage Disposal" | "Other";
  brand?: string;
  model?: string;
  serialNumber?: string;
  datePurchased?: string;
  dateInstalled?: string;
  lastServiced?: string;
  nextServiceDue?: string;
  warrantyExpires?: string;
  status: "Working" | "Needs Service" | "Broken" | "Replaced";
  notes?: string;
  images?: ApplianceImage[];
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
  lateFeeOverrideEnabled?: boolean;
  lateFeeBaseFee?: number;
  lateFeeDailyRate?: number;
  lateFeePercentageRate?: number;
  lateFeeGraceDays?: number;
  lateFeeMode?: 'flat' | 'percent';
  mainImageId?: string;
  description?: string;
  amenities?: string[];
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  petPolicy?: string;
  parkingSpaces?: number;
  leaseStartDate?: string;
  leaseEndDate?: string;
  yearBuilt?: number;
  propertyTaxes?: number;
  insurance?: number;
  maintenance?: number;
  appliances?: Appliance[];
}

// Activity interface removed - now using real activity tracking system

interface Expense {
  id: string;
  category: "Maintenance" | "Utilities" | "Insurance" | "Taxes" | "Management" | "Other";
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  receipt?: string;
}

interface Income {
  id: string;
  type: "Rent" | "Deposit" | "Fee" | "Other";
  description: string;
  amount: number;
  date: string;
  tenant?: string;
}

const mockProperty: Property = {
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
  leaseStartDate: "2024-01-01",
  leaseEndDate: "2024-12-31",
  yearBuilt: 2015,
  propertyTaxes: 4500,
  insurance: 1200,
  maintenance: 800,
  appliances: [
    {
      id: "1",
      name: "Kitchen Refrigerator",
      type: "Refrigerator",
      brand: "Whirlpool",
      model: "WRF535SWHZ",
      serialNumber: "WH123456789",
      datePurchased: "2023-01-15",
      dateInstalled: "2023-01-20",
      lastServiced: "2023-08-15",
      nextServiceDue: "2024-02-15",
      warrantyExpires: "2025-01-15",
      status: "Working",
      notes: "Energy Star certified, stainless steel",
      images: [
        {
          id: "img1",
          url: "https://via.placeholder.com/300x200/0066CC/FFFFFF?text=Refrigerator+Front",
          alt: "Refrigerator front view",
          dateAdded: "2023-01-20"
        },
        {
          id: "img2",
          url: "https://via.placeholder.com/300x200/0066CC/FFFFFF?text=Refrigerator+Interior",
          alt: "Refrigerator interior",
          dateAdded: "2023-01-20"
        }
      ]
    },
    {
      id: "2",
      name: "Kitchen Stove",
      type: "Stove",
      brand: "GE",
      model: "JGS760SELSS",
      serialNumber: "GE987654321",
      datePurchased: "2023-01-15",
      dateInstalled: "2023-01-20",
      lastServiced: "2023-06-10",
      nextServiceDue: "2024-06-10",
      warrantyExpires: "2025-01-15",
      status: "Working",
      notes: "Gas range with convection oven",
      images: [
        {
          id: "img3",
          url: "https://via.placeholder.com/300x200/CC6600/FFFFFF?text=Gas+Stove",
          alt: "Gas stove front view",
          dateAdded: "2023-01-20"
        }
      ]
    },
    {
      id: "3",
      name: "Kitchen Dishwasher",
      type: "Dishwasher",
      brand: "Bosch",
      model: "SHPM65Z55N",
      serialNumber: "BO555666777",
      datePurchased: "2023-01-15",
      dateInstalled: "2023-01-20",
      lastServiced: "2023-09-01",
      nextServiceDue: "2024-03-01",
      status: "Needs Service",
      notes: "Making unusual noise during wash cycle"
    },
    {
      id: "4",
      name: "Water Heater",
      type: "Water Heater",
      brand: "Rheem",
      model: "XG50T12DU38U2",
      serialNumber: "RH444555666",
      datePurchased: "2022-08-10",
      dateInstalled: "2022-08-15",
      lastServiced: "2023-08-15",
      nextServiceDue: "2024-08-15",
      warrantyExpires: "2028-08-10",
      status: "Working",
      notes: "50-gallon natural gas water heater"
    },
    {
      id: "5",
      name: "HVAC System",
      type: "HVAC Unit",
      brand: "Carrier",
      model: "24ANB124A003",
      serialNumber: "CA111222333",
      datePurchased: "2022-05-20",
      dateInstalled: "2022-05-25",
      lastServiced: "2023-10-01",
      nextServiceDue: "2024-04-01",
      warrantyExpires: "2027-05-20",
      status: "Working",
      notes: "Central air and heating system, filters changed quarterly"
    }
  ],
  images: [
    { id: "img1", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", alt: "Front view", rotation: 0, isMain: true, order: 0 },
    { id: "img2", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", alt: "Living room", rotation: 0, isMain: false, order: 1 },
    { id: "img3", url: "https://images.unsplash.com/photo-1560449752-263d9c96c0f2?w=400", alt: "Kitchen", rotation: 0, isMain: false, order: 2 },
  ],
  mainImageId: "img1",
};

// Mock activities removed - now using real activity tracking system

const mockExpenses: Expense[] = [
  { id: "1", category: "Maintenance", description: "HVAC Repair", amount: 450, date: "2024-01-15", vendor: "ABC Heating" },
  { id: "2", category: "Utilities", description: "Electricity Bill", amount: 120, date: "2024-01-10" },
  { id: "3", category: "Insurance", description: "Property Insurance", amount: 300, date: "2024-01-01" },
];

const mockIncome: Income[] = [
  { id: "1", type: "Rent", description: "Monthly Rent", amount: 2500, date: "2024-01-01", tenant: "Sarah Johnson" },
  { id: "2", type: "Fee", description: "Pet Fee", amount: 50, date: "2024-01-01", tenant: "Sarah Johnson" },
];

export default function PropertyDetailPage({
  propertyId,
  onClose,
  isModal = false,
  onOpenWorkOrder,
  onOpenTenantManagement,
  onOpenMaintenance,
  backgroundColorOverride,
  onBackgroundColorChange,
  autoOpenApplication,
  autoOpenTenantDialog
}: PropertyDetailPageProps) {
  const navigate = useNavigate();
  const { state, updateProperty, addDocument, deleteDocument } = useCrmData();
  const { getEntityActivities } = useActivityTracking();
  const { user, hasPermission } = useAuth();
  const { properties, propertyManagers, tenants, documents } = state;
  const property = properties.find(p => p.id === propertyId) || mockProperty;

  // Safety check to ensure property exists
  if (!property) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Property not found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The requested property could not be found.
        </Typography>
        {onClose && (
          <Button onClick={onClose} sx={{ mt: 2 }}>
            Go Back
          </Button>
        )}
      </Box>
    );
  }

  // Get real activities for this property
  const propertyActivities = getEntityActivities('property', propertyId);
  const [expenses, setExpenses] = React.useState<Expense[]>(mockExpenses);
  const [income, setIncome] = React.useState<Income[]>(mockIncome);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = React.useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = React.useState(false);
  const [applianceDialogOpen, setApplianceDialogOpen] = React.useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = React.useState(false);
  const [documentUploadDialogOpen, setDocumentUploadDialogOpen] = React.useState(false);
  const [documentViewModalOpen, setDocumentViewModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (autoOpenApplication) setApplicationDialogOpen(true);
    if (autoOpenTenantDialog) setTenantDialogOpen(true);
  }, [autoOpenApplication, autoOpenTenantDialog]);
  const [selectedDocument, setSelectedDocument] = React.useState<any>(null);
  const [uploadingDocument, setUploadingDocument] = React.useState(false);
  const [documentUploadData, setDocumentUploadData] = React.useState({
    file: null as File | null,
    category: 'Other' as const,
    description: ''
  });
  const [workOrderDialogOpen, setWorkOrderDialogOpen] = React.useState(false);
  const [tenantDialogOpen, setTenantDialogOpen] = React.useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = React.useState(false);
  const [draggedCard, setDraggedCard] = React.useState<string | null>(null);
  const [cardOrder, setCardOrder] = React.useState([
    'tenant-info',
    'property-manager',
    'notes-activities',
    'marketing-info',
    'location'
  ]);
  const [availableCards] = React.useState([
    { id: 'tenant-info', label: 'Current Tenant', icon: PersonRoundedIcon },
    { id: 'property-manager', label: 'Property Manager', icon: BusinessRoundedIcon },
    { id: 'notes-activities', label: 'Notes & Activities', icon: DescriptionRoundedIcon },
    { id: 'marketing-info', label: 'Marketing Information', icon: CampaignRoundedIcon },
    { id: 'location', label: 'Property Location', icon: LocationOnRoundedIcon },
  ]);
  const [cardManagementOpen, setCardManagementOpen] = React.useState(false);
  const [backgroundPickerOpen, setBackgroundPickerOpen] = React.useState(false);
  const [savedHeaderColor, setSavedHeaderColor] = React.useState<string | null>(null);
  const [editFormData, setEditFormData] = React.useState<Partial<Property>>(property);

  // Late fee override state (synced to current property)
  const effectiveLateFee = LateFeeService.getEffectiveConfig(property);
  const [lateOverrideEnabled, setLateOverrideEnabled] = React.useState<boolean>(!!property.lateFeeOverrideEnabled);
  const [lateMode, setLateMode] = React.useState<'flat' | 'percent'>(property.lateFeeMode ?? effectiveLateFee.mode);
  const [lateBase, setLateBase] = React.useState<string>(property.lateFeeBaseFee != null ? String(property.lateFeeBaseFee) : '');
  const [lateDaily, setLateDaily] = React.useState<string>(property.lateFeeDailyRate != null ? String(property.lateFeeDailyRate) : '');
  const [latePct, setLatePct] = React.useState<string>(property.lateFeePercentageRate != null ? String(property.lateFeePercentageRate * 100) : '');
  const [lateGrace, setLateGrace] = React.useState<string>(property.lateFeeGraceDays != null ? String(property.lateFeeGraceDays) : '');

  React.useEffect(() => {
    const eff = LateFeeService.getEffectiveConfig(property);
    setLateOverrideEnabled(!!property.lateFeeOverrideEnabled);
    setLateMode(property.lateFeeMode ?? eff.mode);
    setLateBase(property.lateFeeBaseFee != null ? String(property.lateFeeBaseFee) : '');
    setLateDaily(property.lateFeeDailyRate != null ? String(property.lateFeeDailyRate) : '');
    setLatePct(property.lateFeePercentageRate != null ? String(property.lateFeePercentageRate * 100) : '');
    setLateGrace(property.lateFeeGraceDays != null ? String(property.lateFeeGraceDays) : '');
  }, [property.id]);

  const saveLateOverride = () => {
    const updated = {
      ...property,
      lateFeeOverrideEnabled: lateOverrideEnabled,
      lateFeeMode: lateOverrideEnabled ? lateMode : undefined,
      lateFeeBaseFee: lateOverrideEnabled && lateBase !== '' ? parseFloat(lateBase) : undefined,
      lateFeeDailyRate: lateOverrideEnabled && lateDaily !== '' ? parseFloat(lateDaily) : undefined,
      lateFeePercentageRate: lateOverrideEnabled && latePct !== '' ? parseFloat(latePct) / 100 : undefined,
      lateFeeGraceDays: lateOverrideEnabled && lateGrace !== '' ? parseInt(lateGrace, 10) : undefined,
    } as Property;
    updateProperty(updated);
    alert('Late fee settings saved for this property.');
  };

  // Load saved header color from localStorage
  React.useEffect(() => {
    const savedColor = localStorage.getItem('propertyHeaderColor');
    if (savedColor) {
      setSavedHeaderColor(savedColor);
    }
  }, []);

  // Sync editFormData with property when property changes
  React.useEffect(() => {
    setEditFormData(property);
  }, [property]);
  const [selectedAppliance, setSelectedAppliance] = React.useState<Appliance | null>(null);
  const [applianceImages, setApplianceImages] = React.useState<ApplianceImage[]>([]);
  const [applianceFormData, setApplianceFormData] = React.useState<Partial<Appliance>>({
    name: "",
    type: "Refrigerator",
    brand: "",
    model: "",
    serialNumber: "",
    datePurchased: "",
    dateInstalled: "",
    lastServiced: "",
    nextServiceDue: "",
    warrantyExpires: "",
    status: "Working",
    notes: ""
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSaveProperty = () => {
    updateProperty({ ...property, ...editFormData });
    setEditDialogOpen(false);
  };

  const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentUploadData({ ...documentUploadData, file });
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentUploadData.file) return;

    setUploadingDocument(true);

    try {
      // Convert file to data URL for better persistence
      const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(documentUploadData.file as File);
      });

      const document = {
        name: documentUploadData.file.name,
        type: documentUploadData.file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN',
        size: documentUploadData.file.size,
        url: fileUrl,
        category: documentUploadData.category,
        propertyId: propertyId,
        uploadedBy: 'Current User',
        description: documentUploadData.description,
        tags: []
      };

      addDocument(document);

      // Track document upload activity
      activityTracker.trackActivity({
        userId: 'current-user',
        userDisplayName: 'Current User',
        action: 'create',
        entityType: 'property',
        entityId: propertyId,
        entityName: property.name,
        changes: [
          {
            field: 'documents',
            oldValue: '',
            newValue: documentUploadData.file.name,
            displayName: 'Document Added'
          }
        ],
        description: `Document uploaded: ${documentUploadData.file.name}`,
        metadata: {
          category: documentUploadData.category,
          fileSize: documentUploadData.file.size,
          fileType: documentUploadData.file.type
        },
        severity: 'low',
        category: 'operational'
      });

      // Reset form and close dialog
      setDocumentUploadData({ file: null, category: 'Other', description: '' });
      setDocumentUploadDialogOpen(false);

    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploadingDocument(false);
    }
  };

  // handleAddNote removed - note adding is now handled by CrmActivitiesTimeline component

  const handleApplianceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ApplianceImage = {
            id: Date.now().toString() + Math.random(),
            url: e.target?.result as string,
            alt: file.name,
            dateAdded: new Date().toISOString()
          };
          setApplianceImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveApplianceImage = (imageId: string) => {
    setApplianceImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleDragStart = (cardId: string) => (e: React.DragEvent) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetCardId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedCardId = e.dataTransfer.getData('text/plain') || draggedCard;

    if (draggedCardId && draggedCardId !== targetCardId) {
      const newOrder = [...cardOrder];
      const draggedIndex = newOrder.indexOf(draggedCardId);
      const targetIndex = newOrder.indexOf(targetCardId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Remove the dragged card from its original position
        newOrder.splice(draggedIndex, 1);
        // Insert it at the target position
        newOrder.splice(targetIndex, 0, draggedCardId);
        setCardOrder(newOrder);
      }
    }
    setDraggedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const addCard = (cardId: string) => {
    if (!cardOrder.includes(cardId)) {
      setCardOrder(prev => [...prev, cardId]);
    }
  };

  const removeCard = (cardId: string) => {
    setCardOrder(prev => prev.filter(id => id !== cardId));
  };

  const isCardVisible = (cardId: string) => {
    return cardOrder.includes(cardId);
  };

  const renderCard = (cardId: string) => {
    const isDragging = draggedCard === cardId;
    const cardStyle = {
      opacity: isDragging ? 0.5 : 1,
      cursor: 'move',
      transition: 'opacity 0.2s ease'
    };

    switch (cardId) {
      case 'tenant-info':
        return (
          <Grid item xs={12} md={6} key={cardId}>
            <Card
              draggable
              onDragStart={handleDragStart(cardId)}
              onDragEnd={handleDragEnd}
              sx={cardStyle}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonRoundedIcon sx={{ mr: 1 }} />
                    Current Tenant
                  </Typography>
                  <IconButton size="small" sx={{ cursor: 'grab' }} title="Drag to rearrange">
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {(() => {
                  const currentTenant = state.tenants.find(t => t.propertyId === property.id && t.status === 'Active');
                  console.log('Looking for tenant with propertyId:', property.id, 'Found tenants:', state.tenants.filter(t => t.propertyId === property.id));
                  if (currentTenant) {
                    const today = new Date();
                    const leaseEnd = currentTenant.leaseEnd ? new Date(currentTenant.leaseEnd) : null;
                    const isLeaseExpiring = leaseEnd && leaseEnd.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days

                    return (
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {currentTenant.firstName} {currentTenant.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentTenant.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentTenant.phone}
                          </Typography>
                        </Box>

                        {currentTenant.leaseStart && currentTenant.leaseEnd && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Lease Period</Typography>
                            <Typography variant="body1">
                              {new Date(currentTenant.leaseStart).toLocaleDateString()} - {new Date(currentTenant.leaseEnd).toLocaleDateString()}
                            </Typography>
                            {isLeaseExpiring && (
                              <Chip label="Lease Expiring Soon" color="warning" size="small" sx={{ mt: 0.5 }} />
                            )}
                          </Box>
                        )}

                        {currentTenant.monthlyRent && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                            <Typography variant="h6" color="success.main">
                              ${currentTenant.monthlyRent.toLocaleString()}
                            </Typography>
                            <Chip label="Paid" color="success" size="small" sx={{ ml: 1 }} />
                          </Box>
                        )}

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setTenantDialogOpen(true)}
                          >
                            Edit Tenant
                          </Button>
                        </Stack>
                      </Stack>
                    );
                  } else {
                    return (
                      <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          No tenant currently assigned to this property
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => setTenantDialogOpen(true)}
                          startIcon={<AddRoundedIcon />}
                        >
                          Add Tenant
                        </Button>
                      </Stack>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          </Grid>
        );

      case 'property-manager':
        return (
          <Grid item xs={12} md={6} key={cardId}>
            <Card
              draggable
              onDragStart={handleDragStart(cardId)}
              onDragEnd={handleDragEnd}
              sx={cardStyle}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessRoundedIcon sx={{ mr: 1 }} />
                    Property Manager
                  </Typography>
                  <IconButton size="small" sx={{ cursor: 'grab' }} title="Drag to rearrange">
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {(() => {
                  const currentManager = state.propertyManagers.find(pm => property.managerIds?.includes(pm.id));

                  return (
                    <Stack spacing={2}>
                      {currentManager ? (
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {currentManager.firstName} {currentManager.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentManager.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentManager.phone}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No property manager assigned
                        </Typography>
                      )}

                      <FormControl fullWidth size="small">
                        <InputLabel>Assign Property Manager</InputLabel>
                        <Select
                          value={currentManager?.id || ""}
                          label="Assign Property Manager"
                          onChange={(e) => {
                            const selectedManager = state.propertyManagers.find(pm => pm.id === e.target.value);
                            if (selectedManager) {
                              const updatedProperty = {
                                ...property,
                                managerIds: [selectedManager.id]
                              };
                              updateProperty(updatedProperty);
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>No manager</em>
                          </MenuItem>
                          {state.propertyManagers.map((manager) => (
                            <MenuItem key={manager.id} value={manager.id}>
                              {manager.firstName} {manager.lastName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        );

      case 'notes-activities':
        return (
          <Grid item xs={12} key={cardId}>
            <Card
              draggable
              onDragStart={handleDragStart(cardId)}
              onDragEnd={handleDragEnd}
              sx={cardStyle}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionRoundedIcon sx={{ mr: 1 }} />
                    Notes & Activities
                  </Typography>
                  <IconButton size="small" sx={{ cursor: 'grab' }} title="Drag to rearrange">
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <CrmActivitiesTimeline
                  entityType="property"
                  entityId={propertyId}
                  entityName={property.name}
                  maxItems={5}
                  showAddNote={true}
                />
              </CardContent>
            </Card>
          </Grid>
        );

      case 'marketing-info':
        return (
          <Grid item xs={12} md={6} key={cardId}>
            <Card
              draggable
              onDragStart={handleDragStart(cardId)}
              onDragEnd={handleDragEnd}
              sx={cardStyle}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CampaignRoundedIcon sx={{ mr: 1 }} />
                    Marketing Information
                  </Typography>
                  <IconButton size="small" sx={{ cursor: 'grab' }} title="Drag to rearrange">
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Marketing Title"
                    placeholder="e.g., Luxury Downtown Apartment"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Marketing Description"
                    multiline
                    rows={3}
                    placeholder="Describe key selling points, unique features, nearby amenities..."
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Key Features"
                    placeholder="e.g., Recently renovated, Pet-friendly, Near transit"
                    size="small"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Target Audience"
                        placeholder="e.g., Young professionals"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Marketing Status</InputLabel>
                        <Select defaultValue="active" label="Marketing Status">
                          <MenuItem value="active">Active Marketing</MenuItem>
                          <MenuItem value="paused">Paused</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Button variant="outlined" size="small">
                    Save Marketing Info
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );

      case 'location':
        return (
          <Grid item xs={12} md={6} key={cardId}>
            <Card
              draggable
              onDragStart={handleDragStart(cardId)}
              onDragEnd={handleDragEnd}
              sx={cardStyle}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <LocationOnRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Property Location
                </Typography>
                <Box sx={{
                  height: 300,
                  borderRadius: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2
                }}>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed&z=15`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map showing ${property.address}`}
                  />
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LaunchRoundedIcon />}
                    onClick={() => {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`, '_blank');
                    }}
                  >
                    Open in Maps
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DirectionsRoundedIcon />}
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address)}`, '_blank');
                    }}
                  >
                    Get Directions
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ���� {property.address}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DirectionsRoundedIcon />}
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address)}`, '_blank');
                    }}
                  >
                    Directions
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<NearMeRoundedIcon />}
                    onClick={() => {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`, '_blank');
                    }}
                  >
                    Nearby
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );

      default:
        return null;
    }
  };

  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalMonthlyIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const netIncome = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <Box>
      {/* Header */}
      <Paper sx={{
        p: 3,
        mb: 3,
        bgcolor: backgroundColorOverride || savedHeaderColor || (isModal ? 'secondary.main' : 'primary.main'),
        color: 'primary.contrastText',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&::before': isModal ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          pointerEvents: 'none'
        } : {}
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              {onClose && (
                <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
                  <ArrowBackRoundedIcon />
                </IconButton>
              )}
              <HomeWorkRoundedIcon />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                  color: 'inherit'
                }}
              >
                {property.name}
              </Typography>
              <Chip
                label={property.status}
                color={property.status === 'Available' ? 'success' : property.status === 'Occupied' ? 'warning' : 'error'}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
              />
              {isModal && (
                <Chip
                  label="🪟 Modal Mode"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'inherit', fontSize: '0.75rem' }}
                />
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LocationOnRoundedIcon />
              <Typography
              variant="subtitle1"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                color: 'inherit',
                fontWeight: 500
              }}
            >
              {property.address}
            </Typography>
            </Stack>
            <Stack direction="row" spacing={3}>
              <Stack>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'inherit'
                  }}
                >
                  Monthly Rent
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    fontWeight: 600,
                    color: 'inherit'
                  }}
                >
                  ${property.monthlyRent.toLocaleString()}
                </Typography>
              </Stack>
              <Stack>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'inherit'
                  }}
                >
                  Units
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    fontWeight: 600,
                    color: 'inherit'
                  }}
                >
                  {property.units}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Occupancy</Typography>
                <Typography variant="h6">{property.occupancy}/{property.units}</Typography>
              </Stack>
              <Stack>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Type</Typography>
                <Typography variant="h6">{property.type}</Typography>
              </Stack>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              startIcon={<EditRoundedIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Edit Property
            </Button>
            {/* Add Note button removed - now handled by CrmActivitiesTimeline component */}
            <Button
              variant="outlined"
              onClick={() => setCardManagementOpen(true)}
              sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)' }}
              startIcon={<AddRoundedIcon />}
              title="Manage Windows"
            >
              Manage Windows
            </Button>
            {(onBackgroundColorChange || !isModal) && (
              <Button
                variant="outlined"
                onClick={() => setBackgroundPickerOpen(true)}
                sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)', minWidth: '48px', px: 1.5 }}
                title="Change Header Background Color"
              >
                🎨
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" />
          <Tab label="Financial" />
          <Tab label="Appliances" />
          <Tab label="Maintenance" />
          <Tab label="Documents" />
          <Tab label="Activity" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Property Images */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <PhotoCameraRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Property Images
                </Typography>
                {property.images && property.images.length > 0 ? (
                  <ImageList cols={2} rowHeight={200}>
                    {property.images.map((image) => (
                      <ImageListItem key={image.id}>
                        <img src={image.url} alt={image.alt} loading="lazy" />
                        <ImageListItemBar
                          title={image.alt}
                          actionIcon={
                            image.isMain ? (
                              <StarRoundedIcon sx={{ color: 'gold' }} />
                            ) : (
                              <StarBorderRoundedIcon sx={{ color: 'white' }} />
                            )
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No images available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Property Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <DescriptionRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Property Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Bedrooms</Typography>
                    <Typography variant="body1">{property.bedrooms || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Bathrooms</Typography>
                    <Typography variant="body1">{property.bathrooms || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Square Footage</Typography>
                    <Typography variant="body1">{property.squareFootage ? `${property.squareFootage} sq ft` : 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Parking Spaces</Typography>
                    <Typography variant="body1">{property.parkingSpaces || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Year Built</Typography>
                    <Typography variant="body1">{property.yearBuilt || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Pet Policy</Typography>
                    <Typography variant="body1">{property.petPolicy || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{property.description || 'No description available'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Amenities</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                      {property.amenities?.map((amenity, index) => (
                        <Chip key={index} label={amenity} size="small" />
                      )) || <Typography variant="body2">No amenities listed</Typography>}
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Enhancement Summary */}
          <Grid item xs={12}>
            <FormFixesSummary />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: isModal ? 'primary.light' : 'secondary.main', color: isModal ? 'primary.contrastText' : 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'inherit' }}>
                  🚀 Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<BuildRoundedIcon />}
                      onClick={() => setWorkOrderDialogOpen(true)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                    >
                      Work Orders
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DescriptionRoundedIcon />}
                      onClick={() => setApplicationDialogOpen(true)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                    >
                      Application
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PersonRoundedIcon />}
                      onClick={() => setTenantDialogOpen(true)}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                    >
                      Tenant Management
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CalendarTodayRoundedIcon />}
                      onClick={() => navigate('/crm/work-orders')}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                    >
                      Maintenance
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions - Only show in modal mode (legacy - now hidden) */}
          {false && isModal && (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'inherit' }}>
                    🚀 Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    {onOpenWorkOrder && (
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<BuildRoundedIcon />}
                          onClick={() => setWorkOrderDialogOpen(true)}
                          sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                        >
                          Work Orders
                        </Button>
                      </Grid>
                    )}
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<DescriptionRoundedIcon />}
                        onClick={() => setApplicationDialogOpen(true)}
                        sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                      >
                        Application
                      </Button>
                    </Grid>
                    {onOpenTenantManagement && (
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<PersonRoundedIcon />}
                          onClick={() => setTenantDialogOpen(true)}
                          sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                        >
                          Tenant Management
                        </Button>
                      </Grid>
                    )}
                    {onOpenMaintenance && (
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<CalendarTodayRoundedIcon />}
                          onClick={onOpenMaintenance}
                          sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        color: isModal ? 'primary.contrastText' : 'secondary.contrastText',
                        fontWeight: 600
                      }}
                        >
                          Maintenance
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Draggable Cards in Custom Order */}
          {cardOrder.map(cardId => (
            <Box
              key={cardId}
              onDragOver={handleDragOver}
              onDrop={handleDrop(cardId)}
              sx={{ width: '100%' }}
            >
              {renderCard(cardId)}
            </Box>
          ))}

          {/* HIDDEN - Original cards replaced with draggable system above */}
          <Grid item xs={12} md={6} sx={{ display: 'none' }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonRoundedIcon sx={{ mr: 1 }} />
                    Current Tenant
                  </Typography>
                  <IconButton size="small" sx={{ cursor: 'grab' }} title="Drag to rearrange">
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {(() => {
                  const currentTenant = state.tenants.find(t => t.propertyId === property.id && t.status === 'Active');
                  console.log('Looking for tenant with propertyId:', property.id, 'Found tenants:', state.tenants.filter(t => t.propertyId === property.id));
                  if (currentTenant) {
                    const today = new Date();
                    const leaseEnd = currentTenant.leaseEndDate ? new Date(currentTenant.leaseEndDate) : null;
                    const isLeaseExpiring = leaseEnd && leaseEnd.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days

                    return (
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {currentTenant.firstName} {currentTenant.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentTenant.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {currentTenant.phone}
                          </Typography>
                        </Box>

                        {currentTenant.leaseStartDate && currentTenant.leaseEndDate && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Lease Period</Typography>
                            <Typography variant="body1">
                              {new Date(currentTenant.leaseStartDate).toLocaleDateString()} - {new Date(currentTenant.leaseEndDate).toLocaleDateString()}
                            </Typography>
                            {isLeaseExpiring && (
                              <Chip label="Lease Expiring Soon" color="warning" size="small" sx={{ mt: 0.5 }} />
                            )}
                          </Box>
                        )}

                        {currentTenant.monthlyRent && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">Monthly Rent</Typography>
                            <Typography variant="h6" color="success.main">
                              ${currentTenant.monthlyRent.toLocaleString()}
                            </Typography>
                            <Chip label="Paid" color="success" size="small" sx={{ ml: 1 }} />
                          </Box>
                        )}

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setTenantDialogOpen(true)}
                          >
                            Edit Tenant
                          </Button>
                        </Stack>
                      </Stack>
                    );
                  } else {
                    return (
                      <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          No tenant currently assigned to this property
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => setTenantDialogOpen(true)}
                          startIcon={<AddRoundedIcon />}
                        >
                          Add Tenant
                        </Button>
                      </Stack>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          </Grid>


          {/* Property Notes & Activities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionRoundedIcon sx={{ mr: 1 }} />
                    Notes & Activities
                  </Typography>
                </Stack>

                <CrmActivitiesTimeline
                  entityType="property"
                  entityId={propertyId}
                  entityName={property.name}
                  maxItems={5}
                  showAddNote={true}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Marketing Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CampaignRoundedIcon sx={{ mr: 1 }} />
                    Marketing Information
                  </Typography>
                  <IconButton size="small" sx={{ cursor: 'grab' }} title="Drag to rearrange">
                    <DragIndicatorIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Marketing Title"
                    placeholder="e.g., Luxury Downtown Apartment"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Marketing Description"
                    multiline
                    rows={3}
                    placeholder="Describe key selling points, unique features, nearby amenities..."
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Key Features"
                    placeholder="e.g., Recently renovated, Pet-friendly, Near transit"
                    size="small"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Target Audience"
                        placeholder="e.g., Young professionals"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Marketing Status</InputLabel>
                        <Select defaultValue="active" label="Marketing Status">
                          <MenuItem value="active">Active Marketing</MenuItem>
                          <MenuItem value="paused">Paused</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Button variant="outlined" size="small">
                    Save Marketing Info
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Google Maps Location */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <LocationOnRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Property Location
                </Typography>
                <Box sx={{
                  height: 300,
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Fixed Google Maps with better visibility */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      p: 2
                    }}
                  >
                    <LocationOnRoundedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      📍 {property.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Click below to view on map
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<LaunchRoundedIcon />}
                        onClick={() => {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`, '_blank');
                        }}
                      >
                        Open in Maps
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DirectionsRoundedIcon />}
                        onClick={() => {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address)}`, '_blank');
                        }}
                      >
                        Get Directions
                      </Button>
                    </Stack>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  📍 {property.address}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DirectionsRoundedIcon />}
                    onClick={() => {
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address)}`, '_blank');
                    }}
                  >
                    Get Directions
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<NearMeRoundedIcon />}
                    onClick={() => {
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}&zoom=15`, '_blank');
                    }}
                  >
                    View Area
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Tenants */}
          {property.tenantIds && property.tenantIds.length > 0 && (() => {
            const propertyTenants = tenants.filter(t => property.tenantIds.includes(t.id));
            return propertyTenants.length > 0 ? (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      <PersonRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Current Tenant{propertyTenants.length > 1 ? 's' : ''}
                    </Typography>
                    {propertyTenants.map((tenant) => (
                      <Stack key={tenant.id} direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {tenant.firstName && tenant.lastName ? `${tenant.firstName[0]}${tenant.lastName[0]}` : 'T'}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main',
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={() => {
                              navigate(`/tenants?tenant=${encodeURIComponent(`${tenant.firstName} ${tenant.lastName}`)}`);
                            }}
                          >
                            {tenant.firstName} {tenant.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Lease: {tenant.leaseStart || 'N/A'} - {tenant.leaseEnd || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<EmailRoundedIcon />}>Email</Button>
                      <Button size="small" startIcon={<PhoneRoundedIcon />}>Call</Button>
                      <Button size="small" startIcon={<MessageRoundedIcon />}>Message</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ) : null;
          })()}

          {/* Property Manager */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Property Manager
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {property.managerId ? (() => {
                      const manager = propertyManagers.find(pm => pm.id === property.managerId);
                      return manager ? `${manager.firstName[0]}${manager.lastName[0]}` : 'PM';
                    })() : 'PM'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {property.managerId ? (() => {
                        const manager = propertyManagers.find(pm => pm.id === property.managerId);
                        return manager ? `${manager.firstName} ${manager.lastName}` : 'Unassigned';
                      })() : 'Unassigned'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Property Manager
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button size="small" startIcon={<EmailRoundedIcon />}>Email</Button>
                  <Button size="small" startIcon={<PhoneRoundedIcon />}>Call</Button>
                  <Button size="small" startIcon={<MessageRoundedIcon />}>Message</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          {/* Financial Summary */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  <AttachMoneyRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Financial Summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h4">${totalMonthlyIncome.toLocaleString()}</Typography>
                      <Typography variant="body2">Monthly Income</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                      <Typography variant="h4">${totalMonthlyExpenses.toLocaleString()}</Typography>
                      <Typography variant="body2">Monthly Expenses</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: netIncome >= 0 ? 'primary.light' : 'warning.light', color: 'primary.contrastText' }}>
                      <Typography variant="h4">${netIncome.toLocaleString()}</Typography>
                      <Typography variant="body2">Net Income</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="h4">{((property.occupancy / property.units) * 100).toFixed(0)}%</Typography>
                      <Typography variant="body2">Occupancy Rate</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Owners & Distribution + Snapshot */}
          <Grid item xs={12}>
            <OwnersDistribution propertyId={property.id} />
          </Grid>

          {/* Payment Routing Configuration */}
          <Grid item xs={12}>
            <PropertyBankAccountSection
              property={property}
              onUpdate={updateProperty}
            />
          </Grid>

          {/* Income and Expenses Tables */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Income</Typography>
                  {(hasPermission('all') || hasPermission('manage_finances') || hasPermission('add_credits')) && (
                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setIncomeDialogOpen(true)}>
                      Add Income
                    </Button>
                  )}
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {income.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">${item.amount}</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Expenses</Typography>
                  {(hasPermission('all') || hasPermission('manage_finances') || hasPermission('delete_charges')) && (
                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => setExpenseDialogOpen(true)}>
                      Add Expense
                    </Button>
                  )}
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell align="right">${expense.amount}</TableCell>
                          <TableCell>{expense.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Late Fee Policy & Overrides */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <AttachMoneyRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Rent, Deposit & Late Fee Policy
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Monthly Rent</Typography>
                      <Typography variant="h6">${property.monthlyRent.toLocaleString()}</Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" color="text.secondary">Security Deposit</Typography>
                      <Typography variant="h6">${(property.securityDeposit || 0).toLocaleString()}</Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" color="text.secondary">Effective Late Fee Policy</Typography>
                      <Typography variant="body2">
                        Mode: {effectiveLateFee.mode === 'flat' ? 'Flat (base + daily)' : 'Percent (base + % once)'}
                      </Typography>
                      <Typography variant="body2">Base: ${effectiveLateFee.baseFee}</Typography>
                      {effectiveLateFee.mode === 'flat' ? (
                        <Typography variant="body2">Daily: ${effectiveLateFee.dailyRate}/day after {effectiveLateFee.graceDays} day(s)</Typography>
                      ) : (
                        <Typography variant="body2">Percent: {(effectiveLateFee.percentageRate * 100).toFixed(2)}% after {effectiveLateFee.graceDays} day(s)</Typography>
                      )}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1">Per-Property Override</Typography>
                        <FormControlLabel
                          control={<Switch checked={lateOverrideEnabled} onChange={(e) => setLateOverrideEnabled(e.target.checked)} />}
                          label={lateOverrideEnabled ? 'Enabled' : 'Disabled'}
                        />
                      </Stack>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small" disabled={!lateOverrideEnabled}>
                            <InputLabel>Mode</InputLabel>
                            <Select value={lateMode} label="Mode" onChange={(e) => setLateMode(e.target.value as any)}>
                              <MenuItem value="flat">Flat (base + daily)</MenuItem>
                              <MenuItem value="percent">Percent (base + % once)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Base Fee" size="small" type="number" value={lateBase} onChange={(e) => setLateBase(e.target.value)} fullWidth disabled={!lateOverrideEnabled} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                        </Grid>
                        <Grid item xs={6}>
                          {lateMode === 'flat' ? (
                            <TextField label="Daily Rate" size="small" type="number" value={lateDaily} onChange={(e) => setLateDaily(e.target.value)} fullWidth disabled={!lateOverrideEnabled} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                          ) : (
                            <TextField label="Percentage" size="small" type="number" value={latePct} onChange={(e) => setLatePct(e.target.value)} fullWidth disabled={!lateOverrideEnabled} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Grace Days" size="small" type="number" value={lateGrace} onChange={(e) => setLateGrace(e.target.value)} fullWidth disabled={!lateOverrideEnabled} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="contained" onClick={saveLateOverride} disabled={!lateOverrideEnabled}>Save Override</Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Deposit and Charge Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  <AttachMoneyRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Deposits & Charges Management
                </Typography>

                <Grid container spacing={3}>
                  {/* Security Deposit Info */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="h5">${property.securityDeposit || 0}</Typography>
                      <Typography variant="body2">Security Deposit</Typography>
                    </Paper>
                  </Grid>

                  {/* Pet Deposit Info */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                      <Typography variant="h5">${property.petDeposit || 0}</Typography>
                      <Typography variant="body2">Pet Deposit</Typography>
                    </Paper>
                  </Grid>

                  {/* Pet Fee Info */}
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <Typography variant="h5">${property.petFee || 0}</Typography>
                      <Typography variant="body2">Pet Fee</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Charge/Credit Management Actions - Only for authorized users */}
                {(hasPermission('all') || hasPermission('delete_charges') || hasPermission('add_credits')) && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      Financial Management (Admin Only)
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {(hasPermission('all') || hasPermission('add_credits')) && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<AddRoundedIcon />}
                          onClick={() => {
                            // Add credit functionality
                            alert('Add Credit functionality - This would open a dialog to add credits to tenant/property financial ledger');
                          }}
                        >
                          Add Credit
                        </Button>
                      )}

                      {(hasPermission('all') || hasPermission('delete_charges')) && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            // Delete charge functionality
                            if (window.confirm('Are you sure you want to delete a charge? This action will be recorded in the financial ledger.')) {
                              alert('Delete Charge functionality - This would open a dialog to select and delete charges from tenant/property financial ledger');
                            }
                          }}
                        >
                          Delete Charge
                        </Button>
                      )}

                      {(hasPermission('all') || hasPermission('view_financial_ledger')) && (
                        <Button
                          variant="outlined"
                          startIcon={<DescriptionRoundedIcon />}
                          onClick={() => {
                            // View financial ledger
                            alert('Financial Ledger - This would open a detailed view of all financial transactions for this property');
                          }}
                        >
                          View Financial Ledger
                        </Button>
                      )}
                    </Stack>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        All financial changes are tracked in the activity log and reflected in the tenant's financial records.
                        When tenants move out, charges will only be visible in their past tenant ledger.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    <KitchenRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Appliances & Equipment
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => {
                      setSelectedAppliance(null);
                      setApplianceImages([]);
                      setApplianceFormData({
                        name: "",
                        type: "Refrigerator",
                        brand: "",
                        model: "",
                        serialNumber: "",
                        datePurchased: "",
                        dateInstalled: "",
                        lastServiced: "",
                        nextServiceDue: "",
                        warrantyExpires: "",
                        status: "Working",
                        notes: "",
                        images: []
                      });
                      setApplianceDialogOpen(true);
                    }}
                  >
                    Add Appliance
                  </Button>
                </Stack>

                {property.appliances && property.appliances.length > 0 ? (
                  <Grid container spacing={2}>
                    {property.appliances.map((appliance) => (
                      <Grid item xs={12} md={6} lg={4} key={appliance.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {appliance.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {appliance.brand} {appliance.model}
                                </Typography>
                              </Box>
                              <Chip
                                label={appliance.status}
                                size="small"
                                color={appliance.status === "Working" ? "success" :
                                       appliance.status === "Needs Service" ? "warning" : "error"}
                              />
                            </Stack>

                            <Stack spacing={1} sx={{ mb: 2 }}>
                              {appliance.datePurchased && (
                                <Typography variant="caption">
                                  <strong>Purchased:</strong> {new Date(appliance.datePurchased).toLocaleDateString()}
                                </Typography>
                              )}
                              {appliance.lastServiced && (
                                <Typography variant="caption">
                                  <strong>Last Serviced:</strong> {new Date(appliance.lastServiced).toLocaleDateString()}
                                </Typography>
                              )}
                              {appliance.nextServiceDue && (
                                <Typography variant="caption" color={new Date(appliance.nextServiceDue) < new Date() ? "error.main" : "text.secondary"}>
                                  <strong>Next Service:</strong> {new Date(appliance.nextServiceDue).toLocaleDateString()}
                                  {new Date(appliance.nextServiceDue) < new Date() && " (Overdue)"}
                                </Typography>
                              )}
                              {appliance.warrantyExpires && (
                                <Typography variant="caption">
                                  <strong>Warranty:</strong> {new Date(appliance.warrantyExpires).toLocaleDateString()}
                                </Typography>
                              )}
                            </Stack>

                            {appliance.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {appliance.notes}
                              </Typography>
                            )}

                            {appliance.images && appliance.images.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                  Photos ({appliance.images.length})
                                </Typography>
                                <ImageList cols={2} rowHeight={80} sx={{ mt: 0.5 }}>
                                  {appliance.images.slice(0, 4).map((image) => (
                                    <ImageListItem key={image.id}>
                                      <img
                                        src={image.url}
                                        alt={image.alt}
                                        loading="lazy"
                                        style={{ objectFit: 'cover', height: '80px', borderRadius: '4px' }}
                                      />
                                    </ImageListItem>
                                  ))}
                                </ImageList>
                                {appliance.images.length > 4 && (
                                  <Typography variant="caption" color="text.secondary">
                                    +{appliance.images.length - 4} more photos
                                  </Typography>
                                )}
                              </Box>
                            )}

                            <Stack direction="row" spacing={1}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelectedAppliance(appliance);
                                  setApplianceFormData(appliance);
                                  setApplianceImages(appliance.images || []);
                                  setApplianceDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={appliance.status === "Working"}
                              >
                                Service
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No appliances registered for this property. Click "Add Appliance" to get started.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <BuildRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Maintenance & Work Orders
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Maintenance tracking is integrated with the Work Orders system. Create work orders to track maintenance requests and repairs.
                </Alert>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => setWorkOrderDialogOpen(true)}
                  >
                    Create Work Order
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarTodayRoundedIcon />}
                    onClick={() => setWorkOrderDialogOpen(true)}
                  >
                    Schedule Work Order
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setTenantDialogOpen(true)}
                  >
                    Tenant Management
                  </Button>
                  {isModal && onOpenMaintenance && (
                    <Button
                      variant="outlined"
                      onClick={onOpenMaintenance}
                    >
                      Maintenance Schedule
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <DescriptionRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Documents & Files
                </Typography>
                {/* Display property documents */}
                {(() => {
                  const propertyDocuments = state.documents.filter(doc => doc.propertyId === property.id);
                  return (
                    <>
                      {propertyDocuments.length > 0 ? (
                        <TableContainer component={Paper} sx={{ mb: 2 }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Upload Date</TableCell>
                                <TableCell>Uploaded By</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {propertyDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                  <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <AttachFileRoundedIcon fontSize="small" />
                                      <Typography variant="body2">{doc.name}</Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={doc.category} size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell>{(doc.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                                  <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                                  <TableCell>{doc.uploadedBy}</TableCell>
                                  <TableCell>
                                    <Stack direction="row" spacing={1}>
                                      <IconButton
                                        size="small"
                                        title={`Download ${doc.name}`}
                                        onClick={() => {
                                          // In a real app, this would download the file
                                          window.open(doc.url, '_blank');
                                        }}
                                      >
                                        <DownloadRoundedIcon />
                                      </IconButton>
                                      {(hasPermission('all') || (user?.role === 'Admin' && hasPermission('manage_documents'))) && (
                                        <IconButton
                                          size="small"
                                          title={`Delete ${doc.name}`}
                                          onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete "${doc.name}"? This action cannot be undone.`)) {
                                              deleteDocument(doc.id);

                                              // Track document deletion activity
                                              activityTracker.trackActivity({
                                                userId: user?.id || 'current-user',
                                                userDisplayName: user ? `${user.firstName} ${user.lastName}` : 'Current User',
                                                action: 'delete',
                                                entityType: 'property',
                                                entityId: propertyId,
                                                entityName: property.name,
                                                changes: [
                                                  {
                                                    field: 'documents',
                                                    oldValue: doc.name,
                                                    newValue: '',
                                                    displayName: 'Document Deleted'
                                                  }
                                                ],
                                                description: `Document deleted: ${doc.name}`,
                                                metadata: {
                                                  category: doc.category,
                                                  fileSize: doc.size,
                                                  deletedBy: user ? `${user.firstName} ${user.lastName}` : 'Current User'
                                                },
                                                severity: 'medium',
                                                category: 'security'
                                              });
                                            }
                                          }}
                                          color="error"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      )}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          No documents uploaded yet. Upload property-related documents such as leases, inspections, and maintenance records.
                        </Alert>
                      )}
                    </>
                  );
                })()}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadRoundedIcon />}
                    onClick={() => setDocumentUploadDialogOpen(true)}
                  >
                    Upload Document
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      // Open documents dialog to view all property documents
                      setDocumentsDialogOpen(true);
                    }}
                  >
                    View All Documents
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <CalendarTodayRoundedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Activity Timeline
                </Typography>
                <CrmActivitiesTimeline
                  entityType="property"
                  entityId={propertyId}
                  entityName={property.name}
                  maxItems={20}
                  showAddNote={true}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Edit Property Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 3 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Edit Property Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Update property information and details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Basic Property Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Name"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    variant="outlined"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Property Address"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Enter complete property address including street, city, state, and zip code"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ fontSize: '1rem' }}>Property Type</InputLabel>
                    <Select
                      value={editFormData.type || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as any })}
                      label="Property Type"
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="Apartment">
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>Apartment</Typography>
                          <Typography variant="caption" color="text.secondary">Multi-unit residential building</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="House">
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>House</Typography>
                          <Typography variant="caption" color="text.secondary">Single-family residence</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Condo">
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>Condo</Typography>
                          <Typography variant="caption" color="text.secondary">Condominium unit</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Townhome">
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>Townhome</Typography>
                          <Typography variant="caption" color="text.secondary">Multi-story attached home</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Commercial">
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography>Commercial</Typography>
                          <Typography variant="caption" color="text.secondary">Business or retail property</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ fontSize: '1rem' }}>Property Status</InputLabel>
                    <Select
                      value={editFormData.status || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      label="Property Status"
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="Available">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                          <Typography>Available</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Occupied">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                          <Typography>Occupied</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Maintenance">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <Typography>Under Maintenance</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="Pending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                          <Typography>Pending</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Property Description */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Property Description
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={8}
                maxRows={20}
                label="Detailed Description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Provide a comprehensive description of the property including features, amenities, unique selling points, nearby attractions, and any other relevant details that would help potential tenants understand what makes this property special..."
                variant="outlined"
                helperText="Include details about features, amenities, location benefits, and unique selling points"
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    alignItems: 'flex-start', // Fix cursor positioning at top
                    '& textarea': {
                      overflow: 'auto !important', // Enable scrolling when needed
                      resize: 'vertical', // Allow manual vertical resize
                      minHeight: '192px', // Minimum height for 8 rows
                      maxHeight: '480px', // Maximum height for 20 rows
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.875rem',
                    mt: 1.5
                  },
                  '& .MuiInputBase-input': {
                    textAlign: 'left',
                    verticalAlign: 'top', // Ensure cursor starts at top
                  }
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            size="large"
            sx={{ minWidth: 120, minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProperty}
            size="large"
            sx={{ minWidth: 140, minHeight: 44 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note: Add Note Dialog removed - now handled by CrmActivitiesTimeline component */}

      {/* Appliance Dialog */}
      <Dialog open={applianceDialogOpen} onClose={() => setApplianceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAppliance ? 'Edit Appliance' : 'Add New Appliance'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Appliance Name"
                value={applianceFormData.name || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, name: e.target.value })}
                placeholder="e.g., Kitchen Refrigerator"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={applianceFormData.type || 'Refrigerator'}
                  onChange={(e) => setApplianceFormData({ ...applianceFormData, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="Refrigerator">Refrigerator</MenuItem>
                  <MenuItem value="Stove">Stove</MenuItem>
                  <MenuItem value="Dishwasher">Dishwasher</MenuItem>
                  <MenuItem value="Water Heater">Water Heater</MenuItem>
                  <MenuItem value="HVAC Unit">HVAC Unit</MenuItem>
                  <MenuItem value="Microwave">Microwave</MenuItem>
                  <MenuItem value="Garbage Disposal">Garbage Disposal</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                value={applianceFormData.brand || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, brand: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Model"
                value={applianceFormData.model || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, model: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={applianceFormData.serialNumber || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, serialNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={applianceFormData.status || 'Working'}
                  onChange={(e) => setApplianceFormData({ ...applianceFormData, status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="Working">Working</MenuItem>
                  <MenuItem value="Needs Service">Needs Service</MenuItem>
                  <MenuItem value="Broken">Broken</MenuItem>
                  <MenuItem value="Replaced">Replaced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date Purchased"
                type="date"
                value={applianceFormData.datePurchased || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, datePurchased: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date Installed"
                type="date"
                value={applianceFormData.dateInstalled || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, dateInstalled: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Serviced"
                type="date"
                value={applianceFormData.lastServiced || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, lastServiced: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Next Service Due"
                type="date"
                value={applianceFormData.nextServiceDue || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, nextServiceDue: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warranty Expires"
                type="date"
                value={applianceFormData.warrantyExpires || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, warrantyExpires: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={8}
                label="Notes"
                value={applianceFormData.notes || ''}
                onChange={(e) => setApplianceFormData({ ...applianceFormData, notes: e.target.value })}
                placeholder="Additional notes about this appliance..."
                sx={{
                  '& .MuiInputBase-root': {
                    alignItems: 'flex-start',
                    '& textarea': {
                      overflow: 'auto !important',
                      resize: 'vertical',
                      minHeight: '72px',
                      maxHeight: '192px',
                    }
                  },
                  '& .MuiInputBase-input': {
                    textAlign: 'left',
                    verticalAlign: 'top',
                  }
                }}
              />
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Appliance Photos
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Upload Photos
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleApplianceImageUpload}
                />
              </Button>

              {applianceImages.length > 0 && (
                <ImageList cols={3} rowHeight={120} sx={{ mt: 1 }}>
                  {applianceImages.map((image) => (
                    <ImageListItem key={image.id}>
                      <img
                        src={image.url}
                        alt={image.alt}
                        loading="lazy"
                        style={{ objectFit: 'cover', height: '120px' }}
                      />
                      <ImageListItemBar
                        title={image.alt}
                        actionIcon={
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveApplianceImage(image.id)}
                            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplianceDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedAppliance) {
                // Edit existing appliance
                const updatedAppliances = property.appliances?.map(app =>
                  app.id === selectedAppliance.id ? { ...app, ...applianceFormData, images: applianceImages } : app
                ) || [];
                updateProperty({ ...property, appliances: updatedAppliances });
              } else {
                // Add new appliance
                const newAppliance = {
                  id: Date.now().toString(),
                  ...applianceFormData,
                  images: applianceImages
                } as Appliance;
                updateProperty({
                  ...property,
                  appliances: [...(property.appliances || []), newAppliance]
                });
              }
              setApplianceImages([]);
              setApplianceDialogOpen(false);
            }}
          >
            {selectedAppliance ? 'Update' : 'Add'} Appliance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Income Dialog */}
      <Dialog open={incomeDialogOpen} onClose={() => setIncomeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Income</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value="Rent"
                  label="Type"
                >
                  <MenuItem value="Rent">Rent</MenuItem>
                  <MenuItem value="Deposit">Deposit</MenuItem>
                  <MenuItem value="Fee">Fee</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Enter income description..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={(() => {
                  try {
                    return new Date().toISOString().split('T')[0];
                  } catch {
                    return '';
                  }
                })()}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tenant"
                placeholder="Associated tenant (optional)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncomeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Add income logic here
            setIncomeDialogOpen(false);
          }}>
            Add Income
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value="Maintenance"
                  label="Category"
                >
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                  <MenuItem value="Utilities">Utilities</MenuItem>
                  <MenuItem value="Insurance">Insurance</MenuItem>
                  <MenuItem value="Taxes">Taxes</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Enter expense description..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                defaultValue={(() => {
                  try {
                    return new Date().toISOString().split('T')[0];
                  } catch {
                    return '';
                  }
                })()}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor"
                placeholder="Vendor/service provider (optional)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            // Add expense logic here
            setExpenseDialogOpen(false);
          }}>
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={documentsDialogOpen} onClose={() => setDocumentsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>All Documents - {property.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="info">
              All documents related to {property.name} are listed below. You can view, download, or manage documents from here.
            </Alert>
            {(() => {
              const propertyDocuments = documents.filter(doc => doc.propertyId === propertyId);

              if (propertyDocuments.length === 0) {
                return (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No documents uploaded yet.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadRoundedIcon />}
                      onClick={() => setDocumentUploadDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Upload First Document
                    </Button>
                  </Box>
                );
              }

              return (
                <List>
                  {propertyDocuments.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <DescriptionRoundedIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={doc.name}
                          secondary={`${doc.type} • ${doc.category} • Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()} • Size: ${formatFileSize(doc.size)}`}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityRoundedIcon />}
                            onClick={() => {
                              setSelectedDocument(doc);
                              setDocumentViewModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloudUploadRoundedIcon />}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = doc.url;
                              link.download = doc.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            Download
                          </Button>
                        </Stack>
                      </ListItem>
                      {index < propertyDocuments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              );
            })()}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDocumentUploadDialogOpen(true)}
          >
            Upload New Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Background Color Picker Dialog */}
      <Dialog open={backgroundPickerOpen} onClose={() => setBackgroundPickerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            🎨 Customize Header Background
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Choose a background color for the property header banner
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Color Options:
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Primary Blue', value: 'primary.main', color: '#1976d2' },
                { label: 'Secondary Pink', value: 'secondary.main', color: '#dc004e' },
                { label: 'Success Green', value: 'success.main', color: '#2e7d32' },
                { label: 'Warning Orange', value: 'warning.main', color: '#ed6c02' },
                { label: 'Error Red', value: 'error.main', color: '#d32f2f' },
                { label: 'Info Cyan', value: 'info.main', color: '#0288d1' },
                { label: 'Purple', value: 'purple', color: '#7b1fa2' },
                { label: 'Indigo', value: 'indigo', color: '#303f9f' },
              ].map((colorOption) => (
                <Grid item xs={6} md={4} key={colorOption.value}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      // Save to localStorage for persistence
                      localStorage.setItem('propertyHeaderColor', colorOption.value);
                      setSavedHeaderColor(colorOption.value);

                      // Call parent callback if provided (for modal mode)
                      if (onBackgroundColorChange) {
                        onBackgroundColorChange(colorOption.value);
                      }

                      setBackgroundPickerOpen(false);
                    }}
                    sx={{
                      height: 64,
                      flexDirection: 'column',
                      bgcolor: colorOption.color,
                      color: 'white',
                      borderColor: colorOption.color,
                      '&:hover': {
                        bgcolor: colorOption.color,
                        opacity: 0.8,
                        borderColor: colorOption.color,
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {colorOption.label}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
            <Alert severity="info">
              The selected color will apply to this property's header banner. Changes are saved automatically.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackgroundPickerOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Work Order Dialog */}
      <WorkOrderDialog
        open={workOrderDialogOpen}
        onClose={() => setWorkOrderDialogOpen(false)}
        propertyId={property.id}
        propertyName={property.name}
        onWorkOrderCreated={(workOrder) => {
          // Add success notification or handling here
          console.log('Work order created:', workOrder);
        }}
      />

      {/* Document Upload Dialog */}
      <Dialog open={documentUploadDialogOpen} onClose={() => setDocumentUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadRoundedIcon />}
              sx={{
                height: 100,
                borderStyle: 'dashed',
                borderWidth: 2,
                flexDirection: 'column',
                gap: 1
              }}
            >
              {documentUploadData.file ? (
                <>
                  <Typography variant="body2">{documentUploadData.file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(documentUploadData.file.size)}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2">Click to select file</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Or drag and drop
                  </Typography>
                </>
              )}
              <VisuallyHiddenInput
                type="file"
                onChange={handleDocumentFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
            </Button>

            <FormControl fullWidth>
              <InputLabel>Document Category</InputLabel>
              <Select
                value={documentUploadData.category}
                label="Document Category"
                onChange={(e) => setDocumentUploadData({
                  ...documentUploadData,
                  category: e.target.value as any
                })}
              >
                <MenuItem value="Lease">Lease</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="Inspection">Inspection</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <MenuItem value="Financial">Financial</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={3}
              value={documentUploadData.description}
              onChange={(e) => setDocumentUploadData({
                ...documentUploadData,
                description: e.target.value
              })}
              placeholder="Add a description for this document..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDocumentUpload}
            disabled={!documentUploadData.file || uploadingDocument}
            startIcon={uploadingDocument ? undefined : <CloudUploadRoundedIcon />}
          >
            {uploadingDocument ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog
        open={documentViewModalOpen}
        onClose={() => {
          setDocumentViewModalOpen(false);
          setSelectedDocument(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedDocument?.name || 'Document Viewer'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => {
                  if (selectedDocument) {
                    const link = document.createElement('a');
                    link.href = selectedDocument.url;
                    link.download = selectedDocument.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                Download
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {selectedDocument ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#f5f5f5'
              }}
            >
              {/* Document Preview */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'white',
                  m: 2,
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }}
              >
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <DescriptionRoundedIcon sx={{ fontSize: 80, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Document Preview
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedDocument?.name || 'Unknown Document'}
                  </Typography>
                  <Chip
                    label={selectedDocument?.category || 'Other'}
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    Type: {selectedDocument?.type || 'Unknown'} • Size: {selectedDocument?.size ? formatFileSize(selectedDocument.size) : 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    Uploaded: {selectedDocument?.uploadedAt ? new Date(selectedDocument.uploadedAt).toLocaleDateString() : 'Unknown'} by {selectedDocument?.uploadedBy || 'Unknown'}
                  </Typography>
                  {/* Document Preview Based on File Type */}
                  <Box sx={{ mt: 3, mb: 3 }}>
                    {(selectedDocument?.type?.toLowerCase().includes('image') ||
                     selectedDocument?.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) ? (
                      // Image Preview
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Image Preview
                        </Typography>
                        <Box
                          component="img"
                          src={selectedDocument?.url || ''}
                          alt={selectedDocument?.name || 'Document preview'}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: 400,
                            objectFit: 'contain',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'white'
                          }}
                          onError={(e) => {
                            // Safe logging with null checks
                            const documentInfo = selectedDocument ? {
                              name: selectedDocument.name || 'Unknown document',
                              type: selectedDocument.type || 'Unknown type',
                              url: selectedDocument.url ? (selectedDocument.url.startsWith('data:') ? 'data URL' : selectedDocument.url.substring(0, 100) + '...') : 'No URL',
                              size: selectedDocument.size || 0,
                              hasDocument: !!selectedDocument
                            } : { error: 'selectedDocument is null or undefined' };

                            console.warn('Document image failed to load, showing fallback:', selectedDocument?.name || 'unknown document');
                            console.debug('Document details:', JSON.stringify(documentInfo, null, 2));

                            // Show a user-friendly error message
                            const target = e.target as HTMLImageElement;
                            const parentBox = target.parentElement;
                            if (parentBox) {
                              const documentName = selectedDocument?.name || 'Unknown Document';
                              const fileExtension = documentName.split('.').pop()?.toUpperCase() || 'FILE';
                              parentBox.innerHTML = `
                                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; color: #666; text-align: center; background: #f9f9f9; border-radius: 8px;">
                                  <div style="font-size: 48px; margin-bottom: 12px;">📄</div>
                                  <div style="font-weight: bold; margin-bottom: 8px; color: #333;">${documentName}</div>
                                  <div style="font-size: 12px; color: #999; margin-bottom: 4px;">${fileExtension} Document</div>
                                  <div style="font-size: 14px; color: #666;">Preview not available</div>
                                  <div style="font-size: 12px; color: #999; margin-top: 4px;">Use download button to view the file</div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </Box>
                    ) : (selectedDocument?.type?.toLowerCase().includes('pdf') ||
                           selectedDocument?.name?.toLowerCase().endsWith('.pdf')) ? (
                      // PDF Preview
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          PDF Document
                        </Typography>
                        <Box
                          sx={{
                            width: '100%',
                            height: 400,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <iframe
                            src={`${selectedDocument.url}#toolbar=1&navpanes=1&scrollbar=1`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title={`PDF Preview: ${selectedDocument.name}`}
                          />
                        </Box>
                      </Box>
                    ) : (selectedDocument?.type?.toLowerCase().includes('text') ||
                           selectedDocument?.name?.toLowerCase().match(/\.(txt|md|json|xml|csv)$/i)) ? (
                      // Text File Preview
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Text Document Preview
                        </Typography>
                        <Paper
                          sx={{
                            p: 2,
                            maxHeight: 300,
                            overflow: 'auto',
                            textAlign: 'left',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            bgcolor: 'grey.50'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Text content would be displayed here. Click "Open in New Tab" to view the full document.
                          </Typography>
                        </Paper>
                      </Box>
                    ) : (
                      // Other Document Types
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <DescriptionRoundedIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="body1" gutterBottom>
                          {selectedDocument?.name || 'Unknown Document'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This document type ({selectedDocument?.type || 'unknown'}) doesn't support inline preview.
                          Use the buttons below to open or download the file.
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      startIcon={<VisibilityRoundedIcon />}
                      onClick={() => {
                        if (selectedDocument?.url) {
                          window.open(selectedDocument.url, '_blank');
                        } else {
                          alert('Document URL not available.');
                        }
                      }}
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadRoundedIcon />}
                      onClick={() => {
                        try {
                          if (selectedDocument?.url && selectedDocument?.name) {
                            const link = document.createElement('a');
                            link.href = selectedDocument.url;
                            link.download = selectedDocument.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            alert('Document information not available for download.');
                          }
                        } catch (error) {
                          console.error('Download failed:', error);
                          alert('Download failed. Please try opening in a new tab.');
                        }
                      }}
                    >
                      Download
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                Document Not Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The selected document could not be loaded.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDocumentViewModalOpen(false);
            setSelectedDocument(null);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Dialog */}
      <TenantDialog
        open={tenantDialogOpen}
        onClose={() => setTenantDialogOpen(false)}
        propertyId={property.id}
        propertyName={property.name}
        onTenantCreated={(tenant) => {
          console.log('Tenant created/updated:', tenant);
          // Force a re-render by updating a state that will trigger refresh
          setTenantDialogOpen(false);
        }}
      />

      {/* Card Management Dialog */}
      <Dialog open={cardManagementOpen} onClose={() => setCardManagementOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddRoundedIcon />
            <Typography variant="h6">Manage Property Page Windows</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose which information windows to display on the property page. You can also drag and drop windows to rearrange them.
          </Typography>

          <Stack spacing={2}>
            {availableCards.map((card) => {
              const Icon = card.icon;
              const isVisible = isCardVisible(card.id);

              return (
                <Paper key={card.id} sx={{ p: 2 }} variant="outlined">
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Checkbox
                        checked={isVisible}
                        onChange={(e) => {
                          if (e.target.checked) {
                            addCard(card.id);
                          } else {
                            removeCard(card.id);
                          }
                        }}
                      />
                      <Icon sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1">{card.label}</Typography>
                    </Stack>
                    <Chip
                      label={isVisible ? "Visible" : "Hidden"}
                      color={isVisible ? "success" : "default"}
                      size="small"
                    />
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              💡 <strong>Tip:</strong> After closing this dialog, you can drag and drop the visible windows to rearrange their order on the property page.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCardManagementOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Reset to default layout
              setCardOrder(['tenant-info', 'property-manager', 'notes-activities', 'marketing-info', 'location']);
              setCardManagementOpen(false);
            }}
          >
            Reset to Default
          </Button>
        </DialogActions>
      </Dialog>

      {/* Property Application Dialog */}
      <PropertyApplicationDialog
        property={property}
        isOpen={applicationDialogOpen}
        onClose={() => setApplicationDialogOpen(false)}
        onApplicationSubmitted={(appData) => {
          console.log("Application submitted:", appData);
          setApplicationDialogOpen(false);

          // Track activity
          activityTracker.trackActivity({
            userId: 'current-user',
            userDisplayName: 'Current User',
            action: 'application_submitted',
            entityType: 'property',
            entityId: property.id,
            entityName: property.name,
            details: `Application submitted by ${appData.applicantName} - Code: ${appData.propertyCode}`
          });
        }}
      />

      {/* Edit Property Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EditRoundedIcon />
            <Typography variant="h6">Edit Property</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Property Name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter property name..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={editFormData.type || 'Apartment'}
                  label="Property Type"
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as any })}
                >
                  <MenuItem value="Apartment">Apartment</MenuItem>
                  <MenuItem value="House">House</MenuItem>
                  <MenuItem value="Condo">Condo</MenuItem>
                  <MenuItem value="Townhome">Townhome</MenuItem>
                  <MenuItem value="Commercial">Commercial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Enter property address..."
                helperText="Full address including street, city, state, and zip code"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Monthly Rent"
                type="number"
                value={editFormData.monthlyRent || ''}
                onChange={(e) => setEditFormData({ ...editFormData, monthlyRent: Number(e.target.value) })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Units"
                type="number"
                value={editFormData.units || ''}
                onChange={(e) => setEditFormData({ ...editFormData, units: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Security Deposit"
                type="number"
                value={editFormData.securityDeposit || ''}
                onChange={(e) => setEditFormData({ ...editFormData, securityDeposit: Number(e.target.value) })}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Square Footage"
                type="number"
                value={editFormData.squareFootage || ''}
                onChange={(e) => setEditFormData({ ...editFormData, squareFootage: Number(e.target.value) })}
                InputProps={{ endAdornment: 'sq ft' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={editFormData.bedrooms || ''}
                onChange={(e) => setEditFormData({ ...editFormData, bedrooms: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                step="0.5"
                value={editFormData.bathrooms || ''}
                onChange={(e) => setEditFormData({ ...editFormData, bathrooms: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pet Policy"
                value={editFormData.petPolicy || ''}
                onChange={(e) => setEditFormData({ ...editFormData, petPolicy: e.target.value })}
                placeholder="e.g., Cats allowed, No pets, Dogs under 50lbs..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parking Spaces"
                type="number"
                value={editFormData.parkingSpaces || ''}
                onChange={(e) => setEditFormData({ ...editFormData, parkingSpaces: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                label="Description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Enter property description..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveProperty}
            startIcon={<EditRoundedIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
