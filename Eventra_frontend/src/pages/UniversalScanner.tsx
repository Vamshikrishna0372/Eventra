import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import {
  ScanLine, CheckCircle2, XCircle, Loader2, Camera,
  User, CalendarRange, Ticket, MapPin, RotateCcw,
  ShieldCheck, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ──────────────────────────────────────────────────────────────
// Safe scanner div ID — Html5Qrcode owns this div entirely.
// NEVER render React children inside it (causes removeChild crash).
// ──────────────────────────────────────────────────────────────
const SCANNER_DIV_ID = "universal-qr-scanner-div";

interface ScanResult {
  success: boolean;
  message: string;
  alreadyUsed?: boolean;
  data?: {
    ticketId: string;
    eventName?: string;
    eventVenue?: string;
    userName?: string;
    userEmail?: string;
    checkedInAt?: string;
  };
}

// ──────────────────────────────────────────────────────────────
// QR Camera Component
// ──────────────────────────────────────────────────────────────
const QrCamera = ({
  onScan,
  disabled,
}: {
  onScan: (text: string) => void;
  disabled: boolean;
}) => {
  const [camState, setCamState] = useState<"loading" | "active" | "error">("loading");
  const instanceRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  // Synchronous DOM cleanup — runs before React fiber teardown
  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const sc = instanceRef.current;
      if (sc) {
        instanceRef.current = null;
        if (sc.isScanning) {
          sc.stop()
            .then(() => { try { sc.clear(); } catch (_) {} })
            .catch(() => {});
        }
        // Immediately empty the container so React's removeChild succeeds
        const el = document.getElementById(SCANNER_DIV_ID);
        if (el) el.innerHTML = "";
      }
    };
  }, []);

  // Async initialization
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled || !mountedRef.current) return;
      try {
        const sc = new Html5Qrcode(SCANNER_DIV_ID);
        instanceRef.current = sc;
        await sc.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          (decoded) => {
            if (mountedRef.current && !cancelled && !disabled) {
              onScan(decoded);
            }
          },
          () => {} // per-frame decode errors are normal, ignore them
        );
        if (mountedRef.current && !cancelled) setCamState("active");
      } catch (err) {
        console.warn("[UniversalScanner] Camera init:", err);
        if (mountedRef.current && !cancelled) {
          setCamState("error");
          toast.error("Camera unavailable. Use manual entry below.");
        }
      }
    };

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      {/* Loading / error overlay — positioned OUTSIDE the scanner div */}
      {camState !== "active" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-muted/80 rounded-2xl backdrop-blur-sm">
          {camState === "loading" ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Starting camera…</p>
            </>
          ) : (
            <>
              <Camera className="w-8 h-8 text-muted-foreground opacity-50" />
              <p className="text-xs font-medium text-muted-foreground">Camera unavailable</p>
            </>
          )}
        </div>
      )}

      {/* Processing overlay when a scan is in progress */}
      {disabled && camState === "active" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-2xl backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-xs font-semibold text-white uppercase tracking-wider">Verifying…</p>
        </div>
      )}

      {/* Corner-bracket viewfinder overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none p-3">
        <div className="relative w-full h-full">
          <div className="absolute top-0 left-0 w-9 h-9 border-t-2 border-l-2 border-primary rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-9 h-9 border-t-2 border-r-2 border-primary rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-9 h-9 border-b-2 border-l-2 border-primary rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-9 h-9 border-b-2 border-r-2 border-primary rounded-br-xl" />
        </div>
      </div>

      {/* Scan line animation */}
      {camState === "active" && !disabled && (
        <motion.div
          className="absolute left-4 right-4 z-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_8px_rgba(var(--primary)/0.8)]"
          animate={{ top: ["20%", "80%", "20%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/*
        THIS div is fully owned by Html5Qrcode.
        DO NOT render React children here — it will crash on unmount.
      */}
      <div
        id={SCANNER_DIV_ID}
        className="w-full h-full rounded-2xl overflow-hidden border border-border bg-black shadow-md"
      />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Result Card
// ──────────────────────────────────────────────────────────────
const ResultCard = ({
  result,
  onReset,
}: {
  result: ScanResult;
  onReset: () => void;
}) => {
  const isSuccess = result.success;
  const isAlreadyUsed = !isSuccess && result.alreadyUsed;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`w-full rounded-2xl border p-6 ${
        isSuccess
          ? "bg-emerald-50 border-emerald-200"
          : isAlreadyUsed
          ? "bg-amber-50 border-amber-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      {/* Status header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
            isSuccess
              ? "bg-emerald-500 text-white"
              : isAlreadyUsed
              ? "bg-amber-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : isAlreadyUsed ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
        </div>
        <div>
          <p
            className={`text-base font-bold ${
              isSuccess
                ? "text-emerald-700"
                : isAlreadyUsed
                ? "text-amber-700"
                : "text-red-700"
            }`}
          >
            {isSuccess
              ? "Access Granted"
              : isAlreadyUsed
              ? "Already Checked In"
              : "Access Denied"}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{result.message}</p>
        </div>
      </div>

      {/* Details grid */}
      {result.data && (
        <div className="space-y-3 mb-5">
          {result.data.userName && (
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-white">
              <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Participant</p>
                <p className="text-sm font-semibold text-foreground">{result.data.userName}</p>
                {result.data.userEmail && (
                  <p className="text-xs text-muted-foreground">{result.data.userEmail}</p>
                )}
              </div>
            </div>
          )}

          {result.data.eventName && (
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-white">
              <CalendarRange className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event</p>
                <p className="text-sm font-semibold text-foreground">{result.data.eventName}</p>
                {result.data.eventVenue && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {result.data.eventVenue}
                  </p>
                )}
              </div>
            </div>
          )}

          {result.data.ticketId && (
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-white">
              <Ticket className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ticket ID</p>
                <p className="text-sm font-mono font-semibold text-foreground tracking-wider">{result.data.ticketId}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
      >
        <RotateCcw className="w-4 h-4" />
        Scan Next Ticket
      </button>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────
const UniversalScanner = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [manualId, setManualId] = useState("");
  const [scanCount, setScanCount] = useState(0); // key for re-mounting camera after reset
  const processingRef = useRef(false);

  // Access control — must be admin or coordinator
  useEffect(() => {
    if (user && user.role !== "admin" && !user.isCoordinator) {
      toast.error("Unauthorized: Scanner access requires coordinator or admin role.");
      navigate("/student");
    }
  }, [user, navigate]);

  const handleScan = async (ticketId: string) => {
    if (!ticketId.trim() || processingRef.current || verifying) return;

    processingRef.current = true;
    setVerifying(true);

    try {
      const response = await api.post(
        "/tickets/checkin",
        { ticketId: ticketId.trim() },
        token || undefined
      );

      const isAlreadyUsed = !response.success && response.message?.toLowerCase().includes("already");

      setScanResult({
        success: response.success,
        message: response.message,
        alreadyUsed: isAlreadyUsed,
        data: response.data,
      });

      if (response.success) {
        toast.success("✅ Attendance recorded!");
      } else if (isAlreadyUsed) {
        toast.warning("⚠️ Ticket already used.");
      } else {
        toast.error("❌ " + (response.message || "Invalid ticket"));
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Verification failed. Please try again.";
      setScanResult({
        success: false,
        message: msg,
        alreadyUsed: false,
      });
      toast.error(msg);
    } finally {
      setVerifying(false);
      // Allow re-scan after 2 seconds
      setTimeout(() => {
        processingRef.current = false;
      }, 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      handleScan(manualId.trim());
      setManualId("");
    }
  };

  const handleReset = () => {
    setScanResult(null);
    processingRef.current = false;
    setVerifying(false);
    // Increment key to remount the camera component cleanly
    setScanCount((c) => c + 1);
  };

  return (
    <DashboardLayout role={user?.role === "admin" ? "admin" : "coordinator"}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-heading flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-primary" />
              Universal Ticket Scanner
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Scan any event ticket — event is detected automatically from the QR code.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-xs font-semibold text-primary">
            <ShieldCheck className="w-4 h-4" />
            {user?.role === "admin" ? "Admin Access" : "Coordinator Access"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Scanner */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                Point camera at QR code
              </p>

              {/* Camera — re-mounts cleanly on reset via key prop */}
              {!scanResult ? (
                <QrCamera
                  key={scanCount}
                  onScan={handleScan}
                  disabled={verifying}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full aspect-square max-w-[300px] mx-auto rounded-2xl bg-muted/30 border border-dashed border-border">
                  <ScanLine className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-xs font-medium text-muted-foreground">Scanner paused</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Click "Scan Next Ticket" to continue</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-100" />
              <span className="mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-shrink">
                Or enter manually
              </span>
              <div className="flex-grow border-t border-gray-100" />
            </div>

            {/* Manual Entry */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Ticket ID (e.g. EVT001-USER123-4821)"
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
                disabled={verifying}
              />
              <button
                type="submit"
                disabled={!manualId.trim() || verifying}
                className="px-5 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </button>
            </form>
          </div>

          {/* Right: Result Panel */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {scanResult ? (
                <ResultCard
                  key="result"
                  result={scanResult}
                  onReset={handleReset}
                />
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[320px] space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-muted-foreground opacity-30" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Awaiting Scan</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The result will appear here after a ticket is scanned.
                    </p>
                  </div>

                  {/* Stats hint */}
                  <div className="w-full pt-6 mt-2 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
                    {[
                      { label: "Auto-detect", desc: "Event from QR" },
                      { label: "Real-time", desc: "MongoDB update" },
                      { label: "Dedup check", desc: "Double-scan safe" },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan history note */}
            <div className="bg-muted/30 border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">How it works:</span> The QR code on each ticket contains a unique <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">ticketId</code>. 
              The backend automatically extracts the event from this ID — no manual event selection needed.
              Duplicate scans are blocked in real time.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UniversalScanner;
