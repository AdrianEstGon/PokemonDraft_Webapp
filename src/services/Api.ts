import axios from "axios";
import { API_BASE_URL } from "../utils/config";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔹 Interceptor para añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
