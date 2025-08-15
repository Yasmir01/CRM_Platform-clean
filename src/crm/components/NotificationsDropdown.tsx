import React, { useState } from 'react';
import {
  Box,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Stack,
  Divider,
  Badge,
  Tooltip,
  Alert,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
  Build as BuildIcon,
  Campaign as CampaignIcon,
  Assignment as AssignmentIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  ClearAll as ClearAllIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useNotifications, Notification } from '../contexts/NotificationsContext';

const NotificationIcon: React.FC<{ type: Notification['type']; priority: Notification['priority'] }> = ({ type, priority }) => {
  const theme = useTheme();
  
  const getColor = () => {
    switch (priority) {
      case 'urgent': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.text.secondary;
      default: return theme.palette.text.secondary;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'promotion': return <CampaignIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'task': return <AssignmentIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'email': return <EmailIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'payment': return <PaymentIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'maintenance': return <BuildIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'lease': return <HomeIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'reminder': return <ScheduleIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      case 'warning': return <WarningIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
      default: return <InfoIcon sx={{ color: getColor(), fontSize: '1.2rem' }} />;
    }
  };

  return getIcon();
};

const PriorityChip: React.FC<{ priority: Notification['priority'] }> = ({ priority }) => {
  const getChipProps = () => {
    switch (priority) {
      case 'urgent':
        return { 
          label: 'URGENT', 
          color: 'error' as const, 
          variant: 'filled' as const,
          size: 'small' as const,
          sx: { fontWeight: 'bold', fontSize: '0.6rem' }
        };
      case 'high':
        return { 
          label: 'HIGH', 
          color: 'warning' as const, 
          variant: 'filled' as const,
          size: 'small' as const,
          sx: { fontSize: '0.6rem' }
        };
      case 'medium':
        return { 
          label: 'MED', 
          color: 'info' as const, 
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: { fontSize: '0.6rem' }
        };
      case 'low':
        return { 
          label: 'LOW', 
          color: 'default' as const, 
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: { fontSize: '0.6rem' }
        };
      default:
        return { 
          label: 'NORM', 
          color: 'default' as const, 
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: { fontSize: '0.6rem' }
        };
    }
  };

  return <Chip {...getChipProps()} />;
};

const NotificationItem: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const theme = useTheme();
  const { markAsRead, removeNotification } = useNotifications();

  const handleAction = () => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    markAsRead(notification.id);
    onClose();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
        border: !notification.read ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
        borderRadius: 1,
        mb: 1,
        py: 1.5,
        px: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      }}
      onClick={handleAction}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <NotificationIcon type={notification.type} priority={notification.priority} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography component="span" variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600, fontSize: '0.875rem' }}>
              {notification.title}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PriorityChip priority={notification.priority} />
              <Tooltip title="Dismiss">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  sx={{ ml: 0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        }
        secondary={
          <span style={{ marginTop: '4px', display: 'block' }}>
            <span style={{ fontSize: '0.8rem', lineHeight: 1.3, color: 'rgba(0, 0, 0, 0.6)' }}>
              {notification.message.length > 80 ? notification.message.substring(0, 80) + '...' : notification.message}
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                {formatTimeAgo(notification.createdAt)}
              </span>
              {notification.actionUrl && (
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#1976d2' }}>
                  Click to view →
                </span>
              )}
            </span>
          </span>
        }
        primaryTypographyProps={{ component: 'div' }}
        secondaryTypographyProps={{ component: 'div' }}
      />
    </ListItem>
  );
};

interface NotificationsDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('unread');
  
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    getUrgentNotifications 
  } = useNotifications();

  const filteredNotifications = (() => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'urgent':
        return getUrgentNotifications();
      default:
        return notifications;
    }
  })();

  const urgentCount = getUrgentNotifications().filter(n => !n.read).length;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 380,
          maxHeight: 600,
          mt: 1,
          boxShadow: theme.shadows[8],
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }
      }}
    >
      <Paper sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon color="primary" />
              </Badge>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                Notifications
              </Typography>
              {urgentCount > 0 && (
                <Chip 
                  label={`${urgentCount} urgent`} 
                  color="error" 
                  size="small" 
                  variant="filled"
                  sx={{ fontSize: '0.6rem' }}
                />
              )}
            </Stack>
            <IconButton 
              size="small" 
              onClick={onClose}
              title="Close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Filter buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={filter === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setFilter('unread')}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              size="small"
              variant={filter === 'urgent' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setFilter('urgent')}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              Urgent ({urgentCount})
            </Button>
            <Button
              size="small"
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              All ({notifications.length})
            </Button>
          </Stack>
        </Box>

        {/* Notifications list */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {filter === 'all' 
                  ? "You're all caught up! No new notifications."
                  : `No ${filter} notifications found.`
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 1 }}>
              {filteredNotifications.slice(0, 8).map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  onClose={onClose}
                />
              ))}
            </List>
          )}
          
          {filteredNotifications.length > 8 && (
            <Box sx={{ p: 1, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                Showing 8 of {filteredNotifications.length} notifications
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              {unreadCount > 0 && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<MarkEmailReadIcon />}
                  onClick={() => {
                    markAllAsRead();
                    onClose();
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Mark All Read
                </Button>
              )}
              <Button
                size="small"
                variant="text"
                endIcon={<OpenInNewIcon />}
                onClick={() => {
                  window.location.href = '/crm/notifications';
                  onClose();
                }}
                sx={{ fontSize: '0.75rem' }}
              >
                View All
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Popover>
  );
};

export default NotificationsDropdown;
