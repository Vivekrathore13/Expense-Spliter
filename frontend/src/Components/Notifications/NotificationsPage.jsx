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
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteOneNotification,
} from "../../services/notificationService";
import { timeAgo } from "../../services/timeAgo";

const NotificationsPage = () => {
  const [tab, setTab] = useState(0); // 0 all, 1 unread
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      console.log("✅ NOTIFS API DATA:", data); // debug
      setList(data);
    } catch (err) {
      console.log("❌ Notifications load error:", err);
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
    if (tab === 1) return list.filter((n) => !n.isRead);
    return list;
  }, [tab, list]);

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

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unread: {unreadCount}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAll}
          disabled={unreadCount === 0}
        >
          Mark all read
        </Button>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="All" />
          <Tab label={`Unread (${unreadCount})`} />
        </Tabs>
      </Box>

      <Divider sx={{ my: 2 }} />

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography sx={{ mt: 4 }} color="text.secondary">
          No notifications ✅
        </Typography>
      ) : (
        <Stack spacing={2}>
          {filtered.map((n) => (
            <Card
              key={n._id}
              sx={{
                borderRadius: 3,
                boxShadow: "none",
                border: n.isRead ? "1px solid #eee" : "1px solid #1976d2",
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" gap={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {!n.isRead && (
                        <Chip size="small" color="primary" label="Unread" />
                      )}
                      <Chip
                        size="small"
                        variant="outlined"
                        label={n.type || "INFO"}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        {timeAgo(n.createdAt)}
                      </Typography>
                    </Stack>

                    <Typography sx={{ mt: 1 }} fontWeight={700}>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {n.message}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    {!n.isRead && (
                      <IconButton onClick={() => handleMarkRead(n._id)}>
                        <MarkEmailReadOutlinedIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleDelete(n._id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationsPage;
