import React, { useState, useEffect } from "react";
import { LuClapperboard, LuTrash2, LuPen, LuX } from "react-icons/lu";

export default function ManageBanners() {
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState("hero");
  const [targetLink, setTargetLink] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { getAllAdminBanners } = await import("../../config/allApis");
      const res = await getAllAdminBanners();
      setBanners(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!editId && !file) return alert("Please select an image file");
    
    setUploading(true);
    try {
      const { uploadImage, createBanner, updateBanner } = await import("../../config/allApis");
      
      let imageUrl;
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const uploadRes = await uploadImage(formData);
        imageUrl = uploadRes.data.url;
      }

      if (editId) {
        await updateBanner(editId, { imageUrl, type, targetLink });
        alert("Banner updated successfully!");
      } else {
        await createBanner({ imageUrl, type, targetLink });
        alert("Banner uploaded successfully!");
      }
      
      setFile(null);
      setTargetLink("");
      setEditId(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Error saving banner");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (b) => {
    setEditId(b._id);
    setType(b.type);
    setTargetLink(b.targetLink || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFile(null);
    setType("hero");
    setTargetLink("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      const { deleteBanner } = await import("../../config/allApis");
      await deleteBanner(id);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LuClapperboard className="text-bms-accent" />
            <span>Manage Banners & Ad Carousels</span>
          </h1>
          <p className="text-bms-text-muted text-sm mt-1">Upload homepage hero banners and square Event Category cards.</p>
        </div>
      </div>
      
      {/* Form Wrapper */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-xs w-full max-w-[600px] mb-4">
        <h3 className="text-lg font-bold text-bms-text mb-5">
          {editId ? "Edit Banner" : "Upload New Banner"}
        </h3>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">
              Upload Image (AWS S3) {editId && "(Leave empty to keep current)"}
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Banner Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all"
            >
              <option value="hero">Hero (Top Carousel)</option>
              <option value="middle">Event Category Cards (Square)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Target Link (Optional)</label>
            <input 
              type="text" 
              placeholder="/movie/123" 
              value={targetLink} 
              onChange={(e) => setTargetLink(e.target.value)} 
              className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
            />
          </div>
          <div className="flex gap-3 mt-3">
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-xl bg-bms-accent hover:bg-bms-accent-hover text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs" 
              disabled={uploading}
            >
              {uploading ? "Saving..." : editId ? "Update Banner" : "Upload Banner"}
            </button>
            {editId && (
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-xl border border-bms-border text-bms-text hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer flex items-center gap-1 bg-bms-surface" 
                onClick={cancelEdit}
              >
                <LuX size={14} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-bms-border bg-bms-surface-hover/20">
          <h3 className="text-lg font-bold text-bms-text">Current Active Banners</h3>
        </div>
        {banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <LuClapperboard size={32} className="text-bms-text-dim/30" />
            <p className="text-bms-text-dim text-sm font-medium">No banners found. Upload one above!</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" style={{ minWidth: "800px" }}>
                <thead>
                  <tr className="border-b border-bms-border bg-bms-surface-hover/50 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Target Link</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bms-border/50">
                  {banners.map((b) => (
                    <tr key={b._id} className="hover:bg-bms-surface-hover/30 transition-colors duration-150 text-bms-text">
                      <td className="px-6 py-4">
                        <img src={b.imageUrl} alt="Banner" className="w-[120px] h-[60px] object-cover rounded-lg bg-slate-800 shadow-xs border border-bms-border" />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          b.type === 'hero' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {b.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-bms-text-muted font-medium">{b.targetLink || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(b)} 
                            className="px-3 py-1.5 rounded-lg border border-bms-border text-bms-text hover:bg-bms-surface-hover text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-bms-surface"
                          >
                            <LuPen size={10} />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(b._id)} 
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <LuTrash2 size={10} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile / tablet cards ── */}
            <div className="lg:hidden divide-y divide-bms-border/40">
              {banners.map((b) => (
                <div key={b._id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <img src={b.imageUrl} alt="Banner" className="w-[100px] h-[50px] object-cover rounded-lg bg-slate-800 shadow-xs border border-bms-border flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                        b.type === 'hero' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {b.type}
                      </span>
                      <p className="text-xs text-bms-text-muted mt-1.5 font-medium break-all">{b.targetLink || "No link"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(b)} 
                      className="px-3 py-1.5 rounded-lg border border-bms-border text-bms-text hover:bg-bms-surface-hover text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-bms-surface"
                    >
                      <LuPen size={10} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(b._id)} 
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <LuTrash2 size={10} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
