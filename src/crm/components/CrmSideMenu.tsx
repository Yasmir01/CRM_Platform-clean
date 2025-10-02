import * as React from "react";
import { styled } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CrmUserSelector from "./CrmUserSelector";
import CrmMenuContent from "./CrmMenuContent";
import CrmOptionsMenu from "./CrmOptionsMenu";
import "./crm-side-menu.css";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function CrmSideMenu() {
  const { user } = useAuth();

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Drawer
      variant="permanent"
      className="crm-drawer"
    >
      <div className="crm-user-area">
        <CrmUserSelector />
      </div>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CrmMenuContent />
      </Box>
      {user && (
        <div className="crm-bottom-user">
          <Avatar
            sizes="small"
            alt={`${user.firstName} ${user.lastName}`}
            src={user.avatar || "/static/images/avatar/7.jpg"}
            className="crm-avatar"
          >
            {getUserInitials(user.firstName, user.lastName)}
          </Avatar>
          <div className="crm-bottom-user-info">
            <div className="user-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="user-email">
              {user.email}
            </div>
          </div>
          <CrmOptionsMenu />
        </div>
      )}
    </Drawer>
  );
}
