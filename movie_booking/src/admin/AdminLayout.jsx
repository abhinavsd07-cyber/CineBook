import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import {
  LuLayoutDashboard,
  LuFilm,
  LuBuilding2,
  LuCalendarDays,
  LuTicket,
  LuClapperboard,
  LuGlobe,
  LuLogOut,
  LuMenu,
  LuX,
  LuBell,
  LuUtensils,
  LuSun,
  LuMoon,
} from "react-icons/lu";

const NAV_ITEMS = [
  { path: "/admin/dashboard", icon: LuLayoutDashboard, label: "Dashboard"    },
  { path: "/admin/movies",    icon: LuFilm,            label: "Movies"       },
  { path: "/admin/theatres",  icon: LuBuilding2,       label: "Theatres"     },
  { path: "/admin/shows",     icon: LuCalendarDays,    label: "Shows"        },
  { path: "/admin/bookings",  icon: LuTicket,          label: "Bookings"     },
  { path: "/admin/snacks",    icon: LuUtensils,        label: "Snacks & F&B" },
  { path: "/admin/banners",   icon: LuClapperboard,    label: "Banners / Ads"},
];

const ACCENT = "#F84464";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const navigate         = useNavigate();
  const location         = useLocation();

  const isMobile = () => window.innerWidth < 768;

  /* mobile: drawer open/closed  |  desktop: expanded vs mini rail */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mini, setMini]             = useState(false);

  /* close mobile drawer on navigation */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* keep state sane on resize */
  useEffect(() => {
    const onResize = () => {
      if (!isMobile()) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleToggle = () => {
    if (isMobile()) setMobileOpen((v) => !v);
    else            setMini((v) => !v);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bms-bg text-bms-text transition-colors duration-300">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden transition-all duration-300 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ════════════════════════ SIDEBAR ════════════════════════ */}
      <aside
        style={{ width: mini ? 76 : 260 }}
        className={`
          fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col flex-shrink-0
          bg-slate-950 text-slate-300 border-r border-slate-900/60
          transition-all duration-300 ease-in-out shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center flex-shrink-0 border-b border-slate-900/80
            ${mini ? "justify-center" : "px-6 gap-3"}`}
        >
          {mini ? (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30 shadow-[0_0_15px_rgba(248,68,100,0.15)] animate-pulse-glow">
              <LuClapperboard size={20} style={{ color: ACCENT }} className="flex-shrink-0" />
            </div>
          ) : (
            <div className="flex flex-col leading-none overflow-hidden mt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-600/10 border border-rose-500/30">
                  <LuClapperboard size={16} style={{ color: ACCENT }} />
                </div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                  Cine<span style={{ color: ACCENT }}>Pass</span>
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] ml-[3px] mt-1.5">
                Admin Console
              </span>
            </div>
          )}
        </div>

        {/* Section label */}
        {!mini && (
          <p className="px-6 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 select-none">
            General Management
          </p>
        )}

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-2 pb-3 flex flex-col gap-1.5 custom-scrollbar">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={mini ? label : undefined}
                className={`
                  group relative flex items-center rounded-xl
                  text-xs font-semibold transition-all duration-200 select-none cursor-pointer
                  ${mini ? "justify-center px-0 py-3.5" : "gap-3.5 px-4.5 py-3"}
                  ${active
                    ? "bg-gradient-to-r from-rose-500/15 to-pink-500/5 text-white border border-rose-500/20 shadow-[0_4px_20px_-3px_rgba(248,68,100,0.15)]"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 hover:translate-x-1 border border-transparent"}
                `}
              >
                {/* Active left indicator pill */}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[22px] rounded-r-full"
                    style={{ backgroundColor: ACCENT }}
                  />
                )}

                <Icon
                  size={18}
                  className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                  style={active ? { color: ACCENT } : undefined}
                />

                {!mini && <span className="truncate tracking-wide">{label}</span>}

                {/* Mini Mode Tooltip popup */}
                {mini && (
                  <span className="
                    pointer-events-none absolute left-full ml-4 z-50
                    whitespace-nowrap rounded-xl bg-slate-950 border border-slate-800
                    px-3 py-2 text-xs font-bold text-white shadow-2xl
                    opacity-0 translate-x-2
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-250
                  ">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-900 px-3 py-4 flex flex-col gap-1.5 flex-shrink-0">
          {!mini && (
            <Link
              to="/"
              className="flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 transition-all duration-200"
            >
              <LuGlobe size={18} className="flex-shrink-0" />
              <span className="tracking-wide">Go to Website</span>
            </Link>
          )}

          <button
            onClick={() => { logout(); navigate("/login"); }}
            title={mini ? "Logout" : undefined}
            className={`
              group relative flex items-center rounded-xl w-full cursor-pointer
              text-xs font-semibold text-red-400/90
              hover:bg-red-500/10 hover:text-red-300
              transition-all duration-200
              ${mini ? "justify-center px-0 py-3.5" : "gap-3.5 px-4.5 py-3"}
            `}
          >
            <LuLogOut size={18} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            {!mini && <span className="tracking-wide">Sign Out</span>}
            {mini && (
              <span className="
                pointer-events-none absolute left-full ml-4 z-50
                whitespace-nowrap rounded-xl bg-slate-950 border border-slate-800
                px-3 py-2 text-xs font-bold text-white shadow-2xl
                opacity-0 translate-x-2
                group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-250
              ">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ════════════════════════ MAIN CONTAINER ════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Header Bar */}
        <header className="h-16 flex-shrink-0 bg-bms-surface/75 backdrop-blur-md border-b border-bms-border/40 flex items-center justify-between px-4 md:px-8 shadow-sm z-30 transition-colors duration-300">

          {/* Left: Hamburger + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              className="p-2 rounded-xl text-bms-text-muted hover:bg-bms-surface-hover hover:text-bms-text transition-colors duration-150 cursor-pointer"
              aria-label="Toggle sidebar"
            >
              {mobileOpen ? <LuX size={18} /> : <LuMenu size={18} />}
            </button>

            {/* Current page label */}
            <span className="hidden sm:inline-block text-sm font-bold text-bms-text tracking-wide uppercase">
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? "Console"}
            </span>
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-bms-text-muted hover:bg-bms-surface-hover hover:text-bms-text transition-colors duration-150 cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <LuSun size={17} /> : <LuMoon size={17} />}
            </button>

            {/* Bell/Notification */}
            <button className="relative p-2 rounded-xl text-bms-text-muted hover:bg-bms-surface-hover hover:text-bms-text transition-colors duration-150 cursor-pointer">
              <LuBell size={17} />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full border border-bms-surface"
                style={{ backgroundColor: ACCENT }}
              />
            </button>

            <div className="w-px h-6 bg-bms-border/50 hidden sm:block mx-1" />

            {/* User Profile Badge */}
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "Admin"}
                  className="w-9 h-9 rounded-full object-cover border border-bms-border shadow-xs flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const placeholder = parent.querySelector('.avatar-placeholder');
                      if (placeholder) placeholder.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}

              <div
                className={`avatar-placeholder w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 select-none bg-gradient-to-br from-rose-500 to-pink-600 ${user?.avatar ? 'hidden' : ''}`}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
              </div>

              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-xs font-bold text-bms-text truncate max-w-[140px] tracking-wide">
                  {user?.name ?? "Admin"}
                </span>
                <span
                  className="text-[9px] font-extrabold uppercase tracking-[0.12em]"
                  style={{ color: ACCENT }}
                >
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page main content slot */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-bms-bg p-4 md:p-8 transition-colors duration-300">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}