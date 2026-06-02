import { useEffect, useState } from "react";
import { BookOpen, Users, Loader, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};

function ClassCard({ cls }) {
  const [open, setOpen] = useState(false);
  const color = LEVEL_COLORS[cls.roboticsLevel] || "#6366f1";

  return (
    <div className="card p-0">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: color + "22", color }}>
          {cls.roboticsLevel}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-200">{cls.name}</div>
          <div className="text-xs text-slate-500">
            {LEVEL_LABELS[cls.roboticsLevel]} · {cls.institute?.name}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={13} />
            <span>{cls.students?.length ?? 0} students</span>
          </div>
          <button onClick={() => setOpen((o) => !o)} className="btn-ghost btn-sm p-1">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Student list */}
      {open && (
        <div className="border-t border-surface-border">
          {(cls.students || []).length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-5">No students enrolled yet.</p>
          ) : (
            <div className="divide-y divide-surface-border">
              {cls.students.map((s) => (
                <div key={s._id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-semibold text-white flex-shrink-0"
                    style={{ background: s.avatarColor || "#10b981" }}>
                    {s.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-300 truncate">{s.fullName}</div>
                    <div className="text-xs text-slate-600 truncate">{s.email}</div>
                  </div>
                  {s.rollNumber && (
                    <code className="text-2xs bg-surface-2 px-1.5 py-0.5 rounded text-slate-500">{s.rollNumber}</code>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teacher/classes")
      .then(({ data }) => setClasses(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Classes</h1>
        <p className="page-sub">Classes you are assigned to teach.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600" />
        </div>
      ) : classes.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">No classes assigned yet</p>
            <p className="empty-desc">Your admin will assign you to classes. Check back soon.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => <ClassCard key={cls._id} cls={cls} />)}
        </div>
      )}
    </div>
  );
}
