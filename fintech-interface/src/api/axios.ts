/**
 * Axios instance with JWT interceptor.
 *
 * - Reads token from localStorage on every request
 * - Auto-attaches "Authorization: Bearer <token>" header
 * - On 401 response → clears auth state and redirects to /login
 */
import axios from "axios";

const api = axios.create({
  baseURL: "/api",            // proxied in dev, served directly in prod
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

/* ── Request interceptor: attach JWT ── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("globepay-token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ── Response interceptor: handle 401 (expired / invalid token) ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — force logout
      localStorage.removeItem("globepay-token");
      localStorage.removeItem("globepay-user");

      // Redirect to login (works for both SPA and SSR)
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
