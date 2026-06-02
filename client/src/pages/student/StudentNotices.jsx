import { useEffect, useState } from "react";
import { Bell, AlertTriangle, Info, Megaphone, Globe, Building2, Users, Loader } from "lucide-react";
import api from "../../api/axios";

const TYPE_CONFIG = {
  info:    { label: "Info",    icon: Info,          cls: "bg-blue-500/10  text-blue-400  border-blue-500/20"  },
  warning: { label: "Warning", icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  urgent:  { label: "Urgent",  icon: Megaphone,     cls: "bg-red-500/10   text-red-400   border-red-500/20"   },
};
const SCOPE_ICON = { global: Globe, institute: Building2, class: Users };
const SCOPE_LABEL = { global: "Platform", institute: "School", class: "Class" };

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function NoticeCard({ notice }) {
  const cfg   = TYPE_CONFIG[notice.type] || TYPE_CONFIG.info;
  const Icon  = cfg.icon;
  const SIcon = SCOPE_ICON[notice.scope] || Globe;

  return (
    <div className={`card border ${cfg.cls} space-y-2`}>
      <div className="flex items-center gap-2">
        <Icon size={15} className="shrink-0" />
        <span className="text-sm font-semibold text-slate-100 flex-1 truncate">{notice.title}</span>
        <span className={`badge text-xs shrink-0 ${cfg.cls} border`}>{cfg.label}</span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{notice.content}</p>
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <SIcon size={11} />
          {SCOPE_LABEL[notice.scope]}
          {notice.className && ` · ${notice.className}`}
        </span>
        <span>By {notice.authorName}</span>
        <span className="ml-auto">{fmtDate(notice.createdAt)}</span>
      </div>
    </div>
  );
}

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    api.get("/notices/student")
      .then(({ data }) => setNotices(data))
      .finally(() => setLoading(false));
  }, []);

  const TABS = [
    { key: "all",       label: "All"      },
    { key: "urgent",    label: "Urgent"   },
    { key: "warning",   label: "Warning"  },
    { key: "info",      label: "Info"     },
  ];

  const filtered = filter === "all" ? notices : notices.filter((n) => n.type === filter);

  // Group by scope for better readability
  const urgent   = filtered.filter((n) => n.type === "urgent");
  const rest     = filtered.filter((n) => n.type !== "urgent");
  const ordered  = filter === "all" ? [...urgent, ...rest] : filtered;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Notice Board</h1>
        <p className="page-sub">Notices from your school, teachers, and the platform.</p>
      </div>

      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === t.key ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600" />
        </div>
      ) : ordered.length === 0 ? (
        <div className="card py-16 text-center">
          <Bell size={30} className="empty-icon mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-400">No notices</p>
          <p className="text-xs text-slate-600 mt-1">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordered.map((n) => <NoticeCard key={n._id} notice={n} />)}
        </div>
      )}
    </div>
  );
}
