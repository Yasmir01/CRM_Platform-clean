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
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

// Mock user data (would normally come from AuthContext)
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    role: 'Admin',
    email: 'admin@propcrm.com',
    color: 'error',
  },
  {
    id: '2',
    name: 'John Smith',
    role: 'Property Manager',
    email: 'john.smith@propcrm.com',
    color: 'primary',
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    role: 'Tenant',
    email: 'sarah.johnson@email.com',
    color: 'info',
  },
  {
    id: '4',
    name: 'Mike Wilson',
    role: 'Service Provider',
    email: 'mike@handyservices.com',
    color: 'warning',
  },
];

export default function CrmUserSelector() {
  const [selectedUser, setSelectedUser] = React.useState("1");

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedUser(event.target.value as string);
  };

  const currentUser = mockUsers.find(user => user.id === selectedUser);

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
