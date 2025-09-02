import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  useTheme
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  SwapHoriz as TransactionIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

import { BankConnection, BankTransaction } from '../types/BankAccountTypes';
import { bankAccountService } from '../services/BankAccountService';
import BankLinkDialog from './BankLinkDialog';
import BankVerificationDialog from './BankVerificationDialog';
import { useI18nFormat } from "../utils/i18nFormat";

interface BankAccountManagementProps {
  tenantId: string;
}

const BankAccountManagement: React.FC<BankAccountManagementProps> = ({ tenantId }) => {
  const theme = useTheme();
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<BankConnection | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<BankConnection | null>(null);

  useEffect(() => {
    loadBankConnections();
  }, [tenantId]);

  const loadBankConnections = async () => {
    try {
      setLoading(true);
      const connections = await bankAccountService.getBankConnections(tenantId);
      setBankConnections(connections);
    } catch (error) {
      console.error('Failed to load bank connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, connection: BankConnection) => {
    setMenuAnchor(event.currentTarget);
    setSelectedConnection(connection);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConnection(null);
  };

  const handleVerifyAccount = () => {
    if (selectedConnection && !selectedConnection.isVerified) {
      setVerificationDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleSetDefault = async () => {
    if (!selectedConnection) return;

    try {
      // Unset default for all other connections
      for (const conn of bankConnections) {
        if (conn.id !== selectedConnection.id && conn.isDefault) {
          await bankAccountService.updateBankConnection(conn.id, { isDefault: false });
        }
      }

      // Set as default
      await bankAccountService.updateBankConnection(selectedConnection.id, { isDefault: true });
      await loadBankConnections();
    } catch (error) {
      console.error('Failed to set default account:', error);
    }
    handleMenuClose();
  };

  const handleDeleteAccount = () => {
    setConnectionToDelete(selectedConnection);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteAccount = async () => {
    if (!connectionToDelete) return;

    try {
      await bankAccountService.deleteBankConnection(connectionToDelete.id);
      await loadBankConnections();
      setDeleteDialogOpen(false);
      setConnectionToDelete(null);
    } catch (error) {
      console.error('Failed to delete bank connection:', error);
    }
  };

  const handleBankConnected = (connection: BankConnection) => {
    setBankConnections(prev => [...prev, connection]);
    setLinkDialogOpen(false);
  };

  const getStatusColor = (connection: BankConnection) => {
    if (!connection.isActive) return 'default';
    if (!connection.isVerified) return 'warning';
    return 'success';
  };

  const getStatusText = (connection: BankConnection) => {
    if (!connection.isActive) return 'Inactive';
    if (!connection.isVerified) return 'Pending Verification';
    return 'Verified';
  };

  const formatAccountNumber = (accountNumber: string) => {
    // Show only last 4 digits
    return accountNumber.includes('*') ? accountNumber : `****${accountNumber.slice(-4)}`;
  };

  const { formatCurrency } = useI18nFormat();
  const formatCurrencyCents = (amount: number) => formatCurrency(amount / 100);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Connected Bank Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setLinkDialogOpen(true)}
        >
          Connect Bank Account
        </Button>
      </Box>

      {/* Bank Connections */}
      {bankConnections.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <BankIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Bank Accounts Connected
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Connect your bank account to enable seamless rent payments and faster processing.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setLinkDialogOpen(true)}
            >
              Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bankConnections.map((connection) => (
            <Grid item xs={12} md={6} key={connection.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                        <BankIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {connection.bankName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {connection.accountType.charAt(0).toUpperCase() + connection.accountType.slice(1)} • {formatAccountNumber(connection.accountNumber)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={getStatusText(connection)}
                        color={getStatusColor(connection)}
                        icon={connection.isVerified ? <VerifiedIcon /> : <WarningIcon />}
                        sx={{ mr: 1 }}
                      />
                      {connection.isDefault && (
                        <Chip size="small" label="Default" color="primary" sx={{ mr: 1 }} />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, connection)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Daily Limit
                      </Typography>
                      <Typography variant="body1">
                        {connection.dailyLimit ? formatCurrencyCents(connection.dailyLimit) : 'No limit'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Limit
                      </Typography>
                      <Typography variant="body1">
                        {connection.monthlyLimit ? formatCurrency(connection.monthlyLimit) : 'No limit'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {!connection.isVerified && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Account verification required to process payments.
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedConnection(connection);
                          setVerificationDialogOpen(true);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Verify Now
                      </Button>
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Connected: {new Date(connection.createdAt).toLocaleDateString()}
                    </Typography>
                    {connection.lastUsed && (
                      <Typography variant="body2" color="text.secondary">
                        Last used: {new Date(connection.lastUsed).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Account Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedConnection && !selectedConnection.isVerified && (
          <MenuItem onClick={handleVerifyAccount}>
            <ListItemIcon>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            Verify Account
          </MenuItem>
        )}
        {selectedConnection && !selectedConnection.isDefault && (
          <MenuItem onClick={handleSetDefault}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            Set as Default
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          setSelectedConnection(selectedConnection);
          // Open edit dialog
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Limits
        </MenuItem>
        <MenuItem onClick={handleDeleteAccount} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Remove Account
        </MenuItem>
      </Menu>

      {/* Bank Link Dialog */}
      <BankLinkDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        tenantId={tenantId}
        onBankConnected={handleBankConnected}
      />

      {/* Bank Verification Dialog */}
      {selectedConnection && (
        <BankVerificationDialog
          open={verificationDialogOpen}
          onClose={() => setVerificationDialogOpen(false)}
          bankConnection={selectedConnection}
          onVerificationComplete={loadBankConnections}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Bank Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this bank account? This action cannot be undone.
          </Typography>
          {connectionToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {connectionToDelete.bankName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {connectionToDelete.accountType} • {formatAccountNumber(connectionToDelete.accountNumber)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAccount}
            color="error"
            variant="contained"
          >
            Remove Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccountManagement;
