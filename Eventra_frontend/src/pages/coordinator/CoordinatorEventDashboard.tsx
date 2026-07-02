import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  Users, ArrowLeft, Search, Loader2, CheckCircle2, 
  Mail, ClipboardList,
  BarChart3, UserCheck, UserX, Clock, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

const CoordinatorEventDashboard = () => {
  const { eventId } = useParams();
  const { user, token } = useAuth();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [eventRes, attendeesRes] = await Promise.all([
        api.get(`/events/${eventId}`, token || undefined),
        api.get(`/registrations/event/${eventId}`, token || undefined)
      ]);

      if (eventRes.success) setEvent(eventRes.data);
      if (attendeesRes.success) setAttendees(attendeesRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && eventId) {
      fetchData();
    }
  }, [user, eventId, token]);

  const filtered = attendees.filter(a => 
    a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkedInCount = attendees.filter(a => a.attendanceStatus === 'present').length;
  const pendingCount = attendees.length - checkedInCount;

  return (
    <DashboardLayout role="coordinator">
      <div className="max-w-7xl mx-auto space-y-10 font-sans">
        {/* Back and Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/coordinator" className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all shadow-sm group">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-all" />
            </Link>
            <div>
               <h1 className="text-3xl font-semibold text-foreground font-heading">Event Participants</h1>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-primary font-semibold text-xs uppercase tracking-wider">{event?.title || "Loading..."}</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full" />
                 <span className="text-gray-500 text-xs font-medium">Management Hub</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-gray-400" /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-sm">Syncing attendee data...</p>
             </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: "Total Registered", value: attendees.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                 { label: "Checked In", value: checkedInCount, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                 { label: "Remaining", value: pendingCount, icon: UserX, color: "text-amber-600", bg: "bg-amber-50" },
                 { label: "Attendance Rate", value: `${attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0}%`, icon: BarChart3, color: "text-primary", bg: "bg-primary/5" }
               ].map((stat, i) => (
                 <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-semibold text-foreground tracking-tight">{stat.value}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Attendance Hub */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
               <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <h3 className="text-xl font-semibold text-foreground font-heading">Participant List</h3>
                        <p className="text-xs font-medium text-gray-500 tracking-wide mt-0.5">Real-time attendance tracking</p>
                     </div>
                  </div>
                  
                  <div className="relative w-full md:w-96">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search student or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm transition-all focus:border-primary outline-none"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                     <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                           <th className="px-8 py-4 border-b border-gray-100">Student Details</th>
                           <th className="px-8 py-4 border-b border-gray-100">Ticket ID</th>
                           <th className="px-8 py-4 border-b border-gray-100 text-center">Status</th>
                           <th className="px-8 py-4 border-b border-gray-100 text-right">Verification</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {filtered.map((attendee) => (
                           <tr key={attendee.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold overflow-hidden shadow-sm uppercase">
                                       {attendee.studentName?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="font-semibold text-foreground truncate">{attendee.studentName}</p>
                                       <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                          {attendee.studentEmail}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="p-1 px-2.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono font-medium text-gray-600 uppercase">
                                    {attendee.id.slice(-8)}
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex justify-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                                       attendee.attendanceStatus === 'present' 
                                       ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                       : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                       {attendee.attendanceStatus === 'present' ? (
                                          <><CheckCircle2 className="w-3.5 h-3.5" /> Present</>
                                       ) : (
                                          <><Clock className="w-3.5 h-3.5" /> Pending</>
                                       )}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex justify-end items-center gap-2">
                                    {attendee.attendanceStatus === 'present' ? (
                                       <div className="px-3 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg border border-gray-100 flex items-center gap-2 uppercase tracking-wider">
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified
                                       </div>
                                    ) : (
                                       <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Awaiting Link</span>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filtered.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <UserX className="w-12 h-12 text-gray-200 mb-4" />
                        <h4 className="text-lg font-semibold text-gray-400">No Participants Found</h4>
                        <p className="text-sm text-gray-400 mt-1">Try searching for a different name or email.</p>
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

export default CoordinatorEventDashboard;
