import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, getProfile } from "../config/allApis";
import SEO from "../components/SEO";

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Simba"
];

export default function Profile() {
  const { user, login } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatar: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cineCoins, setCineCoins] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || AVATARS[0]
      });
      getProfile().then(res => setCineCoins(res.data.data.cineCoins || 0)).catch(err => console.error(err));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (url) => {
    setFormData({ ...formData, avatar: url });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      const res = await updateProfile(formData);
      const updatedUser = { ...res.data.data, token: user.token };
      login(updatedUser); 
      
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300 flex items-center justify-center">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <SEO title="My Profile" description="Manage your Book My Show account and choose your avatar." url="/profile" />
      
      <div className="container">
        <div className="bg-bms-surface border border-bms-border max-w-[650px] mx-auto p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6">
          <div className="border-b border-bms-border/50 pb-4 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-bms-text">My Profile</h2>
            <p className="text-xs text-bms-text-muted mt-1">Update your account details and choose how you appear to others.</p>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 rounded-2xl text-white mb-2 flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-bold text-base md:text-lg">🪙 CineCoins Balance</h3>
              <p className="text-xs text-white/95 mt-1">Earn coins on every booking!</p>
            </div>
            <div className="text-3xl font-bold">
              {cineCoins}
            </div>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {successMsg && <div className="text-xs text-[#2DC492] bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg font-bold">{successMsg}</div>}
            {errorMsg && <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg font-bold">{errorMsg}</div>}

            <div className="flex flex-col gap-4 border-b border-bms-border/50 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bms-text-muted mb-2">Personal Information</h3>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-bms-text-muted">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="w-full px-3 py-2.5 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text outline-none focus:border-bms-accent transition-colors duration-150" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-bms-text-muted">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2.5 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text outline-none opacity-60 cursor-not-allowed" 
                  value={user.email} 
                  disabled 
                />
                <small className="text-[10px] text-bms-text-dim">Email address cannot be changed.</small>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-bms-text-muted">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="w-full px-3 py-2.5 text-sm bg-bms-bg border border-bms-border rounded-lg text-bms-text outline-none focus:border-bms-accent transition-colors duration-150" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-b border-bms-border/50 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-bms-text-muted mb-1">Choose an Avatar</h3>
              <p className="text-xs text-bms-text-muted mb-2">Select an avatar that represents you. This will be visible on your reviews.</p>
              
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 mt-2">
                {AVATARS.map((url, idx) => (
                  <div 
                    key={idx} 
                    className={`relative aspect-square rounded-full overflow-hidden border-2 hover:border-bms-accent/50 cursor-pointer transition-all duration-200 bg-bms-bg p-1 ${
                      formData.avatar === url ? "border-bms-accent hover:border-bms-accent shadow-md scale-105" : "border-transparent"
                    }`}
                    onClick={() => handleAvatarSelect(url)}
                  >
                    <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
                    {formData.avatar === url && (
                      <div className="absolute inset-0 bg-bms-accent/30 text-white flex items-center justify-center font-bold text-sm rounded-full">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 cursor-pointer border-none" disabled={loading}>
                {loading ? "Saving changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
