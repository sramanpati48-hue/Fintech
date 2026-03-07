import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, ArrowUpRight, Download,
  Clock, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  Calendar, Loader2,
} from "lucide-react";
import { useTransactions } from "../hooks";

const SYM: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹", AUD: "A$", CAD: "C$", CHF: "Fr", SGD: "S$", AED: "د.إ" };

const TransactionsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "sent" | "received">("all");

  // Backend-driven pagination + status filter
  const {
    transactions: apiTxns, total, page, totalPages,
    loading, error, setPage, setStatusFilter, statusFilter, refresh,
  } = useTransactions({ pageSize: 6 });

  /* Client-side type + search filter on top of the API results */
  const filtered = useMemo(() => {
    return apiTxns
      .filter((tx) => {
        if (typeFilter === "all") return true;
        // Outbound = homeAmount > 0 deducted from user, no "received" concept in
        // the current schema — treat merchantId presence as "sent"
        if (typeFilter === "sent") return !!tx.merchantId || tx.homeAmount > 0;
        return !tx.merchantId && tx.homeAmount <= 0;
      })
      .filter(
        (tx) =>
          (tx.merchantId || "").toLowerCase().includes(search.toLowerCase()) ||
          tx.localCurrency.toLowerCase().includes(search.toLowerCase()) ||
          tx.homeCurrency.toLowerCase().includes(search.toLowerCase())
      );
  }, [apiTxns, search, typeFilter]);

  /* Aggregate stats from the current page (or total if available) */
  const totalSent = apiTxns
    .filter((t) => t.status === "completed" && t.homeAmount > 0)
    .reduce((s, t) => s + t.homeAmount, 0);

  const totalReceived = 0; // backend has no inbound transfers yet

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and manage your complete transaction history.
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2 w-fit text-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{total}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Received</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ${totalReceived.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Sent</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${totalSent.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or currency..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field !pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Type:</span>
            {(["all", "sent", "received"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === t
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status:</span>
            {(["all", "completed", "pending", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass-card p-6 text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={refresh} className="mt-2 text-sm text-brand-500 hover:underline">Retry</button>
        </div>
      )}

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card overflow-hidden"
      >
        {filtered.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No transactions found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-500/10">
                    <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {tx.merchantId || "FX Conversion"} &middot; {tx.localCurrency}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span
                        className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          tx.status === "completed"
                            ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                            : tx.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    -{(SYM[tx.homeCurrency] || "")}{tx.homeAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {tx.localAmount.toLocaleString()} {tx.localCurrency}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination — driven by useTransactions hook */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/5">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === p
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransactionsPage;
