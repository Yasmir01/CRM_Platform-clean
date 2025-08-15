import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Divider,
  Avatar,
  Container,
  Paper
} from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';

interface SuperAdminLoginProps {
  onSuccess: (adminData: SuperAdminData) => void;
}

interface SuperAdminData {
  id: string;
  username: string;
  email: string;
  role: 'super_admin';
  permissions: string[];
  lastLogin: string;
}

const SUPER_ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'admin123!',
  email: 'admin@propertycrm.com'
};

export default function SuperAdminLogin({ onSuccess }: SuperAdminLoginProps) {
  const [credentials, setCredentials] = React.useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (
      credentials.username === SUPER_ADMIN_CREDENTIALS.username &&
      credentials.password === SUPER_ADMIN_CREDENTIALS.password
    ) {
      const adminData: SuperAdminData = {
        id: 'super_admin_001',
        username: SUPER_ADMIN_CREDENTIALS.username,
        email: SUPER_ADMIN_CREDENTIALS.email,
        role: 'super_admin',
        permissions: [
          'view_all_accounts',
          'manage_subscriptions',
          'activate_deactivate_accounts',
          'manage_user_roles',
          'view_system_analytics',
          'manage_billing',
          'system_configuration'
        ],
        lastLogin: new Date().toISOString()
      };

      onSuccess(adminData);
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }

    setIsLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper 
        elevation={8} 
        sx={{ 
          width: '100%', 
          p: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Avatar sx={{ 
            mx: 'auto', 
            mb: 2, 
            width: 64, 
            height: 64, 
            bgcolor: 'rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <AdminPanelSettingsRoundedIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Super Admin Access
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Master control panel for Property CRM system
          </Typography>
        </Box>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.95)', color: 'text.primary' }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Alert severity="info" icon={<SecurityRoundedIcon />}>
                  <Typography variant="body2" fontWeight="medium">
                    Secure Authentication Required
                  </Typography>
                  <Typography variant="caption">
                    This area is restricted to authorized super administrators only.
                  </Typography>
                </Alert>

                <TextField
                  label="Admin Username"
                  fullWidth
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />

                <TextField
                  label="Master Password"
                  type="password"
                  fullWidth
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />

                <Divider />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading || !credentials.username || !credentials.password}
                  startIcon={<LoginRoundedIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>

                <Alert severity="warning" variant="outlined">
                  <Typography variant="caption">
                    <strong>Demo Credentials:</strong><br />
                    Username: superadmin<br />
                    Password: admin123!
                  </Typography>
                </Alert>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Box textAlign="center" sx={{ mt: 3, opacity: 0.8 }}>
          <Typography variant="caption">
            Property CRM Super Admin • Secure Access Portal
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export type { SuperAdminData };
