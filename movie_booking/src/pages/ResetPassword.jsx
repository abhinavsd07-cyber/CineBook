import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../config/allApis";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center pt-24 pb-16 min-h-[100vh] bg-bms-bg text-bms-text transition-colors duration-300">
        <div className="w-full max-w-[440px] px-4">
          <div className="bg-bms-surface border border-bms-border p-8 rounded-2xl shadow-xl flex flex-col gap-6 text-center">
            <h2 className="text-2xl font-bold text-bms-text">Password Reset Successful! 🎉</h2>
            <p className="text-xs text-bms-text-muted mb-4">Your password has been securely updated. Redirecting you to login...</p>
            <Link to="/login" className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 text-center text-sm">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center pt-24 pb-16 min-h-[100vh] bg-bms-bg text-bms-text transition-colors duration-300">
      <div className="w-full max-w-[440px] px-4">
        <div className="bg-bms-surface border border-bms-border p-8 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-bms-text">Create New Password</h2>
            <p className="text-xs text-bms-text-muted">Please enter a new strong password below.</p>
          </div>
          
          {error && (
            <div className="text-xs text-red-600 bg-red-100 dark:bg-red-950/20 p-2.5 rounded border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-bms-text-muted">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text placeholder-bms-text-dim outline-none focus:border-bms-accent transition-colors duration-150" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-bms-text-muted hover:text-bms-text cursor-pointer flex p-0"
                >
                  {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-bms-text-muted">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="w-full px-3 py-2.5 pr-10 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text placeholder-bms-text-dim outline-none focus:border-bms-accent transition-colors duration-150" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-bms-text-muted hover:text-bms-text cursor-pointer flex p-0"
                >
                  {showConfirmPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-50" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
