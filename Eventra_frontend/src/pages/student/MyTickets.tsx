import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Ticket, Calendar, MapPin, Search, Loader2, ChevronRight, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDateTime } from "@/lib/utils";
import QRCode from "react-qr-code";
import { usePDF } from "react-to-pdf";
import DashboardLayout from "@/components/layout/DashboardLayout";

const TicketCard = ({ ticket }: { ticket: any }) => {
  const { toPDF, targetRef } = usePDF({ 
    filename: `Ticket-${ticket.ticketId}.pdf`,
    page: { margin: 20 }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-all group"
    >
      {/* This area is used for PDF generation */}
      <div ref={targetRef} className="p-8 bg-white text-slate-900">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
             <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded mb-2">
               Official Campus Pass
             </div>
             <h3 className="font-bold text-xl leading-tight text-slate-900">{ticket.event?.title || "Unknown Event"}</h3>
          </div>
          <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${ticket.checkedIn ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700'}`}>
            {ticket.checkedIn ? "Used" : "Active"}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                 <Calendar className="w-3.5 h-3.5 text-primary" />
                 <span>{formatDateTime(ticket.event?.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                 <MapPin className="w-3.5 h-3.5 text-primary" />
                 <span>{ticket.event?.venue}</span>
              </div>
           </div>
           <div className="bg-slate-50 p-2 rounded-lg flex flex-col items-center justify-center border border-slate-100 italic">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Issue Node</span>
              <span className="text-[10px] font-bold text-slate-600">{formatDateTime(ticket.createdAt)}</span>
           </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6 border-y-2 border-slate-100 border-dashed relative my-6">
           <div className="absolute -left-10 w-6 h-6 bg-slate-100 rounded-full" />
           <div className="absolute -right-10 w-6 h-6 bg-slate-100 rounded-full" />
           
           <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm">
             <QRCode value={ticket.ticketId} size={140} level="H" />
           </div>
           
           <div className="mt-6 text-center">
             <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Node ID</p>
             <p className="text-xs font-bold text-slate-800 font-mono mt-1 select-all">{ticket.ticketId}</p>
           </div>
        </div>

        <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
           <span>Eventra Platform</span>
           <span>Non-Transferable Pass</span>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50/50 border-t border-gray-100 flex gap-2">
         <Link 
           to={`/student/events/${ticket.eventId}`} 
           className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
         >
           <Eye className="w-3 h-3" /> Details
         </Link>
         <button 
           onClick={() => toPDF()} 
           className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary/95 transition-all shadow-sm active:scale-95"
         >
           <Download className="w-3 h-3" /> Download
         </button>
      </div>
    </motion.div>
  );
};

const MyTickets = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/tickets/user/${user.id}`, token || undefined);
        if (response.success) {
          setTickets(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user, token]);

  const filteredTickets = tickets.filter(t => 
    t.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.ticketId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto space-y-10 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-2">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight flex items-center gap-3">
              Digital Access Nodes
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl font-normal leading-relaxed">
              Your unique authentication keys for campus sessions. Keep them secure and present them at the venue.
            </p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Filter by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-xs font-semibold shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-card rounded-2xl border border-gray-200 shadow-sm mx-2">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">Synchronizing Passes...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {filteredTickets.map((ticket, index) => (
               <TicketCard key={ticket.id || index} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-card rounded-2xl border border-gray-200 text-center shadow-sm mx-2 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <Ticket className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">No Tickets Yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mt-2 font-normal leading-relaxed mx-auto px-4">
              {searchTerm ? `No results for "${searchTerm}". Try a different identifier.` : "Register for events to receive your digital tickets here."}
            </p>
            <Link to="/student/explore" className="mt-10 px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all shadow-md active:scale-95 flex items-center gap-2">
              Explore Campus <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTickets;
