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
    { label: "ListYourShow", path: "/#list" },
    { label: "Corporates", path: "/#corporates" },
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
              
              <Link to="/" className="flex items-center text-bms-text hover:text-bms-accent transition-colors duration-200">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 26" className="h-7 md:h-9 w-auto">
                    <g fill="none">
                       <path fill="#F84464" d="m55.433 7.383-1.444-2.43-2.583 1.213-1.444-2.43L47.38 4.95l-1.445-2.43-2.582 1.215-1.445-2.43-2.582 1.212L37.88.087 35.3 1.3l-5.476 17.591 6.643 2.005a3.516 3.516 0 0 1 3.363-2.45c1.944 0 3.52 1.557 3.52 3.478l-.001.07c.016.315-.021.634-.118.946l6.756 2.042 5.446-17.6"/>
                       <path fill="#FFFFFF" d="M35.52 17.438a.705.705 0 0 1-.591-.705V8.122a.715.715 0 0 1 .724-.717h6.297c.164 0 .329.016.489.043a2.798 2.798 0 0 1 2.336 2.749v6.536a.705.705 0 0 1-.217.51.73.73 0 0 1-.641.195.704.704 0 0 1-.59-.705v-6.536a1.363 1.363 0 0 0-1.377-1.358h-1.372v7.894a.723.723 0 0 1-.86.705.705.705 0 0 1-.59-.705V8.838h-2.75v7.895a.704.704 0 0 1-.216.51.728.728 0 0 1-.642.195m10.47 3.752a.704.704 0 0 1-.592-.706.71.71 0 0 1 .209-.51.73.73 0 0 1 .516-.206c.61 0 1.14-.39 1.315-.97l.748-2.462-2.448-8.083a.722.722 0 0 1 .483-.904.742.742 0 0 1 .896.473l1.82 6.03 1.839-6.026c.091-.34.46-.556.839-.49l.051.011a.726.726 0 0 1 .489.907l-2.52 8.295-.796 2.655c-.206.61-.56 1.106-1.022 1.44-.5.365-1.086.557-1.694.557a.708.708 0 0 1-.133-.012"/>
                       <path fill="currentColor" d="M1.614 15.87h1.428c.788 0 1.43-.633 1.43-1.413v-4.141c0-.687-.498-1.272-1.183-1.391a1.501 1.501 0 0 0-.247-.022l-1.43.001.002 6.965zM.72 17.347a.732.732 0 0 1-.616-.734V3.758c0-.203.077-.391.218-.53a.751.751 0 0 1 .666-.203c.362.062.624.37.624.734v3.656h1.43a2.91 2.91 0 0 1 2.938 2.901l-.001 4.141c0 1.601-1.318 2.902-2.938 2.902H.86a.676.676 0 0 1-.14-.011zm10.376-8.508a1.478 1.478 0 0 0-.246-.02c-.801 0-1.43.62-1.43 1.412v4.313a1.413 1.413 0 0 0 1.43 1.412c.788 0 1.429-.632 1.43-1.412l-.001-4.313c0-.688-.498-1.272-1.183-1.392m-.763 8.564a2.905 2.905 0 0 1-2.42-2.86V10.23c0-.778.304-1.507.858-2.054a2.94 2.94 0 0 1 2.079-.847 2.91 2.91 0 0 1 2.938 2.902l-.001 4.313c0 .775-.308 1.504-.867 2.055a2.94 2.94 0 0 1-2.07.847 2.948 2.948 0 0 1-.517-.043m8.569-8.564a1.47 1.47 0 0 0-.245-.02c-.802 0-1.428.62-1.428 1.412v4.313a1.412 1.412 0 0 0 1.428 1.412c.378 0 .733-.146 1.005-.41.273-.268.424-.624.424-1.002V10.23c0-.687-.498-1.27-1.184-1.391m-.762 8.564a2.907 2.907 0 0 1-2.42-2.859v-4.313c0-1.601 1.317-2.903 2.937-2.903.17 0 .34.014.506.043a2.91 2.91 0 0 1 2.431 2.86v4.313c0 .777-.308 1.504-.867 2.055a2.94 2.94 0 0 1-2.07.847c-.174 0-.348-.014-.517-.043m6.002.031a.733.733 0 0 1-.614-.733V3.758a.735.735 0 0 1 .753-.745.746.746 0 0 1 .754.745v7.66l3.474-3.843a.766.766 0 0 1 .697-.228c.139.024.27.085.379.175.309.28.33.75.052 1.048l-2.615 2.88 2.717 4.902a.705.705 0 0 1 .066.553.732.732 0 0 1-.37.443.755.755 0 0 1-.5.082.749.749 0 0 1-.526-.356l-2.444-4.433-.93 1.013v3.047c0 .202-.08.39-.225.532a.758.758 0 0 1-.668.201m33.268-.008a2.782 2.782 0 0 1-1.96-1.355.75.75 0 0 1-.068-.569.739.739 0 0 1 .346-.45c.15-.084.33-.114.505-.084a.75.75 0 0 1 .525.358c.199.335.509.546.895.614.42.066.803-.048 1.116-.316.29-.267.442-.648.404-1.016a1.22 1.22 0 0 0-.548-.964l-2.031-1.425a2.708 2.708 0 0 1-1.155-2.013 2.642 2.642 0 0 1 .884-2.152 2.754 2.754 0 0 1 2.24-.694h.001c.856.15 1.555.63 1.95 1.323a.746.746 0 0 1 .07.563.747.747 0 0 1-.348.454.757.757 0 0 1-.504.083.747.747 0 0 1-.526-.357c-.172-.3-.482-.51-.856-.575a1.189 1.189 0 0 0-1.021.296c-.26.238-.403.596-.382.96.019.351.22.694.523.894l2.032 1.404a2.729 2.729 0 0 1 1.177 2.101 2.651 2.651 0 0 1-.906 2.214 2.84 2.84 0 0 1-2.307.714l-.055-.008m5.835.021a.75.75 0 0 1-.625-.735V3.77c0-.202.08-.39.226-.533a.762.762 0 0 1 .667-.2.733.733 0 0 1 .615.733v3.655h1.43c.174 0 .348.015.516.045a2.902 2.902 0 0 1 2.42 2.857l.001 6.385a.741.741 0 0 1-.883.734.747.747 0 0 1-.625-.735v-6.384a1.41 1.41 0 0 0-1.43-1.412h-1.429v7.797a.742.742 0 0 1-.754.746.781.781 0 0 1-.13-.01M73.609 8.85a1.429 1.429 0 0 0-1.26.39c-.268.265-.416.62-.416 1v4.316c0 .686.494 1.27 1.173 1.388a1.43 1.43 0 0 0 1.261-.388c.274-.268.424-.622.424-1.001V10.24c0-.687-.497-1.272-1.182-1.391m-.763 8.563a2.903 2.903 0 0 1-2.42-2.857V10.24c-.001-1.6 1.317-2.902 2.937-2.902.169 0 .34.013.506.043a2.91 2.91 0 0 1 2.43 2.859v4.315a2.856 2.856 0 0 1-.867 2.054 2.938 2.938 0 0 1-2.586.803m15.046-9.158a.712.712 0 0 0-.077-.545.781.781 0 0 0-.49-.342.747.747 0 0 0-.864.546 920.42 920.42 0 0 1-1.452 5.726l-.014.056-.013-.056c-.62-2.458-1.447-5.69-1.456-5.724a.706.706 0 0 0-.58-.55.75.75 0 0 0-.85.548c-.01.03-.819 3.268-1.454 5.726l-.014.056-.014-.056c-.618-2.458-1.447-5.695-1.455-5.726a.74.74 0 0 0-.889-.536.73.73 0 0 0-.542.877l2.185 8.632a.754.754 0 0 0 .714.556.708.708 0 0 0 .715-.557c.008-.033.837-3.27 1.456-5.73l.013-.054.016.054c.64 2.483 1.451 5.73 1.452 5.732a.754.754 0 0 0 .715.556.71.71 0 0 0 .714-.559l2.184-8.63"/>
                    </g>
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
      <div className="py-2 bg-bms-surface/50 border-b border-bms-border hidden md:block">
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
