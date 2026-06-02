import { useEffect, useState } from "react";
import { FileText, Lock, Unlock, Users, ChevronDown, ChevronUp, Loader, CheckCircle, XCircle, X } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",
  4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT",
};
const LEVEL_COLORS = {
  1:"#f97316",2:"#eab308",3:"#22c55e",
  4:"#3b82f6",5:"#a855f7",6:"#ec4899",
};

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box max-w-2xl">
        <div className="modal-header">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <button onClick={onClose} className="btn-ghost btn-sm p-1"><X size={16}/></button>
        </div>
        <div className="modal-body space-y-3">{children}</div>
      </div>
    </div>
  );
}

function ResultsModal({ exam, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get(`/exams/teacher/results/${exam._id}`)
      .then(({data})=>setResults(data))
      .finally(()=>setLoading(false));
  },[]);

  return (
    <Modal title={`Results — ${exam.title}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8"><Loader size={18} className="animate-spin text-slate-600"/></div>
      ) : results.length===0 ? (
        <p className="text-sm text-slate-500 text-center py-6">No attempts yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>
              {results.map(r=>(
                <tr key={r._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-semibold text-white flex-shrink-0"
                        style={{background:r.student.avatarColor||"#6366f1"}}>{r.student.fullName[0]}</div>
                      <div>
                        <div className="text-xs font-medium text-slate-200">{r.student.fullName}</div>
                        <div className="text-xs text-slate-500">{r.student.rollNumber||r.student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-sm font-semibold text-slate-200">{r.score}<span className="text-xs text-slate-500">/{r.totalMarks}</span></span></td>
                  <td>{r.passed?<span className="badge badge-green"><CheckCircle size={11}/> Pass</span>:<span className="badge badge-red"><XCircle size={11}/> Fail</span>}</td>
                  <td className="text-xs text-slate-500">{new Date(r.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="modal-footer"><button onClick={onClose} className="btn-secondary btn-sm">Close</button></div>
    </Modal>
  );
}

export default function TeacherExams() {
  const [exams,        setExams]        = useState([]);
  const [classes,      setClasses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState(null);
  const [resultsTarget,setResultsTarget]= useState(null);
  const [toggling,     setToggling]     = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/exams/teacher/list")
      .then(({data})=>{ setExams(data.exams); setClasses(data.classes); })
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const isUnlocked = (examId, classId) => {
    const cls = classes.find(c=>c._id===classId);
    return cls?.unlockedExamIds?.includes(examId);
  };

  const toggle = async (examId, classId) => {
    const key = `${examId}:${classId}`;
    setToggling(key);
    try {
      if(isUnlocked(examId,classId)){
        await api.delete(`/exams/teacher/unlock/${examId}/${classId}`);
      } else {
        await api.post("/exams/teacher/unlock",{examId,classId});
      }
      load();
    } finally { setToggling(null); }
  };

  const relevantClasses = (exam) =>
    classes.filter(c=>c.roboticsLevel===exam.roboticsLevel);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Exams</h1>
        <p className="page-sub">Unlock exams for your classes and monitor student results.</p>
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
            <p className="empty-desc">The SuperAdmin will create exams for your curriculum levels.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam=>{
            const color=LEVEL_COLORS[exam.roboticsLevel]||"#6366f1";
            const myClasses=relevantClasses(exam);
            const isOpen=expanded===exam._id;
            return (
              <div key={exam._id} className="card p-0">
                <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={()=>setExpanded(isOpen?null:exam._id)}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{background:color+"22",color}}>
                    {exam.roboticsLevel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{exam.title}</div>
                    <div className="text-xs text-slate-500">
                      {LEVEL_LABELS[exam.roboticsLevel]} · {exam.durationMins} min · {exam.passingMarks}/{exam.totalMarks} to pass · {exam.questionCount} Q
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e=>{e.stopPropagation();setResultsTarget(exam);}}
                      className="btn-secondary btn-sm gap-1.5 text-xs">
                      <Users size={12}/> Results
                    </button>
                    {isOpen?<ChevronUp size={15} className="text-slate-500"/>:<ChevronDown size={15} className="text-slate-500"/>}
                  </div>
                </div>

                {isOpen&&(
                  <div className="border-t border-surface-border p-4 space-y-2">
                    <p className="text-xs text-slate-500 mb-3">Toggle unlock for each class:</p>
                    {myClasses.length===0 ? (
                      <p className="text-xs text-slate-600">No classes assigned at this level.</p>
                    ) : myClasses.map(cls=>{
                      const unlocked=isUnlocked(exam._id,cls._id);
                      const key=`${exam._id}:${cls._id}`;
                      return (
                        <div key={cls._id} className="flex items-center justify-between p-2.5 bg-surface rounded-lg">
                          <div className="text-sm text-slate-300">{cls.name}</div>
                          <button onClick={()=>toggle(exam._id,cls._id)} disabled={toggling===key}
                            className={`btn-sm gap-1.5 ${unlocked?"btn-secondary text-green-400":"btn-secondary text-slate-500"}`}>
                            {toggling===key?<Loader size={12} className="animate-spin"/>:unlocked?<><Unlock size={12}/> Unlocked</>:<><Lock size={12}/> Locked</>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {resultsTarget&&<ResultsModal exam={resultsTarget} onClose={()=>setResultsTarget(null)}/>}
    </div>
  );
}
