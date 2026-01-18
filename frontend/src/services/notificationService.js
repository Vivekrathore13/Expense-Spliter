import axiosInstance from "./axiosinstance.js";

// ✅ GET All notifications
export const getNotifications = async () => {
  const res = await axiosInstance.get("/notifications");
  return res.data?.data || [];
};

// ✅ GET unread count (for bell badge)
export const getUnreadCount = async () => {
  const res = await axiosInstance.get("/notifications/unread-count");
  return res.data?.data?.count ?? 0;
};

// ✅ Mark single read
export const markAsRead = async (notificationId) => {
  const res = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return res.data?.data;
};

// ✅ Mark all read
export const markAllAsRead = async () => {
  const res = await axiosInstance.patch("/notifications/read-all");
  return res.data?.data;
};

// ✅ Delete notification
export const deleteOneNotification = async (notificationId) => {
  const res = await axiosInstance.delete(`/notifications/${notificationId}`);
  return res.data?.data;
};
