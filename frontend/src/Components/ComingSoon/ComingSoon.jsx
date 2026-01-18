import React from "react";
import { Box, Card, CardContent, Typography, Stack, Chip } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const ComingSoon = ({ title = "Coming Soon", subtitle = "" }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(37,99,235,0.10)",
              }}
            >
              <ConstructionIcon />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={900}>
                {title}
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.3 }}>
                {subtitle || "This feature is under development 🚧"}
              </Typography>
            </Box>

            <Chip
              icon={<ReceiptLongIcon />}
              label="Phase 2"
              sx={{
                bgcolor: "#eff6ff",
                border: "1px solid #dbeafe",
                fontWeight: 900,
              }}
            />
          </Stack>

          <Box sx={{ mt: 2.2 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              What’s coming:
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label="Expense history" />
              <Chip label="Filters (date/category)" />
              <Chip label="Search expenses" />
              <Chip label="My expenses" />
              <Chip label="Analytics" />
            </Stack>

            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              Meanwhile you can create groups, add expenses inside a group, and
              use Settle Up ✅
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComingSoon;
