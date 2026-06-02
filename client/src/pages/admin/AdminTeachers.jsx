import { useEffect, useState } from "react";
import { Plus, Users, MoreHorizontal, Trash2, Edit2, X, Loader, CheckCircle, XCircle, KeyRound } from "lucide-react";
import api from "../../api/axios";

const COLORS = ["#6366f1","#3b82f6","#06b6d4","#10b981","#f59e0b","#ef4444","#a855f7","#ec4899"];

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

function TeacherForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || { fullName: "", email: "", password: "", phone: "", avatarColor: "#3b82f6" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!initial;

  return (
    <>
      <div className="space-y-4">
        <div className="form-group">
          <label className="label">Full Name *</label>
          <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ms. Priya Sharma" />
        </div>
        <div className="form-group">
          <label className="label">Email *</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="teacher@school.com" disabled={isEdit} />
        </div>
        {!isEdit && (
          <div className="form-group">
            <label className="label">Password *</label>
            <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 6 characters" />
          </div>
        )}
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 99999 99999" />
        </div>
        <div>
          <label className="label">Avatar Colour</label>
          <div className="flex gap-2 mt-1.5">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("avatarColor", c)}
                className="w-6 h-6 rounded-full flex-shrink-0 ring-offset-1 ring-offset-bg transition-all"
                style={{ background: c, boxShadow: form.avatarColor === c ? `0 0 0 2px ${c}` : "none" }} />
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.fullName || !form.email || (!isEdit && !form.password) || saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          {isEdit ? "Save Changes" : "Add Teacher"}
        </button>
      </div>
    </>
  );
}

function ResetPasswordModal({ teacher, onClose }) {
  const [password, setPassword] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handle = async () => {
    if (password.length < 6) return setError("Minimum 6 characters.");
    setSaving(true);
    try {
      await api.patch(`/admin/teachers/${teacher._id}/reset-password`, { password });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed.");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={`Reset Password — ${teacher.fullName}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="form-group">
          <label className="label">New Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={handle} disabled={saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />} Reset Password
        </button>
      </div>
    </Modal>
  );
}

export default function AdminTeachers() {
  const [teachers,    setTeachers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [menuOpen,    setMenuOpen]    = useState(null);
  const [search,      setSearch]      = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/teachers")
      .then(({ data }) => setTeachers(data))
      .catch(() => setError("Failed to load teachers."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/admin/teachers", form);
      setShowCreate(false); load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add teacher.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (t) => {
    try {
      await api.patch(`/admin/teachers/${t._id}/toggle`);
      load();
    } catch { setError("Failed to update status."); }
    setMenuOpen(null);
  };

  const handleDelete = async (t) => {
    if (!confirm(`Delete "${t.fullName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/teachers/${t._id}`);
      load();
    } catch { setError("Failed to delete."); }
    setMenuOpen(null);
  };

  const filtered = teachers.filter((t) =>
    t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-sub">Manage teacher accounts for your institute.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
          <Plus size={15} /> Add Teacher
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-3">
        <input className="input max-w-xs" placeholder="Search teachers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={28} className="empty-icon" />
            <p className="empty-title">{search ? "No teachers match your search" : "No teachers yet"}</p>
            <p className="empty-desc">{!search && "Click \"Add Teacher\" to onboard the first teacher."}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} onClick={() => setMenuOpen(null)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                          style={{ background: t.avatarColor || "#3b82f6" }}>
                          {t.fullName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200">{t.fullName}</div>
                          <div className="text-xs text-slate-500">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-slate-400">{t.phone || <span className="text-slate-600">—</span>}</td>
                    <td>
                      {t.isActive
                        ? <span className="badge badge-green"><CheckCircle size={11} /> Active</span>
                        : <span className="badge badge-red"><XCircle size={11} /> Inactive</span>}
                    </td>
                    <td className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === t._id ? null : t._id); }}
                        className="btn-ghost btn-sm p-1">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === t._id && (
                        <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-44 py-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleToggle(t)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            {t.isActive ? <><XCircle size={13} /> Deactivate</> : <><CheckCircle size={13} /> Activate</>}
                          </button>
                          <button onClick={() => { setResetTarget(t); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <KeyRound size={13} /> Reset Password
                          </button>
                          <div className="my-1 border-t border-surface-border" />
                          <button onClick={() => handleDelete(t)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-muted transition-colors">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="Add Teacher" onClose={() => setShowCreate(false)}>
          <TeacherForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
        </Modal>
      )}

      {resetTarget && <ResetPasswordModal teacher={resetTarget} onClose={() => { setResetTarget(null); }} />}
    </div>
  );
}
