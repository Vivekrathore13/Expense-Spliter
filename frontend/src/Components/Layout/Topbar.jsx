import React, { useMemo } from "react";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationBell from "../Notifications/NotificationBell";

const Topbar = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ✅ avatar letter from user
  const avatarLetter = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const name = user?.fullName || "User";
      return name?.charAt(0)?.toUpperCase() || "U";
    } catch {
      return "U";
    }
  }, []);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.85)",
        borderBottom: `1px solid ${alpha("#0f172a", 0.06)}`,
        backdropFilter: "blur(14px)",
        overflowX: "hidden", // ✅ mobile safe
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 68, md: 76 },
          px: { xs: 1, md: 2 },
          gap: 1.1,
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {/* ✅ Mobile menu */}
        {isMobile && (
          <IconButton
            onClick={onMenuClick}
            sx={{
              width: 42,
              height: 42,
              bgcolor: alpha("#0f172a", 0.04),
              borderRadius: 3,
              flexShrink: 0,
              "&:hover": { bgcolor: alpha("#0f172a", 0.07) },
            }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>
        )}

        {/* ✅ Spacer to push icons right */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }} />

        {/* ✅ Notifications */}
        <NotificationBell />

        {/* ✅ Avatar */}
        <Avatar
          sx={{
            width: 38,
            height: 38,
            fontWeight: 900,
            bgcolor: alpha("#2563eb", 0.18),
            color: "#1d4ed8",
            border: `1px solid ${alpha("#2563eb", 0.25)}`,
            flexShrink: 0,
          }}
        >
          {avatarLetter}
        </Avatar>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
