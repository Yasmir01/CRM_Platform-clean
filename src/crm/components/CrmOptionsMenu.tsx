import * as React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import BrightnessHighRoundedIcon from "@mui/icons-material/BrightnessHighRounded";
import BrightnessLowRoundedIcon from "@mui/icons-material/BrightnessLowRounded";

export default function CrmOptionsMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [brightness, setBrightness] = React.useState(100);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  const handleAccountSettingsClick = () => {
    navigate('/account-settings');
    handleClose();
  };

  const handleSignOut = () => {
    // Here you would typically clear authentication tokens
    alert('Signing out...');
    // navigate('/sign-in');
    handleClose();
  };

  const handleBrightnessChange = (event: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setBrightness(value);

    // Apply brightness filter to the entire page
    document.body.style.filter = `brightness(${value}%)`;

    // Save to localStorage for persistence
    localStorage.setItem('crm-brightness', value.toString());
  };

  // Load saved brightness on component mount
  React.useEffect(() => {
    const savedBrightness = localStorage.getItem('crm-brightness');
    if (savedBrightness) {
      const value = parseInt(savedBrightness);
      setBrightness(value);
      document.body.style.filter = `brightness(${value}%)`;
    }
  }, []);

  return (
    <Box>
      <IconButton
        aria-label="more options"
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
      >
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAccountSettingsClick}>
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Account Settings</ListItemText>
        </MenuItem>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Screen Brightness
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <BrightnessLowRoundedIcon fontSize="small" />
            <Slider
              value={brightness}
              onChange={handleBrightnessChange}
              min={30}
              max={150}
              size="small"
              sx={{ width: 120 }}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
            <BrightnessHighRoundedIcon fontSize="small" />
          </Stack>
        </Box>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <ExitToAppRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
