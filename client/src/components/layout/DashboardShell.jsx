import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, ChevronRight } from "lucide-react";
import useAuthStore from "../../store/authStore";

function Avatar({ name, color, size = "md" }) {
  const initials = name?.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "U";
  const cls = size === "sm"
    ? "w-6 h-6 text-2xs"
    : "w-8 h-8 text-xs";
  return (
    <div
      className={`${cls} rounded flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ background: color || "#2563eb" }}
    >
      {initials}
    </div>
  );
}

export default function DashboardShell({ navItems, children, title, actions }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-56 flex-shrink-0
        flex flex-col bg-bg-2 border-r border-surface-border
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo */}
        <div className="h-12 flex items-center gap-2.5 px-4 border-b border-surface-border flex-shrink-0">
          <div className="w-6 h-6 rounded bg-blue flex items-center justify-center text-white font-bold text-2xs flex-shrink-0">M</div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 leading-none truncate">Motion Robotics</div>
            <div className="text-2xs text-slate-600 mt-0.5">LMS Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors duration-100 ${
                    isActive
                      ? "bg-blue-muted text-slate-200 font-medium"
                      : "text-slate-500 hover:text-slate-300 hover:bg-surface"
                  }`
                }
              >
                {Icon && <Icon size={15} className="flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-surface-border p-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface transition-colors group">
            <Avatar name={user?.fullName} color={user?.avatarColor} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate leading-none mb-0.5">{user?.fullName}</div>
              <div className="text-2xs text-slate-600 capitalize">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-red-light transition-colors opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-12 flex items-center gap-3 px-4 border-b border-surface-border bg-bg flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-200 transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-slate-200 truncate">{title}</span>
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
