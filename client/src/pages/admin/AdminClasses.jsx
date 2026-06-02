import { useEffect, useState } from "react";
import { Plus, BookOpen, MoreHorizontal, Trash2, Edit2, X, Loader, Users, CheckCircle } from "lucide-react";
import api from "../../api/axios";

const LEVELS = [1, 2, 3, 4, 5, 6];
const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};

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

function ClassForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || { name: "", roboticsLevel: 1 });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="space-y-4">
        <div className="form-group">
          <label className="label">Class Name *</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Batch A – Morning" />
        </div>
        <div className="form-group">
          <label className="label">Robotics Level *</label>
          <select className="input" value={form.roboticsLevel} onChange={(e) => set("roboticsLevel", Number(e.target.value))}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.name || saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          {initial ? "Save Changes" : "Create Class"}
        </button>
      </div>
    </>
  );
}

function TeacherModal({ cls, allTeachers, onClose }) {
  const [saving, setSaving] = useState(null);
  const assigned = new Set((cls.teacherIds || []).map((t) => t._id || t.id));

  const toggle = async (teacher) => {
    const isAssigned = assigned.has(teacher._id || teacher.id);
    setSaving(teacher._id || teacher.id);
    try {
      await api.patch(`/admin/classes/${cls._id}/teachers`, {
        teacherId: teacher._id || teacher.id,
        action: isAssigned ? "remove" : "add",
      });
      onClose(true);
    } catch {
      setSaving(null);
    }
  };

  return (
    <Modal title={`Manage Teachers — ${cls.name}`} onClose={() => onClose(false)}>
      {allTeachers.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No teachers found. Add teachers first.</p>
      ) : (
        <div className="space-y-2">
          {allTeachers.map((t) => {
            const id = t._id || t.id;
            const isAssigned = assigned.has(id);
            return (
              <div key={id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                    style={{ background: t.avatarColor || "#6366f1" }}>
                    {t.fullName[0]}
                  </div>
                  <div>
                    <div className="text-sm text-slate-200">{t.fullName}</div>
                    <div className="text-xs text-slate-500">{t.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggle(t)}
                  disabled={saving === id}
                  className={`btn-sm gap-1.5 ${isAssigned ? "btn-secondary text-red-400 hover:border-red-500" : "btn-primary"}`}
                >
                  {saving === id ? <Loader size={12} className="animate-spin" /> : isAssigned ? "Remove" : "Assign"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="modal-footer">
        <button onClick={() => onClose(false)} className="btn-secondary btn-sm">Done</button>
      </div>
    </Modal>
  );
}

export default function AdminClasses() {
  const [classes,     setClasses]     = useState([]);
  const [teachers,    setTeachers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [teacherTarget, setTeacherTarget] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [menuOpen,    setMenuOpen]    = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/admin/classes"), api.get("/admin/teachers")])
      .then(([c, t]) => { setClasses(c.data); setTeachers(t.data); })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/admin/classes", form);
      setShowCreate(false); load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create class.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/admin/classes/${editTarget._id}`, form);
      setEditTarget(null); load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (cls) => {
    if (!confirm(`Delete "${cls.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/classes/${cls._id}`);
      load();
    } catch { setError("Failed to delete class."); }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-sub">Manage classes and teacher assignments for your institute.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
          <Plus size={15} /> Add Class
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">No classes yet</p>
            <p className="empty-desc">Click "Add Class" to create your first class.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Level</th>
                  <th>Teachers</th>
                  <th>Students</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls._id} onClick={() => setMenuOpen(null)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: (LEVEL_COLORS[cls.roboticsLevel] || "#6366f1") + "22", color: LEVEL_COLORS[cls.roboticsLevel] || "#6366f1" }}>
                          {cls.roboticsLevel}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{cls.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">L{cls.roboticsLevel} · {LEVEL_LABELS[cls.roboticsLevel]}</span>
                    </td>
                    <td>
                      {(cls.teacherIds || []).length === 0 ? (
                        <span className="text-xs text-slate-600">No teachers</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          {(cls.teacherIds || []).slice(0, 3).map((t) => (
                            <div key={t._id || t.id} title={t.fullName}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-semibold text-white flex-shrink-0"
                              style={{ background: t.avatarColor || "#6366f1" }}>
                              {t.fullName?.[0]}
                            </div>
                          ))}
                          {(cls.teacherIds || []).length > 3 && (
                            <span className="text-xs text-slate-500">+{cls.teacherIds.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-slate-500">{cls.enrollments?.length ?? "—"}</span>
                    </td>
                    <td className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === cls._id ? null : cls._id); }}
                        className="btn-ghost btn-sm p-1">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === cls._id && (
                        <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-44 py-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setEditTarget(cls); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <Edit2 size={13} /> Edit Class
                          </button>
                          <button onClick={() => { setTeacherTarget(cls); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <Users size={13} /> Manage Teachers
                          </button>
                          <div className="my-1 border-t border-surface-border" />
                          <button onClick={() => handleDelete(cls)}
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
        <Modal title="Add Class" onClose={() => setShowCreate(false)}>
          <ClassForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit Class" onClose={() => setEditTarget(null)}>
          <ClassForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} saving={saving} />
        </Modal>
      )}

      {teacherTarget && (
        <TeacherModal
          cls={teacherTarget}
          allTeachers={teachers}
          onClose={(reload) => { setTeacherTarget(null); if (reload) load(); }}
        />
      )}
    </div>
  );
}
