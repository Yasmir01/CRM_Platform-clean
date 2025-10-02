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
<<<<<<< HEAD
import "./crm-side-menu.css";
=======
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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
<<<<<<< HEAD
      className="crm-drawer"
    >
      <div className="crm-user-area">
        <CrmUserSelector />
      </div>
=======
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <CrmUserSelector />
      </Box>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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
<<<<<<< HEAD
        <div className="crm-bottom-user">
=======
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
          <Avatar
            sizes="small"
            alt={`${user.firstName} ${user.lastName}`}
            src={user.avatar || "/static/images/avatar/7.jpg"}
<<<<<<< HEAD
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
=======
            sx={{ width: 36, height: 36, bgcolor: "primary.main" }}
          >
            {getUserInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box sx={{ mr: "auto" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, lineHeight: "16px" }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {user.email}
            </Typography>
          </Box>
          <CrmOptionsMenu />
        </Stack>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
      )}
    </Drawer>
  );
}
