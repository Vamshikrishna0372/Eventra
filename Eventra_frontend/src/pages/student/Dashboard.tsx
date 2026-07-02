import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/StatCard";
import EventCard from "@/components/EventCard";
import { 
  CalendarDays, CalendarCheck, Clock, TrendingUp, 
  ArrowRight, Loader2, MapPin, Calendar, Users, Star, 
  Sparkles, ChevronRight, Zap, Target, Trophy, Flame, CheckCircle, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [featuredEvent, setFeaturedEvent] = useState<any>(null);
  const [trendingEvents, setTrendingEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [featRes, trendRes, regsRes, allRes, leadRes] = await Promise.all([
        api.get("/events/featured"),
        api.get("/events/trending"),
        api.get(`/registrations/user/${user?.id}`, token || undefined),
        api.get("/events"),
        api.get("/analytics/leaderboard")
      ]);
      
      if (featRes.success) setFeaturedEvent(featRes.data);
      if (trendRes.success) setTrendingEvents(trendRes.data);
      if (regsRes.success) setRegistrations(regsRes.data);
      if (allRes.success) {
        const featId = featRes.data?.id || featRes.data?._id;
        setUpcomingEvents(allRes.data.filter((e: any) => (e.id || e._id) !== featId).slice(0, 6));
        
        // Filter for hackathons
        const hks = allRes.data.filter((e: any) => 
          (e.category?.toLowerCase() === "hackathon") || 
          e.title?.toLowerCase().includes("hackathon")
        );
        setHackathons(hks.slice(0, 3));
      }
      if (leadRes.success) setLeaderboard(leadRes.data);
    } catch (error) {
      toast.error("Dashboard synchronization slow...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, token]);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setRegistering(eventId);
    try {
      const response = await api.post("/registrations", { eventId }, token || undefined);
      if (response.success) {
        toast.success("Registration successful!");
        fetchDashboardData(); 
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-card rounded-xl border border-gray-200">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Personalizing your experience...</p>
        </div>
      </DashboardLayout>
    );
  }

  const confirmedCount = registrations.filter((r) => r.status === "confirmed" || r.registrationStatus === "confirmed").length;

  return (
    <DashboardLayout role="student">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Hi, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">
            Ready to explore campus life today? Discover what's new.
          </p>
        </div>
        
        <div className="flex bg-muted/40 p-1.5 rounded-xl border border-border">
           <Link to="/student/explore" className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95">Explore</Link>
           <Link to="/student/registrations" className="px-6 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all">My Events</Link>
        </div>
      </div>

      {/* Coordinator Banner */}
      {(user as any)?.isCoordinator && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/15 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">You have coordinator access</p>
              <p className="text-xs text-muted-foreground">Manage your assigned events, scan tickets and track attendance</p>
            </div>
          </div>
          <Link
            to="/coordinator"
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            Open Panel <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Spotlight Grid: Featured & Hackathons */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
        {/* Featured Card */}
        {featuredEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 group relative overflow-hidden rounded-xl bg-slate-900 shadow-md min-h-[400px] flex border border-white/5"
          >
             <div className="absolute inset-0 z-0">
               <img 
                 src={featuredEvent.imageUrl || featuredEvent.image || featuredEvent.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"} 
                 alt="" 
                 className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" 
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=800&fit=crop";
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
             </div>
             
             <div className="relative z-10 p-8 md:p-10 flex flex-col justify-end w-full">
                <div className="flex items-center gap-2 mb-4">
                   <div className="px-2.5 py-1 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Spotlight
                   </div>
                   <div className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-orange-400" /> Featured
                   </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 tracking-tight leading-tight">
                  {featuredEvent.title}
                </h2>
                
                <p className="text-sm text-slate-300 mb-6 max-w-xl font-normal line-clamp-2">
                  {featuredEvent.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-5 mb-8 text-white/80">
                   <div className="flex items-center gap-2 text-xs font-medium">
                      <Calendar className="w-4 h-4 text-primary" /> {formatDateTime(featuredEvent.date)}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium">
                      <MapPin className="w-4 h-4 text-primary" /> {featuredEvent.venue}
                   </div>
                </div>

                <div className="flex gap-3">
                   {registrations.some(r => r.eventId === (featuredEvent.id || featuredEvent._id) && (r.status === "confirmed" || r.registrationStatus === "confirmed")) ? (
                      <div className="px-6 py-2.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                         <CheckCircle className="w-4 h-4" /> Already Registered
                      </div>
                   ) : (
                      <button 
                        onClick={() => handleRegister(featuredEvent.id || featuredEvent._id)}
                        disabled={registering === (featuredEvent.id || featuredEvent._id)}
                        className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                      >
                         {registering === (featuredEvent.id || featuredEvent._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                         Reserve Spot
                      </button>
                   )}
                   <Link to={`/events/${featuredEvent.id || featuredEvent._id}`} className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold rounded-xl hover:bg-white/20 transition-all active:scale-95 text-center">
                      View Details
                   </Link>
                </div>
             </div>
          </motion.div>
        )}

        {/* Hackathons Position */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden flex flex-col"
        >
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                   Hackathons <Trophy className="w-5 h-5 text-primary" />
                 </h3>
                 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Campus Innovation</p>
              </div>
           </div>

           <div className="space-y-3 flex-1">
              {hackathons.length > 0 ? hackathons.map((hk, i) => (
                <Link 
                  to={`/events/${hk.id || hk._id}`} 
                  key={hk.id || hk._id || i}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-primary/5 hover:border-primary/20 transition-all border border-transparent shadow-sm"
                >
                   <div className="w-12 h-12 rounded-lg bg-card border border-border overflow-hidden shrink-0 transition-transform relative group-hover:scale-105">
                      <img 
                        src={hk.imageUrl || hk.image || hk.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"} 
                        alt={hk.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400";
                        }}
                      />
                   </div>
                   <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate tracking-tight text-foreground">{hk.title}</h4>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">{formatDateTime(hk.date)}</p>
                   </div>
                   <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                   </span>
                </Link>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                   <Zap className="w-8 h-8 mb-2" />
                   <p className="text-[10px] font-semibold uppercase tracking-wider">No hackathons currently live</p>
                </div>
              )}
           </div>

           <Link to="/student/explore?category=Hackathon" className="mt-6 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm">
              View All Challenges <ChevronRight className="w-3.5 h-3.5" />
           </Link>
        </motion.div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard title="Events Available" value={upcomingEvents.length + (featuredEvent ? 1 : 0)} icon={CalendarDays} delay={0} color="text-primary" />
        <StatCard title="My Bookings" value={registrations.length} icon={CalendarCheck} color="text-emerald-500" delay={0.1} />
        <StatCard title="Confirmed" value={confirmedCount} icon={CheckCircle} color="text-blue-500" delay={0.2} />
        <StatCard title="Trending Events" value={trendingEvents.length} icon={Flame} trend="+2 new today" delay={0.3} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Trending Events Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                 Trending Now <Flame className="w-6 h-6 text-orange-500" />
               </h2>
               <Link to="/student/explore" className="group flex items-center gap-2 text-xs font-semibold text-primary hover:underline transition-all">
                  See popularity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trendingEvents.map((event, idx) => (
                <motion.div 
                  key={event.id || event._id || idx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="group relative bg-card rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
                >
                   <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border shadow-sm">
                        <img 
                          src={event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400";
                          }}
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[8px] font-semibold text-white uppercase tracking-wider">#{idx + 1}</div>
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                          {typeof event.category === 'string' ? event.category : event.category?.name || "Event"}
                        </span>
                        <h3 className="text-base font-semibold text-foreground tracking-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-3">
                           <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.registeredCount} joined</span>
                        </div>
                        <Link to={`/events/${event.id || event._id}`} className={`mt-auto w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                          registrations.some(r => r.eventId === (event.id || event._id) && (r.status === "confirmed" || r.registrationStatus === "confirmed"))
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-muted hover:bg-primary hover:text-white"
                        }`}>
                          {registrations.some(r => r.eventId === (event.id || event._id) && (r.status === "confirmed" || r.registrationStatus === "confirmed")) ? "Registered" : "Check details"} 
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Regular Events Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                 Upcoming Events <Target className="w-6 h-6 text-primary" />
               </h2>
               <Link to="/student/explore" className="text-xs font-semibold text-primary hover:underline transition-all">
                  Browse all
               </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, i) => (
                <EventCard 
                  key={event.id || event._id || i} 
                  event={event} 
                  index={i} 
                  isRegistered={registrations.some(r => r.eventId === (event.id || event._id) && (r.status === "confirmed" || r.registrationStatus === "confirmed"))}
                  onRegister={handleRegister}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-10">
           {/* Discover Section */}
           <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold mb-6 tracking-tight flex items-center gap-2">Quick Discover <Sparkles className="w-4 h-4 text-emerald-500" /></h3>
              
              <div className="space-y-4">
                {[
                  { label: "Cultural Events", icon: Trophy, count: 12, color: "text-rose-500", bg: "bg-rose-50" },
                  { label: "Tech Summits", icon: Zap, count: 8, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Sports Meet", icon: Target, count: 5, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{item.label}</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.count} Active</p>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              <Link to="/student/categories" className="mt-8 w-full flex items-center justify-center py-3 bg-muted text-foreground hover:bg-gray-200 rounded-xl text-xs font-semibold transition-all">
                All Categories
              </Link>
           </div>

           {/* Leaderboard */}
           <div className="bg-card rounded-xl border border-gray-200 p-6 shadow-sm">
               <h3 className="text-lg font-semibold mb-6 tracking-tight flex items-center gap-2">Top Participants <Trophy className="w-5 h-5 text-amber-500" /></h3>
               
               <div className="space-y-3">
                 {leaderboard.slice(0, 5).map((u, i) => (
                    <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-muted/20 hover:bg-muted/40'}`}>
                       <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center font-bold text-xs shrink-0 relative">
                          {u.picture ? <img src={u.picture} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                          {i === 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${i === 0 ? 'text-amber-700' : 'text-foreground'}`}>
                             {i + 1}. {u.name}
                          </p>
                          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{u.eventsAttended} events</p>
                       </div>
                    </div>
                 ))}
               </div>
           </div>

           {/* Activity Card */}
           <div className="bg-slate-900 rounded-xl p-8 text-white shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
              
              <h3 className="text-xl font-semibold mb-6 tracking-tight">Your Activity</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Points Earned</p>
                    <p className="text-2xl font-semibold">{registrations.length * 150}</p>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (registrations.length * 150) / 2000 * 100)}%` }} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                 </div>
                 <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Next level: Campus Pro at 2,000</p>
                 <button className="w-full py-3 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold transition-all">View Achievement</button>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
