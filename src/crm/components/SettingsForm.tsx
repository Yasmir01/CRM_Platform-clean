// src/crm/components/SettingsForm.tsx
import React, { useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsForm() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const handleSave = () => {
    updateProfile({ name, avatar });
    alert("Profile updated!");
  };

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      sx={{ maxWidth: 400 }}
    >
      <Stack spacing={2}>
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Avatar URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
}
