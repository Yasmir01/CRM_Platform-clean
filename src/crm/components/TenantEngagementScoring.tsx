import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';;

interface TenantEngagement {
  id: string;
  tenantName: string;
  propertyName: string;
  engagementScore: number;
  communicationFreq: number;
  responseRate: number;
  satisfactionScore: number;
  renewalProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastInteraction: string;
  keyFactors: string[];
}

const TenantEngagementScoring: React.FC = () => {
  const [tenants] = useState<TenantEngagement[]>([
    {
      id: 'tenant_001',
      tenantName: 'Sarah Johnson',
      propertyName: 'Sunset Apartments',
      engagementScore: 87,
      communicationFreq: 92,
      responseRate: 95,
      satisfactionScore: 4.8,
      renewalProbability: 0.89,
      riskLevel: 'low',
      lastInteraction: '2 hours ago',
      keyFactors: ['High communication frequency', 'Quick response times', 'Positive feedback on maintenance']
    },
    {
      id: 'tenant_002',
      tenantName: 'Michael Chen',
      propertyName: 'Riverside Commons',
      engagementScore: 65,
      communicationFreq: 45,
      responseRate: 72,
      satisfactionScore: 3.9,
      renewalProbability: 0.68,
      riskLevel: 'medium',
      lastInteraction: '3 days ago',
      keyFactors: ['Moderate engagement', 'Slower response pattern', 'Some service concerns']
    },
    {
      id: 'tenant_003',
      tenantName: 'Emily Rodriguez',
      propertyName: 'Garden View Apartments',
      engagementScore: 42,
      communicationFreq: 23,
      responseRate: 45,
      satisfactionScore: 3.2,
      renewalProbability: 0.34,
      riskLevel: 'high',
      lastInteraction: '1 week ago',
      keyFactors: ['Low communication', 'Delayed responses', 'Multiple maintenance complaints']
    }
  ]);

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircleIcon color="success" />;
      case 'medium': return <WarningIcon color="warning" />;
      case 'high': return <ErrorIcon color="error" />;
      default: return <CheckCircleIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon />
        Advanced Tenant Engagement Scoring
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          🎯 AI-powered engagement analysis predicts renewal probability and identifies at-risk tenants
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {tenants.map((tenant) => (
          <Grid item xs={12} md={6} lg={4} key={tenant.id}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: getEngagementColor(tenant.engagementScore) + '.light' }}>
                    {tenant.tenantName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{tenant.tenantName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tenant.propertyName}
                    </Typography>
                  </Box>
                  {getRiskIcon(tenant.riskLevel)}
                </Stack>

                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Engagement Score</Typography>
                      <Typography variant="h6" color={getEngagementColor(tenant.engagementScore) + '.main'}>
                        {tenant.engagementScore}
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={tenant.engagementScore} 
                      color={getEngagementColor(tenant.engagementScore) as any}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Communication</Typography>
                      <Typography variant="body2">{tenant.communicationFreq}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Response Rate</Typography>
                      <Typography variant="body2">{tenant.responseRate}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Satisfaction</Typography>
                      <Typography variant="body2">{tenant.satisfactionScore}/5</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Renewal Prob.</Typography>
                      <Typography variant="body2" color="primary.main">
                        {Math.round(tenant.renewalProbability * 100)}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Key Factors</Typography>
                    <Stack spacing={1}>
                      {tenant.keyFactors.map((factor, index) => (
                        <Typography key={index} variant="caption" color="text.secondary">
                          • {factor}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={tenant.riskLevel + ' risk'} 
                      size="small" 
                      color={
                        tenant.riskLevel === 'low' ? 'success' :
                        tenant.riskLevel === 'medium' ? 'warning' : 'error'
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      Last: {tenant.lastInteraction}
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

export default TenantEngagementScoring;
