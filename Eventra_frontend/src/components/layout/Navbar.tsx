import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Search, Menu, X, Bell, LayoutDashboard, Calendar, 
  Settings, LogOut, Check, CalendarRange, Info, 
  Mail, Zap, Compass, PlusCircle, BarChart3, 
  ChevronDown, User as UserIcon, Moon, Sun, 
  Ticket, Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatRelative } from "@/lib/utils";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    // Initialize theme based on user preferences or localStorage or system
    const userTheme = user?.preferences?.theme;
    if (userTheme) {
      setIsDark(userTheme === 'dark');
      document.documentElement.classList.toggle('dark', userTheme === 'dark');
    } else if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [user?.preferences?.theme]);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (user?.id) {
        try {
          const response = await api.get(`/notifications/user/${user.id}`, token || undefined);
          if (response.success) setNotifications(response.data);
        } catch (error) {
          console.error("Notifs fetch error", error);
        }
      }
    };
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.id, token]);

  const toggleTheme = async () => {
    const newDark = !isDark;
    const theme = newDark ? 'dark' : 'light';
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.theme = theme;
    
    // Persist if logged in
    if (token) {
      updateUser({ preferences: { ...user?.preferences, theme } as any });
      await api.put("/users/profile", { preferences: { theme } }, token);
    }
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { title: "Home", url: "/#", icon: Ticket },
        { title: "Features", url: "/#features", icon: Zap },
        { title: "Events", url: "/#events", icon: Calendar },
        { title: "About", url: "/#about", icon: Info },
        { title: "Contact", url: "/#contact", icon: Mail },
      ];
    }
    if (user.role === "admin") {
      return [
        { title: "Explore", url: "/student/explore", icon: Compass },
        { title: "Create", url: "/admin/create", icon: PlusCircle },
        { title: "Manage", url: "/admin/manage", icon: Settings },
        { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
      ];
    }
    return [
      { title: "Explore Events", url: "/student/explore", icon: Compass },
      { title: "My Registrations", url: "/student/registrations", icon: Ticket },
      { title: "Categories", url: "/student/explore#categories", icon: LayoutDashboard },
    ];
  };

  const navLinks = getNavLinks();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/explore?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    toast.success("Logged out successfully");
  };

  const handleGoogleLogin = () => {
    navigate("/login?google=true");
  };

  const logoIcon = (
    <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500 group-hover:rotate-6">
      <CalendarRange className="w-6 h-6" />
    </div>
  );

  return (
    <nav 
      className={`fixed top-0 z-[100] w-full transition-all duration-500 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border py-2 shadow-lg" 
          : "bg-transparent py-4 text-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link to={user ? (user.role === "admin" ? "/admin" : (user.isCoordinator ? "/coordinator" : "/student")) : "/"} className="flex items-center gap-3 group relative z-10">
          {logoIcon}
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors">Eventra</span>
            {!user && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5 opacity-80">
                Campus Events
              </span>
            )}
            {user && (
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">
                {user.role} Hub
              </span>
            )}
          </div>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center justify-center gap-1 bg-muted/20 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link 
              key={link.title} 
              to={link.url}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                location.pathname === link.url.split('#')[0]
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex items-center justify-end gap-3 min-w-[200px]">
          {/* Always Visible Components */}
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 xl:w-48 pl-9 pr-4 py-2 bg-muted/30 border border-transparent focus:bg-background focus:border-primary/30 rounded-full text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </form>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 ml-2 border-l border-border/50 pl-3">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 rounded-full transition-all relative ${isNotifOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.readStatus) && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse" />
                  )}
                </button>
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-3xl shadow-surface-elevated overflow-hidden z-[200] p-2"
                    >
                      <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center">
                        <span className="font-black text-xs uppercase tracking-widest">Notifications</span>
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <div className="max-h-80 overflow-y-auto py-2 custom-scrollbar space-y-1">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center opacity-50"><Sparkles className="w-8 h-8 mx-auto mb-2" /><p className="text-xs font-bold">All caught up!</p></div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`p-3 rounded-2xl transition-all ${!n.readStatus ? 'bg-primary/5' : 'opacity-60 hover:opacity-100 hover:bg-muted'}`}>
                              <p className="text-xs font-bold leading-snug">{n.message}</p>
                              <p className="text-[10px] mt-1 font-medium opacity-50">{formatRelative(n.createdAt)}</p>
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
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 bg-muted/30 border border-border/50 rounded-full hover:border-primary/30 transition-all hover:bg-primary/5 active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-black overflow-hidden border border-primary/20">
                    {user?.picture ? <img src={user.picture} alt="" className="w-full h-full object-cover" /> : user?.name.charAt(0)}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-3xl shadow-surface-elevated overflow-hidden z-[200] p-2"
                    >
                      <div className="p-4 border-b border-border/50 mb-2">
                        <p className="font-black text-sm">{user?.name}</p>
                        <p className="text-[11px] font-bold opacity-50 truncate">{user?.email}</p>
                        <div className="mt-2 text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary w-fit px-2 py-0.5 rounded-md">
                          {user?.role} Account
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <Link to={user?.role === "admin" ? "/admin" : (user?.isCoordinator ? "/coordinator" : "/student")} className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                          <UserIcon className="w-4 h-4" /> Profile Details
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                          <Settings className="w-4 h-4" /> Account Settings
                        </Link>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black text-destructive hover:bg-destructive/10 rounded-xl transition-all mt-2 border-t border-border/50 pt-3">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2 border-l border-border/50 pl-4">
              <Link 
                to="/login" 
                className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 bg-muted/50 rounded-xl z-20">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[150] lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[300px] bg-background border-l border-border z-[160] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {logoIcon}
                  <span className="font-black text-xl tracking-tighter">Eventra</span>
                </div>
                <button onClick={toggleTheme} className="p-2 bg-muted rounded-full">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Find events, hackathons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border border-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </form>

              <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link 
                    key={link.title} to={link.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-black text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    {link.title}
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-border mt-auto">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-primary/20">
                         {user.picture ? <img src={user.picture} alt="" /> : user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate">{user.name}</p>
                        <p className="text-[10px] font-bold uppercase opacity-50">{user.role}</p>
                      </div>
                    </div>
                    <Link to={user.role === "admin" ? "/admin" : (user.isCoordinator ? "/coordinator" : "/student")} onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-4 bg-muted font-black text-sm rounded-2xl">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full py-4 text-destructive font-black text-sm rounded-2xl hover:bg-destructive/10 transition-all">Sign Out</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-4 text-center font-black text-sm bg-muted rounded-2xl">Login</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-4 text-center font-black text-sm bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
