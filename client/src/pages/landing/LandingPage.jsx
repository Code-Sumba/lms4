import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ChevronRight,
  Building2, Users, BookOpen, Award,
  BarChart3, Zap, Shield, FileSpreadsheet,
  GraduationCap, Check, Mail, Phone, MapPin,
} from "lucide-react";

const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IconLinkedin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const IconFacebook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Spline = lazy(() => import("@splinetool/react-spline"));

const LEVELS = [
  { num: 1, title: "Mech Tech",           color: "#f97316" },
  { num: 2, title: "Electronics",          color: "#eab308" },
  { num: 3, title: "Electro Mechanical",   color: "#22c55e" },
  { num: 4, title: "Digi-Coding",          color: "#3b82f6" },
  { num: 5, title: "Digi-Sense",           color: "#a855f7" },
  { num: 6, title: "Wireless & IoT",       color: "#ec4899" },
];

const FEATURES = [
  { icon: Building2,       title: "Multi-Institute",    desc: "Manage unlimited schools under one platform with fully isolated data per institute."             },
  { icon: Users,           title: "4-Role Access",      desc: "SuperAdmin → School Admin → Teacher → Student with precise, role-based permission control."    },
  { icon: Zap,             title: "Exam Engine",        desc: "MCQ builder with auto-scoring, countdown timer, and instant answer-key review."                },
  { icon: BookOpen,        title: "Digital Library",    desc: "PDFs, documents, and YouTube-embedded videos organised by curriculum level."                   },
  { icon: Award,           title: "Certificates",       desc: "Track eligibility and issue verified level-completion certificates to students."                },
  { icon: BarChart3,       title: "Analytics",          desc: "Experiment completion rates, exam trends, and per-student progress dashboards."                },
  { icon: FileSpreadsheet, title: "Bulk Import",        desc: "Onboard hundreds of teachers and students instantly via CSV upload."                           },
  { icon: Shield,          title: "Access Control",     desc: "Per-institute level locking with expiry dates for subscription-based access management."       },
];

const STATS = [
  { val: "100+",  label: "Schools Served"     },
  { val: "6",     label: "Curriculum Levels"  },
  { val: "216+",  label: "Experiments"        },
  { val: "6–60",  label: "Age Range (Years)"  },
];

const STATES = [
  "Maharashtra", "Karnataka", "Gujarat",
  "Punjab", "Telangana", "Himachal Pradesh",
];

function NavBar({ onLogin }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-surface-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/motion-robotics-logo.avif"
            alt="Motion Robotics"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="hidden w-7 h-7 rounded bg-blue items-center justify-center text-white font-bold text-xs flex-shrink-0">M</div>
          <span className="text-slate-100 font-semibold text-sm">
            Motion Robotics <span className="text-slate-500 font-normal">LMS</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <a href="#about"      className="hover:text-slate-200 transition-colors">About</a>
          <a href="#features"   className="hover:text-slate-200 transition-colors">Features</a>
          <a href="#curriculum" className="hover:text-slate-200 transition-colors">Curriculum</a>
          <a href="#contact"    className="hover:text-slate-200 transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onLogin} className="text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5">
            Sign In
          </button>
          <button onClick={onLogin} className="btn-primary btn-sm gap-1.5">
            Get Started <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin  = () => navigate("/login");

  return (
    <div className="min-h-screen bg-bg text-slate-200">
      <NavBar onLogin={goLogin} />

      {/* ── Hero ── */}
      <section className="min-h-screen pt-36 pb-24 px-6 line-grid relative overflow-hidden">

        {/* Spline 3D scene — starts below fixed navbar */}
        <Suspense fallback={null}>
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ top: "56px", zIndex: 0 }}
          >
            <Spline
              scene="https://prod.spline.design/dYiAp1z4OvYF8VgP/scene.splinecode"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </Suspense>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{ zIndex: 1 }} />

        {/* Radial fade to blend into next section */}
        <div className="absolute inset-0 pointer-events-none" style={{
          zIndex: 2,
          background: "radial-gradient(ellipse 90% 55% at 50% 10%, transparent 35%, #0c0e14 100%)",
        }} />

        <div className="relative max-w-4xl mx-auto text-center" style={{ zIndex: 3 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-border bg-surface/80 text-xs text-slate-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse flex-shrink-0" />
            Robotics education platform — trusted by 100+ schools across India
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold text-white leading-[1.15] tracking-tight mb-4">
            Imagine your Kids' Future
            <br />
            <span className="text-blue">in a Robotic way!</span>
          </h1>

          <p className="text-base text-slate-400 max-w-xl mx-auto mb-9 leading-relaxed">
            Motion Robotics establishes school robotics labs fostering creativity and
            problem-solving through hands-on STEAMR learning — from mechanical basics
            to advanced wireless IoT.
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
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface/90 px-6 py-4 text-center backdrop-blur-sm">
                <div className="text-xl font-semibold text-white">{s.val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-blue-light bg-blue-muted px-3 py-1 rounded-full mb-4">
              About Motion Robotics
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4 leading-snug">
              Building the next generation of innovators — one lab at a time
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Motion Robotics establishes school robotics labs combining education, safety,
              and innovation to develop critical thinking and transform student ideas into
              real-world solutions.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Our age-appropriate curriculum (ages 6–60) spans basic to advanced robotics,
              AI labs, STEAMR programs, and Make-in-India manufactured kits — backed by a
              full teacher training and certification system.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Make in India Kits", "Teacher Training", "STEAMR Curriculum", "AI Robotics Labs", "Safety Certified", "Franchise Available"].map((tag) => (
                <span key={tag} className="text-xs bg-surface border border-surface-border px-2.5 py-1 rounded-full text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Schools across India",  val: "100+",        color: "#3b82f6" },
              { label: "States covered",         val: "6+",          color: "#a855f7" },
              { label: "Experiments in library", val: "216+",        color: "#22c55e" },
              { label: "Age range (years)",      val: "6 – 60",      color: "#f97316" },
            ].map((s) => (
              <div key={s.label} className="card text-center py-6">
                <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.val}</div>
                <div className="text-xs text-slate-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section id="curriculum" className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-2">6-Level Robotics Curriculum</h2>
            <p className="text-slate-400 text-sm">
              A structured progression from mechanical basics to advanced wireless IoT — designed
              for ages 6 to 60 with Make-in-India kits at every level.
            </p>
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
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">Progression</span>
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
            <p className="text-slate-400 text-sm">No extra tools needed — every feature for robotics education is included.</p>
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
                desc: "Control the learning pace — unlock experiments per class, monitor student performance.",
                capabilities: ["Unlock experiments", "View class reports", "Approve submissions", "Manage exams"],
                color: "#22c55e",
              },
              {
                role: "Student", label: "Learner",
                desc: "Learn through doing — access experiments, watch videos, take timed exams, and earn certificates.",
                capabilities: ["View experiments", "Watch videos", "Take MCQ exams", "Download certificate"],
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

      {/* ── States covered ── */}
      <section className="py-16 px-6 border-t border-surface-border">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">Serving schools across India</p>
          <div className="flex flex-wrap justify-center gap-3">
            {STATES.map((s) => (
              <span key={s} className="text-xs bg-surface border border-surface-border px-4 py-2 rounded-full text-slate-400">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-3xl text-slate-600 mb-6">"</div>
          <p className="text-slate-300 text-base leading-relaxed mb-6 italic">
            The program integration resulted in outstanding student engagement with enhanced
            learning through interactive modules and 3D printing experiences.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-muted flex items-center justify-center text-blue-light font-bold text-sm flex-shrink-0">
              M
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-slate-200">Principal Manoj A. Savale</div>
              <div className="text-xs text-slate-500">Bhondawe Patil Public School</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 border-t border-surface-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to set up your robotics lab?</h2>
          <p className="text-slate-400 text-sm mb-7">
            Join 100+ schools across India already running Motion Robotics programs.
            No credit card required to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={goLogin} className="btn-primary btn-lg gap-2">
              Get Started <ArrowRight size={16} />
            </button>
            <a href="mailto:info@motionrobotics.in" className="btn-secondary btn-lg gap-2">
              <Mail size={16} /> Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-16 px-6 border-t border-surface-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-blue-muted flex items-center justify-center flex-shrink-0">
              <Phone size={14} className="text-blue-light" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Phone</div>
              <a href="tel:+919730480960" className="text-sm text-slate-300 hover:text-white transition-colors">
                +91 973-048-0960
              </a>
            </div>
          </div>

          <div className="card flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-blue-muted flex items-center justify-center flex-shrink-0">
              <Mail size={14} className="text-blue-light" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Email</div>
              <a href="mailto:info@motionrobotics.in" className="text-sm text-slate-300 hover:text-white transition-colors">
                info@motionrobotics.in
              </a>
            </div>
          </div>

          <div className="card flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-blue-muted flex items-center justify-center flex-shrink-0">
              <MapPin size={14} className="text-blue-light" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Address</div>
              <div className="text-sm text-slate-300 leading-snug">
                Tech Center, 4th Floor, Phase 1,<br />
                Rajiv Gandhi Infotech Park,<br />
                Hinjewadi, Pune – 411033
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + brand */}
            <div className="flex items-center gap-3">
              <img
                src="/motion-robotics-logo.avif"
                alt="Motion Robotics"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden w-6 h-6 rounded bg-blue items-center justify-center text-white font-bold text-2xs">M</div>
              <div>
                <div className="text-sm font-semibold text-slate-200">Motion Robotics</div>
                <div className="text-xs text-slate-600">LMS Platform</div>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/motion.robotics" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-surface border border-surface-border flex items-center justify-center text-slate-500 hover:text-pink-400 hover:border-pink-500/40 transition-colors">
                <IconInstagram />
              </a>
              <a href="https://linkedin.com/company/motionrobotics" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-surface border border-surface-border flex items-center justify-center text-slate-500 hover:text-blue-light hover:border-blue/40 transition-colors">
                <IconLinkedin />
              </a>
              <a href="https://facebook.com/profile.php?id=61577830532412" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-surface border border-surface-border flex items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue/40 transition-colors">
                <IconFacebook />
              </a>
            </div>

            <span className="text-xs text-slate-600">
              © {new Date().getFullYear()} Motion Robotics. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
