import axiosInstance from "./axiosinstance";

// ✅ BACKEND: GET /notifications
export const getNotificationsAPI = () => axiosInstance.get("/notifications");
