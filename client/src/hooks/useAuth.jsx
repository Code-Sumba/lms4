import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export function ProtectedRoute({ children, roles }) {
  const { user, hydrated } = useAuthStore();
  const location = useLocation();

  // Don't redirect until the store has finished hydrating from localStorage.
  // Prevents the HMR / initial-mount flicker where user is briefly null.
  if (!hydrated) return null;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, hydrated } = useAuthStore();

  if (!hydrated) return null;

  if (user) {
    const map = { superadmin: "/superadmin", admin: "/admin", teacher: "/teacher", student: "/student" };
    return <Navigate to={map[user.role] || "/"} replace />;
  }
  return children;
}
