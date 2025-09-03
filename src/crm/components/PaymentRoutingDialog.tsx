import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  Divider,
  Chip,
  InputAdornment
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import BankIcon from '@mui/icons-material/AccountBalance';;
import { BusinessBankAccount, PaymentRoute, RoutingRule } from '../types/BankAccountTypes';

interface PaymentRoutingDialogProps {
  open: boolean;
  onClose: () => void;
  businessAccounts: BusinessBankAccount[];
  onRoutingUpdated: () => void;
}

const PaymentRoutingDialog: React.FC<PaymentRoutingDialogProps> = ({
  open,
  onClose,
  businessAccounts,
  onRoutingUpdated
}) => {
  const [routes, setRoutes] = useState<PaymentRoute[]>([]);
  const [editingRoute, setEditingRoute] = useState<PaymentRoute | null>(null);
  const [newRule, setNewRule] = useState<RoutingRule>({
    condition: 'payment_amount',
    operator: 'greater_than',
    value: '',
    bankAccountId: ''
  });
  const [loading, setLoading] = useState(false);

  // Mock initial routes
  const initialRoutes: PaymentRoute[] = [
    {
      id: 'route_default',
      name: 'Default Rent Collection Route',
      businessBankAccountId: businessAccounts[0]?.id || '',
      routingRules: [
        {
          condition: 'payment_amount',
          operator: 'greater_than',
          value: 0,
          bankAccountId: businessAccounts[0]?.id || ''
        }
      ],
      isActive: true,
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'route_high_value',
      name: 'High-Value Payment Route',
      businessBankAccountId: businessAccounts[1]?.id || businessAccounts[0]?.id || '',
      routingRules: [
        {
          condition: 'payment_amount',
          operator: 'greater_than',
          value: 500000, // $5,000
          bankAccountId: businessAccounts[1]?.id || businessAccounts[0]?.id || ''
        }
      ],
      isActive: true,
      priority: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    if (open) {
      setRoutes(initialRoutes);
    }
  }, [open, businessAccounts]);

  const getBankAccountName = (accountId: string) => {
    const account = businessAccounts.find(acc => acc.id === accountId);
    return account ? `${account.bankName} (${account.accountNumber})` : 'Unknown Account';
  };

  const formatConditionValue = (rule: RoutingRule) => {
    if (rule.condition === 'payment_amount') {
      return `$${(Number(rule.value) / 100).toLocaleString()}`;
    }
    return String(rule.value);
  };

  const getConditionDescription = (rule: RoutingRule) => {
    const operatorText = {
      'greater_than': 'greater than',
      'less_than': 'less than',
      'equals': 'equals',
      'contains': 'contains',
      'in_range': 'in range'
    };

    const conditionText = {
      'payment_amount': 'Payment amount',
      'property_type': 'Property type',
      'tenant_risk': 'Tenant risk level',
      'payment_method': 'Payment method',
      'time_of_day': 'Time of day'
    };

    return `${conditionText[rule.condition] || rule.condition} ${operatorText[rule.operator] || rule.operator} ${formatConditionValue(rule)}`;
  };

  const addNewRoute = () => {
    const newRoute: PaymentRoute = {
      id: `route_${Date.now()}`,
      name: 'New Payment Route',
      businessBankAccountId: businessAccounts[0]?.id || '',
      routingRules: [],
      isActive: true,
      priority: routes.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRoutes([...routes, newRoute]);
    setEditingRoute(newRoute);
  };

  const deleteRoute = (routeId: string) => {
    setRoutes(routes.filter(route => route.id !== routeId));
  };

  const updateRoute = (updatedRoute: PaymentRoute) => {
    setRoutes(routes.map(route => 
      route.id === updatedRoute.id ? { ...updatedRoute, updatedAt: new Date().toISOString() } : route
    ));
    setEditingRoute(null);
  };

  const addRuleToRoute = (route: PaymentRoute) => {
    if (!newRule.bankAccountId || !newRule.value) return;

    const updatedRoute = {
      ...route,
      routingRules: [...route.routingRules, { ...newRule }]
    };
    updateRoute(updatedRoute);
    
    // Reset new rule form
    setNewRule({
      condition: 'payment_amount',
      operator: 'greater_than',
      value: '',
      bankAccountId: ''
    });
  };

  const removeRuleFromRoute = (route: PaymentRoute, ruleIndex: number) => {
    const updatedRoute = {
      ...route,
      routingRules: route.routingRules.filter((_, index) => index !== ruleIndex)
    };
    updateRoute(updatedRoute);
  };

  const toggleRouteActive = (route: PaymentRoute) => {
    updateRoute({ ...route, isActive: !route.isActive });
  };

  const saveRoutes = async () => {
    setLoading(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRoutingUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving routes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RouteIcon sx={{ mr: 1 }} />
            Payment Routing Configuration
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addNewRoute}
            size="small"
          >
            Add Route
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Payment routing rules are processed in priority order. The first matching rule determines where the payment goes.
          </Typography>
        </Alert>

        {routes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No payment routes configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add a route to automatically direct payments to specific bank accounts.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={addNewRoute}>
              Add Your First Route
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {routes.map((route) => (
              <Grid item xs={12} key={route.id}>
                <Card variant="outlined" sx={{ opacity: route.isActive ? 1 : 0.6 }}>
                  <CardContent>
                    {editingRoute?.id === route.id ? (
                      // Edit Mode
                      <Box>
                        <TextField
                          fullWidth
                          label="Route Name"
                          value={editingRoute.name}
                          onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                          sx={{ mb: 2 }}
                        />
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Primary Bank Account</InputLabel>
                          <Select
                            value={editingRoute.businessBankAccountId}
                            label="Primary Bank Account"
                            onChange={(e) => setEditingRoute({ ...editingRoute, businessBankAccountId: e.target.value })}
                          >
                            {businessAccounts.map((account) => (
                              <MenuItem key={account.id} value={account.id}>
                                {getBankAccountName(account.id)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => updateRoute(editingRoute)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => setEditingRoute(null)}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      // View Mode
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {route.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <BankIcon sx={{ mr: 1, fontSize: 16 }} />
                              {getBankAccountName(route.businessBankAccountId)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`Priority ${route.priority}`} 
                              size="small" 
                              color="primary" 
                            />
                            {route.isActive ? (
                              <Chip label="Active" size="small" color="success" />
                            ) : (
                              <Chip label="Inactive" size="small" color="default" />
                            )}
                          </Box>
                        </Box>

                        {/* Routing Rules */}
                        <Typography variant="subtitle2" gutterBottom>
                          Routing Rules:
                        </Typography>
                        {route.routingRules.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            No rules configured - will catch all payments
                          </Typography>
                        ) : (
                          <Box sx={{ mb: 2 }}>
                            {route.routingRules.map((rule, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Chip
                                  label={getConditionDescription(rule)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 1 }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => removeRuleFromRoute(route, index)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Add Rule Form */}
                        {editingRoute?.id === route.id && (
                          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Add New Rule:
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Condition</InputLabel>
                                  <Select
                                    value={newRule.condition}
                                    label="Condition"
                                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
                                  >
                                    <MenuItem value="payment_amount">Payment Amount</MenuItem>
                                    <MenuItem value="property_type">Property Type</MenuItem>
                                    <MenuItem value="tenant_risk">Tenant Risk</MenuItem>
                                    <MenuItem value="payment_method">Payment Method</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Operator</InputLabel>
                                  <Select
                                    value={newRule.operator}
                                    label="Operator"
                                    onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                                  >
                                    <MenuItem value="greater_than">Greater Than</MenuItem>
                                    <MenuItem value="less_than">Less Than</MenuItem>
                                    <MenuItem value="equals">Equals</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Value"
                                  value={newRule.value}
                                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                                  type={newRule.condition === 'payment_amount' ? 'number' : 'text'}
                                  InputProps={{
                                    startAdornment: newRule.condition === 'payment_amount' ? (
                                      <InputAdornment position="start">$</InputAdornment>
                                    ) : undefined
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Bank Account</InputLabel>
                                  <Select
                                    value={newRule.bankAccountId}
                                    label="Bank Account"
                                    onChange={(e) => setNewRule({ ...newRule, bankAccountId: e.target.value })}
                                  >
                                    {businessAccounts.map((account) => (
                                      <MenuItem key={account.id} value={account.id}>
                                        {account.bankName}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => addRuleToRoute(route)}
                                  disabled={!newRule.bankAccountId || !newRule.value}
                                >
                                  <AddIcon />
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={route.isActive}
                                onChange={() => toggleRouteActive(route)}
                              />
                            }
                            label="Active"
                          />
                          <IconButton
                            onClick={() => setEditingRoute(route)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => deleteRoute(route.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={saveRoutes}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Routes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentRoutingDialog;
