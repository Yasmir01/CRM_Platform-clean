import React, { useState, useRef, useCallback, createContext, useContext } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  useTheme,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  AspectRatio as ResizeIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  isVisible: boolean;
}

interface LayoutManagerContextType {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  layouts: Record<string, WidgetLayout>;
  updateLayout: (id: string, newLayout: Partial<WidgetLayout>) => void;
  getStorageKey: () => string;
}

const LayoutManagerContext = createContext<LayoutManagerContextType | null>(null);

export const useLayoutManager = () => {
  const context = useContext(LayoutManagerContext);
  if (!context) {
    throw new Error('useLayoutManager must be used within a LayoutManagerProvider');
  }
  return context;
};

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultLayout?: Partial<WidgetLayout>;
  className?: string;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  title,
  children,
  defaultLayout = {},
  className = '',
}) => {
  const theme = useTheme();
  const { isEditMode, layouts, updateLayout } = useLayoutManager();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Get layout with defaults
  const layout = layouts[id] || {
    id,
    x: defaultLayout.x || 20,
    y: defaultLayout.y || 20,
    width: defaultLayout.width || 400,
    height: defaultLayout.height || 300,
    minWidth: defaultLayout.minWidth || 200,
    minHeight: defaultLayout.minHeight || 150,
    maxWidth: defaultLayout.maxWidth || 800,
    maxHeight: defaultLayout.maxHeight || 600,
    isVisible: defaultLayout.isVisible !== false,
    ...defaultLayout,
  };

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - layout.x,
      y: e.clientY - layout.y,
    });
  }, [isEditMode, layout.x, layout.y]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, e.clientX - dragStart.x);
    const newY = Math.max(0, e.clientY - dragStart.y);
    updateLayout(id, { x: newX, y: newY });
  }, [isDragging, dragStart, id, updateLayout]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsResizing(true);
  }, [isEditMode]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newWidth = Math.max(
      layout.minWidth,
      Math.min(layout.maxWidth, e.clientX - rect.left)
    );
    const newHeight = Math.max(
      layout.minHeight,
      Math.min(layout.maxHeight, e.clientY - rect.top)
    );
    
    updateLayout(id, { width: newWidth, height: newHeight });
  }, [isResizing, id, layout.minWidth, layout.maxWidth, layout.minHeight, layout.maxHeight, updateLayout]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  if (!layout.isVisible && !isEditMode) {
    return null;
  }

  return (
    <Paper
      ref={widgetRef}
      elevation={isEditMode ? 8 : 2}
      className={`draggable-widget ${isDragging ? 'dragging' : ''} ${className}`}
      sx={{
        position: 'absolute',
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: layout.height,
        cursor: isDragging ? 'grabbing' : isEditMode ? 'grab' : 'default',
        border: isEditMode ? '2px dashed #2196f3' : 'none',
        borderRadius: 2,
        overflow: 'hidden',
        transition: isEditMode ? 'none' : 'all 0.2s ease',
        zIndex: isDragging || isResizing ? 1000 : isEditMode ? 10 : 1,
        pointerEvents: 'auto',
        opacity: !layout.isVisible && isEditMode ? 0.5 : 1,
        '&:hover': isEditMode ? {
          boxShadow: 4,
        } : {},
        // Fix interaction issues
        '& input, & textarea, & select, & button': {
          pointerEvents: 'auto',
          cursor: 'auto',
        },
        // Enhanced dark mode styling
        ...(theme.palette.mode === 'dark' && {
          bgcolor: 'rgba(0,0,0,0.6)',
          border: isEditMode ? '2px dashed #90caf9' : '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        })
      }}
    >
      {isEditMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 32,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            px: 1,
            zIndex: 10,
            cursor: 'grab',
          }}
          onMouseDown={handleDragStart}
        >
          <DragIcon sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="caption" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          <Tooltip title="Toggle Visibility">
            <IconButton
              size="small"
              sx={{ color: 'white' }}
              onClick={() => updateLayout(id, { isVisible: !layout.isVisible })}
            >
              {layout.isVisible ? '👁️' : '🙈'}
            </IconButton>
          </Tooltip>
          <Tooltip title="Resize">
            <IconButton
              size="small"
              sx={{ color: 'white', cursor: 'nw-resize' }}
              onMouseDown={handleResizeStart}
            >
              <ResizeIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <Box
        sx={{
          height: '100%',
          pt: isEditMode ? 4 : 0,
          overflow: 'hidden',
          pointerEvents: isDragging ? 'none' : 'auto',
          // Ensure all interactive elements work properly
          '& input, & textarea, & select, & button': {
            pointerEvents: 'auto !important',
            cursor: 'auto !important',
          },
          '& .MuiTextField-root': {
            pointerEvents: 'auto !important',
          },
          '& .MuiSelect-root': {
            pointerEvents: 'auto !important',
          },
        }}
      >
        {children}
      </Box>

      {isEditMode && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            bgcolor: 'primary.main',
            cursor: 'nw-resize',
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </Paper>
  );
};

interface UniversalDashboardLayoutProps {
  children: React.ReactNode;
  storageKey?: string;
  defaultLayouts?: Record<string, Partial<WidgetLayout>>;
}

const UniversalDashboardLayout: React.FC<UniversalDashboardLayoutProps> = ({ 
  children, 
  storageKey = 'universal-dashboard-layout',
  defaultLayouts = {}
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, WidgetLayout>>({});
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // Load saved layout on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedLayouts = JSON.parse(saved);
        setLayouts(savedLayouts);
      } catch (e) {
        console.warn('Failed to load saved layout');
      }
    }
  }, [storageKey]);

  const updateLayout = useCallback((id: string, newLayout: Partial<WidgetLayout>) => {
    setLayouts(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        ...defaultLayouts[id],
        ...newLayout,
        id
      },
    }));
  }, [defaultLayouts]);

  const handleSaveLayout = () => {
    localStorage.setItem(storageKey, JSON.stringify(layouts));
    setSaveDialogOpen(false);
    setIsEditMode(false);
  };

  const handleLoadLayout = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setLayouts(JSON.parse(saved));
    }
    setSettingsAnchor(null);
  };

  const handleResetLayout = () => {
    setLayouts({});
    localStorage.removeItem(storageKey);
    setSettingsAnchor(null);
  };

  const contextValue: LayoutManagerContextType = {
    isEditMode,
    setIsEditMode,
    layouts,
    updateLayout,
    getStorageKey: () => storageKey,
  };

  return (
    <LayoutManagerContext.Provider value={contextValue}>
      <Box sx={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'visible' }}>
        {/* Floating Controls */}
        <Fab
          color="primary"
          size="small"
          sx={{
            position: 'fixed',
            top: 90,
            right: 20,
            zIndex: 2000,
          }}
          onClick={(e) => setSettingsAnchor(e.currentTarget)}
        >
          <SettingsIcon />
        </Fab>

        <Fab
          color={isEditMode ? "secondary" : "primary"}
          size="small"
          sx={{
            position: 'fixed',
            top: 140,
            right: 20,
            zIndex: 2000,
          }}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <EditIcon />
        </Fab>

        {/* Settings Menu */}
        {settingsAnchor && (
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={() => setSettingsAnchor(null)}
          >
            <MenuItem onClick={handleLoadLayout}>
              <RestoreIcon sx={{ mr: 1 }} />
              Load Saved Layout
            </MenuItem>
            <MenuItem onClick={handleResetLayout}>
              <RestoreIcon sx={{ mr: 1 }} />
              Reset to Default
            </MenuItem>
            <MenuItem onClick={() => { setSaveDialogOpen(true); setSettingsAnchor(null); }}>
              <SaveIcon sx={{ mr: 1 }} />
              Save Current Layout
            </MenuItem>
          </Menu>
        )}

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Save Layout</DialogTitle>
          <DialogContent>
            <Typography>
              Save the current widget positions and sizes as your default layout?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveLayout} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Help Text */}
        {isEditMode && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'primary.main',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              zIndex: 2000,
            }}
          >
            <Typography variant="body2">
              🎯 Drag widgets by header • Resize using corners • Toggle visibility with eye icon • Save when done
            </Typography>
          </Box>
        )}

        {/* Render widgets */}
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          const widgetId = child.props?.['data-widget-id'];
          const widgetTitle = child.props?.['data-widget-title'] || 'Widget';
          const defaultLayout = child.props?.['data-default-layout'];
          
          if (!widgetId) return child;
          
          return (
            <DraggableWidget
              key={widgetId}
              id={widgetId}
              title={widgetTitle}
              defaultLayout={defaultLayout}
            >
              {child}
            </DraggableWidget>
          );
        })}
      </Box>
    </LayoutManagerContext.Provider>
  );
};

export default UniversalDashboardLayout;
export { DraggableWidget };
