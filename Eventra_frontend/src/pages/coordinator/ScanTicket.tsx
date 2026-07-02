import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { QrCode, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ScanTicket = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (user && user.role !== "admin" && !user.isCoordinator) {
        toast.error("Unauthorized access to scanner");
        navigate("/student");
        return;
    }

    const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 280, height: 280 },
        fps: 10,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, false);

    scannerRef.current = scanner;
    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText: string) {
        if (!isScanningRef.current) handleScan(decodedText);
    }

    function onScanError(_error: any) {}

    return () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(err => console.error("Scanner cleanup error", err));
        }
    };
  }, [user, navigate]);

  const handleScan = async (scannedId: string) => {
    if (!scannedId) return;
    isScanningRef.current = true;
    setLoading(true);
    setScanResult(null);
    
    try {
        const response = await api.post("/tickets/checkin", { ticketId: scannedId }, token || undefined);
        if (response.success) {
            setScanResult({ success: true, message: response.message, data: response.data });
            toast.success("Attendance verified");
        } else {
            setScanResult({ success: false, message: response.message || "Invalid ticket" });
        }
    } catch (error: any) {
        setScanResult({ success: false, message: "Security verification failed" });
    } finally {
        setLoading(false);
        setTicketId("");
        setTimeout(() => { isScanningRef.current = false; }, 3000);
    }
  };

  return (
    <DashboardLayout role="coordinator">
        <div className="max-w-3xl mx-auto py-10 px-4 font-sans">
            <div className="flex items-center justify-between mb-10">
                <Link to="/coordinator" className="group flex items-center gap-3 p-2 pr-4 hover:bg-gray-100 rounded-lg transition-all">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-all" />
                    <span className="text-sm font-semibold text-gray-600">Back to Dashboard</span>
                </Link>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-3xl font-semibold text-foreground font-heading">Scan Tickets</h1>
                <p className="text-sm text-gray-500 mt-2">Align the QR code within the frame to verify attendance.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-8 flex flex-col items-center">
                <div id="reader" className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-inner" />

                <div className="w-full mt-12 space-y-6">
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Entry Manually</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleScan(ticketId); }} className="flex gap-2">
                        <input
                            type="text"
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                            placeholder="Ticket ID"
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:border-primary outline-none"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !ticketId}
                            className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                        </button>
                    </form>
                </div>
            </div>

            <AnimatePresence>
                {scanResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`mt-8 p-8 rounded-xl border shadow-lg text-center ${scanResult.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${scanResult.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            {scanResult.success ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <h3 className={`text-xl font-semibold font-heading mb-1 ${scanResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                            {scanResult.success ? 'Access Granted' : 'Access Denied'}
                        </h3>
                        <p className="text-sm font-medium text-gray-600 mb-6">{scanResult.message}</p>
                        <button onClick={() => setScanResult(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Clear Result</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </DashboardLayout>
  );
};

export default ScanTicket;
