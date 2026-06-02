import { Outlet } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Library, FlaskConical, FileText, Award, BarChart3, Bell, Settings } from "lucide-react";
import DashboardShell from "../../components/layout/DashboardShell";


const NAV = [
  { to: "/superadmin",              icon: LayoutDashboard, label: "Dashboard",   exact: true },
  { to: "/superadmin/institutes",   icon: Building2,       label: "Institutes"               },
  { to: "/superadmin/users",        icon: Users,           label: "Users"                    },
  { to: "/superadmin/content",      icon: Library,         label: "Content"                  },
  { to: "/superadmin/experiments",  icon: FlaskConical,    label: "Experiments"              },
  { to: "/superadmin/exams",        icon: FileText,        label: "Exams"                    },
  { to: "/superadmin/certificates", icon: Award,           label: "Certificates"             },
  { to: "/superadmin/notices",      icon: Bell,            label: "Notices"                  },
  { to: "/superadmin/reports",      icon: BarChart3,       label: "Reports"                  },
  { to: "/superadmin/settings",     icon: Settings,        label: "Settings"                 },
];

export default function SuperAdminLayout() {
  return (
    <DashboardShell navItems={NAV}>
      <Outlet />
    </DashboardShell>
  );
}
