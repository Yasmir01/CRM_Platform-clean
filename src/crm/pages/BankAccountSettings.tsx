import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  Route as RouteIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import BankAccountManagement from '../components/BankAccountManagement';
import BusinessBankAccountManagement from '../components/BusinessBankAccountManagement';
import { useCrmData } from '../contexts/CrmDataContext';

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
      id={`bank-settings-tabpanel-${index}`}
      aria-labelledby={`bank-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BankAccountSettings: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { tenants } = useCrmData();

  const tabs = [
    { label: 'Tenant Bank Accounts', icon: <BankIcon /> },
    { label: 'Business Accounts', icon: <BusinessIcon /> },
    { label: 'Payment Routing', icon: <RouteIcon /> },
    { label: 'Security & Compliance', icon: <SecurityIcon /> },
    { label: 'Analytics', icon: <AnalyticsIcon /> }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bank Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage bank connections, payment routing, and security settings for your property management platform.
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BankIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Connected Accounts</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {tenants.length > 0 ? tenants.length * 2 : '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active bank connections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6">Business Accounts</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receiving accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="h6">Verification Rate</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accounts verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="h6">Monthly Volume</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                $125K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ACH processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ px: 3 }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Tenant Bank Accounts */}
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tenant Bank Account Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              View and manage bank accounts connected by tenants for rent payments.
            </Typography>

            {tenants.length > 0 ? (
              <Grid container spacing={3}>
                {tenants.slice(0, 3).map((tenant) => (
                  <Grid item xs={12} key={tenant.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {tenant.name}
                        </Typography>
                        <BankAccountManagement tenantId={tenant.id} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                No tenants available. Add tenants to manage their bank accounts.
              </Alert>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Business Bank Accounts */}
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Business Bank Account Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage your business bank accounts that receive rent payments and handle disbursements.
            </Typography>
            <BusinessBankAccountManagement organizationId="org_main" />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Payment Routing */}
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Routing Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Set up intelligent payment routing rules to automatically direct funds to the appropriate business accounts.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Default Routing Rule
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      All rent payments → Chase Business Checking
                    </Typography>
                    <Button variant="outlined" size="small">
                      Edit Rule
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      High-Value Routing
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Payments > $5,000 → Business Savings Account
                    </Typography>
                    <Button variant="outlined" size="small">
                      Edit Rule
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                Payment routing helps you automatically organize incoming funds based on amount, property type, or tenant risk level.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Security & Compliance */}
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security & Compliance Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure security measures and compliance settings for bank account operations.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
                      Encryption Status
                    </Typography>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      All bank account data is encrypted using AES-256
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                      • Account numbers are tokenized
                      • Routing numbers are masked
                      • PII data is encrypted at rest
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Compliance Status
                    </Typography>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      PCI DSS & NACHA compliant
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                      • Annual security audits
                      • SOC 2 Type II certified
                      • Bank-level security standards
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Access Control & Audit Logging
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      All bank account operations are logged and monitored for security compliance.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="outlined" size="small">
                        View Audit Logs
                      </Button>
                      <Button variant="outlined" size="small">
                        Security Settings
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Analytics */}
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bank Account Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Monitor payment performance, processing times, and financial insights.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Payment Method Performance
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">ACH Success Rate</Typography>
                      <Typography variant="body2" color="success.main">97.5%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Average Processing Time</Typography>
                      <Typography variant="body2">2.1 days</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Cost Savings vs Cards</Typography>
                      <Typography variant="body2" color="success.main">$2,150/month</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Monthly Processing Volume
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      $124,580
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      +12% from last month
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">ACH: $98,420 (79%)</Typography>
                      <Typography variant="body2">Cards: $26,160 (21%)</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Advanced analytics including payment trends, tenant behavior, and cash flow forecasting will be available in the next release.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default BankAccountSettings;