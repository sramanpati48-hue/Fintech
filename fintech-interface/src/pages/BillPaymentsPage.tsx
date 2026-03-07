import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, Wifi, Tv, Phone, Droplets, Home, ShieldCheck,
  Calendar, Clock, CheckCircle, AlertCircle, Search,
  Plus, CreditCard, Receipt, Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any },
  }),
} as any;

interface Bill {
  id: string;
  name: string;
  provider: string;
  category: string;
  icon: any;
  amount: number;
  dueDate: string;
  status: "paid" | "due" | "overdue" | "upcoming";
  autopay: boolean;
  color: string;
  lastPaid?: string;
}

const bills: Bill[] = [
  {
    id: "1", name: "Electricity", provider: "City Power Co.", category: "Utilities",
    icon: Zap, amount: 124.50, dueDate: "2026-03-10", status: "due", autopay: true,
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "2", name: "Internet", provider: "FiberNet Pro", category: "Internet",
    icon: Wifi, amount: 79.99, dueDate: "2026-03-15", status: "upcoming", autopay: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "3", name: "Netflix", provider: "Netflix Premium", category: "Streaming",
    icon: Tv, amount: 22.99, dueDate: "2026-03-08", status: "paid", autopay: true,
    color: "from-red-500 to-rose-500", lastPaid: "2026-03-01",
  },
  {
    id: "4", name: "Phone Plan", provider: "T-Mobile Magenta", category: "Phone",
    icon: Phone, amount: 85.00, dueDate: "2026-03-20", status: "upcoming", autopay: false,
    color: "from-pink-500 to-sky-500",
  },
  {
    id: "5", name: "Water", provider: "Metro Water Dept", category: "Utilities",
    icon: Droplets, amount: 45.30, dueDate: "2026-03-05", status: "overdue", autopay: false,
    color: "from-cyan-500 to-teal-500",
  },
  {
    id: "6", name: "Rent", provider: "Maple Street Apartments", category: "Housing",
    icon: Home, amount: 1850.00, dueDate: "2026-04-01", status: "upcoming", autopay: true,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "7", name: "Insurance", provider: "SafeGuard Life", category: "Insurance",
    icon: ShieldCheck, amount: 195.00, dueDate: "2026-03-25", status: "upcoming", autopay: true,
    color: "from-cyan-500 to-teal-500",
  },
  {
    id: "8", name: "Spotify", provider: "Spotify Family", category: "Streaming",
    icon: Star, amount: 16.99, dueDate: "2026-03-12", status: "paid", autopay: true,
    color: "from-green-400 to-green-600", lastPaid: "2026-03-02",
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  paid: { label: "Paid", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/10", icon: CheckCircle },
  due: { label: "Due Now", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10", icon: Clock },
  overdue: { label: "Overdue", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/10", icon: AlertCircle },
  upcoming: { label: "Upcoming", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", icon: Calendar },
};

const BillPaymentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [billList, setBillList] = useState(bills);

  const totalDue = billList.filter((b) => b.status === "due" || b.status === "overdue").reduce((acc, b) => acc + b.amount, 0);
  const totalUpcoming = billList.filter((b) => b.status === "upcoming").reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = billList.filter((b) => b.status === "paid").reduce((acc, b) => acc + b.amount, 0);
  const autopayCount = billList.filter((b) => b.autopay).length;

  const filteredBills = billList.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePayBill = (id: string) => {
    setBillList(billList.map((b) => b.id === id ? { ...b, status: "paid" as const, lastPaid: new Date().toISOString().split("T")[0] } : b));
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    return `Due in ${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Bill Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and pay your recurring bills.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 !px-5 !py-2.5 text-sm w-fit">
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Due Now", value: `$${totalDue.toFixed(2)}`, icon: AlertCircle, color: "from-red-500 to-rose-500", sub: "requires attention" },
          { label: "Upcoming", value: `$${totalUpcoming.toFixed(2)}`, icon: Calendar, color: "from-blue-500 to-cyan-500", sub: "this month" },
          { label: "Paid", value: `$${totalPaid.toFixed(2)}`, icon: CheckCircle, color: "from-green-500 to-emerald-500", sub: "this month" },
          { label: "Auto-Pay Active", value: `${autopayCount}/${billList.length}`, icon: CreditCard, color: "from-cyan-500 to-teal-500", sub: "bills automated" },
        ].map((card, i) => (
          <motion.div key={card.label} variants={fadeUp} custom={i} className="glass-card p-5 group hover:shadow-glow/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search bills..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["all", "overdue", "due", "upcoming", "paid"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.map((bill, i) => {
          const statusInfo = statusConfig[bill.status];
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={bill.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className="glass-card p-4 group hover:shadow-glow/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bill.color} flex items-center justify-center text-white flex-shrink-0`}>
                  <bill.icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{bill.name}</h3>
                    {bill.autopay && (
                      <span className="text-[10px] font-medium bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded-full">Auto</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{bill.provider}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{getDaysUntilDue(bill.dueDate)}</p>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-900 dark:text-white">${bill.amount.toFixed(2)}</p>
                  <div className={`flex items-center gap-1 ${statusInfo.color} ${statusInfo.bg} text-xs font-medium px-2 py-0.5 rounded-full`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </div>
                </div>

                {(bill.status === "due" || bill.status === "overdue") && (
                  <button
                    onClick={() => handlePayBill(bill.id)}
                    className="btn-primary text-xs !px-4 !py-2 flex-shrink-0"
                  >
                    Pay Now
                  </button>
                )}
                {bill.status === "upcoming" && (
                  <button className="btn-secondary text-xs !px-4 !py-2 flex-shrink-0">
                    Schedule
                  </button>
                )}
                {bill.status === "paid" && (
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0">
                    <Receipt className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No bills found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Payment History Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-brand-500" /> Monthly Bill Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "January", amount: 2245.78, change: -3.2 },
            { label: "February", amount: 2180.42, change: -2.9 },
            { label: "March (so far)", amount: 1169.48, change: 0 },
          ].map((month) => (
            <div key={month.label} className="text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{month.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${month.amount.toFixed(2)}</p>
              {month.change !== 0 && (
                <p className={`text-xs font-medium ${month.change < 0 ? "text-green-500" : "text-red-500"}`}>
                  {month.change}% vs prior
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BillPaymentsPage;
