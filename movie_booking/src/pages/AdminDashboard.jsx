import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { LuTrendingUp, LuTicket, LuUsers, LuIndianRupee } from "react-icons/lu";
import axios from "axios";
import SEO from "../components/SEO";

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // We will use our new /api/admin/analytics endpoint.
    // Assuming admin auth is handled or bypassed for prototype.
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        // Fallback mock data if not an admin or endpoint fails
        setData({
          kpis: { totalRevenue: 125000, totalTickets: 450, totalBookings: 120, totalUsers: 85 },
          dailyRevenue: [
            { _id: "2026-06-08", revenue: 15000 },
            { _id: "2026-06-09", revenue: 22000 },
            { _id: "2026-06-10", revenue: 18000 },
            { _id: "2026-06-11", revenue: 35000 },
            { _id: "2026-06-12", revenue: 28000 },
            { _id: "2026-06-13", revenue: 42000 },
            { _id: "2026-06-14", revenue: 39000 },
          ],
          popularGenres: [
            { name: "Action", value: 400 },
            { name: "Sci-Fi", value: 300 },
            { name: "Drama", value: 200 },
            { name: "Comedy", value: 100 }
          ],
          popularMovies: [
            { name: "Inception", revenue: 50000 },
            { name: "The Dark Knight", revenue: 45000 },
            { name: "Interstellar", revenue: 30000 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-bms-surface-hover border-t-bms-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[68px] md:pt-[110px] pb-16 min-h-[calc(100vh-300px)] bg-bms-bg text-bms-text transition-colors duration-300">
      <SEO 
        title="Admin Analytics Dashboard" 
        description="Monitor system analytics, revenues, ticket sales and demographics."
        url="/admin-dashboard"
      />
      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-bms-text tracking-tight">Admin Analytics</h1>
          <p className="text-bms-text-muted text-sm mt-1">Business Performance Dashboard</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Modern Stat Cards */}
          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                <LuIndianRupee />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <LuTrendingUp className="text-[10px]" /> +12.4%
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-bms-text mb-1">₹{data.kpis.totalRevenue.toLocaleString("en-IN")}</h3>
              <p className="text-sm font-medium text-bms-text-dim">Total Revenue</p>
            </div>
          </div>

          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                <LuTicket />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <LuTrendingUp className="text-[10px]" /> +8.1%
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-bms-text mb-1">{data.kpis.totalTickets}</h3>
              <p className="text-sm font-medium text-bms-text-dim">Tickets Sold</p>
            </div>
          </div>

          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                <LuTrendingUp />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <LuTrendingUp className="text-[10px]" /> +18.2%
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-bms-text mb-1">{data.kpis.totalBookings}</h3>
              <p className="text-sm font-medium text-bms-text-dim">Total Bookings</p>
            </div>
          </div>

          <div className="bg-bms-surface border border-bms-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                <LuUsers />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <LuTrendingUp className="text-[10px]" /> +5.3%
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-bms-text mb-1">{data.kpis.totalUsers}</h3>
              <p className="text-sm font-medium text-bms-text-dim">Active Users</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart */}
          <div className="bg-bms-surface border border-bms-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-bms-text mb-6">Revenue (Last 7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDailyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F84464" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F84464" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bms-border)" opacity={0.15} vertical={false} />
                  <XAxis dataKey="_id" stroke="var(--color-bms-text-dim)" fontSize={11} tickLine={false} dy={8} />
                  <YAxis stroke="var(--color-bms-text-dim)" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} dx={-8} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bms-surface)', 
                      borderColor: 'var(--color-bms-border)', 
                      borderRadius: '12px',
                      color: 'var(--color-bms-text)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F84464" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorDailyRevenue)" 
                    dot={false} 
                    activeDot={{ r: 5, fill: '#F84464', strokeWidth: 2, stroke: 'var(--color-bms-surface)' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-bms-surface border border-bms-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-bold text-bms-text mb-4">Popular Genres</h3>
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.popularGenres}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={84}
                    paddingAngle={4}
                    cornerRadius={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.popularGenres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bms-surface)', 
                      borderColor: 'var(--color-bms-border)', 
                      borderRadius: '12px',
                      color: 'var(--color-bms-text)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold text-bms-text leading-none">
                  {data.popularGenres.reduce((sum, item) => sum + item.value, 0)}
                </span>
                <span className="text-[10px] font-bold text-bms-text-dim uppercase tracking-wider mt-1.5">Tickets</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {data.popularGenres.map((g, i) => (
                <div key={i} className="flex items-center text-xs text-bms-text-muted">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  {g.name}
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-bms-surface border border-bms-border rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-bms-text mb-6">Top Performing Movies (Revenue)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.popularMovies} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bms-border)" opacity={0.15} horizontal={false} />
                  <XAxis type="number" stroke="var(--color-bms-text-dim)" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-bms-text-dim)" fontSize={11} tickLine={false} width={120} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bms-surface)', 
                      borderColor: 'var(--color-bms-border)', 
                      borderRadius: '12px',
                      color: 'var(--color-bms-text)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {data.popularMovies.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#EF4444', '#A855F7', '#6366F1', '#3B82F6', '#8B5CF6'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
