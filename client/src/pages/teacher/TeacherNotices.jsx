import { useEffect, useState } from "react";
import { Bell, Plus, Edit2, Trash2, X, Loader, AlertTriangle, Info, Megaphone, Users } from "lucide-react";
import api from "../../api/axios";

const TYPE_CONFIG = {
  info:    { label: "Info",    icon: Info,          cls: "bg-blue-500/10  text-blue-400  border-blue-500/20"  },
  warning: { label: "Warning", icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  urgent:  { label: "Urgent",  icon: Megaphone,     cls: "bg-red-500/10   text-red-400   border-red-500/20"   },
};

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16} /></button>
        </div>
        <div className="modal-body space-y-4">{children}</div>
      </div>
    </div>
  );
}

function NoticeForm({ initial, onSave, onClose, saving, classes }) {
  const [form, setForm] = useState(
    initial || { title: "", content: "", type: "info", classId: "", expiresAt: "" }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <>
      <div className="space-y-4">
        <div className="form-group">
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Homework due tomorrow" />
        </div>
        <div className="form-group">
          <label className="label">Message *</label>
          <textarea className="input" rows={4} value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="Write the notice content here…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Class (batch)</label>
            <select className="input" value={form.classId || ""} onChange={(e) => set("classId", e.target.value)}>
              <option value="">All my classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Expires on (optional)</label>
          <input className="input" type="date" value={form.expiresAt || ""}
            onChange={(e) => set("expiresAt", e.target.value)} />
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.title || !form.content || saving}
          className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          {initial ? "Save Changes" : "Post Notice"}
        </button>
      </div>
    </>
  );
}

function NoticeCard({ notice, onEdit, onDelete, onToggle }) {
  const cfg = TYPE_CONFIG[notice.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;
  return (
    <div className={`card border ${cfg.cls} space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={15} className="shrink-0" />
          <span className="text-sm font-semibold text-slate-100 truncate">{notice.title}</span>
          {!notice.isActive && <span className="badge badge-gray text-xs">Hidden</span>}
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(notice)} className="btn-ghost btn-sm p-1"><Edit2 size={13} /></button>
          <button onClick={() => onToggle(notice)}
            className="btn-ghost btn-sm p-1 text-slate-500 hover:text-slate-300 text-xs">
            {notice.isActive ? "Hide" : "Show"}
          </button>
          <button onClick={() => onDelete(notice)} className="btn-ghost btn-sm p-1 text-red-400 hover:text-red-300">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{notice.content}</p>
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <Users size={11} /> {notice.className || "All classes"}
        </span>
        <span>{fmtDate(notice.createdAt)}</span>
        {notice.expiresAt && <span>· Expires {fmtDate(notice.expiresAt)}</span>}
      </div>
    </div>
  );
}

export default function TeacherNotices() {
  const [notices,    setNotices]    = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [filter,     setFilter]     = useState("all");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/notices/teacher"),
      api.get("/teacher/classes"),
    ]).then(([nRes, cRes]) => { setNotices(nRes.data); setClasses(cRes.data); })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try { await api.post("/notices/teacher", form); setShowCreate(false); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };
  const handleEdit = async (form) => {
    setSaving(true);
    try { await api.put(`/notices/${editTarget._id}`, form); setEditTarget(null); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };
  const handleDelete = async (n) => {
    if (!confirm(`Delete "${n.title}"?`)) return;
    await api.delete(`/notices/${n._id}`); load();
  };
  const handleToggle = async (n) => {
    await api.put(`/notices/${n._id}`, { isActive: !n.isActive }); load();
  };

  const TABS = ["all", "info", "warning", "urgent"];
  const filtered = filter === "all" ? notices : notices.filter((n) => n.type === filter);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-sub">Post notices to your assigned classes.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
          <Plus size={15} /> Post Notice
        </button>
      </div>

      {error && (
        <div className="alert-error"><span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
              filter === t ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}>{t === "all" ? "All" : t}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader size={20} className="animate-spin text-slate-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center">
          <Bell size={28} className="empty-icon mx-auto mb-2" />
          <p className="text-sm text-slate-500">No notices posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <NoticeCard key={n._id} notice={n}
              onEdit={setEditTarget} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Post Class Notice" onClose={() => setShowCreate(false)}>
          <NoticeForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} classes={classes} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit Notice" onClose={() => setEditTarget(null)}>
          <NoticeForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} saving={saving} classes={classes} />
        </Modal>
      )}
    </div>
  );
}
