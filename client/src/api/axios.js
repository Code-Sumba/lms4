import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Remove BOTH keys so GuestRoute doesn't see a stale user and
      // redirect back, which is what caused the infinite redirect loop.
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only navigate if we're not already on /login to prevent loops.
      // Use replace() so no extra history entry is added.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
