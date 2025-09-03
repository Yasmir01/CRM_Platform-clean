import React, { useState, useRef, useCallback } from 'react';
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
  Slider,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DragIcon from '@mui/icons-material/DragIndicator';
import SettingsIcon from '@mui/icons-material/Settings';
import ResizeIcon from '@mui/icons-material/AspectRatio';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';;

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
}

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  layout: WidgetLayout;
  onLayoutChange: (id: string, newLayout: Partial<WidgetLayout>) => void;
  isEditMode: boolean;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  title,
  children,
  layout,
  onLayoutChange,
  isEditMode,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
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
    onLayoutChange(id, { x: newX, y: newY });
  }, [isDragging, dragStart, id, onLayoutChange]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: layout.width,
      height: layout.height,
    });
  }, [isEditMode, layout.width, layout.height]);

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
    
    onLayoutChange(id, { width: newWidth, height: newHeight });
  }, [isResizing, id, layout.minWidth, layout.maxWidth, layout.minHeight, layout.maxHeight, onLayoutChange]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

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

  return (
    <Paper
      ref={widgetRef}
      elevation={isEditMode ? 8 : 2}
      className={`draggable-widget ${isDragging ? 'dragging' : ''}`}
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
        '&:hover': isEditMode ? {
          boxShadow: 4,
        } : {},
        // Fix interaction issues
        '& input, & textarea, & select, & button': {
          pointerEvents: 'auto',
          cursor: 'auto',
        },
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
        sx={{ cursor: 'grab' }}
        >
          <DragIcon sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="caption" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {title}
          </Typography>
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

interface DashboardLayoutManagerProps {
  children: React.ReactNode;
}

const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, WidgetLayout>>({
    'upcoming-tasks': {
      id: 'upcoming-tasks',
      x: 20,
      y: 20,
      width: 400,
      height: 350,
      minWidth: 250,
      minHeight: 200,
      maxWidth: 800,
      maxHeight: 600,
    },
    'quick-insights': {
      id: 'quick-insights',
      x: 440,
      y: 20,
      width: 400,
      height: 350,
      minWidth: 250,
      minHeight: 200,
      maxWidth: 800,
      maxHeight: 600,
    },
    'recent-activities': {
      id: 'recent-activities',
      x: 20,
      y: 400,
      width: 820,
      height: 400,
      minWidth: 400,
      minHeight: 300,
      maxWidth: 1200,
      maxHeight: 800,
    },
  });
  
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleLayoutChange = useCallback((id: string, newLayout: Partial<WidgetLayout>) => {
    setLayouts(prev => ({
      ...prev,
      [id]: { ...prev[id], ...newLayout },
    }));
  }, []);

  const handleSaveLayout = () => {
    localStorage.setItem('crm-dashboard-layout', JSON.stringify(layouts));
    setSaveDialogOpen(false);
    setIsEditMode(false);
  };

  const handleLoadLayout = () => {
    const saved = localStorage.getItem('crm-dashboard-layout');
    if (saved) {
      setLayouts(JSON.parse(saved));
    }
    setSettingsAnchor(null);
  };

  const handleResetLayout = () => {
    setLayouts({
      'upcoming-tasks': {
        id: 'upcoming-tasks',
        x: 20,
        y: 20,
        width: 400,
        height: 350,
        minWidth: 250,
        minHeight: 200,
        maxWidth: 800,
        maxHeight: 600,
      },
      'quick-insights': {
        id: 'quick-insights',
        x: 440,
        y: 20,
        width: 400,
        height: 350,
        minWidth: 250,
        minHeight: 200,
        maxWidth: 800,
        maxHeight: 600,
      },
      'recent-activities': {
        id: 'recent-activities',
        x: 20,
        y: 400,
        width: 820,
        height: 400,
        minWidth: 400,
        minHeight: 300,
        maxWidth: 1200,
        maxHeight: 800,
      },
    });
    setSettingsAnchor(null);
  };

  // Load saved layout on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('crm-dashboard-layout');
    if (saved) {
      try {
        setLayouts(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load saved layout');
      }
    }
  }, []);

  return (
    <Box sx={{
      position: 'relative',
      minHeight: 900,
      width: '100%',
      overflow: 'visible'
    }}>
      {/* Layout Controls */}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 2000,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title="Layout Settings">
          <IconButton
            onClick={(e) => setSettingsAnchor(e.currentTarget)}
            sx={{
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        
        <FormControlLabel
          control={
            <Switch
              checked={isEditMode}
              onChange={(e) => setIsEditMode(e.target.checked)}
              color="primary"
            />
          }
          label="Edit Layout"
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            px: 1,
            m: 0,
          }}
        />
      </Box>

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
            Drag widgets by their header • Resize using corner handles • Toggle off Edit Mode when done
          </Typography>
        </Box>
      )}

      {/* Render widgets */}
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const widgetId = child.props?.['data-widget-id'];
        if (!widgetId || !layouts[widgetId]) return child;
        
        return (
          <DraggableWidget
            key={widgetId}
            id={widgetId}
            title={child.props?.['data-widget-title'] || 'Widget'}
            layout={layouts[widgetId]}
            onLayoutChange={handleLayoutChange}
            isEditMode={isEditMode}
          >
            {child}
          </DraggableWidget>
        );
      })}
    </Box>
  );
};

export default DashboardLayoutManager;
