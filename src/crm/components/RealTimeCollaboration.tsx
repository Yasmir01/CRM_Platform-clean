import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  Avatar,
  Chip,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Popover,
  Divider,
  AvatarGroup,
  Tab,
  Tabs,
  Grid,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  FormControlLabel,
  Switch,
  Slider,
  ButtonGroup,
  ClickAwayListener
} from '@mui/material';
import {
  Comment as CommentIcon,
  Person as PersonIcon,
  Circle as CircleIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  Resolve as ResolveIcon,
  ThumbUp as ThumbUpIcon,
  Favorite as FavoriteIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Highlight as HighlightIcon,
  Brush as BrushIcon,
  FormatUnderlined as UnderlineIcon,
  RadioButtonUnchecked as CircleAnnotationIcon,
  TrendingFlat as ArrowIcon,
  CropDin as RectangleIcon,
  Gesture as FreehandIcon,
  Palette as PaletteIcon,
  LineStyle as LineStyleIcon,
  Opacity as OpacityIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { collaborationService } from '../services/CollaborationService';
import { uniformTooltipStyles } from '../utils/formStyles';

interface RealTimeCollaborationProps {
  documentId: string;
  entityId: string;
  entityType: string;
  title: string;
  currentUser: {
    userId: string;
    userEmail: string;
    userName: string;
    userAvatar?: string;
  };
  onCollaborationStart?: (sessionId: string) => void;
  onCollaborationEnd?: () => void;
}

interface AnnotationTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'highlight' | 'strikethrough' | 'underline' | 'circle' | 'arrow' | 'rectangle' | 'freehand';
}

interface UserCursor {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  visible: boolean;
}

const annotationTools: AnnotationTool[] = [
  { id: 'highlight', name: 'Highlight', icon: <HighlightIcon />, type: 'highlight' },
  { id: 'underline', name: 'Underline', icon: <UnderlineIcon />, type: 'underline' },
  { id: 'circle', name: 'Circle', icon: <CircleAnnotationIcon />, type: 'circle' },
  { id: 'arrow', name: 'Arrow', icon: <ArrowIcon />, type: 'arrow' },
  { id: 'rectangle', name: 'Rectangle', icon: <RectangleIcon />, type: 'rectangle' },
  { id: 'freehand', name: 'Freehand', icon: <FreehandIcon />, type: 'freehand' }
];

const reactionTypes = [
  { type: 'like', icon: '👍', label: 'Like' },
  { type: 'love', icon: '❤️', label: 'Love' },
  { type: 'laugh', icon: '😂', label: 'Laugh' },
  { type: 'wow', icon: '😮', label: 'Wow' },
  { type: 'sad', icon: '😢', label: 'Sad' },
  { type: 'angry', icon: '😠', label: 'Angry' }
];

export default function RealTimeCollaboration({
  documentId,
  entityId,
  entityType,
  title,
  currentUser,
  onCollaborationStart,
  onCollaborationEnd
}: RealTimeCollaborationProps) {
  const [session, setSession] = React.useState<any>(null);
  const [comments, setComments] = React.useState<any[]>([]);
  const [annotations, setAnnotations] = React.useState<any[]>([]);
  const [activeUsers, setActiveUsers] = React.useState<any[]>([]);
  const [userCursors, setUserCursors] = React.useState<UserCursor[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  
  // UI State
  const [isCollaborating, setIsCollaborating] = React.useState(false);
  const [showCommentPanel, setShowCommentPanel] = React.useState(false);
  const [showAnnotationTools, setShowAnnotationTools] = React.useState(false);
  const [selectedAnnotationTool, setSelectedAnnotationTool] = React.useState<AnnotationTool | null>(null);
  const [newComment, setNewComment] = React.useState('');
  const [replyingToComment, setReplyingToComment] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const [commentPosition, setCommentPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState<HTMLElement | null>(null);
  
  // Annotation state
  const [annotationColor, setAnnotationColor] = React.useState('#FFD700');
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = React.useState(2);
  const [annotationOpacity, setAnnotationOpacity] = React.useState(0.7);
  
  // Mouse tracking
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Set up event listeners for collaboration service
    collaborationService.on('session_updated', handleSessionUpdate);
    collaborationService.on('presence_updated', handlePresenceUpdate);
    collaborationService.on('notification_added', handleNotificationAdded);

    // Mouse tracking for presence
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
        
        if (session) {
          collaborationService.updatePresence({
            sessionId: session.id,
            userId: currentUser.userId,
            userName: currentUser.userName,
            userColor: getUserColor(currentUser.userId),
            cursor: { x, y, timestamp: new Date().toISOString() },
            activity: 'viewing'
          });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      collaborationService.off('session_updated', handleSessionUpdate);
      collaborationService.off('presence_updated', handlePresenceUpdate);
      collaborationService.off('notification_added', handleNotificationAdded);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [session, currentUser]);

  const handleSessionUpdate = (update: any) => {
    if (update.sessionId === session?.id) {
      setSession(collaborationService.getSession(update.sessionId));
      
      switch (update.type) {
        case 'comment_added':
          setComments(prev => [...prev, update.data.comment]);
          break;
        case 'annotation_added':
          setAnnotations(prev => [...prev, update.data.annotation]);
          break;
        case 'comment_resolved':
          setComments(prev => prev.map(c => 
            c.id === update.data.commentId ? { ...c, resolved: true } : c
          ));
          break;
      }
    }
  };

  const handlePresenceUpdate = (update: any) => {
    if (update.sessionId === session?.id && update.userId !== currentUser.userId) {
      setUserCursors(prev => {
        const existing = prev.find(c => c.userId === update.userId);
        if (existing) {
          return prev.map(c => 
            c.userId === update.userId 
              ? { 
                  ...c, 
                  x: update.cursor?.x || c.x, 
                  y: update.cursor?.y || c.y,
                  visible: true 
                }
              : c
          );
        } else {
          return [...prev, {
            userId: update.userId,
            userName: update.userName,
            userColor: update.userColor,
            x: update.cursor?.x || 0,
            y: update.cursor?.y || 0,
            visible: true
          }];
        }
      });

      // Hide cursor after 5 seconds of inactivity
      setTimeout(() => {
        setUserCursors(prev => prev.map(c => 
          c.userId === update.userId ? { ...c, visible: false } : c
        ));
      }, 5000);
    }
  };

  const handleNotificationAdded = (notification: any) => {
    if (notification.sessionId === session?.id) {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    }
  };

  const startCollaboration = () => {
    const newSession = collaborationService.startSession(
      documentId,
      entityId,
      entityType,
      title,
      currentUser
    );
    
    setSession(newSession);
    setIsCollaborating(true);
    setComments(newSession.comments);
    setAnnotations(newSession.annotations);
    setActiveUsers(newSession.activeUsers);
    
    if (onCollaborationStart) {
      onCollaborationStart(newSession.id);
    }
  };

  const endCollaboration = () => {
    if (session) {
      collaborationService.leaveSession(session.id, currentUser.userId);
      setSession(null);
      setIsCollaborating(false);
      setComments([]);
      setAnnotations([]);
      setActiveUsers([]);
      setUserCursors([]);
      
      if (onCollaborationEnd) {
        onCollaborationEnd();
      }
    }
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
    if (selectedAnnotationTool) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      addAnnotation(x, y);
    } else if (e.ctrlKey || e.metaKey) {
      // Add comment on Ctrl+Click
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCommentPosition({ x, y });
      setShowCommentPanel(true);
    }
  };

  const addAnnotation = (x: number, y: number) => {
    if (!session || !selectedAnnotationTool) return;

    const annotation = collaborationService.addAnnotation(
      session.id,
      selectedAnnotationTool.type,
      { x, y, width: 100, height: 50 },
      {
        color: annotationColor,
        strokeWidth: annotationStrokeWidth,
        opacity: annotationOpacity
      }
    );

    setAnnotations(prev => [...prev, annotation]);
    setSelectedAnnotationTool(null);
  };

  const addComment = () => {
    if (!session || !newComment.trim() || !commentPosition) return;

    const comment = collaborationService.addComment(
      session.id,
      newComment,
      commentPosition,
      [], // mentions
      [] // tags
    );

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setCommentPosition(null);
    setShowCommentPanel(false);
  };

  const replyToComment = (commentId: string) => {
    if (!session || !replyText.trim()) return;

    const reply = collaborationService.replyToComment(session.id, commentId, replyText);
    
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, thread: [...c.thread, reply] }
        : c
    ));
    
    setReplyText('');
    setReplyingToComment(null);
  };

  const resolveComment = (commentId: string) => {
    if (!session) return;
    
    collaborationService.resolveComment(session.id, commentId);
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  };

  const addReaction = (commentId: string, replyId: string | null, reactionType: string) => {
    if (!session) return;
    
    collaborationService.addCommentReaction(session.id, commentId, replyId, reactionType as any);
    
    // Update local state
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        if (replyId) {
          return {
            ...comment,
            thread: comment.thread.map((reply: any) => 
              reply.id === replyId 
                ? { 
                    ...reply, 
                    reactions: [...reply.reactions.filter((r: any) => r.userId !== currentUser.userId), {
                      userId: currentUser.userId,
                      userName: currentUser.userName,
                      type: reactionType,
                      timestamp: new Date().toISOString()
                    }]
                  }
                : reply
            )
          };
        } else {
          return {
            ...comment,
            reactions: [...comment.reactions.filter((r: any) => r.userId !== currentUser.userId), {
              userId: currentUser.userId,
              userName: currentUser.userName,
              type: reactionType,
              timestamp: new Date().toISOString()
            }]
          };
        }
      }
      return comment;
    }));
  };

  const getUserColor = (userId: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isCollaborating) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Real-time Collaboration</Typography>
                <Typography variant="body2" color="text.secondary">
                  Start collaborating to add comments, annotations, and work together in real-time
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              onClick={startCollaboration}
            >
              Start Collaboration
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', minHeight: '400px' }}>
      {/* Collaboration Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Badge badgeContent={activeUsers.length + 1} color="success">
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <GroupIcon />
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6">
                  Collaboration Active
                  <Chip 
                    label="LIVE" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 2, animation: 'pulse 2s infinite' }} 
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session?.participants?.length || 0} participant{session?.participants?.length !== 1 ? 's' : ''} • {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Active Users */}
              <AvatarGroup max={4}>
                {session?.participants?.map((participant: any) => (
                  <Tooltip key={participant.userId} title={participant.userName} sx={uniformTooltipStyles}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: participant.isOnline ? `2px solid ${getUserColor(participant.userId)}` : '2px solid grey'
                      }}
                    >
                      {participant.userName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>

              {/* Notifications */}
              <Tooltip title="Notifications" sx={uniformTooltipStyles}>
                <IconButton 
                  onClick={(e) => setNotificationAnchor(e.currentTarget)}
                  color={notifications.some(n => !n.read) ? 'error' : 'default'}
                >
                  <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Comments Toggle */}
              <Tooltip title="Comments" sx={uniformTooltipStyles}>
                <IconButton 
                  onClick={() => setShowCommentPanel(!showCommentPanel)}
                  color={showCommentPanel ? 'primary' : 'default'}
                >
                  <Badge badgeContent={comments.filter(c => !c.resolved).length} color="primary">
                    <CommentIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Annotation Tools */}
              <Tooltip title="Annotation Tools" sx={uniformTooltipStyles}>
                <IconButton 
                  onClick={() => setShowAnnotationTools(!showAnnotationTools)}
                  color={showAnnotationTools ? 'primary' : 'default'}
                >
                  <BrushIcon />
                </IconButton>
              </Tooltip>

              {/* End Collaboration */}
              <Button
                variant="outlined"
                color="error"
                onClick={endCollaboration}
                size="small"
              >
                End
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Annotation Tools Panel */}
      {showAnnotationTools && (
        <Slide direction="down" in={showAnnotationTools}>
          <Paper 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              zIndex: 1000,
              p: 2
            }}
          >
            <Stack spacing={2}>
              <Typography variant="subtitle2">Annotation Tools</Typography>
              
              <ButtonGroup variant="outlined" size="small">
                {annotationTools.map((tool) => (
                  <Button
                    key={tool.id}
                    onClick={() => setSelectedAnnotationTool(
                      selectedAnnotationTool?.id === tool.id ? null : tool
                    )}
                    variant={selectedAnnotationTool?.id === tool.id ? 'contained' : 'outlined'}
                    startIcon={tool.icon}
                  >
                    {tool.name}
                  </Button>
                ))}
              </ButtonGroup>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Stack spacing={1}>
                    <Typography variant="caption">Color</Typography>
                    <input
                      type="color"
                      value={annotationColor}
                      onChange={(e) => setAnnotationColor(e.target.value)}
                      style={{ width: '100%', height: 32 }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack spacing={1}>
                    <Typography variant="caption">Stroke Width: {annotationStrokeWidth}px</Typography>
                    <Slider
                      value={annotationStrokeWidth}
                      onChange={(_, value) => setAnnotationStrokeWidth(value as number)}
                      min={1}
                      max={10}
                      step={1}
                      size="small"
                    />
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack spacing={1}>
                    <Typography variant="caption">Opacity: {Math.round(annotationOpacity * 100)}%</Typography>
                    <Slider
                      value={annotationOpacity}
                      onChange={(_, value) => setAnnotationOpacity(value as number)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      size="small"
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Slide>
      )}

      {/* Document Container with Annotations */}
      <Box
        onClick={handleDocumentClick}
        sx={{
          position: 'relative',
          minHeight: 400,
          border: 2,
          borderColor: isCollaborating ? 'success.main' : 'divider',
          borderRadius: 2,
          p: 3,
          bgcolor: 'background.paper',
          cursor: selectedAnnotationTool ? 'crosshair' : 'default'
        }}
      >
        {/* Document Content Placeholder */}
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" paragraph>
          This is the document content area. In a real implementation, this would display the actual document content (PDF, image, text, etc.) with overlay support for annotations and comments.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Ctrl+Click to add a comment
          • Select an annotation tool and click to add annotations
          • See live cursors from other collaborators
        </Typography>

        {/* User Cursors */}
        {userCursors.map((cursor) => (
          <Fade key={cursor.userId} in={cursor.visible}>
            <Box
              sx={{
                position: 'absolute',
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-2px, -2px)',
                pointerEvents: 'none',
                zIndex: 1001
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  bgcolor: cursor.userColor,
                  borderRadius: '50%',
                  mb: 0.5
                }}
              />
              <Paper
                sx={{
                  px: 1,
                  py: 0.5,
                  bgcolor: cursor.userColor,
                  color: 'white',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {cursor.userName}
              </Paper>
            </Box>
          </Fade>
        ))}

        {/* Annotations */}
        {annotations.map((annotation) => (
          <Box
            key={annotation.id}
            sx={{
              position: 'absolute',
              left: annotation.position.x,
              top: annotation.position.y,
              width: annotation.position.width,
              height: annotation.position.height,
              border: `${annotation.style.strokeWidth}px solid ${annotation.style.color}`,
              opacity: annotation.style.opacity,
              pointerEvents: 'none',
              borderRadius: annotation.type === 'circle' ? '50%' : 0
            }}
          />
        ))}

        {/* Comments */}
        {comments.filter(c => !c.resolved).map((comment) => (
          <Tooltip
            key={comment.id}
            title={`${comment.userName}: ${comment.content}`}
            sx={uniformTooltipStyles}
          >
            <Box
              sx={{
                position: 'absolute',
                left: comment.position.x,
                top: comment.position.y,
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer'
              }}
              onClick={() => setShowCommentPanel(true)}
            >
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: 'warning.main',
                  fontSize: '0.75rem'
                }}
              >
                <CommentIcon sx={{ fontSize: 14 }} />
              </Avatar>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* Comment Panel */}
      <Slide direction="left" in={showCommentPanel}>
        <Paper
          sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: 400,
            zIndex: 1200,
            overflowY: 'auto',
            borderLeft: 1,
            borderColor: 'divider'
          }}
        >
          <Stack spacing={2} sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Comments ({comments.length})</Typography>
              <IconButton onClick={() => setShowCommentPanel(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Add Comment */}
            <Card variant="outlined">
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  variant="outlined"
                />
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!newComment.trim()}
                    onClick={addComment}
                    startIcon={<SendIcon />}
                  >
                    Comment
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Comments List */}
            <List sx={{ flex: 1 }}>
              {comments.map((comment) => (
                <ListItem key={comment.id} sx={{ mb: 2, alignItems: 'flex-start' }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      width: '100%',
                      opacity: comment.resolved ? 0.6 : 1
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {comment.userName.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle2">{comment.userName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(comment.createdAt)}
                            </Typography>
                          </Stack>
                          {comment.resolved && (
                            <Chip label="Resolved" size="small" color="success" />
                          )}
                        </Stack>

                        <Typography variant="body2">{comment.content}</Typography>

                        {/* Reactions */}
                        <Stack direction="row" spacing={1} alignItems="center">
                          {reactionTypes.map((reaction) => {
                            const count = comment.reactions.filter((r: any) => r.type === reaction.type).length;
                            const hasReacted = comment.reactions.some((r: any) => 
                              r.type === reaction.type && r.userId === currentUser.userId
                            );
                            
                            return count > 0 || hasReacted ? (
                              <Chip
                                key={reaction.type}
                                label={`${reaction.icon} ${count}`}
                                size="small"
                                variant={hasReacted ? 'filled' : 'outlined'}
                                clickable
                                onClick={() => addReaction(comment.id, null, reaction.type)}
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            ) : null;
                          })}
                          
                          <IconButton
                            size="small"
                            onClick={() => addReaction(comment.id, null, 'like')}
                          >
                            <ThumbUpIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>

                        {/* Actions */}
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<ReplyIcon />}
                            onClick={() => setReplyingToComment(
                              replyingToComment === comment.id ? null : comment.id
                            )}
                          >
                            Reply
                          </Button>
                          {!comment.resolved && (
                            <Button
                              size="small"
                              startIcon={<ResolveIcon />}
                              onClick={() => resolveComment(comment.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </Stack>

                        {/* Reply Thread */}
                        {comment.thread.map((reply: any) => (
                          <Card key={reply.id} variant="outlined" sx={{ ml: 2, mt: 1 }}>
                            <CardContent sx={{ py: 1 }}>
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                                    {reply.userName.charAt(0)}
                                  </Avatar>
                                  <Typography variant="caption" fontWeight="medium">
                                    {reply.userName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatTime(reply.createdAt)}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" fontSize="0.8rem">
                                  {reply.content}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}

                        {/* Reply Input */}
                        {replyingToComment === comment.id && (
                          <Card variant="outlined" sx={{ mt: 1 }}>
                            <CardContent>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                multiline
                                rows={2}
                              />
                              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  onClick={() => setReplyingToComment(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={!replyText.trim()}
                                  onClick={() => replyToComment(comment.id)}
                                >
                                  Reply
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Stack>
        </Paper>
      </Slide>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
          <Stack spacing={1} sx={{ p: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} variant="outlined">
                  <CardContent sx={{ py: 1 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{notification.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.timestamp)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );
}
