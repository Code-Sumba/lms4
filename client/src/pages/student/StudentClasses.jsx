import { useEffect, useState } from "react";
import { BookOpen, Users, Loader } from "lucide-react";
import api from "../../api/axios";

const LEVEL_LABELS = {
  1: "Mech Tech", 2: "Electronics", 3: "Electro Mechanical",
  4: "Digi-Coding", 5: "Digi-Sense", 6: "Wireless & IoT",
};
const LEVEL_COLORS = {
  1: "#f97316", 2: "#eab308", 3: "#22c55e",
  4: "#3b82f6", 5: "#a855f7", 6: "#ec4899",
};

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/classes")
      .then(({ data }) => setClasses(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Classes</h1>
        <p className="page-sub">Classes you are enrolled in.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={20} className="animate-spin text-slate-600" />
        </div>
      ) : classes.length === 0 ? (
        <div className="card">
          <div className="empty-state py-12">
            <BookOpen size={28} className="empty-icon" />
            <p className="empty-title">Not enrolled in any class</p>
            <p className="empty-desc">Your school admin will enroll you in a class. Check back soon.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {classes.map((cls) => {
            const color = LEVEL_COLORS[cls.roboticsLevel] || "#6366f1";
            return (
              <div key={cls._id} className="card hover:border-border-2 transition-colors">
                {/* Level badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={{ background: color + "22", color }}>
                    {cls.roboticsLevel}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{cls.name}</div>
                    <div className="text-xs text-slate-500">{LEVEL_LABELS[cls.roboticsLevel]}</div>
                  </div>
                </div>

                {/* Institute */}
                <div className="text-xs text-slate-500 mb-3">
                  <span className="text-slate-600">Institute: </span>{cls.institute?.name}
                </div>

                {/* Teachers */}
                <div className="mb-3">
                  <div className="text-xs text-slate-600 mb-1.5">Teachers</div>
                  {(cls.teacherIds || []).length === 0 ? (
                    <p className="text-xs text-slate-600">No teachers assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {cls.teacherIds.map((t) => (
                        <div key={t._id} className="flex items-center gap-1.5 bg-surface-2 px-2 py-1 rounded-full">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-2xs font-semibold text-white flex-shrink-0"
                            style={{ background: t.avatarColor || "#3b82f6" }}>
                            {t.fullName[0]}
                          </div>
                          <span className="text-xs text-slate-400">{t.fullName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student count */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-3 border-t border-surface-border">
                  <Users size={12} />
                  <span>{cls.studentCount} students enrolled</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
