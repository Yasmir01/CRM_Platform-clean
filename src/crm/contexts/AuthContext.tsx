// src/crm/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type UserRole =
  | "tenant"
  | "owner"
  | "admin"
  | "manager"
  | "vendor"
  | "superadmin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  updateProfile: (updates: Partial<Pick<User, "name" | "avatar">>) => void;
  logout: () => void;
  themeColor: string; // 🔑 added
}

const STORAGE_KEY = "auth_user";

const roleColors: Record<UserRole, string> = {
  tenant: "#1976d2", // Blue
  owner: "#2e7d32", // Green
  admin: "#6a1b9a", // Purple
  manager: "#0288d1", // Cyan
  vendor: "#ff9800", // Orange
  superadmin: "#d32f2f", // Red
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const updateProfile = (updates: Partial<Pick<User, "name" | "avatar">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const themeColor = user?.role ? roleColors[user.role] : "#1976d2"; // Default blue

  return (
    <AuthContext.Provider
      value={{ user, login, updateProfile, logout, themeColor }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
