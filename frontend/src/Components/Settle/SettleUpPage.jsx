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
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Number(num || 0)
  );

const SettleUpPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [groupSummary, setGroupSummary] = useState(null);

  const [settlingKey, setSettlingKey] = useState(null); // ✅ loader for "Mark Settled"

  // ✅ Build userId -> name map from balances (for suggestions names)
  const userMap = useMemo(() => {
    const map = new Map();
    (balances || []).forEach((b) => {
      map.set(String(b.userId), b.fullName);
    });
    return map;
  }, [balances]);

  const getName = (id) => userMap.get(String(id)) || "User";

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [bRes, sRes, hRes, sumRes] = await Promise.all([
        axiosInstance.get(`/groups/${groupId}/balance`),
        axiosInstance.get(`/groups/${groupId}/settlements/suggestions`),
        axiosInstance.get(`/groups/${groupId}/settlements/logs`),
        axiosInstance.get(`/groups/${groupId}/summary`).catch(() => null), // ✅ keep optional
      ]);

      // ✅ balances
      const balancesArr = bRes?.data?.data?.balances || [];
      setBalances(balancesArr);

      // ✅ suggestions
      const suggestionsArr = sRes?.data?.data?.settlements || [];
      setSuggestions(suggestionsArr);

      // ✅ logs
      const logsArr = hRes?.data?.data?.logs || [];
      setHistory(logsArr);

      // ✅ group summary
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
      toast.error(err?.response?.data?.message || "Failed to record settlement");
    } finally {
      setSettlingKey(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            {/* Left title */}
            <Box>
              <Typography variant="h4" fontWeight={900}>
                Settle Up
              </Typography>
              <Typography color="text.secondary">
                See who owes whom and close balances.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 2, flexWrap: "wrap" }}
              >
                <Chip label={`${balances.length} balances`} />
                <Chip label={`${suggestions.length} suggestions`} />
              </Stack>
            </Box>

            {/* Right group summary chips */}
            {groupSummary && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip label={`👥 ${groupSummary.membersCount} members`} />
                <Chip label={`🧾 ${groupSummary.totalExpenses} expenses`} />
                <Chip label={`✅ ${groupSummary.totalSettlements} settles`} />
                <Chip label={`💡 ${groupSummary.suggestionCount} suggestions`} />
              </Stack>
            )}
          </Stack>

          {/* Premium "You summary" strip */}
          {groupSummary && (
            <Card
              sx={{
                mt: 2.5,
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.08)",
                background:
                  (groupSummary?.you?.net || 0) > 0
                    ? "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(16,185,129,0.10))"
                    : (groupSummary?.you?.net || 0) < 0
                    ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.12))"
                    : "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.08))",
              }}
              elevation={0}
            >
              <CardContent sx={{ py: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Box>
                    <Typography fontWeight={900} sx={{ fontSize: 16 }}>
                      Group: {groupSummary.groupName}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                      Your position in this group (net balance)
                    </Typography>
                  </Box>

                  <Chip
                    color={
                      (groupSummary?.you?.net || 0) > 0
                        ? "success"
                        : (groupSummary?.you?.net || 0) < 0
                        ? "warning"
                        : "primary"
                    }
                    variant="outlined"
                    sx={{
                      fontWeight: 900,
                      fontSize: 14,
                      px: 1,
                      py: 2.2,
                      borderRadius: 3,
                    }}
                    label={`You ${
                      (groupSummary?.you?.net || 0) > 0
                        ? "get back"
                        : (groupSummary?.you?.net || 0) < 0
                        ? "owe"
                        : "are settled"
                    } ₹${formatINR(Math.abs(groupSummary?.you?.net || 0))}`}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Balances */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Balances
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            {balances.map((b) => (
              <Box
                key={String(b.userId)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar>{b.fullName?.[0]?.toUpperCase()}</Avatar>
                  <Typography fontWeight={600}>{b.fullName}</Typography>
                </Stack>

                <Chip
                  label={`${b.net >= 0 ? "gets" : "owes"} ₹${formatINR(
                    Math.abs(b.net)
                  )}`}
                  color={b.net >= 0 ? "success" : "warning"}
                  variant="outlined"
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6" fontWeight={700}>
              Suggested Settlements
            </Typography>

            {/* ✅ Tag legend */}
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
              <Chip size="small" label="Recommended" color="primary" />
              <Chip size="small" label="Min transactions" variant="outlined" />
            </Stack>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {suggestions.length === 0 ? (
            <Typography color="text.secondary">
              No suggestions. Everyone is settled ✅
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {suggestions.map((s, idx) => {
                const key = `${idx}-${s.from}-${s.to}-${s.amount}`;
                const isSettling = settlingKey === key;

                return (
                  <Box
                    key={key}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar>{getName(s.from)?.[0]?.toUpperCase()}</Avatar>
                        <Typography fontWeight={800}>
                          {getName(s.from)}
                        </Typography>

                        <ArrowForward sx={{ mx: 1 }} />

                        <Avatar>{getName(s.to)?.[0]?.toUpperCase()}</Avatar>
                        <Typography fontWeight={800}>{getName(s.to)}</Typography>

                        {/* ✅ badges */}
                        <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                          <Chip size="small" label="Recommended" color="primary" />
                          <Chip
                            size="small"
                            label="Min transactions"
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`₹${formatINR(s.amount)}`} />
                        <Button
                          variant="contained"
                          disabled={isSettling}
                          onClick={() => handleMarkSettled(s, idx)}
                          sx={{ fontWeight: 900 }}
                        >
                          {isSettling ? "Saving..." : "Mark Settled"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Settlement History
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {history.length === 0 ? (
            <Typography color="text.secondary">No settlements yet.</Typography>
          ) : (
            <Stack spacing={1.2}>
              {history.map((h) => (
                <Box
                  key={h._id}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {/* Left */}
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={900}>
                      {h.from?.fullName} → {h.to?.fullName}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      <Chip size="small" label={`Paid by: ${h.from?.fullName}`} />
                      <Chip
                        size="small"
                        label={`Received by: ${h.to?.fullName}`}
                      />
                      <Chip
                        size="small"
                        color="primary"
                        label={`₹${formatINR(h.amount)}`}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={new Date(h.settledAt || h.createdAt).toLocaleString()}
                      />
                    </Stack>
                  </Box>

                  {/* Right */}
                  <Chip
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 900 }}
                    label="Settled ✅"
                  />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Back Button */}
      <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
        Back
      </Button>
    </Box>
  );
};

export default SettleUpPage;
