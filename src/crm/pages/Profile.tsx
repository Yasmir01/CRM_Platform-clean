import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  Button,
  TextField,
  Grid,
  Paper,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { useCrmData } from "../contexts/CrmDataContext";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  profilePicture?: string;
  preferredLanguage: string;
  timezone: string;
  countryCode: string;
  linkedPropertyId?: string;
  lastLogin: string;
  accountCreated: string;
  loginCount: number;
}

const mockProfile: UserProfile = {
  id: "1",
  firstName: "Alex",
  lastName: "Thompson",
  email: "alex@acmecrm.com",
  phone: "+1 (555) 123-4567",
  role: "Super Admin",
  department: "Management",
  profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  preferredLanguage: "en",
  timezone: "America/New_York",
  countryCode: "US",
  lastLogin: "2024-01-30T09:00:00Z",
  accountCreated: "2024-01-01T00:00:00Z",
  loginCount: 247,
};

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日��語" },
  { code: "ko", name: "한국어" },
  { code: "ar", name: "العربية" },
];

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "AE", name: "UAE" },
  { code: "AU", name: "Australia" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
];

export default function Profile() {
  const { state } = useCrmData();
  const { properties } = state;
  const [profile, setProfile] = React.useState<UserProfile>(mockProfile);
  const [editMode, setEditMode] = React.useState(false);
  const [formData, setFormData] = React.useState(profile);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);

  // Keep formData synchronized with profile when not in edit mode
  React.useEffect(() => {
    if (!editMode) {
      setFormData(profile);
    }
  }, [profile, editMode]);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditToggle = () => {
    if (editMode) {
      // Check for unsaved changes before canceling
      if (hasUnsavedChanges()) {
        const confirmCancel = window.confirm(
          "You have unsaved changes. Are you sure you want to cancel? All changes will be lost."
        );
        if (!confirmCancel) {
          return; // Don't cancel if user chooses to stay
        }
      }
      // Reset form data to current profile values when canceling
      setFormData({ ...profile });
    } else {
      // Sync form data with current profile when starting to edit
      setFormData({ ...profile });
    }
    setEditMode(!editMode);
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First name and last name are required!");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("Please enter a valid email address!");
      return;
    }

    // Update profile with new data
    setProfile({ ...formData });
    setEditMode(false);

    // Here you would typically send the data to your API
    // For demo purposes, we'll simulate a successful save
    console.log("Profile saved:", formData);
    alert(`Profile updated successfully! Welcome, ${formData.firstName} ${formData.lastName}!`);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    // Here you would validate current password and update
    alert("Password updated successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordDialogOpen(false);
  };

  const getLanguageName = (code: string) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  const getTimezoneName = (value: string) => {
    return timezones.find(t => t.value === value)?.label || value;
  };

  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code;
  };

  const detectAndSetLocalTimezone = () => {
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setFormData({ ...formData, timezone: localTimezone });

    // Show notification about detected timezone
    const timezoneName = getTimezoneName(localTimezone) || localTimezone;
    console.log(`Local timezone detected: ${localTimezone} (${timezoneName})`);
  };

  const hasUnsavedChanges = () => {
    return editMode && (
      formData.firstName !== profile.firstName ||
      formData.lastName !== profile.lastName ||
      formData.email !== profile.email ||
      formData.phone !== profile.phone ||
      formData.department !== profile.department ||
      formData.preferredLanguage !== profile.preferredLanguage ||
      formData.timezone !== profile.timezone ||
      formData.countryCode !== profile.countryCode
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1200px" }, mx: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
          {hasUnsavedChanges() && (
            <Chip
              label="Unsaved Changes"
              color="warning"
              size="small"
              sx={{ animation: 'pulse 2s infinite' }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<SecurityRoundedIcon />}
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change Password
          </Button>
          {editMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelRoundedIcon />}
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color={hasUnsavedChanges() ? "primary" : "success"}
                startIcon={<SaveRoundedIcon />}
                onClick={handleSave}
                disabled={!hasUnsavedChanges()}
                sx={{
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled'
                  }
                }}
              >
                {hasUnsavedChanges() ? "Save Changes" : "No Changes"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={handleEditToggle}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={2}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={profile.profilePicture}
                    sx={{ width: 120, height: 120, fontSize: "48px" }}
                  >
                    {`${profile.firstName[0]}${profile.lastName[0]}`}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                      size="small"
                    >
                      <PhotoCameraRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h5">
                    {profile.firstName} {profile.lastName}
                  </Typography>
                  <Chip label={profile.role} color="primary" />
                  {profile.department && (
                    <Typography variant="body2" color="text.secondary">
                      {profile.department}
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ width: "100%" }} />

                <Stack spacing={1} sx={{ width: "100%" }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LanguageRoundedIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {getLanguageName(profile.preferredLanguage)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeRoundedIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {getTimezoneName(profile.timezone)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnRoundedIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {getCountryName(profile.countryCode)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Statistics
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(profile.accountCreated).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Logins
                  </Typography>
                  <Typography variant="body1">
                    {profile.loginCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    disabled={!editMode}
                    value={editMode ? formData.firstName : profile.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    disabled={!editMode}
                    value={editMode ? formData.lastName : profile.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    disabled={!editMode}
                    value={editMode ? formData.email : profile.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    fullWidth
                    disabled={!editMode}
                    value={editMode ? formData.phone || "" : profile.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Department"
                    fullWidth
                    disabled={!editMode}
                    value={editMode ? formData.department || "" : profile.department || ""}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </Grid>
                {profile.linkedPropertyId && (
                  <Grid item xs={12} sm={6}>
                    {editMode ? (
                      <FormControl fullWidth>
                        <InputLabel>Linked Property</InputLabel>
                        <Select
                          value={formData.linkedPropertyId || ""}
                          label="Linked Property"
                          onChange={(e) => setFormData({ ...formData, linkedPropertyId: e.target.value })}
                        >
                          <MenuItem value="">
                            <em>No property linked</em>
                          </MenuItem>
                          {properties.map((property) => (
                            <MenuItem key={property.id} value={property.id}>
                              {property.name} - {property.address}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        label="Linked Property"
                        fullWidth
                        disabled
                        value={properties.find(p => p.id === profile.linkedPropertyId)?.name || profile.linkedPropertyId || "Not linked"}
                        helperText="Contact admin to change linked property"
                      />
                    )}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={editMode ? formData.preferredLanguage : profile.preferredLanguage}
                      label="Language"
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack spacing={1}>
                    <FormControl fullWidth disabled={!editMode}>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={editMode ? formData.timezone : profile.timezone}
                        label="Timezone"
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      >
                        {timezones.map((tz) => (
                          <MenuItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </MenuItem>
                        ))}
                        <MenuItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                          {Intl.DateTimeFormat().resolvedOptions().timeZone} (Your Local Timezone)
                        </MenuItem>
                      </Select>
                    </FormControl>
                    {editMode && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AccessTimeRoundedIcon />}
                        onClick={detectAndSetLocalTimezone}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Use Local Timezone
                      </Button>
                    )}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={editMode ? formData.countryCode : profile.countryCode}
                      label="Country"
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    >
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              For security reasons, you need to enter your current password to change it.
            </Alert>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              helperText="Password must be at least 8 characters long"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
