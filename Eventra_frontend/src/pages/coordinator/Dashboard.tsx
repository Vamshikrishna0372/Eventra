import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  ShieldCheck, MapPin, Search, Users, QrCode,
  ClipboardList, Loader2, X, CheckCircle2, XCircle, Camera, Zap, Shield, Layers,
  Settings, Bell, Search as SearchIcon, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from "sonner";

// ============================================================
// QRScanner - Isolated from React's DOM reconciliation
// Key insight: Html5Qrcode directly mutates the scanner div's
// innerHTML. React's reconciler doesn't know about these changes,
// so it crashes when trying to removeChild a node that has been
// moved by the library. Fix: synchronously empty the container
// in useLayoutEffect BEFORE React tears down the fiber tree.
// ============================================================
const QRScanner = ({ onResult, onClose }: { onResult: (text: string) => void, eventTitle: string, onClose: () => void }) => {
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'error'>('loading');
  const [manualId, setManualId] = useState("");
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const SCANNER_ID = "qr-scanner-stable-div";

  // Synchronous DOM cleanup BEFORE React fiber teardown
  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const sc = scannerInstanceRef.current;
      if (sc) {
        scannerInstanceRef.current = null;
        // Fire-and-forget async stop — we don't await it
        if (sc.isScanning) {
          sc.stop().then(() => {
            try { sc.clear(); } catch (_) {}
          }).catch(() => {});
        }
        // CRITICAL: Immediately empty the container so React sees no
        // unexpected children when it removes the fiber nodes.
        const el = document.getElementById(SCANNER_ID);
        if (el) el.innerHTML = "";
      }
    };
  }, []);

  // Async scanner initialization
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await new Promise(r => setTimeout(r, 350));
      if (cancelled || !isMountedRef.current) return;

      try {
        const sc = new Html5Qrcode(SCANNER_ID);
        scannerInstanceRef.current = sc;

        await sc.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded) => {
            if (isMountedRef.current && !cancelled) {
              onResult(decoded);
            }
          },
          () => {} // on parse error — ignored
        );

        if (isMountedRef.current && !cancelled) {
          setCameraState('active');
        }
      } catch (err) {
        console.warn("[QRScanner] Camera init error:", err);
        if (isMountedRef.current && !cancelled) {
          setCameraState('error');
          toast.error("Camera unavailable. Use manual entry below.");
        }
      }
    };

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Camera Viewport */}
      <div className="relative w-full aspect-square max-w-[300px] mx-auto">
        {/* Loading / Error Overlay — OUTSIDE the scanner-controlled div */}
        {cameraState !== 'active' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-muted/80 rounded-2xl backdrop-blur-sm">
            {cameraState === 'loading' ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Initializing camera...</p>
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Camera unavailable</p>
              </>
            )}
          </div>
        )}

        {/* Corner guides overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none p-3">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
          </div>
        </div>

        {/*
          This div is OWNED by Html5Qrcode — React must NEVER render
          children inside it. Html5Qrcode appends a <video> tag here,
          and if React also has children here it will crash on unmount.
        */}
        <div
          id={SCANNER_ID}
          className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-md bg-black"
        />
      </div>

      {/* Manual Entry */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Or enter manually</p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (manualId.trim()) onResult(manualId.trim()); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value.toUpperCase())}
            placeholder="Ticket / Credential ID"
            className="flex-1 bg-background px-4 py-3 rounded-lg text-sm border border-input focus:border-primary outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!manualId.trim()}
            className="px-5 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

const CoordinatorDashboard = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [scanningEvent, setScanningEvent] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events/coordinated", token || undefined);
        if (response.success) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Fetch Hubs Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEvents();
  }, [user, token]);

  const handleVerify = async (scannedId: string) => {
    if (!scannedId || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setVerifying(true);
    
    try {
      const response = await api.post("/tickets/checkin", { ticketId: scannedId }, token || undefined);
      if (response.success) {
        setScanResult({ success: true, message: response.message, data: response.data });
        toast.success("Identity Confirmed");
      } else {
        setScanResult({ success: false, message: response.message || "Credential Invalid" });
      }
    } catch (error: any) {
      setScanResult({ success: false, message: error.response?.data?.message || "Verification Failed" });
    } finally {
      setVerifying(false);
      setTimeout(() => { isProcessingRef.current = false; }, 2000);
    }
  };

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="coordinator">
      <div className="max-w-7xl mx-auto space-y-10 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-3xl font-semibold text-foreground font-heading">
                Coordinator Dashboard
             </h1>
             <p className="text-sm text-gray-500 mt-1">
                Manage your assigned events and scan tickets for attendees.
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative flex-1 sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm focus:border-primary transition-all"
                />
             </div>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "Total Events", value: events.length, icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
             { label: "Participants", value: events.reduce((s, e) => s + (e.registeredCount || 0), 0), icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
             { label: "Active Access", value: events.filter(e => e.status === "open").length, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
             { label: "Security Status", value: "Locked", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/5" },
           ].map((stat, i) => (
             <div key={stat.label} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-semibold text-foreground tracking-tight">{stat.value}</p>
                  </div>
                </div>
             </div>
           ))}
        </div>

        {/* Main assignments Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground font-heading">Assigned Events</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
               <div className="col-span-full py-32 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm font-medium text-gray-500">Syncing coordinator data...</p>
               </div>
            ) : filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-full sm:w-48 h-48 shrink-0">
                  <img 
                    src={event.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-semibold uppercase tracking-wider text-primary px-2 py-1 bg-primary/5 rounded border border-primary/20">Active Hub</span>
                       <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Users className="w-3.5 h-3.5" /> {event.registeredCount || 0} / {event.maxParticipants}
                       </div>
                     </div>
                     <h3 className="text-lg font-semibold text-foreground mb-2 font-heading leading-tight line-clamp-1">{event.title}</h3>
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400" /> {event.venue}
                     </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                     <button 
                       onClick={() => setScanningEvent(event)}
                       className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
                     >
                       <Camera className="w-4 h-4" /> Scan Tickets
                     </button>
                     <Link 
                       to={`/coordinator/event/${event.id}`}
                       className="h-10 px-4 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all active:scale-95"
                     >
                       <ClipboardList className="w-4 h-4" />
                     </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                 <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-20" />
                 <p className="font-semibold text-lg text-gray-600">No Assignments Found</p>
                 <p className="text-sm text-gray-500 mt-2">You don't have any events assigned for coordination yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Modal */}
        <AnimatePresence>
          {scanningEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white border border-border rounded-2xl shadow-xl overflow-hidden relative"
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground font-heading leading-none">Scan Ticket</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{scanningEvent.title}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setScanningEvent(null); setScanResult(null); }} 
                    className="p-2 text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                  {!scanResult ? (
                    <QRScanner 
                      eventTitle={scanningEvent.title}
                      onResult={handleVerify}
                      onClose={() => setScanningEvent(null)}
                    />
                  ) : (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full text-center"
                    >
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${scanResult.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {scanResult.success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                      </div>
                      
                      <h4 className={`text-xl font-bold font-heading mb-2 ${scanResult.success ? 'text-emerald-600' : 'text-red-500'}`}>
                        {scanResult.success ? 'Verification Successful' : 'Verification Failed'}
                      </h4>
                      <p className="text-sm text-gray-500 mb-8">{scanResult.message}</p>
                      
                      <button 
                        onClick={() => { setScanResult(null); isProcessingRef.current = false; }}
                        className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95"
                      >
                        Scan Next
                      </button>
                    </motion.div>
                  )}

                  {verifying && !scanResult && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-[50] rounded-2xl">
                       <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                       <p className="text-sm font-medium text-gray-600">Verifying credential...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default CoordinatorDashboard;
