import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../config/allApis";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await forgotPassword({ email });
      setSuccess("If that email exists, we have sent a password reset link.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-24 pb-16 min-h-[100vh] bg-bms-bg text-bms-text transition-colors duration-300">
      <div className="w-full max-w-[440px] px-4">
        <div className="bg-bms-surface border border-bms-border p-8 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-bms-text">Forgot Password</h2>
            <p className="text-xs text-bms-text-muted">Enter your email to receive a password reset link.</p>
          </div>
          
          {error && (
            <div className="text-xs text-red-600 bg-red-100 dark:bg-red-950/20 p-2.5 rounded border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}
          {success && (
            <div className="text-xs text-bms-accent bg-bms-accent-glow p-2.5 rounded border border-bms-accent/10">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-bms-text-muted">Email Address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2.5 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text placeholder-bms-text-dim outline-none focus:border-bms-accent transition-colors duration-150" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@example.com"
              />
            </div>
            
            <button type="submit" className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-50" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Send Reset Link"}
            </button>
          </form>

          <p className="text-xs text-bms-text-muted text-center mt-2">
            Remember your password? <Link to="/login" className="text-bms-accent hover:text-bms-accent-hover font-semibold transition-colors">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
