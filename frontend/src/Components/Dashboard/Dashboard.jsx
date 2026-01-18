import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";

import { getMyGroupsAPI } from "../../services/groupApi";
import CreateGroupModal from "./CreateGroupModal";
import axiosInstance from "../../services/axiosinstance";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);

  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalSettlements: 0,
    youOweTotal: 0,
    youGetBackTotal: 0,
    recentSettlements: [],
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const firstName = user?.fullName?.split(" ")?.[0] || "Vivek";

  const formatINR = useMemo(() => {
    return (num) =>
      new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
        Number(num || 0)
      );
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsRes = await getMyGroupsAPI();
      const myGroups = groupsRes?.data?.data || [];
      setGroups(myGroups);
    } catch (err) {
      console.log("Groups fetch error:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axiosInstance.get("/dashboard/summary");
      setSummary(res?.data?.data || {});
    } catch (err) {
      console.log("Summary fetch error:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadDashboard = async () => {
    await Promise.all([loadGroups(), fetchDashboardSummary()]);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalBalance = useMemo(() => {
    const owe = Number(summary?.youOweTotal || 0);
    const get = Number(summary?.youGetBackTotal || 0);
    return get - owe;
  }, [summary?.youOweTotal, summary?.youGetBackTotal]);

  const GlassCard = ({ children, sx }) => (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.55)",
        border: "1px solid rgba(148,163,184,0.25)",
        boxShadow: "0 14px 35px rgba(2,6,23,0.10)",
        backdropFilter: "blur(12px)",
        ...sx,
      }}
    >
      {children}
    </Card>
  );

  return (
    <Box>
      {/* ✅ Welcome header (Image style) */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: 2.2 }}
      >
        <Typography
          sx={{
            fontSize: { xs: 28, md: 34 },
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#0f172a",
          }}
        >
          Welcome, {firstName}!
        </Typography>
      </Stack>

      {/* ✅ Summary cards (3) */}
      <Grid container spacing={2} sx={{ mb: 2.4 }}>
        <Grid item xs={12} md={4}>
          <GlassCard>
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "rgba(56,189,248,0.18)",
                    color: "#0284c7",
                    width: 48,
                    height: 48,
                    fontWeight: 900,
                  }}
                >
                  ₹
                </Avatar>

                <Box>
                  <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>
                    Total Balance
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 28,
                      color: totalBalance < 0 ? "#e11d48" : "#16a34a",
                    }}
                  >
                    ₹{formatINR(Math.abs(totalBalance))}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <GlassCard>
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "rgba(244,63,94,0.14)",
                    color: "#e11d48",
                    width: 48,
                    height: 48,
                  }}
                >
                  <TrendingDownIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>
                    You Owe
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 28, color: "#e11d48" }}>
                    ₹{formatINR(summary?.youOweTotal || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <GlassCard>
            <CardContent sx={{ p: 2.2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "rgba(34,197,94,0.14)",
                    color: "#16a34a",
                    width: 48,
                    height: 48,
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ opacity: 0.7, fontWeight: 900 }}>
                    You Are Owed
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 28, color: "#16a34a" }}>
                    ₹{formatINR(summary?.youGetBackTotal || 0)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* ✅ Lower 2 cards */}
      <Grid container spacing={2}>
        {/* Your Groups */}
        <Grid item xs={12} md={7}>
          <GlassCard>
            <CardContent sx={{ p: 2.2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: 18 }}>
                  Your Groups
                </Typography>

                <Button
                  onClick={() => setOpenCreate(true)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                    px: 2,
                    py: 0.8,
                    bgcolor: "rgba(37,99,235,0.10)",
                    color: "#2563eb",
                    "&:hover": { bgcolor: "rgba(37,99,235,0.15)" },
                  }}
                >
                  + Create Group
                </Button>
              </Stack>

              <Divider sx={{ mb: 1.2, opacity: 0.5 }} />

              {loading ? (
                <Typography sx={{ opacity: 0.7, py: 2 }}>
                  Loading groups...
                </Typography>
              ) : groups.length === 0 ? (
                <Typography sx={{ opacity: 0.7, py: 2 }}>
                  No groups found. Create your first group ✨
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {groups.slice(0, 6).map((g) => (
                    <Box
                      key={g._id}
                      sx={{
                        px: 1.2,
                        py: 1.2,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.55)",
                        border: "1px solid rgba(148,163,184,0.22)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: "rgba(37,99,235,0.12)",
                          color: "#2563eb",
                          fontWeight: 900,
                        }}
                      >
                        {(g.groupname || "G")[0]}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900 }}>
                          {g.groupname}
                        </Typography>
                        <Typography sx={{ fontSize: 12, opacity: 0.65 }}>
                          {g.member?.length ?? 0} members
                        </Typography>
                      </Box>

                      {/* Placeholder group balance (later API) */}
                      <Typography sx={{ fontWeight: 900, color: "#16a34a" }}>
                        ₹{formatINR(300)}
                      </Typography>

                      <ChevronRightIcon sx={{ opacity: 0.35 }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={5}>
          <GlassCard sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.2 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 18, mb: 1.5 }}>
                Recent Activity
              </Typography>

              <Divider sx={{ mb: 1.2, opacity: 0.5 }} />

              {loadingSummary ? (
                <Typography sx={{ opacity: 0.7, py: 2 }}>
                  Loading activity...
                </Typography>
              ) : !summary?.recentSettlements?.length ? (
                <Typography sx={{ opacity: 0.7, py: 2 }}>
                  No activity yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {summary.recentSettlements.slice(0, 6).map((s) => (
                    <Box
                      key={s.settlementId}
                      sx={{
                        px: 1.2,
                        py: 1.2,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.55)",
                        border: "1px solid rgba(148,163,184,0.22)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "rgba(2,6,23,0.06)",
                          fontWeight: 900,
                        }}
                      >
                        <PersonIcon sx={{ opacity: 0.7 }} />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: 13 }}>
                          {s.fromName} settled with {s.toName}
                        </Typography>
                        <Typography sx={{ fontSize: 12, opacity: 0.65 }}>
                          {s.groupName}
                        </Typography>
                      </Box>

                      <Typography sx={{ fontWeight: 900, color: "#2563eb" }}>
                        ₹{formatINR(s.amount)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      <CreateGroupModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadDashboard}
      />

  
    </Box>
  );
};

export default Dashboard;
