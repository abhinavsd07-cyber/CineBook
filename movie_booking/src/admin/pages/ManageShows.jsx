import React, { useEffect, useState } from "react";
import { getAllShows, createShow, deleteShow, getAllMovies, getAllTheatres, updateShow } from "../../config/allApis";
import { FaChair } from "react-icons/fa6";
import { POPULAR_CITIES } from "../../components/Header";
import "../AdminLayout.css";

const EMPTY = { movie: "", theatre: "", screen: "Screen 1", startDate: "", endDate: "", time: "", format: "2D", language: "English", goldPrice: 200, platinumPrice: 350, reclinerPrice: 500 };

const format12Hour = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) return timeStr;
  const [hourStr, minStr] = timeStr.split(":");
  if (!hourStr || !minStr) return timeStr;
  let h = parseInt(hourStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const padH = h < 10 ? "0" + h : h;
  return `${padH}:${minStr} ${ampm}`;
};

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editGroup, setEditGroup] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [movieFilter, setMovieFilter] = useState("");
  const [theatreFilter, setTheatreFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [modalCity, setModalCity] = useState("");

  const fetchAll = () => {
    Promise.all([getAllShows(), getAllMovies(), getAllTheatres()])
      .then(([s, m, t]) => { setShows(s.data.data); setMovies(m.data.data); setTheatres(t.data.data); })
      .catch(console.error);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleEdit = (g) => {
    setEditGroup(g);
    setModalCity(g.theatre?.location || "");
    setForm({
      movie: g.movie?._id,
      theatre: g.theatre?._id,
      startDate: g.date.split('T')[0],
      endDate: "",
      time: g.showsList.map(s => format12Hour(s.time)).join(", "),
      format: g.format,
      screen: g.screen || "Screen 1",
      language: g.language || "English",
      goldPrice: g.seats?.gold?.price || 200,
      platinumPrice: g.seats?.platinum?.price || 350,
      reclinerPrice: g.seats?.recliner?.price || 500,
    });
    setModal(true);
  };

  const handleDuplicate = (g) => {
    setEditGroup(null);
    setModalCity(g.theatre?.location || "");
    setForm({
      movie: g.movie?._id,
      theatre: g.theatre?._id,
      startDate: "",
      endDate: "",
      time: g.showsList.map(s => format12Hour(s.time)).join(", "),
      format: g.format,
      screen: g.screen || "Screen 1",
      language: g.language || "English",
      goldPrice: g.seats?.gold?.price || 200,
      platinumPrice: g.seats?.platinum?.price || 350,
      reclinerPrice: g.seats?.recliner?.price || 500,
    });
    setModal(true);
  };

  const getDatesInRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { 
      if (editGroup) {
        const existingShowsMap = new Map();
        editGroup.showsList.forEach(s => {
          existingShowsMap.set(format12Hour(s.time).toLowerCase().replace(/\s+/g, ''), s);
        });

        const inputTimes = form.time.split(",").map(t => t.trim()).filter(Boolean);
        const promises = [];

        for (const t of inputTimes) {
          const key = format12Hour(t).toLowerCase().replace(/\s+/g, '');
          const updatedSeats = JSON.parse(JSON.stringify(editGroup.seats || {}));
          if (updatedSeats.gold) updatedSeats.gold.price = Number(form.goldPrice);
          if (updatedSeats.platinum) updatedSeats.platinum.price = Number(form.platinumPrice);
          if (updatedSeats.recliner) updatedSeats.recliner.price = Number(form.reclinerPrice);

          if (existingShowsMap.has(key)) {
            const existingShow = existingShowsMap.get(key);
            promises.push(updateShow(existingShow.id, {
              movie: form.movie, theatre: form.theatre, date: form.startDate,
              format: form.format, screen: form.screen, language: form.language, seats: updatedSeats
            }));
            existingShowsMap.delete(key);
          } else {
            promises.push(createShow({
              movie: form.movie, theatre: form.theatre, date: form.startDate, time: t,
              format: form.format, screen: form.screen, language: form.language,
              goldPrice: form.goldPrice, platinumPrice: form.platinumPrice, reclinerPrice: form.reclinerPrice
            }));
          }
        }

        // Any remaining shows were removed from the input, delete them
        existingShowsMap.forEach(s => promises.push(deleteShow(s.id)));
        await Promise.all(promises);
      } else {
        const times = form.time.split(",").map(t => t.trim()).filter(Boolean);
        const dates = form.endDate ? getDatesInRange(form.startDate, form.endDate) : [form.startDate];
        const promises = [];
        let duplicatesSkipped = 0;

        for (const d of dates) {
          for (const t of times) {
            const isDuplicate = shows.some(s => 
              s.movie?._id === form.movie &&
              s.theatre?._id === form.theatre &&
              s.date?.split('T')[0] === d &&
              format12Hour(s.time).toLowerCase().replace(/\s+/g, '') === format12Hour(t).toLowerCase().replace(/\s+/g, '') &&
              s.format === form.format &&
              s.language === form.language
            );

            if (!isDuplicate) {
              promises.push(createShow({ ...form, date: d, time: t }));
            } else {
              duplicatesSkipped++;
            }
          }
        }
        await Promise.all(promises);
        if (duplicatesSkipped > 0) {
          console.warn(`Skipped ${duplicatesSkipped} duplicate showtimes.`);
        }
      }
      fetchAll(); setModal(false); setForm(EMPTY); setEditGroup(null);
    }
    catch (err) { alert(err.response?.data?.message || "Error"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this show time?")) return;
    await deleteShow(id); fetchAll();
  };

  const handleDeleteAll = async (showsList) => {
    if (!window.confirm("Delete all times for this date?")) return;
    await Promise.all(showsList.map(s => deleteShow(s.id)));
    fetchAll();
  };

  const filteredShows = shows.filter(s => {
    const sDate = s.date?.split('T')[0];
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = sDate === new Date().toISOString().split('T')[0];
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = sDate === tomorrow.toISOString().split('T')[0];
    } else if (dateFilter && dateFilter !== "all") {
      matchesDate = sDate === dateFilter;
    }

    return (
      matchesDate &&
      (locationFilter === "" || (s.theatre?.location || "").trim().toLowerCase() === locationFilter.trim().toLowerCase()) &&
      (movieFilter === "" || s.movie?._id === movieFilter) &&
      (theatreFilter === "" || s.theatre?._id === theatreFilter) &&
      (s.movie?.title?.toLowerCase().includes(search.toLowerCase()) || 
      s.theatre?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.theatre?.location?.toLowerCase().includes(search.toLowerCase()) ||
      s.theatre?.address?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const groupedShows = {};
  filteredShows.forEach(s => {
    const key = `${s.movie?._id}_${s.theatre?._id}_${s.date}_${s.screen || 'Screen 1'}_${s.format}_${s.language}`;
    if (!groupedShows[key]) {
      groupedShows[key] = {
        key, movie: s.movie, theatre: s.theatre, date: s.date, screen: s.screen || 'Screen 1', format: s.format, language: s.language, seats: s.seats, showsList: []
      };
    }
    // Only add active shows
    groupedShows[key].showsList.push({ id: s._id, time: s.time });
  });

  const groupedShowsArray = Object.values(groupedShows).sort((a, b) => {
    switch (sortBy) {
      case "date_asc": return new Date(a.date) - new Date(b.date);
      case "date_desc": return new Date(b.date) - new Date(a.date);
      case "movie_asc": return (a.movie?.title || "").localeCompare(b.movie?.title || "");
      case "theatre_asc": return (a.theatre?.name || "").localeCompare(b.theatre?.name || "");
      default: return new Date(b.date) - new Date(a.date);
    }
  });

  const SortHeader = ({ label, sortKey }) => (
    <th onClick={() => setSortBy(sortBy === `${sortKey}_asc` ? `${sortKey}_desc` : `${sortKey}_asc`)} style={{ cursor: "pointer", userSelect: "none" }}>
      {label} {sortBy.startsWith(sortKey) ? (sortBy.endsWith('asc') ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title"><FaChair style={{ verticalAlign: "middle", marginRight: 8 }} /> Manage Shows</h1><p className="admin-page-sub">{shows.length} shows scheduled</p></div>
        <button className="btn btn-primary" onClick={() => { setEditGroup(null); setForm(EMPTY); setModalCity(""); setModal(true); }} id="add-show-btn">+ Add Show</button>
      </div>
      <div className="admin-filter-bar">
        <div className="admin-search">
          <span className="admin-search-icon">🔍</span>
          <input type="text" className="form-input" placeholder="Search shows..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "32px" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="form-input btn-sm" value={locationFilter} onChange={e => {
            const newLoc = e.target.value;
            setLocationFilter(newLoc);
            if (newLoc && theatreFilter) {
              const selectedT = theatres.find(t => t._id === theatreFilter);
              if (selectedT && (selectedT.location || "").trim().toLowerCase() !== newLoc.trim().toLowerCase()) {
                setTheatreFilter("");
              }
            }
          }} style={{ width: "auto" }}>
            <option value="">All Cities</option>
            {POPULAR_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <select className="form-input btn-sm" value={movieFilter} onChange={e => setMovieFilter(e.target.value)} style={{ width: "auto", maxWidth: "150px" }}>
            <option value="">All Movies</option>
            {movies.filter(m => m.itemType !== "event").map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
          <select className="form-input btn-sm" value={theatreFilter} onChange={e => setTheatreFilter(e.target.value)} style={{ width: "auto", maxWidth: "150px" }}>
            <option value="">All Theatres</option>
            {theatres
              .filter(t => locationFilter === "" || (t.location || "").trim().toLowerCase() === locationFilter.trim().toLowerCase())
              .map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <select className="form-input btn-sm" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            {Array.from(new Set(shows.map(s => s.date?.split('T')[0]).filter(Boolean))).sort().map(d => (
              <option key={d} value={d}>{new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <SortHeader label="Movie" sortKey="movie" />
                <SortHeader label="Theatre" sortKey="theatre" />
                <SortHeader label="Date" sortKey="date" />
                <th>Time</th><th>Screen & Format</th><th>Prices</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedShowsArray.map((g) => (
                <tr key={g.key}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={g.movie?.poster} alt="" style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 4 }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600 }}>{g.movie?.title}</span>
                        {g.movie?.duration && (
                          <span style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>{g.movie.duration}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{g.theatre?.name}<br /><span style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>{g.theatre?.address}{g.theatre?.address && g.theatre?.location ? " • " : ""}{g.theatre?.location}</span></td>
                  <td>{new Date(g.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "200px" }}>
                      {g.showsList.map(show => (
                        <div key={show.id} style={{ display: "flex", alignItems: "center", background: "var(--clr-surface-2)", border: "1px solid var(--clr-border)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.8rem", fontWeight: 600 }}>
                          {format12Hour(show.time)}
                          <button onClick={() => handleDelete(show.id)} style={{ background: "transparent", border: "none", marginLeft: 4, color: "var(--clr-error)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}>&times;</button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="badge" style={{ alignSelf: "flex-start", background: "#f1f5f9", color: "#334155" }}>{g.screen}</span>
                      <span className="badge badge-platinum" style={{ alignSelf: "flex-start" }}>{g.format}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)", fontWeight: "600", marginTop: "2px" }}>{g.language}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "0.75rem" }}>
                      <span className="text-gold">G: ₹{g.seats?.gold?.price}</span>
                      <span style={{ color: "var(--clr-platinum)" }}>P: ₹{g.seats?.platinum?.price}</span>
                      <span style={{ color: "var(--clr-recliner)" }}>R: ₹{g.seats?.recliner?.price}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button className="btn btn-sm" style={{ background: "rgba(59,130,246,0.1)", color: "var(--clr-primary)", border: "1px solid rgba(59,130,246,0.3)" }} onClick={() => handleEdit(g)}>Edit</button>
                      <button className="btn btn-sm" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }} onClick={() => handleDuplicate(g)}>Clone</button>
                      <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "var(--clr-error)", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => handleDeleteAll(g.showsList)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {groupedShowsArray.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", color: "var(--clr-text-muted)", padding: "40px" }}>No shows found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <h3 className="modal-title">{editGroup ? "Edit Shows Group" : "Create New Show"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Movie *</label>
                <select className="form-input" value={form.movie} onChange={(e) => setForm({ ...form, movie: e.target.value })} required>
                  <option value="">Select Movie</option>
                  {movies.filter(m => ["movie", "premiere"].includes(m.itemType)).map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">City (Filter Theatres)</label>
                  <select className="form-input" value={modalCity} onChange={(e) => { setModalCity(e.target.value); setForm({ ...form, theatre: "" }); }}>
                    <option value="">All Cities</option>
                    {POPULAR_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Theatre *</label>
                  <select className="form-input" value={form.theatre} onChange={(e) => setForm({ ...form, theatre: e.target.value })} required>
                    <option value="">Select Theatre</option>
                    {theatres.filter(t => !modalCity || t.location === modalCity).map((t) => <option key={t._id} value={t._id}>{t.name} — {t.address ? t.address + ", " : ""}{t.location}</option>)}
                  </select>
                </div>
              </div>
              <div className="admin-grid-3">
                <div className="form-group"><label className="form-label">{editGroup ? "Date *" : "Start Date *"}</label><input className="form-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
                {!editGroup && <div className="form-group"><label className="form-label">End Date (Optional)</label><input className="form-input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} min={form.startDate} /></div>}
                <div className="form-group" style={{ gridColumn: editGroup ? "span 2" : "auto" }}><label className="form-label">Time(s) *</label><input className="form-input" type="text" placeholder="e.g. 10:30 AM, 02:15 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></div>
              </div>
              <div className="admin-grid-3">
                <div className="form-group"><label className="form-label">Format</label>
                  <select className="form-input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    {["2D","3D","IMAX","4DX"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Screen</label>
                  <select className="form-input" value={form.screen} onChange={(e) => setForm({ ...form, screen: e.target.value })}>
                    {Array.from({ length: theatres.find(t => t._id === form.theatre)?.totalScreens || 1 }, (_, i) => (
                      <option key={i} value={`Screen ${i + 1}`}>Screen {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Language</label><input className="form-input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></div>
              </div>
              <div style={{ background: "var(--clr-surface-2)", border: "1px solid var(--clr-border)", borderRadius: "var(--radius-lg)", padding: "16px" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: 12, color: "var(--clr-text-muted)" }}>SEAT PRICING</p>
                <div className="admin-grid-3">
                  <div className="form-group"><label className="form-label text-gold">Gold ₹</label><input className="form-input" type="number" value={form.goldPrice} onChange={(e) => setForm({ ...form, goldPrice: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label" style={{ color: "var(--clr-platinum)" }}>Platinum ₹</label><input className="form-input" type="number" value={form.platinumPrice} onChange={(e) => setForm({ ...form, platinumPrice: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label" style={{ color: "var(--clr-recliner)" }}>Recliner ₹</label><input className="form-input" type="number" value={form.reclinerPrice} onChange={(e) => setForm({ ...form, reclinerPrice: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="save-show-btn">{submitting ? "Saving..." : editGroup ? "Save Changes" : "Create Show"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
