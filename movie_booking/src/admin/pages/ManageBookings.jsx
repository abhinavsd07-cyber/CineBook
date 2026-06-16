import React, { useEffect, useState } from "react";
import { getAllBookingsAdmin, cancelBooking } from "../../config/allApis";
import { FaTicket } from "react-icons/fa6";
import "../AdminLayout.css";

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
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
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
    <div>
      <div className="admin-page-header">
        <div><h1 className="admin-page-title"><FaTicket style={{ verticalAlign: "middle", marginRight: 8 }} /> Manage Bookings</h1><p className="admin-page-sub">{bookings.length} total bookings</p></div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search">
          <span className="admin-search-icon">🔍</span>
          <input type="text" className="form-input" placeholder="Search by ID, user, movie..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "32px" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "confirmed", "cancelled", "pending"].map((s) => (
            <button key={s} className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(s)} id={`filter-${s}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? <div className="page-loader"><div className="spinner" /></div> : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>Booking ID</th><th>User</th><th>Movie</th><th>Show Details</th><th>Seats</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const title = b.show?.movie?.title || b.item?.title;
                  const isPremiere = !b.show;

                  return (
                    <tr key={b._id}>
                      <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--clr-text-muted)" }}>{b.bookingId}</span></td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{b.user?.name}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--clr-text-muted)" }}>{b.user?.email}</p>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: "0.875rem" }}>{title}</td>
                      <td>
                        {isPremiere ? (
                          <p style={{ fontSize: "0.8rem", color: "var(--clr-primary)" }}>Premiere Stream</p>
                        ) : (
                          <>
                            <p style={{ fontSize: "0.8rem" }}>{b.show?.theatre?.name}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--clr-text-muted)" }}>
                              {b.show?.date ? new Date(b.show.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""} · {b.show?.time}
                            </p>
                          </>
                        )}
                      </td>
                      <td>
                        {!isPremiere && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {b.seats?.map((s) => (
                              <span key={s.seatNumber} className={`seat-tag ${s.type}`} style={{ fontSize: "0.7rem" }}>{s.seatNumber}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{b.grandTotal?.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`badge ${b.status === "confirmed" ? "badge-success" : b.status === "cancelled" ? "badge-error" : "badge-warning"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status !== "cancelled" && (
                        <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.1)", color: "var(--clr-error)", border: "1px solid rgba(239,68,68,0.3)", whiteSpace: "nowrap" }} onClick={() => handleCancel(b._id)} id={`cancel-${b._id}`}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
                {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--clr-text-muted)", padding: "40px" }}>No bookings found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
