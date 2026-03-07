import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface SpendingDataPoint {
  month: string;
  income: number;
  spending: number;
  savings?: number;
}

interface SpendingChartProps {
  data: SpendingDataPoint[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const totalSpending = data.reduce((s, d) => s + d.spending, 0);
  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const avgMonthly = Math.round(totalSpending / (data.length || 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-500" />
          Spending Overview
        </h2>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
          Last {data.length} months
        </span>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          Spent: <span className="font-semibold text-gray-900 dark:text-white">${totalSpending.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Avg/mo: <span className="font-semibold text-gray-900 dark:text-white">${avgMonthly.toLocaleString()}</span>
        </div>
        {totalIncome > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <TrendingUp className="w-3 h-3" />
            Income tracked
          </div>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30,30,40,0.9)",
                border: "none",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "#fff",
              }}
              formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, ""]}
            />
            <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
            <Area type="monotone" dataKey="spending" stroke="#14b8a6" strokeWidth={2} fill="url(#spendGrad)" name="Spending" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-green-500" /> Income
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="w-3 h-3 rounded-full bg-brand-500" /> Spending
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingChart;
