// src/crm/theme/useRoleTheme.ts
import { useAuth } from "../contexts/AuthContext";

export default function useRoleTheme() {
  const { themeColor } = useAuth();
  return { themeColor };
}
