import React, { useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ErrorBanner } from "./shared/AdminUI";
import { adminApi } from "../api/adminApi";

type AdminCreationFormProps = {
  onSuccess: () => void;
};

export default function AdminCreationForm({ onSuccess }: AdminCreationFormProps) {
  const [firstName, setFirstName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmCreateAdmin = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      await adminApi.createAdmin({
        firstName,
        middleInitial,
        lastName,
        email,
        password,
      });

      setSuccess("Admin account created successfully!");
      setFirstName("");
      setMiddleInitial("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create admin account");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Not Entered", color: "bg-slate-250" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Medium", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-md">
      {/* Top decorative gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#800000] to-red-800" />
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Add New Administrator</h2>
          <p className="text-xs text-slate-500">Provide personal info and define strong access credentials.</p>
        </div>
        <BadgeIcon className="text-slate-400" sx={{ fontSize: 32 }} />
      </div>

      {error && <div className="mb-5 animate-slideDown"><ErrorBanner message={error} /></div>}
      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 animate-slideDown">
          <CheckCircleOutlineIcon className="text-emerald-500" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name & Middle Initial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <PersonIcon sx={{ fontSize: 18 }} />
              </div>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="e.g. Juan"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[#800000]/60 focus:bg-white focus:ring-4 focus:ring-[#800000]/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">M.I. (Optional)</label>
            <input
              value={middleInitial}
              onChange={(e) => setMiddleInitial(e.target.value)}
              maxLength={10}
              placeholder="e.g. D"
              className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2.5 px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#800000]/60 focus:bg-white focus:ring-4 focus:ring-[#800000]/10"
            />
          </div>
        </div>

        {/* Surname (Last Name) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surname (Last Name)</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <PersonIcon sx={{ fontSize: 18 }} />
            </div>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="e.g. dela Cruz"
              className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[#800000]/60 focus:bg-white focus:ring-4 focus:ring-[#800000]/10"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <EmailIcon sx={{ fontSize: 18 }} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@institution.edu"
              className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[#800000]/60 focus:bg-white focus:ring-4 focus:ring-[#800000]/10"
            />
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <LockIcon sx={{ fontSize: 18 }} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-[#800000]/60 focus:bg-white focus:ring-4 focus:ring-[#800000]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650"
              >
                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
            {/* Strength Meter */}
            {password && (
              <div className="mt-2 space-y-1 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Password Strength:</span>
                  <span className={`font-bold uppercase ${
                    strength.label === "Weak" ? "text-red-500" :
                    strength.label === "Medium" ? "text-amber-500" : "text-emerald-500"
                  }`}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <LockIcon sx={{ fontSize: 18 }} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-250 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-[#800000]/60 focus:bg-white focus:ring-4 focus:ring-[#800000]/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-650"
              >
                {showConfirmPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#800000] to-[#b30000] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:from-[#900000] hover:to-[#c40000] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Registering Admin...</span>
              </>
            ) : (
              <span>Create Admin Account</span>
            )}
          </button>
        </div>
      </form>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-scaleIn">
            <h3 className="text-lg font-bold leading-6 text-slate-900">
              Confirm Account Creation
            </h3>
            <div className="mt-3">
              <p className="text-sm text-slate-500">
                Are you sure you want to register <strong>{firstName} {lastName}</strong> ({email}) as a new system administrator?
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#800000] px-4 py-2 text-sm font-semibold text-white hover:bg-[#990000] transition-colors"
                onClick={confirmCreateAdmin}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
