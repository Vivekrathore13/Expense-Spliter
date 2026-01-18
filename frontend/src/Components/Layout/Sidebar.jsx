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
  { label: "Settle Up", path: "/groups", icon: <CompareArrowsIcon /> },
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
        px: 1.6,
        py: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 1.2, pb: 2 }}>
        <StackBrand />
      </Box>

      <Divider sx={{ opacity: 0.5, mb: 1.5 }} />

      {/* Menu */}
      <List sx={{ px: 0.6, py: 0.8 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.label}
              onClick={() => {
                if (item.label === "Settle Up") {
                  toast.info("Select a group to settle up ✅");
                  navigate("/groups");
                } else {
                  navigate(item.path);
                }
                if (onItemClick) onItemClick();
              }}
              sx={{
                mb: 0.9,
                borderRadius: 3,
                px: 1.5,
                py: 1.15,
                bgcolor: active ? alpha("#2563eb", 0.18) : "transparent",
                border: active
                  ? `1px solid ${alpha("#2563eb", 0.25)}`
                  : "1px solid transparent",
                "&:hover": { bgcolor: alpha("#2563eb", 0.14) },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? "#2563eb" : alpha("#0f172a", 0.65),
                  minWidth: 42,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 900 : 800,
                  fontSize: 14,
                  color: active ? "#1d4ed8" : "#0f172a",
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
            p: 1.4,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 10px 25px rgba(2,6,23,0.10)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
            <Avatar sx={{ width: 42, height: 42 }}>{avatarLetter}</Avatar>

            <Box sx={{ flex: 1, overflow: "hidden" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 900, lineHeight: 1.2 }}>
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
              mt: 1.2,
              borderRadius: 3,
              bgcolor: alpha("#0f172a", 0.05),
              "&:hover": { bgcolor: alpha("#0f172a", 0.08) },
            }}
          >
            <ListItemIcon sx={{ color: alpha("#0f172a", 0.7), minWidth: 42 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 900,
                fontSize: 14,
                color: alpha("#0f172a", 0.9),
              }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;

/** ✅ Brand mini component */
const StackBrand = () => {
  return (
    <Box sx={{ display: "flex", gap: 1.1, alignItems: "center" }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          bgcolor: "rgba(37,99,235,0.18)",
          border: "1px solid rgba(37,99,235,0.25)",
          display: "grid",
          placeItems: "center",
          fontWeight: 900,
          color: "#2563eb",
        }}
      >
        ▮▮▮
      </Box>
      <Typography sx={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
        Expense <span style={{ color: "#2563eb" }}>Splitter</span>
      </Typography>
    </Box>
  );
};
