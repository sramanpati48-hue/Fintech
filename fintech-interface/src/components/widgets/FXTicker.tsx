import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface FXTickerProps {
  rates: Record<string, number>;
  base?: string;
}

const DISPLAY_PAIRS: [string, string, string, string][] = [
  ["USD", "EUR", "$", "€"],
  ["USD", "GBP", "$", "£"],
  ["USD", "JPY", "$", "¥"],
  ["USD", "INR", "$", "₹"],
  ["EUR", "GBP", "€", "£"],
  ["GBP", "JPY", "£", "¥"],
  ["USD", "CHF", "$", "Fr"],
  ["EUR", "JPY", "€", "¥"],
  ["USD", "CAD", "$", "C$"],
  ["USD", "AUD", "$", "A$"],
  ["USD", "SGD", "$", "S$"],
  ["EUR", "CHF", "€", "Fr"],
];

const FXTicker: React.FC<FXTickerProps> = ({ rates }) => {
  const items = DISPLAY_PAIRS.map(([from, to]) => {
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    const rate = toRate / fromRate;
    // Simulate a small random change indicator for visual flair
    const seed = (from.charCodeAt(0) + to.charCodeAt(1)) % 3;
    const change = seed === 0 ? 0.12 : seed === 1 ? -0.08 : 0.05;
    return { from, to, rate, change };
  });

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-3">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: { duration: 30, repeat: Infinity, ease: "linear" },
        }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.from}-${item.to}-${i}`}
            className="flex items-center gap-2 text-sm shrink-0 px-2"
          >
            <span className="text-white/60 font-medium">
              {item.from}/{item.to}
            </span>
            <span className="text-white font-bold tabular-nums">
              {item.rate.toFixed(4)}
            </span>
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                item.change >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {item.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default FXTicker;
