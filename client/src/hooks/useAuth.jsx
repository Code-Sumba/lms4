import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export function ProtectedRoute({ children, roles }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user } = useAuthStore();
  if (user) {
    const map = { superadmin: "/superadmin", admin: "/admin", teacher: "/teacher", student: "/student" };
    return <Navigate to={map[user.role] || "/"} replace />;
  }
  return children;
}
