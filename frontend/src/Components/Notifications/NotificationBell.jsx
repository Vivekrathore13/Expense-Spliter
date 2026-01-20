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
      const c = await getUnreadCount();
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

  const displayCount = count > 99 ? "99+" : count;

  return (
    <Tooltip title="Notifications">
      <IconButton
        onClick={() => navigate("/notifications")}
        sx={{
          width: 42,
          height: 42,
          borderRadius: 3,
          bgcolor: alpha("#0f172a", 0.04),
          border: `1px solid ${alpha("#0f172a", 0.08)}`,
          boxShadow: "0 12px 22px rgba(2,6,23,0.06)",
          transition: "0.18s",
          flexShrink: 0,
          "&:hover": {
            bgcolor: alpha("#0f172a", 0.06),
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0px)" },
        }}
      >
        <Badge
          badgeContent={displayCount}
          color="error"
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              fontWeight: 900,
              fontSize: 11,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              border: "2px solid white",
              boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
              px: 0.6,
            },
          }}
        >
          <NotificationsNoneOutlinedIcon
            sx={{
              fontSize: 24,
              color: alpha("#0f172a", 0.78),
            }}
          />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
