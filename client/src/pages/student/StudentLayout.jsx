import { Outlet } from "react-router-dom";
import { LayoutDashboard, FlaskConical, BookOpen, FileText, BarChart3, Award } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";

const NAV = [
  { to: "/student",              icon: LayoutDashboard, label: "Dashboard",   exact: true },
  { to: "/student/experiments",  icon: FlaskConical,    label: "Experiments"              },
  { to: "/student/books",        icon: BookOpen,        label: "Books"                    },
  { to: "/student/exams",        icon: FileText,        label: "Exams"                    },
  { to: "/student/results",      icon: BarChart3,       label: "Results"                  },
  { to: "/student/certificate",  icon: Award,           label: "Certificate"              },
];

export default function StudentLayout() {
  return (
    <DashboardShell navItems={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
