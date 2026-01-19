import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Avatar,
  Button,
  Chip,
  Switch,
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosinstance";

// icons
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PaymentIcon from "@mui/icons-material/Payment";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const SoftCard = ({ children, sx }) => (
  <Card
    sx={{
      borderRadius: 3, // ✅ normal rounded (capsule nahi banega)
      bgcolor: "rgba(255,255,255,0.88)",
      border: "1px solid rgba(226,232,240,0.95)",
      boxShadow: "0 16px 55px rgba(2,6,23,0.07)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const SettingsPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  // ✅ UPI states
  const [upiId, setUpiId] = useState(user?.upiId || "");
  const [savingUpi, setSavingUpi] = useState(false);

  const firstName = useMemo(() => {
    return user?.fullName?.split(" ")?.[0] || "User";
  }, [user?.fullName]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out ✅");
    window.location.href = "/login";
  };

  const clearCache = () => {
    const savedUser = localStorage.getItem("user");
    localStorage.clear();
    if (savedUser) localStorage.setItem("user", savedUser);
    toast.success("Cache cleared ✅");
  };

  // ✅ Copy helper
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      toast.success("Copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  };

  // ✅ Save UPI handler
  const handleSaveUpi = async () => {
    try {
      setSavingUpi(true);

      const normalized = (upiId || "").trim().toLowerCase();

      if (!normalized) {
        toast.error("UPI ID is required");
        return;
      }

      // ✅ same regex as backend
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(normalized)) {
        toast.error("Invalid UPI format (example: name@upi)");
        return;
      }

      const res = await axiosInstance.patch(`/upi`, { upiId: normalized });

      const updatedUser = res?.data?.data;

      // ✅ update localStorage user
      if (updatedUser?._id) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUpiId(updatedUser.upiId || normalized);
      } else {
        // fallback if backend returns something else
        const fallbackUser = { ...(user || {}), upiId: normalized };
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        setUpiId(normalized);
      }

      toast.success("UPI ID saved ✅");
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to save UPI");
    } finally {
      setSavingUpi(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", p: { xs: 1.6, md: 2.8 } }}>
      {/* ✅ Header */}
      <SoftCard
        sx={{
          mb: 2.4,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.12))",
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.2, md: 2.8 } }}>
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Avatar
              sx={{
                width: 54,
                height: 54,
                bgcolor: alpha("#2563eb", 0.16),
                color: "#2563eb",
                fontWeight: 900,
              }}
            >
              <SettingsIcon />
            </Avatar>

            <Box>
              <Typography sx={{ fontSize: 28, fontWeight: 950 }}>
                Settings
              </Typography>
              <Typography sx={{ fontWeight: 800, color: "text.secondary" }}>
                Manage account & preferences (lightweight).
              </Typography>
              <Typography sx={{ mt: 0.4, fontWeight: 850, color: "#2563eb" }}>
                Hi, {firstName} 👋
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </SoftCard>

      <Stack spacing={2.2}>
        {/* ✅ Account */}
        <SoftCard>
          <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: alpha("#0f172a", 0.06),
                  color: "#0f172a",
                  fontWeight: 900,
                }}
              >
                <PersonIcon />
              </Avatar>
              <Typography sx={{ fontWeight: 950, fontSize: 16 }}>
                Account
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.6, opacity: 0.6 }} />

            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 900 }}>
                Name:{" "}
                <span style={{ fontWeight: 850, color: "rgba(15,23,42,0.72)" }}>
                  {user?.fullName || "—"}
                </span>
              </Typography>

              <Typography sx={{ fontWeight: 900 }}>
                Email:{" "}
                <span style={{ fontWeight: 850, color: "rgba(15,23,42,0.72)" }}>
                  {user?.email || "—"}
                </span>
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                  label="Logged in ✅"
                  sx={{
                    fontWeight: 900,
                    bgcolor: "rgba(34,197,94,0.14)",
                    color: "#16a34a",
                    border: "1px solid rgba(34,197,94,0.22)",
                    borderRadius: 999,
                  }}
                />

                <Button
                  onClick={handleLogout}
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  sx={{
                    ml: "auto",
                    borderRadius: 999,
                    fontWeight: 950,
                    textTransform: "none",
                    px: 2.2,
                  }}
                >
                  Logout
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </SoftCard>

        {/* ✅ UPI Payment */}
        <SoftCard>
          <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: alpha("#16a34a", 0.12),
                  color: "#16a34a",
                  fontWeight: 900,
                }}
              >
                <PaymentIcon />
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 950, fontSize: 16 }}>
                  UPI Payment
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 750,
                    color: "text.secondary",
                  }}
                >
                  Add your UPI ID so members can pay you directly.
                </Typography>
              </Box>

              <Chip
                size="small"
                label={upiId?.trim() ? "UPI linked ✅" : "Not linked"}
                sx={{
                  fontWeight: 900,
                  bgcolor: upiId?.trim()
                    ? "rgba(34,197,94,0.14)"
                    : "rgba(15,23,42,0.06)",
                  color: upiId?.trim() ? "#16a34a" : "rgba(15,23,42,0.55)",
                  border: `1px solid ${
                    upiId?.trim()
                      ? "rgba(34,197,94,0.22)"
                      : "rgba(226,232,240,0.95)"
                  }`,
                  borderRadius: 999,
                }}
              />
            </Stack>

            <Divider sx={{ my: 1.6, opacity: 0.6 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              alignItems="center"
            >
              <TextField
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                fullWidth
                size="small"
                label="UPI ID"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                }}
              />

              <Stack
                direction="row"
                spacing={1}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  onClick={handleSaveUpi}
                  disabled={savingUpi}
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 950,
                    textTransform: "none",
                    px: 2.2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  {savingUpi ? (
                    <>
                      <CircularProgress size={18} sx={{ mr: 1 }} /> Saving
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>

                <Tooltip title={upiId?.trim() ? "Copy UPI ID" : "No UPI to copy"}>
                  <span>
                    <Button
                      onClick={() => copyText(upiId?.trim())}
                      disabled={!upiId?.trim()}
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 950,
                        textTransform: "none",
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Copy
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </SoftCard>

        {/* ✅ Notifications */}
        <SoftCard>
          <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: alpha("#2563eb", 0.14),
                  color: "#2563eb",
                  fontWeight: 900,
                }}
              >
                <NotificationsIcon />
              </Avatar>

              <Typography sx={{ fontWeight: 950, fontSize: 16 }}>
                Notifications
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.6, opacity: 0.6 }} />

            <Stack spacing={1.4}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography sx={{ fontWeight: 950 }}>
                    Enable notifications
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 750,
                      color: "text.secondary",
                    }}
                  >
                    For invites, payments & group updates
                  </Typography>
                </Box>

                <Switch
                  checked={notifEnabled}
                  onChange={(e) => setNotifEnabled(e.target.checked)}
                />
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography sx={{ fontWeight: 950 }}>Email alerts</Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 750,
                      color: "text.secondary",
                    }}
                  >
                    Only important notifications
                  </Typography>
                </Box>

                <Switch
                  checked={emailNotif}
                  disabled={!notifEnabled}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  fontWeight: 750,
                }}
              >
                (Abhi frontend-only toggle hai ✅)
              </Typography>
            </Stack>
          </CardContent>
        </SoftCard>

        {/* ✅ Danger Zone */}
        <SoftCard
          sx={{
            border: "1px solid rgba(244,63,94,0.22)",
            bgcolor: "rgba(255,255,255,0.92)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: alpha("#e11d48", 0.12),
                  color: "#e11d48",
                  fontWeight: 900,
                }}
              >
                <WarningAmberIcon />
              </Avatar>

              <Typography
                sx={{
                  fontWeight: 950,
                  fontSize: 16,
                  color: "#e11d48",
                }}
              >
                Danger Zone
              </Typography>
            </Stack>

            <Divider sx={{ my: 1.6, opacity: 0.6 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                onClick={clearCache}
                variant="outlined"
                startIcon={<CleaningServicesIcon />}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  textTransform: "none",
                }}
              >
                Clear Cache
              </Button>

              <Tooltip title="Not implemented yet">
                <span>
                  <Button
                    disabled
                    variant="contained"
                    startIcon={<DeleteOutlineIcon />}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 950,
                      textTransform: "none",
                      bgcolor: alpha("#e11d48", 0.14),
                      color: "#e11d48",
                      boxShadow: "none",
                      "&.Mui-disabled": {
                        opacity: 0.65,
                        color: "#e11d48",
                      },
                    }}
                  >
                    Delete Account (soon)
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </CardContent>
        </SoftCard>
      </Stack>
    </Box>
  );
};

export default SettingsPage;
