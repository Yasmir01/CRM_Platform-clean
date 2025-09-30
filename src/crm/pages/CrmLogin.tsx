// src/pages/CrmLogin.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../crm/contexts/AuthContext";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
} from "@mui/material";

export default function CrmLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: "tenant" | "owner" | "admin" | "superadmin") => {
    // Demo profiles for each role
    const profiles = {
      tenant: {
        id: "1",
        name: "John Tenant",
        role: "tenant" as const,
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      owner: {
        id: "2",
        name: "Olivia Owner",
        role: "owner" as const,
        avatar: "https://i.pravatar.cc/150?img=5",
      },
      admin: {
        id: "3",
        name: "Alice Admin",
        role: "admin" as const,
        avatar: "https://i.pravatar.cc/150?img=7",
      },
      superadmin: {
        id: "4",
        name: "Sam SuperAdmin",
        role: "superadmin" as const,
        avatar: "https://i.pravatar.cc/150?img=9",
      },
    };

    const user = profiles[role];
    login(user);

    // Redirect by role
    switch (role) {
      case "tenant":
        navigate("/tenant/dashboard");
        break;
      case "owner":
        navigate("/owner/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "superadmin":
        navigate("/superadmin/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", p: 3, textAlign: "center" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Login (Demo Mode)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a role to simulate login:
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="outlined"
              onClick={() => handleLogin("tenant")}
              startIcon={<Avatar src="https://i.pravatar.cc/150?img=3" />}
            >
              Login as Tenant
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleLogin("owner")}
              startIcon={<Avatar src="https://i.pravatar.cc/150?img=5" />}
            >
              Login as Owner
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleLogin("admin")}
              startIcon={<Avatar src="https://i.pravatar.cc/150?img=7" />}
            >
              Login as Admin
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleLogin("superadmin")}
              startIcon={<Avatar src="https://i.pravatar.cc/150?img=9" />}
            >
              Login as Super Admin
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
