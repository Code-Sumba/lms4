import { useEffect, useRef, useState } from "react";
import {
  Plus, FlaskConical, MoreHorizontal, Edit2, Trash2, X, Loader,
  Clock, ChevronDown, ChevronUp, Upload, Download, AlertCircle, CheckCircle,
} from "lucide-react";
import api from "../../api/axios";
import ImageDropzone from "../../components/ui/ImageDropzone";

const LEVELS = [1, 2, 3, 4, 5, 6];
const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};

/* ─────────────────────── Modal shell ─────────────────────── */
function Modal({ title, onClose, wide, children }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${wide ? "max-w-2xl" : ""}`}>
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16} /></button>
        </div>
        <div className="modal-body space-y-4">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────── Generic JSON list editor ─────────────── */
function JsonListEditor({ label, value, onChange, placeholder }) {
  const items = Array.isArray(value) ? value : [];
  const add    = () => onChange([...items, { ...placeholder }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(items.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  return (
    <div className="form-group space-y-2">
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        <button onClick={add} type="button" className="btn-ghost btn-sm text-xs gap-1 text-blue-light px-2">
          <Plus size={11} /> Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          {Object.keys(placeholder).map((k) => (
            <input key={k} className="input text-xs flex-1" placeholder={k}
              value={item[k] || ""}
              onChange={(e) => update(i, k, e.target.value)} />
          ))}
          <button onClick={() => remove(i)} type="button" className="btn-ghost btn-sm p-1 text-red-400 shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Components editor ─────────────────── */
function ComponentsEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const add    = () => onChange([...items, { name: "", quantity: "", imageUrl: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(items.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label">Components needed</label>
        <button onClick={add} type="button" className="btn-ghost btn-sm text-xs gap-1 text-blue-light px-2">
          <Plus size={11} /> Add Component
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-slate-600 py-3 text-center border border-dashed border-surface-border rounded-lg">
          No components yet. Click "Add Component" to start.
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="card space-y-3 relative">
          <button onClick={() => remove(i)} type="button"
            className="absolute top-3 right-3 btn-ghost btn-sm p-1 text-red-400">
            <X size={13} />
          </button>
          <div className="grid grid-cols-2 gap-3 pr-8">
            <div className="form-group">
              <label className="label text-xs">Component name</label>
              <input className="input text-xs" placeholder="e.g. LED, Resistor"
                value={item.name || ""} onChange={(e) => update(i, "name", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label text-xs">Quantity</label>
              <input className="input text-xs" placeholder="e.g. 2 or 1x"
                value={item.quantity || ""} onChange={(e) => update(i, "quantity", e.target.value)} />
            </div>
          </div>
          <ImageDropzone label="Component image (optional)"
            value={item.imageUrl || ""}
            onChange={(url) => update(i, "imageUrl", url)} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Steps editor ──────────────────────── */
function StepsEditor({ value, onChange }) {
  const steps = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState({});

  const addStep = () => {
    const newSteps = [...steps, { title: "", description: "", imageUrl: "", subSteps: [] }];
    onChange(newSteps);
    setOpen((o) => ({ ...o, [newSteps.length - 1]: true }));
  };
  const removeStep = (i) => onChange(steps.filter((_, idx) => idx !== i));
  const updateStep = (i, key, val) => onChange(steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s));

  const addSubStep = (i) => {
    const updated = steps.map((s, idx) =>
      idx === i ? { ...s, subSteps: [...(s.subSteps || []), { title: "", description: "" }] } : s
    );
    onChange(updated);
    setOpen((o) => ({ ...o, [i]: true }));
  };
  const removeSubStep = (si, ssi) => {
    onChange(steps.map((s, idx) =>
      idx === si ? { ...s, subSteps: (s.subSteps || []).filter((_, j) => j !== ssi) } : s
    ));
  };
  const updateSubStep = (si, ssi, key, val) => {
    onChange(steps.map((s, idx) =>
      idx === si
        ? { ...s, subSteps: (s.subSteps || []).map((ss, j) => j === ssi ? { ...ss, [key]: val } : ss) }
        : s
    ));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label">Step-by-step instructions</label>
        <button onClick={addStep} type="button" className="btn-ghost btn-sm text-xs gap-1 text-blue-light px-2">
          <Plus size={11} /> Add Step
        </button>
      </div>

      {steps.length === 0 && (
        <p className="text-xs text-slate-600 py-3 text-center border border-dashed border-surface-border rounded-lg">
          No steps yet. Click "Add Step" to start.
        </p>
      )}

      {steps.map((step, i) => (
        <div key={i} className="border border-surface-border rounded-lg overflow-hidden">
          {/* Step header */}
          <div className="flex items-center gap-3 px-3 py-2 bg-surface cursor-pointer"
            onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}>
            <div className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </div>
            <span className="flex-1 text-sm text-slate-300 truncate">
              {step.title || <span className="text-slate-600">Untitled step</span>}
            </span>
            {(step.subSteps || []).length > 0 && (
              <span className="text-xs text-slate-600">{step.subSteps.length} sub-step{step.subSteps.length !== 1 ? "s" : ""}</span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              {open[i]
                ? <ChevronUp size={14} className="text-slate-500" />
                : <ChevronDown size={14} className="text-slate-500" />}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeStep(i); }}
                className="btn-ghost btn-sm p-1 text-red-400 hover:text-red-300">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Step body */}
          {open[i] && (
            <div className="p-3 space-y-3 bg-bg">
              {/* Main step fields */}
              <div className="form-group">
                <label className="label text-xs">Step title</label>
                <input className="input text-xs" placeholder="e.g. Connect the LED to the breadboard"
                  value={step.title || ""}
                  onChange={(e) => updateStep(i, "title", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label text-xs">Description</label>
                <textarea className="input text-xs" rows={2}
                  placeholder="Detailed explanation of this step..."
                  value={step.description || ""}
                  onChange={(e) => updateStep(i, "description", e.target.value)} />
              </div>
              <ImageDropzone label="Step image (optional)"
                value={step.imageUrl || ""}
                onChange={(url) => updateStep(i, "imageUrl", url)} />

              {/* Sub-steps */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Sub-steps</span>
                  <button type="button" onClick={() => addSubStep(i)}
                    className="btn-ghost btn-sm text-xs gap-1 text-blue-light px-2">
                    <Plus size={10} /> Add Sub-step
                  </button>
                </div>

                {(step.subSteps || []).length === 0 && (
                  <p className="text-xs text-slate-700 italic">No sub-steps. Click "Add Sub-step" to break this step into smaller actions.</p>
                )}

                {(step.subSteps || []).map((ss, j) => (
                  <div key={j} className="flex gap-2 items-start pl-3 border-l-2 border-surface-border">
                    <div className="flex-1 space-y-1.5">
                      <input className="input text-xs" placeholder={`Sub-step ${j + 1} title`}
                        value={ss.title || ""}
                        onChange={(e) => updateSubStep(i, j, "title", e.target.value)} />
                      <textarea className="input text-xs" rows={1}
                        placeholder="Sub-step description..."
                        value={ss.description || ""}
                        onChange={(e) => updateSubStep(i, j, "description", e.target.value)} />
                    </div>
                    <button type="button" onClick={() => removeSubStep(i, j)}
                      className="btn-ghost btn-sm p-1 text-red-400 shrink-0 mt-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Diagrams editor ────────────────────── */
function DiagramsEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const add    = () => onChange([...items, { url: "", caption: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(items.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label">Diagrams</label>
        <button onClick={add} type="button" className="btn-ghost btn-sm text-xs gap-1 text-blue-light px-2">
          <Plus size={11} /> Add Diagram
        </button>
      </div>
      {items.length === 0 && (
        <p className="text-xs text-slate-600 py-3 text-center border border-dashed border-surface-border rounded-lg">
          No diagrams yet. Click "Add Diagram" to start.
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="card space-y-3 relative">
          <button onClick={() => remove(i)} type="button"
            className="absolute top-3 right-3 btn-ghost btn-sm p-1 text-red-400">
            <X size={13} />
          </button>
          <div className="pr-8">
            <ImageDropzone label={`Diagram ${i + 1} — drag & drop or paste URL`}
              value={item.url || ""}
              onChange={(url) => update(i, "url", url)} />
          </div>
          <div className="form-group">
            <label className="label text-xs">Caption (optional)</label>
            <input className="input text-xs" placeholder="e.g. Circuit wiring diagram"
              value={item.caption || ""} onChange={(e) => update(i, "caption", e.target.value)} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Experiment form ────────────────────── */
function ExperimentForm({ initial, onSave, onClose, saving }) {
  const blank = {
    title: "", description: "", objectives: "", roboticsLevel: 1, expNumber: 1,
    category: "Practical", duration: 30, videoUrl: "", url: "",
    components: [], steps: [], diagrams: [],
  };
  const [form, setForm] = useState(initial ? { ...blank, ...initial } : blank);
  const [tab,  setTab]  = useState("basic");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const TABS = ["basic", "components", "steps", "diagrams"];

  return (
    <>
      <div className="flex gap-1 bg-surface p-1 rounded-lg w-fit mb-4">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-bg text-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "basic" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Exp Number</label>
              <input className="input" type="number" min={1} value={form.expNumber}
                onChange={(e) => set("expNumber", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Robotics Level *</label>
              <select className="input" value={form.roboticsLevel} onChange={(e) => set("roboticsLevel", Number(e.target.value))}>
                {LEVELS.map((l) => <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Switching ON/OFF Buzzer by Switch" />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short summary of the experiment" />
          </div>
          <div className="form-group">
            <label className="label">Objectives</label>
            <textarea className="input" rows={2} value={form.objectives}
              onChange={(e) => set("objectives", e.target.value)}
              placeholder="What students will learn or build" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="Practical">Practical</option>
                <option value="Theory">Theory</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Duration (min)</label>
              <input className="input" type="number" min={1} value={form.duration}
                onChange={(e) => set("duration", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Demo Video URL (YouTube)</label>
            <input className="input" type="url" value={form.videoUrl}
              onChange={(e) => set("videoUrl", e.target.value)}
              placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="form-group">
            <label className="label">Guide / PDF URL</label>
            <input className="input" type="url" value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://drive.google.com/file/..." />
          </div>
        </div>
      )}

      {tab === "components" && (
        <ComponentsEditor value={form.components} onChange={(v) => set("components", v)} />
      )}

      {tab === "steps" && (
        <StepsEditor value={form.steps} onChange={(v) => set("steps", v)} />
      )}

      {tab === "diagrams" && (
        <DiagramsEditor value={form.diagrams} onChange={(v) => set("diagrams", v)} />
      )}

      <div className="modal-footer mt-4">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={() => onSave(form)} disabled={!form.title || saving} className="btn-primary btn-sm gap-1.5">
          {saving && <Loader size={13} className="animate-spin" />}
          {initial ? "Save Changes" : "Add Experiment"}
        </button>
      </div>
    </>
  );
}

/* ─────────────────────── CSV helpers ───────────────────────── */
const CSV_HEADERS = ["expNumber", "title", "description", "objectives", "roboticsLevel", "category", "duration", "videoUrl", "url"];
const CSV_TEMPLATE = [
  CSV_HEADERS.join(","),
  `1,EXP 1: Exploring Simple LED Circuits,Build your first LED circuit,Learn basic circuit construction,1,Practical,30,,`,
  `2,EXP 2: Switching ON and OFF LED,Control an LED using a switch,Understand switch control,1,Practical,30,,`,
].join("\n");

function parseCSV(text) {
  const lines  = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas inside
    const cols = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const obj = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ""; });
    return obj;
  });
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = "experiments_template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─────────────────────── Bulk upload modal ─────────────────── */
function BulkUploadModal({ onClose, onDone }) {
  const fileRef  = useRef(null);
  const [rows,     setRows]     = useState(null);  // parsed preview rows
  const [fileErr,  setFileErr]  = useState("");
  const [uploading,setUploading]= useState(false);
  const [result,   setResult]   = useState(null);  // { created, skipped, errors }

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) { setFileErr("CSV is empty or has no data rows."); return; }
        setRows(parsed);
        setFileErr("");
      } catch {
        setFileErr("Could not parse the file. Make sure it matches the template format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!rows?.length) return;
    setUploading(true);
    try {
      const { data } = await api.post("/experiments/bulk", rows);
      setResult(data);
      onDone();
    } catch (err) {
      setFileErr(err.response?.data?.message || "Bulk upload failed.");
    } finally { setUploading(false); }
  };

  return (
    <Modal title="Bulk Upload Experiments" onClose={onClose} wide>
      {!result ? (
        <>
          {/* Step 1 — download template */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
            <div>
              <p className="text-xs font-medium text-slate-300">Step 1 — Download the CSV template</p>
              <p className="text-xs text-slate-500 mt-0.5">Fill in experiment details. One row per experiment.</p>
            </div>
            <button onClick={downloadTemplate} className="btn-secondary btn-sm gap-1.5 shrink-0">
              <Download size={13} /> Template
            </button>
          </div>

          {/* Step 2 — upload file */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Step 2 — Upload your filled CSV</p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-surface-border rounded-lg hover:border-border-2 transition-colors cursor-pointer">
              <Upload size={20} className="text-slate-500" />
              <span className="text-xs text-slate-400">Click to choose a CSV file</span>
            </button>
          </div>

          {fileErr && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />{fileErr}
            </div>
          )}

          {/* Step 3 — preview */}
          {rows && (
            <div>
              <p className="text-xs font-medium text-slate-300 mb-2">
                Step 3 — Preview ({rows.length} row{rows.length !== 1 ? "s" : ""})
              </p>
              <div className="overflow-x-auto rounded-lg border border-surface-border max-h-52">
                <table className="data-table text-xs w-full">
                  <thead>
                    <tr>
                      <th>#</th><th>Title</th><th>Level</th><th>Category</th><th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={!r.title || !r.roboticsLevel ? "text-red-400" : ""}>
                        <td>{r.expNumber || i + 1}</td>
                        <td>{r.title || <span className="text-red-400">missing</span>}</td>
                        <td>{r.roboticsLevel ? `L${r.roboticsLevel}` : <span className="text-red-400">missing</span>}</td>
                        <td>{r.category || "Practical"}</td>
                        <td>{r.duration || 30} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleUpload} disabled={!rows || uploading}
              className="btn-primary btn-sm gap-1.5">
              {uploading && <Loader size={13} className="animate-spin" />}
              Upload {rows ? `${rows.length} Experiments` : ""}
            </button>
          </div>
        </>
      ) : (
        /* Result screen */
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle size={18} className="text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">Upload complete</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {result.created} created · {result.skipped} skipped
              </p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-400">Skipped rows:</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-slate-500 bg-surface px-2 py-1 rounded">{e}</p>
              ))}
            </div>
          )}
          <div className="modal-footer">
            <button onClick={onClose} className="btn-primary btn-sm">Done</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─────────────────────── Main page ─────────────────────────── */
export default function Experiments() {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [showBulk,    setShowBulk]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [menuOpen,    setMenuOpen]    = useState(null);
  const [filterLevel, setFilterLevel] = useState("");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLevel) params.set("level", filterLevel);
    api.get(`/experiments?${params}`)
      .then(({ data }) => setItems(data))
      .catch(() => setError("Failed to load experiments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterLevel]);

  const handleCreate = async (form) => {
    setSaving(true);
    try { await api.post("/experiments", form); setShowCreate(false); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to create."); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try { await api.put(`/experiments/${editTarget._id}`, form); setEditTarget(null); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to update."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "EXP ${item.expNumber}: ${item.title}"?`)) return;
    try { await api.delete(`/experiments/${item._id}`); load(); }
    catch { setError("Failed to delete."); }
    setMenuOpen(null);
  };

  const handleToggleActive = async (item) => {
    try { await api.put(`/experiments/${item._id}`, { isActive: !item.isActive }); load(); }
    catch { setError("Failed to update."); }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-5" onClick={() => setMenuOpen(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Experiments</h1>
          <p className="page-sub">Manage hands-on robotics experiments for all curriculum levels.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="btn-secondary btn-sm gap-1.5">
            <Upload size={14} /> Bulk Upload
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
            <Plus size={15} /> Add Experiment
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select className="input w-auto" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
          <option value="">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>)}
        </select>
      </div>

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FlaskConical size={28} className="empty-icon" />
            <p className="empty-title">No experiments yet</p>
            <p className="empty-desc">Add one manually or use Bulk Upload for many at once.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Experiment</th><th>Level</th><th>Category</th><th>Duration</th><th>Steps</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const lvlColor = LEVEL_COLORS[item.roboticsLevel] || "#6366f1";
                  const stepCount = Array.isArray(item.steps) ? item.steps.length : 0;
                  return (
                    <tr key={item._id} onClick={() => setMenuOpen(null)}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500 shrink-0">#{item.expNumber}</span>
                          <div>
                            <div className="text-sm font-medium text-slate-200">{item.title}</div>
                            {item.description && <div className="text-xs text-slate-500 truncate max-w-xs">{item.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ color: lvlColor, background: lvlColor + "18" }}>
                          L{item.roboticsLevel} · {LEVEL_LABELS[item.roboticsLevel]}
                        </span>
                      </td>
                      <td><span className="badge badge-gray">{item.category}</span></td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} />{item.duration} min
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-500">{stepCount} step{stepCount !== 1 ? "s" : ""}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.isActive ? "badge-green" : "badge-gray"}`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setMenuOpen(menuOpen === item._id ? null : item._id)}
                          className="btn-ghost btn-sm p-1">
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpen === item._id && (
                          <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-44 py-1">
                            <button onClick={() => { setEditTarget(item); setMenuOpen(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                              <Edit2 size={13} /> Edit
                            </button>
                            <button onClick={() => handleToggleActive(item)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                              {item.isActive ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                              {item.isActive ? "Deactivate" : "Activate"}
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
        <Modal title="Add Experiment" onClose={() => setShowCreate(false)} wide>
          <ExperimentForm onSave={handleCreate} onClose={() => setShowCreate(false)} saving={saving} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit Experiment" onClose={() => setEditTarget(null)} wide>
          <ExperimentForm initial={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} saving={saving} />
        </Modal>
      )}
      {showBulk && (
        <BulkUploadModal onClose={() => setShowBulk(false)} onDone={load} />
      )}
    </div>
  );
}
