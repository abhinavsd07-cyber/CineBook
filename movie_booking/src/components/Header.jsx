import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";
import { useThemeContext } from "../context/ThemeContext";
import { getAllMovies } from "../config/allApis";
import { FaLandmark, FaCity, FaIndustry, FaTree, FaMonument, FaArchway, FaMosque, FaDharmachakra, FaMoon, FaSun } from "react-icons/fa";
import { LuCrosshair, LuBuilding2 } from "react-icons/lu";

export const POPULAR_CITIES = [
  { name: "Mumbai", icon: <FaLandmark size={24} className="text-bms-accent" /> },
  { name: "Delhi-NCR", icon: <FaMonument size={24} className="text-bms-accent" /> },
  { name: "Bengaluru", icon: <LuBuilding2 size={24} className="text-bms-accent" /> },
  { name: "Hyderabad", icon: <FaMosque size={24} className="text-bms-accent" /> },
  { name: "Chandigarh", icon: <FaCity size={24} className="text-bms-accent" /> },
  { name: "Ahmedabad", icon: <FaIndustry size={24} className="text-bms-accent" /> },
  { name: "Pune", icon: <LuBuilding2 size={24} className="text-bms-accent" /> },
  { name: "Chennai", icon: <FaDharmachakra size={24} className="text-bms-accent" /> },
  { name: "Kolkata", icon: <FaArchway size={24} className="text-bms-accent" /> },
  { name: "Kochi", icon: <FaTree size={24} className="text-bms-accent" /> },
];

const Header = () => {
  const { user, logout } = useAuth();
  const { location, changeLocation } = useLocationContext();
  const { theme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    let active = true;
    const fetchSearch = async () => {
      if (!search.trim()) { setResults([]); return; }
      try {
        const res = await getAllMovies({ search });
        if(active) setResults(res.data.data.slice(0, 5));
      } catch { 
        if(active) setResults([]); 
      }
    };
    const t = setTimeout(fetchSearch, 300);
    return () => { active = false; clearTimeout(t); };
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults([]);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCitySelect = (city) => {
    changeLocation(city);
    setLocationModalOpen(false);
  };

  const navLinksMain = [
    { label: "Movies", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "Stream", path: "/stream" },
    { label: "Events", path: "/#events" },
    { label: "Plays", path: "/#plays" },
    { label: "Sports", path: "/#sports" },
    { label: "Activities", path: "/#activities" },
  ];

  const navLinksSecondary = [
    { label: "ListYourShow", path: "/list-your-show" },
    { label: "Corporates", path: "/corporates" },
    { label: "Offers", path: "/offers" },
    { label: "Gift Cards", path: "/giftcards" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] bg-bms-surface/95 dark:bg-bms-surface/85 backdrop-blur-md border-b border-bms-border shadow-sm transition-all duration-300">
      {/* Top Main Bar */}
      <div className="py-2.5 md:py-3 border-b border-bms-border/50">
        <div className="container flex justify-between items-center px-4">
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button className="md:hidden p-1 -ml-1 rounded hover:bg-bms-surface-hover text-bms-text bg-transparent border-none cursor-pointer transition-colors duration-200" onClick={() => setMobileMenuOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              
              <Link to="/" className="flex items-center text-bms-text hover:text-bms-accent transition-colors duration-200" id="brand-logo-link">
                <svg
                  viewBox="0 0 250 80"
                  className="h-7 md:h-10 w-auto animate-fade-in"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <text
                    x="10"
                    y="55"
                    fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                    fontWeight="bold"
                    fontSize="44"
                    fill="currentColor"
                    letterSpacing="-1"
                  >
                    cine
                  </text>
                  <path
                    d="M 105 20 L 240 20 A 5 5 0 0 0 240 30 A 5 5 0 0 1 240 50 A 5 5 0 0 0 240 60 L 105 60 A 5 5 0 0 0 105 50 A 5 5 0 0 1 105 30 A 5 5 0 0 0 105 20 Z"
                    fill="#E2202C"
                  />
                  <text
                    x="125"
                    y="52"
                    fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
                    fontWeight="bold"
                    fontSize="34"
                    fill="#ffffff"
                  >
                    Book
                  </text>
                </svg>
              </Link>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="relative flex-1 max-w-[600px] ml-4 hidden md:block" ref={searchRef}>
              <div className="flex items-center bg-bms-surface border border-bms-border rounded-md px-3 h-10 w-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-bms-text focus-within:ring-1 focus-within:ring-bms-text transition-all duration-200">
                <svg className="w-4 h-4 text-bms-text mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search for Movies, Events, Plays, Sports and Activities"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-bms-text placeholder-bms-text-dim w-full"
                />
              </div>
              {results.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-bms-surface border border-bms-border rounded-md shadow-lg max-h-[400px] overflow-y-auto z-[1001] divide-y divide-bms-border/50 animate-fade-in">
                  {results.map((m) => (
                    <div key={m._id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => { navigate(`/movie/${m._id}`); setSearch(""); setResults([]); }}>
                      <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded" />
                      <div>
                        <span className="block font-medium text-bms-text text-sm mb-1">{m.title}</span>
                        <span className="block text-xs text-bms-text-dim">{m.genre?.join(", ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="p-1.5 md:p-2 rounded-full hover:bg-bms-surface-hover text-bms-text transition-colors duration-200" onClick={toggleTheme} title="Toggle Dark Mode">
              {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
            </button>

            <button className="hidden md:flex items-center gap-1.5 text-sm text-bms-text hover:text-bms-accent font-medium bg-transparent border-none cursor-pointer transition-colors duration-200" onClick={() => setLocationModalOpen(true)}>
              {location} 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button className="flex items-center gap-2 font-medium text-bms-text hover:text-bms-accent text-sm bg-transparent border-none cursor-pointer transition-colors duration-200" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-bms-border object-cover" />
                  ) : null}
                  <span className="hidden sm:inline">Hi, {user.name.split(" ")[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 bg-bms-surface border border-bms-border rounded-md shadow-md min-w-[170px] py-1.5 mt-3 animate-fade-in z-[1002]">
                    <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm text-bms-text hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => setUserMenuOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/my-bookings" className="block w-full text-left px-4 py-2 text-sm text-bms-text hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => setUserMenuOpen(false)}>
                      Your Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin/dashboard" className="block w-full text-left px-4 py-2 text-sm text-bms-text hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => setUserMenuOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <button className="block w-full text-left px-4 py-2 text-sm text-bms-text hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => { logout(); navigate("/"); setUserMenuOpen(false); }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-bms-accent hover:bg-bms-accent-hover text-white px-3 md:px-4 py-1.5 text-xs md:text-sm font-semibold rounded shadow-sm transition-all duration-200">Sign in</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Row (Only visible on small screens) */}
      <div className="md:hidden py-2 px-4 border-b border-bms-border/50 bg-bms-surface/95 backdrop-blur-md">
        <div className="relative" ref={searchRef}>
          <div className="flex items-center bg-bms-surface-hover border border-bms-border rounded-md px-3 h-9 w-full focus-within:border-bms-text focus-within:ring-1 focus-within:ring-bms-text transition-all duration-200">
            <svg className="w-4 h-4 text-bms-text-dim mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search for Movies, Events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-bms-text placeholder-bms-text-dim w-full"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-bms-surface border border-bms-border rounded-md shadow-lg max-h-[300px] overflow-y-auto z-[1001] divide-y divide-bms-border/50 animate-fade-in">
              {results.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => { navigate(`/movie/${m._id}`); setSearch(""); setResults([]); }}>
                  <img src={m.poster} alt={m.title} className="w-8 h-10 object-cover rounded" />
                  <div>
                    <span className="block font-medium text-bms-text text-xs mb-0.5">{m.title}</span>
                    <span className="block text-[10px] text-bms-text-dim">{m.genre?.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Bottom Bar (Desktop Only) */}
      <div className="py-2 bg-[#F5F5F5] dark:bg-bms-subheader border-b border-bms-border hidden md:block">
        <div className="container px-4 flex justify-between items-center overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-7">
            {navLinksMain.map((link) => (
              <Link key={link.label} to={link.path} className="text-bms-text hover:text-bms-accent text-[13.5px] font-medium tracking-wide transition-colors duration-150 whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex items-center gap-6">
            {navLinksSecondary.map((link) => (
              <Link key={link.label} to={link.path} className="text-bms-text-muted hover:text-bms-text text-[12.5px] transition-colors duration-150 whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-center items-start pt-20 animate-fade-in px-4" onClick={() => setLocationModalOpen(false)}>
          <div className="bg-bms-surface text-bms-text w-full max-w-[800px] rounded-lg shadow-xl overflow-hidden border border-bms-border animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center px-4 md:px-6 py-4 border-b border-bms-border gap-3 bg-bms-surface-hover">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-bms-text-dim">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Search for your city" className="border-none outline-none flex-1 text-sm bg-transparent text-bms-text placeholder-bms-text-dim" />
            </div>
            
            <div className="px-4 md:px-6 py-3 text-bms-accent text-sm flex items-center gap-2 cursor-pointer border-b border-bms-border bg-bms-surface hover:bg-bms-surface-hover transition-colors duration-150" onClick={() => handleCitySelect("Mumbai")}>
              <LuCrosshair className="text-bms-accent" /> Detect my location
            </div>

            <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto">
              <h4 className="text-center text-xs font-semibold text-bms-text-muted uppercase tracking-wider mb-6">Popular Cities</h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-4 md:gap-7">
                {POPULAR_CITIES.map((city) => (
                  <div key={city.name} className="flex flex-col items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-bms-surface-hover transition-all duration-200" onClick={() => handleCitySelect(city.name)}>
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-bms-surface-hover rounded-full border border-bms-border shadow-sm">
                      {city.icon}
                    </div>
                    <div className="text-[10px] md:text-xs text-bms-text font-medium text-center truncate w-full">{city.name}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 mb-2">
                <button className="text-bms-accent hover:text-bms-accent-hover font-semibold text-sm transition-colors duration-150">View All Cities</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-start md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="h-full w-[85%] max-w-[320px] bg-bms-surface shadow-2xl border-r border-bms-border flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-bms-border bg-bms-surface-hover">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-bms-text">Menu</h3>
                <button className="w-8 h-8 rounded-full bg-bms-surface border border-bms-border hover:bg-bms-surface-active text-bms-text flex items-center justify-center transition-colors duration-150" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>
              <button className="w-full flex items-center justify-between text-sm text-bms-text hover:text-bms-accent font-medium bg-bms-surface border border-bms-border p-3 rounded-lg cursor-pointer transition-colors duration-200" onClick={() => { setMobileMenuOpen(false); setLocationModalOpen(true); }}>
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-bms-accent"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {location}
                </div>
                <span className="text-xs text-bms-accent font-bold">Change</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              <div className="mb-4">
                <p className="text-xs font-bold text-bms-text-muted uppercase tracking-wider px-3 mb-2 mt-2">Explore</p>
                {navLinksMain.map((link) => (
                  <Link key={link.label} to={link.path} onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 rounded-lg text-bms-text hover:bg-bms-surface-hover hover:text-bms-accent font-medium transition-colors duration-150">
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="border-t border-bms-border/50 pt-4 mb-4">
                <p className="text-xs font-bold text-bms-text-muted uppercase tracking-wider px-3 mb-2">More</p>
                {navLinksSecondary.map((link) => (
                  <Link key={link.label} to={link.path} onClick={() => setMobileMenuOpen(false)} className="block py-3 px-3 rounded-lg text-bms-text hover:bg-bms-surface-hover hover:text-bms-accent font-medium transition-colors duration-150">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {user && (
              <div className="p-5 border-t border-bms-border bg-bms-surface-hover">
                <button className="w-full bg-bms-surface border border-bms-border hover:bg-bms-surface-active text-bms-text py-2.5 rounded-lg font-bold transition-all duration-200 text-sm flex justify-center items-center gap-2" onClick={() => { logout(); navigate("/"); setMobileMenuOpen(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
