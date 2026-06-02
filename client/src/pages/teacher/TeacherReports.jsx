import { useEffect, useState } from "react";
import { BarChart3, Users, BookOpen, CheckCircle, XCircle, Loader, TrendingUp } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = { 1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT" };
const LEVEL_COLORS = { 1:"#f97316",2:"#eab308",3:"#22c55e",4:"#3b82f6",5:"#a855f7",6:"#ec4899" };

export default function TeacherReports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teacher/reports")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={20} className="animate-spin text-slate-600" />
    </div>
  );

  if (!data) return <div className="card text-center text-slate-500 py-12">Failed to load reports.</div>;

  const totalAttempts = data.classes.reduce((s, c) => s + c.totalAttempts, 0);
  const totalPassed   = data.classes.reduce((s, c) => s + c.passed, 0);
  const passRate      = totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-sub">Performance overview for your assigned classes.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,  label: "My Classes",    value: data.totalClasses,  color: "#3b82f6" },
          { icon: Users,     label: "Total Students", value: data.totalStudents, color: "#22c55e" },
          { icon: BarChart3, label: "Exam Attempts",  value: totalAttempts,      color: "#a855f7" },
          { icon: TrendingUp,label: "Pass Rate",      value: `${passRate}%`,     color: "#f97316" },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.color + "22" }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="text-xl font-bold text-slate-100">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {data.classes.length === 0 ? (
        <div className="card">
          <div className="empty-state py-8">
            <BarChart3 size={24} className="empty-icon" />
            <p className="empty-title">No class data yet</p>
            <p className="empty-desc">You have no classes assigned yet.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {data.classes.map((cls) => {
            const color   = LEVEL_COLORS[cls.roboticsLevel] || "#6366f1";
            const clsRate = cls.totalAttempts > 0 ? Math.round((cls.passed / cls.totalAttempts) * 100) : 0;
            return (
              <div key={cls.id} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: color + "22", color }}>
                    {cls.roboticsLevel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200">{cls.name}</div>
                    <div className="text-xs text-slate-500">{LEVEL_LABELS[cls.roboticsLevel]}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Students",      val: cls.studentCount,   color: "#3b82f6" },
                    { label: "Exams Unlocked",val: cls.examsUnlocked,  color: "#a855f7" },
                    { label: "Passed",        val: cls.passed,         color: "#22c55e" },
                    { label: "Failed",        val: cls.failed,         color: "#ef4444" },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-lg p-3 text-center">
                      <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {cls.totalAttempts > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Pass rate</span>
                      <span>{clsRate}% · Avg {cls.avgScore}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${clsRate}%`, background: clsRate >= 60 ? "#22c55e" : "#ef4444" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
