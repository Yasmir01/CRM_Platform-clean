import * as React from 'react';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  compactMode: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    desktop: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    cardSize: 'small' | 'medium' | 'large';
    showStats: boolean;
    refreshInterval: number; // minutes
  };
  table: {
    pageSize: number;
    density: 'compact' | 'standard' | 'comfortable';
    showFilters: boolean;
  };
  sidebar: {
    collapsed: boolean;
    position: 'left' | 'right';
  };
  appearance: {
    fontSize: 'small' | 'medium' | 'large';
    roundedCorners: boolean;
    animations: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    saveSearchHistory: boolean;
    rememberFilters: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  currency: 'USD',
  compactMode: false,
  notifications: {
    email: true,
    sms: true,
    push: true,
    desktop: true,
  },
  dashboard: {
    layout: 'grid',
    cardSize: 'medium',
    showStats: true,
    refreshInterval: 5,
  },
  table: {
    pageSize: 25,
    density: 'standard',
    showFilters: true,
  },
  sidebar: {
    collapsed: false,
    position: 'left',
  },
  appearance: {
    fontSize: 'medium',
    roundedCorners: true,
    animations: true,
  },
  privacy: {
    shareAnalytics: true,
    saveSearchHistory: true,
    rememberFilters: true,
  },
};

const STORAGE_KEY = 'user-preferences';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = React.useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
    return defaultPreferences;
  });

  const updatePreferences = React.useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      } catch (error) {
        console.error('Failed to save user preferences:', error);
      }
      return newPreferences;
    });
  }, []);

  const updateNestedPreference = React.useCallback(<K extends keyof UserPreferences>(
    key: K,
    updates: Partial<UserPreferences[K]>
  ) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        [key]: { ...prev[key], ...updates }
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      } catch (error) {
        console.error('Failed to save user preferences:', error);
      }
      return newPreferences;
    });
  }, []);

  const resetPreferences = React.useCallback(() => {
    setPreferences(defaultPreferences);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPreferences));
    } catch (error) {
      console.error('Failed to reset user preferences:', error);
    }
  }, []);

  const exportPreferences = React.useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  const importPreferences = React.useCallback((data: string) => {
    try {
      const imported = JSON.parse(data);
      const merged = { ...defaultPreferences, ...imported };
      setPreferences(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }, []);

  // Apply theme changes to document
  React.useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (preferences.theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', preferences.theme);
      }
      
      // Apply font size
      const fontSizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      root.style.fontSize = fontSizeMap[preferences.appearance.fontSize];
      
      // Apply rounded corners
      root.style.setProperty('--border-radius', preferences.appearance.roundedCorners ? '8px' : '0px');
      
      // Apply animations
      if (!preferences.appearance.animations) {
        root.style.setProperty('--animation-duration', '0s');
      } else {
        root.style.removeProperty('--animation-duration');
      }
    };

    applyTheme();

    // Listen for system theme changes if using auto theme
    if (preferences.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [preferences.theme, preferences.appearance]);

  return {
    preferences,
    updatePreferences,
    updateNestedPreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };
};

export default useUserPreferences;
