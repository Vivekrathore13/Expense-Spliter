import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 280;

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
      }}
    >
      <CssBaseline />

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile */}
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
              boxShadow: "none",
              p: 1,
            },
          }}
        >
          <Sidebar onItemClick={() => setMobileOpen(false)} />
        </Drawer>

        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: 0,
              bgcolor: "transparent",
              boxShadow: "none",
              p: 1.6,
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main */}
      <Box sx={{ flexGrow: 1, p: { xs: 1.2, md: 1.6 } }}>
        <Box
          sx={{
            minHeight: "calc(100vh - 20px)",
            borderRadius: 6,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(226,232,240,0.75)",
            boxShadow: "0 20px 55px rgba(2,6,23,0.10)",
          }}
        >
          <Topbar onMenuClick={toggleDrawer} />

          {/* ✅ Center Wrapper Added Here */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
