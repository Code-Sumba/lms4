import { Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, Library, FlaskConical, FileText, Bell, BarChart3, Settings } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";

const NAV = [
  { to: "/teacher",               icon: LayoutDashboard, label: "Dashboard",   exact: true },
  { to: "/teacher/classes",       icon: BookOpen,        label: "My Classes"               },
  { to: "/teacher/content",       icon: Library,         label: "Content"                  },
  { to: "/teacher/experiments",   icon: FlaskConical,    label: "Experiments"              },
  { to: "/teacher/exams",         icon: FileText,        label: "Exams"                    },
  { to: "/teacher/notices",       icon: Bell,            label: "Notices"                  },
  { to: "/teacher/reports",       icon: BarChart3,       label: "Reports"                  },
  { to: "/teacher/settings",      icon: Settings,        label: "Settings"                 },
];

export default function TeacherLayout() {
  return (
    <DashboardShell navItems={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
