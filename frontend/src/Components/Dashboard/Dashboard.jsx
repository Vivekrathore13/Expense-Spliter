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
  CircularProgress,
} from "@mui/material";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
// import  CircularProgress  from "@mui/material";

import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

import { getMyGroupsAPI } from "../../services/groupApi";
import CreateGroupModal from "../Dashboard/CreateGroupModal";
import InviteModal from "./InviteModal";
import axiosInstance from "../../services/axiosinstance";
import { fixOldInvitesAPI } from "../../services/groupApi";
import { toast } from "react-toastify";

// ✅ Motion helpers (lightweight + premium)
const MotionBox = motion(Box);

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -22 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 22 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

// ✅ small stagger for list items
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const listItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ✅ Lightweight CountUp hook (no library)
const useCountUp = (target = 0, duration = 750) => {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const end = Number(target || 0);
    if (!isFinite(end)) return;

    let rafId;
    const start = performance.now();
    const startVal = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ✅ easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (end - startVal) * eased);

      setValue(current);

      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    setValue(0);
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);

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
        Number(num || 0),
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

  const handleFixOldInvites = async () => {
    if (fixLoading) return;

    try {
      setFixLoading(true);

      const res = await fixOldInvitesAPI();
      const fixedCount = res?.data?.data?.fixed || 0;

      if (fixedCount > 0) {
        toast.success(`✅ Fixed ${fixedCount} old invites`);
        fetchSentInvites(); // refresh list
      } else {
        toast.info("No old pending invites to fix 🙂");
      }
    } catch (err) {
      toast.error("Failed to fix old invites ❌");
    } finally {
      setFixLoading(false);
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

  // ✅ Animated numbers (safe + lightweight)
  const animTotalBalance = useCountUp(
    loadingSummary ? 0 : Math.abs(totalBalance),
    750,
  );
  const animYouOwe = useCountUp(
    loadingSummary ? 0 : summary?.youOweTotal || 0,
    750,
  );
  const animYouGet = useCountUp(
    loadingSummary ? 0 : summary?.youGetBackTotal || 0,
    750,
  );

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
    <MotionBox
      initial="hidden"
      animate="show"
      variants={container}
      sx={{
        maxWidth: 1120,
        mx: "auto",
        px: { xs: 1.2, sm: 2, md: 0 }, // ✅ MOBILE padding
        pb: { xs: 3, md: 0 }, // ✅ bottom gap
      }}
    >
      {/* ✅ Welcome header */}
      <MotionBox variants={fadeUp}>
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
      </MotionBox>

      {/* ✅ Summary cards (stagger) */}
      <MotionBox variants={fadeUp}>
        <Grid container spacing={{ xs: 1.6, md: 2.4 }}>
          {[1, 2, 3].map((n) => (
            <Grid key={n} item xs={12} md={4}>
              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: "easeOut",
                  delay: 0.08 * n,
                }}
                whileHover={{ y: -4 }}
              >
                {n === 1 ? (
                  <StatCard
                    icon="₹"
                    iconBg="rgba(56,189,248,0.22)"
                    iconColor="#0284c7"
                    label="Total Balance"
                    value={`₹${formatINR(animTotalBalance)}`}
                    valueColor={totalBalance < 0 ? "#e11d48" : "#16a34a"}
                  />
                ) : n === 2 ? (
                  <StatCard
                    icon={<TrendingDownIcon />}
                    iconBg="rgba(244,63,94,0.18)"
                    iconColor="#e11d48"
                    label="You Owe"
                    value={`₹${formatINR(animYouOwe)}`}
                    valueColor="#e11d48"
                  />
                ) : (
                  <StatCard
                    icon={<TrendingUpIcon />}
                    iconBg="rgba(34,197,94,0.18)"
                    iconColor="#16a34a"
                    label="You Are Owed"
                    value={`₹${formatINR(animYouGet)}`}
                    valueColor="#16a34a"
                  />
                )}
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </MotionBox>

      {/* ✅ Lower section */}
      <Grid container spacing={2.4}>
        {/* LEFT: Groups */}
        <Grid item xs={12} md={5}>
          <MotionBox variants={fadeLeft}>
            <SoftCard sx={{ height: "100%" }}>
              <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 18,
                      color: COLORS.heading,
                    }}
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
                        <Stack
                          direction="row"
                          spacing={1.4}
                          alignItems="center"
                        >
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
                  <MotionBox
                    variants={listContainer}
                    initial="hidden"
                    animate="show"
                  >
                    <Stack spacing={1.2}>
                      {groups.slice(0, 5).map((g, idx) => (
                        <MotionBox key={g._id} variants={listItem}>
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.2,
                                px: 0.6,
                                py: 1.1,
                                borderRadius: 3,
                                transition: "0.18s",
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: alpha("#0f172a", 0.03),
                                  transform: "translateY(-1px)",
                                },
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
                        </MotionBox>
                      ))}
                    </Stack>
                  </MotionBox>
                )}
              </CardContent>
            </SoftCard>
          </MotionBox>
        </Grid>

        {/* RIGHT: Activity + Invites */}
        <Grid item xs={12} md={7}>
          <MotionBox variants={fadeRight}>
            <Stack spacing={2.4}>
              {/* Recent Activity */}
              <SoftCard>
                <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: 18,
                      color: COLORS.heading,
                    }}
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
                            <Skeleton
                              variant="circular"
                              width={44}
                              height={44}
                            />
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
                    <Typography
                      sx={{ opacity: 0.75, py: 2, color: COLORS.text }}
                    >
                      No activity yet.
                    </Typography>
                  ) : (
                    <MotionBox
                      variants={listContainer}
                      initial="hidden"
                      animate="show"
                    >
                      <Stack spacing={1.2}>
                        {summary.recentSettlements.slice(0, 4).map((s) => (
                          <MotionBox key={s.settlementId} variants={listItem}>
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 3,
                                border: "1px solid rgba(226,232,240,0.9)",
                                bgcolor: "rgba(255,255,255,0.60)",
                                transition: "0.18s",
                                "&:hover": { transform: "translateY(-1px)" },
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
                          </MotionBox>
                        ))}
                      </Stack>
                    </MotionBox>
                  )}
                </CardContent>
              </SoftCard>

              {/* Invitations */}
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
                        sx={{
                          fontSize: 13,
                          color: COLORS.text,
                          fontWeight: 800,
                        }}
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
                    <Button
                      onClick={handleFixOldInvites}
                      disabled={fixLoading || loadingInvites}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 900,
                        px: 2.2,
                        py: 0.9,
                        bgcolor: "rgba(15,23,42,0.06)",
                        color: "rgba(15,23,42,0.75)",
                        transition: "0.2s",
                        "&:hover": {
                          bgcolor: "rgba(15,23,42,0.10)",
                          transform: "translateY(-1px)",
                        },
                        "&:active": {
                          transform: "translateY(0px)",
                        },
                        "&.Mui-disabled": {
                          opacity: 0.6,
                          color: "rgba(15,23,42,0.55)",
                        },
                      }}
                    >
                      {fixLoading ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CircularProgress size={18} />
                          Fixing...
                        </span>
                      ) : (
                        "Fix Pending"
                      )}
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
                            <Skeleton
                              variant="circular"
                              width={44}
                              height={44}
                            />
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
                    <MotionBox
                      variants={listContainer}
                      initial="hidden"
                      animate="show"
                    >
                      <Stack spacing={1.2}>
                        {invites.slice(0, 4).map((inv) => (
                          <MotionBox key={inv._id} variants={listItem}>
                            <Box
                              sx={{
                                p: { xs: 1.1, md: 1.4 },
                                borderRadius: { xs: 3, md: 4 },
                                border: "1px solid rgba(226,232,240,0.95)",
                                bgcolor: "rgba(255,255,255,0.70)",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1, md: 1.4 },
                                transition: "0.18s",
                                "&:hover": { transform: "translateY(-1px)" },
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
                                    maxWidth: { xs: 170, sm: 240, md: "100%" },
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
                          </MotionBox>
                        ))}
                      </Stack>
                    </MotionBox>
                  )}
                </CardContent>
              </SoftCard>
            </Stack>
          </MotionBox>
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
          fetchSentInvites();
        }}
        groups={groups}
      />
    </MotionBox>
  );
};

export default Dashboard;
