import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import TestTubeRoundedIcon from '@mui/icons-material/Science';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { EmailService, EmailAccount, EmailTemplate, EmailMessage } from '../services/EmailService';

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
      id={`email-tabpanel-${index}`}
      aria-labelledby={`email-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmailManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  
  // Dialog states
  const [openTestDialog, setOpenTestDialog] = useState(false);
  
  // Test email form
  const [testForm, setTestForm] = useState({
    accountId: '',
    to: '',
    subject: 'Test Email from PropCRM',
    body: 'This is a test email sent from your CRM system to verify email functionality is working correctly.'
  });
  

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load data
  useEffect(() => {
    loadData();
    
    // Listen for EmailService events
    const handleAccountAdded = () => loadData();
    const handleEmailSent = () => loadData();
    
    EmailService.on('account_added', handleAccountAdded);
    EmailService.on('email_sent', handleEmailSent);
    
    return () => {
      EmailService.off('account_added', handleAccountAdded);
      EmailService.off('email_sent', handleEmailSent);
    };
  }, []);

  const loadData = () => {
    setAccounts(EmailService.getAccounts());
    setTemplates(EmailService.getTemplates());
    setMessages(EmailService.getEmailStats());
  };

  const handleTestConnection = async (accountId: string) => {
    setLoading(true);
    try {
      const account = EmailService.getAccount(accountId);
      if (account) {
        const result = await EmailService.testConnection(account);
        if (result.success) {
          showNotification('Connection test successful!', 'success');
        } else {
          showNotification(`Connection test failed: ${result.error}`, 'error');
        }
      }
    } catch (error) {
      showNotification(`Connection test failed: ${error}`, 'error');
    } finally {
      setLoading(false);
      loadData();
    }
  };

  const handleSendTestEmail = async () => {
    if (!testForm.accountId || !testForm.to) {
      showNotification('Please select an account and enter recipient email', 'error');
      return;
    }

    setLoading(true);
    try {
      const account = EmailService.getAccount(testForm.accountId);
      if (!account) {
        throw new Error('Selected account not found');
      }

      await EmailService.sendEmail({
        from: account.email,
        to: [testForm.to],
        subject: testForm.subject,
        textBody: testForm.body,
        providerId: account.providerId,
        accountId: account.id
      });

      showNotification('Test email sent successfully!', 'success');
      setOpenTestDialog(false);
      setTestForm({
        accountId: '',
        to: '',
        subject: 'Test Email from PropCRM',
        body: 'This is a test email sent from your CRM system to verify email functionality is working correctly.'
      });
    } catch (error) {
      showNotification(`Failed to send test email: ${error}`, 'error');
    } finally {
      setLoading(false);
      loadData();
    }
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.subject) {
      showNotification('Please enter template name and subject', 'error');
      return;
    }

    try {
      EmailService.createTemplate({
        name: templateForm.name,
        subject: templateForm.subject,
        htmlBody: templateForm.htmlBody || templateForm.textBody,
        textBody: templateForm.textBody,
        variables: [],
        category: templateForm.category,
        isActive: true
      });

      showNotification('Template created successfully!', 'success');
      setOpenTemplateDialog(false);
      setTemplateForm({
        name: '',
        subject: '',
        htmlBody: '',
        textBody: '',
        category: 'transactional'
      });
      loadData();
    } catch (error) {
      showNotification(`Failed to create template: ${error}`, 'error');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (confirm('Are you sure you want to delete this email account?')) {
      try {
        await EmailService.deleteAccount(accountId);
        showNotification('Email account deleted successfully!', 'success');
        loadData();
      } catch (error) {
        showNotification(`Failed to delete account: ${error}`, 'error');
      }
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleRoundedIcon color="success" />;
      case 'error':
        return <ErrorRoundedIcon color="error" />;
      case 'expired':
        return <WarningRoundedIcon color="warning" />;
      default:
        return <WarningRoundedIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const stats = EmailService.getEmailStats();

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Email Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<TestTubeRoundedIcon />}
            onClick={() => setOpenTestDialog(true)}
            disabled={accounts.length === 0}
          >
            Send Test Email
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            component="a"
            href="/crm/templates"
          >
            New Template
          </Button>
        </Stack>
      </Stack>

      {/* Notification */}
      {notification && (
        <Alert severity={notification.type} sx={{ mb: 3 }} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Email Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EmailRoundedIcon color="primary" />
                <Box>
                  <Typography variant="h6">{stats.totalSent}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emails Sent
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CheckCircleRoundedIcon color="success" />
                <Box>
                  <Typography variant="h6">{stats.deliveryRate.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Rate
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EmailRoundedIcon color="info" />
                <Box>
                  <Typography variant="h6">{accounts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email Accounts
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <SendRoundedIcon color="secondary" />
                <Box>
                  <Typography variant="h6">{templates.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Templates
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content with Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Email Accounts" />
            <Tab label="Templates" />
          </Tabs>
        </Box>

        {/* Email Accounts Tab */}
        <TabPanel value={tabValue} index={0}>
          {accounts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <EmailRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Email Accounts Configured
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add email accounts in the Integrations page to start sending emails.
              </Typography>
              <Button variant="contained" href="/crm/integrations">
                Go to Integrations
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {accounts.map((account) => (
                <Grid item xs={12} md={6} lg={4} key={account.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" fontWeight="medium">
                              {account.displayName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {account.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {EmailService.getProvider(account.providerId)?.displayName}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              icon={getStatusIcon(account.status)}
                              label={account.status}
                              color={getStatusColor(account.status)}
                              size="small"
                            />
                          </Stack>
                        </Stack>

                        <Divider />

                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Auth Type: {account.authType}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sync: {account.settings.syncFrequency}
                          </Typography>
                          {account.lastSync && (
                            <Typography variant="caption" color="text.secondary">
                              Last Sync: {new Date(account.lastSync).toLocaleString()}
                            </Typography>
                          )}
                          {account.lastError && (
                            <Alert severity="error" size="small">
                              {account.lastError}
                            </Alert>
                          )}
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleTestConnection(account.id)}
                            disabled={loading}
                          >
                            Test Connection
                          </Button>
                          <Tooltip title="Delete Account">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAccount(account.id)}
                              color="error"
                            >
                              <DeleteRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Templates Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6" fontWeight="medium">
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.subject}
                          </Typography>
                        </Box>
                        <Chip
                          label={template.category}
                          size="small"
                          color={template.isActive ? "primary" : "default"}
                        />
                      </Stack>
                      
                      <Typography variant="body2" color="text.secondary">
                        Variables: {template.variables.length > 0 ? template.variables.join(', ') : 'None'}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(template.dateCreated).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Email Account</InputLabel>
              <Select
                value={testForm.accountId}
                label="Email Account"
                onChange={(e) => setTestForm(prev => ({ ...prev, accountId: e.target.value }))}
              >
                {accounts.filter(a => a.status === 'connected').map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.displayName} ({account.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="To Email"
              type="email"
              fullWidth
              value={testForm.to}
              onChange={(e) => setTestForm(prev => ({ ...prev, to: e.target.value }))}
              placeholder="recipient@example.com"
              helperText="Enter the recipient's email address"
            />
            
            <TextField
              label="Subject"
              fullWidth
              value={testForm.subject}
              onChange={(e) => setTestForm(prev => ({ ...prev, subject: e.target.value }))}
            />
            
            <TextField
              label="Message"
              multiline
              rows={4}
              fullWidth
              value={testForm.body}
              onChange={(e) => setTestForm(prev => ({ ...prev, body: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendTestEmail}
            disabled={loading || !testForm.accountId || !testForm.to}
            startIcon={<SendRoundedIcon />}
          >
            Send Test Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Email Template</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Template Name"
              fullWidth
              value={templateForm.name}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <TextField
              label="Subject"
              fullWidth
              value={templateForm.subject}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
              helperText="Use {{variableName}} for dynamic content"
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={templateForm.category}
                label="Category"
                onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <MenuItem value="transactional">Transactional</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Template Content"
              multiline
              rows={6}
              fullWidth
              value={templateForm.textBody}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, textBody: e.target.value }))}
              helperText="Use {{variableName}} for dynamic content. This will be used for both HTML and text content."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={!templateForm.name || !templateForm.subject}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
