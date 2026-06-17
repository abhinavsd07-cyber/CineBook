import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../config/allApis";
import { useAuth } from "../context/AuthContext";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.data);
      const dataState = location.state?.data || {};
      navigate(res.data.data.role === "admin" ? "/admin/dashboard" : from, { replace: true, state: dataState });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-24 pb-16 min-h-[100vh] bg-[#f2f5f9] text-[#333333] transition-colors duration-300">
      <div className="w-full max-w-[440px] px-4">
        <div className="bg-white border border-slate-200 p-8 rounded-[8px] shadow-sm flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-[22px] font-bold text-[#333333]">Get Started</h2>
            <p className="text-[14px] text-[#666666] font-normal">Login to book your favorite shows</p>
          </div>

          {error && (
            <div className="text-[12px] text-red-600 bg-red-50 p-2.5 rounded-[4px] border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#666666]" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="w-full px-3 py-2.5 text-[14px] bg-white border border-slate-300 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-[#F84464] transition-colors duration-150"
                placeholder="Continue with Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[13px] font-medium text-[#666666]">Password</label>
                <Link to="/forgot-password" className="text-[12px] text-[#F84464] hover:underline transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2.5 pr-10 text-[14px] bg-white border border-slate-300 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-[#F84464] transition-colors duration-150"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 hover:text-[#333333] cursor-pointer flex p-0"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3.5 rounded-[8px] font-semibold text-[15px] w-full shadow-md shadow-[#F84464]/30 transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-2 mt-2 disabled:opacity-60" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Login"}
            </button>
          </form>

          <p className="text-[13px] text-[#666666] text-center mt-2">
            New to BookMyShow? <Link to="/register" className="text-[#F84464] hover:underline font-medium transition-colors">Register here</Link>
          </p>

          <div className="text-[11px] text-[#999999] text-center border-t border-slate-200 pt-4 mt-2">
            <p>Demo Admin: admin@example.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
