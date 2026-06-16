import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../config/allApis";
import { FaShareAlt, FaCalendarAlt, FaRegClock, FaHourglassHalf, FaUsers, FaLanguage, FaMusic } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import SEO from "../components/SEO";
import "./EventDetails.css";

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
          // If it's somehow not an event, send back to movies page
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

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!event) return null;

  // Use real event data from database, with fallbacks if not yet entered
  const formattedDate = event.releaseDate 
    ? new Date(event.releaseDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) 
    : "Date TBA";
  
  const displayTime = event.eventTime || "Time TBA";
  const displayAgeGroups = event.eventAgeGroups || "All age groups";
  const displayCategories = event.genre && event.genre.length > 0 ? event.genre.join(", ") : "Various";
  const displayLocation = event.eventLocation || "Venue TBA";
  const priceDisplay = event.basePrice ? `₹${event.basePrice} onwards` : "Free / TBA";

  // Prefer backdrop for wide landscape, fallback to poster
  const displayImage = event.backdrop || event.poster;

  return (
    <div className="event-details-page page-wrapper">
      <SEO title={`${event.title} Tickets | Book My Show`} />

      <div className="event-details-header">
        <div className="container">
          
          <h1 className="event-details-title">
            {event.title}
            <button className="share-btn"><FaShareAlt /></button>
          </h1>

          <div className="event-hero-grid">
            <div className="event-hero-img-col">
              <img src={displayImage} alt={event.title} className="event-landscape-img" />
            </div>
            
            <div className="event-hero-info-col">
              <div className="event-info-card">
                
                <div className="info-row">
                  <FaCalendarAlt className="info-icon" />
                  <div className="info-content">{formattedDate}</div>
                </div>

                <div className="info-row">
                  <FaRegClock className="info-icon" />
                  <div className="info-content">{displayTime}</div>
                </div>

                <div className="info-row">
                  <FaHourglassHalf className="info-icon" />
                  <div className="info-content">{event.duration || "Duration TBA"}</div>
                </div>

                <div className="info-row">
                  <FaUsers className="info-icon" />
                  <div className="info-content">{displayAgeGroups}</div>
                </div>

                <div className="info-row">
                  <FaLanguage className="info-icon" />
                  <div className="info-content">{Array.isArray(event.language) ? event.language.join(", ") : event.language || "Language TBA"}</div>
                </div>

                <div className="info-row">
                  <FaMusic className="info-icon" />
                  <div className="info-content">{displayCategories}</div>
                </div>

                <div className="info-row">
                  <FaLocationDot className="info-icon" />
                  <div className="info-content" style={{ color: "var(--clr-primary)", cursor: "pointer" }}>
                    {displayLocation} 
                    <span style={{ fontSize: "0.8rem", marginLeft: "5px" }}>↗</span>
                  </div>
                </div>

                <div className="event-card-divider" />

                <div className="event-price-booking">
                  <div className="event-price">
                    <h3>{priceDisplay}</h3>
                    <p>Filling Fast</p>
                  </div>
                  <button 
                    className="btn btn-primary btn-lg" 
                    style={{ padding: "12px 30px" }}
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
        <section className="event-desc-section">
          <h2>About</h2>
          <p>{event.description}</p>
        </section>
      </div>
      
    </div>
  );
}
