import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Shield, Bell, Moon, Sun,
  Globe, Lock, Fingerprint, CreditCard, ChevronRight,
  Camera, LogOut, Check,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ProfilePage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  // Read profile from localStorage
  const storedUser = localStorage.getItem("globepay-user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const fullName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const email = user.email || "user@globepay.com";
  const phone = user.phone || "+91 00000 00000";
  const location = user.location || (user.city && user.country ? `${user.city}, ${user.country}` : user.country || "Not set");
  const initials = user.initials || fullName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "GP";

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "settings" as const, label: "Settings", icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Account</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile and preferences.</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-500/10 to-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </button>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-surface-800 rounded-full" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="text-xs font-medium bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified
              </span>
              <span className="text-xs font-medium bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full">
                Pro Member
              </span>
            </div>
          </div>
          <button className="btn-secondary text-sm !px-4 !py-2">Edit Profile</button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: fullName, icon: User },
                { label: "Email", value: email, icon: Mail },
                { label: "Phone", value: phone, icon: Phone },
                { label: "Location", value: location, icon: MapPin },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block flex items-center gap-1.5">
                    <field.icon className="w-3.5 h-3.5" />
                    {field.label}
                  </label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    className="input-field text-sm"
                  />
                </div>
              ))}
            </div>
            <button className="btn-primary text-sm">Save Changes</button>
          </div>

          {/* Linked Accounts */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
            {[
              { name: "Visa •••• 4242", type: "Primary", icon: "💳" },
              { name: "HDFC Bank •••• 8901", type: "Savings", icon: "🏦" },
              { name: "PayPal", type: "Connected", icon: "🅿️" },
            ].map((method) => (
              <div key={method.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{method.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{method.type}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            <button className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* General */}
          <div className="glass-card p-6 space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">General</h3>
            {[
              {
                icon: isDark ? Moon : Sun,
                label: "Dark Mode",
                desc: isDark ? "Currently dark" : "Currently light",
                action: (
                  <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? "bg-brand-500" : "bg-gray-300"}`}
                  >
                    <motion.div
                      layout
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                      style={{ x: isDark ? 24 : 0 }}
                    />
                  </button>
                ),
              },
              {
                icon: Globe,
                label: "Language",
                desc: "English (US)",
                action: <ChevronRight className="w-4 h-4 text-gray-400" />,
              },
              {
                icon: Bell,
                label: "Notifications",
                desc: "Push & Email enabled",
                action: <ChevronRight className="w-4 h-4 text-gray-400" />,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{item.desc}</p>
                  </div>
                </div>
                {item.action}
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="glass-card p-6 space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Security</h3>
            {[
              { icon: Lock, label: "Change Password", desc: "Last changed 30 days ago" },
              { icon: Fingerprint, label: "Biometric Login", desc: "Face ID / Fingerprint" },
              { icon: Shield, label: "Two-Factor Authentication", desc: "Enabled via Authenticator app" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6">
            <button className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/5">
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Log Out</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
