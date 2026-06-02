import { useEffect, useRef, useState } from "react";
import {
  Plus, FileText, MoreHorizontal, Edit2, Trash2, X, Loader,
  ChevronDown, ChevronUp, CheckCircle, XCircle, ListChecks,
  Upload, Download, AlertCircle, FunctionSquare, Image as ImageIcon,
} from "lucide-react";
import api from "../../api/axios";
import ImageDropzone from "../../components/ui/ImageDropzone";
import MathRenderer  from "../../components/ui/MathRenderer";

const LEVELS = [1,2,3,4,5,6];
const LEVEL_LABELS = {
  1:"Mech Tech", 2:"Electronics", 3:"Electro Mechanical",
  4:"Digi-Coding", 5:"Digi-Sense", 6:"Wireless & IoT",
};
const LEVEL_COLORS = {
  1:"#f97316", 2:"#eab308", 3:"#22c55e",
  4:"#3b82f6", 5:"#a855f7", 6:"#ec4899",
};

/* ─────────────────────── Modal shell ─────────────────────── */
function Modal({ title, onClose, wide, children }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${wide ? "max-w-2xl" : ""}`}>
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16}/></button>
        </div>
        <div className="modal-body space-y-4">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────── Exam meta form ─────────────────────── */
function ExamForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || {
    title:"", roboticsLevel:1, totalMarks:100, passingMarks:60, durationMins:30,
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <>
      <div className="space-y-4">
        <div className="form-group">
          <label className="label">Exam Title *</label>
          <input className="input" value={form.title} onChange={e=>set("title",e.target.value)}
            placeholder="e.g. Level 1 Final Assessment"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Robotics Level *</label>
            <select className="input" value={form.roboticsLevel} onChange={e=>set("roboticsLevel",Number(e.target.value))}>
              {LEVELS.map(l=><option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Duration (minutes) *</label>
            <input className="input" type="number" min="1" value={form.durationMins}
              onChange={e=>set("durationMins",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="label">Total Marks *</label>
            <input className="input" type="number" min="1" value={form.totalMarks}
              onChange={e=>set("totalMarks",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="label">Passing Marks *</label>
            <input className="input" type="number" min="1" value={form.passingMarks}
              onChange={e=>set("passingMarks",e.target.value)}/>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={()=>onSave(form)} disabled={!form.title||saving}
          className="btn-primary btn-sm gap-1.5">
          {saving&&<Loader size={13} className="animate-spin"/>}
          {initial?"Save Changes":"Create Exam"}
        </button>
      </div>
    </>
  );
}

/* ─────────────────────── Equation preview ─────────────────────── */
function EquationInput({ value, onChange }) {
  const [show, setShow] = useState(!!value);
  if (!show) return (
    <button type="button" onClick={()=>setShow(true)}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-light transition-colors">
      <FunctionSquare size={13}/> Add equation (LaTeX)
    </button>
  );
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="label text-xs flex items-center gap-1"><FunctionSquare size={12}/> Equation (LaTeX)</label>
        <button type="button" onClick={()=>{onChange("");setShow(false);}}
          className="text-xs text-slate-600 hover:text-red-400 transition-colors">Remove</button>
      </div>
      <input className="input text-xs font-mono" value={value||""}
        onChange={e=>onChange(e.target.value)}
        placeholder="e.g.  V = IR  or  \frac{1}{2}mv^2"/>
      {value?.trim() && (
        <div className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-sm text-slate-200">
          <span className="text-xs text-slate-600 mr-2">Preview:</span>
          <MathRenderer latex={value} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Single question form ─────────────────── */
function QuestionForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial || {
    question:"", options:["","","",""], correctAnswer:0, marks:4,
    imageUrl:"", equation:"",
  });
  const set   = (k,v) => setForm(f=>({...f,[k]:v}));
  const setOpt = (i,v) => setForm(f=>{const o=[...f.options];o[i]=v;return{...f,options:o};});
  const valid  = form.question.trim() && form.options.every(o=>o.trim());

  return (
    <>
      <div className="space-y-4">
        {/* Question text */}
        <div className="form-group">
          <label className="label">Question *</label>
          <textarea className="input" rows={2} value={form.question}
            onChange={e=>set("question",e.target.value)}
            placeholder="Type the question here…"/>
        </div>

        {/* Equation */}
        <EquationInput value={form.equation} onChange={v=>set("equation",v)}/>

        {/* Image */}
        <ImageDropzone label="Question image (optional)"
          value={form.imageUrl} onChange={v=>set("imageUrl",v)}/>

        {/* Options */}
        <div className="space-y-2">
          <label className="label">Options — click the circle to mark correct answer</label>
          {form.options.map((opt,i)=>(
            <div key={i} className="flex items-center gap-2">
              <button type="button" onClick={()=>set("correctAnswer",i)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                  form.correctAnswer===i ? "border-green-500 bg-green-500" : "border-slate-600"
                }`}/>
              <input className="input flex-1 text-sm" value={opt}
                onChange={e=>setOpt(i,e.target.value)}
                placeholder={`Option ${String.fromCharCode(65+i)}`}/>
            </div>
          ))}
        </div>

        {/* Marks */}
        <div className="form-group w-32">
          <label className="label">Marks</label>
          <input className="input" type="number" min="1" value={form.marks}
            onChange={e=>set("marks",Number(e.target.value))}/>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button onClick={()=>onSave(form)} disabled={!valid}
          className="btn-primary btn-sm">
          {initial?"Save Question":"Add Question"}
        </button>
      </div>
    </>
  );
}

/* ─────────────────────── CSV helpers ───────────────────────── */
const CSV_HEADERS = ["question","optionA","optionB","optionC","optionD","correct","marks","imageUrl","equation"];
const CSV_TEMPLATE = [
  CSV_HEADERS.join(","),
  `"What does LED stand for?","Light Emitting Diode","Light Emitting Device","Low Energy Device","Large Emitting Diode",0,4,,`,
  `"What is Ohm's Law?","V = IR","V = I/R","V = R/I","V = RI",0,4,,V = IR`,
].join("\n");

function parseCSV(text) {
  const lines  = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map(h=>h.trim().replace(/^"|"$/g,""));
  return lines.slice(1).map(line=>{
    const cols = []; let cur="", inQ=false;
    for (const ch of line) {
      if (ch==='"') { inQ=!inQ; }
      else if (ch==="," && !inQ) { cols.push(cur.trim()); cur=""; }
      else { cur+=ch; }
    }
    cols.push(cur.trim());
    const obj={};
    header.forEach((h,i)=>{ obj[h]=cols[i]?.replace(/^"|"$/g,"")??""; });
    return obj;
  }).filter(r=>r.question);
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE],{type:"text/csv"});
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = "questions_template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─────────────────────── Bulk upload modal ─────────────────── */
function BulkUploadModal({ examId, onClose, onDone }) {
  const fileRef   = useRef(null);
  const [rows,     setRows]     = useState(null);
  const [fileErr,  setFileErr]  = useState("");
  const [uploading,setUploading]= useState(false);
  const [result,   setResult]   = useState(null);

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (!parsed.length) { setFileErr("No valid rows found. Check the file matches the template."); return; }
        setRows(parsed); setFileErr("");
      } catch { setFileErr("Could not parse CSV. Download the template and try again."); }
    };
    reader.readAsText(file); e.target.value="";
  };

  const handleUpload = async () => {
    if (!rows?.length) return;
    setUploading(true);
    try {
      const { data } = await api.post(`/exams/${examId}/questions/bulk`, rows);
      setResult(data); onDone();
    } catch (err) { setFileErr(err.response?.data?.message||"Upload failed."); }
    finally { setUploading(false); }
  };

  return (
    <Modal title="Bulk Upload Questions" onClose={onClose} wide>
      {!result ? (
        <>
          {/* Step 1 */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
            <div>
              <p className="text-xs font-medium text-slate-300">Step 1 — Download the CSV template</p>
              <p className="text-xs text-slate-500 mt-0.5">Columns: question, optionA–D, correct (0=A,1=B…), marks, imageUrl, equation</p>
            </div>
            <button onClick={downloadTemplate} className="btn-secondary btn-sm gap-1.5 shrink-0">
              <Download size={13}/> Template
            </button>
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Step 2 — Upload your CSV</p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile}/>
            <button onClick={()=>fileRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-surface-border rounded-lg hover:border-border-2 transition-colors cursor-pointer">
              <Upload size={20} className="text-slate-500"/>
              <span className="text-xs text-slate-400">Click to choose a CSV file</span>
            </button>
          </div>

          {fileErr && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5"/>{fileErr}
            </div>
          )}

          {/* Step 3 — preview */}
          {rows && (
            <div>
              <p className="text-xs font-medium text-slate-300 mb-2">
                Step 3 — Preview ({rows.length} question{rows.length!==1?"s":""})
              </p>
              <div className="overflow-x-auto rounded-lg border border-surface-border max-h-52">
                <table className="data-table text-xs w-full">
                  <thead>
                    <tr><th>#</th><th>Question</th><th>Options</th><th>Correct</th><th>Marks</th><th>Eq</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r,i)=>(
                      <tr key={i}>
                        <td>{i+1}</td>
                        <td className="max-w-xs truncate">{r.question}</td>
                        <td className="text-slate-500">{[r.optionA,r.optionB,r.optionC,r.optionD].filter(Boolean).length} opts</td>
                        <td>{String.fromCharCode(65+Number(r.correct||0))}</td>
                        <td>{r.marks||4}</td>
                        <td>{r.equation?"✓":"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
            <button onClick={handleUpload} disabled={!rows||uploading}
              className="btn-primary btn-sm gap-1.5">
              {uploading&&<Loader size={13} className="animate-spin"/>}
              Upload {rows?`${rows.length} Questions`:""}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle size={18} className="text-green-400 shrink-0"/>
            <div>
              <p className="text-sm font-medium text-green-400">Upload complete</p>
              <p className="text-xs text-slate-400 mt-0.5">{result.created} added · {result.skipped} skipped</p>
            </div>
          </div>
          {result.errors?.length>0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-400">Skipped rows:</p>
              {result.errors.map((e,i)=>(
                <p key={i} className="text-xs text-slate-500 bg-surface px-2 py-1 rounded">{e}</p>
              ))}
            </div>
          )}
          <div className="modal-footer"><button onClick={onClose} className="btn-primary btn-sm">Done</button></div>
        </div>
      )}
    </Modal>
  );
}

/* ─────────────────────── Questions panel ────────────────────── */
function QuestionsPanel({ exam, onClose }) {
  const [questions,  setQuestions]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showAdd,    setShowAdd]    = useState(false);
  const [editQ,      setEditQ]      = useState(null);
  const [showBulk,   setShowBulk]   = useState(false);
  const [error,      setError]      = useState("");

  const load = () => {
    setLoading(true);
    api.get(`/exams/${exam._id}/questions`)
      .then(({data})=>setQuestions(data))
      .catch(()=>setError("Failed to load questions."))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const addQ = async (form) => {
    try { await api.post(`/exams/${exam._id}/questions`,form); setShowAdd(false); load(); }
    catch(err){ setError(err.response?.data?.message||"Failed to add."); }
  };
  const saveQ = async (form) => {
    try { await api.put(`/exams/${exam._id}/questions/${editQ._id}`,form); setEditQ(null); load(); }
    catch(err){ setError(err.response?.data?.message||"Failed to save."); }
  };
  const deleteQ = async (q) => {
    if(!confirm("Delete this question?")) return;
    await api.delete(`/exams/${exam._id}/questions/${q._id}`);
    load();
  };

  return (
    <Modal title={`Questions — ${exam.title}`} onClose={onClose} wide>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {loading ? "…" : `${questions.length} question${questions.length!==1?"s":""} · ${questions.reduce((s,q)=>s+q.marks,0)} marks total`}
        </span>
        <div className="flex gap-2">
          <button onClick={()=>setShowBulk(true)} className="btn-secondary btn-sm gap-1.5">
            <Upload size={13}/> Bulk Upload
          </button>
          <button onClick={()=>setShowAdd(true)} className="btn-primary btn-sm gap-1.5">
            <Plus size={13}/> Add Question
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error text-xs">
          <span>{error}</span>
          <button onClick={()=>setError("")} className="ml-auto"><X size={13}/></button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size={18} className="animate-spin text-slate-600"/>
        </div>
      ) : questions.length===0 ? (
        <div className="empty-state py-8">
          <ListChecks size={24} className="empty-icon"/>
          <p className="empty-title">No questions yet</p>
          <p className="empty-desc">Add one manually or use Bulk Upload for many at once.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q,i)=>(
            <div key={q._id} className="bg-surface rounded-lg p-3 border border-surface-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Question text */}
                  <div className="text-xs font-medium text-slate-300">
                    <span className="text-slate-500 mr-1">Q{i+1}.</span>
                    {q.question}
                    <span className="text-slate-600 ml-1">({q.marks} mark{q.marks!==1?"s":""})</span>
                  </div>

                  {/* Equation */}
                  {q.equation && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-bg px-2 py-1 rounded border border-surface-border w-fit">
                      <FunctionSquare size={11} className="text-purple-400 shrink-0"/>
                      <MathRenderer latex={q.equation}/>
                    </div>
                  )}

                  {/* Image */}
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt="question"
                      className="rounded-lg max-h-32 object-contain border border-surface-border"/>
                  )}

                  {/* Options */}
                  <div className="space-y-1">
                    {q.options.map((opt,j)=>(
                      <div key={j} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                        j===q.correctAnswer ? "bg-green-500/10 text-green-400" : "text-slate-500"
                      }`}>
                        <span className="font-medium">{String.fromCharCode(65+j)}.</span>
                        <span>{opt}</span>
                        {j===q.correctAnswer && <CheckCircle size={11} className="ml-auto flex-shrink-0"/>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>setEditQ(q)} className="btn-ghost btn-sm p-1"><Edit2 size={13}/></button>
                  <button onClick={()=>deleteQ(q)} className="btn-ghost btn-sm p-1 text-red-400 hover:text-red-300">
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Question" onClose={()=>setShowAdd(false)} wide>
          <QuestionForm onSave={addQ} onClose={()=>setShowAdd(false)}/>
        </Modal>
      )}
      {editQ && (
        <Modal title="Edit Question" onClose={()=>setEditQ(null)} wide>
          <QuestionForm initial={editQ} onSave={saveQ} onClose={()=>setEditQ(null)}/>
        </Modal>
      )}
      {showBulk && (
        <BulkUploadModal examId={exam._id} onClose={()=>setShowBulk(false)} onDone={load}/>
      )}
    </Modal>
  );
}

/* ─────────────────────── Main exams page ────────────────────── */
export default function Exams() {
  const [exams,       setExams]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [questTarget, setQuestTarget] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [menuOpen,    setMenuOpen]    = useState(null);
  const [filterLevel, setFilterLevel] = useState("");

  const load = () => {
    setLoading(true);
    const p = filterLevel?`?level=${filterLevel}`:"";
    api.get(`/exams${p}`)
      .then(({data})=>setExams(data))
      .catch(()=>setError("Failed to load exams."))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[filterLevel]);

  const handleCreate = async (form) => {
    setSaving(true);
    try { await api.post("/exams",form); setShowCreate(false); load(); }
    catch(err){ setError(err.response?.data?.message||"Failed."); }
    finally{ setSaving(false); }
  };
  const handleEdit = async (form) => {
    setSaving(true);
    try { await api.put(`/exams/${editTarget._id}`,form); setEditTarget(null); load(); }
    catch(err){ setError(err.response?.data?.message||"Failed."); }
    finally{ setSaving(false); }
  };
  const handleDelete = async (exam) => {
    if(!confirm(`Delete "${exam.title}"?`)) return;
    try { await api.delete(`/exams/${exam._id}`); load(); }
    catch { setError("Failed to delete."); }
    setMenuOpen(null);
  };
  const handleToggle = async (exam) => {
    await api.put(`/exams/${exam._id}`,{...exam,isActive:!exam.isActive});
    load(); setMenuOpen(null);
  };

  return (
    <div className="space-y-5" onClick={()=>setMenuOpen(null)}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams</h1>
          <p className="page-sub">Create MCQ exams per curriculum level. Teachers unlock them for classes.</p>
        </div>
        <button onClick={()=>setShowCreate(true)} className="btn-primary btn-sm gap-1.5">
          <Plus size={15}/> Create Exam
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <span>{error}</span>
          <button onClick={()=>setError("")} className="ml-auto"><X size={14}/></button>
        </div>
      )}

      <div className="flex gap-3">
        <select className="input w-auto" value={filterLevel}
          onChange={e=>setFilterLevel(e.target.value)}>
          <option value="">All levels</option>
          {LEVELS.map(l=><option key={l} value={l}>Level {l} — {LEVEL_LABELS[l]}</option>)}
        </select>
      </div>

      <div className="card p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={20} className="animate-spin text-slate-600"/>
          </div>
        ) : exams.length===0 ? (
          <div className="empty-state">
            <FileText size={28} className="empty-icon"/>
            <p className="empty-title">No exams yet</p>
            <p className="empty-desc">Click "Create Exam" to add the first exam.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam</th><th>Level</th><th>Marks</th>
                  <th>Duration</th><th>Questions</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam=>{
                  const color=LEVEL_COLORS[exam.roboticsLevel]||"#6366f1";
                  return (
                    <tr key={exam._id} onClick={()=>setMenuOpen(null)}>
                      <td>
                        <div className="text-sm font-medium text-slate-200">{exam.title}</div>
                      </td>
                      <td>
                        <span className="badge" style={{color,background:color+"18"}}>
                          L{exam.roboticsLevel} · {LEVEL_LABELS[exam.roboticsLevel]}
                        </span>
                      </td>
                      <td><span className="text-xs text-slate-400">{exam.passingMarks}/{exam.totalMarks}</span></td>
                      <td><span className="text-xs text-slate-400">{exam.durationMins} min</span></td>
                      <td>
                        <button onClick={(e)=>{e.stopPropagation();setQuestTarget(exam);}}
                          className="text-xs text-blue-light hover:underline">
                          {exam.questionCount} Q
                        </button>
                      </td>
                      <td>
                        {exam.isActive
                          ?<span className="badge badge-green"><CheckCircle size={11}/> Active</span>
                          :<span className="badge badge-red"><XCircle size={11}/> Inactive</span>}
                      </td>
                      <td className="relative" onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>setMenuOpen(menuOpen===exam._id?null:exam._id)}
                          className="btn-ghost btn-sm p-1">
                          <MoreHorizontal size={15}/>
                        </button>
                        {menuOpen===exam._id&&(
                          <div className="absolute right-6 top-8 z-20 bg-bg-2 border border-surface-border rounded-lg shadow-modal w-44 py-1">
                            <button onClick={()=>{setQuestTarget(exam);setMenuOpen(null);}}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                              <ListChecks size={13}/> Manage Questions
                            </button>
                            <button onClick={()=>{setEditTarget(exam);setMenuOpen(null);}}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                              <Edit2 size={13}/> Edit Exam
                            </button>
                            <button onClick={()=>handleToggle(exam)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface hover:text-white transition-colors">
                              {exam.isActive?<><XCircle size={13}/> Deactivate</>:<><CheckCircle size={13}/> Activate</>}
                            </button>
                            <div className="my-1 border-t border-surface-border"/>
                            <button onClick={()=>handleDelete(exam)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-muted transition-colors">
                              <Trash2 size={13}/> Delete
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

      {showCreate&&(
        <Modal title="Create Exam" onClose={()=>setShowCreate(false)}>
          <ExamForm onSave={handleCreate} onClose={()=>setShowCreate(false)} saving={saving}/>
        </Modal>
      )}
      {editTarget&&(
        <Modal title="Edit Exam" onClose={()=>setEditTarget(null)}>
          <ExamForm initial={editTarget} onSave={handleEdit} onClose={()=>setEditTarget(null)} saving={saving}/>
        </Modal>
      )}
      {questTarget&&(
        <QuestionsPanel exam={questTarget} onClose={()=>setQuestTarget(null)}/>
      )}
    </div>
  );
}
