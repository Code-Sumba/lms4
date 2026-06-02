import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, Phone, Mail, Hash, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore";

function Avatar({ name, color, size = "md" }) {
  const initials = name?.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("") || "U";
  const cls = size === "lg"
    ? "w-14 h-14 text-lg rounded-xl"
    : size === "sm"
    ? "w-6 h-6 text-2xs rounded"
    : "w-8 h-8 text-xs rounded";
  return (
    <div
      className={`${cls} flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ background: color || "#2563eb" }}
    >
      {initials}
    </div>
  );
}

/* ── Mobile profile drawer ── */
function ProfileDrawer({ user, onClose, onLogout }) {
  const ROLE_COLOR = {
    superadmin: "#6366f1", admin: "#3b82f6",
    teacher: "#f97316",   student: "#22c55e",
  };
  const roleColor = ROLE_COLOR[user?.role] || "#6366f1";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={onClose} />

      {/* Drawer — slides up from bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-bg-2 rounded-t-2xl shadow-modal"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-border">
          <span className="text-sm font-semibold text-slate-200">My Profile</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Profile content */}
        <div className="px-5 py-5 space-y-5">

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <Avatar name={user?.fullName} color={user?.avatarColor} size="lg" />
            <div className="min-w-0">
              <div className="text-base font-bold text-slate-100 leading-tight truncate">
                {user?.fullName}
              </div>
              <span className="inline-flex items-center gap-1 mt-1 text-2xs font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{ background: roleColor + "22", color: roleColor }}>
                <Shield size={10} /> {user?.role}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            {user?.email && (
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs text-slate-600 mb-0.5">Email</div>
                  <div className="text-xs text-slate-300 truncate">{user.email}</div>
                </div>
              </div>
            )}

            {user?.phone && (
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs text-slate-600 mb-0.5">Phone</div>
                  <div className="text-xs text-slate-300">{user.phone}</div>
                </div>
              </div>
            )}

            {user?.rollNumber && (
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
                  <Hash size={14} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xs text-slate-600 mb-0.5">Roll Number</div>
                  <div className="text-xs text-slate-300">{user.rollNumber}</div>
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-red-muted border border-red/20 text-red-light text-sm font-semibold
                       hover:bg-red/20 transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

export default function DashboardShell({ navItems, children, title, actions }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-56 flex-shrink-0
        flex flex-col bg-bg-2 border-r border-surface-border
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-12 flex items-center gap-2.5 px-4 border-b border-surface-border flex-shrink-0">
          <div className="w-6 h-6 rounded bg-blue flex items-center justify-center text-white font-bold text-2xs flex-shrink-0">M</div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 leading-none truncate">Motion Robotics</div>
            <div className="text-2xs text-slate-600 mt-0.5">LMS Platform</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-500 hover:text-slate-200">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors duration-100 ${
                    isActive
                      ? "bg-blue-muted text-slate-200 font-medium"
                      : "text-slate-500 hover:text-slate-300 hover:bg-surface"
                  }`
                }>
                {Icon && <Icon size={15} className="flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-surface-border p-2 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-surface transition-colors group">
            <Avatar name={user?.fullName} color={user?.avatarColor} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate leading-none mb-0.5">{user?.fullName}</div>
              <div className="text-2xs text-slate-600 capitalize">{user?.role}</div>
            </div>
            <button onClick={handleLogout}
              className="text-slate-600 hover:text-red-light transition-colors opacity-0 group-hover:opacity-100"
              title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-12 flex items-center gap-3 px-4 border-b border-surface-border bg-bg flex-shrink-0">
          {/* Hamburger — mobile only */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-200 transition-colors">
            <Menu size={18} />
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-slate-200 truncate">{title}</span>
          </div>

          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}

          {/* Profile avatar button — mobile only */}
          <button
            onClick={() => setProfileOpen(true)}
            className="lg:hidden flex-shrink-0 focus:outline-none"
            aria-label="Open profile"
          >
            <Avatar name={user?.fullName} color={user?.avatarColor} size="sm" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-24 lg:pb-5">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-2 border-t border-surface-border flex items-stretch h-16"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors duration-100
                 ${isActive ? "text-blue" : "text-slate-500 hover:text-slate-300"}`
              }>
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-6 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-blue-muted" : ""}`}>
                    {Icon && <Icon size={18} />}
                  </div>
                  <span className="truncate max-w-full px-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Mobile profile drawer ── */}
      {profileOpen && (
        <ProfileDrawer
          user={user}
          onClose={() => setProfileOpen(false)}
          onLogout={() => { setProfileOpen(false); handleLogout(); }}
        />
      )}
    </div>
  );
}
