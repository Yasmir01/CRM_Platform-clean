import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { bankAccountService } from '../services/BankAccountService';
import { BusinessBankAccount } from '../types/BankAccountTypes';
import { Property } from '../contexts/CrmDataContext';
import BusinessBankAccountSelector from './BusinessBankAccountSelector';

interface PropertyBankAccountSectionProps {
  property: Property;
  onUpdate: (updatedProperty: Property) => void;
  readonly?: boolean;
}

export const PropertyBankAccountSection: React.FC<PropertyBankAccountSectionProps> = ({
  property,
  onUpdate,
  readonly = false
}) => {
  const [bankAccount, setBankAccount] = useState<BusinessBankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(
    property.assignedBusinessBankAccountId
  );

  useEffect(() => {
    loadBankAccountInfo();
  }, [property.assignedBusinessBankAccountId]);

  const loadBankAccountInfo = async () => {
    try {
      setLoading(true);
      
      if (property.assignedBusinessBankAccountId) {
        const accounts = await bankAccountService.getBusinessBankAccounts('org_main');
        const account = accounts.find(acc => acc.id === property.assignedBusinessBankAccountId);
        setBankAccount(account || null);
      } else {
        setBankAccount(null);
      }
    } catch (error) {
      console.error('Error loading bank account info:', error);
      setBankAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    try {
      const updatedProperty = {
        ...property,
        assignedBusinessBankAccountId: selectedAccountId,
        updatedAt: new Date().toISOString()
      };

      onUpdate(updatedProperty);
      setEditing(false);
      await loadBankAccountInfo();
    } catch (error) {
      console.error('Error updating bank account assignment:', error);
    }
  };

  const handleCancelEdit = () => {
    setSelectedAccountId(property.assignedBusinessBankAccountId);
    setEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CircularProgress size={20} />
            <Typography>Loading payment routing information...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BankIcon color="primary" />
              Payment Routing
            </Typography>
            {!readonly && !editing && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
              >
                Configure
              </Button>
            )}
          </Stack>

          {editing ? (
            <Box>
              <BusinessBankAccountSelector
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                helperText="Select which business bank account will receive rent payments for this property"
              />
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveAssignment}
                  disabled={selectedAccountId === property.assignedBusinessBankAccountId}
                >
                  Save Assignment
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box>
              {bankAccount ? (
                <Alert severity="success" icon={<CheckIcon />}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">
                      <strong>Assigned Bank Account:</strong> {bankAccount.businessName}
                    </Typography>
                    <Typography variant="body2">
                      {bankAccount.bankName} •••{bankAccount.accountNumber.slice(-4)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {bankAccount.isPrimary && (
                        <Chip label="Primary Account" color="primary" size="small" />
                      )}
                      {bankAccount.isVerified && (
                        <Chip label="Verified" color="success" size="small" />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      All rent payments for this property will be deposited to this account.
                    </Typography>
                  </Stack>
                </Alert>
              ) : (
                <Alert severity="info" icon={<WarningIcon />}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">
                      <strong>No Bank Account Assigned</strong>
                    </Typography>
                    <Typography variant="body2">
                      This property uses default payment routing rules. 
                      Payments will be routed based on property type, amount, and other criteria.
                    </Typography>
                    {!readonly && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setEditing(true)}
                        sx={{ mt: 1, alignSelf: 'flex-start' }}
                      >
                        Assign Bank Account
                      </Button>
                    )}
                  </Stack>
                </Alert>
              )}
            </Box>
          )}

          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>How Payment Routing Works:</strong>
              <br />
              • If a bank account is assigned, all rent payments go directly to that account
              <br />
              • If no assignment exists, the system uses default routing rules
              <br />
              • Default routing considers property type, payment amount, and risk factors
              <br />
              • You can change the assignment at any time
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PropertyBankAccountSection;
