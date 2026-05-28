import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./hooks/useAuth.jsx";

// Public
import LandingPage from "./pages/landing/LandingPage";
import LoginPage   from "./pages/auth/LoginPage";

// SuperAdmin
import SuperAdminLayout    from "./pages/superadmin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import Institutes          from "./pages/superadmin/Institutes";
import SAUsers             from "./pages/superadmin/Users";

// Admin
import AdminLayout    from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Teacher
import TeacherLayout    from "./pages/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

// Student
import StudentLayout    from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

        {/* SuperAdmin — nested layout */}
        <Route path="/superadmin" element={<ProtectedRoute roles={["superadmin"]}><SuperAdminLayout /></ProtectedRoute>}>
          <Route index            element={<SuperAdminDashboard />} />
          <Route path="institutes" element={<Institutes />} />
          <Route path="users"      element={<SAUsers />} />
          {/* More pages added each phase */}
        </Route>

        {/* Admin — nested layout */}
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Teacher — nested layout */}
        <Route path="/teacher" element={<ProtectedRoute roles={["teacher"]}><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<TeacherDashboard />} />
        </Route>

        {/* Student — nested layout */}
        <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
