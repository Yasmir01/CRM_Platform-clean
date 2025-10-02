import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { useCrmData } from "../contexts/CrmDataContext";

// Function to get priority color
const getPriorityColor = (
  priority: string,
): "error" | "warning" | "default" => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    default:
      return "default";
  }
};

interface CrmUpcomingTasksProps {
  maxHeight?: number;
  showFullWidth?: boolean;
}

export default function CrmUpcomingTasks({ maxHeight = 400, showFullWidth = false }: CrmUpcomingTasksProps) {
  const theme = useTheme();
  const { state } = useCrmData();

  // Generate real tasks from CRM data
  const generateRealTasks = React.useMemo(() => {
    const { properties = [], tenants = [] } = state || {};
    const tasks = [];

    // Add lease expiration reminders
    tenants
      .filter(t => t.status === "Active" && t.leaseEnd)
      .forEach((tenant, index) => {
        const property = properties.find(p => p.id === tenant.propertyId);
        const leaseEndDate = new Date(tenant.leaseEnd!);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) { // Show leases expiring in next 90 days
          tasks.push({
            id: 100 + index,
            task: `Follow up on lease renewal for ${tenant.firstName} ${tenant.lastName}`,
            completed: false,
            priority: daysUntilExpiry <= 30 ? "high" : "medium",
            dueDate: daysUntilExpiry <= 7 ? "This week" : `${daysUntilExpiry} days`,
            property: property?.name
          });
        }
      });

    // Add maintenance tasks for properties
    properties
      .filter(p => p.status === "Occupied")
      .slice(0, 3)
      .forEach((property, index) => {
        tasks.push({
          id: 200 + index,
          task: `Schedule quarterly inspection for ${property.name}`,
          completed: false,
          priority: "medium",
          dueDate: "Next week",
          property: property.name
        });
      });

    // Add rent collection tasks
    const today = new Date();
    if (today.getDate() >= 28 || today.getDate() <= 5) { // End of month or beginning
      tasks.push({
        id: 301,
        task: "Review rent collection reports and follow up on late payments",
        completed: false,
        priority: "high",
        dueDate: today.getDate() <= 5 ? "Today" : "This week"
      });
    }

    // Add property management tasks
    if (properties.length > 0) {
      tasks.push({
        id: 401,
        task: "Update property insurance and maintenance records",
        completed: false,
        priority: "low",
        dueDate: "This month"
      });
    }

    // If no real data, show helpful onboarding tasks
    if (properties.length === 0 && tenants.length === 0) {
      tasks.push(
        {
          id: 501,
          task: "Add your first property to the CRM",
          completed: false,
          priority: "high",
          dueDate: "Today"
        },
        {
          id: 502,
          task: "Set up property management workflow",
          completed: false,
          priority: "medium",
          dueDate: "This week"
        }
      );
    }

    return tasks.slice(0, 5); // Limit to 5 tasks
  }, [state]);

  const [tasks, setTasks] = React.useState(generateRealTasks);

  // Update tasks when CRM data changes
  React.useEffect(() => {
    setTasks(generateRealTasks);
  }, [generateRealTasks]);

  const handleToggle = (id: number) => () => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: 300, sm: 350, md: 400 },
        maxHeight: showFullWidth ? 'none' : maxHeight,
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ p: 2, pb: 1 }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 600
            }}
          >
            Upcoming Tasks
          </Typography>
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 }
            }}
          >
            View All
          </Button>
        </Stack>

        <List
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            overflow: "auto",
            maxHeight: showFullWidth ? 'none' : maxHeight - 120,
            px: { xs: 1, sm: 2 },
            // Enhanced background for dark mode readability
            ...(theme.palette.mode === 'dark' && {
              bgcolor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)'
            })
          }}
        >
          {tasks.map((task) => {
            const labelId = `checkbox-list-label-${task.id}`;

            return (
              <ListItem
                key={task.id}
                secondaryAction={
                  <Tooltip title="View Task Details">
                    <IconButton edge="end" aria-label="more details">
                      <ArrowForwardRoundedIcon />
                    </IconButton>
                  </Tooltip>
                }
                disablePadding
              >
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(task.id)}
                  dense
                  sx={{
                    py: { xs: 1, sm: 0.5 },
                    px: { xs: 1, sm: 2 },
                    minHeight: { xs: 60, sm: 48 },
                    borderRadius: 1,
                    // Enhanced contrast for dark mode
                    ...(theme.palette.mode === 'dark' && {
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(8px)'
                      }
                    })
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      <Typography
                        sx={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                          color: task.completed
                            ? "text.secondary"
                            : "text.primary",
                          fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                          hyphens: 'auto',
                          fontWeight: 500,
                          // Enhanced contrast for dark mode
                          ...(theme.palette.mode === 'dark' && {
                            color: task.completed ? '#ffffff99' : '#ffffff',
                            textShadow: '0 1px 3px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)',
                            filter: 'brightness(1.1) contrast(1.2)'
                          })
                        }}
                      >
                        {task.task}
                      </Typography>
                    }
                    secondary={
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                        sx={{ mt: 0.5 }}
                        component="span"
                      >
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                          variant="outlined"
                          sx={{
                            height: { xs: 18, sm: 20 },
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            "& .MuiChip-label": { px: { xs: 0.5, sm: 1 }, py: 0 },
                            // Enhanced visibility for dark mode
                            ...(theme.palette.mode === 'dark' && {
                              backgroundColor: `${getPriorityColor(task.priority)}.dark`,
                              color: '#ffffff',
                              borderColor: `${getPriorityColor(task.priority)}.light`,
                              fontWeight: 700,
                              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                            })
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            mt: { xs: 0.25, sm: 0 },
                            fontWeight: 500,
                            // Enhanced contrast for dark mode
                            ...(theme.palette.mode === 'dark' && {
                              color: '#ffffff',
                              textShadow: '0 1px 3px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
                              filter: 'brightness(1.1) contrast(1.3)',
                              fontWeight: 600
                            })
                          }}
                        >
                          {task.dueDate}
                        </Typography>
                        {task.property && (
                          <Typography
                            variant="caption"
                            color="primary"
                            component="span"
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              fontWeight: 600,
                              mt: { xs: 0.25, sm: 0 },
                              // Enhanced contrast for dark mode
                              ...(theme.palette.mode === 'dark' && {
                                color: '#ffffff',
                                backgroundColor: 'rgba(144, 202, 249, 0.2)',
                                textShadow: '0 1px 3px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
                                filter: 'brightness(1.2) contrast(1.4)',
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5
                              })
                            }}
                          >
                            {task.property}
                          </Typography>
                        )}
                      </Stack>
                    }
                    secondaryTypographyProps={{ component: 'span' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
