import SEO from "../components/SEO";
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { resetPassword, forgotPassword } from "../config/allApis";
import { LuEye, LuEyeOff, LuRefreshCcw } from "react-icons/lu";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found. Please start from Forgot Password page.", { theme: "light" });
      navigate("/forgot-password");
      return;
    }
    setResending(true);
    try {
      await forgotPassword({ email });
      toast.success("✅ New OTP sent successfully!", { theme: "light" });
      setTimeLeft(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to resend OTP", { theme: "light" });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      toast.error("❌ OTP has expired. Please resend.", { theme: "light" });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match", {
        position: "top-right", autoClose: 5000, theme: "light"
      });
      return;
    }
    if (otp.length !== 6) {
      toast.error("❌ OTP must be 6 digits", {
        position: "top-right", autoClose: 5000, theme: "light"
      });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(otp, { password });
      toast.success("🎉 Password reset successful! Redirecting to login...", {
        position: "top-right", autoClose: 3000, theme: "light",
        onClose: () => navigate("/login"),
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Invalid or expired OTP", {
        position: "top-right", autoClose: 5000, theme: "light"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-24 pb-16 min-h-[100vh] bg-bms-bg text-bms-text transition-colors duration-300">
      <SEO title="Reset Password | cineBook" description="Set a new password for your account." />
      <div className="w-full max-w-[440px] px-4">
        <div className="bg-bms-surface border border-bms-border p-8 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-bms-text">Create New Password</h2>
            <p className="text-xs text-bms-text-muted">
              Enter the 6-digit OTP sent to {email ? <strong className="text-bms-text">{email}</strong> : "your email"} and a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-semibold text-bms-text-muted">6-Digit OTP</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${timeLeft > 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                  {timeLeft > 0 ? `00:${timeLeft.toString().padStart(2, '0')}s remaining` : "Expired"}
                </span>
              </div>
              <input 
                type="text" 
                className="w-full px-3 py-2.5 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text placeholder-bms-text-dim outline-none focus:border-bms-accent transition-colors duration-150 tracking-widest text-center text-xl font-mono" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                required 
                maxLength="6"
                placeholder="000000"
                disabled={timeLeft <= 0}
              />
            </div>

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
                  placeholder="Min. 6 characters"
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
                  placeholder="Repeat password"
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
            
            <button type="submit" className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-50" disabled={loading || timeLeft <= 0}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Reset Password"}
            </button>
          </form>

          {timeLeft <= 0 && (
            <div className="flex flex-col items-center justify-center gap-2 mt-2 animate-fade-in">
              <p className="text-xs text-bms-text-muted text-center">Didn't receive the OTP or it expired?</p>
              <button 
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-xs font-bold text-bms-accent hover:text-bms-accent-hover bg-transparent border-none cursor-pointer transition-colors"
              >
                <LuRefreshCcw size={14} className={resending ? "animate-spin" : ""} />
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            </div>
          )}

          <p className="text-xs text-bms-text-muted text-center mt-2">
            Remembered your password? <Link to="/login" className="text-bms-accent hover:text-bms-accent-hover font-semibold transition-colors">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
