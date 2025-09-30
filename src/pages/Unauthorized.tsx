// src/pages/Unauthorized.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        bgcolor: "#fafafa",
      }}
    >
      <Typography variant="h4" gutterBottom color="error">
        🚫 Access Denied
      </Typography>
      <Typography variant="body1" gutterBottom>
        You do not have permission to view this page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/login")}
        sx={{ mt: 2 }}
      >
        Return to Login
      </Button>
    </Box>
  );
}
