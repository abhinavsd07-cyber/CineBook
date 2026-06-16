import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPremieres } from "../config/allApis";
import SEO from "../components/SEO";
import "./Stream.css";

export default function Stream() {
  const [premieres, setPremieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchStreamData = async () => {
      try {
        const res = await getPremieres();
        if (active) setPremieres(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStreamData();
    return () => { active = false; };
  }, []);

  return (
    <div className="stream-page page-wrapper">
      <SEO title="Stream - Rent or Buy Latest Movies | Book My Show" />
      
      <section className="stream-hero">
        <div className="stream-hero-overlay" />
        <div className="container stream-hero-content">
          <h1 className="stream-hero-title">BMS Stream</h1>
          <p className="stream-hero-subtitle">Brand new releases every Friday. Rent or Buy.</p>
        </div>
      </section>

      <div className="container" style={{ position: "relative", zIndex: 3, marginTop: "-40px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "10px" }}>Premiering Now</h2>
        <p style={{ color: "#aaa", marginBottom: "30px" }}>Watch the latest movies from the comfort of your home</p>
        
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="stream-grid">
            {premieres.length > 0 ? (
              premieres.map((m) => (
                <div key={m._id} className="stream-movie-card" onClick={() => navigate(`/movie/${m._id}`)}>
                  <div className="stream-poster-wrapper">
                    <img src={m.poster} alt={m.title} className="stream-poster" loading="lazy" />
                    <div className="stream-premiere-badge">PREMIERE</div>
                  </div>
                  <h4 className="stream-movie-title">{m.title}</h4>
                  <p className="stream-movie-lang">{Array.isArray(m.language) ? m.language.join(", ") : m.language}</p>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#aaa" }}>
                No Premieres available right now. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
