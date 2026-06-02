import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import useAuthStore from "../../store/authStore";

const ROLES = [
  { key: "superadmin", label: "Super Admin",  sub: "Company account"   },
  { key: "admin",      label: "School Admin", sub: "Institute account"  },
  { key: "teacher",    label: "Teacher",      sub: "Educator account"   },
  { key: "student",    label: "Student",      sub: "Learner account"    },
];

const REDIRECT = {
  superadmin: "/superadmin",
  admin:      "/admin",
  teacher:    "/teacher",
  student:    "/student",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const [role,     setRole]     = useState("student");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [localErr, setLocalErr] = useState("");

  const selectRole = (r) => {
    setRole(r);
    setEmail("");
    setPassword("");
    setLocalErr("");
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");
    if (!email.trim() || !password) { setLocalErr("Please enter your email and password."); return; }
    try {
      const user = await login(email.trim(), password);
      navigate(REDIRECT[user.role] || "/");
    } catch (err) {
      setLocalErr(err.message);
    }
  };

  const displayError = localErr || error;
  const roleInfo = ROLES.find((r) => r.key === role);

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left panel ── */}
      <aside className="hidden lg:flex flex-col w-[380px] flex-shrink-0 bg-bg-2 border-r border-surface-border p-8 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-7 h-7 rounded bg-blue flex items-center justify-center text-white font-bold text-xs">M</div>
            <span className="text-slate-200 font-semibold text-sm">Motion Robotics <span className="text-slate-500 font-normal">LMS</span></span>
          </div>

          <h1 className="text-xl font-semibold text-white mb-2">Sign in to your account</h1>
          <p className="text-sm text-slate-500 mb-10 leading-relaxed">
            Access your robotics education dashboard. Choose the role that matches your account.
          </p>

          {/* Role quick-select */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">Select your role</p>
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => selectRole(r.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded border text-left transition-all ${
                  role === r.key
                    ? "bg-blue-muted border-blue/40 text-white"
                    : "border-surface-border text-slate-400 hover:border-border-2 hover:text-slate-200 hover:bg-surface"
                }`}
              >
                <div>
                  <div className="text-sm font-medium leading-none mb-0.5">{r.label}</div>
                  <div className="text-xs text-slate-500">{r.sub}</div>
                </div>
                {role === r.key && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => navigate("/")} className="text-xs text-slate-600 hover:text-slate-400 transition-colors text-left">
          ← Back to homepage
        </button>
      </aside>

      {/* ── Right panel — form ── */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 rounded bg-blue flex items-center justify-center text-white font-bold text-xs">M</div>
              <span className="text-slate-200 font-semibold text-sm">Motion Robotics LMS</span>
            </div>
            {/* Mobile role tabs */}
            <div className="grid grid-cols-4 gap-1.5 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => selectRole(r.key)}
                  className={`py-2 px-1 rounded border text-center text-xs font-medium transition-all ${
                    role === r.key
                      ? "bg-blue-muted border-blue/40 text-slate-200"
                      : "border-surface-border text-slate-500 hover:border-border-2 hover:text-slate-300"
                  }`}
                >
                  {r.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Form heading */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Sign in as {roleInfo?.label}</h2>
            <p className="text-sm text-slate-500 mt-1">{roleInfo?.sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
                className="input"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="alert-error text-xs">
                {displayError}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full gap-2 py-2.5 mt-1">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                : <><span>Sign in</span> <ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Mobile back link */}
          <button onClick={() => navigate("/")} className="lg:hidden mt-6 text-xs text-slate-600 hover:text-slate-400 transition-colors w-full text-center">
            ← Back to homepage
          </button>
        </div>
      </main>
    </div>
  );
}
