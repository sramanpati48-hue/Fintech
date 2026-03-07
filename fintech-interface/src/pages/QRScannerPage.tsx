import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Camera,
  CameraOff,
  Zap,
  Globe,
  Loader2,
  RefreshCw,
  Keyboard,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useConvert } from "../hooks";
import { parseQRPayload, QRParseError } from "../utils/qrParser";
import PaymentConfirmation from "../components/PaymentConfirmation";
import { useToast } from "../components/ui/Toast";
import type { QRPaymentData } from "../types/api";

/* ── View states ── */
type View = "idle" | "scanning" | "confirm";

const SCANNER_ELEMENT_ID = "qr-reader";

const QRScannerPage: React.FC = () => {
  const [view, setView] = useState<View>("idle");
  const [qrData, setQrData] = useState<QRPaymentData | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState(false);
  const [manualValue, setManualValue] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  const { quote, receipt, loading, error, getQuote, confirm, reset } = useConvert();
  const { toast } = useToast();

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Stop scanner helper ── */
  const stopScanner = useCallback(async () => {
    try {
      const s = scannerRef.current;
      if (s) {
        const state = s.getState();
        // 2 = SCANNING, per html5-qrcode
        if (state === 2) {
          await s.stop();
        }
        s.clear();
      }
    } catch {
      /* already stopped — safe to ignore */
    } finally {
      scannerRef.current = null;
    }
  }, []);

  /* ── Start camera scanning ── */
  const startScanner = useCallback(async () => {
    setCameraError(null);
    setView("scanning");

    // Ensure previous instance is torn down
    await stopScanner();

    // Small delay so the DOM element is rendered
    await new Promise((r) => setTimeout(r, 150));

    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, /* verbose */ false);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // QR code scanned — parse + move on
          handleScanResult(decodedText);
        },
        () => {
          /* per-frame not-found — intentionally ignored */
        },
      );
    } catch (err: any) {
      if (!mountedRef.current) return;
      const msg =
        err?.message?.includes("NotAllowedError") || err?.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access in your browser."
          : err?.message?.includes("NotFoundError")
          ? "No camera found on this device."
          : `Camera error: ${err?.message || "Unknown error"}`;
      setCameraError(msg);
      setView("idle");
      toast({ type: "error", message: msg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopScanner, toast]);

  /* ── Handle decoded QR string ── */
  const handleScanResult = useCallback(
    async (raw: string) => {
      // Stop the camera first
      await stopScanner();

      try {
        const data = parseQRPayload(raw);
        if (!mountedRef.current) return;
        setQrData(data);
        setView("confirm");

        // Auto-fetch FX quote
        try {
          await getQuote({
            localAmount: data.localAmount,
            localCurrency: data.localCurrency,
            merchantId: data.merchantId,
          });
        } catch {
          /* error already captured in hook */
        }
      } catch (err) {
        if (!mountedRef.current) return;
        const message =
          err instanceof QRParseError
            ? `Invalid QR: ${err.message}`
            : "Could not parse QR code.";
        setCameraError(message);
        setView("idle");
        toast({ type: "error", message });
      }
    },
    [stopScanner, getQuote, toast],
  );

  /* ── Manual text entry submit ── */
  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualValue.trim()) return;
      setManualInput(false);
      handleScanResult(manualValue.trim());
      setManualValue("");
    },
    [manualValue, handleScanResult],
  );

  /* ── Confirm payment ── */
  const handlePay = useCallback(async () => {
    if (!quote || !qrData) return;
    try {
      await confirm({
        localAmount: qrData.localAmount,
        localCurrency: qrData.localCurrency,
        merchantId: qrData.merchantId,
        homeAmount: quote.homeAmount,
        fxRate: quote.fxRate,
        fee: quote.fee,
      });
      toast({ type: "success", message: "Payment completed!" });
    } catch (err: any) {
      const msg = err?.message || "Payment failed";
      // Check for insufficient balance (402)
      if (msg.toLowerCase().includes("insufficient") || msg.includes("402")) {
        toast({ type: "error", message: "Insufficient balance. Please top up your account." });
      } else {
        toast({ type: "error", message: msg });
      }
    }
  }, [quote, qrData, confirm, toast]);

  /* ── Reset everything ── */
  const handleReset = useCallback(async () => {
    await stopScanner();
    setQrData(null);
    setCameraError(null);
    setView("idle");
    setManualInput(false);
    setManualValue("");
    reset();
  }, [stopScanner, reset]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">QR Scanner</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Scan a QR code to make instant payments.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ────────── CONFIRM VIEW ────────── */}
        {view === "confirm" && qrData ? (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PaymentConfirmation
              qrData={qrData}
              quote={quote}
              loading={loading}
              error={error}
              receipt={receipt}
              onConfirm={handlePay}
              onCancel={handleReset}
            />
          </motion.div>
        ) : (
          /* ────────── SCANNER / IDLE VIEW ────────── */
          <motion.div
            key="scanner"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-6"
          >
            {/* Camera viewport */}
            <div className="relative aspect-square max-w-sm mx-auto bg-gray-900 dark:bg-black rounded-2xl overflow-hidden">
              {/* The html5-qrcode element — always in DOM so the lib can attach */}
              <div
                id={SCANNER_ELEMENT_ID}
                className="absolute inset-0"
                style={{ overflow: "hidden", borderRadius: "1rem" }}
              />

              {/* Overlay: corner markers */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {["top-6 left-6", "top-6 right-6 rotate-90", "bottom-6 left-6 -rotate-90", "bottom-6 right-6 rotate-180"].map(
                  (pos, i) => (
                    <div key={i} className={`absolute ${pos}`}>
                      <div className="w-12 h-12">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-400 rounded-full" />
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-brand-400 rounded-full" />
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Center placeholder when idle */}
              {view === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                      <QrCode className="w-8 h-8 text-white/70" />
                    </div>
                    <p className="text-white/60 text-sm">Position QR code within frame</p>
                  </motion.div>
                </div>
              )}

              {/* Scanning pulsing indicator */}
              {view === "scanning" && (
                <div className="absolute inset-0 flex items-end justify-center pb-6 z-10 pointer-events-none">
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full"
                  >
                    <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                    <span className="text-brand-300 text-xs font-medium">Looking for QR code…</span>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Camera error banner */}
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3"
              >
                <CameraOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">{cameraError}</p>
                  <p className="text-xs text-red-500/80 mt-1">Try using manual entry below instead.</p>
                </div>
              </motion.div>
            )}

            {/* Primary action(s) */}
            {view === "idle" && (
              <div className="space-y-3">
                <button
                  onClick={startScanner}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Start Scanning
                </button>

                {/* Manual entry toggle */}
                <button
                  onClick={() => setManualInput((v) => !v)}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Keyboard className="w-4 h-4" />
                  {manualInput ? "Hide Manual Entry" : "Enter Code Manually"}
                </button>

                <AnimatePresence>
                  {manualInput && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleManualSubmit}
                      className="overflow-hidden space-y-2"
                    >
                      <input
                        type="text"
                        value={manualValue}
                        onChange={(e) => setManualValue(e.target.value)}
                        placeholder='e.g. MID:tokyo-cafe|AMT:2500|CUR:JPY'
                        className="input-field font-mono text-sm"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!manualValue.trim()}
                        className="btn-primary w-full disabled:opacity-50"
                      >
                        Submit Code
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Retry shortcut when there was a camera error */}
                {cameraError && (
                  <button
                    onClick={() => { setCameraError(null); startScanner(); }}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Camera
                  </button>
                )}
              </div>
            )}

            {view === "scanning" && (
              <button onClick={handleReset} className="btn-secondary w-full">
                Cancel Scanning
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Globe, label: "180+ Countries", desc: "Pay anywhere" },
          { icon: Zap, label: "Instant", desc: "Real-time processing" },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 text-center"
          >
            <item.icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QRScannerPage;
