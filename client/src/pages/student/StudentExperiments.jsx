import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, CheckCircle, Clock, Lock, ChevronRight, Loader } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};
const LEVEL_BG = {
  1: "from-orange-600 to-orange-800", 2: "from-yellow-600 to-yellow-800",
  3: "from-green-600 to-green-800",  4: "from-blue-600 to-blue-800",
  5: "from-purple-600 to-purple-800", 6: "from-pink-600 to-pink-800",
};

function StatusBadge({ status }) {
  const map = {
    approved: { cls: "bg-green-500/15 text-green-400 border-green-500/20", icon: <CheckCircle size={11} />, label: "Approved" },
    pending:  { cls: "bg-amber-500/15 text-amber-400 border-amber-500/20",  icon: <Clock size={11} />,       label: "Pending"  },
    rejected: { cls: "bg-red-500/15   text-red-400   border-red-500/20",    icon: null,                      label: "Rejected" },
    available:{ cls: "bg-blue-500/15  text-blue-400  border-blue-500/20",   icon: <ChevronRight size={11} />,label: "Available"},
    locked:   { cls: "bg-slate-700/50 text-slate-500 border-slate-700",     icon: <Lock size={11} />,        label: "Locked"   },
  };
  const cfg = map[status] || map.locked;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export default function StudentExperiments() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all"); // all | available | approved | pending

  useEffect(() => {
    api.get("/student/experiments")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader size={24} className="animate-spin text-slate-600" />
    </div>
  );

  if (!data || !data.experiments?.length) return (
    <div className="space-y-4">
      <h1 className="page-title">Experiments</h1>
      <div className="card">
        <div className="empty-state py-16">
          <FlaskConical size={30} className="empty-icon" />
          <p className="empty-title">No experiments yet</p>
          <p className="empty-desc">Enrol in a class to access experiments for your level.</p>
        </div>
      </div>
    </div>
  );

  const { level, className: clsName, experiments, stats } = data;
  const lvlColor = LEVEL_COLORS[level] || "#6366f1";
  const lvlBg    = LEVEL_BG[level]    || "from-indigo-600 to-indigo-800";

  const tabs = [
    { key: "all",       label: "All"       },
    { key: "available", label: "Available" },
    { key: "pending",   label: "Pending"   },
    { key: "approved",  label: "Approved"  },
    { key: "locked",    label: "Locked"    },
  ];

  const filtered = filter === "all" ? experiments : experiments.filter((e) => e.status === filter);
  const pct      = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Level banner */}
      <div className={`rounded-xl p-4 bg-gradient-to-r ${lvlBg} text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium opacity-70 mb-1">Assigned Level</div>
            <h1 className="text-xl font-bold">Level {level}: {LEVEL_LABELS[level]}</h1>
            {clsName && <p className="text-sm opacity-70 mt-0.5">{clsName}</p>}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Your Progress</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400 font-medium">{stats.approved} Approved</span>
            <span className="text-amber-400 font-medium">{stats.pending} Pending</span>
            <span className="text-slate-500">{stats.remaining} Remaining</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{stats.approved} of {stats.total} experiments completed</span>
          <span className="font-medium text-slate-300">{pct}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === t.key ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Experiment list */}
      <div className="space-y-1">
        <div className="text-xs text-slate-500 mb-2">
          Experiments &amp; Video Tutorials · {experiments.filter((e) => e.unlocked).length} unlocked by your teacher
        </div>
        {filtered.length === 0 ? (
          <div className="card py-10 text-center">
            <p className="text-sm text-slate-500">No experiments in this category.</p>
          </div>
        ) : (
          filtered.map((exp) => (
            <button key={exp._id}
              disabled={exp.status === "locked"}
              onClick={() => navigate(`/student/experiments/${exp._id}`)}
              className={`w-full card text-left flex items-center gap-4 hover:border-border-2 transition-colors group
                ${exp.status === "locked" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0`}
                style={{ background: lvlColor + "22", color: lvlColor }}>
                {exp.expNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200 truncate">
                    EXP {exp.expNumber}: {exp.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={11} />{exp.duration} min
                  </span>
                  {exp.description && (
                    <span className="text-xs text-slate-600 truncate">{exp.description}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={exp.status} />
                {exp.status !== "locked" && (
                  <ChevronRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
