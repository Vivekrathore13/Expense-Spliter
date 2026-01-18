import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { alpha } from "@mui/material/styles";
import { toast } from "react-toastify";

import { sendInviteAPI } from "../../services/groupApi";

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
};

const InviteModal = ({ open, onClose, groups = [] }) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lastSent, setLastSent] = useState("");

  const groupOptions = useMemo(() => groups || [], [groups]);

  useEffect(() => {
    if (!open) {
      setSelectedGroup("");
      setEmail("");
      setErrMsg("");
      setSuccessMsg("");
      setLastSent("");
      setLoading(false);
    }
  }, [open]);

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  const handleInvite = async () => {
    setErrMsg("");
    setSuccessMsg("");

    if (!selectedGroup) return setErrMsg("Please select a group");
    if (!email.trim()) return setErrMsg("Email is required");
    if (!isValidEmail(email)) return setErrMsg("Please enter a valid email");

    try {
      setLoading(true);

      await sendInviteAPI(selectedGroup, { email: email.trim() });

      const sentTo = email.trim();
      setLastSent(sentTo);
      setSuccessMsg("Invite sent ✅ Ask them to check inbox/spam.");
      setEmail("");

      toast.success("Invite sent ✅");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to send invite";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroupName =
    groupOptions.find((g) => String(g._id) === String(selectedGroup))?.groupname ||
    "";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.78)",
          border: "1px solid rgba(148,163,184,0.25)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 26px 80px rgba(2,6,23,0.20)",
          position: "relative",
        },
      }}
    >
      {/* top gradient bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #2563eb, #6366f1)",
        }}
      />

      <DialogTitle sx={{ pb: 1.2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 3,
                bgcolor: alpha("#2563eb", 0.12),
                display: "grid",
                placeItems: "center",
                border: `1px solid ${alpha("#2563eb", 0.18)}`,
              }}
            >
              <MailOutlineIcon sx={{ color: "#2563eb" }} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                Invite Member
              </Typography>
              <Typography sx={{ opacity: 0.65, fontSize: 12 }}>
                Send an invite via email.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={1.6}>
          <TextField
            select
            fullWidth
            label="Select Group"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setErrMsg("");
              setSuccessMsg("");
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          >
            {groupOptions.length === 0 ? (
              <MenuItem value="" disabled>
                No groups found
              </MenuItem>
            ) : (
              groupOptions.map((g) => (
                <MenuItem key={g._id} value={g._id}>
                  {g.groupname}
                </MenuItem>
              ))
            )}
          </TextField>

          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errMsg) setErrMsg("");
              if (successMsg) setSuccessMsg("");
            }}
            placeholder="friend@gmail.com"
            error={!!errMsg}
            helperText={errMsg || " "}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInvite();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          />

          {/* success section */}
          {successMsg && (
            <Box
              sx={{
                p: 1.2,
                borderRadius: 3,
                border: "1px solid rgba(34,197,94,0.28)",
                bgcolor: "rgba(34,197,94,0.08)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <MarkEmailReadIcon sx={{ color: "#16a34a" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: 13, color: "#16a34a" }}>
                    {successMsg}
                  </Typography>
                  {lastSent && (
                    <Typography sx={{ fontSize: 12, opacity: 0.75 }}>
                      Sent to <b>{lastSent}</b> {selectedGroupName ? `• Group: ${selectedGroupName}` : ""}
                    </Typography>
                  )}
                </Box>
                <Chip size="small" color="success" label="Sent" sx={{ fontWeight: 900 }} />
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.4 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: 999,
            fontWeight: 900,
            textTransform: "none",
            px: 2.2,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleInvite}
          disabled={loading || groupOptions.length === 0}
          sx={{
            borderRadius: 999,
            fontWeight: 900,
            textTransform: "none",
            px: 2.4,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Sending...
            </>
          ) : (
            "Send Invite"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteModal;
