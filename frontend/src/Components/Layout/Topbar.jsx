import React from "react";
import {
  AppBar,
  Avatar,
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
        bgcolor: "rgba(255,255,255,0.35)",
        borderBottom: `1px solid ${alpha("#0f172a", 0.06)}`,
        backdropFilter: "blur(14px)",
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 74 }}>
        {/* Mobile menu */}
        {isMobile && (
          <IconButton onClick={onMenuClick}>
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
            bgcolor: "rgba(255,255,255,0.55)",
            border: `1px solid ${alpha("#94a3b8", 0.35)}`,
            boxShadow: "0 10px 25px rgba(2,6,23,0.06)",
            maxWidth: 520,
          }}
        >
          <SearchIcon sx={{ opacity: 0.6 }} />
          <InputBase
            placeholder="Search groups, expenses..."
            sx={{ width: "100%", fontWeight: 800 }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right */}
        <IconButton sx={{ bgcolor: "rgba(255,255,255,0.55)" }}>
          <SearchIcon sx={{ opacity: 0.75 }} />
        </IconButton>

        {/* ✅ Notifications */}
        <NotificationBell />
        {/* If you want exact icon like image:
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.55)" }}>
              <NotificationsNoneOutlinedIcon />
            </IconButton>
        */}

        <Avatar sx={{ width: 36, height: 36 }}>V</Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
