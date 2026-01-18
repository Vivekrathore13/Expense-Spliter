import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  Avatar,
  CircularProgress,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";

// icons
import HandshakeIcon from "@mui/icons-material/Handshake";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SavingsIcon from "@mui/icons-material/Savings";
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PaymentIcon from "@mui/icons-material/Payment";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Number(num || 0),
  );

// ✅ Common SoftCard like Dashboard
const SoftCard = ({ children, sx }) => (
  <Card
    sx={{
      borderRadius: 5,
      bgcolor: "rgba(255,255,255,0.85)",
      border: "1px solid rgba(226,232,240,0.95)",
      boxShadow: "0 18px 60px rgba(2,6,23,0.08)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const SettleUpPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [groupSummary, setGroupSummary] = useState(null);

  const [settlingKey, setSettlingKey] = useState(null);
  // ✅ logged in user id
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loggedInUserId = user?._id;

  // ✅ userId -> name
  const userMap = useMemo(() => {
    const map = new Map();
    (balances || []).forEach((b) => map.set(String(b.userId), b.fullName));
    return map;
  }, [balances]);

  const getName = (id) => userMap.get(String(id)) || "User";

  // ✅ Copy helper
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      toast.success("Copied ✅");
    } catch {
      toast.error("Copy failed");
    }
  };

  // ✅ UPI deep link builder
  const buildUpiLink = ({ toUpiId, toName, amount }) => {
    const pa = encodeURIComponent((toUpiId || "").trim());
    const pn = encodeURIComponent((toName || "Expense Splitter").trim());
    const am = encodeURIComponent(Number(amount || 0).toFixed(2));
    const tn = encodeURIComponent("Expense Splitter Settlement");
    const cu = "INR";

    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=${cu}`;
  };

  const handlePayViaUpi = (s) => {
    if (!s?.toUpiId?.trim()) {
      toast.error("Receiver UPI not available");
      return;
    }

    const link = buildUpiLink({
      toUpiId: s.toUpiId,
      toName: getName(s.to),
      amount: s.amount,
    });

    // ✅ opens UPI apps
    window.location.href = link;
  };

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [bRes, sRes, hRes, sumRes] = await Promise.all([
        axiosInstance.get(`/groups/${groupId}/balance`),
        axiosInstance.get(`/groups/${groupId}/settlements/suggestions`),
        axiosInstance.get(`/groups/${groupId}/settlements/logs`),
        axiosInstance.get(`/groups/${groupId}/summary`).catch(() => null),
      ]);

      setBalances(bRes?.data?.data?.balances || []);
      setSuggestions(sRes?.data?.data?.settlements || []);
      setHistory(hRes?.data?.data?.logs || []);
      setGroupSummary(sumRes?.data?.data || null);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load settle up page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [groupId]);

  const handleMarkSettled = async (s, idx) => {
    const key = `${idx}-${s.from}-${s.to}-${s.amount}`;
    try {
      setSettlingKey(key);

      await axiosInstance.post(`/groups/${groupId}/settlements`, {
        from: s.from,
        to: s.to,
        amount: s.amount,
      });

      toast.success("Settlement recorded ✅");
      fetchAll();
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message || "Failed to record settlement",
      );
    } finally {
      setSettlingKey(null);
    }
  };

  // ✅ helpful computed
  const youNet = groupSummary?.you?.net || 0;

  const netChip = useMemo(() => {
    if (youNet > 0)
      return { label: `You get back ₹${formatINR(youNet)}`, color: "#16a34a" };
    if (youNet < 0)
      return {
        label: `You owe ₹${formatINR(Math.abs(youNet))}`,
        color: "#e11d48",
      };
    return { label: "You are settled ✅", color: "#2563eb" };
  }, [youNet]);

  // ✅ Loading UI (premium skeleton)
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <SoftCard sx={{ mb: 2.4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Skeleton width="40%" height={38} />
              <Skeleton width="60%" height={22} />
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Skeleton width={110} height={34} sx={{ borderRadius: 99 }} />
                <Skeleton width={120} height={34} sx={{ borderRadius: 99 }} />
                <Skeleton width={140} height={34} sx={{ borderRadius: 99 }} />
              </Stack>
            </Stack>
          </CardContent>
        </SoftCard>

        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <SoftCard key={i}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="50%" height={22} />
                    <Skeleton width="35%" height={18} />
                  </Box>
                  <Skeleton width={120} height={34} sx={{ borderRadius: 99 }} />
                </Stack>
              </CardContent>
            </SoftCard>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 }, maxWidth: 1180, mx: "auto" }}>
      {/* ✅ Header Premium */}
      <SoftCard
        sx={{
          mb: 2.6,
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.12))",
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        {/* glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(37,99,235,0.22), transparent 55%)",
            pointerEvents: "none",
          }}
        />

        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ position: "relative" }}
          >
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: alpha("#2563eb", 0.16),
                    color: "#2563eb",
                    fontWeight: 900,
                  }}
                >
                  <HandshakeIcon />
                </Avatar>

                <Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 950 }}>
                    Settle Up
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                    Close balances and record settlements.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.8, flexWrap: "wrap" }}
              >
                <Chip
                  icon={<AccountBalanceWalletIcon />}
                  label={`${balances.length} balances`}
                  sx={{ fontWeight: 900 }}
                />
                <Chip
                  icon={<LightbulbIcon />}
                  label={`${suggestions.length} suggestions`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 900 }}
                />
                <Chip
                  icon={<HistoryIcon />}
                  label={`${history.length} logs`}
                  variant="outlined"
                  sx={{ fontWeight: 900 }}
                />
              </Stack>
            </Box>

            {/* ✅ group summary */}
            {groupSummary ? (
              <Stack
                spacing={1}
                alignItems={{ xs: "flex-start", md: "flex-end" }}
              >
                <Chip
                  icon={<GroupsIcon />}
                  label={`Group: ${groupSummary.groupName}`}
                  sx={{ fontWeight: 900 }}
                />

                <Chip
                  label={netChip.label}
                  sx={{
                    fontWeight: 950,
                    px: 1,
                    borderRadius: 3,
                    bgcolor: alpha(netChip.color, 0.12),
                    color: netChip.color,
                    border: `1px solid ${alpha(netChip.color, 0.22)}`,
                  }}
                />
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </SoftCard>

      {/* ✅ Balances */}
      <SoftCard sx={{ mb: 2.6 }}>
        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha("#0f172a", 0.06),
                color: "#0f172a",
                fontWeight: 900,
              }}
            >
              <AccountBalanceWalletIcon />
            </Avatar>
            <Typography sx={{ fontSize: 18, fontWeight: 950 }}>
              Balances
            </Typography>
          </Stack>

          <Divider sx={{ my: 1.8, opacity: 0.7 }} />

          {balances.length === 0 ? (
            <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
              No balances found ✅
            </Typography>
          ) : (
            <Stack spacing={1.2}>
              {balances.map((b) => (
                <Box
                  key={String(b.userId)}
                  sx={{
                    p: 1.4,
                    borderRadius: 4,
                    border: "1px solid rgba(226,232,240,0.95)",
                    bgcolor: "rgba(255,255,255,0.65)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    transition: "0.2s",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 14px 45px rgba(2,6,23,0.08)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha("#2563eb", 0.14),
                        color: "#2563eb",
                        fontWeight: 900,
                      }}
                    >
                      {b.fullName?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={950}>{b.fullName}</Typography>
                      <Typography
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      >
                        Net position
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={`${b.net >= 0 ? "gets" : "owes"} ₹${formatINR(
                      Math.abs(b.net),
                    )}`}
                    sx={{
                      fontWeight: 950,
                      borderRadius: 999,
                      bgcolor:
                        b.net >= 0
                          ? "rgba(34,197,94,0.14)"
                          : "rgba(244,63,94,0.14)",
                      color: b.net >= 0 ? "#16a34a" : "#e11d48",
                      border: `1px solid ${
                        b.net >= 0
                          ? "rgba(34,197,94,0.26)"
                          : "rgba(244,63,94,0.28)"
                      }`,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </SoftCard>

      {/* ✅ Suggestions */}
      <SoftCard sx={{ mb: 2.6 }}>
        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={1.2}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha("#2563eb", 0.14),
                  color: "#2563eb",
                  fontWeight: 900,
                }}
              >
                <LightbulbIcon />
              </Avatar>
              <Typography sx={{ fontSize: 18, fontWeight: 950 }}>
                Suggested Settlements
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label="Recommended"
                color="primary"
                sx={{ fontWeight: 900 }}
              />
              <Chip
                size="small"
                label="Min transactions"
                variant="outlined"
                sx={{ fontWeight: 900 }}
              />
            </Stack>
          </Stack>

          <Divider sx={{ my: 1.8, opacity: 0.7 }} />

          {suggestions.length === 0 ? (
            <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
              No suggestions. Everyone is settled ✅
            </Typography>
          ) : (
            <Stack spacing={1.4}>
              {suggestions.map((s, idx) => {
                const key = `${idx}-${s.from}-${s.to}-${s.amount}`;
                const isSettling = settlingKey === key;

                const canSettle = String(loggedInUserId) === String(s.from);
                const receiverHasUpi = Boolean(s?.toUpiId?.trim());

                return (
                  <Box
                    key={key}
                    sx={{
                      p: 1.6,
                      borderRadius: 4,
                      border: "1px solid rgba(226,232,240,0.95)",
                      bgcolor: "rgba(255,255,255,0.64)",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 18px 55px rgba(2,6,23,0.08)",
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha("#0f172a", 0.06),
                            fontWeight: 900,
                          }}
                        >
                          {getName(s.from)?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={950}>
                          {getName(s.from)}
                        </Typography>

                        <ArrowForward sx={{ opacity: 0.55 }} />

                        <Avatar
                          sx={{
                            bgcolor: alpha("#0f172a", 0.06),
                            fontWeight: 900,
                          }}
                        >
                          {getName(s.to)?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={950}>{getName(s.to)}</Typography>

                        <Chip
                          size="small"
                          label="Recommended"
                          color="primary"
                          sx={{ fontWeight: 900 }}
                        />
                        <Chip
                          size="small"
                          label="Min transactions"
                          variant="outlined"
                          sx={{ fontWeight: 900 }}
                        />

                        {receiverHasUpi ? (
                          <Chip
                            size="small"
                            label="UPI available"
                            sx={{
                              fontWeight: 900,
                              bgcolor: "rgba(34,197,94,0.14)",
                              color: "#16a34a",
                              border: "1px solid rgba(34,197,94,0.22)",
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="No UPI"
                            sx={{
                              fontWeight: 900,
                              bgcolor: "rgba(15,23,42,0.06)",
                              color: "rgba(15,23,42,0.55)",
                              border: "1px solid rgba(226,232,240,0.95)",
                            }}
                          />
                        )}
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        <Chip
                          icon={<SavingsIcon />}
                          label={`₹${formatINR(s.amount)}`}
                          sx={{ fontWeight: 950 }}
                        />

                        {/* ✅ Pay via UPI */}
                        {receiverHasUpi ? (
                          <Tooltip title={`Pay ${getName(s.to)} via UPI`}>
                            <span>
                              <Button
                                onClick={() => handlePayViaUpi(s)}
                                variant="outlined"
                                startIcon={<PaymentIcon />}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 950,
                                  textTransform: "none",
                                }}
                              >
                                Pay via UPI
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={`${getName(s.to)} has not added UPI ID yet`}
                          >
                            <span>
                              <Button
                                disabled
                                variant="outlined"
                                startIcon={<PaymentIcon />}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 950,
                                  textTransform: "none",
                                }}
                              >
                                UPI Not Available
                              </Button>
                            </span>
                          </Tooltip>
                        )}

                        {/* ✅ Copy UPI */}
                        {receiverHasUpi ? (
                          <Tooltip title="Copy receiver UPI ID">
                            <span>
                              <Button
                                onClick={() => copyText(s.toUpiId)}
                                variant="outlined"
                                startIcon={<ContentCopyIcon />}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 950,
                                  textTransform: "none",
                                }}
                              >
                                Copy UPI
                              </Button>
                            </span>
                          </Tooltip>
                        ) : null}

                        <Tooltip
                          title={
                            canSettle
                              ? "Record this settlement"
                              : `Only ${getName(
                                  s.from,
                                )} can mark this settlement`
                          }
                        >
                          <span>
                            <Button
                              variant="contained"
                              disabled={!canSettle || isSettling}
                              onClick={() => handleMarkSettled(s, idx)}
                              sx={{
                                fontWeight: 950,
                                borderRadius: 999,
                                px: 2.2,
                                textTransform: "none",
                                opacity: canSettle ? 1 : 0.55,
                                cursor: canSettle ? "pointer" : "not-allowed",
                                bgcolor: canSettle
                                  ? undefined
                                  : "rgba(15,23,42,0.06)",
                                color: canSettle
                                  ? undefined
                                  : "rgba(15,23,42,0.45)",
                                boxShadow: "none",
                                "&:hover": { boxShadow: "none" },
                                "&.Mui-disabled": {
                                  opacity: 1,
                                  bgcolor: "rgba(245,158,11,0.14)",
                                  color: "#92400e",
                                  border: "1px solid rgba(245,158,11,0.32)",
                                  boxShadow:
                                    "0 12px 35px rgba(245,158,11,0.20)", // ✅ glow
                                },
                              }}
                            >
                              {isSettling ? (
                                <>
                                  <CircularProgress size={18} sx={{ mr: 1 }} />{" "}
                                  Saving
                                </>
                              ) : canSettle ? (
                                "Mark Settled"
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontWeight: 950,
                                    color: "#92400e",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 24,
                                      height: 24,
                                      display: "grid",
                                      placeItems: "center",
                                      borderRadius: 999,
                                      background: "rgba(245,158,11,0.22)", // ✅ yellow highlight
                                      border: "1px solid rgba(245,158,11,0.45)",
                                      color: "#b45309",
                                    }}
                                  >
                                    <LockIcon sx={{ fontSize: 15 }} />
                                  </span>
                                  Locked
                                </span>
                              )}
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </SoftCard>

      {/* ✅ History */}
      <SoftCard>
        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: alpha("#16a34a", 0.12),
                color: "#16a34a",
                fontWeight: 900,
              }}
            >
              <HistoryIcon />
            </Avatar>
            <Typography sx={{ fontSize: 18, fontWeight: 950 }}>
              Settlement History
            </Typography>
          </Stack>

          <Divider sx={{ my: 1.8, opacity: 0.7 }} />

          {history.length === 0 ? (
            <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
              No settlements yet.
            </Typography>
          ) : (
            <Stack spacing={1.3}>
              {history.map((h) => (
                <Box
                  key={h._id}
                  sx={{
                    p: 1.6,
                    borderRadius: 4,
                    border: "1px solid rgba(226,232,240,0.95)",
                    bgcolor: "rgba(255,255,255,0.62)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    transition: "0.2s",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 18px 55px rgba(2,6,23,0.08)",
                    },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={950} noWrap>
                      {h.from?.fullName} → {h.to?.fullName}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      <Chip
                        size="small"
                        label={`₹${formatINR(h.amount)}`}
                        color="primary"
                        sx={{ fontWeight: 900 }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={new Date(
                          h.settledAt || h.createdAt,
                        ).toLocaleString()}
                        sx={{ fontWeight: 900 }}
                      />
                    </Stack>
                  </Box>

                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Settled"
                    sx={{
                      fontWeight: 950,
                      borderRadius: 999,
                      bgcolor: "rgba(34,197,94,0.14)",
                      color: "#16a34a",
                      border: "1px solid rgba(34,197,94,0.25)",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </SoftCard>

      {/* ✅ Back */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mt: 2.2,
          borderRadius: 999,
          fontWeight: 950,
          textTransform: "none",
        }}
      >
        Back
      </Button>
    </Box>
  );
};

export default SettleUpPage;
