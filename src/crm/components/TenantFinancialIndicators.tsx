import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import AutoPayIcon from '@mui/icons-material/AutoMode';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CheckIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';;
import { useTheme } from '@mui/material/styles';

import { tenantFinancialService } from '../services/TenantFinancialService';
import { TenantFinancialProfile } from '../types/TenantFinancialTypes';

interface TenantFinancialIndicatorsProps {
  tenantId: string;
  compact?: boolean;
}

export default function TenantFinancialIndicators({ tenantId, compact = false }: TenantFinancialIndicatorsProps) {
  const theme = useTheme();
  const [profile, setProfile] = useState<TenantFinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialProfile();
    
    // Subscribe to real-time updates
    tenantFinancialService.subscribe(tenantId, (updatedProfile) => {
      setProfile(updatedProfile);
      setLoading(false);
    });

    return () => {
      tenantFinancialService.unsubscribe(tenantId);
    };
  }, [tenantId]);

  const loadFinancialProfile = async () => {
    try {
      const profileData = await tenantFinancialService.getTenantFinancialProfile(tenantId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading financial profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status: TenantFinancialProfile['paymentStatus']) => {
    switch (status) {
      case 'current': return theme.palette.success.main;
      case 'late': return theme.palette.warning.main;
      case 'overdue': return theme.palette.error.main;
      case 'partial': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getPaymentStatusIcon = (status: TenantFinancialProfile['paymentStatus']) => {
    switch (status) {
      case 'current': return <CheckIcon sx={{ fontSize: 16 }} />;
      case 'late': return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'overdue': return <CancelIcon sx={{ fontSize: 16 }} />;
      case 'partial': return <PaymentIcon sx={{ fontSize: 16 }} />;
      default: return <PaymentIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'high': return theme.palette.error.main;
      case 'critical': return theme.palette.error.dark;
      default: return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Typography variant="body2" color="text.secondary">
        No financial data
      </Typography>
    );
  }

  if (compact) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Auto-Pay Indicator */}
        <Tooltip title={`Auto-Pay: ${profile.autoPayStatus.isEnabled ? 'Enabled' : 'Disabled'}`}>
          <AutoPayIcon
            sx={{
              fontSize: 18,
              color: profile.autoPayStatus.isEnabled 
                ? theme.palette.success.main 
                : theme.palette.error.main
            }}
          />
        </Tooltip>

        {/* SMS Notifications Indicator */}
        <Tooltip title={`SMS Alerts: ${profile.notificationPreferences.sms.enabled ? 'Enabled' : 'Disabled'}`}>
          <SmsIcon
            sx={{
              fontSize: 18,
              color: profile.notificationPreferences.sms.enabled 
                ? theme.palette.success.main 
                : theme.palette.error.main
            }}
          />
        </Tooltip>

        {/* Payment Status */}
        <Tooltip title={`Payment Status: ${profile.paymentStatus.toUpperCase()}`}>
          <Box sx={{ color: getPaymentStatusColor(profile.paymentStatus) }}>
            {getPaymentStatusIcon(profile.paymentStatus)}
          </Box>
        </Tooltip>

        {/* Current Balance Indicator */}
        {profile.currentBalance !== 0 && (
          <Tooltip title={`Balance: $${Math.abs(profile.currentBalance).toLocaleString()} ${profile.currentBalance > 0 ? 'owed' : 'credit'}`}>
            <Box sx={{ color: profile.currentBalance > 0 ? theme.palette.error.main : theme.palette.success.main }}>
              {profile.currentBalance > 0 ? <TrendingDownIcon sx={{ fontSize: 16 }} /> : <TrendingUpIcon sx={{ fontSize: 16 }} />}
            </Box>
          </Tooltip>
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <Stack spacing={1}>
        {/* Payment Status Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: getPaymentStatusColor(profile.paymentStatus) }}>
              {getPaymentStatusIcon(profile.paymentStatus)}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {profile.paymentStatus.charAt(0).toUpperCase() + profile.paymentStatus.slice(1)}
            </Typography>
          </Stack>
          {profile.daysLate > 0 && (
            <Chip 
              label={`${profile.daysLate}d late`} 
              size="small" 
              color="error" 
              variant="outlined"
            />
          )}
        </Box>

        {/* Balance Information */}
        {profile.currentBalance !== 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Balance:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: profile.currentBalance > 0 ? 'error.main' : 'success.main'
              }}
            >
              ${Math.abs(profile.currentBalance).toLocaleString()}
              {profile.currentBalance > 0 ? ' owed' : ' credit'}
            </Typography>
          </Box>
        )}

        {/* Auto-Pay and SMS Status */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title={`Auto-Pay: ${profile.autoPayStatus.isEnabled ? 'Enabled' : 'Disabled'}`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoPayIcon
                sx={{
                  fontSize: 16,
                  color: profile.autoPayStatus.isEnabled 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  mr: 0.5
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Auto-Pay
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title={`SMS Alerts: ${profile.notificationPreferences.sms.enabled ? 'Enabled' : 'Disabled'}`}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SmsIcon
                sx={{
                  fontSize: 16,
                  color: profile.notificationPreferences.sms.enabled 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  mr: 0.5
                }}
              />
              <Typography variant="caption" color="text.secondary">
                SMS
              </Typography>
            </Box>
          </Tooltip>
        </Stack>

        {/* Risk Level */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Risk Level:
          </Typography>
          <Chip
            label={profile.riskAssessment.level.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: getRiskLevelColor(profile.riskAssessment.level),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
