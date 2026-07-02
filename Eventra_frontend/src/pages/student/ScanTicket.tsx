import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { QrCode, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { toast } from "sonner";

const ScanTicket = () => {
  const { id: eventId } = useParams();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);

  const isScanningRef = React.useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
            width: 250,
            height: 250,
        },
        fps: 5,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, false);

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText: string) {
        // Use ref to avoid stale closure — prevents duplicate rapid scans
        if (!isScanningRef.current) {
            handleScan(decodedText);
        }
    }

    function onScanError(_error: any) {
        // Ignore continuous scan errors (normal for QR scanners)
    }

    return () => {
        scanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner. ", error);
        });
    };
  }, []);

  const handleScan = async (scannedId: string) => {
    if (!scannedId) return;
    isScanningRef.current = true;
    setLoading(true);
    setScanResult(null);
    try {
        const response = await api.post("/tickets/scan", { ticketId: scannedId }, token || undefined);
        if (response.success) {
            setScanResult({ success: true, message: response.message, data: response.data });
            toast.success("Ticket scanned successfully");
        } else {
            setScanResult({ success: false, message: response.message || "Scan failed" });
            toast.error(response.message || "Invalid ticket");
        }
    } catch (error: any) {
        setScanResult({ success: false, message: error.response?.data?.message || "Invalid ticket or unauthorized" });
        toast.error("Failed to verify ticket");
    } finally {
        setLoading(false);
        setTicketId("");
        // Allow next scan after 2s cooldown
        setTimeout(() => { isScanningRef.current = false; }, 2000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleScan(ticketId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      <Link to="/student/coordinated-events" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-bold group inline-flex">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>
      
      <div className="text-center">
        <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center justify-center gap-3 mb-2">
          <QrCode className="w-8 h-8 text-primary" />
          Ticket Scanner
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Scan participant QR codes to verify registration and mark attendance.
        </p>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden p-6">
        {/* Scanner Area */}
        <div id="reader" className="mx-auto rounded-xl overflow-hidden mb-6 border-2 border-dashed border-border/50 bg-secondary/30"></div>
        
        {/* Manual Input */}
        <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-black tracking-widest">Or enter manually</span>
            </div>
        </div>

        <form onSubmit={handleManualSubmit} className="mt-6 flex gap-3">
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Enter Ticket ID (e.g. EVT-USER-1234)"
            className="flex-1 px-4 py-3.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium uppercase font-mono"
          />
          <button 
            type="submit"
            disabled={loading || !ticketId}
            className="px-6 py-3.5 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
          </button>
        </form>

        {/* Scan Result Node */}
        {scanResult && (
            <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className={`mt-6 p-6 rounded-2xl border ${scanResult.success ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'} text-center`}
            >
                <div className="flex justify-center mb-4">
                    {scanResult.success ? (
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    ) : (
                        <XCircle className="w-12 h-12 text-destructive" />
                    )}
                </div>
                <h3 className={`text-xl font-black mb-1 ${scanResult.success ? 'text-green-600' : 'text-destructive'}`}>
                    {scanResult.success ? 'Verification Successful' : 'Verification Failed'}
                </h3>
                <p className="text-sm font-medium mb-3 text-muted-foreground opacity-90">{scanResult.message}</p>
                
                {scanResult.data?.ticketId && (
                    <div className="mt-4 p-3 bg-card rounded-xl border border-border inline-block min-w-[200px]">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-1">Scanned ID</span>
                        <span className="font-mono text-sm font-bold text-foreground">{scanResult.data.ticketId}</span>
                    </div>
                )}
            </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScanTicket;
