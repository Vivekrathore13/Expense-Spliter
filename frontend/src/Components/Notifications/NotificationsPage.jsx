import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

import { alpha } from "@mui/material/styles";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteOneNotification,
} from "../../services/notificationService";

import { timeAgo } from "../../services/timeAgo";

const typeMeta = (type = "INFO") => {
  const t = String(type).toUpperCase();

  if (t.includes("INVITE"))
    return { label: "INVITE", color: "primary", icon: "✉️" };

  if (t.includes("SETTLE"))
    return { label: "SETTLE", color: "success", icon: "✅" };

  if (t.includes("EXPENSE"))
    return { label: "EXPENSE", color: "warning", icon: "🧾" };

  return { label: t, color: "default", icon: "🔔" };
};

const SoftCard = ({ children, sx }) => (
  <Card
    sx={{
      borderRadius: 4,
      bgcolor: "rgba(255,255,255,0.88)",
      border: "1px solid rgba(226,232,240,0.95)",
      boxShadow: "0 14px 40px rgba(2,6,23,0.08)",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Card>
);

const NotificationsPage = () => {
  const [tab, setTab] = useState(0); // 0 all, 1 unread
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("❌ Notifications load error:", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => list.filter((n) => !n.isRead).length,
    [list]
  );

  const filtered = useMemo(() => {
    let arr = tab === 1 ? list.filter((n) => !n.isRead) : list;

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((n) => {
        const title = (n?.title || "").toLowerCase();
        const msg = (n?.message || "").toLowerCase();
        const type = (n?.type || "").toLowerCase();
        return title.includes(q) || msg.includes(q) || type.includes(q);
      });
    }

    return arr;
  }, [tab, list, search]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setList((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log("❌ Mark read error:", err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log("❌ Mark all error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOneNotification(id);
      setList((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.log("❌ Delete error:", err);
    }
  };

  const COLORS = {
    heading: "#0f172a",
    text: "rgba(15,23,42,0.78)",
    muted: "rgba(15,23,42,0.58)",
  };

  return (
    <Box sx={{ p: 2, maxWidth: 980, mx: "auto" }}>
      {/* ✅ Header Premium */}
      <SoftCard
        sx={{
          mb: 2,
          border: "1px solid rgba(99,102,241,0.22)",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.12))",
          position: "relative",
        }}
      >
        {/* glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(37,99,235,0.22), transparent 45%)",
            pointerEvents: "none",
          }}
        />

        <CardContent sx={{ p: { xs: 2, md: 2.4 }, position: "relative" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha("#2563eb", 0.14),
                    color: "#2563eb",
                    fontWeight: 900,
                  }}
                >
                  <NotificationsActiveIcon />
                </Avatar>

                <Box>
                  <Typography variant="h5" fontWeight={950} sx={{ color: COLORS.heading }}>
                    Notifications
                  </Typography>

                  <Typography sx={{ color: COLORS.text, fontWeight: 800, mt: 0.3 }}>
                    Stay updated about invites, expenses & settlements.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: "wrap" }}>
                <Chip
                  label={`Total: ${list.length}`}
                  sx={{ fontWeight: 900 }}
                />
                <Chip
                  color="primary"
                  variant="outlined"
                  label={`Unread: ${unreadCount}`}
                  sx={{ fontWeight: 900 }}
                />
              </Stack>
            </Box>

            {/* actions */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <TextField
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 260 },
                  bgcolor: "rgba(255,255,255,0.70)",
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

              <Tooltip title="Refresh">
                <IconButton
                  onClick={loadNotifications}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(226,232,240,0.85)",
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAll}
                disabled={unreadCount === 0}
                sx={{
                  borderRadius: 3,
                  fontWeight: 950,
                  px: 2,
                }}
              >
                Mark all read
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </SoftCard>

      {/* ✅ Tabs */}
      <SoftCard sx={{ mb: 2 }}>
        <CardContent sx={{ p: 1.2 }}>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": { fontWeight: 950 },
              "& .MuiTabs-indicator": { height: 4, borderRadius: 99 },
            }}
          >
            <Tab label="All" />
            <Tab label={`Unread (${unreadCount})`} />
          </Tabs>
        </CardContent>
      </SoftCard>

      {/* ✅ List */}
      <SoftCard>
        <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
          {loading ? (
            <Stack spacing={1.4}>
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid rgba(226,232,240,0.9)",
                    boxShadow: "none",
                  }}
                >
                  <Stack direction="row" spacing={1.6} alignItems="center">
                    <Skeleton variant="circular" width={46} height={46} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton height={18} width="40%" />
                      <Skeleton height={16} width="70%" />
                    </Box>
                    <Skeleton height={26} width={90} sx={{ borderRadius: 99 }} />
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 950, fontSize: 18 }}>
                No notifications 😄
              </Typography>
              <Typography sx={{ mt: 0.7, color: "text.secondary", fontWeight: 800 }}>
                You're all caught up ✅
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.6}>
              {filtered.map((n) => {
                const meta = typeMeta(n.type);
                const isUnread = !n.isRead;

                return (
                  <Card
                    key={n._id}
                    sx={{
                      borderRadius: 4,
                      boxShadow: "none",
                      border: `1px solid ${
                        isUnread ? alpha("#2563eb", 0.35) : "rgba(226,232,240,0.95)"
                      }`,
                      bgcolor: isUnread ? alpha("#2563eb", 0.04) : "transparent",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 18px 45px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.2 }}>
                      <Stack direction="row" justifyContent="space-between" gap={2}>
                        {/* left */}
                        <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              fontWeight: 950,
                              bgcolor: alpha("#0f172a", 0.05),
                              border: `1px solid ${alpha("#0f172a", 0.08)}`,
                            }}
                          >
                            {meta.icon}
                          </Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                              {isUnread && (
                                <Chip size="small" color="primary" label="Unread" sx={{ fontWeight: 950 }} />
                              )}

                              <Chip
                                size="small"
                                label={meta.label}
                                color={meta.color}
                                variant="outlined"
                                sx={{ fontWeight: 950 }}
                              />

                              <Typography sx={{ fontSize: 12, color: COLORS.muted, fontWeight: 900 }}>
                                {timeAgo(n.createdAt)}
                              </Typography>
                            </Stack>

                            <Typography sx={{ mt: 0.9, fontWeight: 950, fontSize: 16 }} noWrap>
                              {n.title || "Notification"}
                            </Typography>

                            <Typography sx={{ mt: 0.3, color: COLORS.text, fontWeight: 700 }}>
                              {n.message || "—"}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* actions */}
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          {!n.isRead && (
                            <Tooltip title="Mark as read">
                              <IconButton
                                onClick={() => handleMarkRead(n._id)}
                                sx={{
                                  borderRadius: 3,
                                  border: `1px solid ${alpha("#2563eb", 0.25)}`,
                                }}
                              >
                                <MarkEmailReadOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(n._id)}
                              sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha("#e11d48", 0.25)}`,
                              }}
                            >
                              <DeleteOutlineIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </SoftCard>
    </Box>
  );
};

export default NotificationsPage;
