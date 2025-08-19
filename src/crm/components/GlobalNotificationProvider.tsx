import * as React from "react";
import {
  Snackbar,
  Alert,
  AlertTitle,
  Button,
  Stack,
  Portal,
  Slide,
  Box,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { NotificationService, Notification } from "../services/NotificationService";

interface GlobalNotificationProviderProps {
  children: React.ReactNode;
}

const NotificationSlide = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function GlobalNotificationProvider({ children }: GlobalNotificationProviderProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const notificationService = NotificationService.getInstance();

  React.useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return unsubscribe;
  }, [notificationService]);

  const handleClose = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    notificationService.hide(notificationId);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverity = (type: Notification['type']) => {
    return type;
  };

  return (
    <>
      {children}
      
      {/* Notification Stack */}
      <Portal>
        <Box
          sx={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            maxWidth: 400,
            minWidth: 320,
          }}
        >
          {notifications.map((notification, index) => (
            <Snackbar
              key={notification.id}
              open={true}
              autoHideDuration={notification.autoHide ? notification.autoHideDelay : null}
              onClose={() => handleClose(notification.id)}
              TransitionComponent={NotificationSlide}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                position: 'relative',
                transform: 'none !important',
                top: 'auto !important',
                right: 'auto !important',
                left: 'auto !important',
                bottom: 'auto !important',
                marginBottom: index > 0 ? 1 : 0,
              }}
            >
              <Alert
                severity={getSeverity(notification.type)}
                variant="filled"
                icon={getIcon(notification.type)}
                action={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {notification.actions?.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant || 'text'}
                        size="small"
                        onClick={() => {
                          action.action();
                          handleClose(notification.id);
                        }}
                        sx={{
                          color: 'inherit',
                          borderColor: 'currentColor',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                    <IconButton
                      size="small"
                      onClick={() => handleClose(notification.id)}
                      sx={{ color: 'inherit' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
                sx={{
                  width: '100%',
                  minWidth: 320,
                  maxWidth: 400,
                  '& .MuiAlert-message': {
                    flexGrow: 1,
                  },
                  '& .MuiAlert-action': {
                    alignItems: 'flex-start',
                    paddingTop: 0,
                  },
                }}
              >
                <AlertTitle sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
                  {notification.title}
                </AlertTitle>
                <Box
                  sx={{
                    whiteSpace: 'pre-line',
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                  }}
                >
                  {notification.message}
                </Box>
              </Alert>
            </Snackbar>
          ))}
        </Box>
      </Portal>
    </>
  );
}

// Hook for easy access to notification service
export function useNotifications() {
  const notificationService = NotificationService.getInstance();

  return {
    showSuccess: (title: string, message: string, actions?: any[]) =>
      notificationService.showSuccess(title, message, actions),
    showError: (title: string, message: string, actions?: any[]) =>
      notificationService.showError(title, message, actions),
    showWarning: (title: string, message: string, actions?: any[]) =>
      notificationService.showWarning(title, message, actions),
    showInfo: (title: string, message: string, actions?: any[]) =>
      notificationService.showInfo(title, message, actions),
    showApplicationSuccess: (applicantName: string, propertyName: string, propertyCode: string) =>
      notificationService.showApplicationSuccess(applicantName, propertyName, propertyCode),
    showPaymentSuccess: (amount: number, method: string, confirmationCode: string) =>
      notificationService.showPaymentSuccess(amount, method, confirmationCode),
    clear: () => notificationService.clear(),
  };
}
