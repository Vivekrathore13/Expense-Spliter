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

        // ✅ strongest mobile overflow prevention
        width: "100%",
        maxWidth: "100%",
        overflowX: "clip", // ✅ better than hidden
      }}
    >
      <CssBaseline />

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        {/* ✅ Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: "min(280px, 86vw)",
              maxWidth: "86vw",
              border: 0,
              bgcolor: "transparent",
              boxShadow: "none",
              p: 1,
              overflowX: "hidden",
            },
          }}
        >
          <Sidebar onItemClick={() => setMobileOpen(false)} />
        </Drawer>

        {/* ✅ Desktop drawer */}
        <Drawer
          variant="permanent"
          open
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
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main */}
      <Box
        sx={{
          flexGrow: 1,

          // ✅ DO NOT give too much padding on xs (it causes overflow)
          p: { xs: 0.4, sm: 0.8, md: 1.6 },

          width: "100%",
          maxWidth: "100%",
          overflowX: "clip",
        }}
      >
        <Box
          sx={{
            minHeight: "calc(100vh - 20px)",
            borderRadius: { xs: 4, md: 6 },
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.45)",
            border: "1px solid rgba(226,232,240,0.75)",
            boxShadow: "0 20px 55px rgba(2,6,23,0.10)",

            width: "100%",
            maxWidth: "100%",
          }}
        >
          <Topbar onMenuClick={toggleDrawer} />

          {/* ✅ content wrapper */}
          <Box
            sx={{
              // ✅ single wrapper padding
              p: { xs: 1.2, sm: 1.6, md: 2.4 },
              width: "100%",
              maxWidth: "100%",
              overflowX: "clip",
            }}
          >
            <Box
              component="main"
              sx={{
                flexGrow: 1,

                // ✅ important: avoid extra px on xs
                px: { xs: 0.4, sm: 1, md: 2.4 },

                pt: { xs: 0.6, md: 1.8 },
                pb: { xs: 4, md: 1 },

                width: "100%",
                maxWidth: "100%",
                overflowX: "clip",
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
