import * as React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Avatar,
  Box,
  Grid,
} from "@mui/material";
import {
  PersonRounded as PersonIcon,
  Business as BusinessIcon,
  Home as TenantIcon,
} from "@mui/icons-material";
import { useCrmData } from "../contexts/CrmDataContext";
import type { PropertyManager, Tenant, Contact } from "../contexts/CrmDataContext";

interface TwoStepAssignmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  propertyId?: string; // For context-aware tenant filtering
  tenantId?: string; // For context-aware tenant pre-selection
}

type AssignmentCategory = "tenant" | "manager" | "serviceProvider" | "";

export default function TwoStepAssignmentSelector({
  value,
  onChange,
  label = "Assigned To",
  fullWidth = true,
  propertyId,
  tenantId,
}: TwoStepAssignmentSelectorProps) {
  const { state } = useCrmData();
  const { propertyManagers, tenants, contacts } = state;

  // Debug logging to check data availability
  React.useEffect(() => {
    console.log("TwoStepAssignmentSelector - Real-time Data Update:", {
      propertyManagers: propertyManagers?.length || 0,
      tenants: tenants?.length || 0,
      contacts: contacts?.length || 0,
      serviceProviders: contacts?.filter(c => c.type === "ServiceProvider")?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [propertyManagers, tenants, contacts]);
  
  // Parse the current value to determine category and person
  const [selectedCategory, setSelectedCategory] = React.useState<AssignmentCategory>("");
  const [selectedPerson, setSelectedPerson] = React.useState<string>("");

  React.useEffect(() => {
    if (value) {
      if (value.startsWith("tenant_")) {
        setSelectedCategory("tenant");
        setSelectedPerson(value);
      } else if (value.startsWith("pm_")) {
        setSelectedCategory("manager");
        setSelectedPerson(value);
      } else if (value.startsWith("sp_")) {
        setSelectedCategory("serviceProvider");
        setSelectedPerson(value);
      }
    } else {
      setSelectedCategory("");
      setSelectedPerson("");
    }
  }, [value]);

  const handleCategoryChange = (category: AssignmentCategory) => {
    setSelectedCategory(category);
    setSelectedPerson("");
    onChange(""); // Clear the final value when category changes
  };

  const handlePersonChange = (personValue: string) => {
    setSelectedPerson(personValue);
    onChange(personValue);
  };

  // Get people for the selected category with memoization for better performance
  const getPeopleForCategory = React.useCallback(() => {
    switch (selectedCategory) {
      case "tenant":
        if (!tenants) return [];
        let filteredTenants = tenants;
        // If propertyId is provided, only show tenants from that property
        if (propertyId) {
          filteredTenants = tenants.filter(
            (tenant: Tenant) => tenant.propertyId === propertyId
          );
        }
        return filteredTenants.map((tenant: Tenant) => ({
          id: `tenant_${tenant.id}`,
          name: `${tenant.firstName} ${tenant.lastName}`,
          email: tenant.email,
          subtitle: tenant.propertyId ? `Property: ${tenant.propertyId}` : undefined,
        }));

      case "manager":
        if (!propertyManagers) return [];
        return propertyManagers.map((manager: PropertyManager) => ({
          id: `pm_${manager.id}`,
          name: `${manager.firstName} ${manager.lastName}`,
          email: manager.email,
          subtitle: manager.specialties?.join(", "),
        }));

      case "serviceProvider":
        if (!contacts) return [];
        const serviceProviders = contacts.filter(
          (contact: Contact) => contact.type === "ServiceProvider"
        );
        return serviceProviders.map((provider: Contact) => ({
          id: `sp_${provider.id}`,
          name: provider.company || `${provider.firstName} ${provider.lastName}`,
          email: provider.email,
          subtitle: provider.company ? `${provider.firstName} ${provider.lastName}` : provider.tags?.join(", "),
        }));

      default:
        return [];
    }
  }, [selectedCategory, tenants, propertyManagers, contacts, propertyId]);

  const getCategoryIcon = (category: AssignmentCategory) => {
    switch (category) {
      case "manager":
        return <PersonIcon sx={{ fontSize: 20, color: "primary.main" }} />;
      case "serviceProvider":
        return <BusinessIcon sx={{ fontSize: 20, color: "warning.main" }} />;
      case "tenant":
        return <TenantIcon sx={{ fontSize: 20, color: "success.main" }} />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: AssignmentCategory) => {
    switch (category) {
      case "manager":
        return "Property Manager";
      case "serviceProvider":
        return "Service Provider";
      case "tenant":
        return "Tenant";
      default:
        return "";
    }
  };

  const selectedPersonInfo = React.useMemo(() => {
    const people = getPeopleForCategory();
    return people.find(person => person.id === selectedPerson);
  }, [getPeopleForCategory, selectedPerson]);

  return (
    <Grid container spacing={2}>
      {/* Step 1: Category Selection */}
      <Grid item xs={12} sm={5} md={4}>
        <FormControl fullWidth={fullWidth}>
          <InputLabel>Assignment Type</InputLabel>
          <Select
            value={selectedCategory}
            label="Assignment Type"
            onChange={(e) => handleCategoryChange(e.target.value as AssignmentCategory)}
          >
            <MenuItem value="tenant">
              <Stack direction="row" alignItems="center" spacing={1}>
                <TenantIcon sx={{ fontSize: 20, color: "success.main" }} />
                <Typography>Tenant</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value="manager">
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Typography>Property Manager</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value="serviceProvider">
              <Stack direction="row" alignItems="center" spacing={1}>
                <BusinessIcon sx={{ fontSize: 20, color: "warning.main" }} />
                <Typography>Service Provider</Typography>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Step 2: Person Selection */}
      <Grid item xs={12} sm={7} md={8}>
        <FormControl fullWidth={fullWidth} disabled={!selectedCategory}>
          <InputLabel>
            {selectedCategory ? `Select ${getCategoryLabel(selectedCategory)}` : "Select Type First"}
          </InputLabel>
          <Select
            value={selectedPerson}
            label={selectedCategory ? `Select ${getCategoryLabel(selectedCategory)}` : "Select Type First"}
            onChange={(e) => handlePersonChange(e.target.value)}
            renderValue={(selected) => {
              if (!selected || !selectedPersonInfo) {
                return "";
              }
              return (
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getCategoryIcon(selectedCategory)}
                  <Box>
                    <Typography variant="body2">{selectedPersonInfo.name}</Typography>
                    {selectedPersonInfo.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {selectedPersonInfo.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              );
            }}
          >
            {getPeopleForCategory().map((person) => (
              <MenuItem key={person.id} value={person.id}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: selectedCategory === "manager" ? "primary.light" : 
                             selectedCategory === "serviceProvider" ? "warning.light" : "success.light"
                  }}>
                    {person.name.split(" ").map(n => n[0]).join("")}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{person.name}</Typography>
                    {person.email && (
                      <Typography variant="caption" color="text.secondary">
                        {person.email}
                      </Typography>
                    )}
                    {person.subtitle && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {person.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </MenuItem>
            ))}
            {getPeopleForCategory().length === 0 && (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  No {getCategoryLabel(selectedCategory).toLowerCase()}s available
                </Typography>
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
