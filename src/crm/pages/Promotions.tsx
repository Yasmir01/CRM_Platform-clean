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
  Alert,
  Tooltip,
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import { quickCopy } from "../utils/clipboardUtils";

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: "Discount" | "Special Offer" | "Move-in Bonus" | "Rent Free" | "Waived Fees" | "Amenity Bonus";
  discountType: "Percentage" | "Fixed Amount" | "Free Months";
  discountValue: number;
  validFrom: string;
  validTo: string;
  status: "Active" | "Scheduled" | "Expired" | "Draft";
  applicableProperties: string[];
  usageCount: number;
  maxUsage?: number;
  terms: string;
  promocode?: string;
  targetAudience: "All" | "New Tenants" | "Returning Tenants" | "Students" | "Seniors" | "Military";
  createdDate: string;
  lastModified: string;
}

interface PromotionTemplate {
  id: string;
  name: string;
  category: "Seasonal" | "Move-in" | "Referral" | "Holiday" | "Emergency";
  title: string;
  description: string;
  type: Promotion["type"];
  discountType: Promotion["discountType"];
  terms: string;
  duration: number; // days
}

const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "First Month Free",
    description: "Move in today and get your first month of rent completely free! Perfect for new residents looking for immediate savings.",
    type: "Rent Free",
    discountType: "Free Months",
    discountValue: 1,
    validFrom: "2024-01-01",
    validTo: "2024-03-31",
    status: "Active",
    applicableProperties: ["PROP-001", "PROP-002"],
    usageCount: 8,
    maxUsage: 20,
    terms: "Valid for new leases only. Must sign 12-month lease. Cannot be combined with other offers.",
    promocode: "FREEMONTH2024",
    targetAudience: "New Tenants",
    createdDate: "2024-01-01",
    lastModified: "2024-01-15"
  },
  {
    id: "2",
    title: "Student Discount Special",
    description: "Students save 15% on monthly rent with valid student ID. Making education more affordable!",
    type: "Discount",
    discountType: "Percentage",
    discountValue: 15,
    validFrom: "2024-01-15",
    validTo: "2024-08-31",
    status: "Active",
    applicableProperties: ["PROP-002", "PROP-003"],
    usageCount: 3,
    maxUsage: 10,
    terms: "Valid student ID required. Must be enrolled full-time. Applies to base rent only.",
    promocode: "STUDENT15",
    targetAudience: "Students",
    createdDate: "2024-01-10",
    lastModified: "2024-01-12"
  },
  {
    id: "3",
    title: "Security Deposit Waived",
    description: "Move in with confidence! We'll waive the security deposit for qualified applicants.",
    type: "Waived Fees",
    discountType: "Fixed Amount",
    discountValue: 500,
    validFrom: "2024-02-01",
    validTo: "2024-02-29",
    status: "Scheduled",
    applicableProperties: ["PROP-001"],
    usageCount: 0,
    terms: "Credit score 720+ required. Background check must pass. First-time renters eligible.",
    targetAudience: "All",
    createdDate: "2024-01-16",
    lastModified: "2024-01-16"
  },
  {
    id: "4",
    title: "Holiday Special - $200 Off",
    description: "Celebrate the season with $200 off your first month's rent!",
    type: "Discount",
    discountType: "Fixed Amount",
    discountValue: 200,
    validFrom: "2023-12-01",
    validTo: "2024-01-05",
    status: "Expired",
    applicableProperties: ["PROP-001", "PROP-002", "PROP-003"],
    usageCount: 12,
    maxUsage: 15,
    terms: "Valid for December and January move-ins only.",
    promocode: "HOLIDAY200",
    targetAudience: "All",
    createdDate: "2023-11-15",
    lastModified: "2024-01-06"
  }
];

const mockTemplates: PromotionTemplate[] = [
  {
    id: "1",
    name: "Spring Move-in Special",
    category: "Seasonal",
    title: "Spring Into Savings",
    description: "Welcome spring with amazing savings on your new home!",
    type: "Discount",
    discountType: "Percentage",
    terms: "Valid for new leases signed during spring months. Cannot be combined with other offers.",
    duration: 90
  },
  {
    id: "2",
    name: "Military Appreciation",
    category: "Move-in",
    title: "Thank You for Your Service",
    description: "Special discount for active military personnel and veterans.",
    type: "Discount",
    discountType: "Percentage",
    terms: "Valid military ID required. Applies to active duty and veterans.",
    duration: 365
  },
  {
    id: "3",
    name: "Refer-a-Friend Bonus",
    category: "Referral",
    title: "Earn Cash for Referrals",
    description: "Refer a friend and both of you save money!",
    type: "Move-in Bonus",
    discountType: "Fixed Amount",
    terms: "Referred tenant must sign lease and move in. Bonus paid after 30 days.",
    duration: 30
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
      id={`promotions-tabpanel-${index}`}
      aria-labelledby={`promotions-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Promotions() {
  const [promotions, setPromotions] = React.useState<Promotion[]>(mockPromotions);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<PromotionTemplate | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    type: "Discount" as Promotion["type"],
    discountType: "Percentage" as Promotion["discountType"],
    discountValue: 0,
    validFrom: "",
    validTo: "",
    terms: "",
    promocode: "",
    targetAudience: "All" as Promotion["targetAudience"],
    maxUsage: 0,
    applicableProperties: [] as string[]
  });
  const [editingPromotion, setEditingPromotion] = React.useState<Promotion | null>(null);

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = 
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.promocode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || promo.status === statusFilter;
    const matchesType = typeFilter === "All" || promo.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Promotion["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "Scheduled": return "info";
      case "Expired": return "default";
      case "Draft": return "warning";
      default: return "default";
    }
  };

  const getTypeIcon = (type: Promotion["type"]) => {
    switch (type) {
      case "Discount": return <PercentRoundedIcon />;
      case "Special Offer": return <StarRoundedIcon />;
      case "Move-in Bonus": return <AttachMoneyRoundedIcon />;
      case "Rent Free": return <HomeRoundedIcon />;
      case "Waived Fees": return <LocalOfferRoundedIcon />;
      case "Amenity Bonus": return <CheckCircleRoundedIcon />;
      default: return <CampaignRoundedIcon />;
    }
  };

  const handleCreatePromotion = () => {
    if (editingPromotion) {
      // Update existing promotion
      setPromotions(prev => prev.map(promo =>
        promo.id === editingPromotion.id
          ? {
              ...promo,
              title: formData.title,
              description: formData.description,
              type: formData.type,
              discountType: formData.discountType,
              discountValue: formData.discountValue,
              validFrom: formData.validFrom,
              validTo: formData.validTo,
              terms: formData.terms,
              promocode: formData.promocode,
              targetAudience: formData.targetAudience,
              maxUsage: formData.maxUsage || undefined,
              applicableProperties: formData.applicableProperties,
              lastModified: new Date().toISOString().split('T')[0]
            }
          : promo
      ));
      alert(`Promotion updated: ${formData.title}`);
    } else {
      // Create new promotion
      const newPromotion: Promotion = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        status: "Draft",
        applicableProperties: formData.applicableProperties,
        usageCount: 0,
        maxUsage: formData.maxUsage || undefined,
        terms: formData.terms,
        promocode: formData.promocode,
        targetAudience: formData.targetAudience,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };

      setPromotions(prev => [...prev, newPromotion]);
      alert(`Promotion created: ${newPromotion.title}`);
    }

    setCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "Discount",
      discountType: "Percentage",
      discountValue: 0,
      validFrom: "",
      validTo: "",
      terms: "",
      promocode: "",
      targetAudience: "All",
      maxUsage: 0,
      applicableProperties: []
    });
    setSelectedTemplate(null);
    setEditingPromotion(null);
  };

  const handleUseTemplate = (template: PromotionTemplate) => {
    setFormData({
      title: template.title,
      description: template.description,
      type: template.type,
      discountType: template.discountType,
      discountValue: 0,
      validFrom: "",
      validTo: "",
      terms: template.terms,
      promocode: "",
      targetAudience: "All",
      maxUsage: 0,
      applicableProperties: []
    });
    setSelectedTemplate(template);
    setCreateDialogOpen(true);
  };

  const handleActivatePromotion = (promoId: string) => {
    setPromotions(prev => 
      prev.map(promo => 
        promo.id === promoId 
          ? { ...promo, status: "Active" as const, lastModified: new Date().toISOString().split('T')[0] }
          : promo
      )
    );
    alert("Promotion activated successfully!");
  };

  const handleCopyPromoCode = (code: string) => {
    quickCopy(code, `Promo code '${code}' copied to clipboard!`);
  };

  const handleCopyPromotionDetails = (promotion: Promotion) => {
    const details = `${promotion.title}\n\n${promotion.description}\n\nPromo Code: ${promotion.promocode || 'N/A'}\nValid: ${promotion.validFrom} to ${promotion.validTo}\n\nTerms: ${promotion.terms}`;
    quickCopy(details, "Promotion details copied to clipboard!");
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      validFrom: promotion.validFrom,
      validTo: promotion.validTo,
      terms: promotion.terms,
      promocode: promotion.promocode || "",
      targetAudience: promotion.targetAudience,
      maxUsage: promotion.maxUsage || 0,
      applicableProperties: promotion.applicableProperties
    });
    setCreateDialogOpen(true);
  };

  const activePromotions = promotions.filter(p => p.status === "Active").length;
  const scheduledPromotions = promotions.filter(p => p.status === "Scheduled").length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);
  const expiringPromotions = promotions.filter(p => {
    const endDate = new Date(p.validTo);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return p.status === "Active" && endDate <= weekFromNow;
  }).length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Promotions & Special Offers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Promotion
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <CheckCircleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Promotions
                  </Typography>
                  <Typography variant="h4">{activePromotions}</Typography>
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
                  <ScheduleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="h4">{scheduledPromotions}</Typography>
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
                  <CampaignRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Usage
                  </Typography>
                  <Typography variant="h4">{totalUsage}</Typography>
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
                  ⚠️
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Expiring Soon
                  </Typography>
                  <Typography variant="h4">{expiringPromotions}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert for expiring promotions */}
      {expiringPromotions > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {expiringPromotions} promotion(s) expiring within the next 7 days. Review and extend if needed.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<CampaignRoundedIcon />}
            label="All Promotions"
            iconPosition="start"
          />
          <Tab
            icon={<StarRoundedIcon />}
            label="Templates"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* All Promotions Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search promotions..."
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
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Discount">Discount</MenuItem>
                <MenuItem value="Special Offer">Special Offer</MenuItem>
                <MenuItem value="Move-in Bonus">Move-in Bonus</MenuItem>
                <MenuItem value="Rent Free">Rent Free</MenuItem>
                <MenuItem value="Waived Fees">Waived Fees</MenuItem>
                <MenuItem value="Amenity Bonus">Amenity Bonus</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Promotions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Promotion Details</TableCell>
                <TableCell>Type & Value</TableCell>
                <TableCell>Valid Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {promotion.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                        {promotion.description}
                      </Typography>
                      {promotion.promocode && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip 
                            label={`Code: ${promotion.promocode}`} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleCopyPromoCode(promotion.promocode!)}
                          >
                            <ContentCopyRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {getTypeIcon(promotion.type)}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {promotion.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {promotion.discountType === "Percentage" && `${promotion.discountValue}% off`}
                          {promotion.discountType === "Fixed Amount" && `$${promotion.discountValue} off`}
                          {promotion.discountType === "Free Months" && `${promotion.discountValue} month(s) free`}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        📅 {new Date(promotion.validFrom).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        ➡️ {new Date(promotion.validTo).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={promotion.status}
                      color={getStatusColor(promotion.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        Used: {promotion.usageCount}
                      </Typography>
                      {promotion.maxUsage && (
                        <Typography variant="body2" color="text.secondary">
                          Max: {promotion.maxUsage}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={promotion.targetAudience}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {promotion.status === "Draft" && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleActivatePromotion(promotion.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Tooltip title="Copy Promotion Details">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyPromotionDetails(promotion)}
                        >
                          <ContentCopyRoundedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Promotion">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPromotion(promotion)}
                        >
                          <EditRoundedIcon />
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

      {/* Templates Tab */}
      <TabPanel value={currentTab} index={1}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Promotion Templates
        </Typography>
        <Grid container spacing={3}>
          {mockTemplates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {getTypeIcon(template.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {template.name}
                        </Typography>
                        <Chip
                          label={template.category}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Box>
                    </Stack>
                    
                    <Typography variant="subtitle2" fontWeight="medium">
                      {template.title}
                    </Typography>
                    
                    <Box sx={{
                      maxHeight: 100,
                      overflow: 'auto',
                      '& p': { margin: '0 0 0.5em 0' },
                      '& ul, & ol': { paddingLeft: '20px', margin: '0 0 0.5em 0' },
                      '& li': { marginBottom: '0.25em' }
                    }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="div"
                        dangerouslySetInnerHTML={{ __html: template.description }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Duration: {template.duration} days
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {template.type}
                      </Typography>
                    </Box>
                    
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                        <Typography variant="body2">Terms & Conditions</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{
                          '& p': { margin: '0 0 0.5em 0' },
                          '& ul, & ol': { paddingLeft: '20px', margin: '0 0 0.5em 0' },
                          '& li': { marginBottom: '0.25em' }
                        }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="div"
                            dangerouslySetInnerHTML={{ __html: template.terms }}
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Create Promotion Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPromotion ? "Edit Promotion" : "Create New Promotion"}
          {selectedTemplate && (
            <Typography variant="body2" color="text.secondary">
              Using template: {selectedTemplate.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Promotion Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            
            <RichTextEditor
              label="Promotion Description"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Create an engaging promotion description. Highlight the benefits, value proposition, and any special terms..."
              minHeight={150}
              maxHeight={300}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Promotion Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Promotion Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Promotion["type"] })}
                  >
                    <MenuItem value="Discount">Discount</MenuItem>
                    <MenuItem value="Special Offer">Special Offer</MenuItem>
                    <MenuItem value="Move-in Bonus">Move-in Bonus</MenuItem>
                    <MenuItem value="Rent Free">Rent Free</MenuItem>
                    <MenuItem value="Waived Fees">Waived Fees</MenuItem>
                    <MenuItem value="Amenity Bonus">Amenity Bonus</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={formData.discountType}
                    label="Discount Type"
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as Promotion["discountType"] })}
                  >
                    <MenuItem value="Percentage">Percentage</MenuItem>
                    <MenuItem value="Fixed Amount">Fixed Amount</MenuItem>
                    <MenuItem value="Free Months">Free Months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              label={`Discount Value ${formData.discountType === "Percentage" ? "(%)" : formData.discountType === "Fixed Amount" ? "($)" : "(months)"}`}
              fullWidth
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Valid From"
                  fullWidth
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Valid To"
                  fullWidth
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Promo Code (Optional)"
                  fullWidth
                  value={formData.promocode}
                  onChange={(e) => setFormData({ ...formData, promocode: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={formData.targetAudience}
                    label="Target Audience"
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Promotion["targetAudience"] })}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="New Tenants">New Tenants</MenuItem>
                    <MenuItem value="Returning Tenants">Returning Tenants</MenuItem>
                    <MenuItem value="Students">Students</MenuItem>
                    <MenuItem value="Seniors">Seniors</MenuItem>
                    <MenuItem value="Military">Military</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TextField
              label="Max Usage (Optional)"
              fullWidth
              type="number"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: Number(e.target.value) })}
              helperText="Leave 0 for unlimited usage"
            />
            
            <RichTextEditor
              label="Terms & Conditions"
              value={formData.terms}
              onChange={(value) => setFormData({ ...formData, terms: value })}
              placeholder="Enter the detailed terms and conditions for this promotion. Include eligibility requirements, restrictions, and any fine print..."
              minHeight={200}
              maxHeight={400}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreatePromotion}>
            {editingPromotion ? "Update Promotion" : "Create Promotion"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
