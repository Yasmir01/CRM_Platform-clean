import * as React from 'react';

interface AutoSaveOptions {
  delay?: number; // milliseconds
  key?: string; // localStorage key
  onSave?: (data: any) => void; // custom save function
  enabled?: boolean;
  shouldWarnBeforeUnload?: boolean; // whether to show beforeunload warning
}

interface AutoSaveState {
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const useAutoSave = <T>(
  data: T,
  options: AutoSaveOptions = {}
) => {
  const {
    delay = 5000, // 5 seconds default
    key = 'autoSave',
    onSave,
    enabled = true,
    shouldWarnBeforeUnload = true
  } = options;

  const [state, setState] = React.useState<AutoSaveState>({
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false
  });

  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();
  const lastDataRef = React.useRef<T>(data);
  const hasChangedRef = React.useRef(false);

  // Save function
  const save = React.useCallback(async () => {
    if (!enabled || !hasChangedRef.current) return;
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      if (onSave) {
        await onSave(data);
      } else if (key) {
        localStorage.setItem(key, JSON.stringify(data));
      }
      
      setState(prev => ({
        ...prev,
        lastSaved: new Date(),
        isSaving: false,
        hasUnsavedChanges: false
      }));
      
      hasChangedRef.current = false;
      lastDataRef.current = data;
    } catch (error) {
      console.error('Auto-save failed:', error);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [data, enabled, onSave, key]);

  // Manual save function
  const forceSave = React.useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    save();
  }, [save]);

  // Load function (for initial load from localStorage)
  const load = React.useCallback(() => {
    if (!key) return null;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
      return null;
    }
  }, [key]);

  // Clear saved data
  const clearSaved = React.useCallback(() => {
    if (key) {
      localStorage.removeItem(key);
    }
    setState(prev => ({ ...prev, hasUnsavedChanges: false, lastSaved: null }));
    hasChangedRef.current = false;
  }, [key]);

  // Effect to detect changes and schedule auto-save
  React.useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    
    if (dataChanged) {
      hasChangedRef.current = true;
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Schedule new save
      saveTimeoutRef.current = setTimeout(() => {
        save();
      }, delay);
    }
  }, [data, delay, enabled, save]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save on page unload
  React.useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangedRef.current) {
        forceSave();
        if (shouldWarnBeforeUnload) {
          e.preventDefault();
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, forceSave, shouldWarnBeforeUnload]);

  return {
    ...state,
    save: forceSave,
    load,
    clearSaved,
    timeSinceLastSave: state.lastSaved ? 
      Math.floor((Date.now() - state.lastSaved.getTime()) / 1000) : null
  };
};

// Hook for showing auto-save status
export const useAutoSaveStatus = (autoSaveState: AutoSaveState & { timeSinceLastSave: number | null }) => {
  const getStatusText = React.useCallback(() => {
    if (autoSaveState.isSaving) {
      return 'Saving...';
    }
    
    if (autoSaveState.hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    
    if (autoSaveState.lastSaved && autoSaveState.timeSinceLastSave !== null) {
      if (autoSaveState.timeSinceLastSave < 60) {
        return `Saved ${autoSaveState.timeSinceLastSave}s ago`;
      } else {
        const minutes = Math.floor(autoSaveState.timeSinceLastSave / 60);
        return `Saved ${minutes}m ago`;
      }
    }
    
    return 'Not saved';
  }, [autoSaveState]);

  const getStatusColor = React.useCallback(() => {
    if (autoSaveState.isSaving) return 'info';
    if (autoSaveState.hasUnsavedChanges) return 'warning';
    if (autoSaveState.lastSaved) return 'success';
    return 'default';
  }, [autoSaveState]);

  return {
    statusText: getStatusText(),
    statusColor: getStatusColor()
  };
};

export default useAutoSave;
