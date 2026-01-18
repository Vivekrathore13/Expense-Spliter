import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Stack,
  Button,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";

import AddExpenseModal from "./AddExpenseModal";
import ExpenseList from "./ExpenseList";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const myId = String(user?._id || user?.id || "");

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [openAdd, setOpenAdd] = useState(false);

  // dialogs
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = useMemo(() => {
    return String(group?.admin?._id || group?.admin || "") === myId;
  }, [group, myId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);

      const [groupRes, memRes, expRes] = await Promise.all([
        axiosInstance.get(`/group/${groupId}`),
        axiosInstance.get(`/group/${groupId}/members`),
        axiosInstance.get(`/${groupId}/getExpense`),
      ]);

      setGroup(groupRes?.data?.data || groupRes?.data);
      setMembers(memRes?.data?.data || memRes?.data || []);
      setExpenses(expRes?.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const groupName = group?.groupname || group?.name || "Group";

  // ------------------ ACTIONS ------------------
  const handleDeleteGroup = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/group/${groupId}`);
      toast.success("Group deleted ✅");
      setDeleteGroupOpen(false);
      navigate("/groups");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);

      // ✅ leave group = remove myself
      await axiosInstance.delete(`/group/${groupId}/member/${myId}`);

      toast.success("You left the group ✅");
      setLeaveOpen(false);
      navigate("/groups");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to leave group");
    } finally {
      setActionLoading(false);
    }
  };

  const openRemoveMember = (m) => {
    setRemoveTarget(m);
    setRemoveOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!removeTarget?._id) return toast.error("Member not selected");
    if (actionLoading) return;

    try {
      setActionLoading(true);

      await axiosInstance.delete(
        `/group/${groupId}/member/${removeTarget._id}`
      );

      toast.success("Member removed ✅");
      setRemoveOpen(false);
      setRemoveTarget(null);
      fetchGroup();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove member");
    } finally {
      setActionLoading(false);
    }
  };

  // ------------------ UI ------------------
  if (loading) {
    return (
      <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading group...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header Card */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 4,
          border: "1px solid rgba(0,0,0,0.06)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.10), rgba(99,102,241,0.10))",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "flex-start" }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Back">
                <IconButton
                  onClick={() => navigate("/groups")}
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 3,
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Box>
                <Typography variant="h5" fontWeight={900}>
                  {groupName}
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                  Track expenses, split bills & settle up.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.6, flexWrap: "wrap" }}
            >
              <Chip label={`${members.length} Members`} />
              <Chip
                color="primary"
                variant="outlined"
                label={`You: ${user?.fullName || user?.email || "User"}`}
              />
              {isAdmin && (
                <Chip
                  color="success"
                  variant="filled"
                  label="Admin"
                  sx={{ fontWeight: 900 }}
                />
              )}
            </Stack>

            {/* Danger actions */}
            <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: "wrap" }}>
              {/* Leave for non-admin */}
              {!isAdmin && (
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<ExitToAppIcon />}
                  onClick={() => setLeaveOpen(true)}
                  sx={{ borderRadius: 3, fontWeight: 900 }}
                >
                  Leave Group
                </Button>
              )}

              {/* Delete only for admin */}
              {isAdmin && (
                <Button
                  color="error"
                  variant="contained"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setDeleteGroupOpen(true)}
                  sx={{ borderRadius: 3, fontWeight: 900 }}
                >
                  Delete Group
                </Button>
              )}
            </Stack>
          </Box>

          <Stack spacing={1} alignItems={{ xs: "stretch", md: "flex-end" }}>
            <Button
              variant="contained"
              onClick={() => setOpenAdd(true)}
              sx={{ borderRadius: 3.2, fontWeight: 900, py: 1.1 }}
            >
              + Add Expense
            </Button>

            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                textAlign: { xs: "left", md: "right" },
              }}
            >
              Tip: Add an expense and choose split type.
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* Members */}
      <Card sx={{ mt: 2, p: 2.2, borderRadius: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography fontWeight={900}>Members</Typography>

          <Chip
            size="small"
            label={isAdmin ? "Admin controls enabled ✅" : "Member view ✅"}
          />
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        <Stack spacing={1}>
          {members.map((m) => {
            const uid = String(m?._id || "");
            const isYou = uid === myId;
            const adminId = String(group?.admin?._id || group?.admin || "");
            const isThisAdmin = uid === adminId;

            return (
              <Card
                key={m?._id || m?.email}
                sx={{
                  p: 1.3,
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.06)",
                  background: isYou ? "rgba(37,99,235,0.06)" : "transparent",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Avatar sx={{ fontWeight: 900 }}>
                    {(m?.fullName || m?.email || "U")[0]?.toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={900} noWrap>
                      {m?.fullName || "Member"} {isYou ? "(You)" : ""}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }} noWrap>
                      {m?.email}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {isThisAdmin && (
                      <Chip size="small" color="success" label="Admin" />
                    )}

                    {/* ✅ Admin can remove others (not admin itself) */}
                    {isAdmin && !isYou && !isThisAdmin && (
                      <Tooltip title="Remove member">
                        <IconButton
                          onClick={() => openRemoveMember(m)}
                          sx={{
                            border: "1px solid rgba(244,63,94,0.35)",
                            borderRadius: 2,
                          }}
                          size="small"
                        >
                          <PersonRemoveAlt1Icon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      </Card>

      {/* Expenses */}
      <Card sx={{ mt: 2, p: 2.2, borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={900}>Expenses</Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Recent transactions of this group
          </Typography>
        </Stack>

        <Divider sx={{ my: 1.6 }} />

        <ExpenseList
          expenses={expenses}
          groupId={groupId}
          members={members}
          onDeleted={() => fetchGroup()}
        />
      </Card>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        groupId={groupId}
        members={members}
        onSuccess={() => {
          setOpenAdd(false);
          fetchGroup();
        }}
      />

      {/* ---------------- dialogs ---------------- */}

      {/* Delete Group Confirm */}
      <Dialog open={deleteGroupOpen} onClose={() => setDeleteGroupOpen(false)}>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete Group?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            This will permanently delete <b>{groupName}</b>. All expenses will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteGroupOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteGroup}
            disabled={actionLoading}
            sx={{ borderRadius: 3, fontWeight: 900 }}
          >
            {actionLoading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              "Delete Group"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Group Confirm */}
      <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)}>
        <DialogTitle sx={{ fontWeight: 900 }}>Leave Group?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            You will be removed from <b>{groupName}</b>. You can join again only if invited.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLeaveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleLeaveGroup}
            disabled={actionLoading}
            sx={{ borderRadius: 3, fontWeight: 900 }}
          >
            {actionLoading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Leaving...
              </>
            ) : (
              "Leave Group"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirm */}
      <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)}>
        <DialogTitle sx={{ fontWeight: 900 }}>Remove Member?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Remove <b>{removeTarget?.fullName || removeTarget?.email}</b> from this group?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRemoveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveMember}
            disabled={actionLoading}
            sx={{ borderRadius: 3, fontWeight: 900 }}
          >
            {actionLoading ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupPage;
