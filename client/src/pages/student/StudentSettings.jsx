import { useState } from "react";
import { KeyRound, Loader, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";

export default function StudentSettings() {
  const { user } = useAuthStore();
  const [form,    setForm]    = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSuccess(false); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setError("Passwords do not match.");
    if (form.newPassword.length < 6) return setError("New password must be at least 6 characters.");
    setSaving(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">View your profile and change your password.</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-white flex-shrink-0"
            style={{ background: user?.avatarColor || "#22c55e" }}>
            {user?.fullName?.split(" ").slice(0, 2).map((n) => n[0]).join("") || "S"}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">{user?.fullName}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
            {user?.rollNumber && <div className="text-xs text-slate-600 mt-0.5">Roll: {user.rollNumber}</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-200">Change Password</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Current Password</label>
            <input className="input" type="password" value={form.currentPassword}
              onChange={(e) => set("currentPassword", e.target.value)} placeholder="Enter current password" required />
          </div>
          <div className="form-group">
            <label className="label">New Password</label>
            <input className="input" type="password" value={form.newPassword}
              onChange={(e) => set("newPassword", e.target.value)} placeholder="Min. 6 characters" required />
          </div>
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)} placeholder="Repeat new password" required />
          </div>
          {error   && <p className="text-xs text-red-400">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle size={13} /> Password updated successfully.
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary btn-sm gap-1.5">
            {saving ? <Loader size={13} className="animate-spin" /> : <KeyRound size={13} />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
