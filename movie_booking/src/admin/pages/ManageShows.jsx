import React, { useEffect, useState } from "react";
import { getAllShows, createShow, deleteShow, getAllMovies, getAllTheatres, updateShow } from "../../config/allApis";
import { LuArmchair, LuSearch, LuPlus, LuX, LuTrash2, LuCopy, LuPen, LuCalendar, LuMapPin, LuFilm, LuFilter, LuChevronUp, LuChevronDown } from "react-icons/lu";
import { POPULAR_CITIES } from "../../components/Header";
import { toast } from "react-toastify";

const EMPTY = {
  movie: "", theatre: "", screen: "Screen 1", startDate: "", endDate: "",
  time: "", format: "2D", language: "English",
  goldPrice: 200, platinumPrice: 350, reclinerPrice: 500
};

const format12Hour = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) return timeStr;
  const [hourStr, minStr] = timeStr.split(":");
  if (!hourStr || !minStr) return timeStr;
  let h = parseInt(hourStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h < 10 ? "0" + h : h}:${minStr} ${ampm}`;
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

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
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [modalCity, setModalCity] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchAll = () => {
    Promise.all([getAllShows(), getAllMovies(), getAllTheatres()])
      .then(([s, m, t]) => {
        setShows(s.data.data);
        setMovies(m.data.data);
        setTheatres(t.data.data);
      })
      .catch(console.error);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleEdit = (g) => {
    setEditGroup(g);
    setModalCity(g.theatre?.location || "");
    setForm({
      movie: g.movie?._id,
      theatre: g.theatre?._id,
      startDate: g.date.split("T")[0],
      endDate: "",
      time: g.showsList.map((s) => format12Hour(s.time)).join(", "),
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
      time: g.showsList.map((s) => format12Hour(s.time)).join(", "),
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
      dates.push(new Date(current).toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editGroup) {
        const existingShowsMap = new Map();
        editGroup.showsList.forEach((s) => {
          existingShowsMap.set(format12Hour(s.time).toLowerCase().replace(/\s+/g, ""), s);
        });
        const inputTimes = form.time.split(",").map((t) => t.trim()).filter(Boolean);
        const promises = [];
        for (const t of inputTimes) {
          const key = format12Hour(t).toLowerCase().replace(/\s+/g, "");
          const updatedSeats = JSON.parse(JSON.stringify(editGroup.seats || {}));
          if (updatedSeats.gold) updatedSeats.gold.price = Number(form.goldPrice);
          if (updatedSeats.platinum) updatedSeats.platinum.price = Number(form.platinumPrice);
          if (updatedSeats.recliner) updatedSeats.recliner.price = Number(form.reclinerPrice);
          if (existingShowsMap.has(key)) {
            const existingShow = existingShowsMap.get(key);
            promises.push(updateShow(existingShow.id, {
              movie: form.movie, theatre: form.theatre, date: form.startDate,
              format: form.format, screen: form.screen, language: form.language, seats: updatedSeats,
            }));
            existingShowsMap.delete(key);
          } else {
            promises.push(createShow({
              movie: form.movie, theatre: form.theatre, date: form.startDate, time: t,
              format: form.format, screen: form.screen, language: form.language,
              goldPrice: form.goldPrice, platinumPrice: form.platinumPrice, reclinerPrice: form.reclinerPrice,
            }));
          }
        }
        existingShowsMap.forEach((s) => promises.push(deleteShow(s.id)));
        await Promise.all(promises);
      } else {
        const times = form.time.split(",").map((t) => t.trim()).filter(Boolean);
        const dates = form.endDate ? getDatesInRange(form.startDate, form.endDate) : [form.startDate];
        const promises = [];
        let duplicatesSkipped = 0;
        for (const d of dates) {
          for (const t of times) {
            const isDuplicate = shows.some(
              (s) =>
                s.movie?._id === form.movie &&
                s.theatre?._id === form.theatre &&
                s.date?.split("T")[0] === d &&
                format12Hour(s.time).toLowerCase().replace(/\s+/g, "") ===
                  format12Hour(t).toLowerCase().replace(/\s+/g, "") &&
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
        if (duplicatesSkipped > 0) console.warn(`Skipped ${duplicatesSkipped} duplicate showtimes.`);
      }
      fetchAll();
      setModal(false);
      setForm(EMPTY);
      setEditGroup(null);
      toast.success("✅ Shows saved successfully!", {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Something went wrong. Please try again.", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this showtime?")) return;
    await deleteShow(id);
    fetchAll();
  };

  const handleDeleteAll = async (showsList) => {
    if (!window.confirm("Delete all showtimes for this date?")) return;
    await Promise.all(showsList.map((s) => deleteShow(s.id)));
    fetchAll();
  };

  const filteredShows = shows.filter((s) => {
    const sDate = s.date?.split("T")[0];
    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = sDate === new Date().toISOString().split("T")[0];
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = sDate === tomorrow.toISOString().split("T")[0];
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
  filteredShows.forEach((s) => {
    const key = `${s.movie?._id}_${s.theatre?._id}_${s.date}_${s.screen || "Screen 1"}_${s.format}_${s.language}`;
    if (!groupedShows[key]) {
      groupedShows[key] = {
        key, movie: s.movie, theatre: s.theatre, date: s.date,
        screen: s.screen || "Screen 1", format: s.format,
        language: s.language, seats: s.seats, showsList: [],
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

  const SortHeader = ({ label, sortKey }) => {
    const isActive = sortBy.startsWith(sortKey);
    const isAsc = sortBy === `${sortKey}_asc`;
    return (
      <th
        onClick={() => setSortBy(isAsc ? `${sortKey}_desc` : `${sortKey}_asc`)}
        className="px-4 py-3 cursor-pointer select-none hover:bg-bms-surface-active transition-colors duration-150 whitespace-nowrap"
      >
        <div className="flex items-center gap-1 text-left">
          <span>{label}</span>
          <span className={`transition-colors ${isActive ? "text-bms-accent" : "text-bms-text-dim/30"}`}>
            {isAsc ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />}
          </span>
        </div>
      </th>
    );
  };

  const formatBadge = (fmt) => {
    const colors = {
      IMAX: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "4DX": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "3D": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      "2D": "bg-bms-surface text-bms-text-muted border-bms-border",
    };
    return colors[fmt] || colors["2D"];
  };

  const activeFiltersCount = [locationFilter, movieFilter, theatreFilter, dateFilter !== "all" ? dateFilter : ""].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">

      {/* ── Header ── */}
      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-bms-accent/10 border border-bms-accent/20 flex items-center justify-center flex-shrink-0">
              <LuArmchair className="text-bms-accent" size={16} />
            </span>
            Manage Shows
          </h1>
          <p className="text-bms-text-dim text-sm mt-1 ml-10.5">
            {shows.length} show{shows.length !== 1 ? "s" : ""} scheduled
            {groupedShowsArray.length !== shows.length && ` · ${groupedShowsArray.length} shown`}
          </p>
        </div>
        <button
          className="btn bg-bms-accent hover:bg-bms-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2 flex-shrink-0"
          onClick={() => { setEditGroup(null); setForm(EMPTY); setModalCity(""); setModal(true); }}
          id="add-show-btn"
        >
          <LuPlus size={14} />
          Add Show
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="flex items-center gap-2.5 bg-bms-surface border border-bms-border rounded-xl px-3.5 h-10 flex-1 min-w-[200px] max-w-[320px] focus-within:ring-2 focus-within:ring-bms-accent/20 focus-within:border-bms-accent transition-all duration-200">
            <LuSearch className="text-bms-text-dim flex-shrink-0" size={14} />
            <input
              type="text"
              placeholder="Search movies, theatres, cities…"
              className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-bms-text-dim hover:text-bms-text">
                <LuX size={12} />
              </button>
            )}
          </div>

          {/* Filter toggle on mobile */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 h-10 px-3.5 rounded-xl border border-bms-border bg-bms-surface text-sm text-bms-text transition-all"
          >
            <LuFilter size={14} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-bms-accent text-white text-xs font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort — always visible */}
          <select
            className="ml-auto bg-bms-surface border border-bms-border rounded-xl px-3 h-10 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent cursor-pointer transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="movie_asc">Movie A–Z</option>
            <option value="theatre_asc">Theatre A–Z</option>
          </select>
        </div>

        {/* Filter pills row */}
        <div className={`flex flex-wrap gap-2 ${filtersOpen ? "flex" : "hidden sm:flex"}`}>
          <select
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-9 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent cursor-pointer transition-all"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Any date</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            {Array.from(new Set(shows.map((s) => s.date?.split("T")[0]).filter(Boolean)))
              .sort()
              .map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </option>
              ))}
          </select>

          <select
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-9 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent cursor-pointer transition-all"
            value={locationFilter}
            onChange={(e) => {
              const newLoc = e.target.value;
              setLocationFilter(newLoc);
              if (newLoc && theatreFilter) {
                const sel = theatres.find((t) => t._id === theatreFilter);
                if (sel && sel.location?.trim().toLowerCase() !== newLoc.trim().toLowerCase())
                  setTheatreFilter("");
              }
            }}
          >
            <option value="">All cities</option>
            {POPULAR_CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>

          <select
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-9 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent cursor-pointer transition-all max-w-[160px]"
            value={movieFilter}
            onChange={(e) => setMovieFilter(e.target.value)}
          >
            <option value="">All movies</option>
            {movies.filter((m) => m.itemType !== "event").map((m) => (
              <option key={m._id} value={m._id}>{m.title}</option>
            ))}
          </select>

          <select
            className="bg-bms-surface border border-bms-border rounded-xl px-3 h-9 text-xs text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent cursor-pointer transition-all max-w-[160px]"
            value={theatreFilter}
            onChange={(e) => setTheatreFilter(e.target.value)}
          >
            <option value="">All theatres</option>
            {theatres
              .filter((t) => locationFilter === "" || t.location?.trim().toLowerCase() === locationFilter.trim().toLowerCase())
              .map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setLocationFilter(""); setMovieFilter(""); setTheatreFilter(""); setDateFilter("all"); }}
              className="h-9 px-3 rounded-xl text-xs text-bms-text-dim hover:text-red-400 border border-bms-border hover:border-red-400/30 transition-all flex items-center gap-1.5"
            >
              <LuX size={11} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Table / Cards ── */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden ">

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto ">
          <table className="w-full border-collapse text-left text-sm ">
            <thead>
              <tr className="border-b border-bms-border bg-bms-surface-hover/40 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                <SortHeader label="Movie" sortKey="movie" />
                <SortHeader label="Theatre" sortKey="theatre" />
                <SortHeader label="Date" sortKey="date" />
                <th className="px-4 py-3 whitespace-nowrap">Showtimes</th>
                <th className="px-4 py-3 whitespace-nowrap">Format & Screen</th>
                <th className="px-4 py-3 whitespace-nowrap">Pricing</th>
                <th className="px-4 py-3 text-center whitespace-nowrap ">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bms-border/40">
              {groupedShowsArray.map((g) => (
                <tr key={g.key} className="hover:bg-bms-surface-hover/25 transition-colors duration-100">
                  {/* Movie */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={g.movie?.poster}
                        alt=""
                        className="w-9 h-12 object-cover rounded-lg bg-slate-800 flex-shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate max-w-[160px]">{g.movie?.title}</p>
                        {g.movie?.duration && (
                          <p className="text-[10px] text-bms-text-dim mt-0.5">{g.movie.duration}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Theatre */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-xs leading-tight">{g.theatre?.name}</p>
                    <p className="text-[10px] text-bms-text-dim mt-1 flex items-center gap-1">
                      <LuMapPin size={9} className="flex-shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {[g.theatre?.address, g.theatre?.location].filter(Boolean).join(", ")}
                      </span>
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-bms-text-muted font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <LuCalendar size={11} className="text-bms-text-dim" />
                      {formatDate(g.date)}
                    </div>
                  </td>

                  {/* Showtimes */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {g.showsList.map((show) => (
                        <span
                          key={show.id}
                          className="inline-flex items-center gap-1 bg-bms-surface border border-bms-border rounded-md px-1.5 py-0.5 text-[10px] font-semibold group"
                        >
                          {format12Hour(show.time)}
                          <button
                            onClick={() => handleDelete(show.id)}
                            className="text-bms-text-dim/40 hover:text-red-500 transition-colors cursor-pointer leading-none"
                            title="Remove this showtime"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Format & Screen */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border self-start ${formatBadge(g.format)}`}>
                        {g.format}
                      </span>
                      <span className="text-[10px] text-bms-text-dim font-medium">{g.screen}</span>
                      <span className="text-[10px] text-bms-text-dim">{g.language}</span>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 text-[10px] font-semibold">
                      <span className="text-amber-400">Gold · ₹{g.seats?.gold?.price}</span>
                      <span className="text-slate-300">Plat · ₹{g.seats?.platinum?.price}</span>
                      <span className="text-rose-400">Recl · ₹{g.seats?.recliner?.price}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className=" py-3.5 pe-5 ">
                    <div className="flex justify-center gap-1.5 ">
                      <button
                        onClick={() => handleEdit(g)}
                        title="Edit show"
                        className="w-7 h-7 rounded-lg border border-bms-border text-bms-text-muted hover:text-bms-text hover:bg-bms-surface-hover hover:border-bms-text-dim transition-all cursor-pointer flex items-center justify-center"
                      >
                        <LuPen size={11} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(g)}
                        title="Clone show"
                        className="w-7 h-7 rounded-lg border border-bms-border text-bms-text-muted hover:text-bms-text hover:bg-bms-surface-hover hover:border-bms-text-dim transition-all cursor-pointer flex items-center justify-center"
                      >
                        <LuCopy size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteAll(g.showsList)}
                        title="Delete all showtimes"
                        className="w-7 h-7 rounded-lg border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer flex items-center justify-center"
                      >
                        <LuTrash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {groupedShowsArray.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <LuFilm size={32} className="mx-auto text-bms-text-dim/30 mb-3" />
                    <p className="text-bms-text-dim text-sm font-medium">No shows match your filters</p>
                    <p className="text-bms-text-dim/60 text-xs mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-bms-border/40">
          {groupedShowsArray.length === 0 ? (
            <div className="text-center py-16">
              <LuFilm size={32} className="mx-auto text-bms-text-dim/30 mb-3" />
              <p className="text-bms-text-dim text-sm font-medium">No shows match your filters</p>
            </div>
          ) : (
            groupedShowsArray.map((g) => (
              <div key={g.key} className="p-4 flex flex-col gap-3">
                {/* Top row: poster + info + actions */}
                <div className="flex gap-3 items-start">
                  <img
                    src={g.movie?.poster}
                    alt=""
                    className="w-11 h-15 object-cover rounded-lg bg-slate-800 flex-shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-tight truncate">{g.movie?.title}</p>
                    <p className="text-xs text-bms-text-dim mt-0.5 font-medium">{g.theatre?.name}</p>
                    <p className="text-[10px] text-bms-text-dim/70 mt-0.5 truncate">
                      {[g.theatre?.address, g.theatre?.location].filter(Boolean).join(", ")}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] text-bms-text-dim font-medium flex items-center gap-1">
                        <LuCalendar size={9} /> {formatDate(g.date)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${formatBadge(g.format)}`}>
                        {g.format}
                      </span>
                      <span className="text-[10px] text-bms-text-dim">{g.screen}</span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(g)}
                      className="w-7 h-7 rounded-lg border border-bms-border text-bms-text-muted hover:text-bms-text hover:bg-bms-surface-hover transition-all cursor-pointer flex items-center justify-center"
                    >
                      <LuPen size={11} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(g)}
                      className="w-7 h-7 rounded-lg border border-bms-border text-bms-text-muted hover:text-bms-text hover:bg-bms-surface-hover transition-all cursor-pointer flex items-center justify-center"
                    >
                      <LuCopy size={11} />
                    </button>
                    <button
                      onClick={() => handleDeleteAll(g.showsList)}
                      className="w-7 h-7 rounded-lg border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <LuTrash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Showtimes */}
                <div className="flex flex-wrap gap-1.5">
                  {g.showsList.map((show) => (
                    <span
                      key={show.id}
                      className="inline-flex items-center gap-1 bg-bms-surface border border-bms-border rounded-md px-2 py-0.5 text-[10px] font-semibold"
                    >
                      {format12Hour(show.time)}
                      <button
                        onClick={() => handleDelete(show.id)}
                        className="text-bms-text-dim/40 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Pricing row */}
                <div className="flex gap-3 text-[10px] font-semibold">
                  <span className="text-amber-400">Gold ₹{g.seats?.gold?.price}</span>
                  <span className="text-slate-300">Plat ₹{g.seats?.platinum?.price}</span>
                  <span className="text-rose-400">Recl ₹{g.seats?.recliner?.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="bg-bms-surface border border-bms-border rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-[620px] max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up">

            {/* Modal header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-bms-border">
              <div>
                <h3 className="text-lg font-bold text-bms-text">
                  {editGroup ? "Edit Show Group" : "Create New Show"}
                </h3>
                <p className="text-xs text-bms-text-dim mt-0.5">
                  {editGroup ? "Update details or adjust showtimes" : "Schedule one or multiple showtimes"}
                </p>
              </div>
              <button
                onClick={() => setModal(false)}
                className="w-8 h-8 rounded-full border border-bms-border flex items-center justify-center text-bms-text-dim hover:text-bms-text hover:bg-bms-surface-hover transition-all cursor-pointer"
              >
                <LuX size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Movie */}
              <Field label="Movie" required>
                <Select
                  value={form.movie}
                  onChange={(e) => setForm({ ...form, movie: e.target.value })}
                  required
                >
                  <option value="">Select a movie</option>
                  {movies.filter((m) => ["movie", "premiere"].includes(m.itemType)).map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </Select>
              </Field>

              {/* City + Theatre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City (filter theatres)">
                  <Select
                    value={modalCity}
                    onChange={(e) => { setModalCity(e.target.value); setForm({ ...form, theatre: "" }); }}
                  >
                    <option value="">All cities</option>
                    {POPULAR_CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </Select>
                </Field>
                <Field label="Theatre" required>
                  <Select
                    value={form.theatre}
                    onChange={(e) => setForm({ ...form, theatre: e.target.value })}
                    required
                  >
                    <option value="">Select theatre</option>
                    {theatres
                      .filter((t) => !modalCity || t.location === modalCity)
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}{t.address ? ` — ${t.address}` : ""}{t.location ? `, ${t.location}` : ""}
                        </option>
                      ))}
                  </Select>
                </Field>
              </div>

              {/* Dates + Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label={editGroup ? "Date" : "Start date"} required>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </Field>
                {!editGroup && (
                  <Field label="End date (optional)">
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      min={form.startDate}
                    />
                  </Field>
                )}
                <Field label="Showtimes" required className={editGroup ? "sm:col-span-2" : ""}>
                  <Input
                    type="text"
                    placeholder="e.g. 10:30 AM, 02:15 PM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                  />
                </Field>
              </div>

              {/* Format / Screen / Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Format">
                  <Select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    {["2D", "3D", "IMAX", "4DX"].map((f) => <option key={f}>{f}</option>)}
                  </Select>
                </Field>
                <Field label="Screen">
                  <Select value={form.screen} onChange={(e) => setForm({ ...form, screen: e.target.value })}>
                    {Array.from(
                      { length: theatres.find((t) => t._id === form.theatre)?.totalScreens || 1 },
                      (_, i) => (
                        <option key={i} value={`Screen ${i + 1}`}>Screen {i + 1}</option>
                      )
                    )}
                  </Select>
                </Field>
                <Field label="Language">
                  <Input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  />
                </Field>
              </div>

              {/* Seat Pricing */}
              <div className="bg-bms-surface-hover/40 border border-bms-border rounded-2xl p-5">
                <p className="text-[10px] font-bold text-bms-text-dim uppercase tracking-widest mb-4">
                  Seat Pricing
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Gold (₹)" labelClass="text-amber-400">
                    <Input
                      type="number"
                      value={form.goldPrice}
                      onChange={(e) => setForm({ ...form, goldPrice: e.target.value })}
                    />
                  </Field>
                  <Field label="Platinum (₹)" labelClass="text-slate-300">
                    <Input
                      type="number"
                      value={form.platinumPrice}
                      onChange={(e) => setForm({ ...form, platinumPrice: e.target.value })}
                    />
                  </Field>
                  <Field label="Recliner (₹)" labelClass="text-rose-400">
                    <Input
                      type="number"
                      value={form.reclinerPrice}
                      onChange={(e) => setForm({ ...form, reclinerPrice: e.target.value })}
                    />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-bms-border">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl border border-bms-border text-bms-text hover:bg-bms-surface-hover text-sm font-semibold transition-all cursor-pointer"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-bms-accent hover:bg-bms-accent-hover text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  disabled={submitting}
                  id="save-show-btn"
                >
                  {submitting ? "Saving…" : editGroup ? "Save Changes" : "Create Show"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Tiny shared form primitives ─── */
function Field({ label, required, labelClass = "", className = "", children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className={`text-[10px] font-bold uppercase tracking-widest ${labelClass || "text-bms-text-dim"}`}>
        {label}{required && <span className="text-bms-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ children, ...props }) {
  return (
    <select
      className="bg-bms-surface border border-bms-border rounded-xl px-3.5 py-2.5 text-sm text-bms-text focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent cursor-pointer transition-all w-full"
      {...props}
    >
      {children}
    </select>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="bg-bms-surface border border-bms-border rounded-xl px-3.5 py-2.5 text-sm text-bms-text placeholder-bms-text-dim/60 focus:outline-none focus:ring-2 focus:ring-bms-accent/20 focus:border-bms-accent transition-all w-full"
      {...props}
    />
  );
}