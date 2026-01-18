import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";
import SplitEditor from "./SplitEditor";

const AddExpenseModal = ({
  open,
  onClose,
  groupId,
  members = [],
  onSuccess,
}) => {
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

const handleSubmit = async () => {
  if (loading) return; // ✅ prevents double call

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
    onClose?.();     // ✅ close modal
    onSuccess?.();   // ✅ refresh
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to add expense");
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Add Expense
        <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
          Create a new expense and split it with group members.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
            />

            <TextField
              select
              label="Paid By"
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
              fullWidth
            >
              {members.map((m) => (
                <MenuItem key={m._id || m.userId} value={m._id || m.userId}>
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
            >
              <ToggleButton value="equal" sx={{ fontWeight: 800 }}>
                Equal
              </ToggleButton>
              <ToggleButton value="exact" sx={{ fontWeight: 800 }}>
                Exact
              </ToggleButton>
              <ToggleButton value="percentage" sx={{ fontWeight: 800 }}>
                %
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

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

          {!splitState.isValid && (
            <Alert severity="warning">{splitState.error}</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 3 }}>
          Cancel
        </Button>

        <Button
          type="button" // ✅ IMPORTANT
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !splitState.isValid}
          sx={{ borderRadius: 3, fontWeight: 900 }}
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
