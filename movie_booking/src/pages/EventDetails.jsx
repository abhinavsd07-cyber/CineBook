import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../config/allApis";
import { FaShareAlt, FaCalendarAlt, FaRegClock, FaHourglassHalf, FaLanguage, FaMusic } from "react-icons/fa";
import { LuMapPin, LuUsers } from "react-icons/lu";
import SEO from "../components/SEO";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovieById(id)
      .then((res) => {
        const data = res.data.data;
        if (data.itemType !== "event") {
          navigate(`/movie/${data._id}`);
          return;
        }
        setEvent(data);
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center py-48 bg-bms-bg min-h-[80vh]">
      <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
    </div>
  );
  if (!event) return null;

  const formattedDate = event.releaseDate 
    ? new Date(event.releaseDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) 
    : "Date TBA";
  
  const displayTime = event.eventTime || "Time TBA";
  const displayAgeGroups = event.eventAgeGroups || "All age groups";
  const displayCategories = event.genre && event.genre.length > 0 ? event.genre.join(", ") : "Various";
  const displayLocation = event.eventLocation || "Venue TBA";
  const priceDisplay = event.basePrice ? `₹${event.basePrice} onwards` : "Free / TBA";

  const displayImage = event.backdrop || event.poster;

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <SEO title={`${event.title} Tickets | Book My Show`} />

      <div className="bg-[#1A202C] dark:bg-[#0E121A] text-white py-10 mb-8 border-b border-white/5">
        <div className="container">
          
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center justify-between gap-4 mb-8 text-white px-2">
            {event.title}
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer text-sm transition-colors duration-150"><FaShareAlt /></button>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
              <img src={displayImage} alt={event.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="w-full">
              <div className="bg-bms-surface border border-bms-border text-bms-text p-6 rounded-2xl shadow-lg flex flex-col gap-4">
                
                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <FaCalendarAlt className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-text-muted">{formattedDate}</div>
                </div>

                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <FaRegClock className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-text-muted">{displayTime}</div>
                </div>

                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <FaHourglassHalf className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-text-muted">{event.duration || "Duration TBA"}</div>
                </div>

                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <LuUsers className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-text-muted">{displayAgeGroups}</div>
                </div>

                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <FaLanguage className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-text-muted">{Array.isArray(event.language) ? event.language.join(", ") : event.language || "Language TBA"}</div>
                </div>

                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <FaMusic className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-text-muted">{displayCategories}</div>
                </div>

                <div className="flex items-center gap-3.5 text-xs md:text-sm font-semibold">
                  <LuMapPin className="text-bms-accent w-4 h-4 flex-shrink-0" />
                  <div className="text-bms-accent cursor-pointer flex items-center hover:text-bms-accent-hover transition-colors duration-150">
                    {displayLocation} 
                    <span className="text-[10px] ml-1">↗</span>
                  </div>
                </div>

                <div className="h-[1px] bg-bms-border/50" />

                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    <h3 className="text-base md:text-lg font-bold text-bms-text">{priceDisplay}</h3>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Filling Fast</p>
                  </div>
                  <button 
                    className="bg-bms-accent hover:bg-bms-accent-hover text-white px-6 py-2.5 text-sm font-bold rounded-lg shadow-md transition-all duration-200 cursor-pointer border-none" 
                    onClick={() => navigate(`/event-tickets/${event._id}`)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="container">
        <section className="max-w-[800px] mb-8 px-2">
          <h2 className="text-xl md:text-2xl font-bold text-bms-text mb-4">About</h2>
          <p className="text-sm md:text-base leading-relaxed text-bms-text-muted">{event.description}</p>
        </section>
      </div>
      
    </div>
  );
}
