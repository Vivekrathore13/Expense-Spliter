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

const UpdateExpenseModal = ({
  open,
  onClose,
  groupId,
  members = [],
  expense,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

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

  // ✅ Prefill data when modal opens
  useEffect(() => {
    if (!expense) return;

    setForm({
      description: expense?.description || "",
      amount: expense?.amount || "",
      paidBy: expense?.paidBy?._id || expense?.paidBy || "",
    });

    setSplitType(expense?.splitType || "equal");

    // ✅ prefill split editor
    setSplitState({
      splitDetails:
        (expense?.splitDetails || []).map((s) => ({
          user: s?.user?._id || s?.user,
          amount: s?.amount,
          percent: s?.percent,
        })) || [],
      isValid: true,
      error: "",
    });
  }, [expense, open]);

  const handleUpdate = async () => {
    if (loading) return;

    try {
      if (!expense?._id) return toast.error("Expense missing");
      if (!form.description.trim()) return toast.error("Description required");
      if (!form.amount || Number(form.amount) <= 0)
        return toast.error("Amount invalid");

      if (!splitState.isValid)
        return toast.error(splitState.error || "Invalid split");

      setLoading(true);

      const payload = {
        description: form.description.trim(),
        amount: Number(form.amount),
        paidBy: form.paidBy,
        splitType,
        splitDetails: splitState.splitDetails,
      };

      await axiosInstance.patch(
        `/${groupId}/${expense._id}/updateExpense`,
        payload
      );

      toast.success("Expense updated ✅");
      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        Edit Expense ✏️
        <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
          Update details and split settings.
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          overflowX: "hidden", // ✅ MOBILE overflow fix
        }}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
          />

          {/* ✅ MOBILE FIX: amount + paidBy become column on mobile */}
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
              {members.map((m) => {
                const id = m._id || m.userId;
                const label = m.fullName || m.email || "Member";
                return (
                  <MenuItem key={id} value={id} sx={{ maxWidth: "100%" }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </Typography>
                  </MenuItem>
                );
              })}
            </TextField>
          </Stack>

          <Divider />

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              Split Type
            </Typography>

            {/* ✅ MOBILE FIX: toggle buttons spacing + wrap safe */}
            <ToggleButtonGroup
              value={splitType}
              exclusive
              onChange={(e, val) => val && setSplitType(val)}
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  fontWeight: 900,
                  textTransform: "none",
                  px: isMobile ? 1 : 2,
                  py: isMobile ? 1 : 1.1,
                },
              }}
            >
              <ToggleButton value="equal">Equal</ToggleButton>
              <ToggleButton value="exact">Exact</ToggleButton>
              <ToggleButton value="percentage">%</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

          <SplitEditor
            members={members}
            amount={form.amount}
            splitType={splitType}
            initialSplitDetails={splitState.splitDetails} // ✅ IMPORTANT
            onChange={(data) => {
              setSplitState({
                splitDetails: data.splitDetails,
                isValid: data.isValid,
                error: data.error,
              });
            }}
          />

          {!splitState.isValid && (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {splitState.error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" }, // ✅ MOBILE nice
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Button onClick={onClose} sx={{ borderRadius: 3, fontWeight: 900 }}>
          Cancel
        </Button>

        <Button
          type="button"
          variant="contained"
          onClick={handleUpdate}
          disabled={loading || !splitState.isValid}
          sx={{ borderRadius: 3, fontWeight: 900 }}
        >
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Updating...
            </>
          ) : (
            "Update Expense"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateExpenseModal;
