import { Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, GraduationCap, Users, Library, FileText, Bell, BarChart3, Settings } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";

const NAV = [
  { to: "/admin",           icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/classes",   icon: BookOpen,        label: "Classes"               },
  { to: "/admin/teachers",  icon: Users,           label: "Teachers"              },
  { to: "/admin/students",  icon: GraduationCap,   label: "Students"              },
  { to: "/admin/courses",   icon: Library,         label: "Courses"               },
  { to: "/admin/exams",     icon: FileText,        label: "Exams"                 },
  { to: "/admin/notices",   icon: Bell,            label: "Notices"               },
  { to: "/admin/reports",   icon: BarChart3,       label: "Reports"               },
  { to: "/admin/settings",  icon: Settings,        label: "Settings"              },
];

export default function AdminLayout() {
  return (
    <DashboardShell navItems={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
