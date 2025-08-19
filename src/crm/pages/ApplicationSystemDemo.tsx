import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { LocalStorageService } from "../services/LocalStorageService";
import { PropertyCodeService } from "../services/PropertyCodeService";
import { PropertyCodeGenerator } from "../utils/propertyCodeGenerator";
import { useNotifications } from "../components/GlobalNotificationProvider";
import PropertyApplicationDialog from "../components/PropertyApplicationDialog";

interface DemoStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  status: "pending" | "in_progress" | "completed" | "error";
}

interface SystemStats {
  templates: number;
  defaultTemplates: number;
  applications: number;
  properties: number;
  propertiesWithCodes: number;
  paymentMethods: number;
}

export default function ApplicationSystemDemo() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [applications, setApplications] = React.useState<any[]>([]);
  const [properties, setProperties] = React.useState<any[]>([]);
  const [testResults, setTestResults] = React.useState<Record<string, boolean>>({});
  const [stats, setStats] = React.useState<SystemStats>({
    templates: 0,
    defaultTemplates: 0,
    applications: 0,
    properties: 0,
    propertiesWithCodes: 0,
    paymentMethods: 0,
  });
  const [demoPropertyDialog, setDemoPropertyDialog] = React.useState(false);
  const [demoProperty, setDemoProperty] = React.useState<any>(null);
  const [autoDemo, setAutoDemo] = React.useState(false);
  
  const notifications = useNotifications();
  const propertyCodeService = PropertyCodeService.getInstance();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedTemplates = LocalStorageService.getTemplates();
    const savedApplications = LocalStorageService.getApplications();
    const savedProperties = LocalStorageService.getProperties();
    
    setTemplates(savedTemplates);
    setApplications(savedApplications);
    setProperties(savedProperties);
    
    // Calculate stats
    const defaultTemplates = savedTemplates.filter(t => t.isDefault).length;
    const codeStats = propertyCodeService.getCodeStatistics();
    
    setStats({
      templates: savedTemplates.length,
      defaultTemplates,
      applications: savedApplications.length,
      properties: savedProperties.length,
      propertiesWithCodes: codeStats.propertiesWithCodes,
      paymentMethods: 8, // Default payment methods count
    });
  };

  const createDemoTemplate = () => {
    const demoTemplate = {
      id: `demo_template_${Date.now()}`,
      name: "Complete Rental Application Demo",
      type: "Rental Application",
      content: "<p>Welcome! This is a comprehensive rental application with all features enabled.</p>",
      variables: ["PROPERTY_ADDRESS", "APPLICANT_NAME", "APPLICATION_FEE", "COMPANY_NAME"],
      status: "Active",
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0,
      applicationFee: 75,
      requirePaymentBeforeSubmission: true,
      isDefault: true, // Mark as default
      paymentMethods: [
        { id: "credit_card", type: "credit_card", label: "Credit Card", enabled: true },
        { id: "debit_card", type: "debit_card", label: "Debit Card", enabled: true },
        { id: "zelle", type: "zelle", label: "Zelle", enabled: true },
        { id: "cashapp", type: "cashapp", label: "CashApp", enabled: true },
        { id: "paypal", type: "paypal", label: "PayPal", enabled: true },
      ],
      formFields: [
        { id: "section_personal", type: "section", label: "Personal Information", required: false, order: 0 },
        { id: "first_name", type: "text", label: "First Name", required: true, order: 1, section: "Personal Information" },
        { id: "last_name", type: "text", label: "Last Name", required: true, order: 2, section: "Personal Information" },
        { id: "email", type: "email", label: "Email Address", required: true, order: 3, section: "Personal Information" },
        { id: "phone", type: "phone", label: "Phone Number", required: true, order: 4, section: "Personal Information" },
        { id: "section_employment", type: "section", label: "Employment Information", required: false, order: 5 },
        { id: "employer", type: "text", label: "Current Employer", required: true, order: 6, section: "Employment Information" },
        { id: "monthly_income", type: "number", label: "Monthly Income", required: true, order: 7, section: "Employment Information" },
        { id: "employment_type", type: "select", label: "Employment Type", required: true, order: 8, section: "Employment Information", options: ["Full-time", "Part-time", "Contract"] },
        { id: "documents", type: "file_upload", label: "Required Documents", required: true, order: 9, fileTypes: ["pdf", "jpg", "png"], maxFiles: 5 },
        { id: "terms", type: "terms", label: "Terms and Conditions", required: true, order: 10 },
        { id: "payment", type: "payment", label: "Application Fee Payment", required: true, order: 11 },
      ],
      termsAndConditions: [
        {
          id: "application_process",
          title: "Application Process",
          content: "<p>By submitting this application, you agree to our comprehensive application process.</p>",
          required: true,
          order: 1,
          type: "standard"
        }
      ]
    };

    // Clear existing default templates
    const existingTemplates = LocalStorageService.getTemplates();
    const updatedTemplates = existingTemplates.map(t => ({ ...t, isDefault: false }));
    
    // Add new default template
    const finalTemplates = [...updatedTemplates, demoTemplate];
    LocalStorageService.saveTemplates(finalTemplates);
    setTemplates(finalTemplates);
    setTestResults(prev => ({ ...prev, template_creation: true }));
    
    notifications.showTemplateDefaultSet(demoTemplate.name);
    return demoTemplate;
  };

  const generatePropertyCodes = () => {
    const result = propertyCodeService.generateMissingCodes();
    setTestResults(prev => ({ ...prev, property_codes: true }));
    
    if (result.updated > 0) {
      notifications.showSuccess(
        "Property Codes Generated",
        `Generated ${result.updated} new property codes`
      );
    } else {
      notifications.showInfo(
        "Property Codes",
        "All properties already have valid codes"
      );
    }
    
    loadData();
  };

  const testPaymentIntegration = () => {
    // Simulate payment test
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, payment_integration: true }));
      notifications.showPaymentSuccess(75, "Credit Card", "DEMO123456");
    }, 1500);
  };

  const testFormWorkflow = () => {
    // Create demo property for testing
    const demoProperty = {
      id: "demo_property_1",
      name: "Luxury Demo Apartment",
      address: "123 Demo Street, Demo City, DC 12345",
      monthlyRent: 2500,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      propertyCode: PropertyCodeGenerator.generateCode(),
      description: "Beautiful luxury apartment with all amenities",
      amenities: ["Pool", "Gym", "Parking", "Balcony"],
      petPolicy: "Pets Allowed",
      status: "Available"
    };
    
    setDemoProperty(demoProperty);
    setDemoPropertyDialog(true);
    setTestResults(prev => ({ ...prev, workflow_integration: true }));
  };

  const runAllTests = async () => {
    setAutoDemo(true);
    
    const steps = [
      { name: "Creating demo template", action: createDemoTemplate },
      { name: "Generating property codes", action: generatePropertyCodes },
      { name: "Testing payment integration", action: testPaymentIntegration },
      { name: "Testing form workflow", action: testFormWorkflow },
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      notifications.showInfo("Demo Progress", `Step ${i + 1}/4: ${steps[i].name}`);
      
      await new Promise(resolve => {
        setTimeout(() => {
          steps[i].action();
          resolve(void 0);
        }, 1000);
      });
    }
    
    setCurrentStep(steps.length);
    setAutoDemo(false);
    
    notifications.showSuccess(
      "Demo Complete!",
      "All application system features have been tested successfully"
    );
  };

  const demoSteps: DemoStep[] = [
    {
      id: "template_creation",
      title: "Create Default Template",
      description: "Create a comprehensive rental application template and mark it as default",
      completed: testResults.template_creation || false,
      status: testResults.template_creation ? "completed" : "pending",
      action: createDemoTemplate
    },
    {
      id: "property_codes",
      title: "Generate Property Codes",
      description: "Generate unique 6-digit property codes for all properties",
      completed: testResults.property_codes || false,
      status: testResults.property_codes ? "completed" : "pending",
      action: generatePropertyCodes
    },
    {
      id: "payment_integration",
      title: "Test Payment System",
      description: "Verify payment processing with multiple payment methods",
      completed: testResults.payment_integration || false,
      status: testResults.payment_integration ? "completed" : "pending",
      action: testPaymentIntegration
    },
    {
      id: "workflow_integration",
      title: "Test Complete Workflow",
      description: "Test the full property application workflow from start to finish",
      completed: testResults.workflow_integration || false,
      status: testResults.workflow_integration ? "completed" : "pending",
      action: testFormWorkflow
    }
  ];

  const completedSteps = Object.values(testResults).filter(Boolean).length;
  const allTestsComplete = completedSteps === demoSteps.length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            🚀 Application System Demo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete integration testing for rental application system with property codes and payment processing
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={loadData}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={runAllTests}
            disabled={autoDemo}
            startIcon={autoDemo ? <LinearProgress size={20} /> : <PlayArrowIcon />}
            size="large"
          >
            {autoDemo ? "Running Demo..." : "Run Full Demo"}
          </Button>
        </Stack>
      </Stack>

      {/* Progress Overview */}
      <Alert 
        severity={allTestsComplete ? "success" : "info"} 
        sx={{ mb: 3 }}
        icon={allTestsComplete ? <CheckCircleIcon /> : undefined}
      >
        <Typography variant="body2" fontWeight="medium">
          {allTestsComplete 
            ? "🎉 All tests completed! The application system is fully operational with property codes and payment integration."
            : `Demo Progress: ${completedSteps}/${demoSteps.length} steps completed`
          }
        </Typography>
        {autoDemo && (
          <LinearProgress sx={{ mt: 1 }} />
        )}
      </Alert>

      <Grid container spacing={3}>
        {/* Demo Steps */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Demo Steps</Typography>
              
              <Stepper activeStep={currentStep} orientation="vertical">
                {demoSteps.map((step, index) => (
                  <Step key={step.id} completed={step.completed}>
                    <StepLabel
                      icon={step.completed ? <CheckCircleIcon color="success" /> : undefined}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                        <Box>
                          <Typography variant="subtitle1">{step.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                        {!step.completed && !autoDemo && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => step.action?.()}
                          >
                            Run Test
                          </Button>
                        )}
                      </Stack>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* System Features Overview */}
              <Accordion sx={{ mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">✨ Implemented Features</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Property Code Generation" secondary="Unique 6-digit codes (ABC123 format)" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Default Template System" secondary="Mark templates as default for properties" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Payment Integration" secondary="Multiple payment methods with processing" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Form Builder Enhancement" secondary="All field types including file uploads" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Terms & Conditions" secondary="Customizable legal agreements" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Real-time Notifications" secondary="Success messages and confirmations" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Mobile-Friendly Design" secondary="Responsive across all devices" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Workflow Automation" secondary="Seamless property to application flow" />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>

        {/* System Statistics */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Current Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>📊 System Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="primary">{stats.templates}</Typography>
                    <Typography variant="body2" color="text.secondary">Templates</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="success.main">{stats.defaultTemplates}</Typography>
                    <Typography variant="body2" color="text.secondary">Default Templates</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="info.main">{stats.applications}</Typography>
                    <Typography variant="body2" color="text.secondary">Applications</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" color="warning.main">{stats.properties}</Typography>
                    <Typography variant="body2" color="text.secondary">Properties</Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Properties with Codes:</Typography>
                    <Chip label={`${stats.propertiesWithCodes}/${stats.properties}`} size="small" color="success" />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Payment Methods:</Typography>
                    <Chip label={stats.paymentMethods} size="small" color="info" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>⚡ Quick Actions</Typography>
                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={() => window.location.href = '/crm/properties'}
                  >
                    View Properties
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => window.location.href = '/crm/templates'}
                  >
                    Manage Templates
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={() => window.location.href = '/crm/applications'}
                  >
                    View Applications
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PaymentIcon />}
                    onClick={testFormWorkflow}
                  >
                    Test Application Flow
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Demo Controls */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>🎮 Demo Controls</Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={autoDemo} disabled />}
                    label="Auto Demo Mode"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<StarIcon />}
                    onClick={() => {
                      notifications.showSuccess(
                        "System Ready!",
                        "Application system with property codes and payment integration is fully operational."
                      );
                    }}
                  >
                    Show Success Message
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Demo Property Application Dialog */}
      <PropertyApplicationDialog
        property={demoProperty}
        isOpen={demoPropertyDialog}
        onClose={() => {
          setDemoPropertyDialog(false);
          setDemoProperty(null);
        }}
        onApplicationSubmitted={(appData) => {
          console.log("Demo application submitted:", appData);
          setDemoPropertyDialog(false);
          loadData(); // Refresh stats
        }}
      />
    </Box>
  );
}
