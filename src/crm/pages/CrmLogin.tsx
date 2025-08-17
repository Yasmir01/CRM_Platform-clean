import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(2),
}));

const LoginCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 500,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
}));

const LogoBox = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(2),
}));

const DemoUsersSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[900],
  }),
}));

export default function CrmLogin() {
  const { login, resetPassword, users } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccess(result.message);
        navigate("/crm");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword("demo123"); // Demo password
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await login(userEmail, "demo123");
      if (result.success) {
        setSuccess(result.message);
        navigate("/crm");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setSuccess(result.message);
        setForgotPasswordOpen(false);
        setResetEmail("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Property Manager': return 'primary';
      case 'Tenant': return 'info';
      case 'Service Provider': return 'warning';
      default: return 'default';
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <LogoBox>
              <BusinessRoundedIcon sx={{ color: "white", fontSize: 32 }} />
            </LogoBox>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              PropCRM
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Property Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: <EmailRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <LockRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                required
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, fontSize: "1.1rem" }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{ textDecoration: "none" }}
                >
                  Forgot your password?
                </Link>
              </Box>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <DemoUsersSection>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Demo Users - Quick Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
              Click any user below to log in instantly (password: demo123)
            </Typography>
            <Stack spacing={1}>
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickLogin(user.email)}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    textTransform: "none",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: "auto" }}>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role) as any}
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </Button>
              ))}
            </Stack>
          </DemoUsersSection>
        </CardContent>
      </LoginCard>

      {/* Password Reset Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a new password.
            This will open your default email client.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordReset}>
            Send Password Reset
          </Button>
        </DialogActions>
      </Dialog>
    </LoginContainer>
  );
}
