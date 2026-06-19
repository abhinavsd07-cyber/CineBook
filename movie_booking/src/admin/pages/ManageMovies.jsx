import React, { useEffect, useState } from "react";
import { getAllMovies, createMovie, updateMovie, deleteMovie, uploadImage } from "../../config/allApis";
import { LuClapperboard, LuSearch, LuStar, LuTrash2, LuPlus, LuX } from "react-icons/lu";
import { toast } from "react-toastify";

const EMPTY = { 
  title: "", description: "", genre: "", language: "", duration: "", rating: 7, 
  poster: "", backdrop: "", trailer: "", director: "", isNowShowing: true, isUpcoming: false,
  cast: [], crew: [], itemType: "movie", basePrice: 0,
  eventTime: "", eventLocation: "", eventAgeGroups: "", releaseDate: ""
};

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});

  const fetchMovies = React.useCallback(() => {
    setLoading(true);
    getAllMovies()
      .then((r) => setMovies(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal("add"); };
  const openEdit = (m) => {
    setForm({ 
      ...m, 
      genre: Array.isArray(m.genre) ? m.genre.join(", ") : (m.genre || ""),
      language: Array.isArray(m.language) ? m.language.join(", ") : (m.language || ""),
      trailer: m.trailer || "",
      cast: m.cast || [],
      crew: m.crew || [],
      itemType: m.itemType || "movie",
      basePrice: m.basePrice || 0,
      eventTime: m.eventTime || "",
      eventLocation: m.eventLocation || "",
      eventAgeGroups: m.eventAgeGroups || "",
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : "",
    });
    setEditId(m._id);
    setModal("edit");
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        ...form, 
        genre: (form.genre || "").split(",").map((g) => g.trim()).filter(Boolean),
        language: (form.language || "").split(",").map((g) => g.trim()).filter(Boolean),
        cast: form.cast.filter(c => c.name), // filter out empty rows
        crew: form.crew.filter(c => c.name),
        basePrice: Number(form.basePrice)
      };
      if (editId) await updateMovie(editId, payload);
      else await createMovie(payload);
      fetchMovies();
      closeModal();
      toast.success("✅ Movie saved successfully!", {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Error saving movie", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await deleteMovie(id);
    fetchMovies();
  };

  const handleFileUpload = async (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadKey = index !== null ? `${field}-${index}` : field;
    setUploading({ ...uploading, [uploadKey]: true });
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImage(formData);
      
      if (index !== null) {
        const arr = [...form[field]];
        arr[index].image = res.data.url;
        setForm({ ...form, [field]: arr });
      } else {
        setForm({ ...form, [field]: res.data.url });
      }
    } catch (err) {
      toast.error("❌ Error uploading image", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
      console.error(err);
    } finally {
      setUploading({ ...uploading, [uploadKey]: false });
    }
  };

  const addArrayRow = (field) => {
    setForm({ ...form, [field]: [...form[field], { name: "", role: "", image: "" }] });
  };
  const updateArrayRow = (field, index, key, value) => {
    const arr = [...form[field]];
    arr[index][key] = value;
    setForm({ ...form, [field]: arr });
  };
  const removeArrayRow = (field, index) => {
    const arr = form[field].filter((_, i) => i !== index);
    setForm({ ...form, [field]: arr });
  };

  const filteredMovies = movies.filter(m => {
    const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || (m.genre || []).some(g => g.toLowerCase().includes(search.toLowerCase()));
    const itemType = m.itemType || "movie"; // defaults to movie
    const matchesType = typeFilter === "all" || itemType === typeFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "now_showing" && m.isNowShowing) || (statusFilter === "upcoming" && m.isUpcoming);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LuClapperboard className="text-bms-accent" />
            <span>Manage Items</span>
          </h1>
          <p className="text-bms-text-muted text-sm mt-1">{filteredMovies.length} items shown out of {movies.length}</p>
        </div>
        <button 
          className="btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-1.5" 
          onClick={openAdd} 
          id="add-movie-btn"
        >
          <LuPlus size={12} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filter/Search Bar */}
      <div className="flex justify-between items-start sm:items-center flex-wrap gap-4">
        <div className="flex items-center gap-2.5 bg-bms-surface border border-bms-border rounded-xl px-3.5 h-11 w-full max-w-[320px] focus-within:ring-2 focus-within:ring-bms-accent/10 focus-within:border-bms-accent transition-all duration-200">
          <LuSearch className="text-bms-text-dim" size={14} />
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim w-full" 
            placeholder="Search by title, genre..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-bms-text-dim hover:text-bms-text">
              <LuX size={12} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-3.5 h-11 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="event">Events</option>
            <option value="premiere">Premieres</option>
          </select>
          
          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-3.5 h-11 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Any Status</option>
            <option value="now_showing">Now Showing</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Items Table Card */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <LuClapperboard size={32} className="text-bms-text-dim/30" />
            <p className="text-bms-text-dim text-sm font-medium">No items found</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" style={{ minWidth: "800px" }}>
                <thead>
                  <tr className="border-b border-bms-border bg-bms-surface-hover/50 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                    <th className="px-4 py-3">Title Details</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bms-border/50">
                  {filteredMovies.map((m) => (
                    <tr key={m._id} className="hover:bg-bms-surface-hover/30 transition-colors duration-150 text-bms-text">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={m.poster} 
                            alt={m.title} 
                            className="w-8 h-11 object-cover rounded-md shadow-xs bg-slate-800 flex-shrink-0" 
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-bms-text leading-tight truncate">{m.title}</p>
                            <p className="text-xs text-bms-text-dim mt-0.5 truncate">{m.genre?.join(", ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 border border-bms-border bg-bms-surface-hover rounded text-[10px] font-semibold uppercase tracking-wider text-bms-text-muted">
                          {m.itemType || 'movie'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-bms-text-muted">{m.language?.join(", ")}</td>
                      <td className="px-4 py-3 text-xs text-bms-text-muted">{m.duration || "N/A"}</td>
                      <td className="px-4 py-3 font-bold text-amber-500 text-xs">
                        <div className="flex items-center gap-1">
                          <LuStar size={12} className="fill-current" />
                          <span>{m.rating?.toFixed(1) || m.rating}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {m.isNowShowing && (
                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Now Showing
                            </span>
                          )}
                          {m.isUpcoming && (
                            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="px-2.5 py-1 rounded-md border border-bms-border text-bms-text hover:bg-bms-surface-hover text-xs font-semibold transition-all cursor-pointer" 
                            onClick={() => openEdit(m)} 
                            id={`edit-movie-${m._id}`}
                          >
                            Edit
                          </button>
                          <button 
                            className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-all cursor-pointer" 
                            onClick={() => handleDelete(m._id, m.title)}
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
              {filteredMovies.map((m) => (
                <div key={m._id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <img 
                      src={m.poster} 
                      alt={m.title} 
                      className="w-10 h-14 object-cover rounded-lg shadow-xs bg-slate-800 flex-shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-bms-text leading-tight">{m.title}</p>
                      <p className="text-xs text-bms-text-dim mt-0.5">{m.genre?.join(", ")}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="px-1.5 py-0.5 border border-bms-border bg-bms-surface-hover rounded text-[10px] font-semibold uppercase tracking-wider text-bms-text-muted">
                          {m.itemType || 'movie'}
                        </span>
                        {m.language?.slice(0, 2).map((l) => (
                          <span key={l} className="text-[10px] text-bms-text-muted">{l}</span>
                        ))}
                        <span className="text-[10px] text-bms-text-muted">· {m.duration || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <LuStar size={11} className="fill-current" />
                        <span>{m.rating?.toFixed(1) || m.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {m.isNowShowing && (
                          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Now Showing
                          </span>
                        )}
                        {m.isUpcoming && (
                          <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        className="px-2.5 py-1 rounded-md border border-bms-border text-bms-text hover:bg-bms-surface-hover text-xs font-semibold transition-all cursor-pointer" 
                        onClick={() => openEdit(m)} 
                        id={`edit-movie-mob-${m._id}`}
                      >
                        Edit
                      </button>
                      <button 
                        className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-all cursor-pointer" 
                        onClick={() => handleDelete(m._id, m.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 md:p-8 w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-bms-border">
              <h3 className="text-xl font-semibold text-bms-text">{modal === "add" ? "Add New Item" : "Edit Item"}</h3>
              <button onClick={closeModal} className="text-bms-text-dim hover:text-bms-text transition-colors cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Item Type *</label>
                  <select 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all cursor-pointer" 
                    value={form.itemType} 
                    onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                  >
                    <option value="movie">Movie</option>
                    <option value="event">Ticketed Live Event</option>
                    <option value="premiere">Premiere (Stream)</option>
                  </select>
                </div>
                {["premiere", "event"].includes(form.itemType) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Base Price / Ticket Price (Rs.) *</label>
                    <input 
                      type="number" 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                      value={form.basePrice} 
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })} 
                      required 
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Release Date / Event Date</label>
                  <input 
                    type="date" 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all" 
                    value={form.releaseDate} 
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} 
                  />
                </div>
              </div>

              {form.itemType === "event" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-dashed border-bms-border p-4 rounded-2xl bg-bms-surface-hover/20">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Event Time</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                      value={form.eventTime} 
                      onChange={(e) => setForm({ ...form, eventTime: e.target.value })} 
                      placeholder="e.g. 4:00 PM" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Location</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                      value={form.eventLocation} 
                      onChange={(e) => setForm({ ...form, eventLocation: e.target.value })} 
                      placeholder="e.g. Crowne Plaza" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Age Groups</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                      value={form.eventAgeGroups} 
                      onChange={(e) => setForm({ ...form, eventAgeGroups: e.target.value })} 
                      placeholder="e.g. All age groups" 
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Title *</label>
                <input 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Description *</label>
                <textarea 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all min-h-[80px] resize-y" 
                  rows={3} 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Genre (comma-separated)</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    value={form.genre} 
                    onChange={(e) => setForm({ ...form, genre: e.target.value })} 
                    placeholder="Action, Thriller" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Language (comma-separated)</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    value={form.language} 
                    onChange={(e) => setForm({ ...form, language: e.target.value })} 
                    placeholder="English, Hindi" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Duration</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    value={form.duration} 
                    onChange={(e) => setForm({ ...form, duration: e.target.value })} 
                    placeholder="2h 30m" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Base Rating (0-10)</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    type="number" 
                    min={0} 
                    max={10} 
                    step={0.1} 
                    value={form.rating} 
                    onChange={(e) => setForm({ ...form, rating: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">
                    {form.itemType === "event" ? "Portrait Poster URL *" : "Poster URL *"} 
                    {uploading.poster && " (Uploading...)"}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                      value={form.poster} 
                      onChange={(e) => setForm({ ...form, poster: e.target.value })} 
                      required 
                    />
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "poster")} style={{ display: "none" }} id="poster-upload" />
                    <label htmlFor="poster-upload" className="px-4 py-2.5 rounded-xl border border-bms-border hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap bg-bms-surface text-bms-text">Upload</label>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">
                    {form.itemType === "event" ? "Landscape Banner URL" : "Backdrop URL"} 
                    {uploading.backdrop && " (Uploading...)"}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                      value={form.backdrop} 
                      onChange={(e) => setForm({ ...form, backdrop: e.target.value })} 
                    />
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "backdrop")} style={{ display: "none" }} id="backdrop-upload" />
                    <label htmlFor="backdrop-upload" className="px-4 py-2.5 rounded-xl border border-bms-border hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer flex items-center justify-center whitespace-nowrap bg-bms-surface text-bms-text">Upload</label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Trailer URL (YouTube Link)</label>
                <input 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                  value={form.trailer} 
                  onChange={(e) => setForm({ ...form, trailer: e.target.value })} 
                  placeholder="https://www.youtube.com/embed/..." 
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Director</label>
                <input 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                  value={form.director} 
                  onChange={(e) => setForm({ ...form, director: e.target.value })} 
                />
              </div>
              
              {/* Cast & Crew Arrays */}
              <div className="border border-bms-border p-4 rounded-2xl bg-bms-surface-hover/10">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-semibold text-bms-text uppercase tracking-wider">Cast Members</label>
                  <button 
                    type="button" 
                    className="px-3.5 py-1.5 rounded-lg border border-bms-border hover:bg-bms-surface-hover text-xs font-bold transition-all cursor-pointer bg-bms-surface text-bms-text" 
                    onClick={() => addArrayRow("cast")}
                  >
                    + Add Cast
                  </button>
                </div>
                <div className="flex flex-col gap-3.5">
                  {form.cast.map((c, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center border border-bms-border/50 rounded-xl p-3 bg-bms-surface/50 relative">
                      <input 
                        className="sm:col-span-3 bg-bms-surface border border-bms-border rounded-lg px-3 py-1.5 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                        placeholder="Name" 
                        value={c.name} 
                        onChange={e => updateArrayRow("cast", i, "name", e.target.value)} 
                      />
                      <input 
                        className="sm:col-span-3 bg-bms-surface border border-bms-border rounded-lg px-3 py-1.5 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                        placeholder="Role/Character" 
                        value={c.role} 
                        onChange={e => updateArrayRow("cast", i, "role", e.target.value)} 
                      />
                      <div className="sm:col-span-5 flex gap-2">
                        <input 
                          className="flex-1 bg-bms-surface border border-bms-border rounded-lg px-3 py-1.5 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all min-w-0" 
                          placeholder="Image URL" 
                          value={c.image} 
                          onChange={e => updateArrayRow("cast", i, "image", e.target.value)} 
                        />
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "cast", i)} style={{ display: "none" }} id={`cast-upload-${i}`} />
                        <label htmlFor={`cast-upload-${i}`} className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-lg border border-bms-border hover:bg-bms-surface-hover text-xs font-semibold transition-all cursor-pointer bg-bms-surface text-bms-text">
                          {uploading[`cast-${i}`] ? "..." : "Upload"}
                        </label>
                      </div>
                      <button 
                        type="button" 
                        className="sm:col-span-1 p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer border border-dashed border-red-500/10 text-center text-xs font-bold w-full flex items-center justify-center" 
                        onClick={() => removeArrayRow("cast", i)}
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-bms-border p-4 rounded-2xl bg-bms-surface-hover/10">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-semibold text-bms-text uppercase tracking-wider">Crew Members</label>
                  <button 
                    type="button" 
                    className="px-3.5 py-1.5 rounded-lg border border-bms-border hover:bg-bms-surface-hover text-xs font-bold transition-all cursor-pointer bg-bms-surface text-bms-text" 
                    onClick={() => addArrayRow("crew")}
                  >
                    + Add Crew
                  </button>
                </div>
                <div className="flex flex-col gap-3.5">
                  {form.crew.map((c, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center border border-bms-border/50 rounded-xl p-3 bg-bms-surface/50 relative">
                      <input 
                        className="sm:col-span-3 bg-bms-surface border border-bms-border rounded-lg px-3 py-1.5 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                        placeholder="Name" 
                        value={c.name} 
                        onChange={e => updateArrayRow("crew", i, "name", e.target.value)} 
                      />
                      <input 
                        className="sm:col-span-3 bg-bms-surface border border-bms-border rounded-lg px-3 py-1.5 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                        placeholder="Department/Role" 
                        value={c.role} 
                        onChange={e => updateArrayRow("crew", i, "role", e.target.value)} 
                      />
                      <div className="sm:col-span-5 flex gap-2">
                        <input 
                          className="flex-1 bg-bms-surface border border-bms-border rounded-lg px-3 py-1.5 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all min-w-0" 
                          placeholder="Image URL" 
                          value={c.image} 
                          onChange={e => updateArrayRow("crew", i, "image", e.target.value)} 
                        />
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "crew", i)} style={{ display: "none" }} id={`crew-upload-${i}`} />
                        <label htmlFor={`crew-upload-${i}`} className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-lg border border-bms-border hover:bg-bms-surface-hover text-xs font-semibold transition-all cursor-pointer bg-bms-surface text-bms-text">
                          {uploading[`crew-${i}`] ? "..." : "Upload"}
                        </label>
                      </div>
                      <button 
                        type="button" 
                        className="sm:col-span-1 p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer border border-dashed border-red-500/10 text-center text-xs font-bold w-full flex items-center justify-center" 
                        onClick={() => removeArrayRow("crew", i)}
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 mt-2.5">
                <label className="flex items-center gap-2.5 text-sm font-bold text-bms-text cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-bms-accent border-bms-border rounded-sm focus:ring-bms-accent" 
                    checked={form.isNowShowing} 
                    onChange={(e) => setForm({ ...form, isNowShowing: e.target.checked })} 
                  />
                  <span>Now Showing</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm font-bold text-bms-text cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-bms-accent border-bms-border rounded-sm focus:ring-bms-accent" 
                    checked={form.isUpcoming} 
                    onChange={(e) => setForm({ ...form, isUpcoming: e.target.checked })} 
                  />
                  <span>Upcoming</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-bms-border">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-xl border border-bms-border text-bms-text hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-bms-accent hover:bg-bms-accent-hover text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs" 
                  disabled={submitting} 
                  id="save-movie-btn"
                >
                  {submitting ? "Saving..." : "Save Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
