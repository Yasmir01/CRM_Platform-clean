import * as React from "react";
import {
<<<<<<< HEAD
=======
  Box,
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Avatar,
  Typography,
<<<<<<< HEAD
  Chip,
  Divider,
} from "@mui/material";
import "./crm-side-menu.css";
=======
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../contexts/AuthContext";

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Super Admin': return 'success'; // Highest authority - green
    case 'Admin': return 'error'; // High authority - red
    case 'Manager': return 'secondary'; // Medium-high authority - purple
    case 'Property Manager': return 'primary'; // Medium authority - blue
    case 'User': return 'default'; // Standard user - grey
    case 'Tenant': return 'info'; // Lower authority - light blue
    case 'Service Provider': return 'warning'; // External - yellow
    default: return 'default';
  }
};

export default function CrmUserSelector() {
  const { user, users, switchUser, logout } = useAuth();

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    if (value === 'logout') {
      logout();
    } else {
      switchUser(value);
    }
  };

  if (!user) {
    return null; // User not logged in
  }

  return (
<<<<<<< HEAD
    <div className="crm-user-selector">
=======
    <Box sx={{ width: "100%" }}>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
      <FormControl fullWidth size="small">
        <Select
          labelId="user-select-label"
          id="user-select"
          value={user.id}
          onChange={handleChange}
          renderValue={(value) => {
            const selectedUser = users.find(u => u.id === value);
            return selectedUser ? (
<<<<<<< HEAD
              <div className="crm-select-value">
                <Avatar className="crm-avatar-sm">
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </Avatar>
                <div>
                  <div className="crm-select-name">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="crm-select-role">{selectedUser.role}</div>
                </div>
              </div>
            ) : null;
          }}
          className="crm-select"
        >
          {users.map((userData) => (
            <MenuItem key={userData.id} value={userData.id}>
              <div className="crm-menu-item-row">
                <Avatar className="crm-avatar-md">
                  {userData.firstName[0]}{userData.lastName[0]}
                </Avatar>
                <div className="crm-menu-item-info">
                  <div className="crm-menu-item-name">{userData.firstName} {userData.lastName}</div>
                  <div className="crm-menu-item-email">{userData.email}</div>
                </div>
=======
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: `${getRoleColor(selectedUser.role)}.light`,
                    fontSize: '0.75rem'
                  }}
                >
                  {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser.role}
                  </Typography>
                </Box>
              </Stack>
            ) : null;
          }}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              py: 1,
            },
          }}
        >
          {users.map((userData) => (
            <MenuItem key={userData.id} value={userData.id}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${getRoleColor(userData.role)}.light`,
                    fontSize: '0.875rem'
                  }}
                >
                  {userData.firstName[0]}{userData.lastName[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {userData.firstName} {userData.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userData.email}
                  </Typography>
                </Box>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
                <Chip
                  label={userData.role}
                  size="small"
                  color={getRoleColor(userData.role) as any}
                  variant="outlined"
                />
<<<<<<< HEAD
              </div>
=======
              </Stack>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
            </MenuItem>
          ))}
          <Divider />
          <MenuItem value="logout">
<<<<<<< HEAD
            <div className="crm-menu-item-row crm-logout-row">
              <LogoutRoundedIcon />
              <div className="crm-logout-text">Logout</div>
            </div>
          </MenuItem>
        </Select>
      </FormControl>
    </div>
=======
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', color: 'error.main' }}>
              <LogoutRoundedIcon />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Logout
              </Typography>
            </Stack>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  );
}
