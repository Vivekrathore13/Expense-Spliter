import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { alpha } from "@mui/material/styles";

import { sendInviteAPI } from "../../services/groupApi";

const InviteModal = ({ open, onClose, groups = [] }) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const groupOptions = useMemo(() => groups || [], [groups]);

  const reset = () => {
    setSelectedGroup("");
    setEmail("");
    setErrMsg("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose?.();
  };

  const handleInvite = async () => {
    setErrMsg("");
    setSuccessMsg("");

    if (!selectedGroup) return setErrMsg("Please select a group");
    if (!email.trim()) return setErrMsg("Email is required");

    try {
      setLoading(true);
      await sendInviteAPI(selectedGroup, { email: email.trim() });

      setSuccessMsg("Invite sent ✅ Check inbox/spam.");
      setEmail("");
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
          bgcolor: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(148,163,184,0.25)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 22px 60px rgba(2,6,23,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
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
                Send invite via email.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.8 }}>
        <Stack spacing={1.6}>
          <TextField
            select
            fullWidth
            label="Select Group"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@gmail.com"
            error={!!errMsg}
            helperText={errMsg || " "}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
          />

          {successMsg && (
            <Typography sx={{ color: "#16a34a", fontWeight: 900, fontSize: 13 }}>
              {successMsg}
            </Typography>
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
          {loading ? "Sending..." : "Send Invite"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteModal;
