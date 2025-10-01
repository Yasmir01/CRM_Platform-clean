import React from "react";
import { Paper, Typography } from "@mui/material";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemedCard({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Paper sx={{ borderLeft: `5px solid ${theme.accent}`, p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ color: theme.accent, mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
