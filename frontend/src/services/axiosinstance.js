import axios from "axios";

// ✅ Vite env (vercel)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized – login again");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
