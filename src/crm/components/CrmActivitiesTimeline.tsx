import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useActivityTracking } from "../hooks/useActivityTracking";
import { useCrmData } from "../contexts/CrmDataContext";

interface CrmActivitiesTimelineProps {
  entityType?: 'property' | 'tenant' | 'contact' | 'all';
  entityId?: string;
  entityName?: string;
  activities?: any[]; // For backward compatibility with existing mock data
  maxItems?: number;
  showAddNote?: boolean;
}

export default function CrmActivitiesTimeline({
  entityType = 'all',
  entityId,
  entityName,
  activities: propActivities,
  maxItems = 5,
  showAddNote = true
}: CrmActivitiesTimelineProps) {
  const { getEntityActivities, getActivities } = useActivityTracking();
  const { addNote } = useCrmData();
  const [openNoteDialog, setOpenNoteDialog] = React.useState(false);
  const [noteData, setNoteData] = React.useState({
    title: '',
    content: '',
    category: 'General' as const
  });

  // Get real activities from the activity tracking system, or fall back to prop activities
  const realActivities = React.useMemo(() => {
    if (propActivities && propActivities.length > 0) {
      return propActivities; // Use provided activities for backward compatibility
    }

    if (entityType === 'all') {
      return getActivities().slice(0, maxItems);
    } else if (entityId) {
      return getEntityActivities(entityType, entityId).slice(0, maxItems);
    }

    return [];
  }, [propActivities, entityType, entityId, getActivities, getEntityActivities, maxItems]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <EmailRoundedIcon fontSize="small" />;
      case 'call': return <PhoneRoundedIcon fontSize="small" />;
      case 'meeting': return <MeetingRoomRoundedIcon fontSize="small" />;
      case 'note': return <EditNoteRoundedIcon fontSize="small" />;
      case 'maintenance': return <BuildRoundedIcon fontSize="small" />;
      case 'listing': return <HomeWorkRoundedIcon fontSize="small" />;
      case 'payment': return <AttachMoneyRoundedIcon fontSize="small" />;
      case 'inquiry': return <PersonRoundedIcon fontSize="small" />;
      default: return <EditNoteRoundedIcon fontSize="small" />;
    }
  };

  const getActivityColor = (type: string, severity?: string) => {
    if (severity) {
      switch (severity) {
        case 'critical': return 'error';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'success';
        default: return 'primary';
      }
    }

    switch (type) {
      case 'email': return 'primary';
      case 'call': return 'success';
      case 'meeting': return 'warning';
      case 'note': return 'info';
      case 'maintenance': return 'warning';
      case 'payment': return 'success';
      case 'inquiry': return 'secondary';
      default: return 'primary';
    }
  };

  const formatActivityTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleAddNote = () => {
    if (!noteData.title.trim() || !noteData.content.trim()) return;

    const note = {
      title: noteData.title,
      content: noteData.content,
      category: noteData.category,
      propertyId: entityType === 'property' ? entityId : undefined,
      tenantId: entityType === 'tenant' ? entityId : undefined,
      contactId: entityType === 'contact' ? entityId : undefined,
      tags: [],
      isPrivate: false,
      isPinned: false,
      createdBy: 'Current User' // In real app, get from auth
    };

    // Save note to CrmDataContext for persistence
    const savedNote = addNote(note);

    // Also track as activity for the timeline
    if (entityType && entityId && entityName) {
      const { trackActivity } = useActivityTracking();
      trackActivity({
        userId: 'current-user',
        userDisplayName: 'Current User',
        action: 'create',
        entityType: entityType,
        entityId: entityId,
        entityName: entityName,
        changes: [
          {
            field: 'notes',
            oldValue: '',
            newValue: noteData.title,
            displayName: 'Note Added'
          }
        ],
        description: `Note added: ${noteData.title}`,
        metadata: {
          notes: noteData.content,
          category: noteData.category
        },
        severity: 'low',
        category: 'communication'
      });
    }

    // Reset form and close dialog
    setNoteData({ title: '', content: '', category: 'General' });
    setOpenNoteDialog(false);
  };
  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ p: 2, pb: 1 }}
          >
            <Typography variant="h6" component="h3">
              Recent Activities
              {entityName && ` - ${entityName}`}
            </Typography>
            <Stack direction="row" spacing={1}>
              {showAddNote && (
                <IconButton
                  size="small"
                  onClick={() => setOpenNoteDialog(true)}
                  title="Add Note"
                >
                  <AddRoundedIcon />
                </IconButton>
              )}
              <Button endIcon={<ArrowForwardRoundedIcon />} size="small">
                View All
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ p: 2 }}>
            {realActivities.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                No activities yet. {showAddNote && `Click "+" to add a note.`}
              </Typography>
            ) : (
              realActivities.map((activity) => {
                // Handle both real activity events and mock activity data
                const activityType = activity.action || activity.type || 'note';
                const activityTitle = activity.description || activity.title || 'Activity';
                const activityDesc = activity.metadata?.notes || activity.description || '';
                const activityTime = activity.timestamp || activity.time;
                const activityColor = getActivityColor(activityType, activity.severity);
                const activityIcon = getActivityIcon(activityType);

                return (
                  <Box
                    key={activity.id}
                    sx={{
                      display: "flex",
                      mb: 2,
                      gap: 2,
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: `${activityColor}.main`,
                        borderRadius: "50%",
                        p: 0.75,
                        display: "flex",
                        color: "white",
                      }}
                    >
                      {activityIcon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="subtitle2" component="span">
                          {activityTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activityTime ? formatActivityTime(activityTime) : 'Recently'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {activityDesc}
                      </Typography>
                      {activity.severity && (
                        <Chip
                          label={activity.severity.toUpperCase()}
                          size="small"
                          color={getActivityColor(activityType, activity.severity) as any}
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                      {activity.userDisplayName && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          by {activity.userDisplayName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Note Title"
              fullWidth
              required
              value={noteData.title}
              onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
              placeholder="Enter a title for this note"
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={noteData.category}
                label="Category"
                onChange={(e) => setNoteData({ ...noteData, category: e.target.value as any })}
              >
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Tenant">Tenant</MenuItem>
                <MenuItem value="Contact">Contact</MenuItem>
                <MenuItem value="Deal">Deal</MenuItem>
                <MenuItem value="Reminder">Reminder</MenuItem>
                <MenuItem value="Important">Important</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Note Content"
              fullWidth
              multiline
              rows={4}
              required
              value={noteData.content}
              onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
              placeholder="Enter the note content..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={!noteData.title.trim() || !noteData.content.trim()}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
