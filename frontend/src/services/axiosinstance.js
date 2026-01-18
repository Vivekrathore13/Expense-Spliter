import axios from "axios";


const BASE_URL = "http://localhost:5000/api";

// axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // cookies / refresh token ke liye
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // optional global error handling
    if (error.response?.status === 401) {
      console.log("Unauthorized – login again");
      // localStorage.clear();
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;