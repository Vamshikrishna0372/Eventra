import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Users, ArrowLeft, Search, Loader2, CheckCircle2, XCircle, Mail, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { formatDate } from "@/lib/utils";

const EventAttendees = () => {
  const { id: event_id } = useParams();
  const { user, token } = useAuth();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, attendeesRes] = await Promise.all([
          api.get(`/events/${event_id}`, token || undefined),
          api.get(`/registrations/event/${event_id}`, token || undefined)
        ]);

        if (eventRes.success) setEvent(eventRes.data);
        if (attendeesRes.success) setAttendees(attendeesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user && event_id) {
      fetchData();
    }
  }, [user, event_id, token]);

  const filtered = attendees.filter(a => 
    a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedInCount = attendees.filter(a => a.attendanceStatus === 'present').length;

  return (
    <DashboardLayout role="student">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Link to="/student/coordinated-events" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
             <h1 className="text-2xl font-black text-foreground tracking-tight">Attendance List</h1>
             <p className="text-sm text-muted-foreground">{event?.title || "Loading event..."}</p>
          </div>
        </div>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-border">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Fetching attendees...</p>
             </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Registered</p>
                  <p className="text-2xl font-black text-foreground">{attendees.length}</p>
               </div>
               <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Checked In</p>
                  <p className="text-2xl font-black text-emerald-600">{checkedInCount}</p>
               </div>
               <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Pending</p>
                  <p className="text-2xl font-black text-amber-600">{attendees.length - checkedInCount}</p>
               </div>
               <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Attendance Rate</p>
                  <p className="text-2xl font-black text-primary">
                    {attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0}%
                  </p>
               </div>
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
               <div className="p-6 border-b border-border bg-muted/30 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-80">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <input
                        type="text"
                        placeholder="Search attendees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Showing {filtered.length} of {attendees.length}</span>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-muted/50 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                        <tr>
                           <th className="px-6 py-4">Student</th>
                           <th className="px-6 py-4">Registration Info</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filtered.map((attendee, idx) => (
                           <motion.tr 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              key={attendee.id} 
                              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group"
                           >
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                       {attendee.studentName?.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="font-bold text-foreground">{attendee.studentName}</p>
                                       <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Mail className="w-3 h-3" /> {attendee.studentEmail}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-xs font-medium text-foreground">Reg ID: {attendee.id.slice(-6).toUpperCase()}</p>
                                 <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {formatDate(attendee.registeredAt)}
                                 </p>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                                    attendee.attendanceStatus === 'present' 
                                    ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                 }`}>
                                    {attendee.attendanceStatus === 'present' ? (
                                       <><CheckCircle2 className="w-3 h-3" /> Present</>
                                    ) : (
                                       <><Loader2 className="w-3 h-3" /> Pending</>
                                    )}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button 
                                    onClick={() => alert("Detailed view coming soon")}
                                    className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                                 >
                                    Details
                                 </button>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
                  {filtered.length === 0 && (
                     <div className="py-20 text-center">
                        <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No attendees found.</p>
                     </div>
                  )}
               </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventAttendees;
