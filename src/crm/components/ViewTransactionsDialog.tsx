import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Divider
} from '@mui/material';
import TransactionIcon from '@mui/icons-material/Receipt';
import IncomeIcon from '@mui/icons-material/TrendingUp';
import ExpenseIcon from '@mui/icons-material/TrendingDown';
import PendingIcon from '@mui/icons-material/Schedule';
import CompletedIcon from '@mui/icons-material/CheckCircle';
import FailedIcon from '@mui/icons-material/Error';;
import { BusinessBankAccount, BankTransaction } from '../types/BankAccountTypes';

interface ViewTransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  account: BusinessBankAccount | null;
}

const ViewTransactionsDialog: React.FC<ViewTransactionsDialogProps> = ({
  open,
  onClose,
  account
}) => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  // Mock transaction data - in production this would come from the bank account service
  const mockTransactions: BankTransaction[] = [
    {
      id: 'txn_001',
      bankConnectionId: account?.id || '',
      type: 'credit',
      amount: 150000, // $1,500
      description: 'Rent Payment - Property #123',
      reference: 'RENT2024001',
      status: 'completed',
      effectiveDate: '2024-01-15',
      processedAt: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: 'txn_002',
      bankConnectionId: account?.id || '',
      type: 'credit',
      amount: 200000, // $2,000
      description: 'Rent Payment - Property #456',
      reference: 'RENT2024002',
      status: 'completed',
      effectiveDate: '2024-01-14',
      processedAt: '2024-01-14T11:15:00Z',
      createdAt: '2024-01-14T09:30:00Z'
    },
    {
      id: 'txn_003',
      bankConnectionId: account?.id || '',
      type: 'debit',
      amount: 50000, // $500
      description: 'Maintenance Payment - Plumbing Repair',
      reference: 'MAINT2024001',
      status: 'completed',
      effectiveDate: '2024-01-13',
      processedAt: '2024-01-13T14:20:00Z',
      createdAt: '2024-01-13T13:00:00Z'
    },
    {
      id: 'txn_004',
      bankConnectionId: account?.id || '',
      type: 'credit',
      amount: 125000, // $1,250
      description: 'Rent Payment - Property #789',
      reference: 'RENT2024003',
      status: 'processing',
      effectiveDate: '2024-01-16',
      createdAt: '2024-01-16T08:00:00Z'
    },
    {
      id: 'txn_005',
      bankConnectionId: account?.id || '',
      type: 'debit',
      amount: 75000, // $750
      description: 'Property Management Fee',
      reference: 'FEE2024001',
      status: 'failed',
      effectiveDate: '2024-01-12',
      failureReason: 'Insufficient funds',
      createdAt: '2024-01-12T16:00:00Z'
    }
  ];

  useEffect(() => {
    if (open && account) {
      loadTransactions();
    }
  }, [open, account, filter, dateRange]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter transactions based on selected criteria
      let filteredTransactions = mockTransactions;
      
      if (filter !== 'all') {
        filteredTransactions = filteredTransactions.filter(txn => {
          if (filter === 'credit') return txn.type === 'credit';
          if (filter === 'debit') return txn.type === 'debit';
          if (filter === 'completed') return txn.status === 'completed';
          if (filter === 'pending') return txn.status === 'processing' || txn.status === 'pending';
          if (filter === 'failed') return txn.status === 'failed';
          return true;
        });
      }

      // Filter by date range
      const now = new Date();
      const daysAgo = new Date(now.getTime() - (parseInt(dateRange) * 24 * 60 * 60 * 1000));
      filteredTransactions = filteredTransactions.filter(txn => 
        new Date(txn.createdAt) >= daysAgo
      );

      setTransactions(filteredTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'processing':
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'failed':
        return <FailedIcon color="error" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatAmount = (amount: number, type: 'credit' | 'debit') => {
    const formattedAmount = `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return type === 'credit' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  const getTotalBalance = () => {
    return transactions.reduce((total, txn) => {
      if (txn.status !== 'completed') return total;
      return txn.type === 'credit' ? total + txn.amount : total - txn.amount;
    }, 0);
  };

  if (!account) {
    return null;
  }

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
            <TransactionIcon sx={{ mr: 1 }} />
            Transaction History
          </Box>
          <Typography variant="body2" color="text.secondary">
            {account.bankName} • {account.accountNumber}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {transactions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {formatAmount(getTotalBalance(), 'credit')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Change
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {transactions.filter(t => t.type === 'credit' && t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Credits
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="error.main">
                {transactions.filter(t => t.type === 'debit' && t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Debits
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type/Status</InputLabel>
              <Select
                value={filter}
                label="Filter by Type/Status"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Transactions</MenuItem>
                <MenuItem value="credit">Credits Only</MenuItem>
                <MenuItem value="debit">Debits Only</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="365">Last year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />

        {/* Transactions Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Alert severity="info">
            No transactions found for the selected criteria.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(transaction.effectiveDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                      {transaction.failureReason && (
                        <Typography variant="caption" color="error">
                          {transaction.failureReason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {transaction.reference}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {transaction.type === 'credit' ? (
                          <IncomeIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                        ) : (
                          <ExpenseIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
                        )}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'medium' }}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(transaction.status)}
                        label={transaction.status}
                        size="small"
                        color={getStatusColor(transaction.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button variant="outlined">
          Export Transactions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTransactionsDialog;
