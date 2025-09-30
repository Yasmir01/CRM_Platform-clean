import * as React from "react";
import { List, ListItemButton, ListItemText, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface MenuItem {
  label: string;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/tenant" },
  { label: "Payments", path: "/tenant/payments" },
  { label: "Maintenance", path: "/tenant/maintenance" },
  { label: "Lease", path: "/tenant/lease" },
  { label: "Autopay", path: "/tenant/autopay" },
  { label: "Refunds", path: "/tenant/refunds" },
  { label: "Checkout", path: "/tenant/checkout" },
  { label: "Payment Methods", path: "/tenant/payment-methods" },
  { label: "New Payment", path: "/tenant/new-payment" },
  { label: "Autopay Setup", path: "/tenant/autopay-setup" },
];

export default function CrmMenuContent() {
  return (
    <List>
      {menuItems.map((item, index) => (
        <React.Fragment key={item.path}>
          <ListItemButton component={RouterLink} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItemButton>
          {index === 0 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}
