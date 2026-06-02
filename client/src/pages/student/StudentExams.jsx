import { useEffect, useState, useCallback } from "react";
import { FileText, Clock, CheckCircle, XCircle, Loader, ArrowRight, AlertTriangle } from "lucide-react";
import api from "../../api/axios";
import MathRenderer from "../../components/ui/MathRenderer";

const LEVEL_LABELS = {
  1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",
  4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT",
};
const LEVEL_COLORS = {
  1:"#f97316",2:"#eab308",3:"#22c55e",
  4:"#3b82f6",5:"#a855f7",6:"#ec4899",
};

/* ── Timer display ── */
function Timer({ secsLeft }) {
  const m = String(Math.floor(secsLeft/60)).padStart(2,"0");
  const s = String(secsLeft%60).padStart(2,"0");
  const urgent = secsLeft<=60;
  return (
    <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1.5 rounded-lg ${urgent?"bg-red-500/20 text-red-400":"bg-surface text-slate-300"}`}>
      <Clock size={14}/> {m}:{s}
    </div>
  );
}

/* ── Active exam UI ── */
function TakeExam({ exam, questions, onDone }) {
  const [answers,  setAnswers]  = useState({});
  const [secsLeft, setSecsLeft] = useState(exam.durationMins*60);
  const [submitting,setSubmitting]=useState(false);

  const submit = useCallback(async () => {
    if(submitting) return;
    setSubmitting(true);
    try {
      const {data} = await api.post(`/exams/student/${exam._id}/attempt`,{answers});
      onDone(data);
    } catch { setSubmitting(false); }
  },[answers,exam,onDone,submitting]);

  // Countdown
  useEffect(()=>{
    if(secsLeft<=0){ submit(); return; }
    const t = setTimeout(()=>setSecsLeft(s=>s-1),1000);
    return ()=>clearTimeout(t);
  },[secsLeft,submit]);

  const answered = Object.keys(answers).length;
  const color    = LEVEL_COLORS[exam.roboticsLevel]||"#6366f1";

  return (
    <div className="space-y-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur border-b border-surface-border pb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-200">{exam.title}</div>
          <div className="text-xs text-slate-500">{answered}/{questions.length} answered · {exam.passingMarks}/{exam.totalMarks} to pass</div>
        </div>
        <div className="flex items-center gap-3">
          <Timer secsLeft={secsLeft}/>
          <button onClick={submit} disabled={submitting}
            className="btn-primary btn-sm gap-1.5">
            {submitting?<Loader size={13} className="animate-spin"/>:<ArrowRight size={13}/>}
            Submit
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q,i)=>(
          <div key={q._id} className="card space-y-3">
            <div className="text-sm font-medium text-slate-200">
              <span className="text-slate-500 mr-2">Q{i+1}.</span>{q.question}
              <span className="text-xs text-slate-600 ml-2">({q.marks} mark{q.marks!==1?"s":""})</span>
            </div>
            {/* Equation */}
            {q.equation && (
              <div className="px-3 py-2 rounded-lg bg-surface border border-surface-border text-sm text-slate-200 w-fit">
                <MathRenderer latex={q.equation}/>
              </div>
            )}
            {/* Image */}
            {q.imageUrl && (
              <img src={q.imageUrl} alt={`Q${i+1}`}
                className="rounded-lg max-h-48 object-contain border border-surface-border"/>
            )}
            <div className="space-y-2">
              {q.options.map((opt,j)=>{
                const selected=answers[q._id]===j;
                return (
                  <button key={j} onClick={()=>setAnswers(a=>({...a,[q._id]:j}))}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                      selected
                        ?"border-blue/50 bg-blue-muted text-blue-light"
                        :"border-surface-border bg-surface hover:border-border-2 text-slate-400"
                    }`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-2xs font-bold ${selected?"border-blue bg-blue text-white":"border-slate-600"}`}>
                      {String.fromCharCode(65+j)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button onClick={submit} disabled={submitting}
        className="btn-primary btn-lg w-full gap-2">
        {submitting?<Loader size={16} className="animate-spin"/>:<ArrowRight size={16}/>}
        Submit Exam
      </button>
    </div>
  );
}

/* ── Result screen ── */
function ResultScreen({ result, exam, onBack }) {
  const pct = Math.round((result.score/result.totalMarks)*100);
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-10">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${result.passed?"bg-green-500/20":"bg-red-500/20"}`}>
        {result.passed
          ?<CheckCircle size={36} className="text-green-400"/>
          :<XCircle size={36} className="text-red-400"/>}
      </div>
      <div>
        <div className={`text-2xl font-bold mb-1 ${result.passed?"text-green-400":"text-red-400"}`}>
          {result.passed?"Passed!":"Not Passed"}
        </div>
        <div className="text-slate-400 text-sm">{exam.title}</div>
      </div>
      <div className="card text-center">
        <div className="text-4xl font-bold text-slate-100 mb-1">{result.score}<span className="text-lg text-slate-500">/{result.totalMarks}</span></div>
        <div className="text-sm text-slate-500">{pct}% · Passing score: {exam.passingMarks}/{exam.totalMarks}</div>
      </div>
      <button onClick={onBack} className="btn-secondary btn-lg w-full">Back to Exams</button>
    </div>
  );
}

/* ── Main page ── */
export default function StudentExams() {
  const [exams,    setExams]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState(null); // { exam, questions }
  const [result,   setResult]   = useState(null);
  const [starting, setStarting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/exams/student/list")
      .then(({data})=>setExams(data))
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const startExam = async (exam) => {
    setStarting(exam._id);
    try {
      const {data} = await api.get(`/exams/student/${exam._id}/questions`);
      setActive({exam:data.exam, questions:data.questions});
    } finally { setStarting(null); }
  };

  const onDone = (res) => {
    setResult({result:res, exam:active.exam});
    setActive(null);
    load();
  };

  if(result) return <ResultScreen result={result.result} exam={result.exam} onBack={()=>setResult(null)}/>;
  if(active) return <TakeExam exam={active.exam} questions={active.questions} onDone={onDone}/>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Exams</h1>
        <p className="page-sub">Exams unlocked by your teacher appear here.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600"/>
        </div>
      ) : exams.length===0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <FileText size={28} className="empty-icon"/>
            <p className="empty-title">No exams available</p>
            <p className="empty-desc">Your teacher will unlock exams for your class.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map(exam=>{
            const color=LEVEL_COLORS[exam.roboticsLevel]||"#6366f1";
            const best=exam.bestAttempt;
            return (
              <div key={exam._id} className="card hover:border-border-2 transition-colors">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={{background:color+"22",color}}>
                    {exam.roboticsLevel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{exam.title}</div>
                    <div className="text-xs text-slate-500">{LEVEL_LABELS[exam.roboticsLevel]}</div>
                  </div>
                  {best&&(best.passed
                    ?<span className="badge badge-green flex-shrink-0"><CheckCircle size={11}/> Passed</span>
                    :<span className="badge badge-red flex-shrink-0"><XCircle size={11}/> Failed</span>)}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    {label:"Duration",  val:`${exam.durationMins} min`},
                    {label:"Marks",     val:`${exam.passingMarks}/${exam.totalMarks}`},
                    {label:"Questions", val:`${exam.questionCount} Q`},
                  ].map(s=>(
                    <div key={s.label} className="bg-surface rounded-lg p-2 text-center">
                      <div className="text-sm font-semibold text-slate-200">{s.val}</div>
                      <div className="text-xs text-slate-600">{s.label}</div>
                    </div>
                  ))}
                </div>

                {best&&(
                  <div className="text-xs text-slate-500 mb-3">
                    Best score: <span className="text-slate-300 font-medium">{best.score}/{best.totalMarks}</span>
                  </div>
                )}

                <button onClick={()=>startExam(exam)} disabled={starting===exam._id}
                  className="btn-primary btn-sm w-full gap-1.5">
                  {starting===exam._id?<Loader size={13} className="animate-spin"/>:<ArrowRight size={13}/>}
                  {best?"Retake Exam":"Start Exam"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
