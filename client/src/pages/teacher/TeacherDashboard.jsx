import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Clock, CheckSquare, ArrowRight } from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ classes: 0, students: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teacher/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { label: "My Classes",        value: stats.classes,  icon: BookOpen,    to: "/teacher/classes",   color: "text-blue-light"  },
    { label: "My Students",       value: stats.students, icon: Users,       to: "/teacher/classes",   color: "text-green-light" },
    { label: "Pending Approvals", value: stats.pending,  icon: Clock,       to: "/teacher/approvals", color: "text-amber-light" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.fullName}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      <div className="card">
        <div className="empty-state py-10">
          <CheckSquare size={24} className="empty-icon" />
          <p className="empty-title">No pending approvals</p>
          <p className="empty-desc">Student experiment submissions awaiting review will appear here.</p>
        </div>
      </div>
    </div>
  );
}
