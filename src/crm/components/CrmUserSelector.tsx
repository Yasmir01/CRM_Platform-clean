import * as React from "react";
import {
  Box,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Avatar,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../contexts/AuthContext";

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin': return 'error';
    case 'Property Manager': return 'primary';
    case 'Tenant': return 'info';
    case 'Service Provider': return 'warning';
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
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth size="small">
        <Select
          labelId="user-select-label"
          id="user-select"
          value={user.id}
          onChange={handleChange}
          renderValue={(value) => {
            const selectedUser = users.find(u => u.id === value);
            return selectedUser ? (
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
                <Chip
                  label={userData.role}
                  size="small"
                  color={getRoleColor(userData.role) as any}
                  variant="outlined"
                />
              </Stack>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem value="logout">
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
  );
}
