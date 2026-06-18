import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { LuCircleCheck, LuFilm, LuDownload, LuTicket, LuHouse, LuCalendar } from "react-icons/lu";
import { QRCodeCanvas } from 'qrcode.react';

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
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#12121E", useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a5");
    const w = pdf.internal.pageSize.getWidth() - 20;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 10, 10, w, h);
    pdf.save(`BookMyShow_${booking.bookingId}.pdf`);
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
PRODID:-//BookMyShow//BookMyShow Calendar//EN
BEGIN:VEVENT
UID:${booking.bookingId}@bookmyshow.com
DTSTAMP:${nowStr}
DTSTART:${startDateStr}
DTEND:${endDateStr}
SUMMARY:BookMyShow: ${movie.title}
DESCRIPTION:Booking ID: ${booking.bookingId}\\nSeats: ${seatsStr}\\nTheatre: ${theatre?.name}\\nScreen: ${show?.screen || '1'}\\nAmount Paid: Rs. ${booking.grandTotal}
LOCATION:${theatre?.name}, ${theatre?.location || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BookMyShow_${booking.bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <div className="container max-w-[650px] mx-auto py-10 px-4 flex flex-col items-center">
        {/* Success Header */}
        <div className="text-center flex flex-col items-center gap-2.5 mb-8 animate-fade-in">
          <div className="mb-2"><LuCircleCheck color="#2DC492" size={64} /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-bms-text">Booking Confirmed!</h1>
          <p className="text-sm text-bms-text-muted flex items-center gap-1.5">Your tickets are ready. Enjoy the show! <LuFilm /></p>
          <div className="bg-bms-accent-glow text-bms-accent border border-bms-accent/20 px-3.5 py-1 rounded-full text-xs font-bold mt-2">Booking ID: <strong>{booking.bookingId}</strong></div>
        </div>

        {/* Ticket */}
        <div className="w-full max-w-[500px] mb-8 animate-slide-up" ref={ticketRef}>
          <div className="flex bg-[#12121E] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            {/* Ticket Left (Movie Info) */}
            <div className="w-[45%] p-5 border-r border-dashed border-white/10 flex flex-col gap-4 relative">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-bms-accent flex items-center gap-1"><LuFilm /> BookMyShow</div>

              <img src={movie?.poster} alt={movie?.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-md" />

              <div className="flex flex-col gap-1.5">
                <h2 className="text-xs md:text-sm font-semibold line-clamp-2 leading-snug">{movie?.title}</h2>
                <div className="flex flex-wrap gap-1">
                  {movie?.genre?.slice(0, 2).map((g) => (
                    <span key={g} className="bg-white/10 border border-white/20 text-white px-2 py-0.5 text-[8px] font-semibold uppercase rounded-md tracking-wider">{g}</span>
                  ))}
                  {show?.format && <span className="bg-[#4F46E5]/20 border border-[#4F46E5]/40 text-[#818CF8] px-2 py-0.5 text-[8px] font-semibold uppercase rounded-md tracking-wider">{show.format}</span>}
                </div>
              </div>
            </div>

            {/* Ticket Right (Details) */}
            <div className="flex-1 p-5 flex flex-col justify-between gap-4">
              {isPremiere ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Access</span>
                      <span className="text-xs font-bold text-white">Lifetime Rental</span>
                    </div>
                  </div>
                  <div className="flex justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Date Purchased</span>
                      <span className="text-xs font-bold text-white">{new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Theatre</span>
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">{theatre?.name}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Screen</span>
                      <span className="text-xs font-bold text-white">{show?.screen || "1"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Date</span>
                      <span className="text-xs font-bold text-white">{new Date(show?.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Time</span>
                      <span className="text-xs font-bold text-white">{show?.time}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Seats</span>
                    <div className="flex flex-wrap gap-1.5">
                      {booking.seats?.map((s) => (
                        <span key={s.seatNumber} className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold border border-white/10 uppercase">
                          {s.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-end border-t border-white/10 pt-3">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Amount Paid</span>
                <span className="text-base font-bold text-bms-accent">₹{booking.grandTotal}</span>
              </div>
              {/* Tax breakdown */}
              {booking.grandTotal > 0 && (
                <div className="border-t border-white/10 pt-2 mt-1 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] uppercase tracking-wider text-slate-500">CGST (9%)</span>
                    <span className="text-[9px] text-slate-400 font-semibold">₹{Math.round(booking.grandTotal * 0.09 / 1.18)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] uppercase tracking-wider text-slate-500">SGST (9%)</span>
                    <span className="text-[9px] text-slate-400 font-semibold">₹{Math.round(booking.grandTotal * 0.09 / 1.18)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-1 mt-0.5">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Total GST (18%)</span>
                    <span className="text-[9px] text-slate-300 font-bold">₹{Math.round(booking.grandTotal * 0.18 / 1.18)}</span>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="bg-white p-2 rounded-lg border border-white/10">
                  <QRCodeCanvas value={booking.bookingId} size={80} level="H" />
                </div>
                <span className="text-[9px] text-white/50 font-mono select-all">{booking.bookingId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 w-full justify-center mt-2 animate-fade-in">
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
