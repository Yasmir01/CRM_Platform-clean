import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { quickCopy } from "../utils/clipboardUtils";

interface VariableGroup {
  category: string;
  icon: React.ReactNode;
  description: string;
  variables: {
    name: string;
    description: string;
    example: string;
  }[];
}

const variableGroups: VariableGroup[] = [
  {
    category: "Tenant Information",
    icon: <PersonRoundedIcon />,
    description: "Variables related to tenant personal and contact information",
    variables: [
      { name: "TENANT_NAME", description: "Full name of the tenant", example: "John Smith" },
      { name: "TENANT_FIRST_NAME", description: "First name only", example: "John" },
      { name: "TENANT_LAST_NAME", description: "Last name only", example: "Smith" },
      { name: "TENANT_EMAIL", description: "Tenant's email address", example: "john.smith@email.com" },
      { name: "TENANT_PHONE", description: "Tenant's phone number", example: "(555) 123-4567" },
      { name: "TENANT_ADDRESS", description: "Tenant's current address", example: "123 Main St, City, State 12345" },
      { name: "EMERGENCY_CONTACT", description: "Emergency contact name and phone", example: "Jane Smith - (555) 987-6543" },
      { name: "TENANT_ID", description: "Unique tenant identifier", example: "TEN-001234" },
    ]
  },
  {
    category: "Property Information",
    icon: <HomeRoundedIcon />,
    description: "Variables related to property details and specifications",
    variables: [
      { name: "PROPERTY_NAME", description: "Name of the property", example: "Sunset Apartments" },
      { name: "PROPERTY_ADDRESS", description: "Full property address", example: "456 Oak Avenue, Los Angeles, CA 90210" },
      { name: "UNIT_NUMBER", description: "Specific unit number", example: "Apt 2B" },
      { name: "PROPERTY_TYPE", description: "Type of property", example: "Apartment" },
      { name: "BEDROOMS", description: "Number of bedrooms", example: "2" },
      { name: "BATHROOMS", description: "Number of bathrooms", example: "1.5" },
      { name: "SQUARE_FOOTAGE", description: "Property square footage", example: "850 sq ft" },
      { name: "PARKING_SPACES", description: "Number of parking spaces", example: "1" },
      { name: "PET_POLICY", description: "Pet policy details", example: "Cats allowed with deposit" },
      { name: "AMENITIES", description: "List of amenities", example: "Pool, Gym, Laundry" },
    ]
  },
  {
    category: "Financial Information",
    icon: <PaymentRoundedIcon />,
    description: "Variables related to payments, rent, and financial details",
    variables: [
      { name: "MONTHLY_RENT", description: "Monthly rent amount", example: "$2,500.00" },
      { name: "SECURITY_DEPOSIT", description: "Security deposit amount", example: "$2,500.00" },
      { name: "PET_DEPOSIT", description: "Pet deposit amount", example: "$500.00" },
      { name: "APPLICATION_FEE", description: "Application fee amount", example: "$75.00" },
      { name: "LATE_FEE", description: "Late payment fee", example: "$50.00" },
      { name: "PAYMENT_DUE_DATE", description: "Monthly payment due date", example: "1st of each month" },
      { name: "TOTAL_MOVE_IN_COST", description: "Total move-in costs", example: "$5,075.00" },
      { name: "OUTSTANDING_BALANCE", description: "Outstanding balance", example: "$150.00" },
      { name: "LAST_PAYMENT_DATE", description: "Date of last payment", example: "March 1, 2024" },
      { name: "LAST_PAYMENT_AMOUNT", description: "Amount of last payment", example: "$2,500.00" },
    ]
  },
  {
    category: "Lease Information",
    icon: <DescriptionRoundedIcon />,
    description: "Variables related to lease terms and agreements",
    variables: [
      { name: "LEASE_START_DATE", description: "Lease start date", example: "April 1, 2024" },
      { name: "LEASE_END_DATE", description: "Lease end date", example: "March 31, 2025" },
      { name: "LEASE_TERM", description: "Lease term length", example: "12 months" },
      { name: "RENEWAL_DATE", description: "Lease renewal date", example: "January 31, 2025" },
      { name: "MOVE_IN_DATE", description: "Tenant move-in date", example: "April 1, 2024" },
      { name: "MOVE_OUT_DATE", description: "Tenant move-out date", example: "March 31, 2025" },
      { name: "LEASE_STATUS", description: "Current lease status", example: "Active" },
      { name: "NOTICE_PERIOD", description: "Required notice period", example: "30 days" },
    ]
  },
  {
    category: "Dates & Time",
    icon: <CalendarTodayRoundedIcon />,
    description: "Date and time variables for various purposes",
    variables: [
      { name: "CURRENT_DATE", description: "Current date", example: "March 15, 2024" },
      { name: "CURRENT_TIME", description: "Current time", example: "2:30 PM" },
      { name: "CURRENT_MONTH", description: "Current month", example: "March" },
      { name: "CURRENT_YEAR", description: "Current year", example: "2024" },
      { name: "DUE_DATE", description: "Payment due date", example: "April 1, 2024" },
      { name: "INSPECTION_DATE", description: "Scheduled inspection date", example: "March 20, 2024" },
      { name: "MAINTENANCE_DATE", description: "Maintenance scheduled date", example: "March 25, 2024" },
    ]
  },
  {
    category: "Company Information",
    icon: <BusinessRoundedIcon />,
    description: "Variables related to your company and management details",
    variables: [
      { name: "COMPANY_NAME", description: "Your company name", example: "ABC Property Management" },
      { name: "COMPANY_ADDRESS", description: "Company address", example: "789 Business Ave, Suite 100" },
      { name: "COMPANY_PHONE", description: "Company phone number", example: "(555) 555-0123" },
      { name: "COMPANY_EMAIL", description: "Company email address", example: "info@abcproperties.com" },
      { name: "COMPANY_WEBSITE", description: "Company website", example: "www.abcproperties.com" },
      { name: "PROPERTY_MANAGER", description: "Property manager name", example: "Sarah Johnson" },
      { name: "MANAGER_PHONE", description: "Manager phone number", example: "(555) 555-0199" },
      { name: "MANAGER_EMAIL", description: "Manager email address", example: "sarah@abcproperties.com" },
      { name: "BUSINESS_HOURS", description: "Business operating hours", example: "Mon-Fri 9AM-6PM" },
      { name: "EMERGENCY_LINE", description: "Emergency contact line", example: "(555) 555-HELP" },
    ]
  }
];

interface VariablesCheatSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function VariablesCheatSheet({ open, onClose }: VariablesCheatSheetProps) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedCategory, setExpandedCategory] = React.useState<string | false>("Tenant Information");

  const handleCopyVariable = (variableName: string) => {
    quickCopy(`{${variableName}}`, `Variable {${variableName}} copied to clipboard!`);
  };

  const filteredGroups = variableGroups.map(group => ({
    ...group,
    variables: group.variables.filter(variable =>
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.variables.length > 0);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedCategory(isExpanded ? panel : false);
  };

  const totalVariables = variableGroups.reduce((sum, group) => sum + group.variables.length, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Variable Reference Guide</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalVariables} variables available
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Introduction */}
          <Paper sx={{ p: 2, bgcolor: "primary.light", color: "primary.contrastText" }}>
            <Typography variant="h6" gutterBottom>
              How to Use Variables
            </Typography>
            <Typography variant="body2">
              Variables allow you to create dynamic content that automatically populates with real data. 
              Use variables in templates by wrapping them in curly braces, like <strong>{"{TENANT_NAME}"}</strong>. 
              Click the copy button next to any variable to copy it to your clipboard.
            </Typography>
          </Paper>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search variables..."
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

          {/* Variable Groups */}
          <Stack spacing={2}>
            {filteredGroups.map((group) => (
              <Accordion
                key={group.category}
                expanded={expandedCategory === group.category}
                onChange={handleAccordionChange(group.category)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {group.icon}
                    <Box>
                      <Typography variant="h6">{group.category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description} • {group.variables.length} variables
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {group.variables.map((variable) => (
                      <Grid item xs={12} md={6} key={variable.name}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Chip
                                  label={`{${variable.name}}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                                />
                              </Stack>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {variable.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Example: {variable.example}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyVariable(variable.name)}
                              title="Copy variable"
                            >
                              <ContentCopyRoundedIcon />
                            </IconButton>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>

          {/* Usage Examples */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usage Examples
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="primary">
                  Email Template Example:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                    p: 1,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                    borderColor: 'grey.700',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto'
                  }}
                >
{`Dear {TENANT_NAME},

Your rent payment of {MONTHLY_RENT} for {PROPERTY_ADDRESS}, Unit {UNIT_NUMBER} is due on {DUE_DATE}.

Thank you,
{COMPANY_NAME}`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary">
                  Notice Template Example:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'grey.900',
                    p: 1,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                    borderColor: 'grey.700',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto'
                  }}
                >
{`NOTICE TO TENANT

Tenant: {TENANT_NAME}
Property: {PROPERTY_ADDRESS}
Lease Period: {LEASE_START_DATE} to {LEASE_END_DATE}

This notice is to inform you that an inspection of the above property is scheduled for {INSPECTION_DATE}.

{COMPANY_NAME}
{COMPANY_PHONE}`}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
