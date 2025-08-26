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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import PropertyManagerDetailPage from "./PropertyManagerDetailPage";
import { useCrmData, PropertyManager } from "../contexts/CrmDataContext";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

export default function PropertyManagers() {
  const { state, addPropertyManager, updatePropertyManager, deletePropertyManager } = useCrmData();
  const { propertyManagers: managers } = state;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedManager, setSelectedManager] = React.useState<PropertyManager | null>(null);
  const [profilePicture, setProfilePicture] = React.useState<string>("");
  const [showManagerDetail, setShowManagerDetail] = React.useState(false);
  const [detailManagerId, setDetailManagerId] = React.useState<string>("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialties: "",
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddManager = () => {
    setSelectedManager(null);
    setProfilePicture("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      hireDate: "",
      experience: 0,
      certifications: "",
    });
    setOpenDialog(true);
  };

  const handleViewManagerDetail = (managerId: string) => {
    setDetailManagerId(managerId);
    setShowManagerDetail(true);
  };

  const handleEditManager = (manager: PropertyManager) => {
    setSelectedManager(manager);
    setProfilePicture(manager.profilePicture || "");
    setFormData({
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      phone: manager.phone,
      hireDate: manager.hireDate,
      experience: manager.experience,
      certifications: manager.certifications.join(", "),
    });
    setOpenDialog(true);
  };

  const handleSaveManager = () => {
    const specialtiesArray = formData.specialties.split(",").map(c => c.trim()).filter(c => c);

    if (selectedManager) {
      // Edit existing manager
      const updatedManager: PropertyManager = {
        ...selectedManager,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialties: specialtiesArray,
        status: "Active",
      };
      updatePropertyManager(updatedManager);
    } else {
      // Add new manager
      const newManagerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        propertyIds: [] as string[],
        specialties: specialtiesArray,
        status: "Active" as const,
      };
      addPropertyManager(newManagerData);
    }
    setOpenDialog(false);
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialties: "",
    });
  };

  const handleDeleteManager = (id: string) => {
    deletePropertyManager(id);
  };

  const filteredManagers = managers.filter(manager =>
    `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.properties.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: PropertyManager["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "On Leave": return "warning";
      case "Inactive": return "error";
      default: return "default";
    }
  };

  const totalManagers = managers.length;
  const activeManagers = managers.filter(m => m.status === "Active").length;
  const totalProperties = managers.reduce((sum, m) => sum + m.properties.length, 0);
  const avgExperience = Math.round(managers.reduce((sum, m) => sum + m.experience, 0) / managers.length);

  if (showManagerDetail) {
    return (
      <PropertyManagerDetailPage
        managerId={detailManagerId}
        onBack={() => setShowManagerDetail(false)}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Property Managers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddManager}
        >
          Add Manager
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PeopleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Managers
                  </Typography>
                  <Typography variant="h4">{totalManagers}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <PeopleRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Managers
                  </Typography>
                  <Typography variant="h4">{activeManagers}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <HomeWorkRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Properties Managed
                  </Typography>
                  <Typography variant="h4">{totalProperties}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  📊
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Avg Experience
                  </Typography>
                  <Typography variant="h4">{avgExperience} yrs</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search managers..."
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

      {/* Managers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Manager</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Properties</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Certifications</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredManagers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={manager.profilePicture}
                      sx={{ bgcolor: "primary.light", width: 40, height: 40 }}
                    >
                      {!manager.profilePicture && `${manager.firstName[0]}${manager.lastName[0]}`}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => handleViewManagerDetail(manager.id)}
                      >
                        {manager.firstName} {manager.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Since {new Date(manager.hireDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{manager.email}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{manager.phone}</Typography>
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    {manager.properties.map((property, index) => (
                      <Stack key={index} direction="row" alignItems="center" spacing={1}>
                        <HomeWorkRoundedIcon fontSize="small" color="action" />
                        <Typography variant="body2">{property}</Typography>
                      </Stack>
                    ))}
                    {manager.properties.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No properties assigned
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {manager.experience} years
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {manager.certifications.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={manager.status}
                    color={getStatusColor(manager.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Manager">
                      <IconButton
                        size="small"
                        onClick={() => handleEditManager(manager)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Manager">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteManager(manager.id)}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Manager Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedManager ? "Edit Manager" : "Add New Manager"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Profile Picture Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Profile Picture</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={profilePicture}
                  sx={{ width: 80, height: 80 }}
                >
                  {!profilePicture && formData.firstName && formData.lastName &&
                    `${formData.firstName[0]}${formData.lastName[0]}`}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadRoundedIcon />}
                >
                  Upload Picture
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </Button>
                {profilePicture && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => setProfilePicture("")}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              label="Specialties (comma separated)"
              fullWidth
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              placeholder="Residential, Commercial, Luxury Properties"
              helperText="Enter certifications separated by commas"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveManager}>
            {selectedManager ? "Update" : "Add"} Manager
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
