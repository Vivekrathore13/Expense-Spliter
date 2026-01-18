import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 260;

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#e9eeff",
        background:
          "radial-gradient(circle at top left, rgba(192,204,255,0.55) 0%, rgba(233,238,255,1) 30%, rgba(248,250,252,1) 100%)",
      }}
    >
      <CssBaseline />

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: 0,
              bgcolor: "transparent",
            },
          }}
        >
          <Sidebar onItemClick={() => setMobileOpen(false)} />
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: 0,
              bgcolor: "transparent",
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main */}
      <Box sx={{ flexGrow: 1, p: { xs: 1.2, md: 2.2 } }}>
        {/* Rounded main panel like image */}
        <Box
          sx={{
            minHeight: "calc(100vh - 24px)",
            borderRadius: 6,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.40)",
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 18px 50px rgba(2,6,23,0.12)",
            backdropFilter: "blur(14px)",
          }}
        >
          <Topbar onMenuClick={toggleDrawer} />

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
