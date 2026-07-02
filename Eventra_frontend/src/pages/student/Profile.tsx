import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, Mail, Shield, ShieldCheck, CheckCircle, 
  Loader2, Calendar, MapPin, XCircle, Heart, Settings as SettingsIcon,
  LogOut, Clock, ExternalLink, Trash2, Building, Phone, ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatDate, formatDateTime } from "@/lib/utils";

const Profile = () => {
  const { user, token, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [registrations, setRegistrations] = useState<{ id: string; eventId: string; event?: { title: string; date: string; venue: string } }[]>([]);
  const [wishlist, setWishlist] = useState<{ _id: string; title: string; date: string; imageUrl?: string }[]>([]);
  const [tickets, setTickets] = useState<{ id: string; ticketNumber: string; event?: { title: string; date: string; venue: string } }[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [regsRes, wishRes, ticketsRes] = await Promise.all([
        api.get(`/registrations/user/${user.id}`, token || undefined),
        api.get(`/wishlist/user/${user.id}`, token || undefined),
        api.get(`/tickets/user/${user.id}`, token || undefined)
      ]);

      if (regsRes.success) setRegistrations(regsRes.data);
      if (wishRes.success) setWishlist(wishRes.data);
      if (ticketsRes.success) setTickets(ticketsRes.data);
    } catch (error) {
      toast.error("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id, token]); 

  const handleCancelRegistration = async (regId: string) => {
    if (!window.confirm("Cancel this registration?")) return;
    setActionLoading(regId);
    try {
      const res = await api.delete(`/registrations/${regId}`, token || undefined);
      if (res.success) {
        toast.success("Registration cancelled");
        fetchUserData();
      }
    } catch (error) {
      toast.error("Cancellation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFromWishlist = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const res = await api.delete(`/wishlist/remove?eventId=${eventId}`, token || undefined);
      if (res.success) {
        toast.success("Removed from wishlist");
        fetchUserData();
      }
    } catch (error) {
      toast.error("Wishlist removal failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (!user) return null;

  const sections = [
    { id: "overview", label: "My Profile", icon: UserIcon },
    { id: "registrations", label: "Registrations", icon: Calendar },
    { id: "wishlist", label: "Favorites", icon: Heart },
    { id: "tickets", label: "Tickets", icon: CheckCircle },
    { id: "settings", label: "Account", icon: SettingsIcon },
  ];

  return (
    <DashboardLayout role={user.role}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-10">
           <h1 className="text-3xl font-semibold text-foreground tracking-tight">
             {user.role === 'admin' ? 'Administrative Access' : 'Student Identity'}
           </h1>
           <p className="text-sm text-gray-500 mt-1 font-normal">
             {user.role === 'admin' 
               ? 'Manage your administrative profile and security parameters.' 
               : 'Manage your personal information and campus digital identity.'}
           </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Dashboard Nav */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 md:w-60 shrink-0 no-scrollbar">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeSection === s.id 
                    ? "bg-primary text-white shadow-sm" 
                    : "bg-card hover:bg-muted text-gray-500 hover:text-foreground border border-transparent"
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            ))}
            <div className="hidden md:block mt-6 pt-6 border-t border-border">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-all group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex-1 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeSection === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-card rounded-xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-muted border border-border shadow-sm flex items-center justify-center text-3xl font-semibold text-primary shrink-0 relative group overflow-hidden">
                        {user.profileImage || user.picture ? <img src={user.profileImage || user.picture} alt={user.name} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" /> : <span className="group-hover:opacity-40 transition-opacity">{user.name.charAt(0)}</span>}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                          <span className="text-[8px] font-semibold text-white uppercase tracking-widest">Update</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">{user.name}</h2>
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 font-medium mb-6 text-sm">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/10 text-[10px] font-semibold uppercase tracking-wider">
                            {user.role}
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-50 text-[10px] font-semibold uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setActionLoading('update-profile');
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        name: formData.get('name') as string,
                        department: formData.get('department') as string,
                        phoneNumber: formData.get('phoneNumber') as string,
                        bio: formData.get('bio') as string,
                      };
                      try {
                        const res = await api.put('/users/profile', data, token || undefined);
                        if (res.success) {
                          toast.success("Profile saved");
                          updateUser(data);
                        }
                      } catch (error) {
                        toast.error("Sync failed");
                      } finally {
                        setActionLoading(null);
                      }
                    }}
                    className="bg-card rounded-xl border border-gray-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Full Identity</label>
                        <div className="relative">
                           <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                           <input name="name" defaultValue={user.name} className="w-full bg-muted/20 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Email Stream</label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                           <input name="email" defaultValue={user.email} disabled className="w-full bg-muted/10 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-400 cursor-not-allowed" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Division / Dept</label>
                        <div className="relative">
                           <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                           <input name="department" defaultValue={user.department || ''} placeholder="e.g. Design Lab" className="w-full bg-muted/20 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Contact Node</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                           <input name="phoneNumber" defaultValue={user.phoneNumber || ''} placeholder="+91" className="w-full bg-muted/20 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                     </div>
                     <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Short Intelligence (Bio)</label>
                        <textarea name="bio" defaultValue={user.bio || ''} rows={3} placeholder="Tell us about yourself..." className="w-full bg-muted/20 border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
                     </div>
                     
                     <div className="col-span-1 md:col-span-2 pt-4 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={actionLoading === 'update-profile'}
                          className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all shadow-sm flex items-center gap-2"
                        >
                          {actionLoading === 'update-profile' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Update Identity
                        </button>
                     </div>
                  </form>
                </motion.div>
              )}

              {activeSection === "registrations" && (
                <motion.div
                  key="registrations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Recent Sessions</h2>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{registrations.length} Total</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {registrations.length > 0 ? registrations.map((r: any) => (
                      <div key={r.id} className="bg-card rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4 hover:border-primary/20 transition-all group shadow-sm">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                               <Calendar className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                               <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{r.event?.title}</h3>
                               <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 mt-0.5">
                                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium tracking-tight">
                                     <Clock className="w-3 h-3" /> {formatDateTime(r.event?.date)}
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <Link to={`/events/${r.eventId}`} className="px-4 py-2 rounded-lg bg-muted text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:bg-primary hover:text-white transition-all">
                               Details
                            </Link>
                            <button 
                              onClick={() => handleCancelRegistration(r.id)}
                              disabled={actionLoading === r.id}
                              className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                               {actionLoading === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </button>
                         </div>
                      </div>
                    )) : (
                      <div className="py-20 bg-muted/10 rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
                         <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                         <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">No active sessions</p>
                         <Link to="/student/explore" className="mt-4 text-primary text-[10px] font-semibold uppercase tracking-widest hover:underline">Explore More</Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeSection === "wishlist" && (
                 <motion.div
                   key="wishlist"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                 >
                   <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Saved for later</h2>
                    <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest">{wishlist.length} Events</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {wishlist.length > 0 ? wishlist.map((item: any) => (
                      <div key={item._id} className="bg-card rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
                         <div className="h-32 relative overflow-hidden">
                            <img src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <button 
                               onClick={() => handleRemoveFromWishlist(item._id)}
                               disabled={actionLoading === item._id}
                               className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-all"
                            >
                               {actionLoading === item._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                         </div>
                         <div className="p-5">
                            <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{item.title}</h3>
                            <p className="text-[10px] font-medium text-gray-400 mt-1">{formatDateTime(item.date)}</p>
                            <Link to={`/events/${item._id}`} className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-white text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                               Sync Event <ChevronRight className="w-3 h-3" />
                            </Link>
                         </div>
                      </div>
                    )) : (
                      <div className="col-span-2 py-20 bg-muted/10 rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
                         <Heart className="w-12 h-12 text-gray-200 mb-4" />
                         <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Wishlist empty</p>
                      </div>
                    )}
                  </div>
                 </motion.div>
              )}

              {activeSection === "tickets" && (
                 <motion.div
                   key="tickets"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                 >
                   <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground tracking-tight">Active Passes</h2>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">{tickets.length} Issued</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tickets.length > 0 ? tickets.map((t: any) => (
                      <div key={t.id} className="bg-card rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col relative group">
                         <div className="p-6 pb-6 border-b border-gray-100 border-dashed relative">
                            <div className="absolute -left-2.5 bottom-[-10px] w-5 h-5 rounded-full bg-background border border-gray-100" />
                            <div className="absolute -right-2.5 bottom-[-10px] w-5 h-5 rounded-full bg-background border border-gray-100" />
                            
                            <div className="flex justify-between items-start mb-4">
                               <div className="min-w-0 pr-2">
                                  <span className="text-[8px] font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md mb-2 inline-block">Confirmed</span>
                                  <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{t.event?.title}</h3>
                               </div>
                               <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                               <div>
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight block">Stream</span>
                                  <p className="text-[10px] font-semibold text-foreground truncate">{formatDate(t.event?.date)}</p>
                               </div>
                               <div>
                                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight block">Node</span>
                                  <p className="text-[10px] font-semibold text-foreground truncate">{t.event?.venue || 'Campus'}</p>
                               </div>
                            </div>
                         </div>
                         
                         <div className="p-4 bg-muted/20 flex flex-row items-center justify-between gap-4">
                            <div className="min-w-0">
                               <span className="text-[8px] font-semibold text-gray-400 uppercase block mb-0.5">Key ID</span>
                               <p className="font-mono text-[10px] font-semibold text-foreground truncate">{t.ticketNumber || t.id.substring(0, 10).toUpperCase()}</p>
                            </div>
                            <div className="w-12 h-12 bg-white p-1 rounded-md shadow-sm shrink-0 flex items-center justify-center">
                               <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EventraTicket')] bg-cover opacity-80" />
                            </div>
                         </div>
                      </div>
                    )) : (
                      <div className="col-span-2 py-20 bg-muted/10 rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
                         <CheckCircle className="w-12 h-12 text-gray-200 mb-4" />
                         <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">No passes issued</p>
                      </div>
                    )}
                  </div>
                 </motion.div>
              )}

              {activeSection === "settings" && (
                 <motion.div
                   key="settings"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-6"
                 >
                   <div className="bg-card rounded-xl border border-gray-200 p-8 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <SettingsIcon className="w-5 h-5" />
                         </div>
                         <div>
                            <h2 className="text-lg font-semibold text-foreground tracking-tight">Experience Controls</h2>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Interface preferences.</p>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-5 bg-muted/20 rounded-xl border border-gray-100">
                            <div>
                               <h3 className="font-semibold text-foreground text-xs uppercase tracking-tight">System Appearance</h3>
                               <p className="text-[10px] text-gray-400 font-normal">Choose your visual environment.</p>
                            </div>
                            <div className="flex bg-muted p-1 rounded-lg">
                               <button 
                                 type="button"
                                 onClick={async () => {
                                   const newPrefs = { preferences: { theme: 'light' as const } };
                                   const res = await api.put('/users/profile', newPrefs, token || undefined);
                                   if (res.success) {
                                     updateUser(newPrefs);
                                     toast.success("Identity updated (Light)");
                                   }
                                 }}
                                 className={`px-4 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${user.preferences?.theme === 'light' ? 'bg-card text-primary shadow-sm' : 'text-gray-400 hover:text-foreground'}`}
                               >
                                 Day
                               </button>
                               <button 
                                 type="button"
                                 onClick={async () => {
                                   const newPrefs = { preferences: { theme: 'dark' as const } };
                                   const res = await api.put('/users/profile', newPrefs, token || undefined);
                                   if (res.success) {
                                     updateUser(newPrefs);
                                     toast.success("Identity updated (Dark)");
                                   }
                                 }}
                                 className={`px-4 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${user.preferences?.theme === 'dark' ? 'bg-card text-primary shadow-sm' : 'text-gray-400 hover:text-foreground'}`}
                               >
                                 Night
                               </button>
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
                         <p className="text-[10px] text-gray-400 font-medium">Global core parameters are accessible in the security hub.</p>
                         <Link to="/settings" className="px-5 py-2 rounded-lg bg-muted font-semibold text-[10px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all">Hub Settings</Link>
                      </div>
                   </div>
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
