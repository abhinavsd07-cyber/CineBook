import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShowsByMovie, getMovieById } from "../config/allApis";
import { useLocationContext } from "../context/LocationContext";
import "./TheatreSelection.css";

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

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [qty, setQty] = useState(2);
  const [selectedShow, setSelectedShow] = useState(null);

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
    <div className="ts-page page-wrapper">
      {/* ── Movie Info Bar ── */}
      {movie && (
        <div className="ts-movie-bar">
          <div className="container ts-movie-bar-inner">
            <h1 className="ts-movie-title">{movie.title}</h1>
            <div className="ts-movie-tags">
              <span className="ts-tag">{movie.genre?.join(", ")}</span>
              <span className="ts-tag tag-lang">{movie.language}</span>
              <span className="ts-tag tag-format">2D, 3D</span>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* ── Filter & Date Strip ── */}
        <div className="ts-filters-strip">
          <div className="ts-date-scroll">
            {DAYS.map((d, i) => (
              <button
                key={i}
                className={`ts-date-btn ${i === selectedDate ? "active" : ""}`}
                onClick={() => setSelectedDate(i)}
              >
                <div className="date-month">{d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</div>
                <div className="date-num">{d.getDate()}</div>
                <div className="date-day">{d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="ts-legend">
          <span className="legend-item"><span className="dot dot-avail"></span> Available</span>
          <span className="legend-item"><span className="dot dot-fast"></span> Fast Filling</span>
        </div>

        {/* ── Theatres List ── */}
        {loading ? (
          <div className="page-loader" style={{ minHeight: "300px" }}><div className="spinner" /></div>
        ) : theatreData.length === 0 ? (
          <div className="ts-empty">
            <h3>No Shows Available</h3>
            <p>Try selecting a different date for this movie.</p>
          </div>
        ) : (
          <div className="ts-list">
            {theatreData.map(({ theatre, shows }) => (
              <div key={theatre._id} className="ts-row">
                {/* Theatre Header */}
                <div className="ts-theatre-info">
                  <h4 className="ts-theatre-name" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <span><span className="heart-icon">🤍</span> {theatre.name}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${theatre.name} ${theatre.location || ''} ${theatre.city || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem", padding: "4px 8px", color: "var(--clr-text-muted)", borderColor: "var(--clr-border)" }}
                    >
                      Get Directions 🗺️
                    </a>
                  </h4>
                  <div className="ts-amenities">
                    <span className="amenity">{theatre.location || theatre.city}</span>
                    {theatre.amenities?.map((a) => <span key={a} className="amenity">{a}</span>)}
                  </div>
                </div>

                {/* Shows List */}
                <div className="ts-shows-container">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      className="ts-show-pill"
                      onClick={() => {
                        setSelectedShow({ theatreId: theatre._id, showId: show._id });
                        setShowModal(true);
                      }}
                    >
                      <div className="time">{format12Hour(show.time)}</div>
                      <div className="format">{show.format}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Ticket Quantity Modal ── */}
      {showModal && (
        <div className="qty-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="qty-modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="qty-title">How Many Tickets?</h3>
            <div className="qty-vehicle-icon">
              {qty === 1 ? "🚲" : qty === 2 ? "🛵" : qty <= 4 ? "🚗" : "🚌"}
            </div>
            <div className="qty-selectors">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  className={`qty-btn ${qty === n ? "active" : ""}`}
                  onClick={() => setQty(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="qty-footer">
              <button 
                className="btn btn-primary w-full btn-lg"
                onClick={() => {
                  setShowModal(false);
                  // Pass the selected quantity in the navigation state
                  navigate(`/seat/${movieId}/${selectedShow.theatreId}/${selectedShow.showId}`, { state: { qty } });
                }}
              >
                Select Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
