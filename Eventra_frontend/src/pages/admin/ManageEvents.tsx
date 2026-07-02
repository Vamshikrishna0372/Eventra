import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { categoryColors } from "@/data/mockData";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Loader2, Star, UserPlus, X, Edit3, Trash2, 
  Lock, Unlock, LayoutGrid, Table as TableIcon, 
  Calendar, Users, MapPin, ChevronRight, Bookmark,
  AlertCircle, CheckCircle2, UserMinus
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDateTime } from "@/lib/utils";

const categories = ["Technical", "Cultural", "Sports", "Workshops", "Placement", "Seminars"];

const ManageEvents = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [coordEvent, setCoordEvent] = useState<any>(null);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [coordEmail, setCoordEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinators = async () => {
      if (isCoordModalOpen && coordEvent) {
        // Clear previous list while loading new one
        setCoordinators([]);
        try {
          const res = await api.get(`/events/${coordEvent.id}/coordinators`, token || undefined);
          if (res.success) {
            setCoordinators(res.data || []);
          }
        } catch (error) {
          toast.error("Failed to load coordinators");
        }
      }
    };
    fetchCoordinators();
  }, [isCoordModalOpen, coordEvent?.id, token]);

  const fetchEvents = async (pageNum: number = 1, isLoadMore: boolean = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      query.append("page", pageNum.toString());
      query.append("limit", "10");
      
      const response = await api.get(`/events?${query.toString()}`);
      if (response.success) {
        if (isLoadMore) {
          setEvents(prev => [...prev, ...response.data]);
        } else {
          setEvents(response.data);
        }
        setHasMore(response.data.length === 10);
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchEvents(1, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEvents(nextPage, true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const response = await api.put(`/events/${id}`, { status: newStatus }, token || undefined);
      if (response.success) {
        toast.success(`Event marked as ${newStatus}`);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      }
    } catch (error) {
      toast.error("Status update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const response = await api.put(`/events/${id}`, { isFeatured }, token || undefined);
      if (response.success) {
        toast.success(isFeatured ? "Marked as Featured" : "Removed from Featured");
        // Update local state, noting that only one event can be featured
        setEvents(prev => prev.map(e => ({
          ...e,
          isFeatured: e.id === id ? isFeatured : (isFeatured ? false : e.isFeatured)
        })));
      }
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    setActionLoading(id);
    try {
      const response = await api.delete(`/events/${id}`, token || undefined);
      if (response.success) {
        toast.success("Event deleted successfully");
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("edit");
    try {
      const response = await api.put(`/events/${editForm.id}`, {
        ...editForm,
        maxParticipants: parseInt(editForm.maxParticipants)
      }, token || undefined);
      
      if (response.success) {
        toast.success("Event updated successfully");
        setEvents(prev => prev.map(e => e.id === editForm.id ? response.data : e));
        setIsEditModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update event");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordEmail.trim() || !coordEvent) return;
    
    setActionLoading("coord");
    try {
      const response = await api.post(`/events/${coordEvent.id}/coordinators`, { 
        email: coordEmail.trim().toLowerCase()
      }, token || undefined);
      
      if (response.success) {
        toast.success("Coordinator added successfully");
        const newCoord = response.data;
        // Optimization: Ensure we don't add duplicates to state locally
        setCoordinators(prev => {
          if (prev.some(c => c.id === newCoord.id || c.email.toLowerCase() === newCoord.email.toLowerCase())) {
            return prev;
          }
          return [...prev, newCoord];
        });
        setCoordEmail("");
      } else {
        toast.error(response.message || "Failed to add coordinator");
      }
    } catch (error: any) {
      toast.error("Failed to add coordinator. Please check the email.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveCoordinator = async (coordId: string) => {
    setActionLoading(`remove-${coordId}`);
    try {
      const response = await api.delete(`/coordinators/${coordId}`, token || undefined);
      if (response.success) {
        toast.success("Coordinator removed");
        setCoordinators(prev => prev.filter(c => c.id !== coordId));
      }
    } catch (error) {
      toast.error("Failed to remove coordinator");
    } finally {
      setActionLoading(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
      open: { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: CheckCircle2, label: "Open" },
      closed: { bg: "bg-destructive/10", text: "text-destructive", icon: Lock, label: "Closed" },
      upcoming: { bg: "bg-blue-500/10", text: "text-blue-500", icon: Calendar, label: "Upcoming" },
    };
    
    const s = status.toLowerCase();
    const { bg, text, icon: Icon, label } = config[s] || config.open;
    
    return (
      <span className={`${bg} ${text} px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <DashboardLayout role="admin">
      {/* Header with View Toggle */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Manage Events</h1>
          <p className="text-sm text-muted-foreground mt-1 font-normal">Coordinate, optimize, and oversee your campus impact.</p>
        </div>
        
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === "table" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <TableIcon className="w-3.5 h-3.5" /> Table
          </button>
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search events by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-card rounded-xl border border-gray-200">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing Data Fleet...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-24 text-center bg-card rounded-xl border border-gray-200">
           <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-30" />
           <p className="text-sm font-medium text-muted-foreground">No events found in the fleet.</p>
           <button onClick={() => setSearch("")} className="mt-4 text-primary text-xs font-semibold uppercase hover:underline">Clear Search</button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                      <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider">Event</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider">Category</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider">Participants</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {events.map((event, i) => {
                      const currentRegistered = event.registeredCount ?? 0;
                      const capacity = (currentRegistered / event.maxParticipants) * 100;
                      return (
                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6 text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border shadow-sm">
                                <img src={event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"} alt="" className="w-full h-full object-cover" />
                                {event.isFeatured && (
                                  <div className="absolute top-0 right-0 bg-amber-500 p-0.5 rounded-bl-lg">
                                    <Star className="w-2.5 h-2.5 text-white fill-current" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate max-w-[200px]">{event.title}</p>
                                <p className="text-xs text-muted-foreground truncate"><MapPin className="w-2.5 h-2.5 inline mr-1" />{event.venue}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`${categoryColors[typeof event.category === 'string' ? event.category : event.category?.name] || "bg-muted text-muted-foreground"} px-2.5 py-0.5 rounded-lg text-xs font-medium`}>
                              {typeof event.category === 'string' ? event.category : event.category?.name || "Event"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground font-medium text-xs tabular-nums">
                             <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                             {formatDateTime(event.date)}
                          </td>
                          <td className="py-4 px-6 text-foreground">
                            <div className="space-y-1.5">
                               <div className="flex justify-between items-center text-[10px] font-semibold tabular-nums">
                                  <span>{currentRegistered} / {event.maxParticipants}</span>
                                  <span className={capacity >= 90 ? "text-destructive" : "text-primary"}>{Math.round(capacity)}%</span>
                               </div>
                               <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${capacity}%` }} 
                                    className={`h-full rounded-full ${capacity >= 90 ? "bg-destructive" : "bg-primary"}`} 
                                 />
                               </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={event.status} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-1 items-center">
                               <button 
                                 onClick={() => handleToggleFeatured(event.id, !event.isFeatured)}
                                 className={`p-1.5 rounded-lg transition-all ${event.isFeatured ? "bg-amber-100 text-amber-600" : "text-muted-foreground hover:bg-muted"}`}
                               >
                                <Star className={`w-3.5 h-3.5 ${event.isFeatured ? "fill-current" : ""}`} />
                               </button>
                               <button onClick={() => { setCoordEvent(event); setIsCoordModalOpen(true); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                  <UserPlus className="w-3.5 h-3.5" />
                               </button>
                               <button onClick={() => { setEditForm(event); setIsEditModalOpen(true); }} className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                               </button>
                               <button 
                                 onClick={() => handleUpdateStatus(event.id, event.status === "open" ? "closed" : "open")}
                                 disabled={actionLoading === event.id}
                                 className={`p-1.5 rounded-lg transition-all ${event.status === "open" ? "text-amber-600 hover:bg-amber-50" : "text-blue-600 hover:bg-blue-50"}`}
                               >
                                  {actionLoading === event.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : event.status === "open" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                               </button>
                               <button onClick={() => handleDelete(event.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event, i) => {
                const currentRegistered = event.registeredCount ?? 0;
                const capacity = (currentRegistered / event.maxParticipants) * 100;
                return (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
                  >
                    <div className="relative aspect-video overflow-hidden">
                       <img src={event.imageUrl || event.image || event.thumbnailUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600"} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                       <div className="absolute inset-x-4 top-4 flex justify-between items-start">
                          <span className={`${categoryColors[typeof event.category === 'string' ? event.category : event.category?.name] || "bg-muted text-muted-foreground"} px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase shadow-sm backdrop-blur-md`}>
                             {typeof event.category === 'string' ? event.category : event.category?.name || "Event"}
                          </span>
                          {event.isFeatured && <div className="p-1.5 bg-amber-500 rounded-lg shadow-sm"><Star className="w-3 h-3 text-white fill-current" /></div>}
                       </div>
                       <div className="absolute bottom-4 left-4">
                          <StatusBadge status={event.status} />
                       </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                       <h3 className="text-lg font-semibold text-foreground tracking-tight line-clamp-1 mb-3">{event.title}</h3>
                       
                       <div className="space-y-2 mb-6 flex-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                             <Calendar className="w-3.5 h-3.5 text-primary" /> {formatDateTime(event.date)}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                             <MapPin className="w-3.5 h-3.5 text-primary" /> {event.venue}
                          </div>
                          <div className="pt-3">
                             <div className="flex justify-between items-center text-[10px] font-semibold uppercase text-gray-400 mb-1.5">
                                <span>Capacity</span>
                                <span className="text-primary">{currentRegistered} / {event.maxParticipants}</span>
                             </div>
                             <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${capacity >= 90 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${capacity}%` }} />
                             </div>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => { setEditForm(event); setIsEditModalOpen(true); }} className="flex items-center justify-center gap-1.5 py-2.5 bg-muted/50 hover:bg-primary hover:text-white rounded-lg text-xs font-semibold transition-all">
                             <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => { setCoordEvent(event); setIsCoordModalOpen(true); }} className="flex items-center justify-center gap-1.5 py-2.5 bg-muted/50 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-semibold transition-all">
                             <UserPlus className="w-3.5 h-3.5" /> Coord
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(event.id, event.status === "open" ? "closed" : "open")}
                            className={`flex items-center justify-center gap-1.5 py-2.5 bg-muted/50 rounded-lg text-xs font-semibold transition-all ${event.status === "open" ? "hover:bg-amber-500 hover:text-white" : "hover:bg-blue-500 hover:text-white"}`}
                          >
                             {event.status === "open" ? <><Lock className="w-3.5 h-3.5" /> Close</> : <><Unlock className="w-3.5 h-3.5" /> Open</>}
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="flex items-center justify-center gap-1.5 py-2.5 bg-muted/50 hover:bg-destructive hover:text-white rounded-lg text-xs font-semibold transition-all">
                             <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            Review More Events
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
               initial={{ opacity: 0, scale: 0.98, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.98, y: 10 }}
               className="bg-card w-full max-w-4xl max-h-[90vh] rounded-xl shadow-lg border border-border overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary/10 text-primary rounded-xl shadow-sm">
                        <Edit3 className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="text-xl font-semibold tracking-tight">Edit Event</h2>
                        <p className="text-xs font-medium text-muted-foreground">Modify parameters for: {editForm.title}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-all">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-muted-foreground ml-1">Event Title</label>
                           <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" required />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-muted-foreground ml-1">Description</label>
                           <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={5} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none resize-none" required />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-muted-foreground ml-1">Image URL</label>
                           <div className="flex gap-4">
                              <input type="url" value={editForm.imageUrl || ""} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className="flex-1 px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://..." />
                              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden border border-border shrink-0">
                                 <img src={editForm.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"} alt="" className="w-full h-full object-cover" />
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground ml-1">Date</label>
                              <input type="date" value={editForm.date?.split("T")[0]} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" required />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground ml-1">Time</label>
                              <input type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" required />
                           </div>
                        </div>
                        
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-muted-foreground ml-1">Venue</label>
                           <input type="text" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground ml-1">Category</label>
                              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none">
                                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-medium text-muted-foreground ml-1">Capacity</label>
                              <input type="number" value={editForm.maxParticipants} onChange={(e) => setEditForm({ ...editForm, maxParticipants: e.target.value })} className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-primary/20 outline-none" required />
                           </div>
                        </div>
                        
                        <div className="p-5 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                           <div className="relative">
                              <input 
                                type="checkbox" id="edit-feat" checked={editForm.isFeatured} 
                                onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })} 
                                className="w-5 h-5 rounded bg-muted border-border text-primary focus:ring-primary/20 cursor-pointer" 
                              />
                           </div>
                           <label htmlFor="edit-feat" className="flex-1 cursor-pointer">
                              <p className="text-sm font-semibold">Featured Spotlight</p>
                              <p className="text-[10px] font-medium text-muted-foreground">Highlight this event on the main page</p>
                           </label>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-10 flex gap-3">
                     <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold transition-all">Cancel</button>
                     <button type="submit" disabled={actionLoading === "edit"} className="flex-[2] py-3 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                        {actionLoading === "edit" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" /> }
                        Update Event
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coordinator Modal */}
      <AnimatePresence>
        {isCoordModalOpen && coordEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.98, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.98, y: 10 }}
               className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shadow-sm">
                        <Users className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-xl font-semibold tracking-tight">Manage Coordinators</h3>
                        <p className="text-xs font-medium text-muted-foreground">Delegated access for: {coordEvent.title}</p>
                     </div>
                  </div>
                  <button onClick={() => setIsCoordModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-all">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="p-8 space-y-8">
                  <div>
                     <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 ml-1">Current Personnel</h4>
                     <div className="space-y-2">
                        {coordinators.length > 0 ? coordinators.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-transparent hover:border-emerald-500/20 transition-all group">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs uppercase">
                                   {c.name?.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-semibold">{c.name}</p>
                                   <p className="text-[10px] text-muted-foreground">{c.email}</p>
                                   <p className="text-[9px] text-muted-foreground/70 font-mono mt-0.5">{c.phone}</p>
                                </div>
                             </div>
                             <button 
                               onClick={() => handleRemoveCoordinator(c.id)} 
                               disabled={actionLoading === `remove-${c.id}`}
                               className="opacity-0 group-hover:opacity-100 p-2 text-destructive bg-destructive/10 rounded-lg transition-all hover:bg-destructive hover:text-white"
                             >
                                {actionLoading === `remove-${c.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                             </button>
                          </div>
                        )) : (
                          <div className="p-8 text-center bg-muted/10 rounded-xl border border-dashed border-border opacity-50">
                             <p className="text-xs font-medium text-muted-foreground uppercase">No personnel assigned to this node yet.</p>
                          </div>
                        )}
                     </div>
                  </div>
                  
                  <form onSubmit={handleAddCoordinator} className="pt-6 border-t border-border">
                     <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 ml-1">Enlist New Resource</h4>
                     <div className="flex gap-3">
                        <div className="relative flex-1 group">
                           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                           <input 
                             type="email" 
                             placeholder="Search student by verified email..." 
                             value={coordEmail}
                             onChange={(e) => setCoordEmail(e.target.value)}
                             className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-emerald-500/30 rounded-xl font-medium text-sm transition-all outline-none"
                             required
                           />
                        </div>
                        <button type="submit" disabled={actionLoading === "coord"} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                           {actionLoading === "coord" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                           Enlist
                        </button>
                     </div>
                  </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ManageEvents;
