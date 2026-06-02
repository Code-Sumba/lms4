import { useEffect, useState } from "react";
import { BarChart3, CheckCircle, XCircle, Loader, Clock } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",
  4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT",
};
const LEVEL_COLORS = {
  1:"#f97316",2:"#eab308",3:"#22c55e",
  4:"#3b82f6",5:"#a855f7",6:"#ec4899",
};

export default function StudentResults() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api.get("/exams/student/list")
      .then(({data})=>setExams(data.filter(e=>e.bestAttempt)))
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={20} className="animate-spin text-slate-600"/>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Results</h1>
        <p className="page-sub">Your best score for each attempted exam.</p>
      </div>

      {exams.length===0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <BarChart3 size={28} className="empty-icon"/>
            <p className="empty-title">No results yet</p>
            <p className="empty-desc">Your results will appear here after you attempt an exam.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map(exam=>{
            const best=exam.bestAttempt;
            const pct=Math.round((best.score/best.totalMarks)*100);
            const color=LEVEL_COLORS[exam.roboticsLevel]||"#6366f1";
            return (
              <div key={exam._id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{background:color+"22",color}}>
                  {exam.roboticsLevel}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200">{exam.title}</div>
                  <div className="text-xs text-slate-500">{LEVEL_LABELS[exam.roboticsLevel]}</div>
                </div>

                {/* Score bar */}
                <div className="hidden sm:block w-32">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{pct}%</span>
                    <span>{best.score}/{best.totalMarks}</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${pct}%`,background:best.passed?"#22c55e":"#ef4444"}}/>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {best.passed
                    ?<span className="badge badge-green"><CheckCircle size={11}/> Passed</span>
                    :<span className="badge badge-red"><XCircle size={11}/> Failed</span>}
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={11}/>
                    {new Date(best.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
