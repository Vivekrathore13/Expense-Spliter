import React from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputBase,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

import NotificationBell from "../../Components/Notifications/NotificationBell";

const Topbar = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.85)",
        borderBottom: `1px solid ${alpha("#0f172a", 0.06)}`,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 76 }}>
        {/* Mobile menu */}
        {isMobile && (
          <IconButton onClick={onMenuClick} sx={{ mr: 0.5 }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Search */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2.2,
            py: 1.2,
            borderRadius: 999,
            bgcolor: "white",
            border: `1px solid ${alpha("#94a3b8", 0.28)}`,
            boxShadow: "0 12px 25px rgba(2,6,23,0.06)",
            maxWidth: 620,
          }}
        >
          <SearchIcon sx={{ opacity: 0.55 }} />
          <InputBase
            placeholder="Search groups, expenses..."
            sx={{ width: "100%", fontWeight: 800 }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search icon (small) */}
        <IconButton sx={{ bgcolor: alpha("#0f172a", 0.04) }}>
          <SearchIcon sx={{ opacity: 0.75 }} />
        </IconButton>

        {/* Notifications: keep your component */}
        <NotificationBell />

        {/* If you want exact badge like reference use below instead of NotificationBell */}
        {/* 
        <IconButton sx={{ bgcolor: alpha("#0f172a", 0.04) }}>
          <Badge badgeContent={3} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
        */}

        <Avatar sx={{ width: 36, height: 36 }}>V</Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
