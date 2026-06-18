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
  AreaChart,
  Area,
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

/* ─── Stat card config ───────────────────────────────────────────────── */
const makeStatCards = (stats) => [
  {
    label: "Total Revenue",
    value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
    icon: LuIndianRupee,
    color: "#F84464",
    bg: "#FFF1F4",
    trend: "+12.4%",
  },
  {
    label: "Total Bookings",
    value: stats?.totalBookings || 0,
    icon: LuTicket,
    color: "#6366F1",
    bg: "#F0F0FF",
    trend: "+8.1%",
  },
  {
    label: "Total Users",
    value: stats?.totalUsers || 0,
    icon: LuUsers,
    color: "#0EA5E9",
    bg: "#F0F9FF",
    trend: "+5.3%",
  },
  {
    label: "Total Movies",
    value: stats?.totalMovies || 0,
    icon: LuClapperboard,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    trend: "+2",
  },
  {
    label: "Theatres",
    value: stats?.totalTheatres || 0,
    icon: LuBuilding2,
    color: "#F59E0B",
    bg: "#FFFBEB",
    trend: "Stable",
  },
  {
    label: "Active Shows",
    value: stats?.totalShows || 0,
    icon: LuCalendarDays,
    color: "#10B981",
    bg: "#F0FDF4",
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
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon size={17} style={{ color }} />
            </div>

            {/* Value + label */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5 leading-none">{value}</p>
            </div>

            {/* Trend badge */}
            <div className="flex items-center gap-1">
              <LuArrowUpRight size={11} style={{ color }} />
              <span className="text-[10px] font-semibold" style={{ color }}>{trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick insights ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Avg Transaction Value",
            value: `₹${avgTransaction.toLocaleString("en-IN")}`,
            icon: LuWallet,
            sub: "per booking",
            color: "#F84464",
          },
          {
            label: "System Health",
            value: "Healthy",
            sub: "99.9% uptime",
            icon: LuActivity,
            color: "#10B981",
            green: true,
          },
          {
            label: "Booking / User Ratio",
            value: `${bookingRatio}×`,
            sub: "bookings per user",
            icon: LuUsers,
            color: "#6366F1",
          },
        ].map(({ label, value, sub, icon: Icon, color, green }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p
                className="text-lg font-bold leading-tight"
                style={{ color: green ? color : "inherit" }}
              >
                {green && (
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                    style={{ backgroundColor: color }}
                  />
                )}
                {value}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon size={18} style={{ color }} />
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
                <AreaChart data={revenue} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={ACCENT} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="monthName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 500 }}
                    tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                    dx={-8}
                  />
                  <Tooltip
                    content={<RevenueTooltip />}
                    cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={ACCENT}
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: ACCENT, strokeWidth: 2.5, stroke: "#fff" }}
                  />
                </AreaChart>
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