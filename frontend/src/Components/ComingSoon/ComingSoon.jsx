import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import ConstructionIcon from "@mui/icons-material/Construction";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const SoftCard = ({ children, sx }) => (
  <Card
    sx={{
      borderRadius: 5,
      bgcolor: "rgba(255,255,255,0.86)",
      border: "1px solid rgba(226,232,240,0.95)",
      boxShadow: "0 18px 65px rgba(2,6,23,0.08)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const ComingSoon = ({
  title = "Coming Soon",
  subtitle = "This feature is under development 🚧",
  bullets = [
    "Expense history",
    "Filters (date/category)",
    "Search expenses",
    "My expenses",
    "Analytics",
  ],
}) => {
  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        p: { xs: 1.4, md: 2.6 },
      }}
    >
      {/* ✅ Premium header section */}
      <SoftCard
        sx={{
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.12))",
          border: "1px solid rgba(99,102,241,0.22)",
        }}
      >
        {/* Glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 10%, rgba(37,99,235,0.22), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <CardContent sx={{ p: { xs: 2.2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.4}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ position: "relative" }}
          >
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  bgcolor: alpha("#2563eb", 0.16),
                  color: "#2563eb",
                  fontWeight: 900,
                }}
              >
                <ConstructionIcon />
              </Avatar>

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 24, md: 32 },
                    fontWeight: 950,
                    letterSpacing: "-0.02em",
                    color: "#0f172a",
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    fontWeight: 800,
                    color: "rgba(15,23,42,0.72)",
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<ReceiptLongIcon />}
              label="Phase 2"
              sx={{
                px: 1.2,
                py: 0.8,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(226,232,240,0.95)",
                fontWeight: 950,
                boxShadow: "0 14px 40px rgba(2,6,23,0.10)",
              }}
            />
          </Stack>

          <Divider sx={{ my: 2.3, opacity: 0.65 }} />

          {/* ✅ What's coming */}
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
            <LightbulbIcon sx={{ color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 950, fontSize: 16 }}>
              What’s coming:
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {bullets.map((b) => (
              <Chip
                key={b}
                label={b}
                sx={{
                  fontWeight: 900,
                  borderRadius: 999,
                  bgcolor: "rgba(15,23,42,0.05)",
                  border: "1px solid rgba(226,232,240,0.85)",
                }}
              />
            ))}
          </Stack>

          {/* ✅ Meanwhile section */}
          <SoftCard
            sx={{
              mt: 2.4,
              bgcolor: "rgba(255,255,255,0.70)",
              border: "1px solid rgba(226,232,240,0.90)",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: { xs: 1.8, md: 2.2 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.4}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Stack direction="row" spacing={1.1} alignItems="center">
                  <CheckCircleIcon sx={{ color: "#16a34a" }} />
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "rgba(15,23,42,0.78)",
                    }}
                  >
                    Meanwhile you can create groups, add expenses inside a group,
                    and use Settle Up ✅
                  </Typography>
                </Stack>

                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => (window.location.href = "/groups")}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 950,
                    px: 2.2,
                    py: 1,
                    bgcolor: "rgba(37,99,235,0.10)",
                    color: "#2563eb",
                    "&:hover": { bgcolor: "rgba(37,99,235,0.16)" },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Go to Groups
                </Button>
              </Stack>
            </CardContent>
          </SoftCard>
        </CardContent>
      </SoftCard>
    </Box>
  );
};

export default ComingSoon;
