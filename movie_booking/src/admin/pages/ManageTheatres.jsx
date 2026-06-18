import React, { useEffect, useState } from "react";
import { getAllTheatres, createTheatre, updateTheatre, deleteTheatre } from "../../config/allApis";
import { LuBuilding2, LuMapPin, LuSearch, LuPlus, LuX } from "react-icons/lu";
import { POPULAR_CITIES } from "../../components/Header";
import { toast } from "react-toastify";

const EMPTY = { name: "", location: "", address: "", phone: "", totalScreens: 1, amenities: "" };

export default function ManageTheatres() {
  const [theatres, setTheatres] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const fetch = () => getAllTheatres().then((r) => setTheatres(r.data.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("add"); };
  const openEdit = (t) => { setForm({ ...EMPTY, ...t, amenities: t.amenities?.join(", ") || "" }); setEditId(t._id); setModal("edit"); };
  const close = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean) };
      if (editId) await updateTheatre(editId, payload);
      else await createTheatre(payload);
      fetch(); close();
      toast.success("✅ Theatre saved successfully!", {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Error saving theatre", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await deleteTheatre(id); fetch();
  };

  const filteredTheatres = theatres.filter(t => 
    (locationFilter === "" || (t.location || "").trim().toLowerCase() === locationFilter.trim().toLowerCase()) &&
    (t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.location?.toLowerCase().includes(search.toLowerCase()) ||
    t.address?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LuBuilding2 className="text-bms-accent" />
            <span>Manage Theatres</span>
          </h1>
          <p className="text-bms-text-muted text-sm mt-1">{theatres.length} theatres registered</p>
        </div>
        <button 
          className="btn bg-bms-accent hover:bg-bms-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5" 
          onClick={openAdd} 
          id="add-theatre-btn"
        >
          <LuPlus size={14} />
          <span>Add Theatre</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2.5 bg-bms-surface border border-bms-border rounded-xl px-3.5 h-11 w-full max-w-[320px] focus-within:ring-2 focus-within:ring-bms-accent/10 focus-within:border-bms-accent transition-all duration-200">
          <LuSearch className="text-bms-text-dim" size={14} />
          <input 
            type="text" 
            placeholder="Search theatres..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim w-full" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-4 h-11 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
            value={locationFilter} 
            onChange={e => setLocationFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {POPULAR_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        {filteredTheatres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <LuBuilding2 size={32} className="text-bms-text-dim/30" />
            <p className="text-bms-text-dim text-sm font-medium">No theatres found</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" style={{ minWidth: "800px" }}>
                <thead>
                  <tr className="border-b border-bms-border bg-bms-surface-hover/50 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                    <th className="px-6 py-4">Theatre Name & Address</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Screens</th>
                    <th className="px-6 py-4">Amenities</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bms-border/50">
                  {filteredTheatres.map((t) => (
                    <tr key={t._id} className="hover:bg-bms-surface-hover/30 transition-colors duration-150 text-bms-text">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-bms-text leading-tight">{t.name}</p>
                        <p className="text-xs text-bms-text-dim mt-1.5">{t.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-bms-text-muted">
                          <LuMapPin size={12} className="text-bms-accent" />
                          <span>{t.location}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-bms-text-muted">{t.phone || "—"}</td>
                      <td className="px-6 py-4 font-semibold text-bms-text-muted">{t.totalScreens}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {t.amenities?.map((a) => (
                            <span key={a} className="bg-bms-accent/10 text-bms-accent text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="px-3 py-1.5 rounded-lg border border-bms-border text-bms-text hover:bg-bms-surface-hover text-xs font-bold transition-all cursor-pointer" 
                            onClick={() => openEdit(t)} 
                            id={`edit-theatre-${t._id}`}
                          >
                            Edit
                          </button>
                          <button 
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer" 
                            onClick={() => handleDelete(t._id, t.name)}
                          >
                            Delete
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
              {filteredTheatres.map((t) => (
                <div key={t._id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-bms-text leading-tight">{t.name}</p>
                      <p className="text-xs text-bms-text-dim mt-1">{t.address}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-bms-text-muted flex-shrink-0">
                      <LuMapPin size={11} className="text-bms-accent" />
                      <span className="font-semibold">{t.location}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bms-text-muted">
                    {t.phone && <span>📞 {t.phone}</span>}
                    <span className="font-semibold">{t.totalScreens} screen{t.totalScreens !== 1 ? "s" : ""}</span>
                  </div>
                  {t.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {t.amenities.map((a) => (
                        <span key={a} className="bg-bms-accent/10 text-bms-accent text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1.5 rounded-lg border border-bms-border text-bms-text hover:bg-bms-surface-hover text-xs font-bold transition-all cursor-pointer" 
                      onClick={() => openEdit(t)} 
                      id={`edit-theatre-mob-${t._id}`}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer" 
                      onClick={() => handleDelete(t._id, t.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 md:p-8 w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-bms-border">
              <h3 className="text-xl font-semibold text-bms-text">{modal === "add" ? "Add Theatre" : "Edit Theatre"}</h3>
              <button onClick={close} className="text-bms-text-dim hover:text-bms-text transition-colors cursor-pointer">
                <LuX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Theatre Name *</label>
                <input 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">City / Location *</label>
                  <select 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
                    value={form.location} 
                    onChange={(e) => setForm({ ...form, location: e.target.value })} 
                    required
                  >
                    <option value="">Select City</option>
                    {POPULAR_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Phone</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Full Address *</label>
                <input 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Total Screens</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    type="number" 
                    min={1} 
                    value={form.totalScreens} 
                    onChange={(e) => setForm({ ...form, totalScreens: e.target.value })} 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Amenities (comma-separated)</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    value={form.amenities} 
                    onChange={(e) => setForm({ ...form, amenities: e.target.value })} 
                    placeholder="Dolby, IMAX, Parking" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-bms-border">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-xl border border-bms-border text-bms-text hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer" 
                  onClick={close}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-bms-accent hover:bg-bms-accent-hover text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs" 
                  disabled={submitting} 
                  id="save-theatre-btn"
                >
                  {submitting ? "Saving..." : "Save Theatre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
