import React, { useState } from "react";
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

type Notification = {
  id: string;
  message: string;
  date: string;
  read: boolean;
};

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications] = useState<Notification[]>([
    { id: "1", message: "Payment of $1800 received from Alex Tenant", date: new Date().toISOString(), read: false },
    { id: "2", message: "Lease 2B expiring in 30 days", date: new Date().toISOString(), read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} aria-label="notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {notifications.length === 0 ? (
          <MenuItem>
            <ListItemText>No notifications</ListItemText>
          </MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem key={n.id}>
              <ListItemText
                primary={<Typography>{n.message}</Typography>}
                secondary={new Date(n.date).toLocaleString()}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
