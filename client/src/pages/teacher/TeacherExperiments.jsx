import { useEffect, useState } from "react";
import { FlaskConical, Lock, Unlock, Clock, ChevronDown, ChevronUp, CheckCircle, X, Loader, Users, Eye } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};

function fmtDate(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_BADGE = {
  approved: "badge-green",
  pending:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

function ProgressModal({ exp, onClose }) {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get(`/teacher/experiments/${exp._id}/submissions`)
      .then(({ data }) => setSubs(data))
      .catch(() => setError("Failed to load submissions."))
      .finally(() => setLoading(false));
  }, [exp._id]);

  const approved = subs.filter((s) => s.status === "approved").length;
  const pending  = subs.filter((s) => s.status === "pending").length;
  const rejected = subs.filter((s) => s.status === "rejected").length;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">
            Progress — EXP {exp.expNumber}: {exp.title}
          </span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16} /></button>
        </div>
        <div className="modal-body space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size={18} className="animate-spin text-slate-600" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-400 text-center py-4">{error}</p>
          ) : subs.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No submissions yet.</p>
          ) : (
            <>
              {/* Summary row */}
              <div className="flex gap-3 text-xs pb-2 border-b border-surface-border">
                <span className="text-green-400 font-medium">{approved} Approved</span>
                <span className="text-amber-400 font-medium">{pending} Pending</span>
                {rejected > 0 && <span className="text-red-400 font-medium">{rejected} Rejected</span>}
                <span className="text-slate-600 ml-auto">{subs.length} total</span>
              </div>
              {/* Student rows */}
              <div className="space-y-2">
                {subs.map((s) => (
                  <div key={s._id || s.id} className="flex items-center justify-between p-3 bg-surface rounded-lg gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: (s.student?.avatarColor || "#6366f1") + "33",
                          color:       s.student?.avatarColor || "#6366f1",
                        }}>
                        {s.student?.fullName?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-slate-200 truncate">{s.student?.fullName}</div>
                        <div className="text-xs text-slate-500">{s.student?.rollNumber} · {s.class?.name}</div>
                        {s.notes && (
                          <div className="text-xs text-slate-600 truncate mt-0.5 italic">"{s.notes}"</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`badge ${STATUS_BADGE[s.status] || "badge-gray"}`}>
                        {s.status}
                      </span>
                      <span className="text-xs text-slate-600">{fmtDate(s.submittedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherExperiments() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [actionExp,   setActionExp]   = useState(null);
  const [progressExp, setProgressExp] = useState(null);
  const [error,       setError]       = useState("");
  const [busy,        setBusy]        = useState(null);
  const [activeTab,   setActiveTab]   = useState("experiments");
  const [filterClass, setFilterClass] = useState(""); // class id filter

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/teacher/experiments"),
      api.get("/teacher/experiments/submissions"),
    ]).then(([expRes, subRes]) => {
      setData(expRes.data);
      setSubmissions(subRes.data);
    }).catch(() => setError("Failed to load experiments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnlock = async (exp, classId) => {
    setBusy(exp._id + classId);
    try {
      await api.post(`/teacher/experiments/${exp._id}/unlock`, { classId });
      load();
    } catch (err) { setError(err.response?.data?.message || "Failed to unlock."); }
    finally { setBusy(null); setActionExp(null); }
  };

  const handleLock = async (exp, classId) => {
    setBusy(exp._id + classId);
    try {
      await api.post(`/teacher/experiments/${exp._id}/lock`, { classId });
      load();
    } catch (err) { setError(err.response?.data?.message || "Failed to lock."); }
    finally { setBusy(null); setActionExp(null); }
  };

  const handleReview = async (submissionId, status, reviewNotes = "") => {
    setBusy(submissionId);
    try {
      await api.post(`/teacher/experiments/submissions/${submissionId}/review`, { status, reviewNotes });
      load();
    } catch (err) { setError(err.response?.data?.message || "Failed to review."); }
    finally { setBusy(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader size={24} className="animate-spin text-slate-600" />
    </div>
  );

  const classes     = data?.classes     || [];
  const experiments = data?.experiments || [];
  const selectedClass = classes.find((c) => c.id === filterClass) || classes[0];

  const expForClass = selectedClass
    ? experiments.filter((e) => e.roboticsLevel === selectedClass.roboticsLevel)
    : experiments;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Experiments</h1>
        <p className="page-sub">Unlock experiments for your class and approve student submissions.</p>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab("experiments")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "experiments" ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>
          Experiments
        </button>
        <button onClick={() => setActiveTab("submissions")}
          className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === "submissions" ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>
          Pending Approvals
          {submissions.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
              {submissions.length}
            </span>
          )}
        </button>
      </div>

      {/* Class selector */}
      {classes.length > 1 && activeTab === "experiments" && (
        <div className="flex gap-3">
          <select className="input w-auto" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — L{c.roboticsLevel} {LEVEL_LABELS[c.roboticsLevel]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Experiments tab */}
      {activeTab === "experiments" && (
        <div className="space-y-2">
          {expForClass.length === 0 ? (
            <div className="card py-12 text-center">
              <FlaskConical size={28} className="empty-icon mx-auto mb-2" />
              <p className="text-sm text-slate-500">No experiments for your class level.</p>
            </div>
          ) : (
            expForClass.map((exp) => {
              const lvlColor = LEVEL_COLORS[exp.roboticsLevel] || "#6366f1";
              // Check unlock status for each class
              const classUnlocks = classes.map((c) => ({
                ...c,
                isUnlocked: exp.unlocks?.some((u) => u.classId === c.id),
                unlockDate: exp.unlocks?.find((u) => u.classId === c.id)?.unlockedAt,
              }));
              const primaryUnlock = classUnlocks.find((c) => c.id === (filterClass || classes[0]?.id));
              const isUnlocked = primaryUnlock?.isUnlocked;
              const unlockDate  = primaryUnlock?.unlockDate;
              const expSubs     = exp.submissions || [];
              const pendingCount = expSubs.filter((s) => s.status === "pending").length;
              const approvedCount = expSubs.filter((s) => s.status === "approved").length;

              return (
                <div key={exp._id} className="card space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: lvlColor + "22", color: lvlColor }}>
                      {exp.expNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500">Exp #{exp.expNumber}</span>
                        <span className="text-sm font-medium text-slate-200">{exp.title}</span>
                        <span className={`badge shrink-0 ${isUnlocked ? "badge-green" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {isUnlocked ? <><Unlock size={10} /> Unlocked</> : <><Lock size={10} /> Locked</>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={10} />{exp.duration} min</span>
                        {exp.description && <span className="truncate max-w-xs">{exp.description}</span>}
                        {isUnlocked && unlockDate && (
                          <span className="text-slate-600">Unlocked: {fmtDate(unlockDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {approvedCount > 0 && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle size={11} />{approvedCount}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="text-xs text-amber-400">{pendingCount} pending</span>
                      )}
                      <button onClick={() => setProgressExp(exp)}
                        className="btn-ghost btn-sm gap-1 text-xs">
                        <Users size={13} /> Progress
                      </button>
                      {/* Lock/Unlock for single class */}
                      {selectedClass ? (
                        <button
                          disabled={busy === exp._id + selectedClass.id}
                          onClick={() => isUnlocked
                            ? handleLock(exp, selectedClass.id)
                            : handleUnlock(exp, selectedClass.id)}
                          className={`btn-sm gap-1 text-xs ${isUnlocked ? "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20" : "btn-primary"} rounded-lg px-3 py-1.5`}>
                          {busy === exp._id + selectedClass.id
                            ? <Loader size={12} className="animate-spin" />
                            : isUnlocked ? <><Lock size={12} /> Lock</> : <><Unlock size={12} /> Unlock</>}
                        </button>
                      ) : (
                        <button onClick={() => setActionExp(actionExp === exp._id ? null : exp._id)}
                          className="btn-secondary btn-sm gap-1 text-xs">
                          Manage <ChevronDown size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multi-class unlock panel */}
                  {actionExp === exp._id && !selectedClass && (
                    <div className="mt-3 pt-3 border-t border-surface-border space-y-2">
                      {classUnlocks.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{c.name} — L{c.roboticsLevel}</span>
                          <button
                            disabled={busy === exp._id + c.id}
                            onClick={() => c.isUnlocked ? handleLock(exp, c.id) : handleUnlock(exp, c.id)}
                            className={`btn-sm gap-1 text-xs ${c.isUnlocked
                              ? "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                              : "btn-primary"} rounded-lg px-3 py-1`}>
                            {busy === exp._id + c.id
                              ? <Loader size={11} className="animate-spin" />
                              : c.isUnlocked ? <><Lock size={11} /> Lock</> : <><Unlock size={11} /> Unlock</>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pending submissions tab */}
      {activeTab === "submissions" && (
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <div className="card py-12 text-center">
              <CheckCircle size={28} className="empty-icon mx-auto mb-2 text-green-500/40" />
              <p className="text-sm text-slate-500">No pending approvals.</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub._id || sub.id} className="card space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0"
                    style={{ background: sub.student?.avatarColor + "33", color: sub.student?.avatarColor }}>
                    {sub.student?.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{sub.student?.fullName}</div>
                    <div className="text-xs text-slate-500">{sub.student?.rollNumber} · {sub.class?.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      EXP {sub.experiment?.expNumber}: {sub.experiment?.title}
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">{fmtDate(sub.submittedAt)}</span>
                </div>
                {sub.notes && (
                  <div className="text-xs text-slate-400 bg-surface rounded-lg p-2.5 leading-relaxed">
                    {sub.notes}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    disabled={busy === (sub._id || sub.id)}
                    onClick={() => handleReview(sub._id || sub.id, "approved")}
                    className="btn-primary btn-sm gap-1.5 flex-1 justify-center text-xs">
                    {busy === (sub._id || sub.id) ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                    Approve
                  </button>
                  <button
                    disabled={busy === (sub._id || sub.id)}
                    onClick={() => handleReview(sub._id || sub.id, "rejected", "Please review and resubmit.")}
                    className="bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 btn-sm gap-1.5 flex-1 justify-center text-xs rounded-lg px-3 py-1.5 flex items-center transition-colors">
                    <X size={13} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {progressExp && (
        <ProgressModal exp={progressExp} onClose={() => setProgressExp(null)} />
      )}
    </div>
  );
}
