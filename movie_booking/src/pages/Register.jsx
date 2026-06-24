import SEO from "../components/SEO";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../config/allApis";
import { useAuth } from "../context/AuthContext";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { toast, Bounce } from "react-toastify";

const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.data);
      toast.success(`🎉 Account created! Welcome, ${res.data.data.name || "User"}!`, toastConfig);
      const dataState = location.state?.data || {};
      const from = location.state?.from || "/";
      setTimeout(() => navigate(from, { replace: true, state: dataState }), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.", toastConfig);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-24 pb-16 min-h-[100vh] bg-[#f2f5f9] text-[#333333] transition-colors duration-300">
      <SEO title="Sign Up | cineBook" description="Create a new cineBook account." />
      <div className="w-full max-w-[440px] px-4">
        <div className="bg-white border border-slate-200 p-8 rounded-[8px] shadow-sm flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1.5">
            <h2 className="text-[22px] font-bold text-[#333333]">Create Account</h2>
            <p className="text-[14px] text-[#666666] font-normal">Join us to book your favorite shows</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#666666]" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                className="w-full px-3 py-2.5 text-[14px] bg-white border border-slate-300 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-[#F84464] transition-colors duration-150"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#666666]" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="w-full px-3 py-2.5 text-[14px] bg-white border border-slate-300 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-[#F84464] transition-colors duration-150"
                placeholder="Continue with Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#666666]" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2.5 pr-10 text-[14px] bg-white border border-slate-300 rounded-[4px] text-[#333333] placeholder-slate-400 outline-none focus:border-[#F84464] transition-colors duration-150"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength="6"
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
              ) : "Register"}
            </button>
          </form>

          <p className="text-[13px] text-[#666666] text-center mt-2">
            Already have an account? <Link to="/login" className="text-[#F84464] hover:underline font-medium transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
