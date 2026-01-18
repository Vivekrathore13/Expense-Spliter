import React, { useEffect, useRef, useState } from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useNavigate } from "react-router-dom";
import { getUnreadCount } from "../../services/notificationService";
import { alpha } from "@mui/material/styles";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const intervalRef = useRef(null);

  const loadCount = async () => {
    try {
      const c = await getUnreadCount(); // ✅ GET /notifications/unread-count
      setCount(Number(c || 0));
    } catch (err) {
      setCount(0);
    }
  };

  useEffect(() => {
    loadCount();

    // ✅ poll every 15 sec
    intervalRef.current = setInterval(loadCount, 15000);

    // ✅ refresh when user comes back to tab
    const onFocus = () => loadCount();
    window.addEventListener("focus", onFocus);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <Tooltip title="Notifications">
      <IconButton
        onClick={() => navigate("/notifications")}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha("#0f172a", 0.10)}`,
          bgcolor: alpha("#ffffff", 0.55),
          "&:hover": { bgcolor: alpha("#ffffff", 0.70) },
        }}
      >
        <Badge
          badgeContent={count}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 900,
              boxShadow: "0 10px 25px rgba(0,0,0,0.20)",
            },
          }}
        >
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
