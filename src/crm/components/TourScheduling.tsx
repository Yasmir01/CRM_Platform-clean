import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Divider,
  Chip,
  Box,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useCrmData } from "../contexts/CrmDataContext";

interface TourRequest {
  prospectName: string;
  prospectEmail: string;
  prospectPhone: string;
  propertyName: string;
  propertyAddress: string;
  propertyId?: string;
  requestedDate: string;
  requestedTime: string;
  message?: string;
  tourType: "In-Person" | "Virtual" | "Self-Guided";
  urgency: "Low" | "Medium" | "High";
}

interface TourSchedulingProps {
  open: boolean;
  onClose: () => void;
  propertyName?: string;
  propertyAddress?: string;
  propertyId?: string;
  allowPropertySelection?: boolean; // When true, shows property dropdown
  onScheduleTour?: (tourRequest: TourRequest) => void;
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

export default function TourScheduling({
  open,
  onClose,
  propertyName = "",
  propertyAddress = "",
  propertyId = "",
  allowPropertySelection = false,
  onScheduleTour
}: TourSchedulingProps) {
  const { state } = useCrmData();
  const { properties } = state;
  const [formData, setFormData] = React.useState<TourRequest>({
    prospectName: "",
    prospectEmail: "",
    prospectPhone: "",
    propertyName: propertyName,
    propertyAddress: propertyAddress,
    propertyId: propertyId,
    requestedDate: "",
    requestedTime: "",
    message: "",
    tourType: "In-Person",
    urgency: "Medium"
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        propertyName: propertyName,
        propertyAddress: propertyAddress
      }));
    }
  }, [open, propertyName, propertyAddress]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.prospectName.trim()) {
      errors.prospectName = "Name is required";
    }
    
    if (!formData.prospectEmail.trim()) {
      errors.prospectEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.prospectEmail)) {
      errors.prospectEmail = "Please enter a valid email";
    }
    
    if (!formData.prospectPhone.trim()) {
      errors.prospectPhone = "Phone number is required";
    }
    
    if (!formData.requestedDate) {
      errors.requestedDate = "Date is required";
    } else {
      const selectedDate = new Date(formData.requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.requestedDate = "Please select a future date";
      }
    }
    
    if (!formData.requestedTime) {
      errors.requestedTime = "Time is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // In a real app, this would send the tour request to the backend
      if (onScheduleTour) {
        onScheduleTour(formData);
      }
      
      // Reset form
      setFormData({
        prospectName: "",
        prospectEmail: "",
        prospectPhone: "",
        propertyName: propertyName,
        propertyAddress: propertyAddress,
        requestedDate: "",
        requestedTime: "",
        message: "",
        tourType: "In-Person",
        urgency: "Medium"
      });
      
      setFormErrors({});
      onClose();
      
      alert(`Tour request submitted successfully! Management will contact ${formData.prospectName} within 24 hours to confirm the appointment.`);
    }
  };

  const handleChange = (field: keyof TourRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CalendarTodayIcon />
          <Typography variant="h5">Schedule Property Tour</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Property Information */}
          <Paper sx={{ p: 2, bgcolor: "primary.light", color: "primary.contrastText" }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <HomeIcon />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {allowPropertySelection ? "Select Property for Tour" : (propertyName || "Property Tour Request")}
                </Typography>
                {!allowPropertySelection && propertyAddress && (
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {propertyAddress}
                  </Typography>
                )}
              </Box>
            </Stack>
            {allowPropertySelection && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: "primary.contrastText" }}>Select Property</InputLabel>
                  <Select
                    value={formData.propertyId || ""}
                    label="Select Property"
                    onChange={(e) => {
                      const selectedProperty = properties.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        propertyId: e.target.value,
                        propertyName: selectedProperty ? selectedProperty.name : "",
                        propertyAddress: selectedProperty ? selectedProperty.address : ""
                      });
                    }}
                    sx={{
                      color: "primary.contrastText",
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.contrastText'
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'primary.contrastText'
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Choose a property</em>
                    </MenuItem>
                    {properties.filter(p => p.status === "Available").map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name} - {property.address}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (${property.monthlyRent.toLocaleString()}/mo)
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formData.propertyId && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Selected: {formData.propertyName} - {formData.propertyAddress}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>

          {/* Prospect Information */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Contact Information
        </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={formData.prospectName}
                  onChange={(e) => handleChange("prospectName", e.target.value)}
                  error={!!formErrors.prospectName}
                  helperText={formErrors.prospectName}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={formData.prospectEmail}
                  onChange={(e) => handleChange("prospectEmail", e.target.value)}
                  error={!!formErrors.prospectEmail}
                  helperText={formErrors.prospectEmail}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  required
                  value={formData.prospectPhone}
                  onChange={(e) => handleChange("prospectPhone", e.target.value)}
                  error={!!formErrors.prospectPhone}
                  helperText={formErrors.prospectPhone}
                  placeholder="(555) 123-4567"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: "action.active" }} />
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Tour Details */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Tour Preferences
        </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Preferred Date"
                  type="date"
                  fullWidth
                  required
                  value={formData.requestedDate}
                  onChange={(e) => handleChange("requestedDate", e.target.value)}
                  error={!!formErrors.requestedDate}
                  helperText={formErrors.requestedDate}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getMinDate() }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.requestedTime}>
                  <InputLabel>Preferred Time</InputLabel>
                  <Select
                    value={formData.requestedTime}
                    label="Preferred Time"
                    onChange={(e) => handleChange("requestedTime", e.target.value)}
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.requestedTime && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                      {formErrors.requestedTime}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tour Type</InputLabel>
                  <Select
                    value={formData.tourType}
                    label="Tour Type"
                    onChange={(e) => handleChange("tourType", e.target.value)}
                  >
                    <MenuItem value="In-Person">In-Person Tour</MenuItem>
                    <MenuItem value="Virtual">Virtual Tour</MenuItem>
                    <MenuItem value="Self-Guided">Self-Guided Tour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Urgency</InputLabel>
                  <Select
                    value={formData.urgency}
                    label="Urgency"
                    onChange={(e) => handleChange("urgency", e.target.value)}
                  >
                    <MenuItem value="Low">Low - Flexible timing</MenuItem>
                    <MenuItem value="Medium">Medium - Within a week</MenuItem>
                    <MenuItem value="High">High - ASAP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Additional Message */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Additional Information (Optional)
        </Typography>
            <TextField
              label="Special requests or questions"
              multiline
              rows={3}
              fullWidth
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Any specific areas of interest, accessibility needs, or questions about the property..."
            />
          </Paper>

          {/* Information Alert */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>What happens next:</strong>
              <br />
              1. Your tour request will be sent to our management team
              <br />
              2. You'll receive a confirmation call/email within 24 hours
              <br />
              3. Our team will confirm or suggest alternative times
              <br />
              4. You'll receive tour details and directions before your visit
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          startIcon={<CalendarTodayIcon />}
        >
          Submit Tour Request
        </Button>
      </DialogActions>
    </Dialog>
  );
}
