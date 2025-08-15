import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Avatar,
  Divider,
  Paper,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Checkbox
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import AnnouncementRoundedIcon from '@mui/icons-material/AnnouncementRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import RichTextEditor from '../components/RichTextEditor';
import { useMode } from '../contexts/ModeContext';
import { useCrmData } from '../contexts/CrmDataContext';
import { LocalStorageService } from '../services/LocalStorageService';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'maintenance' | 'event' | 'policy' | 'emergency' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  author: string;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  isActive: boolean;
  targetAudience: 'all' | 'properties' | 'tenants' | 'property-groups' | 'custom';
  targetProperties?: string[];
  targetTenants?: string[];
  targetPropertyGroups?: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  views: number;
  engagement: {
    views: number;
    clicks: number;
    acknowledged: number;
  };
}

const mockNewsPosts: NewsPost[] = [
  {
    id: 'news-1',
    title: 'Pool Maintenance Schedule',
    content: '<p>The community pool will be closed for maintenance from <strong>January 15-16, 2024</strong>. We apologize for any inconvenience and appreciate your understanding.</p><p>Maintenance includes:</p><ul><li>Deep cleaning and chemical balancing</li><li>Filter replacement</li><li>Equipment inspection</li></ul><p>The pool will reopen on January 17th at 6:00 AM.</p>',
    type: 'maintenance',
    priority: 'medium',
    author: 'John Smith',
    publishDate: '2024-01-12',
    expiryDate: '2024-01-20',
    isPinned: true,
    isActive: true,
    targetAudience: 'properties',
    targetProperties: ['1'],
    notifications: { email: true, sms: false, push: true },
    views: 45,
    engagement: { views: 45, clicks: 12, acknowledged: 23 }
  },
  {
    id: 'news-2',
    title: 'New Parking Policy Effective February 1st',
    content: '<p>Starting <strong>February 1st, 2024</strong>, we will be implementing a new parking policy to better serve all residents.</p><p><strong>Key Changes:</strong></p><ul><li>Guest parking limited to 48 hours</li><li>Resident permits required for overnight guests</li><li>Towing will be enforced after 48 hours</li></ul><p>Please contact the office to obtain guest parking permits. Thank you for your cooperation!</p>',
    type: 'policy',
    priority: 'high',
    author: 'Sarah Johnson',
    publishDate: '2024-01-10',
    expiryDate: '2024-02-15',
    isPinned: false,
    isActive: true,
    targetAudience: 'all',
    notifications: { email: true, sms: true, push: true },
    views: 78,
    engagement: { views: 78, clicks: 34, acknowledged: 56 }
  },
  {
    id: 'news-3',
    title: 'Community BBQ Event - January 25th',
    content: '<p>Join us for our monthly community BBQ on <strong>Saturday, January 25th from 5:00 PM - 8:00 PM</strong> at the community pavilion!</p><p>🍔 <strong>What to expect:</strong></p><ul><li>Free burgers, hot dogs, and drinks</li><li>Live music by local band</li><li>Kids activities and games</li><li>Meet your neighbors!</li></ul><p>RSVP by January 22nd to help us plan. Contact the office at (555) 123-4567.</p>',
    type: 'event',
    priority: 'medium',
    author: 'Mike Davis',
    publishDate: '2024-01-08',
    expiryDate: '2024-01-26',
    isPinned: false,
    isActive: true,
    targetAudience: 'properties',
    targetProperties: ['1'],
    notifications: { email: true, sms: false, push: true },
    views: 92,
    engagement: { views: 92, clicks: 67, acknowledged: 34 }
  }
];

export default function NewsBoard() {
  const { isManagementMode, isTenantMode } = useMode();
  const { state } = useCrmData();
  const { properties, tenants, propertyGroups } = state;
  const [posts, setPosts] = React.useState<NewsPost[]>(() => {
    const saved = LocalStorageService.getNews();
    return saved.length > 0 ? saved : mockNewsPosts;
  });
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<NewsPost | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [selectedPostForAction, setSelectedPostForAction] = React.useState<NewsPost | null>(null);
  // Auto-save posts to localStorage whenever they change
  React.useEffect(() => {
    LocalStorageService.saveNews(posts);
  }, [posts]);

  const [formData, setFormData] = React.useState({
    title: '',
    content: '<p>Enter your announcement here...</p>',
    type: 'announcement' as NewsPost['type'],
    customTypeDescription: '',
    priority: 'medium' as NewsPost['priority'],
    targetAudience: 'all' as NewsPost['targetAudience'],
    targetProperties: [] as string[],
    targetTenants: [] as string[],
    targetPropertyGroups: [] as string[],
    expiryDate: '',
    isPinned: false,
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  const getTypeIcon = (type: NewsPost['type']) => {
    switch (type) {
      case 'announcement': return <AnnouncementRoundedIcon />;
      case 'maintenance': return <InfoRoundedIcon />;
      case 'event': return <CalendarTodayRoundedIcon />;
      case 'policy': return <WarningRoundedIcon />;
      case 'emergency': return <NotificationsActiveRoundedIcon />;
      case 'other': return <AnnouncementRoundedIcon />;
      default: return <AnnouncementRoundedIcon />;
    }
  };

  const getTypeColor = (type: NewsPost['type']) => {
    switch (type) {
      case 'announcement': return 'primary';
      case 'maintenance': return 'info';
      case 'event': return 'success';
      case 'policy': return 'warning';
      case 'emergency': return 'error';
      case 'other': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: NewsPost['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setFormData({
      title: '',
      content: '<p>Enter your announcement here...</p>',
      type: 'announcement',
      customTypeDescription: '',
      priority: 'medium',
      targetAudience: 'all',
      targetProperties: [],
      targetTenants: [],
      targetPropertyGroups: [],
      expiryDate: '',
      isPinned: false,
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    });
    setOpenDialog(true);
  };

  const handleEditPost = (post: NewsPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      customTypeDescription: '', // Not stored in existing posts, default to empty
      priority: post.priority,
      targetAudience: post.targetAudience,
      targetProperties: post.targetProperties || [],
      targetTenants: post.targetTenants || [],
      targetPropertyGroups: post.targetPropertyGroups || [],
      expiryDate: post.expiryDate || '',
      isPinned: post.isPinned,
      notifications: post.notifications
    });
    setOpenDialog(true);
  };

  const handleSavePost = () => {
    if (selectedPost) {
      // Edit existing post
      setPosts(prev => prev.map(p => 
        p.id === selectedPost.id 
          ? { 
              ...p, 
              ...formData, 
              publishDate: new Date().toISOString().split('T')[0] 
            }
          : p
      ));
    } else {
      // Create new post
      const newPost: NewsPost = {
        id: `news-${Date.now()}`,
        ...formData,
        author: 'Current User',
        publishDate: new Date().toISOString().split('T')[0],
        isActive: true,
        views: 0,
        engagement: { views: 0, clicks: 0, acknowledged: 0 }
      };
      setPosts(prev => [newPost, ...prev]);
    }
    setOpenDialog(false);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setActionMenuAnchor(null);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, post: NewsPost) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedPostForAction(post);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedPostForAction(null);
  };

  const activePosts = posts
    .filter(post => post.isActive)
    .sort((a, b) => {
      // Pinned posts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by priority
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2}>
              <AnnouncementRoundedIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {isTenantMode ? 'Community News & Announcements' : 'News Board Management'}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {isTenantMode 
                    ? 'Stay updated with the latest community news and announcements'
                    : 'Create and manage announcements for your tenants'}
                </Typography>
              </Box>
            </Stack>
            {isManagementMode && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleCreatePost}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Create Announcement
              </Button>
            )}
          </Stack>
        </Paper>

        {/* Stats (Management Mode Only) */}
        {isManagementMode && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AnnouncementRoundedIcon color="primary" />
                    <Box>
                      <Typography variant="h6">Total Posts</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {posts.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active announcements
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <VisibilityRoundedIcon color="info" />
                    <Box>
                      <Typography variant="h6">Total Views</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {posts.reduce((sum, post) => sum + post.engagement.views, 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Across all posts
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <TrendingUpRoundedIcon color="success" />
                    <Box>
                      <Typography variant="h6">Engagement</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {Math.round((posts.reduce((sum, post) => sum + post.engagement.acknowledged, 0) / 
                          posts.reduce((sum, post) => sum + post.engagement.views, 0)) * 100) || 0}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Acknowledgment rate
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PushPinRoundedIcon color="warning" />
                    <Box>
                      <Typography variant="h6">Pinned Posts</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {posts.filter(p => p.isPinned).length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Priority announcements
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* News Posts */}
        <Stack spacing={3}>
          {activePosts.length === 0 ? (
            <Alert severity="info" sx={{ textAlign: 'center' }}>
              No announcements posted yet. {isManagementMode && 'Click "Create Announcement" to get started!'}
            </Alert>
          ) : (
            activePosts.map((post) => (
              <Card key={post.id} sx={{ position: 'relative' }}>
                {post.isPinned && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    zIndex: 1,
                    display: 'flex',
                    gap: 1
                  }}>
                    <Chip 
                      icon={<PushPinRoundedIcon />} 
                      label="Pinned" 
                      size="small" 
                      color="warning"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </Box>
                )}
                <CardContent>
                  <Stack spacing={3}>
                    {/* Post Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Chip
                            icon={getTypeIcon(post.type)}
                            label={post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                            color={getTypeColor(post.type)}
                            size="small"
                          />
                          <Chip
                            label={post.priority.toUpperCase()}
                            color={getPriorityColor(post.priority)}
                            size="small"
                            variant="outlined"
                          />
                          {post.notifications.email && (
                            <Tooltip title="Email notification sent">
                              <EmailRoundedIcon fontSize="small" color="action" />
                            </Tooltip>
                          )}
                          {post.notifications.sms && (
                            <Tooltip title="SMS notification sent">
                              <SmsRoundedIcon fontSize="small" color="action" />
                            </Tooltip>
                          )}
                        </Stack>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {post.title}
                        </Typography>
                      </Stack>
                      {isManagementMode && (
                        <IconButton
                          onClick={(e) => handleActionMenuOpen(e, post)}
                          size="small"
                        >
                          <MoreVertRoundedIcon />
                        </IconButton>
                      )}
                    </Stack>

                    {/* Post Content */}
                    <Box 
                      sx={{ 
                        '& p': { mb: 1 },
                        '& ul': { pl: 2 },
                        '& li': { mb: 0.5 }
                      }}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Post Footer */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={3}>
                        <Typography variant="body2" color="text.secondary">
                          By {post.author} • {post.publishDate}
                        </Typography>
                        {post.expiryDate && (
                          <Typography variant="body2" color="warning.main">
                            Expires: {post.expiryDate}
                          </Typography>
                        )}
                      </Stack>
                      {isManagementMode && (
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            {post.engagement.views} views • {post.engagement.acknowledged} acknowledged
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>

        {/* Create/Edit Post Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {selectedPost ? 'Edit Announcement' : 'Create New Announcement'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Share important information with your tenants
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 4, pb: 2 }}>
            <Stack spacing={4} sx={{ mt: 2 }}>
              {/* Basic Information */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Announcement Title"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Pool Maintenance Schedule, New Parking Policy"
                    variant="outlined"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type"
                      onChange={(e) => setFormData({...formData, type: e.target.value as NewsPost['type']})}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="announcement">General Announcement</MenuItem>
                      <MenuItem value="maintenance">Maintenance Notice</MenuItem>
                      <MenuItem value="event">Community Event</MenuItem>
                      <MenuItem value="policy">Policy Change</MenuItem>
                      <MenuItem value="emergency">Emergency Alert</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {formData.type === 'other' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Describe the type of announcement"
                      placeholder="e.g., Tenant Survey, Community Vote, Special Notice"
                      value={formData.customTypeDescription}
                      onChange={(e) => setFormData({...formData, customTypeDescription: e.target.value})}
                      sx={{ minHeight: 56 }}
                      helperText="Please specify what type of announcement this is"
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      label="Priority"
                      onChange={(e) => setFormData({...formData, priority: e.target.value as NewsPost['priority']})}
                      sx={{ minHeight: 56 }}
                    >
                      <MenuItem value="low">Low Priority</MenuItem>
                      <MenuItem value="medium">Medium Priority</MenuItem>
                      <MenuItem value="high">High Priority</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Expiry Date"
                    type="date"
                    fullWidth
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={{ '& .MuiInputBase-root': { minHeight: 56 } }}
                  />
                </Grid>
              </Grid>

              {/* Target Audience Selection */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Blast Target Options
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Send To</InputLabel>
                      <Select
                        value={formData.targetAudience}
                        label="Send To"
                        onChange={(e) => setFormData({
                          ...formData,
                          targetAudience: e.target.value as NewsPost['targetAudience'],
                          targetProperties: [],
                          targetTenants: [],
                          targetPropertyGroups: []
                        })}
                        sx={{ minHeight: 56 }}
                      >
                        <MenuItem value="all">All Tenants</MenuItem>
                        <MenuItem value="properties">Specific Properties</MenuItem>
                        <MenuItem value="tenants">Specific Tenants</MenuItem>
                        <MenuItem value="property-groups">Property Groups</MenuItem>
                        <MenuItem value="custom">Custom Selection</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Property Selection */}
                  {(formData.targetAudience === 'properties' || formData.targetAudience === 'custom') && (
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Select Properties ({formData.targetProperties.length} selected)</InputLabel>
                        <Select
                          multiple
                          value={formData.targetProperties}
                          label={`Select Properties (${formData.targetProperties.length} selected)`}
                          onChange={(e) => setFormData({
                            ...formData,
                            targetProperties: typeof e.target.value === 'string'
                              ? e.target.value.split(',')
                              : e.target.value
                          })}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const property = properties.find(p => p.id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={property?.name || value}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {properties.map((property) => (
                            <MenuItem key={property.id} value={property.id}>
                              <Checkbox checked={formData.targetProperties.includes(property.id)} />
                              <ListItemText
                                primary={property.name}
                                secondary={`${property.address} • ${property.units} units`}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Tenant Selection */}
                  {(formData.targetAudience === 'tenants' || formData.targetAudience === 'custom') && (
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Select Tenants ({formData.targetTenants.length} selected)</InputLabel>
                        <Select
                          multiple
                          value={formData.targetTenants}
                          label={`Select Tenants (${formData.targetTenants.length} selected)`}
                          onChange={(e) => setFormData({
                            ...formData,
                            targetTenants: typeof e.target.value === 'string'
                              ? e.target.value.split(',')
                              : e.target.value
                          })}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const tenant = tenants.find(t => t.id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={tenant ? `${tenant.firstName} ${tenant.lastName}` : value}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {tenants.map((tenant) => (
                            <MenuItem key={tenant.id} value={tenant.id}>
                              <Checkbox checked={formData.targetTenants.includes(tenant.id)} />
                              <ListItemText
                                primary={`${tenant.firstName} ${tenant.lastName}`}
                                secondary={tenant.email}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Property Groups Selection */}
                  {(formData.targetAudience === 'property-groups' || formData.targetAudience === 'custom') && (
                    <Grid item xs={12}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Select Property Groups ({formData.targetPropertyGroups.length} selected)</InputLabel>
                        <Select
                          multiple
                          value={formData.targetPropertyGroups}
                          label={`Select Property Groups (${formData.targetPropertyGroups.length} selected)`}
                          onChange={(e) => setFormData({
                            ...formData,
                            targetPropertyGroups: typeof e.target.value === 'string'
                              ? e.target.value.split(',')
                              : e.target.value
                          })}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const group = propertyGroups.find(g => g.id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={group?.name || value}
                                    size="small"
                                    sx={{ bgcolor: group?.color + '15', borderColor: group?.color }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {propertyGroups.map((group) => (
                            <MenuItem key={group.id} value={group.id}>
                              <Checkbox checked={formData.targetPropertyGroups.includes(group.id)} />
                              <ListItemText
                                primary={group.name}
                                secondary={`${group.propertyIds.length} properties • ${group.description}`}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>

                {/* Target Summary */}
                {formData.targetAudience !== 'all' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Blast Summary:</strong> This announcement will be sent to{' '}
                      {formData.targetAudience === 'properties' &&
                        `${formData.targetProperties.length} selected properties`}
                      {formData.targetAudience === 'tenants' &&
                        `${formData.targetTenants.length} selected tenants`}
                      {formData.targetAudience === 'property-groups' &&
                        `${formData.targetPropertyGroups.length} property groups`}
                      {formData.targetAudience === 'custom' &&
                        `${formData.targetProperties.length} properties, ${formData.targetTenants.length} tenants, and ${formData.targetPropertyGroups.length} groups`}
                      {' '}via the selected notification methods.
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Content Editor */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Announcement Content
                </Typography>
                <RichTextEditor
                  label="Content"
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                  placeholder="Write your announcement content here. Use rich formatting to make it engaging..."
                  minHeight={300}
                  maxHeight={500}
                />
              </Box>

              {/* Settings */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Settings & Notifications
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isPinned}
                          onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                        />
                      }
                      label="Pin to top of news board"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">Notification Methods</Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notifications.email}
                            onChange={(e) => setFormData({
                              ...formData, 
                              notifications: {...formData.notifications, email: e.target.checked}
                            })}
                          />
                        }
                        label="Send email notification"
                        size="small"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notifications.sms}
                            onChange={(e) => setFormData({
                              ...formData, 
                              notifications: {...formData.notifications, sms: e.target.checked}
                            })}
                          />
                        }
                        label="Send SMS notification"
                        size="small"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notifications.push}
                            onChange={(e) => setFormData({
                              ...formData, 
                              notifications: {...formData.notifications, push: e.target.checked}
                            })}
                          />
                        }
                        label="Send push notification"
                        size="small"
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              size="large"
              sx={{ minWidth: 120, minHeight: 44 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSavePost}
              size="large"
              sx={{ minWidth: 140, minHeight: 44 }}
              disabled={!formData.title.trim()}
              startIcon={<SendRoundedIcon />}
            >
              {selectedPost ? 'Update' : 'Publish'} Announcement
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
        >
          {selectedPostForAction && (
            <List dense>
              <ListItem component="button" onClick={() => { handleEditPost(selectedPostForAction); handleActionMenuClose(); }}>
                <ListItemIcon>
                  <EditRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit Announcement" />
              </ListItem>
              <ListItem component="button" onClick={() => {
                setPosts(prev => prev.map(p =>
                  p.id === selectedPostForAction.id
                    ? {...p, isPinned: !p.isPinned}
                    : p
                ));
                handleActionMenuClose();
              }}>
                <ListItemIcon>
                  <PushPinRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={selectedPostForAction.isPinned ? "Unpin" : "Pin to Top"} />
              </ListItem>
              <Divider />
              <ListItem
                component="button"
                onClick={() => {
                  handleDeletePost(selectedPostForAction.id);
                  handleActionMenuClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <DeleteRoundedIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Delete Announcement" />
              </ListItem>
            </List>
          )}
        </Menu>
      </Stack>
    </Box>
  );
}
