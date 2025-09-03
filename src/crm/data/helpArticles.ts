import { HelpCategory, HelpArticle } from './helpTypes';

// Import platform integration help data
import { 
  platformIntegrationCategories, 
  platformIntegrationArticles, 
  platformQuickActions 
} from './realEstatePlatformHelp';

// Original categories
const originalCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Essential guides to help you set up and begin using your CRM",
    iconName: "HelpRounded",
    color: "#1976d2",
    articleCount: 12,
    popularTags: ["setup", "onboarding", "basics", "first-time"],
    featured: true,
  },
  {
    id: "dashboard",
    title: "Dashboard & Navigation",
    description: "Understanding your dashboard, navigation, and core interface features",
    iconName: "Dashboard",
    color: "#9c27b0",
    articleCount: 8,
    popularTags: ["dashboard", "navigation", "interface", "widgets"],
  },
  {
    id: "properties",
    title: "Property Management",
    description: "Managing properties, listings, and property-related features",
    iconName: "HomeRounded",
    color: "#2e7d32",
    articleCount: 18,
    popularTags: ["properties", "listings", "management", "rental"],
    featured: true,
  },
  {
    id: "tenants",
    title: "Tenant Management",
    description: "Managing tenants, leases, communications, and relationships",
    iconName: "PersonRounded",
    color: "#ed6c02",
    articleCount: 22,
    popularTags: ["tenants", "leases", "communication", "applications"],
    featured: true,
  },
  {
    id: "payments",
    title: "Payments & Financial",
    description: "Payment processing, financial management, and rent collection",
    iconName: "PaymentRounded",
    color: "#d32f2f",
    articleCount: 19,
    popularTags: ["payments", "financial", "rent", "billing", "ach", "security"],
  },
  {
    id: "maintenance",
    title: "Maintenance & Work Orders",
    description: "Managing maintenance requests, work orders, and service providers",
    iconName: "BuildRounded",
    color: "#f57c00",
    articleCount: 12,
    popularTags: ["maintenance", "work-orders", "repairs", "contractors"],
  },
  {
    id: "communications",
    title: "Communications & Marketing",
    description: "Email marketing, SMS, communications, and tenant engagement",
    iconName: "EmailRounded",
    color: "#7b1fa2",
    articleCount: 16,
    popularTags: ["email", "sms", "marketing", "communication"],
  },
  {
    id: "integrations",
    title: "Integrations & Email Setup",
    description: "Setting up email, API integrations, and external services",
    iconName: "IntegrationInstructionsRounded",
    color: "#0288d1",
    articleCount: 20,
    popularTags: ["email", "integration", "api", "oauth", "setup"],
    featured: true,
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    description: "Generating reports, analytics, and business insights",
    iconName: "AssessmentRounded",
    color: "#388e3c",
    articleCount: 10,
    popularTags: ["reports", "analytics", "insights", "data"],
  },
  {
    id: "calendar",
    title: "Calendar & Tasks",
    description: "Managing your calendar, scheduling, and task management",
    iconName: "CalendarTodayRounded",
    color: "#1565c0",
    articleCount: 9,
    popularTags: ["calendar", "tasks", "scheduling", "appointments"],
  },
  {
    id: "bookkeeping",
    title: "Bookkeeping & Accounting",
    description: "Connect and configure accounting software (QuickBooks, Xero, Sage) and manage financial sync",
    iconName: "AccountBalanceRounded",
    color: "#0b8043",
    articleCount: 6,
    popularTags: ["bookkeeping", "quickbooks", "xero", "reconciliation", "accounting"],
    featured: true,
  },
  {
    id: "power-tools",
    title: "Power Tools & AI",
    description: "Advanced tools, AI features, and productivity enhancements",
    iconName: "SmartToy",
    color: "#6a1b9a",
    articleCount: 8,
    popularTags: ["power-tools", "ai", "automation", "productivity"],
  },
  {
    id: "security",
    title: "Security & Admin",
    description: "User roles, permissions, security settings, and advanced features",
    iconName: "SecurityRounded",
    color: "#c62828",
    articleCount: 14,
    popularTags: ["security", "admin", "permissions", "roles"],
  },
];

// Original articles
const originalArticles: HelpArticle[] = [
  // Getting Started Articles
  {
    id: "getting-started-overview",
    title: "Getting Started with Your Property Management CRM",
    summary: "Complete guide to setting up and beginning to use your property management system",
    content: [
      "Welcome to your comprehensive property management CRM system",
      "Start by completing your company profile in Settings → Company Information",
      "Add your first property using the Properties → Add Property button",
      "Set up your team members and assign appropriate roles in User Roles",
      "Configure basic integrations like email for automated communications",
      "Explore the dashboard to understand key metrics and quick actions",
      "Use the onboarding checklist to ensure you don't miss any important setup steps"
    ],
    category: "getting-started",
    tags: ["setup", "onboarding", "first-time", "overview"],
    difficulty: "Beginner",
    readTime: "8 min",
    helpful: 156,
    lastUpdated: "2024-01-20",
    planRequired: "Basic"
  },
  {
    id: "first-property-setup",
    title: "Adding Your First Property",
    summary: "Step-by-step guide to adding and configuring your first property in the system",
    content: [
      "Navigate to Properties from the main menu",
      "Click the 'Add Property' button in the top right",
      "Enter basic property information: address, type, and description",
      "Set rental amount, security deposit, and property details",
      "Upload high-quality photos to showcase your property",
      "Configure availability status and listing preferences",
      "Save the property and review the auto-generated property code",
      "Set up property-specific settings like late fees and lease terms"
    ],
    category: "getting-started",
    tags: ["properties", "setup", "first-time", "configuration"],
    difficulty: "Beginner",
    readTime: "6 min",
    helpful: 124,
    lastUpdated: "2024-01-18"
  },
  {
    id: "user-roles-setup",
    title: "Setting Up User Roles and Permissions",
    summary: "How to add team members and configure appropriate access levels",
    content: [
      "Go to User Roles from the admin menu",
      "Review the default roles: Super Admin, Property Manager, and Tenant",
      "Create custom roles based on your team structure",
      "Assign specific permissions for each role (view, edit, delete)",
      "Add team members by clicking 'Add User' and selecting their role",
      "Set up property-specific access for property managers",
      "Configure financial permissions for accounting team members",
      "Test role permissions by logging in as different user types"
    ],
    category: "getting-started",
    tags: ["users", "roles", "permissions", "team", "setup"],
    difficulty: "Intermediate",
    readTime: "10 min",
    helpful: 98,
    lastUpdated: "2024-01-16",
    planRequired: "Professional"
  },

  // Dashboard Articles
  {
    id: "dashboard-overview",
    title: "Understanding Your Dashboard",
    summary: "Complete guide to navigating and customizing your main dashboard",
    content: [
      "The dashboard provides a comprehensive overview of your property portfolio",
      "Key metrics widgets show occupancy rates, revenue, and important alerts",
      "Recent activity timeline keeps you updated on all system changes",
      "Quick action buttons provide fast access to common tasks",
      "Customize widget layout by dragging and dropping to preferred positions",
      "Use filters to focus on specific properties or date ranges",
      "Set up dashboard notifications for important events and deadlines"
    ],
    category: "dashboard",
    tags: ["dashboard", "overview", "metrics", "navigation"],
    difficulty: "Beginner",
    readTime: "5 min",
    helpful: 89,
    lastUpdated: "2024-01-19"
  },
  {
    id: "navigation-tips",
    title: "Mastering CRM Navigation",
    summary: "Tips and shortcuts for efficient navigation throughout the system",
    content: [
      "Use the main sidebar menu for accessing primary sections",
      "Utilize keyboard shortcuts: Ctrl+K for global search, Ctrl+/ for help",
      "Bookmark frequently used pages in your browser",
      "Use the breadcrumb navigation to understand your current location",
      "Access recent items through the user menu dropdown",
      "Pin important properties or tenants for quick access",
      "Use the global search to quickly find any record in the system"
    ],
    category: "dashboard",
    tags: ["navigation", "shortcuts", "efficiency", "tips"],
    difficulty: "Beginner",
    readTime: "4 min",
    helpful: 76,
    lastUpdated: "2024-01-17"
  },

  // Property Management Articles
  {
    id: "property-listing-management",
    title: "Managing Property Listings",
    summary: "How to create, edit, and manage property listings for marketing",
    content: [
      "Access the Listings section from the Properties menu",
      "Create listings for available properties with detailed descriptions",
      "Upload professional photos and virtual tour links",
      "Set pricing, availability dates, and lease terms",
      "Configure application requirements and screening criteria",
      "Publish listings to property websites and marketing channels",
      "Track listing performance and inquiry statistics",
      "Update listing status when properties are rented"
    ],
    category: "properties",
    tags: ["listings", "marketing", "availability", "publishing"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 134,
    lastUpdated: "2024-01-15"
  },
  {
    id: "property-financial-tracking",
    title: "Property Financial Management",
    summary: "Comprehensive guide to tracking property finances and generating reports",
    content: [
      "Track all property income including rent, fees, and additional charges",
      "Record expenses such as maintenance, repairs, and property management costs",
      "Generate financial reports for individual properties or portfolios",
      "Monitor rent collection rates and identify delinquent accounts",
      "Set up automated late fees and payment reminders",
      "Export financial data for accounting software integration",
      "Use analytics to identify profitable properties and improvement opportunities"
    ],
    category: "properties",
    tags: ["financial", "tracking", "reports", "income", "expenses"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 91,
    lastUpdated: "2024-01-10",
    planRequired: "Professional"
  },
  {
    id: "property-groups-management",
    title: "Organizing Properties with Groups",
    summary: "How to create and manage property groups for efficient organization",
    content: [
      "Create property groups to organize similar properties",
      "Group by location, property type, or management responsibility",
      "Assign colors and icons to groups for visual identification",
      "Use groups for targeted marketing campaigns and announcements",
      "Generate group-specific reports and analytics",
      "Set group-wide policies for rent increases and lease terms",
      "Manage multiple property managers across different groups"
    ],
    category: "properties",
    tags: ["groups", "organization", "management", "portfolios"],
    difficulty: "Intermediate",
    readTime: "6 min",
    helpful: 67,
    lastUpdated: "2024-01-12"
  },

  // Tenant Management Articles
  {
    id: "tenant-application-process",
    title: "Managing Tenant Applications",
    summary: "Step-by-step guide to processing and managing rental applications",
    content: [
      "Applications can be received through property landing pages and direct submissions",
      "Review applications in the Applications section with filtering and sorting options",
      "Verify applicant information including employment, references, and credit history",
      "Use built-in scoring and evaluation tools to compare applicants",
      "Approve applications and automatically convert prospects to tenants",
      "Send automated notification emails for application status updates",
      "Track all application communication in the activity timeline"
    ],
    category: "tenants",
    tags: ["applications", "tenants", "screening", "approval", "process"],
    difficulty: "Intermediate",
    readTime: "7 min",
    helpful: 94,
    lastUpdated: "2024-01-12"
  },
  {
    id: "tenant-communication-management",
    title: "Effective Tenant Communication",
    summary: "Best practices for communicating with tenants and tracking interactions",
    content: [
      "Use the Communications section to send emails and SMS messages",
      "Track all communication history in tenant activity timelines",
      "Set up automated messages for rent reminders and important notices",
      "Create message templates for common communications",
      "Use the NewsBoard for property-wide announcements",
      "Enable two-way SMS communication for quick tenant responses",
      "Schedule follow-up communications and set reminders"
    ],
    category: "tenants",
    tags: ["communication", "messaging", "automation", "engagement"],
    difficulty: "Beginner",
    readTime: "6 min",
    helpful: 112,
    lastUpdated: "2024-01-14"
  },
  {
    id: "lease-management",
    title: "Managing Leases and Lease Renewals",
    summary: "Complete guide to creating, managing, and renewing tenant leases",
    content: [
      "Create new leases when approving tenant applications",
      "Set lease terms including duration, rent amount, and special conditions",
      "Configure automatic lease renewal notifications and processes",
      "Track lease expiration dates and plan for renewals early",
      "Generate lease documents and obtain digital signatures",
      "Manage lease amendments and modifications during tenancy",
      "Set up rent increase schedules and lease term adjustments"
    ],
    category: "tenants",
    tags: ["leases", "renewals", "contracts", "agreements"],
    difficulty: "Intermediate",
    readTime: "9 min",
    helpful: 103,
    lastUpdated: "2024-01-11",
    planRequired: "Professional"
  },
  {
    id: "tenant-screening-process",
    title: "Comprehensive Tenant Screening Guide",
    summary: "How to effectively screen potential tenants using integrated tools",
    content: [
      "Use TransUnion integration for credit reports and background checks",
      "Verify employment and income documentation",
      "Contact previous landlords and personal references",
      "Review application completeness and accuracy",
      "Use scoring algorithms to rank and compare applicants",
      "Document screening decisions for compliance and audit trails",
      "Set up automated screening workflows for efficiency"
    ],
    category: "tenants",
    tags: ["screening", "background-checks", "verification", "compliance"],
    difficulty: "Advanced",
    readTime: "12 min",
    helpful: 87,
    lastUpdated: "2024-01-09",
    planRequired: "Enterprise",
    superAdminOnly: true
  },

  // Payment & Financial Articles
  {
    id: "bank-account-connection",
    title: "Connecting Bank Accounts for ACH Payments",
    summary: "Step-by-step guide to securely connect tenant bank accounts for seamless rent payments",
    content: [
      "Navigate to Rent Collection → Payment Methods → Connect Bank Account",
      "Choose between Plaid integration (instant verification) or manual micro-deposits",
      "For Plaid: Search and select your bank, then sign in securely through bank portal",
      "For micro-deposits: Enter account details and verify small deposits within 1-2 business days",
      "Bank connections use bank-level encryption and are PCI DSS compliant",
      "Connected accounts support ACH payments with 1-3 business day processing",
      "Set daily and monthly payment limits for enhanced security",
      "View all connected bank accounts in Bank Account Management section"
    ],
    category: "payments",
    tags: ["bank-accounts", "ach", "plaid", "verification", "security"],
    difficulty: "Beginner",
    readTime: "8 min",
    helpful: 0,
    lastUpdated: "2024-01-20",
    planRequired: "Professional"
  },
  {
    id: "enhanced-payment-processing",
    title: "Enhanced Payment Processing & ACH",
    summary: "Understanding ACH payments, processing fees, and payment routing",
    content: [
      "ACH payments offer lower fees compared to credit cards (typically $0.50-$1.50 vs 2.9%)",
      "Payments are automatically routed to your configured business bank account",
      "Processing times: ACH 1-3 business days, Cards instantly",
      "Payment status tracking: Pending → Processing → Completed or Failed",
      "Automatic retry logic for failed payments with smart scheduling",
      "Enhanced fraud detection analyzes payment patterns and risk factors",
      "Real-time payment notifications via email and SMS",
      "Comprehensive payment history and transaction reporting available"
    ],
    category: "payments",
    tags: ["ach", "processing", "fees", "routing", "fraud-detection"],
    difficulty: "Intermediate",
    readTime: "7 min",
    helpful: 0,
    lastUpdated: "2024-01-20",
    planRequired: "Professional"
  },
  {
    id: "payment-security-compliance",
    title: "Payment Security & PCI Compliance",
    summary: "Understanding our enterprise-grade security measures for payment processing",
    content: [
      "All payment data is encrypted using AES-256 encryption",
      "System maintains PCI DSS compliance with regular security audits",
      "Advanced fraud detection monitors for suspicious payment patterns",
      "Rate limiting prevents automated attacks and excessive payment attempts",
      "Real-time security monitoring with automated threat response",
      "Bank account verification prevents unauthorized account usage",
      "All payment activities are logged for compliance and audit trails",
      "Two-factor authentication recommended for payment-related actions"
    ],
    category: "payments",
    tags: ["security", "pci-compliance", "encryption", "fraud-detection", "compliance"],
    difficulty: "Intermediate",
    readTime: "6 min",
    helpful: 0,
    lastUpdated: "2024-01-20",
    planRequired: "Professional"
  },
  {
    id: "business-bank-account-setup",
    title: "Setting Up Business Bank Accounts",
    summary: "Configure business bank accounts for receiving rent payments and managing cash flow",
    content: [
      "Navigate to Settings → Bank Account Settings → Business Accounts",
      "Add business bank accounts where rent payments will be deposited",
      "Configure primary and secondary accounts for payment routing",
      "Set up payment routing rules based on property type or payment amount",
      "Monitor business account balances and transaction history",
      "Configure daily and monthly receiving limits for enhanced security",
      "Set up automated bank reconciliation with accounting software",
      "Review bank connection status and payment processing schedules"
    ],
    category: "payments",
    tags: ["business-banking", "routing", "reconciliation", "cash-flow"],
    difficulty: "Advanced",
    readTime: "9 min",
    helpful: 0,
    lastUpdated: "2024-01-20",
    planRequired: "Professional"
  },
  {
    id: "payment-system-testing",
    title: "Payment System Testing & Validation",
    summary: "How to run comprehensive tests to ensure your payment system is secure and functional",
    content: [
      "Access Payment System Tests from Power Tools → System Tests",
      "Run Bank Account Management tests to verify connection and verification flows",
      "Execute Payment Processing tests for ACH and card payment functionality",
      "Validate Security Features including fraud detection and encryption",
      "Test PCI Compliance validation and security monitoring systems",
      "Review Integration Flows to ensure bookkeeping sync works correctly",
      "All tests include detailed results with pass/fail status and recommendations",
      "Run tests after any configuration changes or before going live"
    ],
    category: "payments",
    tags: ["testing", "validation", "security", "compliance", "verification"],
    difficulty: "Advanced",
    readTime: "10 min",
    helpful: 0,
    lastUpdated: "2024-01-20",
    planRequired: "Professional"
  },
  {
    id: "rent-collection-setup",
    title: "Setting Up Automated Rent Collection",
    summary: "Configure automated rent collection and payment processing systems",
    content: [
      "Connect payment processors like Stripe for credit card processing",
      "Set up ACH bank transfers for lower-cost payment options",
      "Configure automatic payment schedules for recurring rent",
      "Create payment portals for tenants to make online payments",
      "Set up late fee calculations and automatic application",
      "Configure payment reminder emails and SMS notifications",
      "Generate payment receipts and transaction records automatically"
    ],
    category: "payments",
    tags: ["rent-collection", "automation", "payments", "processing"],
    difficulty: "Intermediate",
    readTime: "10 min",
    helpful: 145,
    lastUpdated: "2024-01-16",
    planRequired: "Professional"
  },
  {
    id: "financial-reporting",
    title: "Generating Financial Reports",
    summary: "Create comprehensive financial reports for properties and portfolios",
    content: [
      "Access the Reports section for various financial report options",
      "Generate income statements for individual properties or portfolios",
      "Create rent roll reports showing all tenant payment information",
      "Export cash flow reports for accounting and tax purposes",
      "Set up scheduled reports to be emailed automatically",
      "Customize report date ranges and filtering options",
      "Use analytics to identify trends and optimization opportunities"
    ],
    category: "payments",
    tags: ["reporting", "financial", "analytics", "statements"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 78,
    lastUpdated: "2024-01-13"
  },
  {
    id: "late-fee-management",
    title: "Managing Late Fees and Delinquent Accounts",
    summary: "Best practices for handling late payments and fee collection",
    content: [
      "Configure automatic late fee policies for consistent application",
      "Set up grace periods and late fee calculation methods",
      "Use automated reminders before and after late fees are applied",
      "Track delinquent accounts and payment plan negotiations",
      "Generate notices and legal documents for eviction processes",
      "Maintain detailed payment history for legal compliance",
      "Create payment plans for tenants experiencing hardship"
    ],
    category: "payments",
    tags: ["late-fees", "delinquent", "collections", "policies"],
    difficulty: "Advanced",
    readTime: "11 min",
    helpful: 89,
    lastUpdated: "2024-01-08",
    planRequired: "Professional"
  },
  {
    id: "payment-troubleshooting",
    title: "Troubleshooting Payment & Bank Connection Issues",
    summary: "Common payment problems and how to resolve them quickly",
    content: [
      "Bank verification failed: Check account and routing numbers, ensure account is active",
      "ACH payment declined: Verify sufficient funds and account permissions",
      "Micro-deposit verification: Allow 1-2 business days, check for small deposits",
      "Payment stuck in processing: ACH payments take 1-3 business days to complete",
      "Bank connection expired: Re-authenticate through Plaid or update credentials",
      "Payment routing issues: Verify business bank account configuration",
      "Security blocks: Review fraud detection alerts and contact support if needed",
      "For persistent issues, use the Security Monitoring Dashboard to check system status"
    ],
    category: "payments",
    tags: ["troubleshooting", "bank-issues", "verification", "support"],
    difficulty: "Intermediate",
    readTime: "6 min",
    helpful: 0,
    lastUpdated: "2024-01-20",
    planRequired: "Professional"
  },

  // Maintenance & Work Orders Articles
  {
    id: "work-order-management",
    title: "Creating and Managing Work Orders",
    summary: "Complete guide to work order creation, assignment, and tracking",
    content: [
      "Create work orders for maintenance requests and repairs",
      "Assign work orders to internal staff or external service providers",
      "Set priority levels and expected completion timeframes",
      "Track work order status from creation to completion",
      "Upload photos and documentation before and after repairs",
      "Generate cost estimates and track actual expenses",
      "Send notifications to tenants about maintenance scheduling"
    ],
    category: "maintenance",
    tags: ["work-orders", "maintenance", "repairs", "tracking"],
    difficulty: "Beginner",
    readTime: "7 min",
    helpful: 156,
    lastUpdated: "2024-01-17"
  },
  {
    id: "service-provider-management",
    title: "Managing Service Providers",
    summary: "How to add, manage, and work with external service providers",
    content: [
      "Add service providers to your vendor database",
      "Track contact information, specialties, and service areas",
      "Rate and review service providers based on work quality",
      "Set up preferred provider lists for different types of work",
      "Manage service provider insurance and licensing requirements",
      "Send work orders directly to service providers via email",
      "Track payment and invoicing for contracted services"
    ],
    category: "maintenance",
    tags: ["service-providers", "vendors", "contractors", "management"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 92,
    lastUpdated: "2024-01-15"
  },
  {
    id: "preventive-maintenance",
    title: "Setting Up Preventive Maintenance Schedules",
    summary: "Create recurring maintenance schedules to prevent costly repairs",
    content: [
      "Identify routine maintenance tasks for each property type",
      "Set up recurring work orders for scheduled maintenance",
      "Create seasonal maintenance checklists and reminders",
      "Track maintenance costs and budget planning",
      "Schedule annual inspections and safety checks",
      "Maintain warranty information and service records",
      "Use analytics to identify maintenance patterns and trends"
    ],
    category: "maintenance",
    tags: ["preventive", "scheduling", "recurring", "planning"],
    difficulty: "Intermediate",
    readTime: "9 min",
    helpful: 73,
    lastUpdated: "2024-01-12",
    planRequired: "Professional"
  },

  // Communications & Marketing Articles
  {
    id: "email-marketing-campaigns",
    title: "Creating Email Marketing Campaigns",
    summary: "Build and send targeted email campaigns to tenants and prospects",
    content: [
      "Access Email Marketing from the communications menu",
      "Create targeted email lists based on tenant status and property",
      "Design professional emails using built-in templates",
      "Personalize emails with tenant and property information",
      "Schedule campaigns for optimal delivery times",
      "Track open rates, click rates, and engagement metrics",
      "Set up automated email sequences for new tenants"
    ],
    category: "communications",
    tags: ["email-marketing", "campaigns", "templates", "automation"],
    difficulty: "Intermediate",
    readTime: "10 min",
    helpful: 118,
    lastUpdated: "2024-01-14"
  },
  {
    id: "sms-communication",
    title: "SMS Communication and Notifications",
    summary: "Set up and manage SMS messaging for instant tenant communication",
    content: [
      "Configure SMS settings and phone number verification",
      "Send individual SMS messages to tenants",
      "Create SMS templates for common communications",
      "Set up automated SMS notifications for important events",
      "Track SMS delivery rates and response analytics",
      "Manage opt-in/opt-out preferences for tenants",
      "Use SMS for emergency notifications and urgent updates"
    ],
    category: "communications",
    tags: ["sms", "notifications", "messaging", "automation"],
    difficulty: "Beginner",
    readTime: "6 min",
    helpful: 94,
    lastUpdated: "2024-01-16"
  },
  {
    id: "newsboard-announcements",
    title: "Using NewsBoard for Property Announcements",
    summary: "Create and manage property-wide announcements and news updates",
    content: [
      "Access NewsBoard to create property announcements",
      "Target announcements to specific properties or groups",
      "Schedule announcements for future publication",
      "Include images, links, and formatting in announcements",
      "Track announcement views and engagement",
      "Set expiration dates for time-sensitive announcements",
      "Send announcement notifications via email and SMS"
    ],
    category: "communications",
    tags: ["newsboard", "announcements", "notifications", "property-wide"],
    difficulty: "Beginner",
    readTime: "5 min",
    helpful: 67,
    lastUpdated: "2024-01-18"
  },

  // Integration Articles
  {
    id: "email-integration-setup",
    title: "Email Integration Setup Overview",
    summary: "Complete guide to setting up email integration for automated emails and password resets",
    content: [
      "Email integration enables automated password resets and professional email communication",
      "Supported providers include Gmail, Outlook, Yahoo, Hotmail, and custom SMTP servers",
      "OAuth authentication provides enhanced security for Gmail and Outlook",
      "App passwords are required for Yahoo Mail integration",
      "Configure your provider in Integrations → Add Integration → Email Provider",
      "Test your connection in Email Management after setup",
      "All email activity is tracked for monitoring and compliance"
    ],
    category: "integrations",
    tags: ["email", "integration", "setup", "oauth", "automation"],
    difficulty: "Beginner",
    readTime: "5 min",
    helpful: 98,
    lastUpdated: "2024-01-15",
    planRequired: "Basic"
  },
  {
    id: "gmail-integration",
    title: "Setting Up Gmail Integration",
    summary: "Step-by-step guide to configure Gmail with OAuth authentication",
    content: [
      "Go to Integrations → Add Integration and select Gmail",
      "Enter your Gmail address and display name",
      "For custom OAuth, add your Google Client ID (optional)",
      "Click Add Integration to initialize the connection",
      "Complete OAuth authentication when sending first email",
      "SMTP Settings: smtp.gmail.com:587 with TLS security",
      "Test connection in Email Management section"
    ],
    category: "integrations",
    tags: ["gmail", "oauth", "email", "google", "smtp"],
    difficulty: "Beginner",
    readTime: "6 min",
    helpful: 112,
    lastUpdated: "2024-01-14"
  },
  {
    id: "outlook-integration",
    title: "Microsoft Outlook Integration Setup",
    summary: "Configure Microsoft Outlook for email integration with Office 365 support",
    content: [
      "Navigate to Integrations and select Microsoft Outlook",
      "Enter your Outlook email and display name",
      "Configure OAuth settings or use default authentication",
      "Complete Office 365 OAuth flow for secure access",
      "SMTP Configuration: smtp-mail.outlook.com:587 (TLS)",
      "IMAP Configuration: outlook.office365.com:993 (SSL)",
      "Verify connection and test email sending functionality"
    ],
    category: "integrations",
    tags: ["outlook", "microsoft", "office365", "oauth", "email"],
    difficulty: "Beginner",
    readTime: "7 min",
    helpful: 89,
    lastUpdated: "2024-01-13"
  },
  {
    id: "api-integrations",
    title: "Setting Up API Integrations",
    summary: "Connect external services using API keys and webhooks",
    content: [
      "Access Integration Management for API configuration",
      "Generate API keys with specific permission scopes",
      "Configure webhook endpoints for real-time data sync",
      "Set up integrations with accounting software (QuickBooks, Xero)",
      "Connect marketing platforms (Mailchimp, HubSpot)",
      "Configure payment gateway integrations",
      "Monitor API usage and webhook success rates"
    ],
    category: "integrations",
    tags: ["api", "webhooks", "external", "automation"],
    difficulty: "Advanced",
    readTime: "12 min",
    helpful: 56,
    lastUpdated: "2024-01-10",
    planRequired: "Enterprise"
  },

  // Calendar & Tasks Articles
  {
    id: "calendar-management",
    title: "Using the Calendar and Task System",
    summary: "Comprehensive guide to managing your calendar, appointments, and tasks",
    content: [
      "Access the Calendar from the main menu for scheduling overview",
      "Switch between day, week, and month views for different perspectives",
      "Create events, appointments, and tasks directly from the calendar",
      "Set reminders and notifications for important deadlines",
      "Assign tasks to team members and track completion status",
      "Use color coding to categorize different types of activities",
      "Sync with external calendars like Google Calendar and Outlook"
    ],
    category: "calendar",
    tags: ["calendar", "scheduling", "tasks", "appointments"],
    difficulty: "Beginner",
    readTime: "8 min",
    helpful: 134,
    lastUpdated: "2024-01-16"
  },
  {
    id: "task-automation",
    title: "Automating Recurring Tasks",
    summary: "Set up automated recurring tasks and workflows",
    content: [
      "Create recurring tasks for routine property management activities",
      "Set up automatic task assignment based on property or tenant events",
      "Configure task templates for common workflows",
      "Use task dependencies to create sequential workflows",
      "Set up notifications and reminders for task deadlines",
      "Track task completion rates and team productivity",
      "Generate reports on task performance and bottlenecks"
    ],
    category: "calendar",
    tags: ["automation", "recurring", "workflows", "productivity"],
    difficulty: "Intermediate",
    readTime: "9 min",
    helpful: 78,
    lastUpdated: "2024-01-12",
    planRequired: "Professional"
  },

  // Power Tools & AI Articles
  {
    id: "power-tools-overview",
    title: "Introduction to Power Tools Suite",
    summary: "Overview of advanced tools for enhanced productivity and automation",
    content: [
      "Power Tools provides advanced features for property management efficiency",
      "QR-it: Generate custom QR codes for property marketing and tracking",
      "Win-it: Create prize campaigns and tenant engagement programs",
      "Pool-it: Organize group buying and bulk purchasing opportunities",
      "Power Dialer: Professional calling interface with call management",
      "Access Power Tools from the main menu or Marketplace",
      "Each tool includes analytics and customization options"
    ],
    category: "power-tools",
    tags: ["power-tools", "productivity", "automation", "features"],
    difficulty: "Intermediate",
    readTime: "6 min",
    helpful: 92,
    lastUpdated: "2024-01-18",
    planRequired: "Professional"
  },
  {
    id: "ai-assistant-usage",
    title: "Using AI Assistant Features",
    summary: "Leverage AI tools for improved efficiency and decision making",
    content: [
      "Access AI Tools from the main menu for intelligent assistance",
      "Use AI for generating property descriptions and marketing content",
      "Get smart suggestions for tenant communication and responses",
      "Use AI scheduling assistant for optimal appointment timing",
      "Leverage AI for lease renewal and pricing recommendations",
      "Get automated insights and property performance analysis",
      "Configure AI preferences and customization settings"
    ],
    category: "power-tools",
    tags: ["ai", "assistant", "automation", "intelligence"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 74,
    lastUpdated: "2024-01-15",
    planRequired: "Enterprise"
  },

  // Security & Admin Articles
  {
    id: "super-admin-features",
    title: "Super Admin Advanced Features",
    summary: "Exclusive features and capabilities available to Super Administrator users",
    content: [
      "Access to all system settings and global configurations",
      "Manage user roles and permissions across the entire platform",
      "View and manage TransUnion integration for credit reports and background checks",
      "Configure advanced security settings and access controls",
      "Set up white-label branding and custom domain configuration",
      "Access detailed system analytics and user activity logs",
      "Manage backup and restore operations for data protection",
      "Configure enterprise integrations and API access"
    ],
    category: "security",
    tags: ["super-admin", "advanced", "permissions", "security", "enterprise"],
    difficulty: "Advanced",
    readTime: "12 min",
    helpful: 89,
    lastUpdated: "2024-01-08",
    planRequired: "Enterprise",
    superAdminOnly: true
  },
  {
    id: "security-best-practices",
    title: "Security Best Practices",
    summary: "Essential security practices for protecting your property management data",
    content: [
      "Use strong, unique passwords for all user accounts",
      "Enable two-factor authentication for enhanced security",
      "Regularly review and update user permissions",
      "Monitor user activity logs for suspicious behavior",
      "Keep software and integrations updated to latest versions",
      "Configure data backup and recovery procedures",
      "Train team members on security awareness and phishing prevention"
    ],
    category: "security",
    tags: ["security", "best-practices", "protection", "compliance"],
    difficulty: "Intermediate",
    readTime: "10 min",
    helpful: 103,
    lastUpdated: "2024-01-11"
  },
  {
    id: "data-backup-recovery",
    title: "Data Backup and Recovery",
    summary: "How to backup your data and recover from potential data loss",
    content: [
      "Access Backup Management from the admin settings",
      "Configure automatic daily backups of all system data",
      "Create manual backups before major system changes",
      "Store backups in secure, encrypted cloud storage",
      "Test backup integrity and restoration procedures regularly",
      "Document recovery procedures for emergency situations",
      "Maintain backup retention policies for compliance requirements"
    ],
    category: "security",
    tags: ["backup", "recovery", "data-protection", "emergency"],
    difficulty: "Advanced",
    readTime: "11 min",
    helpful: 67,
    lastUpdated: "2024-01-09",
    planRequired: "Enterprise"
  },

  // Reports & Analytics Articles
  {
    id: "analytics-overview",
    title: "Understanding Analytics and Insights",
    summary: "How to use analytics to make data-driven property management decisions",
    content: [
      "Access Analytics & Insights for comprehensive data analysis",
      "Review occupancy rates and trends across your portfolio",
      "Analyze revenue performance by property and time period",
      "Track tenant acquisition costs and marketing effectiveness",
      "Monitor maintenance costs and identify cost optimization opportunities",
      "Use predictive analytics for vacancy forecasting",
      "Generate custom dashboards for specific business metrics"
    ],
    category: "reports",
    tags: ["analytics", "insights", "data", "performance"],
    difficulty: "Intermediate",
    readTime: "9 min",
    helpful: 85,
    lastUpdated: "2024-01-13",
    planRequired: "Professional"
  },
  {
    id: "custom-reports",
    title: "Creating Custom Reports",
    summary: "Build custom reports tailored to your specific business needs",
    content: [
      "Use the Reports section to access report building tools",
      "Select data sources including properties, tenants, and financial records",
      "Choose from various report formats: tables, charts, and dashboards",
      "Apply filters and date ranges to focus on specific data sets",
      "Schedule reports to be generated and emailed automatically",
      "Export reports in PDF, Excel, and CSV formats",
      "Share reports with team members and stakeholders"
    ],
    category: "reports",
    tags: ["custom-reports", "reporting", "data", "automation"],
    difficulty: "Intermediate",
    readTime: "7 min",
    helpful: 91,
    lastUpdated: "2024-01-12"
  },

  // Bookkeeping & Accounting Articles
  {
    id: "bookkeeping-overview",
    title: "Bookkeeping & Accounting Integrations Overview",
    summary: "Overview of how to connect your CRM to accounting software (QuickBooks, Xero, Sage) and what to expect from syncs",
    content: [
      "This CRM supports direct integrations with QuickBooks Online, Xero, Sage, FreshBooks, Wave and Zoho Books.",
      "Supported features include invoices, payments, customers, journal entries, bank transactions, and financial reports.",
      "Connect by navigating to Integrations → Bookkeeping Integrations ��� Connect Provider. Use OAuth for QuickBooks and Xero, and provide Company/Organization IDs when requested.",
      "Configure sync frequency (real_time/hourly/daily/weekly/manual) and sync direction (CRM → Bookkeeping, Bookkeeping → CRM, or bidirectional).",
      "Map CRM transaction types (rent, fees, expenses) to your bookkeeping account codes using the Account Mappings setting in the connection configuration.",
      "Use the Test Connection button before enabling the integration and review reconciliation logs for any sync errors."
    ],
    category: "bookkeeping",
    tags: ["bookkeeping", "quickbooks", "xero", "integration", "setup", "account-mapping"],
    difficulty: "Intermediate",
    readTime: "6 min",
    helpful: 0,
    lastUpdated: "2024-01-20"
  },
  {
    id: "quickbooks-setup",
    title: "Setting Up QuickBooks Online Integration",
    summary: "Step-by-step guide to connecting QuickBooks Online with OAuth authentication",
    content: [
      "Navigate to Integrations → Bookkeeping Integrations and click 'Add Integration'",
      "Select 'QuickBooks Online' from the provider list",
      "You'll need your QuickBooks Company ID (found in QuickBooks under Settings → Company)",
      "Click 'Test Connection' to start the OAuth authentication process",
      "Sign in to your QuickBooks account and authorize the connection",
      "Configure account mappings: map Rent Income to your rental income account",
      "Set Security Deposits to your liability account for deposits",
      "Map Late Fees to your fee income account",
      "Choose your preferred sync frequency (daily recommended for automated workflows)",
      "Enable the integration and perform a test sync to verify everything works"
    ],
    category: "bookkeeping",
    tags: ["quickbooks", "oauth", "setup", "authentication", "company-id"],
    difficulty: "Intermediate",
    readTime: "8 min",
    helpful: 0,
    lastUpdated: "2024-01-20"
  },
  {
    id: "xero-setup",
    title: "Setting Up Xero Accounting Integration",
    summary: "Complete guide to connecting Xero with your property management CRM",
    content: [
      "Go to Integrations → Bookkeeping Integrations and select 'Add Integration'",
      "Choose 'Xero' from the available providers",
      "You'll need your Xero Organization ID (found in Settings → General Settings)",
      "Click 'Test Connection' to begin OAuth authentication with Xero",
      "Authorize the application in your Xero account when prompted",
      "Set up account mappings in the configuration step:",
      "Map rent income to your rental income tracking category",
      "Set up security deposit handling with appropriate liability accounts",
      "Configure late fee and maintenance expense account mappings",
      "Choose sync frequency and direction based on your workflow needs",
      "Test the connection and run a sample sync to verify data flows correctly"
    ],
    category: "bookkeeping",
    tags: ["xero", "oauth", "organization-id", "setup", "configuration"],
    difficulty: "Intermediate",
    readTime: "7 min",
    helpful: 0,
    lastUpdated: "2024-01-20"
  },
  {
    id: "account-mappings-guide",
    title: "Configuring Account Mappings for Bookkeeping",
    summary: "Detailed guide on mapping CRM transactions to accounting software accounts",
    content: [
      "Account mappings ensure CRM transactions sync to the correct accounts in your bookkeeping software.",
      "Rent Income Account: Map to your primary rental income account (typically 4000-4999 range)",
      "Security Deposit Account: Use a current liability account to track tenant deposits",
      "Late Fee Account: Map to a separate income account for fees and penalties",
      "Maintenance Expense Account: Use your property maintenance/repair expense account",
      "Bank Account: Select the checking account where rent payments are deposited",
      "Accounts Receivable: Map to your AR account for tracking outstanding tenant balances",
      "You can find account codes in your bookkeeping software's Chart of Accounts",
      "Test mappings with a small transaction before enabling full synchronization",
      "Update mappings if you reorganize your chart of accounts in your bookkeeping system"
    ],
    category: "bookkeeping",
    tags: ["account-mapping", "chart-of-accounts", "configuration", "sync", "financial"],
    difficulty: "Advanced",
    readTime: "10 min",
    helpful: 0,
    lastUpdated: "2024-01-20"
  },
  {
    id: "sync-troubleshooting",
    title: "Troubleshooting Bookkeeping Sync Issues",
    summary: "Common sync problems and how to resolve them quickly",
    content: [
      "If sync fails, first check the connection status in Bookkeeping Management",
      "Test the connection using the 'Test Connection' button to verify credentials",
      "Common issues include expired OAuth tokens - re-authenticate if needed",
      "Check that account codes in your mappings still exist in your bookkeeping software",
      "Verify you have the required permissions in QuickBooks/Xero for creating transactions",
      "Review error messages in the reconciliation dialog for specific failure reasons",
      "Duplicate transactions may indicate timing issues - check sync frequency settings",
      "For OAuth errors, try disconnecting and reconnecting the integration",
      "Contact support if sync errors persist after checking these common causes"
    ],
    category: "bookkeeping",
    tags: ["troubleshooting", "sync-errors", "oauth", "connection", "support"],
    difficulty: "Intermediate",
    readTime: "5 min",
    helpful: 0,
    lastUpdated: "2024-01-20"
  },
  {
    id: "reconciliation-best-practices",
    title: "Bookkeeping Reconciliation Best Practices",
    summary: "How to maintain accurate financial records with automated bookkeeping sync",
    content: [
      "Review reconciliation reports monthly to catch any sync discrepancies",
      "Use the reconciliation dialog to compare CRM transactions with bookkeeping entries",
      "Set up daily or weekly sync frequency for timely financial record updates",
      "Create a backup of your bookkeeping data before making major configuration changes",
      "Monitor the sync status dashboard regularly for any failed transactions",
      "Keep your CRM and bookkeeping software chart of accounts aligned",
      "Document any manual journal entries made outside the CRM system",
      "Run financial reports from both systems monthly to verify consistency",
      "Train team members on proper transaction entry to maintain data quality"
    ],
    category: "bookkeeping",
    tags: ["reconciliation", "best-practices", "financial-reports", "data-quality"],
    difficulty: "Intermediate",
    readTime: "6 min",
    helpful: 0,
    lastUpdated: "2024-01-20"
  }
,
  {
    id: "tenant-move-out-with-balance",
    title: "Handling Move-Out with Outstanding Balance",
    summary: "How to move out a tenant who still owes money, record payments after move-out, and where to find these records in the CRM",
    content: [
      "Open Tenants → select the tenant → Manage Tenants → Terminate Lease. Set the move-out date, reason, and any final charges. Confirm to move the tenant to Past Tenant status.",
      "After termination, the remaining balance is preserved in the tenant’s ledger as a past-tenant balance. You’ll see it on the tenant’s detail page under Financials → Outstanding Balance.",
      "To record a payment after move-out: go to the same tenant’s detail page and click Record Payment. Enter the amount, method, and a note (e.g., ‘Move-out balance’), then save.",
      "Recorded payments appear immediately in the tenant’s Payment History and reduce the Outstanding Balance. Partial payments are supported.",
      "Where to review balances: use Rent Collection to see tenants with outstanding amounts, and the tenant’s Outstanding Charges list for itemized entries. Past-tenant balances are visible even after move-out.",
      "Accounting: if bookkeeping is connected, these payments sync to your accounting system based on your mapping. Use Bookkeeping Integration settings to review mappings."
    ],
    category: "tenants",
    tags: ["move-out", "past-tenants", "payments", "ledger", "collections"],
    difficulty: "Beginner",
    readTime: "6 min",
    helpful: 0,
    lastUpdated: "2025-09-03"
  }
];

// Export merged categories and articles
export const helpCategories: HelpCategory[] = [
  ...platformIntegrationCategories,
  ...originalCategories
];

export const helpArticles: HelpArticle[] = [
  ...platformIntegrationArticles,
  ...originalArticles
];

export const quickActions = [
  { label: "Getting Started", tag: "setup", color: "primary" },
  { label: "Email Setup", tag: "email", color: "info" },
  { label: "Property Management", tag: "properties", color: "success" },
  { label: "Tenant Applications", tag: "applications", color: "warning" },
  { label: "Payment Processing", tag: "payments", color: "secondary" },
  { label: "Bank Account Setup", tag: "bank-accounts", color: "info" },
  { label: "Bookkeeping Setup", tag: "bookkeeping", color: "success" },
  { label: "Work Orders", tag: "work-orders", color: "error" },
  { label: "Calendar & Tasks", tag: "calendar", color: "primary" },
  { label: "Power Tools", tag: "power-tools", color: "secondary" },
  ...platformQuickActions,
];
