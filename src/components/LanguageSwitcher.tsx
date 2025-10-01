import React from "react";
import { useLanguage } from "../crm/contexts/LanguageContext";
import { Select, MenuItem } from "@mui/material";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <Select
      value={language}
      onChange={(e) => changeLanguage(e.target.value as string)}
      size="small"
      sx={{ minWidth: 100 }}
    >
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="es">Español</MenuItem>
      <MenuItem value="fr">Français</MenuItem>
    </Select>
  );
}
