import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getShowById } from "../config/allApis";
import { io } from "socket.io-client";
import "./SeatSelection.css";

const SEAT_TYPES = [
  { key: "recliner", label: "Recliner", priceKey: "recliner" },
  { key: "platinum", label: "Platinum", priceKey: "platinum" },
  { key: "gold", label: "Gold", priceKey: "gold" },
];

const generateGrid = (rows, seatsPerRow, rowOffset = 0) => {
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: rows }, (_, ri) =>
    Array.from({ length: seatsPerRow }, (_, si) => `${rowLabels[ri + rowOffset]}${si + 1}`)
  );
};

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

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selected, setSelected] = useState([]);
  const [lockedByOthers, setLockedByOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const location = useLocation();
  const maxQty = location.state?.qty || 2;
  const [showModal, setShowModal] = useState(true);


  useEffect(() => {
    getShowById(showId)
      .then((r) => setShow(r.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));

    // Connect to WebSocket Server
    const socket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000", {
      withCredentials: true
    });
    socketRef.current = socket;

    socket.emit("joinShow", showId);

    socket.on("seatLocked", ({ seatId }) => {
      setLockedByOthers((prev) => [...new Set([...prev, seatId])]);
    });

    socket.on("seatUnlocked", ({ seatId }) => {
      setLockedByOthers((prev) => prev.filter(id => id !== seatId));
    });

    return () => {
      socket.disconnect();
    };
  }, [showId, navigate]);

  if (loading) return <div className="page-loader" style={{ paddingTop: "80px" }}><div className="spinner" /></div>;
  if (!show) return null;

  const toggleSeat = (seatId, type) => {
    if (show.seats[type]?.bookedSeats?.includes(seatId)) return;
    if (lockedByOthers.includes(seatId)) return; // Prevent selecting seats locked by others

    setSelected((prev) => {
      const isSelected = prev.find((s) => s.id === seatId && s.type === type);
      if (isSelected) {
        socketRef.current?.emit("unlockSeat", { showId, seatId });
        return prev.filter((s) => !(s.id === seatId && s.type === type));
      } else {
        if (prev.length >= maxQty) {
          alert(`You can only select up to ${maxQty} seats.`);
          return prev;
        }
        socketRef.current?.emit("lockSeat", { showId, seatId });
        return [...prev, { id: seatId, type }];
      }
    });
  };

  const addEventTicket = (type) => {
    const seatData = show.seats[type];
    const typeCount = selected.filter(s => s.type === type).length;
    const maxCapacity = (seatData.rows * seatData.seatsPerRow) - (seatData.bookedSeats?.length || 0);
    if (typeCount >= maxCapacity) return alert("Category sold out!");
    
    setSelected(prev => [...prev, { id: `${type.toUpperCase()}-TKT-${Date.now()}-${Math.floor(Math.random()*100)}`, type }]);
  };

  const removeEventTicket = (type) => {
    const idx = selected.slice().reverse().findIndex(s => s.type === type);
    if (idx !== -1) {
      const realIdx = selected.length - 1 - idx;
      setSelected(prev => prev.filter((_, i) => i !== realIdx));
    }
  };

  const isSelected = (id, type) => selected.some((s) => s.id === id && s.type === type);
  const isBooked = (id, type) => show.seats[type]?.bookedSeats?.includes(id);

  const totalAmount = selected.reduce((acc, s) => acc + (show.seats[s.type]?.price || 0), 0);
  const convenienceFee = Math.round(totalAmount * 0.05);
  const gst = Math.round(totalAmount * 0.18);
  const grandTotal = totalAmount + convenienceFee + gst;

  const handleProceed = () => {
    if (!selected.length) return;
    navigate("/food", {
      state: {
        bookingDetails: {
          show: show,
          selectedSeats: selected,
          totalAmount
        },
        convenienceFee,
        gst,
        grandTotal,
      },
    });
  };

  const handleSkipSnacks = () => {
    if (!selected.length) return;
    navigate("/payment", {
      state: {
        bookingDetails: {
          show: show,
          selectedSeats: selected,
          totalAmount
        },
        convenienceFee,
        gst,
        grandTotal,
        foodDetails: {
          items: [],
          total: 0
        }
      },
    });
  };

  return (
    <div className="ss-page page-wrapper">
      {/* ── T&C Modal ── */}
      {showModal && (
        <div className="qty-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="qty-modal-content" style={{ maxWidth: "450px" }}>
            <h3 style={{ marginBottom: "16px", color: "var(--clr-text)" }}>Terms & Conditions</h3>
            <ul style={{ paddingLeft: "20px", color: "var(--clr-text-muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "24px" }}>
              <li>Tickets are non-refundable and non-transferable.</li>
              <li>Outside food and beverages are strictly not allowed inside the theatre.</li>
              <li>Please reach the theatre at least 15 minutes prior to the showtime.</li>
              <li>Children above 3 years require a valid ticket.</li>
              <li>The theatre management reserves the right of admission.</li>
            </ul>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); }}>Accept</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="ss-top-bar">
        <div className="container ss-top-bar-inner">
          <div className="ss-movie-info-header">
            <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
            <div>
              <h2 className="movie-title">{show.movie?.title}</h2>
              <p className="theatre-info">{show.theatre?.name} | {new Date(show.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, {format12Hour(show.time)}</p>
            </div>
          </div>
          <div className="ss-tickets-qty">
            {selected.length} Tickets
          </div>
        </div>
      </div>

      <div className="ss-main-area container">
        <div className="ss-layout">
          {/* Left: Seat Map */}
          <div className="ss-map-col">
            {show.movie?.itemType === "event" ? (
              <div className="ss-event-categories" style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}>
                <h3 style={{ marginBottom: "24px" }}>Select Ticket Categories</h3>
                {SEAT_TYPES.map(({ key, label }) => {
                  const seatData = show.seats?.[key];
                  if (!seatData) return null;
                  const qty = selected.filter(s => s.type === key).length;
                  return (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eee" }}>
                      <div>
                        <div style={{ fontWeight: "600" }}>{label}</div>
                        <div style={{ color: "var(--clr-text-muted)", fontSize: "0.875rem" }}>Rs. {seatData.price}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button className="btn btn-outline btn-sm" onClick={() => removeEventTicket(key)} disabled={qty === 0}>-</button>
                        <span style={{ fontWeight: "600", width: "20px", textAlign: "center" }}>{qty}</span>
                        <button className="btn btn-outline btn-sm" onClick={() => addEventTicket(key)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="ss-legend-strip">
                  <div className="legend-item"><div className="box avail" /> Available</div>
                  <div className="legend-item"><div className="box selected" /> Selected</div>
                  <div className="legend-item"><div className="box booked" /> Sold</div>
                </div>

                <div className="ss-scroll-area">
                  {(() => {
                    let currentRowOffset = 0;
                    return SEAT_TYPES.map(({ key, label }) => {
                      const seatData = show.seats?.[key];
                      if (!seatData) return null;
                      const rowsCount = seatData.rows || 4;
                      const grid = generateGrid(rowsCount, seatData.seatsPerRow || 10, currentRowOffset);
                      currentRowOffset += rowsCount;
                      
                      return (
                        <div key={key} className="ss-category-block">
                          <div className="ss-category-header">
                            <span>Rs. {seatData.price} {label.toUpperCase()}</span>
                            <div className="line" />
                          </div>
                          <div className="ss-rows">
                            {grid.map((row, ri) => (
                              <div key={ri} className="ss-row">
                                <span className="ss-row-label">{row[0].charAt(0)}</span>
                                <div className="ss-seats">
                                    {row.map((seatId) => {
                                      const booked = isBooked(seatId, key);
                                      const locked = lockedByOthers.includes(seatId);
                                      const sel = isSelected(seatId, key);
                                      return (
                                        <button
                                          key={seatId}
                                          className={`seat-btn ${(booked || locked) ? "booked" : sel ? "selected" : "available"}`}
                                          onClick={() => toggleSeat(seatId, key)}
                                          disabled={booked || locked}
                                          title={booked ? "Booked" : locked ? "Locked by another user" : seatId}
                                        >
                                          {seatId.replace(/[A-Z]/, "")}
                                        </button>
                                      );
                                    })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="ss-screen-wrap">
                  <div className="css-screen" />
                  <p>All eyes this way please!</p>
                </div>
              </>
            )}
          </div>

          {/* Right: Booking Summary */}
          {selected.length > 0 && (
            <div className="ss-summary-col">
              <div className="ss-summary-card">
                <h3>Booking Summary</h3>
                <div className="summary-row">
                  <span>{show.movie?.title}</span>
                  <span>{selected.length} Tickets</span>
                </div>
                <div className="summary-row">
                  <span className="text-dim">
                    {selected.map(s => s.id).join(", ")} ({selected[0]?.type.toUpperCase()})
                  </span>
                </div>
                
                <div className="divider" style={{ margin: "16px 0" }} />
                
                <div className="summary-row">
                  <span>Ticket Amount</span>
                  <span>Rs. {totalAmount}</span>
                </div>
                <div className="summary-row">
                  <span>Convenience fees (5%)</span>
                  <span>Rs. {convenienceFee}</span>
                </div>
                <div className="summary-row">
                  <span>Base GST (18%)</span>
                  <span>Rs. {gst}</span>
                </div>

                <div className="summary-total">
                  <span>Amount Payable</span>
                  <span>Rs. {grandTotal}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
                  <button className="btn btn-primary w-full btn-lg" onClick={handleProceed}>
                    Add Snacks
                  </button>
                  <button 
                    className="btn btn-outline w-full btn-lg" 
                    onClick={handleSkipSnacks}
                    style={{ background: "transparent", borderColor: "var(--clr-border)", color: "var(--clr-text)" }}
                  >
                    Skip & Pay Rs. {grandTotal}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
