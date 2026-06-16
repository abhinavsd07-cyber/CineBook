import React, { useEffect, useState } from "react";
import { getAllMovies, createMovie, updateMovie, deleteMovie, uploadImage } from "../../config/allApis";
import { FaClapperboard, FaMagnifyingGlass, FaStar } from "react-icons/fa6";
import "../AdminLayout.css";

const EMPTY = { 
  title: "", description: "", genre: "", language: "", duration: "", rating: 7, 
  poster: "", backdrop: "", trailer: "", director: "", isNowShowing: true, isUpcoming: false,
  cast: [], crew: [], itemType: "movie", basePrice: 0,
  eventTime: "", eventLocation: "", eventAgeGroups: "", releaseDate: ""
};

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});

  const fetchMovies = React.useCallback(() => {
    setLoading(true);
    getAllMovies(search ? { search } : {})
      .then((r) => setMovies(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

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
    } catch (err) {
      alert(err.response?.data?.message || "Error saving movie");
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
      alert("Error uploading image");
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

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title"><FaClapperboard style={{ verticalAlign: "middle", marginRight: 8 }} /> Manage Movies</h1>
          <p className="admin-page-sub">{movies.length} movies in database</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-movie-btn">+ Add Movie</button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search">
          <span className="admin-search-icon"><FaMagnifyingGlass /></span>
          <input type="text" className="form-input" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "32px" }} />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>Title</th><th>Type</th><th>Language</th><th>Duration</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={m.poster} alt={m.title} style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 6 }} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{m.title}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>{m.genre?.join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: "#eee", color: "#333", textTransform: "capitalize" }}>{m.itemType || 'movie'}</span></td>
                    <td>{m.language?.join(", ")}</td>
                    <td>{m.duration}</td>
                    <td><span className="text-gold"><FaStar style={{ verticalAlign: 'text-bottom' }} /> {m.rating?.toFixed(1) || m.rating}</span></td>
                    <td>
                      {m.isNowShowing && <span className="badge badge-success" style={{ marginRight: 4 }}>Now Showing</span>}
                      {m.isUpcoming && <span className="badge badge-warning">Upcoming</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)} id={`edit-movie-${m._id}`}>Edit</button>
                        <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "var(--clr-error)", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => handleDelete(m._id, m.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {movies.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--clr-text-muted)", padding: "40px" }}>No items found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 800, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 className="modal-title">{modal === "add" ? "Add New Item" : "Edit Item"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              
              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">Item Type *</label>
                  <select className="form-input" value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
                    <option value="movie">Movie</option>
                    <option value="event">Ticketed Live Event</option>
                    <option value="premiere">Premiere (Stream)</option>
                  </select>
                </div>
                {["premiere", "event"].includes(form.itemType) && (
                  <div className="form-group">
                    <label className="form-label">Base Price / Ticket Price (Rs.) *</label>
                    <input type="number" className="form-input" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
                  </div>
                )}
              </div>

              {form.itemType === "event" && (
                <div className="admin-grid-2" style={{ marginBottom: "18px" }}>
                  <div className="form-group">
                    <label className="form-label">Event Date</label>
                    <input type="date" className="form-input" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Time</label>
                    <input className="form-input" value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} placeholder="e.g. 4:00 PM" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={form.eventLocation} onChange={(e) => setForm({ ...form, eventLocation: e.target.value })} placeholder="e.g. Crowne Plaza" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age Groups</label>
                    <input className="form-input" value={form.eventAgeGroups} onChange={(e) => setForm({ ...form, eventAgeGroups: e.target.value })} placeholder="e.g. All age groups" />
                  </div>
                </div>
              )}

              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: "vertical" }} /></div>
              
              <div className="admin-grid-2">
                <div className="form-group"><label className="form-label">Genre (comma-separated)</label><input className="form-input" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Action, Thriller" /></div>
                <div className="form-group"><label className="form-label">Language (comma-separated)</label><input className="form-input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="English, Hindi" /></div>
              </div>
              
              <div className="admin-grid-2">
                <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2h 30m" /></div>
                <div className="form-group"><label className="form-label">Base Rating (0-10)</label><input className="form-input" type="number" min={0} max={10} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    {form.itemType === "event" ? "Portrait Poster URL (Home/Grid) *" : "Poster URL *"} 
                    {uploading.poster && " (Uploading...)"}
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-input" value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} required />
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "poster")} style={{ display: "none" }} id="poster-upload" />
                    <label htmlFor="poster-upload" className="btn btn-outline" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>Upload</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {form.itemType === "event" ? "Landscape Banner URL (Tickets/Details)" : "Backdrop URL"} 
                    {uploading.backdrop && " (Uploading...)"}
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-input" value={form.backdrop} onChange={(e) => setForm({ ...form, backdrop: e.target.value })} />
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "backdrop")} style={{ display: "none" }} id="backdrop-upload" />
                    <label htmlFor="backdrop-upload" className="btn btn-outline" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>Upload</label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Trailer URL (YouTube Link)</label>
                <input className="form-input" value={form.trailer} onChange={(e) => setForm({ ...form, trailer: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
              </div>
              
              <div className="form-group"><label className="form-label">Director</label><input className="form-input" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} /></div>
              
              {/* Cast & Crew Arrays */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label className="form-label" style={{ margin: 0 }}>Cast Members</label>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addArrayRow("cast")}>+ Add Cast</button>
                </div>
                {form.cast.map((c, i) => (
                  <div key={i} className="admin-grid-cast">
                    <input className="form-input" placeholder="Name" value={c.name} onChange={e => updateArrayRow("cast", i, "name", e.target.value)} />
                    <input className="form-input" placeholder="Role/Character" value={c.role} onChange={e => updateArrayRow("cast", i, "role", e.target.value)} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="form-input" placeholder="Image URL" value={c.image} onChange={e => updateArrayRow("cast", i, "image", e.target.value)} />
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "cast", i)} style={{ display: "none" }} id={`cast-upload-${i}`} />
                      <label htmlFor={`cast-upload-${i}`} className="btn btn-outline btn-sm" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                        {uploading[`cast-${i}`] ? "..." : "Upload"}
                      </label>
                    </div>
                    <button type="button" className="btn btn-sm" style={{ color: "red" }} onClick={() => removeArrayRow("cast", i)}>X</button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label className="form-label" style={{ margin: 0 }}>Crew Members</label>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addArrayRow("crew")}>+ Add Crew</button>
                </div>
                {form.crew.map((c, i) => (
                  <div key={i} className="admin-grid-cast">
                    <input className="form-input" placeholder="Name" value={c.name} onChange={e => updateArrayRow("crew", i, "name", e.target.value)} />
                    <input className="form-input" placeholder="Department/Role" value={c.role} onChange={e => updateArrayRow("crew", i, "role", e.target.value)} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="form-input" placeholder="Image URL" value={c.image} onChange={e => updateArrayRow("crew", i, "image", e.target.value)} />
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "crew", i)} style={{ display: "none" }} id={`crew-upload-${i}`} />
                      <label htmlFor={`crew-upload-${i}`} className="btn btn-outline btn-sm" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
                        {uploading[`crew-${i}`] ? "..." : "Upload"}
                      </label>
                    </div>
                    <button type="button" className="btn btn-sm" style={{ color: "red" }} onClick={() => removeArrayRow("crew", i)}>X</button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isNowShowing} onChange={(e) => setForm({ ...form, isNowShowing: e.target.checked })} />
                  Now Showing
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isUpcoming} onChange={(e) => setForm({ ...form, isUpcoming: e.target.checked })} />
                  Upcoming
                </label>
              </div>

              <div className="modal-footer" style={{ marginTop: 30 }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="save-movie-btn">
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
