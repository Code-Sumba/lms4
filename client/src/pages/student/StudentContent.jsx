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
  book:      { label: "Books",      icon: BookOpen, color: "text-blue-light",  bg: "bg-blue-muted"    },
  video:     { label: "Videos",     icon: Video,    color: "text-purple-400",  bg: "bg-purple-500/10" },
  worksheet: { label: "Worksheets", icon: FileText, color: "text-amber-light", bg: "bg-amber-500/10"  },
};

function getYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

function ContentCard({ item }) {
  const config = TYPE_CONFIG[item.type];
  const Icon   = config.icon;
  const ytId   = item.type === "video" ? getYoutubeId(item.url) : null;

  return (
    <div className="card hover:border-border-2 transition-colors group">
      {ytId ? (
        <div className="mb-3 rounded-lg overflow-hidden aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={item.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${config.bg}`}>
          <Icon size={18} className={config.color} />
        </div>
      )}
      <div className="text-sm font-medium text-slate-200 mb-1">{item.title}</div>
      {item.description && <p className="text-xs text-slate-500 mb-3 leading-relaxed">{item.description}</p>}
      {item.type !== "video" && (
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs font-medium mt-auto ${config.color} hover:underline`}>
          <ExternalLink size={13} />
          {item.type === "book" ? "Open Book" : "Download Worksheet"}
        </a>
      )}
    </div>
  );
}

export default function StudentContent() {
  const [content,  setContent]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setActiveTab]= useState("all");

  useEffect(() => {
    api.get("/student/content")
      .then(({ data }) => setContent(data))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: "all",       label: "All"        },
    { key: "book",      label: "Books"      },
    { key: "video",     label: "Videos"     },
    { key: "worksheet", label: "Worksheets" },
  ];

  const filtered = activeTab === "all" ? content : content.filter((c) => c.type === activeTab);

  // Group filtered content by level
  const byLevel = filtered.reduce((acc, item) => {
    if (!acc[item.roboticsLevel]) acc[item.roboticsLevel] = [];
    acc[item.roboticsLevel].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Learning Content</h1>
        <p className="page-sub">Books, videos and worksheets for your enrolled classes.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === t.key ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">No content available</p>
            <p className="empty-desc">Content will appear here once your admin enrols you in a class.</p>
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
                <h2 className="text-sm font-semibold text-slate-300">Level {lvl} — {LEVEL_LABELS[lvl]}</h2>
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
