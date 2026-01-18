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
} from "@mui/material";
import { useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";
import AddExpenseModal from "./AddExpenseModal";
import ExpenseList from "./ExpenseList";

const GroupPage = () => {
  const { groupId } = useParams();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]); // later connect expense list API
  
  const [openAdd, setOpenAdd] = useState(false);

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

  console.log("Expense IDs:", expenses.map(e => e._id));


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

  const groupName = group?.groupname || group?.name || "Group";

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
        >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              {groupName}
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Track expenses, split bills & settle up.
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, flexWrap: "wrap" }}
            >
              <Chip label={`${members.length} Members`} />
              <Chip
                color="primary"
                variant="outlined"
                label={`You: ${user?.fullName || user?.email || "User"}`}
              />
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

      {/* Members preview */}
      <Card sx={{ mt: 2, p: 2.2, borderRadius: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography fontWeight={900}>Members</Typography>
          <Chip size="small" label="Invite flow ready ✅" />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {members.slice(0, 8).map((m) => (
            <Chip
              key={m?._id || m?.userId || m?.email}
              avatar={
                <Avatar>
                  {(m?.fullName || m?.email || "U")[0]?.toUpperCase()}
                </Avatar>
              }
              label={m?.fullName || m?.email}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            />
          ))}
          {members.length > 8 && <Chip label={`+${members.length - 8} more`} />}
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


      {/* Modal */}
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
    </Box>
  );
};

export default GroupPage;
