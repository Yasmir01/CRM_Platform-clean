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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CardActions,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  Avatar,
  useTheme,
  Alert,
  Checkbox,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
} from "@mui/material";
import RichTextEditor from "../components/RichTextEditor";
import VariablesCheatSheet from "../components/VariablesCheatSheet";
import CompanySettings, { useCompanyInfo, CompanyInfo } from "../components/CompanySettings";
import ApplicationPaymentForm from "../components/ApplicationPaymentForm";
import TermsAndConditions from "../components/TermsAndConditions";
// import { useAutoSave, useAutoSaveStatus } from "../hooks/useAutoSave";
import { quickCopy } from "../utils/clipboardUtils";
import { LocalStorageService } from "../services/LocalStorageService";
import { useRoleManagement } from "../hooks/useRoleManagement";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import TextFieldsRoundedIcon from "@mui/icons-material/TextFieldsRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

interface Template {
  id: string;
  name: string;
  type: "Rental Application" | "Email Marketing" | "SMS Marketing" | "Lease Agreement" | "Notice";
  subject?: string;
  content: string;
  variables: string[];
  status: "Active" | "Draft" | "Archived";
  createdDate: string;
  lastUsed?: string;
  usageCount: number;
  formFields?: FormField[];
  applicationFee?: number;
  paymentMethods?: PaymentMethod[];
  termsAndConditions?: any[];
  requirePaymentBeforeSubmission?: boolean;
  isDefault?: boolean;
  propertyCode?: string;
}

interface FormField {
  id: string;
  type: "text" | "number" | "email" | "phone" | "date" | "textarea" | "select" | "checkbox" | "radio" | "yesno" | "section" | "signature" | "payment" | "terms" | "file_upload" | "multiselect";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
  section?: string;
  description?: string;
  defaultValue?: string;
  fileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
}

interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "zelle" | "cashapp" | "paypal" | "venmo" | "check" | "money_order";
  label: string;
  enabled: boolean;
  instructions?: string;
}

interface ApplicationSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultFields: Partial<FormField>[];
}

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    type: "credit_card",
    label: "Credit Card",
    enabled: true,
    instructions: "Secure online payment processing via Stripe"
  },
  {
    id: "debit_card",
    type: "debit_card",
    label: "Debit Card",
    enabled: true,
    instructions: "Secure online payment processing via Stripe"
  },
  {
    id: "zelle",
    type: "zelle",
    label: "Zelle",
    enabled: true,
    instructions: "Send payment to: your.email@company.com"
  },
  {
    id: "cashapp",
    type: "cashapp",
    label: "CashApp",
    enabled: true,
    instructions: "Send payment to: $YourCashAppHandle"
  },
  {
    id: "paypal",
    type: "paypal",
    label: "PayPal",
    enabled: true,
    instructions: "Send payment to: your.email@company.com"
  },
  {
    id: "venmo",
    type: "venmo",
    label: "Venmo",
    enabled: true,
    instructions: "Send payment to: @YourVenmoHandle"
  },
  {
    id: "check",
    type: "check",
    label: "Check",
    enabled: true,
    instructions: "Make checks payable to: Your Company Name"
  },
  {
    id: "money_order",
    type: "money_order",
    label: "Money Order",
    enabled: true,
    instructions: "Make money order payable to: Your Company Name"
  }
];

const applicationSections: ApplicationSection[] = [
  {
    id: "personal_info",
    name: "Personal Information",
    icon: <PersonRoundedIcon />,
    description: "Basic personal details of the applicant",
    defaultFields: [
      { type: "text", label: "First Name", required: true },
      { type: "text", label: "Last Name", required: true },
      { type: "date", label: "Date of Birth", required: true },
      { type: "phone", label: "Phone Number", required: true },
      { type: "email", label: "Email Address", required: true },
      { type: "text", label: "Social Security Number (Last 4 digits)", required: true },
    ]
  },
  {
    id: "identity_verification",
    name: "Identity Verification",
    icon: <SecurityRoundedIcon />,
    description: "Government-issued ID and verification documents",
    defaultFields: [
      { type: "select", label: "ID Type", options: ["Driver's License", "Passport", "State ID", "Military ID"], required: true },
      { type: "text", label: "ID Number", required: true },
      { type: "date", label: "ID Expiration Date", required: true },
      { type: "text", label: "Issuing State/Country", required: true },
    ]
  },
  {
    id: "occupants",
    name: "Occupants",
    icon: <PersonRoundedIcon />,
    description: "Information about all people who will live in the property",
    defaultFields: [
      { type: "number", label: "Number of Occupants", required: true },
      { type: "textarea", label: "List all occupants (Name, Age, Relationship)", required: true },
      { type: "yesno", label: "Will anyone under 18 be living in the property?", required: true },
    ]
  },
  {
    id: "property_applying",
    name: "Property Applying For",
    icon: <HomeRoundedIcon />,
    description: "Details about the rental property",
    defaultFields: [
      { type: "text", label: "Property Address", required: true },
      { type: "text", label: "Unit Number (if applicable)" },
      { type: "date", label: "Desired Move-in Date", required: true },
      { type: "number", label: "Lease Term (months)", required: true },
    ]
  },
  {
    id: "current_address",
    name: "Current Address",
    icon: <HomeRoundedIcon />,
    description: "Current living situation and housing history",
    defaultFields: [
      { type: "text", label: "Current Address", required: true },
      { type: "date", label: "Move-in Date", required: true },
      { type: "number", label: "Monthly Rent/Mortgage", required: true },
      { type: "text", label: "Landlord/Property Manager Name" },
      { type: "phone", label: "Landlord/Property Manager Phone" },
      { type: "select", label: "Housing Type", options: ["Rent", "Own", "Live with Family", "Other"], required: true },
      { type: "textarea", label: "Reason for Moving", required: true },
    ]
  },
  {
    id: "employment",
    name: "Current Employment",
    icon: <WorkRoundedIcon />,
    description: "Current job and income information",
    defaultFields: [
      { type: "text", label: "Employer Name", required: true },
      { type: "text", label: "Job Title", required: true },
      { type: "text", label: "Supervisor Name" },
      { type: "phone", label: "Work Phone", required: true },
      { type: "text", label: "Work Address", required: true },
      { type: "date", label: "Employment Start Date", required: true },
      { type: "number", label: "Monthly Gross Income", required: true },
      { type: "select", label: "Employment Type", options: ["Full-time", "Part-time", "Contract", "Self-employed"], required: true },
    ]
  },
  {
    id: "prior_employment",
    name: "Prior Employment",
    icon: <WorkRoundedIcon />,
    description: "Previous employment history (if current job is less than 2 years)",
    defaultFields: [
      { type: "text", label: "Previous Employer Name" },
      { type: "text", label: "Job Title" },
      { type: "date", label: "Employment Start Date" },
      { type: "date", label: "Employment End Date" },
      { type: "number", label: "Monthly Income" },
      { type: "textarea", label: "Reason for Leaving" },
    ]
  },
  {
    id: "emergency_contact",
    name: "Emergency Contact",
    icon: <ContactPhoneRoundedIcon />,
    description: "Emergency contact information",
    defaultFields: [
      { type: "text", label: "Contact Name", required: true },
      { type: "text", label: "Relationship", required: true },
      { type: "phone", label: "Phone Number", required: true },
      { type: "text", label: "Address" },
    ]
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: <DirectionsCarRoundedIcon />,
    description: "Information about vehicles that will be on the property",
    defaultFields: [
      { type: "number", label: "Number of Vehicles" },
      { type: "text", label: "Make and Model" },
      { type: "text", label: "License Plate Number" },
      { type: "text", label: "Color" },
      { type: "number", label: "Year" },
    ]
  },
  {
    id: "references",
    name: "References",
    icon: <PersonRoundedIcon />,
    description: "Personal and professional references",
    defaultFields: [
      { type: "text", label: "Reference 1 - Name", required: true },
      { type: "phone", label: "Reference 1 - Phone", required: true },
      { type: "text", label: "Reference 1 - Relationship", required: true },
      { type: "text", label: "Reference 2 - Name" },
      { type: "phone", label: "Reference 2 - Phone" },
      { type: "text", label: "Reference 2 - Relationship" },
    ]
  },
  {
    id: "guarantor",
    name: "Guarantor Info",
    icon: <SecurityRoundedIcon />,
    description: "Co-signer or guarantor information (if applicable)",
    defaultFields: [
      { type: "yesno", label: "Do you have a guarantor/co-signer?", required: true },
      { type: "text", label: "Guarantor Full Name" },
      { type: "phone", label: "Guarantor Phone" },
      { type: "email", label: "Guarantor Email" },
      { type: "text", label: "Guarantor Address" },
      { type: "number", label: "Guarantor Annual Income" },
    ]
  },
  {
    id: "pets",
    name: "Pet Information",
    icon: <PersonRoundedIcon />,
    description: "Comprehensive pet and animal information",
    defaultFields: [
      { type: "yesno", label: "Do you have any pets or animals?", required: true },
      { type: "number", label: "Total number of pets" },
      { type: "section", label: "Pet #1 Details", required: false },
      { type: "select", label: "Pet #1 - Type", options: ["Dog", "Cat", "Bird", "Fish", "Reptile", "Small Animal (Hamster, Guinea Pig, etc.)", "Other"], required: false },
      { type: "text", label: "Pet #1 - Breed/Species", required: false },
      { type: "text", label: "Pet #1 - Name", required: false },
      { type: "select", label: "Pet #1 - Gender", options: ["Male", "Female", "Unknown"], required: false },
      { type: "number", label: "Pet #1 - Age (years)", required: false },
      { type: "number", label: "Pet #1 - Weight (lbs)", required: false },
      { type: "text", label: "Pet #1 - Color/Markings", required: false },
      { type: "yesno", label: "Pet #1 - Spayed/Neutered?", required: false },
      { type: "yesno", label: "Pet #1 - Up to date on vaccinations?", required: false },
      { type: "text", label: "Pet #1 - Veterinarian Name and Phone", required: false },
      { type: "section", label: "Pet #2 Details (if applicable)", required: false },
      { type: "select", label: "Pet #2 - Type", options: ["Dog", "Cat", "Bird", "Fish", "Reptile", "Small Animal (Hamster, Guinea Pig, etc.)", "Other"], required: false },
      { type: "text", label: "Pet #2 - Breed/Species", required: false },
      { type: "text", label: "Pet #2 - Name", required: false },
      { type: "select", label: "Pet #2 - Gender", options: ["Male", "Female", "Unknown"], required: false },
      { type: "number", label: "Pet #2 - Age (years)", required: false },
      { type: "number", label: "Pet #2 - Weight (lbs)", required: false },
      { type: "text", label: "Pet #2 - Color/Markings", required: false },
      { type: "yesno", label: "Pet #2 - Spayed/Neutered?", required: false },
      { type: "yesno", label: "Pet #2 - Up to date on vaccinations?", required: false },
      { type: "text", label: "Pet #2 - Veterinarian Name and Phone", required: false },
      { type: "section", label: "Additional Pet Information", required: false },
      { type: "yesno", label: "Do you plan to get any pets during your tenancy?", required: false },
      { type: "textarea", label: "Additional pets (Pet #3, #4, etc.) - List details for each", required: false },
      { type: "yesno", label: "Are any pets registered as emotional support animals?", required: false },
      { type: "yesno", label: "Are any pets registered as service animals?", required: false },
      { type: "text", label: "ESA/Service Animal Registration Details", required: false },
      { type: "yesno", label: "Do you agree to pay pet deposit if required?", required: false },
      { type: "yesno", label: "Do you agree to pay monthly pet rent if required?", required: false },
      { type: "textarea", label: "Pet behavior and training information", required: false },
      { type: "checkbox", label: "I agree to be responsible for any pet-related damages", required: false },
      { type: "checkbox", label: "I agree to keep pets on leash in common areas", required: false },
      { type: "checkbox", label: "I agree to clean up after my pets", required: false },
    ]
  },
  {
    id: "authorization",
    name: "Authorization and Acknowledgments",
    icon: <SecurityRoundedIcon />,
    description: "Legal agreements and authorizations",
    defaultFields: [
      { type: "checkbox", label: "I authorize a credit check", required: true },
      { type: "checkbox", label: "I authorize a background check", required: true },
      { type: "checkbox", label: "I authorize employment verification", required: true },
      { type: "checkbox", label: "I authorize rental history verification", required: true },
      { type: "checkbox", label: "I certify that all information provided is true and accurate", required: true },
      { type: "signature", label: "Electronic Signature", required: true },
      { type: "date", label: "Date", required: true },
    ]
  },
];

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Standard Rental Application",
    type: "Rental Application",
    content: `RENTAL APPLICATION FORM

Property Address: {PROPERTY_ADDRESS}
Applicant Information:
- Full Name: {APPLICANT_NAME}
- Phone: {PHONE}
- Email: {EMAIL}
- Current Address: {CURRENT_ADDRESS}
- Monthly Income: {MONTHLY_INCOME}
- Employment Status: {EMPLOYMENT_STATUS}
- Emergency Contact: {EMERGENCY_CONTACT}

Please provide the following documents:
- Photo ID
- Proof of income (last 3 pay stubs)
- Bank statements (last 2 months)
- References from previous landlords

Application Fee: $50
Security Deposit: {SECURITY_DEPOSIT}
Monthly Rent: {MONTHLY_RENT}

By signing below, I authorize a credit and background check.

Signature: _________________ Date: _________________`,
    variables: ["PROPERTY_ADDRESS", "APPLICANT_NAME", "PHONE", "EMAIL", "CURRENT_ADDRESS", "MONTHLY_INCOME", "EMPLOYMENT_STATUS", "EMERGENCY_CONTACT", "SECURITY_DEPOSIT", "MONTHLY_RENT"],
    status: "Active",
    createdDate: "2024-01-01",
    lastUsed: "2024-01-14",
    usageCount: 45,
    applicationFee: 50,
    paymentMethods: defaultPaymentMethods,
  },
];

export default function Templates() {
  const theme = useTheme();
  const {
    canAccessTemplateLibrary,
    canCreateTemplates,
    canEditTemplates,
    canDeleteTemplates,
    isAdmin,
    userRole
  } = useRoleManagement();

  // Check if user has access to templates
  if (!canAccessTemplateLibrary()) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have permission to access the template library. Contact your administrator for access.
        </Typography>
      </Box>
    );
  }

  // Load templates from localStorage, fallback to mock data
  const [templates, setTemplates] = React.useState<Template[]>(() => {
    const savedTemplates = LocalStorageService.getTemplates();
    console.log('Loading templates from localStorage:', savedTemplates.length, 'templates found');
    return savedTemplates.length > 0 ? savedTemplates : mockTemplates;
  });

  // Helper function to update templates and save to localStorage
  const updateTemplates = React.useCallback((newTemplatesOrUpdater: Template[] | ((prev: Template[]) => Template[])) => {
    setTemplates(prev => {
      const updated = typeof newTemplatesOrUpdater === 'function'
        ? newTemplatesOrUpdater(prev)
        : newTemplatesOrUpdater;
      try {
        LocalStorageService.saveTemplates(updated);
        console.log('Templates updated and saved to localStorage');
      } catch (error) {
        console.error('Failed to save templates after update:', error);
      }
      return updated;
    });
  }, []);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = React.useState(false);
  const [openFormBuilderDialog, setOpenFormBuilderDialog] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    type: "Rental Application" as Template["type"],
    subject: "",
    content: "",
    variables: "",
  });

  // Form Builder State
  const [formFields, setFormFields] = React.useState<FormField[]>([]);
  const [editingField, setEditingField] = React.useState<FormField | null>(null);
  const [fieldDialogOpen, setFieldDialogOpen] = React.useState(false);
  const [paymentSettingsOpen, setPaymentSettingsOpen] = React.useState(false);
  const [applicationFee, setApplicationFee] = React.useState<number>(50);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(defaultPaymentMethods);
  const [formPreviewOpen, setFormPreviewOpen] = React.useState(false);
  const [variablesCheatSheetOpen, setVariablesCheatSheetOpen] = React.useState(false);
  const [companySettingsOpen, setCompanySettingsOpen] = React.useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = React.useState(false);
  const [paymentTestOpen, setPaymentTestOpen] = React.useState(false);
  const [requirePaymentBeforeSubmission, setRequirePaymentBeforeSubmission] = React.useState(true);
  const [termsAndConditions, setTermsAndConditions] = React.useState<any[]>([]);
  const [defaultConfirmDialog, setDefaultConfirmDialog] = React.useState<Template | null>(null);
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();
  const [newFieldData, setNewFieldData] = React.useState<Partial<FormField>>({
    type: "text",
    label: "",
    required: false,
    options: [],
  });

  // Auto-save functionality disabled to prevent infinite loops
  // const autoSaveData = React.useMemo(() => ({
  //   formData,
  //   formFields,
  //   paymentMethods,
  //   applicationFee,
  //   selectedTemplate: selectedTemplate?.id
  // }), [formData, formFields, paymentMethods, applicationFee, selectedTemplate]);

  // const autoSave = useAutoSave(autoSaveData, {
  //   key: 'template-editor-autosave',
  //   delay: 3000, // 3 seconds
  //   enabled: openDialog || openFormBuilderDialog, // Only auto-save when editing
  //   onSave: async (data) => {
  //     console.log('Auto-saving template data...', data);
  //     // Could send to server here if needed
  //   }
  // });

  // const autoSaveStatus = useAutoSaveStatus(autoSave);

  const templateTypes = ["All", "Rental Application", "Email Marketing", "SMS Marketing", "Lease Agreement", "Notice"];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      name: "",
      type: "Rental Application",
      subject: "",
      content: "",
      variables: "",
    });
    setOpenDialog(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || "",
      content: template.content,
      variables: template.variables.join(", "),
    });
    if (template.formFields) {
      setFormFields(template.formFields);
    }
    if (template.applicationFee) {
      setApplicationFee(template.applicationFee);
    }
    if (template.paymentMethods) {
      setPaymentMethods(template.paymentMethods);
    }
    setOpenDialog(true);
  };

  const handleSaveTemplate = () => {
    const variablesArray = formData.variables.split(",").map(v => v.trim()).filter(v => v);
    
    if (selectedTemplate) {
      // Edit existing template
      updateTemplates(prev =>
        prev.map(t =>
          t.id === selectedTemplate.id
            ? { ...t, ...formData, variables: variablesArray, formFields, applicationFee, paymentMethods }
            : t
        )
      );
    } else {
      // Add new template
      const newTemplate: Template = {
        id: Date.now().toString(),
        ...formData,
        variables: variablesArray,
        status: "Active",
        createdDate: new Date().toISOString().split('T')[0],
        usageCount: 0,
        formFields,
        applicationFee,
        paymentMethods,
      };
      updateTemplates(prev => [...prev, newTemplate]);
    }
    setOpenDialog(false);
    setFormFields([]);
  };

  const handleDeleteTemplate = (id: string) => {
    updateTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleSetAsDefault = (template: Template) => {
    if (template.type === "Rental Application") {
      updateTemplates(prev =>
        prev.map(t => ({
          ...t,
          isDefault: t.id === template.id && t.type === "Rental Application"
        }))
      );
      setDefaultConfirmDialog(null);
      alert(`"${template.name}" has been set as the default rental application template.`);
    }
  };

  const getDefaultTemplate = (type: Template["type"]) => {
    return templates.find(t => t.type === type && t.isDefault);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setOpenPreviewDialog(true);
  };

  const handleCopyTemplate = (template: Template) => {
    quickCopy(template.content, `Template "${template.name}" copied to clipboard!`);
  };

  // Form Builder Functions
  const handleOpenFormBuilder = () => {
    setFormFields([]);
    setApplicationFee(50);
    setPaymentMethods(defaultPaymentMethods);
    setOpenFormBuilderDialog(true);
  };

  const handleAddSection = (sectionId: string) => {
    try {
      const section = applicationSections.find(s => s.id === sectionId);
      if (!section) {
        console.error("Section not found:", sectionId);
        return;
      }

      const currentFieldCount = formFields.length;
      const sectionField: FormField = {
        id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "section",
        label: section.name,
        required: false,
        order: currentFieldCount,
        description: section.description,
        section: section.name,
      };

      const sectionFields = section.defaultFields.map((field, index) => ({
        id: `field_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        type: field.type || "text",
        label: field.label || "",
        placeholder: field.placeholder,
        required: field.required || false,
        options: field.options || [],
        order: currentFieldCount + index + 1,
        section: section.name,
        description: field.description,
        defaultValue: field.defaultValue,
        ...field,
      } as FormField));

      setFormFields(prev => {
        const newFields = [...prev, sectionField, ...sectionFields];
        console.log("Added section fields:", newFields);
        return newFields;
      });
    } catch (error) {
      console.error("Error adding section:", error);
      alert("Error adding section. Please try again.");
    }
  };

  const handleAddCustomField = () => {
    setEditingField(null);
    setNewFieldData({
      type: "text",
      label: "",
      required: false,
      options: [],
    });
    setFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    try {
      if (editingField) {
        setFormFields(prev => 
          prev.map(field => 
            field.id === editingField.id 
              ? { ...field, ...newFieldData }
              : field
          )
        );
      } else {
        const newField: FormField = {
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...newFieldData,
          order: formFields.length,
        } as FormField;
        setFormFields(prev => [...prev, newField]);
      }
      setFieldDialogOpen(false);
    } catch (error) {
      console.error("Error saving field:", error);
      alert("Error saving field. Please try again.");
    }
  };

  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    try {
      const fieldIndex = formFields.findIndex(f => f.id === fieldId);
      if (fieldIndex === -1) return;

      const newFields = [...formFields];
      const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < newFields.length) {
        [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];
        
        // Update order numbers
        newFields.forEach((field, index) => {
          field.order = index;
        });
        
        setFormFields(newFields);
      }
    } catch (error) {
      console.error("Error moving field:", error);
    }
  };

  const handleDeleteField = (fieldId: string) => {
    try {
      setFormFields(prev => prev.filter(f => f.id !== fieldId));
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  const handleDeleteSection = (sectionName: string) => {
    try {
      setFormFields(prev => prev.filter(f => f.section !== sectionName && f.label !== sectionName));
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setNewFieldData(field);
    setFieldDialogOpen(true);
  };

  const handleTogglePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "section":
        return (
          <Box sx={{ bgcolor: "primary.light", p: 2, borderRadius: 1, color: "primary.contrastText", position: "relative" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {field.label}
                </Typography>
                {field.description && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {field.description}
                  </Typography>
                )}
              </Box>
              <Tooltip title="Remove Section">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSection(field.label)}
                  sx={{ color: "inherit" }}
                >
                  <RemoveRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        );
      case "text":
      case "email":
      case "phone":
      case "number":
      case "date":
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
            fullWidth
            disabled
            helperText={field.description}
            InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
          />
        );
      case "textarea":
        return (
          <TextField
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            multiline
            rows={3}
            fullWidth
            disabled
            helperText={field.description}
          />
        );
      case "select":
        return (
          <FormControl fullWidth>
            <InputLabel>{field.label} {field.required && "*"}</InputLabel>
            <Select label={field.label} defaultValue="">
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </FormControl>
        );
      case "checkbox":
        return (
          <Box>
            <FormControlLabel
              control={<Checkbox />}
              label={field.label + (field.required ? " *" : "")}
            />
            {field.description && (
              <Typography variant="caption" color="text.secondary" display="block">
                {field.description}
              </Typography>
            )}
          </Box>
        );
      case "radio":
        return (
          <FormControl component="fieldset">
            <Typography variant="body1" gutterBottom>
              {field.label} {field.required && "*"}
            </Typography>
            <RadioGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </FormControl>
        );
      case "yesno":
        return (
          <FormControl component="fieldset" disabled>
            <Typography variant="body1" gutterBottom>
              {field.label} {field.required && "*"}
            </Typography>
            <RadioGroup row>
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </FormControl>
        );
      case "signature":
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {field.label} {field.required && "*"}
            </Typography>
            <Paper
              sx={{
                p: 2,
                border: "2px dashed",
                borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                textAlign: "center",
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'
              }}
            >
              <Typography color="text.secondary">
                Signature pad will appear here
              </Typography>
            </Paper>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </Box>
        );
      case "payment":
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Fee Payment - ${applicationFee}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Choose your preferred payment method:
              </Typography>
              <Grid container spacing={2}>
                {paymentMethods.filter(method => method.enabled).map((method) => (
                  <Grid item xs={12} sm={6} key={method.id}>
                    <Card variant="outlined" sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {method.type === "credit_card" && <CreditCardRoundedIcon />}
                          {method.type === "debit_card" && <CreditCardRoundedIcon />}
                          {method.type === "zelle" && <AccountBalanceRoundedIcon />}
                          {method.type === "cashapp" && <PaymentRoundedIcon />}
                          {method.type === "paypal" && <PaymentRoundedIcon />}
                          {method.type === "venmo" && <PaymentRoundedIcon />}
                          {method.type === "check" && <ReceiptRoundedIcon />}
                          {method.type === "money_order" && <ReceiptRoundedIcon />}
                          <Box>
                            <Typography variant="subtitle2">{method.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {method.instructions}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        );
      case "terms":
        return (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {field.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Terms and conditions component will appear here
              </Typography>
              <Button variant="outlined" size="small">
                Review Terms
              </Button>
            </CardContent>
          </Card>
        );
      case "file_upload":
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              {field.label} {field.required && "*"}
            </Typography>
            <Paper
              sx={{
                p: 3,
                border: "2px dashed",
                borderColor: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.300',
                textAlign: "center",
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'
              }}
            >
              <Typography color="text.secondary">
                Drag & drop files here or click to browse
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {field.fileTypes && `Accepted: ${field.fileTypes.join(", ")}`}
                {field.maxFiles && ` • Max ${field.maxFiles} files`}
                {field.maxFileSize && ` • Max ${field.maxFileSize}MB per file`}
              </Typography>
            </Paper>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </Box>
        );
      case "multiselect":
        return (
          <FormControl fullWidth>
            <InputLabel>{field.label} {field.required && "*"}</InputLabel>
            <Select
              label={field.label}
              multiple
              defaultValue={[]}
              disabled
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {field.description && (
              <Typography variant="caption" color="text.secondary">
                {field.description}
              </Typography>
            )}
          </FormControl>
        );
      default:
        return null;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTab === 0 || template.type === templateTypes[selectedTab];
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: Template["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "Draft": return "warning";
      case "Archived": return "default";
      default: return "default";
    }
  };

  const getTypeIcon = (type: Template["type"]) => {
    switch (type) {
      case "Email Marketing": return <EmailRoundedIcon />;
      case "SMS Marketing": return <SmsRoundedIcon />;
      default: return <DescriptionRoundedIcon />;
    }
  };

  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.status === "Active").length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const avgUsage = Math.round(totalUsage / templates.length) || 0;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" component="h1">
            Templates
          </Typography>
          <Chip
            label={userRole}
            color={isAdmin ? "primary" : "default"}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<BusinessRoundedIcon />}
            onClick={() => setCompanySettingsOpen(true)}
            disabled={!isAdmin}
          >
            Company Info {!isAdmin && '(Admin Only)'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<InfoRoundedIcon />}
            onClick={() => setVariablesCheatSheetOpen(true)}
          >
            Variables Guide
          </Button>
          <Button
            variant="outlined"
            startIcon={<DescriptionRoundedIcon />}
            onClick={handleOpenFormBuilder}
          >
            Create Application Form
          </Button>
          {canCreateTemplates() && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddTemplate}
            >
              Create Template
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <DescriptionRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Templates
                  </Typography>
                  <Typography variant="h4">{totalTemplates}</Typography>
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
                  <DescriptionRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Templates
                  </Typography>
                  <Typography variant="h4">{activeTemplates}</Typography>
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
                  ��
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
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  ⚡
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Avg Usage
                  </Typography>
                  <Typography variant="h4">{avgUsage}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Tabs */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Tabs value={selectedTab} onChange={handleTabChange}>
          {templateTypes.map((type, index) => (
            <Tab key={index} label={type} />
          ))}
        </Tabs>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    {getTypeIcon(template.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.type}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={template.status}
                      color={getStatusColor(template.status)}
                      size="small"
                    />
                    {template.isDefault && (
                      <Chip
                        label="Default"
                        color="success"
                        size="small"
                        icon={<StarRoundedIcon />}
                      />
                    )}
                  </Stack>
                </Stack>

                {template.subject && (
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                    Subject: {template.subject}
                  </Typography>
                )}

                {template.applicationFee && (
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium", color: "success.main" }}>
                    Application Fee: ${template.applicationFee}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.content.substring(0, 100)}...
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {template.variables.slice(0, 3).map((variable) => (
                    <Chip
                      key={variable}
                      label={`{${variable}}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {template.variables.length > 3 && (
                    <Chip
                      label={`+${template.variables.length - 3} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Used {template.usageCount} times
                  </Typography>
                  {template.lastUsed && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last used: {new Date(template.lastUsed).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handlePreviewTemplate(template)}
                  title="Preview"
                >
                  <PreviewRoundedIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleCopyTemplate(template)}
                  title="Copy"
                >
                  <ContentCopyRoundedIcon />
                </IconButton>
                {canEditTemplates() && (
                  <IconButton
                    size="small"
                    onClick={() => handleEditTemplate(template)}
                    title="Edit"
                  >
                    <EditRoundedIcon />
                  </IconButton>
                )}
                {template.type === "Rental Application" && (
                  <IconButton
                    size="small"
                    color={template.isDefault ? "success" : "default"}
                    onClick={() => setDefaultConfirmDialog(template)}
                    title={template.isDefault ? "Default Template" : "Set as Default"}
                  >
                    {template.isDefault ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
                  </IconButton>
                )}
                {canDeleteTemplates() && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Delete"
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Form Builder Dialog */}
      <Dialog 
        open={openFormBuilderDialog} 
        onClose={() => setOpenFormBuilderDialog(false)} 
        maxWidth="xl" 
        fullWidth
        fullScreen
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Rental Application Form Builder</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Auto-save status disabled to prevent infinite loops */}
              <Button
                variant="outlined"
                startIcon={<PaymentRoundedIcon />}
                onClick={() => setPaymentSettingsOpen(true)}
              >
                Payment Settings
              </Button>
              <Button
                variant="outlined"
                startIcon={<SecurityRoundedIcon />}
                onClick={() => setTermsDialogOpen(true)}
              >
                Terms & Conditions
              </Button>
              <Button
                variant="outlined"
                startIcon={<PaymentRoundedIcon />}
                onClick={() => setPaymentTestOpen(true)}
              >
                Test Payment
              </Button>
              <Button
                variant="outlined"
                startIcon={<VisibilityRoundedIcon />}
                onClick={() => setFormPreviewOpen(true)}
              >
                Review Form
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                onClick={() => {
                  const newTemplate: Template = {
                    id: Date.now().toString(),
                    name: `Custom Rental Application - ${new Date().toLocaleDateString()}`,
                    type: "Rental Application",
                    content: "Dynamic form created with form builder",
                    variables: [],
                    status: "Active",
                    createdDate: new Date().toISOString().split('T')[0],
                    usageCount: 0,
                    formFields: formFields,
                    applicationFee: applicationFee,
                    paymentMethods: paymentMethods,
                    termsAndConditions: termsAndConditions,
                    requirePaymentBeforeSubmission: requirePaymentBeforeSubmission,
                  };
                  updateTemplates(prev => [...prev, newTemplate]);
                  setOpenFormBuilderDialog(false);
                  // Auto-save functionality disabled to prevent infinite loops
                  alert("Template saved successfully!");
                }}
                disabled={formFields.length === 0}
              >
                Save Template
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ height: "70vh" }}>
            {/* Left Panel - Pre-built Sections */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: "100%", overflow: "auto" }}>
                <Typography variant="h6" gutterBottom>
                  Pre-built Sections
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Click "Add Section" to include professional rental application sections with all required fields.
                </Alert>
                
                <Stack spacing={2}>
                  {applicationSections.map((section) => (
                    <Card key={section.id} variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                            {section.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {section.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {section.defaultFields.length} fields
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {section.description}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          onClick={() => handleAddSection(section.id)}
                        >
                          Add Section
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Custom Fields
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddCustomField}
                  >
                    Add Custom Field
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PaymentRoundedIcon />}
                    onClick={() => {
                      const paymentField: FormField = {
                        id: `payment_${Date.now()}`,
                        type: "payment",
                        label: "Application Fee Payment",
                        required: true,
                        order: formFields.length,
                      };
                      setFormFields(prev => [...prev, paymentField]);
                    }}
                  >
                    Add Payment Section
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SecurityRoundedIcon />}
                    onClick={() => {
                      const termsField: FormField = {
                        id: `terms_${Date.now()}`,
                        type: "terms",
                        label: "Terms and Conditions",
                        required: true,
                        order: formFields.length,
                      };
                      setFormFields(prev => [...prev, termsField]);
                    }}
                  >
                    Add Terms & Conditions
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AddRoundedIcon />}
                    onClick={() => {
                      const fileField: FormField = {
                        id: `file_${Date.now()}`,
                        type: "file_upload",
                        label: "Document Upload",
                        required: false,
                        order: formFields.length,
                        fileTypes: ["pdf", "jpg", "png", "doc"],
                        maxFiles: 5,
                        maxFileSize: 10,
                      };
                      setFormFields(prev => [...prev, fileField]);
                    }}
                  >
                    Add File Upload
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Right Panel - Form Preview */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: "100%", overflow: "auto" }}>
                <Typography variant="h6" gutterBottom>
                  Form Preview
                </Typography>
                
                {formFields.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No fields added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select sections from the left panel to start building your rental application form
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {formFields.map((field, index) => (
                      <Box key={field.id}>
                        <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                          <DragIndicatorRoundedIcon color="disabled" sx={{ mt: 1 }} />
                          <Box sx={{ flexGrow: 1 }}>
                            {renderFieldPreview(field)}
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveField(field.id, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUpwardRoundedIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveField(field.id, "down")}
                              disabled={index === formFields.length - 1}
                            >
                              <ArrowDownwardRoundedIcon />
                            </IconButton>
                            {field.type !== "section" && (
                              <IconButton
                                size="small"
                                onClick={() => handleEditField(field)}
                              >
                                <EditRoundedIcon />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteField(field.id)}
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Stack>
                        </Stack>
                        {index < formFields.length - 1 && field.type !== "section" && <Divider />}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormBuilderDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Settings Dialog */}
      <Dialog open={paymentSettingsOpen} onClose={() => setPaymentSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Payment Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Application Fee"
              type="number"
              value={applicationFee}
              onChange={(e) => setApplicationFee(Number(e.target.value))}
              InputProps={{ startAdornment: "$" }}
              helperText="Set the application fee amount"
            />
            
            <Typography variant="h6">Payment Methods</Typography>
            <Typography variant="body2" color="text.secondary">
              Select which payment methods to offer to applicants:
            </Typography>
            
            {paymentMethods.map((method) => (
              <Card key={method.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {method.type === "credit_card" && <CreditCardRoundedIcon />}
                      {method.type === "debit_card" && <CreditCardRoundedIcon />}
                      {method.type === "zelle" && <AccountBalanceRoundedIcon />}
                      {method.type === "cashapp" && <PaymentRoundedIcon />}
                      {method.type === "paypal" && <PaymentRoundedIcon />}
                      {method.type === "venmo" && <PaymentRoundedIcon />}
                      {method.type === "check" && <ReceiptRoundedIcon />}
                      {method.type === "money_order" && <ReceiptRoundedIcon />}
                      <Typography variant="subtitle1">{method.label}</Typography>
                    </Stack>
                    <Switch
                      checked={method.enabled}
                      onChange={() => handleTogglePaymentMethod(method.id)}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Instructions"
                    value={method.instructions || ""}
                    onChange={(e) => {
                      setPaymentMethods(prev =>
                        prev.map(m =>
                          m.id === method.id
                            ? { ...m, instructions: e.target.value }
                            : m
                        )
                      );
                    }}
                    placeholder="Enter payment instructions for applicants"
                    helperText="These instructions will be shown to applicants"
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Form Preview Dialog */}
      <Dialog open={formPreviewOpen} onClose={() => setFormPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Application Form Preview</DialogTitle>
        <DialogContent>
          <Paper sx={{
            p: 3,
            maxHeight: "70vh",
            overflow: "auto",
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper',
            color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary'
          }}>
            <Typography variant="h4" gutterBottom align="center">
              Rental Application Form
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom align="center">
              Application Fee: ${applicationFee}
            </Typography>
            <Divider sx={{ my: 3 }} />
            
            {formFields.length === 0 ? (
              <Alert severity="info">
                No fields added to the form yet. Add sections and fields using the form builder.
              </Alert>
            ) : (
              <Stack spacing={3}>
                {formFields.map((field) => (
                  <Box key={field.id}>
                    {renderFieldPreview(field)}
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormPreviewOpen(false)}>Close Preview</Button>
        </DialogActions>
      </Dialog>

      {/* Field Editor Dialog */}
      <Dialog open={fieldDialogOpen} onClose={() => setFieldDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingField ? "Edit Field" : "Add Custom Field"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    value={newFieldData.type}
                    label="Field Type"
                    onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value as FormField["type"] })}
                  >
                    <MenuItem value="text">Text Input</MenuItem>
                    <MenuItem value="number">Number Input</MenuItem>
                    <MenuItem value="email">Email Input</MenuItem>
                    <MenuItem value="phone">Phone Input</MenuItem>
                    <MenuItem value="date">Date Input</MenuItem>
                    <MenuItem value="textarea">Textarea</MenuItem>
                    <MenuItem value="select">Dropdown</MenuItem>
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                    <MenuItem value="radio">Radio Buttons</MenuItem>
                    <MenuItem value="yesno">Yes/No</MenuItem>
                    <MenuItem value="signature">Signature</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newFieldData.required}
                      onChange={(e) => setNewFieldData({ ...newFieldData, required: e.target.checked })}
                    />
                  }
                  label="Required Field"
                />
              </Grid>
            </Grid>

            <TextField
              label="Field Label"
              fullWidth
              value={newFieldData.label}
              onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
              placeholder="Enter the question or field label"
            />

            <TextField
              label="Placeholder Text"
              fullWidth
              value={newFieldData.placeholder || ""}
              onChange={(e) => setNewFieldData({ ...newFieldData, placeholder: e.target.value })}
              placeholder="Hint text shown inside the field"
            />

            <TextField
              label="Description/Help Text"
              fullWidth
              multiline
              rows={2}
              value={newFieldData.description || ""}
              onChange={(e) => setNewFieldData({ ...newFieldData, description: e.target.value })}
              placeholder="Additional information to help users fill out this field"
            />

            {(newFieldData.type === "select" || newFieldData.type === "radio") && (
              <TextField
                label="Options (one per line)"
                fullWidth
                multiline
                rows={4}
                value={newFieldData.options?.join("\n") || ""}
                onChange={(e) => setNewFieldData({ 
                  ...newFieldData, 
                  options: e.target.value.split("\n").filter(option => option.trim()) 
                })}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                helperText="Enter each option on a new line"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveField}>
            {editingField ? "Update" : "Add"} Field
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Template Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xl" fullWidth fullScreen={formData.type === "Rental Application"}>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              {selectedTemplate ? "Edit Template" : "Create New Template"}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Auto-save status disabled to prevent infinite loops */}
              {formData.type === "Rental Application" && formFields.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<VisibilityRoundedIcon />}
                  onClick={() => setFormPreviewOpen(true)}
                >
                  Preview Application
                </Button>
              )}
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  label="Template Name"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Template Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Template Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Template["type"] })}
                  >
                    <MenuItem value="Rental Application">Rental Application</MenuItem>
                    <MenuItem value="Email Marketing">Email Marketing</MenuItem>
                    <MenuItem value="SMS Marketing">SMS Marketing</MenuItem>
                    <MenuItem value="Lease Agreement">Lease Agreement</MenuItem>
                    <MenuItem value="Notice">Notice</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {(formData.type === "Email Marketing") && (
              <TextField
                label="Email Subject"
                fullWidth
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Use {VARIABLE} for dynamic content"
              />
            )}

            {/* Show Rich Text Editor and Form Builder for Rental Applications */}
            {formData.type === "Rental Application" ? (
              <Grid container spacing={3}>
                {/* Left Panel - Form Builder for Rental Applications */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: "60vh", overflow: "auto" }}>
                    <Typography variant="h6" gutterBottom>
                      Form Fields & Sections
                    </Typography>

                    <Alert severity="info" sx={{ mb: 2 }}>
                      Click sections below to add to your rental application form.
                    </Alert>

                    <Stack spacing={2}>
                      {applicationSections.map((section) => (
                        <Card key={section.id} variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                              <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                                {section.icon}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {section.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {section.defaultFields.length} fields
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {section.description}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth
                              onClick={() => handleAddSection(section.id)}
                            >
                              Add Section
                            </Button>
                          </CardContent>
                        </Card>
                      ))}

                      <Divider sx={{ my: 2 }} />

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddRoundedIcon />}
                        onClick={handleAddCustomField}
                      >
                        Add Custom Field
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PaymentRoundedIcon />}
                        onClick={() => setPaymentSettingsOpen(true)}
                      >
                        Payment Settings
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Right Panel - Form Preview and Content */}
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    {/* Rich Text Content */}
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Template Description & Instructions
                      </Typography>
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="Add description and instructions for your rental application template"
                        minHeight={200}
                        label="Template Content"
                      />
                    </Paper>

                    {/* Form Fields Preview */}
                    <Paper sx={{ p: 2, height: "40vh", overflow: "auto" }}>
                      <Typography variant="h6" gutterBottom>
                        Application Form Preview
                      </Typography>

                      {formFields.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No fields added yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Add sections from the left panel to build your rental application form
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {formFields.map((field, index) => (
                            <Box key={field.id}>
                              <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                                <DragIndicatorRoundedIcon color="disabled" sx={{ mt: 1 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                  {renderFieldPreview(field)}
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMoveField(field.id, "up")}
                                    disabled={index === 0}
                                  >
                                    <ArrowUpwardRoundedIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMoveField(field.id, "down")}
                                    disabled={index === formFields.length - 1}
                                  >
                                    <ArrowDownwardRoundedIcon />
                                  </IconButton>
                                  {field.type !== "section" && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditField(field)}
                                    >
                                      <EditRoundedIcon />
                                    </IconButton>
                                  )}
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteField(field.id)}
                                  >
                                    <DeleteRoundedIcon />
                                  </IconButton>
                                </Stack>
                              </Stack>
                              {index < formFields.length - 1 && field.type !== "section" && <Divider />}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            ) : (
              /* Regular Rich Text Editor for other template types */
              <>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Create your template content using rich text formatting and {VARIABLES} for dynamic content"
                  minHeight={300}
                  label="Template Content"
                />
              </>
            )}

            <TextField
              label="Variables (comma separated)"
              fullWidth
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              placeholder="TENANT_NAME, PROPERTY_ADDRESS, MONTHLY_RENT"
              helperText="List the variable names that will be used in the template"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            {selectedTemplate ? "Update" : "Create"} Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          {previewTemplate && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {previewTemplate.name}
              </Typography>
              {previewTemplate.subject && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject:
                  </Typography>
                  <Typography variant="body1">
                    {previewTemplate.subject}
                  </Typography>
                </Box>
              )}
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Content:
              </Typography>
              <Paper sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                borderColor: 'grey.700'
              }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'inherit'
                  }}
                >
                  {previewTemplate.content}
                </Typography>
              </Paper>
              {previewTemplate.variables.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Variables:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {previewTemplate.variables.map((variable) => (
                      <Chip
                        key={variable}
                        label={`{${variable}}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              {previewTemplate.formFields && previewTemplate.formFields.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Form Fields:
                  </Typography>
                  <Stack spacing={2}>
                    {previewTemplate.formFields.map((field) => (
                      <Box key={field.id}>
                        {renderFieldPreview(field)}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Variables Cheat Sheet */}
      <VariablesCheatSheet
        open={variablesCheatSheetOpen}
        onClose={() => setVariablesCheatSheetOpen(false)}
      />

      {/* Company Settings */}
      <CompanySettings
        open={companySettingsOpen}
        onClose={() => setCompanySettingsOpen(false)}
        onSave={updateCompanyInfo}
        currentInfo={companyInfo}
      />

      {/* Terms and Conditions Dialog */}
      <Dialog open={termsDialogOpen} onClose={() => setTermsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Terms and Conditions Management</DialogTitle>
        <DialogContent>
          <TermsAndConditions
            showEditor={true}
            onTermsUpdate={setTermsAndConditions}
            customTerms={termsAndConditions}
            applicationFee={applicationFee}
            companyName={companyInfo.name}
            onAccept={(accepted) => console.log("Terms accepted:", accepted)}
            onDecline={() => console.log("Terms declined")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Test Dialog */}
      <ApplicationPaymentForm
        isOpen={paymentTestOpen}
        onClose={() => setPaymentTestOpen(false)}
        applicationFee={applicationFee}
        paymentMethods={paymentMethods}
        applicantName="Test Applicant"
        applicationId="TEST-001"
        onPaymentSuccess={(data) => {
          console.log("Payment successful:", data);
          alert("Payment test completed successfully!");
          setPaymentTestOpen(false);
        }}
        onPaymentError={(error) => {
          console.error("Payment error:", error);
          alert("Payment test failed: " + error);
        }}
      />

      {/* Default Template Confirmation Dialog */}
      <Dialog open={!!defaultConfirmDialog} onClose={() => setDefaultConfirmDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Default Template</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {defaultConfirmDialog?.isDefault
              ? `"${defaultConfirmDialog?.name}" is currently the default rental application template.`
              : `Are you sure you want to set "${defaultConfirmDialog?.name}" as the default rental application template?`
            }
          </Typography>
          {!defaultConfirmDialog?.isDefault && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This template will be automatically used when creating new applications from property pages.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDefaultConfirmDialog(null)}>
            {defaultConfirmDialog?.isDefault ? "Close" : "Cancel"}
          </Button>
          {!defaultConfirmDialog?.isDefault && (
            <Button
              variant="contained"
              onClick={() => defaultConfirmDialog && handleSetAsDefault(defaultConfirmDialog)}
            >
              Set as Default
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
