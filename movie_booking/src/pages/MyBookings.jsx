import SEO from "../components/SEO";
import React, { useEffect, useState } from "react";
import { getUserBookings, cancelBooking } from "../config/allApis";
import { LuTicket, LuFilm, LuBuilding2, LuCalendar, LuClock, LuDownload, LuCalendarDays } from "react-icons/lu";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import BASE_URL from "../config/baseUrl";

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
    try { await cancelBooking(id); fetch();
      toast.success("✅ Booking cancelled successfully.", {
        position: "top-right", autoClose: 4000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    }
    catch (err) {
      toast.error(err.response?.data?.message || "❌ Cannot cancel", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    }
  };

  const handleDownload = async (bookingId, title, posterUrl) => {
    const element = document.getElementById(`ticket-${bookingId}`);
    if (!element) return;
    
    // Convert poster to base64 to bypass any html2canvas taint/CORS issues
    const posterImg = element.querySelector(".pdf-poster-img");
    if (posterImg && posterUrl) {
      try {
        const res = await window.fetch(`${BASE_URL}/proxy-image?url=${encodeURIComponent(posterUrl)}`);
        if (!res.ok) throw new Error(`Proxy failed with status: ${res.status}`);
        const blob = await res.blob();
        const base64data = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        posterImg.src = base64data;
        // Guarantee the browser paints the new image src before taking the snapshot
        await new Promise(r => setTimeout(r, 150));
      } catch (err) {
        console.error("Failed to fetch proxy image as base64", err);
      }
    }

    // Removed layout-breaking position: static overrides

    try {
      // Wait for all images to finish loading to ensure they are rendered in the PDF
      const imgs = element.querySelectorAll("img");
      const promises = [];
      imgs.forEach((img) => {
        if (!img.complete) {
          promises.push(
            new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            })
          );
        }
      });
      await Promise.all(promises);

      const img = await htmlToImage.toPng(element, { pixelRatio: 2, backgroundColor: "#12121E" });
      const pdf = new jsPDF("p", "mm", "a5");
      const w = pdf.internal.pageSize.getWidth() - 20;
      const imgProps = pdf.getImageProperties(img);
      const h = (imgProps.height * w) / imgProps.width;
      pdf.addImage(img, "PNG", 10, 10, w, h);
      pdf.save(`cineBook_${bookingId}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    } finally {
      element.style.position = "absolute";
      element.style.visibility = "hidden";
    }
  };

  const handleAddToCalendar = (b, title) => {
    if (!b.show || !b.show.date || !b.show.time) {
      toast.info("ℹ️ Streaming movies are available 24/7!", {
        position: "top-right", autoClose: 4000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
      return;
    }

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
      link.setAttribute("download", `cineBook_${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      toast.error("❌ Could not generate calendar invite.", {
        position: "top-right", autoClose: 5000, hideProgressBar: false,
        closeOnClick: false, pauseOnHover: true, draggable: true, theme: "light",
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-48 bg-bms-bg min-h-[80vh]">
      <SEO title="My Bookings | cineBook" description="View your upcoming and past bookings on cineBook." />
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
                        <button className="flex-1 border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150" onClick={() => handleDownload(b.bookingId || b._id, title, poster)}>
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
                        <QRCodeCanvas value={b.bookingId || b._id} size={80} level="H" />
                      </div>
                      <p className="text-[9px] uppercase font-bold tracking-wider text-bms-text-dim mt-1">Scan at entry</p>
                    </div>
                  </div>

                  {/* Hidden PDF Ticket Template */}
                  <div style={{ position: "absolute", left: "-9999px", top: "0", pointerEvents: "none", width: "580px" }}>
                    <div 
                      id={`ticket-${b.bookingId || b._id}`} 
                      className="flex text-slate-300 border border-slate-800/80 p-6 relative bg-[#11131e] text-left"
                      style={{ width: "580px", fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
                    >
                      {/* Ticket Left (Movie Info) */}
                      <div className="w-[43%] pr-6 flex flex-col gap-4 relative">
                        <div className="text-[12px] font-bold uppercase tracking-widest text-[#F84464] flex items-center gap-1.5 font-sans">
                          <LuTicket size={16} className="fill-[#F84464]/20 text-[#F84464]" /> CINEBOOK
                        </div>

                        <img src={poster ? `${BASE_URL}/proxy-image?url=${encodeURIComponent(poster)}` : ""} alt={title} className="pdf-poster-img w-full aspect-[2/3] object-cover rounded-xl shadow-md border border-slate-800/40" crossOrigin="anonymous" />

                        <div className="flex flex-col gap-2">
                          <h2 className="text-sm font-extrabold text-white line-clamp-2 leading-snug tracking-wide">{title}</h2>
                          <div className="flex flex-wrap gap-1.5">
                            {b.show?.movie?.genre?.slice(0, 2).map((g) => (
                              <span key={g} className="bg-[#1d1d35] border border-[#3c3e66] text-[#9fa4fc] px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider">{g}</span>
                            ))}
                            {b.show?.format && (
                              <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/40 text-[#818CF8] px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider">
                                {b.show.format}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Perforated Vertical Divider */}
                      <div className="border-r border-dashed border-slate-800 my-1 relative">
                        {/* Top notch */}
                        <div className="absolute -top-[29px] -right-[9px] w-4 h-4 bg-[#12121E] rounded-full border border-slate-800"></div>
                        {/* Bottom notch */}
                        <div className="absolute -bottom-[29px] -right-[9px] w-4 h-4 bg-[#12121E] rounded-full border border-slate-800"></div>
                      </div>

                      {/* Ticket Right (Details) */}
                      <div className="flex-1 pl-6 flex flex-col justify-between gap-4">
                        {isPremiere ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Access</span>
                              <span className="text-xs font-bold text-white">Lifetime Rental</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Date Purchased</span>
                              <span className="text-xs font-bold text-white">{new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-left">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-sans">THEATRE</span>
                              <span className="text-xs font-bold text-white truncate max-w-[150px] font-sans">{b.show?.theatre?.name}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-sans">SCREEN</span>
                              <span className="text-xs font-bold text-white font-sans">{b.show?.screen || "Screen 1"}</span>
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-sans">DATE</span>
                              <span className="text-xs font-bold text-white font-sans">{new Date(b.show?.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-sans">TIME</span>
                              <span className="text-xs font-bold text-white font-sans">{b.show?.time}</span>
                            </div>

                            <div className="col-span-2 flex flex-col gap-1">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-sans">SEATS</span>
                              <div className="flex flex-wrap gap-1.5">
                                {b.seats?.map((s) => (
                                  <span key={s.seatNumber} className="px-2.5 py-0.5 bg-[#1d1d35] border border-[#3c3e66] text-white font-mono font-bold text-[9px] rounded-md tracking-wider uppercase">
                                    {s.seatNumber}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="border-t border-[#2b2d42] pt-3 mt-1 flex justify-between items-center text-left">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-sans">AMOUNT PAID</span>
                          <span className="text-2xl font-extrabold text-[#F84464] font-sans">₹{b.grandTotal}</span>
                        </div>
                        
                        {/* Tax breakdown */}
                        {b.grandTotal > 0 && (
                          <div className="border-t border-[#2b2d42] pt-2 mt-1 flex flex-col gap-1 text-left">
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="text-slate-500 font-medium font-sans">CGST (9%)</span>
                              <span className="text-slate-400 font-semibold font-sans">₹{Math.round(b.grandTotal * 0.09 / 1.18)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                              <span className="text-slate-500 font-medium font-sans">SGST (9%)</span>
                              <span className="text-slate-400 font-semibold font-sans">₹{Math.round(b.grandTotal * 0.09 / 1.18)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#2b2d42] pt-1.5 mt-0.5 text-[9px]">
                              <span className="text-slate-400 font-bold font-sans">TOTAL GST (18%)</span>
                              <span className="text-slate-300 font-bold font-sans">₹{Math.round(b.grandTotal * 0.18 / 1.18)}</span>
                            </div>
                          </div>
                        )}

                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-1.5 mt-1 pt-3 border-t border-[#2b2d42]/50">
                          <div className="bg-white p-2 rounded-xl shadow-md inline-block">
                            <QRCodeCanvas value={b.bookingId || b._id} size={90} level="H" />
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase">{b.bookingId}</span>
                        </div>
                      </div>
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
