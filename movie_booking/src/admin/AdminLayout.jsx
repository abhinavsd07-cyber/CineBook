import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

  /* sidebar is "visible" when: desktop (always) OR mobile + drawer open */
  const sidebarVisible = !isMobile() || mobileOpen;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ════════════════════════ SIDEBAR ════════════════════════ */}
      <aside
        style={{ width: mini ? 72 : 240 }}
        className={`
          fixed md:relative inset-y-0 left-0 z-50 h-full flex flex-col flex-shrink-0
          bg-[#0F172A] text-slate-300
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center flex-shrink-0 border-b border-white/8
            ${mini ? "justify-center" : "px-5 gap-3"}`}
        >
          <LuClapperboard size={22} style={{ color: ACCENT }} className="flex-shrink-0" />
          {!mini && (
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="text-white font-bold text-[15px] tracking-tight truncate">
                BookMyShow
              </span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-[0.15em]">
                Admin Console
              </span>
            </div>
          )}
        </div>

        {/* Section label */}
        {!mini && (
          <p className="px-5 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 select-none">
            Main Menu
          </p>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-1 pb-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={mini ? label : undefined}
                className={`
                  group relative flex items-center rounded-lg
                  text-sm font-medium transition-all duration-150 select-none
                  ${mini ? "justify-center px-0 py-3" : "gap-3 px-3.5 py-2.5"}
                  ${active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}
                `}
              >
                {/* Active left pill */}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
                    style={{ backgroundColor: ACCENT }}
                  />
                )}

                <Icon
                  size={17}
                  className="flex-shrink-0 transition-colors duration-150"
                  style={active ? { color: ACCENT } : undefined}
                />

                {!mini && <span className="truncate">{label}</span>}

                {/* Mini tooltip */}
                {mini && (
                  <span className="
                    pointer-events-none absolute left-full ml-3 z-50
                    whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700
                    px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl
                    opacity-0 translate-x-1
                    group-hover:opacity-100 group-hover:translate-x-0
                    transition-all duration-150
                  ">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 px-2 py-3 flex flex-col gap-0.5 flex-shrink-0">
          {!mini && (
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-all duration-150"
            >
              <LuGlobe size={17} className="flex-shrink-0" />
              <span>View Site</span>
            </Link>
          )}

          <button
            onClick={() => { logout(); navigate("/login"); }}
            title={mini ? "Logout" : undefined}
            className={`
              group relative flex items-center rounded-lg w-full
              text-sm font-medium text-red-400
              hover:bg-red-500/10 hover:text-red-300
              transition-all duration-150
              ${mini ? "justify-center px-0 py-3" : "gap-3 px-3.5 py-2.5"}
            `}
          >
            <LuLogOut size={17} className="flex-shrink-0" />
            {!mini && <span>Logout</span>}
            {mini && (
              <span className="
                pointer-events-none absolute left-full ml-3 z-50
                whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700
                px-2.5 py-1.5 text-xs font-semibold text-white shadow-xl
                opacity-0 translate-x-1
                group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-150
              ">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ════════════════════════ MAIN ════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] z-30">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150"
              aria-label="Toggle sidebar"
            >
              {mobileOpen ? <LuX size={20} /> : <LuMenu size={20} />}
            </button>

            {/* Current page label */}
            <span className="hidden sm:block text-sm font-semibold text-slate-700">
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? "Admin"}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150">
              <LuBell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-[2px] border-white"
                style={{ backgroundColor: ACCENT }}
              />
            </button>

            <div className="w-px h-7 bg-slate-200 hidden sm:block mx-1" />

            {/* User */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 select-none"
                style={{ backgroundColor: ACCENT }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
              </div>
              <div className="hidden md:flex flex-col leading-none">
                <span className="text-[13px] font-semibold text-slate-800 truncate max-w-[130px]">
                  {user?.name ?? "Admin"}
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: ACCENT }}
                >
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}