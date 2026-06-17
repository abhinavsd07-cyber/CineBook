import React, { useEffect, useState } from "react";
import { getDashboardStats, getRevenueByMonth, getAllBookingsAdmin } from "../../config/allApis";
import { 
  Clapperboard, 
  Building2, 
  Ticket, 
  IndianRupee, 
  Users, 
  Armchair, 
  TrendingUp, 
  RefreshCw,
  CalendarDays,
  Wallet
} from "lucide-react";
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
  Legend 
} from 'recharts';

const STATUS_COLORS = {
  'Confirmed': '#10B981',
  'Cancelled': '#EF4444',
  'Pending': '#F5A623'
};

// Premium custom tooltip for the Revenue Area Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bms-surface border border-bms-border p-4 rounded-xl shadow-lg backdrop-blur-md text-bms-text">
        <p className="text-[10px] font-bold text-bms-text-dim uppercase tracking-wider mb-2">{label}</p>
        <p className="text-sm font-semibold flex items-center gap-1.5">
          <span className="text-bms-accent">●</span>
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

// Premium custom tooltip for the Status Donut Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-bms-surface border border-bms-border p-4 rounded-xl shadow-lg backdrop-blur-md text-bms-text">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: STATUS_COLORS[data.name] }}>{data.name}</p>
        <p className="text-sm font-semibold">
          {data.value} bookings
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    Promise.all([getDashboardStats(), getRevenueByMonth(), getAllBookingsAdmin()])
      .then(([s, r, b]) => {
        setStats(s.data.data);
        
        // Format revenue for chart
        const formattedRevenue = r.data.data.map(item => ({
          ...item,
          monthName: item.month,
          revenue: item.revenue
        }));
        setRevenue(formattedRevenue);
        
        setRecentBookings(b.data.data.slice(0, 8));

        // Process status data for PieChart
        const confirmed = b.data.data.filter(x => x.status === 'confirmed').length;
        const cancelled = b.data.data.filter(x => x.status === 'cancelled').length;
        const pending = b.data.data.filter(x => x.status === 'pending').length;
        
        setStatusData([
          { name: 'Confirmed', value: confirmed },
          { name: 'Cancelled', value: cancelled },
          { name: 'Pending', value: pending }
        ].filter(x => x.value > 0));
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`, icon: <IndianRupee size={16} /> },
    { label: "Total Bookings", value: stats?.totalBookings || 0, icon: <Ticket size={16} /> },
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users size={16} /> },
    { label: "Total Movies", value: stats?.totalMovies || 0, icon: <Clapperboard size={16} /> },
    { label: "Total Theatres", value: stats?.totalTheatres || 0, icon: <Building2 size={16} /> },
    { label: "Active Shows", value: stats?.totalShows || 0, icon: <Armchair size={16} /> },
  ];

  const totalBookingsCount = statusData.reduce((sum, item) => sum + item.value, 0);
  const formattedDate = new Date().toLocaleDateString("en-IN", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex flex-col gap-5 animate-fade-in text-bms-text">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-bms-border pb-4">
        <div>
          <h1 className="text-xl font-bold">Dashboard Overview</h1>
          <p className="text-bms-text-muted text-sm mt-1">Monitor booking trends, ticket sales, revenue metrics and venue logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-bms-surface border border-bms-border px-3 py-1.5 rounded-lg text-xs text-bms-text-dim flex items-center gap-2 font-medium shadow-sm">
            <CalendarDays size={14} className="text-bms-text-muted" />
            <span>{formattedDate}</span>
          </div>
          <button 
            className="border border-bms-border bg-bms-surface hover:bg-bms-surface-hover text-bms-text text-sm font-medium rounded-lg px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50" 
            onClick={fetchData} 
            disabled={refreshing}
          >
            <RefreshCw className={`${refreshing ? "animate-spin" : ""} text-bms-text-muted`} size={13} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((c) => (
          <div 
            key={c.label} 
            className="bg-bms-surface border border-bms-border rounded-xl p-4 flex flex-col justify-center gap-3 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-bms-text-dim uppercase tracking-wider">{c.label}</span>
                <span className="text-xl font-bold text-bms-text mt-1">{c.value}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-bms-surface-hover flex items-center justify-center text-bms-text-muted flex-shrink-0">
                {c.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bms-surface border border-bms-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <h5 className="text-[11px] text-bms-text-dim font-semibold uppercase tracking-wider mb-1">Avg Transaction Value</h5>
            <p className="text-lg font-bold text-bms-text">₹{stats?.totalBookings ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString("en-IN") : 0}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-bms-surface-hover flex items-center justify-center text-bms-text-muted"><LuWallet size={14}/></div>
        </div>
        <div className="bg-bms-surface border border-bms-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <h5 className="text-[11px] text-bms-text-dim font-semibold uppercase tracking-wider mb-1">System Health</h5>
            <p className="text-lg font-bold text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Healthy (99.9%)</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-bms-surface-hover flex items-center justify-center text-bms-text-muted"><LuTrendingUp size={14}/></div>
        </div>
        <div className="bg-bms-surface border border-bms-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <h5 className="text-[11px] text-bms-text-dim font-semibold uppercase tracking-wider mb-1">User to Booking Ratio</h5>
            <p className="text-lg font-bold text-bms-text">{stats?.totalUsers ? (stats.totalBookings / stats.totalUsers).toFixed(1) : 0} <span className="text-sm font-medium text-bms-text-muted">bookings/user</span></p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-bms-surface-hover flex items-center justify-center text-bms-text-muted"><LuUsers size={14}/></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-sm flex flex-col gap-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-bms-text flex items-center gap-2.5">
            <TrendingUp size={18} className="text-bms-accent" />
            <span>Monthly Revenue Trends</span>
          </h3>
          <div className="h-[320px] w-full">
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F84464" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F84464" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-bms-border)" opacity={0.15} />
                  <XAxis 
                    dataKey="monthName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--color-bms-text-dim)', fontWeight: 500 }} 
                    dy={12} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--color-bms-text-dim)', fontWeight: 500 }} 
                    tickFormatter={(val) => val >= 1000 ? `₹${(val/1000).toFixed(0)}k` : `₹${val}`}
                    dx={-12}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(248, 68, 100, 0.2)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F84464" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    dot={false} 
                    activeDot={{ r: 5, fill: '#F84464', strokeWidth: 2, stroke: 'var(--color-bms-surface)' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-bms-text-dim font-semibold text-sm">
                No revenue records found
              </div>
            )}
          </div>
        </div>

        {/* Status Donut Chart */}
        <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-sm flex flex-col gap-6 relative">
          <h3 className="text-lg font-bold text-bms-text flex items-center gap-2.5">
            <Ticket size={18} className="text-bms-accent" />
            <span>Bookings by Status</span>
          </h3>
          <div className="h-[280px] w-full relative">
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={68}
                      outerRadius={88}
                      paddingAngle={4}
                      cornerRadius={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[41%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-3xl font-bold text-bms-text leading-none">{totalBookingsCount}</span>
                  <span className="text-[10px] font-bold text-bms-text-dim uppercase tracking-wider mt-1.5">Bookings</span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-bms-text-dim font-semibold text-sm">
                No booking status data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-bms-surface border border-bms-border rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-bms-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-bms-text flex items-center gap-2.5">
            <Ticket size={18} className="text-bms-accent" />
            <span>Recent Bookings</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-bms-border bg-bms-surface-hover/50 text-xs font-semibold text-bms-text-dim uppercase">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Movie</th>
                <th className="px-6 py-4">Theatre</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bms-border/50 text-sm">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-bms-surface-hover/30 transition-colors duration-150 text-bms-text">
                  <td className="px-6 py-4 font-mono font-bold text-xs">{b.bookingId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bms-accent to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {b.user?.name ? b.user.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-bms-text leading-tight">{b.user?.name || "Guest User"}</p>
                        <p className="text-xs text-bms-text-dim mt-0.5 leading-none">{b.user?.email || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{b.show?.movie?.title || "N/A"}</td>
                  <td className="px-6 py-4 text-bms-text-muted">{b.show?.theatre?.name || "N/A"}</td>
                  <td className="px-6 py-4">
                    <span className="bg-bms-surface-hover border border-bms-border text-bms-text text-xs px-2.5 py-1 rounded-md font-semibold">
                      {b.seats?.length || 0} Seat(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-bms-text">
                    ₹{(b.grandTotal || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize before:w-1.5 before:h-1.5 before:rounded-full before:bg-currentColor ${
                      b.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" :
                      b.status === 'cancelled' ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-500"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-bms-text-dim py-12">
                    No bookings recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
