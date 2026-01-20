import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Divider,
  Box,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";
import SplitEditor from "./SplitEditor";

const AddExpenseModal = ({ open, onClose, groupId, members = [], onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);

  const [loading, setLoading] = useState(false);
  const [splitType, setSplitType] = useState("equal");

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: user?._id || user?.id || "",
  });

  const [splitState, setSplitState] = useState({
    splitDetails: [],
    isValid: true,
    error: "",
  });

  // ✅ Reset on open (clean UX + prevents old data)
  useEffect(() => {
    if (!open) return;

    setLoading(false);
    setSplitType("equal");

    setForm({
      description: "",
      amount: "",
      paidBy: user?._id || user?.id || "",
    });

    setSplitState({
      splitDetails: [],
      isValid: true,
      error: "",
    });
  }, [open]);

  const handleSubmit = async () => {
    if (loading) return;

    try {
      if (!form.description.trim()) return toast.error("Description required");
      if (!form.amount || Number(form.amount) <= 0) return toast.error("Amount invalid");
      if (!splitState.isValid) return toast.error(splitState.error || "Invalid split");

      setLoading(true);

      const payload = {
        description: form.description.trim(),
        amount: Number(form.amount),
        paidBy: form.paidBy,
        splitType,
        splitDetails: splitState.splitDetails,
      };

      await axiosInstance.post(`/${groupId}/createExpense`, payload);

      toast.success("Expense added ✅");
      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (loading) return; // ✅ avoid closing while saving
        onClose?.();
      }}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflowX: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        Add Expense
        <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
          Create a new expense and split it with group members.
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          overflowX: "hidden",
        }}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
          />

          {/* ✅ MOBILE FIX: row -> column */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              select
              label="Paid By"
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
              fullWidth
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxHeight: 300 },
                  },
                },
              }}
            >
              {members.map((m) => (
                <MenuItem
                  key={m._id || m.userId}
                  value={m._id || m.userId}
                  sx={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.fullName || m.email}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Divider />

          <Box>
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              Split Type
            </Typography>

            <ToggleButtonGroup
              value={splitType}
              exclusive
              onChange={(e, val) => val && setSplitType(val)}
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  fontWeight: 900,
                  textTransform: "none",
                },
              }}
            >
              <ToggleButton value="equal">Equal</ToggleButton>
              <ToggleButton value="exact">Exact</ToggleButton>
              <ToggleButton value="percentage">%</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

          {/* ✅ SplitEditor already fixed (no overflow now) */}
          <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
            <SplitEditor
              members={members}
              amount={form.amount}
              splitType={splitType}
              onChange={(data) => {
                setSplitState({
                  splitDetails: data.splitDetails,
                  isValid: data.isValid,
                  error: data.error,
                });
              }}
            />
          </Box>

          {!splitState.isValid && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {splitState.error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => {
            if (loading) return;
            onClose?.();
          }}
          sx={{ borderRadius: 3 }}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !splitState.isValid}
          sx={{
            borderRadius: 3,
            fontWeight: 900,
            px: 2.4,
          }}
          fullWidth={isMobile} // ✅ mobile button full width
        >
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Adding...
            </>
          ) : (
            "Add Expense"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseModal;
