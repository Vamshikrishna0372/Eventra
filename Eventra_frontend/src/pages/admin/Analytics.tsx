import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/StatCard";
import { CalendarDays, Users, TrendingUp, BarChart3, Loader2, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const COLORS = ["hsl(239, 84%, 67%)", "hsl(330, 70%, 60%)", "hsl(25, 90%, 55%)", "hsl(174, 63%, 40%)", "hsl(45, 90%, 50%)", "hsl(270, 60%, 60%)"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const Analytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
    fetchAnalytics();
  }, [token]);

  if (loading || !data) {
    return (
      <DashboardLayout role="admin">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse font-medium">Gathering insights...</p>
        </div>
      </DashboardLayout>
    );
  }

  const categoryDist = data.categoryDistribution || {};
  const pieData = Object.entries(categoryDist).map(([name, value]) => ({ name, value: value as number }));
  const categoryChartData = Object.entries(categoryDist).map(([name, events]) => ({ name, events: events as number }));

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights into your event performance and registration trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Events" value={data.totalEvents} icon={CalendarDays} delay={0} />
        <StatCard title="Total Users" value={data.totalUsers || 0} icon={Users} color="text-accent" delay={0.1} />
        <StatCard title="Total Registrations" value={data.totalRegistrations} icon={BarChart3} color="text-primary" delay={0.2} />
        <StatCard title="Trending Category" value={data.trendingCategory || "None"} icon={Flame} delay={0.3} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-surface p-6">
          <h3 className="font-bold text-card-foreground mb-1">Events by Category</h3>
          <p className="text-xs text-muted-foreground mb-6">Number of events per category</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="events" fill="hsl(239, 84%, 67%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl shadow-surface p-6">
          <h3 className="font-bold text-card-foreground mb-1">Category Distribution</h3>
          <p className="text-xs text-muted-foreground mb-6">Proportional breakdown of events</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                dataKey="value"
                stroke="hsl(var(--card))"
                strokeWidth={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl shadow-surface p-6">
          <h3 className="font-bold text-card-foreground mb-1">Monthly Event Trends</h3>
          <p className="text-xs text-muted-foreground mb-6">Events created per month</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="events" stroke="hsl(239, 84%, 67%)" fill="url(#eventGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl shadow-surface p-6">
          <h3 className="font-bold text-card-foreground mb-1">Registration Trends</h3>
          <p className="text-xs text-muted-foreground mb-6">Monthly registration volume</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="registrations" stroke="hsl(174, 63%, 40%)" strokeWidth={2.5} dot={{ fill: "hsl(174, 63%, 40%)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
