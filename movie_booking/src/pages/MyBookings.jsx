import React, { useEffect, useState } from "react";
import { getUserBookings, cancelBooking } from "../config/allApis";
import { LuTicket, LuFilm, LuBuilding2, LuCalendar, LuClock, LuDownload, LuCalendarDays } from "react-icons/lu";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = React.useCallback(() => {
    getUserBookings()
      .then((r) => setBookings(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? Seats will be released.")) return;
    try { await cancelBooking(id); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Cannot cancel"); }
  };

  const handleDownload = async (id, title) => {
    const element = document.getElementById(`ticket-${id}`);
    if (!element) return;
    
    element.style.position = "static";
    element.style.visibility = "visible";
    element.style.zIndex = "-1";

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, 0, pdfWidth, pdfHeight + 20, "F");
      
      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`Book_My_Show_Ticket_${title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    } finally {
      element.style.position = "absolute";
      element.style.visibility = "hidden";
    }
  };

  const handleAddToCalendar = (b, title) => {
    if (!b.show || !b.show.date || !b.show.time) return alert("Streaming movies are available 24/7!");

    try {
      const d = new Date(b.show.date);
      const dateStr = d.toISOString().split("T")[0].replace(/-/g, "");
      
      let [hours, minutes] = b.show.time.split(":");
      const ampm = b.show.time.match(/[a-zA-Z]+/)?.[0]?.toLowerCase();
      
      hours = parseInt(hours);
      if (ampm === "pm" && hours < 12) hours += 12;
      if (ampm === "am" && hours === 12) hours = 0;
      
      const hh = hours.toString().padStart(2, "0");
      const mm = (minutes ? parseInt(minutes) : 0).toString().padStart(2, "0");
      
      const startTime = dateStr + "T" + hh + mm + "00";
      
      const endHh = (hours + 3).toString().padStart(2, "0");
      const endTime = dateStr + "T" + endHh + mm + "00";

      const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:🎬 ${title}\nDESCRIPTION:Booking ID: ${b.bookingId}\\nSeats: ${b.seats?.map(s => s.seatNumber).join(", ")}\nLOCATION:${b.show.theatre?.name}, ${b.show.theatre?.location}\nDTSTART:${startTime}\nDTEND:${endTime}\nEND:VEVENT\nEND:VCALENDAR`;

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `Book_My_Show_${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Could not generate calendar invite.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-48 bg-bms-bg min-h-[80vh]">
      <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8 px-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-bms-text flex items-center gap-2">
              <LuTicket className="text-bms-accent" /> My Bookings
            </h1>
            <p className="text-sm text-bms-text-muted mt-1">{bookings.length} booking(s) found</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-bms-text-muted bg-bms-surface/50 border border-dashed border-bms-border rounded-xl">
            <LuFilm size={54} className="text-bms-text-dim mb-4" />
            <h3 className="text-lg font-bold text-bms-text mb-1">No Bookings Yet</h3>
            <p className="text-sm">Your booking history will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {bookings.map((b) => {
              const title = b.show?.movie?.title || b.item?.title;
              const isEvent = b.show?.movie?.itemType === "event" || b.item?.itemType === "event";
              const poster = isEvent ? (b.show?.movie?.backdrop || b.show?.movie?.poster || b.item?.backdrop || b.item?.poster) : (b.show?.movie?.poster || b.item?.poster);
              const isPremiere = !b.show;

              return (
                <div 
                  key={b._id} 
                  className={`relative flex flex-col md:flex-row bg-bms-surface border border-bms-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    b.status === "cancelled" ? "opacity-60 grayscale-[40%]" : ""
                  }`}
                >
                  <img src={poster} alt={title} className="w-full md:w-[160px] aspect-[2/3] object-cover bg-slate-800" />
                  <div className="flex-1 p-5 md:p-6 flex flex-col gap-3 justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-base md:text-lg font-bold text-bms-text leading-tight">{title}</h3>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider border ${
                          b.status === "confirmed" 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : b.status === "cancelled" 
                              ? "bg-red-500/10 text-red-500 border-red-500/20" 
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-bms-text font-medium flex items-center gap-1.5 mt-2">
                        {isPremiere ? <><LuFilm /> Lifetime Rental (Stream)</> : <><LuBuilding2 /> {b.show?.theatre?.name} · {b.show?.theatre?.location}</>}
                      </p>
                      <p className="text-xs text-bms-text-muted flex items-center gap-1.5 mt-1">
                        <LuCalendar /> {b.show?.date ? new Date(b.show.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : new Date(b.createdAt).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {b.show?.time ? <><span className="text-bms-text-dim">·</span><LuClock /> {b.show.time}</> : ""}
                      </p>

                      {!isPremiere && (
                        <div className="flex flex-wrap gap-2.5 mt-3">
                          {b.seats?.map((s) => (
                            <span key={s.seatNumber} className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-bms-border/80 bg-bms-surface-hover text-bms-text uppercase">{s.seatNumber}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-end gap-6 border-t border-bms-border/50 pt-4 mt-3">
                      <div>
                        <p className="text-xs text-bms-text-muted"><strong>Booking ID:</strong> <span className="font-mono text-xs text-bms-text ml-1 select-all">{b.bookingId}</span></p>
                        {b.foodItems && b.foodItems.length > 0 && (
                          <p className="text-xs text-bms-text-muted mt-1">
                            <strong>Food:</strong> <span className="text-bms-text font-medium">{b.foodItems.map(f => `${f.quantity}x ${f.name}`).join(", ")}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-[10px] text-bms-text-dim uppercase font-semibold">Total Paid</p>
                        <p className="font-bold text-lg text-bms-accent">₹{b.grandTotal?.toLocaleString("en-IN")}</p>
                        {b.grandTotal > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-bms-border/40 flex flex-col gap-0.5 text-right">
                            <p className="text-[10px] text-bms-text-dim">
                              <span className="text-bms-text-muted">CGST (9%)</span>: <span className="font-semibold">₹{Math.round(b.grandTotal * 0.09 / 1.18)}</span>
                            </p>
                            <p className="text-[10px] text-bms-text-dim">
                              <span className="text-bms-text-muted">SGST (9%)</span>: <span className="font-semibold">₹{Math.round(b.grandTotal * 0.09 / 1.18)}</span>
                            </p>
                            <p className="text-[10px] text-bms-text-muted font-bold border-t border-bms-border/30 pt-0.5 mt-0.5">
                              GST (18%): ₹{Math.round(b.grandTotal * 0.18 / 1.18)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {b.status === "confirmed" && (
                      <div className="flex gap-3 mt-4">
                        <button className="flex-1 border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150" onClick={() => handleDownload(b._id, title)}>
                          <LuDownload size={14} /> Save PDF
                        </button>
                        {!isPremiere && (
                          <button className="flex-1 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150" onClick={() => handleAddToCalendar(b, title)}>
                            <LuCalendarDays size={14} /> Calendar
                          </button>
                        )}
                        <button className="flex-1 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150" onClick={() => handleCancel(b._id)} id={`cancel-booking-${b._id}`}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tear-away QR Section */}
                  <div className="w-full md:w-[150px] border-t md:border-t-0 md:border-l border-dashed border-bms-border/60 p-6 flex flex-col items-center justify-center bg-bms-surface-hover/30 relative">
                    <div className="absolute top-0 left-1/2 md:left-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-4 h-4 bg-bms-bg rounded-full border border-bms-border z-10"></div>
                    <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="bg-white p-2 rounded-lg border border-bms-border">
                        <QRCode value={b.bookingId || b._id} size={80} />
                      </div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-bms-text-dim mt-1">Scan at entry</p>
                    </div>
                  </div>

                  {/* Hidden PDF Ticket Template */}
                  <div id={`ticket-${b._id}`} style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: "400px", padding: "30px", background: "#ffffff", color: "#000000", fontFamily: "sans-serif", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
                    <div style={{ textAlign: "center", borderBottom: "2px dashed #cccccc", paddingBottom: "15px", marginBottom: "20px" }}>
                      <h1 style={{ margin: 0, color: "#F84464", fontSize: "28px", letterSpacing: "2px" }}>Book My Show</h1>
                      <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666666", textTransform: "uppercase", letterSpacing: "4px" }}>Admit One</p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                      <img src={poster} alt="poster" style={{ width: "120px", height: "180px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }} crossOrigin="anonymous" />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h2 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", lineHeight: "1.2" }}>{title}</h2>
                        <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#444" }}><strong>Theatre:</strong> {isPremiere ? "Lifetime Streaming" : b.show?.theatre?.name}</p>
                        <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#444" }}><strong>Date:</strong> {b.show?.date ? new Date(b.show.date).toLocaleDateString() : new Date(b.createdAt).toLocaleDateString()}</p>
                        <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#444" }}><strong>Time:</strong> {isPremiere ? "24/7 Access" : b.show?.time}</p>
                        
                        {!isPremiere && (
                          <div>
                            <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#444" }}><strong>Seats:</strong></p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {b.seats?.map(s => <span key={s.seatNumber} style={{ padding: "4px 8px", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>{s.seatNumber}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: "center", borderTop: "2px dashed #cccccc", paddingTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ padding: "10px", background: "#fff", border: "1px solid #eee", borderRadius: "8px", display: "inline-block" }}>
                        <QRCode value={b.bookingId || b._id} size={120} />
                      </div>
                      <p style={{ margin: "10px 0 0 0", fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px", color: "#333" }}>{b.bookingId}</p>
                      <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#888" }}>Please present this QR code at the entrance</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
