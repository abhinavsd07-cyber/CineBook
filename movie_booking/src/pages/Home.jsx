import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNowShowing, getPremieres, getEvents, getBanners } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";
import SEO from "../components/SEO";
import "./Home.css";

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
    <div className="home-page page-wrapper">
      <SEO />
      {/* ── Top Hero Banner Carousel ── */}
      {heroBanners.length > 0 && (
        <section className="mb-8" style={{ background: "var(--clr-bg)" }}>
          <div className="container" style={{ paddingTop: "20px" }}>
            <AdCarousel slides={heroBanners} className="hero-carousel-override" />
          </div>
        </section>
      )}

      <div className="container">
        {/* ── RECOMMENDED MOVIES ── */}
        <section id="now-showing" className="section-movies">
          <div className="section-header">
            <h2 className="section-title">Recommended Movies</h2>
            <button className="see-all-btn">See All &rsaquo;</button>
          </div>
          {loading ? (
            <ScrollContainer className="movie-grid h-scroll">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width: "220px", flexShrink: 0 }}>
                  <MovieCardSkeleton />
                </div>
              ))}
            </ScrollContainer>
          ) : (
            <ScrollContainer className="movie-grid h-scroll">
              {movies.length > 0 ? movies.map((m) => (
                <div key={m._id} className="bms-movie-card" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="poster-wrapper">
                    <img src={m.poster} alt={m.title} className="poster-img" loading="lazy" />
                    {m.rating > 0 && (
                      <div className="rating-bar">
                        ⭐ {m.rating.toFixed(1)} / 10 <span className="votes">50K+ Votes</span>
                      </div>
                    )}
                  </div>
                  <h4 className="title">{m.title}</h4>
                  <p className="genre">{m.genre?.join("/")}</p>
                </div>
              )) : (
                <div className="empty-state">
                  <p>No movies currently playing in your region.</p>
                </div>
              )}
            </ScrollContainer>
          )}
        </section>

        {/* ── STREAM AD BANNER ── */}
        <section className="stream-ad-banner mt-8" style={{ cursor: "pointer" }} onClick={() => navigate('/explore')}>
          <img src="https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-1440,h-120:q-80/stream-leadin-web-collection-202210241242.png" alt="Stream" style={{ width: "100%", borderRadius: "10px" }} />
        </section>

        {/* ── THE BEST OF LIVE EVENTS (Middle Banners) ── */}
        {middleBanners.length > 0 && (
          <section className="section-movies mt-8">
            <div className="section-header">
              <h2 className="section-title">The Best Of Live Events</h2>
            </div>
            <ScrollContainer className="movie-grid h-scroll" style={{ gap: "24px" }}>
              {middleBanners.map((b, idx) => (
                <div key={idx} style={{ minWidth: "224px", width: "224px", flexShrink: 0, cursor: "pointer" }} onClick={() => b.link && window.open(b.link, "_blank")}>
                  <img src={b.bg} alt={`Event Category ${idx}`} style={{ width: "100%", height: "224px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", display: "block" }} />
                </div>
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>

      {/* ── PREMIERES (Full Width Section) ── */}
      {premieres.length > 0 && (
        <section id="premieres" className="section-movies mt-8" style={{ background: "#2B3149", padding: "40px 0", color: "white" }}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title" style={{ color: "white" }}>Premieres</h2>
              <p className="section-subtitle" style={{ color: "#aaa" }}>Brand new releases every Friday</p>
            </div>
            <ScrollContainer className="movie-grid h-scroll">
              {premieres.map((m) => (
                <div key={m._id} className="bms-movie-card" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="poster-wrapper">
                    <img src={m.poster} alt={m.title} className="poster-img" loading="lazy" />
                    <div className="premiere-badge">PREMIERE</div>
                  </div>
                  <h4 className="title" style={{ color: "white" }}>{m.title}</h4>
                  <p className="genre" style={{ color: "#aaa" }}>{Array.isArray(m.language) ? m.language.join(", ") : m.language}</p>
                </div>
              ))}
            </ScrollContainer>
          </div>
        </section>
      )}

      <div className="container">

        {/* ── EVENTS ── */}
        {events.length > 0 && (
          <section id="events" className="section-movies mt-8">
            <div className="section-header">
              <h2 className="section-title">Upcoming Events & Activities</h2>
              <button className="see-all-btn">See All &rsaquo;</button>
            </div>
            <ScrollContainer className="movie-grid h-scroll">
              {events.map((m) => (
                <div key={m._id} className="bms-movie-card" onClick={() => navigate(m.itemType === 'event' ? `/events/${m._id}` : `/movie/${m._id}`)}>
                  <div className="poster-wrapper">
                    <img src={m.poster} alt={m.title} className="poster-img" loading="lazy" />
                  </div>
                  <h4 className="title">{m.title}</h4>
                  <p className="genre">{m.genre?.join("/")}</p>
                </div>
              ))}
            </ScrollContainer>
          </section>
        )}
      </div>
    </div>
  );
}
