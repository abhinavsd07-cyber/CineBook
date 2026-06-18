import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getShowById } from "../config/allApis";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

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
  const [maxQty, setMaxQty] = useState(location.state?.qty || 2);
  const [selectedQty, setSelectedQty] = useState(maxQty);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    setSelected(prev => {
      if (prev.length > maxQty) {
        const seatsToRemove = prev.slice(maxQty);
        seatsToRemove.forEach(seat => {
          socketRef.current?.emit("unlockSeat", { showId, seatId: seat.id });
        });
        return prev.slice(0, maxQty);
      }
      return prev;
    });
  }, [maxQty, showId]);

  useEffect(() => {
    getShowById(showId)
      .then((r) => setShow(r.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));

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

  if (loading) return (
    <div className="flex justify-center items-center py-48 bg-bms-bg min-h-[80vh]">
      <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
    </div>
  );
  if (!show) return null;

  const toggleSeat = (seatId, type) => {
    if (show.seats[type]?.bookedSeats?.includes(seatId)) return;
    if (lockedByOthers.includes(seatId)) return; 

    setSelected((prev) => {
      const isSelected = prev.find((s) => s.id === seatId && s.type === type);
      if (isSelected) {
        socketRef.current?.emit("unlockSeat", { showId, seatId });
        return prev.filter((s) => !(s.id === seatId && s.type === type));
      } else {
        if (prev.length >= maxQty) {
          toast.warning(`⚠️ You can only select up to ${maxQty} seats.`, {
            position: "top-right", autoClose: 3000, hideProgressBar: false,
            closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
          });
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
    if (typeCount >= maxCapacity) {
      toast.error("❌ Category sold out!", {
        position: "top-right", autoClose: 3000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
      return;
    }
    
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
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-[#f2f5f9] text-[#333333] transition-colors duration-300">
      {/* ── How Many Seats Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-center items-center p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white text-[#333333] w-full max-w-[440px] rounded-[8px] shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-2 text-center">
              <h3 className="text-[16px] font-bold text-[#333333] mb-4">How many seats?</h3>
              
              <div className="text-[80px] my-6 flex justify-center transition-transform duration-300">
                {selectedQty === 1 ? "🚲" : selectedQty === 2 ? "🛵" : selectedQty === 3 ? "🛺" : selectedQty <= 5 ? "🚗" : selectedQty <= 7 ? "🚐" : "🚌"}
              </div>
              
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 sm:justify-between items-center my-6 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button
                    key={n}
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full font-medium flex items-center justify-center cursor-pointer transition-all duration-150 focus:outline-none text-[14px] sm:text-[16px] ${
                      selectedQty === n 
                        ? "bg-[#F84464] text-white shadow-sm scale-110" 
                        : "bg-transparent text-[#333333] hover:text-[#F84464]"
                    }`}
                    onClick={() => setSelectedQty(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-[85%] mx-auto border-t border-slate-200 my-1"></div>

            <div className="flex justify-center gap-6 md:gap-8 px-4 py-5">
              {[
                { name: 'NORMAL', price: '149' },
                { name: 'EXECUTIVE', price: '149' },
                { name: 'PREMIUM', price: '149' },
                { name: 'VIP', price: '349' }
              ].map(tier => (
                <div key={tier.name} className="flex flex-col items-center">
                  <p className="text-[10px] md:text-[11px] text-[#999999] font-medium mb-0.5">{tier.name}</p>
                  <p className="text-[14px] md:text-[15px] text-[#333333] font-bold">₹{tier.price}</p>
                  <p className="text-[10px] md:text-[11px] text-[#4CAF50] font-medium mt-0.5">AVAILABLE</p>
                </div>
              ))}
            </div>

            <div className="bg-[#f5f5fa] border-t border-b border-slate-100 py-3 px-4 text-[12px] flex items-center justify-center text-[#333333]">
              Book the <img src="https://in-cdn.bmscdn.com/moviesmaster/movies-showtimes/v4/best-seats/seat-layout-bestseat.png" alt="bestseller" className="h-[16px] mx-1.5" /> <strong className="font-semibold text-black">Bestseller Seats</strong> &nbsp;in this cinema at no extra cost!
            </div>

            <div className="p-4 bg-white">
              <button 
                className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3 rounded-[8px] font-semibold text-[15px] w-full shadow-sm transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  setMaxQty(selectedQty);
                  setShowModal(false);
                }}
              >
                Select Seats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 shadow-sm sticky top-[68px] md:top-[110px] z-40">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-base md:text-xl font-bold text-[#333333]">{show.movie?.title} - {show.movie?.language?.[0]}</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">{show.theatre?.name} | {new Date(show.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}, {format12Hour(show.time)}</p>
            </div>
          <button className="border border-[#F84464] text-[#F84464] bg-white hover:bg-slate-50 px-3 md:px-4 py-1.5 rounded flex items-center gap-2 text-[10px] md:text-xs font-medium cursor-pointer" onClick={() => setShowModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            {maxQty} Tickets
          </button>
        </div>
      </div>

      {/* ── Time Slots Ribbon ── */}
      <div className="bg-slate-50 border-b border-slate-200 py-3 px-4 mb-8">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <button className="bg-[#1ea83c] text-white border border-[#1ea83c] px-4 py-1.5 rounded text-xs font-medium whitespace-nowrap cursor-pointer">
            {format12Hour(show.time)}
          </button>
          <button className="bg-white text-slate-700 border border-slate-300 hover:border-[#1ea83c] hover:text-[#1ea83c] px-4 py-1.5 rounded text-xs font-medium whitespace-nowrap cursor-pointer transition-colors">
            12:25 PM
          </button>
          <button className="bg-white text-slate-700 border border-slate-300 hover:border-[#1ea83c] hover:text-[#1ea83c] px-4 py-1.5 rounded text-xs font-medium whitespace-nowrap cursor-pointer transition-colors">
            03:45 PM
          </button>
          <button className="bg-white text-slate-700 border border-slate-300 hover:border-[#1ea83c] hover:text-[#1ea83c] px-4 py-1.5 rounded text-xs font-medium whitespace-nowrap cursor-pointer transition-colors">
            07:15 PM
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Seat Map */}
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-lg p-5 md:p-6 shadow-sm overflow-hidden">
            {show.movie?.itemType === "event" ? (
              <div className="p-4 bg-white border border-slate-200 rounded-[8px]">
                <h3 className="text-base md:text-lg font-bold text-[#333333] mb-6">Select Ticket Categories</h3>
                {SEAT_TYPES.map(({ key, label }) => {
                  const seatData = show.seats?.[key];
                  if (!seatData) return null;
                  const qty = selected.filter(s => s.type === key).length;
                  return (
                    <div key={key} className="flex justify-between items-center py-4 border-b border-slate-200 last:border-0">
                      <div>
                        <div className="font-bold text-[#333333] text-sm md:text-base">{label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Rs. {seatData.price}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full border border-slate-300 hover:border-[#F84464] text-[#333333] font-bold flex items-center justify-center cursor-pointer transition-colors duration-150" onClick={() => removeEventTicket(key)} disabled={qty === 0}>-</button>
                        <span className="font-bold text-sm text-[#333333] w-5 text-center">{qty}</span>
                        <button className="w-8 h-8 rounded-full border border-slate-300 hover:border-[#F84464] text-[#333333] font-bold flex items-center justify-center cursor-pointer transition-colors duration-150" onClick={() => addEventTicket(key)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] text-slate-500 justify-center mb-8 bg-white py-2 border-b border-slate-200 w-full">
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 border border-[#F5A623] bg-[#FEF9E7] rounded-sm" /> Bestseller <span className="w-3 h-3 text-[10px] rounded-full border border-slate-400 text-slate-400 inline-flex items-center justify-center ml-0.5">i</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-white border border-[#1ea83c] rounded-sm" /> Available</div>
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-[#1ea83c] rounded-sm" /> Selected</div>
                  <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-[#E2E8F0] rounded-sm" /> Sold</div>
                </div>

                <div className="overflow-x-auto w-full pb-6 scrollbar-thin bg-white p-4">
                  {(() => {
                    let currentRowOffset = 0;
                    return SEAT_TYPES.map(({ key, label }) => {
                      const seatData = show.seats?.[key];
                      if (!seatData) return null;
                      const rowsCount = seatData.rows || 4;
                      const grid = generateGrid(rowsCount, seatData.seatsPerRow || 10, currentRowOffset);
                      currentRowOffset += rowsCount;
                      
                      return (
                        <div key={key} className="mb-10 last:mb-4 flex flex-col items-center">
                          <div className="w-full text-center text-[11px] md:text-xs font-bold text-slate-500 mb-6 tracking-wide">
                            ₹{seatData.price} {label.toUpperCase()}
                          </div>
                          <div className="flex flex-col gap-2">
                            {grid.map((row, ri) => (
                              <div key={ri} className="flex items-center gap-6 justify-center">
                                <span className="w-4 text-xs font-bold text-slate-600 text-right">{row[0].charAt(0)}</span>
                                <div className="flex gap-2">
                                    {row.map((seatId) => {
                                      const booked = isBooked(seatId, key);
                                      const locked = lockedByOthers.includes(seatId);
                                      const sel = isSelected(seatId, key);
                                      const isBestseller = (key === 'premium' || key === 'gold') && (ri === 1 || ri === 2);
                                      return (
                                        <button
                                          key={seatId}
                                          className={`w-6 h-6 md:w-7 md:h-7 rounded-sm text-[9px] md:text-[10px] font-bold flex items-center justify-center transition-colors duration-150 focus:outline-none cursor-pointer ${
                                            (booked || locked) 
                                              ? "bg-[#E2E8F0] border border-[#E2E8F0] text-transparent cursor-not-allowed" 
                                              : sel 
                                                ? "bg-[#1ea83c] border border-[#1ea83c] text-white hover:bg-[#168a2f]" 
                                                : isBestseller
                                                  ? "border border-[#F5A623] text-[#F5A623] bg-[#FEF9E7] hover:bg-[#F5A623] hover:text-white"
                                                  : "border border-[#1ea83c] text-[#1ea83c] bg-white hover:bg-[#1ea83c] hover:text-white"
                                          }`}
                                          onClick={() => toggleSeat(seatId, key)}
                                          disabled={booked || locked}
                                          title={booked ? "Booked" : locked ? "Locked by another user" : seatId}
                                        >
                                          {!(booked || locked) && seatId.replace(/[A-Z]/, "")}
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

                <div className="mt-10 flex flex-col items-center text-center pb-10">
                  <div className="w-[80%] max-w-[400px] h-2 bg-[#8795a1] rounded-sm mb-4" />
                  <p className="text-xs font-semibold text-[#8795a1] tracking-[0.2em] uppercase">All eyes this way please!</p>
                </div>
              </>
            )}
          </div>

          {/* Right: Booking Summary */}
          {selected.length > 0 && (
            <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-[130px]">
              <div className="bg-white border border-slate-200 rounded-[8px] p-6 shadow-sm">
                <h3 className="text-base md:text-lg font-bold text-[#333333] mb-4">Booking Summary</h3>
                <div className="flex justify-between items-center text-sm font-semibold text-[#333333] mb-2">
                  <span>{show.movie?.title}</span>
                  <span>{selected.length} Tickets</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mb-4">
                  <span className="truncate">
                    {selected.map(s => s.id.replace(/-TKT-.*/, "")).join(", ")} ({selected[0]?.type.toUpperCase()})
                  </span>
                </div>
                
                <div className="h-[1px] bg-slate-200 my-4" />
                
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2.5">
                  <span>Ticket Amount</span>
                  <span>Rs. {totalAmount}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2.5">
                  <span>Convenience fees (5%)</span>
                  <span>Rs. {convenienceFee}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2.5">
                  <span>Base GST (18%)</span>
                  <span>Rs. {gst}</span>
                </div>

                <div className="flex justify-between items-center text-[15px] font-bold text-[#333333] bg-[#fcfcfc] border-t border-slate-200 p-3 -mx-6 mb-2 mt-4">
                  <span>Amount Payable</span>
                  <span className="text-[#F84464] text-[18px]">Rs. {grandTotal}</span>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <button className="bg-[#F84464] hover:bg-[#e03a58] text-white py-3 rounded-[8px] font-bold w-full shadow-md transition-all duration-200 cursor-pointer" onClick={handleProceed}>
                    Proceed & Add Snacks
                  </button>
                  <button 
                    className="border border-slate-300 hover:bg-slate-50 text-[#333333] py-3 rounded-[8px] font-bold w-full shadow-sm bg-transparent transition-colors duration-150 cursor-pointer" 
                    onClick={handleSkipSnacks}
                  >
                    Skip & Pay Rs. {grandTotal}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Offer Banner ── */}
      <div className="bg-white border-t border-slate-200 py-3 mt-12 w-full text-center flex items-center justify-center gap-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <span className="w-5 h-5 bg-[#F84464] text-white rounded-full flex items-center justify-center text-[10px] font-bold italic">d</span>
        <span className="text-xs font-medium text-slate-700">Enjoy B1G1 Ticket Free!* with Bandhan Bank Legacy Debit Cards</span>
      </div>
    </div>
  );
}
