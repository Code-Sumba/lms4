import { useEffect, useState } from "react";
import { BarChart3, Users, BookOpen, GraduationCap, Award, FileText, TrendingUp, Loader } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = { 1:"Mech Tech",2:"Electronics",3:"Electro Mechanical",4:"Digi-Coding",5:"Digi-Sense",6:"Wireless & IoT" };
const LEVEL_COLORS = { 1:"#f97316",2:"#eab308",3:"#22c55e",4:"#3b82f6",5:"#a855f7",6:"#ec4899" };

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "22" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/reports")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader size={20} className="animate-spin text-slate-600" />
    </div>
  );

  if (!data) return <div className="card text-center text-slate-500 py-12">Failed to load reports.</div>;

  const passRate = data.examAttempts > 0 ? Math.round((data.passed / data.examAttempts) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-sub">Overview of your institute's performance and engagement.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen}     label="Classes"        value={data.classes}        color="#3b82f6" />
        <StatCard icon={Users}        label="Teachers"       value={data.teachers}       color="#a855f7" />
        <StatCard icon={GraduationCap}label="Students"       value={data.students}       color="#22c55e" />
        <StatCard icon={FileText}     label="Enrollments"    value={data.enrollments}    color="#f97316" />
        <StatCard icon={Award}        label="Certificates"   value={data.certificates}   color="#eab308" />
        <StatCard icon={BarChart3}    label="Exam Attempts"  value={data.examAttempts}   color="#06b6d4" />
        <StatCard icon={TrendingUp}   label="Pass Rate"      value={`${passRate}%`}      color="#22c55e" />
        <StatCard icon={TrendingUp}   label="Avg Score"      value={`${data.avgScore}%`} color="#6366f1" />
      </div>

      {/* Exam results breakdown */}
      {data.examAttempts > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Exam Performance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{data.passed}</div>
              <div className="text-xs text-slate-500 mt-1">Passed</div>
            </div>
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{data.failed}</div>
              <div className="text-xs text-slate-500 mt-1">Failed</div>
            </div>
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{data.avgScore}%</div>
              <div className="text-xs text-slate-500 mt-1">Avg Score</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Pass rate</span>
              <span>{passRate}%</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${passRate}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Class breakdown */}
      {data.classBreakdown?.length > 0 && (
        <div className="card p-0">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-sm font-semibold text-slate-200">Classes Breakdown</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Level</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {data.classBreakdown.map((cls) => {
                  const color = LEVEL_COLORS[cls.roboticsLevel] || "#6366f1";
                  return (
                    <tr key={cls.id}>
                      <td className="text-sm text-slate-200">{cls.name}</td>
                      <td>
                        <span className="badge" style={{ color, borderColor: color + "44", background: color + "11" }}>
                          L{cls.roboticsLevel} · {LEVEL_LABELS[cls.roboticsLevel]}
                        </span>
                      </td>
                      <td className="text-sm text-slate-400">{cls.studentCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
