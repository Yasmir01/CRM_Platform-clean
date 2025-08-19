import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Button,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Slider,
  InputAdornment,
  Checkbox,
  Badge,
  useTheme,
  alpha,
} from "@mui/material";
import {
  fixedFormControlStyles,
  uniformTooltipStyles,
  formElementWidths,
  layoutSpacing
} from "../utils/formStyles";
import SubscriptionBackupControls from '../components/SubscriptionBackupControls';
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

type ItemCategory = "Software" | "Hardware" | "Service" | "Add-on" | "Feature";
type PricingModel = "One-time" | "Monthly" | "Yearly" | "Usage-based" | "Tiered";
type ItemStatus = "Active" | "Draft" | "Discontinued" | "Coming Soon";

interface PricingTier {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  description?: string;
}

interface MarketplaceItem {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  longDescription: string;
  icon: string;
  image?: string;
  status: ItemStatus;
  featured: boolean;
  pricingModel: PricingModel;
  basePrice: number;
  pricingTiers?: PricingTier[];
  features: string[];
  benefits: string[];
  technicalSpecs?: { [key: string]: string };
  compatibility: string[];
  vendor: string;
  supportLevel: "Basic" | "Premium" | "Enterprise";
  installationRequired: boolean;
  trialAvailable: boolean;
  trialDuration?: number; // days
  tags: string[];
  createdDate: string;
  lastUpdated: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
  metadata: {
    estimatedSetupTime: string;
    minimumProperties?: number;
    maxProperties?: number;
    requiresIntegration: boolean;
    apiAccess: boolean;
  };
}

const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: "item-001",
    name: "Power Tools Suite",
    category: "Add-on",
    description: "Complete productivity toolkit with QR-it, Win-it, and Pool-it",
    longDescription: "Supercharge your property management with our comprehensive Power Tools Suite. Includes QR-it for dynamic QR code generation with analytics, Win-it for instant prize campaigns, and Pool-it for group buying power. Essential tools to modernize your property operations.",
    icon: "🛠️",
    status: "Active",
    featured: true,
    pricingModel: "Monthly",
    basePrice: 29.99,
    pricingTiers: [
      { id: "power-1", name: "Basic", minQuantity: 1, maxQuantity: 10, price: 29.99, description: "Up to 10 users" },
      { id: "power-2", name: "Professional", minQuantity: 11, maxQuantity: 50, price: 24.99, description: "11-50 users, team discount" },
      { id: "power-3", name: "Enterprise", minQuantity: 51, price: 19.99, description: "51+ users, maximum value" }
    ],
    features: [
      "QR-it: Advanced QR code generator with analytics",
      "Win-it: Instant prize and promotion campaigns",
      "Pool-it: Group buying and bulk purchasing",
      "Lead capture and tracking",
      "Customizable branding",
      "Real-time analytics dashboard"
    ],
    benefits: [
      "Increase tenant engagement by 250%",
      "Streamline marketing campaigns",
      "Reduce costs through group buying",
      "Professional digital presence"
    ],
    technicalSpecs: {
      "QR Codes": "Unlimited generation",
      "Analytics": "Real-time tracking",
      "Integrations": "Full CRM sync",
      "Customization": "Complete branding control"
    },
    compatibility: ["All CRM versions", "Mobile optimized", "Cloud-based"],
    vendor: "PropertyCRM Inc.",
    supportLevel: "Premium",
    installationRequired: false,
    trialAvailable: true,
    trialDuration: 7,
    tags: ["productivity", "marketing", "tools", "engagement"],
    createdDate: "2024-01-20",
    lastUpdated: "2024-01-25",
    salesCount: 89,
    rating: 4.9,
    reviewCount: 34,
    metadata: {
      estimatedSetupTime: "5 minutes",
      requiresIntegration: false,
      apiAccess: true
    }
  },
  {
    id: "item-002",
    name: "Power Dialer Pro",
    category: "Add-on",
    description: "Professional auto-dialing with advanced keypad and call management",
    longDescription: "Elevate your communication game with Power Dialer Pro. Features our signature manual dialer with professional keypad, auto-dialing capabilities, call recording, and comprehensive analytics. Perfect for property managers who need to make high-volume calls efficiently.",
    icon: "📞",
    status: "Active",
    featured: true,
    pricingModel: "Monthly",
    basePrice: 19.99,
    pricingTiers: [
      { id: "dialer-1", name: "Individual", minQuantity: 1, maxQuantity: 1, price: 19.99, description: "Single user license" },
      { id: "dialer-2", name: "Team", minQuantity: 2, maxQuantity: 10, price: 16.99, description: "2-10 users, team discount" },
      { id: "dialer-3", name: "Organization", minQuantity: 11, price: 12.99, description: "11+ users, maximum savings" }
    ],
    features: [
      "Professional manual dialer with full keypad",
      "Auto-dialing with smart call queuing",
      "Call recording and playback",
      "Real-time call analytics",
      "CRM contact integration",
      "Speed dial and favorites",
      "Call history and notes"
    ],
    benefits: [
      "Professional calling interface",
      "Increase call efficiency by 200%",
      "Streamlined contact management",
      "Better call tracking and follow-up"
    ],
    technicalSpecs: {
      "Dialer Interface": "Professional keypad",
      "Call Features": "Recording, notes, history",
      "CRM Integration": "Full contact sync",
      "Platform": "Web-based, mobile ready"
    },
    compatibility: ["All CRM versions", "Web browsers", "Mobile optimized"],
    vendor: "PropertyCRM Inc.",
    supportLevel: "Premium",
    installationRequired: false,
    trialAvailable: true,
    trialDuration: 7,
    tags: ["communication", "dialer", "calling", "productivity"],
    createdDate: "2024-01-20",
    lastUpdated: "2024-01-25",
    salesCount: 67,
    rating: 4.8,
    reviewCount: 23,
    metadata: {
      estimatedSetupTime: "5 minutes",
      requiresIntegration: false,
      apiAccess: true
    }
  },
  {
    id: "item-003",
    name: "Additional Properties Pack",
    category: "Add-on",
    description: "Expand your property limit in segments of 5",
    longDescription: "Need to manage more properties? Our flexible property packs let you scale your account in affordable increments of 5 properties each. Perfect for growing property management businesses.",
    icon: "🏠",
    status: "Active",
    featured: false,
    pricingModel: "Monthly",
    basePrice: 15.00,
    features: [
      "Add 5 additional properties",
      "Full feature access for new properties",
      "No setup fees",
      "Instant activation",
      "Scalable - buy multiple packs"
    ],
    benefits: [
      "Flexible scaling",
      "Cost-effective growth",
      "No long-term commitments",
      "Same feature set"
    ],
    compatibility: ["All subscription plans"],
    vendor: "PropertyCRM Inc.",
    supportLevel: "Basic",
    installationRequired: false,
    trialAvailable: false,
    tags: ["properties", "scaling", "add-on", "growth"],
    createdDate: "2024-01-05",
    lastUpdated: "2024-01-10",
    salesCount: 234,
    rating: 4.9,
    reviewCount: 45,
    metadata: {
      estimatedSetupTime: "Instant",
      requiresIntegration: false,
      apiAccess: false
    }
  },
  {
    id: "item-004",
    name: "Smart Maintenance Scheduler",
    category: "Service",
    description: "AI-powered preventive maintenance scheduling",
    longDescription: "Revolutionary AI-driven maintenance scheduling that predicts optimal maintenance times, reduces emergency repairs, and extends property lifecycle. Integrates with your existing vendor network.",
    icon: "🔧",
    status: "Active",
    featured: true,
    pricingModel: "Usage-based",
    basePrice: 2.50, // per property per month
    features: [
      "AI-powered scheduling predictions",
      "Vendor network integration",
      "Automated work order generation",
      "Maintenance history tracking",
      "Cost optimization algorithms",
      "Emergency prioritization"
    ],
    benefits: [
      "Reduce emergency repairs by 60%",
      "Extend equipment lifespan",
      "Lower maintenance costs",
      "Improve tenant satisfaction"
    ],
    technicalSpecs: {
      "AI Models": "Predictive maintenance algorithms",
      "Vendor Integration": "API-based connections",
      "Reporting": "Real-time dashboards",
      "Mobile App": "iOS & Android compatible"
    },
    compatibility: ["Professional Plan+", "Enterprise Plan"],
    vendor: "MaintenanceAI Labs",
    supportLevel: "Enterprise",
    installationRequired: true,
    trialAvailable: true,
    trialDuration: 30,
    tags: ["maintenance", "AI", "automation", "predictive"],
    createdDate: "2024-01-08",
    lastUpdated: "2024-01-12",
    salesCount: 78,
    rating: 4.7,
    reviewCount: 23,
    metadata: {
      estimatedSetupTime: "1-2 business days",
      minimumProperties: 25,
      requiresIntegration: true,
      apiAccess: true
    }
  },
  {
    id: "item-005",
    name: "Professional Photography Service",
    category: "Service",
    description: "High-quality property photography and virtual tours",
    longDescription: "Professional property photography service with drone shots, virtual tours, and 3D walkthroughs. Increase your listing views and rental rates with stunning visual content.",
    icon: "📸",
    status: "Active",
    featured: false,
    pricingModel: "One-time",
    basePrice: 299.99,
    pricingTiers: [
      { id: "photo-1", name: "Basic Package", minQuantity: 1, maxQuantity: 1, price: 299.99, description: "20 photos + virtual tour" },
      { id: "photo-2", name: "Premium Package", minQuantity: 1, maxQuantity: 1, price: 499.99, description: "40 photos + virtual tour + drone shots" },
      { id: "photo-3", name: "Luxury Package", minQuantity: 1, maxQuantity: 1, price: 799.99, description: "60 photos + virtual tour + drone shots + 3D walkthrough" }
    ],
    features: [
      "Professional photographer",
      "HDR photography techniques",
      "Virtual tour creation",
      "Drone photography (premium+)",
      "3D walkthrough (luxury)",
      "Fast turnaround (48 hours)"
    ],
    benefits: [
      "Increase listing views by 200%",
      "Higher rental rates",
      "Faster leasing times",
      "Professional presentation"
    ],
    compatibility: ["All plans"],
    vendor: "PropertyVisuals Pro",
    supportLevel: "Premium",
    installationRequired: false,
    trialAvailable: false,
    tags: ["photography", "marketing", "virtual tours", "professional"],
    createdDate: "2024-01-10",
    lastUpdated: "2024-01-14",
    salesCount: 145,
    rating: 4.9,
    reviewCount: 67,
    metadata: {
      estimatedSetupTime: "Schedule within 24 hours",
      requiresIntegration: false,
      apiAccess: false
    }
  }
];

export default function Marketplace() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);
  const [mainTab, setMainTab] = React.useState<'marketplace' | 'subscription'>('marketplace');
  const [items, setItems] = React.useState<MarketplaceItem[]>(mockMarketplaceItems);
  const [addItemOpen, setAddItemOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MarketplaceItem | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [newItem, setNewItem] = React.useState<Partial<MarketplaceItem>>({
    name: "",
    category: "Software",
    description: "",
    longDescription: "",
    icon: "",
    status: "Draft",
    featured: false,
    pricingModel: "Monthly",
    basePrice: 0,
    features: [],
    benefits: [],
    compatibility: [],
    vendor: "",
    supportLevel: "Basic",
    installationRequired: false,
    trialAvailable: false,
    tags: [],
    metadata: {
      estimatedSetupTime: "",
      requiresIntegration: false,
      apiAccess: false
    }
  });

  const filteredItems = items.filter(item => {
    switch (activeTab) {
      case 1: return item.status === "Active";
      case 2: return item.status === "Draft";
      case 3: return item.featured;
      case 4: return item.category === "Add-on";
      default: return true;
    }
  });

  const handleAddItem = () => {
    const id = `item-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    
    const item: MarketplaceItem = {
      ...newItem,
      id,
      createdDate: now,
      lastUpdated: now,
      salesCount: 0,
      rating: 0,
      reviewCount: 0,
    } as MarketplaceItem;

    setItems(prev => [...prev, item]);
    setAddItemOpen(false);
    setActiveStep(0);
    setNewItem({
      name: "",
      category: "Software",
      description: "",
      longDescription: "",
      icon: "",
      status: "Draft",
      featured: false,
      pricingModel: "Monthly",
      basePrice: 0,
      features: [],
      benefits: [],
      compatibility: [],
      vendor: "",
      supportLevel: "Basic",
      installationRequired: false,
      trialAvailable: false,
      tags: [],
      metadata: {
        estimatedSetupTime: "",
        requiresIntegration: false,
        apiAccess: false
      }
    });
  };

  const addItemSteps = [
    "Basic Information",
    "Pricing & Plans",
    "Features & Benefits",
    "Technical Details",
    "Review & Publish"
  ];

  const renderBasicInfo = () => (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={newItem.category}
              label="Category"
              onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
            >
              <MenuItem value="Software">Software</MenuItem>
              <MenuItem value="Hardware">Hardware</MenuItem>
              <MenuItem value="Service">Service</MenuItem>
              <MenuItem value="Add-on">Add-on</MenuItem>
              <MenuItem value="Feature">Feature</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Short Description"
            value={newItem.description}
            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={2}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Detailed Description"
            value={newItem.longDescription}
            onChange={(e) => setNewItem(prev => ({ ...prev, longDescription: e.target.value }))}
            multiline
            rows={4}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Icon/Emoji"
            value={newItem.icon}
            onChange={(e) => setNewItem(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="📱 (or URL to icon)"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Vendor"
            value={newItem.vendor}
            onChange={(e) => setNewItem(prev => ({ ...prev, vendor: e.target.value }))}
            required
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={newItem.featured}
              onChange={(e) => setNewItem(prev => ({ ...prev, featured: e.target.checked }))}
            />
          }
          label="Featured Item"
        />
        <FormControlLabel
          control={
            <Switch
              checked={newItem.trialAvailable}
              onChange={(e) => setNewItem(prev => ({ ...prev, trialAvailable: e.target.checked }))}
            />
          }
          label="Trial Available"
        />
      </Stack>
    </Stack>
  );

  const renderPricingPlans = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Pricing Configuration</Typography>
      
      <FormControl fullWidth>
        <InputLabel>Pricing Model</InputLabel>
        <Select
          value={newItem.pricingModel}
          label="Pricing Model"
          onChange={(e) => setNewItem(prev => ({ ...prev, pricingModel: e.target.value as PricingModel }))}
        >
          <MenuItem value="One-time">One-time Payment</MenuItem>
          <MenuItem value="Monthly">Monthly Subscription</MenuItem>
          <MenuItem value="Yearly">Yearly Subscription</MenuItem>
          <MenuItem value="Usage-based">Usage-based Pricing</MenuItem>
          <MenuItem value="Tiered">Tiered Pricing</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Base Price"
        type="number"
        value={newItem.basePrice}
        onChange={(e) => setNewItem(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>
        }}
        required
      />

      {newItem.pricingModel === "Tiered" && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Pricing Tiers
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              const newTier: PricingTier = {
                id: `tier-${Date.now()}`,
                name: "",
                minQuantity: 1,
                price: 0
              };
              setNewItem(prev => ({
                ...prev,
                pricingTiers: [...(prev.pricingTiers || []), newTier]
              }));
            }}
          >
            Add Pricing Tier
          </Button>
          {newItem.pricingTiers?.map((tier, index) => (
            <Card key={tier.id} sx={{ mt: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Tier Name"
                      value={tier.name}
                      onChange={(e) => {
                        const updatedTiers = [...(newItem.pricingTiers || [])];
                        updatedTiers[index] = { ...tier, name: e.target.value };
                        setNewItem(prev => ({ ...prev, pricingTiers: updatedTiers }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Min Quantity"
                      type="number"
                      value={tier.minQuantity}
                      onChange={(e) => {
                        const updatedTiers = [...(newItem.pricingTiers || [])];
                        updatedTiers[index] = { ...tier, minQuantity: parseInt(e.target.value) || 1 };
                        setNewItem(prev => ({ ...prev, pricingTiers: updatedTiers }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={tier.price}
                      onChange={(e) => {
                        const updatedTiers = [...(newItem.pricingTiers || [])];
                        updatedTiers[index] = { ...tier, price: parseFloat(e.target.value) || 0 };
                        setNewItem(prev => ({ ...prev, pricingTiers: updatedTiers }));
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <IconButton
                      onClick={() => {
                        const updatedTiers = newItem.pricingTiers?.filter((_, i) => i !== index) || [];
                        setNewItem(prev => ({ ...prev, pricingTiers: updatedTiers }));
                      }}
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <FormControl fullWidth>
        <InputLabel>Support Level</InputLabel>
        <Select
          value={newItem.supportLevel}
          label="Support Level"
          onChange={(e) => setNewItem(prev => ({ ...prev, supportLevel: e.target.value as "Basic" | "Premium" | "Enterprise" }))}
        >
          <MenuItem value="Basic">Basic Support</MenuItem>
          <MenuItem value="Premium">Premium Support</MenuItem>
          <MenuItem value="Enterprise">Enterprise Support</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );

  const renderFeaturesAndBenefits = () => (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>Features</Typography>
        <TextField
          fullWidth
          label="Add Feature (press Enter to add)"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                setNewItem(prev => ({
                  ...prev,
                  features: [...(prev.features || []), input.value.trim()]
                }));
                input.value = '';
              }
            }
          }}
        />
        <List dense>
          {newItem.features?.map((feature, index) => (
            <ListItem key={index}>
              <ListItemText primary={feature} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    const updatedFeatures = newItem.features?.filter((_, i) => i !== index) || [];
                    setNewItem(prev => ({ ...prev, features: updatedFeatures }));
                  }}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>Benefits</Typography>
        <TextField
          fullWidth
          label="Add Benefit (press Enter to add)"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                setNewItem(prev => ({
                  ...prev,
                  benefits: [...(prev.benefits || []), input.value.trim()]
                }));
                input.value = '';
              }
            }
          }}
        />
        <List dense>
          {newItem.benefits?.map((benefit, index) => (
            <ListItem key={index}>
              <ListItemText primary={benefit} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    const updatedBenefits = newItem.benefits?.filter((_, i) => i !== index) || [];
                    setNewItem(prev => ({ ...prev, benefits: updatedBenefits }));
                  }}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>Compatibility</Typography>
        <TextField
          fullWidth
          label="Add Compatibility (press Enter to add)"
          placeholder="e.g., All CRM versions, Windows 10+, etc."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                setNewItem(prev => ({
                  ...prev,
                  compatibility: [...(prev.compatibility || []), input.value.trim()]
                }));
                input.value = '';
              }
            }
          }}
        />
        <List dense>
          {newItem.compatibility?.map((comp, index) => (
            <ListItem key={index}>
              <ListItemText primary={comp} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    const updatedComp = newItem.compatibility?.filter((_, i) => i !== index) || [];
                    setNewItem(prev => ({ ...prev, compatibility: updatedComp }));
                  }}
                >
                  <DeleteRoundedIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Stack>
  );

  const renderTechnicalDetails = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Technical Configuration</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Estimated Setup Time"
            value={newItem.metadata?.estimatedSetupTime}
            onChange={(e) => setNewItem(prev => ({
              ...prev,
              metadata: { ...prev.metadata!, estimatedSetupTime: e.target.value }
            }))}
            placeholder="e.g., 2-4 hours, Instant, 1-2 business days"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Minimum Properties Required"
            type="number"
            value={newItem.metadata?.minimumProperties || ""}
            onChange={(e) => setNewItem(prev => ({
              ...prev,
              metadata: { 
                ...prev.metadata!, 
                minimumProperties: e.target.value ? parseInt(e.target.value) : undefined 
              }
            }))}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={newItem.installationRequired}
              onChange={(e) => setNewItem(prev => ({ ...prev, installationRequired: e.target.checked }))}
            />
          }
          label="Installation Required"
        />
        <FormControlLabel
          control={
            <Switch
              checked={newItem.metadata?.requiresIntegration}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                metadata: { ...prev.metadata!, requiresIntegration: e.target.checked }
              }))}
            />
          }
          label="Requires Integration"
        />
        <FormControlLabel
          control={
            <Switch
              checked={newItem.metadata?.apiAccess}
              onChange={(e) => setNewItem(prev => ({
                ...prev,
                metadata: { ...prev.metadata!, apiAccess: e.target.checked }
              }))}
            />
          }
          label="API Access"
        />
      </Stack>

      <Box>
        <Typography variant="h6" gutterBottom>Tags</Typography>
        <TextField
          fullWidth
          label="Add Tag (press Enter to add)"
          placeholder="e.g., communication, automation, AI"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                setNewItem(prev => ({
                  ...prev,
                  tags: [...(prev.tags || []), input.value.trim()]
                }));
                input.value = '';
              }
            }
          }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {newItem.tags?.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => {
                const updatedTags = newItem.tags?.filter((_, i) => i !== index) || [];
                setNewItem(prev => ({ ...prev, tags: updatedTags }));
              }}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );

  const renderReviewAndPublish = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Review Your Marketplace Item</Typography>
      
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Basic Information</Typography>
              <Typography>{newItem.name}</Typography>
              <Typography color="text.secondary">{newItem.description}</Typography>
              <Typography variant="body2">Category: {newItem.category}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Pricing</Typography>
              <Typography variant="h6">${newItem.basePrice}</Typography>
              <Typography color="text.secondary">{newItem.pricingModel}</Typography>
              <Typography variant="body2">Support: {newItem.supportLevel}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Features ({newItem.features?.length || 0})</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {newItem.features?.slice(0, 3).map((feature, index) => (
                  <Chip key={index} label={feature} size="small" />
                ))}
                {(newItem.features?.length || 0) > 3 && (
                  <Chip label={`+${newItem.features!.length - 3} more`} size="small" variant="outlined" />
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <FormControl fullWidth>
        <InputLabel>Publication Status</InputLabel>
        <Select
          value={newItem.status}
          label="Publication Status"
          onChange={(e) => setNewItem(prev => ({ ...prev, status: e.target.value as ItemStatus }))}
        >
          <MenuItem value="Draft">Save as Draft</MenuItem>
          <MenuItem value="Active">Publish Immediately</MenuItem>
          <MenuItem value="Coming Soon">Coming Soon</MenuItem>
        </Select>
      </FormControl>

      <Alert severity="info">
        <Typography variant="body2">
          {newItem.status === "Active" 
            ? "This item will be immediately available in the marketplace."
            : newItem.status === "Draft"
            ? "This item will be saved as a draft and can be published later."
            : "This item will be visible but marked as 'Coming Soon'."
          }
        </Typography>
      </Alert>
    </Stack>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Marketplace Administration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setAddItemOpen(true)}
          disabled={mainTab === 'subscription'}
        >
          Add New Item
        </Button>
      </Stack>

      {/* Main Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Button
          variant={mainTab === 'marketplace' ? 'contained' : 'text'}
          onClick={() => setMainTab('marketplace')}
          sx={{ mr: 1 }}
          startIcon={<StorefrontRoundedIcon />}
        >
          Marketplace Items
        </Button>
        <Button
          variant={mainTab === 'subscription' ? 'contained' : 'text'}
          onClick={() => setMainTab('subscription')}
          startIcon={<SettingsRoundedIcon />}
        >
          Subscription Settings
        </Button>
      </Box>

      {mainTab === 'subscription' ? (
        <SubscriptionBackupControls
          currentSubscription="Professional"
          onSubscriptionChange={(newLevel) => {
            console.log('Marketplace: Subscription changed to:', newLevel);
          }}
        />
      ) : (
        <>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Items
                  </Typography>
                  <Typography variant="h4">{items.length}</Typography>
                </Box>
                <InventoryRoundedIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Active Items
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {items.filter(i => i.status === "Active").length}
                  </Typography>
                </Box>
                <CheckCircleRoundedIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Sales
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {items.reduce((sum, item) => sum + item.salesCount, 0)}
                  </Typography>
                </Box>
                <TrendingUpRoundedIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Avg Rating
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {(items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1)}
                  </Typography>
                </Box>
                <StarRoundedIcon color="warning" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="All Items" />
          <Tab label="Active" />
          <Tab label="Drafts" />
          <Tab label="Featured" />
          <Tab label="Add-ons" />
        </Tabs>
      </Card>

      {/* Items Grid */}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card sx={{ height: "100%", position: "relative" }}>
              {item.featured && (
                <Chip
                  label="Featured"
                  color="primary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1
                  }}
                />
              )}
              <CardContent>
                <Stack spacing={layoutSpacing.normal}>
                  {/* Header */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4">{item.icon}</Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.status}
                        size="small"
                        color={
                          item.status === "Active" ? "success" :
                          item.status === "Draft" ? "default" :
                          item.status === "Coming Soon" ? "info" : "default"
                        }
                        sx={{ maxWidth: 'fit-content' }}
                      />
                    </Box>
                  </Stack>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.5em',
                      lineHeight: 1.25
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* Category & Pricing */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ minHeight: '32px' }}
                  >
                    <Chip
                      label={item.category}
                      size="small"
                      variant="outlined"
                      sx={{ maxWidth: formElementWidths.medium }}
                    />
                    <Box sx={{ textAlign: 'right', minWidth: formElementWidths.small }}>
                      <Typography variant="h6" color="primary.main" sx={{ lineHeight: 1 }}>
                        ${item.basePrice}
                        <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
                          /{item.pricingModel === "Monthly" ? "mo" :
                            item.pricingModel === "Yearly" ? "yr" :
                            item.pricingModel === "Usage-based" ? "usage" : ""}
                        </Typography>
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Stats */}
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      minHeight: '24px',
                      flexWrap: 'wrap',
                      gap: 1
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 'fit-content' }}>
                      <ShoppingCartRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        {item.salesCount} sales
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 'fit-content' }}>
                      <StarRoundedIcon fontSize="small" color="warning" />
                      <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                        {item.rating} ({item.reviewCount})
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Features Preview */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Key Features</Typography>
                    <Stack spacing={0.5}>
                      {item.features.slice(0, 3).map((feature, index) => (
                        <Typography key={index} variant="body2" color="text.secondary">
                          • {feature}
                        </Typography>
                      ))}
                      {item.features.length > 3 && (
                        <Typography variant="body2" color="primary.main">
                          +{item.features.length - 3} more features
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{
                      mt: 'auto',
                      minWidth: formElementWidths.large,
                      pt: 1
                    }}
                  >
                    <Tooltip
                      title="View Details"
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => setSelectedItem(item)}
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'info.light', color: 'info.main' }
                        }}
                      >
                        <VisibilityRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="Edit Item"
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedItem(item);
                          setEditMode(true);
                        }}
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                        }}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="Toggle Status"
                      componentsProps={{
                        tooltip: {
                          sx: uniformTooltipStyles
                        }
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'action.hover',
                          '&:hover': { bgcolor: 'warning.light', color: 'warning.main' }
                        }}
                      >
                        {item.status === "Active" ?
                          <VisibilityOffRoundedIcon /> :
                          <VisibilityRoundedIcon />
                        }
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add New Marketplace Item</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {addItemSteps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {index === 0 && renderBasicInfo()}
                    {index === 1 && renderPricingPlans()}
                    {index === 2 && renderFeaturesAndBenefits()}
                    {index === 3 && renderTechnicalDetails()}
                    {index === 4 && renderReviewAndPublish()}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      disabled={index === 0}
                      onClick={() => setActiveStep(prev => prev - 1)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={index === addItemSteps.length - 1 ? handleAddItem : () => setActiveStep(prev => prev + 1)}
                    >
                      {index === addItemSteps.length - 1 ? "Create Item" : "Continue"}
                    </Button>
                  </Stack>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddItemOpen(false);
            setActiveStep(0);
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog 
        open={selectedItem !== null && !editMode} 
        onClose={() => setSelectedItem(null)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h4">{selectedItem.icon}</Typography>
                <Box>
                  <Typography variant="h6">{selectedItem.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {selectedItem.vendor}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="body1">{selectedItem.longDescription}</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Pricing</Typography>
                    <Typography variant="h5">${selectedItem.basePrice}</Typography>
                    <Typography variant="body2">{selectedItem.pricingModel}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Performance</Typography>
                    <Typography>{selectedItem.salesCount} total sales</Typography>
                    <Typography>{selectedItem.rating}★ ({selectedItem.reviewCount} reviews)</Typography>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Features</Typography>
                  <List dense>
                    {selectedItem.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleRoundedIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Technical Details</Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Setup Time:</strong> {selectedItem.metadata.estimatedSetupTime}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Installation Required:</strong> {selectedItem.installationRequired ? "Yes" : "No"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>API Access:</strong> {selectedItem.metadata.apiAccess ? "Yes" : "No"}
                    </Typography>
                    {selectedItem.metadata.minimumProperties && (
                      <Typography variant="body2">
                        <strong>Minimum Properties:</strong> {selectedItem.metadata.minimumProperties}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {selectedItem.tags.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedItem.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedItem(null)}>Close</Button>
              <Button 
                variant="outlined" 
                onClick={() => setEditMode(true)}
                startIcon={<EditRoundedIcon />}
              >
                Edit Item
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
        </>
      )}
    </Box>
  );
}
