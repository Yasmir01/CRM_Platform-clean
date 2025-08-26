import * as React from "react";
import { generateCanvasQRCode, generateFallbackQRCode } from '../utils/qrCodeUtils';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
} from "@mui/material";
import {
  QrCodeRounded as QrCodeRoundedIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  Palette as PaletteIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Wifi as WifiIcon,
  Link as LinkIcon,
  Payment as PaymentIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
  WhatsApp as WhatsAppIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Telegram as TelegramIcon,
  Instagram as InstagramIcon,
} from "@mui/icons-material";
import { uniformTooltipStyles } from "../utils/formStyles";
import { useCrmData } from "../contexts/CrmDataContext";
import { LocalStorageService } from "../services/LocalStorageService";

// Enhanced QR Code interfaces
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

interface QRTemplate {
  id: string;
  name: string;
  description: string;
  type: QRCodeData["type"];
  customization: QRCustomization;
  content: string;
  category: "Business" | "Personal" | "Event" | "Marketing" | "Social";
}

// Predefined templates
const qrTemplates: QRTemplate[] = [
  {
    id: "template-1",
    name: "Business Card",
    description: "Professional business contact QR code",
    type: "Contact",
    category: "Business",
    content: "MECARD:N:John,Doe;ORG:Company Inc;TITLE:CEO;TEL:+1234567890;EMAIL:john@company.com;URL:https://company.com;;",
    customization: {
      foregroundColor: "#1976d2",
      backgroundColor: "#ffffff",
      logoSize: 20,
      style: "rounded",
      pattern: "square",
      eyeStyle: "rounded",
      gradientEnabled: false,
      frameStyle: "rounded",
      frameColor: "#1976d2",
      frameText: "Scan for Contact"
    }
  },
  {
    id: "template-2",
    name: "WiFi Access",
    description: "Guest WiFi network access",
    type: "WiFi",
    category: "Business",
    content: "WIFI:T:WPA;S:GuestNetwork;P:password123;;",
    customization: {
      foregroundColor: "#4caf50",
      backgroundColor: "#ffffff",
      logoSize: 15,
      style: "dots",
      pattern: "circle",
      eyeStyle: "circle",
      gradientEnabled: true,
      gradientColors: ["#4caf50", "#8bc34a"],
      frameStyle: "simple",
      frameColor: "#4caf50",
      frameText: "Free WiFi"
    }
  },
  {
    id: "template-3",
    name: "Property Listing",
    description: "Real estate property showcase",
    type: "URL",
    category: "Business",
    content: "https://example.com/property/123",
    customization: {
      foregroundColor: "#ff5722",
      backgroundColor: "#ffffff",
      logoSize: 25,
      style: "square",
      pattern: "square",
      eyeStyle: "square",
      gradientEnabled: false,
      frameStyle: "shadow",
      frameColor: "#ff5722",
      frameText: "View Property"
    }
  },
  {
    id: "template-4",
    name: "Event Ticket",
    description: "Event registration and check-in",
    type: "Event",
    category: "Event",
    content: "BEGIN:VEVENT\nSUMMARY:Community Event\nDTSTART:20240201T180000Z\nDTEND:20240201T220000Z\nLOCATION:Community Center\nEND:VEVENT",
    customization: {
      foregroundColor: "#9c27b0",
      backgroundColor: "#ffffff",
      logoSize: 20,
      style: "circle",
      pattern: "rounded",
      eyeStyle: "rounded",
      gradientEnabled: true,
      gradientColors: ["#9c27b0", "#e91e63"],
      frameStyle: "rounded",
      frameColor: "#9c27b0",
      frameText: "Event Access"
    }
  },
  {
    id: "template-5",
    name: "Social Media",
    description: "Social media profile sharing",
    type: "URL",
    category: "Social",
    content: "https://instagram.com/username",
    customization: {
      foregroundColor: "#e91e63",
      backgroundColor: "#ffffff",
      logoSize: 18,
      style: "rounded",
      pattern: "circle",
      eyeStyle: "circle",
      gradientEnabled: true,
      gradientColors: ["#e91e63", "#ff9800"],
      frameStyle: "rounded",
      frameColor: "#e91e63",
      frameText: "Follow Us"
    }
  }
];

// Mock data for existing QR codes with enhanced analytics
const mockQRCodes: QRCodeData[] = [
  {
    id: "qr1",
    title: "Sunset Apartments - Property Listing",
    content: "https://crm.example.com/properties/sunset-apartments",
    type: "Property",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://crm.example.com/properties/sunset-apartments",
    customization: {
      foregroundColor: "#1976d2",
      backgroundColor: "#ffffff",
      logoSize: 20,
      style: "rounded",
      pattern: "square",
      eyeStyle: "rounded",
      gradientEnabled: false,
      frameStyle: "rounded",
      frameColor: "#1976d2"
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
        "Chicago": 28,
        "Houston": 21,
        "Phoenix": 16
      },
      scansByDevice: {
        "iPhone": 56,
        "Android": 48,
        "Desktop": 23,
        "iPad": 15
      },
      scansByBrowser: {
        "Safari": 45,
        "Chrome": 52,
        "Firefox": 25,
        "Edge": 20
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

interface QRCodeGeneratorProps {
  open: boolean;
  onClose: () => void;
  qrCodes: QRCodeData[];
  setQrCodes: React.Dispatch<React.SetStateAction<QRCodeData[]>>;
  selectedQR?: QRCodeData | null;
}

export default function QRCodeGenerator({ 
  open, 
  onClose, 
  qrCodes, 
  setQrCodes,
  selectedQR 
}: QRCodeGeneratorProps) {
  const { state } = useCrmData();
  const { properties } = state;
  const [currentTab, setCurrentTab] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [contactCaptures, setContactCaptures] = React.useState<ContactCapture[]>(mockContactCaptures);
  
  // Form states
  const [formData, setFormData] = React.useState({
    title: "",
    content: "",
    type: "URL" as QRCodeData["type"],
    expiryDate: "",
    password: "",
    isPasswordProtected: false
  });

  const [customization, setCustomization] = React.useState<QRCustomization>({
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    logoSize: 20,
    style: "square" as const,
    pattern: "square" as const,
    eyeStyle: "square" as const,
    gradientEnabled: false,
    frameStyle: "none" as const,
    frameColor: "#000000",
    frameText: ""
  });

  const [tracking, setTracking] = React.useState<QRTracking>({
    trackScans: true,
    trackLocation: true,
    trackDevice: true,
    trackTime: true,
    captureLeads: false,
    requireContact: false,
    utmParameters: {
      source: "qr_code",
      medium: "print",
      campaign: ""
    }
  });

  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<QRTemplate | null>(null);
  const [generatedQRUrl, setGeneratedQRUrl] = React.useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = React.useState<boolean>(false);

  // Regenerate QR code when content or customization changes
  React.useEffect(() => {
    if (formData.content) {
      generateCanvasQR();
    }
  }, [formData.content, customization, logoPreview]);

  // Load selected QR data for editing
  React.useEffect(() => {
    if (selectedQR) {
      setFormData({
        title: selectedQR.title,
        content: selectedQR.content,
        type: selectedQR.type,
        expiryDate: selectedQR.expiryDate || "",
        password: selectedQR.password || "",
        isPasswordProtected: selectedQR.isPasswordProtected
      });
      setCustomization(selectedQR.customization);
      setTracking(selectedQR.tracking);
      setCurrentStep(1); // Skip to design step for editing
    }
  }, [selectedQR]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setCustomization(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = (template: QRTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      type: template.type,
      content: template.content,
      title: template.name
    }));
    setCustomization(template.customization);
  };

  const generateQRCode = (): string => {
    // Return the generated URL if available, otherwise fallback
    if (generatedQRUrl) {
      return generatedQRUrl;
    }

    // Fallback to external API
    let content = formData.content;
    if (formData.type === "URL" && content && !content.startsWith("http://") && !content.startsWith("https://")) {
      content = "https://" + content.replace(/^(www\.)?/, "www.");
    }

    return generateFallbackQRCode(content, customization);
  };

  const generateCanvasQR = async (): Promise<string> => {
    if (!formData.content) return "";

    setIsGeneratingQR(true);
    try {
      let content = formData.content;
      if (formData.type === "URL" && content && !content.startsWith("http://") && !content.startsWith("https://")) {
        content = "https://" + content.replace(/^(www\.)?/, "www.");
      }

      const qrUrl = await generateCanvasQRCode(content, customization, 300);
      setGeneratedQRUrl(qrUrl);
      return qrUrl;
    } catch (error) {
      console.error('Failed to generate canvas QR code:', error);
      // Fallback to external API
      let content = formData.content;
      if (formData.type === "URL" && content && !content.startsWith("http://") && !content.startsWith("https://")) {
        content = "https://" + content.replace(/^(www\.)?/, "www.");
      }
      const fallbackUrl = generateFallbackQRCode(content, customization);
      setGeneratedQRUrl(fallbackUrl);
      return fallbackUrl;
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCreateQR = async () => {
    // Ensure QR code is generated with latest content
    const qrUrl = await generateCanvasQR();
    const newQR: QRCodeData = {
      id: selectedQR?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      type: formData.type,
      qrCodeUrl: qrUrl || generatedQRUrl || generateQRCode(),
      customization,
      createdAt: selectedQR?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      downloads: selectedQR?.downloads || 0,
      scans: selectedQR?.scans || 0,
      status: "Active",
      expiryDate: formData.expiryDate || undefined,
      password: formData.password || undefined,
      isPasswordProtected: formData.isPasswordProtected,
      analytics: selectedQR?.analytics || {
        totalScans: 0,
        uniqueScans: 0,
        scansByDate: {},
        scansByLocation: {},
        scansByDevice: {},
        scansByBrowser: {},
        conversionRate: 0,
        peakScanTime: ""
      },
      tracking
    };

    let updatedQRCodes: QRCodeData[];
    if (selectedQR) {
      updatedQRCodes = qrCodes.map(qr => qr.id === selectedQR.id ? newQR : qr);
    } else {
      updatedQRCodes = [...qrCodes, newQR];
    }

    // Update state
    setQrCodes(updatedQRCodes);

    // Save to localStorage for persistence
    try {
      LocalStorageService.saveQRCodes(updatedQRCodes);
      console.log('QR codes saved successfully to localStorage');
    } catch (error) {
      console.error('Failed to save QR codes:', error);
    }

    onClose();
    setCurrentStep(0);
    setFormData({
      title: "",
      content: "",
      type: "URL",
      expiryDate: "",
      password: "",
      isPasswordProtected: false
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Content copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Content copied to clipboard!");
      } catch (err) {
        alert("Failed to copy. Please copy manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadQR = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';

      qrImage.onload = async () => {
        canvas.width = 300;
        canvas.height = 300;

        // Draw QR code
        ctx.drawImage(qrImage, 0, 0, 300, 300);

        // Add logo if present
        if (logoPreview) {
          const logoImage = new Image();
          logoImage.crossOrigin = 'anonymous';
          logoImage.onload = () => {
            const logoSize = (customization.logoSize / 100) * 300;
            const logoX = (300 - logoSize) / 2;
            const logoY = (300 - logoSize) / 2;

            // Add white background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

            // Draw logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

            // Download the canvas as image
            const link = document.createElement('a');
            link.download = `${formData.title.replace(/\s+/g, '_')}_QR.png`;
            link.href = canvas.toDataURL();
            link.click();
          };
          logoImage.src = logoPreview;
        } else {
          // Download without logo
          const link = document.createElement('a');
          link.download = `${formData.title.replace(/\s+/g, '_')}_QR.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
      };

      qrImage.src = generateQRCode();
    } catch (error) {
      // Fallback to simple download
      const link = document.createElement('a');
      link.href = generateQRCode();
      link.download = `${formData.title.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareQR = async () => {
    const qrCodeUrl = generateQRCode();
    const shareData = {
      title: formData.title || 'QR Code',
      text: `Check out this QR code: ${formData.title || 'Custom QR Code'}\nContent: ${formData.content}`,
      url: qrCodeUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback: copy QR code URL to clipboard
        await copyToClipboard(`QR Code: ${formData.title}\nContent: ${formData.content}\nQR Image: ${qrCodeUrl}`);
      }
    } else {
      // Fallback: copy content to clipboard
      await copyToClipboard(`QR Code: ${formData.title}\nContent: ${formData.content}\nQR Image: ${qrCodeUrl}`);
    }
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const renderContentForm = () => (
    <Stack spacing={3}>
      <Typography variant="h6">1. Content & Basic Settings</Typography>
      
      <TextField
        label="QR Code Title"
        fullWidth
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Property Listing - Sunset Apartments"
        required
      />
      
      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          value={formData.type}
          label="Type"
          onChange={(e) => setFormData({ ...formData, type: e.target.value as QRCodeData["type"] })}
        >
          <MenuItem value="URL">🌐 Website URL</MenuItem>
          <MenuItem value="Text">📝 Plain Text</MenuItem>
          <MenuItem value="WiFi">📶 WiFi Network</MenuItem>
          <MenuItem value="Contact">👤 Contact Info</MenuItem>
          <MenuItem value="Property">🏠 Property Listing</MenuItem>
          <MenuItem value="Payment">💳 Payment Link</MenuItem>
          <MenuItem value="Location">�� Location</MenuItem>
          <MenuItem value="Event">📅 Event</MenuItem>
          <MenuItem value="Email">📧 Email</MenuItem>
          <MenuItem value="Phone">📞 Phone</MenuItem>
          <MenuItem value="SMS">💬 SMS</MenuItem>
          <MenuItem value="WhatsApp">💚 WhatsApp</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        label="Content"
        fullWidth
        multiline
        rows={4}
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder={getPlaceholderByType(formData.type)}
        helperText={getHelperTextByType(formData.type)}
        required
        sx={{
          '& .MuiInputBase-root': {
            width: '100%',
            maxWidth: '100%'
          },
          '& .MuiInputBase-input': {
            width: '100%',
            maxWidth: '100%',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
            padding: '12px 14px',
            boxSizing: 'border-box'
          },
          '& .MuiOutlinedInput-root': {
            width: '100%'
          }
        }}
      />

      <Divider />

      <Typography variant="subtitle1">Advanced Options</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Expiry Date (Optional)"
            type="date"
            fullWidth
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            helperText="QR code will become inactive after this date"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isPasswordProtected}
                onChange={(e) => setFormData({ ...formData, isPasswordProtected: e.target.checked })}
              />
            }
            label="Password Protected"
          />
        </Grid>
      </Grid>

      {formData.isPasswordProtected && (
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Enter password for QR code access"
        />
      )}
    </Stack>
  );

  const renderDesignForm = () => (
    <Stack spacing={3}>
      <Typography variant="h6">2. Design & Customization</Typography>
      
      {/* Templates Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">🎨 Quick Templates</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {qrTemplates
              .filter(template => template.type === formData.type || formData.type === "URL")
              .map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedTemplate?.id === template.id ? '2px solid' : '1px solid',
                      borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => applyTemplate(template)}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                      <Chip 
                        label={template.category} 
                        size="small" 
                        sx={{ mt: 1 }} 
                        color="primary"
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Color Customization */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">🎨 Colors & Style</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Stack spacing={2}>
                <Typography variant="body2">Foreground Color</Typography>
                <TextField
                  type="color"
                  value={customization.foregroundColor}
                  onChange={(e) => setCustomization({ ...customization, foregroundColor: e.target.value })}
                  sx={{ '& input': { height: 40 } }}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={2}>
                <Typography variant="body2">Background Color</Typography>
                <TextField
                  type="color"
                  value={customization.backgroundColor}
                  onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                  sx={{ '& input': { height: 40 } }}
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={customization.gradientEnabled}
                    onChange={(e) => setCustomization({ ...customization, gradientEnabled: e.target.checked })}
                  />
                }
                label="Enable Gradient"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Style Options */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">✨ Pattern & Style</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>QR Style</InputLabel>
                <Select
                  value={customization.style}
                  label="QR Style"
                  onChange={(e) => setCustomization({ ...customization, style: e.target.value as any })}
                >
                  <MenuItem value="square">Square</MenuItem>
                  <MenuItem value="rounded">Rounded</MenuItem>
                  <MenuItem value="dots">Dots</MenuItem>
                  <MenuItem value="circle">Circle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Pattern</InputLabel>
                <Select
                  value={customization.pattern}
                  label="Pattern"
                  onChange={(e) => setCustomization({ ...customization, pattern: e.target.value as any })}
                >
                  <MenuItem value="square">Square</MenuItem>
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="rounded">Rounded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Eye Style</InputLabel>
                <Select
                  value={customization.eyeStyle}
                  label="Eye Style"
                  onChange={(e) => setCustomization({ ...customization, eyeStyle: e.target.value as any })}
                >
                  <MenuItem value="square">Square</MenuItem>
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="rounded">Rounded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Logo Upload */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">🖼️ Logo & Branding</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
              component="label"
            >
              {logoPreview ? (
                <Avatar src={logoPreview} sx={{ width: 60, height: 60, mx: 'auto', mb: 1 }} />
              ) : (
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              )}
              <Typography variant="body2" color="text.secondary">
                {logoPreview ? 'Click to change logo' : 'Upload Logo (PNG, JPG, SVG)'}
              </Typography>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </Box>
            
            {logoPreview && (
              <Box>
                <Typography variant="body2" gutterBottom>Logo Size</Typography>
                <Slider
                  value={customization.logoSize}
                  onChange={(_, value) => setCustomization({ ...customization, logoSize: value as number })}
                  min={10}
                  max={40}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Frame Style</InputLabel>
              <Select
                value={customization.frameStyle}
                label="Frame Style"
                onChange={(e) => setCustomization({ ...customization, frameStyle: e.target.value as any })}
              >
                <MenuItem value="none">No Frame</MenuItem>
                <MenuItem value="simple">Simple</MenuItem>
                <MenuItem value="rounded">Rounded</MenuItem>
                <MenuItem value="shadow">Shadow</MenuItem>
              </Select>
            </FormControl>

            {customization.frameStyle !== "none" && (
              <>
                <TextField
                  label="Frame Text"
                  fullWidth
                  value={customization.frameText}
                  onChange={(e) => setCustomization({ ...customization, frameText: e.target.value })}
                  placeholder="e.g., Scan Me, Visit Website, Contact Us"
                />
                <Stack spacing={2}>
                  <Typography variant="body2">Frame Color</Typography>
                  <TextField
                    type="color"
                    value={customization.frameColor}
                    onChange={(e) => setCustomization({ ...customization, frameColor: e.target.value })}
                    sx={{ '& input': { height: 40 } }}
                  />
                </Stack>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Live Preview */}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Live Preview</Typography>
        {formData.content && (
          <Stack spacing={2} alignItems="center">
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: customization.style === 'rounded' ? 2 : 0,
                  overflow: 'hidden',
                  background: customization.gradientEnabled && customization.gradientColors
                    ? `linear-gradient(45deg, ${customization.gradientColors[0] || customization.foregroundColor}, ${customization.gradientColors[1] || customization.backgroundColor})`
                    : 'none',
                  p: customization.gradientEnabled ? 0.5 : 0
                }}
              >
                <img
                  src={generateQRCode()}
                  alt="QR Code Preview"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: customization.style === 'rounded' ? 8 : 0,
                    filter: customization.style === 'dots' ? 'blur(0.5px) contrast(1.2)' : 'none',
                    transform: customization.style === 'circle' ? 'scale(0.95)' : 'none'
                  }}
                />
                {/* Style overlay effects */}
                {customization.pattern === 'circle' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle, transparent 70%, rgba(255,255,255,0.3) 85%)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
                {customization.eyeStyle === 'rounded' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 60%)',
                      pointerEvents: 'none',
                      borderRadius: 2
                    }}
                  />
                )}
              </Box>
              {logoPreview && (
                <Box
                  sx={{
                    width: (customization.logoSize / 100) * 200,
                    height: (customization.logoSize / 100) * 200,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'white',
                    border: 2,
                    borderColor: 'white',
                    borderRadius: customization.eyeStyle === 'circle' ? '50%' : customization.eyeStyle === 'rounded' ? 1 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <img
                    src={logoPreview}
                    alt="Logo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Style Info */}
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip size="small" label={`Style: ${customization.style}`} color="primary" variant="outlined" />
              <Chip size="small" label={`Pattern: ${customization.pattern}`} color="secondary" variant="outlined" />
              <Chip size="small" label={`Eyes: ${customization.eyeStyle}`} color="info" variant="outlined" />
            </Stack>

            <Box sx={{ maxWidth: '100%', px: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Content:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  maxWidth: '100%',
                  textAlign: 'left',
                  backgroundColor: 'grey.50',
                  p: 1,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'grey.300'
                }}
              >
                {formData.content}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>
    </Stack>
  );

  const renderTrackingForm = () => (
    <Stack spacing={3}>
      <Typography variant="h6">3. Tracking & Analytics</Typography>
      
      <Alert severity="info">
        Enable tracking to understand how your QR code is being used and capture valuable analytics.
      </Alert>

      <Stack spacing={2}>
        <Typography variant="subtitle1">Basic Tracking</Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={tracking.trackScans}
              onChange={(e) => setTracking({ ...tracking, trackScans: e.target.checked })}
            />
          }
          label="Track Total Scans"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={tracking.trackLocation}
              onChange={(e) => setTracking({ ...tracking, trackLocation: e.target.checked })}
            />
          }
          label="Track Geographic Location"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={tracking.trackDevice}
              onChange={(e) => setTracking({ ...tracking, trackDevice: e.target.checked })}
            />
          }
          label="Track Device & Browser Information"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={tracking.trackTime}
              onChange={(e) => setTracking({ ...tracking, trackTime: e.target.checked })}
            />
          }
          label="Track Scan Times & Patterns"
        />
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="subtitle1">Lead Capture</Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={tracking.captureLeads}
              onChange={(e) => setTracking({ ...tracking, captureLeads: e.target.checked })}
            />
          }
          label="Enable Lead Capture"
        />
        
        {tracking.captureLeads && (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={tracking.requireContact}
                  onChange={(e) => setTracking({ ...tracking, requireContact: e.target.checked })}
                />
              }
              label="Require Contact Information"
            />
            
            <TextField
              label="Custom Landing Page URL (Optional)"
              fullWidth
              value={tracking.landingPageUrl}
              onChange={(e) => setTracking({ ...tracking, landingPageUrl: e.target.value })}
              placeholder="https://example.com/landing"
              helperText="Redirect users to a custom page before the final destination"
            />
          </>
        )}
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="subtitle1">UTM Parameters</Typography>
        <Typography variant="body2" color="text.secondary">
          Add UTM parameters for Google Analytics tracking
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Source"
              fullWidth
              value={tracking.utmParameters?.source}
              onChange={(e) => setTracking({
                ...tracking,
                utmParameters: { ...tracking.utmParameters, source: e.target.value }
              })}
              placeholder="qr_code"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Medium"
              fullWidth
              value={tracking.utmParameters?.medium}
              onChange={(e) => setTracking({
                ...tracking,
                utmParameters: { ...tracking.utmParameters, medium: e.target.value }
              })}
              placeholder="print, digital, email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Campaign"
              fullWidth
              value={tracking.utmParameters?.campaign}
              onChange={(e) => setTracking({
                ...tracking,
                utmParameters: { ...tracking.utmParameters, campaign: e.target.value }
              })}
              placeholder="property_listing_2024"
            />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <QrCodeRoundedIcon color="primary" />
          <Typography variant="h6">
            {selectedQR ? 'Edit QR Code' : 'Create QR Code'}
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentStep} onChange={(_, newValue) => setCurrentStep(newValue)}>
            <Tab label="Content" icon={<EditIcon />} />
            <Tab label="Design" icon={<PaletteIcon />} />
            <Tab label="Tracking" icon={<AnalyticsIcon />} />
          </Tabs>
        </Box>

        {currentStep === 0 && renderContentForm()}
        {currentStep === 1 && renderDesignForm()}
        {currentStep === 2 && renderTrackingForm()}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(currentStep - 1)}>
            Back
          </Button>
        )}
        
        {currentStep < 2 ? (
          <Button 
            variant="contained" 
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              currentStep === 0 && (
                !formData.title ||
                !formData.content ||
                (formData.isPasswordProtected && !formData.password)
              )
            }
          >
            Next
          </Button>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Download QR Code with Logo" sx={uniformTooltipStyles}>
              <IconButton
                onClick={downloadQR}
                disabled={!formData.content}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'primary.light', color: 'primary.main' },
                  '&:disabled': { bgcolor: 'action.disabledBackground' }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share QR Code" sx={uniformTooltipStyles}>
              <IconButton
                onClick={shareQR}
                disabled={!formData.content}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'success.light', color: 'success.main' },
                  '&:disabled': { bgcolor: 'action.disabledBackground' }
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy QR Code URL to Clipboard" sx={uniformTooltipStyles}>
              <IconButton
                onClick={() => copyToClipboard(generateQRCode())}
                disabled={!formData.content}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'info.light', color: 'info.main' },
                  '&:disabled': { bgcolor: 'action.disabledBackground' }
                }}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCreateQR}
              disabled={
                !formData.title ||
                !formData.content ||
                (formData.isPasswordProtected && !formData.password)
              }
              startIcon={<QrCodeRoundedIcon />}
              sx={{
                minWidth: 180,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {selectedQR ? '✓ Update QR Code' : '🔄 Create QR Code'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Helper functions
function getPlaceholderByType(type: QRCodeData["type"]): string {
  switch (type) {
    case "URL": return "https://example.com";
    case "WiFi": return "WIFI:T:WPA;S:NetworkName;P:password;;";
    case "Contact": return "MECARD:N:Last,First;TEL:+1234567890;EMAIL:email@example.com;;";
    case "Property": return "https://properties.example.com/listing/123";
    case "Payment": return "https://pay.example.com/invoice/123";
    case "Location": return "geo:40.7128,-74.0060";
    case "Event": return "BEGIN:VEVENT\nSUMMARY:Event Title\nDTSTART:20240201T180000Z\nEND:VEVENT";
    case "Email": return "mailto:contact@example.com?subject=Hello&body=Message";
    case "Phone": return "tel:+1234567890";
    case "SMS": return "sms:+1234567890?body=Hello";
    case "WhatsApp": return "https://wa.me/1234567890?text=Hello";
    default: return "Enter your content here";
  }
}

function getHelperTextByType(type: QRCodeData["type"]): string {
  switch (type) {
    case "WiFi": return "Format: WIFI:T:WPA;S:NetworkName;P:password;;";
    case "Contact": return "Format: MECARD:N:Last,First;TEL:phone;EMAIL:email;;";
    case "Location": return "Format: geo:latitude,longitude";
    case "Event": return "Use iCalendar format for events";
    case "Email": return "Format: mailto:email@domain.com?subject=Subject&body=Body";
    case "Phone": return "Format: tel:+1234567890";
    case "SMS": return "Format: sms:+1234567890?body=Message";
    case "WhatsApp": return "Format: https://wa.me/number?text=message";
    default: return "Enter the content you want to encode in the QR code";
  }
}
