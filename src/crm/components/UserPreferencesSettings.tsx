import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  TextField,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TableViewRoundedIcon from "@mui/icons-material/TableViewRounded";
import PrivacyTipRoundedIcon from "@mui/icons-material/PrivacyTipRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { useUserPreferences, UserPreferences } from "../hooks/useUserPreferences";

interface UserPreferencesSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function UserPreferencesSettings({ open, onClose }: UserPreferencesSettingsProps) {
  const { preferences, updatePreferences, updateNestedPreference, resetPreferences, exportPreferences, importPreferences } = useUserPreferences();
  const [expandedPanel, setExpandedPanel] = React.useState<string | false>("appearance");

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleExport = () => {
    const data = exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importPreferences(content)) {
          alert('Preferences imported successfully!');
        } else {
          alert('Failed to import preferences. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SettingsRoundedIcon />
          <Typography variant="h5">User Preferences</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Your preferences are automatically saved and will persist across sessions.
          </Alert>

          {/* Appearance Settings */}
          <Accordion expanded={expandedPanel === 'appearance'} onChange={handleAccordionChange('appearance')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PaletteRoundedIcon />
                <Typography variant="h6">Appearance & Theme</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={preferences.theme}
                      label="Theme"
                      onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' | 'auto' })}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto (System)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Font Size</InputLabel>
                    <Select
                      value={preferences.appearance.fontSize}
                      label="Font Size"
                      onChange={(e) => updateNestedPreference('appearance', { fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.appearance.roundedCorners}
                          onChange={(e) => updateNestedPreference('appearance', { roundedCorners: e.target.checked })}
                        />
                      }
                      label="Rounded corners"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.appearance.animations}
                          onChange={(e) => updateNestedPreference('appearance', { animations: e.target.checked })}
                        />
                      }
                      label="Enable animations"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.compactMode}
                          onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
                        />
                      }
                      label="Compact mode"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Dashboard Settings */}
          <Accordion expanded={expandedPanel === 'dashboard'} onChange={handleAccordionChange('dashboard')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <DashboardRoundedIcon />
                <Typography variant="h6">Dashboard</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Layout</InputLabel>
                    <Select
                      value={preferences.dashboard.layout}
                      label="Layout"
                      onChange={(e) => updateNestedPreference('dashboard', { layout: e.target.value as 'grid' | 'list' })}
                    >
                      <MenuItem value="grid">Grid</MenuItem>
                      <MenuItem value="list">List</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Card Size</InputLabel>
                    <Select
                      value={preferences.dashboard.cardSize}
                      label="Card Size"
                      onChange={(e) => updateNestedPreference('dashboard', { cardSize: e.target.value as 'small' | 'medium' | 'large' })}
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Auto-refresh interval (minutes)</Typography>
                  <Slider
                    value={preferences.dashboard.refreshInterval}
                    onChange={(_, value) => updateNestedPreference('dashboard', { refreshInterval: value as number })}
                    min={1}
                    max={60}
                    marks={[
                      { value: 1, label: '1m' },
                      { value: 5, label: '5m' },
                      { value: 15, label: '15m' },
                      { value: 30, label: '30m' },
                      { value: 60, label: '1h' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.dashboard.showStats}
                        onChange={(e) => updateNestedPreference('dashboard', { showStats: e.target.checked })}
                      />
                    }
                    label="Show statistics cards"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Table Settings */}
          <Accordion expanded={expandedPanel === 'table'} onChange={handleAccordionChange('table')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TableViewRoundedIcon />
                <Typography variant="h6">Tables & Lists</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Page Size</InputLabel>
                    <Select
                      value={preferences.table.pageSize}
                      label="Page Size"
                      onChange={(e) => updateNestedPreference('table', { pageSize: e.target.value as number })}
                    >
                      <MenuItem value={10}>10 rows</MenuItem>
                      <MenuItem value={25}>25 rows</MenuItem>
                      <MenuItem value={50}>50 rows</MenuItem>
                      <MenuItem value={100}>100 rows</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Density</InputLabel>
                    <Select
                      value={preferences.table.density}
                      label="Density"
                      onChange={(e) => updateNestedPreference('table', { density: e.target.value as 'compact' | 'standard' | 'comfortable' })}
                    >
                      <MenuItem value="compact">Compact</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="comfortable">Comfortable</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.table.showFilters}
                        onChange={(e) => updateNestedPreference('table', { showFilters: e.target.checked })}
                      />
                    }
                    label="Show table filters by default"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Notifications */}
          <Accordion expanded={expandedPanel === 'notifications'} onChange={handleAccordionChange('notifications')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <NotificationsRoundedIcon />
                <Typography variant="h6">Notifications</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.email}
                      onChange={(e) => updateNestedPreference('notifications', { email: e.target.checked })}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.sms}
                      onChange={(e) => updateNestedPreference('notifications', { sms: e.target.checked })}
                    />
                  }
                  label="SMS notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.push}
                      onChange={(e) => updateNestedPreference('notifications', { push: e.target.checked })}
                    />
                  }
                  label="Push notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.desktop}
                      onChange={(e) => updateNestedPreference('notifications', { desktop: e.target.checked })}
                    />
                  }
                  label="Desktop notifications"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Privacy Settings */}
          <Accordion expanded={expandedPanel === 'privacy'} onChange={handleAccordionChange('privacy')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <PrivacyTipRoundedIcon />
                <Typography variant="h6">Privacy & Data</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.privacy.shareAnalytics}
                      onChange={(e) => updateNestedPreference('privacy', { shareAnalytics: e.target.checked })}
                    />
                  }
                  label="Share anonymous usage analytics"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.privacy.saveSearchHistory}
                      onChange={(e) => updateNestedPreference('privacy', { saveSearchHistory: e.target.checked })}
                    />
                  }
                  label="Save search history"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.privacy.rememberFilters}
                      onChange={(e) => updateNestedPreference('privacy', { rememberFilters: e.target.checked })}
                    />
                  }
                  label="Remember table filters and sorting"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Import/Export */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Backup & Restore
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={handleExport}
              >
                Export Settings
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadRoundedIcon />}
              >
                Import Settings
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleImport}
                />
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestoreRoundedIcon />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all preferences to default?')) {
                    resetPreferences();
                  }
                }}
              >
                Reset to Defaults
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
