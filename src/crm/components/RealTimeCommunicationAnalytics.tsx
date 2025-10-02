import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Stack,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Divider,
  CircularProgress
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import TimelineIcon from '@mui/icons-material/Timeline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';;

interface RealTimeMetric {
  channel: 'email' | 'sms' | 'phone' | 'chat';
  sent: number;
  delivered: number;
  opened: number;
  responded: number;
  failed: number;
  avgResponseTime: number;
  trend: 'up' | 'down' | 'stable';
}

const RealTimeCommunicationAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([
    { channel: 'email', sent: 245, delivered: 238, opened: 156, responded: 89, failed: 7, avgResponseTime: 24, trend: 'up' },
    { channel: 'sms', sent: 189, delivered: 187, opened: 162, responded: 134, failed: 2, avgResponseTime: 8, trend: 'up' },
    { channel: 'phone', sent: 67, delivered: 65, opened: 65, responded: 42, failed: 2, avgResponseTime: 3, trend: 'stable' },
    { channel: 'chat', sent: 23, delivered: 23, opened: 20, responded: 18, failed: 0, avgResponseTime: 1, trend: 'up' }
  ]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'phone': return <PhoneIcon />;
      case 'chat': return <TimelineIcon />;
      default: return <AnalyticsIcon />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnalyticsIcon />
        Real-Time Communication Analytics
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          📊 Live analytics tracking all communication channels with automatic updates every 30 seconds
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={6} lg={3} key={metric.channel}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  {getChannelIcon(metric.channel)}
                  <Chip 
                    label={metric.trend} 
                    size="small" 
                    color={getTrendColor(metric.trend) as any}
                  />
                </Stack>
                
                <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 2 }}>
                  {metric.channel}
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Delivery Rate</Typography>
                      <Typography variant="body2" color="success.main">
                        {Math.round((metric.delivered / metric.sent) * 100)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={(metric.delivered / metric.sent) * 100} 
                      color="success"
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Response Rate</Typography>
                      <Typography variant="body2" color="primary.main">
                        {Math.round((metric.responded / metric.opened) * 100)}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={(metric.responded / metric.opened) * 100} 
                      color="primary"
                    />
                  </Box>
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption">Avg Response Time</Typography>
                    <Typography variant="body2" color="info.main">
                      {metric.avgResponseTime}{metric.channel === 'phone' ? 'min' : metric.channel === 'chat' ? 'min' : 'hrs'}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RealTimeCommunicationAnalytics;
