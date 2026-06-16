import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../config/allApis";
import SEO from "../components/SEO";
import "./EventTicketSelection.css";

export default function EventTicketSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock Ticket Tiers for Events
  const [tiers, setTiers] = useState([
    { id: "t1", name: "General Admission", price: 500, desc: "Entry to the main standing area.", count: 0 },
    { id: "t2", name: "VIP Pass", price: 1500, desc: "Fast-track entry and access to VIP lounge.", count: 0 },
    { id: "t3", name: "Meet & Greet", price: 3000, desc: "Includes VIP Pass + backstage photo op.", count: 0 }
  ]);

  useEffect(() => {
    getMovieById(id)
      .then((res) => {
        const data = res.data.data;
        if (data.itemType !== "event") navigate("/");
        setEvent(data);
        
        // Dynamically adjust prices based on basePrice if it exists
        if (data.basePrice) {
          setTiers([
            { id: "t1", name: "General Admission", price: data.basePrice, desc: "Entry to the main standing area.", count: 0 },
            { id: "t2", name: "VIP Pass", price: data.basePrice * 3, desc: "Fast-track entry and access to VIP lounge.", count: 0 },
            { id: "t3", name: "Meet & Greet", price: data.basePrice * 6, desc: "Includes VIP Pass + backstage photo op.", count: 0 }
          ]);
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateCount = (tierId, delta) => {
    setTiers(tiers.map(t => {
      if (t.id === tierId) {
        const newCount = Math.max(0, Math.min(10, t.count + delta));
        return { ...t, count: newCount };
      }
      return t;
    }));
  };

  const selectedTiers = tiers.filter(t => t.count > 0);
  const totalTickets = selectedTiers.reduce((acc, t) => acc + t.count, 0);
  const totalAmount = selectedTiers.reduce((acc, t) => acc + (t.price * t.count), 0);

  const handleProceed = () => {
    if (totalTickets === 0) return;
    
    // Construct mock selectedSeats payload for Payment compatibility
    const selectedSeats = [];
    selectedTiers.forEach(t => {
      for(let i = 0; i < t.count; i++) {
        selectedSeats.push({ id: `${t.name} Ticket ${i+1}`, type: t.name });
      }
    });

    // We pass itemId so Payment.jsx handles it as an event item
    navigate("/payment", {
      state: {
        bookingDetails: {
          itemId: event._id,
          isEvent: true,
          eventItem: event,
          selectedSeats,
          totalAmount
        }
      }
    });
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!event) return null;

  return (
    <div className="event-tickets-page">
      <SEO title={`Tickets for ${event.title} | Book My Show`} />
      
      <div className="event-header-banner">
        <div className="container">
          <h1 className="event-title-sm">{event.title}</h1>
          <p className="event-meta-sm">
            {Array.isArray(event.genre) ? event.genre.join(" | ") : event.genre} • {Array.isArray(event.language) ? event.language.join(", ") : event.language} • Live Event
          </p>
        </div>
      </div>

      <div className="container event-content">
        <div className="event-tiers-section">
          <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "20px" }}>Select Tickets</h2>
          
          {tiers.map(tier => (
            <div className="tier-card" key={tier.id}>
              <div className="tier-info">
                <h4>{tier.name}</h4>
                <div className="tier-price">Rs. {tier.price}</div>
                <div className="tier-desc">{tier.desc}</div>
              </div>
              <div className="tier-controls">
                <button className="tier-btn" onClick={() => updateCount(tier.id, -1)} disabled={tier.count === 0}>-</button>
                <span className="tier-count">{tier.count}</span>
                <button className="tier-btn" onClick={() => updateCount(tier.id, 1)} disabled={tier.count >= 10}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="event-summary-section">
          <div className="summary-card">
            <h3 className="summary-title">Booking Summary</h3>
            
            {selectedTiers.length === 0 ? (
              <p style={{ color: "#888", textAlign: "center", padding: "20px 0" }}>No tickets selected</p>
            ) : (
              <>
                {selectedTiers.map(t => (
                  <div className="summary-row" key={t.id}>
                    <span>{t.count}x {t.name}</span>
                    <span>Rs. {t.price * t.count}</span>
                  </div>
                ))}
                
                <div className="summary-total">
                  <span>Total Payable</span>
                  <span>Rs. {totalAmount}</span>
                </div>

                <button 
                  className="btn btn-primary w-full mt-6" 
                  onClick={handleProceed}
                  style={{ padding: "12px", fontSize: "1.1rem" }}
                >
                  Proceed
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
