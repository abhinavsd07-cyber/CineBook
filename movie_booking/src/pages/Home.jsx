import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNowShowing, getPremieres, getEvents, getBanners } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";
import SEO from "../components/SEO";

import AdCarousel from "../components/AdCarousel";
import { MovieCardSkeleton } from "../components/Skeleton";
import ScrollContainer from "../components/ScrollContainer";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [premieres, setPremieres] = useState([]);
  const [events, setEvents] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [middleBanners, setMiddleBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { location } = useLocationContext();

  useEffect(() => {
    let active = true;
    const fetchHomeData = () => {
      setLoading(true);
      Promise.all([getNowShowing({ location }), getPremieres(), getEvents({ location }), getBanners()])
        .then(([m, p, e, b]) => { 
          if(active) {
            setMovies(m.data.data); 
            setPremieres(p.data.data); 
            setEvents(e.data.data); 
            
            const allBanners = b.data.data || [];
            setHeroBanners(allBanners.filter(x => x.type === 'hero').map(x => ({ bg: x.imageUrl, link: x.targetLink })));
            setMiddleBanners(allBanners.filter(x => x.type === 'middle').map(x => ({ bg: x.imageUrl, link: x.targetLink })));
          }
        })
        .catch(console.error)
        .finally(() => { if(active) setLoading(false); });
    };
    fetchHomeData();
    return () => { active = false; };
  }, [location]);

  return (
    <div className="pt-[110px] md:pt-[125px] pb-16 min-h-[calc(100vh-300px)] bg-[#f2f5f9] text-[#333333]">
      <SEO />
      {/* ── Top Hero Banner Carousel ── */}
      {heroBanners.length > 0 && (
        <section className="mb-8">
          <div className="max-w-[1250px] mx-auto px-2 md:px-4 pt-4">
            <AdCarousel slides={heroBanners} className="rounded-xl shadow-md" />
          </div>
        </section>
      )}

      <div className="max-w-[1200px] mx-auto px-4">
        {/* ── RECOMMENDED MOVIES ── */}
        <section id="now-showing" className="mb-12">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#333333]">Recommended Movies</h2>
            <button className="text-[#F84464] hover:text-[#e03a58] text-[13px] md:text-[14px] font-medium flex items-center transition-colors" onClick={() => navigate('/explore')}>See All &rsaquo;</button>
          </div>
          {loading ? (
            <ScrollContainer className="py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[140px] sm:w-[170px] md:w-[220px] flex-shrink-0">
                  <MovieCardSkeleton />
                </div>
              ))}
            </ScrollContainer>
          ) : (
            <ScrollContainer className="py-2">
              {movies.length > 0 ? movies.map((m) => (
                <div key={m._id} className="w-[140px] sm:w-[170px] md:w-[224px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] bg-slate-200">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                    {m.rating > 0 && (
                      <div className="absolute bottom-0 left-0 w-full bg-black/80 text-white text-[11px] md:text-[13px] font-medium py-2 px-3 flex items-center gap-1 rounded-b-[8px]">
                        <span className="text-[#F84464]">★</span> 
                        <span>{m.rating.toFixed(1)}/10</span>
                        <span className="text-gray-300 font-normal text-[10px] md:text-[11px] ml-auto">50K+ Votes</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-[14px] md:text-[18px] font-medium text-[#333333] mt-3 truncate">{m.title}</h4>
                  <p className="text-[12px] md:text-[14px] text-[#666666] mt-1 truncate">{m.genre?.join("/")}</p>
                </div>
              )) : (
                <div className="w-full text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <p>No movies currently playing in your region.</p>
                </div>
              )}
            </ScrollContainer>
          )}
        </section>

        {/* ── STREAM AD BANNER ── */}
        <section className="mb-12 cursor-pointer hover:opacity-95 transition-opacity duration-200 px-1" onClick={() => navigate('/explore')}>
          <img src="https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-1440,h-120:q-80/stream-leadin-web-collection-202210241242.png" alt="Stream" className="w-full rounded-xl shadow-sm" />
        </section>

        {/* ── THE BEST OF LIVE EVENTS (Middle Banners) ── */}
        {middleBanners.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#333333]">The Best Of Live Events</h2>
            </div>
            <ScrollContainer className="py-2 gap-4 md:gap-8">
              {middleBanners.map((b, idx) => (
                <div key={idx} className="w-[150px] sm:w-[180px] md:w-[224px] flex-shrink-0 cursor-pointer group" onClick={() => b.link && window.open(b.link, "_blank")}>
                  <img src={b.bg} alt={`Event Category ${idx}`} className="w-full aspect-square rounded-[8px] object-cover shadow-sm group-hover:shadow-md transition-all duration-300" />
                </div>
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>

      {/* ── PREMIERES (Full Width Section) ── */}
      {premieres.length > 0 && (
        <section id="premieres" className="bg-[#2b3149] py-14 my-12 text-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="mb-8 px-1">
              <h2 className="text-[20px] md:text-[24px] font-bold tracking-tight text-white">Premieres</h2>
              <p className="text-[13px] md:text-[14px] text-white/80 mt-1">Brand new releases every Friday</p>
            </div>
            <ScrollContainer className="py-2">
              {premieres.map((m) => (
                <div key={m._id} className="w-[140px] sm:w-[170px] md:w-[224px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] bg-slate-800 shadow-md">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                    <div className="absolute top-0 left-0 w-full bg-[#D42A45] text-white text-[10px] md:text-[11px] font-medium py-1 text-center rounded-t-[8px]">PREMIERE</div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-1"><path d="M5 3l14 9-14 9V3z"/></svg>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-[14px] md:text-[18px] font-medium text-white mt-3 truncate">{m.title}</h4>
                  <p className="text-[12px] md:text-[14px] text-white/70 mt-1 truncate">{Array.isArray(m.language) ? m.language.join(", ") : m.language}</p>
                </div>
              ))}
            </ScrollContainer>
          </div>
        </section>
      )}

      <div className="max-w-[1200px] mx-auto px-4">
        {/* ── EVENTS ── */}
        {events.length > 0 && (
          <section id="events" className="mb-12">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#333333]">Upcoming Events & Activities</h2>
              <button className="text-[#F84464] hover:text-[#e03a58] text-[13px] md:text-[14px] font-medium flex items-center transition-colors" onClick={() => navigate('/explore')}>See All &rsaquo;</button>
            </div>
            <ScrollContainer className="py-2">
              {events.map((m) => (
                <div key={m._id} className="w-[140px] sm:w-[170px] md:w-[224px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] bg-slate-200">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
                  </div>
                  <h4 className="text-[14px] md:text-[18px] font-medium text-[#333333] mt-3 truncate">{m.title}</h4>
                  <p className="text-[12px] md:text-[14px] text-[#666666] mt-1 truncate">{m.genre?.join("/")}</p>
                </div>
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>
    </div>
  );
}
