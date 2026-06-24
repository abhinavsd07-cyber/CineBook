import SEO from "../components/SEO";
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { LuCircleCheck, LuFilm, LuDownload, LuTicket, LuHouse, LuCalendar } from "react-icons/lu";
import { QRCodeCanvas } from 'qrcode.react';
import BASE_URL from "../config/baseUrl";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef(null);
  const booking = location.state?.booking;

  if (!booking) { navigate("/"); return null; }

  const show = booking.show;
  const movie = show?.movie || booking.item;
  const theatre = show?.theatre;
  const isPremiere = !show;

  const downloadTicket = async () => {
    const el = ticketRef.current;
    if (!el) return;

    // Convert poster to base64 to bypass any html2canvas taint/CORS issues
    const posterImg = el.querySelector(".pdf-poster-img");
    if (posterImg && movie?.poster) {
      try {
        const res = await window.fetch(`${BASE_URL}/proxy-image?url=${encodeURIComponent(movie.poster)}`);
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

    // Wait for all images to finish loading to ensure they are rendered in the PDF
    const imgs = el.querySelectorAll("img");
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

    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#12121E", useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a5");
    const w = pdf.internal.pageSize.getWidth() - 20;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 10, 10, w, h);
    pdf.save(`cineBook_${booking.bookingId}.pdf`);
  };

  const addToCalendar = () => {
    if (!show || !movie) return;
    
    const dateObj = new Date(show.date);
    const [timePart, modifier] = show.time.split(" ");
    let [hours, minutes] = timePart.split(":");
    let h = parseInt(hours, 10);
    if (modifier && modifier.toUpperCase() === "PM" && h < 12) h += 12;
    if (modifier && modifier.toUpperCase() === "AM" && h === 12) h = 0;
    dateObj.setHours(h, parseInt(minutes, 10), 0);
    
    const endDateObj = new Date(dateObj.getTime() + (2.5 * 60 * 60 * 1000)); 
    
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const startDateStr = formatDate(dateObj);
    const endDateStr = formatDate(endDateObj);
    const nowStr = formatDate(new Date());

    const seatsStr = booking.seats?.map(s => s.seatNumber).join(", ") || "";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//cineBook//cineBook Calendar//EN
BEGIN:VEVENT
UID:${booking.bookingId}@cinebook.com
DTSTAMP:${nowStr}
DTSTART:${startDateStr}
DTEND:${endDateStr}
SUMMARY:cineBook: ${movie.title}
DESCRIPTION:Booking ID: ${booking.bookingId}\\nSeats: ${seatsStr}\\nTheatre: ${theatre?.name}\\nScreen: ${show?.screen || '1'}\\nAmount Paid: Rs. ${booking.grandTotal}
LOCATION:${theatre?.name}, ${theatre?.location || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cineBook_${booking.bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <SEO title="Booking Confirmed | cineBook" description="Your movie tickets are confirmed!" />
      <div className="container max-w-[650px] mx-auto py-10 px-4 flex flex-col items-center">
        {/* Success Header */}
        <div className="text-center flex flex-col items-center gap-2.5 mb-8 animate-fade-in">
          <div className="mb-2"><LuCircleCheck color="#2DC492" size={64} /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-bms-text">Booking Confirmed!</h1>
          <p className="text-sm text-bms-text-muted flex items-center gap-1.5">Your tickets are ready. Enjoy the show! <LuFilm /></p>
          <div className="bg-bms-accent-glow text-bms-accent border border-bms-accent/20 px-3.5 py-1 rounded-full text-xs font-bold mt-2">Booking ID: <strong>{booking.bookingId}</strong></div>
        </div>

        {/* Visible Ticket (Responsive on screen) */}
        <div className="w-full max-w-[580px] mb-8 animate-slide-up">
          <div className="flex bg-[#11131e] text-slate-300 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 p-6 relative">
            {/* Ticket Left (Movie Info) */}
            <div className="w-[43%] pr-6 flex flex-col gap-4 relative">
              <div className="text-[12px] font-bold uppercase tracking-widest text-[#F84464] flex items-center gap-1.5 font-sans">
                <LuTicket size={16} className="fill-[#F84464]/20" /> CINEBOOK
              </div>

              <img src={movie?.poster} alt={movie?.title} className="w-full aspect-[2/3] object-cover rounded-xl shadow-md border border-slate-800/40" />

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-extrabold text-white line-clamp-2 leading-snug tracking-wide">{movie?.title}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {movie?.genre?.slice(0, 2).map((g) => (
                    <span key={g} className="bg-[#1d1d35] border border-[#3c3e66] text-[#9fa4fc] px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider">{g}</span>
                  ))}
                  {show?.format && <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/40 text-[#818CF8] px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider">{show.format}</span>}
                </div>
              </div>
            </div>

            {/* Perforated Vertical Divider */}
            <div className="border-r border-dashed border-slate-800 my-1 relative">
              {/* Top notch */}
              <div className="absolute -top-[29px] -right-[9px] w-4 h-4 bg-bms-bg rounded-full border border-slate-800"></div>
              {/* Bottom notch */}
              <div className="absolute -bottom-[29px] -right-[9px] w-4 h-4 bg-bms-bg rounded-full border border-slate-800"></div>
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
                    <span className="text-xs font-bold text-white">{new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">THEATRE</span>
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{theatre?.name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">SCREEN</span>
                    <span className="text-xs font-bold text-white">{show?.screen || "Screen 1"}</span>
                  </div>

                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">DATE</span>
                    <span className="text-xs font-bold text-white">{new Date(show?.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">TIME</span>
                    <span className="text-xs font-bold text-white">{show?.time}</span>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1 text-left">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">SEATS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seats?.map((s) => (
                        <span key={s.seatNumber} className="px-2.5 py-0.5 bg-[#1d1d35] border border-[#3c3e66] text-white font-mono font-bold text-[9px] rounded-md tracking-wider uppercase">
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-[#2b2d42] pt-3 mt-1 flex justify-between items-center text-left">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">AMOUNT PAID</span>
                <span className="text-2xl font-extrabold text-[#F84464]">₹{booking.grandTotal}</span>
              </div>
              
              {/* Tax breakdown */}
              {booking.grandTotal > 0 && (
                <div className="border-t border-[#2b2d42] pt-2 mt-1 flex flex-col gap-1 text-left">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 font-medium">CGST (9%)</span>
                    <span className="text-slate-400 font-semibold">₹{Math.round(booking.grandTotal * 0.09 / 1.18)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 font-medium">SGST (9%)</span>
                    <span className="text-slate-400 font-semibold">₹{Math.round(booking.grandTotal * 0.09 / 1.18)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#2b2d42] pt-1.5 mt-0.5 text-[9px]">
                    <span className="text-slate-400 font-bold">TOTAL GST (18%)</span>
                    <span className="text-slate-300 font-bold">₹{Math.round(booking.grandTotal * 0.18 / 1.18)}</span>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1.5 mt-1 pt-3 border-t border-[#2b2d42]/50">
                <div className="bg-white p-2 rounded-xl shadow-md inline-block">
                  <QRCodeCanvas value={booking.bookingId} size={90} level="H" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase select-all">{booking.bookingId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Ticket Clone for PDF Generation (Fixed size 580px) */}
        <div style={{ position: "absolute", left: "-9999px", top: 0, width: "580px", pointerEvents: "none" }}>
          <div ref={ticketRef} className="flex bg-[#11131e] text-slate-300 border border-slate-800/80 p-6 relative text-left" style={{ width: "580px" }}>
            {/* Ticket Left (Movie Info) */}
            <div className="w-[43%] pr-6 flex flex-col gap-4 relative">
              <div className="text-[12px] font-bold uppercase tracking-widest text-[#F84464] flex items-center gap-1.5 font-sans">
                <LuTicket size={16} className="fill-[#F84464]/20" /> CINEBOOK
              </div>

              <img src={movie?.poster ? `${BASE_URL}/proxy-image?url=${encodeURIComponent(movie.poster)}` : ""} alt={movie?.title} className="pdf-poster-img w-full aspect-[2/3] object-cover rounded-xl shadow-md border border-slate-800/40" crossOrigin="anonymous" />

              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-extrabold text-white line-clamp-2 leading-snug tracking-wide">{movie?.title}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {movie?.genre?.slice(0, 2).map((g) => (
                    <span key={g} className="bg-[#1d1d35] border border-[#3c3e66] text-[#9fa4fc] px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider">{g}</span>
                  ))}
                  {show?.format && <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/40 text-[#818CF8] px-2.5 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider">{show.format}</span>}
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
                    <span className="text-xs font-bold text-white">{new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">THEATRE</span>
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{theatre?.name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">SCREEN</span>
                    <span className="text-xs font-bold text-white">{show?.screen || "Screen 1"}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">DATE</span>
                    <span className="text-xs font-bold text-white">{new Date(show?.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">TIME</span>
                    <span className="text-xs font-bold text-white">{show?.time}</span>
                  </div>

                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">SEATS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seats?.map((s) => (
                        <span key={s.seatNumber} className="px-2.5 py-0.5 bg-[#1d1d35] border border-[#3c3e66] text-white font-mono font-bold text-[9px] rounded-md tracking-wider uppercase">
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-[#2b2d42] pt-3 mt-1 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">AMOUNT PAID</span>
                <span className="text-2xl font-extrabold text-[#F84464]">₹{booking.grandTotal}</span>
              </div>
              
              {/* Tax breakdown */}
              {booking.grandTotal > 0 && (
                <div className="border-t border-[#2b2d42] pt-2 mt-1 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 font-medium">CGST (9%)</span>
                    <span className="text-slate-400 font-semibold">₹{Math.round(booking.grandTotal * 0.09 / 1.18)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-500 font-medium">SGST (9%)</span>
                    <span className="text-slate-400 font-semibold">₹{Math.round(booking.grandTotal * 0.09 / 1.18)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#2b2d42] pt-1.5 mt-0.5 text-[9px]">
                    <span className="text-slate-400 font-bold">TOTAL GST (18%)</span>
                    <span className="text-slate-300 font-bold">₹{Math.round(booking.grandTotal * 0.18 / 1.18)}</span>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1.5 mt-1 pt-3 border-t border-[#2b2d42]/50">
                <div className="bg-white p-2 rounded-xl shadow-md inline-block">
                  <QRCodeCanvas value={booking.bookingId} size={90} level="H" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase">{booking.bookingId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 w-full justify-center mt-2 animate-fade-in relative z-50">
          <button className="bg-bms-accent hover:bg-bms-accent-hover text-white px-6 py-2.5 text-xs font-bold rounded-lg shadow-md transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-1.5" onClick={downloadTicket} id="download-ticket-btn">
            <LuDownload /> Download Ticket PDF
          </button>
          {!isPremiere && (
            <button className="border border-bms-border hover:bg-bms-surface-hover text-bms-text px-6 py-2.5 text-xs font-bold rounded-lg transition-colors duration-150 bg-transparent cursor-pointer flex items-center justify-center gap-1.5" onClick={addToCalendar} id="add-calendar-btn">
              <LuCalendar /> Add to Calendar
            </button>
          )}
          <button className="border border-bms-border hover:bg-bms-surface-hover text-bms-text px-6 py-2.5 text-xs font-bold rounded-lg transition-colors duration-150 bg-transparent cursor-pointer flex items-center justify-center gap-1.5" onClick={() => navigate("/my-bookings")} id="my-bookings-btn">
            <LuTicket /> My Bookings
          </button>
          <button className="bg-transparent hover:bg-bms-surface-hover text-bms-text-muted hover:text-bms-text px-6 py-2.5 text-xs font-bold rounded-lg transition-colors duration-150 cursor-pointer border-none flex items-center justify-center gap-1.5" onClick={() => navigate("/")} id="home-btn">
            <LuHouse /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
