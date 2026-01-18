import axiosInstance from "./axiosinstance";

// ✅ BACKEND: GET /groups/:groupId/balance
export const getGroupBalanceAPI = (groupId) =>
  axiosInstance.get(`/groups/${groupId}/balance`);
