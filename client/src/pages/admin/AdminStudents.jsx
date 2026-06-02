import { useEffect, useState, useRef } from "react";
import { Plus, GraduationCap, MoreHorizontal, Trash2, X, Loader, CheckCircle, XCircle, KeyRound, BookOpen, Upload, Download } from "lucide-react";
import api from "../../api/axios";

const COLORS = ["#10b981","#6366f1","#3b82f6","#06b6d4","#f59e0b","#ef4444","#a855f7","#ec4899"];

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

function StudentForm({ onSave, onClose, saving }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", rollNumber: "", avatarColor: "#10b981" });
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
          <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="student@school.com" />
        </div>
        <div className="form-group">
          <label className="label">Password *</label>
          <input className="input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 6 characters" />
        </div>
        <div className="form-group">
          <label className="label">Roll Number</label>
          <input className="input" value={form.rollNumber} onChange={(e) => set("rollNumber", e.target.value)} placeholder="STU001" />
        </div>
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 99999 99999" />
        </div>
        <div className="col-span-2">
          <label className="label">Avatar Colour</label>
          <div className="flex gap-2 mt-1.5">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("avatarColor", c)}
                className="w-6 h-6 rounded-full flex-shrink-0 transition-all"
                style={{ background: c, boxShadow: form.avatarColor === c ? `0 0 0 2px #0c0e14, 0 0 0 4px ${c}` : "none" }} />
            ))}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.fullName || !form.email || !form.password || saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />} Add Student
        </button>
      </div>
    </>
  );
}

function ResetPasswordModal({ student, onClose }) {
  const [password, setPassword] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handle = async () => {
    if (password.length < 6) return setError("Minimum 6 characters.");
    setSaving(true);
    try {
      await api.patch(`/admin/students/${student._id}/reset-password`, { password });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed.");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={`Reset Password — ${student.fullName}`} onClose={onClose}>
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

function EnrollModal({ student, classes, onClose }) {
  const [enrollments, setEnrollments] = useState([]);
  const [saving,      setSaving]      = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get("/admin/classes")
      .then(({ data }) => {
        const enrolled = new Set(
          data.flatMap((c) =>
            (c.enrollments || []).filter((e) => (e.studentId === (student._id || student.id))).map((e) => c._id)
          )
        );
        setEnrollments(data.map((c) => ({ ...c, enrolled: enrolled.has(c._id) })));
      })
      .finally(() => setLoading(false));
  }, [student]);

  const toggle = async (cls) => {
    setSaving(cls._id);
    try {
      if (cls.enrolled) {
        await api.delete(`/admin/students/${student._id}/enroll/${cls._id}`);
      } else {
        await api.post(`/admin/students/${student._id}/enroll`, { classId: cls._id });
      }
      setEnrollments((prev) => prev.map((c) => c._id === cls._id ? { ...c, enrolled: !c.enrolled } : c));
    } catch { }
    setSaving(null);
  };

  return (
    <Modal title={`Enroll — ${student.fullName}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-6"><Loader size={18} className="animate-spin text-slate-600" /></div>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No classes available. Create classes first.</p>
      ) : (
        <div className="space-y-2">
          {enrollments.map((cls) => (
            <div key={cls._id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface hover:bg-surface-2 transition-colors">
              <div>
                <div className="text-sm text-slate-200">{cls.name}</div>
                <div className="text-xs text-slate-500">Level {cls.roboticsLevel}</div>
              </div>
              <button onClick={() => toggle(cls)} disabled={saving === cls._id}
                className={`btn-sm gap-1.5 ${cls.enrolled ? "btn-secondary text-red-400 hover:border-red-500" : "btn-primary"}`}>
                {saving === cls._id ? <Loader size={12} className="animate-spin" /> : cls.enrolled ? "Unenroll" : "Enroll"}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Done</button>
      </div>
    </Modal>
  );
}

function BulkImportModal({ onClose, onDone }) {
  const fileRef  = useRef();
  const [rows,   setRows]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState("");

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
      try {
        const parsed = parseCSV(ev.target.result);
        setRows(parsed);
        setError("");
        setResult(null);
      } catch { setError("Could not parse the CSV file."); }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setSaving(true);
    try {
      const { data } = await api.post("/admin/students/bulk", { students: rows });
      setResult(data);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed.");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Bulk Import Students" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-surface rounded-lg p-3 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-300">CSV Format (first row = header):</span>
            <a href="/sample-students.csv" download="sample-students.csv"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline">
              <Download size={11} /> Download Sample
            </a>
          </div>
          <code className="block text-green-400">fullName,email,password,rollNumber,phone</code>
          <div>• password must be at least 6 characters</div>
          <div>• rollNumber and phone are optional</div>
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
            <div className="text-xs text-slate-400 mb-2">{rows.length} row{rows.length !== 1 ? "s" : ""} ready to import:</div>
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
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={13} /> {result.created.length} student{result.created.length !== 1 ? "s" : ""} created
            </div>
            {result.skipped.length > 0 && (
              <div className="text-amber-400">{result.skipped.length} skipped (already exist or missing fields)</div>
            )}
            {result.errors.length > 0 && (
              <div className="text-red-400">{result.errors.length} errors</div>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">
          {result ? "Close" : "Cancel"}
        </button>
        {!result && (
          <button onClick={handleImport} disabled={!rows.length || saving} className="btn-primary btn-sm gap-1.5">
            {saving && <Loader size={13} className="animate-spin" />}
            Import {rows.length > 0 ? `${rows.length} Students` : "Students"}
          </button>
        )}
      </div>
    </Modal>
  );
}

export default function AdminStudents() {
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [showBulk,     setShowBulk]     = useState(false);
  const [resetTarget,  setResetTarget]  = useState(null);
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [menuOpen,     setMenuOpen]     = useState(null);
  const [search,       setSearch]       = useState("");

  const load = () => {
    setLoading(true);
    api.get("/admin/students")
      .then(({ data }) => setStudents(data))
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post("/admin/students", form);
      setShowCreate(false); load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (s) => {
    try {
      await api.patch(`/admin/students/${s._id}/toggle`);
      load();
    } catch { setError("Failed to update status."); }
    setMenuOpen(null);
  };

  const handleDelete = async (s) => {
    if (!confirm(`Delete "${s.fullName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/students/${s._id}`);
      load();
    } catch { setError("Failed to delete."); }
    setMenuOpen(null);
  };

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-sub">Manage student accounts and class enrollments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="btn-secondary btn-sm gap-1.5">
            <Upload size={15} /> Bulk Import
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
            <Plus size={15} /> Add Student
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-3">
        <input className="input max-w-xs" placeholder="Search by name, email or roll no…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={28} className="empty-icon" />
            <p className="empty-title">{search ? "No students match your search" : "No students yet"}</p>
            <p className="empty-desc">{!search && "Click \"Add Student\" to onboard the first student."}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} onClick={() => setMenuOpen(null)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                          style={{ background: s.avatarColor || "#10b981" }}>
                          {s.fullName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200">{s.fullName}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded text-slate-400">{s.rollNumber || "—"}</code></td>
                    <td className="text-xs text-slate-400">{s.phone || <span className="text-slate-600">—</span>}</td>
                    <td>
                      {s.isActive
                        ? <span className="badge badge-green"><CheckCircle size={11} /> Active</span>
                        : <span className="badge badge-red"><XCircle size={11} /> Inactive</span>}
                    </td>
                    <td className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === s._id ? null : s._id); }}
                        className="btn-ghost btn-sm p-1">
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === s._id && (
                        <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-44 py-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setEnrollTarget(s); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <BookOpen size={13} /> Enroll in Class
                          </button>
                          <button onClick={() => handleToggle(s)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            {s.isActive ? <><XCircle size={13} /> Deactivate</> : <><CheckCircle size={13} /> Activate</>}
                          </button>
                          <button onClick={() => { setResetTarget(s); setMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                            <KeyRound size={13} /> Reset Password
                          </button>
                          <div className="my-1 border-t border-surface-border" />
                          <button onClick={() => handleDelete(s)}
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
        <Modal title="Add Student" onClose={() => setShowCreate(false)}>
          <StudentForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
        </Modal>
      )}

      {resetTarget  && <ResetPasswordModal student={resetTarget} onClose={() => setResetTarget(null)} />}
      {enrollTarget && <EnrollModal student={enrollTarget} onClose={() => setEnrollTarget(null)} />}
      {showBulk     && <BulkImportModal onClose={() => setShowBulk(false)} onDone={() => { load(); }} />}
    </div>
  );
}
