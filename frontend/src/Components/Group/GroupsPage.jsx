import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Skeleton,
  Tooltip,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import axiosInstance from "../../services/axiosinstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ MODAL IMPORT
import CreateGroupModal from "../Dashboard/CreateGroupModal";

const GroupsPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ create modal state
  const [openCreate, setOpenCreate] = useState(false);

  const navigate = useNavigate();

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const myId = String(user?._id || user?.id || "");

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/group/my");
      setGroups(res?.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) => {
    const name = (g.groupname || g.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const totalMembers = groups.reduce(
    (acc, g) => acc + (g.member?.length || g.members?.length || 0),
    0
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* ✅ Header Premium (same design) */}
      <Card
        sx={{
          mb: 2,
          p: 2.3,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(99,102,241,0.25)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(99,102,241,0.14))",
        }}
      >
        {/* glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(37,99,235,0.25), transparent 45%)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ position: "relative" }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: "rgba(37,99,235,0.18)",
                  color: "#1d4ed8",
                  fontWeight: 900,
                }}
              >
                <GroupsIcon />
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Groups
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 0.2 }}>
                  View your groups & manage expenses.
                </Typography>
              </Box>
            </Stack>

            {/* quick stats */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.4, flexWrap: "wrap" }}
            >
              <Chip label={`${groups.length} Groups`} />
              <Chip
                color="primary"
                variant="outlined"
                label={`${totalMembers} Members`}
              />
            </Stack>
          </Box>

          {/* actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <TextField
              placeholder="Search group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 240 },
                bgcolor: "rgba(255,255,255,0.7)",
                borderRadius: 3,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* ✅ FIXED BUTTON */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 3.2, fontWeight: 900, px: 2 }}
              onClick={() => setOpenCreate(true)}
            >
              Create Group
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* ✅ Loading (Skeleton feel) */}
      {loading ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              sx={{
                p: 2.2,
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="circular" width={42} height={42} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton height={22} width="70%" />
                  <Skeleton height={18} width="45%" />
                </Box>
                <Skeleton height={26} width={70} sx={{ borderRadius: 99 }} />
              </Stack>

              <Divider sx={{ my: 1.6 }} />
              <Skeleton height={18} width="90%" />
              <Stack direction="row" spacing={1} sx={{ mt: 1.4 }}>
                <Skeleton height={32} width={80} sx={{ borderRadius: 99 }} />
                <Skeleton height={32} width={80} sx={{ borderRadius: 99 }} />
              </Stack>
            </Card>
          ))}
        </Box>
      ) : !filteredGroups.length ? (
        /* ✅ Empty state Premium */
        <Card
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            border: "1px dashed rgba(0,0,0,0.25)",
          }}
        >
          <Typography fontWeight={900} fontSize={18}>
            No groups found 😅
          </Typography>

          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            Create your first group and invite friends to split expenses.
          </Typography>

          {/* ✅ FIXED BUTTON */}
          <Button
            variant="contained"
            sx={{ mt: 2, borderRadius: 3, fontWeight: 900 }}
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Create Group
          </Button>
        </Card>
      ) : (
        /* ✅ Groups grid Premium */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {filteredGroups.map((g) => {
            const name = g.groupname || g.name || "Group";
            const membersCount = g.member?.length || g.members?.length || 0;
            const isAdmin = String(g.admin?._id || g.admin || "") === myId;

            return (
              <Card
                key={g._id}
                sx={{
                  p: 2.2,
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "0.25s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
                    borderColor: "rgba(37,99,235,0.35)",
                  },
                }}
                onClick={() => navigate(`/group/${g._id}`)}
              >
                {/* top gradient line */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background:
                      "linear-gradient(90deg, rgba(37,99,235,1), rgba(99,102,241,1))",
                  }}
                />

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ fontWeight: 900 }}>
                    {name?.[0]?.toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={900} noWrap>
                        {name}
                      </Typography>
                      {isAdmin && (
                        <Chip
                          size="small"
                          color="success"
                          label="Admin"
                          sx={{ fontWeight: 900 }}
                        />
                      )}
                    </Stack>

                    <Typography
                      sx={{ color: "text.secondary", fontSize: 13 }}
                      noWrap
                    >
                      Tap to open group and manage expenses
                    </Typography>
                  </Box>

                  <Chip size="small" label={`${membersCount} members`} />
                </Stack>

                <Divider sx={{ my: 1.6 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    Expenses • Balances • Settlements
                  </Typography>

                  <Tooltip title="Open group">
                    <Chip
                      icon={<ArrowForwardIosIcon />}
                      label="Open"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 900, cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/group/${g._id}`);
                      }}
                    />
                  </Tooltip>
                </Stack>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ✅ IMPORTANT: MODAL should be outside map */}
   <CreateGroupModal
  open={openCreate}
  onClose={() => setOpenCreate(false)}
  onCreated={async (createdGroup) => {
    await fetchGroups();
    setOpenCreate(false);

    const gid = createdGroup?._id || createdGroup?.id;
    if (gid) navigate(`/group/${gid}`);
  }}
/>

    </Box>
  );
};

export default GroupsPage;
