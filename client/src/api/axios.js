// src/api/axios.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token"); // your auth token key
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // it's okay: log so you know why 401/403 happen
        console.log("[AXIOS] no token in localStorage");
      }
    } catch (err) {
      console.error("[AXIOS] token read error:", err);
    }
    console.log("[AXIOS] Request:", config.method?.toUpperCase(), config.url, config.params || config.data || "");
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => {
    console.log("[AXIOS] Response:", res.status, res.config.url);
    return res;
  },
  (err) => {
    console.error("[AXIOS] Response error:", err.response?.status, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
