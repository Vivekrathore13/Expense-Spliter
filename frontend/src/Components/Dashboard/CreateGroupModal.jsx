import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { alpha } from "@mui/material/styles";
import { toast } from "react-toastify";

import { createGroupAPI } from "../../services/groupApi";

const CreateGroupModal = ({ open, onClose, onCreated }) => {
  const [groupname, setGroupname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // reset when opened/closed
  useEffect(() => {
    if (!open) {
      setGroupname("");
      setErrMsg("");
      setLoading(false);
    }
  }, [open]);

  const handleCreate = async () => {
    const name = groupname.trim();

    if (!name) {
      setErrMsg("Group name is required");
      return;
    }

    if (name.length < 3) {
      setErrMsg("Group name must be at least 3 characters");
      return;
    }

    try {
      setErrMsg("");
      setLoading(true);

      const res = await createGroupAPI({ groupname: name });
      const createdGroup = res?.data?.data || res?.data; // ✅ group object

      toast.success("Group created ✅");
      setGroupname("");
      onClose?.();
      onCreated?.(createdGroup); // ✅ pass created group back
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create group";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (loading) return;
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(226,232,240,0.95)",
          boxShadow: "0 26px 80px rgba(2,6,23,0.20)",
          backdropFilter: "blur(14px)",
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 4,
                bgcolor: alpha("#2563eb", 0.1),
                border: `1px solid ${alpha("#2563eb", 0.18)}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <GroupAddIcon sx={{ color: "#2563eb" }} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                Create Group
              </Typography>
              <Typography sx={{ opacity: 0.65, fontSize: 12 }}>
                Create a group to start splitting expenses.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleDialogClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={1.2}>
          <TextField
            autoFocus
            fullWidth
            label="Group Name"
            value={groupname}
            onChange={(e) => {
              setGroupname(e.target.value);
              if (errMsg) setErrMsg("");
            }}
            placeholder="e.g., Goa Trip, Flatmates..."
            error={!!errMsg}
            helperText={errMsg || "Tip: Use a short name you’ll remember."}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 4 },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.4 }}>
        <Button
          variant="outlined"
          onClick={handleDialogClose}
          disabled={loading}
          sx={{
            borderRadius: 999,
            fontWeight: 900,
            textTransform: "none",
            px: 2.2,
            borderColor: alpha("#0f172a", 0.18),
            color: alpha("#0f172a", 0.85),
            "&:hover": {
              borderColor: alpha("#0f172a", 0.28),
              bgcolor: alpha("#0f172a", 0.03),
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading}
          sx={{
            borderRadius: 999,
            fontWeight: 900,
            textTransform: "none",
            px: 2.6,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
