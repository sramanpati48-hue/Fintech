import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search,
  Star, Eye, EyeOff, RefreshCw, ChevronRight, Wallet, BarChart3,
  ArrowLeftRight, Info,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  }),
} as any;

/* ── Crypto data ── */
const cryptoAssets = [
  {
    id: "btc", name: "Bitcoin", symbol: "BTC", price: 67432.18, change24h: 2.34,
    holdings: 0.4523, color: "#F7931A", icon: "₿",
    sparkline: [64200, 64800, 65100, 64600, 65900, 66200, 66800, 67100, 66500, 67000, 67200, 67432],
  },
  {
    id: "eth", name: "Ethereum", symbol: "ETH", price: 3456.82, change24h: -1.12,
    holdings: 3.2, color: "#627EEA", icon: "Ξ",
    sparkline: [3520, 3490, 3510, 3480, 3460, 3440, 3470, 3450, 3430, 3460, 3450, 3456],
  },
  {
    id: "sol", name: "Solana", symbol: "SOL", price: 142.56, change24h: 5.67,
    holdings: 25, color: "#9945FF", icon: "◎",
    sparkline: [130, 132, 135, 133, 137, 139, 136, 140, 138, 141, 143, 142],
  },
  {
    id: "ada", name: "Cardano", symbol: "ADA", price: 0.4823, change24h: -0.34,
    holdings: 5000, color: "#0033AD", icon: "₳",
    sparkline: [0.49, 0.488, 0.485, 0.490, 0.487, 0.483, 0.486, 0.484, 0.482, 0.485, 0.483, 0.482],
  },
  {
    id: "matic", name: "Polygon", symbol: "MATIC", price: 0.8912, change24h: 3.21,
    holdings: 3000, color: "#8247E5", icon: "⬡",
    sparkline: [0.85, 0.86, 0.855, 0.87, 0.865, 0.88, 0.875, 0.89, 0.885, 0.888, 0.891, 0.891],
  },
  {
    id: "link", name: "Chainlink", symbol: "LINK", price: 15.42, change24h: 1.89,
    holdings: 120, color: "#2A5ADA", icon: "⬡",
    sparkline: [14.8, 14.9, 15.0, 14.95, 15.1, 15.05, 15.2, 15.15, 15.3, 15.25, 15.35, 15.42],
  },
];

const marketNews = [
  { title: "Bitcoin ETF sees record inflows of $2.3B this week", time: "2h ago", sentiment: "bullish" },
  { title: "Ethereum L2 scaling solutions reach new TVL highs", time: "4h ago", sentiment: "bullish" },
  { title: "Fed signals potential rate cuts in Q3 2026", time: "6h ago", sentiment: "neutral" },
  { title: "Solana DeFi ecosystem surpasses $15B in TVL", time: "8h ago", sentiment: "bullish" },
];

const CryptoPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "market" | "news">("portfolio");
  const [refreshing, setRefreshing] = useState(false);

  const totalPortfolioValue = cryptoAssets.reduce((acc, asset) => acc + asset.price * asset.holdings, 0);
  const totalChange = 2.14; // overall portfolio change

  const portfolioAllocation = cryptoAssets.map((asset) => ({
    name: asset.symbol,
    value: parseFloat((asset.price * asset.holdings).toFixed(2)),
    color: asset.color,
  }));

  const filteredAssets = cryptoAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Crypto & Investments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your crypto portfolio and market trends.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className={`btn-secondary !px-3 !py-2 ${refreshing ? "animate-spin" : ""}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="btn-primary flex items-center gap-2 !px-5 !py-2.5 text-sm">
            <Wallet className="w-4 h-4" /> Buy Crypto
          </button>
        </div>
      </motion.div>

      {/* Portfolio Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white/60 text-sm font-medium">Portfolio Value</p>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-white/40 hover:text-white/70 transition-colors">
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-4xl sm:text-5xl font-bold">
              {balanceVisible ? `$${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••••"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 ${totalChange >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"} rounded-full px-2.5 py-0.5 text-sm font-medium`}>
                {totalChange >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {totalChange >= 0 ? "+" : ""}{totalChange}%
              </div>
              <span className="text-white/40 text-sm">24h change</span>
            </div>
          </div>

          {/* Mini portfolio pie chart */}
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={portfolioAllocation} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" stroke="none">
                    {portfolioAllocation.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, ""]}
                    contentStyle={{ background: "#1f2937", border: "none", borderRadius: "12px", color: "white", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="hidden sm:flex flex-col gap-1.5">
              {portfolioAllocation.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-white/60">{item.name}</span>
                  <span className="text-white font-medium ml-auto">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
        {(["portfolio", "market", "news"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== "news" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-10"
          />
        </motion.div>
      )}

      {/* Assets List */}
      <AnimatePresence mode="wait">
        {activeTab === "portfolio" && (
          <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {filteredAssets.map((asset, i) => {
              const value = asset.price * asset.holdings;
              const isSelected = selectedAsset === asset.id;
              return (
                <motion.div
                  key={asset.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                  onClick={() => setSelectedAsset(isSelected ? null : asset.id)}
                  className="glass-card p-4 cursor-pointer hover:shadow-glow/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: asset.color }}>
                      {asset.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{asset.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{asset.symbol}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {asset.holdings} {asset.symbol}
                      </p>
                    </div>

                    {/* Sparkline */}
                    <div className="w-24 h-10 hidden sm:block">
                      <ResponsiveContainer>
                        <AreaChart data={asset.sparkline.map((v, idx) => ({ v, idx }))}>
                          <defs>
                            <linearGradient id={`grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={asset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={asset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={asset.change24h >= 0 ? "#10b981" : "#ef4444"} fill={`url(#grad-${asset.id})`} strokeWidth={1.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className={`flex items-center gap-0.5 justify-end text-xs font-medium ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(asset.change24h)}%
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">${asset.price.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">24h Change</p>
                            <p className={`font-semibold text-sm ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Holdings</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{asset.holdings} {asset.symbol}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Value</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button className="btn-primary flex-1 text-sm !py-2 flex items-center justify-center gap-1.5">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Buy
                          </button>
                          <button className="btn-secondary flex-1 text-sm !py-2 flex items-center justify-center gap-1.5">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Sell
                          </button>
                          <button className="btn-secondary text-sm !py-2 !px-3">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === "market" && (
          <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Market overview with larger sparklines */}
            {filteredAssets.map((asset, i) => (
              <motion.div key={asset.id} variants={fadeUp} initial="hidden" animate="visible" custom={i} className="glass-card p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-400 font-medium text-sm w-6">{i + 1}</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold" style={{ background: asset.color }}>
                    {asset.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{asset.name}</h3>
                      <span className="text-xs bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">{asset.symbol}</span>
                    </div>
                  </div>
                  <div className="w-28 h-12 hidden sm:block">
                    <ResponsiveContainer>
                      <AreaChart data={asset.sparkline.map((v, idx) => ({ v, idx }))}>
                        <defs>
                          <linearGradient id={`market-grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={asset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={asset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={asset.change24h >= 0 ? "#10b981" : "#ef4444"} fill={`url(#market-grad-${asset.id})`} strokeWidth={1.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">${asset.price.toLocaleString()}</p>
                    <div className={`flex items-center gap-0.5 justify-end text-xs font-medium ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(asset.change24h)}%
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "news" && (
          <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {marketNews.map((news, i) => (
              <motion.div
                key={i} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                className="glass-card p-5 group cursor-pointer hover:shadow-glow/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    news.sentiment === "bullish" ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400" :
                    news.sentiment === "bearish" ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400" :
                    "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                  }`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {news.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{news.time}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        news.sentiment === "bullish" ? "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400" :
                        news.sentiment === "bearish" ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400" :
                        "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                      }`}>
                        {news.sentiment}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}

            {/* Market Sentiment */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="glass-card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-500" /> Market Sentiment
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Fear</span>
                    <span>Greed</span>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
                    <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-800 rounded-full shadow-lg" style={{ left: "72%" }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">72</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Greed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CryptoPage;
