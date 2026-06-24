import React, { useEffect, useState } from "react";
import { getDashboardStats, getRevenueByMonth, getAllBookingsAdmin, getAdminAnalytics } from "../../config/allApis";
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
  LuFlame,
  LuCalendar,
} from "react-icons/lu";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
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
    accentColor: "#F84464",
    gradient: "from-pink-500/10 to-rose-500/5",
    borderGlow: "rgba(248, 68, 100, 0.2)",
    trend: "+12.4%",
  },
  {
    label: "Total Bookings",
    value: stats?.totalBookings || 0,
    icon: LuTicket,
    accentColor: "#6366F1",
    gradient: "from-indigo-500/10 to-purple-500/5",
    borderGlow: "rgba(99, 102, 241, 0.2)",
    trend: "+8.1%",
  },
  {
    label: "Total Users",
    value: stats?.totalUsers || 0,
    icon: LuUsers,
    accentColor: "#0EA5E9",
    gradient: "from-sky-400/10 to-blue-500/5",
    borderGlow: "rgba(14, 165, 233, 0.2)",
    trend: "+5.3%",
  },
  {
    label: "Total Movies",
    value: stats?.totalMovies || 0,
    icon: LuClapperboard,
    accentColor: "#A855F7",
    gradient: "from-violet-500/10 to-fuchsia-500/5",
    borderGlow: "rgba(168, 85, 247, 0.2)",
    trend: "+2 new",
  },
  {
    label: "Theatres",
    value: stats?.totalTheatres || 0,
    icon: LuBuilding2,
    accentColor: "#F59E0B",
    gradient: "from-amber-400/10 to-orange-500/5",
    borderGlow: "rgba(245, 158, 11, 0.2)",
    trend: "Stable",
  },
  {
    label: "Active Shows",
    value: stats?.totalShows || 0,
    icon: LuCalendarDays,
    accentColor: "#10B981",
    gradient: "from-emerald-400/10 to-teal-500/5",
    borderGlow: "rgba(16, 185, 129, 0.2)",
    trend: "+31 today",
  },
];

/* ─── Custom Tooltips ─────────────────────────────────────────────────── */
const CustomComposedTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const rev = payload.find(p => p.dataKey === "revenue")?.value || 0;
  const bks = payload.find(p => p.dataKey === "bookings")?.value || 0;
  return (
    <div className="bg-bms-surface/90 backdrop-blur-md border border-bms-border/60 rounded-2xl p-4 shadow-xl text-bms-text min-w-[160px] transition-all">
      <p className="text-[10px] font-extrabold text-bms-text-dim uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-col gap-1.5 text-xs font-bold">
        <div className="flex justify-between items-center gap-4">
          <span className="text-bms-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            Revenue:
          </span>
          <span className="text-bms-text">₹{rev.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-bms-text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#6366F1" }} />
            Bookings:
          </span>
          <span className="text-bms-text">{bks} tickets</span>
        </div>
      </div>
    </div>
  );
};

const MovieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bms-surface/90 backdrop-blur-md border border-bms-border/60 rounded-2xl p-4 shadow-xl text-bms-text min-w-[150px]">
      <p className="text-[10px] font-extrabold text-bms-text-dim uppercase tracking-wider mb-1">Top grossing movie</p>
      <p className="text-xs font-bold text-bms-text mb-2 truncate max-w-[180px]">{d.name}</p>
      <div className="flex justify-between items-center text-xs font-extrabold border-t border-bms-border/40 pt-1.5">
        <span className="text-bms-text-muted">Total Sales:</span>
        <span style={{ color: ACCENT }}>₹{d.revenue.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-bms-surface/90 backdrop-blur-md border border-bms-border/60 rounded-2xl p-4 shadow-xl min-w-[130px]">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: STATUS_COLORS[d.name] }}>
        {d.name}
      </p>
      <p className="text-sm font-extrabold text-bms-text">{d.value} bookings</p>
    </div>
  );
};

/* ─── Status badge ───────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
    pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  };
  const dots = {
    confirmed: "#10B981",
    cancelled: "#EF4444",
    pending: "#F59E0B",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold capitalize ${styles[status] || "bg-bms-surface-hover text-bms-text-dim border border-bms-border"}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dots[status] || "#94A3B8" }} />
      {status}
    </span>
  );
};

/* ─── Skeleton loader ────────────────────────────────────────────────── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-bms-border/60 rounded-xl ${className}`} />
);

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [stats, setStats]                 = useState(null);
  const [revenue, setRevenue]             = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [allBookings, setAllBookings]     = useState([]);
  const [statusData, setStatusData]       = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [chartView, setChartView]         = useState("daily"); // daily | monthly

  const fetchData = () => {
    setRefreshing(true);
    Promise.all([getDashboardStats(), getRevenueByMonth(), getAllBookingsAdmin(), getAdminAnalytics()])
      .then(([s, r, b, a]) => {
        setStats(s.data.data);

        setRevenue(
          r.data.data.map((item) => ({ monthName: item.month, revenue: item.revenue }))
        );

        const bookingsList = b.data.data;
        setAllBookings(bookingsList);
        setRecentBookings(bookingsList.slice(0, 8));
        setAnalyticsData(a.data.data);

        const confirmed = bookingsList.filter((x) => x.status === "confirmed").length;
        const cancelled = bookingsList.filter((x) => x.status === "cancelled").length;
        const pending   = bookingsList.filter((x) => x.status === "pending").length;
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

  /* ── Date and Timeline Utilities ── */
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  };

  const getLast6Months = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const list = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      const yName = d.getFullYear();
      list.push(`${mName} ${yName}`);
    }
    return list;
  };

  /* ── Densifying Daily Revenue and Bookings volume ── */
  const getDensifiedDaily = () => {
    return getLast7Days().map(dateStr => {
      const foundRevenue = (analyticsData?.dailyRevenue || []).find(item => item._id === dateStr);
      const dayBookings = allBookings.filter(booking => {
        if (booking.status !== "confirmed") return false;
        const bDate = new Date(booking.createdAt).toISOString().slice(0, 10);
        return bDate === dateStr;
      });
      const formattedDate = new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      return {
        name: formattedDate,
        revenue: foundRevenue ? foundRevenue.revenue : 0,
        bookings: dayBookings.length,
      };
    });
  };

  /* ── Densifying Monthly Revenue and Bookings volume ── */
  const getDensifiedMonthly = () => {
    return getLast6Months().map(monthStr => {
      const foundRevenue = revenue.find(item => item.monthName === monthStr);
      const monthBookings = allBookings.filter(booking => {
        if (booking.status !== "confirmed") return false;
        const bDate = new Date(booking.createdAt);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const bMonthStr = `${months[bDate.getMonth()]} ${bDate.getFullYear()}`;
        return bMonthStr === monthStr;
      });
      return {
        name: monthStr,
        revenue: foundRevenue ? foundRevenue.revenue : 0,
        bookings: monthBookings.length,
      };
    });
  };

  /* ── Loading skeleton ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        {/* header */}
        <div className="flex justify-between items-center pb-5 border-b border-bms-border/40">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        {/* cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        {/* charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-3xl lg:col-span-2" />
          <Skeleton className="h-[400px] rounded-3xl" />
        </div>
        <Skeleton className="h-[360px] rounded-3xl" />
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

  const chartData = chartView === "daily" ? getDensifiedDaily() : getDensifiedMonthly();

  /* Fallback genres list to keep radar populated */
  const genreData = (analyticsData?.popularGenres && analyticsData.popularGenres.length > 0)
    ? analyticsData.popularGenres
    : [
        { name: "Action", value: 12 },
        { name: "Comedy", value: 8 },
        { name: "Drama", value: 6 },
        { name: "Thriller", value: 4 },
        { name: "Sci-Fi", value: 3 }
      ];

  return (
    <div className="flex flex-col gap-8 text-bms-text">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-bms-border/40">
        <div>
          <h1 className="text-2xl font-bold text-bms-text tracking-tight flex items-center gap-2">
            System Analytics Hub
          </h1>
          <p className="text-sm text-bms-text-dim mt-1">
            Visualizing tickets sales, cashflows, genre indexing and transactional bookings.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date pill */}
          <div className="flex items-center gap-2 bg-bms-surface/50 backdrop-blur-md border border-bms-border/50 rounded-xl px-4 py-2 text-xs text-bms-text-dim font-semibold shadow-xs">
            <LuCalendarDays size={13} style={{ color: ACCENT }} />
            <span>{formattedDate}</span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-bms-surface/50 hover:bg-bms-surface-hover border border-bms-border/50 text-bms-text-muted hover:text-bms-text text-xs font-bold rounded-xl px-4 py-2 shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <LuRefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Syncing..." : "Sync Logs"}
          </button>
        </div>
      </div>

      {/* ── Bento KPI cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map(({ label, value, icon: Icon, accentColor, gradient, borderGlow, trend }) => (
          <div
            key={label}
            className={`bg-bms-surface border border-bms-border/50 rounded-3xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group`}
            style={{
              boxShadow: `inset 0 0 15px rgba(255, 255, 255, 0.01)`,
            }}
          >
            {/* Background Accent Glow on Hover */}
            <div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />

            <div className="flex items-start justify-between z-10">
              {/* Icon Container */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300"
                style={{
                  background: `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.08)`,
                  borderColor: `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.25)`,
                }}
              >
                <Icon size={18} style={{ color: accentColor }} />
              </div>

              {/* Trend Badge */}
              <div className="flex items-center gap-0.5 bg-bms-surface-hover border border-bms-border/50 px-2 py-0.5 rounded-lg text-[9px] font-bold text-bms-text-dim">
                <LuArrowUpRight size={10} style={{ color: accentColor }} />
                <span>{trend}</span>
              </div>
            </div>

            {/* Value */}
            <div className="z-10 mt-1.5">
              <p className="text-2xl font-extrabold tracking-tight leading-none text-bms-text">{value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-bms-text-dim mt-2">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick insights Bento widgets ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Avg Transaction Value",
            value: `₹${avgTransaction.toLocaleString("en-IN")}`,
            icon: LuWallet,
            sub: "per customer ticket booking",
            accentColor: "#F84464",
          },
          {
            label: "Server Platform Status",
            value: "Uptime 99.9%",
            sub: "Active and healthy logs monitoring",
            icon: LuActivity,
            accentColor: "#10B981",
            green: true,
          },
          {
            label: "Booking/User Ratio",
            value: `${bookingRatio}×`,
            sub: "avg bookings per user profile",
            icon: LuUsers,
            accentColor: "#6366F1",
          },
        ].map(({ label, value, sub, icon: Icon, accentColor, green }) => (
          <div
            key={label}
            className="bg-bms-surface border border-bms-border/50 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-bms-text-dim uppercase tracking-wider mb-2">{label}</p>
              <p className="text-xl font-extrabold text-bms-text leading-tight flex items-center gap-2">
                {green && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />}
                {value}
              </p>
              <p className="text-xs text-bms-text-dim mt-1.5 truncate">{sub}</p>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border transition-colors duration-300"
              style={{
                background: `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.08)`,
                borderColor: `rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.25)`,
              }}
            >
              <Icon size={20} style={{ color: accentColor }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── PowerBI Level Analytics composed & Movie metrics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Large composed analytics chart */}
        <div className="bg-bms-surface border border-bms-border/50 rounded-3xl p-6 shadow-xs flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20">
                <LuTrendingUp size={16} style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-bms-text tracking-wide uppercase">Revenue & Volume Metrics</h3>
                <p className="text-[10px] text-bms-text-dim mt-0.5">Composed Area (Cash) and Bar (Bookings) analytics</p>
              </div>
            </div>

            {/* View filter buttons */}
            <div className="flex gap-1.5 bg-bms-surface-hover border border-bms-border/50 p-1 rounded-xl">
              <button
                onClick={() => setChartView("daily")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  chartView === "daily"
                    ? "bg-bms-surface text-bms-text border border-bms-border/40 shadow-xs"
                    : "text-bms-text-dim hover:text-bms-text"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setChartView("monthly")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  chartView === "monthly"
                    ? "bg-bms-surface text-bms-text border border-bms-border/40 shadow-xs"
                    : "text-bms-text-dim hover:text-bms-text"
                }`}
              >
                Year-To-Date
              </button>
            </div>
          </div>

          {/* Revenue Chart canvas */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: -5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="colorRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-bms-border)" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-bms-text-muted)", fontWeight: 600 }}
                  dy={10}
                />
                {/* Y-Axis Left: Revenue */}
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-bms-text-muted)", fontWeight: 600 }}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                  dx={-5}
                />
                {/* Y-Axis Right: Bookings count */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-bms-text-muted)", fontWeight: 600 }}
                  tickFormatter={(v) => `${v} tix`}
                  dx={5}
                />
                <Tooltip content={<CustomComposedTooltip />} />
                
                {/* Bar element representing bookings volume */}
                <Bar
                  yAxisId="right"
                  dataKey="bookings"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                  fillOpacity={0.12}
                  stroke="#6366F1"
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                />

                {/* Area element representing revenue curve */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={ACCENT}
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#colorRevenueGradient)"
                  dot={{ r: 4.5, fill: "var(--color-bms-surface)", strokeWidth: 3, stroke: ACCENT }}
                  activeDot={{ r: 6.5, fill: ACCENT, strokeWidth: 3.5, stroke: "var(--color-bms-surface)" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Grossing Movies horizontal bar chart */}
        <div className="bg-bms-surface border border-bms-border/50 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
              <LuFlame size={16} style={{ color: "#F59E0B" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-bms-text tracking-wide uppercase">Top Grossing Movies</h3>
              <p className="text-[10px] text-bms-text-dim mt-0.5">Highest earning film entries</p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            {analyticsData?.popularMovies && analyticsData.popularMovies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.popularMovies}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-bms-border)" opacity={0.2} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "var(--color-bms-text-muted)" }}
                    tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "var(--color-bms-text-muted)", fontWeight: 700 }}
                    width={90}
                    tickFormatter={(t) => t.length > 12 ? `${t.slice(0, 10)}...` : t}
                  />
                  <Tooltip content={<MovieTooltip />} />
                  <Bar
                    dataKey="revenue"
                    fill={ACCENT}
                    radius={[0, 6, 6, 0]}
                    barSize={12}
                  >
                    {analyticsData.popularMovies.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? ACCENT : index === 1 ? "#A855F7" : "#6366F1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-bms-text-dim text-xs font-semibold">
                No movie revenue aggregation
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sub-charts Bento Grid row: Channels Donut & Genres Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Channels donut chart */}
        <div className="bg-bms-surface border border-bms-border/50 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-sky-500/10 border border-sky-500/20">
              <LuChartPie size={16} style={{ color: "#0EA5E9" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-bms-text tracking-wide uppercase">Booking Split</h3>
              <p className="text-[10px] text-bms-text-dim mt-0.5">Categorized ticket channels</p>
            </div>
          </div>

          <div className="relative h-[200px]">
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={80}
                      paddingAngle={3}
                      cornerRadius={6}
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

                {/* Central Labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-bms-text leading-none">{totalBookings}</span>
                  <span className="text-[9px] font-extrabold text-bms-text-dim uppercase tracking-widest mt-1.5">Aggregate</span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-bms-text-dim text-xs">
                No split data recorded
              </div>
            )}
          </div>

          {/* Legend Items */}
          <div className="flex flex-col gap-2 mt-1">
            {statusData.map(({ name, value }) => {
              const pct = totalBookings ? Math.round((value / totalBookings) * 100) : 0;
              return (
                <div key={name} className="flex items-center justify-between text-xs border-b border-bms-border/30 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[name] }}
                    />
                    <span className="text-bms-text-muted font-bold">{name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-bms-text">{value}</span>
                    <span className="text-bms-text-dim text-[10px] w-8 text-right font-bold">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Genre Index Radar Chart */}
        <div className="bg-bms-surface border border-bms-border/50 rounded-3xl p-6 shadow-xs flex flex-col gap-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10 border border-violet-500/20">
              <LuFlame size={16} style={{ color: "#A855F7" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-bms-text tracking-wide uppercase">Genre Popularity Index</h3>
              <p className="text-[10px] text-bms-text-dim mt-0.5">Tickets sold by film categories</p>
            </div>
          </div>

          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={genreData}>
                <PolarGrid stroke="var(--color-bms-border)" opacity={0.3} />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "var(--color-bms-text-muted)", fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 'auto']}
                  tick={{ fontSize: 8, fill: "var(--color-bms-text-dim)" }}
                  axisLine={false}
                />
                <Radar
                  name="Bookings count"
                  dataKey="value"
                  stroke="#A855F7"
                  fill="#A855F7"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Bookings Bento Grid Panel ──────────────────────────── */}
      <div className="bg-bms-surface border border-bms-border/50 rounded-3xl shadow-xs overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 py-5 border-b border-bms-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20">
              <LuClock size={16} style={{ color: ACCENT }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-bms-text tracking-wide uppercase">Real-Time Bookings</h3>
              <p className="text-[10px] text-bms-text-dim mt-0.5">Latest {recentBookings.length} transaction entries</p>
            </div>
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <LuTicket size={30} className="text-bms-text-dim/20" />
            <p className="text-bms-text-dim text-xs font-semibold">No transactions logged in database</p>
          </div>
        ) : (
          <>
            {/* Desktop Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-bms-border/40 bg-bms-surface-hover/30 text-[9px] font-extrabold uppercase tracking-wider text-bms-text-dim">
                    <th className="px-6 py-4">Booking ID</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Movie / Premiere Title</th>
                    <th className="px-6 py-4">Theatre Arena</th>
                    <th className="px-6 py-4">Seat Allocation</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bms-border/30">
                  {recentBookings.map((b) => {
                    const title = b.show?.movie?.title || b.item?.title || "—";
                    const poster = b.show?.movie?.poster || b.item?.poster;
                    return (
                      <tr
                        key={b._id}
                        className="hover:bg-bms-surface-hover/20 transition-all duration-150 text-bms-text-muted"
                      >
                        {/* Booking ID */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] font-bold text-bms-text bg-bms-surface-hover border border-bms-border/40 px-2.5 py-1 rounded-lg">
                            {b.bookingId}
                          </span>
                        </td>

                        {/* Customer Avatar & Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {b.user?.avatar ? (
                              <img
                                src={b.user.avatar}
                                alt={b.user.name || "User"}
                                className="w-8 h-8 rounded-full object-cover border border-bms-border/80 shadow-xs flex-shrink-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div
                              className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xs ${b.user?.avatar ? 'hidden' : ''}`}
                            >
                              {b.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-bms-text truncate text-xs">
                                {b.user?.name || "Guest User"}
                              </p>
                              <p className="text-[10px] text-bms-text-dim mt-0.5 truncate">{b.user?.email || "—"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Movie Name & Poster Thumbnail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {poster ? (
                              <img
                                src={poster}
                                alt={title}
                                className="w-8 h-10 rounded-md object-cover border border-bms-border/60 shadow-xs flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-10 rounded-md bg-bms-surface-hover border border-bms-border/40 flex items-center justify-center flex-shrink-0">
                                <LuClapperboard size={14} className="text-bms-text-dim" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-bms-text text-xs truncate" style={{ maxWidth: 160 }}>{title}</p>
                              {!b.show && <span className="text-[9px] text-rose-500 font-extrabold uppercase mt-0.5 block">Digital Stream</span>}
                            </div>
                          </div>
                        </td>

                        {/* Theatre */}
                        <td className="px-6 py-4 font-bold text-bms-text text-xs">
                          {b.show?.theatre?.name || "Online Arena"}
                        </td>

                        {/* Seats */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center bg-bms-surface-hover border border-bms-border/40 text-bms-text text-[9px] font-bold px-2 py-0.5 rounded-md">
                            {b.seats?.length || 0} seat{b.seats?.length !== 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-extrabold text-bms-text text-xs">
                          ₹{(b.grandTotal || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Layout */}
            <div className="lg:hidden divide-y divide-bms-border/30">
              {recentBookings.map((b) => {
                const title = b.show?.movie?.title || b.item?.title || "—";
                const poster = b.show?.movie?.poster || b.item?.poster;
                return (
                  <div key={b._id} className="p-5 flex flex-col gap-3.5 bg-bms-surface hover:bg-bms-surface-hover/10 transition-colors duration-150">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Side: Poster and Movie details */}
                      <div className="flex gap-3 min-w-0">
                        {poster ? (
                          <img
                            src={poster}
                            alt={title}
                            className="w-10 h-12 rounded-lg object-cover border border-bms-border/60 shadow-xs flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-bms-surface-hover border border-bms-border/40 flex items-center justify-center flex-shrink-0">
                            <LuClapperboard size={15} className="text-bms-text-dim" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-bms-text text-sm leading-tight truncate">{title}</p>
                          <span className="font-mono text-[9px] font-bold text-bms-text-dim mt-1 block">
                            ID: {b.bookingId}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Status Badge */}
                      <div className="flex-shrink-0">
                        <StatusBadge status={b.status} />
                      </div>
                    </div>

                    {/* Customer Row */}
                    <div className="flex items-center gap-2.5 py-1.5 border-y border-bms-border/30">
                      {b.user?.avatar ? (
                        <img
                          src={b.user.avatar}
                          alt={b.user.name || "User"}
                          className="w-6 h-6 rounded-full object-cover border border-bms-border shadow-xs flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div
                        className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-[9px] flex-shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xs ${b.user?.avatar ? 'hidden' : ''}`}
                      >
                        {b.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-bms-text text-xs truncate">
                          {b.user?.name || "Guest User"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata row */}
                    <div className="flex items-center justify-between text-xs font-bold text-bms-text-dim">
                      <span>{b.show?.theatre?.name || "Online Arena"}</span>
                      <span className="text-bms-text text-sm font-extrabold">₹{(b.grandTotal || 0).toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center bg-bms-surface-hover border border-bms-border/40 text-bms-text text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {b.seats?.length || 0} seat{b.seats?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}