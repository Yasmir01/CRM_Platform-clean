import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Divider,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Devices as DevicesIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";

interface QRCodeData {
  id: string;
  title: string;
  content: string;
  type: string;
  analytics: {
    totalScans: number;
    uniqueScans: number;
    scansByDate: { [date: string]: number };
    scansByLocation: { [location: string]: number };
    scansByDevice: { [device: string]: number };
    scansByBrowser: { [browser: string]: number };
    conversionRate: number;
    peakScanTime: string;
  };
  createdAt: string;
  scans: number;
  downloads: number;
}

interface ContactCapture {
  id: string;
  qrCodeId: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  capturedAt: string;
  location?: string;
  device?: string;
  browser?: string;
}

interface QRAnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
  qrCode: QRCodeData;
  contactCaptures: ContactCapture[];
}

export default function QRAnalyticsDashboard({ 
  open, 
  onClose, 
  qrCode, 
  contactCaptures 
}: QRAnalyticsDashboardProps) {
  const qrCaptures = contactCaptures.filter(contact => contact.qrCodeId === qrCode.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTopEntries = (data: { [key: string]: number }, limit: number = 5) => {
    return Object.entries(data)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  };

  const getTotalValue = (data: { [key: string]: number }) => {
    return Object.values(data).reduce((sum, value) => sum + value, 0);
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  const chartData = Object.entries(qrCode.analytics.scansByDate || {})
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7); // Last 7 days

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <AnalyticsIcon color="primary" />
            <Box>
              <Typography variant="h6">{qrCode.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                QR Code Analytics • Created {formatDate(qrCode.createdAt)}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {/* Overview Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <VisibilityIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Total Scans
                      </Typography>
                      <Typography variant="h4">{qrCode.analytics.totalScans}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Unique Visitors
                      </Typography>
                      <Typography variant="h4">{qrCode.analytics.uniqueScans}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "warning.main" }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Conversion Rate
                      </Typography>
                      <Typography variant="h4">{qrCode.analytics.conversionRate}%</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "info.main" }}>
                      <DownloadIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Downloads
                      </Typography>
                      <Typography variant="h4">{qrCode.downloads}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Peak Scan Time */}
          {qrCode.analytics.peakScanTime && (
            <Alert severity="info" icon={<ScheduleIcon />}>
              <Typography variant="body2">
                <strong>Peak Scan Time:</strong> {qrCode.analytics.peakScanTime}
              </Typography>
            </Alert>
          )}

          {/* Daily Scans Chart */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📈 Daily Scans (Last 7 Days)</Typography>
              <Box sx={{ mt: 2 }}>
                {chartData.length > 0 ? (
                  <Stack spacing={2}>
                    {chartData.map(([date, scans]) => (
                      <Box key={date}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2">{formatDate(date)}</Typography>
                          <Typography variant="body2" fontWeight="bold">{scans} scans</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, chartData.length > 0 && scans ? (scans / Math.max(...chartData.map(([,s]) => s || 0))) * 100 : 0))}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No scan data available yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Location & Device Analytics */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>🌍 Top Locations</Typography>
                  <Stack spacing={1}>
                    {getTopEntries(qrCode.analytics.scansByLocation || {}).map(([location, count]) => (
                      <Box key={location}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{location}</Typography>
                          <Chip 
                            label={`${count} (${getPercentage(count, getTotalValue(qrCode.analytics.scansByLocation || {}))}%)`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    ))}
                    {Object.keys(qrCode.analytics.scansByLocation || {}).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No location data available
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>📱 Device Breakdown</Typography>
                  <Stack spacing={1}>
                    {getTopEntries(qrCode.analytics.scansByDevice || {}).map(([device, count]) => (
                      <Box key={device}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{device}</Typography>
                          <Chip 
                            label={`${count} (${getPercentage(count, getTotalValue(qrCode.analytics.scansByDevice || {}))}%)`} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    ))}
                    {Object.keys(qrCode.analytics.scansByDevice || {}).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No device data available
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Browser Analytics */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>🌐 Browser Usage</Typography>
              <Grid container spacing={2}>
                {getTopEntries(qrCode.analytics.scansByBrowser || {}).map(([browser, count]) => (
                  <Grid item xs={6} sm={4} md={3} key={browser}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="h6">{count}</Typography>
                      <Typography variant="body2" color="text.secondary">{browser}</Typography>
                      <Typography variant="caption">
                        {getPercentage(count, getTotalValue(qrCode.analytics.scansByBrowser || {}))}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {Object.keys(qrCode.analytics.scansByBrowser || {}).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No browser data available
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Contact Captures */}
          {qrCaptures.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  👥 Contact Captures ({qrCaptures.length})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Contact</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell>Location & Device</TableCell>
                        <TableCell>Captured At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {qrCaptures.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">
                                {contact.name || 'Anonymous'}
                              </Typography>
                              {contact.company && (
                                <Typography variant="caption" color="text.secondary">
                                  {contact.company}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              {contact.email && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <EmailIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{contact.email}</Typography>
                                </Stack>
                              )}
                              {contact.phone && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <PhoneIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{contact.phone}</Typography>
                                </Stack>
                              )}
                              {contact.message && (
                                <Typography variant="caption" color="text.secondary">
                                  "{contact.message}"
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              {contact.location && (
                                <Typography variant="caption">📍 {contact.location}</Typography>
                              )}
                              {contact.device && (
                                <Typography variant="caption">📱 {contact.device}</Typography>
                              )}
                              {contact.browser && (
                                <Typography variant="caption">🌐 {contact.browser}</Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(contact.capturedAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* QR Code Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>ℹ️ QR Code Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2"><strong>Type:</strong> {qrCode.type}</Typography>
                    <Typography variant="body2"><strong>Content:</strong></Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {qrCode.content}
                      </Typography>
                    </Paper>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" gutterBottom>QR Code</Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode.content)}`}
                        alt="QR Code"
                        style={{ maxWidth: 150, height: 'auto' }}
                      />
                      {qrCode.customization?.logoUrl && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'white',
                            border: 1,
                            borderColor: 'white',
                            borderRadius: qrCode.customization.eyeStyle === 'circle' ? '50%' : qrCode.customization.eyeStyle === 'rounded' ? 1 : 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            width: ((qrCode.customization.logoSize || 20) / 100) * 150,
                            height: ((qrCode.customization.logoSize || 20) / 100) * 150
                          }}
                        >
                          <img
                            src={qrCode.customization.logoUrl}
                            alt="Logo"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />}
          onClick={() => {
            // Generate analytics report
            const analyticsData = {
              qrCode: qrCode.title,
              totalScans: qrCode.analytics.totalScans,
              uniqueScans: qrCode.analytics.uniqueScans,
              conversionRate: qrCode.analytics.conversionRate,
              contacts: qrCaptures.length,
              topLocations: getTopEntries(qrCode.analytics.scansByLocation || {}, 3),
              topDevices: getTopEntries(qrCode.analytics.scansByDevice || {}, 3)
            };
            
            const dataStr = JSON.stringify(analyticsData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${qrCode.title.replace(/\s+/g, '_')}_analytics.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
        >
          Export Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
