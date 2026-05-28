import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronRight,
  Building2, Users, BookOpen, Award,
  BarChart3, Zap, Shield, FileSpreadsheet,
  GraduationCap, Check,
} from "lucide-react";

const LEVELS = [
  { num: 1, title: "Mech Tech",         color: "#f97316" },
  { num: 2, title: "Electronics",        color: "#eab308" },
  { num: 3, title: "Electro Mechanical", color: "#22c55e" },
  { num: 4, title: "Digi-Coding",        color: "#3b82f6" },
  { num: 5, title: "Digi-Sense",         color: "#a855f7" },
  { num: 6, title: "Wireless & IoT",     color: "#ec4899" },
];

const FEATURES = [
  { icon: Building2,       title: "Multi-Institute",    desc: "Manage unlimited schools under one platform with fully isolated data per institute."             },
  { icon: Users,           title: "4-Role Access",      desc: "SuperAdmin → School Admin → Teacher → Student with precise, role-based permission control."    },
  { icon: Zap,             title: "Exam Engine",        desc: "MCQ builder with auto-scoring, countdown timer, and instant answer-key review."                },
  { icon: BookOpen,        title: "Digital Library",    desc: "PDFs, documents, and YouTube-embedded videos organised by curriculum level."                   },
  { icon: Award,           title: "Certificates",       desc: "Track eligibility and issue verified level-completion certificates to students."                },
  { icon: BarChart3,       title: "Analytics",          desc: "Experiment completion rates, exam trends, and per-student progress dashboards."                },
  { icon: FileSpreadsheet, title: "Bulk Import",        desc: "Onboard hundreds of teachers and students instantly via CSV or Excel upload."                   },
  { icon: Shield,          title: "Access Control",     desc: "Per-institute level locking with expiry dates for subscription-based access management."       },
];

function NavBar({ onLogin }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-surface-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-blue flex items-center justify-center text-white font-bold text-xs flex-shrink-0">M</div>
          <span className="text-slate-100 font-semibold text-sm">Motion Robotics <span className="text-slate-500 font-normal">LMS</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
          <a href="#curriculum" className="hover:text-slate-200 transition-colors">Curriculum</a>
          <a href="#roles" className="hover:text-slate-200 transition-colors">Roles</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onLogin} className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5">
            Sign In
          </button>
          <button onClick={onLogin} className="btn-primary btn-sm">
            Get Started <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-bg text-slate-200">
      <NavBar onLogin={goLogin} />

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6 line-grid relative overflow-hidden">
        {/* Radial fade over grid */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-bg pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, #0c0e14 100%)" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-border bg-surface text-xs text-slate-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse flex-shrink-0" />
            Robotics education platform — 6 curriculum levels
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-white leading-[1.15] tracking-tight mb-5">
            The complete LMS for
            <br />
            <span className="text-blue">robotics education</span>
          </h1>

          <p className="text-base text-slate-400 max-w-xl mx-auto mb-9 leading-relaxed">
            One platform for every school in your network — manage institutes, teachers, students, experiments, exams, and certificates from a single dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button onClick={goLogin} className="btn-primary btn-lg gap-2">
              Start for free <ArrowRight size={16} />
            </button>
            <button onClick={goLogin} className="btn-secondary btn-lg gap-2">
              <GraduationCap size={16} /> Admin login
            </button>
          </div>

          {/* Stat strip */}
          <div className="mt-14 inline-grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-border rounded-xl overflow-hidden border border-surface-border">
            {[
              { val: "6",    label: "Curriculum levels" },
              { val: "216+", label: "Experiments"       },
              { val: "4",    label: "User roles"        },
              { val: "∞",    label: "Institutes"        },
            ].map((s) => (
              <div key={s.label} className="bg-surface px-6 py-4 text-center">
                <div className="text-xl font-semibold text-white">{s.val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum levels ── */}
      <section id="curriculum" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-2">6-Level Robotics Curriculum</h2>
            <p className="text-slate-400 text-sm">A structured progression from mechanical basics to advanced wireless IoT solutions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {LEVELS.map((lvl) => (
              <div key={lvl.num} className="card text-center py-5 hover:border-border-2 transition-colors">
                <div className="w-8 h-8 rounded mx-auto mb-3 flex items-center justify-center text-sm font-bold"
                     style={{ background: lvl.color + "22", color: lvl.color }}>
                  {lvl.num}
                </div>
                <div className="text-xs font-medium text-slate-300 leading-snug">{lvl.title}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-surface rounded-lg border border-surface-border flex items-center gap-4 text-sm text-slate-400">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">Level progression</span>
            <div className="flex-1 flex items-center gap-1 overflow-hidden">
              {LEVELS.map((l, i) => (
                <span key={l.num} className="flex items-center gap-1 shrink-0">
                  <span style={{ color: l.color }} className="font-medium text-xs">{l.title}</span>
                  {i < LEVELS.length - 1 && <ChevronRight size={12} className="text-slate-600" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-2">Everything built in</h2>
            <p className="text-slate-400 text-sm">No extra tools or integrations needed — every feature for robotics education is included.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card hover:border-border-2 transition-colors group">
                  <div className="w-8 h-8 rounded bg-blue-muted flex items-center justify-center mb-3 group-hover:bg-blue/20 transition-colors">
                    <Icon size={16} className="text-blue-light" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-2">A role for everyone</h2>
            <p className="text-slate-400 text-sm">Each user type gets a tailored dashboard with exactly the tools they need.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                role: "Super Admin", label: "Company",
                desc: "Full platform control — manage all institutes, the content library, exams, user accounts, and certificates.",
                capabilities: ["Manage all institutes", "Upload experiments & books", "Build & publish exams", "Issue certificates"],
                color: "#3b82f6",
              },
              {
                role: "School Admin", label: "Institute",
                desc: "Manage a single school — create classes, onboard teachers and students, view reports.",
                capabilities: ["Create classes", "Add teachers & students", "Bulk CSV import", "View reports"],
                color: "#a855f7",
              },
              {
                role: "Teacher", label: "Educator",
                desc: "Control the learning pace — unlock experiments per class, set deadlines, approve student submissions.",
                capabilities: ["Unlock experiments", "Set deadlines", "Approve submissions", "Class progress report"],
                color: "#22c55e",
              },
              {
                role: "Student", label: "Learner",
                desc: "Learn through doing — access experiments, watch videos, take timed exams, and earn certificates.",
                capabilities: ["View experiments", "Watch YouTube videos", "Take MCQ exams", "Download certificate"],
                color: "#f97316",
              },
            ].map((r) => (
              <div key={r.role} className="card hover:border-border-2 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                       style={{ background: r.color + "22", color: r.color }}>
                    {r.role[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{r.role}</div>
                    <div className="text-xs text-slate-500">{r.label}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{r.desc}</p>
                <ul className="space-y-1.5">
                  {r.capabilities.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check size={12} style={{ color: r.color }} className="flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to get started?</h2>
          <p className="text-slate-400 text-sm mb-7">
            Set up your institute in minutes. No credit card required.
          </p>
          <button onClick={goLogin} className="btn-primary btn-lg gap-2">
            Create your account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue flex items-center justify-center text-white font-bold text-2xs">M</div>
            <span>Motion Robotics LMS</span>
          </div>
          <span>© {new Date().getFullYear()} Motion Robotics. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
