import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EventCard from "@/components/EventCard";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const ExploreEvents = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") || searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";
  
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [feeType, setFeeType] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<any[]>(["All"]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const fetchRegistrations = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/registrations/user/${user.id}`, token || undefined);
      if (response.success) {
        setRegistrations(response.data);
      }
    } catch (e) {
      console.error("Failed to fetch registrations");
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user?.id, token]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await api.get("/categories");
        if (response.success) {
          setCategories(["All", ...response.data.map((c: any) => c.name)]);
        }
      } catch (e) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCats();
  }, []);

  const fetchEvents = useCallback(async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (category !== "All") query.append("category", category);
      query.append("page", pageNum.toString());
      query.append("limit", "9"); 
      
      const response = await api.get(`/events?${query.toString()}`);
      if (response.success) {
        if (isLoadMore) {
          setEvents(prev => [...prev, ...response.data]);
        } else {
          setEvents(response.data);
        }
        setHasMore(response.data.length === 9);
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      toast.error("Failed to connect to server");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchEvents(1, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, fetchEvents]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, true);
  };

  const locations = useMemo(() => ["All", ...Array.from(new Set(events.map(e => e.venue)))], [events]);

  const suggestions = useMemo(() => {
    if (!search || search.length < 2) return [];
    return events
      .filter((e) => {
        const catStr = typeof e.category === 'string' ? e.category : e.category?.name || "";
        return e.title.toLowerCase().includes(search.toLowerCase()) || catStr.toLowerCase().includes(search.toLowerCase());
      })
      .slice(0, 5);
  }, [search, events]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = events.filter((e) => {
    const matchLoc = location === "All" || e.venue === location;
    const matchDate = !dateFilter || e.date === dateFilter;
    const matchFee = feeType === "All" 
      ? true 
      : feeType === "Free" ? !e.isPaidEvent 
      : e.isPaidEvent;
    return matchLoc && matchDate && matchFee;
  });

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    try {
      const response = await api.post("/registrations", { eventId }, token || undefined);
      if (response.success) {
        toast.success("Successfully registered!");
        fetchRegistrations(); 
        fetchEvents(); 
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6" ref={resultsRef}>
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Explore Events</h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">Discover what's happening on campus — browse and join upcoming events.</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm mb-10 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <form 
            className="relative" 
            ref={searchRef}
            onSubmit={(e) => {
              e.preventDefault();
              setShowSuggestions(false);
              fetchEvents();
            }}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-10 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none"
            />
            {search && (
              <button 
                type="button"
                onClick={() => { setSearch(""); setShowSuggestions(false); }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50"
                >
                  {suggestions.map((event) => {
                    const catName = typeof event.category === 'string' ? event.category : event.category?.name || "";
                    const eventId = event.id || event._id;
                    return (
                    <button 
                      key={eventId} 
                      type="button"
                      onClick={() => { setSearch(event.title); setShowSuggestions(false); fetchEvents(); }} 
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                        {event.title?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{catName}</p>
                      </div>
                    </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            {categories.map((cat) => {
              const name = typeof cat === 'string' ? cat : cat.name;
              return <option key={name} value={name}>{name === "All" ? "All Categories" : name}</option>;
            })}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="All">All Locations</option>
            {locations.filter(l => l !== "All").map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          />

          <select
            value={feeType}
            onChange={(e) => setFeeType(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          >
            <option value="All">All Prices</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        
        {(search || category !== "All" || location !== "All" || dateFilter || feeType !== "All") && (
          <div className="mt-5 flex flex-wrap items-center gap-2 pt-5 border-t border-border">
            <span className="text-xs text-muted-foreground mr-2 font-medium">Applied Filters:</span>
            <div className="flex flex-wrap gap-2">
              {search && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                  <span className="text-[10px] font-semibold">"{search}"</span>
                  <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {category !== "All" && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-[10px] font-semibold text-primary uppercase">{category}</span>
                  <button onClick={() => setCategory("All")} className="text-primary hover:text-primary/70">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {location !== "All" && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                  <span className="text-[10px] font-semibold">{location}</span>
                  <button onClick={() => setLocation("All")} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => { setSearch(""); setCategory("All"); setLocation("All"); setDateFilter(""); setFeeType("All"); }}
                className="text-[10px] text-primary hover:underline font-semibold uppercase tracking-wider ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
         <p className="text-sm font-medium text-gray-500">
           {filtered.length === 0 ? "No events found" : `Showing ${filtered.length} event${filtered.length !== 1 ? "s" : ""}`}
         </p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-gray-200"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Finding events for you...</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 bg-card rounded-xl border border-gray-200"
          >
            <Search className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground">No events found matching your criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keywords.</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {filtered.filter(e => e.status !== "completed").length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                   <h2 className="text-xl font-semibold text-foreground tracking-tight">Upcoming Events</h2>
                   <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.filter(e => e.status !== "completed").map((event, i) => (
                    <EventCard
                      key={event.id || event._id}
                      event={event}
                      index={i}
                      isRegistered={registrations.some(r => r.eventId === (event.id || event._id) && r.status === "confirmed")}
                      onRegister={handleRegister}
                    />
                  ))}
                </div>
              </section>
            )}

            {filtered.filter(e => e.status === "completed").length > 0 && (
              <section className="pt-8 opacity-80">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-muted-foreground tracking-tight">Past Events</h2>
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-lg">Completed</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.filter(e => e.status === "completed").map((event, i) => (
                    <EventCard
                      key={event.id || event._id}
                      event={event}
                      index={i}
                      isRegistered={registrations.some(r => r.eventId === (event.id || event._id) && r.status === "confirmed")}
                    />
                  ))}
                </div>
              </section>
            )}

            {hasMore && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More Events"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ExploreEvents;
