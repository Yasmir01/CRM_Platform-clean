import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useCrmData } from "../contexts/CrmDataContext";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

const colorOptions = [
  { name: "Blue", value: "#2196F3" },
  { name: "Green", value: "#4CAF50" },
  { name: "Orange", value: "#FF9800" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Red", value: "#F44336" },
  { name: "Teal", value: "#009688" },
  { name: "Indigo", value: "#3F51B5" },
  { name: "Pink", value: "#E91E63" },
];

export default function PropertyGroups() {
  const { state, addPropertyGroup, updatePropertyGroup, deletePropertyGroup } = useCrmData();
  const { properties, propertyGroups } = state;
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    propertyIds: [] as string[],
    color: "#2196F3",
    tags: "",
  });

  const filteredGroups = propertyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setFormData({
      name: "",
      description: "",
      propertyIds: [],
      color: "#2196F3",
      tags: "",
    });
    setOpenDialog(true);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      propertyIds: group.propertyIds,
      color: group.color,
      tags: group.tags.join(", "),
    });
    setOpenDialog(true);
  };

  const handleSaveGroup = () => {
    const tags = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    
    if (selectedGroup) {
      updatePropertyGroup({
        ...selectedGroup,
        ...formData,
        tags,
      });
    } else {
      addPropertyGroup({
        ...formData,
        tags,
      });
    }
    setOpenDialog(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this property group?")) {
      deletePropertyGroup(groupId);
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      propertyIds: prev.propertyIds.includes(propertyId)
        ? prev.propertyIds.filter(id => id !== propertyId)
        : [...prev.propertyIds, propertyId]
    }));
  };

  const getGroupStats = (group: any) => {
    const groupProperties = properties.filter(p => group.propertyIds.includes(p.id));
    const totalUnits = groupProperties.reduce((sum, p) => sum + p.units, 0);
    const occupiedUnits = groupProperties.reduce((sum, p) => sum + p.occupancy, 0);
    const totalRevenue = groupProperties.reduce((sum, p) => sum + (p.monthlyRent * p.occupancy), 0);
    const potentialRevenue = groupProperties.reduce((sum, p) => sum + (p.monthlyRent * p.units), 0);
    const avgOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    const availableUnits = totalUnits - occupiedUnits;

    return {
      totalProperties: groupProperties.length,
      totalUnits,
      occupiedUnits,
      availableUnits,
      totalRevenue,
      potentialRevenue,
      avgOccupancy
    };
  };

  const handleSendBlast = (group: any) => {
    // Navigate to news board with pre-selected group
    window.location.href = `/crm/news?preSelectGroup=${group.id}`;
  };

  const handleCreateAnnouncement = (group: any) => {
    // Open announcement dialog with group pre-selected
    alert(`Create announcement for ${group.name} - This will pre-select the group in the announcement dialog`);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Property Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleCreateGroup}
        >
          Create Group
        </Button>
      </Stack>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search property groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Groups Grid */}
      <Grid container spacing={3}>
        {filteredGroups.map((group) => {
          const stats = getGroupStats(group);
          const groupProperties = properties.filter(p => group.propertyIds.includes(p.id));
          
          return (
            <Grid item xs={12} md={6} lg={4} key={group.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={2}>
                    {/* Group Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: group.color, width: 48, height: 48 }}>
                          <GroupRoundedIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {group.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {group.propertyIds.length} properties
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit Group">
                          <IconButton size="small" onClick={() => handleEditGroup(group)}>
                            <EditRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Group">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteGroup(group.id)}
                            color="error"
                          >
                            <DeleteRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary">
                      {group.description}
                    </Typography>

                    {/* Enhanced Stats */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box textAlign="center" sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="primary.contrastText">
                            {stats.totalProperties}
                          </Typography>
                          <Typography variant="caption" color="primary.contrastText">
                            Properties
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="info.contrastText">
                            {stats.totalUnits}
                          </Typography>
                          <Typography variant="caption" color="info.contrastText">
                            Total Units
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="success.contrastText">
                            {stats.occupiedUnits}
                          </Typography>
                          <Typography variant="caption" color="success.contrastText">
                            Occupied
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                          <Typography variant="h6" color="warning.contrastText">
                            {stats.availableUnits}
                          </Typography>
                          <Typography variant="caption" color="warning.contrastText">
                            Available
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box textAlign="center">
                              <Typography variant="subtitle2" color="success.main">
                                ${(stats.totalRevenue / 1000).toFixed(1)}K
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Current Revenue
                              </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box textAlign="center">
                              <Typography variant="subtitle2" color="text.primary">
                                ${(stats.potentialRevenue / 1000).toFixed(1)}K
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Potential Revenue
                              </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box textAlign="center">
                              <Typography variant="subtitle2" color="info.main">
                                {stats.avgOccupancy.toFixed(1)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Occupancy Rate
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Properties List */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Properties:
                      </Typography>
                      <Stack spacing={0.5}>
                        {groupProperties.slice(0, 3).map((property) => (
                          <Typography key={property.id} variant="body2" color="text.secondary">
                            • {property.name}
                          </Typography>
                        ))}
                        {groupProperties.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            • +{groupProperties.length - 3} more
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    {/* Tags */}
                    {group.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                        {group.tags.map((tag: string, index: number) => (
                          <Chip 
                            key={index} 
                            label={tag} 
                            size="small" 
                            variant="outlined"
                            sx={{ bgcolor: `${group.color}15`, borderColor: group.color }}
                          />
                        ))}
                      </Stack>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CampaignRoundedIcon />}
                        fullWidth
                      >
                        Send Blast
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<BarChartRoundedIcon />}
                        fullWidth
                      >
                        View Report
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <GroupRoundedIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? "No groups found" : "No property groups yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Create your first property group to organize properties for better management"
            }
          </Typography>
          {!searchTerm && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreateGroup}>
              Create Property Group
            </Button>
          )}
        </Paper>
      )}

      {/* Create/Edit Group Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGroup ? `Edit Group: ${selectedGroup.name}` : "Create New Property Group"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Group Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Downtown Portfolio, Luxury Properties"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={formData.color}
                    label="Color"
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  >
                    {colorOptions.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              bgcolor: color.value,
                            }}
                          />
                          <Typography>{color.name}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this group and its purpose"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select Properties ({formData.propertyIds.length} selected)
              </Typography>
              <Paper sx={{ maxHeight: 300, overflow: "auto", border: 1, borderColor: "divider" }}>
                <List>
                  {properties.map((property) => (
                    <ListItem
                      key={property.id}
                      button
                      onClick={() => handlePropertyToggle(property.id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={formData.propertyIds.includes(property.id)}
                          onChange={() => handlePropertyToggle(property.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={property.name}
                        secondary={`${property.address} • ${property.units} units • $${property.monthlyRent.toLocaleString()}/mo`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., luxury, downtown, commercial"
              helperText="Tags help categorize and filter groups"
            />

            <Alert severity="info">
              <Typography variant="body2">
                Property groups help organize properties for targeted communications, reports, and analytics.
                You can send group-specific notifications and generate consolidated reports.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveGroup}
            disabled={!formData.name || formData.propertyIds.length === 0}
          >
            {selectedGroup ? "Update Group" : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
