import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Send, QrCode, User, Settings, CreditCard,
  ArrowLeftRight, Globe, X, Bell, Receipt, TrendingUp, Target,
  FileText, Gift,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/send", label: "Send Money", icon: Send },
  { path: "/scanner", label: "QR Scanner", icon: QrCode },
  { path: "/convert", label: "Convert", icon: ArrowLeftRight },
  { path: "/cards", label: "Cards", icon: CreditCard },
  { path: "/transactions", label: "Transactions", icon: Receipt },
  { path: "/crypto", label: "Crypto", icon: TrendingUp },
  { path: "/savings", label: "Savings Goals", icon: Target },
  { path: "/bills", label: "Bill Payments", icon: FileText },
  { path: "/rewards", label: "Rewards", icon: Gift },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-white/10 z-50 
          flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-lg dark:shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Globe<span className="gradient-text">Pay</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Card */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-br from-brand-500 to-cyan-600 rounded-2xl p-4 text-white">
            <p className="text-sm font-medium opacity-90">Upgrade to Pro</p>
            <p className="text-xs opacity-70 mt-1">Get zero-fee transfers & premium rates</p>
            <button className="mt-3 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2 text-sm font-semibold transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
