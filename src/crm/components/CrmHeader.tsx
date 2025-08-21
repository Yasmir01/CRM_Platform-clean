import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuButton from "../../dashboard/components/MenuButton";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import CrmSearch from "./CrmSearch";
import CrmNavbarBreadcrumbs from "./CrmNavbarBreadcrumbs";
import CrmDateRangePicker from "./CrmDateRangePicker";
import Button from "@mui/material/Button";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { useNotifications } from "../contexts/NotificationsContext";
import { useMode } from "../contexts/ModeContext";
import { useAuth } from "../contexts/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

export default function CrmHeader() {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const { currentMode, isManagementMode, isTenantMode, toggleMode, canSwitchToTenantMode, canSwitchToManagementMode } = useMode();
  const [notificationsAnchor, setNotificationsAnchor] = React.useState<HTMLElement | null>(null);
  const [selectedTenant, setSelectedTenant] = React.useState('');

  // Mock tenant data - in real app this would come from API
  const mockTenants = [
    { id: '1', name: 'Sarah Johnson', property: 'Sunset Apartments - Unit 205' },
    { id: '2', name: 'Mike Chen', property: 'Downtown Plaza - Unit 1401' },
    { id: '3', name: 'Alex Thompson', property: 'Garden View Complex - Unit 3B' },
    { id: '4', name: 'Maria Rodriguez', property: 'Harbor Heights - Unit 507' },
    { id: '5', name: 'David Kim', property: 'Riverside Towers - Unit 2205' },
  ];

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction="column" spacing={1}>
        <CrmNavbarBreadcrumbs />
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            CRM Dashboard
          </Typography>
          <Chip
            icon={isManagementMode ? <BusinessRoundedIcon /> : <HomeRoundedIcon />}
            label={isManagementMode ? "Management Mode" : "Tenant Mode"}
            color={isManagementMode ? "primary" : "secondary"}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 600,
              height: 28,
              '& .MuiChip-icon': { fontSize: 16 }
            }}
          />
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        {/* Tenant Selector - Show when in tenant mode for management users */}
        {isTenantMode && (user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Property Manager') && (
          <FormControl size="small" sx={{ minWidth: 250, mr: 1 }}>
            <InputLabel>Select Tenant</InputLabel>
            <Select
              value={selectedTenant}
              label="Select Tenant"
              onChange={(e) => setSelectedTenant(e.target.value)}
            >
              {mockTenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {tenant.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tenant.property}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Mode Switch - Show based on user permissions */}
        {(canSwitchToTenantMode || canSwitchToManagementMode) && user?.role !== 'Tenant' && (
          <Tooltip
            title={isManagementMode
              ? "Switch to Tenant Mode (simplified view for troubleshooting tenant experience)"
              : "Switch to Management Mode (full CRM access)"}
            arrow
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              mr: 1
            }}>
              <BusinessRoundedIcon
                color={isManagementMode ? "primary" : "disabled"}
                fontSize="small"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isTenantMode}
                    onChange={toggleMode}
                    size="small"
                    color="secondary"
                    disabled={!canSwitchToTenantMode && isTenantMode}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
              <HomeRoundedIcon
                color={isTenantMode ? "secondary" : "disabled"}
                fontSize="small"
              />
            </Box>
          </Tooltip>
        )}

        {/* Show user role for tenant users */}
        {user?.role === 'Tenant' && (
          <Chip
            icon={<HomeRoundedIcon />}
            label="Tenant Account"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
        )}
        <CrmSearch />
        <CrmDateRangePicker
          onChange={(range) => {
            console.log('Date range changed:', range);
          }}
        />
        <MenuButton
          aria-label="Open notifications"
          onClick={handleNotificationsClick}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsRoundedIcon />
          </Badge>
        </MenuButton>
        <NotificationsDropdown
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
        />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
