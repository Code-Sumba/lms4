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
import SAContent           from "./pages/superadmin/Content";
import SAExperiments       from "./pages/superadmin/Experiments";
import SAExams             from "./pages/superadmin/Exams";
import SACertificates      from "./pages/superadmin/Certificates";
import SANotices           from "./pages/superadmin/SuperAdminNotices";
import SAReports           from "./pages/superadmin/SuperAdminReports";
import SASettings          from "./pages/superadmin/SuperAdminSettings";

// Admin
import AdminLayout    from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClasses   from "./pages/admin/AdminClasses";
import AdminTeachers  from "./pages/admin/AdminTeachers";
import AdminStudents  from "./pages/admin/AdminStudents";
import AdminCourses   from "./pages/admin/AdminCourses";
import AdminExams     from "./pages/admin/AdminExams";
import AdminNotices  from "./pages/admin/AdminNotices";
import AdminReports   from "./pages/admin/AdminReports";
import AdminSettings  from "./pages/admin/AdminSettings";

// Teacher
import TeacherLayout      from "./pages/teacher/TeacherLayout";
import TeacherDashboard   from "./pages/teacher/TeacherDashboard";
import TeacherClasses     from "./pages/teacher/TeacherClasses";
import TeacherContent     from "./pages/teacher/TeacherContent";
import TeacherExperiments from "./pages/teacher/TeacherExperiments";
import TeacherExams       from "./pages/teacher/TeacherExams";
import TeacherNotices     from "./pages/teacher/TeacherNotices";
import TeacherReports     from "./pages/teacher/TeacherReports";
import TeacherSettings    from "./pages/teacher/TeacherSettings";

// Student
import StudentLayout              from "./pages/student/StudentLayout";
import StudentDashboard           from "./pages/student/StudentDashboard";
import StudentClasses             from "./pages/student/StudentClasses";
import StudentContent             from "./pages/student/StudentContent";
import StudentExperiments         from "./pages/student/StudentExperiments";
import StudentExperimentDetail    from "./pages/student/StudentExperimentDetail";
import StudentExams               from "./pages/student/StudentExams";
import StudentNotices             from "./pages/student/StudentNotices";
import StudentResults             from "./pages/student/StudentResults";
import StudentCertificate         from "./pages/student/StudentCertificate";
import StudentSettings            from "./pages/student/StudentSettings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

        {/* SuperAdmin */}
        <Route path="/superadmin" element={<ProtectedRoute roles={["superadmin"]}><SuperAdminLayout /></ProtectedRoute>}>
          <Route index                element={<SuperAdminDashboard />} />
          <Route path="institutes"    element={<Institutes />} />
          <Route path="users"         element={<SAUsers />} />
          <Route path="content"       element={<SAContent />} />
          <Route path="experiments"   element={<SAExperiments />} />
          <Route path="exams"         element={<SAExams />} />
          <Route path="certificates"  element={<SACertificates />} />
          <Route path="notices"       element={<SANotices />} />
          <Route path="reports"       element={<SAReports />} />
          <Route path="settings"      element={<SASettings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index             element={<AdminDashboard />} />
          <Route path="classes"    element={<AdminClasses />} />
          <Route path="teachers"   element={<AdminTeachers />} />
          <Route path="students"   element={<AdminStudents />} />
          <Route path="courses"    element={<AdminCourses />} />
          <Route path="exams"      element={<AdminExams />} />
          <Route path="notices"    element={<AdminNotices />} />
          <Route path="reports"    element={<AdminReports />} />
          <Route path="settings"   element={<AdminSettings />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute roles={["teacher"]}><TeacherLayout /></ProtectedRoute>}>
          <Route index           element={<TeacherDashboard />} />
          <Route path="classes"  element={<TeacherClasses />} />
          <Route path="content"      element={<TeacherContent />} />
          <Route path="experiments"  element={<TeacherExperiments />} />
          <Route path="exams"        element={<TeacherExams />} />
          <Route path="notices"      element={<TeacherNotices />} />
          <Route path="reports"      element={<TeacherReports />} />
          <Route path="settings"     element={<TeacherSettings />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentLayout /></ProtectedRoute>}>
          <Route index               element={<StudentDashboard />} />
          <Route path="classes"      element={<StudentClasses />} />
          <Route path="content"          element={<StudentContent />} />
          <Route path="experiments"      element={<StudentExperiments />} />
          <Route path="experiments/:id"  element={<StudentExperimentDetail />} />
          <Route path="exams"            element={<StudentExams />} />
          <Route path="notices"          element={<StudentNotices />} />
          <Route path="results"          element={<StudentResults />} />
          <Route path="certificate"  element={<StudentCertificate />} />
          <Route path="settings"     element={<StudentSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
