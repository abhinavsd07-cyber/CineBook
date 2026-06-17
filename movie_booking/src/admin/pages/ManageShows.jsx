import React, { useEffect, useState } from "react";
import { getAllShows, createShow, deleteShow, getAllMovies, getAllTheatres, updateShow } from "../../config/allApis";
import { LuArmchair, LuSearch, LuPlus, LuX, LuTrash2, LuCopy, LuPen, LuClock } from "react-icons/lu";
import { POPULAR_CITIES } from "../../components/Header";

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
    <th 
      onClick={() => setSortBy(sortBy === `${sortKey}_asc` ? `${sortKey}_desc` : `${sortKey}_asc`)} 
      className="px-4 py-3 cursor-pointer select-none hover:bg-bms-surface-active transition-colors duration-150"
    >
      <div className="flex items-center gap-1.5 justify-start">
        <span>{label}</span>
        <span className="text-xs text-bms-text-dim leading-none">
          {sortBy.startsWith(sortKey) ? (sortBy.endsWith('asc') ? '↑' : '↓') : ''}
        </span>
      </div>
    </th>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LuArmchair className="text-bms-accent" />
            <span>Manage Shows</span>
          </h1>
          <p className="text-bms-text-muted text-sm mt-1">{shows.length} shows scheduled</p>
        </div>
        <button 
          className="btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-1.5" 
          onClick={() => { setEditGroup(null); setForm(EMPTY); setModalCity(""); setModal(true); }} 
          id="add-show-btn"
        >
          <LuPlus size={12} />
          <span>Add Show</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2.5 bg-bms-surface border border-bms-border rounded-xl px-3.5 h-11 w-full max-w-[280px] focus-within:ring-2 focus-within:ring-bms-accent/10 focus-within:border-bms-accent transition-all duration-200">
          <LuSearch className="text-bms-text-dim" size={14} />
          <input 
            type="text" 
            placeholder="Search shows..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim w-full" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-11 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
            value={locationFilter} 
            onChange={e => {
              const newLoc = e.target.value;
              setLocationFilter(newLoc);
              if (newLoc && theatreFilter) {
                const selectedT = theatres.find(t => t._id === theatreFilter);
                if (selectedT && (selectedT.location || "").trim().toLowerCase() !== newLoc.trim().toLowerCase()) {
                  setTheatreFilter("");
                }
              }
            }}
          >
            <option value="">All Cities</option>
            {POPULAR_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>

          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-11 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all max-w-[130px]" 
            value={movieFilter} 
            onChange={e => setMovieFilter(e.target.value)}
          >
            <option value="">All Movies</option>
            {movies.filter(m => m.itemType !== "event").map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>

          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-11 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all max-w-[130px]" 
            value={theatreFilter} 
            onChange={e => setTheatreFilter(e.target.value)}
          >
            <option value="">All Theatres</option>
            {theatres
              .filter(t => locationFilter === "" || (t.location || "").trim().toLowerCase() === locationFilter.trim().toLowerCase())
              .map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>

          <select 
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-11 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
          >
            <option value="all">Any Date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            {Array.from(new Set(shows.map(s => s.date?.split('T')[0]).filter(Boolean))).sort().map(d => (
              <option key={d} value={d}>{new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-bms-border bg-bms-surface-hover/50 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                <SortHeader label="Movie" sortKey="movie" />
                <SortHeader label="Theatre" sortKey="theatre" />
                <SortHeader label="Date" sortKey="date" />
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Screen & Format</th>
                <th className="px-4 py-3">Prices</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bms-border/50">
              {groupedShowsArray.map((g) => (
                <tr key={g.key} className="hover:bg-bms-surface-hover/30 transition-colors duration-150 text-bms-text">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={g.movie?.poster} alt="" className="w-8 h-11 object-cover rounded-md bg-slate-800 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-sm leading-tight block truncate">{g.movie?.title}</span>
                        {g.movie?.duration && (
                          <span className="text-xs text-bms-text-dim mt-0.5 block">{g.movie.duration}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-bms-text-muted">
                    <p className="font-bold text-xs text-bms-text leading-tight">{g.theatre?.name}</p>
                    <p className="text-[10px] text-bms-text-dim mt-1.5">{g.theatre?.address}{g.theatre?.address && g.theatre?.location ? " • " : ""}{g.theatre?.location}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-bms-text-muted font-medium">
                    {new Date(g.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {g.showsList.map(show => (
                        <div key={show.id} className="inline-flex items-center gap-1.5 bg-bms-surface border border-bms-border rounded px-1.5 py-0.5 text-[10px] font-semibold hover:border-bms-text-muted transition-colors">
                          <span>{format12Hour(show.time)}</span>
                          <button onClick={() => handleDelete(show.id)} className="text-bms-text-dim hover:text-red-500 font-semibold text-xs cursor-pointer" title="Delete showtime">&times;</button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="bg-bms-surface border border-bms-border text-bms-text-muted text-[10px] font-bold px-1.5 py-0.5 rounded self-start">
                        {g.screen}
                      </span>
                      <span className="bg-bms-surface-hover border border-bms-border text-bms-text text-[10px] font-bold px-1.5 py-0.5 rounded self-start">
                        {g.format}
                      </span>
                      <span className="text-[10px] text-bms-text-dim font-bold mt-0.5">{g.language}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px]">
                    <div className="flex flex-col gap-1 text-bms-text-muted">
                      <span className="font-bold">Gold: ₹{g.seats?.gold?.price}</span>
                      <span className="font-bold">Plat: ₹{g.seats?.platinum?.price}</span>
                      <span className="font-bold">Recl: ₹{g.seats?.recliner?.price}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button 
                        className="p-1.5 rounded border border-bms-border text-bms-text hover:bg-bms-surface-hover transition-all cursor-pointer flex items-center justify-center" 
                        onClick={() => handleEdit(g)} title="Edit"
                      >
                        <LuPen size={10} />
                      </button>
                      <button 
                        className="p-1.5 rounded border border-bms-border text-bms-text hover:bg-bms-surface-hover transition-all cursor-pointer flex items-center justify-center" 
                        onClick={() => handleDuplicate(g)} title="Clone"
                      >
                        <LuCopy size={10} />
                      </button>
                      <button 
                        className="p-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center" 
                        onClick={() => handleDeleteAll(g.showsList)} title="Delete All"
                      >
                        <LuTrash2 size={10} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {groupedShowsArray.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-bms-text-dim py-12">
                    No shows found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 md:p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-bms-border">
              <h3 className="text-xl font-semibold text-bms-text">{editGroup ? "Edit Shows Group" : "Create New Show"}</h3>
              <button onClick={() => setModal(false)} className="text-bms-text-dim hover:text-bms-text transition-colors cursor-pointer">
                <LuX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Movie *</label>
                <select 
                  className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
                  value={form.movie} 
                  onChange={(e) => setForm({ ...form, movie: e.target.value })} 
                  required
                >
                  <option value="">Select Movie</option>
                  {movies.filter(m => ["movie", "premiere"].includes(m.itemType)).map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">City (Filter Theatres)</label>
                  <select 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
                    value={modalCity} 
                    onChange={(e) => { setModalCity(e.target.value); setForm({ ...form, theatre: "" }); }}
                  >
                    <option value="">All Cities</option>
                    {POPULAR_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Theatre *</label>
                  <select 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
                    value={form.theatre} 
                    onChange={(e) => setForm({ ...form, theatre: e.target.value })} 
                    required
                  >
                    <option value="">Select Theatre</option>
                    {theatres.filter(t => !modalCity || t.location === modalCity).map((t) => <option key={t._id} value={t._id}>{t.name} — {t.address ? t.address + ", " : ""}{t.location}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">{editGroup ? "Date *" : "Start Date *"}</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all" 
                    type="date" 
                    value={form.startDate} 
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                    required 
                  />
                </div>
                {!editGroup ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">End Date (Optional)</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all" 
                      type="date" 
                      value={form.endDate} 
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                      min={form.startDate} 
                    />
                  </div>
                ) : null}
                <div className={`flex flex-col gap-1.5 ${editGroup ? "col-span-2" : "col-span-1"}`}>
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Time(s) *</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    type="text" 
                    placeholder="e.g. 10:30 AM, 02:15 PM" 
                    value={form.time} 
                    onChange={(e) => setForm({ ...form, time: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Format</label>
                  <select 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
                    value={form.format} 
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                  >
                    {["2D","3D","IMAX","4DX"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Screen</label>
                  <select 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent cursor-pointer transition-all" 
                    value={form.screen} 
                    onChange={(e) => setForm({ ...form, screen: e.target.value })}
                  >
                    {Array.from({ length: theatres.find(t => t._id === form.theatre)?.totalScreens || 1 }, (_, i) => (
                      <option key={i} value={`Screen ${i + 1}`}>Screen {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bms-text-dim uppercase tracking-wide">Language</label>
                  <input 
                    className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent placeholder-bms-text-dim transition-all" 
                    value={form.language} 
                    onChange={(e) => setForm({ ...form, language: e.target.value })} 
                  />
                </div>
              </div>

              {/* Seat Pricing */}
              <div className="bg-bms-surface-hover/50 border border-bms-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-bms-text-dim uppercase tracking-wider mb-4">Seat Category Pricing</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-amber-500 uppercase tracking-wide">Gold ₹</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all" 
                      type="number" 
                      value={form.goldPrice} 
                      onChange={(e) => setForm({ ...form, goldPrice: e.target.value })} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Platinum ₹</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all" 
                      type="number" 
                      value={form.platinumPrice} 
                      onChange={(e) => setForm({ ...form, platinumPrice: e.target.value })} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-rose-400 uppercase tracking-wide">Recliner ₹</label>
                    <input 
                      className="bg-bms-surface border border-bms-border rounded-xl px-4 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/10 focus:border-bms-accent transition-all" 
                      type="number" 
                      value={form.reclinerPrice} 
                      onChange={(e) => setForm({ ...form, reclinerPrice: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-bms-border">
                <button 
                  type="button" 
                  className="px-5 py-2.5 rounded-xl border border-bms-border text-bms-text hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer" 
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-bms-accent hover:bg-bms-accent-hover text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs" 
                  disabled={submitting} 
                  id="save-show-btn"
                >
                  {submitting ? "Saving..." : editGroup ? "Save Changes" : "Create Show"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
