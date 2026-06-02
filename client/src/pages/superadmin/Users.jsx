import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Users as UsersIcon, Search, X, CheckCircle, XCircle, Loader, MoreHorizontal, Key, Trash2, Upload, Download } from "lucide-react";
import api from "../../api/axios";

const ROLE_BADGE = {
  superadmin: "badge-blue",
  admin:      "badge-blue",
  teacher:    "badge-gray",
  student:    "badge-green",
};

const ROLES = ["superadmin", "admin", "teacher", "student"];
const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#22c55e", "#06b6d4", "#a855f7", "#14b8a6"];

function CreateUserModal({ institutes, onSave, onClose, saving }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "student", instituteId: "", phone: "", rollNumber: "", avatarColor: AVATAR_COLORS[0] });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 form-group">
          <label className="label">Full Name *</label>
          <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="John Kumar" />
        </div>
        <div className="form-group">
          <label className="label">Email *</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@school.com" />
        </div>
        <div className="form-group">
          <label className="label">Password *</label>
          <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 characters" />
        </div>
        <div className="form-group">
          <label className="label">Role *</label>
          <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        {form.role !== "superadmin" && (
          <div className="form-group">
            <label className="label">Institute *</label>
            <select className="input" value={form.instituteId} onChange={(e) => set("instituteId", e.target.value)}>
              <option value="">Select institute</option>
              {institutes.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
        )}
        {form.role === "student" && (
          <div className="form-group">
            <label className="label">Roll Number</label>
            <input className="input" value={form.rollNumber} onChange={(e) => set("rollNumber", e.target.value)} placeholder="STU001" />
          </div>
        )}
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 99999 99999" />
        </div>
        <div className="col-span-2">
          <label className="label">Avatar Color</label>
          <div className="flex gap-2 mt-1">
            {AVATAR_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("avatarColor", c)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${form.avatarColor === c ? "border-white scale-110" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.fullName || !form.email || !form.password || (form.role !== "superadmin" && !form.instituteId) || saving}
          className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          Create User
        </button>
      </div>
    </>
  );
}

function BulkImportModal({ institutes, onClose, onDone }) {
  const fileRef  = useRef();
  const [rows,     setRows]     = useState([]);
  const [role,     setRole]     = useState("student");
  const [instId,   setInstId]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");

  const parseCSV = (text) => {
    const lines  = text.trim().split("\n").filter(Boolean);
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const obj  = {};
      header.forEach((h, i) => { obj[h] = cols[i] || ""; });
      return obj;
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setRows(parseCSV(ev.target.result)); setError(""); setResult(null); }
      catch { setError("Could not parse CSV."); }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setSaving(true);
    try {
      const { data } = await api.post("/superadmin/users/bulk", {
        users: rows, role, instituteId: instId || null,
      });
      setResult(data);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed.");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">Bulk Import Users</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16} /></button>
        </div>
        <div className="modal-body space-y-4">
          <div className="bg-surface rounded-lg p-3 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-300">CSV Format (first row = header):</span>
              <a href="/sample-users.csv" download="sample-users.csv"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline">
                <Download size={11} /> Download Sample
              </a>
            </div>
            <code className="block text-green-400">fullName,email,password,rollNumber,phone</code>
            <div>• role and institute below apply to all rows unless overridden in CSV</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Default Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                {["student","teacher","admin"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Default Institute</label>
              <select className="input" value={instId} onChange={(e) => setInstId(e.target.value)}>
                <option value="">None / CSV column</option>
                {institutes.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Upload CSV File</label>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            <button onClick={() => fileRef.current.click()} className="btn-secondary btn-sm gap-1.5 w-full">
              <Upload size={13} /> Choose CSV File
            </button>
          </div>

          {rows.length > 0 && !result && (
            <div className="bg-surface rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-2">{rows.length} row{rows.length !== 1 ? "s" : ""} ready:</div>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {rows.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-slate-600">{i + 1}.</span>
                    <span>{r.fullname || r.fullName}</span>
                    <span className="text-slate-500">— {r.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={13} /> {result.created.length} user{result.created.length !== 1 ? "s" : ""} created
              </div>
              {result.skipped.length > 0 && <div className="text-amber-400">{result.skipped.length} skipped</div>}
              {result.errors.length  > 0 && <div className="text-red-400">{result.errors.length} errors</div>}
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary btn-sm">{result ? "Close" : "Cancel"}</button>
          {!result && (
            <button onClick={handleImport} disabled={!rows.length || saving} className="btn-primary btn-sm gap-1.5">
              {saving && <Loader size={13} className="animate-spin" />}
              Import {rows.length > 0 ? `${rows.length} Users` : "Users"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users,      setUsers]      = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk,   setShowBulk]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [menuOpen,   setMenuOpen]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get("/superadmin/users"),
      api.get("/superadmin/institutes"),
    ]).then(([u, i]) => {
      setUsers(u.data);
      setInstitutes(i.data);
    }).catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/superadmin/users", form);
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (user) => {
    try { await api.patch(`/superadmin/users/${user._id}/toggle`); load(); }
    catch { setError("Failed to update status."); }
    setMenuOpen(null);
  };

  const handleResetPwd = async (user) => {
    const pwd = prompt(`New password for ${user.fullName} (min 6 chars):`);
    if (!pwd || pwd.length < 6) return;
    try { await api.patch(`/superadmin/users/${user._id}/reset-password`, { password: pwd }); }
    catch { setError("Failed to reset password."); }
    setMenuOpen(null);
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete "${user.fullName}"?`)) return;
    try { await api.delete(`/superadmin/users/${user._id}`); load(); }
    catch { setError("Failed to delete user."); }
    setMenuOpen(null);
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const instName = (id) => institutes.find((i) => i._id === id)?.name || "—";

  return (
    <div className="space-y-5" onClick={() => setMenuOpen(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">All accounts across every institute.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="btn-secondary btn-sm gap-1.5">
            <Upload size={15} /> Bulk Import
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <XCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-8" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={13} /></button>}
        </div>
        <select className="input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader size={20} className="animate-spin text-slate-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UsersIcon size={28} className="empty-icon" />
            <p className="empty-title">{search || roleFilter ? "No matching users" : "No users yet"}</p>
            <p className="empty-desc">{search || roleFilter ? "Try adjusting your filters." : "Add the first user to get started."}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Institute</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded flex items-center justify-center text-2xs font-semibold text-white flex-shrink-0"
                             style={{ background: u.avatarColor || "#3b82f6" }}>
                          {u.fullName?.split(" ").slice(0,2).map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm text-slate-200 font-medium">{u.fullName}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${ROLE_BADGE[u.role] || "badge-gray"}`}>{u.role}</span></td>
                    <td className="text-xs text-slate-400 max-w-[160px] truncate">{u.role === "superadmin" ? <span className="text-slate-600">—</span> : instName(u.instituteId)}</td>
                    <td>
                      {u.isActive
                        ? <span className="badge badge-green"><CheckCircle size={11} /> Active</span>
                        : <span className="badge badge-red"><XCircle size={11} /> Inactive</span>}
                    </td>
                    <td className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === u._id ? null : u._id); }} className="btn-ghost btn-sm p-1">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === u._id && (
                        <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-44 py-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleToggle(u)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            {u.isActive ? <><XCircle size={13} /> Deactivate</> : <><CheckCircle size={13} /> Activate</>}
                          </button>
                          <button onClick={() => handleResetPwd(u)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <Key size={13} /> Reset Password
                          </button>
                          <div className="my-1 border-t border-surface-border" />
                          <button onClick={() => handleDelete(u)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-muted transition-colors">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-surface-border text-xs text-slate-500">
              Showing {filtered.length} of {users.length} users
            </div>
          </div>
        )}
      </div>

      {showBulk && (
        <BulkImportModal institutes={institutes} onClose={() => setShowBulk(false)} onDone={() => load()} />
      )}

      {showCreate && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-box max-w-lg">
            <div className="modal-header">
              <span className="text-sm font-semibold text-slate-200">Add User</span>
              <button onClick={() => setShowCreate(false)} className="btn-ghost btn-sm p-1"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <CreateUserModal institutes={institutes} onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
