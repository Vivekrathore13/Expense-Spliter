import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Stack,
  Button,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import axiosInstance from "../../services/axiosinstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const GroupsPage = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

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

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.12))",
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        <Typography variant="h5" fontWeight={900}>
          Groups
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          View your groups and open them to manage expenses.
        </Typography>
      </Box>

      {/* Loading */}
      {loading ? (
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography>Loading groups...</Typography>
          </Stack>
        </Box>
      ) : !groups.length ? (
        /* Empty */
        <Card
          sx={{
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            border: "1px dashed rgba(0,0,0,0.2)",
          }}
        >
          <Typography fontWeight={900} fontSize={18}>
            No groups found 😅
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 1 }}>
            Create a group from the + button and invite friends ✅
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 2, borderRadius: 3, fontWeight: 900 }}
            onClick={() => toast.info("Use + button to create group")}
          >
            Create Group
          </Button>
        </Card>
      ) : (
        /* Groups grid */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          {groups.map((g) => {
            const name = g.groupname || g.name || "Group";
            const membersCount = g.member?.length || g.members?.length || 0;

            return (
              <Card
                key={g._id}
                sx={{
                  p: 2.2,
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  transition: "0.2s",
                  "&:hover": { boxShadow: 7, transform: "translateY(-2px)" },
                }}
                onClick={() => navigate(`/group/${g._id}`)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ fontWeight: 900 }}>
                    {name?.[0]?.toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={900}>{name}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      Tap to open group
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

                  <Stack direction="row" spacing={1}>
                    {/* ✅ SETTLE BUTTON */}
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 3, fontWeight: 900 }}
                      onClick={(e) => {
                        e.stopPropagation(); // IMPORTANT
                        navigate(`/settle-up/${g._id}`);
                      }}
                    >
                      Settle
                    </Button>

                    {/* ✅ OPEN BUTTON */}
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ borderRadius: 3, fontWeight: 900 }}
                      onClick={(e) => {
                        e.stopPropagation(); // IMPORTANT
                        navigate(`/group/${g._id}`);
                      }}
                    >
                      Open
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default GroupsPage;
