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
  Skeleton,
  Chip,
} from "@mui/material";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { alpha } from "@mui/material/styles";

import { getMyGroupsAPI } from "../../services/groupApi";
import CreateGroupModal from "../Dashboard/CreateGroupModal";
import InviteModal from "./InviteModal";
import axiosInstance from "../../services/axiosinstance";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  // ✅ Invite section
  const [openInvite, setOpenInvite] = useState(false);
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

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

  // ✅ fetch sent invites (backend route)
  const fetchSentInvites = async () => {
    try {
      setLoadingInvites(true);
      const res = await axiosInstance.get("/invites/sent");
      setInvites(res?.data?.data || []);
    } catch (err) {
      console.log("Invites fetch error:", err);
      setInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  const loadDashboard = async () => {
    await Promise.all([
      loadGroups(),
      fetchDashboardSummary(),
      fetchSentInvites(),
    ]);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalBalance = useMemo(() => {
    const owe = Number(summary?.youOweTotal || 0);
    const get = Number(summary?.youGetBackTotal || 0);
    return get - owe;
  }, [summary?.youOweTotal, summary?.youGetBackTotal]);

  // ✅ Soft text palette
  const COLORS = {
    heading: "#0f172a",
    text: "rgba(15,23,42,0.78)",
    muted: "rgba(15,23,42,0.58)",
  };

  // ✅ Reference card style
  const SoftCard = ({ children, sx }) => (
    <Card
      sx={{
        borderRadius: 4,
        bgcolor: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(226,232,240,0.95)",
        boxShadow: "0 14px 40px rgba(2,6,23,0.08)",
        ...sx,
      }}
    >
      {children}
    </Card>
  );

  const StatCard = ({ icon, iconBg, iconColor, label, value, valueColor }) => (
    <SoftCard sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2, md: 2.2 } }}>
        <Stack direction="row" spacing={1.8} alignItems="center">
          <Avatar
            sx={{
              bgcolor: iconBg,
              color: iconColor,
              width: 56,
              height: 56,
              fontWeight: 900,
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography
              sx={{ fontWeight: 900, fontSize: 14, color: COLORS.muted }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: 28, md: 32 },
                mt: 0.2,
                color: valueColor,
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </SoftCard>
  );

  const InviteStatusChip = ({ status }) => {
    const s = (status || "PENDING").toUpperCase();
    const isPending = s === "PENDING";

    return (
      <Chip
        size="small"
        label={s}
        sx={{
          fontWeight: 900,
          borderRadius: 999,
          bgcolor: isPending ? "rgba(245,158,11,0.16)" : "rgba(34,197,94,0.14)",
          color: isPending ? "#b45309" : "#16a34a",
          border: `1px solid ${
            isPending ? "rgba(245,158,11,0.30)" : "rgba(34,197,94,0.25)"
          }`,
        }}
      />
    );
  };

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto" }}>
      {/* ✅ Welcome header */}
      <Stack sx={{ mb: 2.6 }}>
        <Typography
          sx={{
            fontSize: { xs: 30, md: 44 },
            fontWeight: 900,
            color: COLORS.heading,
            letterSpacing: "-0.03em",
          }}
        >
          Welcome, {firstName}!
        </Typography>

        <Typography sx={{ mt: 0.5, fontWeight: 800, color: COLORS.text }}>
          Track your balances, groups & settlements in one place.
        </Typography>
      </Stack>

      {/* ✅ Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2.8 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            icon="₹"
            iconBg="rgba(56,189,248,0.22)"
            iconColor="#0284c7"
            label="Total Balance"
            value={`₹${formatINR(Math.abs(totalBalance))}`}
            valueColor={totalBalance < 0 ? "#e11d48" : "#16a34a"}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            icon={<TrendingDownIcon />}
            iconBg="rgba(244,63,94,0.18)"
            iconColor="#e11d48"
            label="You Owe"
            value={`₹${formatINR(summary?.youOweTotal || 0)}`}
            valueColor="#e11d48"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <StatCard
            icon={<TrendingUpIcon />}
            iconBg="rgba(34,197,94,0.18)"
            iconColor="#16a34a"
            label="You Are Owed"
            value={`₹${formatINR(summary?.youGetBackTotal || 0)}`}
            valueColor="#16a34a"
          />
        </Grid>
      </Grid>

      {/* ✅ Lower section: Option A layout */}
      <Grid container spacing={2.4}>
        {/* ✅ LEFT: Your Groups */}
        <Grid item xs={12} md={5}>
          <SoftCard sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  sx={{ fontWeight: 900, fontSize: 18, color: COLORS.heading }}
                >
                  Your Groups
                </Typography>

                <Button
                  onClick={() => setOpenCreate(true)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 900,
                    px: 2.2,
                    py: 0.8,
                    bgcolor: "rgba(37,99,235,0.10)",
                    color: "#2563eb",
                    "&:hover": { bgcolor: "rgba(37,99,235,0.14)" },
                  }}
                >
                  + Create Group
                </Button>
              </Stack>

              <Divider sx={{ opacity: 0.6, my: 1.5 }} />

              {loading ? (
                <Stack spacing={1.2}>
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.2,
                        borderRadius: 3,
                        border: "1px solid rgba(226,232,240,0.9)",
                      }}
                    >
                      <Stack direction="row" spacing={1.4} alignItems="center">
                        <Skeleton variant="circular" width={44} height={44} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="60%" height={18} />
                          <Skeleton width="40%" height={16} />
                        </Box>
                        <Skeleton width={50} height={18} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : groups.length === 0 ? (
                <Typography sx={{ opacity: 0.75, py: 2, color: COLORS.text }}>
                  No groups found. Create your first group ✨
                </Typography>
              ) : (
                <Stack spacing={1.2}>
                  {groups.slice(0, 5).map((g, idx) => (
                    <Box key={g._id}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                          px: 0.6,
                          py: 1.1,
                          borderRadius: 3,
                          transition: "0.15s",
                          cursor: "pointer",
                          "&:hover": { bgcolor: alpha("#0f172a", 0.03) },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 46,
                            height: 46,
                            bgcolor: "rgba(37,99,235,0.12)",
                            color: "#2563eb",
                            fontWeight: 900,
                          }}
                        >
                          {(g.groupname || "G")[0]}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              color: COLORS.heading,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {g.groupname}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: COLORS.muted,
                              fontWeight: 800,
                            }}
                          >
                            {g.member?.length ?? 0} members
                          </Typography>
                        </Box>

                        {/* placeholder */}
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: "#16a34a",
                            minWidth: 70,
                            textAlign: "right",
                          }}
                        >
                          ₹{formatINR(g?.totalExpense || 0)}
                        </Typography>

                        <ChevronRightIcon sx={{ opacity: 0.35 }} />
                      </Box>

                      {idx !== Math.min(groups.length, 5) - 1 && (
                        <Divider sx={{ opacity: 0.55 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </SoftCard>
        </Grid>

        {/* ✅ RIGHT: Recent Activity + Invitations */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2.4}>
            {/* ✅ Recent Activity */}
            <SoftCard>
              <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
                <Typography
                  sx={{ fontWeight: 900, fontSize: 18, color: COLORS.heading }}
                >
                  Recent Activity
                </Typography>

                <Divider sx={{ opacity: 0.6, my: 1.5 }} />

                {loadingSummary ? (
                  <Stack spacing={1.2}>
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 1.2,
                          borderRadius: 3,
                          border: "1px solid rgba(226,232,240,0.9)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.4}
                          alignItems="center"
                        >
                          <Skeleton variant="circular" width={44} height={44} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width="70%" height={18} />
                            <Skeleton width="45%" height={16} />
                          </Box>
                          <Skeleton width={50} height={18} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : !summary?.recentSettlements?.length ? (
                  <Typography sx={{ opacity: 0.75, py: 2, color: COLORS.text }}>
                    No activity yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.2}>
                    {summary.recentSettlements.slice(0, 4).map((s) => (
                      <Box
                        key={s.settlementId}
                        sx={{
                          p: 1.25,
                          borderRadius: 3,
                          border: "1px solid rgba(226,232,240,0.9)",
                          bgcolor: "rgba(255,255,255,0.60)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.3}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: "rgba(148,163,184,0.20)",
                            }}
                          >
                            <PersonIcon sx={{ opacity: 0.6 }} />
                          </Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: 14,
                                color: COLORS.heading,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {s.fromName} settled with {s.toName}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 13,
                                color: COLORS.muted,
                                fontWeight: 800,
                              }}
                            >
                              {s.groupName}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{ fontWeight: 900, color: "#2563eb" }}
                          >
                            ₹{formatINR(s.amount)}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </SoftCard>

            {/* ✅ Invitations */}
            <SoftCard>
              <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  gap={1.2}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: 18,
                        color: COLORS.heading,
                      }}
                    >
                      Invitations
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, color: COLORS.text, fontWeight: 800 }}
                    >
                      Manage invited members (email + group + status)
                    </Typography>
                  </Box>

                  <Button
                    startIcon={<MailOutlineIcon />}
                    onClick={() => setOpenInvite(true)}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 900,
                      px: 2.2,
                      py: 0.9,
                      bgcolor: "rgba(37,99,235,0.10)",
                      color: "#2563eb",
                      "&:hover": { bgcolor: "rgba(37,99,235,0.14)" },
                    }}
                  >
                    Invite Member
                  </Button>
                </Stack>

                <Divider sx={{ opacity: 0.6, my: 1.6 }} />

                {loadingInvites ? (
                  <Stack spacing={1.2}>
                    {[1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 1.4,
                          borderRadius: 3,
                          border: "1px solid rgba(226,232,240,0.9)",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Skeleton variant="circular" width={44} height={44} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton width="45%" height={18} />
                            <Skeleton width="30%" height={16} />
                          </Box>
                          <Skeleton width={80} height={22} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : invites.length === 0 ? (
                  <Typography
                    sx={{ opacity: 0.78, py: 1.2, color: COLORS.text }}
                  >
                    No invites sent yet. Invite members to join your groups ✅
                  </Typography>
                ) : (
                  <Stack spacing={1.2}>
                    {invites.slice(0, 4).map((inv) => (
                      <Box
                        key={inv._id}
                        sx={{
                          p: 1.4,
                          borderRadius: 4,
                          border: "1px solid rgba(226,232,240,0.95)",
                          bgcolor: "rgba(255,255,255,0.70)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.4,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 46,
                            height: 46,
                            bgcolor: "rgba(37,99,235,0.12)",
                            color: "#2563eb",
                            fontWeight: 900,
                          }}
                        >
                          {inv?.email?.[0]?.toUpperCase() || "U"}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              color: COLORS.heading,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {inv.email}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 13,
                              color: COLORS.muted,
                              fontWeight: 800,
                            }}
                          >
                            Group: {inv.groupName || "—"}
                          </Typography>
                        </Box>

                        <InviteStatusChip status={inv.status} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </SoftCard>
          </Stack>
        </Grid>
      </Grid>

      {/* ✅ Modals */}
      <CreateGroupModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadDashboard}
      />

      <InviteModal
        open={openInvite}
        onClose={() => {
          setOpenInvite(false);
          fetchSentInvites(); // ✅ refresh after invite send
        }}
        groups={groups}
      />
    </Box>
  );
};

export default Dashboard;
