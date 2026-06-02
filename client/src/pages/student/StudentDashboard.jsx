import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, BookOpen, FileText, TrendingUp, ArrowRight } from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ done: 0, books: 0, exams: 0, progress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { label: "My Classes",       value: stats.classes,  icon: BookOpen,     to: "/student/classes",     color: "text-blue-light"  },
    { label: "Experiments Done", value: stats.done,     icon: FlaskConical, to: "/student/experiments", color: "text-purple-400"  },
    { label: "Exams Taken",      value: stats.exams,    icon: FileText,     to: "/student/results",     color: "text-amber-light" },
    { label: "Level Progress",   value: `${stats.progress}%`, icon: TrendingUp, to: "/student/classes", color: "text-green-light" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.fullName}. Keep up the great work.</p>
      </div>

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

      <div className="card">
        <div className="empty-state py-10">
          <FlaskConical size={24} className="empty-icon" />
          <p className="empty-title">No experiments unlocked yet</p>
          <p className="empty-desc">Your teacher will unlock experiments for your class. Check back soon.</p>
        </div>
      </div>
    </div>
  );
}
