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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Business as BusinessIcon,
  Route as RouteIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import AddBankAccountDialog from '../components/AddBankAccountDialog';
import EditBankAccountDialog from '../components/EditBankAccountDialog';
import ViewTransactionsDialog from '../components/ViewTransactionsDialog';
import RemoveBankAccountDialog from '../components/RemoveBankAccountDialog';
import PaymentRoutingDialog from '../components/PaymentRoutingDialog';
import { BusinessBankAccount } from '../types/BankAccountTypes';

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

  // Dialog states
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [editAccountOpen, setEditAccountOpen] = useState(false);
  const [viewTransactionsOpen, setViewTransactionsOpen] = useState(false);
  const [removeAccountOpen, setRemoveAccountOpen] = useState(false);
  const [paymentRoutingOpen, setPaymentRoutingOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BusinessBankAccount | null>(null);

  const tabs = [
    { label: 'Business Accounts', icon: <BusinessIcon /> },
    { label: 'Payment Routing', icon: <RouteIcon /> },
    { label: 'Security & Compliance', icon: <SecurityIcon /> },
    { label: 'Analytics', icon: <AnalyticsIcon /> }
  ];

  // Business accounts state
  const [businessAccounts, setBusinessAccounts] = useState<BusinessBankAccount[]>([
    {
      id: 'biz_bank_main',
      organizationId: 'org_main',
      bankName: 'Chase Business Banking',
      accountType: 'business_checking' as const,
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountHolderName: 'Property Management LLC',
      businessName: 'Property Management LLC',
      taxId: '**-*7890',
      isVerified: true,
      isPrimary: true,
      canReceivePayments: true,
      canSendPayments: true,
      dailyReceiveLimit: 10000000,
      monthlyReceiveLimit: 300000000,
      fees: {
        achReceive: 0,
        achSend: 25,
        wireReceive: 1500,
        wireSend: 3000,
        monthlyMaintenance: 1200,
        overdraftFee: 3500
      },
      processingSchedule: {
        achDebitDays: [1, 2, 3, 4, 5],
        achCreditDays: [1, 2, 3, 4, 5],
        cutoffTime: '17:00',
        timezone: 'America/New_York',
        holidays: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'biz_bank_savings',
      organizationId: 'org_main',
      bankName: 'Bank of America',
      accountType: 'business_savings' as const,
      accountNumber: '****5678',
      routingNumber: '011000015',
      accountHolderName: 'Property Management LLC',
      businessName: 'Property Management LLC',
      taxId: '**-*7890',
      isVerified: true,
      isPrimary: false,
      canReceivePayments: false,
      canSendPayments: true,
      dailyReceiveLimit: 5000000,
      monthlyReceiveLimit: 150000000,
      fees: {
        achReceive: 0,
        achSend: 25,
        wireReceive: 1500,
        wireSend: 3000,
        monthlyMaintenance: 800,
        overdraftFee: 3500
      },
      processingSchedule: {
        achDebitDays: [1, 2, 3, 4, 5],
        achCreditDays: [1, 2, 3, 4, 5],
        cutoffTime: '17:00',
        timezone: 'America/New_York',
        holidays: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  // Event handlers
  const handleAddAccount = (newAccount: BusinessBankAccount) => {
    setBusinessAccounts([...businessAccounts, newAccount]);
  };

  const handleEditAccount = (account: BusinessBankAccount) => {
    setSelectedAccount(account);
    setEditAccountOpen(true);
  };

  const handleViewTransactions = (account: BusinessBankAccount) => {
    setSelectedAccount(account);
    setViewTransactionsOpen(true);
  };

  const handleRemoveAccount = (account: BusinessBankAccount) => {
    setSelectedAccount(account);
    setRemoveAccountOpen(true);
  };

  const handleAccountUpdated = (updatedAccount: BusinessBankAccount) => {
    setBusinessAccounts(businessAccounts.map(acc =>
      acc.id === updatedAccount.id ? updatedAccount : acc
    ));
  };

  const handleAccountRemoved = (accountId: string) => {
    setBusinessAccounts(businessAccounts.filter(acc => acc.id !== accountId));
  };

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
                <BusinessIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6">Business Accounts</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {businessAccounts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connected accounts
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
                100%
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BankIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Total Balance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                $175K
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all accounts
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
          {/* Business Bank Accounts */}
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Business Bank Account Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddAccountOpen(true)}
              >
                Add Bank Account
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manage your business bank accounts that receive rent payments and handle disbursements.
            </Typography>

            <Grid container spacing={3}>
              {businessAccounts.map((account) => (
                <Grid item xs={12} key={account.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 2, fontSize: 40, color: theme.palette.primary.main }} />
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {account.bankName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {account.accountType} • {account.accountNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Routing: {account.routingNumber}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary">
                            ${account.balance.toLocaleString()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {account.isVerified && (
                              <Chip
                                icon={<VerifiedIcon />}
                                label="Verified"
                                size="small"
                                color="success"
                              />
                            )}
                            {account.isPrimary && (
                              <Chip
                                label="Primary"
                                size="small"
                                color="primary"
                              />
                            )}
                            {account.canReceivePayments && (
                              <Chip
                                label="Receives Payments"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditAccount(account)}
                        >
                          Edit Account
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewTransactions(account)}
                        >
                          View Transactions
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAccount(account)}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
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
                      All rent payments go to Chase Business Checking
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setPaymentRoutingOpen(true)}
                    >
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
                      Payments over $5,000 go to Business Savings Account
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setPaymentRoutingOpen(true)}
                    >
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

        <TabPanel value={tabValue} index={2}>
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
                      • Account numbers are tokenized<br />
                      • Routing numbers are masked<br />
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
                      • Annual security audits<br />
                      • SOC 2 Type II certified<br />
                      • Bank-level security standards
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
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
            </Grid>
          </Box>
        </TabPanel>
      </Card>

      {/* Dialogs */}
      <AddBankAccountDialog
        open={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onAccountAdded={handleAddAccount}
        organizationId="org_main"
      />

      <EditBankAccountDialog
        open={editAccountOpen}
        onClose={() => setEditAccountOpen(false)}
        onAccountUpdated={handleAccountUpdated}
        account={selectedAccount}
      />

      <ViewTransactionsDialog
        open={viewTransactionsOpen}
        onClose={() => setViewTransactionsOpen(false)}
        account={selectedAccount}
      />

      <RemoveBankAccountDialog
        open={removeAccountOpen}
        onClose={() => setRemoveAccountOpen(false)}
        onAccountRemoved={handleAccountRemoved}
        account={selectedAccount}
      />

      <PaymentRoutingDialog
        open={paymentRoutingOpen}
        onClose={() => setPaymentRoutingOpen(false)}
        businessAccounts={businessAccounts}
        onRoutingUpdated={() => {
          // Refresh routing data if needed
          console.log('Payment routing updated');
        }}
      />
    </Box>
  );
};

export default BankAccountSettings;
