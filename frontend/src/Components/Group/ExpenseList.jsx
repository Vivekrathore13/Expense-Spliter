import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";
import UpdateExpenseModal from "./UpdateExpenseModal";

const ExpenseList = ({ expenses = [], groupId, members = [], onDeleted }) => {
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const myId = String(user?._id || user?.id || "");

  const [open, setOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  // expand state per expense
  const [expanded, setExpanded] = useState({}); // { expenseId: true/false }

  const toggleExpand = (expenseId) => {
    setExpanded((prev) => ({ ...prev, [expenseId]: !prev[expenseId] }));
  };

  const openConfirm = (expense) => {
    setSelectedExpense(expense);
    setOpen(true);
  };

  const closeConfirm = () => {
    setOpen(false);
    setSelectedExpense(null);
  };

  const openEditModal = (expense) => {
    setEditExpense(expense);
    setOpenEdit(true);
  };

  // ✅ calculate YOU OWE / YOU GET chip
  const getUserChip = (expense) => {
    const payerId =
      String(expense?.paidBy?._id || expense?.paidBy?.id || expense?.paidBy || "");

    const mySplit = (expense?.splitDetails || []).find(
      (s) => String(s?.user?._id || s?.user) === myId
    );

    const myAmount = Number(mySplit?.amount || 0);

    // if i paid: i get back money from others (excluding my own part)
    if (payerId === myId) {
      const total = Number(expense?.amount || 0);
      const iGet = +(total - myAmount).toFixed(2);

      if (iGet <= 0) return { label: "You paid", color: "success", variant: "outlined" };

      return {
        label: `You get ₹${iGet}`,
        color: "success",
        variant: "filled",
      };
    }

    // if someone else paid and i am in split -> i owe
    if (myAmount > 0) {
      return {
        label: `You owe ₹${myAmount}`,
        color: "warning",
        variant: "filled",
      };
    }

    return null;
  };

  const handleDelete = async () => {
    try {
      if (!selectedExpense?._id) {
        toast.error("No expense selected");
        return;
      }

      setLoading(true);

      await axiosInstance.delete(
        `/${groupId}/${selectedExpense._id}/deleteExpense`
      );

      toast.success("Expense deleted ✅");
      closeConfirm();
      onDeleted?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete expense");
    } finally {
      setLoading(false);
    }
  };

  if (!expenses.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography sx={{ color: "text.secondary" }}>
          No expenses yet. Add the first one ✅
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {expenses.map((e) => {
          const payerId =
            String(e?.paidBy?._id || e?.paidBy?.id || e?.paidBy || "");
          const isMine = payerId === myId;

          const statusChip = getUserChip(e);
          const isExpanded = !!expanded[e._id];

          return (
            <Card
              key={e._id}
              sx={{
                p: 2,
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.06)",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  borderColor: "rgba(37,99,235,0.35)",
                },
              }}
            >
              {/* header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={900} sx={{ fontSize: 16 }}>
                    {e.description || "Expense"}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: 13,
                      mt: 0.5,
                      wordBreak: "break-word",
                    }}
                  >
                    Paid by <b>{e?.paidBy?.fullName || "User"}</b> •{" "}
                    {new Date(e.createdAt).toLocaleString()}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                    <Chip size="small" label={`Split: ${e.splitType}`} />
                    {isMine && <Chip size="small" color="success" label="You paid" />}
                    {statusChip && (
                      <Chip
                        size="small"
                        color={statusChip.color}
                        variant={statusChip.variant}
                        label={statusChip.label}
                        sx={{ fontWeight: 900 }}
                      />
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`₹${e.amount}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 900 }}
                  />

                  {/* Expand/Collapse */}
                  <Tooltip title={isExpanded ? "Hide split" : "Show split"}>
                    <IconButton
                      onClick={() => toggleExpand(e._id)}
                      sx={{ ml: 0.5 }}
                      size="small"
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>

                  {/* Edit */}
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => openEditModal(e)}
                      size="small"
                      sx={{
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 2,
                      }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* Delete */}
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => openConfirm(e)}
                      size="small"
                      sx={{
                        border: "1px solid rgba(244,63,94,0.35)",
                        borderRadius: 2,
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Divider sx={{ my: 1.4 }} />

              {/* Split details collapsible */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 0.5 }}>
                  <Typography fontWeight={900} sx={{ fontSize: 13, mb: 0.8 }}>
                    Split Details
                  </Typography>

                  <Stack spacing={0.7}>
                    {(e.splitDetails || []).map((s) => {
                      const uid = String(s?.user?._id || s?.user || "");
                      const isYou = uid === myId;

                      return (
                        <Box
                          key={s._id || uid}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                            fontSize: 13,
                            borderRadius: 2,
                            px: 1,
                            py: 0.8,
                            bgcolor: isYou ? "rgba(37,99,235,0.08)" : "transparent",
                          }}
                        >
                          <span style={{ color: "#475569", fontWeight: 700 }}>
                            {s?.user?.fullName || s?.user?.email || "Member"}
                            {isYou ? " (You)" : ""}
                          </span>

                          <span style={{ fontWeight: 900, color: "#111" }}>
                            ₹{Number(s.amount || 0).toFixed(2)}
                          </span>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Stack>

      {/* Confirm Delete Dialog */}
      <Dialog open={open} onClose={closeConfirm}>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete Expense?</DialogTitle>

        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Are you sure you want to delete{" "}
            <b>{selectedExpense?.description}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeConfirm}>Cancel</Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={loading}
            sx={{ fontWeight: 900, borderRadius: 3 }}
          >
            {loading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <UpdateExpenseModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        groupId={groupId}
        members={members}
        expense={editExpense}
        onSuccess={() => {
          setOpenEdit(false);
          onDeleted?.();
        }}
      />
    </>
  );
};

export default ExpenseList;
