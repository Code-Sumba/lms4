import { useEffect, useState } from "react";
import { Award, Loader, Plus, X, Trash2, Search } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",
  4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT",
};
const LEVEL_COLORS = {
  1:"#f97316",2:"#eab308",3:"#22c55e",
  4:"#3b82f6",5:"#a855f7",6:"#ec4899",
};
const LEVELS = [1,2,3,4,5,6];

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

function IssueCertModal({ onClose, onSave }) {
  const [students, setStudents] = useState([]);
  const [exams,    setExams]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [form, setForm] = useState({
    studentId: "", examId: "", examTitle: "",
    roboticsLevel: 1, score: "", totalMarks: 100,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([
      api.get("/superadmin/users?role=student"),
      api.get("/exams"),
    ]).then(([s, e]) => {
      setStudents(s.data);
      setExams(e.data);
    }).finally(() => setLoading(false));
  }, []);

  // Auto-fill examTitle + level when exam is selected
  const handleExamChange = (examId) => {
    const exam = exams.find((e) => e._id === examId);
    set("examId", examId);
    if (exam) {
      setForm((f) => ({
        ...f,
        examId,
        examTitle:     exam.title,
        roboticsLevel: exam.roboticsLevel,
        totalMarks:    exam.totalMarks,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.studentId)   return setError("Please select a student.");
    if (!form.examId)      return setError("Please select an exam from the dropdown.");
    if (!form.examTitle)   return setError("Exam title is required.");
    if (form.score === "") return setError("Score is required.");
    if (Number(form.score) > Number(form.totalMarks))
      return setError("Score cannot exceed total marks.");
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue certificate.");
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Issue Certificate Manually" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8"><Loader size={18} className="animate-spin text-slate-600" /></div>
      ) : (
        <>
          <div className="space-y-4">
            {/* Student */}
            <div className="form-group">
              <label className="label">Student *</label>
              <select className="input" value={form.studentId} onChange={(e) => set("studentId", e.target.value)}>
                <option value="">Select student…</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.fullName} {s.rollNumber ? `(${s.rollNumber})` : `— ${s.email}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam (optional — can type title manually) */}
            <div className="form-group">
              <label className="label">Exam *</label>
              <select className="input" value={form.examId} onChange={(e) => handleExamChange(e.target.value)}>
                <option value="">Select exam or enter manually below…</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    L{e.roboticsLevel} — {e.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam title (editable override) */}
            <div className="form-group">
              <label className="label">Exam Title *</label>
              <input className="input" value={form.examTitle}
                onChange={(e) => set("examTitle", e.target.value)}
                placeholder="e.g. Level 2 Electronics Final" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Level */}
              <div className="form-group">
                <label className="label">Robotics Level *</label>
                <select className="input" value={form.roboticsLevel}
                  onChange={(e) => set("roboticsLevel", Number(e.target.value))}>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>
                  ))}
                </select>
              </div>

              {/* Total marks */}
              <div className="form-group">
                <label className="label">Total Marks *</label>
                <input className="input" type="number" min="1" value={form.totalMarks}
                  onChange={(e) => set("totalMarks", e.target.value)} />
              </div>

              {/* Score */}
              <div className="form-group col-span-2">
                <label className="label">Score *</label>
                <input className="input" type="number" min="0" max={form.totalMarks}
                  value={form.score} onChange={(e) => set("score", e.target.value)}
                  placeholder={`0 – ${form.totalMarks}`} />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary btn-sm gap-1.5">
              {saving && <Loader size={13} className="animate-spin" />}
              <Award size={13} /> Issue Certificate
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default function Certificates() {
  const [certs,      setCerts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [showIssue,  setShowIssue]  = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/certificates")
      .then(({ data }) => setCerts(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleIssue = async (form) => {
    await api.post("/certificates", form);
    load();
  };

  const handleDelete = async (cert) => {
    if (!confirm(`Revoke certificate for "${cert.student?.fullName}"? This cannot be undone.`)) return;
    setDeleting(cert._id);
    try {
      await api.delete(`/certificates/${cert._id}`);
      load();
    } catch { }
    setDeleting(null);
  };

  const filtered = certs.filter((c) =>
    c.student?.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.examTitle.toLowerCase().includes(search.toLowerCase()) ||
    (c.student?.rollNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="page-sub">All certificates issued. Issue manually or auto-issued on exam pass.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-surface px-3 py-1.5 rounded-lg border border-surface-border">
            <Award size={14} className="text-amber-light" />
            {certs.length} issued
          </div>
          <button onClick={() => setShowIssue(true)} className="btn-primary btn-sm gap-1.5">
            <Plus size={15} /> Issue Certificate
          </button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-8"
          placeholder="Search by name, exam or roll no…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Award size={28} className="empty-icon" />
            <p className="empty-title">{search ? "No matches found" : "No certificates yet"}</p>
            <p className="empty-desc">{!search && "Click \"Issue Certificate\" to add one, or they auto-issue on exam pass."}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Institute</th>
                  <th>Exam</th>
                  <th>Level</th>
                  <th>Score</th>
                  <th>Issued</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const color = LEVEL_COLORS[c.roboticsLevel] || "#6366f1";
                  return (
                    <tr key={c._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                            style={{ background: c.student?.avatarColor || "#10b981" }}>
                            {c.student?.fullName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{c.student?.fullName}</div>
                            <div className="text-xs text-slate-500">{c.student?.rollNumber || c.student?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-slate-400">{c.student?.institute?.name || "—"}</td>
                      <td className="text-sm text-slate-300 max-w-[180px] truncate">{c.examTitle}</td>
                      <td>
                        <span className="badge" style={{ color, borderColor: color + "44", background: color + "11" }}>
                          L{c.roboticsLevel} · {LEVEL_LABELS[c.roboticsLevel]}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm font-semibold text-slate-200">
                          {c.score}<span className="text-xs text-slate-500">/{c.totalMarks}</span>
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{new Date(c.issuedAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleDelete(c)} disabled={deleting === c._id}
                          className="btn-ghost btn-sm p-1 text-red-400 hover:text-red-300">
                          {deleting === c._id
                            ? <Loader size={13} className="animate-spin" />
                            : <Trash2 size={13} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showIssue && (
        <IssueCertModal onClose={() => setShowIssue(false)} onSave={handleIssue} />
      )}
    </div>
  );
}
