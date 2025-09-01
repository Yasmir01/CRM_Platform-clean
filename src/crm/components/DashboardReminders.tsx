import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  Button,
  Alert,
  Badge,
  IconButton,
  Collapse,
} from "@mui/material";
import TaskRoundedIcon from "@mui/icons-material/TaskRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useNavigate } from "react-router-dom";
import { useCrmData } from "../contexts/CrmDataContext";
import { useTenantScope } from "../hooks/useTenantScope";

interface Reminder {
  id: string;
  title: string;
  type: "Task" | "Call" | "Email" | "SMS" | "Appointment" | "Listing";
  time: string;
  priority: "High" | "Medium" | "Low";
  isOverdue: boolean;
  property?: string;
  client?: string;
  actionLink?: string;
}

const generateRealReminders = (crmData: any): Reminder[] => {
  const reminders: Reminder[] = [];
  const { properties = [], tenants = [], workOrders = [] } = crmData || {};

  // Only generate reminders if there's actual CRM data
  if (properties.length === 0 && tenants.length === 0 && workOrders.length === 0) {
    return []; // No fake reminders when no data exists
  }

  // Generate lease expiration reminders ONLY for actual leases with real dates
  tenants.forEach((tenant: any) => {
    if (tenant.status === "Active" && tenant.leaseEnd) {
      const leaseEndDate = new Date(tenant.leaseEnd);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Only show if lease is actually expiring soon or has expired
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        const property = properties.find((p: any) => p.id === tenant.propertyId);
        reminders.push({
          id: `lease-exp-${tenant.id}`,
          title: `Lease expiring in ${daysUntilExpiry} days - ${tenant.firstName} ${tenant.lastName}`,
          type: "Call",
          time: "9:00 AM",
          priority: daysUntilExpiry <= 7 ? "High" : "Medium",
          isOverdue: false,
          property: property?.name || "Unknown Property",
          client: `${tenant.firstName} ${tenant.lastName}`,
        });
      } else if (daysUntilExpiry <= 0) {
        const property = properties.find((p: any) => p.id === tenant.propertyId);
        reminders.push({
          id: `lease-expired-${tenant.id}`,
          title: `EXPIRED LEASE - ${tenant.firstName} ${tenant.lastName}`,
          type: "Task",
          time: "Urgent",
          priority: "High",
          isOverdue: true,
          property: property?.name || "Unknown Property",
          client: `${tenant.firstName} ${tenant.lastName}`,
        });
      }
    }
  });

  // Generate maintenance reminders ONLY from actual work orders
  workOrders.forEach((workOrder: any) => {
    if (workOrder.status === "Open" || workOrder.status === "In Progress") {
      const createdDate = new Date(workOrder.createdAt);
      const today = new Date();
      const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const property = properties.find((p: any) => p.id === workOrder.propertyId);

      // Show if work order is due today or overdue
      const dueDate = new Date(workOrder.dueDate || workOrder.createdAt);
      const isToday = dueDate.toDateString() === today.toDateString();
      const isOverdue = daysSinceCreated > 7 || (workOrder.dueDate && dueDate < today);

      if (isToday || isOverdue || daysSinceCreated > 3) {
        reminders.push({
          id: `maintenance-${workOrder.id}`,
          title: isToday ? `Due Today: ${workOrder.title || workOrder.type}` : `Follow up on ${workOrder.type} - ${workOrder.description}`,
          type: "Task",
          time: isToday ? "9:00 AM" : "10:00 AM",
          priority: (workOrder.priority === "Urgent" || isToday) ? "High" : "Medium",
          isOverdue: isOverdue,
          property: property?.name || "Unknown Property",
          actionLink: "/crm/tasks"
        });
      }
    }
  });

  // Add today's scheduled tasks from task system
  const today = new Date();
  const todayStr = today.toDateString();

  // Generate inspection tasks for today
  properties.forEach((property: any, index: number) => {
    const lastInspection = new Date(property.lastInspection || new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000));
    const daysSinceInspection = Math.ceil((today.getTime() - lastInspection.getTime()) / (1000 * 60 * 60 * 24));

    // Schedule quarterly inspections (every 90 days)
    if (daysSinceInspection >= 90) {
      const inspectionTime = index % 2 === 0 ? "2:00 PM" : "10:00 AM";
      reminders.push({
        id: `inspection-today-${property.id}`,
        title: `Quarterly inspection for ${property.name || property.address}`,
        type: "Task",
        time: inspectionTime,
        priority: "Medium",
        isOverdue: false,
        property: property.name || property.address,
        actionLink: "/crm/tasks"
      });
    }
  });

  // Generate payment follow-up reminders ONLY for tenants with actual outstanding balances
  tenants.forEach((tenant: any) => {
    if (tenant.status === "Active" && tenant.balance && tenant.balance > 0) {
      const property = properties.find((p: any) => p.id === tenant.propertyId);
      reminders.push({
        id: `payment-${tenant.id}`,
        title: `Follow up on outstanding balance: $${tenant.balance}`,
        type: "Call",
        time: "2:00 PM",
        priority: tenant.balance > 1000 ? "High" : "Medium",
        isOverdue: false,
        property: property?.name || "Unknown Property",
        client: `${tenant.firstName} ${tenant.lastName}`,
      });
    }
  });

  return reminders; // Return only real reminders based on actual data
};

export default function DashboardReminders() {
  const navigate = useNavigate();
  const { state } = useCrmData();
  const { isTenant, tenantPropertyId } = useTenantScope();
  const [dismissedReminders, setDismissedReminders] = React.useState<string[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(() => {
    // Load expansion state from localStorage, default to true if not found
    const saved = localStorage.getItem('dashboard-reminders-expanded');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [lastBeep, setLastBeep] = React.useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const reminders = React.useMemo(() => {
    if (!state?.initialized) return [];
    const base = generateRealReminders(state);
    if (isTenant && tenantPropertyId) {
      const property = state.properties.find(p => p.id === tenantPropertyId);
      const propText = property?.name || property?.address || '';
      return base.filter(r => {
        const matchesProperty = !r.property || r.property.includes(propText);
        if (!matchesProperty) return false;
        const isInspectionToday = r.id.startsWith('inspection-today-');
        const isMaintenanceToday = r.id.startsWith('maintenance-') && !r.isOverdue; // due today from generator
        const notLeaseExpiry = !r.id.startsWith('lease-exp');
        // Exclude generic payment follow-ups for tenants (not day-specific)
        return notLeaseExpiry && (isInspectionToday || isMaintenanceToday);
      });
    }
    return base;
  }, [state, isTenant, tenantPropertyId]);

  // Save expansion state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('dashboard-reminders-expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Create audio element for beeping
  React.useEffect(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUYrTp66hVFApGn+LyvmMdBTCG0fDTgjMGHm7A7+OOPAoUaLDq66xWEQpDmtzy0IgwBiFp2O7AgTIGImsEY');
    audioRef.current = audio;
  }, []);

  // Beeping effect for overdue and high priority items
  React.useEffect(() => {
    const overdueOrHighPriority = reminders.filter(r => 
      !dismissedReminders.includes(r.id) && 
      (r.isOverdue || r.priority === "High")
    );

    if (overdueOrHighPriority.length > 0) {
      const now = Date.now();
      if (now - lastBeep > 30000) { // Beep every 30 seconds
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
        setLastBeep(now);
      }

      const interval = setInterval(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [reminders, dismissedReminders, lastBeep]);

  const handleDismissReminder = (id: string) => {
    setDismissedReminders(prev => [...prev, id]);
  };

  const handleCompleteReminder = (id: string) => {
    setDismissedReminders(prev => [...prev, id]);
  };

  const getTypeIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "Call": return <PhoneRoundedIcon />;
      case "Email": return <EmailRoundedIcon />;
      case "SMS": return <SmsRoundedIcon />;
      case "Task": return <TaskRoundedIcon />;
      case "Appointment": return <EventRoundedIcon />;
      case "Listing": return <PublicRoundedIcon />;
      default: return <TaskRoundedIcon />;
    }
  };

  const getTypeColor = (type: Reminder["type"]) => {
    switch (type) {
      case "Call": return "primary";
      case "Email": return "info";
      case "SMS": return "warning";
      case "Task": return "success";
      case "Appointment": return "error";
      case "Listing": return "secondary";
      default: return "default";
    }
  };

  const getPriorityColor = (priority: Reminder["priority"]) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "info";
      default: return "default";
    }
  };

  const activeReminders = reminders.filter(r => !dismissedReminders.includes(r.id));
  const overdueCount = activeReminders.filter(r => r.isOverdue).length;
  const highPriorityCount = activeReminders.filter(r => r.priority === "High" && !r.isOverdue).length;

  if (activeReminders.length === 0) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        mb: 3, 
        border: overdueCount > 0 ? 2 : 1,
        borderColor: overdueCount > 0 ? "error.main" : "divider",
        animation: overdueCount > 0 ? "pulse 2s infinite" : "none",
        "@keyframes pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(255, 152, 0, 0.7)" },
          "70%": { boxShadow: "0 0 0 10px rgba(255, 152, 0, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255, 152, 0, 0)" },
        }
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Badge badgeContent={overdueCount + highPriorityCount} color="error">
              <Avatar sx={{ bgcolor: overdueCount > 0 ? "error.main" : "warning.main" }}>
                <NotificationsActiveRoundedIcon />
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6">
                📅 Today's Reminders
                {overdueCount > 0 && (
                  <Chip 
                    label={`${overdueCount} Overdue`} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeReminders.length} active reminder{activeReminders.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </Stack>

        <Collapse in={isExpanded}>
          <Stack spacing={2}>
            {activeReminders.map((reminder) => (
              <Alert
                key={reminder.id}
                severity={reminder.isOverdue ? "error" : reminder.priority === "High" ? "warning" : "info"}
                action={
                  <Stack direction="row" spacing={1}>
                    {reminder.actionLink && (
                      <Button
                        color="inherit"
                        size="small"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => navigate(reminder.actionLink!)}
                      >
                        {reminder.type === "Listing" ? "Update Listing" : "Go To"}
                      </Button>
                    )}
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => handleCompleteReminder(reminder.id)}
                    >
                      {reminder.type === "Listing" ? "Mark Updated" : "Complete"}
                    </Button>
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={() => handleDismissReminder(reminder.id)}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Stack>
                }
                icon={getTypeIcon(reminder.type)}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2">
                      {reminder.isOverdue ? "🚨 OVERDUE: " : "⏰ "}{reminder.title}
                    </Typography>
                    <Chip 
                      label={reminder.type} 
                      size="small" 
                      color={getTypeColor(reminder.type)}
                      variant="outlined"
                    />
                    <Chip 
                      label={reminder.priority} 
                      size="small" 
                      color={getPriorityColor(reminder.priority)}
                    />
                  </Stack>
                  <Typography variant="body2">
                    📍 Time: {reminder.time}
                    {reminder.property && ` • 🏠 ${reminder.property}`}
                    {reminder.client && ` • 👤 ${reminder.client}`}
                  </Typography>
                </Stack>
              </Alert>
            ))}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}
