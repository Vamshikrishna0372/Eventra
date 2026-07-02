import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Compass, CalendarCheck, User, LogOut,
  PlusCircle, Settings, BarChart3, Users, Menu, X, Moon, Sun,
  Layers, Bell, Search, ChevronLeft, ChevronRight, LayoutGrid,
  CalendarRange, Check, Clock, Sparkles, Ticket, ShieldCheck, QrCode, ScanLine
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useClickOutside } from "@/hooks/useClickOutside";
import { api } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRelative } from "@/lib/utils";
import Footer from "./Footer";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const studentNav: NavItem[] = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Explore Events", url: "/student/explore", icon: Compass },
  { title: "My Registrations", url: "/student/registrations", icon: CalendarCheck },
  { title: "My Tickets", url: "/student/tickets", icon: Ticket },
  { title: "Coordinator Panel", url: "/coordinator", icon: ShieldCheck },
  { title: "Universal Scanner", url: "/scanner", icon: ScanLine },
  { title: "Categories", url: "/student/categories", icon: Layers },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Create Event", url: "/admin/create", icon: PlusCircle },
  { title: "Manage Events", url: "/admin/manage", icon: CalendarRange },
  { title: "Event Participants", url: "/admin/registrations", icon: Users },
  { title: "Universal Scanner", url: "/scanner", icon: ScanLine },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Categories", url: "/admin/categories", icon: LayoutGrid },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "student" | "admin" | "coordinator";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const { user, logout, token } = useAuth();
  const { isSidebarCollapsed, setIsSidebarCollapsed, activeDropdown, setActiveDropdown, toggleSidebar } = useUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasActiveCoordinatedEvents, setHasActiveCoordinatedEvents] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (activeDropdown === "profile") setActiveDropdown(null);
  });

  useClickOutside(notifRef, () => {
    if (activeDropdown === "notifications") setActiveDropdown(null);
  });

  const navItems = (role === "admin" ? adminNav : studentNav).filter(item => {
    const coordOnlyItems = ["Coordinator Panel", "Scan Ticket", "Universal Scanner"];
    if (coordOnlyItems.includes(item.title)) {
      if (role === "admin") {
        return item.title === "Universal Scanner"; // Admin only needs Universal Scanner
      }
      return user?.isCoordinator === true && hasActiveCoordinatedEvents;
    }
    return true;
  });

  useEffect(() => {
    const fetchCoordinatorStatus = async () => {
      if (user?.isCoordinator && role !== "admin") {
        try {
          const res = await api.get("/events/coordinated", token || undefined);
          if (res.success && Array.isArray(res.data)) {
            const now = new Date();
            const hasActive = res.data.some((event: any) => {
              const eventDate = new Date(event.date.includes("T") ? event.date : `${event.date}T${event.time.includes("AM") || event.time.includes("PM") ? "10:00:00" : event.time}`);
              const isExpired = now > eventDate;
              const isClosed = ["closed", "completed", "expired"].includes(event.status?.toLowerCase());
              return !isExpired && !isClosed;
            });
            setHasActiveCoordinatedEvents(hasActive);
          }
        } catch (error) {
          console.error("Error fetching coordinator status", error);
        }
      } else {
        setHasActiveCoordinatedEvents(false);
      }
    };
    fetchCoordinatorStatus();
    const interval = setInterval(fetchCoordinatorStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user?.isCoordinator, role, token]);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (user?.id) {
        try {
          const response = await api.get(`/notifications/user/${user.id}`, token || undefined);
          if (response.success) {
            setNotifications(response.data);
          }
        } catch (error) {
          console.error("Notifs fetch error", error);
        }
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s update
    return () => clearInterval(interval);
  }, [user?.id, token]);

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/read/${id}`, {}, token || undefined);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (error) {
       console.error(error);
    }
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        {/* Sidebar - Desktop */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarCollapsed ? 80 : 280 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="hidden lg:flex flex-col bg-[#1E293B] text-slate-300 border-r border-slate-800 z-50 relative shadow-2xl"
        >
          {/* Logo Section */}
          <div className="h-20 flex items-center px-5 border-b border-white/5">
            <Link to="/" className="flex items-center gap-3.5 min-w-[200px] group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:rotate-6 transition-all duration-500">
                <CalendarRange className="w-6 h-6" />
              </div>
              {!isSidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="font-black text-xl text-white tracking-tighter">Eventra</span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">Dashboard</span>
                </motion.div>
              )}
            </Link>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-2.5 custom-scrollbar">
            {navItems.map((item) => {
              const active = location.pathname === item.url;
              return (
                <Tooltip key={item.url} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.url}
                      onClick={() => {
                        if (active) {
                          setIsSidebarCollapsed(true);
                        }
                      }}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative group ${
                        active 
                          ? "bg-primary text-white shadow-xl shadow-primary/30" 
                          : "hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                      {!isSidebarCollapsed && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`font-bold text-sm whitespace-nowrap ${active ? "text-white" : "text-slate-300"}`}
                        >
                          {item.title}
                        </motion.span>
                      )}
                      {item.title === "Notifications" && unreadCount > 0 && !isSidebarCollapsed && (
                        <span className="ml-auto bg-accent text-accent-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                      {active && !isSidebarCollapsed && (
                         <motion.div layoutId="activeNav" className="absolute left-[-16px] w-1.5 h-8 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isSidebarCollapsed && (
                    <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white font-bold text-xs py-2 px-3">
                      <div className="flex items-center gap-2">
                        {item.title}
                        {item.title === "Notifications" && unreadCount > 0 && (
                          <span className="bg-accent w-2 h-2 rounded-full" />
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-800/50 space-y-3">
             <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-all group font-bold"
            >
              <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {!isSidebarCollapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
          
          {/* Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className="absolute -right-4 top-24 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-background hover:scale-110 active:scale-90 transition-all z-[60]"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </motion.aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full w-[280px] bg-[#1E293B] z-[101] lg:hidden flex flex-col p-4"
              >
                <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">E</div>
                    <span className="font-bold text-xl text-white">Eventra</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.url}
                      to={item.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        location.pathname === item.url 
                          ? "bg-primary text-white font-bold shadow-lg" 
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3 text-destructive rounded-xl hover:bg-destructive/10 transition-all font-bold mt-4 border-t border-slate-800 pt-6"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search Bar - ChatGPT style */}
              <div className="flex relative group w-40 sm:w-64 lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <form onSubmit={handleSearch} className="w-full">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-transparent focus:bg-background focus:border-primary/30 rounded-full text-xs sm:text-sm outline-none ring-primary/10 focus:ring-4 transition-all"
                  />
                </form>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-5">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => toggleDropdown("notifications")}
                  className={`p-2.5 rounded-full transition-all relative active:scale-95 ${
                    activeDropdown === "notifications" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-bold rounded-full border-2 border-background shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {activeDropdown === "notifications" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-surface-elevated z-[100] overflow-hidden p-2"
                      onClick={(e) => e.stopPropagation()} // Clicking inside dropdown should NOT close it
                    >
                      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center">
                            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-xs text-muted-foreground">Catch up later! No new alerts.</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`px-4 py-3 rounded-xl mb-1 transition-colors relative group ${!n.readStatus ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                            >
                              <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.readStatus ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {n.type === 'update' ? <Sparkles className="w-5 h-5" /> : 
                                   n.type === 'confirmation' ? <Check className="w-5 h-5" /> :
                                   <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] leading-snug mb-0.5 ${!n.readStatus ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>{n.title}</p>
                                  <p className={`text-[12px] leading-snug ${!n.readStatus ? 'font-medium text-foreground/80' : 'text-muted-foreground/70'}`}>{n.message}</p>
                                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5 font-bold">
                                    <Clock className="w-3 h-3" />
                                    {formatRelative(n.createdAt)}
                                  </p>
                                </div>
                                {!n.readStatus && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(n.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/10 rounded-lg transition-all self-center"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4 text-primary" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Wrapper */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => toggleDropdown("profile")}
                  className={`flex items-center gap-3 p-1 pl-3 pr-1 rounded-full border transition-all active:scale-95 ${
                    activeDropdown === "profile" ? "border-primary bg-primary/5 shadow-inner" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-black text-foreground leading-none">{user?.name?.split(" ")[0]}</p>
                    <p className="text-[10px] text-primary uppercase font-black tracking-tighter mt-1">{role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black overflow-hidden shadow-sm">
                    {user?.profileImage || user?.picture ? (
                       <img src={user.profileImage || user.picture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === "profile" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-surface-elevated overflow-hidden z-[100] p-2"
                      onClick={(e) => e.stopPropagation()} // Clicking inside dropdown should not close it
                    >
                      <div className="px-4 py-4 border-b border-border/50 mb-1">
                        <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        <div className="mt-2 flex">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-primary/20">
                            {user?.role} Account
                          </span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <Link to={role === "admin" ? "/admin" : (user?.isCoordinator ? "/coordinator" : "/student")} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                          <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                        </Link>
                        <Link to={role === "admin" ? "/profile" : "/student/profile"} onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                          <User className="w-4 h-4 text-primary" /> My Profile
                        </Link>
                        {role === "admin" && (
                          <>
                            <Link to="/admin/create" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                              <PlusCircle className="w-4 h-4 text-primary" /> Create Event
                            </Link>
                            <Link to="/admin/manage" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                              <Settings className="w-4 h-4 text-primary" /> Manage Events
                            </Link>
                          </>
                        )}
                        <Link to="/settings" onClick={() => setActiveDropdown(null)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all">
                          <Settings className="w-4 h-4 text-primary" /> Settings
                        </Link>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveDropdown(null);
                          handleLogout();
                        }} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all mt-1 border-t border-border/50 pt-3"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-10 scroll-smooth bg-muted/20">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-7xl mx-auto"
            >
              {children}
              <div className="mt-12">
                <Footer />
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
