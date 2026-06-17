import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShowsByMovie, getMovieById } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";

const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d;
});

const formatDate = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
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

export default function TheatreSelection() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { location } = useLocationContext();
  const [movie, setMovie] = useState(null);
  const [theatreData, setTheatreData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovieById(movieId)
      .then((r) => setMovie(r.data.data))
      .catch(() => navigate("/"));
  }, [movieId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const r = await getShowsByMovie(movieId, { date: formatDate(DAYS[selectedDate]), location });
        setTheatreData(r.data.data);
      } catch {
        setTheatreData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId, selectedDate, location]);

  return (
    <div className="pt-[110px] md:pt-[125px] pb-16 min-h-[calc(100vh-300px)] bg-[#f2f5f9] text-[#333333]">
      {/* ── Movie Info Bar ── */}
      {movie && (
        <div className="bg-[#333545] py-8 text-white mb-6 border-b border-white/5">
          <div className="max-w-[1200px] mx-auto px-4">
            <h1 className="text-[28px] md:text-[36px] font-normal mb-3">{movie.title} - {Array.isArray(movie.language) ? movie.language.join(", ") : movie.language}</h1>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-transparent text-white text-[10px] md:text-[11px] uppercase font-semibold px-3 py-1 rounded-full border border-white/30">{movie.genre?.join(", ")}</span>
              <span className="bg-transparent text-white text-[10px] md:text-[11px] uppercase font-semibold px-3 py-1 rounded-full border border-white/30">2D, 3D</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter & Date Strip ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[68px] md:top-[115px] z-30 mb-8">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center h-[70px]">
          <div className="flex gap-2 overflow-x-auto scrollbar-none items-center h-full">
            {DAYS.map((d, i) => (
              <button
                key={i}
                className={`flex flex-col items-center justify-center rounded-[8px] text-center w-[50px] md:w-[60px] h-[55px] flex-shrink-0 cursor-pointer transition-all duration-200 group ${
                  i === selectedDate ? "bg-[#F84464] text-white shadow-md" : "bg-transparent text-[#333333] hover:bg-slate-50 hover:text-[#F84464]"
                }`}
                onClick={() => setSelectedDate(i)}
              >
                <div className={`text-[9px] md:text-[10px] font-medium tracking-wide uppercase ${i === selectedDate ? 'text-white/90' : 'text-slate-500 group-hover:text-[#F84464]/80'}`}>
                  {d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}
                </div>
                <div className="text-[18px] md:text-[20px] font-bold leading-none my-0.5">{d.getDate()}</div>
                <div className={`text-[9px] md:text-[10px] font-medium uppercase ${i === selectedDate ? 'text-white/90' : 'text-slate-500 group-hover:text-[#F84464]/80'}`}>
                  {d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex gap-6 text-[12px] md:text-[13px] text-[#666666] justify-end items-center mb-4 px-2">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#4CAF50] rounded-full inline-block"></span> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#FF9800] rounded-full inline-block"></span> Fast Filling</span>
        </div>

        {/* ── Theatres List ── */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-[#F84464] rounded-full animate-spin" />
          </div>
        ) : theatreData.length === 0 ? (
          <div className="text-center py-24 text-slate-500 bg-white border border-slate-200 rounded-[8px]">
            <h3 className="text-[18px] font-bold text-[#333333] mb-2">No Shows Available</h3>
            <p className="text-[14px]">Try selecting a different date for this movie.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {theatreData.map(({ theatre, shows }) => (
              <div key={theatre._id} className="bg-white border-y md:border border-slate-200 md:rounded-[8px] py-5 px-4 md:px-6 flex flex-col md:flex-row gap-6 hover:shadow-sm transition-shadow">
                {/* Theatre Header */}
                <div className="w-full md:w-[320px] flex-shrink-0">
                  <h4 className="text-[15px] md:text-[16px] font-bold text-[#333333] flex items-center justify-between gap-4 mb-2">
                    <span className="hover:text-[#F84464] cursor-pointer transition-colors flex items-center gap-2">
                      <span className="text-[#F84464]">♡</span> {theatre.name}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${theatre.name} ${theatre.location || ''} ${theatre.city || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-500 hover:text-[#333333] px-2 py-1 text-[11px] md:text-[12px] font-medium rounded transition-colors whitespace-nowrap"
                    >
                      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Info
                    </a>
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {theatre.amenities?.map((a) => <span key={a} className="text-[10px] md:text-[11px] font-medium text-[#4CAF50] bg-[#4CAF50]/10 px-2 py-0.5 rounded-[4px]">{a}</span>)}
                  </div>
                </div>

                {/* Shows List */}
                <div className="flex-1 flex flex-wrap gap-4 items-center">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      className="min-w-[90px] border border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white rounded-[4px] py-1.5 px-3 text-center cursor-pointer group transition-all duration-200 shadow-sm hover:shadow"
                      onClick={() => {
                        navigate(`/seat/${movieId}/${theatre._id}/${show._id}`, { state: { qty: 2 } });
                      }}
                    >
                      <div className="text-[13px] font-medium">{format12Hour(show.time)}</div>
                      <div className="text-[9px] font-medium opacity-80 mt-0.5">{show.format}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
