import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../config/allApis";
import SEO from "../components/SEO";

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
    
    const selectedSeats = [];
    selectedTiers.forEach(t => {
      for(let i = 0; i < t.count; i++) {
        selectedSeats.push({ id: `${t.name} Ticket ${i+1}`, type: t.name });
      }
    });

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

  if (loading) return (
    <div className="flex justify-center items-center py-48 bg-bms-bg min-h-[80vh]">
      <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
    </div>
  );
  if (!event) return null;

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <SEO title={`Tickets for ${event.title} | Book My Show`} />
      
      <div className="bg-[#1A202C] dark:bg-[#0E121A] text-white py-6 mb-8 border-b border-white/5">
        <div className="container">
          <h1 className="text-xl md:text-2xl font-bold text-white px-2">{event.title}</h1>
          <p className="text-xs text-slate-300 mt-1 px-2">
            {Array.isArray(event.genre) ? event.genre.join(" | ") : event.genre} • {Array.isArray(event.language) ? event.language.join(", ") : event.language} • Live Event
          </p>
        </div>
      </div>

      <div className="container flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full flex flex-col gap-4">
          <h2 className="text-base md:text-lg font-bold text-bms-text mb-2 px-2">Select Tickets</h2>
          
          {tiers.map(tier => (
            <div className="bg-bms-surface border border-bms-border rounded-xl p-5 shadow-sm flex items-center justify-between gap-6 hover:shadow-md transition-shadow duration-200" key={tier.id}>
              <div className="flex-grow">
                <h4 className="text-base font-bold text-bms-text">{tier.name}</h4>
                <div className="text-sm font-semibold text-bms-text mt-1">Rs. {tier.price}</div>
                <div className="text-xs text-bms-text-muted mt-0.5">{tier.desc}</div>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-full border border-bms-border hover:border-bms-accent text-bms-text font-bold flex items-center justify-center cursor-pointer transition-colors duration-150" onClick={() => updateCount(tier.id, -1)} disabled={tier.count === 0}>-</button>
                <span className="font-bold text-sm text-bms-text w-5 text-center">{tier.count}</span>
                <button className="w-8 h-8 rounded-full border border-bms-border hover:border-bms-accent text-bms-text font-bold flex items-center justify-center cursor-pointer transition-colors duration-150" onClick={() => updateCount(tier.id, 1)} disabled={tier.count >= 10}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-[130px]">
          <div className="bg-bms-surface border border-bms-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-base md:text-lg font-bold text-bms-text mb-4">Booking Summary</h3>
            
            {selectedTiers.length === 0 ? (
              <p className="text-bms-text-dim text-center py-6 text-sm">No tickets selected</p>
            ) : (
              <>
                {selectedTiers.map(t => (
                  <div className="flex justify-between items-center text-sm font-semibold text-bms-text mb-2.5 last:mb-0" key={t.id}>
                    <span>{t.count}x {t.name}</span>
                    <span>Rs. {t.price * t.count}</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center text-base md:text-lg font-bold text-bms-text border-t border-bms-border/50 pt-4 mt-4">
                  <span>Total Payable</span>
                  <span>Rs. {totalAmount}</span>
                </div>

                <button 
                  className="bg-bms-accent hover:bg-bms-accent-hover text-white py-3 rounded-lg font-bold w-full shadow-lg transition-all duration-200 cursor-pointer border-none mt-6" 
                  onClick={handleProceed}
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
