import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/StatCard";
import { CalendarDays, Users, Zap, CheckCircle, PlusCircle, Settings, List, Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/analytics/overview", token || undefined);
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading || !data) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-card rounded-xl border border-gray-200">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing performance hub...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">Welcome back, {user?.name.split(" ")[0]}! Here's an overview of your campus impact.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/create" 
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Create Event
          </Link>
          <Link 
            to="/admin/manage" 
            className="flex items-center gap-2 px-6 py-2.5 bg-card border border-gray-200 text-foreground rounded-xl text-xs font-semibold shadow-sm hover:bg-muted transition-all"
          >
            <Settings className="w-3.5 h-3.5" /> Manage
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard title="Total Events" value={data.totalEvents} icon={CalendarDays} delay={0} />
        <StatCard title="Active Events" value={data.activeEvents} icon={Zap} color="text-primary" delay={0.05} />
        <StatCard title="Total Registrations" value={data.totalRegistrations} icon={Users} color="text-emerald-500" delay={0.1} />
        <StatCard title="Total Checked-In" value={data.totalCheckedIn || 0} icon={CheckCircle} color="text-blue-500" delay={0.15} />
        <StatCard title="Pending Review" value={data.pendingAttendees || 0} icon={Loader2} color="text-amber-500" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-gray-200 p-8 lg:col-span-2 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-foreground text-lg tracking-tight">Engagement Metrics</h3>
            <select className="bg-muted text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: "#94a3b8" }} />
                <Tooltip 
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  contentStyle={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", fontSize: "12px", padding: "12px" }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "24px", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }} />
                <Bar dataKey="events" name="Events Published" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="registrations" name="Registrations" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h3 className="font-semibold text-foreground text-lg tracking-tight mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {data.recentRegistrations.slice(0, 5).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-gray-100 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {r.studentName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{r.studentName}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-tight">{r.eventName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/manage" className="mt-6 flex items-center justify-center gap-2 py-2.5 bg-muted text-foreground hover:bg-gray-200 rounded-xl text-xs font-semibold transition-all">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="bg-slate-900 rounded-xl p-8 text-white shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <h3 className="font-semibold text-sm mb-6 relative z-10 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Command Center
            </h3>
            <div className="grid grid-cols-1 gap-2 relative z-10">
              <Link to="/admin/create" className="flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                <span className="text-[10px] font-semibold uppercase tracking-widest">New Event</span>
                <PlusCircle className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/manage" className="flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                <span className="text-[10px] font-semibold uppercase tracking-widest">Registrations</span>
                <List className="w-3.5 h-3.5" />
              </Link>
              <Link to="/admin/manage" className="flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all">
                <span className="text-[10px] font-semibold uppercase tracking-widest">Global Settings</span>
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
