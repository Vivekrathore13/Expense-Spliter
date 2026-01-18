import React, { useEffect, useState } from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useNavigate } from "react-router-dom";
import { getUnreadCount } from "../../services/notificationService";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const loadCount = async () => {
    try {
      const c = await getUnreadCount(); // ✅ GET /notifications/unread-count
      setCount(c);
    } catch (err) {
      setCount(0);
    }
  };

  useEffect(() => {
    loadCount();

    // ✅ poll every 15 sec
    const interval = setInterval(loadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tooltip title="Notifications">
      <IconButton onClick={() => navigate("/notifications")}>
        <Badge badgeContent={count} color="error">
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
