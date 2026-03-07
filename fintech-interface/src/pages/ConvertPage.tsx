import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useConvert, useFXRates } from "../hooks";

/* Static metadata for popular currencies; rest will display code only */
const META: Record<string, { flag: string; name: string }> = {
  USD: { flag: "🇺🇸", name: "US Dollar" },   EUR: { flag: "🇪🇺", name: "Euro" },
  GBP: { flag: "🇬🇧", name: "British Pound" }, JPY: { flag: "🇯🇵", name: "Yen" },
  INR: { flag: "🇮🇳", name: "Indian Rupee" },  AUD: { flag: "🇦🇺", name: "AUD" },
  CAD: { flag: "🇨🇦", name: "CAD" },           CHF: { flag: "🇨🇭", name: "CHF" },
  SGD: { flag: "🇸🇬", name: "SGD" },           AED: { flag: "🇦🇪", name: "AED" },
};

/* Preferred sort order — popular first, then alphabetical */
const PREFERRED = ["USD","EUR","GBP","JPY","INR","AUD","CAD","CHF","SGD","AED"];

const ConvertPage: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState("1000");

  const { quote, receipt, loading, error, getQuote, confirm, reset } = useConvert();
  const { rates, loading: ratesLoading } = useFXRates(fromCurrency);

  /* Build currency select list from live rate keys */
  const currencies = useMemo(() => {
    const codes = Object.keys(rates);
    if (codes.length === 0) return PREFERRED.map(c => ({ code: c, flag: META[c]?.flag || "🌐" }));
    // Sort: preferred first, rest alphabetical
    codes.sort((a, b) => {
      const ai = PREFERRED.indexOf(a), bi = PREFERRED.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return codes.map(c => ({ code: c, flag: META[c]?.flag || "🌐" }));
  }, [rates]);

  // Live rate for display
  const liveRate = rates[toCurrency] || 0;
  const converted = (parseFloat(amount || "0") * liveRate).toFixed(2);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    reset();
  };

  // Auto-fetch quote when inputs change (debounced)
  useEffect(() => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    const timer = setTimeout(() => {
      getQuote({ localAmount: num, localCurrency: fromCurrency }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency]);

  const handleConvert = async () => {
    if (receipt) { reset(); return; }
    if (!quote) {
      const num = parseFloat(amount);
      if (!num || num <= 0) return;
      await getQuote({ localAmount: num, localCurrency: fromCurrency });
      return;
    }
    await confirm();
  };

  // Build exchange rate pairs from live rates for the table
  const PAIRS = [["EUR","USD"],["EUR","GBP"],["EUR","JPY"],["EUR","INR"],["GBP","USD"],["GBP","EUR"],["USD","JPY"],["USD","INR"]];
  const exchangeRatesList = PAIRS.map(([f, t]) => ({
    from: f, to: t,
    rate: (rates[t] || 0) / (rates[f] || 1),
    change: 0,
  })).filter(r => r.rate > 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Currency Converter</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time exchange rates with a 1.5% transparent fee.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8 space-y-6"
      >
        {/* From */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">From</label>
          <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 focus-within:ring-2 focus-within:ring-brand-500/50 transition-all">
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); reset(); }}
              className="flex-1 bg-transparent px-4 py-4 text-gray-900 dark:text-white text-2xl font-bold outline-none"
            />
            <select
              value={fromCurrency}
              onChange={(e) => { setFromCurrency(e.target.value); reset(); }}
              className="bg-transparent text-gray-700 dark:text-gray-300 font-medium px-4 outline-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-center justify-center">
          <motion.button
            whileTap={{ rotate: 180 }}
            onClick={handleSwap}
            className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </motion.button>
        </div>

        {/* To */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">To (your home currency)</label>
          <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <div className="flex-1 px-4 py-4 text-green-600 dark:text-green-400 text-2xl font-bold">
              {quote ? quote.homeAmount.toLocaleString() : converted}
            </div>
            <select
              value={toCurrency}
              onChange={(e) => { setToCurrency(e.target.value); reset(); }}
              className="bg-transparent text-gray-700 dark:text-gray-300 font-medium px-4 outline-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate Info */}
        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Mid-market rate</span>
            <span className="font-medium text-gray-900 dark:text-white">
              1 {fromCurrency} = {quote ? quote.fxRate.toFixed(4) : liveRate.toFixed(4)} {toCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Conversion fee (1.5%)</span>
            <span className="font-medium text-orange-500">
              {quote ? `${quote.fee.toFixed(2)} ${quote.homeCurrency}` : "—"}
            </span>
          </div>
          {quote && (
            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-white/5 pt-2 mt-2">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Total deducted</span>
              <span className="font-bold text-gray-900 dark:text-white">{quote.homeAmount.toLocaleString()} {quote.homeCurrency}</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Success receipt */}
        {receipt && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-bold text-green-700 dark:text-green-400">Payment Successful!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              New balance: {receipt.updatedBalance.balance.toLocaleString()} {receipt.updatedBalance.currency}
            </p>
          </motion.div>
        )}

        <button
          onClick={handleConvert}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {receipt ? "New Conversion" : quote ? "Confirm & Pay" : "Get Quote"}
        </button>
      </motion.div>

      {/* Live Rates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Rates {ratesLoading && <Loader2 className="w-4 h-4 inline animate-spin ml-2" />}
        </h2>
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {exchangeRatesList.map((rate) => (
              <div key={`${rate.from}-${rate.to}`} className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {rate.from}/{rate.to}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900 dark:text-white">{rate.rate.toFixed(4)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConvertPage;
