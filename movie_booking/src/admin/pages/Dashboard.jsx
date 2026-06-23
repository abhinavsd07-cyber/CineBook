import React, { useEffect, useState } from "react";
import { getDashboardStats, getRevenueByMonth, getAllBookingsAdmin } from "../../config/allApis";
import {
  LuIndianRupee,
  LuTicket,
  LuUsers,
  LuClapperboard,
  LuBuilding2,
  LuCalendarDays,
  LuTrendingUp,
  LuRefreshCw,
  LuWallet,
  LuActivity,
  LuArrowUpRight,
  LuChartPie,
  LuClock,
} from "react-icons/lu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

/* ─── Constants ─────────────────────────────────────────────────────── */
const ACCENT = "#F84464";

const STATUS_COLORS = {
  Confirmed: "#10B981",
  Cancelled: "#EF4444",
  Pending:   "#F59E0B",
};

const makeStatCards = (stats) => [
  {
    label: "Total Revenue",
    value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
    icon: LuIndianRupee,
    gradient: "from-pink-500 to-rose-500",
    shadow: "shadow-rose-200",
    trend: "+12.4%",
  },
  {
    label: "Total Bookings",
    value: stats?.totalBookings || 0,
    icon: LuTicket,
    gradient: "from-indigo-500 to-purple-500",
    shadow: "shadow-indigo-200",
    trend: "+8.1%",
  },
  {
    label: "Total Users",
    value: stats?.totalUsers || 0,
    icon: LuUsers,
    gradient: "from-sky-400 to-blue-500",
    shadow: "shadow-blue-200",
    trend: "+5.3%",
  },
  {
    label: "Total Movies",
    value: stats?.totalMovies || 0,
    icon: LuClapperboard,
    gradient: "from-violet-500 to-fuchsia-500",
    shadow: "shadow-violet-200",
    trend: "+2",
  },
  {
    label: "Theatres",
    value: stats?.totalTheatres || 0,
    icon: LuBuilding2,
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200",
    trend: "Stable",
  },
  {
    label: "Active Shows",
    value: stats?.totalShows || 0,
    icon: LuCalendarDays,
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200",
    trend: "+31",
  },
];

/* ─── Chart tooltips ─────────────────────────────────────────────────── */
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-slate-800 min-w-[140px]">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm font-bold" style={{ color: ACCENT }}>
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg min-w-[120px]">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: STATUS_COLORS[d.name] }}>
        {d.name}
      </p>
      <p className="text-sm font-bold text-slate-800">{d.value} bookings</p>
    </div>
  );
};

/* ─── Status badge ───────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    cancelled: "bg-red-50 text-red-500 border border-red-200",
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
  };
  const dots = {
    confirmed: "#10B981",
    cancelled: "#EF4444",
    pending: "#F59E0B",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${styles[status] || "bg-slate-50 text-slate-400 border border-slate-200"}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dots[status] || "#94A3B8" }} />
      {status}
    </span>
  );
};

/* ─── Skeleton loader ────────────────────────────────────────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [stats, setStats]               = useState(null);
  const [revenue, setRevenue]           = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [statusData, setStatusData]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    Promise.all([getDashboardStats(), getRevenueByMonth(), getAllBookingsAdmin()])
      .then(([s, r, b]) => {
        setStats(s.data.data);

        setRevenue(
          r.data.data.map((item) => ({ monthName: item.month, revenue: item.revenue }))
        );

        setRecentBookings(b.data.data.slice(0, 8));

        const all = b.data.data;
        const confirmed = all.filter((x) => x.status === "confirmed").length;
        const cancelled = all.filter((x) => x.status === "cancelled").length;
        const pending   = all.filter((x) => x.status === "pending").length;
        setStatusData(
          [
            { name: "Confirmed", value: confirmed },
            { name: "Cancelled", value: cancelled },
            { name: "Pending",   value: pending   },
          ].filter((x) => x.value > 0)
        );
      })
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  /* ── Loading skeleton ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        {/* cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[90px] rounded-xl" />
          ))}
        </div>
        {/* charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-[380px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[380px] rounded-2xl" />
        </div>
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    );
  }

  const statCards        = makeStatCards(stats);
  const totalBookings    = statusData.reduce((s, i) => s + i.value, 0);
  const avgTransaction   = stats?.totalBookings
    ? Math.round(stats.totalRevenue / stats.totalBookings)
    : 0;
  const bookingRatio     = stats?.totalUsers
    ? (stats.totalBookings / stats.totalUsers).toFixed(1)
    : 0;

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 text-slate-800">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-start gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor booking trends, ticket sales, revenue metrics and venue logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date pill */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-medium shadow-sm">
            <LuCalendarDays size={13} className="text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg px-3 py-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── KPI stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map(({ label, value, icon: Icon, gradient, shadow, trend }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 shadow-lg ${shadow} hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 text-white relative overflow-hidden group`}
          >
            {/* Background Decoration */}
            <div className="absolute -right-4 -top-4 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
              <Icon size={90} />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-inner">
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                <LuArrowUpRight size={12} />
                <span>{trend}</span>
              </div>
            </div>

            <div className="relative z-10 mt-2">
              <p className="text-3xl font-extrabold mb-1 drop-shadow-md">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick insights ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Avg Transaction Value",
            value: `₹${avgTransaction.toLocaleString("en-IN")}`,
            icon: LuWallet,
            sub: "per booking",
            gradient: "from-rose-50 to-pink-50",
            iconColor: "#e11d48",
            iconBg: "bg-rose-100",
          },
          {
            label: "System Health",
            value: "Healthy",
            sub: "99.9% uptime",
            icon: LuActivity,
            gradient: "from-emerald-50 to-teal-50",
            iconColor: "#059669",
            iconBg: "bg-emerald-100",
            green: true,
          },
          {
            label: "Booking / User Ratio",
            value: `${bookingRatio}×`,
            sub: "bookings per user",
            icon: LuUsers,
            gradient: "from-indigo-50 to-blue-50",
            iconColor: "#4f46e5",
            iconBg: "bg-indigo-100",
          },
        ].map(({ label, value, sub, icon: Icon, gradient, iconColor, iconBg, green }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} border border-white/60 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 transition-transform hover:scale-[1.02]`}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
              <p className="text-2xl font-extrabold text-slate-800 leading-tight flex items-center gap-2">
                {green && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />}
                {value}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${iconBg}`}>
              <Icon size={22} style={{ color: iconColor }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue area chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF1F4" }}>
                <LuTrendingUp size={16} style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Monthly Revenue</h3>
                <p className="text-[10px] text-slate-400">Year-to-date trend</p>
              </div>
            </div>
            {/* Total */}
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">Total</p>
              <p className="text-base font-bold text-slate-900">
                ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="h-[280px]">
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue} margin={{ top: 15, right: 15, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="monthName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                    tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                    dx={-10}
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={ACCENT}
                    strokeWidth={4}
                    dot={{ r: 5, fill: "#fff", strokeWidth: 3, stroke: ACCENT }}
                    activeDot={{ r: 7, fill: ACCENT, strokeWidth: 3, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm font-medium">
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F0F9FF" }}>
              <LuChartPie size={16} style={{ color: "#0EA5E9" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Booking Status</h3>
              <p className="text-[10px] text-slate-400">All-time distribution</p>
            </div>
          </div>

          <div className="relative h-[220px]">
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={82}
                      paddingAngle={3}
                      cornerRadius={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-900 leading-none">{totalBookings}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 mt-1">
            {statusData.map(({ name, value }) => {
              const pct = totalBookings ? Math.round((value / totalBookings) * 100) : 0;
              return (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[name] }}
                    />
                    <span className="text-slate-600 font-medium">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{value}</span>
                    <span className="text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Bookings table ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF1F4" }}>
              <LuClock size={15} style={{ color: ACCENT }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Bookings</h3>
              <p className="text-[10px] text-slate-400">Latest {recentBookings.length} transactions</p>
            </div>
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <LuTicket size={28} className="text-slate-300" />
            <p className="text-slate-400 text-sm font-medium">No bookings recorded yet.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ minWidth: "900px" }}>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Booking ID", "Customer", "Movie", "Theatre", "Seats", "Amount", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b) => (
                    <tr
                      key={b._id}
                      className="hover:bg-slate-50/70 transition-colors duration-100 text-slate-700"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {b.bookingId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {b.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-xs truncate">
                              {b.user?.name || "Guest"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{b.user?.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 text-xs">
                        {b.show?.movie?.title || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {b.show?.theatre?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {b.seats?.length || 0} seat{b.seats?.length !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-xs">
                        ₹{(b.grandTotal || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile / tablet cards ── */}
            <div className="lg:hidden divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <div key={b._id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                          style={{ backgroundColor: ACCENT }}
                        >
                          {b.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs truncate">
                          {b.user?.name || "Guest"}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">
                        {b.show?.movie?.title || "—"}
                      </p>
                      <span className="font-mono text-[10px] font-semibold text-slate-400">
                        {b.bookingId}
                      </span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{b.show?.theatre?.name || "—"}</span>
                    <span className="font-bold text-slate-900">₹{(b.grandTotal || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {b.seats?.length || 0} seat{b.seats?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}