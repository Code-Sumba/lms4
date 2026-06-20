import { useEffect, useState } from "react";
import { Plus, BookOpen, Video, FileText, MoreHorizontal, Edit2, Trash2, X, Loader, ExternalLink, Globe, School } from "lucide-react";
import api from "../../api/axios";

const LEVELS = [1, 2, 3, 4, 5, 6];
const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const TYPES = [
  { value: "book",      label: "Book",      icon: BookOpen, color: "text-blue-light",  bg: "bg-blue-muted"   },
  { value: "video",     label: "Video",     icon: Video,    color: "text-purple-400",  bg: "bg-purple-500/10"},
  { value: "worksheet", label: "Worksheet", icon: FileText, color: "text-amber-light", bg: "bg-amber-500/10" },
];

const typeInfo = (t) => TYPES.find((x) => x.value === t) || TYPES[0];

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16} /></button>
        </div>
        <div className="modal-body space-y-4">{children}</div>
      </div>
    </div>
  );
}

function ContentForm({ initial, onSave, onClose, saving, institutes }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, instituteId: initial.instituteId || "" }
      : { title: "", description: "", type: "book", url: "", roboticsLevel: 1, instituteId: "" }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const placeholder = {
    book:      "https://drive.google.com/file/d/... or direct PDF link",
    video:     "https://www.youtube.com/watch?v=...",
    worksheet: "https://drive.google.com/file/d/... or direct PDF link",
  };

  return (
    <>
      <div className="space-y-4">
        <div className="form-group">
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Intro to Mechanical Components" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Type *</label>
            <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Robotics Level *</label>
            <select className="input" value={form.roboticsLevel} onChange={(e) => set("roboticsLevel", Number(e.target.value))}>
              {LEVELS.map((l) => <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="label">Visible to</label>
          <select className="input" value={form.instituteId} onChange={(e) => set("instituteId", e.target.value)}>
            <option value="">All Schools (Global)</option>
            {institutes.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
            ))}
          </select>
          <p className="text-xs text-slate-600 mt-1">Leave as "All Schools" to make this content visible to every institute.</p>
        </div>
        <div className="form-group">
          <label className="label">URL *</label>
          <input className="input" type="url" value={form.url} onChange={(e) => set("url", e.target.value)} placeholder={placeholder[form.type]} />
        </div>
        <div className="form-group">
          <label className="label">Description</label>
          <textarea className="input" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional short description" />
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave({ ...form, instituteId: form.instituteId || null })} disabled={!form.title || !form.url || saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          {initial ? "Save Changes" : "Add Content"}
        </button>
      </div>
    </>
  );
}

export default function Content() {
  const [items,        setItems]        = useState([]);
  const [institutes,   setInstitutes]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [menuOpen,     setMenuOpen]     = useState(null);
  const [filterType,   setFilterType]   = useState("");
  const [filterLevel,  setFilterLevel]  = useState("");
  const [filterInst,   setFilterInst]   = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType)  params.set("type",      filterType);
    if (filterLevel) params.set("level",     filterLevel);
    if (filterInst)  params.set("institute", filterInst);
    api.get(`/content?${params}`)
      .then(({ data }) => setItems(data))
      .catch(() => setError("Failed to load content."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get("/superadmin/institutes").then(({ data }) => setInstitutes(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterType, filterLevel, filterInst]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/content", form);
      setShowCreate(false); load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/content/${editTarget._id}`, form);
      setEditTarget(null); load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.delete(`/content/${item._id}`);
      load();
    } catch { setError("Failed to delete."); }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Library</h1>
          <p className="page-sub">Manage books, videos and worksheets. Control which school can see each item.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
          <Plus size={15} /> Add Content
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="input w-auto" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
          <option value="">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>)}
        </select>
        <select className="input w-auto" value={filterInst} onChange={(e) => setFilterInst(e.target.value)}>
          <option value="">All visibility</option>
          <option value="global">Global only</option>
          {institutes.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">No content yet</p>
            <p className="empty-desc">Click "Add Content" to upload the first item.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Visible to</th>
                  <th>URL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const info = typeInfo(item.type);
                  const Icon = info.icon;
                  return (
                    <tr key={item._id} onClick={() => setMenuOpen(null)}>
                      <td>
                        <div>
                          <div className="text-sm font-medium text-slate-200">{item.title}</div>
                          {item.description && <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>}
                        </div>
                      </td>
                      <td>
                        <span className={`badge gap-1 ${info.bg} ${info.color} border-0`}>
                          <Icon size={11} /> {info.label}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-gray">L{item.roboticsLevel} · {LEVEL_LABELS[item.roboticsLevel]}</span>
                      </td>
                      <td>
                        {item.institute ? (
                          <span className="flex items-center gap-1 text-xs text-slate-300">
                            <School size={11} className="text-slate-500" />
                            {item.institute.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Globe size={11} /> All Schools
                          </span>
                        )}
                      </td>
                      <td>
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-light hover:underline max-w-xs truncate"
                          onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={11} />
                          <span className="truncate">{item.url}</span>
                        </a>
                      </td>
                      <td className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === item._id ? null : item._id); }}
                          className="btn-ghost btn-sm p-1">
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpen === item._id && (
                          <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-40 py-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setEditTarget(item); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                              <Edit2 size={13} /> Edit
                            </button>
                            <div className="my-1 border-t border-surface-border" />
                            <button onClick={() => handleDelete(item)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-muted transition-colors">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="Add Content" onClose={() => setShowCreate(false)}>
          <ContentForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} institutes={institutes} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit Content" onClose={() => setEditTarget(null)}>
          <ContentForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} saving={saving} institutes={institutes} />
        </Modal>
      )}
    </div>
  );
}
