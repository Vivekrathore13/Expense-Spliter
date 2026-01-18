import axiosInstance from "./axiosinstance";

export const getMyGroupsAPI = () => axiosInstance.get("/group/my");

export const createGroupAPI = (payload) =>
  axiosInstance.post("/group/create", payload);

// ✅ NEW: send invite
export const sendInviteAPI = (groupId, payload) =>
  axiosInstance.post(`/group/${groupId}/invite`, payload);
