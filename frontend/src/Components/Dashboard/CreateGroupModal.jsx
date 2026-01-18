import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { alpha } from "@mui/material/styles";

import { createGroupAPI } from "../../services/groupApi";

const CreateGroupModal = ({ open, onClose, onCreated }) => {
  const [groupname, setGroupname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleCreate = async () => {
    if (!groupname.trim()) {
      setErrMsg("Group name is required");
      return;
    }

    try {
      setErrMsg("");
      setLoading(true);

      await createGroupAPI({ groupname: groupname.trim() });

      setGroupname("");
      onClose?.();
      onCreated?.();
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

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose?.()}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(226,232,240,0.95)",
          boxShadow: "0 24px 70px rgba(2,6,23,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 4,
                bgcolor: alpha("#2563eb", 0.10),
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
                Create a group to start splitting.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.8 }}>
        <TextField
          autoFocus
          fullWidth
          label="Group Name"
          value={groupname}
          onChange={(e) => setGroupname(e.target.value)}
          placeholder="e.g., Goa Trip, Flatmates..."
          error={!!errMsg}
          helperText={errMsg || " "}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: 4 },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.4 }}>
        <Button
          variant="outlined"
          onClick={onClose}
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
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
