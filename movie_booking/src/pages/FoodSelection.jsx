import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FOOD_MENU = [
  // Bestsellers
  { id: "b1", name: "Samosa 2N", description: "Samosa 2N (249 kcal)", price: 99, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=300", category: "Bestsellers", veg: true },
  { id: "b2", name: "Small Popcorn Combo", description: "Salted Popcorn 50g + Pepsi 300ml", price: 279, image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=300", category: "Bestsellers", veg: true },
  { id: "b3", name: "Veg Sandwich Combo", description: "Veg Sandwich 100g + Pepsi 300ml", price: 209, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=300", category: "Bestsellers", veg: true },

  // Popcorn
  { id: "p1", name: "Regular Salted Popcorn 80g", description: "Regular Salted Popcorn 80g (425 Kcal | Allergens: Milk)", price: 435, image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=300", category: "Popcorn", veg: true },
  { id: "p2", name: "Regular Cheese Popcorn 80g", description: "Regular Cheese Popcorn 80g (423 Kcal | Allergens: Milk)", price: 485, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300", category: "Popcorn", veg: true },
  { id: "p3", name: "Medium Cheese Popcorn 170g", description: "Medium Cheese Popcorn 170g (846 Kcal | Allergens: Milk)", price: 735, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300", category: "Popcorn", veg: true },
  { id: "p4", name: "Combo 1 (Caramel)", description: "Caramel Popcorn 80g + Pepsi 450ml (595 Kcal | Allergens: Soybean, Caffeine)", price: 830, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300", category: "Popcorn", veg: true },

  // Beverages
  { id: "bv1", name: "Regular Pepsi 540ml", description: "Regular Pepsi 540ml (232 Kcal | Allergens: Caffeine)", price: 390, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300", category: "Beverages", veg: true },
  { id: "bv2", name: "Mineral Water", description: "Packaged drinking water (0 Kcal)", price: 50, image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=300", category: "Beverages", veg: true },
  { id: "bv3", name: "Lemon Iced Tea", description: "Refreshing lemon iced tea (120 Kcal | Allergens: None)", price: 170, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=300", category: "Beverages", veg: true },

  // Snacks
  { id: "s1", name: "Nachos With Cheese & Salsa 90g", description: "Nachos With Cheese & Salsa 90g (665 Kcal | Allergens: Milk, Wheat)", price: 420, image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=300", category: "Snacks", veg: true },
  { id: "s2", name: "Veggie Mint Chutney Burger 170g", description: "Veggie Mint Chutney Burger 170g (577 Kcal | Allergens: Milk, Wheat, Soybeans, Gluten)", price: 370, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300", category: "Snacks", veg: true },
  { id: "s3", name: "Crispy Paneer Burger 170g", description: "Crispy Paneer Burger 170g (653 Kcal | Allergens: Milk, Wheat, Soybean, Gluten)", price: 370, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300", category: "Snacks", veg: true },
  { id: "s4", name: "Spicy Grilled Chicken Burger 170g", description: "Spicy Grilled Chicken Burger 170g (669 Kcal | Allergens: Milk, Gluten)", price: 420, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300", category: "Snacks", veg: false },

  // Combos
  { id: "c1", name: "Popcorn & Coke Combo", description: "Medium Salted Popcorn + Regular Fountain Coke (560 Kcal | Allergens: Milk)", price: 350, image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=300", category: "Combos", veg: true },
  { id: "c2", name: "Couple Combo", description: "2 Large Popcorn + 2 Cokes (1200 Kcal | Allergens: Milk)", price: 600, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300", category: "Combos", veg: true },
  { id: "c3", name: "Family Combo", description: "2 Popcorn, 4 Coke, Nachos, Fries (2400 Kcal | Allergens: Milk, Wheat)", price: 999, image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&q=80&w=300", category: "Combos", veg: true },
];

const TABS = ["All", "Bestsellers", "Popcorn", "Beverages", "Snacks", "Combos"];

export default function FoodSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state?.bookingDetails;

  const [cart, setCart] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const handleAdd = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleRemove = (id) => setCart(prev => {
    const n = { ...prev };
    if (n[id] > 1) n[id] -= 1; else delete n[id];
    return n;
  });

  const cartItems = Object.keys(cart).map(id => {
    const item = FOOD_MENU.find(f => f.id === id);
    return { ...item, qty: cart[id] };
  });

  const foodTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const ticketPrice = bookingDetails?.totalAmount || 380;

  const filtered = FOOD_MENU.filter(item => {
    const matchTab = activeTab === "All" || item.category === activeTab;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleProceed = () => {
    navigate("/payment", {
      state: {
        bookingDetails,
        foodItems: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.qty }))
      }
    });
  };

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e2e2", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#333", padding: 0, lineHeight: 1 }}>‹</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
              {bookingDetails?.movieName || "Obsession - English"}
            </div>
            <div style={{ fontSize: 12, color: "#777" }}>
              {bookingDetails?.theater || "PVR: Dynamix, Juhu"} | {bookingDetails?.date || "Wed, 17 June, 2026"} | {bookingDetails?.time || "09:55 AM"}
            </div>
          </div>
        </div>
        <button
          onClick={handleProceed}
          style={{ background: "#F84464", color: "#fff", border: "none", borderRadius: 6, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Skip
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-[1280px] mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

        {/* ── LEFT PANEL ── */}
        <div>

          {/* Header + Search */}
          <div className="bg-white border border-[#e2e2e2] rounded-lg p-4 md:px-5 flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
            <span style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>Grab a Bite!</span>
            <div className="relative flex-1 w-full md:max-w-[440px]">
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 15 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for F&B Items"
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 6, padding: "9px 12px 9px 36px", fontSize: 13, color: "#333", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Promo Banner */}
          <div className="bg-white border border-[#e2e2e2] rounded-lg mb-4 overflow-hidden h-[110px] hidden md:flex items-center relative">
            {/* Red badge */}
            <div style={{ background: "#F84464", color: "#fff", width: 90, height: 90, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginLeft: 20, flexShrink: 0, transform: "rotate(-10deg)" }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>BESTSELLERS</span>
              <span style={{ fontSize: 8, opacity: 0.85 }}>STARTING AT</span>
              <span style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>99</span>
            </div>
            {/* Text */}
            <div style={{ fontWeight: 800, fontSize: 18, color: "#222", letterSpacing: 1, marginLeft: 28 }}>MON TO THU, 9AM TO 6PM</div>
            {/* Tags */}
            <div style={{ position: "absolute", right: 24, display: "flex", gap: 8 }}>
              {["BURGER", "SAMOSA+PEPSI", "SANDWICH"].map(t => (
                <span key={t} style={{ background: "#FFD700", color: "#333", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 2 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ background: "#fff", border: "1px solid #e2e2e2", borderRadius: 8, display: "flex", overflowX: "auto", marginBottom: 16 }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "14px 24px", fontSize: 14, fontWeight: 600, border: "none",
                  borderBottom: activeTab === tab ? "3px solid #F84464" : "3px solid transparent",
                  color: activeTab === tab ? "#F84464" : "#666",
                  background: "none", cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(item => (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #e2e2e2", borderRadius: 10, padding: "16px", display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>

                {/* Veg/Non-veg icon */}
                <div style={{ position: "absolute", top: 14, left: 14, width: 14, height: 14, border: `2px solid ${item.veg ? "#2d8a4e" : "#c0392b"}`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.veg ? "#2d8a4e" : "#c0392b" }} />
                </div>

                {/* Image */}
                <div style={{ width: 110, height: 110, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f8f8f8", border: "1px solid #eee", marginTop: 6 }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#111", lineHeight: 1.3, marginTop: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{item.description}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>₹{item.price}</span>
                    {cart[item.id] ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #F84464", borderRadius: 5, padding: "3px 10px" }}>
                        <button onClick={() => handleRemove(item.id)} style={{ background: "none", border: "none", color: "#F84464", fontSize: 18, fontWeight: 700, cursor: "pointer", lineHeight: 1, padding: 0 }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#F84464", minWidth: 14, textAlign: "center" }}>{cart[item.id]}</span>
                        <button onClick={() => handleAdd(item.id)} style={{ background: "none", border: "none", color: "#F84464", fontSize: 18, fontWeight: 700, cursor: "pointer", lineHeight: 1, padding: 0 }}>+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(item.id)}
                        style={{ border: "1.5px solid #F84464", color: "#F84464", background: "#fff", borderRadius: 5, padding: "5px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ position: "sticky", top: 16 }}>

          {/* Ticket price */}
          <div style={{ background: "#fff", border: "1px solid #e2e2e2", borderRadius: 8, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>Ticket(s) price</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>₹{ticketPrice}.00</span>
          </div>

          {/* Cart panel */}
          <div style={{ background: "#fff", border: "1px solid #e2e2e2", borderRadius: 8, padding: "20px", minHeight: 280 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111", marginBottom: 16 }}>Your Cart</div>

            {cartItems.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16 }}>
                {/* Popcorn SVG illustration */}
                <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="38" width="40" height="42" rx="4" fill="#F84464"/>
                  <rect x="22" y="38" width="36" height="42" rx="4" fill="white" opacity="0.15"/>
                  <rect x="20" y="38" width="40" height="10" rx="2" fill="#c0392b"/>
                  <rect x="28" y="38" width="8" height="42" fill="white" opacity="0.15"/>
                  <rect x="44" y="38" width="8" height="42" fill="white" opacity="0.15"/>
                  <ellipse cx="30" cy="34" rx="8" ry="8" fill="#FFD700"/>
                  <ellipse cx="50" cy="32" rx="9" ry="9" fill="#FFD700"/>
                  <ellipse cx="40" cy="30" rx="7" ry="7" fill="#FFD700"/>
                  <ellipse cx="22" cy="36" rx="6" ry="6" fill="#FFD700"/>
                  <ellipse cx="58" cy="36" rx="6" ry="6" fill="#FFD700"/>
                  <circle cx="30" cy="62" r="4" fill="#F84464" opacity="0.6"/>
                  <circle cx="50" cy="66" r="3" fill="#F84464" opacity="0.5"/>
                  <circle cx="22" cy="72" r="2.5" fill="#F84464" opacity="0.4"/>
                  <circle cx="58" cy="70" r="2.5" fill="#F84464" opacity="0.4"/>
                  <path d="M33 60 Q40 56 47 60" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <circle cx="35" cy="56" r="2" fill="#333"/>
                  <circle cx="45" cy="56" r="2" fill="#333"/>
                </svg>
                <p style={{ fontSize: 13, color: "#999", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>Fill this cart with your<br />favorite food combos!</p>
              </div>
            ) : (
              <div>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>₹{item.price} × {item.qty}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #F84464", borderRadius: 5, padding: "2px 8px" }}>
                      <button onClick={() => handleRemove(item.id)} style={{ background: "none", border: "none", color: "#F84464", fontSize: 16, fontWeight: 700, cursor: "pointer", padding: 0 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#F84464", minWidth: 12, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => handleAdd(item.id)} style={{ background: "none", border: "none", color: "#F84464", fontSize: 16, fontWeight: 700, cursor: "pointer", padding: 0 }}>+</button>
                    </div>
                  </div>
                ))}

                <div style={{ borderTop: "1px solid #eee", paddingTop: 14, marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 6 }}>
                    <span>Food Total</span>
                    <span style={{ fontWeight: 700, color: "#111" }}>₹{foodTotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 6 }}>
                    <span>Ticket(s)</span>
                    <span style={{ fontWeight: 700, color: "#111" }}>₹{ticketPrice}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#111", paddingTop: 8, borderTop: "1px solid #eee" }}>
                    <span>Total</span>
                    <span>₹{foodTotal + ticketPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  style={{ width: "100%", marginTop: 16, background: "#F84464", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  Proceed to Pay · ₹{foodTotal + ticketPrice}
                </button>
              </div>
            )}
          </div>

          {/* Skip button when cart is empty */}
          {cartItems.length === 0 && (
            <button
              onClick={handleProceed}
              style={{ width: "100%", marginTop: 12, background: "#fff", color: "#F84464", border: "1.5px solid #F84464", borderRadius: 6, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Skip & Proceed to Pay · ₹{ticketPrice}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}