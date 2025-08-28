import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon,
  VpnLock as EncryptionIcon,
  AdminPanelSettings as ComplianceIcon
} from '@mui/icons-material';
import { SecurityAuditLogger, FraudDetection, PCICompliance } from '../utils/paymentSecurity';
import { PCIComplianceValidator } from '../utils/pciComplianceValidator';

interface SecurityMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  riskScore: number;
  complianceScore: number;
  encryptionStatus: boolean;
  lastAudit: Date;
  activeThreats: number;
}

interface SecurityAlert {
  id: string;
  type: 'fraud' | 'compliance' | 'security' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const SecurityMonitoringDashboard: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalTransactions: 0,
    flaggedTransactions: 0,
    riskScore: 0,
    complianceScore: 0,
    encryptionStatus: true,
    lastAudit: new Date(),
    activeThreats: 0
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityMetrics();
    loadSecurityAlerts();
    
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        loadSecurityMetrics();
        loadSecurityAlerts();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  const loadSecurityMetrics = async () => {
    try {
      // Simulate loading real security metrics
      const mockMetrics: SecurityMetrics = {
        totalTransactions: Math.floor(Math.random() * 1000) + 500,
        flaggedTransactions: Math.floor(Math.random() * 10) + 2,
        riskScore: Math.random() * 30 + 10, // Low risk score
        complianceScore: Math.random() * 20 + 80, // High compliance score
        encryptionStatus: true,
        lastAudit: new Date(Date.now() - Math.random() * 86400000), // Within last day
        activeThreats: Math.floor(Math.random() * 3)
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load security metrics:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          type: 'fraud',
          severity: 'medium',
          message: 'Unusual payment pattern detected from IP 192.168.1.100',
          timestamp: new Date(Date.now() - 3600000),
          resolved: false
        },
        {
          id: '2',
          type: 'compliance',
          severity: 'low',
          message: 'PCI compliance scan completed successfully',
          timestamp: new Date(Date.now() - 7200000),
          resolved: true
        },
        {
          id: '3',
          type: 'security',
          severity: 'high',
          message: 'Multiple failed authentication attempts detected',
          timestamp: new Date(Date.now() - 1800000),
          resolved: false
        }
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([loadSecurityMetrics(), loadSecurityAlerts()]);
    setIsRefreshing(false);
  };

  const runComplianceAudit = async () => {
    try {
      const mockContext = {
        sessionId: 'sess_audit',
        userAgent: 'SecurityAuditor/1.0',
        ipAddress: '127.0.0.1',
        timestamp: Date.now(),
        userId: 'admin',
        protocol: 'https',
        tlsVersion: 1.3,
        userRole: 'admin',
        permissions: ['audit:all'],
        authenticated: true,
        authMethod: 'mfa',
        auditLogging: true
      };

      const complianceResult = PCIComplianceValidator.validatePCICompliance(
        { encrypted: true },
        mockContext
      );

      setMetrics(prev => ({
        ...prev,
        complianceScore: complianceResult.securityScore,
        lastAudit: new Date()
      }));

      // Add audit completion alert
      const auditAlert: SecurityAlert = {
        id: Date.now().toString(),
        type: 'compliance',
        severity: complianceResult.isCompliant ? 'low' : 'high',
        message: `PCI compliance audit completed. Score: ${complianceResult.securityScore}`,
        timestamp: new Date(),
        resolved: complianceResult.isCompliant
      };

      setAlerts(prev => [auditAlert, ...prev]);
    } catch (error) {
      console.error('Compliance audit failed:', error);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud': return <WarningIcon />;
      case 'compliance': return <ComplianceIcon />;
      case 'security': return <ShieldIcon />;
      case 'system': return <SecurityIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getScoreColor = (score: number, isRisk: boolean = false) => {
    if (isRisk) {
      return score > 70 ? theme.palette.error.main : 
             score > 40 ? theme.palette.warning.main : 
             theme.palette.success.main;
    } else {
      return score >= 90 ? theme.palette.success.main : 
             score >= 70 ? theme.palette.warning.main : 
             theme.palette.error.main;
    }
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.severity === 'critical');

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Security Monitoring Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={realTimeMonitoring}
                onChange={(e) => setRealTimeMonitoring(e.target.checked)}
              />
            }
            label="Real-time Monitoring"
          />
          <Button
            variant="outlined"
            onClick={runComplianceAudit}
            startIcon={<ComplianceIcon />}
          >
            Run Audit
          </Button>
          <IconButton onClick={refreshData} disabled={isRefreshing}>
            <RefreshIcon sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Security Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Risk Score
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ color: getScoreColor(metrics.riskScore, true) }}
              >
                {metrics.riskScore.toFixed(1)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.riskScore}
                sx={{ mt: 1 }}
                color={metrics.riskScore > 70 ? 'error' : metrics.riskScore > 40 ? 'warning' : 'success'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ComplianceIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Compliance
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ color: getScoreColor(metrics.complianceScore) }}
              >
                {metrics.complianceScore.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.complianceScore}
                sx={{ mt: 1 }}
                color={metrics.complianceScore >= 90 ? 'success' : metrics.complianceScore >= 70 ? 'warning' : 'error'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Active Threats
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ color: metrics.activeThreats > 0 ? theme.palette.error.main : theme.palette.success.main }}
              >
                {metrics.activeThreats}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Flagged: {metrics.flaggedTransactions}/{metrics.totalTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EncryptionIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Encryption
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {metrics.encryptionStatus ? (
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6">
                  {metrics.encryptionStatus ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                AES-256 encryption
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Critical Security Alerts ({criticalAlerts.length})
          </Typography>
          {criticalAlerts.map(alert => (
            <Typography key={alert.id} variant="body2">
              • {alert.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Security Alerts Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Security Alerts
              {unresolvedAlerts.length > 0 && (
                <Badge badgeContent={unresolvedAlerts.length} color="error" sx={{ ml: 2 }} />
              )}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              size="small"
            >
              Export Report
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.slice(0, 10).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(alert.type)}
                        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {alert.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.severity.toUpperCase()}
                        color={getSeverityColor(alert.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {alert.timestamp.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {alert.resolved ? (
                        <Chip label="Resolved" color="success" size="small" />
                      ) : (
                        <Chip label="Active" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {!alert.resolved && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecurityMonitoringDashboard;
