import * as React from "react";
import {
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Avatar,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import "./crm-side-menu.css";
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
    <div className="crm-user-selector">
      <FormControl fullWidth size="small">
        <Select
          labelId="user-select-label"
          id="user-select"
          value={user.id}
          onChange={handleChange}
          renderValue={(value) => {
            const selectedUser = users.find(u => u.id === value);
            return selectedUser ? (
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
                <Chip
                  label={userData.role}
                  size="small"
                  color={getRoleColor(userData.role) as any}
                  variant="outlined"
                />
              </div>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem value="logout">
            <div className="crm-menu-item-row crm-logout-row">
              <LogoutRoundedIcon />
              <div className="crm-logout-text">Logout</div>
            </div>
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
