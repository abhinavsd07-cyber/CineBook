import SEO from "../components/SEO";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../config/allApis";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }
    if (otp.length !== 6) {
      toast.error("❌ OTP must be 6 digits", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(otp, { password });
      toast.success("🎉 Password reset successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        onClose: () => navigate("/login"),
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Invalid or expired OTP", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
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
            <p className="text-xs text-bms-text-muted">Enter the 6-digit OTP sent to your email and a new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-bms-text-muted">6-Digit OTP</label>
              <input 
                type="text" 
                className="w-full px-3 py-2.5 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text placeholder-bms-text-dim outline-none focus:border-bms-accent transition-colors duration-150 tracking-widest" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                maxLength="6"
                placeholder="000000"
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
            
            <button type="submit" className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-50" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Reset Password"}
            </button>
          </form>

          <p className="text-xs text-bms-text-muted text-center mt-2">
            Remembered your password? <Link to="/login" className="text-bms-accent hover:text-bms-accent-hover font-semibold transition-colors">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
