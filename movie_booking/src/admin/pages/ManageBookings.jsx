import React, { useEffect, useState } from "react";
import { getAllBookingsAdmin, cancelBooking } from "../../config/allApis";
import { LuTicket, LuSearch, LuX, LuUser, LuMapPin, LuCalendar, LuBan } from "react-icons/lu";
import { toast } from "react-toastify";

// Using inline style objects avoids Tailwind purge issues with dynamic class names
const SEAT_STYLES = {
  gold:     { background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" },
  platinum: { background: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.25)" },
  recliner: { background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.25)" },
  default:  { background: "rgba(100,116,139,0.12)", color: "#64748b", border: "1px solid rgba(100,116,139,0.25)" },
};

const STATUS_STYLES = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const STATUS_DOT = {
  confirmed: "bg-emerald-400",
  cancelled: "bg-red-400",
  pending:   "bg-amber-400",
};

const FILTERS = ["all", "confirmed", "pending", "cancelled"];

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBookings = React.useCallback(() => {
    setLoading(true);
    getAllBookingsAdmin()
      .then((r) => setBookings(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? The seats will be released.")) return;
    try {
      await cancelBooking(id);
      fetchBookings();
      toast.success("✅ Booking cancelled successfully.", {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Error cancelling booking.", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    }
  };

  const filtered = bookings.filter((b) => {
    const title = b.show?.movie?.title || b.item?.title || "";
    const matchesSearch = !search ||
      b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase());
      
    const matchesFilter = filter === "all" || b.status === filter;

    return matchesSearch && matchesFilter;
  });

  const counts = FILTERS.reduce((acc, s) => {
    acc[s] = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">

      {/* ── Header ── */}
      <div className="flex justify-between items-start flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-bms-accent/10 border border-bms-accent/20 flex items-center justify-center flex-shrink-0">
              <LuTicket className="text-bms-accent" size={16} />
            </span>
            Manage Bookings
          </h1>
          <p className="text-bms-text-dim text-sm mt-1 ml-10">
            {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
            {filtered.length !== bookings.length && ` · ${filtered.length} shown`}
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-bms-surface border border-bms-border rounded-xl px-3.5 h-10 w-full sm:max-w-[300px] focus-within:ring-2 focus-within:ring-bms-accent/20 focus-within:border-bms-accent transition-all">
          <LuSearch className="text-bms-text-dim flex-shrink-0" size={14} />
          <input
            type="text"
            placeholder="Search ID, user, movie…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-bms-text-dim hover:text-bms-text transition-colors">
              <LuX size={12} />
            </button>
          )}
        </div>

        {/* Status filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              id={`filter-${s}`}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                filter === s
                  ? "bg-bms-accent text-white border-bms-accent"
                  : "bg-bms-surface border-bms-border text-bms-text-muted hover:bg-bms-surface-hover hover:text-bms-text"
              }`}
            >
              <span>{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                filter === s ? "bg-white/20 text-white" : "bg-bms-surface-hover text-bms-text-dim"
              }`}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-9 h-9 border-2 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
            <p className="text-xs text-bms-text-dim">Loading bookings…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <LuTicket size={32} className="text-bms-text-dim/30" />
            <p className="text-bms-text-dim text-sm font-medium">No bookings found</p>
            <p className="text-[11px] text-bms-text-dim/60">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table — min-w ensures horizontal scroll instead of clipping ── */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" style={{ minWidth: "900px" }}>
                <thead>
                  <tr className="border-b border-bms-border bg-bms-surface-hover/40 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                    <th className="px-5 py-3.5 whitespace-nowrap">Booking ID</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">User</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Movie / Event</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Show Details</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Seats</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Amount</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3.5 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bms-border/40">
                  {filtered.map((b) => {
                    const title = b.show?.movie?.title || b.item?.title;
                    const isPremiere = !b.show;
                    return (
                      <tr key={b._id} className="hover:bg-bms-surface-hover/25 transition-colors duration-100">
                        {/* Booking ID */}
                        <td className="px-5 py-4 font-mono text-[11px] font-bold text-bms-text-dim tracking-wide whitespace-nowrap">
                          {b.bookingId}
                        </td>

                        {/* User */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-sm leading-tight whitespace-nowrap">{b.user?.name}</p>
                          <p className="text-[11px] text-bms-text-dim mt-0.5">{b.user?.email}</p>
                        </td>

                        {/* Movie */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-sm leading-tight" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {title}
                          </p>
                          {isPremiere && (
                            <span className="text-[10px] font-bold text-bms-accent mt-0.5 block">Premiere</span>
                          )}
                        </td>

                        {/* Show Details */}
                        <td className="px-5 py-4">
                          {isPremiere ? (
                            <span className="text-xs text-bms-text-dim">Online stream</span>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold leading-tight whitespace-nowrap">{b.show?.theatre?.name}</p>
                              <p className="text-[10px] text-bms-text-dim mt-1 flex items-center gap-1 whitespace-nowrap">
                                <LuCalendar size={9} />
                                {b.show?.date
                                  ? new Date(b.show.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                                  : ""}
                                {b.show?.time && ` · ${b.show.time}`}
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Seats */}
                        <td className="px-5 py-4">
                          {!isPremiere && (
                            <div className="flex gap-1 flex-wrap" style={{ maxWidth: 140 }}>
                              {b.seats?.map((s) => {
                                const style = SEAT_STYLES[s.type?.toLowerCase()] || SEAT_STYLES.default;
                                return (
                                  <span
                                    key={s.seatNumber}
                                    style={style}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                                  >
                                    {s.seatNumber}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 font-bold text-sm whitespace-nowrap">
                          ₹{b.grandTotal?.toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={b.status} />
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          {b.status !== "cancelled" && (
                            <CancelButton onClick={() => handleCancel(b._id)} id={`cancel-${b._id}`} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile / tablet cards ── */}
            <div className="lg:hidden divide-y divide-bms-border/40">
              {filtered.map((b) => {
                const title = b.show?.movie?.title || b.item?.title;
                const isPremiere = !b.show;
                return (
                  <div key={b._id} className="p-4 flex flex-col gap-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-bold text-bms-text-dim tracking-wider">
                          {b.bookingId}
                        </p>
                        <p className="font-bold text-base leading-tight mt-0.5 truncate">{title}</p>
                        {isPremiere && (
                          <span className="text-[10px] font-bold text-bms-accent">Premiere Stream</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={b.status} />
                        <p className="font-bold text-sm whitespace-nowrap">₹{b.grandTotal?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 text-xs text-bms-text-dim">
                      <LuUser size={11} className="flex-shrink-0" />
                      <span className="font-semibold text-bms-text whitespace-nowrap">{b.user?.name}</span>
                      <span>·</span>
                      <span className="truncate">{b.user?.email}</span>
                    </div>

                    {/* Show info */}
                    {!isPremiere && (
                      <div className="flex flex-wrap gap-3 text-[11px] text-bms-text-dim">
                        {b.show?.theatre?.name && (
                          <span className="flex items-center gap-1">
                            <LuMapPin size={10} className="flex-shrink-0" />
                            {b.show.theatre.name}
                          </span>
                        )}
                        {b.show?.date && (
                          <span className="flex items-center gap-1">
                            <LuCalendar size={10} className="flex-shrink-0" />
                            {new Date(b.show.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            {b.show?.time && ` · ${b.show.time}`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Seats + cancel */}
                    <div className="flex items-center justify-between gap-3">
                      {!isPremiere && b.seats?.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {b.seats.map((s) => {
                            const style = SEAT_STYLES[s.type?.toLowerCase()] || SEAT_STYLES.default;
                            return (
                              <span
                                key={s.seatNumber}
                                style={style}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              >
                                {s.seatNumber}
                              </span>
                            );
                          })}
                        </div>
                      ) : <div />}

                      {b.status !== "cancelled" && (
                        <CancelButton onClick={() => handleCancel(b._id)} id={`cancel-${b._id}`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize border ${
      STATUS_STYLES[status] || "bg-bms-surface text-bms-text-dim border-bms-border"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status] || "bg-bms-text-dim"}`} />
      {status}
    </span>
  );
}

function CancelButton({ onClick, id }) {
  return (
    <button
      onClick={onClick}
      id={id}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.16)"; e.currentTarget.style.color = "#fca5a5"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#f87171"; }}
    >
      <LuBan size={11} />
      Cancel
    </button>
  );
}