import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldCheck, Calendar, MapPin, Search, Users, QrCode, ClipboardList, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDateTime } from "@/lib/utils";

const MyCoordinatedEvents = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/coordinated", token || undefined);
        if (response.success) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch coordinated events", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchEvents();
    }
  }, [user, token]);

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            My Coordinated Events
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
            Manage your assignments, track registrations, and verify attendee tickets.
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium animate-pulse">Scanning assignments...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={event.id}
              className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 group"
            >
              <div className="flex flex-col sm:flex-row h-full">
                <div className="sm:w-1/3 relative overflow-hidden bg-muted">
                  <img 
                    src={event.imageUrl || event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                    alt="" 
                    className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-x-2 top-2">
                     <span className="text-[10px] font-black uppercase tracking-widest bg-background/80 backdrop-blur-md text-foreground px-3 py-1 rounded-lg border border-border shadow-sm">
                        {event.category}
                     </span>
                  </div>
                </div>
                
                <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-xl mb-3 text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mb-6 text-xs font-bold text-muted-foreground">
                      <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-primary shrink-0" />
                         <span className="truncate">{formatDateTime(event.date)} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4 text-primary shrink-0" />
                         <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      to={`/coordinator/event/${event.id}`} 
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-primary/20 active:scale-95"
                    >
                       <ClipboardList className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link 
                      to={`/scan-ticket`} 
                      className="p-3 bg-background text-foreground hover:bg-muted rounded-xl transition-all active:scale-95 border border-border shadow-sm shadow-black/5"
                      title="Scan Tickets"
                    >
                       <QrCode className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-border text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-muted-foreground opacity-30" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">No active assignments</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            {searchTerm ? "No coordinated events matched your query." : "You haven't been assigned as a coordinator for any nodes yet. Contact your administrator if this is an error."}
          </p>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default MyCoordinatedEvents;
