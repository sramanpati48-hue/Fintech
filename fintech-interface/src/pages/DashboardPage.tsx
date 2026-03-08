import React from "react";
import { motion } from "framer-motion";
import {
  Send, ArrowDownLeft, QrCode, ArrowLeftRight,
  TrendingUp, TrendingDown, Clock, ChevronRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard, useFXRates, useTransactions } from "../hooks";
import { useAuth } from "../context/AuthContext";
import type { ApiTransaction } from "../types/api";
import FXTicker from "../components/widgets/FXTicker";
import SpendingChart from "../components/widgets/SpendingChart";
import BalanceCards from "../components/widgets/BalanceCards";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  }),
} as any;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.firstName || user?.name?.split(" ")[0] || "there";

  // Live data from backend
  const { balances, homeCurrency, recentTxns, totalBalanceUSD, loading, error, refresh } = useDashboard();
  const { rates } = useFXRates(homeCurrency);
  const { transactions: allTxns } = useTransactions({ pageSize: 50 });

  // ── Derive spending chart from live transactions ──
  const spendingData = React.useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const buckets: Record<string, { income: number; spending: number }> = {};
    allTxns.forEach((tx: ApiTransaction) => {
      const d = new Date(tx.createdAt);
      const key = months[d.getMonth()];
      if (!buckets[key]) buckets[key] = { income: 0, spending: 0 };
      buckets[key].spending += tx.homeAmount;
    });
    // Show last 7 months, most recent last
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - 6 + i, 1);
      const key = months[m.getMonth()];
      const { spending = 0, income = 0 } = buckets[key] || {};
      return { month: key, income: Math.round(income), spending: Math.round(spending), savings: 0 };
    });
  }, [allTxns]);

  // ── Derive spending categories from live transactions ──
  const spendingCategories = React.useMemo(() => {
    const CATEGORY_COLORS = ["#14b8a6", "#06b6d4", "#22d3ee", "#2dd4bf", "#99f6e4"];
    const byCur: Record<string, number> = {};
    allTxns.forEach((tx: ApiTransaction) => {
      const label = tx.merchantId || `FX → ${tx.localCurrency}`;
      byCur[label] = (byCur[label] || 0) + tx.homeAmount;
    });
    const sorted = Object.entries(byCur).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
    return sorted.map(([name, amount], i) => ({
      name,
      amount: Math.round(amount),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      percentage: Math.round((amount / total) * 100),
    }));
  }, [allTxns]);

  // Build wallet list from live balances map
  const FLAG_MAP: Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", INR: "🇮🇳", AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", SGD: "🇸🇬", AED: "🇦🇪" };
  const SYM_MAP: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹", AUD: "A$", CAD: "C$", CHF: "Fr", SGD: "S$", AED: "د.إ" };
  const wallets = Object.entries(balances).map(([cur, bal]) => ({
    currency: cur, symbol: SYM_MAP[cur] || cur, balance: bal, flag: FLAG_MAP[cur] || "🌐", change: 0,
  }));

  return (
    <div className="space-y-6">
      {/* === GREETING === */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your money today.</p>
        </div>
        <Link to="/send" className="btn-primary flex items-center gap-2 w-fit">
          <Send className="w-4 h-4" />
          Send Money
        </Link>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="glass-card p-6 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-sm text-gray-400 mt-1">Showing cached data where available.</p>
        </div>
      )}

      {/* === FX TICKER === */}
      <FXTicker rates={rates} />

      {/* === BALANCE CARDS WITH CURRENCY SWITCHER === */}
      <BalanceCards
        balances={balances}
        totalBalanceUSD={totalBalanceUSD}
        rates={rates}
        homeCurrency={homeCurrency}
        onRefresh={refresh}
      />

      {/* === QUICK ACTIONS === */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Send", icon: Send, color: "from-blue-500 to-blue-600", path: "/send" },
          { label: "Receive", icon: ArrowDownLeft, color: "from-green-500 to-emerald-600", path: "/dashboard" },
          { label: "Scan QR", icon: QrCode, color: "from-cyan-500 to-teal-600", path: "/scanner" },
          { label: "Convert", icon: ArrowLeftRight, color: "from-orange-500 to-amber-600", path: "/convert" },
        ].map((action, i) => (
          <motion.div key={action.label} variants={fadeUp} custom={i + 2}>
            <Link
              to={action.path}
              className="glass-card p-4 flex flex-col items-center gap-3 group hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* === WALLETS & TRANSACTIONS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Wallets</h2>
            <button className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">Manage</button>
          </div>
          {wallets.map((wallet, i) => (
            <motion.div
              key={wallet.currency}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i + 4}
              className="glass-card p-4 flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-lg">
                  {wallet.flag}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{wallet.currency}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Currency wallet</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {wallet.symbol}{wallet.balance.toLocaleString()}
                </p>
                <p className={`text-xs font-medium flex items-center gap-0.5 justify-end ${wallet.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {wallet.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {wallet.change >= 0 ? "+" : ""}{wallet.change}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <button className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="glass-card divide-y divide-gray-100 dark:divide-white/5 overflow-hidden">
            {recentTxns.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">No transactions yet. Make your first payment!</div>
            )}
            {recentTxns.map((tx, i) => (
              <motion.div
                key={tx._id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 4}
                className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {tx.localCurrency.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {tx.merchantId || "FX Conversion"} &middot; {tx.localCurrency}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        tx.status === "completed" ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400" :
                        tx.status === "pending" ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                        "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {tx.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    -{(SYM_MAP[tx.homeCurrency] || "")}{tx.homeAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{tx.homeCurrency}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* === SPENDING ANALYTICS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Widget */}
        <div className="lg:col-span-2">
          <SpendingChart data={spendingData} />
        </div>

        {/* Spending Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Breakdown</h2>
          <div className="space-y-3">
            {spendingCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${cat.amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link to="/transactions" className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-1 pt-1">
            View all transactions <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

    </div>
  );
};

export default DashboardPage;
