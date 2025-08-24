import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useRoleManagement } from "../hooks/useRoleManagement";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Properties" | "Tenants" | "Payments" | "Maintenance" | "Reports" | "Security" | "Integrations";
  tags: string[];
  helpful: number;
  planRequired?: "Basic" | "Professional" | "Enterprise" | "Custom";
  isAdvanced?: boolean;
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  planRequired?: "Basic" | "Professional" | "Enterprise" | "Custom";
  isPremium?: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdDate: string;
  lastUpdate: string;
}

const mockFAQs: FAQItem[] = [
  {
    id: "email-integration-overview",
    question: "How do I set up email integration for sending automated emails and password resets?",
    answer: "**Email Integration Overview**: The CRM now supports comprehensive email integration with multiple providers for automated email sending, password resets, and marketing campaigns. **🔧 Supported Email Providers**: **Gmail** - OAuth authentication for secure access, SMTP: smtp.gmail.com:587 (TLS), IMAP: imap.gmail.com:993 (SSL), Requires OAuth setup for enhanced security. **Microsoft Outlook** - OAuth authentication with Office 365 support, SMTP: smtp-mail.outlook.com:587 (TLS), IMAP: outlook.office365.com:993 (SSL), Full integration with Microsoft Graph API. **Yahoo Mail** - App password authentication (recommended), SMTP: smtp.mail.yahoo.com:587 (TLS), IMAP: imap.mail.yahoo.com:993 (SSL), POP: pop.mail.yahoo.com:995 (SSL), Requires app password generation. **Hotmail/Live** - Password authentication, SMTP: smtp.live.com:587 (TLS), IMAP: imap-mail.outlook.com:993 (SSL), POP: pop3.live.com:995 (SSL). **Custom SMTP** - Configure any SMTP server, Custom host and port settings, Support for TLS/SSL encryption, Flexible authentication options. **🚀 Quick Setup**: 1) Go to **Integrations** → **Add Integration**, 2) Select your email provider (Gmail, Outlook, Yahoo, etc.), 3) Follow provider-specific setup instructions, 4) Test connection and start sending emails, 5) Access **Email Management** for testing and monitoring. **📧 Features**: Automated password reset emails, Professional email templates, Real-time sending status, Connection testing, Email statistics and monitoring, Template management with variables.",
    category: "Integrations",
    tags: ["email", "integration", "gmail", "outlook", "yahoo", "hotmail", "smtp", "oauth", "automation", "setup"],
    helpful: 98,
    planRequired: "Basic"
  },
  {
    id: "gmail-integration-setup",
    question: "How do I set up Gmail integration with OAuth authentication?",
    answer: "**Gmail Integration Setup**: Gmail uses OAuth for secure authentication without storing passwords. **📋 Step-by-Step Setup**: **Step 1: Add Gmail Integration** - Go to **CRM** → **Integrations**, Click **Add Integration**, Select **Gmail - Email Provider**, Enter your Gmail address (e.g., your.email@gmail.com), Add display name (your name or company name). **Step 2: OAuth Configuration (Optional)** - For custom OAuth apps, enter your Google Client ID, Most users can skip this and use default OAuth, Advanced users can create custom Google Cloud projects. **Step 3: Complete Setup** - Click **Add Integration**, The system will mark Gmail as added but disconnected, OAuth authentication will be required when sending first email. **🔧 Server Configuration**: **SMTP Settings**: Host: smtp.gmail.com, Port: 587, Security: TLS, **IMAP Settings**: Host: imap.gmail.com, Port: 993, Security: SSL. **⚠️ Important Notes**: OAuth authentication provides enhanced security, No passwords stored in the system, Requires Google account permissions, Two-factor authentication compatible. **🧪 Testing**: Go to **Email Management** to test the connection, Send test emails to verify functionality, Monitor connection status and email statistics.",
    category: "Integrations",
    tags: ["gmail", "oauth", "authentication", "google", "email", "setup", "smtp", "imap", "security"],
    helpful: 95,
    planRequired: "Basic"
  },
  {
    id: "outlook-integration-setup",
    question: "How do I configure Microsoft Outlook email integration?",
    answer: "**Microsoft Outlook Integration**: Set up Outlook with OAuth for Office 365 and Exchange support. **📋 Setup Process**: **Step 1: Integration Setup** - Navigate to **Integrations** → **Add Integration**, Select **Microsoft Outlook - Email Provider**, Enter your Outlook email (e.g., user@company.com), Provide display name for sender identification. **Step 2: OAuth Configuration** - For custom apps, enter Microsoft App Client ID, Standard users can use default OAuth settings, Enterprise users may need custom Azure app registration. **Step 3: Authentication** - Complete OAuth flow when sending first email, Grant necessary permissions for email sending, System will handle token refresh automatically. **🔧 Technical Details**: **SMTP Configuration**: Host: smtp-mail.outlook.com, Port: 587, Security: TLS, **IMAP Configuration**: Host: outlook.office365.com, Port: 993, Security: SSL. **🏢 Enterprise Features**: Full Office 365 integration, Exchange server support, Advanced security compliance, Shared mailbox support (with proper permissions). **✅ Verification**: Test connection in **Email Management**, Send sample emails to verify setup, Monitor delivery status and statistics.",
    category: "Integrations",
    tags: ["outlook", "microsoft", "office365", "oauth", "exchange", "email", "integration", "smtp", "enterprise"],
    helpful: 93,
    planRequired: "Basic"
  },
  {
    id: "yahoo-integration-setup",
    question: "How do I set up Yahoo Mail with app password authentication?",
    answer: "**Yahoo Mail Integration**: Yahoo requires app passwords for enhanced security instead of your regular password. **📋 Setup Instructions**: **Step 1: Generate App Password** - Log into your Yahoo account, Go to **Account Security** → **App Passwords**, Click **Generate app password**, Select **Other** and name it 'CRM Integration', Copy the 16-character app password. **Step 2: Add to CRM** - Go to **Integrations** → **Add Integration**, Select **Yahoo Mail - Email Provider**, Enter your Yahoo email address, Add your display name, **Paste the app password** (not your regular password). **Step 3: Complete Setup** - Click **Add Integration**, System will test connection automatically, Verify status shows 'Connected'. **🔧 Server Settings**: **SMTP Configuration**: Host: smtp.mail.yahoo.com, Port: 587, Security: TLS, **IMAP Configuration**: Host: imap.mail.yahoo.com, Port: 993, Security: SSL, **POP Configuration**: Host: pop.mail.yahoo.com, Port: 995, Security: SSL. **🔒 Security Notes**: App passwords are more secure than regular passwords, Each app should have its own unique app password, You can revoke app passwords anytime in Yahoo settings, Two-factor authentication must be enabled for app passwords. **🧪 Testing**: Use **Email Management** to send test emails, Verify delivery and connection status, Monitor email statistics and performance.",
    category: "Integrations",
    tags: ["yahoo", "app-password", "authentication", "security", "email", "smtp", "imap", "setup", "yahoo-mail"],
    helpful: 91,
    planRequired: "Basic"
  },
  {
    id: "hotmail-integration-setup",
    question: "How do I configure Hotmail/Live email integration?",
    answer: "**Hotmail/Live Integration**: Set up Microsoft Hotmail or Live email accounts with password authentication. **📋 Configuration Steps**: **Step 1: Add Integration** - Navigate to **Integrations** → **Add Integration**, Select **Hotmail/Live - Email Provider**, Enter your Hotmail/Live email address, Provide display name for identification. **Step 2: Authentication** - Enter your account password (not an app password), System will verify credentials automatically, Connection will be tested immediately. **Step 3: Verification** - Confirm status shows 'Connected', Test email sending functionality. **🔧 Technical Configuration**: **SMTP Settings**: Host: smtp.live.com, Port: 587, Security: TLS, **IMAP Settings**: Host: imap-mail.outlook.com, Port: 993, Security: SSL, **POP Settings**: Host: pop3.live.com, Port: 995, Security: SSL. **⚠️ Security Considerations**: Regular password authentication (less secure than OAuth), Ensure account has strong password, Monitor for any suspicious activity, Consider using Outlook integration for enhanced security if available. **📧 Features Available**: Send automated emails, Password reset functionality, Template-based messaging, Real-time delivery monitoring. **🧪 Testing & Monitoring**: Access **Email Management** for testing, Send test emails to verify functionality, Monitor connection status and statistics, Troubleshoot any delivery issues.",
    category: "Integrations",
    tags: ["hotmail", "live", "microsoft", "password", "authentication", "email", "smtp", "imap", "setup"],
    helpful: 88,
    planRequired: "Basic"
  },
  {
    id: "custom-smtp-integration",
    question: "How do I configure custom SMTP server integration for any email provider?",
    answer: "**Custom SMTP Integration**: Configure any email provider or custom mail server that supports SMTP. **📋 Setup Process**: **Step 1: Gather Server Information** - SMTP server hostname (e.g., smtp.yourcompany.com), Port number (usually 587 for TLS, 465 for SSL, 25 for plain), Security type (TLS, SSL, or None), Username and password for authentication, Optional: IMAP settings for receiving emails. **Step 2: Add Integration** - Go to **Integrations** → **Add Integration**, Select **Custom SMTP - Email Provider**, Enter your email address, Provide display name. **Step 3: Configure SMTP Settings** - **SMTP Host**: Enter server hostname, **SMTP Port**: Enter port number (default: 587), **Username**: Usually your email address, **Password**: Your email account password, **Security**: Select TLS, SSL, or None. **Step 4: Optional IMAP Configuration** - **IMAP Host**: For receiving emails, **IMAP Port**: Usually 993 for SSL, 143 for plain. **🔧 Common Configurations**: **Google Workspace**: smtp.gmail.com:587 (TLS), **Microsoft 365**: smtp.office365.com:587 (TLS), **GoDaddy**: smtpout.secureserver.net:25, **Zoho**: smtp.zoho.com:587 (TLS), **AWS SES**: email-smtp.region.amazonaws.com:587. **✅ Testing & Verification**: Click **Test Connection** after setup, Send test email to verify functionality, Monitor connection status in **Email Management**, Troubleshoot any authentication or connectivity issues. **�� Security Best Practices**: Use TLS/SSL encryption when available, Store credentials securely, Use app-specific passwords when supported, Monitor for unusual activity.",
    category: "Integrations",
    tags: ["custom", "smtp", "server", "configuration", "email", "hosting", "security", "tls", "ssl", "setup"],
    helpful: 89,
    planRequired: "Professional",
    isAdvanced: true
  },
  {
    id: "email-management-dashboard",
    question: "How do I use the Email Management dashboard to monitor and test email functionality?",
    answer: "**Email Management Dashboard**: Comprehensive tool for monitoring, testing, and managing your email integrations. **📊 Dashboard Overview**: Access via **CRM** → **Email Management**, View all configured email accounts, Monitor connection status and statistics, Test email functionality and troubleshoot issues. **📧 Email Accounts Tab**: **Account Status Monitoring** - Connection status (Connected, Disconnected, Error), Last sync time and frequency settings, Provider information and authentication type, Error messages and troubleshooting info. **Account Management** - Test connections with one click, Delete accounts that are no longer needed, View account details and settings. **🧪 Send Test Email**: Click **Send Test Email** button, Select email account to send from, Enter recipient email address, Customize subject and message, Send and monitor delivery status. **📝 Templates Tab**: **Template Management** - View all email templates (Password Reset, Welcome, etc.), Create new custom templates, Edit existing templates with variables, Preview templates before using. **Template Features** - Variable support ({{userName}}, {{tempPassword}}, etc.), Category organization (Transactional, Marketing, System), Active/inactive status management. **📈 Email Statistics**: **Performance Metrics** - Total emails sent and delivery rates, Open rates and click rates (when supported), Bounce rates and error statistics, Account-specific performance data. **Real-time Monitoring** - Live delivery status updates, Connection health monitoring, Error alerts and notifications. **🔧 Troubleshooting Tools**: Connection testing for each account, Detailed error messages and solutions, Email sending logs and history, Support for debugging delivery issues.",
    category: "Integrations",
    tags: ["email-management", "dashboard", "monitoring", "testing", "statistics", "templates", "troubleshooting", "status"],
    helpful: 96,
    planRequired: "Basic"
  },
  {
    id: "email-templates-variables",
    question: "How do I create and use email templates with dynamic variables?",
    answer: "**Email Templates with Variables**: Create dynamic email templates that automatically populate with user and system data. **📝 Template Creation**: **Access Templates** - Go to **Email Management** → **Templates** tab, Click **New Template** to create custom templates, Choose category: Transactional, Marketing, or System. **Template Builder** - **Template Name**: Descriptive name for identification, **Subject Line**: Use variables for dynamic subjects, **Content**: HTML and text versions supported, **Variables**: Insert dynamic placeholders. **🔧 Available Variables**: **User/Tenant Variables** - {{userName}} - User's display name, {{userEmail}} - User's email address, {{firstName}} - User's first name, {{lastName}} - User's last name. **System Variables** - {{appName}} - Application name (PropCRM), {{currentDate}} - Current date, {{currentTime}} - Current time, {{tempPassword}} - Temporary password (for resets). **Property Variables** - {{propertyName}} - Property name, {{propertyAddress}} - Property address, {{monthlyRent}} - Rental amount, {{leaseStart}} - Lease start date. **📧 Built-in Templates**: **Password Reset Template** - Subject: 'Reset Your Password - {{appName}}', Variables: {{userName}}, {{tempPassword}}, {{appName}}, Professional styling with security warnings. **Welcome Email Template** - Subject: 'Welcome to {{appName}}!', Variables: {{userName}}, {{userEmail}}, {{appName}}, Branded welcome message with getting started info. **🎨 Template Features**: **Rich Text Editing** - HTML and plain text versions, Professional styling and formatting, Mobile-responsive design, Brand customization options. **Variable Preview** - See how variables will appear, Test with sample data, Preview before sending. **Template Management** - Active/inactive status control, Usage tracking and analytics, Duplicate templates for customization, Export/import for backup. **💡 Best Practices**: Use descriptive template names, Test templates with real data before production use, Keep both HTML and text versions, Use appropriate variables for personalization, Follow email best practices for deliverability.",
    category: "Integrations",
    tags: ["templates", "variables", "dynamic", "personalization", "email", "automation", "password-reset", "welcome"],
    helpful: 94,
    planRequired: "Basic"
  },
  {
    id: "password-reset-email-automation",
    question: "How does the automated password reset email system work?",
    answer: "**Automated Password Reset System**: The CRM now sends professional password reset emails automatically instead of opening mailto links. **🔄 How It Works**: **Automatic Detection** - When user requests password reset, system checks for configured email accounts, If email accounts available, sends professional email automatically, If no accounts configured, falls back to mailto link as backup. **Email Account Selection** - Uses first active and connected email account, Prioritizes accounts with 'connected' status, Automatically handles authentication and sending. **📧 Email Content**: **Professional Template** - Uses built-in 'Password Reset' template, Professional HTML styling with security warnings, Mobile-responsive design, Clear instructions for next steps. **Dynamic Variables** - {{userName}} - Extracted from email address, {{tempPassword}} - Randomly generated secure password, {{appName}} - PropCRM branding, Customizable template content. **🔒 Security Features**: **Secure Password Generation** - Random 8-character passwords, Includes letters and numbers, Immediate replacement recommended, Temporary validity. **Professional Messaging** - Clear security warnings, Instructions to change password immediately, Contact information for suspicious activity, Branded company information. **📋 Setup Requirements**: **Email Integration Required** - At least one email provider configured (Gmail, Outlook, Yahoo, etc.), Active connection status, Proper authentication (OAuth, app password, etc.). **Template Customization** - Edit password reset template in **Email Management**, Customize branding and messaging, Add company-specific information. **🧪 Testing Password Reset**: **Test Process** - Go to login page and click 'Forgot Password', Enter email address of configured user, Check email delivery and formatting, Verify temporary password works. **Troubleshooting** - If emails not sending, check email account connection status, Verify email provider configuration, Check **Email Management** for error messages, Ensure user email exists in system. **⚙️ Configuration Options**: Access email settings via **Integrations** → Email Providers, Monitor email delivery in **Email Management**, Customize templates for company branding, Set up multiple email accounts for redundancy.",
    category: "Integrations",
    tags: ["password-reset", "automation", "email", "security", "templates", "integration", "authentication", "forgot-password"],
    helpful: 97,
    planRequired: "Basic"
  },
  {
    id: "email-integration-troubleshooting",
    question: "How do I troubleshoot common email integration issues and connection problems?",
    answer: "**Email Integration Troubleshooting**: Comprehensive guide to diagnosing and fixing email integration issues. **🔍 Common Issues & Solutions**: **Connection Problems** - **Symptoms**: Status shows 'Disconnected' or 'Error', **Solutions**: Verify credentials are correct, Check if account password changed, Ensure two-factor authentication is properly configured, Test network connectivity. **Authentication Failures** - **OAuth Issues**: Re-authorize OAuth permissions, Check if OAuth app credentials expired, Verify redirect URLs are configured, Clear browser cache and cookies. **Password Authentication**: Verify password is correct, For Yahoo: ensure app password is used (not regular password), Check if account is locked or suspended. **📧 Email Sending Failures**: **SMTP Errors** - Verify SMTP server settings (host, port, security), Check authentication credentials, Ensure TLS/SSL settings match provider requirements, Test with different port numbers if needed. **Rate Limiting** - Some providers limit sending frequency, Wait and retry sending, Consider multiple email accounts for higher volume, Check provider-specific limits. **🔧 Diagnostic Steps**: **Step 1: Check Integration Status** - Go to **Email Management** → **Email Accounts**, Review connection status for each account, Look for error messages or last sync times. **Step 2: Test Connection** - Click **Test Connection** for problematic accounts, Review detailed error messages, Follow provider-specific troubleshooting steps. **Step 3: Verify Credentials** - Double-check email addresses and passwords, Ensure OAuth permissions are granted, Verify app passwords for Yahoo accounts. **Step 4: Check Provider Settings** - Confirm SMTP/IMAP server settings, Verify port numbers and security settings, Check for provider-specific requirements. **🛠️ Provider-Specific Troubleshooting**: **Gmail Issues** - Ensure 'Less secure app access' is enabled (if not using OAuth), Check Google account security settings, Verify OAuth app permissions. **Outlook/Hotmail** - Verify Microsoft account security settings, Check for account verification requirements, Ensure modern authentication is enabled. **Yahoo Issues** - Must use app passwords (not regular password), Verify two-factor authentication is enabled, Check app password generation settings. **Custom SMTP** - Verify server hostname and port, Check authentication method requirements, Test with email client first (like Outlook). **📊 Monitoring & Maintenance**: **Regular Monitoring** - Check **Email Management** dashboard regularly, Monitor delivery rates and error statistics, Set up alerts for connection failures. **Credential Management** - Rotate passwords regularly, Update OAuth tokens when expired, Monitor for suspicious account activity. **🆘 When to Contact Support**: Persistent connection failures after following troubleshooting steps, Provider-specific authentication issues, Need help with custom SMTP configuration, Questions about enterprise email setup. **Support Information** - Access via **Help & Support** → **Contact Support**, Provide specific error messages and account details, Include steps already attempted, Mention email provider and authentication method used.",
    category: "Integrations",
    tags: ["troubleshooting", "email", "connection", "authentication", "oauth", "smtp", "errors", "debugging", "support"],
    helpful: 92,
    planRequired: "Basic",
    isAdvanced: true
  },
  {
    id: "transunion-integration-setup",
    question: "How do I configure and use the TransUnion integration for tenant screening? (Super Admin Only)",
    answer: "**TransUnion Integration Overview**: TransUnion integration is now visible in the Integration Management page, but only for Super Admins. **Key Features**: • **Super Admin Only Access** - The TransUnion integration only appears for users with the 'Super Admin' role • **Configuration UI** - Added a complete configuration interface for TransUnion API credentials • **Real-time Status** - Shows connection status based on whether valid credentials are configured • **Security Warnings** - Includes appropriate warnings about handling sensitive financial data. **🔧 Configuration Options**: **Option 1: Integration Management Page** - Go to CRM → Integrations (you should see this in the left menu) - Look for the TransUnion integration card with a 🔍 icon - Click the Settings (gear) icon on the TransUnion card - Enter your TransUnion credentials: API Key (Your TransUnion API key), API Secret (Your TransUnion API secret), Environment (Choose 'Sandbox' for testing or 'Production' for live), Base URL (TransUnion API endpoint URL). **Option 2: Environment Variables (Recommended for Production)** - Set these environment variables in your deployment: VITE_TRANSUNION_API_KEY (Your API key), VITE_TRANSUNION_API_SECRET (Your API secret), VITE_TRANSUNION_ENV ('sandbox' or 'production'), VITE_TRANSUNION_BASE_URL (API base URL). **🔒 Security Features**: • **Super Admin Only**: Regular admins and other users cannot see or access TransUnion settings • **Sensitive Data Handling**: API secrets are password-masked in the UI • **Environment Warnings**: Clear warnings about production vs development usage • **Status Indicators**: Shows if the integration is properly configured and connected. **📊 Integration Status**: The TransUnion integration will show: Connected status when valid credentials are configured, Disconnected status when credentials are missing or invalid, Usage metrics for credit reports and background checks, Last sync information. **Important**: In production, API credentials should be stored on your secure backend server, not in the frontend application.",
    category: "Security",
    tags: ["transunion", "integration", "super-admin", "credit-reports", "background-checks", "api", "security", "tenant-screening"],
    helpful: 100,
    planRequired: "Enterprise",
    isAdvanced: true
  },
  {
    id: "document-deletion-permissions",
    question: "How do I delete uploaded documents and what permissions are required?",
    answer: "Document deletion is restricted to authorized users for security: 1) Only Super Admins and users with 'manage_documents' permission can delete documents, 2) Go to Property Details → Documents tab, 3) Click the red delete button (trash icon) next to any document, 4) Confirm deletion in the security dialog, 5) All deletions are logged in the activity timeline with user information and timestamps. Super Admins can assign document deletion permissions to other admin users through the User Roles section. This ensures proper audit trails and prevents accidental data loss.",
    category: "Security",
    tags: ["document", "deletion", "permissions", "security", "admin", "audit"],
    helpful: 97,
    planRequired: "Professional",
    isAdvanced: true
  },
  {
    id: "security-deposit-management",
    question: "How do I add and manage security deposits for properties?",
    answer: "Security deposits are now fully integrated into the property management system: 1) When adding a new property, enter the security deposit amount in the field between Monthly Rent and Square Footage, 2) View deposit information in the Property Details → Financial tab under 'Deposits & Charges Management', 3) Deposits automatically appear in tenant financial records and property ledgers, 4) When tenants move out, deposit refunds and deductions are tracked in their past tenant ledger, 5) All deposit transactions are reflected in financial reports and activity logs. The system supports security deposits, pet deposits, and various fees with full audit trails.",
    category: "Payments",
    tags: ["security", "deposit", "property", "financial", "ledger", "tenant"],
    helpful: 94,
    planRequired: "Basic"
  },
  {
    id: "property-color-persistence",
    question: "How do I customize and save property header colors?",
    answer: "Property header color customization is now persistent across sessions: 1) Open any Property Detail page, 2) Click the 🎨 button in the header, 3) Choose from available color options (Primary Blue, Secondary Pink, Success Green, etc.), 4) Your selection is automatically saved to localStorage and persists when you navigate away, 5) The color applies to all property detail views throughout the system, 6) Colors are saved per browser/device for personalized experience. This helps differentiate properties and improves visual organization of your property portfolio.",
    category: "General",
    tags: ["property", "color", "customization", "header", "persistence", "visual"],
    helpful: 89,
    planRequired: "Basic"
  },
  {
    id: "unlisted-properties-management",
    question: "How does the Unlisted Properties tab work and why don't new properties appear there?",
    answer: "The Unlisted Properties system helps manage property marketing workflow: 1) New properties are automatically created with 'Unlisted' status, 2) They appear in the Unlisted tab under Property Management, 3) Properties remain unlisted until you create a listing for them, 4) Once listed, properties move to 'Listed' status and appear in the Listings tab, 5) The Unlisted tab shows both properties with 'Unlisted' status AND available properties without active listings. If properties aren't appearing, check that they have 'Unlisted' or 'Available' status and don't have existing active listings.",
    category: "Properties",
    tags: ["unlisted", "properties", "listings", "status", "marketing", "workflow"],
    helpful: 92,
    planRequired: "Basic"
  },
  {
    id: "financial-permissions-management",
    question: "What financial permissions are available and how do I assign them?",
    answer: "The system includes comprehensive financial permission controls: 1) Super Admins have 'all' permissions by default, 2) Property Managers can be assigned specific permissions: 'manage_finances', 'delete_charges', 'add_credits', 'view_financial_ledger', 3) Go to User Roles to assign these permissions, 4) 'delete_charges' allows removal of fees and charges from tenant accounts, 5) 'add_credits' permits adding credits and refunds, 6) All financial actions are logged in activity timelines with user attribution. When tenants move out, their financial history becomes read-only in the past tenant ledger while remaining editable by authorized users.",
    category: "Security",
    tags: ["financial", "permissions", "charges", "credits", "ledger", "admin", "roles"],
    helpful: 96,
    planRequired: "Professional",
    isAdvanced: true
  },
  {
    id: "template-editing-enhanced",
    question: "How do I edit rental application templates with the new form builder?",
    answer: "When editing a rental application template: 1) Click 'Edit' on any rental application template, 2) The enhanced editor now shows both rich text content AND form fields, 3) Use the left panel to add pre-built sections (Personal Info, Employment, etc.) or custom fields, 4) The right panel shows a live preview of your form, 5) Auto-save keeps your work safe every 3 seconds, 6) Use 'Preview Application' to see the full form as applicants will see it. The form builder includes drag-and-drop reordering, field validation, and professional styling.",
    category: "Templates",
    tags: ["template", "editing", "form", "builder", "rental", "application"],
    helpful: 95,
    planRequired: "Professional",
    isAdvanced: true
  },
  {
    id: "variables-cheat-sheet",
    question: "How do I use variables in templates and where can I find all available variables?",
    answer: "Variables make your templates dynamic by automatically filling in real data: 1) Click 'Variables Guide' button in Templates section, 2) Browse variables by category (Tenant Info, Property Info, Financial, etc.), 3) Click the copy button next to any variable to copy it (e.g., {TENANT_NAME}), 4) Use variables in any template by wrapping the name in curly braces, 5) Variables work in email templates, rental applications, notices, and all documents. The guide includes examples showing how variables appear in different document types. Over 50+ variables are available covering tenant, property, lease, company, and date information.",
    category: "Templates",
    tags: ["variables", "templates", "dynamic", "content", "personalization"],
    helpful: 92
  },
  {
    id: "payment-methods-expanded",
    question: "What payment methods can I accept for rental application fees?",
    answer: "The system now supports comprehensive payment options: 1) Credit Cards - Secure online processing via Stripe, 2) Debit Cards - Same secure processing, 3) Zelle - Direct bank transfers with custom instructions, 4) CashApp - Mobile payment option, 5) PayPal - Popular digital wallet, 6) Venmo - Social payment platform, 7) Check - Traditional paper checks with payable instructions, 8) Money Order - Secure payment option. You can customize instructions for each method, enable/disable specific options, and set different application fees. All payment settings are configured in the Payment Settings section of the form builder.",
    category: "Payments",
    tags: ["payment", "methods", "fees", "application", "rental", "paypal", "venmo"],
    helpful: 89
  },
  {
    id: "company-branding",
    question: "How do I add my company logo and information to all documents?",
    answer: "To add professional branding: 1) Go to Templates section and click 'Company Info', 2) Upload your company logo (recommended 400x400px), 3) Enter complete company information including name, address, phone, email, website, 4) Add business hours, emergency line, and license numbers, 5) The preview shows exactly how it will appear in documents, 6) Your information automatically appears in all rental applications, templates, and printable documents. This creates a professional appearance and builds trust with tenants. The system supports various image formats and automatically optimizes logo display.",
    category: "General",
    tags: ["company", "logo", "branding", "documents", "professional"],
    helpful: 91
  },
  {
    id: "auto-save-feature",
    question: "How does the auto-save feature work and how do I prevent losing my work?",
    answer: "Auto-save protects your work automatically: 1) When editing templates or forms, auto-save activates every 3 seconds, 2) You'll see a status indicator showing 'Saving...', 'Saved Xs ago', or 'Unsaved changes', 3) Data is saved to your browser's local storage AND the server, 4) If you accidentally close the browser, your work is preserved, 5) The system warns you before leaving pages with unsaved changes, 6) You can manually force a save at any time. Auto-save works for template content, form fields, payment settings, and all editing activities. This prevents data loss from browser crashes, network issues, or accidental navigation.",
    category: "General",
    tags: ["auto", "save", "backup", "data", "loss", "prevention"],
    helpful: 88
  },
  {
    id: "user-preferences-settings",
    question: "How do I customize my CRM experience and save my preferences?",
    answer: "Access User Preferences through Account Settings: 1) Go to Account Settings → 'Open User Preferences', 2) Customize Appearance: theme (light/dark/auto), font size, animations, compact mode, 3) Dashboard Settings: layout (grid/list), card sizes, auto-refresh intervals, 4) Table Preferences: page size, row density, default filters, 5) Notifications: email, SMS, push, desktop alerts, 6) Privacy Settings: analytics sharing, search history, filter memory. All settings automatically save and persist across sessions. You can export/import settings for backup or transfer to other devices, and reset to defaults anytime.",
    category: "General",
    tags: ["preferences", "settings", "customization", "theme", "dashboard"],
    helpful: 90
  },
  {
    id: "landing-page-preview",
    question: "How do I preview landing page templates before using them?",
    answer: "To preview landing page templates: 1) Go to Landing Pages → Templates tab, 2) Each template shows a preview thumbnail and features list, 3) Click 'Preview' button to see a full mockup of how the template will look, 4) The preview shows the template's design, color scheme, layout, and included features, 5) You can see how your property information will be displayed, 6) After previewing, click 'Use This Template' to apply it to a property. The preview includes sample content so you can evaluate the template's style and functionality before committing to use it for your properties.",
    category: "Properties",
    tags: ["landing", "pages", "templates", "preview", "design"],
    helpful: 87
  },
  {
    id: "property-listing-improvements",
    question: "How do the improved property listing features work?",
    answer: "Property listing features have been enhanced: 1) Edit Listing button is now properly enabled only when a listing exists (grayed out otherwise), 2) Duplicate copy buttons have been removed - one functional copy button remains, 3) Share Listing now offers multiple options: copy link, SMS, email, WhatsApp, 4) When sharing, you can choose your preferred method from a menu, 5) All sharing methods include property details, photos, and contact information, 6) The system automatically detects device capabilities for optimal sharing. These improvements make it easier to manage listings and share properties with potential tenants through various channels.",
    category: "Properties",
    tags: ["listing", "sharing", "editing", "properties", "improvements"],
    helpful: 86
  },
  {
    id: "tenant-detail-page",
    question: "How do I access and use the Tenant Detail Page?",
    answer: "To access the Tenant Detail Page: 1) Navigate to the Tenants menu from the main sidebar, 2) Click on any tenant's name in the tenant list. The Tenant Detail Page includes: • Activity Timeline - Shows all calls, messages, and notes with search/filter options • Payment History - View all payments, manually record new payments, and add charges/fees • Documents - Upload and manage tenant documents with categories • Lease Details - View complete lease information and terms. You can also send SMS/Email directly, record call logs, add notes with different types including call log entries, and manage tenant communication preferences.",
    category: "Tenants",
    tags: ["tenant", "detail", "page", "navigation", "activity", "timeline"],
    helpful: 92
  },
  {
    id: "advanced-reporting-analytics",
    question: "How do I access advanced reporting and custom analytics dashboards?",
    answer: "Advanced reporting features: 1) Navigate to Reports & Analytics section, 2) Access Premium Reports tab for advanced insights, 3) Create custom dashboards with drag-and-drop widgets, 4) Export detailed financial reports, occupancy trends, and marketing performance, 5) Set up automated report scheduling and email delivery, 6) Use predictive analytics for vacancy forecasting and revenue optimization. Enterprise features include multi-property comparisons, ROI tracking, and integration with external accounting systems.",
    category: "Reports",
    tags: ["analytics", "reporting", "dashboard", "premium", "forecasting"],
    helpful: 94,
    planRequired: "Enterprise",
    isAdvanced: true
  },
  {
    id: "white-label-customization",
    question: "How do I set up white-label branding for my property management company?",
    answer: "White-label customization allows complete brand control: 1) Upload custom logos, color schemes, and fonts, 2) Customize tenant-facing portals with your branding, 3) Create custom domain mapping (yourcompany.property-portal.com), 4) Modify email templates with your brand identity, 5) Add custom CSS for advanced styling, 6) Configure custom privacy policies and terms of service. This feature makes the platform appear as your own proprietary software to tenants and clients.",
    category: "General",
    tags: ["white-label", "branding", "customization", "domain", "portal"],
    helpful: 89,
    planRequired: "Enterprise",
    isAdvanced: true
  },
  {
    id: "api-integrations-webhooks",
    question: "How do I set up API integrations and webhook connections?",
    answer: "API and webhook setup for enterprise integrations: 1) Access Developer Settings in Account Settings, 2) Generate API keys with specific permission scopes, 3) Configure webhook endpoints for real-time data sync, 4) Integrate with accounting software (QuickBooks, Xero), 5) Connect to marketing platforms (Mailchimp, HubSpot), 6) Set up payment gateway integrations, 7) Use REST API documentation for custom integrations. Enterprise support includes dedicated API assistance and custom endpoint development.",
    category: "Security",
    tags: ["api", "webhooks", "integrations", "developer", "enterprise"],
    helpful: 91,
    planRequired: "Enterprise",
    isAdvanced: true
  },
  {
    id: "mailchimp-integration-setup",
    question: "How do I set up Mailchimp integration for email marketing?",
    answer: "Setting up Mailchimp integration: 1) Go to Integration Management from the admin menu, 2) Click 'Add Integration' and select 'Mailchimp - Email Marketing', 3) Get your API key from Mailchimp: Account → Extras → API keys, 4) Enter your API key and default List ID, 5) Choose sync frequency (Real-time, Hourly, Daily, Weekly, or Manual), 6) Click 'Add Integration' to connect, 7) Test the connection using the sync button. Once connected, tenant contacts will automatically sync with your Mailchimp lists, and you can create targeted email campaigns directly from the CRM.",
    category: "Integrations",
    tags: ["mailchimp", "email", "marketing", "api", "sync", "contacts"],
    helpful: 88
  },
  {
    id: "stripe-payment-integration",
    question: "How do I configure Stripe payment processing integration?",
    answer: "Stripe integration setup: 1) Navigate to Integration Management, 2) Click 'Add Integration' → 'Stripe - Payment Processing', 3) From your Stripe Dashboard, get: Publishable key (pk_live_...), Secret key (sk_live_...), and Webhook secret, 4) Enter these credentials in the configuration form, 5) Set up webhook endpoints in Stripe Dashboard pointing to your CRM webhook URL, 6) Test the integration with a small transaction, 7) Configure payment methods and fees. This enables automatic payment processing, subscription billing, and real-time payment notifications in your CRM.",
    category: "Integrations",
    tags: ["stripe", "payments", "billing", "webhooks", "transactions"],
    helpful: 92
  },
  {
    id: "encharge-email-automation",
    question: "How do I set up Encharge.io for advanced email automation?",
    answer: "Encharge.io integration for lifecycle marketing: 1) Go to Integration Management and add 'Encharge.io - Email Automation', 2) Get your API key from Encharge.io → Settings → API & Webhooks, 3) Enter your API key and Account ID in the configuration, 4) Set sync frequency based on your campaign needs, 5) Map tenant lifecycle events to Encharge automation triggers, 6) Configure customer journey workflows in Encharge, 7) Test with sample data. This enables sophisticated email automation based on tenant behavior, lease status, and payment history.",
    category: "Integrations",
    tags: ["encharge", "automation", "lifecycle", "journey", "campaigns"],
    helpful: 86
  },
  {
    id: "webhook-management-guide",
    question: "How do I manage webhooks for real-time integrations?",
    answer: "Webhook management for real-time data sync: 1) Access Webhooks from Integration Management, 2) Click 'Add Webhook' and configure: Name, URL endpoint, Events to monitor (property.created, payment.success, etc.), 3) Set webhook secret for security, 4) Configure headers for authentication, 5) Test webhooks using the test button, 6) Monitor success rates and troubleshoot failures, 7) Use webhook logs to debug issues. Common events include tenant actions, payment updates, work order changes, and application submissions. Webhooks enable instant data sharing with external systems.",
    category: "Integrations",
    tags: ["webhooks", "realtime", "events", "monitoring", "endpoints"],
    helpful: 89
  },
  {
    id: "api-key-security-management",
    question: "How do I securely manage API keys and access permissions?",
    answer: "API key security best practices: 1) Generate API keys from Integration Management → API Keys, 2) Set specific permissions (read, write, admin) for each key, 3) Use different keys for different integrations/purposes, 4) Set expiration dates for enhanced security, 5) Monitor usage counts and activity, 6) Rotate keys regularly (quarterly recommended), 7) Revoke compromised keys immediately, 8) Never expose keys in frontend code or public repositories, 9) Use environment variables for key storage, 10) Monitor for unusual API activity. Each key includes usage tracking and can be revoked instantly if needed.",
    category: "Integrations",
    tags: ["api", "security", "keys", "permissions", "monitoring", "rotation"],
    helpful: 94,
    isAdvanced: true
  },
  {
    id: "google-drive-document-storage",
    question: "How do I configure Google Drive integration for document storage?",
    answer: "Google Drive integration setup: 1) In Integration Management, add 'Google Drive - Cloud Storage', 2) Create a Google Service Account in Google Cloud Console, 3) Download the service account JSON file, 4) Enter the Service Account Email and target Folder ID, 5) Share the Google Drive folder with the service account email, 6) Test the connection by uploading a document, 7) Configure automatic document categorization. This enables automatic backup of tenant documents, lease agreements, and work order attachments to Google Drive with organized folder structures.",
    category: "Integrations",
    tags: ["google", "drive", "storage", "documents", "backup", "oauth"],
    helpful: 87
  },
  {
    id: "integration-troubleshooting",
    question: "How do I troubleshoot common integration issues and errors?",
    answer: "Integration troubleshooting steps: 1) Check integration status in Integration Management - look for 'Error' status, 2) Review error messages and logs, 3) Verify API credentials haven't expired, 4) Test webhook endpoints manually, 5) Check network connectivity and firewall settings, 6) Validate data formats match expected schemas, 7) Monitor rate limits and quotas, 8) Use test/sandbox modes before production, 9) Review integration documentation for recent API changes, 10) Contact support with specific error codes. Common issues: expired credentials, webhook URL changes, rate limiting, and data validation errors.",
    category: "Integrations",
    tags: ["troubleshooting", "errors", "debugging", "support", "maintenance"],
    helpful: 91,
    isAdvanced: true
  },
  {
    id: "tenant-communication",
    question: "How do I manage tenant communication and activity tracking?",
    answer: "All tenant interactions are automatically tracked in the Activity Timeline: 1) Text Communication - Check if tenant has accepted text communication and send invites if needed, 2) Call Logs - Add call logs through notes with specific call types (Incoming, Outgoing, Missed) and duration, 3) Messages - Send SMS/Email directly from tenant page, all messages appear in timeline, 4) Notes - Add categorized notes (General, Payment, Maintenance, Communication, Legal), 5) Work Orders - All work orders created by tenant appear in activity timeline, 6) Applications - When tenant applications are approved and moved to property, info updates automatically in tenant page.",
    category: "Tenants",
    tags: ["communication", "activity", "tracking", "text", "call", "logs"],
    helpful: 87
  },
  {
    id: "tenant-status-management",
    question: "How do I manage tenant enrollment statuses (Auto Pay, Insurance, Text Communication)?",
    answer: "The Tenant Detail Page shows three key status cards: 1) Text Communication - Shows if tenant has accepted text communication, with option to send invite if not accepted, 2) Auto Pay - Shows enrollment status with option to send enrollment invite with instructions, 3) Tenant Insurance - Shows coverage status with direct link to enroll if not covered, shows expiry date if active. These statuses help you track tenant compliance and engagement with your services.",
    category: "Tenants",
    tags: ["auto", "pay", "insurance", "text", "communication", "enrollment"],
    helpful: 89
  },
  {
    id: "document-upload",
    question: "How do I upload and manage tenant documents?",
    answer: "To upload documents: 1) Go to tenant detail page, 2) Click Documents tab or use Upload Document quick action, 3) Click 'Choose File' button to select document, 4) Select category (Lease, Payment, Legal, Maintenance, Communication, Other), 5) Add optional description, 6) Click Upload Document. All documents show upload date, uploaded by user, file size, and can be downloaded. Documents are automatically timestamped and user-tracked for audit purposes.",
    category: "Tenants",
    tags: ["documents", "upload", "manage", "files", "categories"],
    helpful: 78
  },
  {
    id: "payment-recording",
    question: "How do I manually record rent payments and add charges?",
    answer: "To record payments: 1) From tenant detail page, click 'Record Payment' quick action, 2) Enter amount, select payment method (ACH, Credit Card, Check, Cash, Money Order), 3) Add description and optional transaction ID, 4) Click Record Payment. To add charges: 1) Click 'Add Charge/Fee' quick action, 2) Select charge type (Late Fee, Pet Fee, Damage, Utilities, Other), 3) Enter amount and description, 4) Click Add Charge. All payments and charges appear in Payment History tab.",
    category: "Payments",
    tags: ["payment", "recording", "manual", "charges", "fees"],
    helpful: 85
  },
  {
    id: "property-lease-info",
    question: "How do I view and manage lease information and property assignments?",
    answer: "Lease information is displayed in multiple places: 1) Property card shows lease start and end dates, 2) Lease Details tab shows complete lease information including monthly rent, security deposit, pet deposit, late fee policy, renewal options, and special terms, 3) Use 'Change Property' button to reassign tenant to different property/unit. All lease dates and property assignments are automatically tracked and displayed throughout the system.",
    category: "Properties",
    tags: ["lease", "property", "assignment", "dates", "terms"],
    helpful: 83
  },
  {
    id: "1",
    question: "How do I add a new property to the system?",
    answer: "To add a new property: 1) Navigate to the Properties page from the main menu, 2) Click the 'Add Property' button, 3) Fill in all required information including address, type, and rental details, 4) Upload property photos, 5) Save the property. The property will then be available for tenant assignment.",
    category: "Properties",
    tags: ["properties", "add", "new", "setup"],
    helpful: 45
  },
  {
    id: "2",
    question: "How do I process rent payments?",
    answer: "Rent payments can be processed in several ways: 1) Tenants can pay online through their portal using ACH, debit card, or credit card, 2) Property managers can manually record payments in the Payments section, 3) Set up automatic recurring payments for tenants, 4) All payments are automatically tracked and recorded in the system with receipts sent to tenants.",
    category: "Payments",
    tags: ["payments", "rent", "process", "tenants"],
    helpful: 38
  },
  {
    id: "3",
    question: "How do I assign tenants to properties?",
    answer: "To assign tenants to properties: 1) Go to the Tenants page, 2) Either create a new tenant or select an existing one, 3) In the tenant details, use the 'Assign Property' button, 4) Select the property and unit from the dropdown, 5) Set the lease start date and rental amount, 6) Save the assignment. The tenant will now have access to their tenant portal.",
    category: "Tenants",
    tags: ["tenants", "assign", "properties", "lease"],
    helpful: 42
  },
  {
    id: "4",
    question: "How do I create and manage work orders?",
    answer: "Work orders can be created from: 1) The Maintenance section - click 'Create Work Order', 2) Property details page - use the 'Request Maintenance' button, 3) Tenant portal - tenants can submit requests directly. To manage: assign to service providers, track progress, update status, and communicate with all parties involved.",
    category: "Maintenance",
    tags: ["maintenance", "work orders", "service providers"],
    helpful: 31
  },
  {
    id: "5",
    question: "How do I generate financial reports?",
    answer: "Financial reports can be generated from the Reports section: 1) Click 'Create Report', 2) Select 'Financial' as the report type, 3) Choose your date range, 4) Select format (PDF, Excel, CSV), 5) Configure additional options like charts and detailed data, 6) Generate or schedule the report. Reports include rental income, expenses, past due balances, and profit/loss statements.",
    category: "Reports",
    tags: ["reports", "financial", "income", "generate"],
    helpful: 29
  },
  {
    id: "6",
    question: "How do I reset my password?",
    answer: "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password', 3) Enter your email address, 4) Check your email for the reset link, 5) Click the link and set your new password. If you don't receive the email, check your spam folder or contact support.",
    category: "Security",
    tags: ["password", "reset", "login", "security"],
    helpful: 52
  },
  {
    id: "work-order-integration",
    question: "How do work orders integrate with tenant activity tracking?",
    answer: "Work orders are fully integrated into the tenant activity system: 1) When tenants create work orders through their portal or when you create them on their behalf, they automatically appear in the tenant's Activity Timeline, 2) All work order updates, communications, and status changes are tracked in the timeline, 3) Service provider communications related to work orders also appear in tenant activity, 4) This provides a complete view of all maintenance interactions with each tenant in one centralized location.",
    category: "Maintenance",
    tags: ["work", "orders", "integration", "activity", "timeline"],
    helpful: 91
  },
  {
    id: "power-tools-qr-it",
    question: "How do I use the QR-it tool in Power Tools to create QR codes?",
    answer: "QR-it is a comprehensive QR code generator in Power Tools: 1) Go to Power Tools from the main menu, 2) Click on QR-it tool, 3) Use the 3-step wizard: Content (enter URL, text, contact info, etc.), Design (customize colors, add logos, choose styles), Tracking (enable analytics and lead capture), 4) Preview your QR code before generating, 5) Download, share, or copy the QR code, 6) View detailed analytics including scan counts, locations, devices used, and contact information captured. QR-it supports 12 different content types and provides professional customization options.",
    category: "General",
    tags: ["power", "tools", "qr", "codes", "qr-it", "analytics"],
    helpful: 94
  },
  {
    id: "power-tools-win-it",
    question: "How does the Win-it prize campaign tool work?",
    answer: "Win-it helps you create engaging prize campaigns: 1) Access Win-it through Power Tools, 2) Set up campaigns with prizes, entry methods, and duration, 3) Generate QR codes or links for easy participation, 4) Track participant entries and engagement, 5) Automatically or manually select winners, 6) Send notifications to winners and participants. Win-it is perfect for tenant appreciation events, referral programs, and community engagement initiatives.",
    category: "General",
    tags: ["power", "tools", "win-it", "prizes", "campaigns", "engagement"],
    helpful: 87
  },
  {
    id: "power-tools-pool-it",
    question: "What is Pool-it and how can it help with group purchases?",
    answer: "Pool-it enables group buying and bulk purchasing: 1) Create group buying campaigns for services or products, 2) Set minimum participant requirements and discounts, 3) Allow tenants and properties to join buying groups, 4) Track participation and coordinate bulk orders, 5) Manage distribution and cost savings. Pool-it is ideal for maintenance services, utilities, insurance, and community amenities where group purchasing provides better rates.",
    category: "General",
    tags: ["power", "tools", "pool-it", "group", "buying", "bulk", "purchase"],
    helpful: 85
  },
  {
    id: "power-dialer-keypad",
    question: "How do I use the Power Dialer with the professional keypad?",
    answer: "The Power Dialer provides professional calling capabilities: 1) Access Power Dialer from the main menu, 2) Use the manual dialer with full numerical keypad for direct calling, 3) The keypad includes call/end call buttons, redial, and clear functions, 4) All calls are automatically logged with duration and notes, 5) Integrate with your CRM contacts for one-click calling, 6) Add call notes and follow-up reminders, 7) View call history and analytics. The keypad supports keyboard shortcuts and provides a professional calling experience.",
    category: "General",
    tags: ["power", "dialer", "keypad", "calling", "manual", "professional"],
    helpful: 92
  },
  {
    id: "email-marketing-templates",
    question: "How do I create and preview email marketing templates?",
    answer: "Email marketing has been enhanced with powerful template features: 1) Go to Email Marketing → Templates tab, 2) Browse pre-built templates by category (Welcome, Rent Reminder, Property Showcase, etc.), 3) Click 'Preview' to see full template preview with formatting and styling, 4) Edit templates using the rich text editor with variables, 5) Duplicate templates for quick customization, 6) Use templates in campaigns with automatic variable replacement, 7) Track template usage and performance. The preview feature shows exactly how emails will appear to recipients.",
    category: "General",
    tags: ["email", "marketing", "templates", "preview", "campaigns"],
    helpful: 89
  },
  {
    id: "rental-application-builder",
    question: "How do I use the enhanced rental application form builder?",
    answer: "The form builder now includes professional features: 1) Go to Templates → Create Template → Rental Application, 2) Use pre-built sections (Personal Info, Employment, References, etc.) or create custom fields, 3) Drag and drop to reorder fields, 4) Configure payment methods and application fees, 5) Preview the complete form before publishing, 6) The form builder includes validation, required fields, and professional styling, 7) Forms integrate with payment processing and applicant tracking. A close button is available in the top-right corner of the builder.",
    category: "Templates",
    tags: ["rental", "application", "form", "builder", "payments", "sections"],
    helpful: 91
  },
  {
    id: "marketplace-addons",
    question: "What add-ons are available in the Marketplace?",
    answer: "The Marketplace now features Power Tools and Power Dialer as premium add-ons: 1) Power Tools Suite ($29.99/month) - Includes QR-it, Win-it, and Pool-it with analytics and customization, 2) Power Dialer Pro ($19.99/month) - Professional calling interface with keypad and call management, 3) Both add-ons integrate seamlessly with your CRM, 4) View detailed descriptions, features, and pricing in the Marketplace, 5) Trial options available for testing before purchase, 6) Volume discounts for team and enterprise usage.",
    category: "General",
    tags: ["marketplace", "addons", "power", "tools", "dialer", "pricing"],
    helpful: 88
  },
  {
    id: "enhanced-tooltips",
    question: "What are the tooltip improvements throughout the system?",
    answer: "Tooltips have been enhanced across all modules for better usability: 1) Consistent styling and positioning throughout the application, 2) Detailed descriptions for all action buttons and icons, 3) Context-aware help text that explains what each action does, 4) Hover states provide visual feedback before clicking, 5) Tooltips include keyboard shortcuts where applicable, 6) All form fields include helpful hints and examples. These improvements make the interface more intuitive and reduce the learning curve for new users.",
    category: "General",
    tags: ["tooltips", "usability", "interface", "help", "improvements"],
    helpful: 86
  },
  {
    id: "comprehensive-activity-tracking",
    question: "How does the enhanced activity tracking system work?",
    answer: "Activity tracking now captures all CRM interactions automatically: 1) Every action is logged with timestamp, user, and details, 2) Search and filter activities by type, date, user, or content, 3) Export activity data for compliance and reporting, 4) Performance monitoring tracks system usage and user patterns, 5) All modules (Properties, Tenants, Prospects, Tasks, etc.) contribute to the activity log, 6) Real-time updates ensure immediate tracking of all changes. This provides complete audit trails and business intelligence.",
    category: "General",
    tags: ["activity", "tracking", "audit", "monitoring", "compliance"],
    helpful: 93
  },
  {
    id: "property-groups-management",
    question: "How do I create and manage property groups for targeted announcements?",
    answer: "Property groups help organize properties for marketing and announcements: 1) Go to Property Groups page to view existing groups like 'Downtown Portfolio', 'Residential Complex A', and 'Luxury Properties', 2) Create new groups by selecting properties and using 'Quick Create Group' in announcement targeting, 3) Each group has a name, description, color coding, and property assignments, 4) Use groups in the NewsBoard for targeted announcements to specific property sets, 5) Groups show comprehensive stats including total properties, occupancy rates, and revenue metrics, 6) Color-coded visual indicators help distinguish different groups. Groups streamline marketing campaigns and announcement distribution.",
    category: "Properties",
    tags: ["property", "groups", "announcements", "marketing", "targeting"],
    helpful: 96
  },
  {
    id: "announcement-system-overview",
    question: "How does the announcement system work with property targeting?",
    answer: "The announcement system supports comprehensive targeting options: 1) Send To options include All Tenants, Specific Properties, Specific Tenants, Property Groups, or Custom Selection, 2) Property selection shows all available properties (Sunset Apartments, 590 Hawkins Store Rd, Ocean View Condos, Garden View Apartments, Riverside Townhomes) with full details, 3) Property groups display real data including Downtown Portfolio (3 properties), Residential Complex A (2 properties), and Luxury Properties (2 properties), 4) Save and load targeting selections for repeated use, 5) Quick group creation from selected properties, 6) Real-time blast summary shows exactly who will receive the announcement. All targeting uses live property and group data from your CRM.",
    category: "General",
    tags: ["announcements", "targeting", "properties", "groups", "broadcasting"],
    helpful: 94
  },
  {
    id: "crm-tools-overview",
    question: "What are all the main tools and sections available in the CRM system?",
    answer: "The CRM includes comprehensive tools organized by function: **Property Management**: Properties, Property Groups, Listings, Maintenance, Work Orders **Tenant Management**: Tenants, Applications, Communications, Activity Timeline **Marketing**: Email Marketing, Templates, NewsBoard, Property Landing Pages **Power Tools**: QR-it (QR code generator), Win-it (prize campaigns), Pool-it (group buying), Power Dialer (professional calling) **Financial**: Payments, Quotes, Financial Reports **Administration**: User Roles, Company Settings, Account Settings **Analytics**: Reports & Analytics, Dashboard insights **Support**: Help & Support, Onboarding Guides. Each section includes detailed sub-tools and features for comprehensive property management.",
    category: "General",
    tags: ["tools", "overview", "features", "navigation", "modules"],
    helpful: 98
  },
  {
    id: "dashboard-navigation",
    question: "How do I navigate the main dashboard and key sections?",
    answer: "The dashboard provides central access to all CRM functions: 1) Main navigation menu on the left includes all major sections, 2) Dashboard widgets show key metrics, recent activities, and quick actions, 3) Quick add buttons for properties, tenants, and contacts, 4) Activity timeline shows recent system activity, 5) Search functionality across all data types, 6) User menu provides access to settings and preferences, 7) Notifications panel for important alerts, 8) Breadcrumb navigation shows your current location. The interface is responsive and works on desktop and mobile devices.",
    category: "General",
    tags: ["dashboard", "navigation", "interface", "menu", "widgets"],
    helpful: 89
  },
  {
    id: "data-import-export",
    question: "How do I import and export data in the CRM system?",
    answer: "Data management supports various import/export options: 1) Bulk import properties, tenants, and contacts via CSV upload, 2) Export reports in PDF, Excel, and CSV formats, 3) Activity data export for compliance and analysis, 4) Template export/import for sharing configurations, 5) Backup and restore functionality for data protection, 6) API access for automated data synchronization, 7) Real-time data sync with integrated services. All imports include data validation and error reporting to ensure data integrity.",
    category: "General",
    tags: ["import", "export", "data", "backup", "csv", "sync"],
    helpful: 91
  },
  {
    id: "notification-management",
    question: "How do I manage notifications and communication preferences?",
    answer: "Notification management provides comprehensive control: 1) Set notification preferences in Account Settings for email, SMS, push, and desktop alerts, 2) Configure announcement notification methods (email, SMS, push) when creating announcements, 3) Tenant communication preferences tracked individually, 4) Auto-notifications for rent due, maintenance requests, and system events, 5) Real-time notifications for important activities, 6) Notification history and tracking, 7) Bulk notification settings for property groups. All notifications respect user preferences and compliance requirements.",
    category: "General",
    tags: ["notifications", "communication", "preferences", "alerts", "settings"],
    helpful: 92
  },
  {
    id: "application-tracking",
    question: "How do tenant applications get tracked and reflected in the system?",
    answer: "Application tracking is automated: 1) When tenant applications are approved and moved into a property, this information automatically updates and reflects in the tenant page, 2) Any applications received for approved tenants appear in their Documents page under the appropriate category, 3) All communication and activity with prospects are reflected in the prospect page until they become tenants, 4) This ensures complete tracking from prospect to tenant with no information loss.",
    category: "Tenants",
    tags: ["applications", "tracking", "prospects", "approval"],
    helpful: 88
  },
  {
    id: "complete-feature-guide",
    question: "What is the complete list of CRM features and how do I access each one?",
    answer: "**PROPERTY MANAGEMENT**: Properties (add, edit, view), Property Groups (organize properties), Unlisted Properties (manage listings), Property Landing Pages (marketing pages), **TENANT MANAGEMENT**: Tenants (full profiles), Applications (rental applications), Activity Timeline (communication history), Move-in/Move-out management, **FINANCIAL**: Payments (record, track), Quotes (generate estimates), Financial Reports (income/expense), Charges & Credits management, **MARKETING**: Email Marketing (campaigns), Templates (rental forms), NewsBoard (announcements), QR Codes (property marketing), **MAINTENANCE**: Work Orders (create, assign), Service Providers (manage contractors), Maintenance Tracking, **POWER TOOLS**: QR-it (QR generator), Win-it (contests), Pool-it (group buying), Power Dialer (calling), **ADMINISTRATION**: User Roles (permissions), Company Settings (branding), Integration Management (APIs), Account Settings (preferences), **ANALYTICS**: Dashboard (overview), Reports & Analytics (detailed insights), Activity Tracking (audit trails). Each feature is accessible from the main navigation menu with comprehensive sub-features and tools.",
    category: "General",
    tags: ["features", "complete", "guide", "access", "navigation", "tools"],
    helpful: 99,
    isAdvanced: true
  },
  {
    id: "7",
    question: "What user roles are available in the system?",
    answer: "The system supports multiple user roles: 1) Administrator - full system access and management, 2) Property Manager - manage properties, tenants, and day-to-day operations, 3) Tenant - access to personal information, payments, and maintenance requests, 4) Service Provider - access to assigned work orders and communication, 5) Owner - view reports and property performance. Each role has specific permissions and access levels.",
    category: "General",
    tags: ["users", "roles", "permissions", "access"],
    helpful: 35
  }
];

const mockVideos: VideoTutorial[] = [
  {
    id: "1",
    title: "Getting Started with Property Management CRM",
    description: "Learn the basics of navigating the property management system and setting up your first property.",
    duration: "8:45",
    thumbnail: "📹",
    category: "Getting Started",
    level: "Beginner"
  },
  {
    id: "2",
    title: "Managing Tenants and Lease Agreements",
    description: "Complete guide to adding tenants, creating lease agreements, and managing tenant relationships.",
    duration: "12:30",
    thumbnail: "📹",
    category: "Tenant Management",
    level: "Beginner"
  },
  {
    id: "3",
    title: "Processing Payments and Financial Management",
    description: "Learn how to process rent payments, manage financial records, and generate financial reports.",
    duration: "15:20",
    thumbnail: "📹",
    category: "Financial Management",
    level: "Intermediate"
  },
  {
    id: "4",
    title: "Advanced Reporting and Analytics",
    description: "Deep dive into creating custom reports, setting up automated reporting, and understanding analytics.",
    duration: "18:45",
    thumbnail: "📹",
    category: "Reporting",
    level: "Advanced"
  }
];

const mockTickets: SupportTicket[] = [
  {
    id: "TICK-001",
    subject: "Unable to upload property photos",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2024-01-15",
    lastUpdate: "2024-01-16"
  },
  {
    id: "TICK-002",
    subject: "Payment processing error with ACH",
    priority: "High",
    status: "Open",
    createdDate: "2024-01-16",
    lastUpdate: "2024-01-16"
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
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HelpSupport() {
  // Mock user plan - in real app, get from auth context
  const [userPlan] = React.useState<"Basic" | "Professional" | "Enterprise" | "Custom">("Professional");
  const { isSuperAdmin } = useRoleManagement();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [currentTab, setCurrentTab] = React.useState(0);
  const [newTicketOpen, setNewTicketOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<FAQItem[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [lastUpdateTime, setLastUpdateTime] = React.useState<string>("");
  const [showUpdateNotification, setShowUpdateNotification] = React.useState(false);
  const [ticketForm, setTicketForm] = React.useState({
    subject: "",
    priority: "Medium" as SupportTicket["priority"],
    description: ""
  });

  // Debounce search term for better performance
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300);

    if (searchTerm) {
      setIsSearching(true);
    }

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Store isSuperAdmin result to avoid function calls in dependency array
  const isUserSuperAdmin = React.useMemo(() => isSuperAdmin(), []);

  // Update search results in real-time
  React.useEffect(() => {
    const updateSearchResults = () => {
      const filtered = mockFAQs.filter(faq => {
        // Only show TransUnion integration FAQ to super admins
        if (faq.id === "transunion-integration-setup" && !isUserSuperAdmin) {
          return false;
        }

        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch = !debouncedSearchTerm ||
          faq.question.toLowerCase().includes(searchLower) ||
          faq.answer.toLowerCase().includes(searchLower) ||
          faq.tags.some(tag => tag.toLowerCase().includes(searchLower));

        const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
        const matchesPlan = isPlanEligible(faq.planRequired);

        return matchesSearch && matchesCategory && matchesPlan;
      });

      setSearchResults(filtered);

      // Update timestamp and show notification for real-time updates
      const currentTime = new Date().toLocaleTimeString();
      setLastUpdateTime(currentTime);

      if (debouncedSearchTerm) {
        setShowUpdateNotification(true);
        // Hide notification after 2 seconds
        setTimeout(() => setShowUpdateNotification(false), 2000);
      }
    };

    updateSearchResults();
  }, [debouncedSearchTerm, selectedCategory, isUserSuperAdmin]);

  // Real-time search status updates
  React.useEffect(() => {
    if (searchTerm) {
      console.log(`Real-time search: "${searchTerm}" - Found ${searchResults.length} results at ${lastUpdateTime}`);
    }
  }, [searchTerm, searchResults.length, lastUpdateTime]);

  const isPlanEligible = (requiredPlan?: string) => {
    if (!requiredPlan) return true;
    const planHierarchy = { "Basic": 1, "Professional": 2, "Enterprise": 3, "Custom": 4 };
    return planHierarchy[userPlan] >= planHierarchy[requiredPlan as keyof typeof planHierarchy];
  };

  // Helper function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ?
        `**${part}**` : part
    ).join('');
  };

  // Use searchResults instead of inline filtering
  const filteredFAQs = searchResults;

  // Debug logging for super admin role
  React.useEffect(() => {
    console.log('Current user role check:', { isSuperAdmin: isSuperAdmin() });
    console.log('TransUnion FAQ in mockFAQs:', mockFAQs.find(faq => faq.id === "transunion-integration-setup"));
    console.log('Filtered FAQs count:', filteredFAQs.length);
    console.log('TransUnion FAQ in filtered list:', filteredFAQs.find(faq => faq.id === "transunion-integration-setup"));
  }, [filteredFAQs, isSuperAdmin]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "General": return <HelpRoundedIcon />;
      case "Properties": return <HomeRoundedIcon />;
      case "Tenants": return <PersonRoundedIcon />;
      case "Payments": return <PaymentRoundedIcon />;
      case "Maintenance": return <BuildRoundedIcon />;
      case "Reports": return <ArticleRoundedIcon />;
      case "Security": return <SecurityRoundedIcon />;
      default: return <HelpRoundedIcon />;
    }
  };

  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "Low": return "info";
      case "Medium": return "warning";
      case "High": return "error";
      case "Urgent": return "error";
      default: return "default";
    }
  };

  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "Open": return "warning";
      case "In Progress": return "info";
      case "Resolved": return "success";
      case "Closed": return "default";
      default: return "default";
    }
  };

  const handleCreateTicket = () => {
    alert(`Support ticket created: ${ticketForm.subject}`);
    setNewTicketOpen(false);
    setTicketForm({ subject: "", priority: "Medium", description: "" });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" component="h1">
            Help & Support
          </Typography>
          <Chip
            label={`${userPlan} Plan`}
            color={userPlan === "Enterprise" ? "success" : userPlan === "Professional" ? "warning" : "info"}
            variant="outlined"
            size="small"
          />
        </Stack>
        <Button
          variant="contained"
          startIcon={<SupportAgentRoundedIcon />}
          onClick={() => setNewTicketOpen(true)}
        >
          Contact Support
        </Button>
      </Stack>

      {/* Quick Access Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack alignItems="center" spacing={2} textAlign="center">
                <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                  <ArticleRoundedIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6">Documentation</Typography>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive guides and tutorials
                </Typography>
                <Button variant="outlined" size="small">Browse Docs</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack alignItems="center" spacing={2} textAlign="center">
                <Avatar sx={{ bgcolor: "success.main", width: 56, height: 56 }}>
                  <VideoLibraryRoundedIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6">Video Tutorials</Typography>
                <Typography variant="body2" color="text.secondary">
                  Step-by-step video guides
                </Typography>
                <Button variant="outlined" size="small">Watch Videos</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack alignItems="center" spacing={2} textAlign="center">
                <Avatar sx={{ bgcolor: "warning.main", width: 56, height: 56 }}>
                  <ChatRoundedIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6">Live Chat</Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time support assistance
                </Typography>
                <Button variant="outlined" size="small">Start Chat</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack alignItems="center" spacing={2} textAlign="center">
                <Avatar sx={{ bgcolor: "error.main", width: 56, height: 56 }}>
                  <EmailRoundedIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6">Email Support</Typography>
                <Typography variant="body2" color="text.secondary">
                  Submit detailed support requests
                </Typography>
                <Button variant="outlined" size="small">Send Email</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<HelpRoundedIcon />} label="FAQ" iconPosition="start" />
          <Tab icon={<VideoLibraryRoundedIcon />} label="Video Tutorials" iconPosition="start" />
          <Tab icon={<SupportAgentRoundedIcon />} label="Support Tickets" iconPosition="start" />
          <Tab icon={<PhoneRoundedIcon />} label="Contact Info" iconPosition="start" />
        </Tabs>
      </Box>

      {/* FAQ Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Search and Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search frequently asked questions, answers, and tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color={isSearching ? "primary" : "inherit"} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">
                      {isSearching ? "Searching..." : `${filteredFAQs.length} result${filteredFAQs.length !== 1 ? 's' : ''}`}
                    </Typography>
                  </InputAdornment>
                ),
              }}
              helperText={
                searchTerm ?
                  `Real-time search active - ${filteredFAQs.length} FAQ${filteredFAQs.length !== 1 ? 's' : ''} found` :
                  "Search questions, answers, tags, or categories for instant results"
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Properties">Properties</MenuItem>
                <MenuItem value="Tenants">Tenants</MenuItem>
                <MenuItem value="Payments">Payments</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Reports">Reports</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Integrations">Integrations</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              disabled={!searchTerm && selectedCategory === "All"}
              sx={{ height: '56px' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>

        {/* Search Results Summary */}
        {(searchTerm || selectedCategory !== "All") && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {searchTerm ? `Search Results for "${searchTerm}"` : `${selectedCategory} Category`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Found {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {searchTerm && ` matching "${searchTerm}"`}
              {filteredFAQs.length === 0 && " - try different search terms or browse all categories"}
            </Typography>
          </Box>
        )}

        {/* Dynamic Integration Topics */}
        {(!searchTerm ||
          searchTerm.toLowerCase().includes('email') ||
          searchTerm.toLowerCase().includes('integration') ||
          searchTerm.toLowerCase().includes('gmail') ||
          searchTerm.toLowerCase().includes('outlook') ||
          searchTerm.toLowerCase().includes('yahoo') ||
          searchTerm.toLowerCase().includes('smtp') ||
          searchTerm.toLowerCase().includes('password')) && (
          <Card sx={{ mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📧 Email Integration Quick Start
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm ?
                  `Showing integration help for "${searchTerm}". Quick access to related topics:` :
                  "New to email integration? Start with these essential guides:"
                }
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm("email integration overview")}
                >
                  Setup Overview
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm("gmail integration")}
                >
                  Gmail Setup
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm("outlook integration")}
                >
                  Outlook Setup
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm("password reset email")}
                >
                  Password Reset
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm("email management dashboard")}
                >
                  Email Dashboard
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSearchTerm("email troubleshooting")}
                >
                  Troubleshooting
                </Button>
              </Stack>
              {!searchTerm && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    💡 <strong>Quick Tip:</strong> Email integration is available in your Integrations page.
                    Set up Gmail, Outlook, Yahoo, or custom SMTP to enable automated password resets and professional email sending.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Real-time Update Notification */}
        {showUpdateNotification && searchTerm && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<CheckCircleRoundedIcon />}
              label={`Search updated at ${lastUpdateTime} - ${filteredFAQs.length} results found`}
              color="success"
              variant="outlined"
              size="small"
              sx={{
                animation: 'fadeIn 0.3s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(-10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            />
          </Box>
        )}

        {/* Search Statistics */}
        {filteredFAQs.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredFAQs.length} of {mockFAQs.filter(faq =>
                faq.id !== "transunion-integration-setup" || isSuperAdmin()
              ).length} available FAQs
              {searchTerm && " • Real-time search active"}
              {selectedCategory !== "All" && ` • Filtered by ${selectedCategory}`}
              {lastUpdateTime && searchTerm && ` • Last updated: ${lastUpdateTime}`}
            </Typography>
          </Box>
        )}

        {/* No Results Message */}
        {filteredFAQs.length === 0 && (searchTerm || selectedCategory !== "All") && (
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Results Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm ?
                  `No FAQs found matching "${searchTerm}"` :
                  `No FAQs found in ${selectedCategory} category`
                }
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                >
                  Clear Search
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedCategory("All")}
                  disabled={selectedCategory === "All"}
                >
                  Show All Categories
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Try searching for: "email integration", "password reset", "gmail setup", "troubleshooting"
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* FAQ Items */}
        <Stack spacing={2}>
          {filteredFAQs.map((faq) => (
            <Accordion key={faq.id}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                  {getCategoryIcon(faq.category)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {faq.question}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        label={faq.category}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      {faq.planRequired && (
                        <Chip
                          label={`${faq.planRequired}+ Plan`}
                          size="small"
                          color={faq.planRequired === "Enterprise" ? "error" : faq.planRequired === "Professional" ? "warning" : "info"}
                          variant="filled"
                        />
                      )}
                      {faq.isAdvanced && (
                        <Chip
                          label="Advanced"
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        👍 {faq.helpful} helpful
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {faq.answer}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {faq.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2}>
                  <Button size="small" startIcon={<CheckCircleRoundedIcon />}>
                    Was this helpful?
                  </Button>
                  <Button size="small" startIcon={<BookmarkRoundedIcon />}>
                    Bookmark
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </TabPanel>

      {/* Video Tutorials Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {mockVideos.map((video) => (
            <Grid item xs={12} md={6} lg={4} key={video.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        bgcolor: "grey.100",
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        fontSize: 48
                      }}
                    >
                      {video.thumbnail}
                      <IconButton
                        sx={{
                          position: "absolute",
                          bgcolor: "rgba(0,0,0,0.7)",
                          color: "white",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.8)" }
                        }}
                      >
                        <PlayArrowRoundedIcon fontSize="large" />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight="medium">
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={video.level}
                        size="small"
                        color={video.level === "Beginner" ? "success" : video.level === "Intermediate" ? "warning" : "error"}
                      />
                      <Typography variant="caption">
                        {video.duration}
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrowRoundedIcon />}
                      fullWidth
                    >
                      Watch Video
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Support Tickets Tab */}
      <TabPanel value={currentTab} index={2}>
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              My Support Tickets
            </Typography>
            <Stack spacing={2}>
              {mockTickets.map((ticket) => (
                <Paper key={ticket.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {ticket.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ticket #{ticket.id} • Created {ticket.createdDate} �� Updated {ticket.lastUpdate}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={ticket.priority}
                        size="small"
                        color={getPriorityColor(ticket.priority)}
                      />
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status)}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </TabPanel>

      {/* Contact Info Tab */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Contact Information</Typography>
                  
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <EmailRoundedIcon color="primary" />
                      <Box>
                        <Typography variant="body1">Email Support</Typography>
                        <Typography variant="body2" color="text.secondary">
                          support@propertycrm.com
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PhoneRoundedIcon color="primary" />
                      <Box>
                        <Typography variant="body1">Phone Support</Typography>
                        <Typography variant="body2" color="text.secondary">
                          1-800-PROP-CRM (1-800-776-7276)
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ChatRoundedIcon color="primary" />
                      <Box>
                        <Typography variant="body1">Live Chat</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available Monday - Friday, 9 AM - 6 PM EST
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6">Support Hours</Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Monday - Friday"
                        secondary="9:00 AM - 6:00 PM EST"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Saturday"
                        secondary="10:00 AM - 4:00 PM EST"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Sunday"
                        secondary="Closed"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Emergency Support"
                        secondary="24/7 for critical issues"
                      />
                    </ListItem>
                  </List>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LaunchRoundedIcon />}
                    href="https://support.propertycrm.com"
                    target="_blank"
                  >
                    Visit Support Portal
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Create Support Ticket Dialog */}
      <Dialog open={newTicketOpen} onClose={() => setNewTicketOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Subject"
              fullWidth
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={ticketForm.priority}
                label="Priority"
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as SupportTicket["priority"] })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={6}
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              placeholder="Please describe your issue in detail..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTicketOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTicket}>
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
