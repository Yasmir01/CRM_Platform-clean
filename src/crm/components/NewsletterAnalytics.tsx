import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  PieChart,
  BarChart,
  LineChart
} from '@mui/x-charts';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: "Draft" | "Scheduled" | "Sent" | "Sending";
  sentDate?: string;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate?: number;
  clickRate?: number;
  trackingPixel?: boolean;
  analyticsData?: {
    bounceRate: number;
    unsubscribeRate: number;
    forwardRate: number;
    deviceStats: { desktop: number; mobile: number; tablet: number };
    locationStats: { [key: string]: number };
  };
}

interface NewsletterAnalyticsProps {
  open: boolean;
  onClose: () => void;
  campaign: EmailCampaign | null;
}

// Mock analytics data
const generateMockAnalytics = (campaign: EmailCampaign) => {
  if (!campaign) return null;

  const mockAnalytics = {
    ...campaign.analyticsData,
    deviceStats: { desktop: 65, mobile: 30, tablet: 5 },
    locationStats: {
      'Los Angeles, CA': 35,
      'New York, NY': 25,
      'Chicago, IL': 15,
      'San Francisco, CA': 12,
      'Miami, FL': 8,
      'Other': 5
    },
    timeSeriesData: [
      { hour: '9 AM', opens: 5, clicks: 2 },
      { hour: '10 AM', opens: 12, clicks: 4 },
      { hour: '11 AM', opens: 18, clicks: 7 },
      { hour: '12 PM', opens: 25, clicks: 10 },
      { hour: '1 PM', opens: 32, clicks: 15 },
      { hour: '2 PM', opens: 28, clicks: 12 },
      { hour: '3 PM', opens: 22, clicks: 8 },
      { hour: '4 PM', opens: 15, clicks: 6 },
      { hour: '5 PM', opens: 10, clicks: 3 },
    ],
    linkClicks: [
      { link: 'View Property Details', clicks: 25, percentage: 45 },
      { link: 'Schedule Viewing', clicks: 18, percentage: 32 },
      { link: 'Contact Manager', clicks: 8, percentage: 14 },
      { link: 'Unsubscribe', clicks: 5, percentage: 9 }
    ]
  };

  return mockAnalytics;
};


export default function NewsletterAnalytics({ open, onClose, campaign }: NewsletterAnalyticsProps) {
  const analytics = campaign ? generateMockAnalytics(campaign) : null;

  if (!campaign || !analytics) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="info">No analytics data available for this campaign.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const deviceData = Object.entries(analytics.deviceStats).map(([device, value]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value
  }));

  const locationData = Object.entries(analytics.locationStats).map(([location, value]) => ({
    name: location,
    value
  }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AnalyticsRoundedIcon />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Campaign Analytics</Typography>
            <Typography variant="body2" color="text.secondary">
              {campaign.name} • {campaign.status}
            </Typography>
          </Box>
          {campaign.trackingPixel && (
            <Chip 
              label="Pixel Tracking Enabled" 
              color="success" 
              size="small" 
              variant="outlined"
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Key Performance Metrics</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <EmailRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Delivered</Typography>
                        <Typography variant="h5">{campaign.totalSent}</Typography>
                        <Typography variant="caption" color="success.main">
                          {((campaign.totalSent / campaign.totalSent) * 100).toFixed(1)}% delivery rate
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <OpenInNewRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Opened</Typography>
                        <Typography variant="h5">{campaign.totalOpened}</Typography>
                        <Typography variant="caption" color="success.main">
                          <TrendingUpRoundedIcon fontSize="small" />
                          {(campaign.openRate || 0).toFixed(1)}% open rate
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <TouchAppRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Clicked</Typography>
                        <Typography variant="h5">{campaign.totalClicked}</Typography>
                        <Typography variant="caption" color="warning.main">
                          <TrendingUpRoundedIcon fontSize="small" />
                          {(campaign.clickRate || 0).toFixed(1)}% click rate
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <TrendingDownRoundedIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Bounced</Typography>
                        <Typography variant="h5">{analytics.bounceRate}%</Typography>
                        <Typography variant="caption" color="error.main">
                          {analytics.unsubscribeRate}% unsubscribed
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Engagement Over Time */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Engagement Over Time</Typography>
                <Box sx={{ height: 300 }}>
                  <LineChart
                    dataset={analytics.timeSeriesData}
                    xAxis={[{ dataKey: 'hour', scaleType: 'point' }]}
                    series={[
                      { dataKey: 'opens', label: 'Opens', color: '#8884d8' },
                      { dataKey: 'clicks', label: 'Clicks', color: '#82ca9d' }
                    ]}
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Device Statistics */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <DevicesRoundedIcon />
                  <Typography variant="h6">Device Usage</Typography>
                </Stack>
                <Box sx={{ height: 250 }}>
                  <PieChart
                    series={[
                      {
                        data: deviceData,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30 },
                      },
                    ]}
                    height={250}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Geographic Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LocationOnRoundedIcon />
                  <Typography variant="h6">Geographic Distribution</Typography>
                </Stack>
                <Box sx={{ height: 300 }}>
                  <BarChart
                    dataset={locationData}
                    xAxis={[{ dataKey: 'name', scaleType: 'band' }]}
                    series={[{ dataKey: 'value', label: 'Opens', color: '#8884d8' }]}
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Link Click Analysis */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Link Performance</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Link</TableCell>
                        <TableCell align="right">Clicks</TableCell>
                        <TableCell align="right">CTR %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.linkClicks.map((link, index) => (
                        <TableRow key={index}>
                          <TableCell>{link.link}</TableCell>
                          <TableCell align="right">{link.clicks}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                              <LinearProgress 
                                variant="determinate" 
                                value={link.percentage} 
                                sx={{ width: 60, height: 6 }}
                              />
                              <Typography variant="body2">{link.percentage}%</Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Tracking Pixel Information */}
          {campaign.trackingPixel && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>Pixel Tracking Information</Typography>
                <Typography variant="body2">
                  This campaign includes pixel tracking for detailed analytics. Tracking pixels help measure:
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                  <li>Email open rates and timing</li>
                  <li>Device and client information</li>
                  <li>Geographic location data</li>
                  <li>User engagement patterns</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Pixel ID:</strong> track_{campaign.id}_{Date.now()}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined" startIcon={<AnalyticsRoundedIcon />}>
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
