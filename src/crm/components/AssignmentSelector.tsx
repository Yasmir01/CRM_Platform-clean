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
  Chip,
} from "@mui/material";
import {
  PersonRounded as PersonIcon,
  Business as BusinessIcon,
  Home as TenantIcon,
} from "@mui/icons-material";
import { useCrmData } from "../contexts/CrmDataContext";
import type { PropertyManager, Tenant, Contact } from "../contexts/CrmDataContext";

interface AssignmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  includeTypes?: ("propertyManagers" | "serviceProviders" | "tenants")[];
  propertyId?: string; // For context-aware tenant filtering
  tenantId?: string; // For context-aware tenant pre-selection
}

interface AssignmentOption {
  id: string;
  name: string;
  type: "propertyManager" | "serviceProvider" | "tenant";
  email?: string;
  company?: string;
  avatar?: string;
}

export default function AssignmentSelector({
  value,
  onChange,
  label = "Assigned To",
  fullWidth = true,
  includeTypes = ["propertyManagers", "serviceProviders", "tenants"],
  propertyId,
  tenantId,
}: AssignmentSelectorProps) {
  const { state } = useCrmData();
  const { propertyManagers, tenants, contacts } = state;

  const assignmentOptions = React.useMemo(() => {
    const options: AssignmentOption[] = [];

    // Add Property Managers
    if (includeTypes.includes("propertyManagers")) {
      propertyManagers?.forEach((manager: PropertyManager) => {
        options.push({
          id: `pm_${manager.id}`,
          name: `${manager.firstName} ${manager.lastName}`,
          type: "propertyManager",
          email: manager.email,
        });
      });
    }

    // Add Service Providers from contacts
    if (includeTypes.includes("serviceProviders")) {
      const serviceProviders = contacts?.filter(
        (contact: Contact) => contact.type === "ServiceProvider"
      ) || [];

      serviceProviders.forEach((provider: Contact) => {
        options.push({
          id: `sp_${provider.id}`,
          name: provider.company || `${provider.firstName} ${provider.lastName}`,
          type: "serviceProvider",
          email: provider.email,
          company: provider.company,
        });
      });
    }

    // Add Tenants (optionally filtered by property)
    if (includeTypes.includes("tenants")) {
      let filteredTenants = tenants || [];
      
      // If propertyId is provided, only show tenants from that property
      if (propertyId) {
        filteredTenants = filteredTenants.filter(
          (tenant: Tenant) => tenant.propertyId === propertyId
        );
      }

      filteredTenants.forEach((tenant: Tenant) => {
        options.push({
          id: `tenant_${tenant.id}`,
          name: `${tenant.firstName} ${tenant.lastName}`,
          type: "tenant",
          email: tenant.email,
        });
      });
    }

    return options;
  }, [propertyManagers, tenants, contacts, includeTypes, propertyId]);

  const getOptionIcon = (type: string) => {
    switch (type) {
      case "propertyManager":
        return <PersonIcon sx={{ fontSize: 20, color: "primary.main" }} />;
      case "serviceProvider":
        return <BusinessIcon sx={{ fontSize: 20, color: "warning.main" }} />;
      case "tenant":
        return <TenantIcon sx={{ fontSize: 20, color: "success.main" }} />;
      default:
        return <PersonIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "propertyManager":
        return "Property Manager";
      case "serviceProvider":
        return "Service Provider";
      case "tenant":
        return "Tenant";
      default:
        return "";
    }
  };

  // Auto-select tenant if tenantId is provided and no value is currently selected
  React.useEffect(() => {
    if (tenantId && !value && includeTypes.includes("tenants")) {
      const tenantOption = assignmentOptions.find(option =>
        option.type === "tenant" && option.id === `tenant_${tenantId}`
      );
      if (tenantOption) {
        onChange(tenantOption.id);
      }
    }
  }, [tenantId, value, assignmentOptions, includeTypes, onChange]);

  const selectedOption = assignmentOptions.find(option => option.id === value);

  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) => {
          if (!selected || !selectedOption) {
            return "";
          }
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              {getOptionIcon(selectedOption.type)}
              <Box>
                <Typography variant="body2">{selectedOption.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTypeLabel(selectedOption.type)}
                </Typography>
              </Box>
            </Stack>
          );
        }}
      >
        {/* Group by type */}
        {includeTypes.includes("propertyManagers") && 
          assignmentOptions.filter(opt => opt.type === "propertyManager").length > 0 && (
          <>
            <MenuItem disabled sx={{ opacity: 1, bgcolor: "action.hover" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Property Managers
                </Typography>
              </Stack>
            </MenuItem>
            {assignmentOptions
              .filter(option => option.type === "propertyManager")
              .map((option) => (
                <MenuItem key={option.id} value={option.id} sx={{ pl: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
                      {option.name.split(" ").map(n => n[0]).join("")}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.email && (
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
          </>
        )}

        {/* Service Providers */}
        {includeTypes.includes("serviceProviders") && 
          assignmentOptions.filter(opt => opt.type === "serviceProvider").length > 0 && (
          <>
            <MenuItem disabled sx={{ opacity: 1, bgcolor: "action.hover" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <BusinessIcon sx={{ fontSize: 20, color: "warning.main" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Service Providers
                </Typography>
              </Stack>
            </MenuItem>
            {assignmentOptions
              .filter(option => option.type === "serviceProvider")
              .map((option) => (
                <MenuItem key={option.id} value={option.id} sx={{ pl: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "warning.light" }}>
                      {option.name.split(" ").map(n => n[0]).join("")}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.company && (
                        <Typography variant="caption" color="text.secondary">
                          {option.company}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
          </>
        )}

        {/* Tenants */}
        {includeTypes.includes("tenants") && 
          assignmentOptions.filter(opt => opt.type === "tenant").length > 0 && (
          <>
            <MenuItem disabled sx={{ opacity: 1, bgcolor: "action.hover" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TenantIcon sx={{ fontSize: 20, color: "success.main" }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Tenants
                </Typography>
                {propertyId && (
                  <Chip 
                    label="Property Specific" 
                    size="small" 
                    variant="outlined" 
                    color="info"
                  />
                )}
              </Stack>
            </MenuItem>
            {assignmentOptions
              .filter(option => option.type === "tenant")
              .map((option) => (
                <MenuItem key={option.id} value={option.id} sx={{ pl: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "success.light" }}>
                      {option.name.split(" ").map(n => n[0]).join("")}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.email && (
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
          </>
        )}

        {assignmentOptions.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No assignees available
            </Typography>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
