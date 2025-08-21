import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
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
  Collapse,
  Badge,
  Tooltip,
  Alert,
  AlertTitle,
  useTheme,
  alpha,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  ClearAll as ClearAllIcon,
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
      case 'promotion': return <CampaignIcon sx={{ color: getColor() }} />;
      case 'task': return <AssignmentIcon sx={{ color: getColor() }} />;
      case 'email': return <EmailIcon sx={{ color: getColor() }} />;
      case 'payment': return <PaymentIcon sx={{ color: getColor() }} />;
      case 'maintenance': return <BuildIcon sx={{ color: getColor() }} />;
      case 'lease': return <HomeIcon sx={{ color: getColor() }} />;
      case 'reminder': return <ScheduleIcon sx={{ color: getColor() }} />;
      case 'warning': return <WarningIcon sx={{ color: getColor() }} />;
      default: return <InfoIcon sx={{ color: getColor() }} />;
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
          sx: { fontWeight: 'bold', animation: 'pulse 2s infinite' }
        };
      case 'high':
        return { 
          label: 'HIGH', 
          color: 'warning' as const, 
          variant: 'filled' as const 
        };
      case 'medium':
        return { 
          label: 'MEDIUM', 
          color: 'info' as const, 
          variant: 'outlined' as const 
        };
      case 'low':
        return { 
          label: 'LOW', 
          color: 'default' as const, 
          variant: 'outlined' as const 
        };
      default:
        return { 
          label: 'NORMAL', 
          color: 'default' as const, 
          variant: 'outlined' as const 
        };
    }
  };

  return <Chip size="small" {...getChipProps()} />;
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { markAsRead, removeNotification } = useNotifications();

  const handleAction = () => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    markAsRead(notification.id);
  };

  const handleCompleteTask = () => {
    // For task notifications, mark as completed and remove
    markAsRead(notification.id);
    removeNotification(notification.id);
    // You could also call a task completion API here
  };

  const handleEditTask = () => {
    // Navigate to tasks page with edit mode
    navigate(`/crm/tasks?edit=${notification.relatedEntity?.id}`);
    markAsRead(notification.id);
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
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      <ListItemIcon>
        <NotificationIcon type={notification.type} priority={notification.priority} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography component="span" variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
              {notification.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <PriorityChip priority={notification.priority} />
              <Typography component="span" variant="caption" color="text.secondary">
                {formatTimeAgo(notification.createdAt)}
              </Typography>
            </Stack>
          </Stack>
        }
        secondary={
          <Box sx={{ mt: 0.5 }}>
            <Typography component="span" variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
            {notification.relatedEntity && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Related: {notification.relatedEntity.name}
              </Typography>
            )}
            {notification.dueDate && (
              <Typography
                component="span"
                variant="caption"
                color={new Date(notification.dueDate) < new Date() ? 'error.main' : 'text.secondary'}
                sx={{ mt: 0.5, display: 'block' }}
              >
                Due: {notification.dueDate.toLocaleDateString()}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {notification.actionUrl && (
                <Button size="small" variant="outlined" onClick={handleAction}>
                  {notification.actionLabel || 'View Details'}
                </Button>
              )}
              {!notification.read && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => markAsRead(notification.id)}
                  startIcon={<MarkEmailReadIcon />}
                >
                  Mark Read
                </Button>
              )}
              <Tooltip title="Dismiss">
                <IconButton
                  size="small"
                  onClick={() => removeNotification(notification.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        }
        primaryTypographyProps={{ component: 'div' }}
        secondaryTypographyProps={{ component: 'div' }}
      />
    </ListItem>
  );
};

interface DashboardNotificationsPanelProps {
  expanded?: boolean;
}

const DashboardNotificationsPanel: React.FC<DashboardNotificationsPanelProps> = ({ expanded = false }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAllNotifications,
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
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon color="primary" />
            </Badge>
            <Typography variant="h6">
              Notifications & Alerts
            </Typography>
            {urgentCount > 0 && (
              <Alert severity="error" sx={{ py: 0, px: 1 }}>
                {urgentCount} urgent item{urgentCount > 1 ? 's' : ''}
              </Alert>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
              <IconButton 
                onClick={() => setIsExpanded(!isExpanded)}
                size="small"
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            size="small"
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            size="small"
            variant={filter === 'unread' ? 'contained' : 'outlined'}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            size="small"
            variant={filter === 'urgent' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => setFilter('urgent')}
          >
            Urgent ({urgentCount})
          </Button>
        </Stack>

        <Collapse in={isExpanded}>
          <Box>
            {filteredNotifications.length === 0 ? (
              <Alert severity="info">
                <AlertTitle>No notifications</AlertTitle>
                {filter === 'all' 
                  ? "You're all caught up! No new notifications."
                  : `No ${filter} notifications found.`
                }
              </Alert>
            ) : (
              <>
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {filteredNotifications.slice(0, 10).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </List>
                
                {filteredNotifications.length > 10 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Showing 10 of {filteredNotifications.length} notifications
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {unreadCount > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<MarkEmailReadIcon />}
                      onClick={markAllAsRead}
                    >
                      Mark All Read
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<ClearAllIcon />}
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </Collapse>

        {!isExpanded && filteredNotifications.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All notifications read'}
              {urgentCount > 0 && ` • ${urgentCount} urgent`}
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => setIsExpanded(true)}
              sx={{ mt: 0.5 }}
            >
              View All Notifications
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardNotificationsPanel;
