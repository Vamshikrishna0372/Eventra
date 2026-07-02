import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Search, Loader2, ChevronRight, XCircle, QrCode, Ticket, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDateTime, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MyRegistrations = () => {
  const { user, token } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchRegistrations = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await api.get(`/registrations/user/${user.id}`, token || undefined);
      if (response.success) {
        setRegistrations(response.data);
      }
    } catch (error) {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user?.id, token]);

  const handleCancel = async (regId: string, eventName: string) => {
    if (!window.confirm(`Are you sure you want to cancel your registration for "${eventName}"?`)) return;
    
    try {
      const response = await api.delete(`/registrations/${regId}`, token || undefined);
      if (response.success) {
        toast.success(`Registration cancelled`);
        fetchRegistrations();
      } else {
        toast.error(response.message || "Failed to cancel");
      }
    } catch (error) {
      toast.error("Error cancelling registration");
    }
  };

  const filtered = registrations.filter((r) =>
    (r.event?.title || r.eventName)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="student">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">My registrations</h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">Manage your campus pulse — {registrations.length} spots reserved.</p>
        </div>
        
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by event title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center bg-card rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Database...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-32 text-center bg-card rounded-2xl border border-gray-100 shadow-sm px-6 max-w-4xl mx-auto">
           <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-200">
             <CalendarCheck className="w-10 h-10 text-gray-300" />
           </div>
           <h3 className="text-xl font-semibold text-foreground tracking-tight">No Active Registrations</h3>
           <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto font-normal leading-relaxed">Your reservation history is empty. Start exploring campus sessions and secure your tickets.</p>
           <Link to="/student/explore" className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all shadow-md active:scale-95">
             Discover Events <ChevronRight className="w-3.5 h-3.5" />
           </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {filtered.map((reg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={reg.id} 
                className="bg-card rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{reg.event?.title || reg.eventName}</h3>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        reg.attendanceStatus === "present" ? "bg-emerald-50 text-emerald-600" :
                        reg.status === "cancelled" ? "bg-destructive/5 text-destructive" :
                        "bg-primary/5 text-primary"
                      }`}>
                        {reg.attendanceStatus === "present" ? "Checked In" : reg.status}
                      </span>
                    </div>
                  </div>
                  {reg.ticketId && (
                     <button 
                       onClick={() => setSelectedTicket(reg)}
                       className="p-3 bg-muted/50 text-foreground rounded-xl border border-border hover:bg-muted transition-all"
                     >
                        <QrCode className="w-5 h-5" />
                     </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Event Identity</label>
                    <p className="text-xs font-semibold text-foreground truncate">{formatDateTime(reg.event?.date)}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Joined Node</label>
                    <p className="text-xs font-semibold text-foreground truncate">{formatDate(reg.registeredAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <Link
                    to="/student/tickets"
                    className="flex-1 py-3 bg-white border border-gray-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-3 h-3" /> Digital Pass
                  </Link>
                  {reg.status !== "cancelled" && reg.attendanceStatus !== "present" && (
                    <button
                      onClick={() => handleCancel(reg.id, reg.event?.title || reg.eventName)}
                      className="p-3 bg-destructive/5 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all border border-transparent"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:block bg-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto text-[10px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-muted/20">
                    <th className="text-left py-5 px-8 font-bold text-gray-400 uppercase tracking-[0.15em]">Hub Information</th>
                    <th className="text-left py-5 px-8 font-bold text-gray-400 uppercase tracking-[0.15em]">Date & Node</th>
                    <th className="text-left py-5 px-8 font-bold text-gray-400 uppercase tracking-[0.15em]">Registration</th>
                    <th className="text-left py-5 px-8 font-bold text-gray-400 uppercase tracking-[0.15em]">Status Flow</th>
                    <th className="text-right py-5 px-8 font-bold text-gray-400 uppercase tracking-[0.15em]">Credential Keys</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((reg) => (
                    <tr key={reg.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/5">
                            <CalendarCheck className="w-4.5 h-4.5" />
                          </div>
                          <span className="font-semibold text-sm text-foreground leading-tight">{reg.event?.title || reg.eventName}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-slate-500 font-semibold text-xs tabular-nums">{formatDateTime(reg.event?.date)}</td>
                      <td className="py-5 px-8 text-slate-500 font-semibold text-xs tabular-nums">{formatDate(reg.registeredAt)}</td>
                      <td className="py-5 px-8">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                          reg.attendanceStatus === "present" ? "bg-emerald-50 text-emerald-600" :
                          reg.status === "cancelled" ? "bg-destructive/5 text-destructive" :
                          "bg-primary/5 text-primary"
                        }`}>
                          {reg.attendanceStatus === "present" ? "Checked In" : reg.status}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          {reg.ticketId && (
                            <button 
                              onClick={() => setSelectedTicket(reg)}
                              className="p-2.5 bg-muted/50 text-foreground rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-all hover:shadow-sm"
                              title="Show QR Code"
                            >
                               <QrCode className="w-4 h-4" />
                            </button>
                          )}
                          <Link
                            to="/student/tickets"
                            className="text-xs text-primary font-bold hover:underline bg-primary/5 px-4 py-2 rounded-xl border border-primary/10"
                          >
                            Passes
                          </Link>
                          {reg.status !== "cancelled" && reg.attendanceStatus !== "present" && (
                            <button
                               onClick={() => handleCancel(reg.id, reg.event?.title || reg.eventName)}
                               className="p-2.5 text-destructive hover:bg-destructive/5 rounded-xl border border-transparent transition-all"
                               title="Cancel Node"
                            >
                               <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-sm text-gray-400 font-semibold uppercase tracking-widest">No matching results found</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Ticket QR Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-none p-0 overflow-hidden shadow-2xl">
           <div className="bg-primary p-6 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Ticket className="w-32 h-32" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight mb-2">Access Node Credential</DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-xs font-semibold uppercase tracking-widest">
                  Secure Identity for {selectedTicket?.event?.title || selectedTicket?.eventName}
                </DialogDescription>
              </DialogHeader>
           </div>
           
           <div className="p-8 flex flex-col items-center gap-8">
              <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-xl group hover:scale-105 transition-transform duration-500 ease-out">
                 <QRCode value={selectedTicket?.ticketId || ""} size={180} level="H" />
              </div>
              
              <div className="text-center space-y-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Credential ID</p>
                 <p className="text-sm font-bold text-slate-800 font-mono select-all bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                    {selectedTicket?.ticketId}
                 </p>
              </div>

              <div className="w-full flex gap-3">
                 <Link 
                   to="/student/tickets" 
                   className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all text-center"
                 >
                   Manage Hub
                 </Link>
                 <Link 
                   to="/student/tickets"
                   className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-2"
                 >
                   <Download className="w-3.5 h-3.5" /> Get PDF
                 </Link>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyRegistrations;
