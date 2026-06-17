import React, { useState, useEffect } from "react";
import HeroCarousel from "../components/HeroCarousel"
// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const GuitarIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="30" cy="52" rx="13" ry="9" />
    <path d="M43 52 V22 L68 16 V44" />
    <ellipse cx="57" cy="44" rx="11" ry="8" />
    <path d="M43 33 L68 27" />
    <line x1="30" y1="43" x2="30" y2="61" />
  </svg>
);

const FestivalIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 58 L26 44 L32 20 L40 16 L48 20 L54 44 Z" />
    <line x1="26" y1="44" x2="54" y2="44" />
    <line x1="34" y1="14" x2="34" y2="8" />
    <line x1="46" y1="14" x2="46" y2="8" />
    <line x1="28" y1="11" x2="28" y2="6" />
    <line x1="52" y1="11" x2="52" y2="6" />
  </svg>
);

const BookIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 16 C20 16 20 56 20 60 C20 60 28 54 40 60 C52 66 60 60 60 60 L60 16 C60 16 52 22 40 16 C28 10 20 16 20 16 Z" />
    <path d="M40 16 L40 60" />
    <path d="M40 23 C46 21 53 23 58 25" />
    <path d="M40 33 C46 31 53 33 58 35" />
    <path d="M22 23 C28 21 35 23 40 23" />
    <path d="M22 33 C28 31 35 33 40 33" />
  </svg>
);

const DiscoIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="36" cy="48" r="16" />
    <line x1="36" y1="32" x2="36" y2="18" />
    <path d="M26 20 C26 14 46 14 46 20" />
    <line x1="52" y1="24" x2="57" y2="19" />
    <line x1="52" y1="19" x2="57" y2="24" />
    <line x1="18" y1="30" x2="13" y2="25" />
    <line x1="13" y1="30" x2="18" y2="25" />
    <path d="M20 52 Q24 44 28 52 Q32 44 36 52 Q40 44 44 52 Q48 44 52 52" />
  </svg>
);

const PitchIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="22" width="56" height="36" rx="2" />
    <line x1="40" y1="22" x2="40" y2="58" />
    <circle cx="40" cy="40" r="9" />
    <rect x="12" y="31" width="8" height="18" />
    <rect x="60" y="31" width="8" height="18" />
  </svg>
);

const ConferenceIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="40" cy="27" r="10" />
    <path d="M20 62 C20 50 28 44 40 44 C52 44 60 50 60 62" />
    <line x1="15" y1="30" x2="15" y2="60" />
    <line x1="65" y1="30" x2="65" y2="60" />
    <path d="M9 36 L15 30 L21 36" />
    <path d="M59 36 L65 30 L71 36" />
    <line x1="9" y1="46" x2="21" y2="46" />
    <line x1="59" y1="46" x2="71" y2="46" />
  </svg>
);

const RocketIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 62 L28 64 L20 56 L22 44 C22 44 28 32 40 22 C52 32 58 44 58 44 L60 56 L52 64 Z" />
    <circle cx="40" cy="38" r="6" />
    <path d="M22 44 L16 50 L20 56" />
    <path d="M58 44 L64 50 L60 56" />
    <path d="M36 62 L38 70 L40 66 L42 70 L44 62" />
  </svg>
);

const PricingIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="16" width="44" height="48" rx="2" />
    <rect x="26" y="26" width="28" height="16" rx="1" />
    <line x1="26" y1="50" x2="34" y2="50" />
    <line x1="38" y1="50" x2="46" y2="50" />
    <line x1="50" y1="50" x2="54" y2="50" />
    <line x1="26" y1="57" x2="34" y2="57" />
    <line x1="38" y1="57" x2="54" y2="57" />
    <path d="M34 26 L40 34 L46 26" />
  </svg>
);

const FoodTruckIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="38" width="46" height="22" rx="3" />
    <path d="M10 38 Q33 28 56 38" />
    <path d="M14 30 Q14 20 26 20" />
    <path d="M22 32 Q22 24 30 22" />
    <circle cx="22" cy="64" r="5" />
    <circle cx="44" cy="64" r="5" />
    <line x1="56" y1="18" x2="56" y2="60" />
    <path d="M48 18 Q48 34 56 36 Q64 34 64 18" />
    <line x1="56" y1="36" x2="56" y2="60" />
  </svg>
);

const SupportIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="14" width="32" height="42" rx="3" />
    <line x1="24" y1="24" x2="44" y2="24" />
    <line x1="24" y1="31" x2="44" y2="31" />
    <line x1="24" y1="38" x2="36" y2="38" />
    <path d="M36 50 Q46 44 56 48 L60 60 Q50 64 42 58 Z" />
    <path d="M42 58 L38 64" />
  </svg>
);

const ChartIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="12" width="48" height="56" rx="2" />
    <line x1="28" y1="58" x2="28" y2="38" />
    <line x1="38" y1="58" x2="38" y2="26" />
    <line x1="48" y1="58" x2="48" y2="34" />
    <line x1="58" y1="58" x2="58" y2="20" />
    <path d="M28 38 L38 26 L48 34 L58 20" />
  </svg>
);

const RfidIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1f253a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="32" y="34" width="26" height="34" rx="3" />
    <line x1="37" y1="46" x2="53" y2="46" />
    <line x1="37" y1="53" x2="53" y2="53" />
    <line x1="37" y1="60" x2="47" y2="60" />
    <path d="M22 46 C17 41 17 31 22 26" />
    <path d="M15 52 C6 42 6 24 15 14" />
    <path d="M45 18 C50 14 57 14 62 18" />
    <path d="M41 25 C46 21 55 21 60 25" />
  </svg>
);

const InfoCircle = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#e8293c" strokeWidth="1.8">
    <circle cx="11" cy="11" r="9" />
    <line x1="11" y1="7" x2="11" y2="7" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="11" y1="10" x2="11" y2="15" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="280" height="320" viewBox="0 0 280 320" fill="none">
    <path d="M140 18 L262 74 L262 186 C262 258 140 314 140 314 C140 314 18 258 18 186 L18 74 Z" stroke="#f0b8c0" strokeWidth="10" fill="none" />
    <path d="M140 48 L232 90 L232 186 C232 240 140 282 140 282 C140 282 48 240 48 186 L48 90 Z" stroke="#f0b8c0" strokeWidth="6" fill="none" />
  </svg>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ListYourShow() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((s) => (s + 1) % 5);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const hostItems = [
    { icon: <GuitarIcon />, label: "Performances" },
    { icon: <FestivalIcon />, label: "Experiences" },
    { icon: <BookIcon />, label: "Expositions" },
    { icon: <DiscoIcon />, label: "Parties" },
    { icon: <PitchIcon />, label: "Sports" },
    { icon: <ConferenceIcon />, label: "Conferences" },
  ];

  const serviceItems = [
    { icon: <RocketIcon />, label: "Online Sales &\nMarketing" },
    { icon: <PricingIcon />, label: "Pricing" },
    { icon: <FoodTruckIcon />, label: "Food & beverages,\nstalls and the works!" },
    { icon: <SupportIcon />, label: "On ground support &\ngate entry management" },
    { icon: <ChartIcon />, label: "Reports & business\ninsights" },
    { icon: <RfidIcon />, label: "POS, RFID, Turnstiles\n& more..." },
  ];

  return (
    <div className="font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] bg-white text-[#1f253a] min-h-screen">
      
      {/* ── NAVBAR ── */}
      <div className="bg-white border-b border-gray-200 px-10 flex items-center h-[62px] sticky top-0 z-[200] gap-6">
        {/* Logo */}
        <div className="flex items-center text-[22px] font-black tracking-[-1px] shrink-0">
          <span className="text-[#1f253a]">book</span>
          <span className="bg-[#e8293c] text-white px-[3px] rounded-[3px] italic mx-0.5">
            my
          </span>
          <span className="text-[#1f253a]">show</span>
        </div>
        {/* Search */}
        <div className="flex-1 max-w-[460px] mx-4">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md py-2 px-3.5 gap-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-[13px] text-gray-400">
              Search for Movies, Events, Plays, Sports and Activities
            </span>
          </div>
        </div>
        {/* Main nav links */}
        <div className="flex gap-6 items-center">
          {["Movies", "Stream", "Events", "Plays", "Sports", "Activities"].map((l) => (
            <a key={l} href="#" className="text-sm text-gray-700 no-underline font-medium">
              {l}
            </a>
          ))}
        </div>
        {/* Right */}
        <div className="flex items-center gap-5 ml-auto">
          <div className="flex items-center gap-1 text-sm font-semibold cursor-pointer">
            Mumbai
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold">Hi, Abhinav ...</span>
          </div>
        </div>
      </div>

      {/* ── SECONDARY NAV ── */}
      <div className="bg-white border-b border-gray-200 px-10 flex justify-end">
        <div className="flex gap-8">
          {[
            ["ListYourShow", true],
            ["Corporates", false],
            ["Offers", false],
            ["Gift Cards", false],
          ].map(([label, active]) => (
            <a
              key={label}
              href="#"
              className={`text-[13px] py-[13px] inline-block border-b-2 no-underline ${
                active
                  ? "font-bold text-[#e8293c] border-[#e8293c]"
                  : "font-medium text-gray-700 border-transparent"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

     <HeroCarousel />

      {/* ── WHAT CAN YOU HOST ── */}
      <div className="max-w-[1100px] mx-auto pt-[72px] px-10 text-center">
        <h2 className="text-[38px] font-extrabold mb-3.5">What can you host???</h2>
        <p className="text-[15px] text-gray-500 max-w-[700px] mx-auto mb-11 leading-relaxed">
          As the purveyor of entertainment, BookMyShow enables your event with
          end to end solutions from the time you register to the completion of
          the event. Let's look at what you can host.
        </p>
        <div className="grid grid-cols-3 gap-[18px]">
          {hostItems.map(({ icon, label }) => (
            <div
              key={label}
              className="bg-[#eef1f8] rounded-xl pt-[42px] px-5 pb-7 flex flex-col items-center gap-[18px] cursor-pointer transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-[3px]"
            >
              {icon}
              <h3 className="font-bold text-lg text-[#1f253a]">{label}</h3>
              <InfoCircle />
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA 1 ── */}
      <div className="text-center pt-12 px-10">
        <button className="bg-[#e8697e] hover:bg-[#e8293c] transition-colors duration-300 text-white border-none py-4 px-20 rounded-lg text-base font-bold cursor-pointer tracking-[0.3px]">
          List your show
        </button>
      </div>

      {/* ── SERVICES ── */}
      <div className="max-w-[1100px] mx-auto pt-20 px-10 text-center">
        <h2 className="text-[38px] font-extrabold mb-3.5">What are the services we offer?</h2>
        <p className="text-[15px] text-gray-500 max-w-[700px] mx-auto mb-11 leading-relaxed">
          After successful collaborations with the best event organisers over
          the past decade and a half, we're well equipped to bring your vision
          to life.
        </p>
        <div className="grid grid-cols-3 gap-[18px]">
          {serviceItems.map(({ icon, label }) => (
            <div
              key={label}
              className="bg-[#fdf0f0] rounded-xl pt-[42px] px-5 pb-7 flex flex-col items-center gap-[18px] cursor-pointer min-h-[240px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[3px]"
            >
              {icon}
              <h3 className="font-bold text-[15px] text-[#1f253a] text-center leading-[1.55] whitespace-pre-line">
                {label}
              </h3>
              <InfoCircle />
            </div>
          ))}
        </div>
      </div>

      {/* ── ADDITIONAL SERVICES TEXT ── */}
      <div className="max-w-[860px] mx-auto mt-7 text-center text-[15px] text-gray-500 leading-relaxed px-10">
        Apart from these must haves for any event, we also support a host of
        other services like SEO for your event, custom pricing for your tickets
        and this and also this.
      </div>

      {/* ── CTA 2 ── */}
      <div className="text-center pt-10 px-10 pb-5">
        <button className="bg-[#e8697e] hover:bg-[#e8293c] transition-colors duration-300 text-white border-none py-4 px-20 rounded-lg text-base font-bold cursor-pointer tracking-[0.3px]">
          List your show
        </button>
      </div>

      {/* ── TESTIMONIAL ── */}
      <div className="max-w-[1100px] mx-auto mt-[70px] px-10">
        <div className="flex items-center gap-[60px] py-10 pb-[60px]">
          {/* Quote */}
          <div className="flex-1">
            <div className="text-[72px] leading-[0.8] text-[#1f253a] font-serif mb-[18px]">
              "
            </div>
            <p className="text-[15px] text-gray-700 leading-[1.85]">
              The NCPA shares a cherished 13 year bond with BMS, its online
              ticketing partner that has helped art lovers book their seats for
              their favourite shows in a seamless manner. The presence of a team
              from Bookmyshow in the NCPA premises on the day of the event
              further ensures the smooth-functioning of ticket-related
              formalities."
            </p>
            <p className="mt-[22px] font-bold text-[15px] text-[#1f253a]">
              NCPA- National Centre for the
              <br />
              Performing Arts.
            </p>
          </div>
          {/* NCPA logo */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="flex items-center gap-2.5">
              <svg width="54" height="54" viewBox="0 0 54 54" fill="none" stroke="#1f253a" strokeWidth="1.8">
                <circle cx="27" cy="27" r="24" />
                <circle cx="27" cy="27" r="14" />
                <line x1="27" y1="3" x2="27" y2="13" />
                <line x1="27" y1="41" x2="27" y2="51" />
                <line x1="3" y1="27" x2="13" y2="27" />
                <line x1="41" y1="27" x2="51" y2="27" />
              </svg>
              <span className="text-[42px] font-black tracking-[-2px] text-[#1f253a]">
                NCPA
              </span>
            </div>
            {/* Colorful 50 */}
            <svg width="190" height="100" viewBox="0 0 190 100">
              <text x="4" y="86" fontSize="80" fontWeight="900" fill="#e8293c" fontFamily="Georgia,serif">
                5
              </text>
              <text x="94" y="86" fontSize="80" fontWeight="900" fill="none" stroke="#1f253a" strokeWidth="3" fontFamily="Georgia,serif">
                0
              </text>
              <path d="M40 78 Q80 60 140 72" stroke="#e8b400" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M20 88 Q70 100 130 90" stroke="#2563eb" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M30 94 Q80 104 150 96" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M60 62 Q90 50 120 60" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── SHIELD SECTION ── */}
      <div className="text-center pt-[70px] px-10 pb-[60px] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] z-0 opacity-[0.18]">
          <ShieldIcon />
        </div>
        <div className="relative z-10">
          <h2 className="text-[42px] font-extrabold text-[#1f253a] mb-[18px]">
            Sit back and watch your
            <br />
            event come to life
          </h2>
          <p className="text-base text-gray-500 max-w-[580px] mx-auto leading-relaxed">
            Events maybe all fun and games, but we take it seriously. We ensure
            our customer's security so that you don't have to.
          </p>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <div className="border-t border-gray-100 py-3.5 px-10 text-[13px] text-gray-500">
        <a href="#" className="text-gray-500 no-underline">
          Home
        </a>
        {" → "}
        List Your Show
      </div>

      {/* ── PRIVACY NOTE ── */}
      <div className="bg-gray-50 py-6 px-10">
        <p className="text-[13px] font-bold text-gray-700 mb-2.5">
          Privacy Note
        </p>
        <p className="text-[13px] text-gray-500 leading-[1.7]">
          By using www.bookmyshow.com(our website), you are fully accepting the
          Privacy Policy available at{" "}
          <a href="#" className="text-[#e8293c]">
            https://bookmyshow.com/privacy
          </a>{" "}
          governing your access to Bookmyshow and provision of services by
          Bookmyshow to you. If you do not accept terms mentioned in the{" "}
          <a href="#" className="text-[#e8293c]">
            Privacy Policy
          </a>
          , you must not share any of your personal information and immediately
          exit Bookmyshow.
        </p>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="bg-[#1f253a] text-white py-4 px-10 flex items-center gap-5">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7">
          <path d="M8 6 L8 30 L18 24 L28 30 L28 6 Z" />
          <line x1="12" y1="14" x2="24" y2="14" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        <div className="flex-1">
          <div className="text-[15px] font-bold mb-0.5">
            List your Show
          </div>
          <div className="text-[13px] text-slate-400">
            Got a show, event, activity or a great experience? Partner with us
            &amp; get listed on BookMyShow
          </div>
        </div>
        <button className="bg-[#e8293c] text-white py-3 px-6 rounded-lg font-bold text-sm border-none cursor-pointer shrink-0 hover:bg-[#d41c2f] transition-colors">
          Contact today!
        </button>
      </div>
    </div>
  );
}