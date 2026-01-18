import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Avatar,
  Divider,
  Chip,
  Skeleton,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosinstance";



const SettleHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/group/my");
      setGroups(res?.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load groups");
      setGroups([]);
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
        <Stack direction="row" spacing={1.2} alignItems="center">
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
              Settle Up
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Select a group to view balances & settle payments.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
          <Chip label={`${groups.length} Groups`} />
          <Chip color="success" variant="outlined" label="Settlements ready ✅" />
        </Stack>
      </Card>

      {/* Groups list */}
      <Card sx={{ borderRadius: 4, p: 2.2 }}>
        <Typography fontWeight={900} sx={{ mb: 1 }}>
          Choose Group
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Stack spacing={1.2}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  border: "1px solid rgba(226,232,240,0.95)",
                }}
              >
                <Stack direction="row" spacing={1.4} alignItems="center">
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={18} />
                    <Skeleton width="40%" height={16} />
                  </Box>
                  <Skeleton width={80} height={30} sx={{ borderRadius: 99 }} />
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : groups.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>
            No groups found. Create a group first.
          </Typography>
        ) : (
          <Stack spacing={1.2}>
            {groups.map((g) => {
              const name = g.groupname || g.name || "Group";
              const membersCount = g.member?.length || g.members?.length || 0;

              return (
                <Card
                  key={g._id}
                  sx={{
                    p: 1.6,
                    borderRadius: 4,
                    border: "1px solid rgba(226,232,240,0.95)",
                    cursor: "pointer",
                    transition: "0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.10)",
                      borderColor: "rgba(37,99,235,0.35)",
                    },
                  }}
                  onClick={() => navigate(`/settle-up/${g._id}`)}
                >
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <Avatar sx={{ fontWeight: 900 }}>
                      {name?.[0]?.toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={900} noWrap>
                        {name}
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                        {membersCount} members • Tap to settle
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      endIcon={<ArrowForwardIosIcon />}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 900,
                        textTransform: "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/settle-up/${g._id}`);
                      }}
                    >
                      Open
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </Card>
    </Box>
  );
};

export default SettleHome;
