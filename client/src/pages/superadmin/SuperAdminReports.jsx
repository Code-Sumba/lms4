import { useEffect, useState } from "react";
import { BarChart3, Building2, Users, GraduationCap, Award, FileText, Library, TrendingUp, Loader, CheckCircle, XCircle } from "lucide-react";
import api from "../../api/axios";

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

export default function SuperAdminReports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/superadmin/reports")
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
        <h1 className="page-title">Global Reports</h1>
        <p className="page-sub">Platform-wide analytics across all institutes.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2}    label="Institutes"    value={data.institutes}    color="#3b82f6" />
        <StatCard icon={Users}        label="Total Users"   value={data.students + data.teachers + data.admins} color="#a855f7" />
        <StatCard icon={GraduationCap}label="Students"      value={data.students}      color="#22c55e" />
        <StatCard icon={Users}        label="Teachers"      value={data.teachers}      color="#f97316" />
        <StatCard icon={FileText}     label="Exams"         value={data.exams}         color="#06b6d4" />
        <StatCard icon={Library}      label="Content Items" value={data.content}       color="#eab308" />
        <StatCard icon={Award}        label="Certificates"  value={data.certificates}  color="#eab308" />
        <StatCard icon={TrendingUp}   label="Pass Rate"     value={`${passRate}%`}     color="#22c55e" />
      </div>

      {data.examAttempts > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Exam Performance (All Institutes)</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-slate-200">{data.examAttempts}</div>
              <div className="text-xs text-slate-500 mt-1">Total Attempts</div>
            </div>
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{data.passed}</div>
              <div className="text-xs text-slate-500 mt-1">Passed</div>
            </div>
            <div className="bg-surface rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{data.failed}</div>
              <div className="text-xs text-slate-500 mt-1">Failed</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Global pass rate</span><span>{passRate}% · Avg score {data.avgScore}%</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${passRate}%` }} />
            </div>
          </div>
        </div>
      )}

      {data.topInstitutes?.length > 0 && (
        <div className="card p-0">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-sm font-semibold text-slate-200">Institutes Overview</h2>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Institute</th><th>Code</th><th>Users</th><th>Classes</th><th>Status</th></tr></thead>
              <tbody>
                {data.topInstitutes.map((inst) => (
                  <tr key={inst.id}>
                    <td className="text-sm font-medium text-slate-200">{inst.name}</td>
                    <td><code className="text-xs bg-surface-2 px-1.5 py-0.5 rounded text-slate-400">{inst.code}</code></td>
                    <td className="text-sm text-slate-400">{inst.users}</td>
                    <td className="text-sm text-slate-400">{inst.classes}</td>
                    <td>
                      {inst.isActive
                        ? <span className="badge badge-green"><CheckCircle size={11}/> Active</span>
                        : <span className="badge badge-red"><XCircle size={11}/> Inactive</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
