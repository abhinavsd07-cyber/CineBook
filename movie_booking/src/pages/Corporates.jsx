import React, { useState, useRef } from "react";
import SEO from "../components/SEO";

/* ── Partner logos ── */
const partners = [
  { name: "HP",        src: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
  { name: "OLA",       src: "https://1000logos.net/wp-content/uploads/2022/08/Ola-Cabs-Symbol.png" },
  { name: "Axis Bank", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Axis_Bank_logo.svg/3840px-Axis_Bank_logo.svg.png" },
  { name: "Mastercard",src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
  { name: "ICICI Bank",src: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg" },
];

const stats = [
  { value: "1000+",      label: "Cities" },
  { value: "6000",       label: "Screens" },
  { value: "1000+",      label: "Corporates\nWho Trust Us" },
  { value: "15 Million+",label: "Tickets Sold\nPer Month" },
  { value: "4 Billion",  label: "Page Views\nPer Month" },
];

const features = [
  {
    tag: "What's in it for you",
    title: "Brand Promotions",
    desc: "Gifting entertainment is a fun way to push your brand's message. And the ways you can use vouchers are endless. For example, upselling celebrity-endorsed products timed with a movie release.",
    cta: "Promote your brand",
    img: "https://images.unsplash.com/photo-1624969862644-791f3dc98927?w=600&q=80",
    imgLeft: false,
  },
  {
    title: "Employee Engagement Recognition & Rewards",
    desc: "Show your clients and employees some appreciation by gifting them our products.",
    cta: "Engage your employees",
    img: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=600&q=80",
    imgLeft: true,
  },
  {
    title: "Lead Generation",
    desc: "Get positive referrals, keep existing customers and trigger change management.",
    cta: "Improve leads",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    imgLeft: false,
  },
  {
    title: "Loyalty",
    desc: "Keep customers firmly in your corner by rewarding them with promotional vouchers.",
    cta: "Retain your customers",
    img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    imgLeft: true,
  },
  {
    title: "Corporate Gifting",
    desc: "From stand-up comedy and sporting activities to movies and plays, we've got all the entertainment worth gifting to your patrons.",
    cta: "Explore solutions",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    imgLeft: false,
  },
];

const services = [
  { title: "End-to-End Creative Support", bg: "#4CAF50" },
  { title: "Marketing & E-mail Guidance", bg: "#E8334A" },
  { title: "Bulk SMS Communication",      bg: "#F5A623" },
];

const campaigns = [
  { brand: "Honda",    img: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=300&q=80" },
  { brand: "Subway",   img: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300&q=80" },
  { brand: "Lenovo",   img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80" },
  { brand: "Croma",    img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80" },
  { brand: "OLA",      img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&q=80" },
  { brand: "Airtel",   img: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=300&q=80" },
];

const testimonials = [
  {
    logo:    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbTzUJPSAvoEo0UZiszCqfd_jM4OgA0F5HEGxRedsxk-OCWt6G3NMeN0Oi&s=10",
    logoAlt: "Club Mahindra",
    quote:   "\"As a token of our appreciation to the prospects who visit our Holiday World, we offer them cineBook vouchers. These vouchers help us further reinforce our core thought of creating Magical Moments for them and instantly put a smile on their faces\"",
    name:    "Abhijeet Ghosh,",
    role:    "Regional Marketing Manager",
    company: "Mahindra Holidays and Resorts India Ltd",
  },
  {
    logo:    "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
    logoAlt: "HP",
    quote:   "\"cineBook vouchers have proven to be a fantastic tool for our employee engagement program. The variety of experiences available ensures everyone finds something they enjoy.\"",
    name:    "Priya Sharma,",
    role:    "HR Director",
    company: "HP India Pvt Ltd",
  },
  {
    logo:    "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg",
    logoAlt: "ICICI Bank",
    quote:   "\"Our customers love the flexibility of cineBook gift vouchers. It has become our go-to reward for premium cardholders and has significantly boosted customer loyalty.\"",
    name:    "Rahul Mehta,",
    role:    "VP Marketing",
    company: "ICICI Bank",
  },
];

const faqGeneral = [
  "How will cineBook help grow my business?",
  "Whom should I use the cineBook vouchers for?",
  "Why are Incentives Important?",
  "Where can the customers redeem the vouchers?",
  "What are the flexibility options for your service?",
  "If I have multiple admits on the voucher, can I split them?",
  "Can I use these vouchers in any city of India?",
  "Who can redeem the voucher?",
];

const faqLogistic = [
  "Where can one redeem a Gift Voucher?",
  "Where can one redeem the WinPin voucher?",
  "Where can one redeem the Movie Pack voucher?",
  "For any concern & escalations, whom do I contact?",
];

const faqPayment = [
  "What is the mode of payment?",
  "How do I arrange for a larger corporate order? Whom do I contact for more information regarding this?",
];

/* ── Callback Form ── */
function CallbackForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", mobile: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  if (sent) return (
    <div className="corp-form-card" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>OK</div>
      <h3 style={{ color: "#333", marginTop: 12 }}>Thank you!</h3>
      <p style={{ color: "#666", marginTop: 8 }}>We will get back to you shortly.</p>
    </div>
  );

  return (
    <form className="corp-form-card" onSubmit={handleSubmit}>
      <div className="corp-field">
        <label className="corp-label">* Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="corp-input" />
      </div>
      <div className="corp-field">
        <label className="corp-label">* Company Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Company Email" required className="corp-input" />
      </div>
      <div className="corp-field">
        <label className="corp-label">* Company Name</label>
        <input name="company" value={form.company} onChange={handleChange} placeholder="Company Name" required className="corp-input" />
      </div>
      <div className="corp-field">
        <label className="corp-label">* Mobile Number</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="corp-flag">+91</span>
          <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="eg: 91480XXXXX" required className="corp-input" style={{ flex: 1 }} />
        </div>
      </div>
      <button type="submit" className="corp-submit-btn">Receive a callback</button>
    </form>
  );
}

/* ── Campaign Scroll ── */
function CampaignScroll() {
  const ref = useRef(null);
  const scroll = (dir) => { if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: "smooth" }); };
  return (
    <div style={{ position: "relative" }}>
      <button className="corp-scroll-btn corp-scroll-btn--left" onClick={() => scroll(-1)}>&#8249;</button>
      <div ref={ref} className="corp-campaign-track">
        {campaigns.map((c, i) => (
          <div key={i} className="corp-campaign-card">
            <img src={c.img} alt={c.brand} />
          </div>
        ))}
      </div>
      <button className="corp-scroll-btn corp-scroll-btn--right" onClick={() => scroll(1)}>&#8250;</button>
    </div>
  );
}

/* ── Testimonials Carousel ── */
function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const total = testimonials.length;
  const prev = () => setIdx((idx - 1 + total) % total);
  const next = () => setIdx((idx + 1) % total);
  const t = testimonials[idx];
  return (
    <div className="corp-testimonial-wrap">
      <button className="corp-testi-arrow corp-testi-arrow--left" onClick={prev}>&#8249;</button>
      <div className="corp-testimonial-card">
        <div className="corp-testi-logo">
          <img src={t.logo} alt={t.logoAlt} />
        </div>
        <div className="corp-testi-body">
          <p className="corp-testi-quote">{t.quote}</p>
          <p className="corp-testi-name">{t.name}</p>
          <p className="corp-testi-role">{t.role}</p>
          <p className="corp-testi-company">{t.company}</p>
        </div>
      </div>
      <button className="corp-testi-arrow corp-testi-arrow--right" onClick={next}>&#8250;</button>
    </div>
  );
}

/* ── FAQ Group ── */
function FaqGroup({ title, items }) {
  return (
    <div className="corp-faq-group">
      <h3 className="corp-faq-group-title">{title}</h3>
      {items.map((q, i) => (
        <div key={i} className="corp-faq-item">
          <a href="#!" className="corp-faq-q">{q}</a>
          {i < items.length - 1 && <hr className="corp-faq-hr" />}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Corporates() {
  return (
    <div className="corp-page">
      <SEO
        title="Corporate Gifting and Vouchers | cineBook Clone"
        description="Entertainment gifting, brand promotions, employee recognition and rewards for corporates."
      />

      {/* HERO */}
      <section className="corp-hero">
        <div className="corp-hero-overlay" />
        <div className="corp-hero-content">
          <div className="corp-hero-left">
            <h1 className="corp-hero-h1">Entertainment you can gift.</h1>
            <p className="corp-hero-sub">
              A variety of solutions to skyrocket your business with vouchers,
              promotions, loyalty, employee recognition and rewards.
            </p>
            <div className="corp-hero-btns">
              <button className="corp-ghost-btn"><span style={{ marginRight: 6 }}>&#9654;</span> Watch video</button>
              <button className="corp-ghost-btn"><span style={{ marginRight: 6 }}>&#8659;</span> Download Brochure</button>
            </div>
          </div>
          <div className="corp-hero-right"><CallbackForm /></div>
        </div>
      </section>

      {/* OUR PARTNERS */}
      <section className="corp-section corp-partners-section">
        <p className="corp-section-tag">OUR PARTNERS</p>
        <div className="corp-partners-row">
          {partners.map((p) => <img key={p.name} src={p.src} alt={p.name} className="corp-partner-logo" />)}
        </div>
      </section>

      {/* STATS */}
      <section className="corp-stats-section">
        {stats.map((s) => (
          <div key={s.label} className="corp-stat">
            <span className="corp-stat-value">{s.value}</span>
            <span className="corp-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* FEATURE SECTIONS */}
      {features.map((f, i) => (
        <section key={i} className={"corp-feature " + (f.imgLeft ? "corp-feature--img-left" : "corp-feature--img-right")}>
          <div className="corp-feature-text">
            {f.tag && <p className="corp-feature-tag">{f.tag.toUpperCase()}</p>}
            <h2 className="corp-feature-title">{f.title}</h2>
            <p className="corp-feature-desc">{f.desc}</p>
            <button className="corp-outline-btn">{f.cta}</button>
          </div>
          <div className="corp-feature-img"><img src={f.img} alt={f.title} /></div>
        </section>
      ))}

      {/* SERVICES GRID */}
      <section className="corp-services-grid">
        {services.map((s) => (
          <div key={s.title} className="corp-service-box" style={{ background: s.bg }}>
            <h3>{s.title}</h3>
          </div>
        ))}
      </section>

      {/* CTA BANNER */}
      <section className="corp-cta-banner">
        <p>Get priority support from the experts in the entertainment industry.</p>
        <button className="corp-cta-btn">Access the complete suite</button>
      </section>

      {/* CAMPAIGNS */}
      <section className="corp-section" style={{ paddingBottom: 48 }}>
        <p className="corp-section-tag" style={{ textAlign: "left", marginBottom: 20 }}>CAMPAIGNS WE ARE PROUD OF</p>
        <CampaignScroll />
      </section>

      {/* OUR PRODUCTS */}
      <div style={{ background: "#fff", borderTop: "1px solid #eee", padding: "32px 60px 0" }}>
        <p className="corp-section-tag" style={{ textAlign: "left" }}>OUR PRODUCTS</p>
      </div>
      <section className="corp-products-grid">
        <div className="corp-product-card corp-product-card--red">
          <div className="corp-product-bg-icon">&#127916;</div>
          <h3 className="corp-product-title">Movie Vouchers</h3>
          <p className="corp-product-desc">
            Highly customizable, single usage, promotional codes in the form of
            set amount / value or a percentage of discount on the ticket cost.
            An ideal suit for movie and product promotions, consumer activation and countless more!
          </p>
          <button className="corp-product-enquire">Enquire</button>
        </div>
        <div className="corp-product-card corp-product-card--dark">
          <div className="corp-product-bg-icon">&#127873;</div>
          <h3 className="corp-product-title">Gift Vouchers</h3>
          <p className="corp-product-desc">
            Amazing little pre-loaded cash cards which can be used to purchase tickets
            across all categories for 6 months. Be it employee rewards, trade channel
            incentive or consumer engagement, a gift voucher fits all.
          </p>
          <button className="corp-product-enquire">Enquire</button>
        </div>
      </section>

      {/* BULK BOOKING BANNER */}
      <section className="corp-bulk-banner">
        <div className="corp-bulk-overlay" />
        <div className="corp-bulk-content">
          <div className="corp-bulk-left">
            <p className="corp-bulk-tag">Bulk Booking</p>
            <h2 className="corp-bulk-title">Exclusive corporate experiences from cineBook</h2>
          </div>
          <button className="corp-bulk-btn">Explore now</button>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="corp-section" style={{ paddingBottom: 48 }}>
        <h2 className="corp-testi-heading">Testimonials</h2>
        <TestimonialsCarousel />
      </section>

      {/* PARTNER WITH US */}
      <section style={{ display: "flex", justifyContent: "center", paddingBottom: 48 }}>
        <button className="corp-partner-btn">Partner with us</button>
      </section>

      {/* FAQ */}
      <section className="corp-section corp-faq-section">
        <h2 className="corp-faq-heading">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="corp-faq-cols">
          <div className="corp-faq-col">
            <FaqGroup title="General Queries" items={faqGeneral} />
          </div>
          <div className="corp-faq-col">
            <FaqGroup title="Logistic Queries" items={faqLogistic} />
            <FaqGroup title="Payment Queries" items={faqPayment} />
          </div>
        </div>
      </section>

      {/* PRIVACY NOTE */}
      <section className="corp-section corp-privacy-section">
        <p className="corp-privacy-label">Privacy Note</p>
        <p className="corp-privacy-text">
          By using www.cinebook.com (our website), you are fully accepting the Privacy Policy available at{" "}
          <a href="#!" style={{ color: "#E8334A" }}>https://cinebook.com/privacy</a>{" "}
          governing your access to cineBook and provision of services by cineBook to you.
          If you do not accept terms mentioned in the{" "}
          <a href="#!" style={{ color: "#E8334A" }}>Privacy Policy</a>,
          you must not share any of your personal information and immediately exit cineBook.
        </p>
        <div className="corp-breadcrumb">
          <a href="/" style={{ color: "#555" }}>Home</a>
          <span style={{ margin: "0 6px" }}>{"->"}</span>
          <span>Voucher</span>
        </div>
      </section>
    </div>
  );
}
