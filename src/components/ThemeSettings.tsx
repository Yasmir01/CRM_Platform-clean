import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useAuth } from "../crm/contexts/AuthContext";

export default function ThemeSettings() {
  const { user } = useAuth();
  const roleKey = user?.role ? `themeColor_${user.role}` : "themeColor_global";

  const defaultColor = "#1976d2"; // Default blue
  const [color, setColor] = useState(defaultColor);
  const [savedColor, setSavedColor] = useState(defaultColor);

  // Load saved color when page loads
  useEffect(() => {
    const stored = localStorage.getItem(roleKey);
    if (stored) {
      setColor(stored);
      setSavedColor(stored);
    }
  }, [roleKey]);

  // Live update handler
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    localStorage.setItem(roleKey, newColor);
    window.dispatchEvent(new Event("storage")); // notify dashboards immediately
  };

  const handleSave = () => {
    localStorage.setItem(roleKey, color);
    setSavedColor(color);
    window.dispatchEvent(new Event("storage"));
    alert(`Theme color saved for ${user?.role || "all users"}!`);
  };

  const handleReset = () => {
    localStorage.setItem(roleKey, defaultColor);
    setColor(defaultColor);
    setSavedColor(defaultColor);
    window.dispatchEvent(new Event("storage"));
    alert(`Theme color reset to default for ${user?.role || "all users"}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Dashboard Theme Color
        </Typography>

        <Stack spacing={3}>
          {/* Color Picker */}
          <TextField
            type="color"
            label="Pick a color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            sx={{ width: 150 }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Live Header Preview */}
          <Box sx={{ border: "1px solid #ccc", borderRadius: 2, overflow: "hidden" }}>
            <AppBar position="static" sx={{ backgroundColor: color }}>
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {user?.role
                    ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`
                    : "Dashboard Preview"}
                </Typography>
                <Typography variant="body1">{user?.name || "John Doe"}</Typography>
              </Toolbar>
            </AppBar>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                This is a live preview of your dashboard header.  
                Move the color picker above to see it update instantly.
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={2}>
            {color !== savedColor && (
              <Button variant="contained" onClick={handleSave}>
                Save Color
              </Button>
            )}
            {color !== defaultColor && (
              <Button variant="outlined" color="secondary" onClick={handleReset}>
                Reset to Default
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
