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
  Link,
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../crm/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const LoginContainer = styled(Box)(() => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)", // 🔵 Blue gradient
  padding: "16px",
}));

const LoginCard = styled(Card)(() => ({
  width: "100%",
  maxWidth: 500,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
}));

const LogoBox = styled(Box)(() => ({
  width: 64,
  height: 64,
  backgroundColor: "#1976d2",
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: 16,
}));

const DemoUsersSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
}));

// Demo user data
const DEMO_USERS = [
  { name: "John Tenant", email: "tenant@demo.com", role: "tenant" },
  { name: "Alice Owner", email: "owner@demo.com", role: "owner" },
  { name: "Bob Admin", email: "admin@demo.com", role: "admin" },
  { name: "Sophia SuperAdmin", email: "superadmin@demo.com", role: "superadmin" },
];

export default function CrmLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!email || !password) {
        setError("Please enter email and password");
        return;
      }

      // Fake role detection by email
      let role: "tenant" | "owner" | "admin" | "superadmin" = "tenant";
      if (email.includes("owner")) role = "owner";
      else if (email.includes("admin")) role = "admin";
      else if (email.includes("super")) role = "superadmin";

      login({ id: Date.now().toString(), name: email, role });

      setSuccess("Login successful!");

      switch (role) {
        case "tenant":
          navigate("/tenant/dashboard");
          break;
        case "owner":
          navigate("/owner");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "superadmin":
          navigate("/superadmin");
          break;
        default:
          navigate("/crm");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: typeof DEMO_USERS[number]) => {
    login({ id: Date.now().toString(), name: user.name, role: user.role as any });
    switch (user.role) {
      case "tenant":
        navigate("/tenant/dashboard");
        break;
      case "owner":
        navigate("/owner");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "superadmin":
        navigate("/superadmin");
        break;
      default:
        navigate("/crm");
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
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: "#0d47a1" }}>
              PropCRM
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Property Management System
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Login Form */}
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
                <Link component="button" type="button" sx={{ textDecoration: "none" }}>
                  Forgot your password?
                </Link>
              </Box>
            </Stack>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR DEMO LOGIN
            </Typography>
          </Divider>

          {/* Demo Users */}
          <DemoUsersSection>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Quick Demo Login
            </Typography>
            <Stack spacing={1}>
              {DEMO_USERS.map((user) => (
                <Button
                  key={user.email}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleQuickLogin(user)}
                >
                  {user.name} <Chip label={user.role} size="small" sx={{ ml: 1 }} />
                </Button>
              ))}
            </Stack>
          </DemoUsersSection>
        </CardContent>
      </LoginCard>
    </LoginContainer>
  );
}
