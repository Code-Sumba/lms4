import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, FlaskConical, Video, BookOpen, Wrench, List, Image,
  CheckCircle, Loader, ExternalLink, Play, Send, AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_BG = {
  1: "from-orange-600 to-orange-800", 2: "from-purple-600 to-purple-800",
  3: "from-green-600 to-green-800",  4: "from-blue-600 to-blue-800",
  5: "from-violet-600 to-violet-800", 6: "from-pink-600 to-pink-800",
};

function getYoutubeId(url) {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

const TABS = [
  { key: "overview",   label: "Overview",    icon: FlaskConical },
  { key: "video",      label: "Demo Video",  icon: Video        },
  { key: "components", label: "Components",  icon: Wrench       },
  { key: "steps",      label: "Steps",       icon: List         },
  { key: "diagrams",   label: "Diagrams",    icon: Image        },
];

export default function StudentExperimentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exp,        setExp]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("overview");
  const [notes,      setNotes]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subError,   setSubError]   = useState("");

  const load = () => {
    setLoading(true);
    api.get(`/student/experiments/${id}`)
      .then(({ data }) => { setExp(data); if (data.submission?.notes) setNotes(data.submission.notes); })
      .catch(() => navigate("/student/experiments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true); setSubError("");
    try {
      await api.post(`/student/experiments/${id}/submit`, { notes });
      load();
    } catch (err) {
      setSubError(err.response?.data?.message || "Failed to submit.");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader size={24} className="animate-spin text-slate-600" />
    </div>
  );
  if (!exp) return null;

  const ytId    = getYoutubeId(exp.videoUrl);
  const lvlBg   = LEVEL_BG[exp.roboticsLevel] || "from-indigo-600 to-indigo-800";
  const sub      = exp.submission;
  const components = Array.isArray(exp.components) ? exp.components : [];
  const steps      = Array.isArray(exp.steps)      ? exp.steps      : [];
  const diagrams   = Array.isArray(exp.diagrams)   ? exp.diagrams   : [];

  const canSubmit = exp.unlocked && (!sub || sub.status === "rejected");

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate("/student/experiments")}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft size={15} /> Back to Experiments
      </button>

      {/* Header banner */}
      <div className={`rounded-xl p-5 bg-gradient-to-r ${lvlBg} text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium opacity-70 mb-1">Experiment {exp.expNumber}</div>
            <h1 className="text-lg font-bold leading-tight">
              EXP {exp.expNumber}: {exp.title}
            </h1>
            {exp.description && <p className="text-sm opacity-75 mt-1">{exp.description}</p>}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full">
              <Clock size={11} />{exp.duration} min
            </span>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{exp.category}</span>
          </div>
        </div>
      </div>

      {/* Submission status banner */}
      {sub?.status === "approved" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
          <CheckCircle size={16} />
          <div className="text-sm font-medium">Experiment Approved</div>
          {sub.reviewNotes && <div className="text-xs text-green-300 ml-auto">{sub.reviewNotes}</div>}
        </div>
      )}
      {sub?.status === "pending" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Clock size={16} />
          <div className="text-sm font-medium">Awaiting Teacher Approval</div>
        </div>
      )}
      {sub?.status === "rejected" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle size={16} />
          <div>
            <div className="text-sm font-medium">Submission Rejected — please resubmit</div>
            {sub.reviewNotes && <div className="text-xs mt-0.5">{sub.reviewNotes}</div>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 bg-surface p-1 rounded-lg w-full">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === t.key ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
              }`}>
              <Icon size={12} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {exp.objectives && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Objectives</h3>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{exp.objectives}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="card bg-blue-500/5 border-blue-500/15 space-y-1">
              <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Play size={11} /> How to Watch
              </h4>
              <ul className="space-y-1 text-xs text-slate-400 mt-2">
                <li>• Watch the complete demo first</li>
                <li>• Pause and replay sections as needed</li>
                <li>• Take notes of important steps</li>
                <li>• Compare with your actual results</li>
              </ul>
            </div>
            <div className="card bg-green-500/5 border-green-500/15 space-y-1">
              <h4 className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                <CheckCircle size={11} /> What You'll See
              </h4>
              <ul className="space-y-1 text-xs text-slate-400 mt-2">
                <li>• Component identification</li>
                <li>• Proper wiring technique</li>
                <li>• Testing and troubleshooting</li>
                <li>• Expected output behavior</li>
              </ul>
            </div>
          </div>
          {exp.url && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Additional Resources</h3>
              <div className="flex flex-wrap gap-3">
                {exp.url && (
                  <a href={exp.url} target="_blank" rel="noopener noreferrer"
                    className="btn-secondary btn-sm gap-1.5">
                    <BookOpen size={13} /> Open Digital Books
                  </a>
                )}
                {steps.length > 0 && (
                  <button onClick={() => setActiveTab("steps")} className="btn-primary btn-sm gap-1.5">
                    <List size={13} /> View Step-by-Step
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "video" && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Video size={14} className="text-purple-400" /> Experiment Demo Video
              </h3>
              <span className="text-xs text-red-400 font-medium">● Watch First!</span>
            </div>
            {ytId ? (
              <div className="rounded-lg overflow-hidden aspect-video bg-black">
                <iframe src={`https://www.youtube.com/embed/${ytId}`} title={exp.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
            ) : exp.videoUrl ? (
              <div className="flex items-center justify-center py-12 bg-surface rounded-lg">
                <a href={exp.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-primary btn-sm gap-1.5">
                  <ExternalLink size={13} /> Open Video
                </a>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-600 text-sm">No demo video available.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "components" && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Wrench size={14} className="text-amber-light" /> Components Required
          </h3>
          {components.length === 0 ? (
            <p className="text-sm text-slate-600">No components listed.</p>
          ) : (
            <div className="space-y-3">
              {components.map((c, i) => (
                <div key={i} className="border-b border-surface-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{c.name}</span>
                    {c.quantity && (
                      <span className="text-xs font-medium text-slate-500 bg-surface px-2 py-0.5 rounded">
                        × {c.quantity}
                      </span>
                    )}
                  </div>
                  {c.imageUrl && (
                    <img src={c.imageUrl} alt={c.name}
                      className="mt-2 rounded-lg max-h-40 object-contain border border-surface-border" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "steps" && (
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="card py-10 text-center text-slate-600 text-sm">No steps available.</div>
          ) : (
            steps.map((step, i) => (
              <div key={i} className="card space-y-3">
                {/* Step header */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {step.title && <div className="text-sm font-semibold text-slate-200">{step.title}</div>}
                    {step.description && (
                      <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{step.description}</p>
                    )}
                    {step.imageUrl && (
                      <img src={step.imageUrl} alt={`Step ${i + 1}`}
                        className="mt-2 rounded-lg max-h-48 object-contain border border-surface-border" />
                    )}
                  </div>
                </div>
                {/* Sub-steps */}
                {Array.isArray(step.subSteps) && step.subSteps.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {step.subSteps.map((ss, j) => (
                      <div key={j} className="flex gap-2 pl-3 border-l-2 border-blue-500/20">
                        <div className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                          {String.fromCharCode(97 + j)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {ss.title && <div className="text-xs font-medium text-slate-300">{ss.title}</div>}
                          {ss.description && (
                            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{ss.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "diagrams" && (
        <div className="space-y-4">
          {diagrams.length === 0 ? (
            <div className="card py-10 text-center text-slate-600 text-sm">No diagrams available.</div>
          ) : (
            diagrams.map((d, i) => (
              <div key={i} className="card">
                <img src={d.url} alt={d.caption || `Diagram ${i + 1}`}
                  className="w-full rounded-lg object-contain max-h-80" />
                {d.caption && <p className="text-xs text-slate-500 mt-2 text-center">{d.caption}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Mark as complete */}
      {canSubmit && (
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Mark as Complete</h3>
          <p className="text-xs text-slate-500">
            After completing this experiment with your kit, submit it for teacher approval.
          </p>
          {subError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {subError}
            </div>
          )}
          <textarea className="input text-sm" rows={3}
            placeholder="Add any notes about your experiment (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)} />
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary btn-sm gap-1.5 w-full justify-center">
            {submitting ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
            Submit for Approval
          </button>
        </div>
      )}
    </div>
  );
}
