import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../services/axiosinstance";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "My Groups", path: "/groups", icon: <GroupsIcon /> },
  { label: "Expenses", path: "/expenses", icon: <ReceiptLongIcon /> },
  { label: "Settle Up", path: "/settle", icon: <CompareArrowsIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const displayName = user?.fullName || "User";
  const displayEmail = user?.email || "";
  const avatarLetter = displayName?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout");
      toast.success("Logout successful ✅");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed ❌");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        borderRadius: 6,
        p: 2,
        bgcolor: "rgba(255,255,255,0.40)",
        border: "1px solid rgba(226,232,240,0.75)",
        boxShadow: "0 18px 45px rgba(2,6,23,0.10)",
        background:
          "linear-gradient(180deg, rgba(239,242,255,0.95) 0%, rgba(238,242,255,0.65) 55%, rgba(241,245,249,0.55) 100%)",
        display: "flex",
        flexDirection: "column",

        // ✅ IMPORTANT: prevent mobile overflow / right side cut
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 1, pb: 1.8 }}>
        <Box sx={{ display: "flex", gap: 1.1, align_toggle: "center", alignItems: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              bgcolor: "rgba(37,99,235,0.14)",
              border: "1px solid rgba(37,99,235,0.22)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            ▮▮
          </Box>

          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 18,
              color: "#0f172a",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Expense <span style={{ color: "#2563eb" }}>Splitter</span>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ opacity: 0.55, mb: 1.4 }} />

      {/* Menu */}
      <List sx={{ px: 0.6 }}>
        {navItems.map((item) => {
          const active =
            item.label === "Settle Up"
              ? location.pathname.startsWith("/settle")
              : location.pathname === item.path;

          return (
            <ListItemButton
              key={item.label}
              onClick={() => {
                if (item.label === "Settle Up") {
                  toast.info("Select a group to settle up ✅");
                  navigate("/settle");
                } else {
                  navigate(item.path);
                }
                onItemClick?.();
              }}
              sx={{
                mb: 1,
                borderRadius: 4,
                px: 1.6,
                py: 1.25,
                transition: "0.18s",
                bgcolor: active ? alpha("#2563eb", 0.18) : "transparent",
                border: active
                  ? `1px solid ${alpha("#2563eb", 0.2)}`
                  : "1px solid transparent",
                "&:hover": {
                  bgcolor: active
                    ? alpha("#2563eb", 0.2)
                    : alpha("#0f172a", 0.05),
                },
              }}
            >
              {/* ✅ ICON CONSISTENCY FIX */}
              <ListItemIcon
                sx={{
                  minWidth: 44,
                  display: "grid",
                  placeItems: "center",
                  color: active ? "#2563eb" : alpha("#0f172a", 0.6),

                  // ✅ make all icons same size
                  "& svg": {
                    fontSize: 22,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 900 : 800,
                  fontSize: 14,
                  color: active ? "#1d4ed8" : alpha("#0f172a", 0.9),
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer user */}
      <Box sx={{ mt: "auto" }}>
        <Box
          sx={{
            p: 1.6,
            borderRadius: 5,
            bgcolor: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(226,232,240,0.9)",
            boxShadow: "0 14px 35px rgba(2,6,23,0.10)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
            <Avatar sx={{ width: 44, height: 44, flexShrink: 0 }}>
              {avatarLetter}
            </Avatar>

            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  opacity: 0.7,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayEmail}
              </Typography>
            </Box>
          </Box>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              mt: 1.4,
              borderRadius: 4,
              bgcolor: alpha("#0f172a", 0.05),
              "&:hover": { bgcolor: alpha("#0f172a", 0.08) },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 44,
                display: "grid",
                placeItems: "center",
                color: alpha("#0f172a", 0.7),
                "& svg": { fontSize: 22 },
              }}
            >
              <LogoutIcon />
            </ListItemIcon>

            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 900,
                fontSize: 14,
              }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
