import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, Loader2, QrCode, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Scanner } from '@yudiel/react-qr-scanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminRegistrations = () => {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/registrations", token || undefined);
      if (response.success) {
        setRegistrations(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch registrations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [token]);

  const handleCheckIn = async (regId: string) => {
    try {
      const response = await api.put(`/registrations/${regId}/checkin`, {}, token || undefined);
      if (response.success) {
        toast.success("Student checked in successfully!");
        setScannerOpen(false);
        fetchRegistrations();
      } else {
        toast.error(response.message || "Failed to check in");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Error checking in");
    }
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const scannedValue = detectedCodes[0].rawValue;
      if (scannedValue) {
        // Try check in
        handleCheckIn(scannedValue);
      }
    }
  };

  const filtered = registrations.filter((r) => {
    const matchesSearch = 
      r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.studentEmail?.toLowerCase().includes(search.toLowerCase()) ||
      r.eventName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || r.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
        <p className="text-sm text-muted-foreground mt-1">View all student registrations across events — {registrations.length} total.</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student, email, or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-surface"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-card border border-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-surface"
          >
            <option value="All">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => setScannerOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
        >
          <QrCode className="w-5 h-5" />
          Scan QR Ticket
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground animate-pulse">Loading registrations...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl shadow-surface overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3.5 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Student Name</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Event Name</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Req Status</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Check-in</th>
                  <th className="text-right py-3.5 px-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg, i) => (
                  <motion.tr
                    key={reg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {(reg.studentName || "U").split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="font-medium text-card-foreground">{reg.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-muted-foreground">{reg.studentEmail}</td>
                    <td className="py-3.5 px-5 text-card-foreground font-medium">{reg.eventName}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      reg.status === "confirmed" ? "bg-accent/10 text-accent" :
                      reg.status === "waitlisted" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {reg.status || reg.registrationStatus || "Unknown"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {reg.attendanceStatus === "present" ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" /> Present
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {reg.attendanceStatus !== "present" && (
                       <button
                         onClick={() => handleCheckIn(reg.id)}
                         className="text-xs font-bold text-primary hover:underline"
                       >
                         Mark Present
                       </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No registrations found matching your search.</div>
        )}
      </motion.div>
      )}
      {/* QR Scanner Modal */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black mb-4">Scan Participant Ticket</DialogTitle>
          </DialogHeader>
          <div className="bg-muted rounded-xl overflow-hidden aspect-square border border-border">
            {scannerOpen && (
              <Scanner 
                onScan={handleScan}
                formats={['qr_code']}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Position the QR code within the frame to automatically check in the student.
          </p>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminRegistrations;
