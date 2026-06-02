import { Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, Library, FlaskConical, FileText, Bell, BarChart3, Award, Settings } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";

const NAV = [
  { to: "/student",               icon: LayoutDashboard, label: "Dashboard",   exact: true },
  { to: "/student/classes",       icon: BookOpen,        label: "My Classes"               },
  { to: "/student/content",       icon: Library,         label: "Content"                  },
  { to: "/student/experiments",   icon: FlaskConical,    label: "Experiments"              },
  { to: "/student/exams",         icon: FileText,        label: "Exams"                    },
  { to: "/student/notices",       icon: Bell,            label: "Notices"                  },
  { to: "/student/results",       icon: BarChart3,       label: "Results"                  },
  { to: "/student/certificate",   icon: Award,           label: "Certificate"              },
  { to: "/student/settings",      icon: Settings,        label: "Settings"                 },
];

export default function StudentLayout() {
  return (
    <DashboardShell navItems={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
