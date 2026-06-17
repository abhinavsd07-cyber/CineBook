import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LuChartPie, LuFilm, LuBuilding2, LuArmchair, LuTicket, LuUsers, LuClapperboard, LuGlobe, LuLogOut, LuMenu } from "react-icons/lu";

const NAV_ITEMS = [
  { path: "/admin/dashboard", icon: <LuChartPie />, label: "Dashboard" },
  { path: "/admin/movies", icon: <LuFilm />, label: "Movies" },
  { path: "/admin/theatres", icon: <LuBuilding2 />, label: "Theatres" },
  { path: "/admin/shows", icon: <LuArmchair />, label: "Shows" },
  { path: "/admin/bookings", icon: <LuTicket />, label: "Bookings" },
  { path: "/admin/banners", icon: <LuClapperboard />, label: "Banners/Ads" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`bg-[#1E293B] text-slate-300 flex flex-col transition-all duration-300 flex-shrink-0 z-[100] fixed md:relative h-full ${
        collapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-64"
      }`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          {collapsed ? (
            <span className="text-bms-accent text-xl mx-auto"><LuClapperboard /></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 26" className="h-8 w-auto text-white mx-auto">
               <g fill="none">
                  <path fill="#F84464" d="m55.433 7.383-1.444-2.43-2.583 1.213-1.444-2.43L47.38 4.95l-1.445-2.43-2.582 1.215-1.445-2.43-2.582 1.212L37.88.087 35.3 1.3l-5.476 17.591 6.643 2.005a3.516 3.516 0 0 1 3.363-2.45c1.944 0 3.52 1.557 3.52 3.478l-.001.07c.016.315-.021.634-.118.946l6.756 2.042 5.446-17.6"/>
                  <path fill="#FFFFFF" d="M35.52 17.438a.705.705 0 0 1-.591-.705V8.122a.715.715 0 0 1 .724-.717h6.297c.164 0 .329.016.489.043a2.798 2.798 0 0 1 2.336 2.749v6.536a.705.705 0 0 1-.217.51.73.73 0 0 1-.641.195.704.704 0 0 1-.59-.705v-6.536a1.363 1.363 0 0 0-1.377-1.358h-1.372v7.894a.723.723 0 0 1-.86.705.705.705 0 0 1-.59-.705V8.838h-2.75v7.895a.704.704 0 0 1-.216.51.728.728 0 0 1-.642.195m10.47 3.752a.704.704 0 0 1-.592-.706.71.71 0 0 1 .209-.51.73.73 0 0 1 .516-.206c.61 0 1.14-.39 1.315-.97l.748-2.462-2.448-8.083a.722.722 0 0 1 .483-.904.742.742 0 0 1 .896.473l1.82 6.03 1.839-6.026c.091-.34.46-.556.839-.49l.051.011a.726.726 0 0 1 .489.907l-2.52 8.295-.796 2.655c-.206.61-.56 1.106-1.022 1.44-.5.365-1.086.557-1.694.557a.708.708 0 0 1-.133-.012"/>
                  <path fill="currentColor" d="M1.614 15.87h1.428c.788 0 1.43-.633 1.43-1.413v-4.141c0-.687-.498-1.272-1.183-1.391a1.501 1.501 0 0 0-.247-.022l-1.43.001.002 6.965zM.72 17.347a.732.732 0 0 1-.616-.734V3.758c0-.203.077-.391.218-.53a.751.751 0 0 1 .666-.203c.362.062.624.37.624.734v3.656h1.43a2.91 2.91 0 0 1 2.938 2.901l-.001 4.141c0 1.601-1.318 2.902-2.938 2.902H.86a.676.676 0 0 1-.14-.011zm10.376-8.508a1.478 1.478 0 0 0-.246-.02c-.801 0-1.43.62-1.43 1.412v4.313a1.413 1.413 0 0 0 1.43 1.412c.788 0 1.429-.632 1.43-1.412l-.001-4.313c0-.688-.498-1.272-1.183-1.392m-.763 8.564a2.905 2.905 0 0 1-2.42-2.86V10.23c0-.778.304-1.507.858-2.054a2.94 2.94 0 0 1 2.079-.847 2.91 2.91 0 0 1 2.938 2.902l-.001 4.313c0 .775-.308 1.504-.867 2.055a2.94 2.94 0 0 1-2.07.847 2.948 2.948 0 0 1-.517-.043m8.569-8.564a1.47 1.47 0 0 0-.245-.02c-.802 0-1.428.62-1.428 1.412v4.313a1.412 1.412 0 0 0 1.428 1.412c.378 0 .733-.146 1.005-.41.273-.268.424-.624.424-1.002V10.23c0-.687-.498-1.27-1.184-1.391m-.762 8.564a2.907 2.907 0 0 1-2.42-2.859v-4.313c0-1.601 1.317-2.903 2.937-2.903.17 0 .34.014.506.043a2.91 2.91 0 0 1 2.431 2.86v4.313c0 .777-.308 1.504-.867 2.055a2.94 2.94 0 0 1-2.07.847c-.174 0-.348-.014-.517-.043m6.002.031a.733.733 0 0 1-.614-.733V3.758a.735.735 0 0 1 .753-.745.746.746 0 0 1 .754.745v7.66l3.474-3.843a.766.766 0 0 1 .697-.228c.139.024.27.085.379.175.309.28.33.75.052 1.048l-2.615 2.88 2.717 4.902a.705.705 0 0 1 .066.553.732.732 0 0 1-.37.443.755.755 0 0 1-.5.082.749.749 0 0 1-.526-.356l-2.444-4.433-.93 1.013v3.047c0 .202-.08.39-.225.532a.758.758 0 0 1-.668.201m33.268-.008a2.782 2.782 0 0 1-1.96-1.355.75.75 0 0 1-.068-.569.739.739 0 0 1 .346-.45c.15-.084.33-.114.505-.084a.75.75 0 0 1 .525.358c.199.335.509.546.895.614.42.066.803-.048 1.116-.316.29-.267.442-.648.404-1.016a1.22 1.22 0 0 0-.548-.964l-2.031-1.425a2.708 2.708 0 0 1-1.155-2.013 2.642 2.642 0 0 1 .884-2.152 2.754 2.754 0 0 1 2.24-.694h.001c.856.15 1.555.63 1.95 1.323a.746.746 0 0 1 .07.563.747.747 0 0 1-.348.454.757.757 0 0 1-.504.083.747.747 0 0 1-.526-.357c-.172-.3-.482-.51-.856-.575a1.189 1.189 0 0 0-1.021.296c-.26.238-.403.596-.382.96.019.351.22.694.523.894l2.032 1.404a2.729 2.729 0 0 1 1.177 2.101 2.651 2.651 0 0 1-.906 2.214 2.84 2.84 0 0 1-2.307.714l-.055-.008m5.835.021a.75.75 0 0 1-.625-.735V3.77c0-.202.08-.39.226-.533a.762.762 0 0 1 .667-.2.733.733 0 0 1 .615.733v3.655h1.43c.174 0 .348.015.516.045a2.902 2.902 0 0 1 2.42 2.857l.001 6.385a.741.741 0 0 1-.883.734.747.747 0 0 1-.625-.735v-6.384a1.41 1.41 0 0 0-1.43-1.412h-1.429v7.797a.742.742 0 0 1-.754.746.781.781 0 0 1-.13-.01M73.609 8.85a1.429 1.429 0 0 0-1.26.39c-.268.265-.416.62-.416 1v4.316c0 .686.494 1.27 1.173 1.388a1.43 1.43 0 0 0 1.261-.388c.274-.268.424-.622.424-1.001V10.24c0-.687-.497-1.272-1.182-1.391m-.763 8.563a2.903 2.903 0 0 1-2.42-2.857V10.24c-.001-1.6 1.317-2.902 2.937-2.902.169 0 .34.013.506.043a2.91 2.91 0 0 1 2.43 2.859v4.315a2.856 2.856 0 0 1-.867 2.054 2.938 2.938 0 0 1-2.586.803m15.046-9.158a.712.712 0 0 0-.077-.545.781.781 0 0 0-.49-.342.747.747 0 0 0-.864.546 920.42 920.42 0 0 1-1.452 5.726l-.014.056-.013-.056c-.62-2.458-1.447-5.69-1.456-5.724a.706.706 0 0 0-.58-.55.75.75 0 0 0-.85.548c-.01.03-.819 3.268-1.454 5.726l-.014.056-.014-.056c-.618-2.458-1.447-5.695-1.455-5.726a.74.74 0 0 0-.889-.536.73.73 0 0 0-.542.877l2.185 8.632a.754.754 0 0 0 .714.556.708.708 0 0 0 .715-.557c.008-.033.837-3.27 1.456-5.73l.013-.054.016.054c.64 2.483 1.451 5.73 1.452 5.732a.754.754 0 0 0 .715.556.71.71 0 0 0 .714-.559l2.184-8.63"/>
               </g>
            </svg>
          )}
        </div>

        {!collapsed && <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-6 mb-2">Main Menu</p>}

        <nav className="flex-1 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer border-l-2 ${
                location.pathname === item.path 
                  ? "bg-slate-800/80 text-white border-bms-accent" 
                  : "border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
              title={collapsed ? item.label : ""}
              onClick={() => {
                if (window.innerWidth < 768) setCollapsed(true);
              }}
            >
              <span className="text-lg">{item.icon}</span>
              {!(collapsed && window.innerWidth >= 768) && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-700 flex flex-col gap-1">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-3.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-150">
              <span className="text-base"><LuGlobe /></span>
              <span>View Site</span>
            </Link>
          )}
          <button 
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer border-none bg-transparent w-full text-left text-red-400 hover:bg-red-950/20" 
            onClick={() => { logout(); navigate("/login"); }}
          >
            <span className="text-lg"><LuLogOut /></span>
            {!(collapsed && window.innerWidth >= 768) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-bms-border/50 flex items-center justify-between px-6 z-10 shadow-sm transition-colors duration-300">
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer border-none bg-transparent" onClick={() => setCollapsed(!collapsed)} id="sidebar-toggle">
            <LuMenu size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-bms-accent text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-bms-text leading-tight">{user?.name}</p>
                <p className="text-[10px] text-bms-accent font-semibold mt-0.5">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
