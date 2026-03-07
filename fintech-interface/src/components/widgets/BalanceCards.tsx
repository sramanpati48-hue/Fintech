import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronDown, Wallet, RefreshCw } from "lucide-react";

interface BalanceCardsProps {
  balances: Record<string, number>;
  totalBalanceUSD: number;
  rates: Record<string, number>;
  homeCurrency: string;
  onRefresh?: () => void;
}

const FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", INR: "🇮🇳",
  AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", SGD: "🇸🇬", AED: "🇦🇪",
};

const SYM: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹",
  AUD: "A$", CAD: "C$", CHF: "Fr", SGD: "S$", AED: "د.إ",
};

const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 1.083, GBP: 1.267, JPY: 0.00669, INR: 0.01203,
  AUD: 0.65, CAD: 0.74, CHF: 1.11, SGD: 0.74, AED: 0.27,
};

const DISPLAY_CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"];

const BalanceCards: React.FC<BalanceCardsProps> = ({
  balances,
  totalBalanceUSD,
  rates,
  homeCurrency,
  onRefresh,
}) => {
  const [displayCurrency, setDisplayCurrency] = React.useState(homeCurrency || "USD");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Convert total balance to selected display currency
  const convertedTotal = React.useMemo(() => {
    if (displayCurrency === "USD") return totalBalanceUSD;
    // Use live rates if available, otherwise fallback to USD_RATES
    const usdRate = rates["USD"] || 1;
    const targetRate = rates[displayCurrency];
    if (targetRate && usdRate) {
      return totalBalanceUSD * (targetRate / usdRate);
    }
    // Fallback
    const fallbackRate = USD_RATES[displayCurrency] || 1;
    return totalBalanceUSD / fallbackRate;
  }, [totalBalanceUSD, displayCurrency, rates]);

  const currencyEntries = Object.entries(balances).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Main balance hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-cyan-600 to-teal-600 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white/70" />
              <p className="text-white/70 text-sm font-medium">Total Balance</p>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Refresh balances"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              {/* Currency switcher */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 text-sm font-medium"
                >
                  {FLAG[displayCurrency] || "🌐"} {displayCurrency}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]"
                    >
                      {DISPLAY_CURRENCIES.map((cur) => (
                        <button
                          key={cur}
                          onClick={() => { setDisplayCurrency(cur); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                            cur === displayCurrency ? "bg-white/10 font-semibold" : ""
                          }`}
                        >
                          <span>{FLAG[cur] || "🌐"}</span>
                          <span>{cur}</span>
                          <span className="text-white/50 ml-auto">{SYM[cur]}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <motion.p
            key={displayCurrency}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold mt-3 tabular-nums"
          >
            {SYM[displayCurrency] || ""}{convertedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.p>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              +2.4%
            </div>
            <span className="text-white/60 text-sm">vs last month</span>
          </div>
        </div>
      </motion.div>

      {/* Mini balance cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {currencyEntries.map(([cur, bal], i) => (
          <motion.div
            key={cur}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="glass-card p-4 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{FLAG[cur] || "🌐"}</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{cur}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
              {SYM[cur] || ""}{bal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              ≈ ${((USD_RATES[cur] || 0.01) * bal).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BalanceCards;
