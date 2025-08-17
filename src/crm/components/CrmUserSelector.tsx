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

  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth size="small">
        <Select
          labelId="user-select-label"
          id="user-select"
          value={selectedUser}
          onChange={handleChange}
          renderValue={(value) => {
            const user = mockUsers.find(u => u.id === value);
            return user ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    bgcolor: `${user.color}.light`,
                    fontSize: '0.75rem'
                  }}
                >
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
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
          {mockUsers.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: `${user.color}.light`,
                    fontSize: '0.875rem'
                  }}
                >
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.color as any}
                  variant="outlined"
                />
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
