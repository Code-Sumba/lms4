import { useEffect, useState } from "react";
import { Plus, Building2, MoreHorizontal, CheckCircle, XCircle, Edit2, Trash2, X, Loader } from "lucide-react";
import api from "../../api/axios";

const LEVELS = [1, 2, 3, 4, 5, 6];
const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};

/* ── Small reusable Modal ── */
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16} /></button>
        </div>
        <div className="modal-body space-y-4">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Create / Edit Form ── */
function InstituteForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(
    initial || { name: "", code: "", address: "", phone: "", email: "", allowedLevels: [1, 2, 3, 4, 5, 6], accessUntil: "" }
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleLevel = (lvl) =>
    set("allowedLevels", form.allowedLevels.includes(lvl)
      ? form.allowedLevels.filter((l) => l !== lvl)
      : [...form.allowedLevels, lvl].sort());

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 form-group">
          <label className="label">School Name *</label>
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Cambridge International School" />
        </div>
        <div className="form-group">
          <label className="label">School Code *</label>
          <input className="input uppercase" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="CIS" maxLength={10} />
        </div>
        <div className="form-group">
          <label className="label">Contact Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="principal@school.com" />
        </div>
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 99999 99999" />
        </div>
        <div className="form-group">
          <label className="label">Access Until</label>
          <input className="input" type="date" value={form.accessUntil ? form.accessUntil.slice(0, 10) : ""} onChange={(e) => set("accessUntil", e.target.value)} />
        </div>
        <div className="col-span-2 form-group">
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, City, State" />
        </div>
        <div className="col-span-2">
          <label className="label">Allowed Curriculum Levels</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {LEVELS.map((lvl) => {
              const active = form.allowedLevels.includes(lvl);
              return (
                <button key={lvl} type="button" onClick={() => toggleLevel(lvl)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    active ? "bg-blue-muted border-blue/40 text-blue-light" : "bg-surface-2 border-surface-border text-slate-500 hover:border-border-2"
                  }`}>
                  L{lvl} · {LEVEL_LABELS[lvl]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.name || !form.code || saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          {initial ? "Save Changes" : "Create Institute"}
        </button>
      </div>
    </>
  );
}

/* ── Main Page ── */
export default function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [menuOpen,   setMenuOpen]   = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/superadmin/institutes")
      .then(({ data }) => setInstitutes(data))
      .catch(() => setError("Failed to load institutes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/superadmin/institutes", form);
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create institute.");
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/superadmin/institutes/${editTarget._id}`, form);
      setEditTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (inst) => {
    try {
      await api.patch(`/superadmin/institutes/${inst._id}/toggle`);
      load();
    } catch { setError("Failed to update status."); }
    setMenuOpen(null);
  };

  const handleDelete = async (inst) => {
    if (!confirm(`Delete "${inst.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/superadmin/institutes/${inst._id}`);
      load();
    } catch { setError("Failed to delete institute."); }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Institutes</h1>
          <p className="page-sub">Manage all registered schools on the platform.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
          <Plus size={15} /> Add Institute
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <XCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : institutes.length === 0 ? (
          <div className="empty-state">
            <Building2 size={28} className="empty-icon" />
            <p className="empty-title">No institutes yet</p>
            <p className="empty-desc">Click "Add Institute" to register the first school.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>School</th>
                  <th>Code</th>
                  <th>Levels</th>
                  <th>Access Until</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {institutes.map((inst) => (
                  <tr key={inst._id} onClick={() => setMenuOpen(null)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-blue-muted flex items-center justify-center text-2xs font-semibold text-blue-light flex-shrink-0">
                          {inst.name[0]}
                        </div>
                        <div>
                          <div className="text-slate-200 font-medium text-sm">{inst.name}</div>
                          {inst.email && <div className="text-xs text-slate-500">{inst.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td><code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded text-slate-300">{inst.code}</code></td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(inst.allowedLevels || []).map((lvl) => (
                          <span key={lvl} className="badge badge-gray">L{lvl}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-xs text-slate-400">
                      {inst.accessUntil ? new Date(inst.accessUntil).toLocaleDateString() : <span className="text-slate-600">—</span>}
                    </td>
                    <td>
                      {inst.isActive
                        ? <span className="badge badge-green"><CheckCircle size={11} /> Active</span>
                        : <span className="badge badge-red"><XCircle size={11} /> Inactive</span>}
                    </td>
                    <td className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === inst._id ? null : inst._id); }}
                        className="btn-ghost btn-sm p-1"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === inst._id && (
                        <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-40 py-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setEditTarget(inst); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <Edit2 size={13} /> Edit
                          </button>
                          <button onClick={() => handleToggle(inst)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            {inst.isActive ? <><XCircle size={13} /> Deactivate</> : <><CheckCircle size={13} /> Activate</>}
                          </button>
                          <div className="my-1 border-t border-surface-border" />
                          <button onClick={() => handleDelete(inst)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-muted transition-colors">
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

      {/* Create modal */}
      {showCreate && (
        <Modal title="Add Institute" onClose={() => setShowCreate(false)}>
          <InstituteForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <Modal title="Edit Institute" onClose={() => setEditTarget(null)}>
          <InstituteForm
            initial={{ ...editTarget, accessUntil: editTarget.accessUntil || "" }}
            onSave={handleEdit}
            onClose={() => setEditTarget(null)}
            saving={saving}
          />
        </Modal>
      )}
    </div>
  );
}
