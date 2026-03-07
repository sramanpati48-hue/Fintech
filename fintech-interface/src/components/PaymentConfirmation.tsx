/**
 * PaymentConfirmation — polished mobile card showing the FX breakdown.
 *
 * Props:
 *   qrData   — parsed merchant QR payload
 *   quote    — live FX quote from the backend
 *   loading  — hook loading flag
 *   error    — hook error string
 *   receipt  — non-null once payment succeeds
 *   onConfirm — fires the payment
 *   onCancel  — goes back to scanner
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Store,
  ArrowDownUp,
  Receipt,
  AlertCircle,
} from "lucide-react";
import type { QRPaymentData, ConvertQuoteResponse, CreatePaymentResponse } from "../types/api";

interface Props {
  qrData: QRPaymentData;
  quote: ConvertQuoteResponse | null;
  loading: boolean;
  error: string | null;
  receipt: CreatePaymentResponse | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/* Currency symbol helper */
const SYM: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹", AUD: "A$", CAD: "C$",
  CHF: "Fr", CNY: "¥", SGD: "S$", HKD: "HK$", KRW: "₩", MXN: "Mex$",
};
const sym = (c: string) => SYM[c] ?? c + " ";

const PaymentConfirmation: React.FC<Props> = ({
  qrData, quote, loading, error, receipt, onConfirm, onCancel,
}) => {
  const navigate = useNavigate();

  /* ── Success state ── */
  if (receipt) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Payment Successful!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your payment to <span className="font-semibold">{qrData.merchantName || qrData.merchantId}</span> has been processed.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 text-left space-y-2">
          <Row label="Amount Paid" value={`${sym(receipt.updatedBalance.currency)}${receipt.transaction.homeAmount.toLocaleString()}`} bold />
          <Row label="Merchant" value={qrData.merchantName || qrData.merchantId} />
          <Row label="New Balance" value={`${sym(receipt.updatedBalance.currency)}${receipt.updatedBalance.balance.toLocaleString()}`} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="btn-secondary flex-1">Scan Another</button>
          <button
            onClick={() => navigate("/transactions")}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" /> Transactions
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── Confirmation / Quote state ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="glass-card overflow-hidden"
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-brand-500 to-cyan-600 px-6 py-4 flex items-center gap-3 text-white">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold">{qrData.merchantName || qrData.merchantId}</p>
          <p className="text-xs opacity-80">Merchant Payment</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Conversion breakdown */}
        <div className="space-y-3">
          {/* Local amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Local Amount</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {sym(qrData.localCurrency)}{qrData.localAmount.toLocaleString()} <span className="text-sm font-normal text-gray-400">{qrData.localCurrency}</span>
            </span>
          </div>

          {/* Arrow + rate */}
          {quote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500"
            >
              <ArrowDownUp className="w-4 h-4" />
              <span>1 {quote.localCurrency} = {quote.fxRate.toFixed(6)} {quote.homeCurrency}</span>
            </motion.div>
          )}

          {/* Home amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">You Pay</span>
            {loading && !quote ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            ) : quote ? (
              <span className="text-2xl font-extrabold gradient-text">
                {sym(quote.homeCurrency)}{quote.homeAmount.toLocaleString()}
              </span>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>

          {/* Fee */}
          {quote && (
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-white/5 pt-3">
              <span>Conversion Fee</span>
              <span>{sym(quote.homeCurrency)}{quote.fee.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading || !quote}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Confirm Pay <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* Small helper row */
const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex justify-between">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`text-sm ${bold ? "font-bold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>{value}</span>
  </div>
);

export default PaymentConfirmation;
