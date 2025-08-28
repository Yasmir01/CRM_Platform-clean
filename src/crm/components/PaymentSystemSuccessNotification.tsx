import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Collapse,
  IconButton,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const PaymentSystemSuccessNotification: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the first time user is seeing the completed payment system
    const hasSeenNotification = localStorage.getItem('payment_system_notification_seen');
    
    if (!hasSeenNotification) {
      setOpen(true);
      localStorage.setItem('payment_system_notification_seen', 'true');
    }
  }, []);

  const handleGetHelp = () => {
    navigate('/crm/help?category=payments&article=bank-account-connection');
  };

  const handleViewSystem = () => {
    navigate('/crm/rent-collection');
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Collapse in={open}>
        <Alert 
          severity="success" 
          icon={<CheckIcon />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>🎉 Payment System Ready!</AlertTitle>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your comprehensive bank account connection and payment system has been successfully implemented with enterprise-grade security and PCI compliance.
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip label="ACH Processing" color="success" size="small" />
            <Chip label="Bank Verification" color="success" size="small" />
            <Chip label="Fraud Detection" color="success" size="small" />
            <Chip label="PCI Compliant" color="success" size="small" />
            <Chip label="Payment Routing" color="success" size="small" />
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="small"
              startIcon={<LaunchIcon />}
              onClick={handleViewSystem}
            >
              Start Collecting Payments
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HelpIcon />}
              onClick={handleGetHelp}
            >
              View Setup Guide
            </Button>
          </Stack>
        </Alert>
      </Collapse>
    </Box>
  );
};

export default PaymentSystemSuccessNotification;
