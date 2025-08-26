import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Paper,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { LocalStorageService } from '../services/LocalStorageService';

interface ContactCapture {
  id: string;
  qrCodeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  capturedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface QRCodeData {
  id: string;
  title: string;
  content: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Expired';
  isPasswordProtected: boolean;
  password?: string;
  customization: {
    logoUrl?: string;
    logoSize: number;
    foregroundColor: string;
    backgroundColor: string;
    style: string;
    pattern: string;
    eyeStyle: string;
  };
  tracking: {
    captureLeads: boolean;
    requireContact: boolean;
    landingPageUrl?: string;
  };
  analytics: {
    totalScans: number;
    uniqueScans: number;
    lastScanned?: string;
  };
}

export default function QrRedirector() {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'QR Code Scan'
  });

  useEffect(() => {
    if (!qrId) {
      setError('Invalid QR code');
      setLoading(false);
      return;
    }

    // Load QR code data
    const qrCodes = LocalStorageService.getQRCodes();
    const foundQr = qrCodes.find((qr: QRCodeData) => qr.id === qrId);
    
    if (!foundQr) {
      setError('QR code not found');
      setLoading(false);
      return;
    }

    if (foundQr.status !== 'Active') {
      setError(`QR code is ${foundQr.status.toLowerCase()}`);
      setLoading(false);
      return;
    }

    setQrCode(foundQr);

    // Check if password is required
    if (foundQr.isPasswordProtected) {
      setPasswordRequired(true);
      setLoading(false);
      return;
    }

    // Check if lead capture is required
    if (foundQr.tracking.captureLeads) {
      setShowLeadCapture(true);
      setLoading(false);
      return;
    }

    // If no password or lead capture required, proceed with redirect
    handleRedirect(foundQr);
  }, [qrId]);

  const handlePasswordSubmit = () => {
    if (!qrCode || !passwordInput) return;

    if (passwordInput === qrCode.password) {
      setPasswordRequired(false);
      
      // Check if lead capture is required
      if (qrCode.tracking.captureLeads && qrCode.tracking.requireContact) {
        setShowLeadCapture(true);
      } else {
        handleRedirect(qrCode);
      }
    } else {
      setError('Incorrect password');
    }
  };

  const handleLeadCaptureSubmit = () => {
    if (!qrCode) return;

    // Validate required fields
    if (!contactData.firstName || !contactData.email) {
      setError('Please fill in all required fields');
      return;
    }

    // Save contact capture
    const capture: ContactCapture = {
      id: Date.now().toString(),
      qrCodeId: qrCode.id,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      company: contactData.company,
      source: contactData.source,
      capturedAt: new Date().toISOString(),
      ipAddress: 'Unknown', // In a real app, you'd capture this server-side
      userAgent: navigator.userAgent
    };

    // Load existing captures and add new one
    const existingCaptures = LocalStorageService.getContactCaptures();
    LocalStorageService.saveContactCaptures([...existingCaptures, capture]);

    // Update analytics
    const qrCodes = LocalStorageService.getQRCodes();
    const updatedQrCodes = qrCodes.map((qr: QRCodeData) => {
      if (qr.id === qrCode.id) {
        return {
          ...qr,
          analytics: {
            ...qr.analytics,
            totalScans: qr.analytics.totalScans + 1,
            uniqueScans: qr.analytics.uniqueScans + 1,
            lastScanned: new Date().toISOString()
          }
        };
      }
      return qr;
    });
    LocalStorageService.saveQRCodes(updatedQrCodes);

    // Proceed with redirect
    handleRedirect(qrCode);
  };

  const handleRedirect = (qr: QRCodeData) => {
    // Update analytics if not already done
    if (!showLeadCapture) {
      const qrCodes = LocalStorageService.getQRCodes();
      const updatedQrCodes = qrCodes.map((code: QRCodeData) => {
        if (code.id === qr.id) {
          return {
            ...code,
            analytics: {
              ...code.analytics,
              totalScans: code.analytics.totalScans + 1,
              uniqueScans: code.analytics.uniqueScans + 1,
              lastScanned: new Date().toISOString()
            }
          };
        }
        return code;
      });
      LocalStorageService.saveQRCodes(updatedQrCodes);
    }

    // Redirect to the target URL
    const targetUrl = qr.tracking.landingPageUrl || qr.content;
    
    // Add protocol if missing
    let redirectUrl = targetUrl;
    if (qr.type === 'URL' && !redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl.replace(/^(www\.)?/, 'www.');
    }

    // Redirect
    if (qr.type === 'URL') {
      window.location.href = redirectUrl;
    } else {
      // For non-URL types, show the content
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !qrCode) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <QrCodeIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              QR Code Error
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error || 'QR code not found'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/crm/power-tools')}
              sx={{ mt: 2 }}
            >
              Go to Power Tools
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (passwordRequired) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <LockIcon sx={{ fontSize: 64, color: 'warning.main' }} />
              <Typography variant="h6" textAlign="center">
                Password Required
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                This QR code is password protected. Please enter the password to continue.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              <TextField
                type="password"
                label="Password"
                fullWidth
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              
              <Button
                variant="contained"
                fullWidth
                onClick={handlePasswordSubmit}
                disabled={!passwordInput}
              >
                Submit
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (showLeadCapture) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent>
            <Stack spacing={3}>
              <Box textAlign="center">
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <QrCodeIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6">
                  {qrCode.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please provide your contact information to continue
                </Typography>
              </Box>

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="First Name *"
                    fullWidth
                    value={contactData.firstName}
                    onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={contactData.lastName}
                    onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                  />
                </Stack>

                <TextField
                  label="Email Address *"
                  type="email"
                  fullWidth
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                />

                <TextField
                  label="Phone Number"
                  fullWidth
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                />

                <TextField
                  label="Company"
                  fullWidth
                  value={contactData.company}
                  onChange={(e) => setContactData({ ...contactData, company: e.target.value })}
                />

                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={contactData.source}
                    label="Source"
                    onChange={(e) => setContactData({ ...contactData, source: e.target.value })}
                  >
                    <MenuItem value="QR Code Scan">QR Code Scan</MenuItem>
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Print Material">Print Material</MenuItem>
                    <MenuItem value="Digital Display">Digital Display</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                onClick={handleLeadCaptureSubmit}
                disabled={!contactData.firstName || !contactData.email}
              >
                Continue
              </Button>

              <Typography variant="caption" color="text.secondary" textAlign="center">
                * Required fields
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // For non-URL QR codes, display the content
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <QrCodeIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            <Typography variant="h6" textAlign="center">
              {qrCode.title}
            </Typography>
            <Paper sx={{ p: 2, width: '100%', bgcolor: 'grey.50' }}>
              <Typography variant="body1" textAlign="center">
                {qrCode.content}
              </Typography>
            </Paper>
            <Button
              variant="outlined"
              onClick={() => navigate('/crm/power-tools')}
            >
              Back to Power Tools
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
