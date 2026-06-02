import { useEffect, useState } from "react";
import { BookOpen, Video, FileText, ExternalLink, Loader } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};
const TYPE_CONFIG = {
  book:      { label: "Book",      icon: BookOpen, color: "text-blue-light",  bg: "bg-blue-muted"    },
  video:     { label: "Video",     icon: Video,    color: "text-purple-400",  bg: "bg-purple-500/10" },
  worksheet: { label: "Worksheet", icon: FileText, color: "text-amber-light", bg: "bg-amber-500/10"  },
};

function getYoutubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

function ContentCard({ item }) {
  const config = TYPE_CONFIG[item.type];
  const Icon   = config.icon;
  const ytId   = item.type === "video" ? getYoutubeId(item.url) : null;

  return (
    <div className="card hover:border-border-2 transition-colors">
      {ytId ? (
        <div className="mb-3 rounded-lg overflow-hidden aspect-video bg-black">
          <iframe src={`https://www.youtube.com/embed/${ytId}`} title={item.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${config.bg}`}>
          <Icon size={18} className={config.color} />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-sm font-medium text-slate-200">{item.title}</div>
        <span className={`badge gap-1 shrink-0 border-0 ${config.bg} ${config.color}`}>
          <Icon size={10} /> {config.label}
        </span>
      </div>
      {item.description && <p className="text-xs text-slate-500 mb-3 leading-relaxed">{item.description}</p>}
      {item.type !== "video" && (
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color} hover:underline`}>
          <ExternalLink size={12} />
          {item.type === "book" ? "Open Book" : "Open Worksheet"}
        </a>
      )}
    </div>
  );
}

export default function AdminCourses() {
  const [content,  setContent]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setActiveTab]= useState("all");
  const [classes,  setClasses]  = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/admin/classes"),
    ]).then(([cls]) => {
      setClasses(cls.data);
      const levels = [...new Set(cls.data.map((c) => c.roboticsLevel))];
      if (levels.length === 0) { setLoading(false); return; }
      Promise.all(levels.map((l) => api.get(`/content/level/${l}`))).then((results) => {
        setContent(results.flatMap((r) => r.data));
      }).finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  const tabs = ["all", "book", "video", "worksheet"];
  const filtered = activeTab === "all" ? content : content.filter((c) => c.type === activeTab);
  const byLevel  = filtered.reduce((acc, item) => {
    if (!acc[item.roboticsLevel]) acc[item.roboticsLevel] = [];
    acc[item.roboticsLevel].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses & Content</h1>
          <p className="page-sub">Read-only view of learning content for your institute's class levels.</p>
        </div>
      </div>

      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
              activeTab === t ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}>
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600" />
        </div>
      ) : classes.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">No classes set up yet</p>
            <p className="empty-desc">Create classes with robotics levels assigned to see content here.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">No content available</p>
            <p className="empty-desc">The SuperAdmin hasn't uploaded content for your class levels yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(byLevel).sort().map((lvl) => (
            <div key={lvl}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                  style={{ background: (LEVEL_COLORS[lvl] || "#6366f1") + "22", color: LEVEL_COLORS[lvl] || "#6366f1" }}>
                  {lvl}
                </div>
                <h2 className="text-sm font-semibold text-slate-300">
                  Level {lvl} — {LEVEL_LABELS[lvl]}
                </h2>
                <span className="text-xs text-slate-600">{byLevel[lvl].length} item{byLevel[lvl].length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {byLevel[lvl].map((item) => <ContentCard key={item._id} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
