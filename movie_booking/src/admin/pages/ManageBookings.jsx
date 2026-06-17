import React, { useEffect, useState } from "react";
import { getAllBookingsAdmin, cancelBooking } from "../../config/allApis";
import { LuTicket, LuSearch } from "react-icons/lu";

const SEAT_COLORS = {
  gold: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  platinum: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  recliner: "bg-rose-400/10 text-rose-400 border-rose-400/20"
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = React.useCallback(() => {
    setLoading(true);
    getAllBookingsAdmin(filter !== "all" ? { status: filter } : {})
      .then((r) => setBookings(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);
  
  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? Seats will be released.")) return;
    try {
      await cancelBooking(id);
      fetch();
    } catch (err) { alert(err.response?.data?.message || "Error cancelling"); }
  };

  const filtered = bookings.filter((b) => {
    const title = b.show?.movie?.title || b.item?.title || "";
    return !search || b.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-bms-text">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-bms-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LuTicket className="text-bms-accent" />
            <span>Manage Bookings</span>
          </h1>
          <p className="text-bms-text-muted text-sm mt-1">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2.5 bg-bms-surface border border-bms-border rounded-xl px-3.5 h-11 w-full max-w-[320px] focus-within:ring-2 focus-within:ring-bms-accent/10 focus-within:border-bms-accent transition-all duration-200">
          <LuSearch className="text-bms-text-dim" size={14} />
          <input 
            type="text" 
            placeholder="Search by ID, user, movie..." 
            className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim w-full" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2">
          {["all", "confirmed", "cancelled", "pending"].map((s) => (
            <button 
              key={s} 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                filter === s 
                  ? "bg-bms-accent text-white border-bms-accent hover:bg-bms-accent-hover" 
                  : "bg-bms-surface border-bms-border text-bms-text hover:bg-bms-surface-hover"
              }`} 
              onClick={() => setFilter(s)} 
              id={`filter-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Card */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-bms-border bg-bms-surface-hover/50 text-[10px] font-semibold text-bms-text-dim uppercase tracking-wider">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Movie</th>
                  <th className="px-6 py-4">Show Details</th>
                  <th className="px-6 py-4">Seats</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bms-border/50">
                {filtered.map((b) => {
                  const title = b.show?.movie?.title || b.item?.title;
                  const isPremiere = !b.show;

                  return (
                    <tr key={b._id} className="hover:bg-bms-surface-hover/30 transition-colors duration-150 text-bms-text">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-bms-text-dim">{b.bookingId}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm leading-tight">{b.user?.name}</p>
                        <p className="text-xs text-bms-text-dim mt-1">{b.user?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-bold">{title}</td>
                      <td className="px-6 py-4">
                        {isPremiere ? (
                          <span className="text-xs font-bold text-bms-accent">Premiere Stream</span>
                        ) : (
                          <div className="text-xs text-bms-text-muted">
                            <p className="font-bold text-bms-text">{b.show?.theatre?.name}</p>
                            <p className="mt-1 font-semibold text-[10px] text-bms-text-dim">
                              {b.show?.date ? new Date(b.show.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""} · {b.show?.time}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!isPremiere && (
                          <div className="flex gap-1.5 flex-wrap">
                            {b.seats?.map((s) => (
                              <span 
                                key={s.seatNumber} 
                                className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                                  SEAT_COLORS[s.type?.toLowerCase()] || "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                }`}
                              >
                                {s.seatNumber}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-bms-text">₹{b.grandTotal?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize before:w-1.5 before:h-1.5 before:rounded-full before:bg-currentColor ${
                          b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-500" :
                          b.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                          "bg-amber-500/10 text-amber-500"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.status !== "cancelled" && (
                          <button 
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer whitespace-nowrap" 
                            onClick={() => handleCancel(b._id)} 
                            id={`cancel-${b._id}`}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-bms-text-dim py-12">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
