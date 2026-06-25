import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { getNowShowing, getUpcoming, getPremieres, getEvents, getBanners } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";
import SEO from "../components/SEO";

import AdCarousel from "../components/AdCarousel";
import { MovieCardSkeleton } from "../components/Skeleton";
import ScrollContainer from "../components/ScrollContainer";
import ImageWithSkeleton from "../components/ImageWithSkeleton";

export default function Home() {
  const navigate = useNavigate();
  const { location } = useLocationContext();

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['homeData', location],
    queryFn: async () => {
      const [m, u, p, e, b] = await Promise.all([
        getNowShowing({ location }),
        getUpcoming(),
        getPremieres(),
        getEvents({ location }),
        getBanners()
      ]);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const validNowShowing = m.data.data.filter(movie => {
        if (!movie.releaseDate) return true;
        return new Date(movie.releaseDate) <= today;
      });
      const validUpcoming = u.data.data.filter(movie => {
        if (!movie.releaseDate) return true;
        return new Date(movie.releaseDate) > today;
      });

      const allBanners = b.data.data || [];
      return {
        movies: validNowShowing,
        upcoming: validUpcoming,
        premieres: p.data.data,
        events: e.data.data,
        heroBanners: allBanners.filter(x => x.type === 'hero').map(x => ({ bg: x.imageUrl, link: x.targetLink })),
        middleBanners: allBanners.filter(x => x.type === 'middle').map(x => ({ bg: x.imageUrl, link: x.targetLink }))
      };
    }
  });

  const { movies, upcoming, premieres, events, heroBanners, middleBanners } = homeData || {};

  return (
    <div className="pt-[110px] md:pt-[125px] pb-16 min-h-[calc(100vh-300px)] bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-[#0B0E14] dark:text-slate-100">
      <SEO />
      
      {/* Hero Banner Section */}
      {heroBanners?.length > 0 && (
        <section className="mb-12 pt-4">
          <AdCarousel slides={heroBanners} />
        </section>
      )}

      <div className="container mx-auto px-4 max-w-[1240px]">
        {/* Recommended Movies */}
        <section id="now-showing" className="mb-14">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-[22px] md:text-[28px] font-bold tracking-tight">Recommended Movies</h2>
            <button 
              className="text-[#F84464] hover:text-[#e03a58] text-[14px] md:text-[15px] font-semibold flex items-center transition-colors group" 
              onClick={() => navigate('/explore')}
            >
              See All <span className="ml-1 group-hover:translate-x-1 transition-transform">&rsaquo;</span>
            </button>
          </div>
          
          {isLoading ? (
            <ScrollContainer className="py-2 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[150px] sm:w-[180px] md:w-[240px] flex-shrink-0">
                  <MovieCardSkeleton />
                </div>
              ))}
            </ScrollContainer>
          ) : (
            <ScrollContainer className="py-4 gap-6">
              {movies?.length > 0 ? movies.map((m) => (
                <div 
                  key={m._id} 
                  className="w-[150px] sm:w-[180px] md:w-[240px] flex-shrink-0 cursor-pointer group" 
                  onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}
                >
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl shadow-premium bg-slate-200 dark:bg-slate-800">
                    <ImageWithSkeleton 
                      src={m.poster} 
                      alt={m.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                    />
                    {m.rating > 0 && (
                      <div className="absolute bottom-0 left-0 w-full bg-black/90 text-white text-[11px] md:text-[12px] font-medium py-1.5 px-2.5 flex items-center justify-between z-10">
                        <div className="flex items-center gap-1">
                          <span className="text-[#F84464] text-[14px]">★</span>
                          <span>{m.rating.toFixed(1)}/10</span>
                        </div>
                        <span className="text-white/70">50K+ Votes</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-[16px] md:text-[19px] font-semibold mt-4 truncate transition-colors group-hover:text-[#F84464]">{m.title}</h4>
                  <p className="text-[13px] md:text-[15px] text-slate-500 dark:text-slate-400 mt-1 truncate">{m.genre?.join(" • ")}</p>
                </div>
              )) : (
                <div className="w-full text-center py-16 text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50">
                  <p className="text-lg">No movies currently playing in your region.</p>
                </div>
              )}
            </ScrollContainer>
          )}
        </section>

        {/* The Best Of Live Events (Middle Banners) */}
        {middleBanners?.length > 0 && (
          <section className="mb-14">
            <h2 className="text-[22px] md:text-[28px] font-bold tracking-tight mb-6 px-1">The Best Of Live Events</h2>
            <ScrollContainer className="py-2 gap-5 md:gap-8">
              {middleBanners.map((b, idx) => (
                <div key={idx} className="w-[160px] sm:w-[200px] md:w-[250px] flex-shrink-0 cursor-pointer group" onClick={() => b.link && window.open(b.link, "_blank")}>
                  <img src={b.bg} alt={`Event Category ${idx}`} className="w-full aspect-square rounded-2xl object-cover shadow-premium group-hover:shadow-2xl transition-all duration-300" />
                </div>
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>

      {/* Premieres Section (Full Width Dark Theme) */}
      {premieres?.length > 0 && (
        <section id="premieres" className="bg-slate-900 dark:bg-black py-16 my-16 text-white relative overflow-hidden">
          {/* Subtle gradient overlay for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F84464]/10 to-transparent opacity-50"></div>
          <div className="container mx-auto px-4 max-w-[1240px] relative z-10">
            <div className="mb-10 px-1 flex flex-col">
              <h2 className="text-[24px] md:text-[32px] font-bold tracking-tight text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#F84464] flex items-center justify-center text-sm">▶</span>
                Premieres
              </h2>
              <p className="text-[14px] md:text-[16px] text-white/70 mt-2 font-medium">Brand new releases every Friday</p>
            </div>
            
            <ScrollContainer className="py-4 gap-6">
              {premieres.map((m) => (
                <div key={m._id} className="w-[150px] sm:w-[180px] md:w-[240px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-premium">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" loading="lazy" />
                    <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-[#D42A45] to-[#F84464] text-white text-[11px] md:text-[12px] font-bold tracking-wider py-1.5 text-center shadow-md">PREMIERE</div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-[2px]">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border border-white/50 backdrop-blur-md hover:bg-[#F84464]/80 hover:border-[#F84464] transition-colors">
                        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1"><path d="M5 3l14 9-14 9V3z"/></svg>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-[16px] md:text-[19px] font-semibold text-white mt-4 truncate">{m.title}</h4>
                  <p className="text-[13px] md:text-[14px] text-white/60 mt-1 truncate">{Array.isArray(m.language) ? m.language.join(" • ") : m.language}</p>
                </div>
              ))}
            </ScrollContainer>
          </div>
        </section>
      )}

      {/* Events Section */}
      <div className="container mx-auto px-4 max-w-[1240px]">
        {events?.length > 0 && (
          <section id="events" className="mb-14">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-[22px] md:text-[28px] font-bold tracking-tight">Upcoming Events & Activities</h2>
              <button 
                className="text-[#F84464] hover:text-[#e03a58] text-[14px] md:text-[15px] font-semibold flex items-center transition-colors group" 
                onClick={() => navigate('/explore')}
              >
                See All <span className="ml-1 group-hover:translate-x-1 transition-transform">&rsaquo;</span>
              </button>
            </div>
            <ScrollContainer className="py-4 gap-6">
              {events.map((m) => (
                <div key={m._id} className="w-[150px] sm:w-[180px] md:w-[240px] flex-shrink-0 cursor-pointer group" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 shadow-premium">
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
                  </div>
                  <h4 className="text-[16px] md:text-[19px] font-semibold mt-4 truncate transition-colors group-hover:text-[#F84464]">{m.title}</h4>
                  <p className="text-[13px] md:text-[15px] text-slate-500 dark:text-slate-400 mt-1 truncate">{m.genre?.join(" • ")}</p>
                </div>
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>
    </div>
  );
}
