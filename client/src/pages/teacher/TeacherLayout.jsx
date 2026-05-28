import { Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, CheckSquare, BarChart3 } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";

const NAV = [
  { to: "/teacher",           icon: LayoutDashboard, label: "Dashboard",  exact: true },
  { to: "/teacher/classes",   icon: BookOpen,        label: "My Classes"              },
  { to: "/teacher/approvals", icon: CheckSquare,     label: "Approvals"               },
  { to: "/teacher/reports",   icon: BarChart3,       label: "Reports"                 },
];

export default function TeacherLayout() {
  return (
    <DashboardShell navItems={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
