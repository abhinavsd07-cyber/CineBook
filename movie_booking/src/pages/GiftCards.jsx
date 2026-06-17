import { useState } from "react";

const FILTERS = ["All", "Entertaining Gifts", "Bestie Gifts", "Made with Love"];

const GIFT_CARDS = [
  { id: 1, label: ["Best", "Partner!"], bg: "linear-gradient(135deg,#1a4a30 0%,#2d7a50 100%)", category: "Entertaining Gifts", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 2, label: ["Best", "Bestie!"], bg: "linear-gradient(135deg,#162040 0%,#1e3a6e 100%)", category: "Bestie Gifts", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 3, label: ["My Support", "System!"], bg: "linear-gradient(135deg,#c0392b 0%,#e74c3c 100%)", category: "Bestie Gifts", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 4, label: ["Besties,", "Forever!"], bg: "linear-gradient(135deg,#1a1a2e 0%,#2d2d4e 100%)", category: "Bestie Gifts", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 5, label: ["Dream", "Team!"], bg: "linear-gradient(135deg,#2c2c54,#40407a)", category: "Entertaining Gifts", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 6, label: ["You're", "Amazing!"], bg: "linear-gradient(135deg,#1a4a20,#2d8040)", category: "Made with Love", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 7, label: ["With", "Love!"], bg: "linear-gradient(135deg,#6a1a7a,#9b59b6)", category: "Made with Love", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
  { id: 8, label: ["Just", "for You!"], bg: "linear-gradient(135deg,#e44d26,#f5a623)", category: "Made with Love", image: "https://in.bmscdn.com/gv/gift_my_show_09272025102721_480x295.jpg" },
];

export default function BookMyShowGiftCards() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("egift");

  const filtered = activeFilter === "All"
    ? GIFT_CARDS
    : GIFT_CARDS.filter((c) => c.category === activeFilter);

  return (
    <div style={{ fontFamily: "sans-serif", background: "#f2f2f2", minHeight: "100vh" }}>
      {/* Top Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          book<span style={{ color: "#e5373a", fontStyle: "italic" }}>my</span>show
        </div>
        <input
          placeholder="Search for Movies, Events, Plays, Sports and Activities"
          style={{ flex: 1, maxWidth: 480, height: 36, border: "1px solid #ddd", borderRadius: 4, padding: "0 12px", fontSize: 13, color: "#777", background: "#fafafa", outline: "none" }}
        />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ fontWeight: 500 }}>Mumbai ▾</span>
          <span style={{ fontSize: 26, color: "#aaa" }}>⊙</span>
          <span>Hi, Abhinav …</span>
        </div>
      </div>

      {/* Sub Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 44 }}>
        <div style={{ display: "flex", gap: 28 }}>
          {["Movies", "Stream", "Events", "Plays", "Sports", "Activities"].map((item) => (
            <span key={item} style={{ fontSize: 13, color: "#555", lineHeight: "44px", cursor: "pointer" }}>{item}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#555" }}>
          <span>ListYourShow</span>
          <span>Corporates</span>
          <span>Offers</span>
          <span style={{ color: "#e5373a", fontWeight: 600 }}>Gift Cards</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", justifyContent: "center", padding: "24px 24px 0" }}>
        {[{ key: "egift", label: "E-GIFT CARDS" }, { key: "physical", label: "PHYSICAL GIFT CARDS" }].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              width: 220, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 600,
              letterSpacing: "0.5px", border: "1px solid #bbb", cursor: "pointer",
              background: "#fff", color: activeTab === key ? "#222" : "#999",
              borderRight: key === "egift" ? "none" : undefined,
              borderRadius: key === "egift" ? "4px 0 0 4px" : "0 4px 4px 0",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ paddingBottom: 32 }}>
        <p style={{ textAlign: "center", fontSize: 18, fontWeight: 400, color: "#333", margin: "28px 0 18px" }}>
          Pick a card from one of our themes
        </p>

        {/* Filter Pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "7px 18px", borderRadius: 999, border: "1px solid #ddd",
                background: activeFilter === f ? "#e5373a" : "#fff",
                color: activeFilter === f ? "#fff" : "#555",
                fontSize: 13, cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "0 24px" }}>
          {filtered.map((card) => (
            <div
              key={card.id}
              style={{ borderRadius: 8, overflow: "hidden", cursor: "pointer", aspectRatio: "1.6 / 1", background: card.bg, position: "relative" }}
            >
              <img
                src={card.image}
                alt={card.label.join(" ")}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}