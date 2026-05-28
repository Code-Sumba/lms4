import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, FlaskConical, Award, ArrowRight, TrendingUp } from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ institutes: 0, users: 0, experiments: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/superadmin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { label: "Institutes",    value: stats.institutes,   icon: Building2,    to: "/superadmin/institutes",  color: "text-blue-light"  },
    { label: "Total Users",   value: stats.users,        icon: Users,        to: "/superadmin/users",       color: "text-purple-400"  },
    { label: "Experiments",   value: stats.experiments,  icon: FlaskConical, to: "/superadmin/experiments", color: "text-amber-light" },
    { label: "Certificates",  value: stats.certificates, icon: Award,        to: "/superadmin/certificates",color: "text-green-light" },
  ];

  const QUICK = [
    { label: "Add Institute",     desc: "Register a new school",         to: "/superadmin/institutes", icon: Building2   },
    { label: "Manage Users",      desc: "View and manage all accounts",   to: "/superadmin/users",      icon: Users       },
    { label: "Add Experiment",    desc: "Upload to the content library",  to: "/superadmin/experiments",icon: FlaskConical},
    { label: "Issue Certificate", desc: "Award a level certificate",      to: "/superadmin/certificates",icon: Award      },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.fullName}.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.label} onClick={() => navigate(s.to)}
              className="card text-left hover:border-border-2 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <Icon size={16} className={`${s.color} opacity-70`} />
                <ArrowRight size={13} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <div className="text-2xl font-semibold text-slate-100">
                {loading ? <span className="w-8 h-5 bg-surface-2 rounded animate-pulse inline-block" /> : s.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <button key={q.label} onClick={() => navigate(q.to)}
                className="card text-left hover:border-border-2 transition-colors group flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-surface-2 flex items-center justify-center flex-shrink-0 group-hover:bg-bg-3 transition-colors">
                  <Icon size={15} className="text-slate-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-200">{q.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{q.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity placeholder */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Recent activity</h2>
        <div className="card">
          <div className="empty-state py-10">
            <TrendingUp size={24} className="empty-icon" />
            <p className="empty-title">No recent activity</p>
            <p className="empty-desc">Activity across institutes will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
