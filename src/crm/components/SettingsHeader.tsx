// src/crm/components/SettingsHeader.tsx
import React from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";
import useRoleTheme from "../theme/useRoleTheme";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsHeader({ title }: { title: string }) {
  const { themeColor } = useRoleTheme();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        backgroundColor: themeColor,
        color: "#fff",
        p: 2,
        borderRadius: "8px",
        mb: 3,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {user?.avatar ? (
          <Avatar src={user.avatar} alt={user.name} />
        ) : (
          <Avatar>{user?.name?.[0] ?? "U"}</Avatar>
        )}
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2">{user?.name}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {user?.role?.toUpperCase()}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
